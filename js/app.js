// Pixel Panic: The Perfect Poster Challenge. Main game flow.
import { startSnow } from "./snow.js";
import { elfSVG, ITEMS, TRAY } from "./art.js";
import * as audio from "./audio.js";
import {
  W, H, BRIEFS, HEADING_FONTS, BODY_FONTS, PALETTES, PALETTE_CHOICES, ITEM_SIZE, TEXT_IDS,
  makeState, cloneState, renderPoster, stackTexts, fitPoster, fitInside, fontOf,
} from "./poster.js";
import { fontScore, hierarchyScore, colourScore, readability, colourWheelNote, relevanceScore, arrangementScore, level, feedback } from "./scoring.js";
import { attemptsSoFar, registerAttempt, saveResult, flush, normaliseId } from "./storage.js";
import { burst, confetti, makeBadge } from "./fx.js";

const CFG = window.PP_CONFIG;
const PARAMS = new URLSearchParams(location.search);
if (PARAMS.get("fast") === "1") CFG.CHALLENGE_TIME = { 1: 4, 2: 4, 3: 4, 4: 4 };
const gsap = window.gsap;
const $ = (id) => document.getElementById(id);
const sfx = audio.sfx;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const S = {
  player: null, attempt: 0, official: false, briefIndex: -1,
  st: null, posterEl: null, scale: 1, scores: {}, times: {}, startedAt: 0, order: null, result: null,
};
window.__PP = S; // used by automated tests

