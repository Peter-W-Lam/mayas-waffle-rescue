// Candidate flood zones: low stretches of road that can flood during the storm.
// Each game floods a random subset (see floodZoneCount in weatherSettings.js).
// Points follow the road centerline; width matches the road it covers.
// The south half (Cabbagetown and Reynoldstown) connects to the north only
// through five crossings: Boulevard, the Krog Street Tunnel, Weatherby Street,
// Walthall Street and Moreland Avenue. Each has a zone here.
export const FLOOD_ZONES = [
  {
    id: 'krog-tunnel',
    name: 'Krog Street Tunnel',
    width: 44,
    points: [[1310.1, 1368.5], [1314.8, 1378.9], [1375.5, 1561.6]],
  },
  {
    id: 'boulevard-rail',
    name: 'Boulevard at the rail line',
    width: 58,
    points: [[261.2, 1815.3], [266.2, 1828.9], [340.7, 1984.7]],
  },
  {
    id: 'weatherby-tracks',
    name: 'Weatherby Street by the tracks',
    width: 44,
    points: [[2835.6, 1418.4], [2828.6, 1430.3], [2827.2, 1515]],
  },
  {
    id: 'walthall-tracks',
    name: 'Walthall Street by the tracks',
    width: 44,
    points: [[3139.7, 1350], [3137, 1482.8], [3136.5, 1510]],
  },
  {
    id: 'moreland-rail',
    name: 'Moreland Avenue at the rail line',
    width: 68,
    points: [[3506.3, 1300], [3505.9, 1362.1], [3504.1, 1500]],
  },
  {
    id: 'dekalb-tracks',
    name: 'DeKalb Avenue by the tracks',
    width: 58,
    points: [[1499.9, 1321.3], [1880.1, 1242.3]],
  },
  {
    id: 'wylie-tracks',
    name: 'Wylie Street by the tracks',
    // Wider than the street and centred a little north of it, so the water also covers
    // the BeltLine sidewalk down its north side. Otherwise the sidewalk would be a dry
    // way round the flood.
    width: 68,
    points: [[1950.6, 1528.7], [2300.5, 1537.4]],
  },
  {
    id: 'carroll',
    name: 'Carroll Street',
    width: 44,
    points: [[683.4, 2000.1], [678.3, 2220]],
  },
  {
    id: 'memorial',
    name: 'Memorial Drive',
    width: 64,
    points: [[1250.1, 2595.4], [1700.1, 2602.6]],
  },
  {
    id: 'kirkwood-park',
    name: 'Kirkwood Avenue by Cabbagetown Park',
    width: 28,
    points: [[1500, 1943.3], [1150, 1940.9]],
  },
  {
    id: 'euclid-springvale',
    name: 'Euclid Avenue by Springvale Park',
    width: 52,
    points: [[2203.4, 723.9], [2253.6, 680.4], [2420.7, 507.6], [2440.2, 480.2]],
  },
];
