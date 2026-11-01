// Pixel-art Inman Motor Works, Trevor's home on Spruce Street: a long, low building of
// white painted brick with blocky dark lettering, a round red sign, a roll-up garage
// door, and sunflowers along the front. Seen from the front. Each character is one
// pixel; see INMAN_MOTOR_WORKS_PALETTE.
export const INMAN_MOTOR_WORKS_ROWS = [
  '..............................................................................OOOOOOOOOOOOOOOOOOOOO.....................................................................................',
  '........................................................................OtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtO...............................................................................',
  '.....................................................................OTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtO........OOOOOOOOOOOOO.......................................................',
  '......................................OOOOOOOOO....................OTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTO..OTtTTTTtTTTTtTTTTtTTO...................................................',
  '...................................OTtTTTTtTTTTtTO................OtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTOTtTTTTtTTTTtTTTTtTTTTtTO.................................................',
  '..................................OtTTTTtTTTTtTTTTO...............OTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTtTTTTOTTTTtTTTTtTTTTtTTTTtTTTO.................................................',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
  'okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkko',
  'occcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccco',
  'oWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWvvvvvuvvvvvvo',
  'oWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWvvvvvuvvvvvvo',
  'oWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWvvvvvuvvvvvvo',
  'owwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwvuuuuuuuuuuuo',
  'oWWWwWWWWWWWwLLLLLLWwLLWWWWLLWWLLWWWwWWLLWWWwLLWWWWLLWWWWLLWwWWWWWWLLWWWWWWLLWWLLLLLLWWLLLLLLWWLLLLLLWWLLLLWwWWWWWWWwLLWWWWWwLLWWLLLLLLWWLLLLWWWWLLWwLLWWLLLLLLWWWWWwWWWWWWvuvvvvvvvuvvo',
  'oWWWwWWWWWWWwLLLLLLWwLLWWWWLLWWLLWWWwWWLLWWWwLLWWWWLLWWWWLLWwWWWWWWLLWWWWWWLLWWLLLLLLWWLLLLLLWWLLLLLLWWLLLLWwWWWWWWWwLLWWWWWwLLWWLLLLLLWWLLLLWWWWLLWwLLWWLLLLLLWWWWWwWWWWWWvuvvvvvvvuvvo',
  'oWWWwWWWWWWWwWWLLWWWwLLLLWWLLWWLLLLWwLLLLWWLLWWLLWWLLLLWWLLWwWWWWWWLLLLWWLLLLWWLLWWLLWWWWLLWwWWLLWWLLWWLLWWLLWWWWWWWwLLWWWWWwLLWWLLWwLLWWLLWwLLWWLLWwLLWWLLWwWWWWWWWwWWWWWWvuvvvvvvvuvvo',
  'owwwwwwwwwwwwwwLLwwwwLLLLwwLLwwLLLLwwLLLLwwLLwwLLwwLLLLwwLLwwwwwwwwLLLLwwLLLLwwLLwwLLwwwwLLwwwwLLwwLLwwLLwwLLwwwwwwwwLLwwwwwwLLwwLLwwLLwwLLwwLLwwLLwwLLwwLLwwwwwwwwwwwwwwwwvuuuuuuuuuuuo',
  'oWWWWWWWwWWWWWWLLWWWWLLWwLLLLWWLLWWLLWWLLWWLLLLLLWWLLWWLLLLWWWWWwWWLLWWLLWWLLWWLLWWLLWWWwLLWWWWLLWWLLWWLLLLWWWWWwWWWWLLWwLLWWLLWwLLWWLLWwLLLLWWWwLLLLWWWwLLLLLLWwWWWWWWWwWWvvvvvuvvvvvvo',
  'oWWWWWWWwWWWWWWLLWWWWLLWwLLLLWWLLWWLLWWLLWWLLLLLLWWLLWWLLLLWWWWWwWWLLWWLLWWLLWWLLWWLLWWWwLLWWWWLLWWLLWWLLLLWWWWWwWWWWLLWwLLWWLLWwLLWWLLWwLLLLWWWwLLLLWWWwLLLLLLWwWWWWWWWwWWvvvvvuvvvvvvo',
  'oWWWWWWWwWWWWWWLLWWWWLLWwWWLLWWLLWWWWWWLLWWLLWWLLWWLLWWWwLLWWWWWwWWLLWWWwWWLLWWLLWWLLWWWwLLWWWWLLWWLLWWLLWWLLWWWwWWWWLLLLWWLLLLWwLLWWLLWwLLWWLLWwLLWWLLWwWWWWLLWwWWWWWWWwWWvvvvvuvvvvvvo',
  'owwwwwwwwwwwwwwLLwwwwLLwwwwLLwwLLwwwwwwLLwwLLwwLLwwLLwwwwLLwwwwwwwwLLwwwwwwLLwwLLwwLLwwwwLLwwwwLLwwLLwwLLwwLLwwwwwwwwLLLLwwLLLLwwLLwwLLwwLLwwLLwwLLwwLLwwwwwwLLwwwwwwwwwwwwvuuuuuuuuuuuo',
  'oWWWwWWWWWWWwLLLLLLWwLLWWWWLLWWLLWWWwWWLLWWLLWWLLWWLLWWWWLLWwWWWWWWLLWWWWWWLLWWLLLLLLWWWWLLWwWWLLLLLLWWLLWWLLWWWWWWWwLLWWWWWwLLWWLLLLLLWWLLWwLLWWLLWwLLWWLLLLLLWWWWWwWWWWWWvuvvvvvvvuvvo',
  'oWWWwWWWWWWWwLLLLLLWwLLWWWWLLWWLLWWWwWWLLWWLLWWLLWWLLWWWWLLWwWWWWWWLLWWWWWWLLWWLLLLLLWWWWLLWwWWLLLLLLWWLLWWLLWWWWWWWwLLWWWWWwLLWWLLLLLLWWLLWwLLWWLLWwLLWWLLLLLLWWWWWwWWWWWWvuvvvvvvvuvvo',
  'oWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWvuvvvvvvvuvvo',
  'owwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwvuuuuuuuuuuuo',
  'oWPPPPPPPPWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWoooooooooooooooooooooooooooooWWWWWwWWWWWWWwWWWWWWWwWWvvvvvuvvvvvvo',
  'oWPiiiiiiPWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWWWWWwWWWWrrrwWWWWWWWwWWvvvvvuvvvvvvo',
  'oWPiPPPPiPWWWWWWwWmmmmmmmmmmmmmmmmmmmmmWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWmmmmmmmmmmmmmmmmmmmWwWWWWWWWwWWWWWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWWWWWwWWrrRRRrrWWWWWWwWWvvvvvuvvvvvvo',
  'owPiiiiiiPwwwwwwwwmGGnnnnmGGnnnmGnnnnnmwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwmDDmDDmDDmDDmDDmDDmwwwwwwwwwwwwwwwozzzzzzzzzzzzzzzzzzzzzzzzzzzowwwwwwwwrRhRRRrwwwwwwwwwvuuuuuuuuuuuo',
  'oWPiiiiiiPWWwWWWWWmGyyynnmnnnnnmnnnnnnmWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWwWWWWWWWmDDmDDmDDmDDmDDmDDmWWWWWwWWWWWWWwWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWwWWWWWrRhRRRRRrWwWWWWWWvuvvvvvvvuvvo',
  'oWPiiiiiiPWWwWWWWWmyybyynmnnnnnmnnnnnnmWWWWWwWWWWWWWwWWWWWWWwWWWWWWyyyWWWWWWwWWWWWWWmDDmDDmDDmDDmDDmDDmWWWWWwWWWWWWWwWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWwWWWWWrRRRRRRRrWwWWWWWWvuvvvvvvvuvvo',
  'oWPPPPPPPPWWwWWWWWmybbbynmnnnnnmnnyyynmWWWWWwWWWWWWWwWWWWWWWwWWWWWyybyyWWWWWwWWWWWWWmDDmDDmDDmyyyDDmDDmWWWWWwWWWWWWWwWozzzzzzzzzzzzzzzzzzzzzzzzzzzoWwWWWWWrRRRRRRRrWwWWWWWWvuvvvvvvvuvvo',
  'owwwwPwwwwwwwwwwwwmyybyynmnnnnnmnyybyymwwwwwwwwwwwwwwyyywwwwwwwwwwybbbywwwwwwwwwwwwwmDDmDDmDDyybyyDmDDmwwwwwwwwwwwwwwwoZZZZZZZZZZZZZZZZZZZZZZZZZZZowwwwwwwwrRRRRRrwwwwwwwwwvuuuuuuuuuuuo',
  'oWWWWPWWwWWWWWyWwWmmyyymmmmmmmmmmybbbymWwWWWWWWWwWWWyybyyWWWWWWWwWyybyyWwWWWWWWWwWWWmDDmDDmDDybbbyDmDDmWwWWWWWWWwWWWWWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWWWWWwWWrrRRRrrWWWWWWwWWvvvvvuvvvvvvo',
  'oWWWWPWWwWWWWybywWmnngnnnmnnnnnmnyybyymWwWWWWWWWwWWWybbbyWWWWWWWwWWyyyWWwWWWyWWWwWWWmDDmDDmDDyybyyDmDDmWwWyWWWWWwWWWWWozzzzzzzzzzzzzzzzzzzzzzzzzzzoWWWWWwWWWWrrrwyyyWWWWwWWvvvvvuvvvvvvo',
  'oWWWWPWWwWWWWWyWwWmnngnnnmnnnnnmnnyyynmWwWyWWWWWwWWWyybyyWWWWWWWwWWWgWWWwWWybyWWwWWWmDDmyDmDDmyyyDDmDDmWwybyWWWWwWWWWWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWWWWWwWWWWWWWyybyyWWWwWWvvvvvuvvvvvvo',
  'owwwwPwwwwwwwwgwwwmnngnnnmnnynnmnnngnnmwwybywwwwwwwwwyyywwwwwywwwwwwgwwwwwwwywwwwwwwmDDybymDDmDgmDDmDDmwwwywwwwwwwwwwwoZZZZZZZZZZZZZZZZZZZZZZZZZZZowwwwwwwwwwwwwybbbywwwwwwvuuuuuuuuuuuo',
  'oWWWwPWWWWWWwWgWWWmjGgnnnmnybynmnnngnnmWWWyWwWWWWWWWwWgWWWWWybyWWWWWgWWWWWWWgWWWWWWWmDDmyDmDDmDgmDDmDDmWWWgWwWWWWWWWwWozzzzzzzzzzzzzzzzzzzzzzzzzzzoWwWWWWWWWwWWWyybyyWWWWWWvuvvvvvvvuvvo',
  'oWWWwPWWWWWWwWgWWWmGGgnnnmnnynnmnnngnnmWWWgWwWWWWWWWwWgWWWWWwyWWWWjGgWWWWWWWgWWWWWWWmDDmgDmDDmDgmDDmDDmWWWgWwWWWWWWWwWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWwWWWWWWywWWWWyyywWWWWWWvuvvvvvvvuvvo',
  'oWWWwPWWWWWWwWgGjWmnngnnnmnngnnmnjGgnnmWWWgWwWWWWWWWwWgWWWWWwgWWWWGGgWWWWWWWgWWWWWWWmDDmgDmDDjGgmDDmDDmWWWgWwWWWWWWWwWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWwWWWWWybyWWWWWgWwWWWyWWvuvvvvvvvuvvo',
  'owwwwPwwwwwwwwgGGwmmmgmmmmmmgmmmmGGgmmmwwwgwwwwwwwwwjGgwwwwwwgwwwwwwgwwwwwjGgwwwwwwwmDDmgDmDDGGgmDDmDDmwjGgwwwwwwwwwwwozzzzzzzzzzzzzzzzzzzzzzzzzzzowwwwwwwwywwwwwwgwwwwybywvuuuuuuuuuuuo',
  'oWWWWPWWwWWWWWgWwWWjGgWWwWWWgWWWwWWgWWWWwWgGjWWWwWWWGGgWwWWWWgWWwWWWgWWWwWGGgWWWwWWWmDDmgGjDDmDgmDDmDDmWGGgWWWWWwWWWWWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWWWWWwWWgWWWWwWgWWWWWyWWvvvvvuvvvvvvo',
  'oWWWWPWWwWWWWWgWwWWGGgWWwWjGgWWWwWWgWWWWwWgGGWWWwWWWWWgWwWWWWgGjwWjGgWWWwWWWgWWWwWWWmmmmgGGmmmmgmmmmmmmWwWgWWWWWwWWWWWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWWWWWwWWgWWWWjGgWWWWWgWWvvvvvuvvvvvvo',
  'oWWWWPWWwWWWWWgGjWWWWgWWwWGGgWWWwjGgWWWWwWgWWWWWwWWWWWgWwWWWWgGGwWGGgWWWwWWWgWWWwWWWWWWWgWWWWjGgwWWWWWWWwWgWWWWWwWWWWWozzzzzzzzzzzzzzzzzzzzzzzzzzzoWWWWWwWWgWWWWGGgWWWWWgWWvvvvvuvvvvvvo',
  'owwwwPwwwwwwwwgGGgwwggwgwwgwggwwgGGgwwgwwggwgwwwwwwwjGgwgwwgwggwwgwwgwwgwwjGggwwwwwwwwgwggwwgGGgwwgwwgwwjGggwwgwwwwwwwoZZZZZZZZZZZZZZZZZZZZZZZZZZZowwwwwgwwgGjgwwggwgwwggwwvuuuuuuuuuuuo',
  'oWWWwPWWWWWWwggWgyWjGggjWgGWgGWgGWggwgGWgGgGjWWWWWWWGGggGWgjwgGWgGWggWgjWgGGgGWgWWWWwgGWgGjgGWggWgGWgGWgGGgjwgGWWWWWwWoZZZZZZZZZZZZZZZZZZZZZZZZZZZoWwWWWGWggGGGWgGggGWgjgGjvuvvvvvvvuvvo',
  'oWWWwPWWWWWWgGggGGgGGgjfgGjggGgGGgyggGjgGGgGGgWWWWWgGGgGfgjGggjgGGgyggjGgGjggGgGWWWWwGjggGGGGgjggGjgyGgGGggGgGjgWWWWwWozzzzzzzzzzzzzzzzzzzzzzzzzzzoWwWWWGgjggGjgGGgGGgyGgGGvuvvvvvvvuvvo',
  'oWWWwPWWWWWWGjgGGjyGGgGGGjGGgpGGGjGgGjGGfjgGGjWWWWWyGjgGGjGGGgpGGjGGgjGGGfGGgjGGWWWWwjGGgjGGGjGgGjGGGjGGGjgGGjGGWWWWwWoZZZZZZZZZZkkkkkkkZZZZZZZZZZoWwWWWGjGgGjGGGpgGGjGGgWWvuvvvvvvvuvvo',
  'owwwwPwwwwwgjpGGjGGGjGGGfGGGjGGGjGGyjGGGjGGGjGgwwwgGjGGGjfGGjGGGjGGGyGGGjGGGjGGpgwwwgGGGjGfGjGGGjGGGjyGGjGGGjGGGgwwwwwoZZZZZZZZZZZZZZZZZZZZZZZZZZZowwwwgjGGGfGGGjGGGjGGyjgwvuuuuuuuuuuuo',
  'oWWWWPWWwWWjGGGjGGGyGGGjGGGjGGpjGGGjGGGjGfGjGGGWwWGjyGGjGGGjGGGpGGGjGGGjGGfjGGGjGWWWGyGjGGGjGGGjpGGjGGGjGGGfGGGjGWWWWWozzzzzzzzzzzzzzzzzzzzzzzzzzzoWWWWyGGGjGGGjGGpjGGGjGGWvvvvvuvvvvvvo',
  'odeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddeddddessssssssssssssssssssssssssssseddddeddddeddddeddddeddddeddddeddddeo',
  'osssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssso',
  'oSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSo',
  'oooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo',
];

