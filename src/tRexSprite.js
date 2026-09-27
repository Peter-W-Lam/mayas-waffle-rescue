// Pixel-art T-Rex, drawn facing right. Each character is one pixel; see T_REX_PALETTE.
// Rows 0–16 are its head, body, arm and tail. Legs are added per animation frame below.
const T_REX_BODY_ROWS = [
  '.................ooooooo....',
  '................oGGGGDDDoo..',
  '...............oGGGGGGyeGGo.',
  '...............oGGGGGGGGGGGo',
  '..............oGGGGGGotototo',
  '..............oGGGGGmmmmmmo.',
  '.............oGGGGGGLtLtLo..',
  '.............oGGGGGGLLLoo...',
  '.............oGGGGGGGo......',
  '........ooooooGGGGGGGo......',
  '.....oooGGDGGGDGGGLLLo......',
  '..oooGGGGGGGDGGGGGLLLLoo....',
  'ooGGGGGGGGGGGGGGGGLLLLoGco..',
  '.ooDDGGGGGGGGGGGGGLLLLoco...',
  '...ooDDDGGGGGGGGGGLLLo......',
  '......ooDDGGGGGGGGLLo.......',
  '........oDDGGGGGGGGo........',
];

export const T_REX_PALETTE = {
  o: '#1f2a1a', // outline
  G: '#4f8d45', // green scales
  D: '#3a6b34', // shaded scales
  L: '#a7c97a', // pale belly
  y: '#f2c94c', // eye
  e: '#1a1414', // pupil
  m: '#7a2320', // mouth
  t: '#fff4d8', // teeth
  c: '#e8dcc0', // claws
};

// Legs and feet for each frame: standing / stride A, then stride B.
const T_REX_LEG_FRAMES = [
  [
    '.........oDDDo.oGGGo........',
    '.........oDDo...oGGo........',
    '.........oDDo...oGGo........',
    '.........oDDDco.oGGGco......',
    '.........oooooo.oooooo......',
  ],
  [
    '........oDDDo...oGGGo.......',
    '.......oDDo......oGGo.......',
    '......oDDo........oGGo......',
    '.....oDDDco.......oGGGco....',
    '.....oooooo.......oooooo....',
  ],
];

export const T_REX_FRAME_ROWS = T_REX_LEG_FRAMES.map((legRows) => [...T_REX_BODY_ROWS, ...legRows]);

function renderFrame(rows) {
  const frame = document.createElement('canvas');
  frame.width = rows[0].length;
  frame.height = rows.length;
  const frameContext = frame.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = T_REX_PALETTE[pixel];
      if (!color) return;
      frameContext.fillStyle = color;
      frameContext.fillRect(x, y, 1, 1);
    });
  });

  return frame;
}

export function createTRexFrames() {
  return T_REX_FRAME_ROWS.map(renderFrame);
}
