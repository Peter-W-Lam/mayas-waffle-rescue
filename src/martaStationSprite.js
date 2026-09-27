// Pixel-art Inman Park/Reynoldstown MARTA station: a name board over a striped canopy,
// a concrete concourse with lit glass and fare gates, and an escalator up to the
// platform. Each character is one pixel; see MARTA_STATION_PALETTE.
export const MARTA_STATION_ROWS = [
  '....oooooooooooooooooooooooooooooooooooooooooooooooooooooooo....',
  '....oNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNo....',
  '....oNNNNNNNWWWNWNNWNWNNNWNNWNNWNNWNNNWWNNNWNNWWNNWNWNNNNNNo....',
  '....oNNNNNNNNWNNWWNWNWWNWWNWNWNWWNWNNNWNWNWNWNWNWNWWNNNNNNNo....',
  '....oNNNNNNNNWNNWNWWNWNWNWNWWWNWNWWNNNWWNNWWWNWWNNWNNNNNNNNo....',
  '....oNNNNNNNNWNNWNNWNWNNNWNWNWNWNNWNNNWNNNWNWNWNWNWWNNNNNNNo....',
  '....oNNNNNNNWWWNWNNWNWNNNWNWNWNWNNWNNNWNNNWNWNWNWNWNWNNNNNNo....',
  '....oNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNo....',
  '....oNNWWNNWWWNWNWNWNNWNNWNNWNNNWWNNNWWNWWWNNWNNWNNNWNWNNWNo....',
  '....oNNWNWNWNNNWNWNWWNWNWNWNWNNNWNWNWNNNNWNNWNWNWNNNWNWWNWNo....',
  '....oNNWWNNWWNNNWNNWNWWNWNWNWNNNWNWNNWNNNWNNWNWNWNWNWNWNWWNo....',
  '....oNNWNWNWNNNNWNNWNNWNWNWNWNNNWNWNNNWNNWNNWNWNWNWNWNWNNWNo....',
  '....oNNWNWNWWWNNWNNWNNWNNWNNWWWNWWNNWWNNNWNNNWNNNWNWNNWNNWNo....',
  '....oOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo....',
  '....oooooooooooooooooooooooooooooooooooooooooooooooooooooooo....',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  'orrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrro',
  'oOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOo',
  'oBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBo',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  '.oCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCo.',
  '.oCccccccccccCcccccccccccccccccccccccccccccCcccccccccccccccccCo.',
  '.oCccccccccccCmmmmmmmmmmmmmmmmmmmmmmmmmmmmmCcccccccccccckEEEEko.',
  '.oCcccBBBccccCmGGgggmGGgggggggggggggmGGgggmCccccccccccckeeeekCo.',
  '.oCcBBBBBBBccCmGGgggmGGgggggggggggggmGGgggmCcccccccccckEEEEkcCo.',
  '.oCcBWBBBWBccCmgggggmgggggggggggggggmgggggmCcccccccccckeeeekcCo.',
  '.oCBBWWBWWBBcCmgggggmgggmmmmmmmmmgggmgggggmCccccccccckEEEEkccCo.',
  '.oCBBWBWBWBBcCmgggggmgggmGGgmgggmgggmgggggmCcccccccckeeeekcccCo.',
  '.oCBBWBBBWBBcCmgggggmgggmGGgmgggmgggmgggggmCccccccckEEEEkccccCo.',
  '.oCcBOOOOOBccCmgggggmgggmgggmgggmgggmgggggmCcccccckeeeekcccccCo.',
  '.oCcBBBBBBBccCmgggggmgggmgggmgggmgggmgggggmCcccccckEEEEkcccccCo.',
  '.oCcccBBBccccCmgggggmgggmgggmgggmgggmgggggmCccccckeeeekccccccCo.',
  '.oCccccccccccCmgngngmgggmgggmgggmgggmgngngmCcccckEEEEkcccccccCo.',
  '.oCccccccccccCmnnnnnmgggmgggmgggmgggmnnnnnmCccckeeeekccccccccCo.',
  '.oCccccccccccCmgngngmgggmgggmgggmgggmgngngmCcckEEEEkcccccccccCo.',
  '.oCccccccccccCmgngngmgggmgggmgggmgggmgngngmCcckeeeekcccccccccCo.',
  '.oCccccccccccCmgngngmgggmgggmgggmgggmgngngmCckEEEEkccccccccccCo.',
  '.oCccccccccccCmmmmmmmmmmmmmmmmmmmmmmmmmmmmmCkeeeekcccccccccccCo.',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  'osssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssso',
  'oSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSo',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
];

export const MARTA_STATION_PALETTE = {
  o: '#2a1d17', // outline
  N: '#1d3f7a', // navy name board
  W: '#ffffff', // lettering and roundel
  O: '#f08a24', // MARTA orange
  B: '#1f5aa6', // MARTA blue
  k: '#3f454b', // posts and escalator rails
  R: '#6b7074', // canopy roof
  r: '#8a9096', // canopy edge highlight
  c: '#cfc8ba', // concrete
  C: '#aaa293', // concrete columns and shade
  m: '#3b3430', // glass frames
  g: '#ffe0a0', // glass lit from inside
  G: '#fff6da', // glass glare
  n: '#8a6a4a', // fare gates
  e: '#9aa2a8', // escalator steps
  E: '#7c848a', // escalator step edges
  s: '#d9d4c7', // plaza
  S: '#b9b3a5', // plaza shade
};

export function createMartaStationSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = MARTA_STATION_ROWS[0].length;
  sprite.height = MARTA_STATION_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  MARTA_STATION_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = MARTA_STATION_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
