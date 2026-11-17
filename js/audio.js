// Small synthesised sound kit (no audio files to download).
let ctx = null;
let master = null;
let musicGain = null;
let muted = false;
let musicTimer = null;

function ensure() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(ctx.destination);
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.16;
  musicGain.connect(master);
  return ctx;
}

export function unlock() {
  const c = ensure();
  if (c && c.state === "suspended") c.resume();
}

export function setMuted(value) {
  muted = value;
  if (master) master.gain.setTargetAtTime(muted ? 0 : 0.55, ctx.currentTime, 0.05);
}
export const isMuted = () => muted;

function tone(freq, start, dur, { type = "sine", vol = 0.3, attack = 0.005, dest = null, detune = 0 } = {}) {
  const c = ensure();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = detune;
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g);
  g.connect(dest || master);
  o.start(start);
  o.stop(start + dur + 0.05);
}

function noise(start, dur, { vol = 0.2, freq = 6000, q = 1 } = {}) {
  const c = ensure();
  if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = q;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(start);
}

const now = () => (ensure() ? ctx.currentTime : 0);

export const sfx = {
  bells() {
    const t = now();
    [0, 0.09, 0.18, 0.27, 0.36].forEach((d, i) => {
      noise(t + d, 0.12, { vol: 0.16, freq: 7000 + i * 500, q: 6 });
      tone(2400 + (i % 2) * 300, t + d, 0.25, { vol: 0.05, type: "triangle" });
    });
  },
  chime() {
    const t = now();
    [1046.5, 1318.5, 1568].forEach((f, i) => tone(f, t + i * 0.07, 0.6, { vol: 0.16, type: "sine" }));
  },
  sparkle() {
    const t = now();
    for (let i = 0; i < 6; i++) tone(1800 + Math.random() * 1600, t + i * 0.035, 0.25, { vol: 0.06, type: "triangle" });
  },
  wrong() {
    const t = now();
    tone(196, t, 0.22, { vol: 0.22, type: "square" });
    tone(165, t + 0.1, 0.28, { vol: 0.18, type: "square" });
  },
  pop() {
    const t = now();
    tone(660, t, 0.09, { vol: 0.16, type: "triangle" });
    tone(990, t + 0.03, 0.1, { vol: 0.1, type: "sine" });
  },
  snap() {
    const t = now();
    tone(1400, t, 0.06, { vol: 0.12, type: "triangle" });
  },
  whoosh() {
    const t = now();
    const c = ensure();
    if (!c) return;
    const len = Math.floor(c.sampleRate * 0.6);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    f.frequency.setValueAtTime(400, t);
    f.frequency.exponentialRampToValueAtTime(3000, t + 0.5);
    const g = c.createGain();
    g.gain.value = 0.35;
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t);
  },
  tick() {
    tone(1200, now(), 0.05, { vol: 0.08, type: "square" });
  },
  fanfare() {
    const t = now();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone(f, t + i * 0.12, 0.5, { vol: 0.14, type: "triangle" });
      tone(f * 2, t + i * 0.12, 0.35, { vol: 0.04, type: "sine" });
    });
    tone(1046.5, t + 0.5, 1.2, { vol: 0.12, type: "triangle" });
    tone(1318.5, t + 0.5, 1.2, { vol: 0.08, type: "sine" });
    this.bells();
  },
  count() {
    tone(1500 + Math.random() * 300, now(), 0.05, { vol: 0.05, type: "triangle" });
  },
};

// Gentle original music-box loop (built from notes, so no file is needed).
const MELODY = [
  [76, 1], [79, 1], [84, 2], [83, 1], [79, 1], [76, 2], [74, 1], [76, 1], [79, 2], [72, 2],
  [76, 1], [79, 1], [84, 2], [86, 1], [84, 1], [83, 2], [79, 1], [81, 1], [79, 2], [76, 2],
];
const BASS = [48, 52, 55, 52, 53, 57, 55, 52];
const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function startMusic() {
  const c = ensure();
  if (!c || musicTimer) return;
  const beat = 0.42;
  const barLen = MELODY.reduce((a, [, d]) => a + d, 0) * beat;
  let next = c.currentTime + 0.2;
  const schedule = () => {
    while (next < c.currentTime + 1.5) {
      let t = next;
      MELODY.forEach(([n, d]) => {
        tone(midi(n), t, d * beat * 1.6, { vol: 0.09, type: "triangle", dest: musicGain });
        tone(midi(n + 12), t, d * beat * 0.8, { vol: 0.025, type: "sine", dest: musicGain });
        t += d * beat;
      });
      BASS.forEach((n, i) => tone(midi(n), next + i * (barLen / BASS.length), barLen / BASS.length, { vol: 0.07, type: "sine", dest: musicGain, attack: 0.05 }));
      next += barLen;
    }
  };
  schedule();
  musicTimer = setInterval(schedule, 500);
}

export function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}
