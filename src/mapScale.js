// Spreads the whole neighborhood out so it feels bigger, without changing its layout.
// Positions are multiplied by MAP_SCALE; road widths, sprites and speeds stay the
// same, so blocks get longer and trips take longer.
//
// Source data (mapData.js, floodZones.js, mapAdjustments.js and hand-placed
// coordinates in main.js) stays in the original units and is scaled once at load.
export const MAP_SCALE = 1.4;

export function scalePoint([x, y]) {
  return [x * MAP_SCALE, y * MAP_SCALE];
}

export function scalePoints(points) {
  return points.map(scalePoint);
}

// Scales the world size and every road, park and landmark position in place.
export function scaleMapData(mapData) {
  mapData.world.width *= MAP_SCALE;
  mapData.world.height *= MAP_SCALE;
  for (const road of mapData.roads) road.points = scalePoints(road.points);
  for (const park of mapData.parks) park.points = scalePoints(park.points);
  for (const landmark of mapData.landmarks) {
    landmark.x *= MAP_SCALE;
    landmark.y *= MAP_SCALE;
  }
}
