// Building blocks for the start, level-complete and game-over screens, which are drawn
// as the inside of a Waffle House (see diner.css): titles spelled in the sign's yellow
// letter tiles, the score as a guest check that prints line by line, and pixel sprites
// standing on the floor. Visual only; main.js decides what each screen says.

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const TILE_STAGGER_MS = 70;
const CHECK_FIRST_LINE_MS = 500;
const CHECK_LINE_GAP_MS = 450;
const CHECK_STAMP_DELAY_MS = 700;
const COUNT_UP_MS = 450;

function element(tag, className, text = '') {
  const created = document.createElement(tag);
  created.className = className;
  created.textContent = text;
  return created;
}

// Spells text in letter tiles, one tile per character, dropping in one after another.
// Use "|" to start a new row of tiles. Screen readers get the plain text instead.
export function setTiles(container, text) {
  let delay = 0;
  container.setAttribute('role', 'img');
  container.setAttribute('aria-label', text.replaceAll('|', ' '));
  container.replaceChildren(...text.split('|').map((rowText) => {
    const row = element('span', 'diner__tile-row');
    row.append(...[...rowText].map((letter) => {
      if (letter === ' ') return element('span', 'diner__tile-gap');
      const tile = element('span', 'diner__tile', letter);
      tile.style.animationDelay = `${delay}ms`;
      delay += TILE_STAGGER_MS;
      return tile;
    }));
    return row;
  }));
}

// Timers for the check being printed in each container, so printing it again (the next
// level, the next game over) cancels whatever the last one still had queued.
const checkTimers = new WeakMap();

function clearCheckTimers(container) {
  for (const timer of checkTimers.get(container) ?? []) {
    clearTimeout(timer);
    clearInterval(timer);
  }
  checkTimers.set(container, []);
}

// Shows a number counting up from zero.
function countUp(container, target, numberElement) {
  const start = performance.now();
  const timer = setInterval(() => {
    const progress = Math.min(1, (performance.now() - start) / COUNT_UP_MS);
    numberElement.textContent = String(Math.round(target * progress));
    if (progress === 1) clearInterval(timer);
  }, 30);
  checkTimers.get(container).push(timer);
}

// Prints a guest check into the container:
//   { heading, meta: [left, right],
//     lines: [{ quantity, item, price, amount }],   amount: a number counts up, text is shown as is
//     total: { label, amount }, extra: { label, amount } (optional small line under the total),
//     footer, stamp }
// Lines appear one at a time, then the total, then the rubber stamp. With reduced motion
// the finished check is shown at once.
export function printCheck(container, { heading, meta, lines, total, extra, footer, stamp }) {
  clearCheckTimers(container);
  const instant = reducedMotion.matches;
  const reveals = []; // [element, amount element, amount] in the order they print

  const lineElements = lines.map(({ quantity, item, price = '', amount }) => {
    const amountElement = element('span', 'diner__amount');
    const line = element('div', 'diner__line diner__step');
    line.append(
      element('span', 'diner__qty', String(quantity)),
      element('span', 'diner__item', item),
      element('span', 'diner__price', price),
      amountElement,
    );
    reveals.push([line, amountElement, amount]);
    return line;
  });

  const totalAmount = element('span', 'diner__amount');
  const totalLine = element('div', 'diner__line diner__line--total diner__step');
  totalLine.append(element('span', '', total.label), totalAmount);
  reveals.push([totalLine, totalAmount, total.amount]);

  const metaRow = element('div', 'diner__check-meta');
  metaRow.append(element('span', '', meta[0]), element('span', '', meta[1]));
  const stampElement = element('div', 'diner__stamp', stamp);

  container.replaceChildren(
    element('p', 'diner__check-head', heading),
    metaRow,
    element('div', 'diner__rule'),
    ...lineElements,
    element('div', 'diner__rule'),
    totalLine,
  );
  if (extra) {
    const extraLine = element('div', 'diner__line diner__line--extra');
    extraLine.append(element('span', '', extra.label), element('span', 'diner__amount', String(extra.amount)));
    container.append(extraLine);
  }
  container.append(element('p', 'diner__thanks', footer), stampElement);

  const timers = checkTimers.get(container);
  reveals.forEach(([line, amountElement, amount], index) => {
    const reveal = () => {
      line.classList.add('is-in');
      if (typeof amount === 'number' && !instant) countUp(container, amount, amountElement);
      else amountElement.textContent = String(amount);
    };
    if (instant) reveal();
    else timers.push(setTimeout(reveal, CHECK_FIRST_LINE_MS + index * CHECK_LINE_GAP_MS));
  });

  const stampAt = CHECK_FIRST_LINE_MS + reveals.length * CHECK_LINE_GAP_MS + CHECK_STAMP_DELAY_MS;
  if (instant) stampElement.classList.add('is-in');
  else timers.push(setTimeout(() => stampElement.classList.add('is-in'), stampAt));
}

// Shows pixel-sprite frames in a canvas (CSS sizes it; see .diner__sprite). With more
// than one frame it cycles through them, e.g. a walk or Maya's tail wag. Returns
// setFrames(frames) to swap the sprite later, such as when the hero changes.
export function createSprite(canvas, frames, frameMs = 0) {
  const context = canvas.getContext('2d');
  let current = frames;
  let index = 0;

  function draw() {
    const frame = current[index % current.length];
    if (canvas.width !== frame.width) canvas.width = frame.width;
    if (canvas.height !== frame.height) canvas.height = frame.height;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(frame, 0, 0);
  }

  draw();
  if (frameMs > 0) {
    setInterval(() => {
      // Hidden screens (and reduced motion) hold still.
      if (canvas.offsetParent === null || reducedMotion.matches) return;
      index += 1;
      draw();
    }, frameMs);
  }

  return {
    setFrames(nextFrames) {
      current = nextFrames;
      index = 0;
      draw();
    },
  };
}
