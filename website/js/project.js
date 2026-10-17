// Renders /projects/:slug from /api/projects/:slug.
(function () {
  'use strict';
  var esc = Lab.esc;
  var root = document.getElementById('project-root');
  var slug = decodeURIComponent(location.pathname.replace(/\/+$/, '').split('/').pop());

  function metaItem(label, html) {
    return html ? '<li><h5>' + esc(label) + '</h5><p>' + html + '</p></li>' : '';
  }

  function linksHtml(p) {
    var out = '';
    if (p.liveUrl && !p.private) out += '<a href="' + esc(p.liveUrl) + '" target="_blank" rel="noopener" class="btn btn-primary me-2 mb-2">Visit ' + esc(p.title) + ' &rarr;</a>';
    if (p.repoUrl) out += '<a href="' + esc(p.repoUrl) + '" target="_blank" rel="noopener" class="btn btn-outline-dark me-2 mb-2">View code</a>';
    if (p.waitlist) out += '<a href="#waitlist" class="btn btn-outline-primary me-2 mb-2">I&rsquo;d use this</a>';
    return out;
  }

  function galleryHtml(p) {
    if (!p.gallery || !p.gallery.length) return '';
    return '<div class="row g-4 mb-5 lab-gallery">' + p.gallery.map(function (g, i) {
      var wide = p.gallery.length === 1 || (i === 0 && p.gallery.length % 2 === 1);
      return '<div class="' + (wide ? 'col-12' : 'col-md-6') + '"><figure>' +
        '<a href="' + esc(g.src) + '" class="image-link"><img src="' + esc(g.src) + '" alt="' + esc(g.caption || p.title) + '" loading="lazy"></a>' +
        (g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '') +
        '</figure></div>';
    }).join('') + '</div>';
  }

  // Phone screenshots: a horizontal row of portrait shots (scrolls sideways on small screens).
  function mobileGalleryHtml(p) {
    if (!p.mobileGallery || !p.mobileGallery.length) return '';
    return '<div class="mb-5"><h5 class="mb-3">On a phone</h5><div class="lab-phone-row">' + p.mobileGallery.map(function (g) {
      return '<figure class="lab-phone">' +
        '<a href="' + esc(g.src) + '" class="image-link"><img src="' + esc(g.src) + '" alt="' + esc(g.caption || p.title) + '" loading="lazy"></a>' +
        (g.caption ? '<figcaption>' + esc(g.caption) + '</figcaption>' : '') +
        '</figure>';
    }).join('') + '</div></div>';
  }

  function activityHtml(p) {
    var html = '<h5 class="mt-4">Recent work</h5>';
    if (p.lastWorkedOn) html += '<p class="lab-meta mb-2">Last worked on ' + esc(Lab.formatDate(p.lastWorkedOn)) + '</p>';
    if (p.commits && p.commits.length) {
      html += '<ul class="commit-list">' + p.commits.slice(0, 6).map(function (c) {
        return '<li><span class="lab-meta d-block">' + esc(Lab.timeAgo(c.date)) + '</span>' + esc(c.message) + '</li>';
      }).join('') + '</ul>';
    } else if (!p.lastWorkedOn) {
      html += '<p class="text-muted small">No activity logged yet.</p>';
    }
    return html;
  }

  function waitlistHtml(p) {
    if (!p.waitlist) return '';
    var pitch = p.waitlistPitch || (p.title + ' is private right now while I build it for myself. If you&rsquo;d use it too, leave your email and I&rsquo;ll let you know if I open it up.');
    return '<div id="waitlist" class="waitlist-box my-5" data-aos="fade-up">' +
      '<span class="text-muted text-uppercase small">Private beta</span>' +
      '<h3 class="mt-1">Would you use ' + esc(p.title) + '?</h3>' +
      '<p>' + pitch + '</p>' +
      '<form id="waitlist-form" class="row g-2 position-relative" novalidate>' +
        '<div class="col-md-5"><input type="email" name="email" class="form-control form-control-lg" placeholder="you@example.com" required aria-label="Email"></div>' +
        '<div class="col-md-4"><input type="text" name="name" class="form-control form-control-lg" placeholder="Name (optional)" aria-label="Name"></div>' +
        '<div class="col-md-3"><button type="submit" class="btn btn-dark btn-lg w-100">Count me in</button></div>' +
        '<div class="col-12"><input type="text" name="note" class="form-control" placeholder="What would you use it for? (optional)" aria-label="What would you use it for"></div>' +
        '<div class="hp-field" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
        '<div class="col-12"><p id="waitlist-msg" class="mb-0 mt-2" role="status"></p></div>' +
      '</form></div>';
  }

  function notesHtml(p) {
    if (!p.notes || !p.notes.length) return '';
    return '<div class="mt-5"><h3>Lab notes</h3><div class="portfolio-list">' + p.notes.map(function (n) {
      return '<div class="py-3 border-bottom"><span class="lab-meta">' + esc(Lab.formatDate(n.date)) + '</span>' +
        '<h4 class="mb-1"><a href="/notes/' + esc(n.slug) + '" class="text-decoration-none text-dark fw-bold">' + esc(n.title) + '</a></h4>' +
        (n.summary ? '<p class="text-muted mb-0">' + esc(n.summary) + '</p>' : '') + '</div>';
    }).join('') + '</div></div>';
  }

  function render(p) {
    document.title = p.title + ' - Toms in the lab';
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', p.tagline || p.description || '');

    var kindLabel = (Lab.KIND_LABELS[p.kind] || 'Project') + (p.category ? ' &middot; ' + esc(p.category) : '');
    var status = Lab.statusBadge(p);
    var stack = (p.stack || []).map(function (s) { return '<span class="badge bg-dark me-1 mb-1">' + esc(s) + '</span>'; }).join('');
    var features = (p.features || []).length ? '<h4 class="mt-4">Key features</h4><ul>' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '';

    root.innerHTML =
      '<span class="text-muted text-uppercase">' + kindLabel + '</span>' +
      '<div class="row"><div class="col-lg-12 pb-4"><h1 class="display-4">' + esc(p.title) + '</h1>' +
        '<div class="d-flex flex-wrap align-items-center gap-3">' + status + '<span class="lab-meta">' + Lab.lastWorked(p) + '</span></div></div></div>' +
      '<div class="row">' +
        '<div class="col-lg-6 pb-4"><ul class="list-unstyled d-flex gap-2 gap-md-5 flex-column flex-md-row">' +
          metaItem('Type', esc(Lab.KIND_LABELS[p.kind] || 'Software')) +
          metaItem('Started', p.started ? esc(p.started) : '') +
          metaItem('Last worked on', p.lastWorkedOn ? esc(Lab.formatDate(p.lastWorkedOn)) : '') +
        '</ul><div>' + linksHtml(p) + '</div></div>' +
        '<div class="col-lg-6 pb-4"><div class="fs-5"><p>' + esc(p.description || p.tagline || '') + '</p></div></div>' +
      '</div>' +
      (p.image ? '<div class="row mb-5"><div class="col-12"><div class="portfolio-image"><figure><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '" class="img-fluid rounded"></figure></div></div></div>' : '') +
      '<div class="row mb-5">' +
        '<div class="col-lg-8 prose">' + Lab.markdown(p.body || '') + features + '</div>' +
        '<div class="col-lg-4"><div class="bg-light p-4 rounded">' +
          (stack ? '<h5>Built with</h5><div class="mb-3">' + stack + '</div>' : '') +
          activityHtml(p) +
        '</div></div>' +
      '</div>' +
      galleryHtml(p) +
      mobileGalleryHtml(p) +
      waitlistHtml(p) +
      notesHtml(p);

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
