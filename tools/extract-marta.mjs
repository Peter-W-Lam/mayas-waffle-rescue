// Extracts the MARTA East Line from the OpenStreetMap extracts in data/ and writes
// src/martaLine.js: one simplified centreline in game-world pixels, running west to east.
//
// Usage: node tools/extract-marta.mjs
//
// OSM maps the line as two parallel tracks (one per direction). The game draws roads far
// wider than life, so both tracks are merged into a single centreline here and the game
// lays its two tracks either side of it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapData } from '../src/mapData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OSM_FILES = ['data/map.osm', 'data/map-south.osm'];
const SAMPLE_SPACING = 20;
const SIMPLIFY_TOLERANCE = 1.5;
// Keep a little of the line beyond the map so trains enter and leave off-world.
const WORLD_MARGIN = 250;

const { bounds, world } = mapData;

// The same linear projection the map generator used for roads.
function project(lat, lon) {
  return [
    ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * world.width,
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * world.height,
  ];
}

function readSubwayWays() {
  const ways = new Map();
  for (const file of OSM_FILES) {
    const xml = fs.readFileSync(path.join(root, file), 'utf8');
    const nodes = new Map();
    for (const match of xml.matchAll(/<node id="(\d+)"[^>]*lat="([-\d.]+)" lon="([-\d.]+)"/g)) {
      nodes.set(match[1], [Number(match[2]), Number(match[3])]);
    }
    for (const match of xml.matchAll(/<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
      if (!/k="railway" v="subway"/.test(match[2])) continue;
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

// Joins ways end to end into chains; each OSM track direction becomes one chain.
function buildChains(ways) {
  const remaining = [...ways];
  const chains = [];
  while (remaining.length) {
    let chain = remaining.shift();
    let extended = true;
    while (extended) {
      extended = false;
      for (let index = 0; index < remaining.length; index += 1) {
        const way = remaining[index];
        if (samePoint(chain.at(-1), way[0])) chain = [...chain, ...way.slice(1)];
        else if (samePoint(way.at(-1), chain[0])) chain = [...way, ...chain.slice(1)];
        else continue;
        remaining.splice(index, 1);
        extended = true;
        break;
      }
    }
    chains.push(chain);
  }
  return chains.sort((a, b) => pathLength(b) - pathLength(a));
}

function pathLength(points) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index][0] - points[index - 1][0], points[index][1] - points[index - 1][1]);
  }
  return length;
}

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

function closestPointOnPath(point, pathPoints) {
  let best = null;
  for (let index = 1; index < pathPoints.length; index += 1) {
    const [ax, ay] = pathPoints[index - 1];
    const [bx, by] = pathPoints[index];
    const dx = bx - ax;
    const dy = by - ay;
    const lengthSquared = dx * dx + dy * dy;
    const t = lengthSquared ? Math.max(0, Math.min(1, ((point[0] - ax) * dx + (point[1] - ay) * dy) / lengthSquared)) : 0;
    const candidate = [ax + dx * t, ay + dy * t];
    const distance = Math.hypot(candidate[0] - point[0], candidate[1] - point[1]);
    if (!best || distance < best.distance) best = { point: candidate, distance };
  }
  return best;
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  const [ax, ay] = points[0];
  const [bx, by] = points.at(-1);
  const length = Math.hypot(bx - ax, by - ay) || 1;
  let farthest = 0;
  let farthestIndex = 0;
  for (let index = 1; index < points.length - 1; index += 1) {
    const [px, py] = points[index];
    const distance = Math.abs((bx - ax) * (ay - py) - (ax - px) * (by - ay)) / length;
    if (distance > farthest) {
      farthest = distance;
      farthestIndex = index;
    }
  }
  if (farthest <= tolerance) return [points[0], points.at(-1)];
  return [
    ...simplify(points.slice(0, farthestIndex + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(farthestIndex), tolerance),
  ];
}

const insideMargin = ([x, y]) => x >= -WORLD_MARGIN && x <= world.width + WORLD_MARGIN
  && y >= -WORLD_MARGIN && y <= world.height + WORLD_MARGIN;

const [trackA, trackB] = buildChains(readSubwayWays());
let centreline = resample(trackA, SAMPLE_SPACING)
  .filter(insideMargin)
  .map((point) => {
    const partner = closestPointOnPath(point, trackB).point;
    return [(point[0] + partner[0]) / 2, (point[1] + partner[1]) / 2];
  });
if (centreline[0][0] > centreline.at(-1)[0]) centreline.reverse();
centreline = simplify(centreline, SIMPLIFY_TOLERANCE).map(([x, y]) => [Number(x.toFixed(1)), Number(y.toFixed(1))]);

const output = `// Generated by tools/extract-marta.mjs from the OpenStreetMap extracts in data/.
// © OpenStreetMap contributors, licensed under the ODbL.
// The MARTA East Line's centreline in game-world pixels, running west to east. It is
// decoration only: nothing in the game treats it as walkable or solid.
export const MARTA_LINE = ${JSON.stringify({ name: 'MARTA East Line', points: centreline })};
`;
fs.writeFileSync(path.join(root, 'src/martaLine.js'), output);
console.log(`Wrote src/martaLine.js: ${centreline.length} points, ${Math.round(pathLength(centreline))}px long.`);
