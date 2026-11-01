// Pixel-art Fulton Cotton Mill Lofts in Cabbagetown: the five-story red brick mill
// with tall green-framed windows, its stair tower with a windowed top, a lower wing
// with arched windows, and the rusty water tower on steel legs. Seen from the front;
// the arched door is in the tower, left of centre. Each character is one pixel; see
// FULTON_COTTON_MILL_PALETTE.
export const FULTON_COTTON_MILL_ROWS = [
  '..........oo....................................................................',
  '........oohhoo..................................................................',
  '......oohhhhhhoo................................................................',
  '.....ohhhhhhhhhho.....oooooooooooooo............................................',
  '....oTTttTTTTTTTTo...ocbcccccccccccco...........................................',
  '....oTTttTTTTTrrro....obCCCCCCCCCCCo............................................',
  '....oTTttTTTTTrrro....obBBBBBBBBBBKo............................................',
  '....ohhhhhhhhhhhho....obBggBggBggBKo............................................',
  '....oTTttTTTTTrrro....obBwWBwWBwWBKo............................................',
  '....oTTttTTTTTrrro....obBWWBWWBWWBKo............................................',
  '....oTTttTTTTTrrro....obBWWBWWBWWBKo............................................',
  '....ohhhhhhhhhhhho....obBggBggBggBKoooooooooooooooooooooooooooooooooooooooooooo.',
  '....oTTttTTTTTrrro....obBBBBBBBBBBoRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRo',
  '....oTTttTTTTTrrro....obccccccccccocccccccccccccccccccccccccccccccccccccccccccco',
  '....oTTttTTTTTrrro....obBBBBBBBBBBoCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCo',
  '.....ohhhhhhhhhho.....obBBBBbbBBBBoBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBbo',
  '....llllllllllllll....obBBBbbbbBBBoBKggggBKggggBKggggBKggggBKggggBKggggBKggggBbo',
  '......l........l......obBBbbbbbbBBoBBgwWgBBgwWgBBgwWgBBgwWgBBgwWgBBgYYgBBgwWgBbo',
  '......ll......ll......obBBbgbbgbBBoBBgWWgBBgWWgBBgWWgBBgWWgBBgWWgBBgYYgBBgWWgBbo',
  '......l.ll..ll.l......obBBgwggwgBBoBBggggBBggggBBggggBBggggBBggggBBggggBBggggBbo',
  '......l...ll...l......obBBgWggWgBBoBBgWWgBBgWWgBBgWWgBBgWWgBBgWWgBBgYYgBBgWWgBbo',
  '......l...ll...l......obBBgWggWgBBoBBggggBBggggBBggggBBggggBBggggBBggggBBggggBbo',
  '......l..l..l..l......obBBgWggWgBBoBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBbo',
  '......lll....lll......obBBgWggWgBBoBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBbo',
  '.....ll........ll.....obBBggggggBBoBKggggBKggggBKggggBKggggBKggggBKggggBKggggBbo',
  '.....llllllllllll.....obBBgWggWgBBoBBgwWgBBgwWgBBgYYgBBgwWgBBgwWgBBgwWgBBgwWgBbo',
  '.....ll........ll.....obBBgWggWgBBoBBgWWgBBgWWgBBgYYgBBgWWgBBgWWgBBgWWgBBgWWgBbo',
  '.....l.l......l.l.....obBBgWggWgBBoBBggggBBggggBBggggBBggggBBggggBBggggBBggggBbo',
  '.....l..l....l..l.....obBBgWggWgBBoBBgWWgBBgWWgBBgYYgBBgWWgBBgWWgBBgWWgBBgWWgBbo',
  '.....l...l..l...l.....obBBggggggBBoBBggggBBggggBBggggBBggggBBggggBBggggBBggggBbo',
  '.ooooloooollooooloooooobBBbbbbbbBBoBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBbo',
  'oRRRRlRRRlRRlRRRlRRRRRRbBBbbbbbbBBoBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBbo',
  'occcclcclcccclcclcccccobBBbbbbbbBBoBKggggBKggggBKggggBKggggBKggggBKggggBKggggBbo',
  'oBBBBlBlBBBBBBlBlBBBBBobBBBBBBBBBBoBBgwWgBBgwWgBBgwWgBBgwWgBBgwWgBBgwWgBBgYYgBbo',
  'oBBBBllBBBBBBBBllBBBBBobBBBBBBBBBBoBBgWWgBBgWWgBBgWWgBBgWWgBBgWWgBBgWWgBBgYYgBbo',
  'oBBggllllllllllllBggBBobBgggBBgggBoBBggggBBggggBBggggBBggggBBggggBBggggBBggggBbo',
  'oBgwWllgwWgBgwWllgwWgBobBgwgBBgwgBoBBgWWgBBgWWgBBgWWgBBgWWgBBgWWgBBgWWgBBgYYgBbo',
  'oBgWlgBlWWgBgWlgBlWWgBobBgWgBBgWgBoBBggggBBggggBBggggBBggggBBggggBBggggBBggggBbo',
  'oBgWlgBgllgBllWgBlWWgBobBgWgBBgWgBoBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBbo',
  'oBgglgBgggllggggBlgggBobBgWgBBgWgBoBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBBbbbbBbo',
  'oBgWlgBgWWllgWWgBlWWgBobBgggBBgggBoBKggggBKggggBKggggBKggggBKggggBKggggBKggggBbo',
  'oBgWlgBgWlgBlWWgBlWWgBobBgWgBBgWgBoBBgwWgBBgwWgBBgwWgBBgwWgBBgYYgBBgwWgBBgwWgBbo',
  'oBgglgBllggBgllgBlgggBobBgWgBBgWgBoBBgWWgBBgWWgBBgWWgBvvvvvvvgYYgBBgWWgBBgWWgBbo',
  'obbblblbbbbbbbblblbbbbobBgWgBBgWgBoBBggggBBggggBBggggvvvvvvvvvgggBBggggBBggggBbo',
  'oBBBllBBBBBBBBBBllBBBBobBgggBBgggBoBBgWWgBBgWWgBBgWWgvvvVVvvvvYYgBBgWWgBBgWWgBbo',
  'oBBgllllllllllllllggBBobBBBBBBBBBBoBBggggBBggggBBgggvvvvVVvvvvvggBBggggBBggggBbo',
  'oBgwllBgwWgBgwWgllwWgBobccccccccccoBBbbbbBBbbbbBBbbbvvvvvvvVVvvbbBBbbbbBBbbbbBbo',
  'oBgWlgllWWgBgWllBlWWgBobBBBBBBBBBBoBBbbbbBBbbbbBBbbbvvvvvvvvvvvbbBBbbbbBBbbbbBbo',
  'oBgWlgBglWgBglWgBlWWgBobBBBccccBBBoBKggggBKggggBKgggvvvvvvvvvvvggBKggggBKggggBbo',
  'oBgglgBgglgBlgggBlgggBobBBccddccBBoBBgwWgBBgYYgBBgwWgVVVVVVVVVwWgBBgwWgBBgwWgBbo',
  'oBglWgBgWWllgWWgBglWgBobBBcddddcBBoBBgWWgBBgYYgBBgWWgVVVVVVVVVWWgBBgWWgBBgWWgBbo',
  'oBglWgBgWllllWWgBglWgBobBBcddddcBBoBBggggBBggggBBggggBBggdgBBggggBBggggBBggggBbo',
  'oBglggBglggBglggBglggBobBBcddddcBBoBBgWWgBBgYYgBBgWWgBBgWdgBBgWWgBBgWWgBBgWWgBbo',
  'oBvlBBllBBBBBBllvvlBBBobBBcddddcBBoBBgvvvvBggggBBvvvgBBggdgBBgvvvvvggggBBvvvgBbo',
  'ovvlvlBBBBBBBBBvlvlvBBobBBcddddcBBoBBvvvvvvbbbbBvvvvvBBbbdbBBvvvvvvvbbbBvvvvvBbo',
  'ovvllBBBBBBBBBBvvllvBBobBBcddddcBBoBBvvvvvvbbbbBvvvvvBBbbdbBBvvvvvvvbbbBvvvvvBbo',
  'oVVlVBBBBBBBBBBVVVlVBBobBBcddddcBBoccVVVVVVcccccVVVVVccccdcccVVVVVVVccccVVVVVcco',
  'osssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssso',
  'osssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssso',
  'oSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSo',
  '.oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo.',
];

