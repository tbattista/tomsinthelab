// Road Trip Map Maker — interactive map, routing, and PDF export.
(function () {
  'use strict';

  var state = {
    config: null,
    map: null,
    styleChoice: 'standard',
    detail: 'medium',
    showRoute: true,
    start: null, // { name, lon, lat }
    end: null,
    route: null, // { geometry, distanceMeters, durationSeconds }
    geocodePicks: {}, // display_name (lowercased) -> {name, lat, lon}
  };

  var els = {};

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    els.form = document.getElementById('route-form');
    els.start = document.getElementById('start-input');
    els.end = document.getElementById('end-input');
    els.routeBtn = document.getElementById('route-btn');
    els.error = document.getElementById('route-error');
    els.summary = document.getElementById('route-summary');
    els.exportForm = document.getElementById('export-form');
    els.exportBtn = document.getElementById('export-btn');
    els.exportStatus = document.getElementById('export-status');

    try {
      var res = await fetch('/api/config');
      state.config = await res.json();
    } catch (e) {
      showError('Could not load map configuration. Please refresh the page.');
      return;
    }

    state.map = new maplibregl.Map({
      container: 'map',
      style: currentStyleUrl(),
      center: [-96, 38.5],
      zoom: 3.3,
      attributionControl: { compact: false },
    });
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    // Re-add the route layers every time the style changes.
    state.map.on('style.load', function () {
      addRouteLayers();
    });

    setupAutocomplete(els.start, document.getElementById('start-suggestions'));
    setupAutocomplete(els.end, document.getElementById('end-suggestions'));

    els.form.addEventListener('submit', onGetRoute);
    els.exportForm.addEventListener('submit', onExport);
    document.querySelectorAll('input[name="map-style"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (!radio.checked) return;
        state.styleChoice = radio.value;
        // Detail only applies to the generated Atlas/Coloring styles.
        els.detail.disabled = radio.value === 'standard';
        state.map.setStyle(currentStyleUrl());
      });
    });
    els.detail = document.getElementById('map-detail');
    els.detail.addEventListener('change', function () {
      state.detail = els.detail.value;
      if (state.styleChoice !== 'standard') state.map.setStyle(currentStyleUrl());
    });
    els.routeVisible = document.getElementById('route-visible');
    els.routeVisible.addEventListener('change', function () {
      state.showRoute = els.routeVisible.checked;
      setRouteVisibility();
    });
  }

  function currentStyleUrl() {
    var url = state.config.styles[state.styleChoice] || state.config.styles.standard;
    if (state.styleChoice !== 'standard') {
      url += (url.indexOf('?') === -1 ? '?' : '&') + 'detail=' + encodeURIComponent(state.detail);
    }
    return url;
  }

  function setRouteVisibility() {
    var visibility = state.showRoute ? 'visible' : 'none';
    ['trip-route-casing', 'trip-route-line', 'trip-endpoint-dots', 'trip-endpoint-labels']
      .forEach(function (id) {
        if (state.map.getLayer(id)) state.map.setLayoutProperty(id, 'visibility', visibility);
      });
  }

  // --- Geocoding ---

  function setupAutocomplete(input, datalist) {
    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      var q = input.value.trim();
      if (q.length < 3) return;
      timer = setTimeout(async function () {
        var results = await geocode(q);
        datalist.innerHTML = '';
        results.forEach(function (r) {
          state.geocodePicks[r.name.toLowerCase()] = r;
          var option = document.createElement('option');
          option.value = r.name;
          datalist.appendChild(option);
        });
      }, 450);
    });
  }

  async function geocode(q) {
    try {
      var res = await fetch('/api/geocode?q=' + encodeURIComponent(q));
      if (!res.ok) return [];
      var data = await res.json();
      return data.results || [];
    } catch (e) {
      return [];
    }
  }

  async function resolvePlace(text) {
    var pick = state.geocodePicks[text.trim().toLowerCase()];
    if (pick) return pick;
    var results = await geocode(text.trim());
    return results.length ? results[0] : null;
  }

  // --- Routing ---

  async function onGetRoute(event) {
    event.preventDefault();
    hideError();
    setBusy(els.routeBtn, true, 'Routing…');
    try {
      var start = await resolvePlace(els.start.value);
      if (!start) throw new Error('Could not find "' + els.start.value + '". Try adding a state or country.');
      var end = await resolvePlace(els.end.value);
      if (!end) throw new Error('Could not find "' + els.end.value + '". Try adding a state or country.');

      var res = await fetch('/api/route?start=' + start.lon + ',' + start.lat + '&end=' + end.lon + ',' + end.lat);
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Routing failed.');

      state.start = start;
      state.end = end;
      state.route = data;
      addRouteLayers();
      fitToRoute();
      updateSummary();
      els.exportBtn.disabled = false;
    } catch (err) {
      showError(err.message || 'Something went wrong finding that route.');
    } finally {
      setBusy(els.routeBtn, false, 'Get Route');
    }
  }

  function updateSummary() {
    if (!state.route) return;
    var miles = Math.round(state.route.distanceMeters / 1609.344);
    var hours = Math.floor(state.route.durationSeconds / 3600);
    var mins = Math.round((state.route.durationSeconds % 3600) / 60);
    els.summary.textContent = miles + ' miles • about ' + hours + ' h ' + mins + ' min driving';
  }

  function fitToRoute() {
    var coords = state.route.geometry.coordinates;
    var bounds = coords.reduce(function (b, c) { return b.extend(c); },
      new maplibregl.LngLatBounds(coords[0], coords[0]));
    state.map.fitBounds(bounds, { padding: 60, duration: 800 });
  }

  function shortName(name) {
    return String(name || '').split(',').slice(0, 2).join(',');
  }

  function addRouteLayers() {
    var map = state.map;
    if (!state.route || !map || !map.isStyleLoaded()) return;

    ['trip-endpoint-labels', 'trip-endpoint-dots', 'trip-route-line', 'trip-route-casing'].forEach(function (id) {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    ['trip-route', 'trip-endpoints'].forEach(function (id) {
      if (map.getSource(id)) map.removeSource(id);
    });

    var coloring = state.styleChoice === 'coloring';
    var routeColor = coloring ? '#1a1a1a' : (state.styleChoice === 'atlas' ? '#2b4b9b' : '#2563eb');

    map.addSource('trip-route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: state.route.geometry, properties: {} },
    });
    map.addSource('trip-endpoints', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          { type: 'Feature', geometry: { type: 'Point', coordinates: [state.start.lon, state.start.lat] }, properties: { label: shortName(state.start.name) } },
          { type: 'Feature', geometry: { type: 'Point', coordinates: [state.end.lon, state.end.lat] }, properties: { label: shortName(state.end.name) } },
        ],
      },
    });

    map.addLayer({
      id: 'trip-route-casing', type: 'line', source: 'trip-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 8 },
    });
    map.addLayer({
      id: 'trip-route-line', type: 'line', source: 'trip-route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: coloring
        ? { 'line-color': routeColor, 'line-width': 4.5, 'line-dasharray': [2.2, 1.1] }
        : { 'line-color': routeColor, 'line-width': 4.5 },
    });
    map.addLayer({
      id: 'trip-endpoint-dots', type: 'circle', source: 'trip-endpoints',
      paint: {
        'circle-radius': 7,
        'circle-color': coloring ? '#111111' : routeColor,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2.5,
      },
    });
    map.addLayer({
      id: 'trip-endpoint-labels', type: 'symbol', source: 'trip-endpoints',
      layout: {
        'text-field': ['get', 'label'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 13,
        'text-offset': [0, 1.0],
        'text-anchor': 'top',
        'text-max-width': 12,
      },
      paint: {
        'text-color': '#111111',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      },
    });

    setRouteVisibility();
  }

  // --- Export ---

  async function onExport(event) {
    event.preventDefault();
    if (!state.route) return;
    setBusy(els.exportBtn, true, 'Rendering…');
    els.exportStatus.textContent =
      'Rendering your map at print resolution — this can take up to a minute for posters.';
    try {
      var payload = {
        format: document.getElementById('export-format').value,
        orientation: document.getElementById('export-orientation').value,
        style: state.styleChoice,
        detail: state.detail,
        showRoute: state.showRoute,
        kidsActivities: document.getElementById('kids-activities').checked,
        title: document.getElementById('export-title').value,
        start: state.start,
        end: state.end,
        route: state.route,
      };
      var res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        var err = await res.json().catch(function () { return {}; });
        throw new Error(err.error || 'Export failed. Please try again.');
      }
      var blob = await res.blob();
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'road-trip-map-' + payload.format + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
      els.exportStatus.textContent = 'Done! Your PDF has downloaded.';
    } catch (err) {
      els.exportStatus.textContent = '';
      showError(err.message || 'Export failed.');
    } finally {
      setBusy(els.exportBtn, false, 'Export PDF');
    }
  }

  // --- UI helpers ---

  function setBusy(button, busy, label) {
    button.disabled = busy;
    button.textContent = label;
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.classList.remove('d-none');
  }

  function hideError() {
    els.error.classList.add('d-none');
  }
})();
