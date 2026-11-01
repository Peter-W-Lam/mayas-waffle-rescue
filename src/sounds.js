// Short sound effects for pickups and finding Maya. They use Web Audio so quick pickups
// can overlap instead of cutting each other off. Files load as soon as the game opens;
// browsers keep audio silent until the player clicks or presses a key, so the game calls
// unlockSounds() from the Start button.
const SOUND_FILES = {
  maya: 'maya.wav',
  waffle: 'waffle.wav',
  tab: 'poptab.wav', // soda can pull tabs
};
const SOUND_VOLUME = 0.3;

const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
const audioContext = AudioContextClass ? new AudioContextClass() : null;
const buffers = {};
let output = null;
let muted = false;

if (audioContext) {
  output = audioContext.createGain();
  output.gain.value = SOUND_VOLUME;
  output.connect(audioContext.destination);

  for (const [name, file] of Object.entries(SOUND_FILES)) {
    fetch(`${import.meta.env.BASE_URL}audio/${file}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => audioContext.decodeAudioData(data))
      .then((buffer) => { buffers[name] = buffer; })
      .catch((error) => console.warn(`Couldn't load the "${name}" sound:`, error));
  }
}

export function unlockSounds() {
  if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
}

// The game's mute button silences these along with the music.
export function setSoundsMuted(isMuted) {
  muted = isMuted;
}

// Plays a sound by name. Stays silent if muted, not loaded yet, or audio is blocked, so
// a sound problem never interrupts the game.
export function playSound(name) {
  const buffer = buffers[name];
  if (muted || !buffer || audioContext.state !== 'running') return;
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(output);
  source.start();
}
