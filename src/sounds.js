// Sound effects: pickups, finding Maya, and the intro cutscene's thunder, rain and roar.
// They use Web Audio so quick pickups can overlap instead of cutting each other off, and
// so the rain can loop and fade. Files load as soon as the game opens; browsers keep audio
// silent until the player clicks or presses a key, so the game calls unlockSounds() from
// the Start buttons.
const SOUND_FILES = {
  maya: 'maya.wav',
  waffle: 'waffle.wav',
  tab: 'poptab.wav', // soda can pull tabs
  thunder: 'thunder.mp3',
  rain: 'rain_loop.mp3',
  roar: 'roar.mp3',
};
const SOUND_VOLUME = 0.3;
// MP3 files carry a sliver of silence at each end; a loop skips it so the join is smooth.
const LOOP_EDGE_SECONDS = 0.06;

const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
const audioContext = AudioContextClass ? new AudioContextClass() : null;
const buffers = {};
const loading = {}; // name -> promise that settles once that file has loaded (or failed)
let output = null;
let unlockRequested = false;

if (audioContext) {
  output = audioContext.createGain();
  output.gain.value = SOUND_VOLUME;
  output.connect(audioContext.destination);

  for (const [name, file] of Object.entries(SOUND_FILES)) {
    loading[name] = fetch(`${import.meta.env.BASE_URL}audio/${file}`)
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
  unlockRequested = true;
  if (audioContext?.state === 'suspended') audioContext.resume().catch(() => {});
}

// The game's mute button silences these along with the music. Muting turns the volume
// down rather than skipping sounds, so a long one (the rain) comes back when unmuted.
export function setSoundsMuted(isMuted) {
  if (output) output.gain.value = isMuted ? 0 : SOUND_VOLUME;
}

// Plays a sound by name. Stays silent if it hasn't loaded or audio is blocked, so a sound
// problem never interrupts the game. Options:
//   volume       loudness next to the other sounds (1 is normal)
//   offset       seconds into the file to start from (to skip silence at the start)
//   loop         keep repeating until stopped
//   fadeIn       seconds to fade in over
//   whenReady    if the file is still loading, start as soon as it arrives
// Returns { stop(fadeSeconds) }, which fades the sound out; calling it for a sound that
// has already ended (or never started) does nothing.
export function playSound(name, { volume = 1, offset = 0, loop = false, fadeIn = 0, whenReady = false } = {}) {
  let stopped = false;
  let source = null;
  let gain = null;

  function start() {
    const buffer = buffers[name];
    if (stopped || !buffer) return;
    // Right after unlockSounds() the audio is still waking up; a sound started now plays
    // the moment it does. Before any click it would only pile up, so it's skipped.
    if (audioContext.state !== 'running' && !unlockRequested) return;
    gain = audioContext.createGain();
    gain.connect(output);
    const now = audioContext.currentTime;
    if (fadeIn > 0) {
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + fadeIn);
    } else {
      gain.gain.value = volume;
    }
    source = audioContext.createBufferSource();
    source.buffer = buffer;
    if (loop) {
      source.loop = true;
      source.loopStart = LOOP_EDGE_SECONDS;
      source.loopEnd = buffer.duration - LOOP_EDGE_SECONDS;
    }
    source.connect(gain);
    source.start(0, loop ? Math.max(offset, LOOP_EDGE_SECONDS) : offset);
  }

  if (audioContext) {
    if (buffers[name]) start();
    else if (whenReady && loading[name]) loading[name].then(start);
  }

  return {
    stop(fadeSeconds = 0) {
      if (stopped) return;
      stopped = true;
      if (!source) return;
      const now = audioContext.currentTime;
      const end = now + Math.max(0, fadeSeconds);
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, end);
      try {
        source.stop(end);
      } catch {
        // Already finished playing.
      }
    },
  };
}
