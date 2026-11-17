// Poster model, design briefs and rendering. Poster space is 600 × 800 "design units".
import { ITEMS } from "./art.js";

export const W = 600, H = 800, MARGIN = 24;
export const TEXT_IDS = ["heading", "sub", "body", "info"];
export const TEXT_W = { heading: 540, sub: 500, body: 470, info: 440 };

// ---- fonts the student chooses from ----
export const HEADING_FONTS = [
  { key: "playfair", label: "Playfair Display", cat: "Serif", family: "'Playfair Display', Georgia, serif", weight: 800 },
  { key: "poppins", label: "Poppins", cat: "Sans-serif", family: "Poppins, Arial, sans-serif", weight: 800 },
  { key: "bungee", label: "Bungee", cat: "Display", family: "Bungee, Impact, sans-serif", weight: 400 },
  { key: "pacifico", label: "Pacifico", cat: "Display", family: "Pacifico, 'Brush Script MT', cursive", weight: 400 },
  { key: "creepster", label: "Creepster", cat: "Display", family: "Creepster, fantasy", weight: 400 },
];
export const BODY_FONTS = [
  { key: "merriweather", label: "Merriweather", cat: "Serif", family: "Merriweather, Georgia, serif", weight: 400 },
  { key: "nunito", label: "Nunito", cat: "Sans-serif", family: "Nunito, Arial, sans-serif", weight: 700 },
  { key: "pacifico", label: "Pacifico", cat: "Display", family: "Pacifico, cursive", weight: 400 },
  { key: "bungee", label: "Bungee", cat: "Display", family: "Bungee, Impact, sans-serif", weight: 400 },
];
export const BODY_FONT_SCORE = { merriweather: 8, nunito: 8, pacifico: 1, bungee: 2 };
const DRAFT_FONT = { family: "'Courier New', monospace", weight: 400 };

// ---- colour combinations (from the brief) ----
export const PALETTES = {
  draft: { name: "Draft", bg: "#f4f4f4", heading: "#7d7d7d", sub: "#8e8e8e", text: "#8e8e8e", accent: "#9e9e9e", hues: [] },
  blueYellow: { name: "Blue & Yellow", bg: "#0b3d91", heading: "#ffd23f", sub: "#ffffff", text: "#ffffff", accent: "#ffd23f", hues: [220, 48] },
  blackGold: { name: "Black & Gold", bg: "#141414", heading: "#e8b923", sub: "#f5e6b3", text: "#ffffff", accent: "#e8b923", hues: [null, 45] },
  pinkWhite: { name: "Pink & White", bg: "#ffffff", heading: "#d81b60", sub: "#ad1457", text: "#880e4f", accent: "#f06292", hues: [null, 335] },
  redBlack: { name: "Red & Black", bg: "#111111", heading: "#e53935", sub: "#ff8a80", text: "#e53935", accent: "#e53935", hues: [null, 2] },
};
export const PALETTE_CHOICES = ["blueYellow", "blackGold", "pinkWhite", "redBlack"];

// ---- the three design briefs (one is given at random) ----
export const BRIEFS = [
  {
    key: "science",
    client: "Mrs Bello, Science Club",
    task: "Create a poster for the School Science Fair.",
    title: "SCHOOL SCIENCE FAIR",
    sub: "Discover · Experiment · Invent",
    body: "See amazing experiments and inventions made by our students. Parents are welcome!",
    info: ["Friday, 11 December · 10:00 AM", "School Hall"],
    mood: "Exciting and curious",
    audience: "Students and parents",
    headingFit: { playfair: [6, "elegant, but a bit formal for a science fair"], poppins: [12, "bold and clean, easy to read"], bungee: [12, "bold and techy, perfect for science"], pacifico: [5, "curly and sweet, not very scientific"], creepster: [0, "spooky and hard to read"] },
    paletteFit: { blueYellow: 8, blackGold: 5, pinkWhite: 2, redBlack: 3 },
    relevant: { images: ["microscope", "rocket", "robot"], icons: ["atom", "flask", "bulb"] },
    irrelevant: ["cupcake", "gingerbread", "cocoa", "soccer", "guitar"],
  },
  {
    key: "bake",
    client: "Mr Okon, Parents' Committee",
    task: "Create a poster for the Christmas Bake Sale.",
    title: "CHRISTMAS BAKE SALE",
    sub: "Cakes · Cookies · Cocoa",
    body: "Buy delicious homemade treats baked by our students. Every naira supports the school library!",
    info: ["Saturday, 12 December · 9:00 AM", "School Canteen"],
    mood: "Warm and sweet",
    audience: "Students, parents and teachers",
    headingFit: { playfair: [10, "elegant and warm"], poppins: [9, "clear and friendly"], bungee: [6, "very loud for a sweet bake sale"], pacifico: [12, "sweet and friendly, perfect for baking"], creepster: [0, "spooky and hard to read"] },
    paletteFit: { pinkWhite: 8, blackGold: 5, blueYellow: 4, redBlack: 2 },
    relevant: { images: ["cupcake", "gingerbread", "cocoa"], icons: ["heart", "star"] },
    irrelevant: ["microscope", "rocket", "robot", "laptop", "soccer", "guitar", "atom", "flask", "code"],
  },
  {
    key: "coding",
    client: "Miss Eze, Coding Club",
    task: "Create a poster for the Coding Club Showcase.",
    title: "CODING CLUB SHOWCASE",
    sub: "Games · Apps · Robots",
    body: "Play games and try apps built by our young coders. Bring your friends and family!",
    info: ["Thursday, 10 December · 2:00 PM", "ICT Lab"],
    mood: "Bold and modern",
    audience: "Students and families",
    headingFit: { playfair: [5, "classic, but not very modern"], poppins: [12, "modern and clean"], bungee: [12, "bold and techy, great for coding"], pacifico: [3, "curly script feels old-fashioned for tech"], creepster: [0, "spooky and hard to read"] },
    paletteFit: { blackGold: 8, blueYellow: 7, redBlack: 4, pinkWhite: 2 },
    relevant: { images: ["laptop", "robot", "rocket"], icons: ["code", "bulb"] },
    irrelevant: ["cupcake", "gingerbread", "cocoa", "soccer", "guitar", "microscope", "flask"],
  },
];
export const INFO_ICONS = ["calendar", "pin", "clock"];
export const ITEM_SIZE = { image: 190, icon: 84, shape: 170 };

