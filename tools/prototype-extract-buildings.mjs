// PROTOTYPE, throwaway: pulls OSM building footprints for the block-style mockup
// (prototype-blocks.html). Writes src/prototype/buildings.json in the map's original
// (unscaled) coordinates, using the same projection as the roads.
//
// Usage: node tools/prototype-extract-buildings.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mapData } from '../src/mapData.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OSM_FILES = ['data/map.osm', 'data/map-south.osm'];
const { bounds, world } = mapData;

function project(lat, lon) {
  return [
    ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * world.width,
    ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * world.height,
  ];
}

const buildings = new Map();
for (const file of OSM_FILES) {
  const xml = fs.readFileSync(path.join(root, file), 'utf8');
  const nodes = new Map();
  for (const match of xml.matchAll(/<node id="(\d+)"[^>]*lat="([-\d.]+)" lon="([-\d.]+)"/g)) {
    nodes.set(match[1], [Number(match[2]), Number(match[3])]);
  }
  for (const match of xml.matchAll(/<way id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
    const kind = match[2].match(/k="building" v="([^"]+)"/)?.[1];
    if (!kind) continue;
    const points = [...match[2].matchAll(/<nd ref="(\d+)"/g)]
      .map((ref) => nodes.get(ref[1]))
      .filter(Boolean)
      .map(([lat, lon]) => project(lat, lon).map((value) => Math.round(value * 10) / 10));
    if (points.length < 4) continue;
    const inside = points.some(([x, y]) => x >= 0 && y >= 0 && x <= world.width && y <= world.height);
    if (!inside) continue;
    if (points.length > (buildings.get(match[1])?.points.length ?? 0)) {
      buildings.set(match[1], { kind, points: points.slice(0, -1) });
    }
  }
}

const out = path.join(root, 'src/prototype/buildings.json');
fs.writeFileSync(out, JSON.stringify([...buildings.values()]));
const kinds = {};
for (const { kind } of buildings.values()) kinds[kind] = (kinds[kind] ?? 0) + 1;
console.log(`Wrote ${buildings.size} buildings to ${path.relative(root, out)}`, kinds);
