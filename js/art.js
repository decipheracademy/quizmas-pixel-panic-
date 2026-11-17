// Original artwork drawn as SVG: Pixel the elf, plus the images, icons and shapes for the poster tray.

export function elfSVG(mood = "happy") {
  const eyes = mood === "panic"
    ? `<circle cx="84" cy="104" r="13" fill="#fff" stroke="#0b2f6b" stroke-width="4"/><circle cx="116" cy="104" r="13" fill="#fff" stroke="#0b2f6b" stroke-width="4"/><circle cx="84" cy="104" r="5" fill="#0b2f6b"/><circle cx="116" cy="104" r="5" fill="#0b2f6b"/>`
    : `<circle cx="84" cy="104" r="12" fill="#fff" stroke="#0b2f6b" stroke-width="4"/><circle cx="116" cy="104" r="12" fill="#fff" stroke="#0b2f6b" stroke-width="4"/><circle cx="86" cy="106" r="6.5" fill="#0b2f6b"/><circle cx="118" cy="106" r="6.5" fill="#0b2f6b"/><circle cx="88" cy="103" r="2.2" fill="#fff"/><circle cx="120" cy="103" r="2.2" fill="#fff"/>`;
  const mouth = mood === "panic"
    ? `<ellipse cx="100" cy="136" rx="9" ry="11" fill="#0b2f6b"/><ellipse cx="100" cy="140" rx="5" ry="4" fill="#ff8fa3"/>`
    : `<path d="M84 130 Q100 148 116 130" stroke="#0b2f6b" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  const sweat = mood === "panic" ? `<path d="M142 84 q8 12 0 18 q-8 -6 0 -18z" fill="#9fdcff"/>` : "";
  return `<svg viewBox="0 0 200 230" role="img" aria-label="Pixel the elf">
  <ellipse cx="100" cy="222" rx="56" ry="7" fill="rgba(6,26,58,.25)"/>
  <g class="e-body">
    <path d="M62 170 Q100 150 138 170 L146 214 Q100 226 54 214 Z" fill="#1565c0"/>
    <path d="M70 176 l60 0" stroke="#f6c453" stroke-width="6"/>
    <circle cx="100" cy="196" r="5" fill="#f6c453"/>
    <path d="M60 104 L28 86 L52 118 Z" fill="#ffd2b0" stroke="#e7a77e" stroke-width="3" stroke-linejoin="round"/>
    <path d="M140 104 L172 86 L148 118 Z" fill="#ffd2b0" stroke="#e7a77e" stroke-width="3" stroke-linejoin="round"/>
    <ellipse cx="100" cy="112" rx="44" ry="46" fill="#ffd9bd"/>
    <circle cx="74" cy="124" r="7" fill="#ffa7b5" opacity=".6"/><circle cx="126" cy="124" r="7" fill="#ffa7b5" opacity=".6"/>
    ${eyes}
    <path d="M70 88 q14 -8 26 0 M104 88 q14 -8 26 0" stroke="#7a4a24" stroke-width="4" fill="none" stroke-linecap="round"/>
    ${mouth}
    ${sweat}
    <path d="M52 80 C60 30 120 10 150 22 C138 34 132 54 148 80 Z" fill="#4fc3f7"/>
    <path d="M50 78 Q100 64 150 78 L150 90 Q100 78 50 90 Z" fill="#ffffff"/>
    <path d="M150 22 Q170 16 176 34" stroke="#4fc3f7" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="178" cy="38" r="10" fill="#f6c453"/>
    <path d="M160 160 l26 -40" stroke="#0b2f6b" stroke-width="7" stroke-linecap="round"/>
    <path d="M186 120 l4 -8" stroke="#f6c453" stroke-width="7" stroke-linecap="round"/>
  </g>
</svg>`;
}

// ---- tray items (viewBox 0 0 100 100). Icons and shapes use the poster's accent colour (currentColor). ----
const S = (inner) => `<svg viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;

export const ITEMS = {
  // Images / illustrations
  microscope: { kind: "image", name: "Microscope", svg: S(`<rect x="22" y="84" width="56" height="8" rx="3" fill="#0b2f6b"/><rect x="44" y="68" width="10" height="18" fill="#37557f"/><path d="M40 70 h36" stroke="#37557f" stroke-width="6"/><rect x="38" y="14" width="16" height="44" rx="4" fill="#4fc3f7" transform="rotate(-24 46 36)"/><rect x="34" y="10" width="18" height="8" rx="2" fill="#0b2f6b" transform="rotate(-24 43 14)"/><path d="M58 52 q18 4 14 26" stroke="#37557f" stroke-width="6" fill="none"/><circle cx="54" cy="58" r="6" fill="#f6c453"/>`) },
  rocket: { kind: "image", name: "Rocket", svg: S(`<path d="M50 6 C70 22 72 52 64 72 H36 C28 52 30 22 50 6 Z" fill="#e3f4ff" stroke="#0b2f6b" stroke-width="3"/><circle cx="50" cy="38" r="9" fill="#4fc3f7" stroke="#0b2f6b" stroke-width="3"/><path d="M36 58 L22 76 L36 72 Z M64 58 L78 76 L64 72 Z" fill="#e5484d"/><path d="M42 74 Q50 98 58 74 Z" fill="#f6c453"/>`) },
  laptop: { kind: "image", name: "Laptop", svg: S(`<rect x="18" y="22" width="64" height="44" rx="4" fill="#0b2f6b"/><rect x="23" y="27" width="54" height="34" rx="2" fill="#4fc3f7"/><path d="M30 38 l-6 6 6 6 M46 38 l6 6 -6 6 M41 36 l-4 16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M8 70 H92 L86 78 H14 Z" fill="#37557f"/>`) },
  robot: { kind: "image", name: "Robot", svg: S(`<path d="M50 8 v10" stroke="#0b2f6b" stroke-width="4"/><circle cx="50" cy="8" r="5" fill="#e5484d"/><rect x="24" y="18" width="52" height="38" rx="10" fill="#4fc3f7" stroke="#0b2f6b" stroke-width="3"/><circle cx="40" cy="36" r="6" fill="#fff"/><circle cx="60" cy="36" r="6" fill="#fff"/><circle cx="40" cy="36" r="3" fill="#0b2f6b"/><circle cx="60" cy="36" r="3" fill="#0b2f6b"/><rect x="40" y="46" width="20" height="4" rx="2" fill="#0b2f6b"/><rect x="30" y="60" width="40" height="30" rx="6" fill="#1565c0"/><rect x="16" y="62" width="10" height="22" rx="5" fill="#37557f"/><rect x="74" y="62" width="10" height="22" rx="5" fill="#37557f"/><circle cx="50" cy="74" r="6" fill="#f6c453"/>`) },
  cupcake: { kind: "image", name: "Cupcake", svg: S(`<path d="M24 56 H76 L68 92 H32 Z" fill="#f6c453"/><path d="M34 56 l4 36 M50 56 v36 M66 56 l-4 36" stroke="#d99a1e" stroke-width="3"/><path d="M20 58 C14 40 34 30 40 34 C42 18 64 16 66 32 C80 30 88 48 80 58 Z" fill="#ffb3d1"/><circle cx="52" cy="18" r="7" fill="#e5484d"/><circle cx="38" cy="44" r="2.5" fill="#4fc3f7"/><circle cx="60" cy="40" r="2.5" fill="#fff"/><circle cx="70" cy="50" r="2.5" fill="#4fc3f7"/>`) },
  gingerbread: { kind: "image", name: "Gingerbread", svg: S(`<circle cx="50" cy="22" r="14" fill="#c27a3a"/><path d="M30 40 H70 L86 54 L78 60 L68 52 L70 70 L80 90 L68 94 L54 74 H46 L32 94 L20 90 L30 70 L32 52 L22 60 L14 54 Z" fill="#c27a3a"/><circle cx="45" cy="20" r="2.5" fill="#fff"/><circle cx="55" cy="20" r="2.5" fill="#fff"/><path d="M44 27 q6 5 12 0" stroke="#fff" stroke-width="2.5" fill="none"/><circle cx="50" cy="50" r="3" fill="#4fc3f7"/><circle cx="50" cy="60" r="3" fill="#e5484d"/><path d="M24 54 l6 -2 M70 52 l6 2" stroke="#fff" stroke-width="2.5"/>`) },
  cocoa: { kind: "image", name: "Hot cocoa", svg: S(`<path d="M40 14 q-6 8 0 16 M52 10 q-6 8 0 16" stroke="#9fb3c8" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="22" y="34" width="46" height="52" rx="8" fill="#e5484d"/><path d="M68 44 h8 a10 10 0 0 1 0 20 h-8" stroke="#e5484d" stroke-width="6" fill="none"/><ellipse cx="45" cy="36" rx="23" ry="6" fill="#7a4a24"/><circle cx="38" cy="34" r="5" fill="#fff"/><circle cx="50" cy="33" r="5" fill="#fff"/><path d="M30 60 h30" stroke="#fff" stroke-width="5"/>`) },
  tree: { kind: "image", name: "Christmas tree", svg: S(`<path d="M50 8 L78 50 H64 L84 80 H16 L36 50 H22 Z" fill="#1f8a5c"/><rect x="44" y="80" width="12" height="12" fill="#7a4a24"/><circle cx="40" cy="44" r="4" fill="#f6c453"/><circle cx="60" cy="62" r="4" fill="#4fc3f7"/><circle cx="36" cy="70" r="4" fill="#e5484d"/><circle cx="56" cy="34" r="3" fill="#fff"/><path d="M50 2 l3 6 7 1 -5 5 1 7 -6 -3 -6 3 1 -7 -5 -5 7 -1z" fill="#f6c453"/>`) },
  soccer: { kind: "image", name: "Football", svg: S(`<circle cx="50" cy="50" r="38" fill="#fff" stroke="#0b2f6b" stroke-width="4"/><path d="M50 34 L64 44 L59 60 H41 L36 44 Z" fill="#0b2f6b"/><path d="M50 34 V14 M64 44 L82 38 M59 60 L70 76 M41 60 L30 76 M36 44 L18 38" stroke="#0b2f6b" stroke-width="3"/>`) },
  guitar: { kind: "image", name: "Guitar", svg: S(`<rect x="58" y="6" width="10" height="44" rx="3" fill="#7a4a24" transform="rotate(30 63 28)"/><path d="M38 44 C26 40 14 52 20 64 C10 74 22 92 36 86 C46 96 66 84 58 70 C66 60 52 44 38 44 Z" fill="#e5484d"/><circle cx="38" cy="66" r="7" fill="#0b2f6b"/><path d="M44 58 L30 74" stroke="#f6c453" stroke-width="2"/>`) },
  // Icons (use the accent colour)
  calendar: { kind: "icon", name: "Calendar", svg: S(`<rect x="14" y="20" width="72" height="66" rx="10" fill="none" stroke="currentColor" stroke-width="8"/><path d="M14 40 H86" stroke="currentColor" stroke-width="8"/><path d="M32 12 v16 M68 12 v16" stroke="currentColor" stroke-width="8" stroke-linecap="round"/><rect x="30" y="52" width="12" height="12" rx="2" fill="currentColor"/><rect x="58" y="52" width="12" height="12" rx="2" fill="currentColor"/>`) },
  pin: { kind: "icon", name: "Location", svg: S(`<path d="M50 92 C28 64 20 52 20 38 a30 30 0 0 1 60 0 C80 52 72 64 50 92 Z" fill="currentColor"/><circle cx="50" cy="38" r="11" fill="#fff"/>`) },
  clock: { kind: "icon", name: "Clock", svg: S(`<circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" stroke-width="8"/><path d="M50 28 V50 L64 60" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/>`) },
  atom: { kind: "icon", name: "Atom", svg: S(`<ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" stroke-width="6"/><ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" stroke-width="6" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" stroke-width="6" transform="rotate(120 50 50)"/><circle cx="50" cy="50" r="8" fill="currentColor"/>`) },
  flask: { kind: "icon", name: "Flask", svg: S(`<path d="M38 10 H62 M42 10 V38 L18 82 a6 6 0 0 0 6 8 H76 a6 6 0 0 0 6 -8 L58 38 V10" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"/><path d="M28 70 H72 L80 84 H20 Z" fill="currentColor"/>`) },
  bulb: { kind: "icon", name: "Light bulb", svg: S(`<path d="M50 10 a28 28 0 0 1 16 51 V72 H34 V61 A28 28 0 0 1 50 10 Z" fill="none" stroke="currentColor" stroke-width="7"/><path d="M36 80 H64 M40 90 H60" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>`) },
  code: { kind: "icon", name: "Code", svg: S(`<path d="M32 26 L10 50 L32 74 M68 26 L90 50 L68 74 M58 18 L42 82" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) },
  heart: { kind: "icon", name: "Heart", svg: S(`<path d="M50 86 C14 62 10 40 18 28 C28 12 46 18 50 32 C54 18 72 12 82 28 C90 40 86 62 50 86 Z" fill="currentColor"/>`) },
  star: { kind: "icon", name: "Star", svg: S(`<path d="M50 8 L61 36 L92 38 L68 58 L76 90 L50 72 L24 90 L32 58 L8 38 L39 36 Z" fill="currentColor"/>`) },
  snowflake: { kind: "icon", name: "Snowflake", svg: S(`<g stroke="currentColor" stroke-width="6" stroke-linecap="round" fill="none"><path d="M50 8 V92 M14 29 L86 71 M14 71 L86 29"/><path d="M40 16 L50 26 L60 16 M40 84 L50 74 L60 84 M18 42 L26 34 L22 22 M82 58 L74 66 L78 78 M18 58 L26 66 L22 78 M82 42 L74 34 L78 22"/></g>`) },
  // Shapes (use the accent colour)
  circle: { kind: "shape", name: "Circle", svg: S(`<circle cx="50" cy="50" r="44" fill="currentColor"/>`) },
  burst: { kind: "shape", name: "Starburst", svg: S(`<path d="M50 4 L58 22 L76 12 L74 32 L94 34 L80 48 L94 62 L74 66 L78 86 L58 78 L50 96 L42 78 L22 86 L26 66 L6 62 L20 48 L6 34 L26 32 L24 12 L42 22 Z" fill="currentColor"/>`) },
  banner: { kind: "shape", name: "Banner", svg: S(`<path d="M4 34 H20 V66 H4 L12 50 Z M96 34 H80 V66 H96 L88 50 Z" fill="currentColor" opacity=".7"/><rect x="14" y="26" width="72" height="40" rx="4" fill="currentColor"/>`) },
  pill: { kind: "shape", name: "Rounded box", svg: S(`<rect x="6" y="26" width="88" height="48" rx="24" fill="currentColor"/>`) },
};
export const TRAY = {
  image: ["microscope", "rocket", "laptop", "robot", "cupcake", "gingerbread", "cocoa", "tree", "soccer", "guitar"],
  icon: ["calendar", "pin", "clock", "atom", "flask", "bulb", "code", "heart", "star", "snowflake"],
  shape: ["circle", "burst", "banner", "pill"],
};
