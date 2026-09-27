// Pixel-art soda can pull tab, seen from above. Each character is one pixel; see
// SODA_TAB_PALETTE. The big finger hole and the small rivet hole are transparent so
// the road shows through.
export const SODA_TAB_ROWS = [
  '..oooooo..',
  '.ohhhhhho.',
  'oh......So',
  'oh......So',
  'oh......So',
  '.oh....So.',
  '..osssSo..',
  '.osssssSo.',
  'osss..sSSo',
  'osss..sSSo',
  '.ossssSSo.',
  '..oooooo..',
];

export const SODA_TAB_PALETTE = {
  o: '#4b5561', // outline
  h: '#f4f7fa', // shine along the top edge
  s: '#c3cbd3', // aluminum
  S: '#8e99a4', // shaded aluminum
};

export function createSodaTabSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = SODA_TAB_ROWS[0].length;
  sprite.height = SODA_TAB_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  SODA_TAB_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = SODA_TAB_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
