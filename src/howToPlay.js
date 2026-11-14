// The "How to play" guide on the start screen: a handful of screenshots, each with a
// line or two, clicked through in a dialog (styled in diner.css). Visual only.
//
// The pictures in src/howToPlay/ are 960×540 crops of the real game, staged by hand
// (the hero, Maya and a T-Rex moved into place while the game was paused). Retake them
// if the map or sprites change enough to look wrong.
import runImage from './howToPlay/run.webp';
import findMayaImage from './howToPlay/find-maya.webp';
import waffleHouseImage from './howToPlay/waffle-house.webp';
import wafflesImage from './howToPlay/waffles.webp';
import floodImage from './howToPlay/flood.webp';

// The arrows at the edge of the screen that point to Maya and to Waffle House, as small
// pictures to drop into the text. They match what drawEdgeTracker in main.js draws: a
// round badge with a letter, and an arrowhead in the same colour.
const ARROWS = {
  M: { color: '#e94f91', label: 'M' },
  W: { color: '#d8920b', label: 'W' },
};

function createArrowIcon({ color, label }) {
  const icon = document.createElement('span');
  icon.className = 'howto__arrow';
  icon.setAttribute('aria-hidden', 'true');
  icon.innerHTML = `
    <svg viewBox="0 0 56 30">
      <circle cx="15" cy="15" r="12" fill="${color}" stroke="#fffaf0" stroke-width="3" />
      <text x="15" y="15.5" text-anchor="middle" dominant-baseline="central" fill="#fff"
        font-family="system-ui, sans-serif" font-size="13" font-weight="900">${label}</text>
      <path d="M53 15 L33 5 L33 25 Z" fill="${color}" stroke="#fffaf0" stroke-width="3" stroke-linejoin="round" />
    </svg>`;
  return icon;
}

// Turns a step's text into nodes, swapping {M} and {W} for the arrow pictures.
function renderText(text) {
  return text.split(/(\{[MW]\})/).filter(Boolean).map((part) => {
    const arrow = ARROWS[part.slice(1, -1)];
    return part.startsWith('{') && arrow ? createArrowIcon(arrow) : document.createTextNode(part);
  });
}

// In a step's text, {M} and {W} show the matching arrow. touchText replaces text on
// phones and tablets. showKeys draws the arrow keys over the picture (keyboards only).
const STEPS = [
  {
    image: runImage,
    alt: 'The hero running down a street with a T-Rex close behind.',
    title: 'Run!',
    text: 'Use the arrow keys to run through the streets. Dinosaurs are loose, and one touch ends the run.',
    touchText: 'Drag anywhere on the map to run through the streets. Dinosaurs are loose, and one touch ends the run.',
    showKeys: true,
  },
  {
    image: findMayaImage,
    alt: 'The hero walking up to Maya, who is sitting in the road with a pink ring around her.',
    title: 'Find Maya',
    text: 'Maya is lost somewhere in the neighborhood. Follow the pink M arrow {M} at the edge of the screen. Walk up to her and she follows you.',
  },
  {
    image: waffleHouseImage,
    alt: 'The hero and Maya walking up the driveway to Waffle House.',
    title: 'Get to Waffle House',
    text: 'Once Maya is with you, a yellow W arrow {W} appears at the edge of the screen. Follow it to Waffle House to finish the level.',
  },
  {
    image: wafflesImage,
    alt: 'Waffles and a soda tab lined up along the street ahead of the hero and Maya.',
    title: 'Grab the waffles',
    text: 'Waffles are worth 10 points and soda tabs 5. Pick up what you can along the way.',
  },
  {
    image: floodImage,
    alt: 'The hero and Maya wading through a flooded street in the rain with a T-Rex right behind them at the water’s edge.',
    title: 'Watch the water',
    text: 'The storm floods streets as it rolls in. Wading slows you down, and the dinosaurs wade just as fast as you do, so keep moving.',
  },
];

function span(className, text) {
  const created = document.createElement('span');
  created.className = className;
  created.append(...renderText(text));
  return created;
}

// dialog is the <dialog> in index.html; each opener is something that opens it when clicked.
export function setUpHowToPlay({ dialog, openers }) {
  const find = (id) => dialog.querySelector(`#${id}`);
  const image = find('howto-image');
  const keys = find('howto-keys');
  const count = find('howto-count');
  const title = find('howto-title');
  const text = find('howto-text');
  const dots = find('howto-dots');
  const backButton = find('howto-back');
  const nextButton = find('howto-next');
  let index = 0;

  dots.replaceChildren(...STEPS.map(() => document.createElement('li')));

  function show(nextIndex) {
    index = Math.max(0, Math.min(nextIndex, STEPS.length - 1));
    const step = STEPS[index];
    const isLast = index === STEPS.length - 1;

    image.src = step.image;
    image.alt = step.alt;
    keys.hidden = !step.showKeys;
    count.textContent = `How to play · ${index + 1} of ${STEPS.length}`;
    title.textContent = step.title;
    if (step.touchText) {
      text.replaceChildren(span('keyboard-only', step.text), span('touch-only', step.touchText));
    } else {
      text.replaceChildren(...renderText(step.text));
    }
    [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle('is-current', dotIndex === index));
    backButton.disabled = index === 0;
    nextButton.textContent = isLast ? 'Got it' : 'Next →';
    // Fetch the next picture now so it's there when Next is pressed.
    if (!isLast) new Image().src = STEPS[index + 1].image;
  }

  function open() {
    show(0);
    dialog.showModal();
    nextButton.focus();
  }

  for (const opener of openers) opener.addEventListener('click', open);
  backButton.addEventListener('click', () => show(index - 1));
  nextButton.addEventListener('click', () => {
    if (index === STEPS.length - 1) dialog.close();
    else show(index + 1);
  });
  find('howto-close').addEventListener('click', () => dialog.close());
  // A click on the dimmed area around the dialog closes it.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') show(index + 1);
    else if (event.key === 'ArrowLeft') show(index - 1);
    // Keys pressed here stay here: the game's own shortcuts (arrows, P, M, Esc) are
    // listening on the window. Esc still closes the dialog, which the browser handles.
    event.stopPropagation();
  });
}
