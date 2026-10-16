// Renders /projects/:slug from /api/projects/:slug.
//
// Page flow: hero (pitch + one primary action + screenshot) -> quick facts ->
// why I built it -> feature tour -> latest from the lab -> closing call to
// action -> next project.
(function () {
  'use strict';
  var esc = Lab.esc;
  var root = document.getElementById('project-root');
  var slug = decodeURIComponent(location.pathname.replace(/\/+$/, '').split('/').pop());

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function primaryAction(p) {
    if (p.liveUrl && !p.private) {
      return '<a href="' + esc(p.liveUrl) + '" target="_blank" rel="noopener" class="btn btn-primary btn-lg px-4">Try ' + esc(p.title) + ' &rarr;</a>';
    }
    if (p.waitlist) return '<a href="#waitlist" class="btn btn-primary btn-lg px-4">Join the waitlist</a>';
    return '';
  }

  function secondaryAction(p) {
    return p.repoUrl
      ? '<a href="' + esc(p.repoUrl) + '" target="_blank" rel="noopener" class="project-textlink">View the code &rarr;</a>'
      : '';
  }

  function frame(src, alt, device, eager) {
    var img = '<img src="' + esc(src) + '" alt="' + esc(alt) + '"' + (eager ? '' : ' loading="lazy"') + '>';
    var link = '<a href="' + esc(src) + '" class="image-link">' + img + '</a>';
    return device === 'phone'
      ? '<div class="phone-frame">' + link + '</div>'
      : '<div class="shot-frame">' + link + '</div>';
  }

  function heroHtml(p) {
    var kind = (Lab.KIND_LABELS[p.kind] || 'Project') + (p.category ? ' &middot; ' + esc(p.category) : '');
    var actions = primaryAction(p) + secondaryAction(p);
    return '<header class="project-hero">' +
      '<span class="text-muted text-uppercase">' + kind + '</span>' +
      '<h1 class="display-3 mt-2 mb-3">' + esc(p.title) + '</h1>' +
      '<p class="project-pitch">' + esc(p.tagline || p.description || '') + '</p>' +
      '<p class="lab-meta d-flex flex-wrap align-items-center gap-2 mb-4">' + Lab.statusBadge(p) + '<span>' + Lab.lastWorked(p) + '</span></p>' +
      (actions ? '<div class="d-flex flex-wrap align-items-center gap-4">' + actions + '</div>' : '') +
      '</header>' +
      (p.image ? '<div class="project-hero-shot">' + frame(p.image, p.title, null, true) + '</div>' : '');
  }

  function statusText(p) {
    if (p.kind === 'build') return 'Physical build';
    if (p.status === 'archived') return 'Archived';
    if (p.liveUrl && !p.private) return 'Live';
    if (p.private) return 'Private beta';
    return Lab.isRecent(p.lastWorkedOn, 60) ? 'In progress' : 'On the shelf';
  }

  function factsHtml(p) {
    var facts = [
      ['Status', esc(statusText(p))],
      ['Type', esc(p.category || Lab.KIND_LABELS[p.kind] || 'Software')],
      p.started ? ['Started', esc(p.started)] : null,
      p.lastWorkedOn ? ['Last worked on', esc(Lab.formatDate(p.lastWorkedOn))] : null,
      (p.stack || []).length ? ['Built with', esc(p.stack.join(', '))] : null,
    ].filter(Boolean);
    return '<dl class="project-facts">' + facts.map(function (f) {
      return '<div><dt>' + f[0] + '</dt><dd>' + f[1] + '</dd></div>';
    }).join('') + '</dl>';
  }

  function storyHtml(p) {
    // The write-up wins; the short description is the fallback, not a preface.
    var body = p.body ? Lab.markdown(p.body)
      : (p.description && p.description !== p.tagline ? '<p>' + esc(p.description) + '</p>' : '');
    if (!body) return '';
    return '<section class="project-section row g-4">' +
      '<div class="col-lg-4"><span class="text-muted text-uppercase">The story</span><h2 class="display-6 mt-1">Why I built it</h2></div>' +
      '<div class="col-lg-8 prose">' + body + '</div>' +
      '</section>';
  }

  // Older entries used "gallery" ({src, caption}); treat them as tour steps.
  function tourSteps(p) {
    if (p.tour && p.tour.length) return p.tour;
    return (p.gallery || []).map(function (g) { return { src: g.src, title: g.caption || '', text: '', device: g.device }; });
  }

  function tourHtml(p) {
    // The hero already shows the cover, so don't repeat it as a step.
    var steps = tourSteps(p).filter(function (s) { return s.src !== p.image; });
    if (!steps.length) return featuresHtml(p);
    return '<section class="project-section">' +
      '<span class="text-muted text-uppercase">How it works</span>' +
      '<h2 class="display-6 mt-1 mb-5">See it in action</h2>' +
      steps.map(function (s, i) {
        var phone = s.device === 'phone';
        var flip = i % 2 === 1;
        return '<div class="tour-step row align-items-center g-4 g-lg-5">' +
          '<div class="' + (phone ? 'col-lg-5' : 'col-lg-7') + (flip ? ' order-lg-2' : '') + '">' + frame(s.src, s.title || p.title, s.device) + '</div>' +
          '<div class="' + (phone ? 'col-lg-7' : 'col-lg-5') + '">' +
            '<div class="tour-copy">' +
              '<span class="service-number">' + pad(i + 1) + '</span>' +
              (s.title ? '<h3 class="tour-title">' + esc(s.title) + '</h3>' : '') +
              (s.text ? '<p>' + esc(s.text) + '</p>' : '') +
            '</div>' +
          '</div>' +
        '</div>';
      }).join('') +
      '</section>';
  }

  // No screenshots yet: show the feature list as numbered cards instead.
  function featuresHtml(p) {
    if (!(p.features || []).length) return '';
    return '<section class="project-section">' +
      '<span class="text-muted text-uppercase">How it works</span>' +
      '<h2 class="display-6 mt-1 mb-4">What it does</h2>' +
      '<div class="row g-3">' + p.features.map(function (f, i) {
        return '<div class="col-md-6"><div class="feature-card"><span class="service-number">' + pad(i + 1) + '</span><p class="mb-0">' + esc(f) + '</p></div></div>';
      }).join('') + '</div>' +
      (p.waitlist ? '<p class="text-muted small mt-3">Screenshots coming soon.</p>' : '') +
      '</section>';
  }

  function activityHtml(p) {
    var commits = (p.commits || []).slice(0, 5);
    var notes = p.notes || [];
    if (!commits.length && !notes.length) return '';
    var commitCol = commits.length
      ? '<div class="col-lg-' + (notes.length ? '7' : '12') + '"><h3 class="h5 mb-3">Recent changes</h3><ul class="timeline">' +
        commits.map(function (c) {
          return '<li><span class="lab-meta">' + esc(Lab.timeAgo(c.date)) + '</span><p class="timeline-text">' + esc(c.message) + '</p></li>';
        }).join('') + '</ul></div>'
      : '';
    var notesCol = notes.length
      ? '<div class="col-lg-' + (commits.length ? '5' : '12') + '"><h3 class="h5 mb-3">Lab notes</h3>' + notes.map(function (n) {
          return '<div class="py-3 border-bottom"><span class="lab-meta">' + esc(Lab.formatDate(n.date)) + '</span>' +
            '<h4 class="fs-6 fw-bold mb-1"><a href="/notes/' + esc(n.slug) + '" class="text-decoration-none text-dark">' + esc(n.title) + '</a></h4>' +
            (n.summary ? '<p class="text-muted small mb-0">' + esc(n.summary) + '</p>' : '') + '</div>';
        }).join('') + '</div>'
      : '';
    return '<section class="project-section">' +
      '<span class="text-muted text-uppercase">Progress</span>' +
      '<h2 class="display-6 mt-1 mb-4">Latest from the lab</h2>' +
      '<div class="row g-5">' + commitCol + notesCol + '</div>' +
      '</section>';
  }

  function ctaHtml(p) {
    if (p.waitlist) {
      var pitch = p.waitlistPitch || (esc(p.title) + ' is private right now while I build it for myself. If you&rsquo;d use it too, leave your email and I&rsquo;ll let you know if I open it up.');
      return '<section id="waitlist" class="project-cta">' +
        '<span class="text-muted text-uppercase small">Private beta</span>' +
        '<h2 class="display-6 mt-1">Would you use ' + esc(p.title) + '?</h2>' +
        '<p class="mb-4">' + pitch + '</p>' +
        '<form id="waitlist-form" class="row g-2 position-relative" novalidate>' +
          '<div class="col-md-5"><input type="email" name="email" class="form-control form-control-lg" placeholder="you@example.com" required aria-label="Email"></div>' +
          '<div class="col-md-4"><input type="text" name="name" class="form-control form-control-lg" placeholder="Name (optional)" aria-label="Name"></div>' +
          '<div class="col-md-3"><button type="submit" class="btn btn-dark btn-lg w-100">Count me in</button></div>' +
          '<div class="col-12"><input type="text" name="note" class="form-control" placeholder="What would you use it for? (optional)" aria-label="What would you use it for"></div>' +
          '<div class="hp-field" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
          '<div class="col-12"><p id="waitlist-msg" class="mb-0 mt-2" role="status"></p></div>' +
        '</form></section>';
    }
    if (p.liveUrl && !p.private) {
      return '<section class="project-cta d-lg-flex align-items-center justify-content-between gap-4">' +
        '<div><span class="text-muted text-uppercase small">It&rsquo;s live</span>' +
        '<h2 class="display-6 mt-1 mb-lg-0">Try ' + esc(p.title) + ' yourself</h2></div>' +
        '<a href="' + esc(p.liveUrl) + '" target="_blank" rel="noopener" class="btn btn-dark btn-lg px-4 py-3 project-cta-btn">Open ' + esc(p.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')) + ' &rarr;</a>' +
        '</section>';
    }
    return '';
  }

  function nextHtml(p) {
    var n = p.next;
    if (!n) return '';
    return '<a class="project-next" href="' + esc(Lab.projectUrl(n)) + '">' +
      '<span class="text-muted text-uppercase small">Next project</span>' +
      '<span class="d-flex align-items-center justify-content-between gap-3">' +
        '<span><span class="project-next-title">' + esc(n.title) + ' &rarr;</span>' +
        (n.tagline ? '<span class="d-block text-muted">' + esc(n.tagline) + '</span>' : '') + '</span>' +
        '<span class="project-next-thumb d-none d-sm-block">' + Lab.cover(n, 'sm') + '</span>' +
      '</span></a>';
  }

  function render(p) {
    document.title = p.title + ' - Toms in the lab';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', p.tagline || p.description || '');

    root.innerHTML =
      heroHtml(p) +
      factsHtml(p) +
      storyHtml(p) +
      tourHtml(p) +
      activityHtml(p) +
      ctaHtml(p) +
      nextHtml(p);

    var form = document.getElementById('waitlist-form');
    if (form) form.addEventListener('submit', submitWaitlist(p));
    if (window.Chocolat && document.querySelector('.image-link')) {
      Chocolat(document.querySelectorAll('.image-link'), { imageSize: 'contain', loop: true });
    }
  }

  function submitWaitlist(p) {
    return function (e) {
      e.preventDefault();
      var form = e.target;
      var msg = document.getElementById('waitlist-msg');
      var button = form.querySelector('button');
      var data = {
        project: p.slug,
        email: form.email.value,
        name: form.name.value,
        note: form.note.value,
        website: form.website.value,
      };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        msg.textContent = 'Please enter a valid email address.';
        return;
      }
      button.disabled = true;
      fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }).then(function (res) {
        return res.json().then(function (body) { return { ok: res.ok, body: body }; });
      }).then(function (r) {
        if (!r.ok) throw new Error(r.body.error || 'Something went wrong.');
        form.reset();
        msg.textContent = r.body.duplicate ? 'You’re already on the list — thanks!' : 'Thanks! I’ll let you know if ' + p.title + ' opens up.';
      }).catch(function (err) {
        msg.textContent = err.message;
      }).then(function () {
        button.disabled = false;
      });
    };
  }

  Lab.getJSON('/api/projects/' + encodeURIComponent(slug)).then(render).catch(function () {
    root.innerHTML = '<h1 class="display-4">Project not found</h1><p><a href="/portfolio-masonry.html">See all projects</a></p>';
  });
})();
