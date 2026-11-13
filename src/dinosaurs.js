// The dinosaurs that hunt the hero: what each species looks like, how it moves, and how
// many of them each level gets. main.js owns spawning, drawing and the catch check, and
// hands updateDinosaur a `world` describing the hero and what counts as open road.
import { createTRexFrames } from './tRexSprite.js';
import { createVelociraptorFrames } from './velociraptorSprite.js';
import { createAllosaurusFrames } from './allosaurusSprite.js';

// Every speed below is a share of the hero's speed. `round` is how many times the
// species has already appeared in the run (0 the first time), so each return is harder.
// roadRadius is how much of a street's width the body takes up; ringRadius and
// labelOffset place the warning ring and name tag around the sprite.
export const DINOSAUR_SPECIES = {
  // Few, slow and relentless: each one heads straight for the hero from wherever it is.
  tRex: {
    id: 'tRex',
    name: 'T-Rex',
    urlNames: ['trex', 'tyrannosaurus', 'tyrannosaurusrex'],
    createFrames: createTRexFrames,
    spriteScale: 2,
    strideDuration: 0.18,
    roadRadius: 11,
    catchDistance: 31,
    ringRadius: 32,
    labelOffset: 34,
    packSize: 1,
    spacing: 0,
    caughtEyebrow: 'Chomp!',
    caughtTitle: (heroName) => `A T-Rex caught ${heroName}!`,
    getLabel: (dinosaur) => `T-Rex ${dinosaur.id}`,
    getSettings: (round) => ({
      count: Math.min(3 + 2 * round, 10),
      speedRatio: Math.min(0.66 + 0.07 * round, 0.92),
    }),
    describe: ({ count }) => `${count} T-Rexes, slow but relentless`,
    update: updateTRex,
  },
  // Many, small and fast, in packs of three that spawn together. One raptor chases the
  // hero directly while the other two swing out to either side to cut them off.
  velociraptor: {
    id: 'velociraptor',
    name: 'Velociraptor',
    urlNames: ['velociraptor', 'velociraptors', 'raptor', 'raptors'],
    createFrames: createVelociraptorFrames,
    spriteScale: 2,
    strideDuration: 0.11,
    roadRadius: 9,
    catchDistance: 26,
    ringRadius: 24,
    labelOffset: 27,
    packSize: 3,
    spacing: 30, // packmates keep about this far apart instead of stacking up
    caughtEyebrow: 'Ambushed!',
    caughtTitle: (heroName) => `The velociraptor pack caught ${heroName}!`,
    // One tag per pack, on its chaser, so three tags don't pile up.
    getLabel: (dinosaur) => (dinosaur.flankSide === 0 ? `Raptor pack ${dinosaur.pack}` : null),
    getSettings: (round) => {
      const packs = Math.min(2 + round, 5);
      return {
        packs,
        count: packs * 3,
        speedRatio: Math.min(0.8 + 0.04 * round, 0.94), // always a little slower than the hero
      };
    },
    describe: ({ packs }) => `${packs} packs of 3 velociraptors, fast and flanking`,
    update: updateVelociraptor,
  },
  // A mid-sized ambusher. It prowls slowly toward the hero, and once they're in range it
  // rears up (a short warning), charges faster than the hero can run, then has to rest.
  allosaurus: {
    id: 'allosaurus',
    name: 'Allosaurus',
    urlNames: ['allosaurus', 'allosauruses', 'allosaur', 'allo'],
    createFrames: createAllosaurusFrames,
    spriteScale: 2,
    strideDuration: 0.2,
    roadRadius: 11,
    catchDistance: 32,
    ringRadius: 33,
    labelOffset: 34,
    packSize: 1,
    spacing: 0,
    caughtEyebrow: 'Crunch!',
    caughtTitle: (heroName) => `A charging Allosaurus ran ${heroName} down!`,
    getLabel: (dinosaur) => `Allosaurus ${dinosaur.id}`,
    getSettings: (round) => ({
      count: Math.min(3 + round, 8),
      prowlSpeedRatio: Math.min(0.5 + 0.05 * round, 0.7),
      chargeSpeedRatio: Math.min(1.35 + 0.05 * round, 1.55),
      chargeRange: Math.min(300 + 30 * round, 420), // world pixels
      windupSeconds: Math.max(0.5 - 0.05 * round, 0.3),
      chargeSeconds: 1.8,
      tiredSeconds: Math.max(2.6 - 0.3 * round, 1.4),
    }),
    describe: ({ count }) => `${count} Allosauruses that charge when you get close`,
    update: updateAllosaurus,
  },
};

