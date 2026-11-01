// Lines the neighborhood streets with Victorian houses so the map isn't empty lawn.
// Houses sit in tidy rows along each street, all set back the same distance, and are
// turned so their front door faces the street (like the houses around a board game).
// They are decoration only: they never cover a street, so they can't block movement.
// They aren't real addresses; a fixed seed places them, so the town looks the same
// every game.
import {
  VICTORIAN_HOUSE_COLORWAYS,
  VICTORIAN_HOUSE_STYLES,
  createVictorianHouseSprite,
} from './victorianHouseSprites.js';

const HOUSE_SCALE = 3;
// Turned houses are drawn smoothed from a sharper copy so pixel edges stay crisp.
const IMAGE_SUPERSAMPLE = 2;
// Streets that get houses. Big through roads (trunk, primary) stay open.
const HOUSE_STREET_TYPES = new Set(['residential', 'tertiary', 'secondary']);
// All in world pixels: gap from a street's edge to the house front, the clear space
// a house keeps from other streets and avoided areas, and the gap between neighbours.
const SETBACK = 6;
const ROAD_CLEARANCE = 4;
const HOUSE_GAP = 5;
// When a house doesn't fit, slide this far along the street and try again.
const RETRY_STEP = 8;
// Share of lots left as a yard, so rows aren't completely solid.
const EMPTY_LOT_CHANCE = 0.05;
const STYLE_WEIGHTS = [
  ['queenAnne', 2],
  ['gabledTwoStory', 3],
  ['shotgunCottage', 3],
  ['folkVictorian', 2],
];
const FALLBACK_STYLE = 'shotgunCottage'; // the narrowest, for tight spots
const SEED = 1889; // the year Inman Park was laid out
const GRID_CELL = 160;

// One image per style and colorway, with a ground shadow at the front, built once.
function createHouseImages() {
  const images = {};
  const pixel = HOUSE_SCALE * IMAGE_SUPERSAMPLE;
  for (const styleId of Object.keys(VICTORIAN_HOUSE_STYLES)) {
    images[styleId] = VICTORIAN_HOUSE_COLORWAYS.map((_, colorwayIndex) => {
      const sprite = createVictorianHouseSprite(styleId, colorwayIndex);
      const image = document.createElement('canvas');
      image.width = sprite.width * pixel;
      image.height = sprite.height * pixel;
      const imageContext = image.getContext('2d');
      imageContext.imageSmoothingEnabled = false;
      imageContext.beginPath();
      imageContext.ellipse(image.width / 2, image.height - 3 * pixel, image.width * 0.48, 3 * pixel, 0, 0, Math.PI * 2);
      imageContext.fillStyle = 'rgba(24, 35, 30, 0.2)';
      imageContext.fill();
      imageContext.drawImage(sprite, 0, 0, image.width, image.height);
      return image;
    });
  }
  return images;
}

function houseSize(styleId) {
  const rows = VICTORIAN_HOUSE_STYLES[styleId];
  return { width: rows[0].length * HOUSE_SCALE, height: rows.length * HOUSE_SCALE };
}

// Small seeded random generator (mulberry32), so placement is the same every load.
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickWeighted(random, weights) {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = random() * total;
  for (const [value, weight] of weights) {
    roll -= weight;
    if (roll < 0) return value;
  }
  return weights[weights.length - 1][0];
}

// --- Geometry -------------------------------------------------------------------
// A house is an oriented box: centre, half sizes and its own x axis (along the front)
// and y axis (from the back of the house towards the front door).

function createBox(centerX, centerY, width, height, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const box = { centerX, centerY, halfWidth: width / 2, halfHeight: height / 2, angle, cos, sin };
  const extentX = Math.abs(cos) * box.halfWidth + Math.abs(sin) * box.halfHeight;
  const extentY = Math.abs(sin) * box.halfWidth + Math.abs(cos) * box.halfHeight;
  box.bounds = { x: centerX - extentX, y: centerY - extentY, width: extentX * 2, height: extentY * 2 };
  box.corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => [
    centerX + cos * sx * box.halfWidth - sin * sy * box.halfHeight,
    centerY + sin * sx * box.halfWidth + cos * sy * box.halfHeight,
  ]);
  return box;
}

function rectFromBounds({ x, y, width, height }) {
  return createBox(x + width / 2, y + height / 2, width, height, 0);
}

function rectsOverlap(a, b, gap = 0) {
  return a.x < b.x + b.width + gap && b.x < a.x + a.width + gap
    && a.y < b.y + b.height + gap && b.y < a.y + a.height + gap;
}

