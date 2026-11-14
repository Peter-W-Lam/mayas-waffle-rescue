// Extracts the Atlanta BeltLine trail from the OpenStreetMap extracts in data/ and writes
// src/beltLine.js, in the map's original units (the same as mapData.js).
//
// Usage: node tools/extract-beltline.mjs
//
// OSM maps the trail as a string of cycleways named "Atlanta Beltline Eastside Trail" and
// "... Southeast Trail". On the game map it runs top to bottom in three parts:
//   - north: Freedom Parkway down to DeKalb Avenue, through the blocks (no street there)
//   - middle: along DeKalb Avenue, through the Krog Street Tunnel and along Wylie Street
//   - south: Wylie Street down to Memorial Drive, through the blocks again
// The game already has streets under the middle part, so only the north and south parts
// become new walkable paths ("trails"). Along Wylie Street the trail becomes a "sidewalk":
// a strip down the street's north side, where the real trail runs. The rest of the middle
// (DeKalb Avenue and the tunnel) is written out as "shared", which the game uses only to
// carry the trail's streetlights along those streets.
//
// EXITS are short links from the trail to a nearby street, so its long stretches between
// crossings aren't traps. They roughly follow real "Beltline Access" paths.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapData } from '../src/mapData.js';
import { MAP_SCALE } from '../src/mapScale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OSM_FILES = ['data/map.osm', 'data/map-south.osm'];
const TRAIL_NAME = /beltline (eastside|southeast) trail/i;
// The trail enters the map at the first of these and leaves it at the second.
const NORTH_EDGE_STREET = 'John Lewis Freedom Parkway';
const SOUTH_EDGE_STREET = 'Memorial Drive';
// Streets the middle part runs along. Where the trail is on one of these it is "shared".
const SHARED_STREETS = ['DeKalb Avenue', 'Krog Street', 'Wylie Street'];
// The street with the sidewalk down its north side.
const SIDEWALK_STREET = 'Wylie Street';
// How far the sidewalk's centre sits from the street's, in pixels on the scaled map. Near
// enough that the hero can step between street and sidewalk (their walkable bands
// overlap), far enough that about two thirds of the sidewalk shows beside the asphalt.
const SIDEWALK_OFFSET_PIXELS = 27;
// It starts this far along the street from where the trail joins it, clear of the tunnel
// mouth, and runs this far past where the trail leaves, so the south trail meets it.
const SIDEWALK_START_GAP = 45;
const SIDEWALK_END_OVERRUN = 14;
const SAMPLE_SPACING = 8;
const SIMPLIFY_TOLERANCE = 2;
// Each exit leaves the trail near `from` and ends on `street` at the point nearest `to`.
const EXITS = [
  { from: [1170, 478], street: 'McGruder Street', to: [1076, 471] },
  { from: [1089, 902], street: 'Krog Street', to: [1240, 902] },
  { from: [2196, 2450], street: 'Northern Avenue', to: [2373, 2446] },
];

const { bounds, world } = mapData;
const round = (value) => Math.round(value * 10) / 10;

// The same linear projection the map generator used for roads.
function project(lat, lon) {
  return [
    ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * world.width,
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * world.height,
  ];
}

function readTrailWays() {
  const ways = new Map();
  for (const file of OSM_FILES) {
    const xml = fs.readFileSync(path.join(root, file), 'utf8');
    const nodes = new Map();
    for (const match of xml.matchAll(/<node id="(\d+)"[^>]*lat="([-\d.]+)" lon="([-\d.]+)"/g)) {
      nodes.set(match[1], [Number(match[2]), Number(match[3])]);
    }
    for (const match of xml.matchAll(/<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
      const name = match[2].match(/<tag k="name" v="([^"]*)"/)?.[1] ?? '';
      if (!TRAIL_NAME.test(name) || !/k="highway" v="cycleway"/.test(match[2])) continue;
      const points = [...match[2].matchAll(/<nd ref="(\d+)"/g)]
        .map((ref) => nodes.get(ref[1]))
        .filter(Boolean)
        .map(([lat, lon]) => project(lat, lon));
      // The extracts overlap; keep whichever copy of a way has the most nodes.
      if (points.length > (ways.get(match[1])?.length ?? 0)) ways.set(match[1], points);
    }
  }
  return [...ways.values()];
}

const samePoint = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.5;

function pathLength(points) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  }
  return length;
}

