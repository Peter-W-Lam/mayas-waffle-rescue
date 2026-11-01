// PROTOTYPE, throwaway. Question: what should the blocks between streets look like?
// Four looks on the real map, switchable with ← / → (or ?variant=A…D):
//   A  Current: lawn + generated Victorian house sprites (as in the game today)
//   B  Rooftops: real OSM building footprints drawn from above as muted pitched roofs
//   C  Leafy: the same rooftops under soft tree canopy
//   D  Flat map: calm, flat building shapes and pale ground, like a printed map
// Trevor, Maya and a T-Rex stand on a street so readability can be judged.
// Landmark sprites, pickups, floods and weather are left out.
import { mapData } from '../mapData.js';
import { applyRoadAdjustments } from '../mapAdjustments.js';
import { MAP_SCALE, scaleMapData, scalePoints } from '../mapScale.js';
import { placeNeighborhoodHouses, drawNeighborhoodHouses } from '../neighborhoodHouses.js';
import { createTrevorFrames } from '../trevorSprite.js';
import { createMayaFrames } from '../mayaSprite.js';
import { createTRexFrames } from '../tRexSprite.js';
import SOURCE_BUILDINGS from './buildings.json';

applyRoadAdjustments(mapData.roads);
scaleMapData(mapData);
const { roads, parks, world } = mapData;

const VARIANTS = [
  { key: 'A', name: 'Current houses', note: 'What the game draws today: generated Victorian house sprites lining every street.' },
  { key: 'B', name: 'Real rooftops', note: 'Real OSM building footprints, seen from above as muted pitched roofs with a soft shadow.' },
  { key: 'C', name: 'Leafy canopy', note: 'The same real rooftops, under soft tree canopy filling the yards. Inman Park is very leafy.' },
  { key: 'D', name: 'Flat map', note: 'Flat, calm building shapes on pale ground, like a printed map. The quietest background.' },
];

const PLACES = {
  inman: [2300, 560],
  spruce: [1682, 1049],
  cabbagetown: [693, 2104],
};

const SPRITE_SCALE = 2;
const TREE_CELL = 26;

// --- Data ----------------------------------------------------------------------

const SMALL_KINDS = new Set(['shed', 'garage', 'carport', 'roof', 'shelter']);
const FLAT_KINDS = new Set([
  'apartments', 'retail', 'commercial', 'industrial', 'school', 'church', 'parking', 'office',
  'warehouse', 'hotel', 'condominium', 'train_station', 'museum', 'government', 'civic', 'bank', 'service',
]);
const ROOF_COLORS = ['#8c919a', '#a39a8f', '#b0857a', '#7f9a98', '#929c80', '#9b8c96', '#a69684'];