// Separating-axis test for two oriented boxes, each grown by half the gap.
function boxesOverlap(a, b, gap) {
  const dx = b.centerX - a.centerX;
  const dy = b.centerY - a.centerY;
  const axes = [[a.cos, a.sin], [-a.sin, a.cos], [b.cos, b.sin], [-b.sin, b.cos]];
  const radius = (box, [ax, ay]) => (box.halfWidth + gap / 2) * Math.abs(ax * box.cos + ay * box.sin)
    + (box.halfHeight + gap / 2) * Math.abs(-ax * box.sin + ay * box.cos);
  return axes.every((axis) => Math.abs(dx * axis[0] + dy * axis[1]) <= radius(a, axis) + radius(b, axis));
}

function pointToRectDistance(px, py, rect) {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.width));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.height));
  return Math.hypot(dx, dy);
}

function pointToSegmentDistance(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const lengthSquared = abx * abx + aby * aby;
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / lengthSquared));
  return Math.hypot(px - (ax + t * abx), py - (ay + t * aby));
}

// Whether the segment passes through the rectangle (Liang-Barsky clipping).
function segmentCrossesRect(ax, ay, bx, by, rect) {
  const dx = bx - ax;
  const dy = by - ay;
  let low = 0;
  let high = 1;
  const edges = [
    [-dx, ax - rect.x],
    [dx, rect.x + rect.width - ax],
    [-dy, ay - rect.y],
    [dy, rect.y + rect.height - ay],
  ];
  for (const [p, q] of edges) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) low = Math.max(low, t);
      else high = Math.min(high, t);
      if (low > high) return false;
    }
  }
  return true;
}

function segmentToRectDistance(ax, ay, bx, by, rect) {
  if (segmentCrossesRect(ax, ay, bx, by, rect)) return 0;
  const corners = [
    [rect.x, rect.y],
    [rect.x + rect.width, rect.y],
    [rect.x, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height],
  ];
  return Math.min(
    pointToRectDistance(ax, ay, rect),
    pointToRectDistance(bx, by, rect),
    ...corners.map(([cx, cy]) => pointToSegmentDistance(cx, cy, ax, ay, bx, by)),
  );
}

// Distance from a segment to an oriented box, worked out in the box's own frame.
function segmentToBoxDistance(ax, ay, bx, by, box) {
  const toLocal = (px, py) => {
    const dx = px - box.centerX;
    const dy = py - box.centerY;
    return [dx * box.cos + dy * box.sin, -dx * box.sin + dy * box.cos];
  };
  const [lax, lay] = toLocal(ax, ay);
  const [lbx, lby] = toLocal(bx, by);
  const local = { x: -box.halfWidth, y: -box.halfHeight, width: box.halfWidth * 2, height: box.halfHeight * 2 };
  return segmentToRectDistance(lax, lay, lbx, lby, local);
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

// Paths (streets, the MARTA line) with a padded bounding box for quick rejection.
function preparePath(points, halfWidth) {
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const pad = halfWidth + ROAD_CLEARANCE;
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const bounds = { x: minX, y: minY, width: Math.max(...xs) + pad - minX, height: Math.max(...ys) + pad - minY };
  return { points, halfWidth, bounds };
}

function boxClearsPath(box, path) {
  if (!rectsOverlap(box.bounds, path.bounds)) return true;
  const { points, halfWidth } = path;
  for (let index = 1; index < points.length; index += 1) {
    const [ax, ay] = points[index - 1];
    const [bx, by] = points[index];
    if (segmentToBoxDistance(ax, ay, bx, by, box) < halfWidth + ROAD_CLEARANCE) return false;
  }
  return true;
}

function boxTouchesPark(box, parks) {
  const samples = [...box.corners, [box.centerX, box.centerY]];
  return parks.some((park) => samples.some(([x, y]) => pointInPolygon(x, y, park.points)));
}

// A polyline you can ask for the point and direction at any distance along it.
function createPathWalker(points) {
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [ax, ay] = points[index - 1];
    const [bx, by] = points[index];
    lengths.push(lengths[index - 1] + Math.hypot(bx - ax, by - ay));
  }
  return {
    length: lengths[lengths.length - 1],
    at(distance) {
      let index = 1;
      while (index < points.length - 1 && lengths[index] < distance) index += 1;
      const [ax, ay] = points[index - 1];
      const [bx, by] = points[index];
      const segmentLength = lengths[index] - lengths[index - 1] || 1;
      const t = (distance - lengths[index - 1]) / segmentLength;
      return { x: ax + (bx - ax) * t, y: ay + (by - ay) * t, dirX: (bx - ax) / segmentLength, dirY: (by - ay) / segmentLength };
    },
  };
}

// --- Placement -----------------------------------------------------------------