export const INMAN_MOTOR_WORKS_PALETTE = {
  o: '#2a1d17', // outline
  k: '#3a3a3c', // roof cap
  c: '#8d8b86', // coping under the cap
  W: '#f3f1ea', // white painted brick
  w: '#e2dfd6', // mortar
  v: '#d2cdc1', // side wall in shade
  u: '#bfb9ab', // side wall mortar
  L: '#2b2b2d', // lettering
  m: '#6b4a2f', // window frames and security bars
  n: '#9fb8c4', // window glass
  G: '#e6f1f5', // glass glare
  D: '#2f2a28', // dark window
  R: '#d8322b', // round red sign
  r: '#9e2420', // sign rim
  h: '#ff8a7a', // sign highlight
  P: '#6e6e6e', // parking sign post and frame
  Z: '#b8bcbf', // roll-up garage door
  z: '#8f9498', // garage door slats
  i: '#f4f4ee', // parking sign face
  O: '#2c5a2e', // tree outline
  T: '#3f7d3a', // tree leaves
  t: '#5fa34a', // sunlit tree leaves
  g: '#3b7133', // stems and shaded leaves
  G: '#4f8f3f', // leaves
  j: '#7cb85a', // sunlit leaves
  y: '#f5c518', // sunflower petals and yellow flowers
  b: '#6b3d1f', // sunflower centres
  f: '#f07a2a', // orange flowers
  p: '#e86fa3', // pink flowers
  d: '#7a5a3f', // mulch
  e: '#5e4430', // mulch shade
  s: '#d9d4c7', // sidewalk
  S: '#b9b3a5', // sidewalk shade
};

export function createInmanMotorWorksSprite() {
  const sprite = document.createElement('canvas');
  sprite.width = INMAN_MOTOR_WORKS_ROWS[0].length;
  sprite.height = INMAN_MOTOR_WORKS_ROWS.length;
  const spriteContext = sprite.getContext('2d');

  INMAN_MOTOR_WORKS_ROWS.forEach((row, y) => {
    [...row].forEach((pixel, x) => {
      const color = INMAN_MOTOR_WORKS_PALETTE[pixel];
      if (!color) return;
      spriteContext.fillStyle = color;
      spriteContext.fillRect(x, y, 1, 1);
    });
  });

  return sprite;
}