function hash(a, b = 0) {
  let h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const buildings = SOURCE_BUILDINGS.map(({ kind, points }, index) => {
  const scaled = scalePoints(points);
  const xs = scaled.map(([x]) => x);
  const ys = scaled.map(([, y]) => y);
  const bounds = { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
  const centerX = xs.reduce((sum, x) => sum + x, 0) / xs.length;
  const centerY = ys.reduce((sum, y) => sum + y, 0) / ys.length;
  // The ridge runs along the longest wall.
  let longest = 0;
  let ridgeAngle = 0;
  scaled.forEach(([ax, ay], i) => {
    const [bx, by] = scaled[(i + 1) % scaled.length];
    const length = Math.hypot(bx - ax, by - ay);
    if (length > longest) { longest = length; ridgeAngle = Math.atan2(by - ay, bx - ax); }
  });
  const area = Math.abs(scaled.reduce((sum, [ax, ay], i) => {
    const [bx, by] = scaled[(i + 1) % scaled.length];
    return sum + ax * by - bx * ay;
  }, 0)) / 2;
  const style = SMALL_KINDS.has(kind) ? 'small' : FLAT_KINDS.has(kind) || area > 2600 ? 'flat' : 'pitched';
  return { points: scaled, bounds, centerX, centerY, ridgeAngle, style, color: ROOF_COLORS[Math.floor(hash(index, 7) * ROOF_COLORS.length)] };
});

// Spatial grids so drawing and tree checks only look nearby.
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

const buildingGrid = createGrid(120);
buildings.forEach((building) => buildingGrid.add(building, building.bounds));

const segmentGrid = createGrid(120);
for (const road of roads) {
  for (let i = 1; i < road.points.length; i += 1) {
    const [ax, ay] = road.points[i - 1];
    const [bx, by] = road.points[i];
    const pad = road.width / 2 + 30;
    segmentGrid.add({ ax, ay, bx, by, half: road.width / 2 }, {
      x: Math.min(ax, bx) - pad, y: Math.min(ay, by) - pad,
      width: Math.abs(bx - ax) + pad * 2, height: Math.abs(by - ay) + pad * 2,
    });
  }
}

function distanceToSegment(px, py, { ax, ay, bx, by }) {
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// How far a point is from the nearest road's edge (negative = on the road).
function roadEdgeDistance(x, y) {
  let best = Infinity;
  for (const segment of segmentGrid.near(x, y)) best = Math.min(best, distanceToSegment(x, y, segment) - segment.half);
  return best;
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

const insideBuilding = (x, y) => buildingGrid.near(x, y).some((b) => pointInPolygon(x, y, b.points));
const insidePark = (x, y) => parks.some((park) => pointInPolygon(x, y, park.points));

// Trees for one grid cell, decided by the cell's own seed so they never change.
const treeCache = new Map();
function treesInCell(cx, cy) {
  const key = `${cx},${cy}`;
  if (treeCache.has(key)) return treeCache.get(key);
  const trees = [];
  const x = (cx + 0.15 + hash(cx, cy) * 0.7) * TREE_CELL;
  const y = (cy + 0.15 + hash(cy, cx + 99) * 0.7) * TREE_CELL;
  const radius = 10 + hash(cx * 3, cy * 5) * 9;
  const edge = roadEdgeDistance(x, y);
  const park = insidePark(x, y);
  // Street trees along the sidewalk, scattered yard trees, denser in parks.
  const chance = park ? 0.55 : edge < 34 ? 0.6 : 0.4;
  if (edge > radius * 0.55 + 9 && !insideBuilding(x, y) && hash(cx + 11, cy - 7) < chance) {
    trees.push({ x, y, radius, shade: hash(cx - 5, cy + 3) });
  }
  treeCache.set(key, trees);
  return trees;
}

function visibleTrees(view) {
  const trees = [];
  const margin = 2;
  for (let cx = Math.floor(view.x / TREE_CELL) - margin; cx <= Math.ceil((view.x + view.width) / TREE_CELL) + margin; cx += 1) {
    for (let cy = Math.floor(view.y / TREE_CELL) - margin; cy <= Math.ceil((view.y + view.height) / TREE_CELL) + margin; cy += 1) {
      trees.push(...treesInCell(cx, cy));
    }
  }
  return trees.sort((a, b) => a.y - b.y);
}

const neighborhoodHouses = placeNeighborhoodHouses({ roads, parks, world });

// --- Drawing helpers -------------------------------------------------------------

function tracePath(ctx, points, close = false) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  if (close) ctx.closePath();
}

function visibleBuildings(view) {
  return buildings.filter(({ bounds }) => bounds.x < view.x + view.width && bounds.x + bounds.width > view.x
    && bounds.y < view.y + view.height && bounds.y + bounds.height > view.y);
}

function shade(hex, amount) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * (1 + amount))));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