// Levels cycle through the species in this order.
const SPECIES_ORDER = ['tRex', 'velociraptor', 'allosaurus'];
// The storm clock runs a little shorter every level (a share of stormDurationSeconds).
const FIRST_LEVEL_STORM_LENGTH_RATIO = 1.3;
const STORM_LENGTH_RATIO_STEP = 0.05;
const MIN_STORM_LENGTH_RATIO = 0.65;

// What a level is made of: its species, that species' numbers for this round, and the
// storm length. forcedSpeciesId (the ?dinosaur= debug parameter) overrides the rotation.
export function getLevelSettings(level, forcedSpeciesId = null) {
  const speciesId = forcedSpeciesId ?? SPECIES_ORDER[(level - 1) % SPECIES_ORDER.length];
  const species = DINOSAUR_SPECIES[speciesId];
  const round = Math.floor((level - 1) / SPECIES_ORDER.length);
  return {
    species,
    ...species.getSettings(round),
    stormLengthRatio: Math.max(
      FIRST_LEVEL_STORM_LENGTH_RATIO - STORM_LENGTH_RATIO_STEP * (level - 1),
      MIN_STORM_LENGTH_RATIO,
    ),
  };
}

// "Level 2: 2 packs of 3 velociraptors, fast and flanking"
export function describeLevel(level, forcedSpeciesId = null) {
  const settings = getLevelSettings(level, forcedSpeciesId);
  return `Level ${level}: ${settings.species.describe(settings)}`;
}

// Matches a ?dinosaur= value such as "velociraptor", "raptor", "T-Rex" or "allosaurus".
// Returns the species id, or null if it isn't one.
export function findSpeciesIdByUrlName(value) {
  const wanted = (value ?? '').toLowerCase().replace(/[^a-z]/g, '');
  if (!wanted) return null;
  const match = Object.values(DINOSAUR_SPECIES).find((species) => species.urlNames.includes(wanted));
  return match ? match.id : null;
}

// A raptor's place in its pack by spawn order: the chaser, then the two flankers.
const PACK_FLANK_SIDES = [0, -1, 1];

export function createDinosaur(species, id, point, { pack = id, packIndex = 0 } = {}) {
  return {
    id,
    species,
    pack,
    flankSide: PACK_FLANK_SIDES[packIndex % PACK_FLANK_SIDES.length],
    x: point.x,
    y: point.y,
    heading: Math.random() * Math.PI * 2,
    // Only the Allosaurus changes state: prowl, windup, charge, tired.
    state: 'prowl',
    stateTime: 0,
    facing: 1,
    isMoving: false,
    walkTime: 0,
  };
}

// Moves one dinosaur for this frame. world: { hero: { x, y, headingX, headingY },
// heroSpeed, settings (the level's), dinosaurs (all of them), canOccupy(x, y, radius),
// isInBlockingWater(x, y, radius) }.
export function updateDinosaur(dinosaur, deltaTime, world) {
  dinosaur.species.update(dinosaur, deltaTime, world);
}

function updateTRex(dinosaur, deltaTime, world) {
  const { hero } = world;
  stepToward(dinosaur, hero.x, hero.y, world.heroSpeed * world.settings.speedRatio * deltaTime, world);
}

