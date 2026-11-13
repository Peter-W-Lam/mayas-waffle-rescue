// Pixel-art Peter, drawn in a three-quarter view facing right. Each character is one
// pixel; see PETER_PALETTE. Rows 0–20 are his head, sweatshirt and hands. Legs are added
// per animation frame below.
const PETER_BODY_ROWS = [
  '....oo.ooo.oo...',
  '...ohHohHHhHHo..',
  '...oHhHHHhHhHHo.',
  '...oHsssssssoo..',
  '...oSssesseso...',
  '...oSssssssSo...',
  '...oSssttttso...',
  '....osssssso....',
  '.....osssso.....',
  '...odrssssrdo...',
  '..odddrrrrdddo..',
  '.oDdDddddddDdDo.',
  '.oDdDddddddDdDo.',
  '.oDdDddddddDdDo.',
  '.oDdDddddddDdDo.',
  '.oDdDddddddDdDo.',
  '.oDdDddddddDdDo.',
  '.orrDddddddDrro.',
  '.ossDddddddDsso.',
  '..oorrrrrrrroo..',
  '...ooopppppooo..',
];

export const PETER_PALETTE = {
  o: '#2a1d17', // outline
  H: '#1e1b1c', // black hair
  h: '#3d3538', // hair highlight
  s: '#e4b08a', // skin
  S: '#c98f6c', // shaded skin (ear, nose)
  e: '#1a1414', // eye
  t: '#ffffff', // smile
  d: '#2a2a30', // black crewneck sweatshirt
  D: '#1b1b20', // sweatshirt folds and shade
  r: '#3d3d45', // ribbed collar, cuffs and hem
  p: '#3b4a63', // blue-gray jeans
  k: '#e8e6e0', // white sneakers
};

// Legs and shoes for each frame: standing / stride A, then stride B.
const PETER_LEG_FRAMES = [
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

export const PETER_FRAME_ROWS = PETER_LEG_FRAMES.map((legRows) => [...PETER_BODY_ROWS, ...legRows]);

// Sitting on the couch in the intro cutscene (introScene.js): his lap and the soles of his
// shoes face the viewer, so this pose is two rows shorter than standing.
const PETER_SEATED_LEG_ROWS = [
  '..oppppppppppo..',
  '..okkkkookkkko..',
  '..oooooooooooo..',
];

export const PETER_SEATED_ROWS = [...PETER_BODY_ROWS, ...PETER_SEATED_LEG_ROWS];

function renderFrame(rows) {
  const frame = document.createElement('canvas');
  frame.width = rows[0].length;
  frame.height = rows.length;
  const frameContext = frame.getContext('2d');

  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = PETER_PALETTE[pixel];
      if (!color) return;
      frameContext.fillStyle = color;
      frameContext.fillRect(x, y, 1, 1);
    });
  });

  return frame;
}

export function createPeterFrames() {
  return PETER_FRAME_ROWS.map(renderFrame);
}

export function createPeterSeatedFrame() {
  return renderFrame(PETER_SEATED_ROWS);
}
