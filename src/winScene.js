// The picture on the "level complete" screen: the hero and Maya safe outside Waffle
// House. The hero hops for joy, Maya sits wagging her tail, a heart floats between them
// and sparkles twinkle over the roof. Draws only while that screen is visible.
import { createMayaStateFrames } from './mayaSprite.js';
import { createWaffleHouseSprite } from './waffleHouseSprite.js';

const SCENE_WIDTH = 320;
const SCENE_HEIGHT = 124;
const GROUND_Y = 106; // where feet and the building's sidewalk touch the ground
const SPRITE_SCALE = 2;
const WAFFLE_HOUSE_X = 34;
const HERO_X = 226;
const MAYA_X = 276;
const MAYA_SIT_FRAME_DURATION = 0.4;
const HOP_HEIGHT = 7;
const HOPS_PER_SECOND = 1.6;

const COLORS = {
  grass: '#83d5a1',
  curb: '#e7e2d7',
  lot: '#69767c',
  lotLine: '#f7e8a0',
  shadow: 'rgba(20, 20, 20, 0.3)',
  heart: '#ff6f91',
  heartShine: '#ffd1dc',
  sparkle: '#ffd44a',
};

// One character per pixel; drawn at SPRITE_SCALE.
const HEART_ROWS = [
  '.hh.hh.',
  'hshhhhh',
  'hhhhhhh',
  '.hhhhh.',
  '..hhh..',
  '...h...',
];

// Sparkles over the roof: position, and where each one is in its twinkle.
const SPARKLES = [
  { x: 22, y: 30, phase: 0 },
  { x: 64, y: 12, phase: 1.3 },
  { x: 126, y: 8, phase: 2.6 },
  { x: 196, y: 20, phase: 0.7 },
  { x: 252, y: 36, phase: 3.4 },
  { x: 302, y: 16, phase: 2 },
];

// heroFrames are the chosen hero's walk frames; swap them later with setHero().
export function startWinScene(canvas, overlay, heroFrames) {
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pixelRatio = Math.max(1, Math.round(window.devicePixelRatio || 1));
  canvas.width = SCENE_WIDTH * pixelRatio;
  canvas.height = SCENE_HEIGHT * pixelRatio;

  const waffleHouse = createWaffleHouseSprite();
  const mayaSitFrames = createMayaStateFrames().sit;
  let hero = heroFrames;

  function drawGround() {
    context.fillStyle = COLORS.grass;
    context.fillRect(0, GROUND_Y - 12, SCENE_WIDTH, 12);
    context.fillStyle = COLORS.curb;
    context.fillRect(0, GROUND_Y, SCENE_WIDTH, 3);
    context.fillStyle = COLORS.lot;
    context.fillRect(0, GROUND_Y + 3, SCENE_WIDTH, SCENE_HEIGHT - GROUND_Y - 3);
    // Parking bay lines.
    context.fillStyle = COLORS.lotLine;
    for (let x = 18; x < SCENE_WIDTH; x += 44) context.fillRect(x, GROUND_Y + 7, 3, SCENE_HEIGHT - GROUND_Y - 7);
  }

  function drawShadow(x, width) {
    context.fillStyle = COLORS.shadow;
    context.beginPath();
    context.ellipse(x, GROUND_Y + 1, width * 0.36, 3, 0, 0, Math.PI * 2);
    context.fill();
  }

  // Draws a sprite standing on the ground, centred on x; lift raises it, and facing -1
  // mirrors it to look left.
  function drawStanding(frame, x, lift = 0, facing = 1) {
    const width = frame.width * SPRITE_SCALE;
    const height = frame.height * SPRITE_SCALE;
    drawShadow(x, width);
    context.save();
    context.translate(x, GROUND_Y - height - Math.round(lift));
    context.scale(facing, 1);
    context.drawImage(frame, -width / 2, 0, width, height);
    context.restore();
  }

  function drawPixels(rows, left, top, colors) {
    rows.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (!colors[pixel]) return;
        context.fillStyle = colors[pixel];
        context.fillRect(left + x * SPRITE_SCALE, top + y * SPRITE_SCALE, SPRITE_SCALE, SPRITE_SCALE);
      });
    });
  }

  function drawSparkle({ x, y, phase }, time) {
    // Grows from a dot to a plus and back.
    const size = Math.round((Math.sin(time * 3 + phase) + 1) * 1.5); // 0 to 3
    if (size === 0) return;
    context.fillStyle = COLORS.sparkle;
    context.fillRect(x, y, 2, 2);
    if (size < 2) return;
    const arm = (size - 1) * 2;
    context.fillRect(x - arm, y, arm, 2);
    context.fillRect(x + 2, y, arm, 2);
    context.fillRect(x, y - arm, 2, arm);
    context.fillRect(x, y + 2, 2, arm);
  }

  function draw(time) {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    drawGround();
    SPARKLES.forEach((sparkle) => drawSparkle(sparkle, time));

    const houseWidth = waffleHouse.width * SPRITE_SCALE;
    const houseHeight = waffleHouse.height * SPRITE_SCALE;
    context.drawImage(waffleHouse, WAFFLE_HOUSE_X, GROUND_Y + 2 - houseHeight, houseWidth, houseHeight);

    const hop = Math.abs(Math.sin(time * Math.PI * HOPS_PER_SECOND)) * HOP_HEIGHT;
    drawStanding(hero[0], HERO_X, hop);
    const mayaFrame = mayaSitFrames[Math.floor(time / MAYA_SIT_FRAME_DURATION) % mayaSitFrames.length];
    drawStanding(mayaFrame, MAYA_X, 0, -1);

    const heartLeft = Math.round((HERO_X + MAYA_X) / 2) - HEART_ROWS[0].length;
    const heartTop = 38 + Math.round(Math.sin(time * 2.4) * 3);
    drawPixels(HEART_ROWS, heartLeft, heartTop, { h: COLORS.heart, s: COLORS.heartShine });
  }

  function frame(timestamp) {
    // Skip drawing while the screen is hidden; the loop itself is cheap.
    if (!overlay.hidden) draw(reducedMotion.matches ? 0.35 : timestamp / 1000);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return {
    setHero(frames) {
      hero = frames;
    },
  };
}
