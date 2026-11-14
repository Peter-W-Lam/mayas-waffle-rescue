// Screen-space storm visuals: a darkening tint and falling rain. The storm clock
// in main.js drives them; nothing here affects gameplay.

const TINT_COLOR = '28, 40, 62';
const VIGNETTE_COLOR = '10, 16, 30';
const MAX_TINT_ALPHA = 0.32;
const MAX_VIGNETTE_ALPHA = 0.38;

export const RAIN_MAX_DROPS = 350;
const RAIN_MIN_SPEED = 620;
const RAIN_MAX_SPEED = 900;
const RAIN_MIN_LENGTH = 10;
const RAIN_MAX_LENGTH = 20;
const RAIN_SLANT = -0.22; // horizontal drift per unit of fall, leaning left
const RAIN_COLOR = 'rgba(205, 224, 242, 0.55)';

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

// Linear interpolation across [progress, value] stops.
function interpolateStops(stops, progress) {
  // Strictly before the first stop. At the stop itself the loop below decides, so two
  // stops at the same progress (rain from the very start) give the later one's value.
  if (progress < stops[0][0]) return stops[0][1];
  for (let index = 1; index < stops.length; index += 1) {
    const [endProgress, endValue] = stops[index];
    if (progress > endProgress) continue;
    const [startProgress, startValue] = stops[index - 1];
    const span = endProgress - startProgress;
    return span === 0 ? endValue : lerp(startValue, endValue, (progress - startProgress) / span);
  }
  return stops.at(-1)[1];
}

// 0 before the rain phase, light rain at first, heavy once streets flood, full in the surge.
export function getRainIntensity(progress, weather) {
  if (progress < weather.rainStartsAt) return 0;
  return interpolateStops([
    [weather.rainStartsAt, 0.17],
    [weather.floodWindow[0], 0.7],
    [1, 1],
  ], progress);
}

export function getTintAlpha(progress, weather) {
  return interpolateStops([
    [weather.cloudsStartAt, 0],
    [weather.rainStartsAt, 0.12],
    [weather.floodWindow[0], 0.2],
    [1, MAX_TINT_ALPHA],
  ], progress);
}

export function drawStormTint(context, progress, weather, width, height) {
  const tintAlpha = getTintAlpha(progress, weather);
  if (tintAlpha <= 0) return;

  context.fillStyle = `rgba(${TINT_COLOR}, ${tintAlpha})`;
  context.fillRect(0, 0, width, height);

  // Darker edges build up once the streets start flooding.
  const vignetteAmount = Math.max(0, (progress - weather.floodWindow[0]) / (1 - weather.floodWindow[0]));
  if (vignetteAmount <= 0) return;
  const gradient = context.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.35,
    width / 2,
    height / 2,
    Math.hypot(width, height) / 2,
  );
  gradient.addColorStop(0, `rgba(${VIGNETTE_COLOR}, 0)`);
  gradient.addColorStop(1, `rgba(${VIGNETTE_COLOR}, ${MAX_VIGNETTE_ALPHA * vignetteAmount})`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
}

function resetDrop(drop, width, height, anywhere) {
  drop.x = Math.random() * (width + height * Math.abs(RAIN_SLANT));
  drop.y = anywhere ? Math.random() * height : -Math.random() * height * 0.2;
  drop.speed = lerp(RAIN_MIN_SPEED, RAIN_MAX_SPEED, Math.random());
  drop.length = lerp(RAIN_MIN_LENGTH, RAIN_MAX_LENGTH, Math.random());
}

// A fixed pool of drops; intensity decides how many of them are active.
export function createRain(width, height) {
  const drops = Array.from({ length: RAIN_MAX_DROPS }, () => {
    const drop = {};
    resetDrop(drop, width, height, true);
    return drop;
  });
  return { drops, width, height };
}

function getActiveDropCount(intensity) {
  return Math.round(RAIN_MAX_DROPS * Math.min(1, Math.max(0, intensity)));
}

// Camera movement shifts the drops the other way, so rain feels like it's
// falling in the world rather than stuck to the screen.
export function updateRain(rain, deltaTime, intensity, cameraDeltaX, cameraDeltaY) {
  const { drops, width, height } = rain;
  const activeCount = getActiveDropCount(intensity);
  const wrapWidth = width + height * Math.abs(RAIN_SLANT);

  for (let index = 0; index < activeCount; index += 1) {
    const drop = drops[index];
    const fall = drop.speed * deltaTime;
    drop.x += fall * RAIN_SLANT - cameraDeltaX;
    drop.y += fall - cameraDeltaY;

    // Modulo wrapping copes with big camera jumps (e.g. a restart).
    if (drop.y > height) resetDrop(drop, width, height, false);
    else if (drop.y < -drop.length - height * 0.2) drop.y = ((drop.y % height) + height) % height;
    drop.x = ((drop.x % wrapWidth) + wrapWidth) % wrapWidth;
  }
}

export function drawRain(context, rain, intensity) {
  const activeCount = getActiveDropCount(intensity);
  if (activeCount === 0) return;

  context.save();
  context.beginPath();
  for (let index = 0; index < activeCount; index += 1) {
    const drop = rain.drops[index];
    context.moveTo(drop.x, drop.y);
    context.lineTo(drop.x + drop.length * RAIN_SLANT, drop.y + drop.length);
  }
  context.strokeStyle = RAIN_COLOR;
  context.lineWidth = 1.2;
  context.lineCap = 'round';
  context.stroke();
  context.restore();
}
