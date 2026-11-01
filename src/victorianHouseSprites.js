// Pixel-art Victorian houses for filling in the Inman Park blocks, seen from the front
// like the other buildings. Each character is one pixel. Every style shares one palette
// layout, and a colorway swaps the body and roof colors, so a few shapes give many
// different-looking houses. Doors are at the bottom centre.

// Queen Anne: round corner tower with a cone roof, front gable and wraparound porch.
const QUEEN_ANNE_ROWS = [
  '....oo....................',
  '...oRro...................',
  '..oRRrro..................',
  '..oRRrro..................',
  '.oRRRrrro.................',
  '.oRRRrrro.......oo........',
  'oRRRRrrrro.....oRRo.......',
  'oooooooooo....oRTTRo......',
  '.obBBBBbo....oRTBBTRo.....',
  '.obBBBBbo...oRTBBBBTRo....',
  '.oboooobo..oRTBBooBBTRo...',
  '.oboWWobo.oRTBBoWWoBBTRo..',
  '.oboWwobooRTBBBoWwoBBBTRo.',
  '.obooooboorrrrrrrrrrrrrro.',
  '.oTTTTTTobbbbbbbbbbbbbbbo.',
  '.obBBBBboBBooooBBBooooBBo.',
  '.obooooboBBoWWoBBBoWWoBBo.',
  '.oboWWoboBBoWwoBBBoWwoBBo.',
  '.oboWwoboBBoWWoBBBoWWoBBo.',
  '.oboWWoboBBooooBBBooooBBo.',
  '.obooooboBBBBBBBBBBBBBBBo.',
  'oooooooooooooooooooooooooo',
  'oRRRRRRRRRRRRRRRRRRRRRRRRo',
  'oTbTbTbTbTbTbbTbTbTbTbTbTo',
  'oTboooobTbboooobboooobbbTo',
  'oTboWWobTbboDDobboWWobbbTo',
  'oTboWwobTbboDDobboWwobbbTo',
  'oTboWWobTbboDDobboWWobbbTo',
  'oTboooobTbboDDobboooobbbTo',
  'oPPPPPPPPPPPPPPPPPPPPPPPPo',
  'ooooooooooossssooooooooooo',
  '..........oSSSSo..........',
  '..........oooooo..........',
];

// Two-story front gable with lacy trim, a chimney and a full-width porch.
const GABLED_TWO_STORY_ROWS = [
  '...........oo...........',
  '..........oRRo....oooo..',
  '.........oRTTRo...oCCo..',
  '........oRTBBTRo..oCCo..',
  '.......oRTBBBBTRo.oCCo..',
  '......oRTBBooBBTRooCCo..',
  '.....oRTBBoWWoBBTRoCCo..',
  '....oRTBBBoWwoBBBTRooo..',
  '...oRTBBBBooooBBBBTRo...',
  '..orrrrrrrrrrrrrrrrrro..',
  '...obbbbbbbbbbbbbbbbo...',
  '...oBBooooBBBBooooBBo...',
  '...oBBoWWoBBBBoWWoBBo...',
  '...oBBoWwoBBBBoWwoBBo...',
  '...oBBoWWoBBBBoWWoBBo...',
  '...oBBooooBBBBooooBBo...',
  '...oBBBBBBBBBBBBBBBBo...',
  '.oooooooooooooooooooooo.',
  '.oRRRRRRRRRRRRRRRRRRRRo.',
  '.oTbTbTbTbTbbTbTbTbTbTo.',
  '.oTboooobboooobboooobTo.',
  '.oTboWWobboDDobboWWobTo.',
  '.oTboWwobboDDobboWwobTo.',
  '.oTboWWobboDDobboWWobTo.',
  '.oTboooobboDDobboooobTo.',
  '.oPPPPPPPPPPPPPPPPPPPPo.',
  '.ooooooooossssooooooooo.',
  '.........oSSSSo.........',
  '.........oooooo.........',
];

// Shotgun cottage: one narrow room wide, steep gable, small front porch.
const SHOTGUN_COTTAGE_ROWS = [
  '.......oo.......',
  '......oRRo......',
  '.....oRTTRo.....',
  '....oRTBBTRo....',
  '...oRTBooBTRo...',
  '..oRTBoWWoBTRo..',
  '.oRTBBooooBBTRo.',
  'orrrrrrrrrrrrrro',
  '.obbbbbbbbbbbbo.',
  '.oBBBBBBBBBBBBo.',
  'oooooooooooooooo',
  'oRRRRRRRRRRRRRRo',
  'oTbTbTbbbbTbTbTo',
  'oTboooobboooobTo',
  'oTboWWobboDDobTo',
  'oTboWwobboDDobTo',
  'oTboWWobboDDobTo',
  'oTboWWobboDDobTo',
  'oTboooobboDDobTo',
  'oPPPPPPPPPPPPPPo',
  'oooooooooossssoo',
  '........oSSSSo..',
  '........oooooo..',
];

