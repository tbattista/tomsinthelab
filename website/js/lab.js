// Shared helpers for the data-driven pages (portfolio, project, lab log, notes).
window.Lab = (function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getJSON(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (res) {
      if (!res.ok) throw new Error(res.status + ' ' + url);
      return res.json();
    });
  }

  function parseDate(value) {
    if (!value) return null;
    // Bare YYYY-MM-DD dates are local calendar days, not UTC midnight.
    var d = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(value + 'T12:00:00') : new Date(value);
    return isNaN(d) ? null : d;
  }

  function formatDate(value) {
    var d = parseDate(value);
    return d ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  }

  function timeAgo(value) {
    var d = parseDate(value);
    if (!d) return '';
    var days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return 'yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return Math.floor(days / 7) + (days < 14 ? ' week ago' : ' weeks ago');
    if (days < 365) return Math.floor(days / 30) + (days < 60 ? ' month ago' : ' months ago');
    return formatDate(value);
  }

  function isRecent(value, days) {
    var d = parseDate(value);
    return !!d && Date.now() - d.getTime() < (days || 30) * 86400000;
  }

  function projectUrl(p) {
    return p.page || '/projects/' + encodeURIComponent(p.slug);
  }

  var KIND_LABELS = { software: 'Software', build: 'Physical build', work: 'Work' };

  function statusBadge(p) {
    if (p.kind === 'build') return '<span class="lab-badge is-build">Build</span>';
    if (p.kind === 'work') return '<span class="lab-badge is-work">Work</span>';
    if (p.liveUrl && !p.private) return '<span class="lab-badge is-live">Live</span>';
    if (p.private) return '<span class="lab-badge is-private">Private beta</span>';
    if (p.status === 'archived') return '<span class="lab-badge">Archived</span>';
    return '';
  }

  function cover(p, extraClass) {
    var initial = esc((p.title || '?').charAt(0));
    var img = p.image ? '<img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" loading="lazy" onerror="this.remove()">' : '';
    return '<span class="lab-cover ' + (extraClass || '') + '"><span class="lab-cover-fallback">' + initial + '</span>' + img + '</span>';
  }

  function lastWorked(p) {
    if (!p.lastWorkedOn) return '';
    var dot = isRecent(p.lastWorkedOn, 14) ? '<span class="pulse-dot" title="Worked on recently"></span>' : '';
    return dot + 'Updated ' + esc(timeAgo(p.lastWorkedOn));
  }

  // Minimal markdown for short project write-ups when marked isn't loaded.
  function markdown(text) {
    if (!text) return '';
    if (window.marked) return window.marked.parse(text);
    return text.split(/\n{2,}/).map(function (para) {
      return '<p>' + esc(para).replace(/\n/g, '<br>') + '</p>';
    }).join('');
  }

  return {
    esc: esc,
    getJSON: getJSON,
    formatDate: formatDate,
    timeAgo: timeAgo,
    isRecent: isRecent,
    projectUrl: projectUrl,
    statusBadge: statusBadge,
    cover: cover,
    lastWorked: lastWorked,
    markdown: markdown,
    KIND_LABELS: KIND_LABELS,
  };
})();
