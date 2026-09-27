// Pixel-art Maya, drawn facing right. Each character is one pixel; see MAYA_PALETTE.
// Walking: rows 0–11 are her head, body and tail, and legs are added per animation
// frame below. Sniffing and sitting poses follow as whole frames.
const MAYA_BODY_ROWS = [
  '................oo.oo...',
  '...............okkorko..',
  '.oo...........okkrrwrro.',
  'owco..........orrrwwrro.',
  'owwo.........orrrrwwewwo',
  'ocwro........orrrrwwwwwn',
  '.orro........orrrwwwwwoo',
  '..orrooooooooorrwwwwpo..',
  '..orrhhhhhhhrrrwwwwo....',
  '..orrrrrrrrrrrrwwwwo....',
  '..oRrrrrrrrrrrrwwwo.....',
  '...oRRcccccccRRwwo......',
];

export const MAYA_PALETTE = {
  o: '#3b2314', // outline
  r: '#c8702e', // ginger coat
  R: '#9c4f1f', // shaded ginger
  h: '#e39a52', // sunlit ginger
  w: '#fbf5ea', // white fur
  c: '#e2d6c3', // cream belly and tail tip
  k: '#4a2e22', // dark brown ear
  e: '#1a1414', // eye
  n: '#1a1414', // nose
  p: '#e86a8a', // tongue
};

// Left edge of each 2-pixel-wide leg: back, back, front, front.
const MAYA_LEG_FRAMES = [
  [4, 7, 13, 16], // standing / stride A
  [3, 8, 12, 17], // stride B
];

function buildFrameRows(legColumns) {
  const width = MAYA_BODY_ROWS[0].length;
  const legRows = Array.from({ length: 4 }, () => Array(width).fill('.'));

  // Belly outline between the legs.
  for (let column = 4; column <= 17; column += 1) legRows[0][column] = 'o';

  legColumns.forEach((left, index) => {
    const isFrontLeg = index >= 2;
    for (const column of [left, left + 1]) {
      legRows[0][column] = isFrontLeg ? 'w' : 'R';
      legRows[1][column] = isFrontLeg ? 'w' : 'R';
      legRows[2][column] = 'w';
      legRows[3][column] = 'o';
    }
  });

  return [...MAYA_BODY_ROWS, ...legRows.map((row) => row.join(''))];
}

export const MAYA_FRAME_ROWS = MAYA_LEG_FRAMES.map(buildFrameRows);

// Sniffing, drawn whole rather than from the leg builder because her head drops to
// the ground in front of her paws. Frame B lifts her nose a pixel and wags her tail;
// alternating the two reads as snuffling along.
export const MAYA_SNIFF_FRAME_ROWS = [
  [
    '........................',
    '........................',
    '.oo.....................',
    'owco....................',
    'owwo....................',
    'ocwro...................',
    '.orro...................',
    '..orroooooooooo.........',
    '..orrhhhhhhhrrroo.......',
    '..orrrrrrrrrrrrrkkoo....',
    '..oRrrrrrrrrrrrrkkrro...',
    '...oRRcccccccRRwkrrwro..',
    '....RRoRRowwowwwwrwewo..',
    '....RR.RR.ww.wwwwwwwwwo.',
    '....ww.ww.ww.ww.owwwwwn.',
    '....oo.oo.oo.oo..ooooo..',
  ],
  [
    '........................',
    '........................',
    '...oo...................',
    '..owco..................',
    '..owwo..................',
    '..ocwo..................',
    '..orro..................',
    '..orroooooooooo.........',
    '..orrhhhhhhhrrrooo......',
    '..orrrrrrrrrrrrrkkro....',
    '..oRrrrrrrrrrrrrkkrro...',
    '...oRRcccccccRRwkrwewo..',
    '....RRoRRowwowwwwwwwwwo.',
    '....RR.RR.ww.wwowwwwwwn.',
    '....ww.ww.ww.ww..ooooo..',
    '....oo.oo.oo.oo.........',
  ],
];

// Sitting: haunches down, front legs straight and head up. Frame B sweeps her tail
// along the ground.
export const MAYA_SIT_FRAME_ROWS = [
  [
    '................oo.oo...',
    '...............okkorko..',
    '..............okkrrwrro.',
    '..............orrrwwrro.',
    '.............orrrrwwewwo',
    '.............orrrrwwwwwn',
    '.............orrrwwwwwoo',
    '............orrrwwwwpo..',
    '...........orrrrwwwwo...',
    '.........oorrrrrwwwwo...',
    '.......oorrhhrrrwwwwo...',
    '......orrhhhrrrrwwwo....',
    '......orhhrrrrRwwwwo....',
    '..ooo.orrrrrRRowwowwo...',
    '.ocwwoorRRRRRoowwowwo...',
    '..ooooooooooooooooooo...',
  ],
  [
    '................oo.oo...',
    '...............okkorko..',
    '..............okkrrwrro.',
    '..............orrrwwrro.',
    '.............orrrrwwewwo',
    '.............orrrrwwwwwn',
    '.............orrrwwwwwoo',
    '............orrrwwwwpo..',
    '...........orrrrwwwwo...',
    '.........oorrrrrwwwwo...',
    '.......oorrhhrrrwwwwo...',
    '......orrhhhrrrrwwwo....',
    '.oo...orhhrrrrRwwwwo....',
    'ocwoo.orrrrrRRowwowwo...',
    '.owwrrorRRRRRoowwowwo...',
    '..ooooooooooooooooooo...',
  ],
];

// Every pose, keyed by state. All frames share the walk frames' 24×16 size so she
// stays anchored in place when switching between them.
export const MAYA_STATE_FRAME_ROWS = {
  walk: MAYA_FRAME_ROWS,
  sniff: MAYA_SNIFF_FRAME_ROWS,
  sit: MAYA_SIT_FRAME_ROWS,
};

function renderFrame(rows) {
  const frame = document.createElement('canvas');
  frame.width = rows[0].length;
  frame.height = rows.length;
  const frameContext = frame.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = MAYA_PALETTE[pixel];
      if (!color) return;
      frameContext.fillStyle = color;
      frameContext.fillRect(x, y, 1, 1);
    });
  });

  return frame;
}

export function createMayaFrames() {
  return MAYA_FRAME_ROWS.map(renderFrame);
}

// Rendered frames for every pose: { walk: [...], sniff: [...], sit: [...] }.
export function createMayaStateFrames() {
  return Object.fromEntries(
    Object.entries(MAYA_STATE_FRAME_ROWS).map(([state, frames]) => [state, frames.map(renderFrame)]),
  );
}
