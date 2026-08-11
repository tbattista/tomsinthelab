// Generated MapLibre styles for the Road Trip Map Maker, built over the
// OpenMapTiles vector schema served by the configured tile provider.
//
// Two print-oriented styles are produced:
//  - "Coloring Map": white, outline-only, black-and-white page kids can color.
//  - "Road Atlas": a classic road-atlas look (red/orange/yellow highways,
//    blue water, green parks).
//
// Both accept a detail level (simple / medium / detailed) that controls how
// many road classes, towns, and labels are included.

const DETAIL_LEVELS = ['simple', 'medium', 'detailed'];

function detailSettings(detail) {
  switch (detail) {
    case 'simple':
      return {
        primaryRoads: false,
        secondaryRoads: false,
        towns: false,
        peaks: false,
        parkLabels: false,
        cityMaxRank: 4,
        townMinzoom: 9,
      };
    case 'detailed':
      return {
        primaryRoads: true,
        secondaryRoads: true,
        towns: true,
        peaks: true,
        parkLabels: true,
        cityMaxRank: 12,
        townMinzoom: 7,
      };
    case 'medium':
    default:
      return {
        primaryRoads: true,
        secondaryRoads: false,
        towns: true,
        peaks: true,
        parkLabels: true,
        cityMaxRank: 9,
        townMinzoom: 8,
      };
  }
}

function normalizeDetail(detail) {
  return DETAIL_LEVELS.includes(detail) ? detail : 'medium';
}

function baseStyle(cfg, name) {
  return {
    version: 8,
    name,
    metadata: { 'tomsinthelab:purpose': 'printable road-trip map' },
    glyphs: cfg.TILE_GLYPHS_URL,
    sources: {
      openmaptiles: {
        type: 'vector',
        url: cfg.TILE_JSON_URL,
        attribution: cfg.TILE_ATTRIBUTION,
      },
    },
    layers: [],
  };
}

const lineWidth = (stops) => ['interpolate', ['linear'], ['zoom'], ...stops];

// ---------------------------------------------------------------------------
// Coloring Map — white background, outlines only, heavy state borders.
// ---------------------------------------------------------------------------
function buildColoringStyle(cfg, detail) {
  const d = detailSettings(normalizeDetail(detail));
  const style = baseStyle(cfg, 'Coloring Map');

  const layers = [
    { id: 'background', type: 'background', paint: { 'background-color': '#ffffff' } },

    // Water: outlines only so lakes/rivers can be colored in.
    {
      id: 'water-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'water',
      filter: ['!=', ['get', 'brunnel'], 'tunnel'],
      paint: {
        'line-color': '#2f2f2f',
        'line-width': lineWidth([3, 0.6, 8, 1.1, 12, 1.6]),
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
        'line-width': lineWidth([4, 0.5, 8, 1, 12, 1.6]),
      },
    },

    // Parks / protected areas: dashed outline.
    {
      id: 'park-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'park',
      minzoom: 4,
      paint: {
        'line-color': '#4a4a4a',
        'line-width': lineWidth([4, 0.6, 10, 1.2]),
        'line-dasharray': [2, 2],
      },
    },

    // Boundaries: states emphasized, countries strongest.
    {
      id: 'boundary-state',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 2,
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
      paint: {
        'line-color': '#111111',
        'line-width': lineWidth([3, 1, 7, 2, 10, 2.8]),
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
        'line-width': lineWidth([2, 1.4, 7, 3, 10, 4]),
      },
    },

    // Major roads.
    d.secondaryRoads && {
      id: 'road-secondary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 9,
      filter: ['all', ['==', ['get', 'class'], 'secondary'], ['!=', ['get', 'ramp'], 1]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#8a8a8a',
        'line-width': lineWidth([9, 0.5, 12, 1.2]),
      },
    },
    d.primaryRoads && {
      id: 'road-primary',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'transportation',
      minzoom: 7,
      filter: ['all', ['==', ['get', 'class'], 'primary'], ['!=', ['get', 'ramp'], 1]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#5a5a5a',
        'line-width': lineWidth([7, 0.6, 12, 1.8]),
      },
    },
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
        'line-width': lineWidth([4, 0.9, 8, 2, 12, 3.5]),
      },
    },

    // Labels.
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
    d.peaks && {
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
    d.parkLabels && {
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
    d.towns && {
      id: 'place-town-dot',
      type: 'circle',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: d.townMinzoom,
      maxzoom: 13,
      filter: ['==', ['get', 'class'], 'town'],
      paint: { 'circle-color': '#111111', 'circle-radius': 2 },
    },
    d.towns && {
      id: 'place-town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: d.townMinzoom,
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
      filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['get', 'rank'], d.cityMaxRank]],
      paint: { 'circle-color': '#111111', 'circle-radius': 2.8 },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 4,
      filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['get', 'rank'], d.cityMaxRank]],
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
  ];

  style.layers = layers.filter(Boolean);
  return style;
}

