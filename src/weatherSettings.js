// Weather tuning, grouped by difficulty. Progress values are shares of the
// storm clock (0 = clear skies, 1 = storm fully arrived).
export const WEATHER_SETTINGS = {
  gentle: {
    stormDurationSeconds: 90,
    rescuedClockMultiplier: 1.5, // clock speeds up once Maya is following
    cloudsStartAt: 0.02,
    rainStartsAt: 0.06,
    floodWindow: [0.14, 0.7], // share of the clock when zones flood
    floodZoneCount: 5, // picked at random from the candidate zones
    warningSeconds: 5,
    shallowSeconds: 12, // time before shallow water turns deep
    shallowSpeedMultiplier: 0.4,
    tRexBlockedFrom: 'shallow', // or 'deep'
    onStormFull: 'final-surge', // or 'lose'
  },
};

export const ACTIVE_DIFFICULTY = 'gentle';
