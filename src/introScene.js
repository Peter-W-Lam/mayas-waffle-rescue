// The intro cutscene, played by the start screen's "Start with intro" button. The hero is
// at home on the couch when rain starts. The TV news says power is failing across the
// neighborhood and only Waffle House still has it; then the apartment's power goes too.
// Maya's bed is empty, something roars past the rooftops, and the hero heads out to find
// her and get her to Waffle House.
//
// It works like a little stage play. INTRO_SCRIPT lists the steps in order ("wait", "say",
// "roar"...), playIntro() runs them one at a time, and the room is redrawn every frame from
// a small "scene" object the steps change. To edit the story, edit INTRO_SCRIPT.
//
// The module is self-contained: it builds its own overlay inside the game frame the first
// time it plays, and its styles are in intro.css.
import './intro.css';
import { createMayaStateFrames } from './mayaSprite.js';
import { createTRexFrames } from './tRexSprite.js';
import { playSound } from './sounds.js';

// The room is drawn at the sprites' own size (one sprite pixel = one canvas pixel) and CSS
// scales the whole canvas up, so furniture and characters share one pixel grid.
const SCENE_WIDTH = 160;
const SCENE_HEIGHT = 90;
const WALL_BOTTOM = 62; // where the wall meets the floor
const OVERSCAN = 4; // walls and floor run past the edges so the roar's shake shows no gap

const TYPING_SPEED = 38; // letters per second in the dialogue box
const WALK_SPEED = 52; // pixels per second
const WALK_STRIDE_DURATION = 0.14;
const EMOTE_DURATION = 1.5;
const STAND_UP_HOP_DURATION = 0.25;
const RAIN_EASE_PER_SECOND = 0.35; // how fast the rain builds toward the level a step asks for

// How each sound file is played (see playSound in sounds.js). The thunder and roar files
// open with a stretch of silence, which `offset` skips so they land on cue; the volumes
// even out how loud the three recordings are.
const INTRO_SOUNDS = {
  thunder: { offset: 0.5, volume: 0.8 },
  rain: { loop: true, fadeIn: 2.5, volume: 2.5, whenReady: true },
  roar: { offset: 1, volume: 2 },
};
// When the intro ends or is skipped, whatever is still playing fades out over this long.
const SOUND_FADE_OUT_SECONDS = 0.6;
const RAIN_FADE_OUT_SECONDS = 1.5;

// Roar timings, in seconds after the roar starts.
const ROAR_DURATION = 2.4;
const ROAR_SHAKE_DURATION = 0.9;
const ROAR_TEXT = 'ROOAAR!';
const ROAR_LETTER_DELAY = 0.07;
const ROAR_TEXT_FADE_START = 1.6;
const ROAR_LIGHTNING = [
  // Each flash: when it peaks and how long it takes to fade.
  { at: 0.15, fade: 0.2 },
  { at: 0.55, fade: 0.3 },
  { at: 1.25, fade: 0.25 },
];

// One step per line; each runs to completion before the next starts. "wait" pauses, "say"
// waits for the player (the hero speaks unless speaker is 'tv'), and everything else
// happens at once (the rain keeps building and the roar keeps playing in the background
// while later steps run).
const INTRO_SCRIPT = [
  // Opens on black with a clap of thunder. A second later the picture fades in, and the
  // sound of the rain fades in with it.
  { do: 'sound', name: 'thunder' },
  { do: 'wait', seconds: 1 },
  { do: 'rain', level: 0.35 },
  { do: 'sound', name: 'rain' },
  { do: 'fade', to: 0, seconds: 1.5 },
  { do: 'wait', seconds: 2.4 },
  { do: 'face', direction: -1 }, // toward the window
  { do: 'emote', mark: '?' },
  { do: 'wait', seconds: 0.7 },
  { do: 'say', text: 'Huh. It’s starting to rain.' },
  { do: 'rain', level: 1 },
  { do: 'tv', show: 'alert' },
  { do: 'face', direction: 1 }, // back to the TV
  { do: 'wait', seconds: 0.9 },
  {
    do: 'say',
    speaker: 'tv',
    text: 'Storm warning! Power is failing across the neighborhood. Waffle House is the only place with power.',
  },
  { do: 'powerCut' }, // the room has been bright until now
  { do: 'wait', seconds: 0.7 },
  { do: 'emote', mark: '!' },
  { do: 'wait', seconds: 1.3 },
  { do: 'face', direction: -1 }, // toward the empty dog bed
  { do: 'emote', mark: '…' },
  { do: 'wait', seconds: 0.9 },
  { do: 'say', text: 'Wait… where’s Maya?' },
  { do: 'wait', seconds: 0.8 },
  { do: 'roar' },
  { do: 'caption', text: 'A roar echoes over the rooftops…' },
  { do: 'wait', seconds: 0.45 },
  { do: 'pose', pose: 'stand' },
  { do: 'emote', mark: '!' },
  { do: 'wait', seconds: 2.1 },
  { do: 'say', text: 'She’s out there with that thing. I have to find her and get her to Waffle House.' },
  { do: 'say', text: 'Hang on, Maya. I’m coming!' },
  // The goal, spelled out, and left on screen for a moment after the picture fades.
  { do: 'caption', text: 'Find Maya and bring her safely to Waffle House.' },
  { do: 'door', open: true },
  { do: 'walk', toX: 39, toFootY: 70 },
  { do: 'fade', to: 1, seconds: 0.6 },
  { do: 'wait', seconds: 1.8 },
];

