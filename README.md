# Maya’s Waffle Rescue

A browser game prototype built with vanilla JavaScript, HTML5 Canvas, CSS, and Vite.

The scrolling game world is generated from OpenStreetMap geometry. Trevor starts
at home (Inman Motor Works on Spruce Street) and moves with the arrow keys. Waffle
House appears at one of the hand-picked lots in `src/waffleHouseSites.js` each game, always a long walk from
Trevor and Maya and never cut off by that game's flood zones. Movement is constrained to
the curved street network with a small forgiveness margin and subtle road-centering
assistance.

## Run locally

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

The Vite base path is relative so the production build can be hosted from a GitHub Pages project subpath.

## Map data

The two original OSM extracts and their licensing notes are stored in `data/`. The
compact browser-ready merged geometry lives in `src/mapData.js`. The southern
section is bounded by Boulevard, Moreland Avenue, and Memorial Drive, with only
Boulevard, the Krog Street Tunnel, and Moreland connecting it to the north.

The projected world is `3600 × 2700` while the visible canvas remains `960 × 540`,
giving the streets more breathing room and making trips across the neighborhood
feel more substantial.

Every named street receives a label. Longer streets repeat their labels along the
route, while duplicate labels from nearby parallel or fragmented OSM ways are
suppressed automatically.

The generated geometry is cleaned automatically by normalizing street names,
joining adjacent fragments, simplifying excess coordinate points, narrowing
parallel one-way carriageways, and removing isolated micro-stubs. Critical routes
remain protected during cleanup.

Map data © OpenStreetMap contributors, licensed under the Open Data Commons Open
Database License (ODbL).
