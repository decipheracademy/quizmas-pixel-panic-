// Pixel Panic settings. Change these without touching the game code.
window.PP_CONFIG = {
  // Paste the SAME Google Apps Script web-app URL used for Design Rescue here.
  // While empty, scores are kept safely on the device and sent later.
  SHEETS_URL: "https://script.google.com/macros/s/AKfycbzxAbynK-IJnqTZnjvMTBGATtzqUDDBsUL1kxRjUNJGn_zTyS02vBRsnm8DaHUpS7DC/exec",
  GAME_ID: "pixel-panic",
  GAME_NAME: "Pixel Panic: The Perfect Poster Challenge",
  // Seconds for each challenge.
  CHALLENGE_TIME: { 1: 45, 2: 75, 3: 45, 4: 120 },
  // Set to false to remove Pixel the elf's lines (the game still works).
  SHOW_ELF: true,
  // Minimum time the loading screen stays up, so it never just flashes.
  LOADER_MIN_MS: 2600,
};
// Shared modules read the settings from this name.
window.DR_CONFIG = window.PP_CONFIG;