// The room is modelled on the real loft: white block walls, a white plank ceiling with steel
// trusses, pale wood floor, cream sectional, black door, lockers and a Persian rug.
const COLORS = {
  wall: '#ece8df',
  wallLine: '#dbd6ca',
  ceiling: '#d6d2c6',
  ceilingLine: '#c6c1b4',
  truss: '#fbfaf6',
  duct: '#f6f4ee',
  ductShade: '#c9c4b7',
  floor: '#d9b98c',
  floorLine: '#c3a173',
  floorEdge: '#a89f8f',
  rug: '#b98489',
  rugBorder: '#56688f',
  rugMotif: '#eadfca',
  trim: '#f7f5ef',
  trimShade: '#cfcabd',
  wood: '#5a3524',
  woodLight: '#7a4a2c',
  brass: '#d9a441',
  black: '#1c1c22',
  door: '#1d1d21',
  doorPanel: '#303038',
  doorHandle: '#c9c9d2',
  locker: '#e2dac2',
  lockerLine: '#b3aa92',
  lockerVent: '#8a826e',
  hatNavy: '#27324d',
  hatRed: '#a8323a',
  leash: '#ff6f91',
  curtain: '#f7f5ef',
  curtainFold: '#d6d2c7',
  skyline: '#141a28',
  litWindow: '#ffd98a',
  rainDrop: '#bcd4f2',
  dinosaur: '#0b0e16',
  bed: '#c9a878',
  bedShade: '#8f6f45',
  bedInner: '#e6d4ae',
  plushWhite: '#fbf5ea',
  plushGrey: '#8d919c',
  plushYellow: '#e2b84a',
  plushSpot: '#2a1d17',
  couch: '#ede4cf',
  couchBack: '#d9ceb5',
  couchShade: '#bdb198',
  couchLine: '#93886f', // outline, so the cream couch stands out from the white wall
  throw: '#b5522e',
  throwKnit: '#8f3d22',
  cushion: '#a8323a',
  cushionDark: '#862630',
  mug: '#f7f5ef',
  plant: '#3f8a57',
  plantLight: '#74b87e',
  plantGlass: '#cfe3e6',
  tvBody: '#1c1c22',
  tvStand: '#2e2925',
  tvStandTop: '#443d37',
  tvSky: '#5fb4e8',
  tvSun: '#ffd44a',
  tvCloud: '#ffffff',
  tvBanner: '#1f3f7a',
  tvAlert: '#c0392b',
  tvAlertDim: '#8f241b',
  tvAlertBanner: '#ffd44a',
  tvAlertText: '#2f2711',
  tvOff: '#0b0b10',
  tvOffShine: '#2a2c38',
  shadow: 'rgba(20, 20, 20, 0.28)',
  bubble: '#ffffff',
  bubbleEdge: '#2a1d17',
  roar: '#ff5a36',
  roarShine: '#ffd44a',
  roarEdge: '#2a1414',
  soundRing: '#ffd44a',
};

// The window's sky, top to bottom, before the storm and at its height.
const SKY_CLEAR = ['#55679f', '#a8789a', '#f2b27a'].map(hexToRgb);
const SKY_STORM = ['#161c2c', '#1e2538', '#2a3148'].map(hexToRgb);
const SKY_LIGHTNING = hexToRgb('#e6eeff');
const NIGHT_OUTSIDE = '#161c2c'; // through the open door

// Through the window: the autumn tree across the courtyard, and the leafy privacy film on
// the bottom panes. Both sink into the dark as the storm builds.
const TREE_LEAVES = hexToRgb('#a35a32');
const FILM_LEAVES = ['#3f8a57', '#74b87e', '#2c6a45'].map(hexToRgb);
const NIGHT_SHADE = hexToRgb('#101a22');

const CEILING_BOTTOM = 7; // the plank ceiling and its trusses fill the rows above this
const DOOR = { x: 31, y: 22, width: 16 };
const WINDOW_GLASS = { x: 54, y: 16, width: 44, height: 28 };
const WINDOW_FILM_HEIGHT = 9; // the privacy film covers this much of the bottom of the glass
const ROOFLINE_Y = 30; // the building next door; the dinosaur rises from behind it
const RUG = { x: 68, y: 72, width: 72, height: 15 };
const TV_SCREEN = { x: 141, y: 43, width: 16, height: 12 };
const HERO_SEAT = { x: 92, footY: 70 };
const HERO_STANDING_FOOT_Y = 75;

// The sectional's big blocks as [colour, x, y, width, height]: back, seat, front, the two
// arms, and the chaise end (its top, then its front).
const COUCH_BLOCKS = [
  ['couchBack', 69, 47, 44, 12],
  ['couch', 72, 59, 38, 4],
  ['couchBack', 72, 63, 38, 6],
  ['couch', 66, 52, 6, 17],
  ['couch', 110, 52, 6, 17],
  ['couch', 66, 62, 19, 4],
  ['couchBack', 66, 66, 19, 8],
];

// One character per pixel.
const EMOTE_GLYPHS = {
  '?': ['.###.', '...#.', '..#..', '.....', '..#..'],
  '!': ['..#..', '..#..', '..#..', '.....', '..#..'],
  '…': ['.....', '.....', '.....', '.....', '#.#.#'],
};

const ROAR_GLYPHS = {
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  '!': ['..#..', '..#..', '..#..', '..#..', '..#..', '.....', '..#..'],
};
const ROAR_LETTER_SCALE = 2;

// The newsreader on the TV, for lines with speaker: 'tv'.
const TV_SPEAKER_NAME = 'WAFL Storm Team 5';
// When the power fails the lights flicker back on twice before staying off. Each pair is
// [from, to] in seconds after the cut.
const POWER_FLICKERS = [[0.12, 0.2], [0.3, 0.36]];

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(value, maximum));
}

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Blends two [red, green, blue] colours; amount 0 gives the first, 1 the second.
function mixColors(from, to, amount) {
  return from.map((channel, index) => channel + (to[index] - channel) * amount);
}

function toCssColor(rgb) {
  return `rgb(${rgb.map(Math.round).join(', ')})`;
}

// A copy of a sprite filled with one flat colour.
function createSilhouette(frame, color) {
  const silhouette = document.createElement('canvas');
  silhouette.width = frame.width;
  silhouette.height = frame.height;
  const silhouetteContext = silhouette.getContext('2d');
  silhouetteContext.drawImage(frame, 0, 0);
  silhouetteContext.globalCompositeOperation = 'source-in';
  silhouetteContext.fillStyle = color;
  silhouetteContext.fillRect(0, 0, frame.width, frame.height);
  return silhouette;
}

// The overlay: the scene canvas, the dialogue box under it and a Skip button. Built once and
// reused if the intro is played again.
let introElements = null;

