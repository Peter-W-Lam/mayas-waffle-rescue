// PROTOTYPE, throwaway. Look B: a WAFL Storm Team 5 news broadcast, built on the weather
// ticker the game already has. A "live" picture of the rescue fills most of the screen,
// with a BREAKING lower-third headline, a report panel, the coming levels as a forecast,
// and a scrolling ticker. Font: Pixelify Sans.
import { SAMPLE, SPRITES, countUp, el, later, pluralName, sprite, waffleIcon } from './shared.js';

export const key = 'broadcast';
export const label = 'B · Storm Team 5 broadcast (font: Pixelify Sans)';

function describeEnemies({ species, count, packs }) {
  if (species.id === 'velociraptor') return `${packs} packs of 3`;
  return `${count} roaming`;
}

const OUTLOOK = { tRex: 'Slow, relentless', velociraptor: 'Fast, flanking', allosaurus: 'Sudden charges' };

function stat(icon, name, value, delay, className = '') {
  const number = el('strong', 'tv__stat-num');
  countUp(number, value, { delay, duration: 600 });
  return el('div', `tv__stat ${className}`.trim(), [
    el('div', 'tv__stat-top', [icon, number]),
    el('span', 'tv__stat-name', name),
  ]);
}

function forecastDay(upcoming, isNext) {
  return el('div', `tv__day${isNext ? ' is-next' : ''}`, [
    el('p', 'tv__day-level', isNext ? `NEXT · LV ${upcoming.level}` : `LV ${upcoming.level}`),
    sprite(SPRITES.dinosaurs[upcoming.species.id], { height: isNext ? 4.6 : 3.4, frameMs: isNext ? 160 : 0 }),
    el('p', 'tv__day-name', pluralName(upcoming.species)),
    el('p', 'tv__day-detail', describeEnemies(upcoming)),
    el('p', 'tv__day-outlook', OUTLOOK[upcoming.species.id]),
  ]);
}

export function render(stage, { onNext }) {
  const picture = el('div', 'tv__picture', [
    el('div', 'tv__rain'),
    el('div', 'tv__glow'),
    el('div', 'tv__ground'),
    sprite(SPRITES.waffleHouse, { height: 21, className: 'tv__house' }),
    sprite(SPRITES.hero, { height: 12.5, className: 'tv__hero' }),
    sprite(SPRITES.mayaSit, { height: 8.6, frameMs: 400, flip: true, className: 'tv__maya' }),
    el('span', 'tv__live', '● LIVE'),
    el('span', 'tv__place', 'WAFFLE HOUSE · CABBAGETOWN'),
  ]);

  const nextButton = el('button', 'tv__next', 'NEXT LEVEL ▶');
  nextButton.type = 'button';
  nextButton.addEventListener('click', onNext);

  const lower = el('div', 'tv__lower', [
    el('span', 'tv__tag', 'BREAKING'),
    el('div', 'tv__headline-box', [
      el('h1', 'tv__headline', 'MAYA SAFE AT WAFFLE HOUSE'),
      el('p', 'tv__sub', `Level ${SAMPLE.level} complete · ${SAMPLE.heroName} delivers one very good dog`),
    ]),
    nextButton,
  ]);
  later(() => lower.classList.add('is-in'), 250);

  const side = el('aside', 'tv__side', [
    el('section', 'tv__panel', [
      el('h2', 'tv__panel-title', 'RESCUE REPORT'),
      el('div', 'tv__stats', [
        stat(waffleIcon(2.6), 'WAFFLES', SAMPLE.waffles, 700),
        stat(sprite(SPRITES.sodaTab, { height: 2.6 }), 'SODA TABS', SAMPLE.tabs, 1000),
        stat(null, 'SCORE', SAMPLE.score, 1400, 'tv__stat--score'),
      ]),
    ]),
    el('section', 'tv__panel', [
      el('h2', 'tv__panel-title', 'DINOSAUR FORECAST'),
      el('div', 'tv__days', SAMPLE.upcoming.map((upcoming, index) => forecastDay(upcoming, index === 0))),
    ]),
  ]);

  const tickerText = [
    `${SAMPLE.heroName.toUpperCase()} AND MAYA REACH WAFFLE HOUSE`,
    'WAFFLE HOUSE INDEX: GREEN — FULL MENU',
    `${SAMPLE.upcoming[0].species.name.toUpperCase()} SIGHTINGS EXPECTED NEXT`,
    'RESIDENTS URGED TO KEEP SNACKS OUT OF REACH',
  ].join('   ◆   ');

  stage.append(
    el('div', 'tv', [
      el('div', 'tv__main', [picture, side]),
      lower,
      el('div', 'tv__ticker', [
        el('span', 'tv__brand', ['WAFL ', el('small', '', 'STORM TEAM 5')]),
        el('span', 'tv__ticker-tag', 'RESCUE UPDATE'),
        el('div', 'tv__ticker-window', el('p', 'tv__ticker-text', `${tickerText}   ◆   ${tickerText}`)),
      ]),
    ]),
  );
}
