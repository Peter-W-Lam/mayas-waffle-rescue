// Pixel-art Allosaurus, drawn facing right. Each character is one pixel; see
// ALLOSAURUS_PALETTE. Told apart from the T-Rex by its brick-red hide with dark stripes,
// the bony horns over its eyes, a longer and lower snout, and longer three-clawed arms.
// Rows 0–16 are its head, body, arm and tail. Legs are added per animation frame below.
const ALLOSAURUS_BODY_ROWS = [
  '...................h..h.......',
  '..................ohoohooooo..',
  '.................oRRRRRRRRRRo.',
  '................oRRRRyeRRRRRRo',
  '................oRRRRRRRototoo',
  '...............oRRDRRRmmmmmmo.',
  '...............oRRRRRRLtLtLo..',
  '..............oRRDRRRLLLLoo...',
  '..............oRRRRRRRo.......',
  '.........oooooRRDRRRRo........',
  '......oooRRDRRDRRRRLLLoo......',
  '...oooRRDRRDRRDRRRRLLLRRoo....',
  'oooRRDRRDRRRRRRRRRRLLLoRRRco..',
  '.ooDDRRRRRRRRRRRRRRLLLooocco..',
  '...ooDDDRRRRRRRRRRRLLLo.......',
  '......ooDDRRRRRRRRRLLo........',
  '........oDDRRRRRRRRLo.........',
];

export const ALLOSAURUS_PALETTE = {
  o: '#2a1512', // outline
  R: '#b24a33', // brick-red hide
  D: '#7c2c22', // dark stripes and shaded hide
  L: '#f0cf9c', // pale belly
  h: '#f2c94c', // horns over the eyes
  y: '#fff2a8', // eye
  e: '#1a1414', // pupil
  m: '#5a1616', // mouth
  t: '#fff4d8', // teeth
  c: '#e8dcc0', // claws
};

// Legs and feet for each frame: standing / stride A, then stride B.
const ALLOSAURUS_LEG_FRAMES = [
  [
    '..........oDDDo.oRRRo.........',
    '..........oDDo...oRRo.........',
    '..........oDDo...oRRo.........',
    '..........oDDDco.oRRRco.......',
    '..........oooooo.oooooo.......',
  ],
  [
    '.........oDDDo...oRRRo........',
    '........oDDo......oRRo........',
    '.......oDDo........oRRo.......',
    '......oDDDco.......oRRRco.....',
    '......oooooo.......oooooo.....',
  ],
];

export const ALLOSAURUS_FRAME_ROWS = ALLOSAURUS_LEG_FRAMES.map(
  (legRows) => [...ALLOSAURUS_BODY_ROWS, ...legRows],
);

function renderFrame(rows) {
  const frame = document.createElement('canvas');
  frame.width = rows[0].length;
  frame.height = rows.length;
  const frameContext = frame.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = ALLOSAURUS_PALETTE[pixel];
      if (!color) return;
      frameContext.fillStyle = color;
      frameContext.fillRect(x, y, 1, 1);
    });
  });

  return frame;
}

export function createAllosaurusFrames() {
  return ALLOSAURUS_FRAME_ROWS.map(renderFrame);
}
