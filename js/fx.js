// Visual effects: snowflake bursts, confetti and the downloadable Design Badge.

export function burst(x, y, chars = ["❄", "✦", "❅", "★"], count = 14) {
  const g = window.gsap;
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.textContent = chars[i % chars.length];
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.color = ["#ffffff", "#4fc3f7", "#f6c453"][i % 3];
    document.body.appendChild(s);
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const d = 50 + Math.random() * 70;
    g.fromTo(s, { x: -10, y: -12, scale: 0.4, opacity: 1 }, {
      x: Math.cos(a) * d - 10, y: Math.sin(a) * d - 12, scale: 1 + Math.random(), rotation: Math.random() * 360, opacity: 0,
      duration: 0.8 + Math.random() * 0.4, ease: "power2.out", onComplete: () => s.remove(),
    });
  }
}

export function confetti(canvas, seconds = 3.5) {
  const c = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const colours = ["#f6c453", "#4fc3f7", "#ffffff", "#1565c0", "#ff6b6b", "#3ddc97"];
  const parts = Array.from({ length: 160 }, (_, i) => ({
    x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.35,
    vx: (Math.random() - 0.5) * 14, vy: -6 - Math.random() * 10,
    r: 4 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
    col: colours[i % colours.length], shape: i % 3,
  }));
  const end = performance.now() + seconds * 1000;
  const frame = (t) => {
    c.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.28; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
      if (p.shape === 0) c.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
      else if (p.shape === 1) { c.beginPath(); c.arc(0, 0, p.r / 1.5, 0, Math.PI * 2); c.fill(); }
      else { c.font = `${p.r * 3}px sans-serif`; c.fillText("❄", -p.r, p.r); }
      c.restore();
    }
    if (t < end) requestAnimationFrame(frame);
    else c.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(frame);
}

// Builds a 1080 × 1080 PNG certificate card.
export async function makeBadge({ name, id, score, level, gameName, date, official }) {
  await document.fonts.ready;
  const S = 1080;
  const cv = document.createElement("canvas");
  cv.width = cv.height = S;
  const g = cv.getContext("2d");
  const bg = g.createRadialGradient(S / 2, S * 0.2, 50, S / 2, S / 2, S * 0.8);
  bg.addColorStop(0, "#1565c0");
  bg.addColorStop(0.5, "#0b2f6b");
  bg.addColorStop(1, "#061a3a");
  g.fillStyle = bg;
  g.fillRect(0, 0, S, S);
  for (let i = 0; i < 120; i++) {
    g.fillStyle = `rgba(255,255,255,${0.15 + (i % 5) * 0.08})`;
    g.beginPath();
    g.arc((i * 151) % S, (i * 263) % S, 1.5 + (i % 4), 0, Math.PI * 2);
    g.fill();
  }
  g.strokeStyle = "#f6c453";
  g.lineWidth = 6;
  roundRect(g, 40, 40, S - 80, S - 80, 40);
  g.stroke();
  g.strokeStyle = "rgba(79,195,247,.6)";
  g.lineWidth = 2;
  roundRect(g, 60, 60, S - 120, S - 120, 30);
  g.stroke();

  g.textAlign = "center";
  g.fillStyle = "#4fc3f7";
  g.font = "800 30px Nunito, sans-serif";
  spaced(g, "QUIZMAS SEASON 3 · UNWRAP THE FUTURE", S / 2, 150, 4);
  g.fillStyle = "#ffffff";
  g.font = "800 84px 'Baloo 2', sans-serif";
  g.fillText("Design Badge", S / 2, 250);
  g.font = "700 34px Nunito, sans-serif";
  g.fillStyle = "#d9f2ff";
  g.fillText(gameName, S / 2, 305);

  // Medal
  const cx = S / 2, cy = 545, R = 165;
  const medal = g.createRadialGradient(cx - 50, cy - 60, 20, cx, cy, R);
  medal.addColorStop(0, "#fff3c4");
  medal.addColorStop(0.45, "#f6c453");
  medal.addColorStop(1, "#b97c10");
  g.fillStyle = medal;
  g.beginPath();
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2, r = i % 2 ? R : R + 18;
    g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  g.closePath();
  g.fill();
  g.fillStyle = "#0b2f6b";
  g.beginPath();
  g.arc(cx, cy, R - 30, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#ffffff";
  g.font = "800 132px 'Baloo 2', sans-serif";
  g.fillText(String(score), cx, cy + 36);
  g.fillStyle = "#4fc3f7";
  g.font = "800 34px Nunito, sans-serif";
  g.fillText("/ 100", cx, cy + 84);

  g.fillStyle = "#f6c453";
  g.font = "800 58px 'Baloo 2', sans-serif";
  g.fillText(level, S / 2, 800);
  g.fillStyle = "#ffffff";
  g.font = "800 50px Nunito, sans-serif";
  g.fillText(name, S / 2, 880);
  g.fillStyle = "rgba(255,255,255,.7)";
  g.font = "700 28px Nunito, sans-serif";
  g.fillText(`Quizmas ID ${id} · ${date}${official ? "" : " · Practice round"}`, S / 2, 935);

  return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
}
function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}
function spaced(g, text, x, y, space) {
  const chars = [...text];
  const widths = chars.map((ch) => g.measureText(ch).width + space);
  let cur = x - widths.reduce((a, b) => a + b, 0) / 2;
  g.textAlign = "left";
  chars.forEach((ch, i) => { g.fillText(ch, cur, y); cur += widths[i]; });
  g.textAlign = "center";
}
