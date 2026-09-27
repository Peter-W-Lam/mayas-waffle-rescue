// Start-screen hero picker: one card per character with a pixel portrait. Each card
// wraps a native radio button, so arrow keys, Tab and screen readers work as usual;
// the cards are styling on top.
const PORTRAIT_SCALE = 3;

export function createCharacterPicker(container, { characters, framesById, selectedId, onChange }) {
  container.replaceChildren();

  for (const character of characters) {
    const option = document.createElement('label');
    option.className = 'character-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'character';
    input.value = character.id;
    input.checked = character.id === selectedId;
    input.addEventListener('change', () => {
      if (input.checked) onChange(character.id);
    });

    const standingFrame = framesById[character.id][0];
    const portrait = document.createElement('canvas');
    portrait.className = 'character-option__portrait';
    portrait.width = standingFrame.width * PORTRAIT_SCALE;
    portrait.height = standingFrame.height * PORTRAIT_SCALE;
    portrait.setAttribute('aria-hidden', 'true');
    const portraitContext = portrait.getContext('2d');
    portraitContext.imageSmoothingEnabled = false;
    portraitContext.drawImage(standingFrame, 0, 0, portrait.width, portrait.height);

    const name = document.createElement('span');
    name.className = 'character-option__name';
    name.textContent = character.name;

    option.append(input, portrait, name);
    container.append(option);
  }
}
