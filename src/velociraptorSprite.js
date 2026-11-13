// Pixel-art velociraptor, drawn facing right. Each character is one pixel; see
// VELOCIRAPTOR_PALETTE. Small and low-slung next to the T-Rex: a long stiff tail, a
// narrow snout, and blue feathers on its crest, arms and tail tip. Rows 0–11 are its
// head, body, arm and tail. Legs are added per animation frame below.
const VELOCIRAPTOR_BODY_ROWS = [
  '............bb..........',
  '.............bboooooo...',
  '..............oYYYYYYoo.',
  '..............oYYyeYYYYo',
  '..............oYYYYototo',
  '.............oYSYYoooo..',
  'oo..........oYYYYo......',
  'obooo...ooooYYSYYo......',
  '.obYYoooYSYYSYYYLo......',
  '..ooYSYYYYYYYYYLLoo.....',
  '....oooYYYYYYYYLobbo....',
  '.......oooYYYYLLo.oc....',
];

export const VELOCIRAPTOR_PALETTE = {
  o: '#2b1d12', // outline
  Y: '#d9a441', // sandy scales
  S: '#8a5a22', // brown stripes and the far leg
  L: '#f3e2b0', // pale belly
  b: '#2f8fb3', // blue feathers
  y: '#fff2a8', // eye
  e: '#1a1414', // pupil
  t: '#fff4d8', // teeth
  c: '#e8dcc0', // claws
};

// Legs and feet for each frame: standing / stride A, then stride B.
const VELOCIRAPTOR_LEG_FRAMES = [
  [
    '.........oSSo.oYYo......',
    '.........oSo...oYo......',
    '.........oSSco.oYYco....',
    '.........ooooo.ooooo....',
  ],
  [
    '........oSSo...oYYo.....',
    '.......oSo......oYo.....',
    '......oSSco.....oYYco...',
    '......ooooo.....ooooo...',
  ],
];

export const VELOCIRAPTOR_FRAME_ROWS = VELOCIRAPTOR_LEG_FRAMES.map(
  (legRows) => [...VELOCIRAPTOR_BODY_ROWS, ...legRows],
);

function renderFrame(rows) {
  const frame = document.createElement('canvas');
  frame.width = rows[0].length;
  frame.height = rows.length;
  const frameContext = frame.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = VELOCIRAPTOR_PALETTE[pixel];
      if (!color) return;
      frameContext.fillStyle = color;
      frameContext.fillRect(x, y, 1, 1);
    });
  });

  return frame;
}

export function createVelociraptorFrames() {
  return VELOCIRAPTOR_FRAME_ROWS.map(renderFrame);
}