// A pack travels in a line behind its chaser until it nears the hero. Then the two
// flankers aim ahead of the hero and out to one side, widest at
// RAPTOR_FLANK_PEAK_DISTANCE, and slide back onto the hero as they close in, so they
// finish the attack rather than circling.
const RAPTOR_FLANK_LEAD = 130;
const RAPTOR_FLANK_SPREAD = 200;
const RAPTOR_FLANK_START_DISTANCE = 800; // farther than this: follow the chaser
const RAPTOR_FLANK_PEAK_DISTANCE = 450;
const RAPTOR_CLOSE_IN_DISTANCE = 170; // this close: straight at the hero
const RAPTOR_FOLLOW_GAP = 36; // how far behind the chaser a follower settles

function updateVelociraptor(dinosaur, deltaTime, world) {
  const { hero } = world;
  const stepDistance = world.heroSpeed * world.settings.speedRatio * deltaTime;
  const distance = Math.hypot(hero.x - dinosaur.x, hero.y - dinosaur.y);
  const chaser = dinosaur.flankSide === 0
    ? dinosaur
    : world.dinosaurs.find((other) => other.pack === dinosaur.pack && other.flankSide === 0);

  if (chaser === dinosaur || !chaser) {
    stepToward(dinosaur, hero.x, hero.y, stepDistance, world);
    return;
  }

  if (distance > RAPTOR_FLANK_START_DISTANCE) {
    // Greedy pursuit can send two raptors opposite ways round a block, so far from the
    // hero the flankers trail their chaser instead of choosing their own route.
    // The second flanker follows the first, so the pack runs in single file.
    const ahead = (dinosaur.flankSide === 1
      && world.dinosaurs.find((other) => other.pack === dinosaur.pack && other.flankSide === -1))
      || chaser;
    const gap = Math.hypot(ahead.x - dinosaur.x, ahead.y - dinosaur.y);
    if (gap > RAPTOR_FOLLOW_GAP) stepToward(dinosaur, ahead.x, ahead.y, Math.min(stepDistance, gap), world);
    return;
  }

  const wideness = clamp(
    distance > RAPTOR_FLANK_PEAK_DISTANCE
      ? (RAPTOR_FLANK_START_DISTANCE - distance) / (RAPTOR_FLANK_START_DISTANCE - RAPTOR_FLANK_PEAK_DISTANCE)
      : (distance - RAPTOR_CLOSE_IN_DISTANCE) / (RAPTOR_FLANK_PEAK_DISTANCE - RAPTOR_CLOSE_IN_DISTANCE),
    0,
    1,
  );
  const lead = RAPTOR_FLANK_LEAD * wideness;
  const spread = RAPTOR_FLANK_SPREAD * wideness * dinosaur.flankSide;
  stepToward(
    dinosaur,
    hero.x + hero.headingX * lead - hero.headingY * spread,
    hero.y + hero.headingY * lead + hero.headingX * spread,
    stepDistance,
    world,
  );
}

function updateAllosaurus(dinosaur, deltaTime, world) {
  const { hero, settings } = world;
  dinosaur.stateTime += deltaTime;

  if (dinosaur.state === 'windup') {
    // Rearing up: stands still facing the hero, which is the player's cue to run.
    dinosaur.facing = hero.x < dinosaur.x ? -1 : 1;
    if (dinosaur.stateTime >= settings.windupSeconds) setState(dinosaur, 'charge');
  } else if (dinosaur.state === 'charge') {
    stepToward(dinosaur, hero.x, hero.y, world.heroSpeed * settings.chargeSpeedRatio * deltaTime, world);
    if (dinosaur.stateTime >= settings.chargeSeconds) setState(dinosaur, 'tired');
  } else if (dinosaur.state === 'tired') {
    if (dinosaur.stateTime >= settings.tiredSeconds) setState(dinosaur, 'prowl');
  } else if (Math.hypot(hero.x - dinosaur.x, hero.y - dinosaur.y) <= settings.chargeRange) {
    setState(dinosaur, 'windup');
  } else {
    stepToward(dinosaur, hero.x, hero.y, world.heroSpeed * settings.prowlSpeedRatio * deltaTime, world);
  }
}