export const FULTON_COTTON_MILL_PALETTE = {
  o: '#2a1d17', // outline
  B: '#b5532f', // brick
  b: '#8f3f22', // shaded brick
  K: '#6e2e18', // deep shadow beside pilasters
  c: '#e2d3b4', // stone trim and cornice
  C: '#b8a682', // cornice shadow
  R: '#5e6266', // flat roof edge
  g: '#4f7a5c', // green window frames
  W: '#cfe3e8', // window glass reflecting the sky
  w: '#f4fbfc', // glass glare
  Y: '#ffe0a0', // windows lit from inside
  d: '#3b2a24', // doorway and tree trunk
  T: '#8a4a2a', // water tank rust
  t: '#b0683a', // sunlit rust
  r: '#6a3820', // shaded rust
  h: '#4e2a1a', // tank roof and hoops
  l: '#3d2f2a', // steel legs and bracing
  v: '#5d8f45', // shrubs and tree
  V: '#3f6a31', // shaded leaves
  s: '#d9d4c7', // sidewalk
  S: '#b9b3a5', // sidewalk shade
};

export function createFultonCottonMillSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = FULTON_COTTON_MILL_ROWS[0].length;
  sprite.height = FULTON_COTTON_MILL_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  FULTON_COTTON_MILL_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = FULTON_COTTON_MILL_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