// ---------------------------------------------------------------- basics
let current = "loader";
function show(id) {
  const from = $(current), to = $(id);
  if (from === to) return;
  gsap.to(from, { opacity: 0, duration: 0.25, onComplete: () => { from.classList.remove("active"); from.style.opacity = ""; } });
  to.classList.add("active");
  gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 0.35, delay: 0.15 });
  current = id;
}
let toastTimer = null;
function toast(msg, bad = false, ms = 2200) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.toggle("bad", bad);
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), ms);
}
function mountElf(el, mood = "happy") { el.classList.add("elf"); el.innerHTML = elfSVG(mood); }
function elfReact(mood, line) {
  if (!CFG.SHOW_ELF) return;
  const el = $("elfMini");
  mountElf(el, mood === "panic" ? "panic" : "happy");
  el.classList.remove("panic", "cheer");
  void el.offsetWidth;
  if (mood === "panic" || mood === "cheer") el.classList.add(mood);
  if (line) {
    const b = $("elfSays");
    b.textContent = line;
    b.hidden = false;
    gsap.fromTo(b, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" });
  }
}
const LINES = {
  pick: ["Ooh, nice!", "Let's see how that looks…", "Hmm, interesting choice!", "Looking good!"],
  move: ["That's better!", "Keep going!", "Nearly there!", "Ooh, I like it!"],
  add: ["Nice touch!", "Let's add that!", "Ooh, fancy!"],
};

// ---------------------------------------------------------------- loader
const TIPS = [
  "Tip: Use a bold font for headings and a simple font for body text.",
  "Tip: The heading should be the biggest text on a poster.",
  "Tip: Colours opposite each other on the colour wheel stand out together.",
  "Tip: Only use pictures that match your message.",
  "Tip: Leave some empty space so the poster can breathe.",
];
const STATUS = ["Sharpening the pencils…", "Mixing the paints…", "Hanging the fairy lights…", "Waking up Pixel…", "Almost ready…"];
async function runLoader() {
  const grid = document.querySelector(".pixel-grid");
  const colours = ["#ffffff", "#4fc3f7", "#f6c453", "#ffffff", "#0b2f6b", "#4fc3f7"];
  grid.innerHTML = Array.from({ length: 36 }, (_, i) => `<i style="background:${colours[(i * 7) % colours.length]};animation-delay:${((i % 6) + Math.floor(i / 6)) * 0.08}s"></i>`).join("");
  const fill = document.querySelector(".loader-fill"), bar = document.querySelector(".loader-bar");
  const start = performance.now();
  let real = 0, mod = null;
  const fonts = ["800 20px 'Baloo 2'", "20px 'Press Start 2P'", "800 20px 'Playfair Display'", "800 20px Poppins", "20px Bungee", "20px Pacifico", "20px Creepster", "20px Merriweather", "700 20px Nunito", "800 20px Nunito"];
  const tasks = [
    Promise.all(fonts.map((f) => document.fonts.load(f).catch(() => {}))),
    import("./globe3d.js").then((m) => { mod = m; }).catch(() => { mod = null; }),
    new Promise((r) => setTimeout(r, 300)),
  ];
  tasks.forEach((p) => p.then(() => { real += 1 / tasks.length; }));
  let tip = 0;
  const tipTimer = setInterval(() => {
    tip = (tip + 1) % TIPS.length;
    const el = $("loaderTip");
    gsap.to(el, { opacity: 0, duration: 0.2, onComplete: () => { el.textContent = TIPS[tip]; gsap.to(el, { opacity: 1, duration: 0.3 }); } });
  }, 2000);
  await new Promise((resolve) => {
    let shown = 0;
    const step = () => {
      const tf = Math.min(1, (performance.now() - start) / CFG.LOADER_MIN_MS);
      const target = Math.min(real, tf);
      shown = Math.min(target, shown + (target - shown) * 0.12 + 0.002);
      const pct = Math.round(shown * 100);
      fill.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", pct);
      $("loaderPct").textContent = pct + "%";
      $("loaderText").textContent = STATUS[Math.min(STATUS.length - 1, Math.floor(shown * STATUS.length))];
      if (shown >= 0.999 && real >= 1 && tf >= 1) return resolve();
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  clearInterval(tipTimer);
  await gsap.to(".loader-card", { scale: 1.08, opacity: 0, duration: 0.45, ease: "power2.in" });
  return mod;
}

// ---------------------------------------------------------------- globe + intro
let globe = null;
function showGlobe(mod) {
  show("globe");
  const reveal = () => {
    $("globeHint").style.display = "none";
    $("intro").style.display = "block";
    gsap.from(".intro .track", { y: 20, opacity: 0, duration: 0.4 });
    gsap.from(".pp-title span", { y: -60, opacity: 0, duration: 0.7, stagger: 0.18, ease: "bounce.out" });
    gsap.from(".pp-sub", { opacity: 0, y: 14, duration: 0.4, delay: 0.5 });
    gsap.from(".intro-card", { y: 40, opacity: 0, duration: 0.5, delay: 0.65, ease: "back.out(1.6)" });
    gsap.from(".how li", { scale: 0, duration: 0.35, stagger: 0.08, delay: 0.9, ease: "back.out(2.5)" });
    audio.startMusic();
  };
  const webgl = (() => { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } })();
  if (mod && webgl && !reduceMotion) {
    globe = mod.createGlobe($("globeStage"), { sfx, onShaken: reveal });
    $("globe").addEventListener("pointerdown", () => { audio.unlock(); globe.shake(); gsap.to("#globeHint", { opacity: 0, duration: 0.3 }); }, { once: true });
  } else {
    $("globeHint").textContent = "";
    reveal();
  }
}

// ---------------------------------------------------------------- entry
function setupEntry() {
  const form = $("entryForm"), err = $("entryError"), note = $("attemptNote"), btn = form.querySelector("button");
  $("quizmasId").addEventListener("input", () => { note.textContent = ""; btn.textContent = "Continue"; });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("playerName").value.trim().replace(/\s+/g, " ");
    const id = normaliseId($("quizmasId").value);
    if (name.length < 2) { err.textContent = "Please enter your name."; $("playerName").focus(); sfx.wrong(); return; }
    if (!/^[A-Z0-9-]{3,20}$/.test(id)) { err.textContent = "Please enter your Quizmas ID (letters, numbers and dashes)."; $("quizmasId").focus(); sfx.wrong(); return; }
    err.textContent = "";
    if (attemptsSoFar(id) > 0 && !note.textContent) {
      note.textContent = "You've already played Pixel Panic, so this round is practice. Your first score stays as your official score.";
      btn.textContent = "Continue (practice)";
      return;
    }
    S.player = { name, id };
    sfx.pop();
    newRound();
  });
}

// ---------------------------------------------------------------- brief
function chooseBrief() {
  const forced = PARAMS.get("b");
  if (forced !== null && BRIEFS[Number(forced)]) { S.briefIndex = Number(forced); return BRIEFS[S.briefIndex]; }
  let i;
  do { i = Math.floor(Math.random() * BRIEFS.length); } while (BRIEFS.length > 1 && i === S.briefIndex);
  S.briefIndex = i;
  return BRIEFS[i];
}
function briefHTML(b, withButton) {
  return `<p class="season">Client: ${b.client}</p>
    <h2>${b.task}</h2>
    <p class="client">Pixel needs it in 5 minutes!</p>
    <div class="brief-grid">
      <div class="wide"><b>The poster must show</b>${b.title} · ${b.info[0]} · ${b.info[1]}</div>
      <div><b>Mood</b>${b.mood}</div>
      <div><b>Audience</b>${b.audience}</div>
    </div>
    ${withButton ? `<button class="btn btn-gold" id="designBtn">Start designing</button>` : ""}`;
}
async function typeText(el, text) {
  el.textContent = "";
  for (const ch of text) { el.textContent += ch; await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 20)); }
}
let briefRun = 0;
function newRound() {
  const before = attemptsSoFar(S.player.id);
  S.attempt = registerAttempt(S.player.id);
  S.official = before === 0;
  const brief = chooseBrief();
  S.st = makeState(brief);
  S.scores = {}; S.times = {}; S.result = null;
  S.startedAt = performance.now();
  show("brief");
  const run = ++briefRun;
  $("briefCard").innerHTML = briefHTML(brief, true);
  $("designBtn").addEventListener("click", () => { briefRun++; sfx.pop(); startGame(); });
  if (!CFG.SHOW_ELF) { $("elfBrief").style.display = "none"; $("briefSpeech").style.display = "none"; return; }
  mountElf($("elfBrief"), "panic");
  $("elfBrief").classList.add("panic");
  gsap.from("#elfBrief", { y: 60, opacity: 0, duration: 0.6, ease: "back.out(1.8)", delay: 0.2 });
  gsap.from("#briefCard", { y: 50, opacity: 0, rotation: 4, duration: 0.6, delay: 0.4, ease: "back.out(1.4)" });
  setTimeout(() => {
    if (run !== briefRun) return;
    typeText($("briefSpeech"), `Help, ${S.player.name.split(" ")[0]}! My ${brief.title.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())} poster is due in 5 minutes and I need a real designer!`);
  }, 500);
}

