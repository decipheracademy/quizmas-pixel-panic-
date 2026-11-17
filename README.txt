PIXEL PANIC: THE PERFECT POSTER CHALLENGE
Quizmas Season 3 · Game Hub · Graphic Design Track, Game 2

WHAT IS IN THIS FOLDER
  index.html        The game (open this page to play)
  dashboard/        Staff scores dashboard (password protected; shows every Quizmas game)
  js/config.js      Settings: score sheet link, challenge times, Pixel the elf on/off
  css/, js/, fonts/, vendor/   Game files (do not rename)

PUT IT ONLINE (GITHUB + NETLIFY)
  1. Create an empty GitHub repository, e.g. quizmas-pixel-panic.
  2. Upload everything INSIDE this folder (not the folder itself).
  3. In Netlify: Add new site > Import an existing project > GitHub > pick the repository.
     Leave the build command and publish directory empty, then Deploy.

CONNECT THE SCORE SHEET
  Use the SAME Google Sheet and Web app link as Design Rescue. Paste the link into
  js/config.js as SHEETS_URL (on GitHub: open the file, click the pencil, paste, commit).
  Until this is done, scores are kept safely on each device and sent automatically later.

GAME RULES
  A random design brief (School Science Fair, Christmas Bake Sale or Coding Club Showcase), then:
    1. Choose Your Fonts      45 s   20 pts  heading font suits the brief (12) + readable body font (8)
    2. Text Hierarchy         75 s   20 pts  order (8) + heading clearly biggest (4) + subheading > body (4) + body readable (4)
    3. Colour Match           45 s   20 pts  measured readability (12) + suits the mood (8)
    4. Complete the Poster   120 s   40 pts  relevant images and icons (20) + arrangement and readability (20)
  Total 100. First attempt per Quizmas ID is the official score; replays are practice.

TESTING SWITCHES (for staff only)
  index.html?b=0, ?b=1, ?b=2   force a brief (Science Fair, Bake Sale, Coding Club)
  index.html?fast=1            4-second challenges, for quickly checking the flow

CREDITS
  Three.js (MIT), GSAP (GreenSock standard no-charge licence), SheetJS (Apache 2.0).
  Fonts (SIL Open Font Licence): Baloo 2, Nunito, Press Start 2P, Playfair Display, Poppins, Bungee,
  Pacifico, Creepster, Merriweather. Mountains of Christmas (Apache 2.0).
  Pixel the elf, the snow globe, illustrations, icons, sounds and music are original to this game.
