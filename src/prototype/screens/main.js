// PROTOTYPE, throwaway: three looks for the "level complete" screen, switchable with
// ?variant=arcade|broadcast|diner, the bar at the bottom, or the arrow keys. R replays
// the entrance. "Next level" does nothing real; it just replays the screen.
import './screens.css';
import { stopAllTimers } from './shared.js';
import * as arcade from './arcade.js';
import * as broadcast from './broadcast.js';
import * as diner from './diner.js';

const VARIANTS = [arcade, broadcast, diner];
const stage = document.querySelector('#stage');
const labelText = document.querySelector('#proto-label');

function currentIndex() {
  const key = new URLSearchParams(window.location.search).get('variant');
  return Math.max(0, VARIANTS.findIndex((variant) => variant.key === key));
}

function show(index) {
  const variant = VARIANTS[(index + VARIANTS.length) % VARIANTS.length];
  const url = new URL(window.location.href);
  url.searchParams.set('variant', variant.key);
  window.history.replaceState(null, '', url);

  stopAllTimers();
  stage.replaceChildren();
  variant.render(stage, { onNext: () => show(currentIndex()) });
  labelText.textContent = variant.label;
}

document.querySelector('#proto-prev').addEventListener('click', () => show(currentIndex() - 1));
document.querySelector('#proto-next').addEventListener('click', () => show(currentIndex() + 1));
document.querySelector('#proto-replay').addEventListener('click', () => show(currentIndex()));
window.addEventListener('keydown', (event) => {
  if (event.target instanceof HTMLButtonElement && event.key === 'Enter') return;
  if (event.key === 'ArrowLeft') show(currentIndex() - 1);
  else if (event.key === 'ArrowRight') show(currentIndex() + 1);
  else if (event.key === 'r' || event.key === 'R' || event.key === 'Enter') show(currentIndex());
});

// Wait for the pixel fonts so the first look doesn't flash in a fallback font.
document.fonts.ready.then(() => show(currentIndex()));
