import '@fontsource/silkscreen/latin-400.css';
import '@fontsource/silkscreen/latin-700.css';
import '@fontsource/vt323/latin-400.css';
import './style.css';
import './diner.css';
import { mapData } from './mapData.js';
import { applyRoadAdjustments } from './mapAdjustments.js';
import { createMayaStateFrames } from './mayaSprite.js';
import { CHARACTERS, findCharacter } from './characters.js';
import { createCharacterPicker } from './characterPicker.js';
import {
  DINOSAUR_SPECIES, createDinosaur, describeLevel, findSpeciesIdByUrlName, getLevelSettings, updateDinosaur,
} from './dinosaurs.js';
import { createSprite, printCheck, setTiles } from './dinerScreens.js';
import { setUpHowToPlay } from './howToPlay.js';
import howToPlayPreviewImage from './howToPlay/find-maya.webp';
import { createWaffleHouseSprite } from './waffleHouseSprite.js';
import { createKrogStreetMarketSprite } from './krogStreetMarketSprite.js';
import { createInmanParkSignSprite } from './inmanParkSignSprite.js';
import { createInmanMotorWorksSprite } from './inmanMotorWorksSprite.js';
import { createMartaStationSprite } from './martaStationSprite.js';
import { createFultonCottonMillSprite } from './fultonCottonMillSprite.js';
import { createKrogTunnelWallSprite } from './krogStreetTunnelSprites.js';
import { ACTIVE_DIFFICULTY, WEATHER_SETTINGS } from './weatherSettings.js';
import { FLOOD_ZONES as SOURCE_FLOOD_ZONES } from './floodZones.js';
import { WAFFLE_HOUSE_SITES } from './waffleHouseSites.js';
import { MAP_SCALE, scaleMapData, scalePoint, scalePoints } from './mapScale.js';
import {
  createRain, drawRain, drawStormTint, getRainIntensity, getTintAlpha, updateRain,
} from './weatherEffects.js';
import { createWeatherTicker } from './weatherTicker.js';
import { createMusic } from './music.js';
import { playSound, setSoundsMuted, unlockSounds } from './sounds.js';
import { MARTA_LINE } from './martaLine.js';
import { BELTLINE } from './beltLine.js';
import { STREETLIGHT_LANTERN_ROWS, createStreetlightSprite } from './streetlightSprite.js';
import { createMarta, drawMartaTracks, drawMartaTrains, updateMarta } from './marta.js';
import { startChaseScene } from './startScene.js';
import { playIntro } from './introScene.js';
import { createHudIcon } from './hudIcons.js';
import { createTouchStick } from './touchStick.js';
import { createSodaTabSprite } from './sodaTabSprite.js';
import { createNeighborhoodCanopy, drawNeighborhoodCanopy } from './neighborhoodCanopy.js';
import { BUILDINGS } from './buildingData.js';
import { fetchRank, fetchTopScores, submitScore } from './leaderboard.js';

// Must run before anything below reads the road geometry. Road tweaks use the
// original coordinates, so they're applied before the map is scaled up.
applyRoadAdjustments(mapData.roads);
scaleMapData(mapData);
const FLOOD_ZONES = SOURCE_FLOOD_ZONES.map((zone) => ({ ...zone, points: scalePoints(zone.points) }));

const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');
const startButton = document.querySelector('#start-button');
const startIntroButton = document.querySelector('#start-intro-button');
const restartButton = document.querySelector('#restart-button');
const pauseButton = document.querySelector('#pause-button');
const musicButton = document.querySelector('#music-button');
const music = createMusic();
const weatherTickerElement = document.querySelector('#weather-ticker');
const weatherTicker = createWeatherTicker({
  root: weatherTickerElement,
  tag: document.querySelector('#weather-ticker-tag'),
  window: document.querySelector('#weather-ticker-window'),
  text: document.querySelector('#weather-ticker-text'),
  announcer: document.querySelector('#weather-announcer'),
});
const statusText = document.querySelector('#game-status');
const rescueStateText = document.querySelector('#rescue-state');
const rescueTag = document.querySelector('#rescue-tag');
const hudStrip = document.querySelector('#hud-strip');
const hudControls = document.querySelector('#hud-controls');
const restartOverlay = document.querySelector('#restart-overlay');
const restartConfirmButton = document.querySelector('#restart-confirm-button');
const restartCancelButton = document.querySelector('#restart-cancel-button');
const waffleCountText = document.querySelector('#waffle-count');
const tabCountText = document.querySelector('#tab-count');
const scoreText = document.querySelector('#score');
const levelText = document.querySelector('#level-number');
const gameOverScoreText = document.querySelector('#game-over-score');
const startTiles = document.querySelector('#start-tiles');
const startLeaderboard = document.querySelector('#start-leaderboard');
const winTiles = document.querySelector('#win-tiles');
const winTitleText = document.querySelector('#win-title');
const winCheck = document.querySelector('#win-check');
const winNextLevelText = document.querySelector('#win-next-level');
const winNextNameText = document.querySelector('#win-next-name');
const winNextDetailText = document.querySelector('#win-next-detail');
const gameOverCheck = document.querySelector('#game-over-check');
const gameOverDinosaurCanvas = document.querySelector('#game-over-dinosaur');
const playAgainButton = document.querySelector('#play-again-button');
const nextLevelButton = document.querySelector('#next-level-button');
const winScoreText = document.querySelector('#win-score');
const gameOverEyebrow = document.querySelector('#game-over-eyebrow');
const gameOverTitle = document.querySelector('#game-over-title');
const winOverlay = document.querySelector('#win-overlay');
const characterOptions = document.querySelector('#character-options');
const gameOverOverlay = document.querySelector('#game-over-overlay');
const pauseOverlay = document.querySelector('#pause-overlay');
const startOverlay = document.querySelector('#start-overlay');
const scoreForm = document.querySelector('#score-form');
const scoreNameInput = document.querySelector('#score-name');
const scoreMessageInput = document.querySelector('#score-message');
const scoreSubmitButton = document.querySelector('#score-submit');
const scoreStatusText = document.querySelector('#score-status');
const gameOverLeaderboard = document.querySelector('#game-over-leaderboard');
const gameOverLeaderboardList = document.querySelector('#game-over-leaderboard-list');
const gameOverLeaderboardNote = document.querySelector('#game-over-leaderboard-note');
const startLeaderboardList = document.querySelector('#start-leaderboard-list');
const startLeaderboardNote = document.querySelector('#start-leaderboard-note');

// The visible slice of the map, in world pixels. It follows the size of the game frame
// (see resizeViewport): one world pixel per CSS pixel, zoomed in on very large screens so
// you never see more than MAX_VIEW_* of the map, and zoomed out on small ones so you
// always see at least MIN_VIEW_*. The MIN sizes apply to the frame's long and short
// sides, so a phone held upright isn't zoomed out to fit 640 pixels across its narrow width.
const viewport = { width: 960, height: 540, worldPerCssPixel: 1 };
const MAX_VIEW_WIDTH = 1600;
const MAX_VIEW_HEIGHT = 1000;
const MIN_VIEW_WIDTH = 640;
const MIN_VIEW_HEIGHT = 400;
// Caps the canvas backing store so a big, high-density screen doesn't redraw ~10M pixels a frame.
const MAX_CANVAS_PIXELS = 4_000_000;
const WORLD_WIDTH = mapData.world.width;
const WORLD_HEIGHT = mapData.world.height;
const PLAYER_RADIUS = 14;
const PLAYER_SPEED = 195;
const PLAYER_SPRITE_SCALE = 2;
const PLAYER_STRIDE_DURATION = 0.16;
const MAYA_RADIUS = 12;
const MAYA_PICKUP_DISTANCE = 34;
const MAYA_FOLLOW_DISTANCE = 50;
const MAYA_FOLLOW_SPEED = 235;
// Spawn spacing, as walking distances along the streets (see planSpawns).
const MAYA_MIN_TREVOR_WALK = 1000 * MAP_SCALE;
const MAYA_MIN_WAFFLE_HOUSE_WALK = 1100 * MAP_SCALE;
const WAFFLE_HOUSE_MIN_TREVOR_WALK = 1200 * MAP_SCALE;
const MAYA_WANDER_SPEED = 48;
const MAYA_WANDER_MIN_TIME = 1.2;
const MAYA_WANDER_MAX_TIME = 3.6;
const MAYA_REST_MIN_TIME = 1.4;
const MAYA_REST_MAX_TIME = 4.2;
const MAYA_ADDRESS_UPDATE_DISTANCE = 90 * MAP_SCALE;
const MAYA_SPRITE_SCALE = 2;
const MAYA_STRIDE_DURATION = 0.14;
// While resting before she's found, Maya either sniffs or sits, looping that pose.
const MAYA_REST_POSE_FRAME_DURATIONS = { sniff: 0.3, sit: 0.4 };
const MAYA_SNIFF_CHANCE = 0.6;
// Where dinosaurs may spawn. Species, counts and speeds live in dinosaurs.js.
const DINOSAUR_MIN_SPAWN_DISTANCE = 950 * MAP_SCALE; // from the hero
const DINOSAUR_MIN_GROUP_DISTANCE = 420 * MAP_SCALE; // between lone dinosaurs or packs
const DINOSAUR_MIN_MAYA_DISTANCE = 500 * MAP_SCALE;
const DINOSAUR_MIN_WAFFLE_HOUSE_DISTANCE = 400 * MAP_SCALE;
const PACK_SPAWN_SPACING = 38; // packmates line up this far apart along their street
// An Allosaurus runs with a quicker stride while it charges.
const CHARGE_STRIDE_SCALE = 0.6;
// Collectibles scattered along the streets. Counts scale with the map because its
// streets get longer.
const PICKUP_TYPES = {
  waffle: { points: 10, count: Math.round(120 * MAP_SCALE) },
  tab: { points: 5, count: Math.round(50 * MAP_SCALE) }, // soda can pull tabs
};
const PICKUP_MIN_SPACING = 150 * MAP_SCALE;
const PICKUP_DISTANCE = 26;
const PICKUP_MIN_START_DISTANCE = 160;
const PICKUP_SAMPLE_SPACING = 40;
const PICKUP_POPUP_DURATION = 0.8;
const WAFFLE_SIZE = 18;
const SODA_TAB_SCALE = 2;
const REACHABILITY_CELL_SIZE = 8;
const WEATHER = WEATHER_SETTINGS[ACTIVE_DIFFICULTY];
// Levels: reaching Waffle House ends the level, and the "Next level" button starts the
// next one on the same map; getting caught ends the run. Each level has one dinosaur
// species and gets harder (see getLevelSettings in dinosaurs.js).
const BEST_SCORE_STORAGE_KEY = 'waffle-rescue-best-score';
const PLAYER_NAME_STORAGE_KEY = 'waffle-rescue-player-name';
// Debug shortcuts in the page address, e.g. ?level=5 or ?dinosaur=velociraptor (or both).
// level is where a run starts; dinosaur puts that species on every level.
const URL_PARAMETERS = new URLSearchParams(window.location.search);
const MAX_START_LEVEL = 99;
const START_LEVEL = clamp(Math.floor(Number(URL_PARAMETERS.get('level'))) || 1, 1, MAX_START_LEVEL);
const FORCED_SPECIES_ID = findSpeciesIdByUrlName(URL_PARAMETERS.get('dinosaur'));
if (URL_PARAMETERS.has('dinosaur') && !FORCED_SPECIES_ID) {
  console.warn(`Unknown ?dinosaur= value. Try: ${Object.keys(DINOSAUR_SPECIES).join(', ')}.`);
}
const STORM_PHASES = [
  { id: 'clear', startsAt: 0 },
  { id: 'cloudy', startsAt: WEATHER.cloudsStartAt },
  {
    id: 'rain',
    startsAt: WEATHER.rainStartsAt,
    tickerLevel: 'alert',
    message: 'Rain moving into Inman Park and Cabbagetown',
  },
  {
    id: 'flooding',
    startsAt: WEATHER.floodWindow[0],
    tickerLevel: 'flood',
    message: 'Heavy rain — flash flooding possible on low-lying streets',
  },
  { id: 'full', startsAt: 1 },
];
const SHOW_DINOSAUR_TRACKERS = false; // debug: edge-of-screen arrows for off-screen dinosaurs
const TRACKER_EDGE_PADDING = 30;
const ROAD_FORGIVENESS = 7;
const ROAD_MAGNET_SPEED = 24;
const ROAD_SLIDE_SEARCH_PADDING = 12;
const ROAD_SLIDE_MIN_ALIGNMENT = 0.16;
const PLAYER_MOVEMENT_SUBSTEP = 3;
// How far from a side street Trevor can be and still get slid into the turn.
const CORNER_ASSIST_RANGE = 32;
const CORNER_ASSIST_MIN_ALIGNMENT = 0.7;
// And how far ahead of him, along its own direction, that side street may begin.
const CORNER_ASSIST_MAX_GAP = 40;
// Glancing off a curb (see findGlancingStep): headings tried, in radians. The limit
// matches ROAD_SLIDE_MIN_ALIGNMENT, so a curb met nearly square-on still stops Trevor.
const GLANCE_TURN_STEP = Math.PI / 18;
const GLANCE_MAX_TURN = (Math.PI / 18) * 8;
const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
const MAJOR_ROAD_TYPES = new Set(['motorway', 'trunk', 'primary', 'secondary', 'tertiary']);
const LABEL_DEDUPLICATION_DISTANCE = 210 * MAP_SCALE;
const KROG_TUNNEL_PATH = scalePoints([
  [1310.1, 1368.5],
  [1316.1, 1382.3],
  [1380.3, 1559.5],
]);
const MAYA_SPAWN_STREETS = [
  'Auburn Avenue',
  'Boulevard',
  'Bradley Street',
  'Carroll Street',
  'Cornelia Street',
  'Daniel Street',
  'DeKalb Avenue',
  'Edgewood Avenue',
  'Euclid Avenue',
  'Flat Shoals Avenue',
  'Howell Street',
  'Kirkwood Avenue',
  'Lake Avenue',
  'Memorial Drive',
  'Moreland Avenue',
  'Pearl Street',
  'Wylie Street',
];

const mayaFrames = createMayaStateFrames();
const heroFrames = Object.fromEntries(CHARACTERS.map((character) => [character.id, character.createFrames()]));
// The hero picked on the start screen, remembered in this browser between visits.
// The key keeps the game's old name ("Waffle Weather Rescue") so heroes already saved in
// players' browsers aren't forgotten.
const CHARACTER_STORAGE_KEY = 'mayas-waffle-weather-rescue:character';
let selectedCharacterId = findCharacter(loadSavedCharacterId()).id;
// Walk frames for every species, keyed by species id.
const dinosaurFrames = Object.fromEntries(
  Object.values(DINOSAUR_SPECIES).map((species) => [species.id, species.createFrames()]),
);
const waffleHouseSprite = createWaffleHouseSprite();
const LANDMARK_SPRITE_SCALE = 2;
// Rotated sprites are drawn with smoothing so their edges don't look jagged. Enlarging them
// pixel-sharp first keeps the pixel art itself crisp under that smoothing.
const ROTATED_SPRITE_UPSCALE = 4;

function upscaleSprite(sprite, factor) {
  const large = document.createElement('canvas');
  large.width = sprite.width * factor;
  large.height = sprite.height * factor;
  const largeContext = large.getContext('2d');
  largeContext.imageSmoothingEnabled = false;
  largeContext.drawImage(sprite, 0, 0, large.width, large.height);
  return large;
}

// Krog Street Tunnel: painted walls line both sides of the road. They're drawn turned to
// follow the road, so the strip is enlarged first like other rotated sprites.
const KROG_TUNNEL_SPRITE_SCALE = 2;
const krogTunnelWallSprite = upscaleSprite(createKrogTunnelWallSprite(), ROTATED_SPRITE_UPSCALE);

// Buildings and signs drawn on the map. x/y is the sprite's centre in original map
// units (scaled below); the streets around each spot are bent to make room (see
// mapAdjustments.js). An optional angle (radians) turns a sprite to line up with a street,
// an optional scale overrides LANDMARK_SPRITE_SCALE, and an optional label is drawn underneath.
const landmarkProps = [
  // Between Krog Street, Lake Avenue and Waddell Street.
  { landmarkName: 'Krog Street Market', sprite: createKrogStreetMarketSprite(), x: 1349, y: 740 },
  // In the triangle north of Euclid Avenue and Edgewood Avenue, inside Druid Circle.
  { landmarkName: null, sprite: createInmanParkSignSprite(), x: 1915, y: 810 },
  // Just north of DeKalb Avenue, beside the elevated MARTA tracks.
  { landmarkName: 'Inman Park/Reynoldstown', sprite: createMartaStationSprite(), x: 2883, y: 574 },
  // Trevor's home, filling the block between Spruce Street, Inman Walk and DeKalb Avenue,
  // turned to line up with DeKalb.
  {
    landmarkName: null,
    sprite: createInmanMotorWorksSprite(),
    x: 1854,
    y: 1174,
    angle: Math.atan2(1211.3 - 1323.6, 2028.9 - 1488.9), // DeKalb between Waddell and Delta Place
  },
  // Cabbagetown, on the mill's real block between Boulevard, Carroll Street and Decatur Street.
  {
    landmarkName: null,
    label: 'Fulton Cotton Mill Lofts',
    sprite: createFultonCottonMillSprite(),
    // The real mill is huge, and so is its block.
    scale: 3,
    x: 470,
    y: 1890,
  },
].map((prop) => {
  const [x, y] = scalePoint([prop.x, prop.y]);
  const smoothSprite = prop.angle ? upscaleSprite(prop.sprite, ROTATED_SPRITE_UPSCALE) : null;
  return { ...prop, x, y, angle: prop.angle ?? 0, scale: prop.scale ?? LANDMARK_SPRITE_SCALE, smoothSprite };
});
const camera = { x: 0, y: 0 };
const previousCamera = { x: 0, y: 0 };
const rain = createRain(viewport.width, viewport.height);
// Decorative elevated MARTA line with passing trains; it never affects movement.
const marta = createMarta({ ...MARTA_LINE, points: scalePoints(MARTA_LINE.points) });
// The hero can roam this middle part of the screen before the camera follows.
const CAMERA_DEAD_ZONE = { left: 0.3, right: 0.7, top: 0.28, bottom: 0.72 };
// Laptop screens are short, so a fraction of the height leaves little warning above or
// below. The camera always keeps at least this much map (world pixels) visible ahead of
// the hero, up to just under half the visible height.
const CAMERA_MIN_LOOKAHEAD = 280;
// Keeps the hero this far (world pixels) from the HUD that floats over the map's corners.
const HUD_CLEARANCE = 24;
// The areas the corner HUD covers, in viewport pixels: { left, right, top, bottom } each.
// Measured on resize and whenever the HUD changes size.
let hudRects = [];
const pressedKeys = new Set();
let previousFrameTime = performance.now();
let gameState;
let playerTrail = [];
let isPaused = false;
let hasStarted = false;
let shouldResetOnStart = false;

