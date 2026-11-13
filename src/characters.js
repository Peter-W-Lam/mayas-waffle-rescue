// Playable heroes. They share a sprite size and walk cycle, so the game can draw
// whichever one was picked on the start screen without any other changes.
// createSeatedFrame is the couch pose used by the intro cutscene.
import { createTrevorFrames, createTrevorSeatedFrame } from './trevorSprite.js';
import { createPeterFrames, createPeterSeatedFrame } from './peterSprite.js';

export const CHARACTERS = [
  { id: 'trevor', name: 'Trevor', createFrames: createTrevorFrames, createSeatedFrame: createTrevorSeatedFrame },
  { id: 'peter', name: 'Peter', createFrames: createPeterFrames, createSeatedFrame: createPeterSeatedFrame },
];

export function findCharacter(id) {
  return CHARACTERS.find((character) => character.id === id) ?? CHARACTERS[0];
}
