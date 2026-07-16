// Classification + extraction.
//
// Each candidate Reddit post is judged: is this a real-time FILMING SIGHTING,
// and if so, what show / cast / place / confidence? We ask Claude for strict
// JSON. If no ANTHROPIC_API_KEY is set, we fall back to a keyword heuristic so
// the pipeline still runs (lower precision, but demoable for free).

const config = require('./config');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You analyze social media posts about the "Real Housewives" TV franchises.
Decide whether a post reports a REAL, RECENT, in-person FILMING SIGHTING (cast/crew spotted filming, or a production spotted in public).
Exclude: episode recaps, spoilers, casting news, opinions, memes, merch, questions with no sighting.
Respond with ONLY a JSON object, no prose, matching:
{
  "isSighting": boolean,
  "confidence": "high" | "medium" | "low",
  "show": string | null,        // e.g. "RHONJ", or null if unknown
  "cast": string[],             // named cast members mentioned
  "locationText": string | null,// the most specific place named, verbatim-ish
  "summary": string             // one short neutral sentence
}`;

// --- Claude path -----------------------------------------------------------

async function classifyWithClaude(post) {
  const userContent =
    `Subreddit: r/${post.subreddit}\n` +
    `Title: ${post.title}\n` +
    `Body: ${post.body?.slice(0, 1500) || '(none)'}`;

  const res = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.anthropicModel,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic HTTP ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  const text = json?.content?.[0]?.text || '';
  return parseJsonLoose(text);
}

// Models occasionally wrap JSON in prose/backticks; extract the object.
function parseJsonLoose(text) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (_) {
        /* fall through */
      }
    }
    return null;
  }
}

// --- Heuristic fallback ----------------------------------------------------

const SIGHTING_WORDS = ['filming', 'spotted', 'saw them', 'seen filming', 'sighting', 'they are filming', 'currently filming'];

function classifyHeuristic(post) {
  const text = `${post.title} ${post.body}`.toLowerCase();
  const hit = SIGHTING_WORDS.some((w) => text.includes(w));
  // Guess the show from the subreddit if it's a franchise sub.
  const show = Object.keys(config.franchiseHomeCity).find(
    (s) => post.subreddit.toUpperCase() === s.toUpperCase()
  ) || null;
  return {
    isSighting: hit,
    confidence: 'low',
    show,
    cast: [],
    locationText: null,
    summary: post.title.slice(0, 140),
  };
}

// --- Public API ------------------------------------------------------------

// Classify one post. Returns the classification object (never throws).
async function classify(post) {
  if (ANTHROPIC_API_KEY) {
    try {
      const result = await classifyWithClaude(post);
      if (result) return result;
    } catch (err) {
      console.error('[extract] Claude failed, using heuristic:', err.message);
    }
  }
  return classifyHeuristic(post);
}

module.exports = { classify, usingClaude: Boolean(ANTHROPIC_API_KEY) };