function getIntroElements(host) {
  if (introElements) return introElements;
  const overlay = document.createElement('div');
  overlay.className = 'intro-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Intro');
  overlay.tabIndex = -1;
  overlay.hidden = true;
  overlay.innerHTML = `
    <button class="intro-skip" type="button">Skip intro <span aria-hidden="true">▸▸</span></button>
    <div class="intro-stage">
      <canvas class="intro-scene" aria-hidden="true"></canvas>
      <div class="intro-dialogue is-empty" aria-hidden="true">
        <canvas class="intro-dialogue__portrait"></canvas>
        <div class="intro-dialogue__words">
          <p class="intro-dialogue__name"></p>
          <p class="intro-dialogue__text"></p>
        </div>
        <span class="intro-dialogue__next">▼</span>
      </div>
      <p class="intro-announcer" aria-live="polite"></p>
    </div>`;
  host.append(overlay);
  introElements = {
    overlay,
    canvas: overlay.querySelector('.intro-scene'),
    dialogue: overlay.querySelector('.intro-dialogue'),
    portrait: overlay.querySelector('.intro-dialogue__portrait'),
    nameText: overlay.querySelector('.intro-dialogue__name'),
    lineText: overlay.querySelector('.intro-dialogue__text'),
    announcer: overlay.querySelector('.intro-announcer'),
    skipButton: overlay.querySelector('.intro-skip'),
  };
  return introElements;
}

