// The blocks between streets: real OpenStreetMap buildings seen from above as muted
// rooftops, under soft tree canopy. It's background only, so it stays low in contrast
// and never covers a street, and it's drawn once into the cached ground layer (see
// createGroundLayer in main.js). Trees come from a fixed seed, so the town looks the
// same every game.
import { scalePoints } from './mapScale.js';

// Muted roof paints for houses. Sheds and garages, and flat-roofed bigger buildings,
// get their own greys.
const ROOF_COLORS = ['#878c95', '#9e958a', '#ab8075', '#7a9593', '#8d977b', '#968791', '#a1917f'];
const SMALL_ROOF_COLOR = '#9c958a';
const FLAT_ROOF_COLOR = '#b3afa5';
const SMALL_KINDS = new Set(['shed', 'garage', 'carport', 'roof', 'shelter']);
const FLAT_KINDS = new Set([
  'apartments', 'retail', 'commercial', 'industrial', 'school', 'church', 'parking', 'office',
  'warehouse', 'hotel', 'condominium', 'train_station', 'museum', 'government', 'civic', 'bank',
  'service', 'storage', 'kindergarten',
]);
// Footprints bigger than this (world pixels²) read as flat-roofed blocks.
const FLAT_ROOF_MIN_AREA = 2600;
const BUILDING_SHADOW_OFFSET = [3, 4];

// Trees: at most one per grid cell, nudged off the grid so rows don't show.
const TREE_CELL = 26;
const TREE_RADIUS = [10, 19];
// Chance of a tree in a cell: street trees near the sidewalk, yard trees further in,
// and denser in parks.
const STREET_TREE_CHANCE = 0.6;
const YARD_TREE_CHANCE = 0.4;
const PARK_TREE_CHANCE = 0.55;
const STREET_TREE_BAND = 34; // world pixels from the road's edge
// Canopy may reach this far over the pale road border, but never onto the road.
const ROAD_BORDER = 9;
const CANOPY_COLORS = ['#6ea862', '#679f5c', '#73ac66'];
const CANOPY_HIGHLIGHT = '#82b872';
const CANOPY_SHADOW = 'rgba(28, 52, 32, 0.22)';
const SEED = 1889; // the year Inman Park was laid out

// Small integer hash: the same inputs always give the same number in [0, 1).
function hash(a, b = 0) {
  let h = Math.imul((a + SEED) | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * (1 + amount))));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function boundsOf(points) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

function pointInPolygon(px, py, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Buckets items by map area so lookups only check near neighbours.
function createGrid(cellSize) {
  const cells = new Map();
  return {
    add(item, { x, y, width, height }) {
      for (let cx = Math.floor(x / cellSize); cx <= Math.floor((x + width) / cellSize); cx += 1) {
        for (let cy = Math.floor(y / cellSize); cy <= Math.floor((y + height) / cellSize); cy += 1) {
          const key = `${cx},${cy}`;
          if (!cells.has(key)) cells.set(key, []);
          cells.get(key).push(item);
        }
      }
    },
    near(x, y) {
      return cells.get(`${Math.floor(x / cellSize)},${Math.floor(y / cellSize)}`) ?? [];
    },
  };
}

// Paths (streets, the MARTA line) split into segments in a grid; `distance` is how far
// a point is from the nearest path's edge (negative means on it).
function createPathIndex(paths) {
  const grid = createGrid(120);
  for (const { points, width } of paths) {
    const half = width / 2;
    for (let i = 1; i < points.length; i += 1) {
      const [ax, ay] = points[i - 1];
      const [bx, by] = points[i];
      const pad = half + STREET_TREE_BAND + TREE_RADIUS[1];
      grid.add({ ax, ay, bx, by, half }, {
        x: Math.min(ax, bx) - pad,
        y: Math.min(ay, by) - pad,
        width: Math.abs(bx - ax) + pad * 2,
        height: Math.abs(by - ay) + pad * 2,
      });
    }
  }
  return {
    distance(x, y) {
      let best = Infinity;
      for (const s of grid.near(x, y)) best = Math.min(best, distanceToSegment(x, y, s.ax, s.ay, s.bx, s.by) - s.half);
      return best;
    },
  };
}

function prepareBuilding({ kind, points: sourcePoints }, index) {
  const points = scalePoints(sourcePoints);
  const bounds = boundsOf(points);
  let area = 0;
  let longestWall = 0;
  let ridgeAngle = 0;
  points.forEach(([ax, ay], i) => {
    const [bx, by] = points[(i + 1) % points.length];
    area += ax * by - bx * ay;
    const length = Math.hypot(bx - ax, by - ay);
    // The roof ridge runs along the longest wall.
    if (length > longestWall) {
      longestWall = length;
      ridgeAngle = Math.atan2(by - ay, bx - ax);
    }
  });
  area = Math.abs(area) / 2;
  const roof = SMALL_KINDS.has(kind) ? 'small' : FLAT_KINDS.has(kind) || area > FLAT_ROOF_MIN_AREA ? 'flat' : 'pitched';
  return {
    points,
    bounds,
    centerX: points.reduce((sum, [x]) => sum + x, 0) / points.length,
    centerY: points.reduce((sum, [, y]) => sum + y, 0) / points.length,
    ridgeAngle,
    roof,
    color: ROOF_COLORS[Math.floor(hash(index, 7) * ROOF_COLORS.length)],
  };
}

// Works out which buildings and trees to draw.
//   buildings: source footprints ({ kind, points } in original map units)
//   roads, parks, world: the scaled map data
//   avoidRects: [{ x, y, width, height }] to keep clear (landmark sprites, Waffle House lots)
//   avoidPaths: [{ points, width }] to keep clear (the MARTA line)
export function createNeighborhoodCanopy({ buildings, roads, parks, world, avoidRects = [], avoidPaths = [] }) {
  const roadIndex = createPathIndex(roads);
  const avoidPathIndex = createPathIndex(avoidPaths);
  const parkBounds = parks.map((park) => ({ points: park.points, bounds: boundsOf(park.points) }));
  const inAvoidRect = (rect) => avoidRects.some((avoid) => rectsOverlap(rect, avoid));

  const placedBuildings = buildings.map(prepareBuilding).filter((building) => {
    const { x, y, width, height } = building.bounds;
    return !inAvoidRect(building.bounds)
      && avoidPathIndex.distance(x + width / 2, y + height / 2) > Math.max(width, height) / 2;
  });
  const buildingGrid = createGrid(120);
  placedBuildings.forEach((building) => buildingGrid.add(building, building.bounds));
  const insideBuilding = (x, y) => buildingGrid.near(x, y).some((b) => pointInPolygon(x, y, b.points));
  const insidePark = (x, y) => parkBounds.some(({ points, bounds }) => (
    x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height
    && pointInPolygon(x, y, points)
  ));

  const trees = [];
  for (let cx = 0; cx < Math.ceil(world.width / TREE_CELL); cx += 1) {
    for (let cy = 0; cy < Math.ceil(world.height / TREE_CELL); cy += 1) {
      const x = (cx + 0.15 + hash(cx, cy) * 0.7) * TREE_CELL;
      const y = (cy + 0.15 + hash(cy, cx + 99) * 0.7) * TREE_CELL;
      const radius = TREE_RADIUS[0] + hash(cx * 3, cy * 5) * (TREE_RADIUS[1] - TREE_RADIUS[0]);
      const roadDistance = roadIndex.distance(x, y);
      if (roadDistance < radius * 0.55 + ROAD_BORDER) continue;
      const park = insidePark(x, y);
      const chance = park ? PARK_TREE_CHANCE : roadDistance < STREET_TREE_BAND ? STREET_TREE_CHANCE : YARD_TREE_CHANCE;
      if (hash(cx + 11, cy - 7) >= chance) continue;
      const box = { x: x - radius, y: y - radius, width: radius * 2, height: radius * 2 };
      if (insideBuilding(x, y) || inAvoidRect(box) || avoidPathIndex.distance(x, y) < radius) continue;
      trees.push({ x, y, radius, color: CANOPY_COLORS[Math.floor(hash(cx - 5, cy + 3) * CANOPY_COLORS.length)] });
    }
  }
  // Lower trees overlap the ones behind them.
  trees.sort((a, b) => a.y - b.y);

  return { buildings: placedBuildings, trees };
}

function tracePolygon(context, points) {
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) context.lineTo(points[i][0], points[i][1]);
  context.closePath();
}