function setState(dinosaur, state) {
  dinosaur.state = state;
  dinosaur.stateTime = 0;
}

const HEADING_COUNT = 24;
const HEADING_STEP = Math.PI / 12;
const TURNING_COST = 1.5; // per radian away from the current heading
const CROWDING_COST = 0.5; // per pixel inside a packmate's spacing
// Scratch space for stepToward, reused every call.
const candidateX = new Float64Array(HEADING_COUNT);
const candidateY = new Float64Array(HEADING_COUNT);
const candidateAngle = new Float64Array(HEADING_COUNT);
const candidateScore = new Float64Array(HEADING_COUNT);

// Takes one step of `distance` toward a target point. There's no route-finding: of 24
// headings fanned out from the direct line, the open one that ends nearest the target
// wins. A small cost for turning keeps a dinosaur sliding the same way along a wall
// instead of jittering, and pack hunters are nudged apart. It won't wade into water
// that blocks it, but can always walk out.
function stepToward(dinosaur, targetX, targetY, distance, world) {
  const { roadRadius, spacing } = dinosaur.species;
  const desiredAngle = Math.atan2(targetY - dinosaur.y, targetX - dinosaur.x);

  for (let index = 0; index < HEADING_COUNT; index += 1) {
    // The direct line first, then alternating left and right, wider each time.
    const direction = index === 0 ? 0 : (index % 2 === 0 ? -1 : 1);
    const angle = desiredAngle + Math.ceil(index / 2) * HEADING_STEP * direction;
    const x = dinosaur.x + Math.cos(angle) * distance;
    const y = dinosaur.y + Math.sin(angle) * distance;
    candidateX[index] = x;
    candidateY[index] = y;
    candidateAngle[index] = angle;
    candidateScore[index] = Math.hypot(targetX - x, targetY - y)
      + angleDifference(angle, dinosaur.heading) * TURNING_COST
      + (spacing > 0 ? getCrowding(dinosaur, x, y, spacing, world.dinosaurs) * CROWDING_COST : 0);
  }

  // Checking whether a spot is open road is the slow part, so try spots best-first and
  // stop at the first open one.
  const startsInWater = world.isInBlockingWater(dinosaur.x, dinosaur.y, roadRadius);
  for (let attempt = 0; attempt < HEADING_COUNT; attempt += 1) {
    let best = 0;
    for (let index = 1; index < HEADING_COUNT; index += 1) {
      if (candidateScore[index] < candidateScore[best]) best = index;
    }
    if (candidateScore[best] === Infinity) return;

    const x = candidateX[best];
    const y = candidateY[best];
    const isOpen = world.canOccupy(x, y, roadRadius)
      && (startsInWater || !world.isInBlockingWater(x, y, roadRadius));
    if (isOpen) {
      dinosaur.x = x;
      dinosaur.y = y;
      dinosaur.heading = candidateAngle[best];
      return;
    }
    candidateScore[best] = Infinity;
  }
}

// How far a spot intrudes on the personal space of the rest of the dinosaur's pack.
function getCrowding(dinosaur, x, y, spacing, dinosaurs) {
  let crowding = 0;
  for (const other of dinosaurs) {
    if (other === dinosaur || other.pack !== dinosaur.pack) continue;
    const gap = Math.hypot(x - other.x, y - other.y);
    if (gap < spacing) crowding += spacing - gap;
  }
  return crowding;
}

function angleDifference(first, second) {
  return Math.abs(Math.atan2(Math.sin(first - second), Math.cos(first - second)));
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}