// ---------------------------------------------------------------- game layout helpers
function draw(opts = {}) {
  S.posterEl = renderPoster($("posterHolder"), S.st, opts);
  layoutPoster();
  return S.posterEl;
}
function layoutPoster() {
  if (!S.posterEl) return;
  const r = $("posterArea").getBoundingClientRect();
  const easelPad = window.innerWidth <= 820 || window.innerWidth / window.innerHeight < 0.8 ? 12 : 20;
  S.scale = fitPoster($("posterHolder"), S.posterEl, r.width * 0.96 - easelPad, r.height * 0.94 - easelPad - 20);
}
function toPoster(e) {
  const r = S.posterEl.getBoundingClientRect();
  return { x: (e.clientX - r.left) / S.scale, y: (e.clientY - r.top) / S.scale };
}
function setStage(n) {
  document.querySelectorAll("#stageDots span").forEach((s) => {
    const k = Number(s.dataset.s);
    s.classList.toggle("on", k === n);
    s.classList.toggle("done", k < n);
  });
}
function setSide(title, text) {
  $("sideTitle").textContent = title;
  $("sideText").textContent = text;
  $("sideBody").innerHTML = "";
  $("sideActions").innerHTML = "";
}
function actionButton(label, cls, fn) {
  const b = document.createElement("button");
  b.className = "btn " + cls;
  b.textContent = label;
  b.addEventListener("click", fn);
  $("sideActions").appendChild(b);
  return b;
}
function stageCard(n, title, text, line) {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "stage-card";
    wrap.innerHTML = `<div class="panel"><p class="season">Challenge ${n} of 4</p><h2>${title}</h2><p class="muted">${text}</p>${line && CFG.SHOW_ELF ? `<p class="says">Pixel: ${line}</p>` : ""}<button class="btn btn-gold">Go!</button></div>`;
    $("game").appendChild(wrap);
    gsap.fromTo(wrap.firstChild, { y: 40, scale: 0.9, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)" });
    wrap.querySelector("button").addEventListener("click", () => {
      sfx.pop();
      gsap.to(wrap, { opacity: 0, duration: 0.25, onComplete: () => { wrap.remove(); resolve(); } });
    });
  });
}
function showBriefOverlay() {
  if (!S.st) return;
  const wrap = document.createElement("div");
  wrap.className = "stage-card";
  wrap.innerHTML = `<article class="brief-card" style="max-width:520px;width:100%">${briefHTML(S.st.brief, false)}<button class="btn btn-gold">Back to my poster</button></article>`;
  $("game").appendChild(wrap);
  wrap.querySelector("button").addEventListener("click", () => wrap.remove());
}

// ---------------------------------------------------------------- timer
let timer = null;
function startTimer(seconds, onEnd) {
  stopTimer();
  const ring = $("timerRing"), text = $("timerText"), box = $("timer");
  const end = performance.now() + seconds * 1000;
  let last = seconds + 1;
  const tick = () => {
    const left = Math.max(0, (end - performance.now()) / 1000);
    const sec = Math.ceil(left);
    text.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    ring.style.strokeDashoffset = String(97.4 * (1 - left / seconds));
    box.classList.toggle("low", left <= seconds * 0.3 && left > 10);
    box.classList.toggle("crit", left <= 10);
    if (sec !== last && sec <= 10 && sec > 0) sfx.tick();
    last = sec;
    if (left <= 0) { stopTimer(); onEnd("time"); }
  };
  timer = { id: setInterval(tick, 200), started: performance.now() };
  tick();
}
function stopTimer() {
  if (!timer) return 0;
  clearInterval(timer.id);
  const used = Math.round((performance.now() - timer.started) / 1000);
  timer = null;
  return used;
}

// ---------------------------------------------------------------- game start
function startGame() {
  show("game");
  mountElf($("elfMini"));
  if (!CFG.SHOW_ELF) $("elfMini").style.display = "none";
  $("elfSays").hidden = true;
  setTimeout(challenge1, 350);
}