function closestPointOnSegment(x, y, start, end) {
  const segmentX = end[0] - start[0];
  const segmentY = end[1] - start[1];
  const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;

  if (segmentLengthSquared === 0) {
    return { x: start[0], y: start[1] };
  }

  const progress = Math.max(
    0,
    Math.min(1, ((x - start[0]) * segmentX + (y - start[1]) * segmentY) / segmentLengthSquared),
  );

  return {
    x: start[0] + segmentX * progress,
    y: start[1] + segmentY * progress,
  };
}

function findNearestRoadPoint(x, y) {
  let nearest = null;

  for (const road of mapData.roads) {
    for (let index = 1; index < road.points.length; index += 1) {
      const point = closestPointOnSegment(x, y, road.points[index - 1], road.points[index]);
      const distance = Math.hypot(x - point.x, y - point.y);

      if (!nearest || distance < nearest.distance) {
        nearest = {
          ...point,
          distance,
          road,
          segmentStart: road.points[index - 1],
          segmentEnd: road.points[index],
        };
      }
    }
  }

  return nearest;
}

// Trevor starts at home: on Spruce Street outside Inman Motor Works, between Inman Walk
// and DeKalb Avenue (original map units).
const [homeX, homeY] = scalePoint([1692, 1200]);
const startingRoadPoint = findNearestRoadPoint(homeX, homeY);
const WAFFLE_HOUSE_WIDTH = 148;
const WAFFLE_HOUSE_HEIGHT = 78;
// Storm tint strength at which Waffle House's glow reaches full brightness (the tint's max).
const WAFFLE_HOUSE_FULL_GLOW_TINT = 0.32;
// How far from the driveway's centreline the hero can walk.
const WAFFLE_HOUSE_DRIVEWAY_REACH = 17;
const WAFFLE_HOUSE_MAX_DRIVEWAY_LENGTH = 140;
// This game's Waffle House, picked from waffleHouseSites by resetGameState. It is null
// while the map loads, so the road-only reachability grid never includes a driveway.
let waffleHouse = null;

// Flood-fills the walkable streets from Trevor's start so pickups never land on
// disconnected roads (e.g. Freedom Parkway) that he has no way to reach.
const GRID_NEIGHBORS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
// The same neighbors as flat arrays, for the hot loop in canFloodSafely.
const GRID_NEIGHBOR_COLUMN_STEPS = GRID_NEIGHBORS.map(([columnStep]) => columnStep);
const GRID_NEIGHBOR_ROW_STEPS = GRID_NEIGHBORS.map(([, rowStep]) => rowStep);

function buildReachabilityGrid() {
  const columns = Math.ceil(WORLD_WIDTH / REACHABILITY_CELL_SIZE);
  const rows = Math.ceil(WORLD_HEIGHT / REACHABILITY_CELL_SIZE);
  const reachable = new Uint8Array(columns * rows);
  const visited = new Uint8Array(columns * rows);
  const startColumn = Math.floor(startingRoadPoint.x / REACHABILITY_CELL_SIZE);
  const startRow = Math.floor(startingRoadPoint.y / REACHABILITY_CELL_SIZE);
  const queue = [[startColumn, startRow]];

  visited[startRow * columns + startColumn] = 1;
  reachable[startRow * columns + startColumn] = 1;

  while (queue.length > 0) {
    const [column, row] = queue.pop();
    for (const [columnStep, rowStep] of GRID_NEIGHBORS) {
      const nextColumn = column + columnStep;
      const nextRow = row + rowStep;
      if (nextColumn < 0 || nextRow < 0 || nextColumn >= columns || nextRow >= rows) continue;

      const index = nextRow * columns + nextColumn;
      if (visited[index]) continue;
      visited[index] = 1;

      const x = (nextColumn + 0.5) * REACHABILITY_CELL_SIZE;
      const y = (nextRow + 0.5) * REACHABILITY_CELL_SIZE;
      if (!canPlayerOccupy(x, y)) continue;
      reachable[index] = 1;
      queue.push([nextColumn, nextRow]);
    }
  }

  return { columns, rows, reachable };
}

// Streets only. Each game adds its Waffle House driveway on top (see placeWaffleHouse).
const roadReachabilityGrid = buildReachabilityGrid();
let reachabilityGrid = roadReachabilityGrid;

function isReachable(x, y) {
  const column = Math.floor(x / REACHABILITY_CELL_SIZE);
  const row = Math.floor(y / REACHABILITY_CELL_SIZE);
  return roadReachabilityGrid.reachable[row * roadReachabilityGrid.columns + column] === 1;
}

function buildPickupSpawnPoints() {
  const points = [];
  for (const road of mapData.roads) {
    const length = getPathLength(road.points);
    for (let distance = PICKUP_SAMPLE_SPACING / 2; distance < length; distance += PICKUP_SAMPLE_SPACING) {
      const { x, y } = getPointAlongPath(road.points, distance);
      const distanceFromStart = Math.hypot(x - startingRoadPoint.x, y - startingRoadPoint.y);
      if (distanceFromStart < PICKUP_MIN_START_DISTANCE) continue;
      if (!canPlayerOccupy(x, y) || !isReachable(x, y)) continue;
      points.push({ x, y });
    }
  }
  return points;
}

const pickupSpawnPoints = buildPickupSpawnPoints();

// A site's building footprint and driveway. The door is at the bottom centre, joined
// to the nearest point on its street.
function createWaffleHouse(site) {
  const [centerX, centerY] = scalePoint([site.x, site.y]);
  const x = centerX - WAFFLE_HOUSE_WIDTH / 2;
  const y = centerY - WAFFLE_HOUSE_HEIGHT / 2;
  const entranceY = y + WAFFLE_HOUSE_HEIGHT;
  const roadPoint = findNearestRoadPoint(centerX, entranceY);
  return Object.freeze({
    id: site.id,
    street: site.street,
    road: roadPoint.road,
    address: makeStreetAddress(roadPoint.road.name, centerX, centerY),
    x,
    y,
    width: WAFFLE_HOUSE_WIDTH,
    height: WAFFLE_HOUSE_HEIGHT,
    centerX,
    centerY,
    entranceX: centerX,
    entranceY,
    roadX: roadPoint.x,
    roadY: roadPoint.y,
    accessPath: [[roadPoint.x, roadPoint.y], [centerX, entranceY], [centerX, centerY]],
  });
}

// Shortest distance from a rectangle ({ x, y, width, height }) to a polyline, sampled
// every few pixels. Only used at load, so it favours simplicity over speed.
function distanceFromRectToPath(rect, points) {
  let nearest = Infinity;
  for (let index = 1; index < points.length; index += 1) {
    const [startX, startY] = points[index - 1];
    const [endX, endY] = points[index];
    const steps = Math.max(1, Math.ceil(Math.hypot(endX - startX, endY - startY) / 4));
    for (let step = 0; step <= steps; step += 1) {
      const x = startX + ((endX - startX) * step) / steps;
      const y = startY + ((endY - startY) * step) / steps;
      const deltaX = Math.max(rect.x - x, 0, x - (rect.x + rect.width));
      const deltaY = Math.max(rect.y - y, 0, y - (rect.y + rect.height));
      nearest = Math.min(nearest, Math.hypot(deltaX, deltaY));
    }
  }
  return nearest;
}

// Why a site doesn't fit the current map, or null if it does. The building and
// driveway are walkable, so touching another street would open a shortcut round the
// floods; a flooded driveway would lock the door.
function findWaffleHouseSiteProblem(house) {
  const [driveStartX, driveStartY] = house.accessPath[0];
  const driveLength = Math.hypot(house.entranceX - driveStartX, house.entranceY - driveStartY);

  if (house.road.name.replace(/ (Northeast|Southeast)$/, '') !== house.street) {
    return `its door is nearest ${house.road.name}, not ${house.street}`;
  }
  if (house.x < 0 || house.y < 0 || house.x + house.width > WORLD_WIDTH || house.y + house.height > WORLD_HEIGHT) {
    return 'it is off the map';
  }
  if (driveLength > WAFFLE_HOUSE_MAX_DRIVEWAY_LENGTH) return 'its driveway is too long';
  for (const road of mapData.roads) {
    if (distanceFromRectToPath(house, road.points) < road.width / 2 + 8) return `it overlaps ${road.name}`;
    if (road === house.road) continue;
    for (let step = 0; step <= 10; step += 1) {
      const x = driveStartX + ((house.entranceX - driveStartX) * step) / 10;
      const y = driveStartY + ((house.entranceY - driveStartY) * step) / 10;
      const reach = road.width / 2 + WAFFLE_HOUSE_DRIVEWAY_REACH + PLAYER_RADIUS;
      if (distanceToPath(x, y, road.points) < reach) return `its driveway touches ${road.name}`;
    }
  }
  for (const zone of FLOOD_ZONES) {
    if (distanceToPath(driveStartX, driveStartY, zone.points) < zone.width / 2 + 60) {
      return `its driveway is in the ${zone.name} flood zone`;
    }
  }
  if (!isReachable(driveStartX, driveStartY)) return 'its street is cut off from the start';
  return null;
}

const waffleHouseSites = WAFFLE_HOUSE_SITES.map(createWaffleHouse).filter((house) => {
  const problem = findWaffleHouseSiteProblem(house);
  if (problem) console.warn(`Skipping Waffle House site "${house.id}": ${problem}.`);
  return !problem;
});
if (waffleHouseSites.length === 0) throw new Error('No Waffle House site fits the map.');

// Real rooftops under tree canopy fill the blocks. They keep clear of the landmark
// sprites, every Waffle House lot and its driveway, and the MARTA line.
const neighborhoodCanopy = createNeighborhoodCanopy({
  buildings: BUILDINGS,
  roads: mapData.roads,
  parks: mapData.parks,
  world: mapData.world,
  avoidRects: [
    ...landmarkProps.map(({ sprite, x, y, angle, scale }) => {
      const width = sprite.width * scale;
      const height = sprite.height * scale;
      // A turned sprite can reach as far as its half-diagonal in any direction.
      const halfWidth = angle ? Math.hypot(width, height) / 2 : width / 2;
      const halfHeight = angle ? halfWidth : height / 2;
      return { x: x - halfWidth, y: y - halfHeight, width: halfWidth * 2, height: halfHeight * 2 };
    }),
    ...waffleHouseSites.map((house) => {
      const left = Math.min(house.x, house.roadX);
      const top = Math.min(house.y, house.roadY);
      return {
        x: left,
        y: top,
        width: Math.max(house.x + house.width, house.roadX) - left,
        height: Math.max(house.y + house.height, house.roadY) - top,
      };
    }),
  ],
  avoidPaths: [{ points: marta.centreline, width: 70 }],
});
// The cached ground layer is painted at half size and enlarged without smoothing, so its
// pixels are the same 2× blocks as the sprites.
const GROUND_LAYER_PIXEL = 2;
const groundLayer = createGroundLayer();

// Streetlights line the BeltLine, one every STREETLIGHT_SPACING: beside its trails and
// its Wylie Street sidewalk, and along DeKalb Avenue where it shares the street, so the
// whole route reads as one line. They come on as the storm darkens the map (see
// drawStreetlightGlow).
const STREETLIGHT_SPACING = 180;
const STREETLIGHT_SCALE = 2;
// How far past the edge of the paving a light may stand; the first clear spot wins.
const STREETLIGHT_EDGE_GAPS = [8, 16, 26];
// The pool of light each one throws once it's on: how far it reaches, and how strong it
// is at full storm (0 to 1).
const STREETLIGHT_GLOW_RADIUS = 78;
const STREETLIGHT_GLOW_STRENGTH = 0.42;
const streetlightSprite = createStreetlightSprite();
const litStreetlightSprite = createStreetlightSprite({ lit: true });
const streetlightGlowSprite = createStreetlightGlowSprite();
const streetlights = placeStreetlights();

// A soft warm disc, brightest in the middle, drawn over each lit streetlight.
function createStreetlightGlowSprite() {
  const size = STREETLIGHT_GLOW_RADIUS * 2;
  const glowCanvas = document.createElement('canvas');
  glowCanvas.width = size;
  glowCanvas.height = size;
  const glowContext = glowCanvas.getContext('2d');
  const glow = glowContext.createRadialGradient(
    STREETLIGHT_GLOW_RADIUS, STREETLIGHT_GLOW_RADIUS, 4,
    STREETLIGHT_GLOW_RADIUS, STREETLIGHT_GLOW_RADIUS, STREETLIGHT_GLOW_RADIUS,
  );
  glow.addColorStop(0, 'rgba(255, 220, 140, 1)');
  glow.addColorStop(0.45, 'rgba(255, 214, 120, 0.4)');
  glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
  glowContext.fillStyle = glow;
  glowContext.fillRect(0, 0, size, size);
  return glowCanvas;
}

function placeStreetlights() {
  const blockedRects = [
    ...landmarkProps.map(({ sprite, x, y, scale }) => {
      const reach = Math.hypot(sprite.width, sprite.height) * scale / 2;
      return { x: x - reach, y: y - reach, width: reach * 2, height: reach * 2 };
    }),
    ...waffleHouseSites,
  ];
  // Off every street's paving and clear of the tunnel walls, the MARTA line and the
  // buildings that are drawn as sprites.
  const isClear = (x, y) => mapData.roads.every((road) => distanceToPath(x, y, road.points) > road.width / 2 + 6)
    && distanceToPath(x, y, KROG_TUNNEL_PATH) > 48
    && distanceToPath(x, y, marta.centreline) > 34
    && !blockedRects.some((rect) => x > rect.x - 14 && x < rect.x + rect.width + 14
      && y > rect.y - 14 && y < rect.y + rect.height + 50);

  const paths = [
    ...mapData.roads
      .filter((road) => road.type === 'trail' && getPathLength(road.points) > STREETLIGHT_SPACING * 2)
      .map((road) => road.points),
    scalePoints(BELTLINE.shared),
  ];
  const lights = [];
  for (const points of paths) {
    const length = getPathLength(points);
    for (let distance = STREETLIGHT_SPACING / 2, count = 0; distance < length; distance += STREETLIGHT_SPACING, count += 1) {
      const { x, y, angle } = getPointAlongPath(points, distance);
      // The paving here is the trail itself or, on the shared stretch, the street.
      const paving = findNearestRoadPoint(x, y);
      const firstSide = count % 2 === 0 ? 1 : -1; // alternate sides down the path
      const spots = STREETLIGHT_EDGE_GAPS.flatMap((gap) => [firstSide, -firstSide].map((side) => {
        const reach = (paving.road.width / 2 + gap) * side;
        return { x: paving.x - Math.sin(angle) * reach, y: paving.y + Math.cos(angle) * reach };
      }));
      const spot = spots.find((candidate) => isClear(candidate.x, candidate.y));
      if (spot) lights.push(spot);
    }
  }
  // Top to bottom, so a light lower on the screen overlaps one behind it.
  return lights.sort((first, second) => first.y - second.y);
}

// Streets Maya (and the dinosaurs) can spawn on.
const spawnRoads = mapData.roads.filter(
  (road) => MAYA_SPAWN_STREETS.some((prefix) => road.name.startsWith(prefix))
    && getPathLength(road.points) >= 120,
);
const sodaTabSprite = createSodaTabSprite();

const initialGameState = Object.freeze({
  neighborhood: 'Inman Park + Cabbagetown',
  player: Object.freeze({
    name: 'Trevor',
    x: startingRoadPoint.x,
    y: startingRoadPoint.y,
    facing: 1,
    // Unit vector of the hero's last movement; raptor flankers aim ahead of it.
    headingX: 1,
    headingY: 0,
    isMoving: false,
    walkTime: 0,
  }),
  score: 0,
  status: 'playing',
});

function randomBetween(minimum, maximum) {
  return minimum + Math.random() * (maximum - minimum);
}

function makeStreetAddress(roadName, x, y) {
  const addressBlock = Math.abs(Math.floor(x / 90) * 31 + Math.floor(y / 90) * 17) % 400;
  const houseNumber = (addressBlock + 50) * 2;
  return `${houseNumber} ${shortenStreetName(roadName)}`;
}

function createMaya(road, point) {
  return {
    name: 'Maya',
    x: point.x,
    y: point.y,
    roadName: road.name,
    address: makeStreetAddress(road.name, point.x, point.y),
    addressX: point.x,
    addressY: point.y,
    following: false,
    wanderMode: 'resting',
    wanderTimer: randomBetween(MAYA_REST_MIN_TIME, MAYA_REST_MAX_TIME),
    restPose: pickMayaRestPose(),
    restTime: 0,
    wanderHeading: Math.random() * Math.PI * 2,
    facing: 1,
    isMoving: false,
    walkTime: 0,
  };
}

// Walking distance (world pixels) from a point to every street cell, avoiding blocked
// cells; Infinity where it can't be reached. Diagonal steps count as one cell, so it
// runs a little short on diagonal routes, which is fine for spacing spawns.
function measureWalkingDistances(x, y, blocked) {
  const { columns, reachable } = roadReachabilityGrid;
  const cellCount = reachable.length;
  const lastColumn = columns - 1;
  const distances = new Float32Array(cellCount).fill(Infinity);
  const start = findWalkableCell(x, y, roadReachabilityGrid);
  if (start < 0 || blocked?.[start]) return distances;

  const queue = new Int32Array(cellCount);
  let head = 0;
  let tail = 0;
  queue[tail++] = start;
  distances[start] = 0;
  while (head < tail) {
    const index = queue[head++];
    const column = index % columns;
    const nextDistance = distances[index] + REACHABILITY_CELL_SIZE;
    for (let neighbor = 0; neighbor < GRID_NEIGHBOR_COLUMN_STEPS.length; neighbor += 1) {
      const columnStep = GRID_NEIGHBOR_COLUMN_STEPS[neighbor];
      if ((columnStep < 0 && column === 0) || (columnStep > 0 && column === lastColumn)) continue;
      const next = index + GRID_NEIGHBOR_ROW_STEPS[neighbor] * columns + columnStep;
      if (next < 0 || next >= cellCount) continue;
      if (distances[next] !== Infinity || !reachable[next] || blocked?.[next]) continue;
      distances[next] = nextDistance;
      queue[tail++] = next;
    }
  }
  return distances;
}

