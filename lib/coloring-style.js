// Generates the "Coloring Map" MapLibre style: a printable, clutter-free,
// mostly-outline style over the OpenMapTiles vector schema. Emphasizes state
// boundaries, major highways, major towns, rivers/lakes, parks and mountain
// peaks so the exported page works as a color-it-in road trip map.

function buildColoringStyle(cfg) {
  return {
    version: 8,
    name: 'Coloring Map',
    metadata: { 'tomsinthelab:purpose': 'printable coloring road-trip map' },
    glyphs: cfg.TILE_GLYPHS_URL,
    sources: {
      openmaptiles: {
        type: 'vector',
        url: cfg.TILE_JSON_URL,
        attribution: cfg.TILE_ATTRIBUTION,
      },
    },
    layers: [
      {
        id: 'background',
        type: 'background',
        paint: { 'background-color': '#ffffff' },
      },

      // --- Water: outlines only so lakes/rivers can be colored in ---
      {
        id: 'water-outline',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'water',
        filter: ['!=', ['get', 'brunnel'], 'tunnel'],
        paint: {
          'line-color': '#2f2f2f',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 8, 1.1, 12, 1.6],
        },
      },
      {
        id: 'waterway-river',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'waterway',
        minzoom: 4,
        filter: ['in', ['get', 'class'], ['literal', ['river', 'canal']]],
        paint: {
          'line-color': '#2f2f2f',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 8, 1, 12, 1.6],
        },
      },

      // --- Parks / protected areas: dashed outline ---
      {
        id: 'park-outline',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'park',
        minzoom: 4,
        paint: {
          'line-color': '#4a4a4a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.6, 10, 1.2],
          'line-dasharray': [2, 2],
        },
      },

      // --- Boundaries: states emphasized, countries strongest ---
      {
        id: 'boundary-state',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        minzoom: 2,
        filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
        paint: {
          'line-color': '#111111',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1, 7, 2, 10, 2.8],
          'line-dasharray': [4, 2],
        },
      },
      {
        id: 'boundary-country',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'boundary',
        filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
        paint: {
          'line-color': '#000000',
          'line-width': ['interpolate', ['linear'], ['zoom'], 2, 1.4, 7, 3, 10, 4],
        },
      },

      // --- Major roads only: interstates/trunks, then primaries when zoomed in ---
      {
        id: 'road-motorway',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 4,
        filter: [
          'all',
          ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]],
          ['!=', ['get', 'ramp'], 1],
        ],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#1a1a1a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.9, 8, 2, 12, 3.5],
        },
      },
      {
        id: 'road-primary',
        type: 'line',
        source: 'openmaptiles',
        'source-layer': 'transportation',
        minzoom: 7,
        filter: ['all', ['==', ['get', 'class'], 'primary'], ['!=', ['get', 'ramp'], 1]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#5a5a5a',
          'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.6, 12, 1.8],
        },
      },

      // --- Labels ---
      {
        id: 'road-ref-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'transportation_name',
        minzoom: 6,
        filter: [
          'all',
          ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]],
          ['has', 'ref'],
        ],
        layout: {
          'symbol-placement': 'line',
          'text-field': ['get', 'ref'],
          'text-font': ['Noto Sans Bold'],
          'text-size': 10,
          'symbol-spacing': 350,
        },
        paint: {
          'text-color': '#1a1a1a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2,
        },
      },
      {
        id: 'mountain-peak',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'mountain_peak',
        minzoom: 7,
        filter: ['all', ['has', 'name'], ['<=', ['get', 'rank'], 1]],
        layout: {
          'text-field': ['concat', '▲ ', ['get', 'name']],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'park-label',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'park',
        minzoom: 6,
        filter: ['has', 'name'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Italic'],
          'text-size': 10,
          'text-max-width': 8,
        },
        paint: {
          'text-color': '#4a4a4a',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'place-town-dot',
        type: 'circle',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 8,
        maxzoom: 13,
        filter: ['==', ['get', 'class'], 'town'],
        paint: { 'circle-color': '#111111', 'circle-radius': 2 },
      },
      {
        id: 'place-town',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 8,
        filter: ['==', ['get', 'class'], 'town'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Regular'],
          'text-size': 10.5,
          'text-offset': [0, 0.6],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#222222',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      },
      {
        id: 'place-city-dot',
        type: 'circle',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 4,
        maxzoom: 12,
        filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['get', 'rank'], 9]],
        paint: { 'circle-color': '#111111', 'circle-radius': 2.8 },
      },
      {
        id: 'place-city',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 4,
        filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['get', 'rank'], 9]],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 4, 11, 8, 14],
          'text-offset': [0, 0.5],
          'text-anchor': 'top',
        },
        paint: {
          'text-color': '#111111',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.8,
        },
      },
      {
        id: 'place-state',
        type: 'symbol',
        source: 'openmaptiles',
        'source-layer': 'place',
        minzoom: 3,
        maxzoom: 9,
        filter: ['==', ['get', 'class'], 'state'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Noto Sans Bold'],
          'text-size': ['interpolate', ['linear'], ['zoom'], 3, 11, 7, 15],
          'text-transform': 'uppercase',
          'text-letter-spacing': 0.15,
        },
        paint: {
          'text-color': '#666666',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      },
    ],
  };
}

module.exports = { buildColoringStyle };
