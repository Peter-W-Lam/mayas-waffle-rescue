// Online leaderboard, stored in a Supabase table called `scores`.
// The URL and publishable key are meant to be public: the table's own rules (row-level
// security plus checks on name length, message length and score) decide what visitors
// can do, which is read every score and add new ones. Edit or delete entries from the
// Supabase dashboard (Table Editor → scores).
// Every call gives up after a few seconds and throws, so callers can show a gentle
// "unavailable" message and the game carries on.
const SUPABASE_URL = 'https://oxcgzeyvdgnbhmxmtoim.supabase.co';
const SUPABASE_KEY = 'sb_publishable_sl_u9t-XbpEm4L1oeItdrw_HzWF5Jwh';
const SCORES_URL = `${SUPABASE_URL}/rest/v1/scores`;
const REQUEST_TIMEOUT_MS = 5000;

export const NAME_MAX_LENGTH = 20;
export const MESSAGE_MAX_LENGTH = 80;

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { apikey: SUPABASE_KEY, ...options.headers },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Leaderboard request failed: HTTP ${response.status}`);
  return response;
}

// Highest scores first; ties go to whoever got there first.
export async function fetchTopScores(limit = 10) {
  const query = new URLSearchParams({
    select: 'id,name,message,score,level',
    order: 'score.desc,created_at.asc',
    limit: String(limit),
  });
  const response = await request(`${SCORES_URL}?${query}`);
  return response.json();
}

// Saves one run and returns the saved row (with its id, so the list can highlight it).
export async function submitScore({ name, message, score, level }) {
  const response = await request(`${SCORES_URL}?select=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({
      name: name.trim().slice(0, NAME_MAX_LENGTH),
      message: message.trim().slice(0, MESSAGE_MAX_LENGTH),
      score,
      level,
    }),
  });
  const [row] = await response.json();
  return row;
}

// Leaderboard position for a score: 1 + how many scores are higher.
export async function fetchRank(score) {
  const response = await request(`${SCORES_URL}?select=id&score=gt.${Math.floor(score)}`, {
    method: 'HEAD',
    headers: { Prefer: 'count=exact' },
  });
  const total = Number(response.headers.get('content-range')?.split('/')[1]);
  return Number.isFinite(total) ? total + 1 : null;
}