function walkingDistanceAt(distances, x, y) {
  const cell = findWalkableCell(x, y, roadReachabilityGrid);
  return cell < 0 ? Infinity : distances[cell];
}

// Picks this game's Waffle House and Maya's spot. When floods can turn deep, every
// chosen flood zone is treated as deep, so the hero, Maya and Waffle House stay
// connected however the storm plays out; on top of that, all three are spaced apart by
// walking distance. When nothing
// clears every spacing, the most spread-out option wins. Only if no site survives the
// floods at all (it never should) are the floods ignored.
function planSpawns(floodZones) {
  const blocked = new Uint8Array(roadReachabilityGrid.reachable.length);
  if (WEATHER.floodsTurnDeep) {
    for (const zone of floodZones) {
      for (const cell of getDeepWaterCells(zone)) blocked[cell] = 1;
    }
  }
  const plan = findSpawnPlan(blocked) ?? findSpawnPlan(null);
  if (!plan) throw new Error('Could not place Waffle House and Maya.');
  return plan;
}

function findSpawnPlan(blocked) {
  const fromTrevor = measureWalkingDistances(startingRoadPoint.x, startingRoadPoint.y, blocked);
  const isFarEnough = ({ trevorWalk }) => trevorWalk >= WAFFLE_HOUSE_MIN_TREVOR_WALK;
  const sites = shuffle(waffleHouseSites)
    .map((house) => ({ house, trevorWalk: walkingDistanceAt(fromTrevor, house.roadX, house.roadY) }))
    .filter(({ trevorWalk }) => Number.isFinite(trevorWalk))
    // Sites far enough from the hero first, in random order; the rest only as fallbacks.
    .sort((first, second) => Number(isFarEnough(second)) - Number(isFarEnough(first)));
  let best = null;

  for (const { house, trevorWalk } of sites) {
    const fromWaffleHouse = measureWalkingDistances(house.roadX, house.roadY, blocked);
    const spot = pickMayaSpot(fromTrevor, fromWaffleHouse);
    if (!spot) continue;
    const score = Math.min(trevorWalk / WAFFLE_HOUSE_MIN_TREVOR_WALK, spot.score);
    if (!best || score > best.score) {
      best = { waffleHouse: house, mayaRoad: spot.road, mayaPoint: spot.point, trevorWalk, ...spot.walks, score };
    }
    if (score >= 1) break;
  }
  return best;
}

// Tries random spots on Maya's streets and returns the first spaced out from both the
// hero and Waffle House, or else the best-spaced one that's still reachable.
function pickMayaSpot(fromTrevor, fromWaffleHouse) {
  let best = null;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const road = spawnRoads[Math.floor(Math.random() * spawnRoads.length)];
    const point = getPointAlongPath(road.points, Math.random() * getPathLength(road.points));
    const mayaTrevorWalk = walkingDistanceAt(fromTrevor, point.x, point.y);
    const mayaWaffleHouseWalk = walkingDistanceAt(fromWaffleHouse, point.x, point.y);
    if (!Number.isFinite(mayaTrevorWalk) || !Number.isFinite(mayaWaffleHouseWalk)) continue;

    const score = Math.min(
      mayaTrevorWalk / MAYA_MIN_TREVOR_WALK,
      mayaWaffleHouseWalk / MAYA_MIN_WAFFLE_HOUSE_WALK,
    );
    if (!best || score > best.score) best = { road, point, score, walks: { mayaTrevorWalk, mayaWaffleHouseWalk } };
    if (score >= 1) break;
  }
  return best;
}

// Picks where a lone dinosaur or a pack starts: a random spot on Maya's streets that is
// far from the hero, Maya, Waffle House and the groups already placed. If nothing clears
// every distance, the most spread-out spot tried wins.
function pickDinosaurSpawn(maya, placedGroups) {
  let fallback = null;

  for (let attempt = 0; attempt < 120; attempt += 1) {
    const road = spawnRoads[Math.floor(Math.random() * spawnRoads.length)];
    const distanceAlongRoad = Math.random() * getPathLength(road.points);
    const point = getPointAlongPath(road.points, distanceAlongRoad);
    const distanceFromTrevor = Math.hypot(point.x - startingRoadPoint.x, point.y - startingRoadPoint.y);
    const distanceFromMaya = Math.hypot(point.x - maya.x, point.y - maya.y);
    const distanceFromWaffleHouse = Math.hypot(point.x - waffleHouse.centerX, point.y - waffleHouse.centerY);
    const distanceFromGroups = placedGroups.length === 0
      ? Infinity
      : Math.min(...placedGroups.map((group) => Math.hypot(point.x - group.x, point.y - group.y)));
    const safetyScore = Math.min(distanceFromTrevor, distanceFromMaya, distanceFromWaffleHouse, distanceFromGroups);
    const spawn = { road, distanceAlongRoad, x: point.x, y: point.y, safetyScore };

    if (!fallback || safetyScore > fallback.safetyScore) fallback = spawn;
    if (
      distanceFromTrevor < DINOSAUR_MIN_SPAWN_DISTANCE
      || distanceFromMaya < DINOSAUR_MIN_MAYA_DISTANCE
      || distanceFromWaffleHouse < DINOSAUR_MIN_WAFFLE_HOUSE_DISTANCE
      || distanceFromGroups < DINOSAUR_MIN_GROUP_DISTANCE
    ) continue;

    return spawn;
  }

  return fallback;
}

// Creates the level's dinosaurs. Pack hunters start lined up along one street; loners
// are each a group of one.
function createDinosaurs(maya, { species, count }) {
  const dinosaurs = [];
  const groups = [];

  while (dinosaurs.length < count) {
    const spawn = pickDinosaurSpawn(maya, groups);
    const roadLength = getPathLength(spawn.road.points);
    groups.push(spawn);

    for (let packIndex = 0; packIndex < species.packSize && dinosaurs.length < count; packIndex += 1) {
      const offset = (packIndex - (species.packSize - 1) / 2) * PACK_SPAWN_SPACING;
      const point = getPointAlongPath(spawn.road.points, clamp(spawn.distanceAlongRoad + offset, 0, roadLength));
      dinosaurs.push(createDinosaur(species, dinosaurs.length + 1, point, { pack: groups.length, packIndex }));
    }
  }
  return dinosaurs;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

// Picks this game's flood zones and spreads their start times across the
// flood window, with a little jitter so the rhythm isn't perfectly even.
function createFloodZones() {
  const chosen = shuffle(FLOOD_ZONES).slice(0, WEATHER.floodZoneCount);
  const [windowStart, windowEnd] = WEATHER.floodWindow;
  const spacing = (windowEnd - windowStart) / chosen.length;

  return chosen.map((zone, index) => createFloodZone(
    zone,
    windowStart + spacing * (index + 0.5) + randomBetween(-0.25, 0.25) * spacing,
  ));
}

function createFloodZone(zone, triggerAt) {
  const length = getPathLength(zone.points);
  return {
    ...zone,
    length,
    state: 'dry',
    stateTime: 0,
    triggerAt,
    nextSafetyCheckAt: WEATHER.shallowSeconds,
    puddles: Array.from({ length: Math.max(3, Math.round(length / 45)) }, () => ({
      distance: randomBetween(0.05, 0.95) * length,
      offset: randomBetween(-0.3, 0.3) * zone.width,
      size: randomBetween(0.18, 0.32) * zone.width,
    })),
  };
}

// Scatters waffles and soda tabs across reachable streets, mixed together and kept
// evenly spaced.
function createPickups() {
  const types = shuffle(
    Object.entries(PICKUP_TYPES).flatMap(([type, { count }]) => Array(count).fill(type)),
  );
  const pickups = [];

  for (const point of shuffle(pickupSpawnPoints)) {
    if (pickups.length === types.length) break;
    if (isInsideWaffleHouseAccess(point.x, point.y)) continue;
    const tooClose = pickups.some(
      (pickup) => Math.hypot(point.x - pickup.x, point.y - pickup.y) < PICKUP_MIN_SPACING,
    );
    if (tooClose) continue;
    pickups.push({
      type: types[pickups.length],
      x: point.x,
      y: point.y,
      bobOffset: Math.random() * Math.PI * 2,
    });
  }
  return pickups;
}

// Sets a number on the scoreboard. One that changed pops once (.is-bumped in style.css).
function setHudNumber(numberElement, value) {
  const text = String(value);
  if (numberElement.textContent === text) return;
  numberElement.textContent = text;
  numberElement.classList.remove('is-bumped');
  void numberElement.offsetWidth; // lets the animation start over
  numberElement.classList.add('is-bumped');
}

function updateScorePanel() {
  const { waffle, tab } = gameState.collected;
  setHudNumber(waffleCountText, waffle);
  setHudNumber(tabCountText, tab);
  setHudNumber(scoreText, gameState.score);
  setHudNumber(levelText, gameState.level);
  winScoreText.textContent = `Waffles: ${waffle} · Soda tabs: ${tab} · Score: ${gameState.score}`;
}

function getStormPhase(progress) {
  return STORM_PHASES.reduce((current, phase) => (progress >= phase.startsAt ? phase : current));
}

// The scoreboard gains a "Maya: with you" cell while she follows the hero, and flashes red
// when the run ends.
function updateRescuePanel() {
  const showTag = gameState.maya.following && gameState.status !== 'game-over';
  rescueTag.hidden = !showTag;
  rescueStateText.textContent = gameState.status === 'won' ? 'Safe!' : 'With you';
  hudStrip.classList.toggle('is-danger', gameState.status === 'game-over');
}

// Puts this game's Waffle House on the map: its driveway and building become walkable.
function placeWaffleHouse(house) {
  waffleHouse = house;
  const { columns, rows } = roadReachabilityGrid;
  const reachable = roadReachabilityGrid.reachable.slice();
  const padding = WAFFLE_HOUSE_DRIVEWAY_REACH + REACHABILITY_CELL_SIZE;
  const xs = [house.x, house.x + house.width, house.roadX];
  const ys = [house.y, house.y + house.height, house.roadY];
  const firstColumn = Math.max(0, Math.floor((Math.min(...xs) - padding) / REACHABILITY_CELL_SIZE));
  const lastColumn = Math.min(columns - 1, Math.floor((Math.max(...xs) + padding) / REACHABILITY_CELL_SIZE));
  const firstRow = Math.max(0, Math.floor((Math.min(...ys) - padding) / REACHABILITY_CELL_SIZE));
  const lastRow = Math.min(rows - 1, Math.floor((Math.max(...ys) + padding) / REACHABILITY_CELL_SIZE));

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const x = (column + 0.5) * REACHABILITY_CELL_SIZE;
      const y = (row + 0.5) * REACHABILITY_CELL_SIZE;
      if (isInsideWaffleHouseAccess(x, y)) reachable[row * columns + column] = 1;
    }
  }
  reachabilityGrid = { columns, rows, reachable };
}

// Announced when a level starts: what's hunting the hero, and where Maya was last seen.
function getLevelIntro() {
  return `${describeLevel(gameState.level, FORCED_SPECIES_ID)}. Find Maya at ${gameState.maya.address}`;
}

// Starts a level. A new game starts at level 1 (or the ?level= debug parameter); the next
// level keeps the run's score and tallies. Everything else (Maya, Waffle House, dinosaurs,
// floods, pickups) is re-rolled.
function resetGameState({ level = START_LEVEL, score = 0, collected = { waffle: 0, tab: 0 } } = {}) {
  const levelSettings = getLevelSettings(level, FORCED_SPECIES_ID);
  const floodZones = createFloodZones();
  const spawnPlan = planSpawns(floodZones);
  placeWaffleHouse(spawnPlan.waffleHouse);
  const maya = createMaya(spawnPlan.mayaRoad, spawnPlan.mayaPoint);
  gameState = {
    ...initialGameState,
    player: { ...initialGameState.player, name: findCharacter(selectedCharacterId).name },
    level,
    levelSettings,
    score,
    maya,
    dinosaurs: createDinosaurs(maya, levelSettings),
    pickups: createPickups(),
    collected: { ...collected },
    pickupPopups: [],
    storm: { progress: 0, phase: 'clear', finalSurge: false },
    floodZones,
    tickerRefreshTimer: 0,
  };
  playerTrail = [{ x: gameState.player.x, y: gameState.player.y }];
  camera.x = Math.max(0, gameState.player.x - viewport.width / 2);
  camera.y = Math.max(0, gameState.player.y - viewport.height / 2);
  isPaused = false;
  winOverlay.hidden = true;
  gameOverOverlay.hidden = true;
  pauseOverlay.hidden = true;
  startOverlay.hidden = hasStarted;
  pauseButton.disabled = !hasStarted;
  updatePauseButton();
  statusText.textContent = hasStarted
    ? getLevelIntro()
    : 'Ready — press Start Game to begin.';
  updateRescuePanel();
  updateScorePanel();
  weatherTicker.reset();
}

function tracePath(targetContext, points, closePath = false) {
  if (points.length === 0) return;
  targetContext.beginPath();
  targetContext.moveTo(points[0][0], points[0][1]);
  for (let index = 1; index < points.length; index += 1) {
    targetContext.lineTo(points[index][0], points[index][1]);
  }
  if (closePath) targetContext.closePath();
}

function drawPolygons(targetContext, polygons, fillStyle, strokeStyle) {
  for (const polygon of polygons) {
    tracePath(targetContext, polygon.points, true);
    targetContext.fillStyle = fillStyle;
    targetContext.fill();
    targetContext.strokeStyle = strokeStyle;
    targetContext.lineWidth = 1.5;
    targetContext.stroke();
  }
}

function drawRoads(targetContext) {
  const streets = mapData.roads.filter((road) => road.type !== 'trail');
  const trails = mapData.roads.filter((road) => road.type === 'trail');
  targetContext.save();
  targetContext.lineCap = 'round';
  targetContext.lineJoin = 'round';

  // A separate border pass lets intersections merge into continuous surfaces.
  for (const road of streets) {
    tracePath(targetContext, road.points);
    targetContext.strokeStyle = '#e7e2d7';
    targetContext.lineWidth = road.width + 18;
    targetContext.stroke();
  }

  // The BeltLine goes down before the asphalt, so streets run across it at each crossing.
  drawTrails(targetContext, trails);

  for (const road of streets) {
    tracePath(targetContext, road.points);
    targetContext.strokeStyle = '#69767c';
    targetContext.lineWidth = road.width;
    targetContext.stroke();
  }

  for (const road of streets) {
    if (!['primary', 'secondary', 'tertiary'].includes(road.type)) continue;
    tracePath(targetContext, road.points);
    targetContext.strokeStyle = '#f7e8a0';
    targetContext.lineWidth = 2.5;
    targetContext.setLineDash([18, 15]);
    targetContext.stroke();
  }

  targetContext.restore();
}

// The ground never changes during a game (lawn, parks, rooftops, trees and streets), so
// it's painted once into an image instead of every frame (see GROUND_LAYER_PIXEL).
function createGroundLayer() {
  const layer = document.createElement('canvas');
  layer.width = Math.ceil(WORLD_WIDTH / GROUND_LAYER_PIXEL);
  layer.height = Math.ceil(WORLD_HEIGHT / GROUND_LAYER_PIXEL);
  const layerContext = layer.getContext('2d');
  layerContext.scale(1 / GROUND_LAYER_PIXEL, 1 / GROUND_LAYER_PIXEL);
  layerContext.fillStyle = '#9cc988';
  layerContext.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawPolygons(layerContext, mapData.parks, '#8fd2a2', '#6cb98b');
  drawNeighborhoodCanopy(layerContext, neighborhoodCanopy);
  drawRoads(layerContext);
  return layer;
}

// Copies the visible part of the ground layer. The source starts on a whole layer pixel
// so every block stays crisp while the camera scrolls.
function drawGroundLayer() {
  const left = Math.max(0, Math.floor(camera.x / GROUND_LAYER_PIXEL));
  const top = Math.max(0, Math.floor(camera.y / GROUND_LAYER_PIXEL));
  const width = Math.min(groundLayer.width - left, Math.ceil(viewport.width / GROUND_LAYER_PIXEL) + 2);
  const height = Math.min(groundLayer.height - top, Math.ceil(viewport.height / GROUND_LAYER_PIXEL) + 2);
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    groundLayer,
    left, top, width, height,
    left * GROUND_LAYER_PIXEL, top * GROUND_LAYER_PIXEL, width * GROUND_LAYER_PIXEL, height * GROUND_LAYER_PIXEL,
  );
  context.restore();
}

// The map is seen from above and characters draw over it, so the tunnel has no roof.
// Painted walls line both sides of the road instead, with lights down the middle.
function drawKrogStreetTunnel() {
  const tunnelWidth = 44;
  const pathLength = getPathLength(KROG_TUNNEL_PATH);

  context.save();
  context.lineCap = 'butt';
  context.lineJoin = 'round';

  tracePath(context, KROG_TUNNEL_PATH);
  context.strokeStyle = '#2f3f52';
  context.lineWidth = tunnelWidth;
  context.stroke();

  context.imageSmoothingEnabled = true;
  drawKrogTunnelWalls(tunnelWidth);

  // Warm ceiling lights spaced evenly along the tunnel.
  const lightCount = 4;
  for (let index = 1; index <= lightCount; index += 1) {
    const light = getPointAlongPath(KROG_TUNNEL_PATH, (pathLength * index) / (lightCount + 1));
    context.beginPath();
    context.arc(light.x, light.y, 3.5, 0, Math.PI * 2);
    context.fillStyle = '#fff1a8';
    context.shadowColor = '#ffd45c';
    context.shadowBlur = 9;
    context.fill();
  }
  context.shadowBlur = 0;

  const label = getPointAlongPath(KROG_TUNNEL_PATH, pathLength / 2);
  context.save();
  context.translate(label.x, label.y);
  context.rotate(label.angle);
  context.font = '900 12px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.strokeStyle = 'rgba(22, 28, 40, 0.9)';
  context.lineWidth = 4;
  context.strokeText('KROG TUNNEL', 0, 0);
  context.fillStyle = '#fff7d6';
  context.fillText('KROG TUNNEL', 0, 0);
  context.restore();

  context.restore();
}