// ---------------------------------------------------------------- CHALLENGE 1: fonts
async function challenge1() {
  setStage(1);
  setSide("Choose your fonts", "Tap a font to try it on the poster.");
  const st = S.st;
  draw({ textIds: ["heading", "sub", "body"] });
  stackTexts(st, ["heading", "sub", "body"], 60, 34);
  draw({ textIds: ["heading", "sub", "body"] });
  gsap.from("#easel", { y: 80, rotation: -4, opacity: 0, duration: 0.7, ease: "back.out(1.4)" });
  await stageCard(1, "Choose Your Fonts", "Pick a font for the big heading and one for the body text. Serif, sans-serif and display fonts are all there.", "My poster is in boring typewriter font! Help!");
  const chip = (f, group) => `<button class="chip" data-g="${group}" data-k="${f.key}"><span class="aa" style="font-family:${f.family};font-weight:${f.weight}">Aa</span>${f.label}<span class="tag ${f.cat === "Display" ? "display" : f.cat === "Serif" ? "serif" : ""}">${f.cat}</span></button>`;
  $("sideBody").innerHTML = `<p class="step-label">Step 1</p><h3 class="step-title">Heading font</h3><div class="chips">${HEADING_FONTS.map((f) => chip(f, "h")).join("")}</div>
    <p class="step-label" style="margin-top:12px">Step 2</p><h3 class="step-title">Body text font</h3><div class="chips">${BODY_FONTS.map((f) => chip(f, "b")).join("")}</div>`;
  let done = false;
  const ok = actionButton("Lock in my fonts", "btn-gold", () => finish());
  ok.disabled = true;
  $("sideBody").querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    const g = c.dataset.g;
    $("sideBody").querySelectorAll(`.chip[data-g="${g}"]`).forEach((x) => x.classList.toggle("sel", x === c));
    if (g === "h") st.headingFont = c.dataset.k; else st.bodyFont = c.dataset.k;
    draw({ textIds: ["heading", "sub", "body"] });
    stackTexts(st, ["heading", "sub", "body"], 60, 34);
    draw({ textIds: ["heading", "sub", "body"] });
    ok.disabled = !(st.headingFont && st.bodyFont);
    sfx.pop();
    elfReact("happy", pick(LINES.pick));
  }));
  const finish = () => {
    if (done) return;
    done = true;
    S.times.fonts = stopTimer();
    S.scores.fonts = fontScore(st);
    if (st.headingFont) {
      const [, why] = st.brief.headingFit[st.headingFont];
      toast(`${fontOf(HEADING_FONTS, st.headingFont).label}: ${why}`, S.scores.fonts.heading < 6, 2600);
    }
    sfx.chime();
    setTimeout(challenge2, 900);
  };
  elfReact("panic", "Quick! Pick fonts that suit the brief!");
  startTimer(CFG.CHALLENGE_TIME[1], finish);
}

// ---------------------------------------------------------------- CHALLENGE 2: text hierarchy
async function challenge2() {
  setStage(2);
  setSide("Text hierarchy", "Drag the text into order and set each size.");
  const st = S.st;
  // Muddled start that scores nothing until the student fixes it.
  st.sizes = { ...st.sizes, heading: 24, sub: 30, body: 44 };
  let order = ["body", "sub", "heading"];
  const ranksOf = () => {
    const ids = ["heading", "sub", "body"].sort((a, b) => st.sizes[b] - st.sizes[a]);
    return Object.fromEntries(ids.map((id, i) => [id, i + 1]));
  };
  const redraw = () => {
    draw({ textIds: ["heading", "sub", "body"], ranks: ranksOf(), editing: true });
    stackTexts(st, order, 50, 30);
    for (const id of order) S.posterEl.querySelector(`.pel.text.${id}`).style.top = st.els[id].y + "px";
  };
  redraw();
  await stageCard(2, "Text Hierarchy", "Put the heading, subheading and body text in order of importance, then size them so the heading stands out and the body is easy to read.", "Oh no! I dropped the text and the sizes got all muddled!");

  let selected = "heading";
  const labels = { heading: "Heading", sub: "Subheading", body: "Body text" };
  $("sideBody").innerHTML = `<p class="step-label">Order</p><p class="muted small" style="margin:0 0 8px">Drag the text up or down on the poster.</p>
    <p class="step-label">Size</p><div class="text-pick" id="textPick">${Object.entries(labels).map(([k, v]) => `<button data-k="${k}">${v}</button>`).join("")}</div>
    <div class="size-row"><span id="sizeLabel"></span><b id="sizeVal"></b><input type="range" id="sizeSlider" min="14" max="96" step="1" aria-label="Text size"></div>
    <p class="muted small">The gold numbers show what a reader notices first: 1 = biggest.</p>`;
  const syncPick = () => {
    $("textPick").querySelectorAll("button").forEach((b) => b.classList.toggle("sel", b.dataset.k === selected));
    $("sizeLabel").textContent = labels[selected] + " size";
    $("sizeVal").textContent = st.sizes[selected] + " px";
    $("sizeSlider").value = st.sizes[selected];
    S.posterEl.querySelectorAll(".pel.text").forEach((d) => d.classList.toggle("selected", d.dataset.id === selected));
  };
  $("textPick").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { selected = b.dataset.k; syncPick(); sfx.pop(); }));
  $("sizeSlider").addEventListener("input", (e) => {
    st.sizes[selected] = Number(e.target.value);
    redraw();
    attachDrag();
    syncPick();
  });

  let drag = null;
  const attachDrag = () => {
    S.posterEl.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".pel.text");
      if (!el) return;
      e.preventDefault();
      selected = el.dataset.id;
      syncPick();
      const pt = toPoster(e);
      drag = { el, id: el.dataset.id, dy: pt.y - st.els[el.dataset.id].y, pointer: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      el.classList.add("dragging");
      sfx.pop();
    });
    S.posterEl.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      const pt = toPoster(e);
      st.els[drag.id].y = Math.round(Math.max(-40, Math.min(H - 20, pt.y - drag.dy)));
      drag.el.style.top = st.els[drag.id].y + "px";
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      drag.el.classList.remove("dragging");
      order = [...order].sort((a, b) => (st.els[a].y + st.els[a].h / 2) - (st.els[b].y + st.els[b].h / 2));
      drag = null;
      stackTexts(st, order, 50, 30);
      for (const id of order) gsap.to(S.posterEl.querySelector(`.pel.text.${id}`), { top: st.els[id].y, duration: 0.3, ease: "back.out(1.6)" });
      sfx.snap();
      elfReact("happy", pick(LINES.move));
    };
    S.posterEl.addEventListener("pointerup", end);
    S.posterEl.addEventListener("pointercancel", end);
  };
  attachDrag();
  syncPick();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    S.times.hierarchy = stopTimer();
    S.order = order;
    S.scores.hierarchy = hierarchyScore(order, st.sizes);
    sfx.chime();
    setTimeout(challenge3, 600);
  };
  actionButton("Done", "btn-gold", finish);
  elfReact("panic", "Which text should people read first?");
  startTimer(CFG.CHALLENGE_TIME[2], finish);
}

