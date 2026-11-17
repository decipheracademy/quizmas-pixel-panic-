// Lightweight falling snow behind every screen.
export function startSnow(canvas) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, flakes = [];
  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = reduce ? 0 : Math.round(Math.min(140, (w * h) / 9000));
    flakes = Array.from({ length: count }, () => make(true));
  };
  const make = (anywhere) => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : -10,
    r: 0.8 + Math.random() * 2.6,
    s: 0.25 + Math.random() * 0.9,
    drift: Math.random() * Math.PI * 2,
    a: 0.35 + Math.random() * 0.55,
  });
  let last = performance.now();
  const frame = (t) => {
    const dt = Math.min(50, t - last) / 16.7;
    last = t;
    c.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.drift += 0.01 * dt;
      f.y += f.s * dt;
      f.x += Math.sin(f.drift) * 0.35 * dt;
      if (f.y > h + 10) Object.assign(f, make(false));
      c.globalAlpha = f.a;
      c.beginPath();
      c.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      c.fillStyle = "#fff";
      c.fill();
    }
    requestAnimationFrame(frame);
  };
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);
}