// Repeats the painted wall strip along both sides of each stretch of the tunnel road,
// with its shadowed base against the road.
function drawKrogTunnelWalls(tunnelWidth) {
  const tileWidth = (krogTunnelWallSprite.width / ROTATED_SPRITE_UPSCALE) * KROG_TUNNEL_SPRITE_SCALE;
  const tileHeight = (krogTunnelWallSprite.height / ROTATED_SPRITE_UPSCALE) * KROG_TUNNEL_SPRITE_SCALE;
  const sourcePerWorldPixel = krogTunnelWallSprite.width / tileWidth;

  for (let index = 1; index < KROG_TUNNEL_PATH.length; index += 1) {
    const [startX, startY] = KROG_TUNNEL_PATH[index - 1];
    const [endX, endY] = KROG_TUNNEL_PATH[index];
    const length = Math.hypot(endX - startX, endY - startY);

    context.save();
    context.translate(startX, startY);
    context.rotate(Math.atan2(endY - startY, endX - startX));
    for (const side of [-1, 1]) {
      context.save();
      context.scale(1, side);
      for (let offset = 0; offset < length; offset += tileWidth) {
        const width = Math.min(tileWidth, length - offset);
        context.drawImage(
          krogTunnelWallSprite,
          0, 0, width * sourcePerWorldPixel, krogTunnelWallSprite.height,
          offset, -tunnelWidth / 2 - tileHeight, width, tileHeight,
        );
      }
      context.restore();
    }
    context.restore();
  }
}

function shortenStreetName(name) {
  return name
    .replace(/^Dekalb/, 'DeKalb')
    .replace(' Northeast', ' NE')
    .replace(' Southeast', ' SE');
}

function distanceToPolyline(point, points) {
  let nearest = Infinity;
  for (let index = 1; index < points.length; index += 1) {
    const closest = closestPointOnSegment(point.x, point.y, points[index - 1], points[index]);
    nearest = Math.min(nearest, Math.hypot(point.x - closest.x, point.y - closest.y));
  }
  return nearest;
}

function getPathLength(points) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(
      points[index][0] - points[index - 1][0],
      points[index][1] - points[index - 1][1],
    );
  }
  return length;
}

function getPointAlongPath(points, targetDistance) {
  let distanceTravelled = 0;

  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1];
    const end = points[index];
    const deltaX = end[0] - start[0];
    const deltaY = end[1] - start[1];
    const segmentLength = Math.hypot(deltaX, deltaY);

    if (distanceTravelled + segmentLength >= targetDistance) {
      const progress = segmentLength === 0 ? 0 : (targetDistance - distanceTravelled) / segmentLength;
      return {
        x: start[0] + deltaX * progress,
        y: start[1] + deltaY * progress,
        angle: Math.atan2(deltaY, deltaX),
      };
    }

    distanceTravelled += segmentLength;
  }

  const end = points.at(-1);
  const start = points.at(-2) ?? end;
  return { x: end[0], y: end[1], angle: Math.atan2(end[1] - start[1], end[0] - start[0]) };
}

// The BeltLine (roads of type 'trail'): a gray concrete sidewalk with a darker edge and a
// joint across it every few steps, like poured slabs.
function drawTrails(targetContext, trails) {
  targetContext.save();
  for (const [color, extraWidth] of [['#8b9294', 6], ['#bcc1bf', 0]]) {
    for (const trail of trails) {
      tracePath(targetContext, trail.points);
      targetContext.strokeStyle = color;
      targetContext.lineWidth = trail.width + extraWidth;
      targetContext.stroke();
    }
  }
  // A short dash as wide as the path is a line across it.
  targetContext.lineCap = 'butt';
  targetContext.setLineDash([2, 22]);
  for (const trail of trails) {
    tracePath(targetContext, trail.points);
    targetContext.strokeStyle = '#a1a8a7';
    targetContext.lineWidth = trail.width;
    targetContext.stroke();
  }
  targetContext.restore();
}

function buildRoadLabels() {
  const labels = [];
  const positionsByName = new Map();

  for (const road of mapData.roads) {
    if (!road.name) continue;

    const length = getPathLength(road.points);
    if (length < 32) continue;

    const isMajor = MAJOR_ROAD_TYPES.has(road.type);
    const spacing = isMajor ? 420 : 340;
    const distances = [];

    if (length <= spacing) {
      distances.push(length / 2);
    } else {
      for (let distance = spacing / 2; distance < length; distance += spacing) {
        distances.push(distance);
      }
    }

    const displayName = shortenStreetName(road.name);
    const existingPositions = positionsByName.get(displayName) ?? [];

    for (const distance of distances) {
      const position = getPointAlongPath(road.points, distance);
      // The tunnel carries its own name.
      if (distanceToPolyline(position, KROG_TUNNEL_PATH) < 30) continue;
      const isDuplicate = existingPositions.some(
        (existing) => Math.hypot(existing.x - position.x, existing.y - position.y) < LABEL_DEDUPLICATION_DISTANCE,
      );
      if (isDuplicate) continue;

      existingPositions.push(position);
      labels.push({ ...position, name: displayName, isMajor });
    }

    positionsByName.set(displayName, existingPositions);
  }

  return labels;
}

const roadLabels = buildRoadLabels();

function drawRoadLabels() {
  context.save();
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineJoin = 'round';

  for (const label of roadLabels) {
    let angle = label.angle;
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) angle += Math.PI;

    context.save();
    context.translate(label.x, label.y);
    context.rotate(angle);
    context.font = `${label.isMajor ? 750 : 700} ${label.isMajor ? 14 : 12}px system-ui, sans-serif`;
    context.strokeStyle = 'rgba(35, 48, 52, 0.82)';
    context.lineWidth = label.isMajor ? 5 : 4;
    context.strokeText(label.name, 0, 0);
    context.fillStyle = '#f8f5ec';
    context.fillText(label.name, 0, 0);
    context.restore();
  }

  context.restore();
}

function drawLandmarks() {
  context.save();
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (const landmark of mapData.landmarks) {
    // Landmarks with their own sprite already carry a sign.
    if (landmarkProps.some((prop) => prop.landmarkName === landmark.name)) continue;

    context.beginPath();
    context.arc(landmark.x, landmark.y, 9, 0, Math.PI * 2);
    context.fillStyle = landmark.name === 'Springvale Park' ? '#2b8e66' : '#cb5b37';
    context.fill();
    context.strokeStyle = '#fffaf0';
    context.lineWidth = 3;
    context.stroke();

    context.font = '800 18px system-ui, sans-serif';
    context.strokeStyle = 'rgba(248, 245, 236, 0.95)';
    context.lineWidth = 6;
    context.strokeText(landmark.name, landmark.x, landmark.y - 24);
    context.fillStyle = '#25493c';
    context.fillText(landmark.name, landmark.x, landmark.y - 24);
  }

  // Sprites without a painted sign get their name underneath.
  context.font = '800 16px system-ui, sans-serif';
  for (const { label, sprite, x, y, scale } of landmarkProps) {
    if (!label) continue;
    const labelY = y + (sprite.height * scale) / 2 + 14;
    context.strokeStyle = 'rgba(248, 245, 236, 0.95)';
    context.lineWidth = 5;
    context.strokeText(label, x, labelY);
    context.fillStyle = '#25493c';
    context.fillText(label, x, labelY);
  }

  context.restore();
}

function drawWaffleHouse() {
  const destination = waffleHouse;

  tracePath(context, destination.accessPath);
  context.strokeStyle = '#e7e2d7';
  context.lineWidth = 50;
  context.stroke();

  tracePath(context, destination.accessPath);
  context.strokeStyle = '#8f9591';
  context.lineWidth = 34;
  context.stroke();

  context.fillStyle = 'rgba(24, 35, 30, 0.2)';
  context.fillRect(destination.x + 7, destination.y + 8, destination.width, destination.height);

  // The sprite fills the destination footprint exactly, door at the bottom centre.
  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(waffleHouseSprite, destination.x, destination.y, destination.width, destination.height);
  context.restore();
}

// The storm darkens the screen, but Waffle House stays lit like a beacon: it is cut out
// of the tint, and warm light spills onto the ground around it as the sky gets darker.
function drawStormLighting() {
  const destination = waffleHouse;
  const left = destination.x - Math.round(camera.x);
  const top = destination.y - Math.round(camera.y);
  const outsideWaffleHouse = new Path2D();
  outsideWaffleHouse.rect(0, 0, viewport.width, viewport.height);
  outsideWaffleHouse.rect(left, top, destination.width, destination.height);

  context.save();
  context.clip(outsideWaffleHouse, 'evenodd');
  drawStormTint(context, gameState.storm.progress, WEATHER, viewport.width, viewport.height);

  const glowStrength = getTintAlpha(gameState.storm.progress, WEATHER) / WAFFLE_HOUSE_FULL_GLOW_TINT;
  if (glowStrength > 0) {
    const centerX = left + destination.width / 2;
    const centerY = top + destination.height / 2;
    const glow = context.createRadialGradient(centerX, centerY, destination.width * 0.35, centerX, centerY, destination.width * 1.3);
    glow.addColorStop(0, `rgba(255, 214, 120, ${Math.min(1, glowStrength) * 0.3})`);
    glow.addColorStop(1, 'rgba(255, 214, 120, 0)');
    context.globalCompositeOperation = 'lighter';
    context.fillStyle = glow;
    context.fillRect(0, 0, viewport.width, viewport.height);
  }
  context.restore();
  drawStreetlightGlow(Math.min(1, glowStrength));
}

// The BeltLine's streetlights come on as the storm darkens the map, the same way Waffle
// House glows: each lantern turns warm and throws a pool of light onto the path. This is
// drawn over the storm's dark tint, in screen pixels. strength runs from 0 (off) to 1.
function drawStreetlightGlow(strength) {
  if (strength <= 0) return;
  const width = streetlightSprite.width * STREETLIGHT_SCALE;
  const height = streetlightSprite.height * STREETLIGHT_SCALE;
  const lanternHeight = STREETLIGHT_LANTERN_ROWS * STREETLIGHT_SCALE;
  const cameraX = Math.round(camera.x);
  const cameraY = Math.round(camera.y);

  context.save();
  context.imageSmoothingEnabled = false;
  for (const light of streetlights) {
    const x = light.x - cameraX;
    const y = light.y - cameraY;
    const isOnScreen = x > -STREETLIGHT_GLOW_RADIUS && x < viewport.width + STREETLIGHT_GLOW_RADIUS
      && y > -STREETLIGHT_GLOW_RADIUS && y < viewport.height + height + STREETLIGHT_GLOW_RADIUS;
    if (!isOnScreen) continue;

    // Just the lantern, so the post doesn't draw over anyone walking past it.
    context.globalCompositeOperation = 'source-over';
    context.globalAlpha = strength;
    context.drawImage(
      litStreetlightSprite,
      0, 0, litStreetlightSprite.width, STREETLIGHT_LANTERN_ROWS,
      Math.round(x - width / 2), Math.round(y - height), width, lanternHeight,
    );
    // The light, centred between the lantern and the ground so it reaches both.
    context.globalCompositeOperation = 'lighter';
    context.globalAlpha = strength * STREETLIGHT_GLOW_STRENGTH;
    context.drawImage(
      streetlightGlowSprite,
      Math.round(x - STREETLIGHT_GLOW_RADIUS),
      Math.round(y - height * 0.6 - STREETLIGHT_GLOW_RADIUS),
    );
  }
  context.restore();
}

function drawLandmarkProps() {
  context.save();
  context.imageSmoothingEnabled = false;

  for (const { sprite, smoothSprite, x, y, angle, scale } of landmarkProps) {
    const width = sprite.width * scale;
    const height = sprite.height * scale;

    // Work from the sprite's top-left corner. Unrotated sprites snap to whole pixels.
    context.save();
    if (angle) {
      context.translate(x, y);
      context.rotate(angle);
      context.translate(-width / 2, -height / 2);
    } else {
      context.translate(Math.round(x - width / 2), Math.round(y - height / 2));
    }

    context.beginPath();
    context.ellipse(width / 2 + 4, height - 3, width * 0.52, 9, 0, 0, Math.PI * 2);
    context.fillStyle = 'rgba(24, 35, 30, 0.2)';
    context.fill();
    if (angle) {
      context.imageSmoothingEnabled = true;
      context.drawImage(smoothSprite, 0, 0, width, height);
    } else {
      context.drawImage(sprite, 0, 0, width, height);
    }
    context.restore();
  }

  context.restore();
}

// Each streetlight stands with the foot of its post on its spot (see placeStreetlights).
function drawStreetlights() {
  const width = streetlightSprite.width * STREETLIGHT_SCALE;
  const height = streetlightSprite.height * STREETLIGHT_SCALE;
  context.save();
  context.imageSmoothingEnabled = false;
  for (const { x, y } of streetlights) {
    const isOnScreen = x > camera.x - width && x < camera.x + viewport.width + width
      && y > camera.y - 8 && y < camera.y + viewport.height + height;
    if (!isOnScreen) continue;
    context.beginPath();
    context.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2);
    context.fillStyle = 'rgba(24, 35, 30, 0.24)';
    context.fill();
    context.drawImage(streetlightSprite, Math.round(x - width / 2), Math.round(y - height), width, height);
  }
  context.restore();
}

function drawMap() {
  drawGroundLayer();
  drawKrogStreetTunnel();
  drawFloodWater();
  drawLandmarkProps();
  drawStreetlights();
  drawMartaTracks(context, marta);
  drawRoadLabels();
  drawLandmarks();
}

// Draws a pixel sprite centred on the character with a ground shadow. Frame 0 is the
// standing pose; walking cycles through every frame and bobs on the second stride.
function drawWalkingSprite(frames, character, scale, strideDuration) {
  const { isMoving, walkTime } = character;
  // Wrapped to a valid index even if walkTime is ever negative.
  const stride = Math.floor(walkTime / strideDuration);
  const frameIndex = isMoving ? ((stride % frames.length) + frames.length) % frames.length : 0;
  const bob = isMoving && frameIndex === 1 ? -scale : 0;
  drawSpriteFrame(frames[frameIndex], character, scale, bob);
}

