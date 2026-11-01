// A floating thumbstick for phones and tablets. Put a finger down anywhere on the map and
// the stick appears under it; drag to walk, lift to stop. Its direction snaps to the same
// eight directions as the arrow keys, so road-following and corner help work the same
// way as on a keyboard. Mouse input is ignored, so desktop play is unchanged.

const DEAD_ZONE = 12; // CSS pixels the finger moves before the hero starts walking
const STICK_RADIUS = 44; // how far the knob travels from the centre
// Past this distance the stick's centre slides after the finger, so changing direction
// never needs a long drag back.
const FOLLOW_DISTANCE = STICK_RADIUS * 1.4;

// Index = 45° sector, starting east and going clockwise (screen y points down).
const DIRECTIONS = [
  { horizontal: 1, vertical: 0 },
  { horizontal: 1, vertical: 1 },
  { horizontal: 0, vertical: 1 },
  { horizontal: -1, vertical: 1 },
  { horizontal: -1, vertical: 0 },
  { horizontal: -1, vertical: -1 },
  { horizontal: 0, vertical: -1 },
  { horizontal: 1, vertical: -1 },
];
const STILL = { horizontal: 0, vertical: 0 };

// surface: the element touches start on. stick / knob: the elements drawn under the
// finger, positioned inside surface's offset parent. canUse: whether the hero can move now.
export function createTouchStick({ surface, stick, knob, canUse }) {
  let pointerId = null;
  let originX = 0;
  let originY = 0;
  let direction = STILL;

  function toLocal(event) {
    const box = surface.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  function show(knobX, knobY) {
    stick.hidden = false;
    stick.style.transform = `translate(${originX}px, ${originY}px)`;
    knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
  }

  function release() {
    if (pointerId !== null && surface.hasPointerCapture?.(pointerId)) surface.releasePointerCapture(pointerId);
    pointerId = null;
    direction = STILL;
    stick.hidden = true;
  }

  surface.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' || pointerId !== null || !canUse()) return;
    event.preventDefault();
    pointerId = event.pointerId;
    try {
      // Keeps the drag ours if the finger slides over a button or off the map.
      surface.setPointerCapture(pointerId);
    } catch {
      // Capture can fail for an unusual pointer; the stick still works without it.
    }
    ({ x: originX, y: originY } = toLocal(event));
    direction = STILL;
    show(0, 0);
  });

  surface.addEventListener('pointermove', (event) => {
    if (event.pointerId !== pointerId) return;
    event.preventDefault();
    if (!canUse()) {
      direction = STILL;
      return;
    }
    const { x, y } = toLocal(event);
    let deltaX = x - originX;
    let deltaY = y - originY;
    let distance = Math.hypot(deltaX, deltaY);

    if (distance > FOLLOW_DISTANCE) {
      const pull = (distance - FOLLOW_DISTANCE) / distance;
      originX += deltaX * pull;
      originY += deltaY * pull;
      deltaX = x - originX;
      deltaY = y - originY;
      distance = FOLLOW_DISTANCE;
    }

    if (distance < DEAD_ZONE) {
      direction = STILL;
    } else {
      const sector = Math.round(Math.atan2(deltaY, deltaX) / (Math.PI / 4));
      direction = DIRECTIONS[((sector % 8) + 8) % 8];
    }
    const knobScale = Math.min(1, STICK_RADIUS / Math.max(distance, 1));
    show(deltaX * knobScale, deltaY * knobScale);
  });

  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    surface.addEventListener(type, (event) => {
      if (event.pointerId === pointerId) release();
    });
  }
  window.addEventListener('blur', release);

  return {
    // { horizontal, vertical }, each -1, 0 or 1.
    getDirection: () => (canUse() ? direction : STILL),
    release,
  };
}
