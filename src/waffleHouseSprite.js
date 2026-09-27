// Pixel-art Waffle House, seen from the front. Each character is one pixel; see
// WAFFLE_HOUSE_PALETTE. At 2× scale it fills the 148×78 destination footprint, with the
// door at the bottom centre where the access path meets the building.
export const WAFFLE_HOUSE_ROWS = [
  '......oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo......',
  '.....oRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRo.....',
  '....oRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRRRo....',
  '...oRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRo...',
  '..oRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRrRRRRRo..',
  '.oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.',
  '.okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkko.',
  '.okYYYYYYYkYYYYYkYYYYYkYYYYYkYYYYYkYYYYYkkYYYYYkYYYYYkYYYYYkYYYYYkYYYYYko.',
  '.okYkYYYkYkYYkYYkYkkkYkYkkkYkYkYYYkYkkkYkkYkYkYkYkkkYkYkYkYkYkkkYkYkkkYko.',
  '.okYkYYYkYkYkYkYkYkYYYkYkYYYkYkYYYkYkYYYkkYkYkYkYkYkYkYkYkYkYkYYYkYkYYYko.',
  '.okYkYkYkYkYkkkYkYkkYYkYkkYYkYkYYYkYkkYYkkYkkkYkYkYkYkYkYkYkYkkkYkYkkYYko.',
  '.okYkYkYkYkYkYkYkYkYYYkYkYYYkYkYYYkYkYYYkkYkYkYkYkYkYkYkYkYkYYYkYkYkYYYko.',
  '.okYYkYkYYkYkYkYkYkYYYkYkYYYkYkkkYkYkkkYkkYkYkYkYkkkYkYkkkYkYkkkYkYkkkYko.',
  '.okYYYYYYYkYYYYYkYYYYYkYYYYYkYYYYYkYYYYYkkYYYYYkYYYYYkYYYYYkYYYYYkYYYYYko.',
  '.okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkko.',
  '.oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  'oCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCo',
  'occcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccco',
  'occmmmmmmmmmcmmmmmmmmmcmmmmmmmmmcmmmmmmmmcmmmmmmmmmcmmmmmmmmmcmmmmmmmmmcco',
  'occmGGgggggmcmGGgggggmcmGGgggggmcmmmmmmmmcmGGgggggmcmGGgggggmcmGGgggggmcco',
  'occmGGgggggmcmGGgggggmcmGGgggggmcmmGGggmmcmGGgggggmcmGGgggggmcmGGgggggmcco',
  'occmGggggggmcmGggggggmcmGggggggmcmmGGggmmcmGggggggmcmGggggggmcmGggggggmcco',
  'occmgggggggmcmgggggggmcmgggggggmcmmggggmmcmgggggggmcmgggggggmcmgggggggmcco',
  'occmgggggggmcmgggggggmcmgggggggmcmmggggmmcmgggggggmcmgggggggmcmgggggggmcco',
  'occmggngnggmcmggngnggmcmggngnggmcmmggggmmcmggngnggmcmggngnggmcmggngnggmcco',
  'occmnnnnnnnmcmnnnnnnnmcmnnnnnnnmcmmggggmmcmnnnnnnnmcmnnnnnnnmcmnnnnnnnmcco',
  'occmnnnnnnnmcmnnnnnnnmcmnnnnnnnmcmmmmmmmmcmnnnnnnnmcmnnnnnnnmcmnnnnnnnmcco',
  'occmmmmmmmmmcmmmmmmmmmcmmmmmmmmmcmddddddmcmmmmmmmmmcmmmmmmmmmcmmmmmmmmmcco',
  'obBmmmmmmmmmbmmmmmmmmmBmmmmmmmmmbmddddddmbmmmmmmmmmbmmmmmmmmmbmmmmmmmmmbbo',
  'oBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBmddddYdmBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBo',
  'obBbbbBbbbBbbbBbbbBbbbBbbbBbbbBbbmddddddmbBbbbBbbbBbbbBbbbBbbbBbbbBbbbBbbo',
  'oBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBmddddddmBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBo',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  'ossssssssssssssssssssssssssssssssSSSSSSSSsssssssssssssssssssssssssssssssso',
  'ossssssssssssssssssssssssssssssssSSSSSSSSsssssssssssssssssssssssssssssssso',
  'ossssssssssssssssssssssssssssssssSSSSSSSSsssssssssssssssssssssssssssssssso',
  'oSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSo',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
];

export const WAFFLE_HOUSE_PALETTE = {
  o: '#2a1d17', // outline
  R: '#8a3b2a', // roof shingles
  r: '#6e2d20', // shingle shadows
  k: '#1c1a17', // sign backing and lettering
  Y: '#ffd44a', // sign tiles and door handle
  c: '#efe2c2', // cream wall
  C: '#d3c19b', // shade under the eave
  m: '#5a4632', // window and door frames
  g: '#ffe3a0', // windows lit from inside
  G: '#fff6da', // glass glare
  n: '#c98a4b', // diners in the booths
  d: '#7a4a2b', // door
  b: '#a3482f', // brick
  B: '#7f3522', // mortar and shaded brick
  s: '#d9d4c7', // sidewalk
  S: '#b9b3a5', // sidewalk shade and doormat
};

export function createWaffleHouseSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = WAFFLE_HOUSE_ROWS[0].length;
  sprite.height = WAFFLE_HOUSE_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  WAFFLE_HOUSE_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = WAFFLE_HOUSE_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