// ---------------------------------------------------------------- CHALLENGE 3: colour match
async function challenge3() {
  setStage(3);
  setSide("Colour match", "Tap a colour combination to try it.");
  const st = S.st;
  const redraw = () => { draw({ textIds: ["heading", "sub", "body"] }); stackTexts(st, S.order, 50, 30); draw({ textIds: ["heading", "sub", "body"] }); };
  redraw();
  await stageCard(3, "Colour Match", "Choose the colour combination that is easy to read and suits the mood of the event.", "Everything is grey! Give it some colour!");
  $("sideBody").innerHTML = `<div class="chips">${PALETTE_CHOICES.map((k) => {
    const p = PALETTES[k];
    return `<button class="chip" data-k="${k}"><span class="swatch"><i style="background:${p.bg}"></i><i style="background:${p.heading}"></i><i style="background:${p.text}"></i></span>${p.name}</button>`;
  }).join("")}</div>
  <div style="margin-top:12px"><div class="meter-row"><span>Readability</span><span id="readLabel">Not chosen</span></div><div class="meter"><i id="readBar"></i></div></div>
  <div class="wheel-row"><div class="wheel" id="wheel"><div class="lineconn" id="wLine"></div><div class="dot" id="wA"></div><div class="dot" id="wB"></div></div><p class="wheel-note" id="wheelNote">Pick a combination to see it on the colour wheel.</p></div>`;
  const ok = actionButton("Use these colours", "btn-gold", () => finish());
  ok.disabled = true;
  const placeDot = (dot, hue) => {
    if (hue === null || hue === undefined) { dot.style.left = "50%"; dot.style.top = "50%"; dot.style.background = "#222"; return; }
    const a = ((hue - 90) * Math.PI) / 180;
    dot.style.left = 50 + Math.cos(a) * 40 + "%";
    dot.style.top = 50 + Math.sin(a) * 40 + "%";
    dot.style.background = `hsl(${hue} 90% 55%)`;
  };
  $("sideBody").querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => {
    $("sideBody").querySelectorAll(".chip").forEach((x) => x.classList.toggle("sel", x === c));
    st.palette = c.dataset.k;
    redraw();
    const rd = readability(st.palette);
    $("readBar").style.width = Math.max(6, rd.pct) + "%";
    $("readBar").style.background = rd.ratio >= 4.5 ? "var(--good)" : rd.ratio >= 3 ? "var(--gold)" : "var(--bad)";
    $("readLabel").textContent = rd.ratio >= 7 ? "Very easy to read" : rd.ratio >= 4.5 ? "Easy to read" : rd.ratio >= 3 ? "A bit hard" : "Hard to read";
    const [h1, h2] = PALETTES[st.palette].hues;
    placeDot($("wA"), h1);
    placeDot($("wB"), h2);
    $("wheelNote").textContent = colourWheelNote(st.palette);
    ok.disabled = false;
    sfx.pop();
    elfReact("happy", pick(LINES.pick));
  }));
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    S.times.colours = stopTimer();
    S.scores.colours = colourScore(st);
    sfx.chime();
    setTimeout(challenge4, 600);
  };
  elfReact("panic", "Which colours fit the mood?");
  startTimer(CFG.CHALLENGE_TIME[3], finish);
}

