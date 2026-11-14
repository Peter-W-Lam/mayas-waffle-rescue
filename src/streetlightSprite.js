// Pixel-art streetlight for the BeltLine: a lantern on a slim post, seen from the front.
// Each character is one pixel; see STREETLIGHT_PALETTE. Drawn with the foot of the post
// (bottom centre) on its spot beside the path. There are two versions, off and lit; the
// game fades the lit one in as the storm darkens.
export const STREETLIGHT_ROWS = [
  '...ooo...',
  '..ommmo..',
  '.oooooooo',
  '.oGgggSo.',
  '.oGgggSo.',
  '.oGgggSo.',
  '..oGgSo..',
  '...ooo...',
  '....o....',
  '...omo...',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '....m....',
  '...omo...',
  '..ommmo..',
  '..ooooo..',
];

export const STREETLIGHT_PALETTE = {
  o: '#20262b', // outline
  m: '#4a545c', // painted metal
  G: '#f4f7f2', // glass, catching the light
  g: '#cfd8d6', // glass
  S: '#9aa6a6', // glass in shade
};

// The same lantern switched on: only the glass changes.
const LIT_GLASS = {
  G: '#fffbe6',
  g: '#ffe58a',
  S: '#f5bd4f',
};

// The lantern takes up this many rows at the top of the sprite.
export const STREETLIGHT_LANTERN_ROWS = 8;

export function createStreetlightSprite({ lit = false } = {}) {
  const palette = lit ? { ...STREETLIGHT_PALETTE, ...LIT_GLASS } : STREETLIGHT_PALETTE;
  const sprite = document.createElement('canvas');
  sprite.width = STREETLIGHT_ROWS[0].length;
  sprite.height = STREETLIGHT_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  STREETLIGHT_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = palette[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
