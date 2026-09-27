// Decorative MARTA trains running on an elevated track across the map. Nothing here
// touches gameplay: the track is not a road, and trains never collide with anything.
//
// The line comes from martaLine.js as one west-to-east centreline. Two tracks run either
// side of it, and trains keep right: eastbound on the south track, westbound on the north.

const DECK_WIDTH = 34;
const TRACK_OFFSET = 8; // each track's distance from the centreline
const RAIL_OFFSET = 2.5; // each rail's distance from its track's centre
const SHADOW_OFFSET = { x: 9, y: 13 }; // how far the raised deck's shadow falls
const PILLAR_SPACING = 120;

const CAR_LENGTH = 46;
const CAR_WIDTH = 13;
const CAR_GAP = 4;
const MIN_CARS = 4;
const MAX_CARS = 6;
const TRAIN_SPEED = 280;
// Seconds between departures in each direction; the first comes sooner so it's seen early.
const DEPARTURE_MIN = 15;
const DEPARTURE_MAX = 30;
const FIRST_DEPARTURE_MAX = 8;

const randomBetween = (minimum, maximum) => minimum + Math.random() * (maximum - minimum);

function buildPath(points) {
  const lengths = [0];
  for (let index = 1; index < points.length; index += 1) {
    const [ax, ay] = points[index - 1];
    const [bx, by] = points[index];
    lengths.push(lengths[index - 1] + Math.hypot(bx - ax, by - ay));
  }
  return { points, lengths, total: lengths.at(-1) };
}

// Point at a distance along the path. Distances past either end carry on in a straight
// line, so trains can sit wholly off the line while entering and leaving.
function pointAt(path, distance) {
  const { points, lengths, total } = path;
  let index = 1;
  if (distance >= total) index = points.length - 1;
  else if (distance > 0) while (lengths[index] < distance) index += 1;

  const [ax, ay] = points[index - 1];
  const [bx, by] = points[index];
  const segment = lengths[index] - lengths[index - 1] || 1;
  const progress = (distance - lengths[index - 1]) / segment;
  return { x: ax + (bx - ax) * progress, y: ay + (by - ay) * progress };
}

// Shifts a polyline sideways; positive offsets move it to the right of travel.
function offsetPolyline(points, offset) {
  const normals = points.slice(0, -1).map(([ax, ay], index) => {
    const [bx, by] = points[index + 1];
    const length = Math.hypot(bx - ax, by - ay) || 1;
    return [-(by - ay) / length, (bx - ax) / length];
  });

  return points.map(([x, y], index) => {
    const before = normals[Math.max(0, index - 1)];
    const after = normals[Math.min(normals.length - 1, index)];
    const nx = before[0] + after[0];
    const ny = before[1] + after[1];
    const length = Math.hypot(nx, ny) || 1;
    // Scale up at bends so both straight runs keep the full offset.
    const miter = Math.min(2, 2 / (length || 1));
    return [x + (nx / length) * offset * miter, y + (ny / length) * offset * miter];
  });
}

function placePillars(points) {
  const centreline = buildPath(points);
  const pillars = [];
  for (let distance = PILLAR_SPACING / 2; distance < centreline.total; distance += PILLAR_SPACING) {
    pillars.push(pointAt(centreline, distance));
  }
  return pillars;
}

function createTrack(points) {
  return {
    path: buildPath(points),
    rails: [offsetPolyline(points, -RAIL_OFFSET), offsetPolyline(points, RAIL_OFFSET)],
    departureTimer: randomBetween(0, FIRST_DEPARTURE_MAX),
  };
}

export function createMarta(line) {
  const westToEast = line.points;
  const eastToWest = [...westToEast].reverse();
  return {
    centreline: westToEast,
    pillars: placePillars(westToEast),
    tracks: [
      createTrack(offsetPolyline(westToEast, TRACK_OFFSET)),
      createTrack(offsetPolyline(eastToWest, TRACK_OFFSET)),
    ],
    trains: [],
  };
}

export function updateMarta(marta, deltaTime) {
  for (const track of marta.tracks) {
    track.departureTimer -= deltaTime;
    if (track.departureTimer > 0) continue;
    track.departureTimer = randomBetween(DEPARTURE_MIN, DEPARTURE_MAX);
    const carCount = MIN_CARS + Math.floor(Math.random() * (MAX_CARS - MIN_CARS + 1));
    marta.trains.push({ track, carCount, headDistance: 0 });
  }

  for (const train of marta.trains) train.headDistance += TRAIN_SPEED * deltaTime;
  marta.trains = marta.trains.filter(
    (train) => train.headDistance - train.carCount * (CAR_LENGTH + CAR_GAP) < train.track.path.total,
  );
}