// ---------------------------------------------------------------- CHALLENGE 4: complete the poster
async function challenge4() {
  setStage(4);
  setSide("Complete the poster", "Add pictures, icons and shapes, then drag everything into place.");
  const st = S.st;
  st.showInfo = true;
  const order = [...S.order, "info"];
  draw();
  stackTexts(st, order, 44, 28);
  const redraw = () => { draw({ editing: true }); attach(); markSelected(); };
  draw({ editing: true });
  await stageCard(4, "Complete the Poster", "Add images and icons that match the brief. Arrange everything so it's easy to read, with nothing overlapping the text.", "Last step! Make it look amazing!");

  let tab = "image", selected = null, uid = 0;
  $("sideBody").innerHTML = `<div class="tabs" role="tablist">
      <button class="tab on" data-t="image" role="tab">Images</button><button class="tab" data-t="icon" role="tab">Icons</button><button class="tab" data-t="shape" role="tab">Shapes</button>
    </div><div class="tray" id="tray"></div><div id="selTools"></div>`;
  const renderTray = () => {
    $("tray").innerHTML = TRAY[tab].map((k) => {
      const n = st.items.filter((i) => i.key === k).length;
      return `<button class="tray-item" data-k="${k}" aria-label="Add ${ITEMS[k].name}" title="${ITEMS[k].name}" style="color:${PALETTES[st.palette].accent}">${ITEMS[k].svg}${n ? `<span class="count">${n}</span>` : ""}</button>`;
    }).join("");
    $("tray").querySelectorAll(".tray-item").forEach((b) => b.addEventListener("click", () => addItem(b.dataset.k)));
  };
  const markSelected = () => {
    S.posterEl.querySelectorAll(".pel").forEach((d) => d.classList.toggle("selected", !!selected && (d.dataset.uid === selected || d.dataset.id === selected)));
    const tools = $("selTools");
    const it = st.items.find((i) => i.uid === selected);
    if (!it) { tools.innerHTML = ""; return; }
    tools.innerHTML = `<div class="sel-tools"><span>${ITEMS[it.key].name}</span><button data-a="smaller" aria-label="Make smaller">－</button><button data-a="bigger" aria-label="Make bigger">＋</button><button class="del" data-a="del">Remove</button></div>`;
    tools.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      const a = b.dataset.a;
      if (a === "del") { st.items = st.items.filter((i) => i !== it); selected = null; sfx.whoosh(); }
      else {
        const f = a === "bigger" ? 1.2 : 1 / 1.2;
        const cx = it.x + it.w / 2, cy = it.y + it.h / 2;
        it.w = Math.round(Math.max(44, Math.min(380, it.w * f)));
        it.h = it.w;
        it.x = Math.round(cx - it.w / 2); it.y = Math.round(cy - it.h / 2);
        sfx.snap();
      }
      redraw();
      renderTray();
    }));
  };
  const addItem = (key) => {
    if (st.items.length >= 10) { toast("That's plenty! Remove something before adding more.", true); return; }
    const kind = ITEMS[key].kind;
    const size = ITEM_SIZE[kind];
    const it = { uid: "i" + uid++, key, w: size, h: size, x: Math.round(W / 2 - size / 2 + (Math.random() - 0.5) * 60), y: Math.round(H / 2 - size / 2 + (Math.random() - 0.5) * 60) };
    st.items.push(it);
    selected = it.uid;
    redraw();
    renderTray();
    const d = S.posterEl.querySelector(`[data-uid="${it.uid}"]`);
    gsap.from(d, { scale: 0, rotation: -20, duration: 0.45, ease: "back.out(2.2)" });
    sfx.pop();
    if (Math.random() < 0.5) elfReact("happy", pick(LINES.add));
  };
  $("sideBody").querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
    tab = t.dataset.t;
    $("sideBody").querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === t));
    renderTray();
    sfx.pop();
  }));

  let drag = null;
  function attach() {
    const f = S.posterEl;
    const guide = Object.assign(document.createElement("div"), { className: "guide v" });
    guide.style.left = W / 2 - 1 + "px";
    f.appendChild(guide);
    f.addEventListener("pointerdown", (e) => {
      const under = [...new Set(document.elementsFromPoint(e.clientX, e.clientY).map((n) => n.closest && n.closest(".pel.movable")).filter(Boolean))];
      if (!under.length) { selected = null; markSelected(); return; }
      // Prefer the piece whose centre is nearest the finger (relative to its size).
      const dist = (n) => { const r = n.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - e.clientX, r.top + r.height / 2 - e.clientY) / Math.sqrt(r.width * r.height); };
      const el = under.sort((a, b) => dist(a) - dist(b))[0];
      e.preventDefault();
      const model = el.dataset.uid ? st.items.find((i) => i.uid === el.dataset.uid) : st.els[el.dataset.id];
      selected = el.dataset.uid || el.dataset.id;
      markSelected();
      const pt = toPoster(e);
      drag = { el, model, dx: pt.x - model.x, dy: pt.y - model.y, pointer: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch { /* ignore */ }
      el.classList.add("dragging");
    });
    f.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      const pt = toPoster(e), m = drag.model;
      let x = pt.x - drag.dx, y = pt.y - drag.dy;
      x = Math.max(-m.w * 0.5, Math.min(W - m.w * 0.5, x));
      y = Math.max(-m.h * 0.5, Math.min(H - m.h * 0.5, y));
      const snapped = Math.abs(x + m.w / 2 - W / 2) < 12;
      if (snapped) x = W / 2 - m.w / 2;
      guide.classList.toggle("on", snapped);
      m.x = Math.round(x); m.y = Math.round(y);
      drag.el.style.left = m.x + "px";
      drag.el.style.top = m.y + "px";
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.pointer) return;
      drag.el.classList.remove("dragging");
      guide.classList.remove("on");
      drag = null;
      sfx.snap();
    };
    f.addEventListener("pointerup", end);
    f.addEventListener("pointercancel", end);
  }
  attach();
  renderTray();
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    S.times.poster = stopTimer();
    selected = null;
    S.scores.images = relevanceScore(st);
    S.scores.arrangement = arrangementScore(st);
    sfx.sparkle();
    setTimeout(finishGame, 500);
  };
  actionButton("Finish poster ✨", "btn-gold", finish);
  elfReact("panic", "Add pictures that match the brief!");
  startTimer(CFG.CHALLENGE_TIME[4], finish);
}

