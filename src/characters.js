// Playable heroes. They share a sprite size and walk cycle, so the game can draw
// whichever one was picked on the start screen without any other changes.
import { createTrevorFrames } from './trevorSprite.js';
import { createPeterFrames } from './peterSprite.js';

export const CHARACTERS = [
  { id: 'trevor', name: 'Trevor', createFrames: createTrevorFrames },
  { id: 'peter', name: 'Peter', createFrames: createPeterFrames },
];

export function findCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}
