// Hand-picked lots where Waffle House can appear. Each game picks one that is a long
// walk from the hero and that this game's floods can't cut off (see planSpawns in main.js).
//
// x/y is the centre of the building in original map units (scaled at load, like
// floodZones.js). The door faces south; a short driveway joins it to `street`. Every lot
// was chosen so the building clears all other streets, parks, landmarks, the MARTA line
// and flood zones. main.js re-checks the parts that affect movement (streets, flood zones,
// reachability) at load and skips any lot that no longer fits with a console warning, so
// edits to mapData.js can't silently create shortcuts.
export const WAFFLE_HOUSE_SITES = [
  // Inman Park and the east side.
  { id: 'euclid', street: 'Euclid Avenue', x: 2469.7, y: 256.6 },
  { id: 'hurt', street: 'Hurt Street', x: 2802.8, y: 473.4 },
  { id: 'dekalb-east', street: 'DeKalb Avenue', x: 3019.1, y: 445.4 },
  { id: 'holiday', street: 'Holiday Avenue', x: 3301.3, y: 593.9 },
  { id: 'dekalb-far-east', street: 'DeKalb Avenue', x: 3388.1, y: 159.7 },
  { id: 'boulevard-drive', street: 'Boulevard Drive', x: 3044.7, y: 1264.1 },
  // Reynoldstown and Edgewood, south of the tracks.
  { id: 'wylie-east', street: 'Wylie Street', x: 2913.5, y: 1493.2 },
  { id: 'kirkwood-east', street: 'Kirkwood Avenue', x: 3236.8, y: 1907.5 },
  { id: 'moreland-south', street: 'Moreland Avenue', x: 3412.2, y: 2106.6 },
  { id: 'flat-shoals', street: 'Flat Shoals Avenue', x: 2892.9, y: 2056.9 },
  { id: 'memorial-east', street: 'Memorial Drive', x: 2649.1, y: 2554.3 },
  // Cabbagetown and the south-west.
  { id: 'chester', street: 'Chester Avenue', x: 2095.9, y: 2332.9 },
  { id: 'harold', street: 'Harold Avenue', x: 1934.4, y: 2034.4 },
  { id: 'estoria', street: 'Estoria Street', x: 1349.6, y: 2430.1 },
  { id: 'boulevard-south', street: 'Boulevard', x: 536.3, y: 2103.9 },
  // Old Fourth Ward, west of the start.
  { id: 'john-wesley-dobbs', street: 'John Wesley Dobbs Avenue', x: 253.2, y: 269.2 },
];
