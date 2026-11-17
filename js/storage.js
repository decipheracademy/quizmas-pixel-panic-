// First-attempt lock and score saving (Google Sheet via Apps Script), with an offline queue.
const CFG = window.DR_CONFIG;
const QUEUE_KEY = `qz_queue_${CFG.GAME_ID}`;

const safe = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked: ignore */ } },
};

export const normaliseId = (id) => id.trim().toUpperCase().replace(/\s+/g, "");
const attemptKey = (id) => `qz_attempts_${CFG.GAME_ID}_${normaliseId(id)}`;

export const attemptsSoFar = (id) => safe.get(attemptKey(id), 0);
export function registerAttempt(id) {
  const n = attemptsSoFar(id) + 1;
  safe.set(attemptKey(id), n);
  return n;
}

export async function saveResult(record) {
  const queue = safe.get(QUEUE_KEY, []);
  queue.push(record);
  safe.set(QUEUE_KEY, queue);
  return flush();
}

// Sends everything waiting in the queue. Returns "sent", "queued" or "offline".
export async function flush() {
  const queue = safe.get(QUEUE_KEY, []);
  if (!queue.length) return "sent";
  if (!CFG.SHEETS_URL) return "queued";
  if (!navigator.onLine) return "offline";
  const remaining = [];
  for (const rec of queue) {
    try {
      await fetch(CFG.SHEETS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(rec),
      });
    } catch {
      remaining.push(rec);
    }
  }
  safe.set(QUEUE_KEY, remaining);
  return remaining.length ? "offline" : "sent";
}

window.addEventListener("online", () => flush());
