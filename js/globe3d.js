// The 3D snow globe that opens Pixel Panic. Tap to shake it.
import * as THREE from "three";

function posterTexture() {
  const c = document.createElement("canvas");
  c.width = 300; c.height = 400;
  const g = c.getContext("2d");
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 300, 400);
  g.fillStyle = "#1565c0"; g.fillRect(0, 0, 300, 150);
  g.fillStyle = "#f6c453"; g.font = "28px 'Press Start 2P', monospace"; g.textAlign = "center";
  g.fillText("PIXEL", 150, 72);
  g.fillStyle = "#ffffff"; g.fillText("PANIC", 150, 118);
  // a little "design" on the poster: shapes in Decipher colours
  g.fillStyle = "#4fc3f7"; g.beginPath(); g.arc(90, 250, 52, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#f6c453"; g.fillRect(160, 205, 90, 90);
  g.fillStyle = "#0b2f6b"; g.fillRect(40, 330, 220, 16); g.fillRect(70, 358, 160, 12);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(0.5, "rgba(255,255,255,.8)"); r.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createGlobe(host, { onShaken, sfx } = {}) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  const home = new THREE.Vector3(0, 2.6, 10.5);
  camera.position.copy(home);
  const look = new THREE.Vector3(0, 2.1, 0);

  scene.add(new THREE.HemisphereLight(0xe3f5ff, 0x0b2f6b, 1.3));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(4, 7, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x4fc3f7, 25, 20);
  rim.position.set(-4, 4, -3);
  scene.add(rim);

  const globe = new THREE.Group();
  scene.add(globe);

  // Base
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0b2f6b, roughness: 0.4, metalness: 0.3 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xf6c453, roughness: 0.25, metalness: 0.8 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.05, 0.8, 64), baseMat);
  base.position.y = 0.4;
  globe.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.76, 0.07, 16, 80), goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.8;
  globe.add(ring);
  const ring2 = ring.clone();
  ring2.scale.setScalar(1.16);
  ring2.position.y = 0.06;
  globe.add(ring2);

  // Inside: snowy ground, little tree, easel with Pixel's poster
  const R = 2.05, cy = 0.8 + R * 0.86;
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.18, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 }));
  ground.position.y = 0.92;
  globe.add(ground);
  const tree = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x1f8a5c, roughness: 0.7 }));
  tree.position.set(-0.85, 1.6, -0.2);
  globe.add(tree);
  const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.11), goldMat);
  star.position.set(-0.85, 2.26, -0.2);
  globe.add(star);
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.7 });
  for (const x of [-0.42, 0.42]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.9, 0.07), wood);
    leg.position.set(0.35 + x, 1.85, 0.25);
    leg.rotation.z = -x * 0.18;
    globe.add(leg);
  }
  const board = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), new THREE.MeshStandardMaterial({ map: posterTexture(), roughness: 0.6 }));
  board.position.set(0.35, 2.15, 0.31);
  board.rotation.x = -0.08;
  globe.add(board);

  // Glass
  const glass = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), new THREE.MeshStandardMaterial({ color: 0xe3f5ff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.2, depthWrite: false }));
  glass.position.y = cy;
  globe.add(glass);
  const rimGlass = new THREE.Mesh(new THREE.SphereGeometry(R * 1.01, 64, 48), new THREE.MeshBasicMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.12, side: THREE.BackSide, depthWrite: false }));
  rimGlass.position.y = cy;
  globe.add(rimGlass);
  const shine = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(), transparent: true, opacity: 0.55, depthWrite: false }));
  shine.scale.set(0.9, 0.5, 1);
  shine.position.set(-0.9, cy + 1.05, 1.5);
  globe.add(shine);

  // Snow inside the globe
  const N = 420;
  const pos = new Float32Array(N * 3);
  const vel = Array.from({ length: N }, () => new THREE.Vector3());
  const inner = R * 0.9;
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = (Math.random() * 2 - 1) * inner; y = (Math.random() * 2 - 1) * inner; z = (Math.random() * 2 - 1) * inner; } while (x * x + y * y + z * z > inner * inner);
    pos[i * 3] = x; pos[i * 3 + 1] = y + cy; pos[i * 3 + 2] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const snow = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.07, map: dotTexture(), transparent: true, depthWrite: false, color: 0xffffff }));
  globe.add(snow);

  let running = true, shaking = false, t0 = performance.now();
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + "px";
    renderer.domElement.style.height = h + "px";
    camera.aspect = w / h;
    camera.position.z = home.z * (w / h < 0.8 ? 1.5 : w / h < 1.2 ? 1.15 : 1);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const tmp = new THREE.Vector3();
  const loop = () => {
    if (!running) return;
    const t = (performance.now() - t0) / 1000;
    if (!shaking) {
      globe.rotation.y = Math.sin(t * 0.5) * 0.3;
      globe.position.y = Math.sin(t * 1.4) * 0.05;
    }
    const p = geo.attributes.position.array;
    for (let i = 0; i < N; i++) {
      const v = vel[i];
      v.y -= 0.00045; // gentle gravity
      v.multiplyScalar(0.985);
      p[i * 3] += v.x + Math.sin(t + i) * 0.0008;
      p[i * 3 + 1] += v.y - 0.0012;
      p[i * 3 + 2] += v.z;
      tmp.set(p[i * 3], p[i * 3 + 1] - cy, p[i * 3 + 2]);
      const floor = 1.02 - cy;
      if (tmp.y < floor) { tmp.y = floor + 0.01; v.set(0, 0, 0); }
      if (tmp.length() > inner) { tmp.setLength(inner); v.multiplyScalar(-0.4); }
      p[i * 3] = tmp.x; p[i * 3 + 1] = tmp.y + cy; p[i * 3 + 2] = tmp.z;
    }
    geo.attributes.position.needsUpdate = true;
    camera.lookAt(look);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  function shake() {
    if (shaking) return;
    shaking = true;
    sfx?.bells();
    for (const v of vel) v.set((Math.random() - 0.5) * 0.12, 0.05 + Math.random() * 0.12, (Math.random() - 0.5) * 0.12);
    const g = window.gsap;
    const tl = g.timeline();
    tl.to(globe.rotation, { z: 0.22, duration: 0.09, yoyo: true, repeat: 7, ease: "sine.inOut" })
      .to(globe.position, { x: 0.25, duration: 0.09, yoyo: true, repeat: 7, ease: "sine.inOut" }, 0)
      .to(globe.rotation, { z: 0, y: 0, duration: 0.3 })
      .to(globe.position, { x: 0, duration: 0.3 }, "<")
      .call(() => { for (const v of vel) v.add(new THREE.Vector3((Math.random() - 0.5) * 0.06, Math.random() * 0.05, (Math.random() - 0.5) * 0.06)); sfx?.sparkle(); })
      .to(camera.position, { z: camera.position.z * 0.55, y: 2.3, duration: 1.3, ease: "power2.inOut" }, "+=0.5")
      .to(host, { opacity: 0.12, duration: 0.7 }, "-=0.5")
      .call(() => onShaken?.(), null, "-=0.6");
  }
  renderer.domElement.addEventListener("pointerdown", shake);
  return { shake, destroy() { running = false; window.removeEventListener("resize", resize); renderer.dispose(); host.innerHTML = ""; } };
}
