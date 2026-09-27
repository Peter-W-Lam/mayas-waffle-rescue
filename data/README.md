# Map data

The game map was generated from two overlapping extracts supplied on September 12,
2026: `map.osm` for the original northern area and `map-south.osm` for the southern
expansion.

The processed game layer keeps named streets while intentionally omitting footpaths,
building footprints, railways, sidewalks, crossings, and several small internal
road loops north of Lake Avenue.

The southern expansion ends at Memorial Drive and is bounded by Boulevard and
Moreland Avenue. Passage between the northern and southern sections is available
on Boulevard, Bradley Street, Cornelia Street, Daniel Street, Howell Street, the
Krog Street Tunnel, and Moreland Avenue.

The generation pass also normalizes equivalent street names, joins contiguous OSM
fragments, simplifies overly detailed polylines, narrows parallel one-way
carriageways, and removes isolated micro-stubs. Important streets and the selected
north–south connections are protected from automatic removal.

DeKalb Avenue is exempt from the horizontal seam gap because it follows the join
east-to-west; its curves cross the seam latitude without creating another
north-to-south route.

Boulevard, Moreland Avenue, and Memorial Drive are emitted as simplified single
boundary paths. Other roads are clipped to those centerlines with no exterior
margin, so small OSM ramps, divided carriageways, and street stubs do not protrude
beyond the playable map.

Map data: © OpenStreetMap contributors, licensed under the Open Data Commons Open Database License (ODbL).

- OpenStreetMap copyright: https://www.openstreetmap.org/copyright
- ODbL: https://opendatacommons.org/licenses/odbl/
