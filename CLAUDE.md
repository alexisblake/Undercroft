# Undercroft — project notes for Claude

Undercroft is Lexi's Hades-inspired pixel-art roguelite deckbuilder. Plain HTML/CSS/JavaScript, no build step:
open `index.html` through any static server and it runs. Lexi supplies the art (PixelLab generations from her
own drawings) and the design direction; Claude implements, balances, tests, and keeps this file current.

Lexi works in systems and sequences and wants dense, direct answers with honest trade-offs. She plans the
vision; Claude handles the details and executes.

## Running and testing
- Play locally: `python3 -m http.server` in the repo root, then open http://localhost:8000
- Tests: `pip install playwright && playwright install chromium`, then `python3 tests/test_game.py`.
  They also run on every push (GitHub Actions). Run them before every commit that touches `src/` or `art/`.

## Code layout
Classic `<script>` files loaded in order by `index.html`; they share one global scope (no modules, no bundler).
Order matters: a file may only use, at load time, things defined in files above it.
- `src/core.js` helpers · `src/data/*` cards, enemies, weapons, heroes, events, upgrades, pixel icons
- `src/art.js` hero art, recolors, animation timing (`HANIM_MS`), card→animation mapping (`heroAnimFor`)
- `src/sprites/enemies.js` `EANIM`: every enemy with real art · `src/sprites/legacy-enemies.js` old placeholders
- `src/run.js` fight logic and run flow · `src/views.js` screens · `src/input.js` clicks and animation hand-offs
- `src/boot.js` loads every art file into memory before the game starts (prevents flicker); then starts the game
- `css/style.css` all styles, including `@keyframes runN` used by an N-frame strip

## Art pipeline
1. Lexi sends a sheet: transparent PNG, one animation per row, equal cells, plus the row order ("row 2 = hurt").
2. `python3 tools/slice_sheet.py SHEET.png folder-name --rows "idle=8,hurt=2,atk=6,dead=5" --scale 0.5`
3. Paste the printed entry into `EANIM` (enemies) or `ART` (heroes) under the game's internal id; run the tests.

Size rules (one art pixel = one screen pixel in game):
- Lexi generates at 256×256. Regular mobs and heroes: `--scale 0.5` → 128 canvas (character 80–100px; heroes ~106px).
- Minibosses: 0.5 (105–120px tall). Bosses: `--scale 0.6667` → ~171 canvas, ~150px tall (soft but accepted),
  or a 320/384 source canvas at 0.5 if PixelLab allows. Sheets already drawn at game size: `--scale 1`.
- Arena is 236px tall; nothing taller than ~200px fits. Characters face left toward the hero (`noflip:1`).
- Prompts: 2px dark outline (survives halving), chunky details, 3/4 view facing left, soft cel shading, chibi.

Internal ids never change (save compatibility); names do. Id → current name:
rats=Rat Vagrant, moth=Ghost Moth, hound=Ghoulish Puppy, wisp=Wandering Wisp, knight=Bone Knight,
lurker=Dungeon Goblin, warden=The Key Master (miniboss), gate=Ratthew, the Rat King (Floor 1 boss),
eel=Gargoyle Frog, leech=Rat Zealot, siren=Drowned Siren, ooze=Lil Ooze, crab=Reliquary Crab, ghoul=Chapel Ghoul,
choir=The Choirmaster (miniboss, placeholder art), saint=The Drowned Saint → saint2=The Saint Unveiled (Floor 2 boss).
Heroes: runaway=The Knight, cutpurse=The Rogue, ashbound (placeholder art). Art folders use the names, not ids.

## Animation rules (enemies)
- `idle` loops; one-shots return to idle via the `animationend` handler. Loops are phase-locked to a shared clock
  (`phaseLock`) so re-renders never restart them.
- Attack → `atk`; the enemy's single biggest attack (if it has more than one attack value) → `smash` when present.
- Guard (`b`) → `guard`, else `yell`. Power-up/howl (`s`) → `yell`. Weak song (`w`) → `sing`. Heal (`h`) → `heal`.
- Half-HP summon (Rat King) → `summon`, then two Rat Vagrant sprites appear behind him.
- Hero dies → enemy plays `taunt` if it has one. Missing `hurt` → flash-and-shake. Missing `dead` → fade out.
- Phase-2 bosses: phase 1 plays `dead`, the screen flashes white, then phase 2 takes over.
- Killing blow: the hero's attack plays fully before the enemy's defeat (input locked meanwhile, `S.lock`).
- Hero card animations: see `heroAnimFor`. Ultimates use `ultatk`/`ultdef` when the hero has them, else atk/guard.

## Design state
- Knight weapon lines (all swords): Oath, Bulwark (+1 Block per Block card), Riposte line ending in Guard Break
  (shatter up to 5 enemy Guard and deal that much damage). Balance target: ~30% full-clear with a maxed hero.
  Last sims (maxed Knight, final forms): Bulwark ~34%, Guard Break ~33%, Oath ~26–28%.
- Each class has one weapon style (Knight swords, Rogue daggers, Mage staves), 12 weapons = 3 lines × 4 forms.
  Classes unlock by beating the game in different settings.
- Floor rules: Floor 2 Rising Tide (+1 enemy attack from turn 4), Floor 3 Falling Stone.

## Open threads
- Choirmaster: Lexi is making a new sheet. Floor 3 and Floor 4 enemies still use placeholder art.
- Rogue: customizer colors don't recolor yet (hair and hood are close navy shades); no shout row for Strength/Focus.
- Knight sheet has no ultimate rows. Rogue Brier weapon idea: thorns deal damage before the enemy attacks.
- Two kings (Rat King, Fairy King on Floor 4): consider renaming one.
- Card art spec: 96×40 (or 32×32 icons) in a 100×44 window on 116×162 cards; lock shop cards to 1× or 2× if painted.
- The old balance simulator was lost in a workspace reset; rebuild it as `tests/sim` when tuning next.
- Hosting: GitHub Pages or Netlify (Lexi to choose). The claude.ai artifact remains the playtest link until then.
