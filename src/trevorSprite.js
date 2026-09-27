// Pixel-art Trevor, drawn in a three-quarter view facing right. Each character is one
// pixel; see TREVOR_PALETTE. Rows 0–20 are his head, flannel and hands. Legs are added
// per animation frame below.
const TREVOR_BODY_ROWS = [
  '.....oooooo.....',
  '....osllssso....',
  '...oSssssssso...',
  '...oSssssssso...',
  '...oSssesseso...',
  '...oSssssssSo...',
  '...obbsttttso...',
  '....obbbbbbo....',
  '.....obbbbo.....',
  '...offssssffo...',
  '..offfwwwwfffo..',
  '.ofFfFwwwwFfFfo.',
  '.oFgFgwwwwgFgFo.',
  '.ofFfFwwwwFfFfo.',
  '.ofFfFwwwwFfFfo.',
  '.ofFfFwwwwFfFfo.',
  '.oFgFgwwwwgFgFo.',
  '.ofFfFwwwwFfzzo.',
  '.ossfFwwwwFfsso.',
  '..oofFppppFfoo..',
  '...ooopppppooo..',
];

export const TREVOR_PALETTE = {
  o: '#2a1d17', // outline
  s: '#f1c6a2', // skin
  l: '#fbe1ca', // shine on his bald head
  S: '#d99f7c', // shaded skin (ear, nose)
  b: '#d6a585', // stubble
  e: '#1a1414', // eye
  t: '#ffffff', // smile
  f: '#ece2c8', // cream flannel
  F: '#a8987a', // tan plaid stripe
  g: '#6f6352', // plaid stripe crossing
  w: '#f6f0e3', // white tee
  z: '#ff6f91', // pink wristband
  p: '#23232b', // black jeans
  k: '#3a2a22', // shoes
};

// Legs and shoes for each frame: standing / stride A, then stride B.
const TREVOR_LEG_FRAMES = [
  [
    '...oppppppppo...',
    '...opppoopppo...',
    '...opppoopppo...',
    '...okkkkokkkko..',
    '...ooooooooooo..',
  ],
  [
    '...oppppppppo...',
    '..opppo..opppo..',
    '.opppo....opppo.',
    '.okkkko...okkkko',
    '.oooooo...oooooo',
  ],
];

export const TREVOR_FRAME_ROWS = TREVOR_LEG_FRAMES.map((legRows) => [...TREVOR_BODY_ROWS, ...legRows]);

function renderFrame(rows) {
  const frame = document.createElement('canvas');
  frame.width = rows[0].length;
  frame.height = rows.length;
  const frameContext = frame.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = TREVOR_PALETTE[pixel];
      if (!color) return;
      frameContext.fillStyle = color;
      frameContext.fillRect(x, y, 1, 1);
    });
  });

  return frame;
}

export function createTrevorFrames() {
  return TREVOR_FRAME_ROWS.map(renderFrame);
}