function tracePolyline(context, points) {
  context.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
}

function strokePolyline(context, points, strokeStyle, lineWidth) {
  tracePolyline(context, points);
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.stroke();
}

export function drawMartaTracks(context, marta) {
  context.save();
  context.lineJoin = 'round';
  context.lineCap = 'butt';

  // The deck's shadow on the ground, then the pillars holding it up.
  context.save();
  context.translate(SHADOW_OFFSET.x, SHADOW_OFFSET.y);
  strokePolyline(context, marta.centreline, 'rgba(20, 30, 25, 0.22)', DECK_WIDTH);
  context.restore();

  context.strokeStyle = '#8c877d';
  context.lineWidth = 10;
  for (const { x, y } of marta.pillars) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + SHADOW_OFFSET.x, y + SHADOW_OFFSET.y);
    context.stroke();
  }

  strokePolyline(context, marta.centreline, '#7d786f', DECK_WIDTH + 4);
  strokePolyline(context, marta.centreline, '#c8c2b5', DECK_WIDTH);

  for (const track of marta.tracks) {
    strokePolyline(context, track.path.points, '#9a9186', 12);
    context.setLineDash([2, 4]);
    strokePolyline(context, track.path.points, '#6f5a45', 11);
    context.setLineDash([]);
    for (const rail of track.rails) strokePolyline(context, rail, '#3f454b', 1.5);
  }

  context.restore();
}

function drawCar(context, front, back, isLead, isLast) {
  const angle = Math.atan2(front.y - back.y, front.x - back.x);
  const halfLength = CAR_LENGTH / 2;
  const halfWidth = CAR_WIDTH / 2;

  context.save();
  context.translate((front.x + back.x) / 2, (front.y + back.y) / 2);
  context.rotate(angle);

  context.fillStyle = 'rgba(20, 30, 25, 0.25)';
  context.fillRect(-halfLength + 2, -halfWidth + 3, CAR_LENGTH, CAR_WIDTH);

  // Silver body with MARTA's orange and blue stripes along its sides.
  context.beginPath();
  context.roundRect(-halfLength, -halfWidth, CAR_LENGTH, CAR_WIDTH, 3);
  context.fillStyle = '#d5d9dd';
  context.fill();
  context.strokeStyle = '#4b5258';
  context.lineWidth = 1.5;
  context.stroke();
  context.fillStyle = '#f08a24';
  context.fillRect(-halfLength + 2, -halfWidth + 1.5, CAR_LENGTH - 4, 1.5);
  context.fillStyle = '#1f5aa6';
  context.fillRect(-halfLength + 2, halfWidth - 3, CAR_LENGTH - 4, 1.5);

  // Roof equipment down the middle.
  context.fillStyle = '#aeb4ba';
  context.fillRect(-halfLength + 6, -1.5, CAR_LENGTH - 12, 3);
  context.fillStyle = '#8f969c';
  context.fillRect(-halfLength + 10, -2.5, 6, 5);
  context.fillRect(halfLength - 16, -2.5, 6, 5);

  if (isLead) {
    context.fillStyle = '#2c3440';
    context.fillRect(halfLength - 4, -halfWidth + 2, 3, CAR_WIDTH - 4);
    context.fillStyle = '#fff3b0';
    context.fillRect(halfLength - 1, -halfWidth + 1.5, 1.5, 2);
    context.fillRect(halfLength - 1, halfWidth - 3.5, 1.5, 2);
  }
  if (isLast) {
    context.fillStyle = '#e0453a';
    context.fillRect(-halfLength - 0.5, -halfWidth + 1.5, 1.5, 2);
    context.fillRect(-halfLength - 0.5, halfWidth - 3.5, 1.5, 2);
  }

  context.restore();
}

// viewport is the visible world rectangle; cars outside it are skipped.
export function drawMartaTrains(context, marta, viewport) {
  const margin = CAR_LENGTH;
  for (const train of marta.trains) {
    for (let car = 0; car < train.carCount; car += 1) {
      const frontDistance = train.headDistance - car * (CAR_LENGTH + CAR_GAP);
      const front = pointAt(train.track.path, frontDistance);
      const back = pointAt(train.track.path, frontDistance - CAR_LENGTH);
      const centreX = (front.x + back.x) / 2;
      const centreY = (front.y + back.y) / 2;
      const visible = centreX > viewport.x - margin && centreX < viewport.x + viewport.width + margin
        && centreY > viewport.y - margin && centreY < viewport.y + viewport.height + margin;
      if (visible) drawCar(context, front, back, car === 0, car === train.carCount - 1);
    }
  }
}