// Draws one sprite frame centred on the character, mirrored to match its facing.
function drawSpriteFrame(frame, { x, y, facing }, scale, bob = 0) {
  const width = frame.width * scale;
  const height = frame.height * scale;

  context.beginPath();
  context.ellipse(x, y + height / 2 - 2, width * 0.36, 4, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(30, 30, 30, 0.28)';
  context.fill();

  // Sprites face right; mirror them when the character heads left.
  context.save();
  context.imageSmoothingEnabled = false;
  context.translate(Math.round(x), Math.round(y + bob));
  context.scale(facing, 1);
  context.drawImage(frame, -width / 2, -height / 2, width, height);
  context.restore();
}

function drawPlayer() {
  const { x, y, name } = gameState.player;

  drawWalkingSprite(heroFrames[selectedCharacterId], gameState.player, PLAYER_SPRITE_SCALE, PLAYER_STRIDE_DURATION);

  context.beginPath();
  context.roundRect(x - 38, y + 30, 76, 25, 7);
  context.fillStyle = '#17324a';
  context.fill();
  context.fillStyle = '#ffffff';
  context.font = '700 14px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(name, x, y + 43);
  context.textAlign = 'start';
  context.textBaseline = 'alphabetic';
}

function drawMaya() {
  const { x, y, following } = gameState.maya;

  if (!following) {
    const pulse = 20 + Math.sin(performance.now() / 220) * 3;
    context.beginPath();
    context.arc(x, y, pulse, 0, Math.PI * 2);
    context.strokeStyle = 'rgba(233, 79, 145, 0.48)';
    context.lineWidth = 4;
    context.stroke();
  }

  const restPose = getMayaRestPose(gameState.maya);
  if (restPose) {
    const poseFrames = mayaFrames[restPose];
    const frameIndex = Math.floor(gameState.maya.restTime / MAYA_REST_POSE_FRAME_DURATIONS[restPose]) % poseFrames.length;
    drawSpriteFrame(poseFrames[frameIndex], gameState.maya, MAYA_SPRITE_SCALE);
  } else {
    drawWalkingSprite(mayaFrames.walk, gameState.maya, MAYA_SPRITE_SCALE, MAYA_STRIDE_DURATION);
  }

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.font = '800 13px system-ui, sans-serif';
  context.strokeStyle = 'rgba(72, 24, 49, 0.9)';
  context.lineWidth = 4;
  // Rounded corners, or the outline grows long spikes on letters like M and y.
  context.lineJoin = 'round';
  context.strokeText('Maya', x, y + 27);
  context.fillStyle = '#fff7e4';
  context.fillText('Maya', x, y + 27);
  context.textAlign = 'start';
  context.textBaseline = 'alphabetic';
}

function drawDinosaur(dinosaur) {
  const { x, y, species, state } = dinosaur;
  // An Allosaurus about to charge, or charging, pulses faster and brighter.
  const isAttacking = state === 'windup' || state === 'charge';
  const pulse = species.ringRadius + Math.sin(performance.now() / (isAttacking ? 60 : 170)) * 2;

  context.beginPath();
  context.arc(x, y, pulse, 0, Math.PI * 2);
  context.fillStyle = isAttacking ? 'rgba(214, 48, 34, 0.3)' : 'rgba(186, 54, 43, 0.16)';
  context.fill();
  context.strokeStyle = isAttacking ? 'rgba(214, 48, 34, 0.85)' : 'rgba(186, 54, 43, 0.5)';
  context.lineWidth = 3;
  context.stroke();

  const strideDuration = species.strideDuration * (state === 'charge' ? CHARGE_STRIDE_SCALE : 1);
  drawWalkingSprite(dinosaurFrames[species.id], dinosaur, species.spriteScale, strideDuration);

  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.lineWidth = 4;
  context.lineJoin = 'round';
  context.strokeStyle = 'rgba(72, 24, 20, 0.9)';

  // Above its head: "!" while it rears up to charge, "z z" while it catches its breath.
  const mood = state === 'windup' ? '!' : state === 'tired' ? 'z z' : null;
  if (mood) {
    const moodY = y - species.labelOffset - 6;
    context.font = state === 'windup' ? '900 26px system-ui, sans-serif' : '900 14px system-ui, sans-serif';
    context.strokeText(mood, x, moodY);
    context.fillStyle = state === 'windup' ? '#ffd44a' : '#d9ecff';
    context.fillText(mood, x, moodY);
  }

  const label = species.getLabel(dinosaur);
  if (label) {
    context.font = '900 13px system-ui, sans-serif';
    context.strokeText(label, x, y + species.labelOffset);
    context.fillStyle = '#fff4d8';
    context.fillText(label, x, y + species.labelOffset);
  }
  context.textAlign = 'start';
  context.textBaseline = 'alphabetic';
}

function drawPickup(pickup) {
  if (pickup.type === 'tab') drawSodaTab(pickup);
  else drawWaffle(pickup);
}

// A bobbing pull tab that glints now and then so it stands out on the road.
function drawSodaTab(tab) {
  const now = performance.now() / 1000;
  const bob = Math.sin(now * 3.3 + tab.bobOffset) * 2;
  const width = sodaTabSprite.width * SODA_TAB_SCALE;
  const height = sodaTabSprite.height * SODA_TAB_SCALE;

  context.beginPath();
  context.ellipse(tab.x, tab.y + height / 2 + 3, width * 0.4, 3, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(40, 30, 10, 0.25)';
  context.fill();

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(sodaTabSprite, Math.round(tab.x - width / 2), Math.round(tab.y - height / 2 + bob), width, height);
  context.restore();

  const glint = (now * 0.6 + tab.bobOffset) % 2;
  if (glint < 0.25) {
    const size = 3 + Math.sin((glint / 0.25) * Math.PI) * 4;
    const glintX = tab.x + width * 0.3;
    const glintY = tab.y - height * 0.35 + bob;
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillRect(glintX - size / 2, glintY - 1, size, 2);
    context.fillRect(glintX - 1, glintY - size / 2, 2, size);
  }
}

function drawWaffle(waffle) {
  const bob = Math.sin(performance.now() / 300 + waffle.bobOffset) * 2;
  const x = waffle.x;
  const y = waffle.y + bob;
  const half = WAFFLE_SIZE / 2;

  context.beginPath();
  context.ellipse(waffle.x, waffle.y + half + 3, half * 0.8, 3, 0, 0, Math.PI * 2);
  context.fillStyle = 'rgba(40, 30, 10, 0.25)';
  context.fill();

  context.beginPath();
  context.roundRect(x - half, y - half, WAFFLE_SIZE, WAFFLE_SIZE, 5);
  context.fillStyle = '#f2b441';
  context.fill();
  context.strokeStyle = '#8a5418';
  context.lineWidth = 2;
  context.stroke();

  // A simple grid pattern makes the square read as a waffle.
  context.beginPath();
  for (const offset of [-half / 3, half / 3]) {
    context.moveTo(x + offset, y - half + 2);
    context.lineTo(x + offset, y + half - 2);
    context.moveTo(x - half + 2, y + offset);
    context.lineTo(x + half - 2, y + offset);
  }
  context.strokeStyle = '#b87424';
  context.lineWidth = 1.5;
  context.stroke();
}

function drawPickupPopups() {
  const now = performance.now();
  context.font = '900 15px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  for (const popup of gameState.pickupPopups) {
    const progress = (now - popup.startTime) / (PICKUP_POPUP_DURATION * 1000);
    const y = popup.y - 16 - progress * 22;
    context.globalAlpha = Math.max(0, 1 - progress);
    context.strokeStyle = 'rgba(90, 50, 10, 0.9)';
    context.lineWidth = 4;
    context.strokeText(`+${popup.points}`, popup.x, y);
    context.fillStyle = '#ffe28a';
    context.fillText(`+${popup.points}`, popup.x, y);
  }
  context.globalAlpha = 1;
  context.textAlign = 'start';
  context.textBaseline = 'alphabetic';
}

function canPlayerOccupy(x, y) {
  if (
    x - PLAYER_RADIUS < 0 ||
    x + PLAYER_RADIUS > WORLD_WIDTH ||
    y - PLAYER_RADIUS < 0 ||
    y + PLAYER_RADIUS > WORLD_HEIGHT
  ) {
    return false;
  }

  return isInsideWaffleHouseAccess(x, y) || isOnRoad(x, y, PLAYER_RADIUS);
}

// Whether a body of this radius fits on any street at this spot: within the street's
// half-width, less the body, plus a little forgiveness. Every street is checked, not
// just the nearest one. Where a narrow street meets a wide one, a spot can be nearest
// the narrow street's centreline, and outside it, yet still on the wide street; testing
// only the nearest street left invisible notches there that the hero snagged on.
function isOnRoad(x, y, bodyRadius) {
  for (const road of mapData.roads) {
    const reach = road.width / 2 - bodyRadius + ROAD_FORGIVENESS;
    const { points } = road;
    for (let index = 1; index < points.length; index += 1) {
      const startX = points[index - 1][0];
      const startY = points[index - 1][1];
      const segmentX = points[index][0] - startX;
      const segmentY = points[index][1] - startY;
      const lengthSquared = segmentX * segmentX + segmentY * segmentY;
      const progress = lengthSquared === 0
        ? 0
        : clamp(((x - startX) * segmentX + (y - startY) * segmentY) / lengthSquared, 0, 1);
      if (Math.hypot(x - startX - segmentX * progress, y - startY - segmentY * progress) <= reach) return true;
    }
  }
  return false;
}

function isInsideWaffleHouseBuilding(x, y) {
  const destination = waffleHouse;
  if (!destination) return false;
  return x >= destination.x
    && x <= destination.x + destination.width
    && y >= destination.y
    && y <= destination.y + destination.height;
}

function isInsideWaffleHouseAccess(x, y) {
  if (!waffleHouse) return false;
  if (isInsideWaffleHouseBuilding(x, y)) return true;

  const accessPath = waffleHouse.accessPath;
  for (let index = 1; index < accessPath.length; index += 1) {
    const point = closestPointOnSegment(x, y, accessPath[index - 1], accessPath[index]);
    if (Math.hypot(x - point.x, y - point.y) <= WAFFLE_HOUSE_DRIVEWAY_REACH) return true;
  }
  return false;
}

// radius is the species' roadRadius: how much of the street's width its body takes up.
function canDinosaurOccupy(x, y, radius) {
  if (x - radius < 0 || x + radius > WORLD_WIDTH || y - radius < 0 || y + radius > WORLD_HEIGHT) {
    return false;
  }
  return isInsideWaffleHouseAccess(x, y) || isOnRoad(x, y, radius);
}

// The last corner-assist nudge, until Trevor next moves forwards: { inputX, inputY, side }.
let lastCornerNudge = null;

function movePlayer(deltaX, deltaY) {
  const distance = Math.hypot(deltaX, deltaY);
  if (distance === 0) return;

  const startsInDeepWater = getFloodDepthAt(gameState.player.x, gameState.player.y, PLAYER_RADIUS) >= DEEP_WATER;
  const canStepTo = (x, y) => canPlayerOccupy(x, y)
    && !isBlockedByDeepWater(x, y, PLAYER_RADIUS, startsInDeepWater);

  const desiredX = gameState.player.x + deltaX;
  const desiredY = gameState.player.y + deltaY;
  if (canStepTo(desiredX, desiredY)) {
    gameState.player.x = desiredX;
    gameState.player.y = desiredY;
    lastCornerNudge = null;
    return;
  }

  // At a road edge or bend, preserve speed by sliding along the nearby street
  // direction that most closely matches the player's intended input.
  const inputX = deltaX / distance;
  const inputY = deltaY / distance;
  let bestSlide = null;

  for (const road of mapData.roads) {
    const playableRadius = road.width / 2 - PLAYER_RADIUS + ROAD_FORGIVENESS;
    for (let index = 1; index < road.points.length; index += 1) {
      const start = road.points[index - 1];
      const end = road.points[index];
      const nearest = closestPointOnSegment(gameState.player.x, gameState.player.y, start, end);
      const roadDistance = Math.hypot(gameState.player.x - nearest.x, gameState.player.y - nearest.y);
      if (roadDistance > playableRadius + ROAD_SLIDE_SEARCH_PADDING) continue;

      const segmentX = end[0] - start[0];
      const segmentY = end[1] - start[1];
      const segmentLength = Math.hypot(segmentX, segmentY);
      if (segmentLength === 0) continue;

      const tangentX = segmentX / segmentLength;
      const tangentY = segmentY / segmentLength;
      const signedAlignment = inputX * tangentX + inputY * tangentY;
      const alignment = Math.abs(signedAlignment);
      if (alignment < ROAD_SLIDE_MIN_ALIGNMENT) continue;

      const direction = Math.sign(signedAlignment) || 1;
      const x = gameState.player.x + tangentX * direction * distance;
      const y = gameState.player.y + tangentY * direction * distance;
      if (!canStepTo(x, y)) continue;

      const desiredDistance = Math.hypot(desiredX - x, desiredY - y);
      const score = alignment * 100 - desiredDistance - roadDistance * 0.15;
      if (!bestSlide || score > bestSlide.score) bestSlide = { x, y, score };
    }
  }

  if (bestSlide) {
    gameState.player.x = bestSlide.x;
    gameState.player.y = bestSlide.y;
    lastCornerNudge = null;
    return;
  }

  // Corner nudges in a row, with the same keys held, have to keep going the same way.
  // Being pulled one way and then the other means two side streets are competing, and
  // following both would shake Trevor on the spot.
  const cornerStep = findCornerAssistStep(inputX, inputY, distance, canStepTo);
  const reversesLastNudge = cornerStep
    && lastCornerNudge
    && lastCornerNudge.side !== cornerStep.side
    && lastCornerNudge.inputX * inputX + lastCornerNudge.inputY * inputY > 0.99;
  if (cornerStep && !reversesLastNudge) {
    gameState.player.x = cornerStep.x;
    gameState.player.y = cornerStep.y;
    lastCornerNudge = { inputX, inputY, side: cornerStep.side };
    return;
  }

  const glanceStep = findGlancingStep(inputX, inputY, distance, canStepTo);
  if (glanceStep) {
    gameState.player.x = glanceStep.x;
    gameState.player.y = glanceStep.y;
    lastCornerNudge = null;
    return;
  }

  // Retain axis sliding for tight building corners where there is no road tangent.
  const beforeX = gameState.player.x;
  const beforeY = gameState.player.y;
  if (canStepTo(desiredX, gameState.player.y)) gameState.player.x = desiredX;
  if (canStepTo(gameState.player.x, desiredY)) gameState.player.y = desiredY;
  if (gameState.player.x !== beforeX || gameState.player.y !== beforeY) lastCornerNudge = null;
}

// Glancing off a curb: when nothing above found a way on, turn the step a little at a
// time to either side and take the first heading that's open. This carries Trevor
// round shapes that follow no street's direction: the rounded outside of a bend, the
// point where two streets meet at a sharp angle, the end of a cul-de-sac. Pushing
// square into a curb still stops him, because no heading within GLANCE_MAX_TURN is open.
// Every glance still moves him the way he's pressing, so he can't be bounced back and forth.
function findGlancingStep(inputX, inputY, distance, canStepTo) {
  const { x: playerX, y: playerY, headingX, headingY } = gameState.player;

  for (let turn = GLANCE_TURN_STEP; turn <= GLANCE_MAX_TURN + 1e-9; turn += GLANCE_TURN_STEP) {
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    const steps = [sin, -sin].map((side) => {
      const directionX = inputX * cos - inputY * side;
      const directionY = inputX * side + inputY * cos;
      return { x: playerX + directionX * distance, y: playerY + directionY * distance, directionX, directionY };
    }).filter((step) => canStepTo(step.x, step.y));

    if (steps.length === 1) return steps[0];
    if (steps.length === 2) {
      // A point with open road on both sides: keep going the way he was already heading.
      const [first, second] = steps;
      const firstMatch = first.directionX * headingX + first.directionY * headingY;
      const secondMatch = second.directionX * headingX + second.directionY * headingY;
      return secondMatch > firstMatch ? second : first;
    }
  }
  return null;
}

// Corner assist (like Pac-Man's): when Trevor presses toward a side street he's a
// little past or short of, nudge him sideways until he lines up with it instead of
// stopping him at the curb. Only used when the move he asked for is blocked.
//
// The nudge is always square to the way he's pressing, never backwards. Every other
// kind of step in movePlayer moves him forwards, so no two of them can undo each other
// and leave him jittering on the spot.
function findCornerAssistStep(inputX, inputY, distance, canStepTo) {
  const { x: playerX, y: playerY } = gameState.player;
  let closest = null;

  for (const road of mapData.roads) {
    for (let index = 1; index < road.points.length; index += 1) {
      const start = road.points[index - 1];
      const end = road.points[index];
      const segmentX = end[0] - start[0];
      const segmentY = end[1] - start[1];
      const segmentLength = Math.hypot(segmentX, segmentY);
      if (segmentLength === 0) continue;

      // Only streets running the way Trevor wants to go.
      const tangentX = segmentX / segmentLength;
      const tangentY = segmentY / segmentLength;
      const alignment = inputX * tangentX + inputY * tangentY;
      if (Math.abs(alignment) < CORNER_ASSIST_MIN_ALIGNMENT) continue;

      // The street has to continue in that direction from where he'd join it.
      const along = ((playerX - start[0]) * tangentX + (playerY - start[1]) * tangentY) / segmentLength;
      if (alignment > 0 ? along >= 1 : along <= 0) continue;

      // Sideways offset from Trevor to the street's centerline.
      const nearest = closestPointOnSegment(playerX, playerY, start, end);
      const offsetX = nearest.x - playerX;
      const offsetY = nearest.y - playerY;
      const forward = offsetX * tangentX + offsetY * tangentY;
      // The street has to start close by. Without this, the centreline of a street
      // hundreds of pixels away, extended to here, tugged Trevor sideways and made him
      // jitter against the curb.
      if (Math.abs(forward) > CORNER_ASSIST_MAX_GAP) continue;
      const lateralX = offsetX - tangentX * forward;
      const lateralY = offsetY - tangentY * forward;
      const lateralDistance = Math.hypot(lateralX, lateralY);
      if (lateralDistance > CORNER_ASSIST_RANGE) continue;
      // Only the closest street counts, even if he's already lined up with it or the
      // nudge toward it turns out to be blocked. Falling back to a farther street made
      // him hop back and forth between the two.
      if (closest && lateralDistance >= closest.lateralDistance) continue;
      if (lateralDistance < 0.5) {
        closest = { lateralDistance, isLinedUp: true };
        continue;
      }

      // How far he has to move sideways to reach the centreline. The street runs within
      // 45° of his input, so its centreline is never close to square-on to the nudge.
      const sideX = -inputY;
      const sideY = inputX;
      const sideShare = (lateralX * sideX + lateralY * sideY) / lateralDistance;
      const step = Math.min(distance, lateralDistance / Math.abs(sideShare)) * Math.sign(sideShare);
      closest = {
        x: playerX + sideX * step,
        y: playerY + sideY * step,
        side: Math.sign(sideShare), // which way the nudge goes: 1 or -1
        lateralDistance,
      };
    }
  }

  return closest && !closest.isLinedUp && canStepTo(closest.x, closest.y) ? closest : null;
}

function applyRoadMagnet(deltaTime) {
  if (isInsideWaffleHouseAccess(gameState.player.x, gameState.player.y)) return;

  const nearest = findNearestRoadPoint(gameState.player.x, gameState.player.y);
  if (!nearest) return;

  const tangentX = nearest.segmentEnd[0] - nearest.segmentStart[0];
  const tangentY = nearest.segmentEnd[1] - nearest.segmentStart[1];
  const tangentLength = Math.hypot(tangentX, tangentY);
  if (tangentLength === 0) return;

  const unitTangentX = tangentX / tangentLength;
  const unitTangentY = tangentY / tangentLength;
  const correctionX = nearest.x - gameState.player.x;
  const correctionY = nearest.y - gameState.player.y;
  const forwardCorrection = correctionX * unitTangentX + correctionY * unitTangentY;
  const lateralX = correctionX - unitTangentX * forwardCorrection;
  const lateralY = correctionY - unitTangentY * forwardCorrection;
  const lateralDistance = Math.hypot(lateralX, lateralY);
  if (lateralDistance < 2) return;

  const distanceToMove = Math.min(lateralDistance, ROAD_MAGNET_SPEED * deltaTime);
  const ratio = distanceToMove / lateralDistance;
  const candidateX = gameState.player.x + lateralX * ratio;
  const candidateY = gameState.player.y + lateralY * ratio;

  const startsInDeepWater = getFloodDepthAt(gameState.player.x, gameState.player.y, PLAYER_RADIUS) >= DEEP_WATER;
  if (
    canPlayerOccupy(candidateX, candidateY)
    && !isBlockedByDeepWater(candidateX, candidateY, PLAYER_RADIUS, startsInDeepWater)
  ) {
    gameState.player.x = candidateX;
    gameState.player.y = candidateY;
  }
}

function updatePlayer(deltaTime) {
  if (gameState.status === 'won' || gameState.status === 'game-over') return;

  const player = gameState.player;
  const previousX = player.x;
  const previousY = player.y;
  // Arrow keys and the touch stick both steer; together they never exceed one step.
  const stick = touchStick.getDirection();
  const horizontal = clamp(
    Number(pressedKeys.has('ArrowRight')) - Number(pressedKeys.has('ArrowLeft')) + stick.horizontal,
    -1,
    1,
  );
  const vertical = clamp(
    Number(pressedKeys.has('ArrowDown')) - Number(pressedKeys.has('ArrowUp')) + stick.vertical,
    -1,
    1,
  );

  if (horizontal !== 0 || vertical !== 0) {
    const directionLength = Math.hypot(horizontal, vertical);
    const distance = PLAYER_SPEED * deltaTime * getWadingSpeedMultiplier(player.x, player.y);
    const stepCount = Math.max(1, Math.ceil(distance / PLAYER_MOVEMENT_SUBSTEP));
    const stepX = (horizontal / directionLength) * distance / stepCount;
    const stepY = (vertical / directionLength) * distance / stepCount;
    for (let step = 0; step < stepCount; step += 1) movePlayer(stepX, stepY);
    applyRoadMagnet(deltaTime);
  }

  const movedDistance = Math.hypot(player.x - previousX, player.y - previousY);
  if (movedDistance > 0.05) {
    player.headingX = (player.x - previousX) / movedDistance;
    player.headingY = (player.y - previousY) / movedDistance;
  }
  updateWalkAnimation(player, previousX, previousY, deltaTime);
}

// Movement drives a sprite: face the direction of travel and animate its legs. Small
// sideways drift (road corrections, mostly-vertical pursuit) doesn't flip the facing.
function updateWalkAnimation(character, previousX, previousY, deltaTime) {
  const movedX = character.x - previousX;
  const movedDistance = Math.hypot(movedX, character.y - previousY);
  character.isMoving = movedDistance > 0.05;
  if (Math.abs(movedX) > Math.max(0.05, movedDistance * 0.25)) character.facing = Math.sign(movedX);
  character.walkTime = character.isMoving ? character.walkTime + deltaTime : 0;
}

function recordPlayerTrail() {
  const latest = playerTrail.at(-1);
  if (latest && Math.hypot(gameState.player.x - latest.x, gameState.player.y - latest.y) < 4) return;
  playerTrail.push({ x: gameState.player.x, y: gameState.player.y });
  if (playerTrail.length > 180) playerTrail.shift();
}

function getMayaTrailTarget() {
  let distance = 0;
  for (let index = playerTrail.length - 1; index > 0; index -= 1) {
    const newer = playerTrail[index];
    const older = playerTrail[index - 1];
    const segmentLength = Math.hypot(newer.x - older.x, newer.y - older.y);
    if (distance + segmentLength >= MAYA_FOLLOW_DISTANCE) {
      const progress = (MAYA_FOLLOW_DISTANCE - distance) / segmentLength;
      return {
        x: newer.x + (older.x - newer.x) * progress,
        y: newer.y + (older.y - newer.y) * progress,
      };
    }
    distance += segmentLength;
  }
  return playerTrail[0];
}

function canMayaOccupy(x, y) {
  if (
    x - MAYA_RADIUS < 0
    || x + MAYA_RADIUS > WORLD_WIDTH
    || y - MAYA_RADIUS < 0
    || y + MAYA_RADIUS > WORLD_HEIGHT
  ) {
    return false;
  }

  const nearest = findNearestRoadPoint(x, y);
  const playableRadius = nearest.road.width / 2 - MAYA_RADIUS + ROAD_FORGIVENESS;
  return nearest.distance <= playableRadius;
}

function chooseMayaWanderHeading(maya) {
  const headings = [];

  for (const road of mapData.roads) {
    const playableRadius = road.width / 2 - MAYA_RADIUS + ROAD_FORGIVENESS;
    for (let index = 1; index < road.points.length; index += 1) {
      const start = road.points[index - 1];
      const end = road.points[index];
      const nearest = closestPointOnSegment(maya.x, maya.y, start, end);
      if (Math.hypot(maya.x - nearest.x, maya.y - nearest.y) > playableRadius + 8) continue;

      const heading = Math.atan2(end[1] - start[1], end[0] - start[0]);
      headings.push(heading, heading + Math.PI);
    }
  }

  if (headings.length === 0) return Math.random() * Math.PI * 2;
  const forwardChoices = headings.filter(
    (heading) => angleDifference(heading, maya.wanderHeading) < Math.PI * 0.72,
  );
  const choices = forwardChoices.length > 0 && Math.random() < 0.7 ? forwardChoices : headings;
  return choices[Math.floor(Math.random() * choices.length)];
}

function updateMayaAddress(maya) {
  const nearest = findNearestRoadPoint(maya.x, maya.y);
  const movedSinceUpdate = Math.hypot(maya.x - maya.addressX, maya.y - maya.addressY);
  const changedStreets = nearest.road.name !== maya.roadName;
  if (!changedStreets && movedSinceUpdate < MAYA_ADDRESS_UPDATE_DISTANCE) return;

  maya.roadName = nearest.road.name;
  maya.addressX = maya.x;
  maya.addressY = maya.y;
  maya.address = makeStreetAddress(maya.roadName, maya.x, maya.y);
  statusText.textContent = `Find Maya at ${maya.address}`;
  updateRescuePanel();
}

function updateMayaWander(maya, deltaTime) {
  maya.wanderTimer -= deltaTime;

  if (maya.wanderMode === 'resting') {
    if (maya.wanderTimer > 0) return;
    maya.wanderMode = 'walking';
    maya.wanderTimer = randomBetween(MAYA_WANDER_MIN_TIME, MAYA_WANDER_MAX_TIME);
    maya.wanderHeading = chooseMayaWanderHeading(maya);
  }

  const step = MAYA_WANDER_SPEED * deltaTime * getWadingSpeedMultiplier(maya.x, maya.y);
  const startsInDeepWater = getFloodDepthAt(maya.x, maya.y, MAYA_RADIUS) >= DEEP_WATER;
  let move = null;
  for (let index = 0; index < 20; index += 1) {
    const direction = index === 0 ? 0 : (index % 2 === 0 ? -1 : 1);
    const offset = Math.ceil(index / 2) * (Math.PI / 18) * direction;
    const heading = maya.wanderHeading + offset;
    const x = maya.x + Math.cos(heading) * step;
    const y = maya.y + Math.sin(heading) * step;
    if (canMayaOccupy(x, y) && !isBlockedByDeepWater(x, y, MAYA_RADIUS, startsInDeepWater)) {
      move = { x, y, heading };
      break;
    }
  }

  if (move) {
    maya.x = move.x;
    maya.y = move.y;
    maya.wanderHeading = move.heading;
    updateMayaAddress(maya);
  } else {
    maya.wanderTimer = 0;
  }

  if (maya.wanderTimer > 0) return;
  maya.wanderMode = 'resting';
  maya.wanderTimer = randomBetween(MAYA_REST_MIN_TIME, MAYA_REST_MAX_TIME);
  maya.restPose = pickMayaRestPose();
  maya.restTime = 0;
}

function pickMayaRestPose() {
  return Math.random() < MAYA_SNIFF_CHANCE ? 'sniff' : 'sit';
}

// Maya only sniffs or sits while she's waiting to be found; once she's following
// Trevor she just walks (or stands) behind him.
function getMayaRestPose(maya) {
  if (maya.following || maya.wanderMode !== 'resting') return null;
  return maya.restPose;
}

function updateMaya(deltaTime) {
  const maya = gameState.maya;
  const previousX = maya.x;
  const previousY = maya.y;

  moveMaya(deltaTime);
  updateWalkAnimation(maya, previousX, previousY, deltaTime);
  maya.restTime = getMayaRestPose(maya) ? maya.restTime + deltaTime : 0;
}

function moveMaya(deltaTime) {
  if (gameState.status === 'won' || gameState.status === 'game-over') return;

  const maya = gameState.maya;

  if (!maya.following) {
    updateMayaWander(maya, deltaTime);
    const distance = Math.hypot(gameState.player.x - maya.x, gameState.player.y - maya.y);
    if (distance <= MAYA_PICKUP_DISTANCE) {
      maya.following = true;
      gameState.status = 'maya-rescued';
      playSound('maya');
      playerTrail = [{ x: gameState.player.x, y: gameState.player.y }];
      statusText.textContent = `You found Maya! She is following ${gameState.player.name}.`;
      updateRescuePanel();
    }
    return;
  }

  recordPlayerTrail();
  const target = getMayaTrailTarget();
  const deltaX = target.x - maya.x;
  const deltaY = target.y - maya.y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance < 0.5) return;

  const step = Math.min(distance, MAYA_FOLLOW_SPEED * deltaTime * getWadingSpeedMultiplier(maya.x, maya.y));
  maya.x += (deltaX / distance) * step;
  maya.y += (deltaY / distance) * step;
}

