// Weather tuning, grouped by difficulty. Progress values are shares of the
// storm clock (0 = clear skies, 1 = storm fully arrived).
export const WEATHER_SETTINGS = {
  gentle: {
    stormDurationSeconds: 90,
    rescuedClockMultiplier: 1.5, // clock speeds up once Maya is following
    // Both 0: it's already raining when a level starts. Raise them to bring back an
    // opening spell of clear skies, then clouds, before the rain.
    cloudsStartAt: 0,
    rainStartsAt: 0,
    floodWindow: [0.14, 0.7], // share of the clock when zones flood
    floodZoneCount: 5, // picked at random from the candidate zones
    warningSeconds: 5,
    floodsTurnDeep: false, // false: floods stop at shallow (slow, never impassable)
    shallowSeconds: 12, // time before shallow water turns deep (when floodsTurnDeep)
    shallowSpeedMultiplier: 0.4, // the hero's speed in shallow water, as a share of normal
    // Dinosaurs wade through shallow water too, at the hero's wading speed, and are only
    // stopped by deep water. 'shallow' here would keep them out of flooded streets entirely.
    dinosaursBlockedFrom: 'deep',
    onStormFull: 'final-surge', // or 'lose'
  },
};

export const ACTIVE_DIFFICULTY = 'gentle';