// ---------------------------------------------------------------------------
// Road Atlas — classic printed-atlas look.
// ---------------------------------------------------------------------------
function buildAtlasStyle(cfg, detail) {
  const d = detailSettings(normalizeDetail(detail));
  const style = baseStyle(cfg, 'Road Atlas');

  const roadCasing = (id, cls, minzoom, color, widths) => ({
    id,
    type: 'line',
    source: 'openmaptiles',
    'source-layer': 'transportation',
    minzoom,
    filter: ['all', ['in', ['get', 'class'], ['literal', cls]], ['!=', ['get', 'ramp'], 1]],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': color, 'line-width': lineWidth(widths) },
  });

  const layers = [
    { id: 'background', type: 'background', paint: { 'background-color': '#f8f4ec' } },

    {
      id: 'park-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'park',
      minzoom: 4,
      paint: { 'fill-color': '#d4e8c8', 'fill-opacity': 0.8 },
    },
    {
      id: 'water-fill',
      type: 'fill',
      source: 'openmaptiles',
      'source-layer': 'water',
      filter: ['!=', ['get', 'brunnel'], 'tunnel'],
      paint: { 'fill-color': '#a8cbe0' },
    },
    {
      id: 'water-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'water',
      filter: ['!=', ['get', 'brunnel'], 'tunnel'],
      paint: {
        'line-color': '#7fa8c4',
        'line-width': lineWidth([3, 0.4, 10, 1]),
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
        'line-color': '#7fa8c4',
        'line-width': lineWidth([4, 0.5, 8, 1, 12, 1.8]),
      },
    },
    {
      id: 'park-outline',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'park',
      minzoom: 4,
      paint: {
        'line-color': '#9dc48a',
        'line-width': lineWidth([4, 0.5, 10, 1]),
      },
    },

    {
      id: 'boundary-state',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      minzoom: 2,
      filter: ['all', ['==', ['get', 'admin_level'], 4], ['!=', ['get', 'maritime'], 1]],
      paint: {
        'line-color': '#8a8a8a',
        'line-width': lineWidth([3, 1, 7, 1.8, 10, 2.4]),
        'line-dasharray': [3, 2],
      },
    },
    {
      id: 'boundary-country',
      type: 'line',
      source: 'openmaptiles',
      'source-layer': 'boundary',
      filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
      paint: {
        'line-color': '#555555',
        'line-width': lineWidth([2, 1.4, 7, 2.6, 10, 3.5]),
      },
    },

    // Road casings (darker edges under the colored fills).
    d.secondaryRoads &&
      roadCasing('road-secondary-casing', ['secondary'], 9, '#9a9a9a', [9, 1.6, 12, 3]),
    d.primaryRoads &&
      roadCasing('road-primary-casing', ['primary'], 7, '#b89b2f', [7, 1.6, 12, 3.6]),
    roadCasing('road-trunk-casing', ['trunk'], 4, '#c26f22', [4, 1.4, 8, 3, 12, 5]),
    roadCasing('road-motorway-casing', ['motorway'], 4, '#b03a28', [4, 1.6, 8, 3.4, 12, 5.6]),

    // Road fills.
    d.secondaryRoads &&
      roadCasing('road-secondary', ['secondary'], 9, '#ffffff', [9, 0.8, 12, 1.8]),
    d.primaryRoads &&
      roadCasing('road-primary', ['primary'], 7, '#f7d154', [7, 0.8, 12, 2.4]),
    roadCasing('road-trunk', ['trunk'], 4, '#f2953f', [4, 0.7, 8, 1.8, 12, 3.4]),
    roadCasing('road-motorway', ['motorway'], 4, '#e8553d', [4, 0.8, 8, 2.2, 12, 4]),

    {
      id: 'road-ref-label',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'transportation_name',
      minzoom: 6,
      filter: [
        'all',
        ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary']]],
        ['has', 'ref'],
      ],
      layout: {
        'symbol-placement': 'line',
        'text-field': ['get', 'ref'],
        'text-font': ['Noto Sans Bold'],
        'text-size': 10,
        'symbol-spacing': 300,
      },
      paint: {
        'text-color': '#7a2318',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      },
    },
    d.peaks && {
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
        'text-color': '#8a6642',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    },
    d.parkLabels && {
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
        'text-color': '#3d7a2f',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1.5,
      },
    },
    d.towns && {
      id: 'place-town-dot',
      type: 'circle',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: d.townMinzoom,
      maxzoom: 13,
      filter: ['==', ['get', 'class'], 'town'],
      paint: { 'circle-color': '#333333', 'circle-radius': 2 },
    },
    d.towns && {
      id: 'place-town',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: d.townMinzoom,
      filter: ['==', ['get', 'class'], 'town'],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 10.5,
        'text-offset': [0, 0.6],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#333333',
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
      filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['get', 'rank'], d.cityMaxRank]],
      paint: {
        'circle-color': '#222222',
        'circle-radius': 2.8,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 1,
      },
    },
    {
      id: 'place-city',
      type: 'symbol',
      source: 'openmaptiles',
      'source-layer': 'place',
      minzoom: 4,
      filter: ['all', ['==', ['get', 'class'], 'city'], ['<=', ['get', 'rank'], d.cityMaxRank]],
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 4, 11, 8, 14],
        'text-offset': [0, 0.5],
        'text-anchor': 'top',
      },
      paint: {
        'text-color': '#1a1a1a',
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
        'text-color': '#8a8a8a',
        'text-halo-color': '#f8f4ec',
        'text-halo-width': 1.5,
      },
    },
  ];

  style.layers = layers.filter(Boolean);
  return style;
}

module.exports = { buildColoringStyle, buildAtlasStyle, normalizeDetail, DETAIL_LEVELS };