// ---------------------------------------------------------------- results
async function finishGame() {
  stopTimer();
  const sc = S.scores, st = S.st;
  const parts = { fonts: sc.fonts.score, hierarchy: sc.hierarchy.score, colours: sc.colours.score, images: sc.images.score, arrangement: sc.arrangement.score };
  const total = Math.round(Object.values(parts).reduce((a, b) => a + b, 0));
  const fb = feedback(Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, v / 20])));
  const lvl = level(total);
  const seconds = Math.round((performance.now() - S.startedAt) / 1000);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const strong = Object.values(parts).filter((v) => v >= 15).length;
  const hf = st.headingFont ? fontOf(HEADING_FONTS, st.headingFont) : null;
  const bf = st.bodyFont ? fontOf(BODY_FONTS, st.bodyFont) : null;
  S.result = {
    timestamp: new Date().toISOString(),
    name: S.player.name,
    quizmasId: S.player.id,
    game: CFG.GAME_ID,
    gameName: CFG.GAME_NAME,
    attempt: S.attempt,
    official: S.official,
    score: total,
    maxScore: 100,
    level: lvl,
    breakdown: `Fonts ${parts.fonts}/20 · Hierarchy ${parts.hierarchy}/20 · Colours ${parts.colours}/20 · Images ${parts.images}/20 · Arrangement ${parts.arrangement}/20`,
    progress: `${strong}/5 areas strong`,
    fontsScore: parts.fonts, hierarchyScore: parts.hierarchy, coloursScore: parts.colours, imagesScore: parts.images, arrangementScore: parts.arrangement,
    brief: st.brief.key,
    headingFont: hf ? `${hf.label} (${hf.cat})` : "none",
    bodyFont: bf ? `${bf.label} (${bf.cat})` : "none",
    colours: st.palette === "draft" ? "none" : PALETTES[st.palette].name,
    items: st.items.map((i) => ITEMS[i.key].name).join(", "),
    timeFonts: S.times.fonts, timeHierarchy: S.times.hierarchy, timeColours: S.times.colours, timePoster: S.times.poster, totalSeconds: seconds,
    device: coarse ? (Math.min(screen.width, screen.height) < 700 ? "phone" : "tablet") : "computer",
    strength: fb.good, improve: fb.work,
  };
  showResults(S.result, parts, fb);
  const status = await saveResult(S.result);
  $("saveStatus").textContent = !S.official
    ? (status === "sent" ? "Practice round saved (not your official score)." : "Practice round recorded on this device.")
    : status === "sent" ? "✓ Official score saved to Quizmas." : status === "queued" ? "✓ Score saved on this device. It will be sent to Quizmas automatically." : "✓ Saved on this device. It will upload when you're back online.";
}

function buildBulbs() {
  const b = $("bulbs");
  b.querySelectorAll("i").forEach((i) => i.remove());
  const n = 9, m = 12;
  const spots = [];
  for (let i = 0; i <= n; i++) spots.push([(i / n) * 100, 0], [(i / n) * 100, 100]);
  for (let j = 1; j < m; j++) spots.push([0, (j / m) * 100], [100, (j / m) * 100]);
  spots.forEach(([x, y], k) => {
    const i = document.createElement("i");
    i.style.left = x + "%"; i.style.top = y + "%";
    i.style.animationDelay = (k % 4) * 0.3 + "s";
    b.appendChild(i);
  });
}