export function makeState(brief) {
  return {
    brief,
    headingFont: null, bodyFont: null, palette: "draft",
    sizes: { heading: 60, sub: 26, body: 22, info: 22 },
    els: Object.fromEntries(TEXT_IDS.map((id) => [id, { id, x: (W - TEXT_W[id]) / 2, y: 0, w: TEXT_W[id], h: 60 }])),
    items: [],
    showInfo: false,
  };
}
export function cloneState(s) {
  return { ...s, sizes: { ...s.sizes }, els: Object.fromEntries(Object.entries(s.els).map(([k, v]) => [k, { ...v }])), items: s.items.map((i) => ({ ...i })) };
}

export const fontOf = (list, key) => list.find((f) => f.key === key);

// Render the poster into a container; measures text heights back into the state.
export function renderPoster(container, state, { editing = false, textIds = null, ranks = null } = {}) {
  const p = PALETTES[state.palette];
  const hf = state.headingFont ? fontOf(HEADING_FONTS, state.headingFont) : DRAFT_FONT;
  const bf = state.bodyFont ? fontOf(BODY_FONTS, state.bodyFont) : DRAFT_FONT;
  container.innerHTML = "";
  const el = document.createElement("div");
  el.className = "poster" + (editing ? " editing" : "");
  el.style.background = p.bg;
  el.style.color = p.accent;
  el.innerHTML = `<div class="safe"></div>`;
  const z = { shape: 2, image: 5, icon: 6 };
  for (const it of state.items) {
    const def = ITEMS[it.key];
    const d = document.createElement("div");
    d.className = "pel item movable " + def.kind;
    d.dataset.uid = it.uid;
    Object.assign(d.style, { left: it.x + "px", top: it.y + "px", width: it.w + "px", height: it.h + "px", zIndex: z[def.kind] });
    d.innerHTML = def.svg;
    el.appendChild(d);
  }
  const ids = textIds || (state.showInfo ? TEXT_IDS : ["heading", "sub", "body"]);
  const content = { heading: state.brief.title, sub: state.brief.sub, body: state.brief.body, info: state.brief.info.map((l) => `<span>${l}</span>`).join("") };
  for (const id of ids) {
    const e = state.els[id];
    const d = document.createElement("div");
    d.className = `pel text movable ${id}`;
    d.dataset.id = id;
    const font = id === "heading" ? hf : bf;
    const colour = id === "heading" ? p.heading : id === "sub" ? p.sub : p.text;
    Object.assign(d.style, {
      left: e.x + "px", top: e.y + "px", width: e.w + "px", zIndex: 10,
      fontFamily: font.family, fontWeight: font.weight, fontSize: state.sizes[id] + "px", color: colour,
    });
    d.innerHTML = content[id];
    if (ranks && ranks[id]) d.insertAdjacentHTML("beforeend", `<b class="rank">${ranks[id]}</b>`);
    el.appendChild(d);
  }
  container.appendChild(el);
  for (const id of ids) state.els[id].h = el.querySelector(`.pel.text.${id}`).offsetHeight;
  return el;
}

// Stack text blocks top to bottom in the given order, centred, with even gaps.
export function stackTexts(state, order, top = 40, gap = 26) {
  let y = top;
  for (const id of order) {
    const e = state.els[id];
    e.x = (W - e.w) / 2;
    e.y = Math.round(y);
    y += e.h + gap;
  }
}

export function fitPoster(holder, poster, maxW, maxH) {
  const s = Math.min(maxW / W, maxH / H);
  holder.style.width = W * s + "px";
  holder.style.height = H * s + "px";
  poster.style.transform = `scale(${s})`;
  return s;
}
export function fitInside(container, poster) {
  const cw = container.clientWidth, ch = container.clientHeight;
  const s = Math.min(cw / W, ch / H);
  poster.style.transform = `translate(${(cw - W * s) / 2}px, ${(ch - H * s) / 2}px) scale(${s})`;
  return s;
}

// ---- measurements ----
export function overlapArea(a, b) {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h : 0;
}
export function outsideArea(e) {
  const inner = { x: MARGIN, y: MARGIN, w: W - MARGIN * 2, h: H - MARGIN * 2 };
  return e.w * e.h - overlapArea(e, inner);
}
function rgb(hex) { const h = hex.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)); }
export function luminance(hex) {
  const [r, g, b] = rgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
