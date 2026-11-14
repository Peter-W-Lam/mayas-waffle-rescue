// Hand-tuned changes to the generated OpenStreetMap road geometry: nudges so landmark
// sprites fit between the streets they sit beside, a few added streets, and the BeltLine
// trail. Kept separate from mapData.js because that file is regenerated from the OSM extracts.
import { BELTLINE } from './beltLine.js';

// Each entry moves one road point to a new position everywhere it appears, so every
// road sharing that point as a junction moves with it and stays connected.
const ROAD_POINT_MOVES = [
  // Waddell Street bows east so Krog Street Market fits between it and Krog Street.
  { from: [1416.7, 660.7], to: [1462, 676] },
  { from: [1400.4, 799], to: [1452, 800] }, // Dixie Avenue junction
  { from: [1399.6, 849], to: [1446, 852] },
  { from: [1404, 897.8], to: [1426, 905] },
  // Druid Circle widens so the Inman Park sign fits in the triangle it forms with Euclid.
  { from: [1887.6, 753.6], to: [1830, 742] },
  { from: [1883.1, 774.6], to: [1818, 776] }, // Dixie Avenue junction
  { from: [1884.5, 945.7], to: [1830, 912] },
  { from: [1902.5, 738.9], to: [1876, 716] }, // Ashland Drive junction
  { from: [1929.3, 728.3], to: [1930, 706] },
  { from: [1942, 730.3], to: [1968, 708] },
  { from: [1953.5, 736.7], to: [2004, 722] },
];

// Streets that aren't in the OpenStreetMap extract, in original map units. Each end sits
// on the centreline of the street it joins.
const EXTRA_ROADS = [
  // Mill Walk: a cut-through just south of the Fulton Cotton Mill Lofts. Boulevard has no
  // other side street between Decatur Street and Carroll Street, which made that stretch
  // a trap. Both ends keep clear of the Boulevard and Carroll Street flood zones (see
  // floodZones.js), and the path dips south to pass under the mill's name label.
  {
    name: 'Mill Walk',
    type: 'residential',
    width: 44,
    points: [[362.3, 2030], [590, 2018], [684.4, 1958]],
  },
];

// The BeltLine's two off-street stretches, its exits and its sidewalk beside Wylie Street
// (beltLine.js) join the street network as roads of type 'trail': walkable like any
// street, a little narrower, and drawn as a gray sidewalk (drawRoads in main.js). The
// stretch along DeKalb Avenue and through the Krog Street Tunnel needs no road of its own.
const BELTLINE_WIDTH = 38;
const BELTLINE_ROADS = [...BELTLINE.trails, ...BELTLINE.exits, ...BELTLINE.sidewalks].map((points) => ({
  name: 'BeltLine',
  type: 'trail',
  width: BELTLINE_WIDTH,
  points,
}));

const POINT_MATCH_TOLERANCE = 0.05;

export function applyRoadAdjustments(roads) {
  roads.push(...[...EXTRA_ROADS, ...BELTLINE_ROADS].map(
    (road) => ({ ...road, points: road.points.map((point) => [...point]) }),
  ));

  for (const { from, to } of ROAD_POINT_MOVES) {
    for (const road of roads) {
      road.points.forEach((point, index) => {
        const matches = Math.abs(point[0] - from[0]) < POINT_MATCH_TOLERANCE
          && Math.abs(point[1] - from[1]) < POINT_MATCH_TOLERANCE;
        if (matches) road.points[index] = [...to];
      });
    }
  }
}