function drawGround(ctx, ground, parkFill, parkEdge) {
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, world.width, world.height);
  for (const park of parks) {
    tracePath(ctx, park.points, true);
    ctx.fillStyle = parkFill;
    ctx.fill();
    ctx.strokeStyle = parkEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

// Same styling as drawRoads() in main.js.
function drawRoads(ctx, { border = '#e7e2d7', surface = '#69767c' } = {}) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const road of roads) {
    tracePath(ctx, road.points);
    ctx.strokeStyle = border;
    ctx.lineWidth = road.width + 18;
    ctx.stroke();
  }
  for (const road of roads) {
    tracePath(ctx, road.points);
    ctx.strokeStyle = surface;
    ctx.lineWidth = road.width;
    ctx.stroke();
  }
  for (const road of roads) {
    if (!['primary', 'secondary', 'tertiary'].includes(road.type)) continue;
    tracePath(ctx, road.points);
    ctx.strokeStyle = '#f7e8a0';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([18, 15]);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRooftops(ctx, view, { muted = 0 } = {}) {
  const list = visibleBuildings(view);
  // Shadows first, so no roof is darkened by its neighbour's shadow.
  ctx.fillStyle = 'rgba(28, 48, 34, 0.2)';
  for (const building of list) {
    ctx.save();
    ctx.translate(3, 4);
    tracePath(ctx, building.points, true);
    ctx.fill();
    ctx.restore();
  }
  for (const building of list) {
    const base = shade(building.color, muted);
    tracePath(ctx, building.points, true);
    ctx.fillStyle = building.style === 'flat' ? shade('#b8b4aa', muted) : building.style === 'small' ? shade('#a19a8e', muted) : base;
    ctx.fill();
    if (building.style === 'pitched') {
      // Sunlit half of the roof, split along the ridge.
      ctx.save();
      tracePath(ctx, building.points, true);
      ctx.clip();
      ctx.translate(building.centerX, building.centerY);
      ctx.rotate(building.ridgeAngle);
      ctx.fillStyle = shade(building.color, muted + 0.14);
      ctx.fillRect(-200, -200, 400, 200);
      ctx.strokeStyle = shade(building.color, muted - 0.22);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-200, 0);
      ctx.lineTo(200, 0);
      ctx.stroke();
      ctx.restore();
    } else if (building.style === 'flat') {
      // A parapet rim reads as a flat roof.
      ctx.save();
      tracePath(ctx, building.points, true);
      ctx.clip();
      ctx.strokeStyle = shade('#b8b4aa', muted - 0.12);
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.restore();
    }
    tracePath(ctx, building.points, true);
    ctx.strokeStyle = shade(building.color, muted - 0.3);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawTrees(ctx, view, { flat = false } = {}) {
  const trees = visibleTrees(view);
  if (!flat) {
    ctx.fillStyle = 'rgba(28, 52, 32, 0.22)';
    for (const tree of trees) {
      ctx.beginPath();
      ctx.arc(tree.x + 4, tree.y + 5, tree.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const tree of trees) {
    const greens = flat ? ['#a9cf96', '#a2c98f'] : ['#6ea862', '#679f5c', '#73ac66'];
    ctx.fillStyle = greens[Math.floor(tree.shade * greens.length)];
    ctx.beginPath();
    ctx.arc(tree.x, tree.y, tree.radius, 0, Math.PI * 2);
    ctx.fill();
    if (flat) continue;
    ctx.fillStyle = '#82b872';
    ctx.beginPath();
    ctx.arc(tree.x - tree.radius * 0.28, tree.y - tree.radius * 0.3, tree.radius * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFlatBuildings(ctx, view) {
  for (const building of visibleBuildings(view)) {
    tracePath(ctx, building.points, true);
    ctx.fillStyle = building.style === 'flat' ? '#ddd6c6' : '#e6dfcf';
    ctx.fill();
    ctx.strokeStyle = '#c9bfaa';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

const BACKGROUNDS = {
  A(ctx, view) {
    drawGround(ctx, '#a9d596', '#83d5a1', '#62b887');
    drawNeighborhoodHouses(ctx, neighborhoodHouses, view);
    drawRoads(ctx);
  },
  B(ctx, view) {
    drawGround(ctx, '#a6d193', '#8fd2a2', '#6cb98b');
    drawRooftops(ctx, view);
    drawRoads(ctx);
  },
  C(ctx, view) {
    drawGround(ctx, '#9cc988', '#8fd2a2', '#6cb98b');
    drawRooftops(ctx, view, { muted: -0.04 });
    drawTrees(ctx, view);
    drawRoads(ctx);
  },
  D(ctx, view) {
    drawGround(ctx, '#cde1b9', '#a6d89c', '#8cc283');
    drawFlatBuildings(ctx, view);
    drawTrees(ctx, view, { flat: true });
    drawRoads(ctx, { border: '#f3efe6' });
  },
};

// --- Characters ------------------------------------------------------------------

const trevorFrame = createTrevorFrames()[0];
const mayaFrame = createMayaFrames()[0];
const tRexFrame = createTRexFrames()[0];

function nearestRoadPoint(x, y) {
  let best = null;
  for (const road of roads) {
    for (let i = 1; i < road.points.length; i += 1) {
      const [ax, ay] = road.points[i - 1];
      const [bx, by] = road.points[i];
      for (let step = 0; step <= 10; step += 1) {
        const px = ax + ((bx - ax) * step) / 10;
        const py = ay + ((by - ay) * step) / 10;
        const distance = Math.hypot(px - x, py - y);
        if (!best || distance < best.distance) best = { x: px, y: py, distance };
      }
    }
  }
  return best;
}

function drawSprite(ctx, frame, x, y, facing = 1) {
  const width = frame.width * SPRITE_SCALE;
  const height = frame.height * SPRITE_SCALE;
  ctx.fillStyle = 'rgba(24, 35, 30, 0.2)';
  ctx.beginPath();
  ctx.ellipse(x, y + height / 2 - 2, width * 0.36, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  ctx.scale(facing, 1);
  ctx.drawImage(frame, -width / 2, -height / 2, width, height);
  ctx.restore();
}

// --- App -------------------------------------------------------------------------

const canvas = document.querySelector('#view');
const context = canvas.getContext('2d');
const background = document.createElement('canvas');
const backgroundContext = background.getContext('2d');
const label = document.querySelector('#label');
const note = document.querySelector('#note');
const snapButton = document.querySelector('#snap');
const squintButton = document.querySelector('#squint');

const params = new URLSearchParams(location.search);
let variantIndex = Math.max(0, VARIANTS.findIndex((v) => v.key === params.get('variant')));
let pixelSnap = params.get('snap') !== 'off';
const camera = { x: 0, y: 0 };
let characters = [];

function jumpTo(placeId) {
  const [x, y] = PLACES[placeId].map((value) => value * MAP_SCALE);
  camera.x = x - window.innerWidth / 2;
  camera.y = y - window.innerHeight / 2;
  const trevor = nearestRoadPoint(x, y);
  const maya = nearestRoadPoint(x - 120, y + 60);
  const tRex = nearestRoadPoint(x + 200, y - 110);
  characters = [
    { frame: tRexFrame, ...tRex, facing: -1 },
    { frame: mayaFrame, ...maya, facing: 1 },
    { frame: trevorFrame, ...trevor, facing: 1 },
  ];
  draw();
}

function draw() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
  if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);

  const variant = VARIANTS[variantIndex];
  // Pixel snap draws the background at half size and enlarges it without smoothing,
  // so its pixels are the same 2× blocks as the sprites. The current look is left as is.
  const snap = pixelSnap && variant.key !== 'A';
  const backgroundScale = snap ? 1 / SPRITE_SCALE : ratio;
  background.width = Math.ceil(width * backgroundScale);
  background.height = Math.ceil(height * backgroundScale);
  backgroundContext.setTransform(backgroundScale, 0, 0, backgroundScale, -camera.x * backgroundScale, -camera.y * backgroundScale);
  BACKGROUNDS[variant.key](backgroundContext, { x: camera.x, y: camera.y, width, height });

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.imageSmoothingEnabled = false;
  context.drawImage(background, 0, 0, background.width / backgroundScale * ratio, background.height / backgroundScale * ratio);
  context.setTransform(ratio, 0, 0, ratio, -camera.x * ratio, -camera.y * ratio);
  for (const character of characters) drawSprite(context, character.frame, character.x, character.y, character.facing);

  label.textContent = `${variant.key} · ${variant.name}`;
  note.innerHTML = `<strong>${variant.key}: ${variant.name}</strong>${variant.note} Drag to pan.`;
  snapButton.setAttribute('aria-pressed', String(pixelSnap));
  snapButton.disabled = variant.key === 'A';
  squintButton.setAttribute('aria-pressed', String(canvas.classList.contains('squint')));
}

function setVariant(index) {
  variantIndex = (index + VARIANTS.length) % VARIANTS.length;
  params.set('variant', VARIANTS[variantIndex].key);
  history.replaceState(null, '', `?${params}`);
  draw();
}

function toggleSnap() {
  pixelSnap = !pixelSnap;
  params.set('snap', pixelSnap ? 'on' : 'off');
  history.replaceState(null, '', `?${params}`);
  draw();
}

function toggleSquint() {
  canvas.classList.toggle('squint');
  draw();
}

document.querySelector('#prev').addEventListener('click', () => setVariant(variantIndex - 1));
document.querySelector('#next').addEventListener('click', () => setVariant(variantIndex + 1));
snapButton.addEventListener('click', toggleSnap);
squintButton.addEventListener('click', toggleSquint);
document.querySelectorAll('[data-place]').forEach((button) => button.addEventListener('click', () => jumpTo(button.dataset.place)));
window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') setVariant(variantIndex - 1);
  else if (event.key === 'ArrowRight') setVariant(variantIndex + 1);
  else if (event.key === 'p' || event.key === 'P') toggleSnap();
  else if (event.key === 's' || event.key === 'S') toggleSquint();
});

let drag = null;
canvas.addEventListener('pointerdown', (event) => {
  drag = { x: event.clientX, y: event.clientY, cameraX: camera.x, cameraY: camera.y };
  canvas.classList.add('dragging');
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove', (event) => {
  if (!drag) return;
  camera.x = drag.cameraX - (event.clientX - drag.x);
  camera.y = drag.cameraY - (event.clientY - drag.y);
  requestAnimationFrame(draw);
});
canvas.addEventListener('pointerup', () => {
  drag = null;
  canvas.classList.remove('dragging');
});
window.addEventListener('resize', draw);

jumpTo('inman');
