// PROTOTYPE, throwaway. Look A: an arcade "stage clear" screen.
// One centred column on black: a huge title, a score tally that counts up row by row,
// the next stage's enemies, and a blinking PRESS ENTER. Font: Press Start 2P.
import { SAMPLE, SPRITES, countUp, el, later, pluralName, sprite, waffleIcon } from './shared.js';

export const key = 'arcade';
export const label = 'A · Arcade (font: Press Start 2P)';

const pad = (value, width) => String(value).padStart(width, '0');

function describeEnemies({ species, count, packs }) {
  if (species.id === 'velociraptor') return `${packs} PACKS OF 3`;
  if (species.id === 'allosaurus') return `${count} THAT CHARGE`;
  return `${count} ON THE LOOSE`;
}

function tallyRow(icon, name, count, points, delay) {
  const total = el('span', 'arc__num');
  countUp(total, count * points, { delay: delay + 150, duration: 500 });
  const row = el('div', 'arc__row arc__step', [
    el('span', 'arc__icon', icon),
    el('span', 'arc__name', name),
    el('span', 'arc__sum', `${count} × ${points}`),
    total,
  ]);
  later(() => row.classList.add('is-in'), delay);
  return row;
}

export function render(stage, { onNext }) {
  const next = SAMPLE.upcoming[0];

  const score = el('b', '', pad(0, 6));
  countUp(score, SAMPLE.score, { delay: 1700, duration: 700, format: (value) => pad(value, 6) });
  const total = el('span', 'arc__num');
  countUp(total, SAMPLE.score, { delay: 1700, duration: 700 });
  const totalRow = el('div', 'arc__row arc__row--total arc__step', [
    el('span', 'arc__icon', '★'),
    el('span', 'arc__name', 'SCORE'),
    el('span', 'arc__sum', ''),
    total,
  ]);
  later(() => totalRow.classList.add('is-in'), 1600);

  const pack = el(
    'div',
    'arc__pack',
    Array.from({ length: Math.min(next.count, 6) }, (_, index) => {
      const dinosaur = sprite(SPRITES.dinosaurs[next.species.id], { height: 5, frameMs: 130 });
      dinosaur.style.animationDelay = `${index * -0.13}s`;
      return dinosaur;
    }),
  );
  const nextCard = el('div', 'arc__next arc__step', [
    el('div', 'arc__next-text', [
      el('p', 'arc__next-kicker', `NEXT · LEVEL ${next.level}`),
      el('p', 'arc__next-name', pluralName(next.species).toUpperCase()),
      el('p', 'arc__next-detail', describeEnemies(next)),
    ]),
    pack,
  ]);
  later(() => nextCard.classList.add('is-in'), 2600);

  const press = el('button', 'arc__press arc__step', 'PRESS ENTER');
  press.type = 'button';
  press.addEventListener('click', onNext);
  later(() => press.classList.add('is-in'), 3100);

  stage.append(
    el('div', 'arc', [
      el('header', 'arc__top', [
        el('span', '', ['1UP ', score]),
        el('span', '', ['HI ', el('b', '', pad(SAMPLE.best, 6))]),
        el('span', '', ['LEVEL ', el('b', '', pad(SAMPLE.level, 2))]),
      ]),
      el('div', 'arc__hero', [
        sprite(SPRITES.hero, { height: 11, className: 'arc__hop' }),
        el('h1', 'arc__title', [
          el('span', 'arc__title-small', `LEVEL ${SAMPLE.level}`),
          el('span', 'arc__title-big', 'CLEAR!'),
        ]),
        sprite(SPRITES.mayaSit, { height: 8, frameMs: 400, flip: true }),
      ]),
      el('div', 'arc__tally', [
        tallyRow(waffleIcon(2.4), 'WAFFLES', SAMPLE.waffles, SAMPLE.wafflePoints, 500),
        tallyRow(sprite(SPRITES.sodaTab, { height: 2.4 }), 'SODA TABS', SAMPLE.tabs, SAMPLE.tabPoints, 1000),
        totalRow,
      ]),
      nextCard,
      press,
      el('div', 'arc__scanlines'),
    ]),
  );
}