function showResults(rec, parts, fb) {
  show("results");
  const first = rec.name.split(" ")[0];
  $("resultsName").textContent = rec.score >= 75 ? `Amazing poster, ${first}!` : rec.score >= 55 ? `Nice work, ${first}!` : `Good effort, ${first}!`;
  $("levelText").textContent = rec.level;
  $("attemptTag").textContent = S.official ? "OFFICIAL SCORE" : `PRACTICE ROUND ${S.attempt - 1} · NOT COUNTED`;
  const rows = [["Font choice", parts.fonts], ["Text hierarchy", parts.hierarchy], ["Colour match", parts.colours], ["Images & icons", parts.images], ["Arrangement & readability", parts.arrangement]];
  $("breakdown").innerHTML = rows.map(([t, v]) => `<div class="bd-row"><span>${t}</span><b>${v} / 20</b><div class="bd-bar"><i data-w="${(v / 20) * 100}"></i></div></div>`).join("")
    + `<p class="muted small">Time: ${Math.floor(rec.totalSeconds / 60)}m ${rec.totalSeconds % 60}s</p>`;
  $("feedback").innerHTML = `<div class="fb good"><span>🌟</span><div>${fb.good}</div></div><div class="fb work"><span>🎯</span><div>${fb.work}</div></div>`;
  $("choices").innerHTML = [`Heading: ${rec.headingFont}`, `Body: ${rec.bodyFont}`, `Colours: ${rec.colours}`, `${S.st.items.length} picture${S.st.items.length === 1 ? "" : "s"} & shapes`].map((c) => `<span>${c}</span>`).join("");

  buildBulbs();
  const bb = $("bbPoster");
  const el = renderPoster(bb, S.st);
  requestAnimationFrame(() => fitInside(bb, el));
  const tl = gsap.timeline();
  tl.from("#billboard", { rotationY: 70, x: 200, opacity: 0, duration: 1, ease: "power3.out" })
    .from("#bbPoster", { filter: "brightness(0.15)", duration: 0.8, ease: "power2.out", onStart: () => sfx.whoosh() })
    .from("#bulbs i", { opacity: 0, scale: 0, duration: 0.2, stagger: 0.025 }, "-=0.6")
    .from("#resultsPanel", { x: 60, opacity: 0, duration: 0.6 }, "-=0.8")
    .add(() => countUp(rec.score), "-=0.2");
  if (CFG.SHOW_ELF) setTimeout(() => toast(rec.score >= 75 ? "Pixel: You saved my poster! You're a superstar!" : "Pixel: Thank you! Let's practise and make it even better!"), 2600);
}

function countUp(score) {
  const num = $("scoreNum"), ring = $("scoreRing");
  const o = { v: 0 };
  let last = -1;
  gsap.to(o, {
    v: score, duration: 1.8, ease: "power2.out",
    onUpdate: () => {
      const v = Math.round(o.v);
      num.textContent = v;
      ring.style.strokeDashoffset = String(326.7 * (1 - o.v / 100));
      if (v !== last && v % 3 === 0) sfx.count();
      last = v;
    },
    onComplete: () => {
      document.querySelectorAll(".bd-bar i").forEach((i) => { i.style.width = i.dataset.w + "%"; });
      gsap.from("#levelText", { scale: 0.5, opacity: 0, duration: 0.5, ease: "back.out(3)" });
      if (score >= 55) { confetti($("confetti")); sfx.fanfare(); } else sfx.chime();
    },
  });
}

async function downloadBadge() {
  const r = S.result;
  const blob = await makeBadge({
    name: r.name, id: r.quizmasId, score: r.score, level: r.level, gameName: CFG.GAME_NAME,
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), official: r.official,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Pixel-Panic-Badge-${r.name.replace(/[^a-z0-9]+/gi, "-")}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  sfx.sparkle();
}

// ---------------------------------------------------------------- wiring
function stringLights() {
  const box = $("lights");
  const colours = ["#f6c453", "#4fc3f7", "#ffffff", "#e5484d"];
  const n = Math.ceil(window.innerWidth / 60) + 1;
  box.innerHTML = Array.from({ length: n }, (_, i) => `<i style="left:${i * 60 + 25}px;background:${colours[i % 4]};box-shadow:0 0 10px ${colours[i % 4]};animation-delay:${(i % 5) * 0.3}s"></i>`).join("");
}
function boot() {
  startSnow($("snow"));
  stringLights();
  mountElf($("elfBrief"));
  mountElf($("elfMini"));
  setupEntry();
  $("startBtn").addEventListener("click", () => {
    audio.unlock();
    sfx.pop();
    show("entry");
    setTimeout(() => $("playerName").focus(), 450);
    if (globe) setTimeout(() => { globe.destroy(); globe = null; }, 600);
  });
  $("skipBrief").addEventListener("click", () => { briefRun++; startGame(); });
  $("againBtn").addEventListener("click", () => { sfx.pop(); newRound(); });
  $("badgeBtn").addEventListener("click", downloadBadge);
  $("briefBtn").addEventListener("click", showBriefOverlay);
  $("muteBtn").addEventListener("click", () => {
    const m = !audio.isMuted();
    audio.setMuted(m);
    $("muteBtn").firstChild.textContent = m ? "🔇" : "🔊";
    $("muteBtn").setAttribute("aria-label", m ? "Sound off" : "Sound on");
  });
  window.addEventListener("resize", () => {
    stringLights();
    if (current === "results") { const bb = $("bbPoster"), el = bb.querySelector(".poster"); if (el) fitInside(bb, el); }
  });
  if (window.ResizeObserver) new ResizeObserver(() => { if (current === "game") layoutPoster(); }).observe($("posterArea"));
  flush();
  runLoader().then(showGlobe);
}
boot();
