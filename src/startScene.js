// Looping chase on the start screen: Maya and the chosen hero run right while two
// T-Rexes give chase from the left. The road scrolls underneath so they appear to run
// forever. Draws only while the start screen is visible.
import { createMayaFrames } from './mayaSprite.js';
import { createTRexFrames } from './tRexSprite.js';

const SCENE_WIDTH = 480;
const SCENE_HEIGHT = 124;
const GROUND_Y = 104; // where feet touch the road
const SCROLL_SPEED = 150; // pixels per second the road moves left

const COLORS = {
  grass: '#83d5a1',
  curb: '#e7e2d7',
  road: '#69767c',
  dash: '#f7e8a0',
  lampPost: '#2f3f52',
  lampLight: '#fff1a8',
  bush: '#4f8d45',
  shadow: 'rgba(20, 20, 20, 0.3)',
};

// Background props that scroll past and wrap around.
const PROPS = [
  { type: 'lamp', x: 40 },
  { type: 'bush', x: 150 },
  { type: 'lamp', x: 270 },
  { type: 'bush', x: 330 },
  { type: 'bush', x: 420 },
];
const PROP_WRAP = SCENE_WIDTH + 60;

// heroFrames are the chosen hero's walk frames; swap them later with setHero().
export function startChaseScene(canvas, overlay, heroFrames) {
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pixelRatio = Math.max(1, Math.round(window.devicePixelRatio || 1));
  canvas.width = SCENE_WIDTH * pixelRatio;
  canvas.height = SCENE_HEIGHT * pixelRatio;

  // Each runner: base position, a gentle forward/back drift, and a stride speed.
  const hero = { frames: heroFrames, scale: 2, x: 330, drift: 10, driftSpeed: 1.4, phase: 1, stride: 0.14 };
  const runners = [
    { frames: createTRexFrames(), scale: 3, x: 62, drift: 16, driftSpeed: 1.1, phase: 0, stride: 0.2 },
    { frames: createTRexFrames(), scale: 3, x: 150, drift: 20, driftSpeed: 0.8, phase: 2, stride: 0.18 },
    hero,
    { frames: createMayaFrames(), scale: 2, x: 412, drift: 12, driftSpeed: 1.7, phase: 4, stride: 0.11 },
  ];

  function drawGround(time) {
    context.fillStyle = COLORS.grass;
    context.fillRect(0, GROUND_Y - 36, SCENE_WIDTH, 12);
    context.fillStyle = COLORS.curb;
    context.fillRect(0, GROUND_Y - 24, SCENE_WIDTH, 4);
    context.fillRect(0, SCENE_HEIGHT - 4, SCENE_WIDTH, 4);
    context.fillStyle = COLORS.road;
    context.fillRect(0, GROUND_Y - 20, SCENE_WIDTH, SCENE_HEIGHT - GROUND_Y + 16);

    // Center-line dashes slide left to sell the motion.
    const dashLength = 22;
    const dashGap = 18;
    const dashPeriod = dashLength + dashGap;
    const offset = (time * SCROLL_SPEED) % dashPeriod;
    context.fillStyle = COLORS.dash;
    for (let x = -offset; x < SCENE_WIDTH; x += dashPeriod) {
      context.fillRect(Math.round(x), GROUND_Y + 4, dashLength, 3);
    }
  }

  function drawProps(time) {
    // Props sit on the grass behind the road and move a little slower (parallax).
    const offset = (time * SCROLL_SPEED * 0.6) % PROP_WRAP;
    for (const prop of PROPS) {
      let x = prop.x - offset;
      if (x < -30) x += PROP_WRAP;
      x = Math.round(x);
      const baseY = GROUND_Y - 26;
      if (prop.type === 'lamp') {
        context.fillStyle = COLORS.lampPost;
        context.fillRect(x, baseY - 46, 3, 46);
        context.fillRect(x, baseY - 46, 12, 3);
        context.fillStyle = COLORS.lampLight;
        context.fillRect(x + 9, baseY - 43, 5, 4);
      } else {
        context.fillStyle = COLORS.bush;
        context.fillRect(x, baseY - 10, 18, 10);
        context.fillRect(x + 4, baseY - 15, 10, 5);
      }
    }
  }

  function drawRunner(runner, time) {
    const frameIndex = Math.floor(time / runner.stride) % runner.frames.length;
    const frame = runner.frames[frameIndex];
    const width = frame.width * runner.scale;
    const height = frame.height * runner.scale;
    const x = Math.round(runner.x + Math.sin(time * runner.driftSpeed + runner.phase) * runner.drift);
    const bob = frameIndex === 1 ? -runner.scale : 0;

    context.fillStyle = COLORS.shadow;
    context.beginPath();
    context.ellipse(x, GROUND_Y, width * 0.34, 4, 0, 0, Math.PI * 2);
    context.fill();

    context.drawImage(frame, Math.round(x - width / 2), GROUND_Y - height + bob, width, height);
  }

  function draw(time) {
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
    drawProps(time);
    drawGround(time);
    runners.forEach((runner) => drawRunner(runner, time));
  }

  function frame(timestamp) {
    // Skip drawing while the start screen is hidden; the loop itself is cheap.
    if (!overlay.hidden) draw(reducedMotion.matches ? 0 : timestamp / 1000);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);

  return {
    setHero(frames) {
      hero.frames = frames;
    },
  };
}
