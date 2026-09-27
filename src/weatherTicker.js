// TV-style weather ticker along the bottom of the game screen. It has two modes:
// a scrolling "roundup" of current conditions, and short breaking alerts that
// interrupt it. main.js supplies the content; this module handles timing and display.

export const TICKER_LEVELS = {
  alert: { tag: 'WEATHER ALERT', priority: 1 },
  flood: { tag: 'FLOOD WARNING', priority: 2 },
  closed: { tag: 'ROAD CLOSED', priority: 3 },
  breaking: { tag: 'BREAKING', priority: 4 },
};

const CRAWL_SPEED = 90; // CSS pixels per second
const CRAWL_SEPARATOR = '   •   ';
const ALERT_SECONDS = 4.5;
const ALERT_SCROLL_DELAY = 1; // seconds a long alert holds still before scrolling
const ALERT_END_HOLD = 1.2; // seconds it holds at the end of its scroll
const MAX_QUEUED_ALERTS = 4;
const MAX_ALERT_WAIT = 8; // queued alerts older than this are stale and dropped
const REDUCED_MOTION_ITEM_SECONDS = 4;

export function createWeatherTicker({ root, tag, window: textWindow, text, announcer }) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let roundupLevel = 'alert';
  let roundupItems = [];
  let pendingRoundupItems = null;
  let currentAlert = null;
  let alertTimeLeft = 0;
  let alertElapsed = 0;
  let alertScrollDistance = 0;
  let alertQueue = [];
  let crawlOffset = 0;
  let crawlWidth = 0;
  let reducedMotionIndex = 0;
  let reducedMotionTimer = 0;

  function setLevel(level, tagText = TICKER_LEVELS[level].tag) {
    root.dataset.level = level;
    tag.textContent = tagText;
  }

  function setTextOffset(offset) {
    text.style.transform = `translateX(${offset}px)`;
  }

  function startCrawl() {
    if (pendingRoundupItems) {
      roundupItems = pendingRoundupItems;
      pendingRoundupItems = null;
    }
    root.classList.remove('is-alert');
    setLevel(roundupLevel);

    if (reducedMotion.matches) {
      reducedMotionIndex %= Math.max(1, roundupItems.length);
      text.textContent = roundupItems[reducedMotionIndex] ?? '';
      reducedMotionTimer = REDUCED_MOTION_ITEM_SECONDS;
      setTextOffset(0);
      return;
    }

    text.textContent = roundupItems.join(CRAWL_SEPARATOR);
    crawlWidth = text.offsetWidth;
    crawlOffset = textWindow.clientWidth;
    setTextOffset(crawlOffset);
  }

  // Alerts too long for the window scroll once to reveal the rest, and stay up
  // long enough to finish.
  function showAlert(alert) {
    currentAlert = alert;
    root.classList.add('is-alert');
    setLevel(alert.level);
    text.textContent = alert.message;
    setTextOffset(0);
    alertElapsed = 0;
    alertScrollDistance = Math.max(0, text.offsetWidth - textWindow.clientWidth);
    alertTimeLeft = Math.max(
      ALERT_SECONDS,
      ALERT_SCROLL_DELAY + alertScrollDistance / CRAWL_SPEED + ALERT_END_HOLD,
    );
    announcer.textContent = `${TICKER_LEVELS[alert.level].tag}: ${alert.message}`;
    // Breaking news makes anything still waiting out of date.
    if (alert.level === 'breaking') alertQueue = [];
  }

  function showNextAlertOrCrawl() {
    currentAlert = null;
    alertQueue = alertQueue.filter((alert) => alert.waited <= MAX_ALERT_WAIT);
    if (alertQueue.length > 0) showAlert(alertQueue.shift());
    else startCrawl();
  }

  return {
    show() {
      if (visible) return;
      visible = true;
      root.classList.add('is-visible');
      root.setAttribute('aria-hidden', 'false');
      if (!currentAlert) startCrawl();
    },

    reset() {
      visible = false;
      currentAlert = null;
      alertQueue = [];
      roundupItems = [];
      pendingRoundupItems = null;
      root.classList.remove('is-visible', 'is-alert');
      root.setAttribute('aria-hidden', 'true');
      text.textContent = '';
      announcer.textContent = '';
    },

    // New roundup content takes effect when the current crawl finishes, so the
    // text never jumps mid-scroll.
    setRoundup(items, level) {
      roundupLevel = level;
      if (!currentAlert) setLevel(level);
      if (roundupItems.length === 0) roundupItems = items;
      else pendingRoundupItems = items;
    },

    // Higher-priority alerts cut in immediately; others wait their turn.
    alert(level, message) {
      const alert = { level, message, priority: TICKER_LEVELS[level].priority, waited: 0 };
      if (!visible) this.show();
      if (!currentAlert || alert.priority > currentAlert.priority) {
        showAlert(alert);
        return;
      }
      alertQueue.push(alert);
      alertQueue.sort((first, second) => second.priority - first.priority);
      alertQueue = alertQueue.slice(0, MAX_QUEUED_ALERTS);
    },

    // Driven by game time, so the ticker freezes while the game is paused.
    update(deltaTime) {
      if (!visible) return;

      for (const alert of alertQueue) alert.waited += deltaTime;

      if (currentAlert) {
        alertTimeLeft -= deltaTime;
        alertElapsed += deltaTime;
        if (alertTimeLeft <= 0) {
          showNextAlertOrCrawl();
          return;
        }
        if (alertScrollDistance > 0) {
          const scrolled = Math.max(0, (alertElapsed - ALERT_SCROLL_DELAY) * CRAWL_SPEED);
          setTextOffset(-Math.min(alertScrollDistance, scrolled));
        }
        return;
      }

      if (reducedMotion.matches) {
        reducedMotionTimer -= deltaTime;
        if (reducedMotionTimer > 0) return;
        reducedMotionIndex += 1;
        startCrawl();
        return;
      }

      crawlOffset -= CRAWL_SPEED * deltaTime;
      if (crawlOffset < -crawlWidth) startCrawl();
      else setTextOffset(crawlOffset);
    },

    // Height in CSS pixels while shown (0 when hidden), so the game can keep
    // its edge-of-screen arrows clear of the ticker.
    getVisibleHeight() {
      return visible ? root.offsetHeight : 0;
    },
  };
}
