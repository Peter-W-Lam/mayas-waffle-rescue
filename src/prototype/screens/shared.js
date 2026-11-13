// PROTOTYPE, throwaway. Sample data and sprite helpers shared by the three looks.
// The looks themselves share no layout: each builds its own screen from scratch.
import { findCharacter } from '../../characters.js';
import { createMayaStateFrames } from '../../mayaSprite.js';
import { createWaffleHouseSprite } from '../../waffleHouseSprite.js';
import { createSodaTabSprite } from '../../sodaTabSprite.js';
import { DINOSAUR_SPECIES, getLevelSettings } from '../../dinosaurs.js';

function loadHeroId() {
  try {
    return window.localStorage.getItem('mayas-waffle-weather-rescue:character');
  } catch {
    return null;
  }
}

const hero = findCharacter(loadHeroId());
const mayaFrames = createMayaStateFrames();

// A made-up finished level 1. The next levels' numbers are the game's real ones.
export const SAMPLE = {
  level: 1,
  heroName: hero.name,
  waffles: 12,
  wafflePoints: 10,
  tabs: 4,
  tabPoints: 5,
  score: 140,
  best: 2450,
  upcoming: [2, 3, 4].map((level) => ({ level, ...getLevelSettings(level) })),
};

export const SPRITES = {
  hero: hero.createFrames(),
  mayaSit: mayaFrames.sit,
  mayaWalk: mayaFrames.walk,
  waffleHouse: [createWaffleHouseSprite()],
  sodaTab: [createSodaTabSprite()],
  dinosaurs: Object.fromEntries(
    Object.values(DINOSAUR_SPECIES).map((species) => [species.id, species.createFrames()]),
  ),
};

// Timers started by the current look; main.js clears them before drawing the next one.
const timers = [];

export function stopAllTimers() {
  timers.splice(0).forEach((timer) => {
    clearInterval(timer);
    clearTimeout(timer);
  });
}

export function later(callback, delay) {
  timers.push(setTimeout(callback, delay));
}

// A pixel sprite as a canvas element. `height` is in the stage's --u units, so sprites
// grow with the screen. frameMs > 0 cycles the frames (a walk or a tail wag).
export function sprite(frames, { height, frameMs = 0, flip = false, className = '' } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = frames[0].width;
  canvas.height = frames[0].height;
  canvas.className = `px ${className}`.trim();
  canvas.style.height = `calc(var(--u) * ${height})`;
  canvas.style.width = `calc(var(--u) * ${(height * frames[0].width) / frames[0].height})`;
  if (flip) canvas.style.transform = 'scaleX(-1)';
  const context = canvas.getContext('2d');
  let index = 0;
  const draw = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frames[index % frames.length], 0, 0);
    index += 1;
  };
  draw();
  if (frameMs > 0 && frames.length > 1) timers.push(setInterval(draw, frameMs));
  return canvas;
}

// A little pixel waffle (the game draws its waffles with canvas shapes, not a sprite).
export function waffleIcon(height) {
  const canvas = document.createElement('canvas');
  canvas.width = 9;
  canvas.height = 9;
  canvas.className = 'px';
  canvas.style.height = `calc(var(--u) * ${height})`;
  canvas.style.width = `calc(var(--u) * ${height})`;
  const context = canvas.getContext('2d');
  context.fillStyle = '#7a4a12';
  context.fillRect(0, 0, 9, 9);
  context.fillStyle = '#f2b441';
  context.fillRect(1, 1, 7, 7);
  context.fillStyle = '#c98a1f';
  for (const line of [3, 5]) {
    context.fillRect(line, 1, 1, 7);
    context.fillRect(1, line, 7, 1);
  }
  context.fillStyle = '#ffe08a';
  context.fillRect(1, 1, 2, 1);
  return canvas;
}

// Counts a number up from zero, starting after `delay` ms. format turns it into text.
export function countUp(element, target, { delay = 0, duration = 600, format = String } = {}) {
  element.textContent = format(0);
  later(() => {
    const start = performance.now();
    const timer = setInterval(() => {
      const progress = Math.min(1, (performance.now() - start) / duration);
      element.textContent = format(Math.round(target * progress));
      if (progress === 1) clearInterval(timer);
    }, 30);
    timers.push(timer);
  }, delay);
}

// Builds an element: el('p', 'class names', 'text' | [children]).
export function el(tag, className = '', content = null) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (typeof content === 'string') element.textContent = content;
  else if (Array.isArray(content)) element.append(...content.filter(Boolean));
  else if (content) element.append(content);
  return element;
}

// "T-Rexes", not "T-Rexs".
const PLURAL_NAMES = { tRex: 'T-Rexes', velociraptor: 'Velociraptors', allosaurus: 'Allosauruses' };

export function pluralName(species) {
  return PLURAL_NAMES[species.id] ?? `${species.name}s`;
}