function angleDifference(first, second) {
  return Math.abs(Math.atan2(Math.sin(first - second), Math.cos(first - second)));
}

// What dinosaurs.js needs to know about the map and the hero to move a dinosaur.
const dinosaurWorld = {
  hero: null,
  heroSpeed: PLAYER_SPEED,
  settings: null,
  dinosaurs: null,
  canOccupy: canDinosaurOccupy,
  // Dinosaurs won't step into water from the depth set by dinosaursBlockedFrom (deep
  // water, the same as the hero), but can walk out.
  isInBlockingWater: (x, y, radius) => getFloodDepthAt(x, y, radius) >= DINOSAUR_BLOCKING_DEPTH,
  // In shallower flood water they wade, at the hero's own wading speed.
  isWading: (x, y) => getFloodDepthAt(x, y) >= SHALLOW_WATER,
  wadingSpeedRatio: WEATHER.shallowSpeedMultiplier,
};

function updateDinosaurs(deltaTime) {
  if (gameState.status === 'won' || gameState.status === 'game-over') return;

  const { player } = gameState;
  dinosaurWorld.hero = player;
  dinosaurWorld.settings = gameState.levelSettings;
  dinosaurWorld.dinosaurs = gameState.dinosaurs;

  for (const dinosaur of gameState.dinosaurs) {
    const previousX = dinosaur.x;
    const previousY = dinosaur.y;
    updateDinosaur(dinosaur, deltaTime, dinosaurWorld);
    updateWalkAnimation(dinosaur, previousX, previousY, deltaTime);

    const { species } = dinosaur;
    if (Math.hypot(player.x - dinosaur.x, player.y - dinosaur.y) > species.catchDistance) continue;
    triggerGameOver({
      eyebrow: species.caughtEyebrow,
      title: species.caughtTitle(player.name),
      status: `Game over — ${species.name} ${dinosaur.id} caught ${player.name}!`,
      species,
    });
    return;
  }
}

// species is the dinosaur that caught the hero, if one did (the storm can end a run too).
function triggerGameOver({ eyebrow, title, status, species = null }) {
  gameState.status = 'game-over';
  gameState.gameOverTitle = title;
  pressedKeys.clear();
  pauseButton.disabled = true;
  statusText.textContent = status;
  setTiles(gameOverEyebrow, eyebrow.toUpperCase());
  gameOverTitle.textContent = title;
  const isNewBest = saveBestScore(gameState.score) && gameState.score > 0;
  gameOverScoreText.textContent = `You reached level ${gameState.level} with ${gameState.score} points. `
    + (isNewBest ? 'New best score!' : `Best: ${loadBestScore()}`);
  printCheck(gameOverCheck, {
    ...getGuestCheck(),
    extra: { label: 'YOUR BEST', amount: loadBestScore() },
    stamp: isNewBest ? 'NEW BEST!' : 'GAME OVER',
  });
  gameOverDinosaurCanvas.hidden = !species;
  if (species) gameOverDinosaurSprite.setFrames(dinosaurFrames[species.id]);
  showScoreForm();
  gameOverOverlay.hidden = false;
  updateRescuePanel();
}

const FLOOD_DEPTH = { dry: 0, warning: 0, shallow: 1, deep: 2 };
const SHALLOW_WATER = FLOOD_DEPTH.shallow;
const DEEP_WATER = FLOOD_DEPTH.deep;
const DINOSAUR_BLOCKING_DEPTH = FLOOD_DEPTH[WEATHER.dinosaursBlockedFrom];

function distanceToPath(x, y, points) {
  let nearest = Infinity;
  for (let index = 1; index < points.length; index += 1) {
    const point = closestPointOnSegment(x, y, points[index - 1], points[index]);
    nearest = Math.min(nearest, Math.hypot(x - point.x, y - point.y));
  }
  return nearest;
}

// Deepest water at a point: 0 = dry (or only a warning), 1 = shallow, 2 = deep.
// Padding lets a character's body, not just its center, touch the water.
function getFloodDepthAt(x, y, padding = 0) {
  let depth = 0;
  for (const zone of gameState.floodZones) {
    const zoneDepth = FLOOD_DEPTH[zone.state];
    if (zoneDepth <= depth) continue;
    if (distanceToPath(x, y, zone.points) <= zone.width / 2 + padding) depth = zoneDepth;
  }
  return depth;
}

function getWadingSpeedMultiplier(x, y) {
  return getFloodDepthAt(x, y) >= SHALLOW_WATER ? WEATHER.shallowSpeedMultiplier : 1;
}

// Deep water blocks stepping in, never stepping out, so nobody is trapped when
// a zone deepens around them.
function isBlockedByDeepWater(x, y, padding, startsInDeepWater) {
  return !startsInDeepWater && getFloodDepthAt(x, y, padding) >= DEEP_WATER;
}

// Each chosen zone moves dry → warning → shallow → deep on its own timer once
// the storm clock reaches its trigger point.
function updateFloodZones(deltaTime) {
  if (gameState.status === 'won' || gameState.status === 'game-over') return;

  // During the final surge the surge alert stays up instead of per-zone updates.
  const announce = (level, message) => {
    if (!gameState.storm.finalSurge) weatherTicker.alert(level, message);
  };

  for (const zone of gameState.floodZones) {
    if (zone.state === 'dry') {
      if (gameState.storm.progress < zone.triggerAt) continue;
      zone.state = 'warning';
      zone.stateTime = 0;
      announce('flood', `${zone.name} is starting to flood`);
      continue;
    }

    zone.stateTime += deltaTime;
    if (zone.state === 'warning' && zone.stateTime >= WEATHER.warningSeconds) {
      zone.state = 'shallow';
      zone.stateTime = 0;
      announce('flood', `${zone.name} is flooded — wade with care`);
    } else if (WEATHER.floodsTurnDeep && zone.state === 'shallow' && zone.stateTime >= zone.nextSafetyCheckAt) {
      // Hold at shallow (still wadeable) while going deep would cut Trevor off
      // from Maya or Waffle House; try again in a second.
      if (!canFloodSafely(zone)) {
        zone.nextSafetyCheckAt = zone.stateTime + 1;
        continue;
      }
      zone.state = 'deep';
      zone.stateTime = 0;
      announce('closed', `${zone.name} is underwater — find another way`);
    }
  }
}

