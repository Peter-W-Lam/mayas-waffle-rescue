// Background music: one looping track. Browsers only allow audio to start after the
// player clicks or presses a key, so the game calls play() from the Start button.
// The mute choice is remembered between visits.
const MUSIC_URL = `${import.meta.env.BASE_URL}audio/soundtrack.mp3`;
const MUSIC_VOLUME = 0.5;
const MUTED_STORAGE_KEY = 'waffle-rescue-music-muted';

export function createMusic() {
  const audio = new Audio(MUSIC_URL);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = MUSIC_VOLUME;
  audio.muted = loadMuted();

  return {
    play() {
      // play() is refused if the browser blocks audio; the game carries on silently.
      audio.play().catch(() => {});
    },
    pause() {
      audio.pause();
    },
    isMuted() {
      return audio.muted;
    },
    toggleMuted() {
      audio.muted = !audio.muted;
      saveMuted(audio.muted);
      return audio.muted;
    },
  };
}

function loadMuted() {
  try {
    return window.localStorage.getItem(MUTED_STORAGE_KEY) === 'true';
  } catch {
    return false; // storage can be blocked (private windows)
  }
}

function saveMuted(muted) {
  try {
    window.localStorage.setItem(MUTED_STORAGE_KEY, String(muted));
  } catch {
    // Not remembered this time; the choice still applies to this session.
  }
}