// Joins the ways end to end, flipping any drawn the other way round, and returns the
// longest chain.
function buildChain(ways) {
  const remaining = [...ways].sort((a, b) => pathLength(b) - pathLength(a));
  let chain = remaining.shift();
  let extended = true;
  while (extended) {
    extended = false;
    for (let index = 0; index < remaining.length; index += 1) {
      const way = remaining[index];
      if (samePoint(chain.at(-1), way[0])) chain = [...chain, ...way.slice(1)];
      else if (samePoint(chain.at(-1), way.at(-1))) chain = [...chain, ...way.toReversed().slice(1)];
      else if (samePoint(chain[0], way.at(-1))) chain = [...way, ...chain.slice(1)];
      else if (samePoint(chain[0], way[0])) chain = [...way.toReversed(), ...chain.slice(1)];
      else continue;
      remaining.splice(index, 1);
      extended = true;
      break;
    }
  }
  return chain;
}

function closestPointOnSegment(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy || 1;
  const progress = Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared));
  return [start[0] + dx * progress, start[1] + dy * progress];
}

// The nearest point on any of the given roads: { point, distance, road }.
function findNearest(point, roads) {
  let best = { distance: Infinity };
  for (const road of roads) {
    for (let index = 1; index < road.points.length; index += 1) {
      const candidate = closestPointOnSegment(point, road.points[index - 1], road.points[index]);
      const distance = Math.hypot(point[0] - candidate[0], point[1] - candidate[1]);
      if (distance < best.distance) best = { point: candidate, distance, road };
    }
  }
  return best;
}

function findNearestOnPath(point, points) {
  return findNearest(point, [{ points }]).point;
}

const roadsNamed = (name) => mapData.roads.filter((road) => road.name.startsWith(name));

function resample(points, spacing) {
  const samples = [points[0]];
  let carried = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [ax, ay] = points[index - 1];
    const [bx, by] = points[index];
    const segment = Math.hypot(bx - ax, by - ay);
    let distance = spacing - carried;
    while (distance <= segment) {
      samples.push([ax + ((bx - ax) * distance) / segment, ay + ((by - ay) * distance) / segment]);
      distance += spacing;
    }
    carried = segment - (distance - spacing);
  }
  samples.push(points.at(-1));
  return samples;
}

// Ramer–Douglas–Peucker: drops points that sit within `tolerance` of the line through
// their neighbours.
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let farthest = 0;
  let farthestDistance = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const nearest = closestPointOnSegment(points[index], points[0], points.at(-1));
    const distance = Math.hypot(points[index][0] - nearest[0], points[index][1] - nearest[1]);
    if (distance > farthestDistance) {
      farthest = index;
      farthestDistance = distance;
    }
  }
  if (farthestDistance <= tolerance) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, farthest + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(farthest), tolerance),
  ];
}

const tidy = (points) => simplify(points, SIMPLIFY_TOLERANCE).map(([x, y]) => [round(x), round(y)]);

// How far along a path the point nearest to `point` is.
function distanceAlong(points, point) {
  let best = { gap: Infinity, distance: 0 };
  let travelled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const nearest = closestPointOnSegment(point, points[index - 1], points[index]);
    const gap = Math.hypot(point[0] - nearest[0], point[1] - nearest[1]);
    if (gap < best.gap) {
      best = { gap, distance: travelled + Math.hypot(nearest[0] - points[index - 1][0], nearest[1] - points[index - 1][1]) };
    }
    travelled += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  }
  return best.distance;
}

function pointAlong(points, distance) {
  let travelled = 0;
  for (let index = 1; index < points.length; index += 1) {
    const [ax, ay] = points[index - 1];
    const [bx, by] = points[index];
    const segment = Math.hypot(bx - ax, by - ay);
    if (travelled + segment >= distance) {
      const progress = segment === 0 ? 0 : (distance - travelled) / segment;
      return [ax + (bx - ax) * progress, ay + (by - ay) * progress];
    }
    travelled += segment;
  }
  return points.at(-1);
}

// The part of a path between two distances along it, keeping the corners in between.
function slicePath(points, from, to) {
  const slice = [pointAlong(points, from)];
  let travelled = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    travelled += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
    if (travelled > from && travelled < to) slice.push(points[index]);
  }
  slice.push(pointAlong(points, to));
  return slice;
}

// A copy of a path moved sideways by `offset` (positive is to the right of its direction
// of travel), with the corners kept sharp.
function offsetPath(points, offset) {
  const normals = points.slice(1).map(([x, y], index) => {
    const [px, py] = points[index];
    const length = Math.hypot(x - px, y - py) || 1;
    return [-(y - py) / length, (x - px) / length];
  });
  return points.map(([x, y], index) => {
    const before = normals[Math.max(0, index - 1)];
    const after = normals[Math.min(normals.length - 1, index)];
    const nx = before[0] + after[0];
    const ny = before[1] + after[1];
    const length = Math.hypot(nx, ny) || 1;
    const miter = Math.min(2, 2 / length); // wider at a bend, so both straights keep the full offset
    return [x + (nx / length) * offset * miter, y + (ny / length) * offset * miter];
  });
}

// ---- Build ----