function drawRooftops(context, buildings) {
  // All shadows first, so no roof is darkened by its neighbour's shadow.
  context.save();
  context.translate(...BUILDING_SHADOW_OFFSET);
  context.fillStyle = 'rgba(28, 48, 34, 0.2)';
  for (const building of buildings) {
    tracePolygon(context, building.points);
    context.fill();
  }
  context.restore();

  for (const building of buildings) {
    const base = building.roof === 'flat' ? FLAT_ROOF_COLOR : building.roof === 'small' ? SMALL_ROOF_COLOR : building.color;
    tracePolygon(context, building.points);
    context.fillStyle = base;
    context.fill();
    context.save();
    tracePolygon(context, building.points);
    context.clip();
    if (building.roof === 'pitched') {
      // The sunlit half of the roof, split along the ridge.
      context.translate(building.centerX, building.centerY);
      context.rotate(building.ridgeAngle);
      context.fillStyle = shade(base, 0.14);
      context.fillRect(-200, -200, 400, 200);
      context.strokeStyle = shade(base, -0.22);
      context.lineWidth = 1.5;
      context.beginPath();
      context.moveTo(-200, 0);
      context.lineTo(200, 0);
      context.stroke();
    } else if (building.roof === 'flat') {
      // A parapet rim reads as a flat roof.
      tracePolygon(context, building.points);
      context.strokeStyle = shade(base, -0.12);
      context.lineWidth = 5;
      context.stroke();
    }
    context.restore();
    tracePolygon(context, building.points);
    context.strokeStyle = shade(base, -0.3);
    context.lineWidth = 1;
    context.stroke();
  }
}

function drawTrees(context, trees) {
  context.fillStyle = CANOPY_SHADOW;
  for (const tree of trees) {
    context.beginPath();
    context.arc(tree.x + 4, tree.y + 5, tree.radius, 0, Math.PI * 2);
    context.fill();
  }
  for (const tree of trees) {
    context.fillStyle = tree.color;
    context.beginPath();
    context.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = CANOPY_HIGHLIGHT;
    context.beginPath();
    context.arc(tree.x - tree.radius * 0.28, tree.y - tree.radius * 0.3, tree.radius * 0.55, 0, Math.PI * 2);
    context.fill();
  }
}

// Draws every rooftop, then the canopy over them. Roads go on top afterwards.
export function drawNeighborhoodCanopy(context, { buildings, trees }) {
  drawRooftops(context, buildings);
  drawTrees(context, trees);
}