// Places houses along the streets.
//   roads, parks, world: the scaled map data
//   avoidRects: [{ x, y, width, height }] to keep clear (landmarks, Waffle House lots)
//   avoidPaths: [{ points, width }] to keep clear (the MARTA line)
export function placeNeighborhoodHouses({ roads, parks, world, avoidRects = [], avoidPaths = [] }) {
  const random = createRandom(SEED);
  const images = createHouseImages();
  const roadPaths = roads.map((road) => preparePath(road.points, road.width / 2));
  const otherPaths = avoidPaths.map(({ points, width }) => preparePath(points, width / 2));
  const avoidBoxes = avoidRects.map(rectFromBounds);
  const houses = [];
  // Houses bucketed by map area, so overlap checks only look at near neighbours.
  const grid = new Map();
  const cellsFor = ({ x, y, width, height }) => {
    const keys = [];
    for (let cx = Math.floor(x / GRID_CELL); cx <= Math.floor((x + width) / GRID_CELL); cx += 1) {
      for (let cy = Math.floor(y / GRID_CELL); cy <= Math.floor((y + height) / GRID_CELL); cy += 1) {
        keys.push(`${cx},${cy}`);
      }
    }
    return keys;
  };

  const fits = (box) => {
    const { x, y, width, height } = box.bounds;
    if (x < 0 || y < 0 || x + width > world.width || y + height > world.height) return false;
    for (const key of cellsFor(box.bounds)) {
      for (const house of grid.get(key) ?? []) {
        if (rectsOverlap(box.bounds, house.bounds, HOUSE_GAP) && boxesOverlap(box, house, HOUSE_GAP)) return false;
      }
    }
    return !avoidBoxes.some((avoid) => rectsOverlap(box.bounds, avoid.bounds, HOUSE_GAP) && boxesOverlap(box, avoid, HOUSE_GAP))
      && roadPaths.every((path) => boxClearsPath(box, path))
      && otherPaths.every((path) => boxClearsPath(box, path))
      && !boxTouchesPark(box, parks);
  };

  // A house of this style whose front edge starts at `distance` along the street,
  // set back on one side and turned so its door faces the street.
  const houseAt = (walker, distance, side, roadHalfWidth, styleId) => {
    const { width, height } = houseSize(styleId);
    const { x, y, dirX, dirY } = walker.at(distance + width / 2);
    // Away from the street, on this side.
    const outX = -dirY * side;
    const outY = dirX * side;
    const offset = roadHalfWidth + SETBACK + height / 2;
    // Turn so the house's front (its +y axis) points back towards the street.
    const angle = Math.atan2(outX, -outY);
    return createBox(x + outX * offset, y + outY * offset, width, height, angle);
  };

  // Long streets first, so the main rows claim the corners.
  const houseStreets = roads
    .filter((road) => HOUSE_STREET_TYPES.has(road.type))
    .map((road) => ({ road, walker: createPathWalker(road.points) }))
    .sort((a, b) => b.walker.length - a.walker.length);

  for (const { road, walker } of houseStreets) {
    for (const side of [-1, 1]) {
      let distance = random() * RETRY_STEP;
      while (distance < walker.length) {
        if (random() < EMPTY_LOT_CHANCE) {
          distance += houseSize(FALLBACK_STYLE).width + HOUSE_GAP;
          continue;
        }
        const colorwayIndex = Math.floor(random() * VICTORIAN_HOUSE_COLORWAYS.length);
        const styleId = pickWeighted(random, STYLE_WEIGHTS);
        let placed = null;
        for (const tryStyle of [styleId, FALLBACK_STYLE]) {
          if (distance + houseSize(tryStyle).width > walker.length) continue;
          const box = houseAt(walker, distance, side, road.width / 2, tryStyle);
          if (!fits(box)) continue;
          placed = { ...box, image: images[tryStyle][colorwayIndex], width: houseSize(tryStyle).width };
          break;
        }
        if (!placed) {
          distance += RETRY_STEP;
          continue;
        }
        houses.push(placed);
        for (const key of cellsFor(placed.bounds)) {
          if (!grid.has(key)) grid.set(key, []);
          grid.get(key).push(placed);
        }
        distance += placed.width + HOUSE_GAP;
      }
    }
  }

  return houses;
}

// Draws the houses inside the visible part of the map. `view` is in world pixels.
export function drawNeighborhoodHouses(context, houses, view) {
  const right = view.x + view.width;
  const bottom = view.y + view.height;
  for (const house of houses) {
    const { bounds } = house;
    if (bounds.x > right || bounds.y > bottom
      || bounds.x + bounds.width < view.x || bounds.y + bounds.height < view.y) continue;
    const width = house.halfWidth * 2;
    const height = house.halfHeight * 2;
    context.save();
    if (house.angle === 0) {
      // Upright houses snap to whole pixels and stay perfectly sharp.
      context.imageSmoothingEnabled = false;
      context.drawImage(house.image, Math.round(house.centerX - width / 2), Math.round(house.centerY - height / 2), width, height);
    } else {
      context.imageSmoothingEnabled = true;
      context.translate(house.centerX, house.centerY);
      context.rotate(house.angle);
      context.drawImage(house.image, -width / 2, -height / 2, width, height);
    }
    context.restore();
  }
}
