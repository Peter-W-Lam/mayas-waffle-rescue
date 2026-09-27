// Pixel-art "Historic Inman Park" sign: a black board with gold lettering and border,
// hung between iron posts under a scrolled arch and lamp, with shrubs at its base.
// Each character is one pixel; see INMAN_PARK_SIGN_PALETTE.
export const INMAN_PARK_SIGN_ROWS = [
  '.............................kkk.............................',
  '............................kkkkk............................',
  '............................klLLk............................',
  '............................kLLLk............................',
  '..k.........................kkkkk........................k...',
  '..kk........................kkkkk........................kk..',
  '..kk..........................k..........................kk..',
  '..kk..........................k..........................kk..',
  '..kk.................kkkkkkkkkkkkkkkkkkk.................kk..',
  '..kk......k....kkkkkkk..k..k..k..k..k..kkkkkkk....k......kk..',
  '..kk.....kkkkkkk..k.......................k..kkkkkkk.....kk..',
  '..kk..kkkkk.k...................................k.kkkkk..kk..',
  '..kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..',
  '..kkoooooooooooooooooooooooooooooooooooooooooooooooooooookk..',
  '..kkokkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkokk..',
  '..kkokkkYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYkkkokk..',
  '..kkokkYkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkYkkokk..',
  '..kkokYkkkkkkkkYkYkYYYkkYYkYYYkkYkkYYkkYYYkkYYkkkkkkkkYkokk..',
  '..kkokYkkkYkkkkYkYkkYkkYkkkkYkkYkYkYkYkkYkkYkkkkkYkkkkYkokk..',
  '..kkokYkkYkYkkkYYYkkYkkkYkkkYkkYkYkYYkkkYkkYkkkkYkYkkkYkokk..',
  '..kkokYkkkYkkkkYkYkkYkkkkYkkYkkYkYkYkYkkYkkYkkkkkYkkkkYkokk..',
  '..kkokYkkkkkkkkYkYkYYYkYYkkkYkkkYkkYkYkYYYkkYYkkkkkkkkYkokk..',
  '..kkokYkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkYkokk..',
  '..kkokYkkkYYYkYkkYkYkkkYkkYkkYkkYkkkYYkkkYkkYYkkYkYkkkYkokk..',
  '..kkokYkkkkYkkYYkYkYYkYYkYkYkYYkYkkkYkYkYkYkYkYkYkYkkkYkokk..',
  '..kkokYkkkkYkkYYkYkYkYkYkYkYkYYkYkkkYkYkYkYkYkYkYYkkkkYkokk..',
  '..kkokYkkkkYkkYkYYkYkYkYkYYYkYkYYkkkYYkkYYYkYYkkYkkkkkYkokk..',
  '..kkokYkkkkYkkYkYYkYkkkYkYkYkYkYYkkkYkkkYkYkYkYkYYkkkkYkokk..',
  '..kkokYkkkkYkkYkkYkYkkkYkYkYkYkkYkkkYkkkYkYkYkYkYkYkkkYkokk..',
  '..kkokYkkkYYYkYkkYkYkkkYkYkYkYkkYkkkYkkkYkYkYkYkYkYkkkYkokk..',
  '..kkokYkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkYkokk..',
  '..kkokYkkkkkkkYkkkYkkkYkkkkkYkkkkkYkkkYkkkkkkkkkkkkkkkYkokk..',
  '..kkokYkkkkkkkYYkYYkYYkYkkYYkYYYkkYYkYYkYYkkkkkkkkkkkkYkokk..',
  '..kkokYkkkkkkkkkkkkkkkkYkkkYkkkkYkkkYkkkkkkkkkkkkkkkkkYkokk..',
  '..kkokYkkkkkkkkkkkkkkkkYYkYYkkYYkYYkYYkkkkkkkkkkkkkkkkYkokk..',
  '..kkokkYkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkYkkokk..',
  '..kkokkkYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYkkkokk..',
  '..kkokkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkokk..',
  '..OOoooooooOOoooooooOOoooooooOOoooooooOOoooooooOOoooooooOOk..',
  'OOjjOO...OOjjOO...OOjjOO...OOjjOO...OOjjOO...OOjjOO...OOjjOO.',
  'jjhhjj...jjhhjj...jjhhjj...jjhhjj...jjhhjj...jjhhjj...jjhhjj.',
  'hhhhhhO.OhhhhhhO.OhhhhhhO.OhhhhhhO.OhhyhhhO.OhhhhhhO.OhhhhhhO',
  'hhhhhyhOhhhhhhhhOhhhhhhhhOhyhhhhhhOhhhhhhhhOhhhhhyhhOhhhhhhhh',
  'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhy',
  'HHHHHHHHHHHHHHHHyHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
  'HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH',
  'OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO',
];

export const INMAN_PARK_SIGN_PALETTE = {
  o: '#45443e', // board frame
  k: '#1c1c1a', // black board and ironwork
  Y: '#e8b94a', // gold lettering and border
  L: '#ffe39a', // lamp glass
  l: '#fff6da', // lamp glare
  O: '#2c5a2e', // shrub outline
  h: '#4f8f3f', // shrubs
  H: '#3b7133', // shaded shrubs
  j: '#7cb85a', // sunlit leaves
  y: '#f5d94a', // yellow flowers
};

export function createInmanParkSignSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = INMAN_PARK_SIGN_ROWS[0].length;
  sprite.height = INMAN_PARK_SIGN_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  INMAN_PARK_SIGN_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = INMAN_PARK_SIGN_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