// Folk Victorian: wide hipped roof with a centre gable, three windows up top and a
// porch with turned posts.
const FOLK_VICTORIAN_ROWS = [
  '............oo............',
  '...........oRRo...........',
  '......oooooRTTRooooo......',
  '.....oRRRoRTBBTRoRRRo.....',
  '....oRRRoRTBooBTRoRRRo....',
  '...oRRRoRTBoWWoBTRoRRRo...',
  '..oRRRoRTBBoWwoBBTRoRRRo..',
  '.oRRRoRTBBBooooBBBTRoRRRo.',
  'orrrrrrrrrrrrrrrrrrrrrrrro',
  '.obbbbbbbbbbbbbbbbbbbbbbo.',
  '.oBooooBBBBooooBBBBooooBo.',
  '.oBoWWoBBBBoWWoBBBBoWWoBo.',
  '.oBoWwoBBBBoWwoBBBBoWwoBo.',
  '.oBoWWoBBBBoWWoBBBBoWWoBo.',
  '.oBooooBBBBooooBBBBooooBo.',
  '.oBBBBBBBBBBBBBBBBBBBBBBo.',
  'oooooooooooooooooooooooooo',
  'oRRRRRRRRRRRRRRRRRRRRRRRRo',
  'oTbTbTbTbTbTbbTbTbTbTbTbTo',
  'oTboooobTbboooobbTboooobTo',
  'oTboWWobTbboDDobbTboWWobTo',
  'oTboWwobTbboDDobbTboWwobTo',
  'oTboWWobTbboDDobbTboWWobTo',
  'oTboooobTbboDDobbTboooobTo',
  'oPPPPPPPPPPPPPPPPPPPPPPPPo',
  'ooooooooooossssooooooooooo',
  '..........oSSSSo..........',
  '..........oooooo..........',
];

export const VICTORIAN_HOUSE_STYLES = {
  queenAnne: QUEEN_ANNE_ROWS,
  gabledTwoStory: GABLED_TWO_STORY_ROWS,
  shotgunCottage: SHOTGUN_COTTAGE_ROWS,
  folkVictorian: FOLK_VICTORIAN_ROWS,
};

// Colors every house shares.
const SHARED_PALETTE = {
  o: '#2a1d17', // outline
  T: '#fffaf0', // painted trim, posts and gingerbread
  W: '#ffe0a0', // windows lit from inside
  w: '#fff6da', // glass glare
  D: '#6b3a2a', // front door
  P: '#b98a5e', // porch floor
  C: '#a4492f', // chimney brick
  s: '#d9d4c7', // front steps
  S: '#b9b3a5', // step shade
};

// Paint jobs: B body, b shaded body (under eaves and inside the porch), R roof,
// r roof eave.
export const VICTORIAN_HOUSE_COLORWAYS = [
  { name: 'sage', B: '#9fb88a', b: '#7d9668', R: '#5a4a5e', r: '#463a4a' },
  { name: 'butter', B: '#f2d77e', b: '#cfb35e', R: '#4f6a6e', r: '#3d5357' },
  { name: 'brick', B: '#c0583f', b: '#97402d', R: '#3f4a52', r: '#2f383e' },
  { name: 'dusty blue', B: '#8fb0c9', b: '#6f8fa8', R: '#6b3f3a', r: '#54302c' },
  { name: 'lavender', B: '#b9a3cc', b: '#9883ac', R: '#4c5a48', r: '#3b4639' },
];

export function victorianHousePalette(colorway) {
  const { name, ...colors } = colorway;
  return { ...SHARED_PALETTE, ...colors };
}

export function createVictorianHouseSprite(styleId, colorwayIndex = 0) {
  const rows = VICTORIAN_HOUSE_STYLES[styleId];
  const colorway = VICTORIAN_HOUSE_COLORWAYS[colorwayIndex % VICTORIAN_HOUSE_COLORWAYS.length];
  const palette = victorianHousePalette(colorway);

  const sprite = document.createElement('canvas');
  sprite.width = rows[0].length;
  sprite.height = rows.length;
  const spriteContext = sprite.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = palette[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}

// Every style in every colorway, for picking from when placing houses.
export function createAllVictorianHouseSprites() {
  return Object.keys(VICTORIAN_HOUSE_STYLES).flatMap((styleId) =>
    VICTORIAN_HOUSE_COLORWAYS.map((_, colorwayIndex) => ({
      styleId,
      colorwayIndex,
      sprite: createVictorianHouseSprite(styleId, colorwayIndex),
    })),
  );
}
