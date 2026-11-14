// Small pixel-art icons for the corner HUD: the waffle on the scoreboard and the pictures
// on the Music, Pause and Restart keys. Like the sprites, each is an array of strings with
// one character per pixel; see HUD_ICON_PALETTE.
const HUD_ICON_ROWS = {
  waffle: [
    '.ooooooo.',
    'oyydydyyo',
    'oyydydyyo',
    'odddddddo',
    'oyydydyyo',
    'odddddddo',
    'oyydydyyo',
    'oyydydyyo',
    '.ooooooo.',
  ],
  music: [
    '...########',
    '...########',
    '...#......#',
    '...#......#',
    '...#......#',
    '...#......#',
    '.###....###',
    '####...####',
    '####...####',
    '.##.....##.',
    '...........',
  ],
  pause: [
    '...........',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '.###...###.',
    '...........',
  ],
  play: [
    '...........',
    '..##.......',
    '..####.....',
    '..######...',
    '..########.',
    '..#########',
    '..########.',
    '..######...',
    '..####.....',
    '..##.......',
    '...........',
  ],
  restart: [
    '...#####...',
    '..#######..',
    '.###..#####',
    '.##....###.',
    '##......#..',
    '##.........',
    '##.......##',
    '.##.....##.',
    '.###...###.',
    '..#######..',
    '...#####...',
  ],
};

// Music off is the note with a red stroke through it.
HUD_ICON_ROWS.musicOff = HUD_ICON_ROWS.music.map((row, y) => (
  [...row].map((pixel, x) => (x === y || x === y + 1 ? 'x' : pixel)).join('')
));

const HUD_ICON_PALETTE = {
  '#': '#1c1a17', // ink, as on the sign's letter tiles
  x: '#d63a2f', // the "off" stroke
  o: '#7a4a1f', // waffle edge
  y: '#f6c95c', // golden waffle
  d: '#c98a2b', // the waffle's grooves
};

// Returns the icon as a small canvas, one canvas pixel per character; CSS scales it up.
export function createHudIcon(name) {
  const rows = HUD_ICON_ROWS[name];
  const icon = document.createElement('canvas');
  icon.width = rows[0].length;
  icon.height = rows.length;
  const context = icon.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = HUD_ICON_PALETTE[pixel];
      if (!color) return;
      context.fillStyle = color;
      context.fillRect(x, y, 1, 1);
    });
  });
  return icon;
}
