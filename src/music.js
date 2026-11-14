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
  let mutedByPlayer = loadMuted();
  let shouldBePlaying = false;
  let isPriming = false;
  audio.muted = mutedByPlayer;

  return {
    // Call from a click when the music should start a little later (after the intro
    // cutscene). Safari only lets a track start outside a click if it was first started
    // inside one, so this starts it silently and stops it again straight away.
    prime() {
      if (shouldBePlaying || isPriming) return;
      isPriming = true;
      audio.muted = true;
      audio.play()
        .then(() => {
          if (shouldBePlaying) return; // play() was called meanwhile: keep going
          audio.pause();
          audio.currentTime = 0;
        })
        .catch(() => {})
        .finally(() => {
          isPriming = false;
          audio.muted = mutedByPlayer;
        });
    },
    play() {
      shouldBePlaying = true;
      // play() is refused if the browser blocks audio; the game carries on silently.
      audio.play().catch(() => {});
    },
    pause() {
      shouldBePlaying = false;
      audio.pause();
    },
    isMuted() {
      return mutedByPlayer;
    },
    // False until the browser has let the track start (it needs a click or key press).
    isPlaying() {
      return !audio.paused;
    },
    toggleMuted() {
      mutedByPlayer = !mutedByPlayer;
      audio.muted = mutedByPlayer || isPriming;
      saveMuted(mutedByPlayer);
      return mutedByPlayer;
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
