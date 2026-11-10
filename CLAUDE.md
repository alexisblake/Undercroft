# Undercroft — project notes for Claude

Undercroft is Lexi's Hades-inspired pixel-art roguelite deckbuilder. Plain HTML/CSS/JavaScript, no build step:
open `index.html` through any static server and it runs. Lexi supplies the art (PixelLab generations from her
own drawings) and the design direction; Claude implements, balances, tests, and keeps this file current.

Lexi works in systems and sequences and wants dense, direct answers with honest trade-offs. She plans the
vision; Claude handles the details and executes.

## Standing rules
1. Never push straight to main. Every change goes on a branch and into a pull request; Lexi approves and merges.
2. Update this file whenever we make a decision (design, balance, art, naming, tooling), in the same branch as the change.
3. Ask Lexi before spending more than 5 PixelLab generations on one task. Say the estimate up front.

## Branch and preview workflow
- Branch from main (`feature/…`, `art/…`, `balance/…`, `fix/…`), commit, run the tests, push the branch, open a PR.
- Netlify builds a deploy preview for every PR (its own URL, posted on the PR). Lexi plays it there.
- Only main is the live site. Merging an approved PR is the only way anything goes live.
- `.githooks/pre-push` refuses pushes to main. New clones: run `git config core.hooksPath .githooks` once.

## Running and testing
- Play locally: `python3 -m http.server` in the repo root, then open http://localhost:8000
- Tests: `pip install playwright && playwright install chromium`, then `python3 tests/test_game.py`.
  They also run on every push (GitHub Actions). Run them before every commit that touches `src/` or `art/`.
- Balance sim: `python3 tests/sim/run_sim.py` (maxed Knight, all lines, 1000 runs, ~1 min). Options: `--hero`,
  `--weapons`, `--runs`, `--seed`, `--bot smart|simple`, `--fresh` (no perks, first-form weapon). It runs the real
  game code headless, so it never drifts from the rules. Two bots bracket a human: `smart` tries every play order
  (an expert), `simple` blocks when an attack is shown, otherwise hits hardest (a casual player). Same seed = same numbers.

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
  (shatter up to 5 enemy Guard and deal that much damage).
- Balance targets (decided 2026-11-10), full-clear rate by progress:
  fresh hero, first runs 0–10% (first clear after roughly 8–15 runs) · halfway through upgrades 30–50% ·
  maxed, Heat 0 80–90% (losses still possible) · maxed, Heat ~8 ~30% (where the old 30% target belongs) ·
  maxed, Heat 16 5–10% (bragging rights).
- Tuning pass 2026-11-10 (Knight, sim seed 1; "casual" / "expert" = simple / smart bot):
  Floors 3–4 multipliers raised to HP ×1.35 / ×1.45, attack ×1 (were ×1.2 / ×1.25, attack ×0.9) in `DEEP`.
  Pact Heat: Hardened Foes 3 (now +15% HP), Mighty Bosses 1 (now +10%), Swift Foes 3, Cruel Tide 2,
  Bare Hands 2, Lean Times 2, Cursed Deck 1 (now 2 Fleas), Starved 1 (now also one fewer blessing), Tight Purse 2.
  All Pacts = Heat 17. Results: first clear on run ~14 casual / ~4 expert; halfway 36–62% casual / 87–98% expert;
  maxed Heat 0 86% casual / 99% expert; Heat 8 median 23–31% casual / 74–89% expert;
  Heat 16 0–1% casual / 7–27% expert. Starved still measures as ~free (the bots skip most cards).
- Each class has one weapon style (Knight swords, Rogue daggers, Mage staves), 12 weapons = 3 lines × 4 forms.
  Classes unlock by beating the game in different settings.
- More dungeons are planned beyond the current four floors. Balance targets are tuned against the four floors
  that exist; re-run the sims and re-check every target whenever a dungeon is added.
- Floor rules: Floor 2 Rising Tide (+1 enemy attack from turn 4), Floor 3 Falling Stone.
- Zero-cost cards (Quick Draw, Sidestep, Flick) never use a play and can be played at any point in the turn,
  including after both plays are spent (decided 2026-11-10).

## Open threads
- Choirmaster: Lexi is making a new sheet. Floor 3 and Floor 4 enemies still use placeholder art.
- Rogue: customizer colors don't recolor yet (hair and hood are close navy shades); no shout row for Strength/Focus.
- Knight sheet has no ultimate rows. Rogue Brier weapon idea: thorns deal damage before the enemy attacks.
- Two kings (Rat King, Fairy King on Floor 4): consider renaming one.
- Card art spec: 96×40 (or 32×32 icons) in a 100×44 window on 116×162 cards; lock shop cards to 1× or 2× if painted.
- Balance: decide which player the targets describe. Casual bot matches early progression; Heat tiers fall
  between the bots (casual at/below target, expert well above). Lexi's playtests on the preview settle it.
  Halfway is still ~10 points high for Oath and Bulwark. Rogue and Mage not re-checked since the pass.
- Hosting: Netlify (`netlify.toml`, production = main, previews per PR). Site connected; confirm previews appear on
  the first PR, then retire the claude.ai artifact as the playtest link.
- Repo visibility (decided 2026-11-10): public for now, since the game is mainly for Lexi; this makes branch
  protection free. If we decide to launch, switch to private + GitHub Pro. Everything in the repo, notes and
  history included, is publicly readable until then.