let chain = resample(buildChain(readTrailWays()), SAMPLE_SPACING);
if (chain[0][1] > chain.at(-1)[1]) chain.reverse(); // north to south

// Keep the part between the two streets at the map's edges.
const nearestIndexTo = (roads) => chain.reduce(
  (best, point, index) => {
    const { distance } = findNearest(point, roads);
    return distance < best.distance ? { index, distance } : best;
  },
  { distance: Infinity },
).index;
const northEdge = roadsNamed(NORTH_EDGE_STREET);
const southEdge = roadsNamed(SOUTH_EDGE_STREET);
chain = chain.slice(nearestIndexTo(northEdge), nearestIndexTo(southEdge) + 1);

// Split where the trail joins and leaves the streets it shares.
const sharedRoads = SHARED_STREETS.flatMap(roadsNamed);
const isShared = (point) => {
  const nearest = findNearest(point, sharedRoads);
  return nearest.distance < nearest.road.width / 2;
};
const firstShared = chain.findIndex(isShared);
const lastShared = chain.findLastIndex(isShared);
if (firstShared < 0) throw new Error('The trail never meets the streets it is meant to share.');

// Each walkable part ends exactly on the centreline of the street it meets.
const snap = (point, roads) => findNearest(point, roads).point;
const north = [snap(chain[0], northEdge), ...chain.slice(1, firstShared), snap(chain[firstShared], sharedRoads)];
const south = [snap(chain[lastShared], sharedRoads), ...chain.slice(lastShared + 1, -1), snap(chain.at(-1), southEdge)];
const middle = chain.slice(firstShared, lastShared + 1);

// The sidewalk follows the street's own centreline, moved to its north side, for as far
// as the trail runs along that street.
const sidewalkStreet = roadsNamed(SIDEWALK_STREET)[0];
const isOnSidewalkStreet = (point) => findNearest(point, sharedRoads).road === sidewalkStreet;
const joinsAt = middle.findIndex(isOnSidewalkStreet);
const leavesAt = middle.findLastIndex(isOnSidewalkStreet);
if (joinsAt < 0) throw new Error(`The trail never runs along ${SIDEWALK_STREET}.`);
const streetStretch = slicePath(
  sidewalkStreet.points,
  distanceAlong(sidewalkStreet.points, middle[joinsAt]) + SIDEWALK_START_GAP,
  distanceAlong(sidewalkStreet.points, middle[leavesAt]) + SIDEWALK_END_OVERRUN,
);
const sidewalkOffset = SIDEWALK_OFFSET_PIXELS / MAP_SCALE;
// North is up the map (smaller y); pick whichever side of the street that is.
const sidewalk = [sidewalkOffset, -sidewalkOffset]
  .map((offset) => offsetPath(streetStretch, offset))
  .reduce((north, candidate) => (candidate[0][1] < north[0][1] ? candidate : north));
// What's left of the middle: DeKalb Avenue and the tunnel.
const shared = middle.slice(0, joinsAt + 1);

const trails = [north, south];
const exits = EXITS.map(({ from, street, to }) => {
  const trail = trails.reduce((best, points) => {
    const point = findNearestOnPath(from, points);
    const distance = Math.hypot(point[0] - from[0], point[1] - from[1]);
    return distance < best.distance ? { point, distance } : best;
  }, { distance: Infinity });
  return [trail.point, snap(to, roadsNamed(street))];
});

const output = `// GENERATED by tools/extract-beltline.mjs from the OpenStreetMap extracts in data/.
// Do not edit by hand; change the tool and run it again.
//
// The Atlanta BeltLine trail, in the map's original units (scaled at load like mapData.js).
//   trails: the two stretches with no street under them, north to south. Walkable.
//   exits:  short links from a trail to a nearby street. Walkable.
//   sidewalks: the trail where it runs down the north side of ${SIDEWALK_STREET}. Walkable,
//           and close enough to the street to step between the two.
//   shared: the stretch that runs along DeKalb Avenue and through the Krog Street Tunnel.
//           Already walkable as those streets; kept for the streetlights.
export const BELTLINE = ${JSON.stringify({ trails: trails.map(tidy), exits: exits.map(tidy), sidewalks: [tidy(sidewalk)], shared: tidy(shared) }, null, 2)
    .replace(/\[\s+(-?[\d.]+),\s+(-?[\d.]+)\s+\]/g, '[$1, $2]')};
`;
fs.writeFileSync(path.join(root, 'src/beltLine.js'), output);

console.log(`north trail ${Math.round(pathLength(north))} units, south trail ${Math.round(pathLength(south))} units,`
  + ` sidewalk ${Math.round(pathLength(sidewalk))} units, shared ${Math.round(pathLength(shared))} units, ${exits.length} exits`
  + ` (${exits.map((exit) => Math.round(pathLength(exit))).join(', ')} units)`);
