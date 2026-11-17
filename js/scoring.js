// Objective scoring for Pixel Panic. Five areas × 20 points = 100.
import { ITEMS } from "./art.js";
import { W, PALETTES, BODY_FONT_SCORE, INFO_ICONS, overlapArea, outsideArea, contrast } from "./poster.js";

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const r1 = (v) => Math.round(v * 10) / 10;

// 1. Fonts: heading font suits the brief (12) + body font is readable (8).
export function fontScore(state) {
  const h = state.headingFont ? state.brief.headingFit[state.headingFont][0] : 0;
  const b = state.bodyFont ? BODY_FONT_SCORE[state.bodyFont] : 0;
  return { heading: h, body: b, score: h + b };
}

// 2. Hierarchy: order (8) + heading clearly biggest (4) + subheading bigger than body (4) + body readable (4).
export function hierarchyScore(order, sizes) {
  let order8 = 0;
  if (order[0] === "heading") order8 += 4;
  if (order.indexOf("sub") < order.indexOf("body")) order8 += 4;
  const ratio = sizes.heading / sizes.sub;
  const head4 = ratio >= 1.4 ? 4 : ratio >= 1.15 ? 2 : 0;
  const sub4 = sizes.sub > sizes.body + 1 ? 4 : 0;
  const body4 = sizes.body >= 18 && sizes.body <= 32 ? 4 : sizes.body >= 15 && sizes.body <= 40 ? 2 : 0;
  return { order: order8, heading: head4, sub: sub4, body: body4, score: order8 + head4 + sub4 + body4 };
}

// 3. Colours: readability by measured contrast (12) + fits the brief's mood (8).
export function readability(key) {
  const p = PALETTES[key];
  const worst = Math.min(contrast(p.heading, p.bg), contrast(p.text, p.bg), contrast(p.sub, p.bg));
  return { ratio: worst, pts: worst >= 4.5 ? 12 : worst >= 3 ? 7 : 2, pct: clamp((worst - 1) / 8, 0, 1) * 100 };
}
export function colourScore(state) {
  if (!state.palette || state.palette === "draft") return { read: 0, mood: 0, score: 0 };
  const read = readability(state.palette).pts;
  const mood = state.brief.paletteFit[state.palette];
  return { read, mood, score: read + mood };
}
export function colourWheelNote(key) {
  const [a, b] = PALETTES[key].hues;
  if (a === null || a === undefined) return "A neutral colour with one bright colour: simple and strong.";
  const d = Math.abs(a - b) % 360;
  const diff = Math.min(d, 360 - d);
  return diff > 150 ? "Complementary colours: opposite on the colour wheel, so they really stand out." : "Neighbouring colours: calm and gentle together.";
}

// 4. Images and icons: relevant main image (10) + relevant icons (6) + information icons (4) − 5 per off-topic item.
export function relevanceScore(state) {
  const keys = state.items.map((i) => i.key);
  const rel = state.brief.relevant;
  const hasImage = keys.some((k) => rel.images.includes(k));
  const relIcons = new Set(keys.filter((k) => rel.icons.includes(k))).size;
  const infoIcons = new Set(keys.filter((k) => INFO_ICONS.includes(k))).size;
  const offTopic = keys.filter((k) => state.brief.irrelevant.includes(k));
  const raw = (hasImage ? 10 : 0) + Math.min(2, relIcons) * 3 + Math.min(2, infoIcons) * 2 - offTopic.length * 5;
  return { hasImage, relIcons, infoIcons, offTopic, score: clamp(raw, 0, 20) };
}

// 5. Arrangement and readability: no overlaps (8), inside margins (4), heading at top (4), text lined up (2), not cluttered (2).
export function arrangementScore(state) {
  const texts = ["heading", "sub", "body", "info"].map((id) => state.els[id]);
  const solid = state.items.filter((i) => ITEMS[i.key].kind !== "shape"); // shapes may sit behind text as backgrounds
  const all = [...texts, ...solid];
  let area = 0;
  for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) area += overlapArea(all[i], all[j]);
  const overlap = 8 * clamp(1 - area / 15000, 0, 1);
  let out = 0;
  for (const e of [...texts, ...state.items]) out += outsideArea(e);
  const margins = 4 * clamp(1 - out / 10000, 0, 1);
  const heading = state.els.heading;
  const topMost = texts.every((t) => t === heading || heading.y <= t.y + 2);
  const head = topMost ? (heading.y <= 170 ? 4 : 2) : 0;
  const centreDev = Math.max(...texts.map((t) => Math.abs(t.x + t.w / 2 - W / 2)));
  const lefts = texts.map((t) => t.x);
  const dev = Math.min(centreDev, Math.max(...lefts) - Math.min(...lefts));
  const align = 2 * clamp(1 - Math.max(0, dev - 14) / 60, 0, 1);
  const n = state.items.length;
  const clutter = n <= 6 ? 2 : n <= 8 ? 1 : 0;
  // The game stacks the text itself, so arrangement only counts once the student has built the poster.
  if (!state.items.some((i) => ITEMS[i.key].kind !== "shape")) {
    return { overlap: 0, margins: 0, heading: 0, align: 0, clutter: 0, overlapArea: 0, score: 0, empty: true };
  }
  return { overlap: r1(overlap), margins: r1(margins), heading: head, align: r1(align), clutter, overlapArea: Math.round(area), score: r1(overlap + margins + head + align + clutter) };
}

export function level(score) {
  if (score >= 90) return "Poster Superstar";
  if (score >= 75) return "Design Pro";
  if (score >= 55) return "Rising Designer";
  if (score >= 35) return "Junior Designer";
  return "Keep Creating";
}

const FEEDBACK = {
  fonts: ["Great font choices: your heading font suits the poster and the body text is easy to read.", "Pick a heading font that matches the event's mood, and a simple serif or sans-serif font for body text."],
  hierarchy: ["Excellent hierarchy: your heading stands out, then the subheading, then the body text.", "Work on making your main heading stand out more clearly. Make it the biggest and put it first."],
  colours: ["Great choice of colours! They are easy to read and match the mood.", "Choose colours with strong contrast that match the mood of the event."],
  images: ["Smart picture choices: everything on your poster matches the brief.", "Only use images and icons that match the event. A calendar or location icon helps people find the details."],
  arrangement: ["Lovely arrangement: nothing overlaps and everything is easy to read.", "Leave space between items and keep everything inside the edges so nothing covers your text."],
};
export function feedback(parts) {
  const entries = Object.entries(parts).sort((a, b) => b[1] - a[1]);
  const [bestKey, bestVal] = entries[0];
  const [worstKey, worstVal] = entries[entries.length - 1];
  const good = bestVal >= 0.5 ? FEEDBACK[bestKey][0] : "You took on Pixel's poster challenge. Every great designer starts with a first try!";
  const work = worstVal >= 0.95 ? "Brilliant work! Keep practising to design even faster." : FEEDBACK[worstKey === bestKey ? entries[entries.length - 2][0] : worstKey][1];
  return { good, work };
}