// Plays the intro over `host` (the game frame), then calls onDone exactly once, whether it
// ran to the end or was skipped. heroFrames are the chosen hero's walk frames and
// heroSeatedFrame the couch pose. Returns { skip() }.
export function playIntro({ host, heroFrames, heroSeatedFrame, heroName, onDone }) {
  const { overlay, canvas, dialogue, portrait, nameText, lineText, announcer, skipButton } = getIntroElements(host);
  const context = canvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  canvas.width = SCENE_WIDTH;
  canvas.height = SCENE_HEIGHT;

  const mayaPhoto = createMayaStateFrames().sit[0];
  const dinosaurSilhouette = createSilhouette(createTRexFrames()[0], COLORS.dinosaur);

  // Everything the picture depends on. Steps change it; draw() only reads it.
  const scene = {
    time: 0,
    fade: 1, // 1 is fully black
    rain: 0, // 0 dry evening, 1 full storm
    rainTarget: 0,
    tv: 'forecast',
    powerOutTime: -1, // seconds since the power failed; negative while it's still on
    doorOpen: false,
    roarTime: -1, // seconds since the roar began; negative until it does
    hero: {
      x: HERO_SEAT.x,
      footY: HERO_SEAT.footY,
      pose: 'sit', // 'sit', 'stand' or 'walk'
      facing: 1, // 1 looks right (the TV), -1 left (window, dog bed, door)
      hopTime: 0,
      emote: null,
      emoteTime: 0,
    },
  };

  let stepIndex = -1;
  let activeStep = null;
  let finished = false;
  let previousTimestamp = null;

  // ---- Dialogue box (HTML, so the text is real text) ----

  // The picture beside the words: the hero's head and shoulders, or the TV for the news.
  function paintPortrait(speaker) {
    const rows = 14;
    portrait.width = heroFrames[0].width;
    portrait.height = rows;
    const portraitContext = portrait.getContext('2d');
    if (speaker !== 'tv') {
      portraitContext.drawImage(heroFrames[0], 0, 0, portrait.width, rows, 0, 0, portrait.width, rows);
      return;
    }
    // A little television showing the weather alert.
    const fill = (color, x, y, width, height) => {
      portraitContext.fillStyle = color;
      portraitContext.fillRect(x, y, width, height);
    };
    fill(COLORS.tvBody, 1, 1, 14, 10);
    fill(COLORS.tvAlert, 2, 2, 12, 8);
    fill(COLORS.tvCloud, 7, 3, 2, 3);
    fill(COLORS.tvCloud, 7, 7, 2, 1);
    fill(COLORS.tvAlertBanner, 2, 9, 12, 1);
    fill(COLORS.tvBody, 6, 11, 4, 1);
    fill(COLORS.tvBody, 4, 12, 8, 1);
  }

  function clearDialogue() {
    dialogue.classList.add('is-empty');
    dialogue.classList.remove('is-caption', 'is-waiting');
    lineText.textContent = '';
  }

  function showSpeech(text, speaker) {
    const name = speaker === 'tv' ? TV_SPEAKER_NAME : heroName;
    paintPortrait(speaker);
    dialogue.classList.remove('is-empty', 'is-caption', 'is-waiting');
    nameText.textContent = name;
    lineText.textContent = '';
    // Screen readers get the whole line at once instead of letter by letter.
    announcer.textContent = `${name}: ${text}`;
  }

  // A line nobody says (a sound, a stage direction). Stays up until the next line replaces it.
  function showCaption(text) {
    dialogue.classList.remove('is-empty', 'is-waiting');
    dialogue.classList.add('is-caption');
    lineText.textContent = text;
    announcer.textContent = text;
  }

  // ---- Sound ----

  // Sounds this intro has started, so they can be faded out when it ends or is skipped.
  const playingSounds = [];

  function startSound(name) {
    const settings = INTRO_SOUNDS[name];
    playingSounds.push({ sound: playSound(name, settings), loops: Boolean(settings.loop) });
  }

  function fadeOutSounds() {
    for (const { sound, loops } of playingSounds) sound.stop(loops ? RAIN_FADE_OUT_SECONDS : SOUND_FADE_OUT_SECONDS);
  }

  // ---- Steps ----
  // Each returns nothing (done immediately) or { update(deltaTime) -> true when done, press() }.

  const stepRunners = {
    wait({ seconds }) {
      let remaining = seconds;
      return {
        update(deltaTime) {
          remaining -= deltaTime;
          return remaining <= 0;
        },
      };
    },

    fade({ to, seconds }) {
      const from = scene.fade;
      let elapsed = 0;
      return {
        update(deltaTime) {
          elapsed += deltaTime;
          const progress = clamp(elapsed / seconds, 0, 1);
          scene.fade = from + (to - from) * progress;
          return progress >= 1;
        },
      };
    },

    rain({ level }) {
      scene.rainTarget = level;
    },

    tv({ show }) {
      scene.tv = show;
    },

    // The apartment's power fails: the lights and the TV go dark (see isPowerOn).
    powerCut() {
      scene.powerOutTime = 0;
    },

    door({ open }) {
      scene.doorOpen = open;
    },

    face({ direction }) {
      scene.hero.facing = direction;
    },

    emote({ mark }) {
      scene.hero.emote = mark;
      scene.hero.emoteTime = EMOTE_DURATION;
    },

    pose({ pose }) {
      const wasSitting = scene.hero.pose === 'sit';
      scene.hero.pose = pose;
      if (pose === 'stand' && wasSitting) {
        // Jumps up off the couch onto the rug in front of it.
        scene.hero.footY = HERO_STANDING_FOOT_Y;
        scene.hero.hopTime = STAND_UP_HOP_DURATION;
      }
    },

    // Plays one of INTRO_SOUNDS and carries straight on; it doesn't wait for the sound.
    sound({ name }) {
      startSound(name);
    },

    roar() {
      scene.roarTime = 0;
      startSound('roar');
    },

    caption({ text }) {
      if (text) showCaption(text);
      else clearDialogue();
    },

    // Types the line out, then waits for a press. A press while typing shows the rest.
    say({ text, speaker }) {
      let shown = reducedMotion ? text.length : 0;
      let dismissed = false;
      showSpeech(text, speaker);
      return {
        update(deltaTime) {
          if (shown < text.length) shown = Math.min(text.length, shown + deltaTime * TYPING_SPEED);
          lineText.textContent = text.slice(0, Math.floor(shown));
          dialogue.classList.toggle('is-waiting', shown >= text.length);
          if (dismissed) clearDialogue();
          return dismissed;
        },
        press() {
          if (shown < text.length) shown = text.length;
          else dismissed = true;
        },
      };
    },

    walk({ toX, toFootY }) {
      const hero = scene.hero;
      const fromX = hero.x;
      const fromFootY = hero.footY;
      const distance = Math.abs(toX - fromX);
      let travelled = 0;
      hero.pose = 'walk';
      hero.facing = toX < fromX ? -1 : 1;
      return {
        update(deltaTime) {
          travelled = Math.min(distance, travelled + deltaTime * WALK_SPEED);
          const progress = distance === 0 ? 1 : travelled / distance;
          hero.x = fromX + (toX - fromX) * progress;
          hero.footY = fromFootY + ((toFootY ?? fromFootY) - fromFootY) * progress;
          if (progress < 1) return false;
          hero.pose = 'stand';
          return true;
        },
      };
    },
  };

  function runScript(deltaTime) {
    let stepTime = deltaTime;
    while (!finished) {
      if (!activeStep) {
        stepIndex += 1;
        if (stepIndex >= INTRO_SCRIPT.length) {
          finish();
          return;
        }
        const step = INTRO_SCRIPT[stepIndex];
        activeStep = stepRunners[step.do](step) ?? null;
        if (!activeStep) continue; // an instant step: carry straight on to the next
      }
      if (!activeStep.update(stepTime)) return;
      activeStep = null;
      stepTime = 0;
    }
  }

  // Animation that carries on by itself whatever step is running.
  function updateScene(deltaTime) {
    scene.time += deltaTime;
    const rainStep = RAIN_EASE_PER_SECOND * deltaTime;
    scene.rain += clamp(scene.rainTarget - scene.rain, -rainStep, rainStep);
    if (scene.roarTime >= 0) scene.roarTime += deltaTime;
    if (scene.powerOutTime >= 0) scene.powerOutTime += deltaTime;
    const hero = scene.hero;
    hero.hopTime = Math.max(0, hero.hopTime - deltaTime);
    hero.emoteTime = Math.max(0, hero.emoteTime - deltaTime);
    if (hero.emoteTime === 0) hero.emote = null;
  }

  // ---- Drawing ----

  function rect(color, x, y, width, height) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  }

  // Draws rows of '#' pixels; each one is a square `scale` pixels wide.
  function drawGlyph(rows, left, top, color, scale = 1) {
    context.fillStyle = color;
    rows.forEach((row, y) => {
      [...row].forEach((pixel, x) => {
        if (pixel === '#') context.fillRect(left + x * scale, top + y * scale, scale, scale);
      });
    });
  }

  // Whether the apartment's lights and TV are on right now. They stay on until the power
  // cut, then flicker back twice before going out for good.
  function isPowerOn() {
    const time = scene.powerOutTime;
    if (time < 0) return true;
    if (reducedMotion) return false;
    return POWER_FLICKERS.some(([from, to]) => time >= from && time < to);
  }

  // How bright the lightning is right now, 0 to 1.
  function getLightning() {
    const time = scene.roarTime;
    if (time < 0 || time > ROAR_DURATION) return 0;
    // No flashing for players who asked for less motion: one steady glow instead.
    if (reducedMotion) return 0.5;
    return ROAR_LIGHTNING.reduce((brightest, flash) => {
      if (time < flash.at) return brightest;
      return Math.max(brightest, 1 - (time - flash.at) / flash.fade);
    }, 0);
  }

  // How far the dinosaur's head has risen above the rooftops, 0 to 1.
  function getDinosaurRise() {
    const time = scene.roarTime;
    if (time < 0) return 0;
    const rising = clamp(time / 0.5, 0, 1);
    const sinking = clamp((time - (ROAR_DURATION - 0.4)) / 0.4, 0, 1);
    return rising * (1 - sinking);
  }

  function drawRoom() {
    const left = -OVERSCAN;
    const fullWidth = SCENE_WIDTH + OVERSCAN * 2;

    // White painted block wall: rows of blocks with staggered joints.
    rect(COLORS.wall, left, -OVERSCAN, fullWidth, WALL_BOTTOM + OVERSCAN);
    for (let y = CEILING_BOTTOM + 5, row = 0; y < WALL_BOTTOM; y += 6, row += 1) {
      rect(COLORS.wallLine, left, y, fullWidth, 1);
      for (let x = (row % 2) * 7 - 2; x < SCENE_WIDTH + OVERSCAN; x += 14) rect(COLORS.wallLine, x, y - 5, 1, 5);
    }

    // Plank ceiling with a steel truss running across it, and the big air duct below.
    rect(COLORS.ceiling, left, -OVERSCAN, fullWidth, CEILING_BOTTOM + OVERSCAN);
    for (let x = left + 3; x < SCENE_WIDTH + OVERSCAN; x += 9) rect(COLORS.ceilingLine, x, -OVERSCAN, 1, CEILING_BOTTOM + OVERSCAN);
    rect(COLORS.truss, left, 1, fullWidth, 1);
    rect(COLORS.truss, left, CEILING_BOTTOM - 1, fullWidth, 1);
    for (let x = left; x < SCENE_WIDTH + OVERSCAN; x += 1) {
      rect(COLORS.truss, x, 1 + Math.abs(((x + 120) % 10) - 5), 1, 1); // the zigzag between its two rails
    }
    rect(COLORS.duct, left, 8, 46, 4);
    rect(COLORS.ductShade, left, 12, 46, 1);
    rect(COLORS.ductShade, 39, 8, 1, 4);
    rect(COLORS.ductShade, 41, 9, 1, 2);

    // Pale wood floor: boards with a few staggered ends.
    rect(COLORS.floorEdge, left, WALL_BOTTOM - 1, fullWidth, 1);
    rect(COLORS.floor, left, WALL_BOTTOM, fullWidth, SCENE_HEIGHT - WALL_BOTTOM + OVERSCAN);
    for (let y = WALL_BOTTOM + 5, row = 0; y < SCENE_HEIGHT + OVERSCAN; y += 6, row += 1) {
      rect(COLORS.floorLine, left, y, fullWidth, 1);
      for (let x = 11 + (row % 3) * 17; x < SCENE_WIDTH; x += 52) rect(COLORS.floorLine, x, y - 5, 1, 5);
    }

    // The faded Persian rug, with a fringe at each end.
    for (let y = RUG.y + 1; y < RUG.y + RUG.height; y += 2) {
      rect(COLORS.rugMotif, RUG.x - 2, y, 2, 1);
      rect(COLORS.rugMotif, RUG.x + RUG.width, y, 2, 1);
    }
    rect(COLORS.rugBorder, RUG.x, RUG.y, RUG.width, RUG.height);
    rect(COLORS.rugMotif, RUG.x + 1, RUG.y + 1, RUG.width - 2, RUG.height - 2);
    rect(COLORS.rug, RUG.x + 2, RUG.y + 2, RUG.width - 4, RUG.height - 4);
    const rugMiddle = RUG.y + Math.floor(RUG.height / 2);
    for (let x = RUG.x + 6, motif = 0; x < RUG.x + RUG.width - 7; x += 8, motif += 1) {
      const color = motif % 2 === 0 ? COLORS.rugBorder : COLORS.rugMotif;
      rect(color, x + 1, rugMiddle - 2, 1, 5);
      rect(color, x, rugMiddle - 1, 3, 3);
      rect(color, x - 1, rugMiddle, 5, 1);
    }
  }

  // Left of the window: the old metal lockers, hats on their hooks, and the black door.
  function drawDoor() {
    const lockersTop = 25;
    rect(COLORS.lockerLine, 2, lockersTop, 19, WALL_BOTTOM - lockersTop);
    for (let locker = 0; locker < 3; locker += 1) {
      const left = 3 + locker * 6;
      rect(COLORS.locker, left, lockersTop + 1, 5, WALL_BOTTOM - lockersTop - 3);
      rect(COLORS.lockerVent, left + 1, lockersTop + 3, 3, 1);
      rect(COLORS.lockerVent, left + 1, lockersTop + 5, 3, 1);
      rect(COLORS.lockerVent, left + 3, lockersTop + 17, 1, 3);
    }

    // Two caps, and Maya's leash still hanging under them.
    rect(COLORS.black, 22, 27, 8, 1);
    rect(COLORS.hatNavy, 22, 28, 4, 3);
    rect(COLORS.hatNavy, 21, 30, 2, 1);
    rect(COLORS.hatRed, 26, 29, 4, 3);
    rect(COLORS.hatRed, 29, 31, 2, 1);
    rect(COLORS.leash, 25, 33, 1, 9);
    rect(COLORS.leash, 24, 42, 3, 1);
    rect(COLORS.leash, 24, 43, 1, 3);
    rect(COLORS.leash, 26, 43, 1, 3);
    rect(COLORS.leash, 24, 46, 3, 1);

    const doorHeight = WALL_BOTTOM - DOOR.y;
    rect(COLORS.trimShade, DOOR.x - 1, DOOR.y - 1, DOOR.width + 2, doorHeight + 1);
    if (scene.doorOpen) {
      // The night outside, with the door swung in against the frame.
      rect(NIGHT_OUTSIDE, DOOR.x, DOOR.y, DOOR.width, doorHeight);
      context.fillStyle = COLORS.rainDrop;
      for (let drop = 0; drop < 7; drop += 1) {
        const y = DOOR.y + ((drop * 13 + scene.time * 70) % (doorHeight - 2));
        context.fillRect(DOOR.x + 4 + ((drop * 5) % 11), Math.floor(y), 1, 2);
      }
      rect(COLORS.door, DOOR.x, DOOR.y, 3, doorHeight);
    } else {
      rect(COLORS.door, DOOR.x, DOOR.y, DOOR.width, doorHeight);
      rect(COLORS.doorPanel, DOOR.x + 2, DOOR.y + 3, DOOR.width - 4, doorHeight - 6);
      rect(COLORS.door, DOOR.x + 3, DOOR.y + 4, DOOR.width - 6, doorHeight - 8);
      rect(COLORS.doorHandle, DOOR.x + DOOR.width - 5, 43, 3, 1);
    }
  }

  // The sky, the courtyard, the dinosaur and the rain inside the window frame.
  function drawWindowGlass(lightning) {
    const { x, y, width, height } = WINDOW_GLASS;
    const filmTop = y + height - WINDOW_FILM_HEIGHT;
    const bandTops = [y, y + 9, y + 14, filmTop];
    for (let band = 0; band < 3; band += 1) {
      const stormy = mixColors(SKY_CLEAR[band], SKY_STORM[band], scene.rain);
      context.fillStyle = toCssColor(mixColors(stormy, SKY_LIGHTNING, lightning));
      context.fillRect(x, bandTops[band], width, bandTops[band + 1] - bandTops[band]);
    }

    // The dinosaur's head comes up behind the building next door, so it's clipped there.
    const rise = getDinosaurRise();
    if (rise > 0) {
      context.save();
      context.beginPath();
      context.rect(x, y, width, ROOFLINE_Y + 1 - y);
      context.clip();
      context.drawImage(dinosaurSilhouette, x + 5, Math.round(ROOFLINE_Y + 1 - 13 * rise));
      context.restore();
    }

    // The building next door, and the tree with its autumn leaves.
    rect(COLORS.skyline, x, ROOFLINE_Y + 1, width, filmTop - ROOFLINE_Y - 1);
    rect(COLORS.skyline, x, ROOFLINE_Y - 2, 19, 3);
    rect(COLORS.skyline, x + 4, ROOFLINE_Y - 4, 6, 2);
    // The neighbours' lights go out with ours.
    if (isPowerOn()) {
      rect(COLORS.litWindow, x + 3, ROOFLINE_Y + 1, 2, 2);
      rect(COLORS.litWindow, x + 12, ROOFLINE_Y + 1, 2, 2);
    }
    const leaves = toCssColor(mixColors(TREE_LEAVES, NIGHT_SHADE, 0.25 + 0.65 * scene.rain));
    rect(COLORS.skyline, x + 37, ROOFLINE_Y - 5, 2, 7);
    rect(leaves, x + 33, ROOFLINE_Y - 13, 8, 2);
    rect(leaves, x + 31, ROOFLINE_Y - 11, 13, 4);
    rect(leaves, x + 29, ROOFLINE_Y - 8, 15, 3);
    rect(leaves, x + 32, ROOFLINE_Y - 5, 4, 1);
    rect(leaves, x + 40, ROOFLINE_Y - 5, 4, 2);

    // Rain: more drops as the storm builds.
    const skyHeight = filmTop - y;
    const drops = Math.round(scene.rain * 18);
    context.fillStyle = COLORS.rainDrop;
    for (let drop = 0; drop < drops; drop += 1) {
      const fall = (drop * 7.3 + scene.time * (46 + (drop % 3) * 9)) % (skyHeight - 1);
      const drift = (drop * 11 + Math.floor(fall / 3)) % width;
      context.fillRect(x + drift, y + Math.floor(fall), 1, 2);
    }

    // Leaf-patterned privacy film over the bottom panes.
    for (let row = 0; row < WINDOW_FILM_HEIGHT; row += 1) {
      for (let column = 0; column < width; column += 1) {
        const shade = (column * 7 + row * 13 + ((column * row) % 3)) % 5;
        const leaf = FILM_LEAVES[shade === 0 ? 1 : shade === 3 ? 2 : 0];
        context.fillStyle = toCssColor(mixColors(leaf, NIGHT_SHADE, 0.55 * scene.rain));
        context.fillRect(x + column, filmTop + row, 1, 1);
      }
    }

    // Window bars: two sashes, each a grid of small panes.
    for (const bar of [7, 14, 30, 37]) rect(COLORS.trimShade, x + bar, y, 1, height);
    rect(COLORS.trimShade, x, y + 9, width, 1);
    rect(COLORS.trimShade, x, filmTop - 1, width, 1);
    rect(COLORS.trim, x + width / 2 - 1, y, 2, height);
  }

  function drawWindow(lightning) {
    const { x, y, width, height } = WINDOW_GLASS;
    // White sheer curtains on a black rod, hanging nearly to the floor.
    rect(COLORS.black, x - 8, y - 4, width + 16, 1);
    for (const left of [x - 7, x + width + 3]) {
      rect(COLORS.curtain, left, y - 3, 4, 45);
      rect(COLORS.curtainFold, left + 1, y - 3, 1, 45);
      rect(COLORS.curtainFold, left + 3, y - 3, 1, 45);
    }
    rect(COLORS.trimShade, x - 3, y - 3, width + 6, height + 6);
    rect(COLORS.trim, x - 2, y - 2, width + 4, height + 4);
    drawWindowGlass(lightning);
    rect(COLORS.trim, x - 3, y + height + 2, width + 6, 2);
    rect(COLORS.trimShade, x - 3, y + height + 4, width + 6, 1);
  }

  function drawFurniture() {
    // A framed photo of Maya, in a black frame like the mirror's.
    rect(COLORS.black, 107, 11, 30, 22);
    rect(COLORS.trim, 108, 12, 28, 20);
    context.drawImage(mayaPhoto, 110, 14);

    // Her empty bed beside the couch, with two of her plush toys.
    rect(COLORS.bedShade, 47, 62, 16, 1);
    rect(COLORS.bedShade, 46, 63, 18, 8);
    rect(COLORS.bed, 47, 63, 16, 7);
    rect(COLORS.bedInner, 50, 65, 11, 3);
    rect(COLORS.plushWhite, 50, 65, 5, 3);
    rect(COLORS.plushSpot, 51, 65, 1, 1);
    rect(COLORS.plushSpot, 53, 66, 1, 1);
    rect(COLORS.cushion, 55, 66, 1, 1);
    rect(COLORS.plushGrey, 57, 71, 5, 3);
    rect(COLORS.plushGrey, 56, 70, 2, 1);
    rect(COLORS.plushSpot, 60, 72, 1, 1);

    // Cream sectional: back, arms, seat cushions, and the chaise end reaching toward us.
    // Outlined first, then filled, then the seams between cushions.
    for (const [, x, y, width, height] of COUCH_BLOCKS) rect(COLORS.couchLine, x - 1, y - 1, width + 2, height + 2);
    for (const [color, x, y, width, height] of COUCH_BLOCKS) rect(COLORS[color], x, y, width, height);
    rect(COLORS.couch, 69, 47, 44, 1);
    rect(COLORS.couchShade, 84, 48, 1, 11);
    rect(COLORS.couchShade, 98, 48, 1, 11);
    rect(COLORS.couchShade, 98, 59, 1, 4);
    rect(COLORS.couchShade, 72, 63, 38, 1);
    rect(COLORS.couchShade, 110, 53, 1, 16);
    rect(COLORS.couchShade, 84, 63, 1, 11);
    rect(COLORS.couchShade, 66, 66, 18, 1);

    // The rust knit throw over the arm, two red cushions, and a yellow plush.
    rect(COLORS.throw, 65, 46, 9, 4);
    rect(COLORS.throw, 64, 50, 8, 11);
    rect(COLORS.throw, 65, 61, 6, 3);
    for (let y = 47; y < 63; y += 2) {
      for (let x = 65 + (y % 4 === 3 ? 1 : 0); x < 71; x += 2) rect(COLORS.throwKnit, x, y, 1, 1);
    }
    rect(COLORS.cushion, 74, 53, 6, 6);
    rect(COLORS.cushionDark, 79, 55, 5, 5);
    rect(COLORS.cushionDark, 76, 55, 1, 1);
    rect(COLORS.cushion, 81, 57, 1, 1);
    rect(COLORS.plushYellow, 104, 55, 4, 4);
    rect(COLORS.plushYellow, 105, 52, 3, 3);
    rect(COLORS.plushSpot, 107, 53, 1, 1);
    rect(COLORS.throwKnit, 105, 57, 1, 1);

    // Round pedestal coffee table, with a mug and the remote.
    rect(COLORS.wood, 104, 66, 12, 1);
    rect(COLORS.woodLight, 102, 67, 16, 1);
    rect(COLORS.wood, 104, 68, 12, 1);
    rect(COLORS.wood, 109, 69, 2, 6);
    rect(COLORS.wood, 105, 75, 10, 1);
    rect(COLORS.wood, 104, 76, 2, 1);
    rect(COLORS.wood, 114, 76, 2, 1);
    rect(COLORS.mug, 106, 64, 2, 2);
    rect(COLORS.black, 111, 65, 3, 1);

    // TV on its console.
    rect(COLORS.tvStand, 139, 60, 19, 11);
    rect(COLORS.tvStandTop, 139, 60, 19, 1);
    rect(COLORS.tvBody, 147, 57, 4, 3);
    rect(COLORS.tvBody, TV_SCREEN.x - 2, TV_SCREEN.y - 2, TV_SCREEN.width + 4, TV_SCREEN.height + 4);
  }

  // Closest to us, in the corner: the stacked vintage trunks with the plant on top.
  function drawForeground() {
    rect(COLORS.wood, 147, 75, 17, 5);
    rect(COLORS.woodLight, 148, 76, 16, 3);
    rect(COLORS.wood, 145, 80, 19, 14);
    rect(COLORS.woodLight, 146, 81, 18, 13);
    rect(COLORS.wood, 150, 81, 1, 13);
    rect(COLORS.wood, 158, 81, 1, 13);
    rect(COLORS.brass, 154, 77, 2, 1);
    rect(COLORS.brass, 153, 84, 3, 2);
    rect(COLORS.plantGlass, 151, 70, 4, 5);
    rect(COLORS.plant, 152, 66, 1, 5);
    rect(COLORS.plant, 149, 65, 3, 2);
    rect(COLORS.plant, 153, 63, 3, 3);
    rect(COLORS.plant, 155, 67, 3, 2);
    rect(COLORS.plantLight, 150, 65, 1, 1);
    rect(COLORS.plantLight, 154, 64, 1, 1);
    rect(COLORS.plantLight, 156, 67, 1, 1);
  }

  // The TV starts on the WAFL Storm Team forecast and switches to a weather alert. With
  // the power out it's a dark screen with a faint reflection.
  function drawTvScreen() {
    const { x, y, width, height } = TV_SCREEN;
    if (!isPowerOn()) {
      rect(COLORS.tvOff, x, y, width, height);
      rect(COLORS.tvOffShine, x + 2, y + 2, 3, 1);
      return;
    }
    const isAlert = scene.tv === 'alert';
    const blink = !reducedMotion && Math.floor(scene.time / 0.45) % 2 === 1;
    const background = isAlert ? (blink ? COLORS.tvAlertDim : COLORS.tvAlert) : COLORS.tvSky;

    // Its glow on the wall and floor around it.
    context.globalAlpha = 0.12;
    rect(background, x - 6, y - 6, width + 12, height + 14);
    context.globalAlpha = 1;

    rect(background, x, y, width, height);
    if (isAlert) {
      rect(COLORS.tvCloud, x + 7, y + 2, 2, 4);
      rect(COLORS.tvCloud, x + 7, y + 7, 2, 1);
    } else {
      rect(COLORS.tvSun, x + 2, y + 2, 4, 4);
      rect(COLORS.tvCloud, x + 9, y + 3, 5, 2);
      rect(COLORS.tvCloud, x + 10, y + 2, 3, 1);
    }
    // The news ticker along the bottom: dashes standing in for scrolling words.
    rect(isAlert ? COLORS.tvAlertBanner : COLORS.tvBanner, x, y + height - 3, width, 3);
    context.fillStyle = isAlert ? COLORS.tvAlertText : COLORS.tvSun;
    const scroll = reducedMotion ? 0 : Math.floor(scene.time * 7);
    for (let dash = 0; dash < 4; dash += 1) {
      const offset = (((dash * 5 - scroll) % width) + width) % width;
      context.fillRect(x + offset, y + height - 2, Math.min(2, width - offset), 1);
    }
  }

  // Returns where the top of the hero's head is, for the emote bubble.
  function drawHero() {
    const hero = scene.hero;
    let frame = heroFrames[0];
    let lift = 0;
    if (hero.pose === 'sit') {
      frame = heroSeatedFrame;
    } else if (hero.pose === 'walk') {
      const stride = Math.floor(scene.time / WALK_STRIDE_DURATION) % heroFrames.length;
      frame = heroFrames[stride];
      lift = stride === 1 ? 1 : 0;
    }
    if (hero.hopTime > 0) lift = Math.round(Math.sin((hero.hopTime / STAND_UP_HOP_DURATION) * Math.PI) * 4);

    const centerX = Math.round(hero.x);
    const footY = Math.round(hero.footY);
    const top = footY - frame.height - lift;

    if (hero.pose !== 'sit') {
      context.fillStyle = COLORS.shadow;
      context.fillRect(centerX - 6, footY - 1, 12, 2);
    }
    context.save();
    context.translate(centerX, top);
    context.scale(hero.facing, 1);
    context.drawImage(frame, -frame.width / 2, 0);
    context.restore();
    return top;
  }

  // A small thought bubble over the hero's head: "?", "…" or "!".
  function drawEmote(heroTop) {
    const hero = scene.hero;
    if (!hero.emote) return;
    const left = Math.round(hero.x) - 4;
    const top = heroTop - 12;
    rect(COLORS.bubbleEdge, left, top, 9, 9);
    rect(COLORS.bubbleEdge, left + 3, top + 9, 3, 1);
    rect(COLORS.bubbleEdge, left + 4, top + 10, 1, 1);
    rect(COLORS.bubble, left + 1, top + 1, 7, 7);
    rect(COLORS.bubble, left + 4, top + 8, 1, 1);
    drawGlyph(EMOTE_GLYPHS[hero.emote], left + 2, top + 2, COLORS.bubbleEdge);
  }

  // What you see instead of hearing it: rings spreading from the window and big letters.
  function drawRoarEffects() {
    const time = scene.roarTime;
    if (time < 0 || time > ROAR_DURATION) return;
    const fade = 1 - clamp((time - ROAR_TEXT_FADE_START) / (ROAR_DURATION - ROAR_TEXT_FADE_START), 0, 1);

    // Sound rings: dotted circles growing out of the window into the room.
    const centerX = WINDOW_GLASS.x + WINDOW_GLASS.width / 2;
    const centerY = WINDOW_GLASS.y + WINDOW_GLASS.height / 2;
    context.fillStyle = COLORS.soundRing;
    for (let ring = 0; ring < 3; ring += 1) {
      // Each ring grows and fades, one after another; with reduced motion, three still rings.
      const growth = reducedMotion ? (ring + 1) / 4 : (time * 0.9 + ring / 3) % 1;
      const radius = 22 + growth * 34;
      context.globalAlpha = (1 - growth) * 0.75 * fade;
      const dots = Math.round(radius * 1.4);
      for (let dot = 0; dot < dots; dot += 1) {
        const angle = (dot / dots) * Math.PI * 2;
        context.fillRect(Math.round(centerX + Math.cos(angle) * radius), Math.round(centerY + Math.sin(angle) * radius * 0.8), 1, 1);
      }
    }

    // "ROOAAR!" across the top of the wall, one letter popping in after another.
    const letterWidth = 5 * ROAR_LETTER_SCALE + 2;
    const left = Math.round((SCENE_WIDTH - letterWidth * ROAR_TEXT.length) / 2) + 12;
    context.globalAlpha = fade;
    [...ROAR_TEXT].forEach((letter, index) => {
      if (time < index * ROAR_LETTER_DELAY) return;
      const rows = ROAR_GLYPHS[letter];
      const x = left + index * letterWidth;
      const y = 4 + (reducedMotion ? 0 : Math.round(Math.sin(time * 14 + index * 0.9)));
      for (const [offsetX, offsetY] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) {
        drawGlyph(rows, x + offsetX, y + offsetY, COLORS.roarEdge, ROAR_LETTER_SCALE);
      }
      drawGlyph(rows, x, y, COLORS.roar, ROAR_LETTER_SCALE);
      drawGlyph(rows.slice(0, 2), x, y, COLORS.roarShine, ROAR_LETTER_SCALE);
    });
    context.globalAlpha = 1;
  }

  function draw() {
    const lightning = getLightning();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.imageSmoothingEnabled = false;
    rect('#000000', 0, 0, SCENE_WIDTH, SCENE_HEIGHT);

    // The roar rattles the whole room for a moment.
    context.save();
    const shakeLeft = reducedMotion || scene.roarTime < 0 ? 0 : 1 - scene.roarTime / ROAR_SHAKE_DURATION;
    if (shakeLeft > 0) {
      context.translate(
        Math.round(Math.sin(scene.roarTime * 83) * 2 * shakeLeft),
        Math.round(Math.cos(scene.roarTime * 71) * 2 * shakeLeft),
      );
    }

    drawRoom();
    drawDoor();
    drawWindow(lightning);
    drawFurniture();
    const heroTop = drawHero();
    drawForeground();

    // The lights keep the room bright however dark it gets outside. Once the power fails
    // the room is only as light as the storm lets it be. The TV is drawn after the
    // darkness so that, while it's on, it glows.
    if (!isPowerOn()) {
      rect(`rgba(14, 20, 44, ${0.12 + 0.42 * scene.rain})`, -OVERSCAN, -OVERSCAN, SCENE_WIDTH + OVERSCAN * 2, SCENE_HEIGHT + OVERSCAN * 2);
    }
    drawTvScreen();
    if (lightning > 0) {
      drawWindowGlass(lightning);
      rect(`rgba(230, 238, 255, ${0.16 * lightning})`, -OVERSCAN, -OVERSCAN, SCENE_WIDTH + OVERSCAN * 2, SCENE_HEIGHT + OVERSCAN * 2);
    }
    drawEmote(heroTop);
    drawRoarEffects();
    context.restore();

    if (scene.fade > 0) rect(`rgba(5, 8, 10, ${scene.fade})`, 0, 0, SCENE_WIDTH, SCENE_HEIGHT);
  }

  // ---- Input and lifecycle ----

  // Enter, Space, a click or a tap: finish typing the line, or move on from it.
  function press() {
    activeStep?.press?.();
  }

  function handleKeyDown(event) {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      finish();
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    // Enter or Space on the Skip button is that button's own click.
    if (event.target === skipButton) return;
    event.preventDefault();
    event.stopPropagation();
    if (!event.repeat) press();
  }

  function handleSkipClick(event) {
    event.stopPropagation(); // not also a "next line" click on the overlay
    finish();
  }

  function finish() {
    if (finished) return;
    finished = true;
    window.removeEventListener('keydown', handleKeyDown, true);
    overlay.removeEventListener('click', press);
    skipButton.removeEventListener('click', handleSkipClick);
    clearDialogue();
    announcer.textContent = '';
    overlay.hidden = true;
    fadeOutSounds();
    onDone();
  }

  function frame(timestamp) {
    if (finished) return;
    // Same guard as the game loop: never step backwards, and don't leap after a hidden tab.
    const deltaTime = previousTimestamp === null ? 0 : clamp((timestamp - previousTimestamp) / 1000, 0, 0.05);
    previousTimestamp = timestamp;
    updateScene(deltaTime);
    runScript(deltaTime);
    if (finished) return;
    draw();
    requestAnimationFrame(frame);
  }

  paintPortrait();
  clearDialogue();
  announcer.textContent = '';
  overlay.hidden = false;
  overlay.focus();
  // Capture phase, so these keys reach the intro before the game's own shortcuts.
  window.addEventListener('keydown', handleKeyDown, true);
  overlay.addEventListener('click', press);
  skipButton.addEventListener('click', handleSkipClick);
  draw();
  requestAnimationFrame(frame);

  return { skip: finish };
}
