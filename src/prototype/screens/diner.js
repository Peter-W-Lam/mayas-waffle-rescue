// PROTOTYPE, throwaway. Look C: inside the Waffle House.
// The title is spelled in the yellow letter tiles from the building's sign, the score is
// a guest check with a rubber stamp, and the next level is on the menu board. The hero
// and Maya sit at the counter. Fonts: Silkscreen (tiles, board) and VT323 (the check).
import { SAMPLE, SPRITES, countUp, el, later, pluralName, sprite } from './shared.js';

export const key = 'diner';
export const label = 'C · Waffle House diner (fonts: Silkscreen + VT323)';

function describeEnemies({ species, count, packs }) {
  if (species.id === 'velociraptor') return `${packs} packs of 3 · fast & flanking`;
  if (species.id === 'allosaurus') return `${count} of them · they charge`;
  return `${count} of them · slow & relentless`;
}

// One yellow tile per letter, like the sign; tiles drop in one after another.
function tiles(text, startDelay = 0) {
  return el(
    'div',
    'diner__tiles',
    [...text].map((letter, index) => {
      if (letter === ' ') return el('span', 'diner__tile-gap');
      const tile = el('span', 'diner__tile', letter);
      tile.style.animationDelay = `${startDelay + index * 70}ms`;
      return tile;
    }),
  );
}

function checkLine(quantity, item, price, total, delay) {
  const amount = el('span', 'diner__amount');
  if (typeof total === 'number') countUp(amount, total, { delay: delay + 100, duration: 450 });
  else amount.textContent = total;
  const line = el('div', 'diner__line diner__step', [
    el('span', 'diner__qty', String(quantity)),
    el('span', 'diner__item', item),
    el('span', 'diner__price', price),
    amount,
  ]);
  later(() => line.classList.add('is-in'), delay);
  return line;
}

export function render(stage, { onNext }) {
  const next = SAMPLE.upcoming[0];

  const total = el('span', 'diner__amount');
  countUp(total, SAMPLE.score, { delay: 2400, duration: 600 });
  const totalLine = el('div', 'diner__line diner__line--total diner__step', [el('span', '', 'TOTAL'), total]);
  later(() => totalLine.classList.add('is-in'), 2300);

  const stamp = el('div', 'diner__stamp', 'RESCUED');
  later(() => stamp.classList.add('is-in'), 3100);

  const check = el('div', 'diner__check', [
    el('p', 'diner__check-head', 'GUEST CHECK'),
    el('div', 'diner__check-meta', [
      el('span', '', `TABLE: LEVEL ${SAMPLE.level}`),
      el('span', '', `SERVER: ${SAMPLE.heroName.toUpperCase()}`),
    ]),
    el('div', 'diner__rule'),
    checkLine(SAMPLE.waffles, 'WAFFLES', `@${SAMPLE.wafflePoints}`, SAMPLE.waffles * SAMPLE.wafflePoints, 900),
    checkLine(SAMPLE.tabs, 'SODA TABS', `@${SAMPLE.tabPoints}`, SAMPLE.tabs * SAMPLE.tabPoints, 1350),
    checkLine(1, 'DOG, RESCUED', '', 'PRICELESS', 1800),
    el('div', 'diner__rule'),
    totalLine,
    el('p', 'diner__thanks', 'THANK YOU · COME AGAIN'),
    stamp,
  ]);

  const nextButton = el('button', 'diner__next', 'NEXT LEVEL →');
  nextButton.type = 'button';
  nextButton.addEventListener('click', onNext);

  const board = el('div', 'diner__board', [
    el('div', 'diner__board-top', [
      el('div', '', [
        el('p', 'diner__board-kicker', 'NEXT ON THE GRILL'),
        el('p', 'diner__board-level', `LEVEL ${next.level}`),
      ]),
      sprite(SPRITES.dinosaurs[next.species.id], { height: 5.6, frameMs: 150 }),
    ]),
    el('p', 'diner__board-name', pluralName(next.species)),
    el('p', 'diner__board-detail', describeEnemies(next)),
    nextButton,
  ]);

  stage.append(
    el('div', 'diner', [
      el('header', 'diner__sign', [
        tiles('ORDER UP!', 150),
        el('p', 'diner__sub', `Maya made it to Waffle House · Level ${SAMPLE.level} complete`),
      ]),
      el('div', 'diner__body', [check, board]),
      el('div', 'diner__counter', [
        el('div', 'diner__seats', [
          sprite(SPRITES.hero, { height: 12 }),
          sprite(SPRITES.mayaSit, { height: 8.2, frameMs: 400, flip: true }),
        ]),
      ]),
    ]),
  );
}