// Nearest walkable grid cell to a point, or -1 if none is close by.
function findWalkableCell(x, y, grid = reachabilityGrid) {
  const { columns, rows, reachable } = grid;
  const column = Math.floor(x / REACHABILITY_CELL_SIZE);
  const row = Math.floor(y / REACHABILITY_CELL_SIZE);
  let bestIndex = -1;
  let bestDistance = Infinity;

  for (let rowStep = -2; rowStep <= 2; rowStep += 1) {
    for (let columnStep = -2; columnStep <= 2; columnStep += 1) {
      const nextColumn = column + columnStep;
      const nextRow = row + rowStep;
      if (nextColumn < 0 || nextRow < 0 || nextColumn >= columns || nextRow >= rows) continue;
      const index = nextRow * columns + nextColumn;
      if (!reachable[index]) continue;
      const distance = Math.hypot(
        (nextColumn + 0.5) * REACHABILITY_CELL_SIZE - x,
        (nextRow + 0.5) * REACHABILITY_CELL_SIZE - y,
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    }
  }
  return bestIndex;
}

// Grid cells Trevor can't step into once this zone is deep (cached per zone).
function getDeepWaterCells(zone) {
  if (zone.deepWaterCells) return zone.deepWaterCells;
  const { columns, rows } = reachabilityGrid;
  const cells = [];
  const reach = zone.width / 2 + PLAYER_RADIUS;
  const xs = zone.points.map((point) => point[0]);
  const ys = zone.points.map((point) => point[1]);
  const firstColumn = Math.max(0, Math.floor((Math.min(...xs) - reach) / REACHABILITY_CELL_SIZE));
  const lastColumn = Math.min(columns - 1, Math.floor((Math.max(...xs) + reach) / REACHABILITY_CELL_SIZE));
  const firstRow = Math.max(0, Math.floor((Math.min(...ys) - reach) / REACHABILITY_CELL_SIZE));
  const lastRow = Math.min(rows - 1, Math.floor((Math.max(...ys) + reach) / REACHABILITY_CELL_SIZE));

  for (let row = firstRow; row <= lastRow; row += 1) {
    for (let column = firstColumn; column <= lastColumn; column += 1) {
      const x = (column + 0.5) * REACHABILITY_CELL_SIZE;
      const y = (row + 0.5) * REACHABILITY_CELL_SIZE;
      if (distanceToPath(x, y, zone.points) <= reach) cells.push(row * columns + column);
    }
  }
  zone.deepWaterCells = Int32Array.from(cells);
  return zone.deepWaterCells;
}

// Would Trevor still reach Waffle House (and Maya, if she isn't following yet)
// with this zone deep on top of the ones already deep? Walks the precomputed
// walkable grid, so it's cheap enough to run mid-game.
function canFloodSafely(candidate) {
  const { player, maya } = gameState;

  // Trevor can't wade into deep water to fetch her, so never flood over Maya.
  const mayaReach = candidate.width / 2 + MAYA_PICKUP_DISTANCE;
  if (!maya.following && distanceToPath(maya.x, maya.y, candidate.points) <= mayaReach) return false;

  const { columns, reachable } = reachabilityGrid;
  const blocked = new Uint8Array(reachable.length);
  for (const zone of gameState.floodZones) {
    if (zone !== candidate && zone.state !== 'deep') continue;
    // Trevor can move freely inside deep water he's already standing in.
    if (distanceToPath(player.x, player.y, zone.points) <= zone.width / 2 + PLAYER_RADIUS) continue;
    for (const cell of getDeepWaterCells(zone)) blocked[cell] = 1;
  }

  const start = findWalkableCell(player.x, player.y);
  const targets = [findWalkableCell(waffleHouse.roadX, waffleHouse.roadY)];
  if (!maya.following) targets.push(findWalkableCell(maya.x, maya.y));
  if (start < 0 || targets.includes(-1)) return false;

  // Breadth-first search over flat cell indexes, stopping once every target is found.
  const cellCount = reachable.length;
  const lastColumn = columns - 1;
  const visited = new Uint8Array(cellCount);
  const queue = new Int32Array(cellCount);
  let head = 0;
  let tail = 0;
  let targetsLeft = new Set(targets).size;
  queue[tail++] = start;
  visited[start] = 1;
  if (targets.includes(start)) targetsLeft -= 1;

  while (head < tail && targetsLeft > 0) {
    const index = queue[head++];
    const column = index % columns;
    for (let neighbor = 0; neighbor < GRID_NEIGHBOR_COLUMN_STEPS.length; neighbor += 1) {
      const columnStep = GRID_NEIGHBOR_COLUMN_STEPS[neighbor];
      if ((columnStep < 0 && column === 0) || (columnStep > 0 && column === lastColumn)) continue;
      const next = index + GRID_NEIGHBOR_ROW_STEPS[neighbor] * columns + columnStep;
      if (next < 0 || next >= cellCount) continue;
      if (visited[next] || !reachable[next] || blocked[next]) continue;
      visited[next] = 1;
      queue[tail++] = next;
      if (targets.includes(next)) targetsLeft -= 1;
    }
  }

  return targetsLeft === 0;
}

function strokeZonePath(zone, strokeStyle, lineWidth, dash = []) {
  tracePath(context, zone.points);
  context.strokeStyle = strokeStyle;
  context.lineWidth = lineWidth;
  context.setLineDash(dash);
  context.stroke();
}

function drawFloodWater() {
  const now = performance.now() / 1000;
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';

  for (const zone of gameState.floodZones) {
    if (zone.state === 'warning') {
      // Puddles grow over the warning period.
      const growth = Math.min(1, zone.stateTime / WEATHER.warningSeconds);
      context.fillStyle = 'rgba(88, 158, 214, 0.55)';
      for (const puddle of zone.puddles) {
        const point = getPointAlongPath(zone.points, puddle.distance);
        const normalX = -Math.sin(point.angle);
        const normalY = Math.cos(point.angle);
        const radius = puddle.size * (0.45 + growth * 0.55);
        context.beginPath();
        context.ellipse(
          point.x + normalX * puddle.offset,
          point.y + normalY * puddle.offset,
          radius * 1.5,
          radius,
          point.angle,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
    } else if (zone.state === 'shallow') {
      strokeZonePath(zone, 'rgba(88, 158, 214, 0.62)', zone.width - 2);
      context.lineDashOffset = -now * 18;
      strokeZonePath(zone, 'rgba(225, 244, 255, 0.55)', 2, [6, 22]);
    } else if (zone.state === 'deep') {
      strokeZonePath(zone, '#2c6aa8', zone.width + 8);
      context.lineDashOffset = -now * 26;
      strokeZonePath(zone, 'rgba(210, 236, 255, 0.7)', 3, [10, 18]);
      context.lineDashOffset = -now * 26 + 14;
      strokeZonePath(zone, 'rgba(160, 210, 245, 0.5)', zone.width * 0.5, [4, 24]);
    }
  }

  context.setLineDash([]);
  context.lineDashOffset = 0;
  context.restore();
}

// Expanding rings at a character's feet show they're wading (and why they slowed down).
function drawWadingRipples(character) {
  if (getFloodDepthAt(character.x, character.y) < SHALLOW_WATER) return;

  const now = performance.now() / 1000;
  context.save();
  context.lineWidth = 2;
  for (let ring = 0; ring < 2; ring += 1) {
    const progress = (now * 1.2 + ring * 0.5) % 1;
    context.beginPath();
    context.ellipse(character.x, character.y + 12, 10 + progress * 16, 4 + progress * 6, 0, 0, Math.PI * 2);
    context.strokeStyle = `rgba(225, 244, 255, ${0.8 * (1 - progress)})`;
    context.stroke();
  }
  context.restore();
}

function drawRoadClosedBarrier(zone, distance) {
  const point = getPointAlongPath(zone.points, distance);
  const halfWidth = zone.width / 2 + 4;
  context.save();
  context.translate(point.x, point.y);
  context.rotate(point.angle + Math.PI / 2);
  context.fillStyle = '#ffffff';
  context.fillRect(-halfWidth, -4, halfWidth * 2, 8);
  context.fillStyle = '#d63a2f';
  for (let stripe = -halfWidth; stripe < halfWidth; stripe += 12) {
    context.fillRect(stripe, -4, 6, 8);
  }
  context.strokeStyle = '#5a1b16';
  context.lineWidth = 1.5;
  context.strokeRect(-halfWidth, -4, halfWidth * 2, 8);
  context.restore();
}

function drawFloodMarkers() {
  const pulse = 1 + Math.sin(performance.now() / 180) * 0.12;

  for (const zone of gameState.floodZones) {
    if (zone.state === 'dry') continue;

    if (zone.state === 'deep') {
      drawRoadClosedBarrier(zone, 2);
      drawRoadClosedBarrier(zone, zone.length - 2);
    }

    if (zone.state !== 'warning') continue;
    const middle = getPointAlongPath(zone.points, zone.length / 2);
    context.beginPath();
    context.arc(middle.x, middle.y - 30, 14 * pulse, 0, Math.PI * 2);
    context.fillStyle = '#f2a516';
    context.fill();
    context.strokeStyle = '#fffaf0';
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = '#3b2314';
    context.font = '900 17px system-ui, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('!', middle.x, middle.y - 29);
    context.textAlign = 'start';
    context.textBaseline = 'alphabetic';
  }
}

function updateStorm(deltaTime) {
  if (gameState.status === 'won' || gameState.status === 'game-over') return;

  const storm = gameState.storm;
  if (storm.progress < 1) {
    const clockSpeed = gameState.maya.following ? WEATHER.rescuedClockMultiplier : 1;
    const stormSeconds = WEATHER.stormDurationSeconds * gameState.levelSettings.stormLengthRatio;
    storm.progress = Math.min(1, storm.progress + (deltaTime / stormSeconds) * clockSpeed);
  }

  const phase = getStormPhase(storm.progress);
  if (phase.id !== storm.phase) {
    storm.phase = phase.id;
    if (phase.message) weatherTicker.alert(phase.tickerLevel, phase.message);
  }

  if (storm.progress < 1 || storm.finalSurge) return;

  if (WEATHER.onStormFull === 'lose') {
    triggerGameOver({
      eyebrow: 'Evacuate!',
      title: 'The storm flooded the neighborhood!',
      status: `Game over — the storm arrived before ${gameState.player.name} reached Waffle House.`,
    });
    return;
  }

  // Gentle mode: no loss. Every candidate zone not already in play starts
  // flooding now; the safety check still keeps a route to Waffle House open.
  storm.finalSurge = true;
  const activeZoneIds = new Set(gameState.floodZones.map((zone) => zone.id));
  for (const zone of FLOOD_ZONES) {
    if (!activeZoneIds.has(zone.id)) gameState.floodZones.push(createFloodZone(zone, 0));
  }
  weatherTicker.alert('breaking', 'FINAL SURGE — all roads flooding. Get to Waffle House!');
}

const TICKER_ROUNDUP_INTERVAL = 1; // seconds between roundup refreshes
const ZONE_TICKER_LABELS = { warning: 'FLOOD WATCH', shallow: 'FLOODED', deep: 'CLOSED' };
const ZONE_TICKER_ORDER = { deep: 0, shallow: 1, warning: 2 };
const MAX_TICKER_ZONES = 4; // keeps one pass of the roundup short

function getRainLabel(intensity) {
  if (intensity < 0.35) return 'LIGHT';
  if (intensity < 0.7) return 'STEADY';
  if (intensity < 0.95) return 'HEAVY';
  return 'TORRENTIAL';
}

// The scrolling roundup: road conditions, rain, storm progress, Maya and the
// (real!) Waffle House Index, which rates storms by whether Waffle House is open.
function updateTickerRoundup(deltaTime) {
  const { storm, maya } = gameState;
  if (storm.progress < WEATHER.rainStartsAt) return;
  weatherTicker.show();

  gameState.tickerRefreshTimer -= deltaTime;
  if (gameState.tickerRefreshTimer > 0) return;
  gameState.tickerRefreshTimer = TICKER_ROUNDUP_INTERVAL;

  const activeZones = gameState.floodZones
    .filter((zone) => zone.state !== 'dry')
    .sort((first, second) => ZONE_TICKER_ORDER[first.state] - ZONE_TICKER_ORDER[second.state]);
  const anyClosed = activeZones.some((zone) => zone.state === 'deep');
  const waffleHouseIndex = storm.finalSurge
    ? 'RED — …except this one. It never closes.'
    : anyClosed
      ? 'YELLOW — limited menu, still open'
      : 'GREEN — full menu, open 24/7';

  const extraZoneCount = activeZones.length - MAX_TICKER_ZONES;
  const items = [
    ...activeZones
      .slice(0, MAX_TICKER_ZONES)
      .map((zone) => `${zone.name}: ${ZONE_TICKER_LABELS[zone.state]}`),
    ...(extraZoneCount > 0 ? [`+${extraZoneCount} more streets flooding`] : []),
    `Rain: ${getRainLabel(getRainIntensity(storm.progress, WEATHER))}`,
    `Storm: ${Math.round(storm.progress * 100)}%`,
    maya.following
      ? `Maya: found safe, headed to Waffle House at ${waffleHouse.address} with ${gameState.player.name}`
      : `Missing dog: Maya, last seen near ${maya.address}`,
    `🧇 Waffle House Index: ${waffleHouseIndex}`,
  ];
  const level = storm.finalSurge ? 'breaking' : anyClosed ? 'closed' : activeZones.length > 0 ? 'flood' : 'alert';
  weatherTicker.setRoundup(items, level);
}

function updatePickups() {
  const now = performance.now();
  gameState.pickupPopups = gameState.pickupPopups.filter(
    (popup) => now - popup.startTime < PICKUP_POPUP_DURATION * 1000,
  );
  if (gameState.status === 'won' || gameState.status === 'game-over') return;

  const { x, y } = gameState.player;
  const remaining = [];
  for (const pickup of gameState.pickups) {
    if (Math.hypot(pickup.x - x, pickup.y - y) > PICKUP_DISTANCE) {
      remaining.push(pickup);
      continue;
    }
    const { points } = PICKUP_TYPES[pickup.type];
    gameState.score += points;
    gameState.collected[pickup.type] += 1;
    gameState.pickupPopups.push({ x: pickup.x, y: pickup.y, points, startTime: now });
    playSound(pickup.type);
  }

  if (remaining.length === gameState.pickups.length) return;
  gameState.pickups = remaining;
  updateScorePanel();
}

function updateWinCondition() {
  if (gameState.status === 'won' || gameState.status === 'game-over' || !gameState.maya.following) return;

  const trevorIsInside = isInsideWaffleHouseBuilding(gameState.player.x, gameState.player.y);
  const mayaHasArrived = isInsideWaffleHouseAccess(gameState.maya.x, gameState.maya.y);
  if (!trevorIsInside || !mayaHasArrived) return;

  gameState.status = 'won';
  pressedKeys.clear();
  pauseButton.disabled = true;
  saveBestScore(gameState.score);
  statusText.textContent = `Level ${gameState.level} complete! ${gameState.player.name} and Maya reached Waffle House.`;
  showLevelCompleteScreen();
  winOverlay.hidden = false;
  // Focused so Enter or Space starts the next level; nothing else moves the game on.
  nextLevelButton.focus();
  updateRescuePanel();
}

// The parts of the guest check that the level-complete and game-over screens share.
function getGuestCheck() {
  const { waffle, tab } = gameState.collected;
  const { waffle: waffleType, tab: tabType } = PICKUP_TYPES;
  return {
    heading: 'GUEST CHECK',
    meta: [`TABLE: LEVEL ${gameState.level}`, `SERVER: ${gameState.player.name.toUpperCase()}`],
    lines: [
      { quantity: waffle, item: 'WAFFLES', price: `@${waffleType.points}`, amount: waffle * waffleType.points },
      { quantity: tab, item: 'SODA TABS', price: `@${tabType.points}`, amount: tab * tabType.points },
    ],
    total: { label: 'TOTAL', amount: gameState.score },
    footer: 'THANK YOU · COME AGAIN',
  };
}

// Level complete: "ORDER UP!" in sign tiles, the run so far on a guest check, and the
// next level's dinosaurs on the menu board.
function showLevelCompleteScreen() {
  const nextLevel = gameState.level + 1;
  const next = getLevelSettings(nextLevel, FORCED_SPECIES_ID);
  const check = getGuestCheck();

  setTiles(winTiles, 'ORDER UP!');
  winTitleText.textContent = `Maya made it to Waffle House · Level ${gameState.level} complete`;
  printCheck(winCheck, {
    ...check,
    lines: [...check.lines, { quantity: 1, item: 'MAYA ROSE BARKER', amount: 'PRICELESS' }],
    stamp: 'RESCUED',
  });
  winNextLevelText.textContent = `Level ${nextLevel}`;
  winNextNameText.textContent = next.species.plural;
  winNextDetailText.textContent = next.species.menuLine(next);
  winNextDinosaurSprite.setFrames(dinosaurFrames[next.species.id]);
}

// The "level complete" screen stays up until the player presses its button (or Enter).
function startNextLevel() {
  if (gameState.status !== 'won') return;
  pressedKeys.clear();
  resetGameState({ level: gameState.level + 1, score: gameState.score, collected: gameState.collected });
  previousFrameTime = performance.now();
  canvas.focus();
}

function loadBestScore() {
  try {
    return Number(window.localStorage.getItem(BEST_SCORE_STORAGE_KEY)) || 0;
  } catch {
    return 0; // storage can be blocked (private windows)
  }
}

// Returns true when this score beats the saved best.
function saveBestScore(score) {
  if (score <= loadBestScore()) return false;
  try {
    window.localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(score));
  } catch {
    // Not remembered this time.
  }
  return true;
}

// ---- Online leaderboard (see leaderboard.js) ----
// Bumped on every game over and restart, so a slow save or load from an earlier run
// can't update the screen for a later one.
let leaderboardRunId = 0;

function loadPlayerName() {
  try {
    return window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

function savePlayerName(name) {
  try {
    window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, name);
  } catch {
    // Not remembered this time.
  }
}

// Fills a top-10 list. Names and messages go in as plain text, never HTML.
function renderLeaderboard(list, note, rows, highlightId) {
  list.replaceChildren(...rows.map((row, index) => {
    const item = document.createElement('li');
    item.className = 'leaderboard__row';
    if (row.id === highlightId) item.classList.add('is-you');
    const cells = [
      ['leaderboard__rank', `${index + 1}.`],
      ['leaderboard__name', row.name],
      ['leaderboard__level', `Lv ${row.level}`],
      ['leaderboard__score', String(row.score)],
    ];
    if (row.message) cells.push(['leaderboard__message', `“${row.message}”`]);
    for (const [className, text] of cells) {
      const cell = document.createElement('span');
      cell.className = className;
      cell.textContent = text;
      item.append(cell);
    }
    return item;
  }));
  note.textContent = rows.length ? '' : 'No scores yet — be the first!';
}

async function loadLeaderboard(list, note, highlightId = null) {
  const runId = leaderboardRunId;
  note.textContent = 'Loading…';
  try {
    const rows = await fetchTopScores(10);
    if (runId !== leaderboardRunId) return;
    renderLeaderboard(list, note, rows, highlightId);
  } catch {
    if (runId !== leaderboardRunId) return;
    list.replaceChildren();
    note.textContent = 'Leaderboard unavailable right now.';
  }
}

function setScoreFormBusy(isBusy) {
  scoreSubmitButton.disabled = isBusy;
  scoreNameInput.disabled = isBusy;
  scoreMessageInput.disabled = isBusy;
}

// Game over: offer the leaderboard form for runs that scored, otherwise just show the list.
function showScoreForm() {
  leaderboardRunId += 1;
  const scored = gameState.score > 0;
  scoreForm.hidden = !scored;
  setScoreFormBusy(false);
  scoreNameInput.value = loadPlayerName();
  scoreMessageInput.value = '';
  scoreStatusText.textContent = '';
  gameOverLeaderboard.hidden = scored;
  if (!scored) loadLeaderboard(gameOverLeaderboardList, gameOverLeaderboardNote);
}

async function handleScoreSubmit(event) {
  event.preventDefault();
  const name = scoreNameInput.value.trim();
  if (!name) {
    scoreStatusText.textContent = 'Please enter a name.';
    scoreNameInput.focus();
    return;
  }

  const runId = leaderboardRunId;
  const run = { score: gameState.score, level: gameState.level };
  setScoreFormBusy(true);
  scoreStatusText.textContent = 'Saving…';
  try {
    const row = await submitScore({ name, message: scoreMessageInput.value, ...run });
    savePlayerName(name);
    const rank = await fetchRank(run.score).catch(() => null);
    if (runId !== leaderboardRunId) return;
    scoreForm.hidden = true;
    scoreStatusText.textContent = rank ? `Saved! You're #${rank} on the leaderboard.` : 'Saved!';
    gameOverLeaderboard.hidden = false;
    loadLeaderboard(gameOverLeaderboardList, gameOverLeaderboardNote, row?.id);
  } catch {
    if (runId !== leaderboardRunId) return;
    setScoreFormBusy(false);
    scoreStatusText.textContent = "Couldn't save — try again.";
  }
}

// Keys typed into the leaderboard form belong to the form, not the game.
function isTypingTarget(target) {
  return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(value, maximum));
}

function updateCamera() {
  const playerScreenX = gameState.player.x - camera.x;
  const playerScreenY = gameState.player.y - camera.y;

  // The weather ticker covers the bottom of the map, so leave it out of the visible area.
  // Its space is always reserved, so the view doesn't jump when it slides in or out.
  const visibleHeight = viewport.height - weatherTickerElement.offsetHeight * viewport.worldPerCssPixel;
  const horizontalMargin = Math.min(
    Math.max(viewport.width * CAMERA_DEAD_ZONE.left, CAMERA_MIN_LOOKAHEAD),
    viewport.width * 0.45,
  );
  const verticalMargin = Math.min(
    Math.max(visibleHeight * CAMERA_DEAD_ZONE.top, CAMERA_MIN_LOOKAHEAD),
    visibleHeight * 0.45,
  );
  const deadZone = {
    left: horizontalMargin,
    right: viewport.width - horizontalMargin,
    top: verticalMargin,
    bottom: visibleHeight - verticalMargin,
  };

  if (playerScreenX < deadZone.left) camera.x = gameState.player.x - deadZone.left;
  else if (playerScreenX > deadZone.right) camera.x = gameState.player.x - deadZone.right;
  if (playerScreenY < deadZone.top) camera.y = gameState.player.y - deadZone.top;
  else if (playerScreenY > deadZone.bottom) camera.y = gameState.player.y - deadZone.bottom;
  clampCameraToWorld();
  keepPlayerClearOfHud();
}

function clampCameraToWorld() {
  camera.x = clamp(camera.x, 0, Math.max(0, WORLD_WIDTH - viewport.width));
  camera.y = clamp(camera.y, 0, Math.max(0, WORLD_HEIGHT - viewport.height));
}

function isUnderHudRect(x, y, rect, padding) {
  return x > rect.left - padding && x < rect.right + padding && y > rect.top - padding && y < rect.bottom + padding;
}

// If the hero would be under the corner HUD, slide the view so they sit just below it, or
// beside it when the view can't scroll that way (at the top of the map).
function keepPlayerClearOfHud() {
  for (const rect of hudRects) {
    const screenX = gameState.player.x - camera.x;
    const screenY = gameState.player.y - camera.y;
    if (!isUnderHudRect(screenX, screenY, rect, HUD_CLEARANCE)) continue;

    camera.y = gameState.player.y - (rect.bottom + HUD_CLEARANCE);
    clampCameraToWorld();
    if (!isUnderHudRect(gameState.player.x - camera.x, gameState.player.y - camera.y, rect, HUD_CLEARANCE)) continue;

    // Step out sideways, away from the corner the HUD sits in.
    const sitsOnRight = rect.left + rect.right > viewport.width;
    camera.x = gameState.player.x - (sitsOnRight ? rect.left - HUD_CLEARANCE : rect.right + HUD_CLEARANCE);
    clampCameraToWorld();
  }
}

// Markers that would land under the corner HUD drop to just below it.
function moveOutFromUnderHud(x, y) {
  for (const rect of hudRects) {
    if (isUnderHudRect(x, y, rect, TRACKER_EDGE_PADDING)) {
      y = Math.min(rect.bottom + TRACKER_EDGE_PADDING, viewport.height - TRACKER_EDGE_PADDING);
    }
  }
  return { x, y };
}

// bottomInset keeps arrows above anything covering the bottom of the screen (the weather ticker).
function drawEdgeTracker(target, label, color, laneOffset = 0, bottomInset = 0) {
  const screenX = target.x - camera.x;
  const screenY = target.y - camera.y;
  const targetIsVisible = screenX >= 18
    && screenX <= viewport.width - 18
    && screenY >= 18
    && screenY <= viewport.height - 18 - bottomInset;
  if (targetIsVisible) return;

  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;
  const deltaX = screenX - centerX;
  const deltaY = screenY - centerY;
  const angle = Math.atan2(deltaY, deltaX);
  const horizontalScale = (centerX - TRACKER_EDGE_PADDING) / Math.max(Math.abs(deltaX), 0.001);
  const verticalScale = (centerY - TRACKER_EDGE_PADDING) / Math.max(Math.abs(deltaY), 0.001);
  const edgeScale = Math.min(horizontalScale, verticalScale);
  const arrowX = clamp(
    centerX + deltaX * edgeScale - Math.sin(angle) * laneOffset,
    TRACKER_EDGE_PADDING,
    viewport.width - TRACKER_EDGE_PADDING,
  );
  const arrowY = clamp(
    centerY + deltaY * edgeScale + Math.cos(angle) * laneOffset,
    TRACKER_EDGE_PADDING,
    viewport.height - TRACKER_EDGE_PADDING - bottomInset,
  );
  const { x: clearArrowX, y: clearArrowY } = moveOutFromUnderHud(arrowX, arrowY);
  const badgeX = clearArrowX - Math.cos(angle) * 25;
  const badgeY = clearArrowY - Math.sin(angle) * 25;

  context.save();
  context.translate(clearArrowX, clearArrowY);
  context.rotate(angle);
  context.beginPath();
  context.moveTo(14, 0);
  context.lineTo(-8, -10);
  context.lineTo(-8, 10);
  context.closePath();
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = '#fffaf0';
  context.lineWidth = 3;
  context.stroke();
  context.restore();

  context.beginPath();
  context.arc(badgeX, badgeY, 13, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.strokeStyle = '#fffaf0';
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = '#ffffff';
  context.font = '900 12px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(label, badgeX, badgeY + 0.5);
  context.textAlign = 'start';
  context.textBaseline = 'alphabetic';
}

function drawTrackers() {
  // The ticker is sized in CSS pixels; convert to canvas pixels.
  const tickerInset = weatherTicker.getVisibleHeight() * viewport.worldPerCssPixel;
  // An arrow at the edge of the screen always points at the current goal: Maya (M) until
  // she's found, then Waffle House (W), which moves between games. The How to play
  // guide tells players to follow them.
  if (gameState.maya.following) {
    drawEdgeTracker({ x: waffleHouse.centerX, y: waffleHouse.centerY }, 'W', '#d8920b', 0, tickerInset);
  } else {
    drawEdgeTracker(gameState.maya, 'M', '#e94f91', 0, tickerInset);
  }
  if (!SHOW_DINOSAUR_TRACKERS) return;
  gameState.dinosaurs.forEach((dinosaur, index) => {
    const laneOffset = (index - (gameState.dinosaurs.length - 1) / 2) * 22;
    drawEdgeTracker(dinosaur, `${dinosaur.species.name[0]}${dinosaur.id}`, '#b6382e', laneOffset, tickerInset);
  });
}

function drawGame() {
  // Everything below draws in viewport pixels; this maps them onto the canvas's real pixels.
  const renderScale = canvas.width / viewport.width;
  context.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  context.clearRect(0, 0, viewport.width, viewport.height);
  context.save();
  context.translate(-Math.round(camera.x), -Math.round(camera.y));
  drawMap();
  drawWaffleHouse();
  // Trains pass under waffles and characters so they never hide gameplay.
  drawMartaTrains(context, marta, { x: camera.x, y: camera.y, width: viewport.width, height: viewport.height });
  gameState.pickups.forEach(drawPickup);
  drawPickupPopups();
  drawFloodMarkers();
  gameState.dinosaurs.forEach(drawWadingRipples);
  gameState.dinosaurs.forEach(drawDinosaur);
  drawWadingRipples(gameState.maya);
  drawMaya();
  drawWadingRipples(gameState.player);
  drawPlayer();
  context.restore();
  drawStormLighting();
  drawRain(context, rain, getRainIntensity(gameState.storm.progress, WEATHER));
  drawTrackers();
}

function gameLoop(timestamp) {
  // A frame's timestamp can be slightly earlier than the performance.now() recorded
  // at load or on Start, so never let time run backwards: a negative step animated
  // sprites into frame -1 and crashed drawing (the "Trevor missing on reload" bug).
  const deltaTime = clamp((timestamp - previousFrameTime) / 1000, 0, 0.032);
  previousFrameTime = timestamp;
  if (hasStarted && !isPaused) {
    updatePlayer(deltaTime);
    updateMaya(deltaTime);
    updateDinosaurs(deltaTime);
    updatePickups();
    updateMarta(marta, deltaTime);
    updateStorm(deltaTime);
    updateFloodZones(deltaTime);
    if (gameState.status !== 'won' && gameState.status !== 'game-over') {
      updateTickerRoundup(deltaTime);
      weatherTicker.update(deltaTime);
    }
    updateWinCondition();
    updateCamera();
    updateRain(
      rain,
      deltaTime,
      getRainIntensity(gameState.storm.progress, WEATHER),
      camera.x - previousCamera.x,
      camera.y - previousCamera.y,
    );
  }
  previousCamera.x = camera.x;
  previousCamera.y = camera.y;
  drawGame();
  requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
  if (isTypingTarget(event.target)) return;
  if (handleShortcutKey(event)) return;
  if (!ARROW_KEYS.has(event.key)) return;
  event.preventDefault();
  if (!hasStarted || isPaused) return;
  pressedKeys.add(event.key);
}

function handleKeyUp(event) {
  if (!ARROW_KEYS.has(event.key)) return;
  if (!isTypingTarget(event.target)) event.preventDefault();
  pressedKeys.delete(event.key);
}

// P or Esc pauses and resumes; Esc also backs out of the restart prompt; M toggles music;
// Enter starts the next level from the "level complete" screen.
// Returns true when the key was used.
function handleShortcutKey(event) {
  if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return false;
  const key = event.key.toLowerCase();
  // Typing into a button (Space/Enter) or a form control is left to the browser.
  if (key === 'escape' && !restartOverlay.hidden) {
    cancelRestart();
  } else if (key === 'enter' && hasStarted && gameState.status === 'won') {
    // Enter on a focused button (Next level, Restart, Music) is that button's own click.
    if (event.target instanceof HTMLButtonElement) return false;
    startNextLevel();
  } else if (key === 'p' || key === 'escape') {
    if (!restartOverlay.hidden) return false;
    togglePause();
  } else if (key === 'm') {
    toggleMusic();
  } else {
    return false;
  }
  event.preventDefault();
  return true;
}

// Mid-run, Restart asks first (it throws away the run); otherwise it restarts right away.
let wasPausedBeforeRestartPrompt = false;
function requestRestart() {
  const runInProgress = hasStarted && gameState.status !== 'won' && gameState.status !== 'game-over';
  if (!runInProgress) {
    restartGame();
    return;
  }
  wasPausedBeforeRestartPrompt = isPaused;
  setPaused(true);
  pauseOverlay.hidden = true;
  restartOverlay.hidden = false;
  restartCancelButton.focus();
}

function cancelRestart() {
  restartOverlay.hidden = true;
  setPaused(wasPausedBeforeRestartPrompt);
  pauseOverlay.hidden = !isPaused;
  if (!isPaused) canvas.focus();
}

function restartGame() {
  leaderboardRunId += 1;
  loadLeaderboard(startLeaderboardList, startLeaderboardNote);
  hasStarted = false;
  isPaused = false;
  shouldResetOnStart = true;
  pressedKeys.clear();
  winOverlay.hidden = true;
  gameOverOverlay.hidden = true;
  pauseOverlay.hidden = true;
  startOverlay.hidden = false;
  restartOverlay.hidden = true;
  pauseButton.disabled = true;
  updatePauseButton();
  statusText.textContent = 'Ready — press Start Game to begin a new rescue.';
  rescueTag.hidden = true;
  music.play(); // back on the start screen, where the music plays (it may have been paused)
  hudStrip.classList.remove('is-danger');
  drawGame();
}

function loadSavedCharacterId() {
  try {
    return window.localStorage.getItem(CHARACTER_STORAGE_KEY);
  } catch {
    return null; // storage can be blocked (private windows); fall back to the default
  }
}

// Picking a hero on the start screen swaps the sprite and the name used in messages.
function selectCharacter(id) {
  selectedCharacterId = findCharacter(id).id;
  try {
    window.localStorage.setItem(CHARACTER_STORAGE_KEY, selectedCharacterId);
  } catch {
    // Not remembered this time; the choice still applies to this session.
  }
  gameState.player.name = findCharacter(selectedCharacterId).name;
  startScene.setHero(heroFrames[selectedCharacterId]);
  winHeroSprite.setFrames(heroFrames[selectedCharacterId].slice(0, 1));
}

// The start screen has two buttons. "Start game" goes straight into the run; "Start with
// intro" plays the cutscene first (introScene.js). The game stays frozen behind the
// cutscene because hasStarted is still false.
let isIntroPlaying = false;
function startGame() {
  if (isIntroPlaying) return;
  unlockSounds();
  beginRun();
}

function startGameWithIntro() {
  if (isIntroPlaying) return;
  // The start screen's music stops for the intro and comes back when the run begins.
  // Sound has to be switched on from inside the click for that to work later.
  unlockSounds();
  music.pause();
  music.prime();
  isIntroPlaying = true;
  startOverlay.hidden = true;
  statusText.textContent = 'Intro playing. Press Escape to skip.';
  const character = findCharacter(selectedCharacterId);
  playIntro({
    host: canvas.parentElement,
    heroFrames: heroFrames[selectedCharacterId],
    heroSeatedFrame: character.createSeatedFrame(),
    heroName: character.name,
    // Runs once, whether the intro finished or was skipped.
    onDone: () => {
      isIntroPlaying = false;
      beginRun();
    },
  });
}

function beginRun() {
  hasStarted = true;
  if (shouldResetOnStart) {
    shouldResetOnStart = false;
    resetGameState();
  }
  gameState.player.name = findCharacter(selectedCharacterId).name;
  updateRescuePanel();
  isPaused = false;
  pressedKeys.clear();
  previousFrameTime = performance.now();
  startOverlay.hidden = true;
  pauseButton.disabled = false;
  statusText.textContent = getLevelIntro();
  music.play();
  canvas.focus();
}

// The music button mutes the sound effects too. Runs at load and on every toggle.
function updateMusicButton() {
  const muted = music.isMuted();
  setSoundsMuted(muted);
  musicButton.dataset.state = muted ? 'off' : 'on';
  musicButton.setAttribute('aria-label', muted ? 'Music off' : 'Music on');
  musicButton.setAttribute('aria-pressed', String(!muted));
}

function toggleMusic() {
  // On the start screen the browser may not have let the music start yet (see
  // startMenuMusic). Then the first press starts it instead of muting it.
  const waitingToStart = !hasStarted && !isIntroPlaying && !music.isMuted() && !music.isPlaying();
  if (waitingToStart) music.play();
  else music.toggleMuted();
  updateMusicButton();
}

// The music plays on the start screen too. Browsers only let sound start after a click or
// key press, so this is tried when the page opens and again on each one while the start
// screen is up. The music key, M, and "Start with intro" are left out: the first two have
// their own say in toggleMusic, and the intro wants quiet.
function startMenuMusic(event) {
  if (hasStarted || isIntroPlaying) return;
  if (event) {
    if (musicButton.contains(event.target) || startIntroButton.contains(event.target)) return;
    if (event.key?.toLowerCase() === 'm') return;
  }
  music.play();
}

// The pause button shows a pause icon while playing and a play icon while paused.
function updatePauseButton() {
  pauseButton.dataset.state = isPaused ? 'off' : 'on';
  pauseButton.setAttribute('aria-label', isPaused ? 'Resume game' : 'Pause game');
}

function togglePause() {
  setPaused(!isPaused);
}

function setPaused(paused) {
  if (!hasStarted || gameState.status === 'won' || gameState.status === 'game-over') return;
  if (paused === isPaused) return;

  isPaused = paused;
  pressedKeys.clear();
  pauseOverlay.hidden = !isPaused;
  updatePauseButton();
  if (isPaused) music.pause();
  else music.play();
  statusText.textContent = isPaused
    ? 'Game paused.'
    : gameState.maya.following
      ? `Maya is following ${gameState.player.name} — reach Waffle House!`
      : `Find Maya at ${gameState.maya.address}`;
}

canvas.tabIndex = -1;
startButton.addEventListener('click', startGame);
startIntroButton.addEventListener('click', startGameWithIntro);
scoreForm.addEventListener('submit', handleScoreSubmit);
loadLeaderboard(startLeaderboardList, startLeaderboardNote);
restartButton.addEventListener('click', requestRestart);
restartConfirmButton.addEventListener('click', restartGame);
restartCancelButton.addEventListener('click', cancelRestart);
nextLevelButton.addEventListener('click', startNextLevel);
playAgainButton.addEventListener('click', restartGame);
pauseButton.addEventListener('click', togglePause);
musicButton.addEventListener('click', () => {
  toggleMusic();
  canvas.focus();
});
updateMusicButton();
startMenuMusic();
window.addEventListener('pointerdown', startMenuMusic);
window.addEventListener('keydown', startMenuMusic);
window.addEventListener('keydown', handleKeyDown);
const touchStick = createTouchStick({
  surface: canvas,
  stick: document.querySelector('#touch-stick'),
  knob: document.querySelector('#touch-stick-knob'),
  canUse: () => hasStarted && !isPaused && gameState.status !== 'won' && gameState.status !== 'game-over',
});
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('blur', () => pressedKeys.clear());

// Fits the view to the game frame: works out how much map it shows (see viewport) and
// gives the canvas enough real pixels to stay sharp on high-density screens.
function resizeViewport() {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  if (!cssWidth || !cssHeight) return;

  const longSide = Math.max(cssWidth, cssHeight);
  const shortSide = Math.min(cssWidth, cssHeight);
  const zoomedOut = Math.max(1, MIN_VIEW_WIDTH / longSide, MIN_VIEW_HEIGHT / shortSide);
  viewport.worldPerCssPixel = Math.min(zoomedOut, MAX_VIEW_WIDTH / cssWidth, MAX_VIEW_HEIGHT / cssHeight);
  viewport.width = Math.round(cssWidth * viewport.worldPerCssPixel);
  viewport.height = Math.round(cssHeight * viewport.worldPerCssPixel);

  const pixelRatio = Math.min(window.devicePixelRatio || 1, Math.sqrt(MAX_CANVAS_PIXELS / (cssWidth * cssHeight)));
  canvas.width = Math.round(cssWidth * pixelRatio);
  canvas.height = Math.round(cssHeight * pixelRatio);
  rain.width = viewport.width;
  rain.height = viewport.height;

  measureHud();
  if (!gameState) return;
  clampCameraToWorld();
  drawGame();
}

// Records the areas the corner HUD covers, in viewport pixels (see hudRects).
function measureHud() {
  const frameBox = canvas.getBoundingClientRect();
  if (!frameBox.width) {
    hudRects = [];
    return;
  }
  const scale = viewport.worldPerCssPixel;
  hudRects = [hudStrip, hudControls]
    .map((element) => element.getBoundingClientRect())
    .filter((box) => box.width > 0)
    .map((box) => ({
      left: (box.left - frameBox.left) * scale,
      right: (box.right - frameBox.left) * scale,
      top: (box.top - frameBox.top) * scale,
      bottom: (box.bottom - frameBox.top) * scale,
    }));
  // The level-complete and game-over screens start their sign below the corner buttons
  // (diner.css), however many rows those wrap onto.
  const controlsBottom = hudControls.getBoundingClientRect().bottom - frameBox.top;
  canvas.parentElement.style.setProperty('--hud-clearance', `${Math.round(controlsBottom)}px`);
}

resizeViewport();
new ResizeObserver(resizeViewport).observe(canvas);
new ResizeObserver(measureHud).observe(hudStrip);
new ResizeObserver(measureHud).observe(hudControls);

// HUD icons use the same pixel sprites as the map; CSS scales them up.
function paintPanelSprite(panelCanvas, frame) {
  panelCanvas.width = frame.width;
  panelCanvas.height = frame.height;
  panelCanvas.getContext('2d').drawImage(frame, 0, 0);
}
paintPanelSprite(document.querySelector('#maya-token'), mayaFrames.walk[0]);
paintPanelSprite(document.querySelector('#waffle-token'), createHudIcon('waffle'));
paintPanelSprite(document.querySelector('#tab-token'), sodaTabSprite);
// The pictures on the Music, Pause and Restart keys.
for (const iconCanvas of document.querySelectorAll('.hud-button canvas[data-icon]')) {
  paintPanelSprite(iconCanvas, createHudIcon(iconCanvas.dataset.icon));
}

const startScene = startChaseScene(document.querySelector('#start-scene'), startOverlay, heroFrames[selectedCharacterId]);
// Sprites on the diner screens: the hero (standing) and Maya (sitting, tail wagging) on
// the level-complete floor, the next level's dinosaur on its menu board, and whichever
// dinosaur ended the run on the game-over floor.
const winHeroSprite = createSprite(document.querySelector('#win-hero'), heroFrames[selectedCharacterId].slice(0, 1));
createSprite(document.querySelector('#win-maya'), mayaFrames.sit, 400);
const winNextDinosaurSprite = createSprite(document.querySelector('#win-next-dinosaur'), dinosaurFrames.tRex, 150);
const gameOverDinosaurSprite = createSprite(gameOverDinosaurCanvas, dinosaurFrames.tRex, 180);
setTiles(startTiles, "MAYA'S WAFFLE RESCUE");
// The How to play board on the start screen: its button and its little picture both
// open the guide.
const howToPlayPreview = document.querySelector('#how-to-play-preview');
howToPlayPreview.src = howToPlayPreviewImage;
setUpHowToPlay({
  dialog: document.querySelector('#how-to-play'),
  openers: [document.querySelector('#how-to-play-button'), howToPlayPreview],
});
// The top 10 starts unfolded where there's room for it beside the Start button.
startLeaderboard.open = window.matchMedia('(min-width: 900px) and (min-aspect-ratio: 5/4)').matches;
createCharacterPicker(characterOptions, {
  characters: CHARACTERS,
  framesById: heroFrames,
  selectedId: selectedCharacterId,
  onChange: selectCharacter,
});
resetGameState();
drawGame();
requestAnimationFrame(gameLoop);

export {
  camera, canPlayerOccupy, createFloodZones, gameState, movePlayer, planSpawns, restartGame, waffleHouse,
};
