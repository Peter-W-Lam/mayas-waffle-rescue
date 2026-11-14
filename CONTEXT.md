# Maya's Waffle Rescue: project context

Reference for anyone (human or LLM) picking up work on this game. It covers what the
game is, how the code is organized, the rules each system follows, what can be tuned,
and what is still planned. Verify specifics against the code before relying on them;
this file describes the state as of late September 2026.

## What this is

A small browser game made as a birthday gift. The player (Trevor by default) runs
through a real map of **Inman Park and Cabbagetown, Atlanta**, finds the dog **Maya**,
and brings her to **Waffle House** while dinosaurs (T-Rexes, velociraptors or
Allosauruses, one species per level) chase him and a storm floods the streets. Themes come from the recipient's interests: dinosaurs, weather, Waffle House,
RollerCoaster Tycoon, and Maya.

- Vanilla JavaScript + HTML5 Canvas + CSS, built with Vite. No framework, no game engine.
- Target: a laptop browser, hosted as a static site (GitHub Pages). `vite.config.js`
  uses a relative `base` for that.
- Keep it light and fun: it's a gift, not a hardcore game. "Gentle" difficulty has no
  storm loss.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # outputs dist/
npm run preview
```

`.claude/launch.json` has a `game` config (port 5173) for the Claude desktop browser pane.

The folder is **not a git repository yet**. `work/` holds manual backups of older
versions of `main.js` and `mapData.js`.

## Gameplay loop

1. Start screen: a **How to play** button opens a five-picture guide (run, find Maya,
   get to Waffle House, grab waffles, watch the water). Choose a hero (Trevor or Peter; remembered in `localStorage`) and
   press **Start game**, which goes straight into the run, or **Start with intro**, which
   plays the intro cutscene first. An animated chase scene plays in the diner's window.
2. Trevor starts at home: Inman Motor Works on Spruce Street, between Inman Walk and
   DeKalb Avenue. Maya spawns far away on a named street and
   wanders; her "last seen" address scrolls in the weather ticker.
3. A pink **M** arrow at the edge of the screen points to Maya. Walk into her to rescue
   her; she then follows Trevor's trail, and a yellow **W** arrow points to Waffle House.
   These arrows are part of the game, not debug aids (`drawTrackers`).
4. Reach Waffle House with Maya to clear the level. A "level complete" screen (the score on a guest check, the next level on a menu board) stays up until the player presses **Next level** or Enter; the next level is on the same map, with everything re-rolled and the score carried over. Getting caught ends the run (one life); the best score is saved in the browser.
5. Collect waffles (10 pts) and soda can pull tabs (5 pts) along the way; they only add
   to the score (no "x of N" shown on purpose).
6. Getting caught by a dinosaur is a game over. The game-over screen has a **Play again** button and the leaderboard form.
7. A storm clock runs the whole time: rain, darkening, a TV-style weather ticker, and
   streets that flood and eventually close. In gentle mode, a full clock triggers a
   "final surge", not a loss.

Controls: arrow keys, or on phones and tablets a floating thumbstick (`touchStick.js`: touch
anywhere on the map and drag; it snaps to the same 8 directions as the keys). P or Esc pauses, M mutes. Music, Pause and Restart are square yellow arcade keys with pixel icons (`hudIcons.js`) in the
top-right corner of the map (Restart asks first mid-run). A thin strip in the top-left shows level,
waffles, tabs, score and a "Maya: with you" cell, drawn as the diner's black menu board (there is no storm bar; the ticker reports the weather). `main.js` keeps the hero and edge arrows
out from under both (`hudRects`).

## File map (`src/`)

| File | Purpose |
|---|---|
| `main.js` | The game: state, game loop, movement, Maya, dinosaur spawning and drawing, pickups, floods, storm, rendering, UI wiring. ~3,000 lines. |
| `dinosaurs.js` | The dinosaur species (look, size, behaviour, per-level numbers), the level rotation (`getLevelSettings`) and the movement code (`updateDinosaur`). |
| `mapData.js` | Generated OSM geometry: `world`, `roads` (name/type/width/points), `parks`, `landmarks`. One long JSON line; **don't hand-edit casually**. |
| `mapAdjustments.js` | Hand nudges to road points (e.g. to make room for landmark sprites) and added streets (`EXTRA_ROADS`: Mill Walk). Applied in original coordinates, before scaling. |
| `mapScale.js` | `MAP_SCALE` (currently 1.4) plus helpers. Scales the map once at load. |
| `floodZones.js` | The 11 candidate flood zones (road stretches) in original coordinates. |
| `weatherSettings.js` | Storm/flood tuning per difficulty (`gentle` only so far) and `ACTIVE_DIFFICULTY`. |
| `weatherEffects.js` | Screen-space storm tint, vignette and rain particles. Visual only. |
| `weatherTicker.js` | The bottom-of-screen "WAFL Storm Team 5" news ticker (roundup and alerts). |
| `sounds.js` | Sound effects for finding Maya and picking up waffles and pop tabs (`public/audio/*.wav`), plus the intro's thunder, looping rain and roar (`thunder.mp3`, `rain_loop.mp3`, `roar.mp3`). Loaded at startup, unlocked by the Start buttons, muted along with the music, and silent if anything fails. `playSound(name, options)` can loop, fade in, start partway into a file, and returns `{ stop(fadeSeconds) }`. |
| `leaderboard.js` | Online top-10 leaderboard in a Supabase `scores` table (plain `fetch`, no library). Holds the public project URL and publishable key; the table's own rules limit visitors to reading and adding. Calls time out after 5s and the game carries on without them. |
| `startScene.js` | Looping chase animation on the start screen (shown through the diner's window). |
| `howToPlay.js`, `howToPlay/` | The How to play guide: a `<dialog>` on the start screen that steps through five screenshots with a line or two each (the `STEPS` list). Back/Next buttons or the arrow keys move through it; Esc, the × or a click outside closes it. The pictures are 960×540 crops of the real game, staged by hand while paused, so retake them if the map or sprites change enough to look wrong. |
| `introScene.js`, `intro.css` | The intro cutscene, played when the start screen's **Start with intro** button is pressed (**Start game** skips it): the hero on the couch at home in a brightly lit room, rain starting, the TV news saying power is failing and Waffle House is the only place with power, the apartment's power cutting out (the room and TV go dark), Maya's empty bed, a roar, and the hero setting out; it ends on the caption "Find Maya and bring her safely to Waffle House." A `say` step with `speaker: 'tv'` is spoken by the TV. The story is the `INTRO_SCRIPT` step list at the top; the module builds its own overlay and dialogue box. Skip button or Esc skips; Enter, Space, click or tap moves the dialogue on. The game stays frozen behind it (`hasStarted` is false) and the music starts when it ends. It opens on black with thunder; a second later the picture and the rain sound fade in, and the roar plays with its visual effects. How each file is played (start offset, volume, loop) is `INTRO_SOUNDS`; anything still playing fades out when the intro ends or is skipped. |
| `dinerScreens.js`, `diner.css` | The start, level-complete and game-over screens, drawn as the inside of a Waffle House: letter tiles from the sign for titles (`setTiles`), the score as a guest check that prints line by line (`printCheck`), a menu board, and sprites on a checkerboard floor (`createSprite`). `main.js` decides what each screen says. |
| `characters.js`, `characterPicker.js` | Playable heroes and the start-screen picker. |
| `neighborhoodCanopy.js`, `buildingData.js` | The blocks between streets: real OSM buildings as muted rooftops under seeded tree canopy. Background only; painted once into a half-size cached ground layer with the lawn, parks and roads (`createGroundLayer` in `main.js`), so it shares the sprites' 2× pixel grid. `buildingData.js` is generated by `tools/extract-buildings.mjs`. |
| `marta.js`, `martaLine.js`, `martaStationSprite.js` | Decorative elevated MARTA line with passing trains and a station. No gameplay effect. `martaLine.js` is generated by `tools/extract-marta.mjs`. |
| `*Sprite.js` | Pixel-art sprites: Trevor, Peter, Maya (walk/sniff/sit), T-Rex, velociraptor, Allosaurus, Waffle House, Krog Street Market, Inman Motor Works (Trevor's home), Fulton Cotton Mill Lofts, Inman Park sign, MARTA station, soda tab. |
| `krogStreetTunnelSprites.js` | Painted wall strip tiled along both sides of the Krog Street Tunnel road (`drawKrogStreetTunnel`). Also has an unused entrance sprite. |
| `touchStick.js` | Floating thumbstick for touch screens; ignores the mouse. |
| `style.css` | Styling for the game frame, the pause and restart prompts, the corner HUD (stats strip and buttons), and ticker. The three full screens are in `diner.css`. |

Also: `index.html` (layout and overlays), `data/` (raw OSM extracts and a license
note), `tools/` (data extraction scripts).

## Core systems and their rules

### Map and coordinates
- Road geometry comes from OpenStreetMap. Roads are polylines with a `width`, and
  movement is constrained to them.
- **Source coordinates stay unscaled.** `mapData.js`, `floodZones.js`,
  `mapAdjustments.js`, `martaLine.js` and hand-placed coordinates in `main.js` (landmark
  props, the Krog tunnel path) are in original units. At load: `applyRoadAdjustments`,
  then `scaleMapData`, and everything else goes through `scalePoint(s)`. When adding
  new coordinates, author them in original units and scale them.
- Road widths, sprite sizes and speeds do not scale, so a bigger `MAP_SCALE` makes
  trips longer.
- The map is fully connected. Dead-end edges were removed and fictional connectors were
  added: Boulevard NE runs up the west edge, and John Lewis Freedom Parkway runs along
  the north edge. The south half (Cabbagetown, where Waffle House is) connects north
  only via **five crossings**: Boulevard, the Krog Street Tunnel, Weatherby St,
  Walthall St and Moreland Ave.
- **Mill Walk** is another fictional connector (in `mapAdjustments.js`, not `mapData.js`):
  it joins Boulevard to Carroll Street just south of the Fulton Cotton Mill Lofts, so the
  long stretch of Boulevard between Decatur Street and Carroll Street has a way out. Its
  ends sit clear of the Boulevard and Carroll Street flood zones.

### Movement
- `canPlayerOccupy` means within **any** road's playable band (road half-width minus the
  body radius, plus `ROAD_FORGIVENESS`; see `isOnRoad`), or inside the Waffle House access
  path. It must check every road, not just the nearest: where a narrow street meets a
  wide one, nearest-only left invisible notches that the hero snagged on.
- `movePlayer` tries, in order:
  1. the direct step;
  2. a slide along a nearby road's direction;
  3. **corner assist** (`findCornerAssistStep`): a Pac-Man-style sideways nudge to line
     up with a side street that starts within `CORNER_ASSIST_MAX_GAP` and is up to
     `CORNER_ASSIST_RANGE` to one side;
  4. a **glance** off the curb (`findGlancingStep`): turn the step up to 80° either way
     and take the first open heading, which carries the hero round rounded bends and
     sharp street corners;
  5. the axis fallback.
- **Every step moves forwards or exactly sideways relative to the keys held, never
  backwards.** That rule is what stops two fallbacks undoing each other and shaking the
  hero on the spot; keep it when changing any of them. Corner nudges also can't reverse
  direction while the same keys are held (`lastCornerNudge`).
- `applyRoadMagnet` gently centers Trevor on his road.
- Frame time is clamped to `[0, 0.032]` seconds. It must never go negative: a negative
  step once pushed sprite animation to frame −1 and crashed rendering.

### Walkable-area grid
- `buildReachabilityGrid` flood-fills 8px cells from the start point using
  `canPlayerOccupy`. It runs once at load (about 0.5s at 1.4× scale).
- It's used for: pickup spawn points (only reachable road points), and the flood
  safety check (a fast breadth-first search over the grid).

### Maya
- She wanders (walking, then resting in a sniff or sit pose) until Trevor gets within
  `MAYA_PICKUP_DISTANCE`.
- **Following:** she moves toward a point `MAYA_FOLLOW_DISTANCE` back along Trevor's
  recorded trail. **She has no collision and can't block Trevor.** Floods slow her but
  never block her while following, so she can't be stranded.

### Dinosaurs (`dinosaurs.js`)
- **One species per level**, cycling T-Rex, velociraptor, Allosaurus (levels 1, 2, 3, then
  again from 4). Each time a species comes back (its "round") its numbers go up, and the
  storm gets a little shorter every level. All numbers are in each species'
  `getSettings(round)`; speeds are shares of the hero's speed.

  | Species | Count | Speed | Behaviour |
  |---|---|---|---|
  | T-Rex | 3, +2 a round, up to 10 | 66%, +7% a round, up to 92% | Each heads straight for the hero from anywhere on the map. Spawn spread out. |
  | Velociraptor | 2 packs of 3, +1 pack a round, up to 5 | 80%, +4% a round, up to 94% | A pack spawns together and runs in single file behind its chaser. Within about 800 px of the hero the two flankers swing out ahead and to either side, then close in. Smaller sprite and catch distance. |
  | Allosaurus | 3, +1 a round, up to 8 | prowls at 50% (up to 70%), charges at 135% (up to 155%) | Prowls toward the hero. Inside its charge range (300 px, up to 420) it rears up for a moment ("!" over its head, bright ring), charges for 1.8 s, then rests ("z z") before prowling again. Running straight away at the "!" escapes a charge. |

- Pursuit is **greedy** for every species (`stepToward`): each frame, pick the best of
  24 headings toward a target point. There's no route-finding, so they can get stuck
  behind blocks. This is the main known weakness; see the backlog.
- Dinosaurs spawn far from the hero, Maya, Waffle House and each other (`DINOSAUR_MIN_*`
  in `main.js`).
- Caught = within the species' `catchDistance`, which ends the game. Touching a resting
  Allosaurus still counts.
- Blocked by flood water from the depth set by `dinosaursBlockedFrom` ('shallow').
- Adding a species: a sprite module, an entry in `DINOSAUR_SPECIES` (with an `update`
  function), and its id in `SPECIES_ORDER`.

### Pickups
- `PICKUP_TYPES` table (waffle 10 pts, soda tab 5 pts; counts scale with `MAP_SCALE`),
  shared spacing `PICKUP_MIN_SPACING`, placed only on reachable road points.
- Collecting shows a "+N" popup. The panel shows plain counts and the score.

### Storm clock and weather (`weatherSettings.js`)
- The clock fills over `stormDurationSeconds` (90), 1.5× faster once Maya is following.
- Phases: raining from the very start (`cloudsStartAt` and `rainStartsAt` are both 0, so
  the clear and cloudy phases are skipped; raise them to bring those back), streets
  flooding (14%), and "storm has arrived" (100%).
- Each game floods `floodZoneCount` (5) random zones out of the 11. Their start times
  are spread across `floodWindow` ([0.14, 0.7]) with some randomness.
- Zone stages: **dry**, then **warning** (`warningSeconds`; puddles and a "!"), then
  **shallow** (`shallowSeconds`; wadeable at `shallowSpeedMultiplier`, blocks
  dinosaurs), then **deep** (blocks everyone, with road-closed barriers).
- **Floods currently stop at shallow** (`floodsTurnDeep: false`), so streets slow
  people down but never close. The deep stage and its safety check are kept; set
  `floodsTurnDeep: true` to bring them back.
- **Deep water blocks stepping in, never stepping out**, so nobody gets trapped.
- **Safety check** (`canFloodSafely`): before a zone turns deep, confirm Trevor can
  still reach Waffle House, and Maya too if she isn't rescued. Never flood over an
  unrescued Maya. If the check fails, the zone holds at shallow and rechecks every
  second.
- **Final surge** (gentle mode, `onStormFull: 'final-surge'`): every candidate zone not
  yet in play starts flooding; the safety check still keeps a route open.
  `onStormFull: 'lose'` gives an "Evacuate!" game over instead.
- Visuals: a tint and vignette that deepen with the clock, rain from 60 to 350 drops,
  and Waffle House cut out of the tint and lit like a beacon.

### Weather ticker (`weatherTicker.js`)
- Slides up at the rain phase. Tags: WEATHER ALERT (yellow), FLOOD WARNING (orange),
  ROAD CLOSED (red), BREAKING (flashing red).
- **Roundup** scroll: up to 4 flooded streets plus "+N more", the rain level, storm %,
  Maya's status, and the Waffle House Index. That's a real FEMA concept: green means
  full menu, yellow limited menu, and red closed. During the surge it reads
  "…except this one. It never closes."
- **Alerts** interrupt for about 4.5s, by priority. Long alerts scroll once, the
  surge clears queued alerts, and stale alerts are dropped.
- **The status bar is only for the goal** ("Find Maya at…", win or game over,
  paused). Weather news goes to the ticker.

### Rendering order (`drawGame`)
Map, water and labels, then landmarks, then MARTA trains, then pickups and popups,
then flood markers, then dinosaurs, then Maya, then the player. After that come the
storm lighting and tint, rain, and finally the edge-of-screen arrows (screen space).
The viewport resizes to the canvas's CSS size (`resizeViewport`, limited by
MIN/MAX_VIEW_*).

**If any draw call throws, the loop stops** (no safety net yet), and characters drawn
later, such as Trevor, disappear.

### Online leaderboard

- **Where:** Supabase table `public.scores` (`name`, `message`, `score`, `level`, `created_at`). The game-over screen offers a name + message form when the run scored points; after saving it shows "You're #N" and the top 10 with the new entry highlighted. The start screen has a collapsed "Top 10 leaderboard".
- **Rules live in the database:** visitors can read and insert only (row-level security and column grants); they can't update, delete or set `id`/`created_at`. Checks: name 1–20 characters, message ≤ 80, level 1–100, and `score <= level * 2100` (one level holds about 2,030 points). **If pickup counts or points change, update that check** in the Supabase SQL editor.
- **Moderation:** delete rude or fake rows in Supabase → Table Editor → scores. There's no rate limit, so one person can post many entries.
- **Free-tier pause:** Supabase pauses an idle free project after about a week; the lists then say "Leaderboard unavailable" until it's restored in the dashboard.
- Names and messages are always rendered as text, never HTML. The keyboard shortcuts (P, M, arrows) ignore keys typed into the form.

## Debug controls
In `main.js`:
- `SHOW_DINOSAUR_TRACKERS = true` adds edge-of-screen arrows for off-screen dinosaurs.
- URL parameters (always on; harmless to leave in):
  - `?level=5` starts every run at that level.
  - `?dinosaur=velociraptor` (or `t-rex`, `allosaurus`; `raptor` also works) puts that
    species on every level.
  - They combine: `?dinosaur=allosaurus&level=6`.

## Main tunables

| What | Where |
|---|---|
| Map size | `MAP_SCALE` in `mapScale.js` |
| Storm length, phase timing, flood count and stages (and whether they turn deep), wading speed, surge vs. loss | `weatherSettings.js` |
| Candidate flood zones | `floodZones.js` (original coordinates) |
| Dinosaur counts, speeds, behaviour, level rotation, storm length per level | `dinosaurs.js` |
| Dinosaur spawn distances | `DINOSAUR_MIN_*` in `main.js` |
| Player speed, corner assist | `PLAYER_SPEED`, `CORNER_ASSIST_*` in `main.js` |
| Pickups | `PICKUP_TYPES`, `PICKUP_MIN_SPACING` in `main.js` |
| Rain and tint look | constants at the top of `weatherEffects.js` |
| Ticker speed and timing | constants at the top of `weatherTicker.js` |

## Conventions
- **Full screens are game screens, not web dialogs.** The start, level-complete and
  game-over screens share the diner look in `diner.css`. Their text is in two bundled
  pixel fonts (`@fontsource/silkscreen` for tiles, boards and buttons; `@fontsource/vt323`
  for guest checks), so nothing loads from a font service. Sizes there are in `--u`, a
  unit that grows with the screen, so the screens fill a large laptop and restack into
  one column on upright phones; avoid fixed pixel or rem sizes. Keep the copy short
  and in the diner's voice ("ORDER UP!", "NEXT ON THE GRILL"), not explanatory sentences.
- Match the existing style: plain ES modules, descriptive names, and short comments
  that explain *why*.
- **Sprites** are arrays of strings, one character per pixel, with a palette object.
  Characters face right and are mirrored when moving left. Walking sprites have two
  leg frames. They're rendered to offscreen canvases and drawn with smoothing off at
  2× (3× on the start screen).
- Prefer new modules for new systems, since `main.js` is already large.
- Visual-only systems (rain, ticker, MARTA, start scene) must not affect gameplay.
- Keep difficulty-dependent numbers in `weatherSettings.js`, so easy, medium and hard
  can be added as new entries.

## Testing notes
- There's no test suite. Check the build with `npm run build`.
- When testing from the browser console, **import the exact module URL the page
  loaded**, e.g. `performance.getEntriesByType('resource')` and then find
  `/src/main.js?t=…`. `import('/src/main.js')` can create a *second* game instance
  that draws to the same canvas.
- `main.js` exports `camera, canPlayerOccupy, gameState, movePlayer, restartGame` for
  console testing.
- A hidden or background tab pauses `requestAnimationFrame`, and the game with it.
- The project owner prefers to playtest changes themselves; ask before doing long
  browser test sessions.

## Backlog and ideas
- **Dinosaur feel.** Earlier playtests (T-Rex only) said the game was too easy and
  T-Rexes were rarely seen. The new species and numbers haven't been playtested yet.
  Options:
  - route-finding pursuit, reusing the walkable grid as a distance field toward Trevor
  - wander until Trevor is near, then chase
  - a debug readout of encounter rate
  - then retune each species' `getSettings`
- **Birthday touches:** a personal win-screen message, dinosaur names, inside jokes,
  optional sound.
- **Safety net:** stop one draw error from freezing the whole game.
- **Difficulty levels** (easy/medium/hard) as new `weatherSettings.js` entries.
- **Before sharing:** turn off the debug flags, run `git init` and commit, publish to
  GitHub Pages, test on the recipient's laptop.
- **Decided against:** waffles floating away in floods, and "x / total" pickup counts.
