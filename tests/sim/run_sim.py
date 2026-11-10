"""Undercroft balance simulator. Plays whole runs with a maxed hero and reports the full-clear rate per weapon line.

Run:  python3 tests/sim/run_sim.py                      (maxed Knight, all three lines, 1000 runs each)
      python3 tests/sim/run_sim.py --hero cutpurse --runs 500 --seed 7
      python3 tests/sim/run_sim.py --weapons shield,spear --bot simple --fresh

Two bots bracket a human: "smart" tries every play order each card (an expert who never misplays), "simple"
blocks when an attack is coming and otherwise hits hardest (a casual player). --fresh: no perks, first-form weapon.

Uses the real game code in headless Chromium (same setup as tests/test_game.py), with a greedy bot in sim.js.
"Full clear" = beating the Fairy King on Floor 4. Same seed + same code = same numbers.
"""
import argparse, asyncio, collections, functools, http.server, math, os, re, sys, threading, time
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SKIP = {'src/input.js', 'src/boot.js'}  # clicks and art loading: not needed headless
WEAPON_IDS = {'runaway': ['blade', 'shield', 'spear'], 'cutpurse': ['daggers', 'knives', 'garrote'],
              'ashbound': ['staff', 'frost', 'orb']}
FLOORS = {1: 'Underbelly', 2: 'Sewers', 3: 'Ruins', 4: 'Fae Court'}

def serve():
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]

def game_scripts():
    html = open(os.path.join(ROOT, 'index.html')).read()
    return [s for s in re.findall(r'<script src="([^"]+)"', html) if s not in SKIP]

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hero', default='runaway', choices=sorted(WEAPON_IDS))
    ap.add_argument('--weapons', default='', help='comma list; default: all three of the hero\'s lines')
    ap.add_argument('--runs', type=int, default=1000)
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--bot', default='smart', choices=['smart', 'simple'])
    ap.add_argument('--fresh', action='store_true', help='no perks, first-form weapon (default: maxed)')
    a = ap.parse_args()
    weapons = a.weapons.split(',') if a.weapons else WEAPON_IDS[a.hero]

    port = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(f'http://127.0.0.1:{port}/tests/sim/')
        await pg.set_content('<main id="app"></main><div class="dock" id="dock" hidden></div>')
        await pg.evaluate('window.requestAnimationFrame = undefined')  # makes the game resolve fights instantly
        for s in game_scripts() + ['tests/sim/sim.js']:
            await pg.add_script_tag(url=f'http://127.0.0.1:{port}/{s}')
        if errs: sys.exit('Game failed to load: ' + errs[0])
        names = await pg.evaluate(f"WEAPONS['{a.hero}'].map(w=>[w.id,w.pass.n])")
        names = dict(names)
        hero = await pg.evaluate(f"HEROES['{a.hero}'].n")
        kind = 'fresh (no perks, first-form weapon)' if a.fresh else 'maxed (all perks, final-form weapon)'
        print(f'{hero}, {kind}, {a.bot} bot. {a.runs} runs per line, seed {a.seed}.\n')
        mon = dict(await pg.evaluate("Object.entries(MON).map(([k,m])=>[k,m.n])")); mon['saint2'] = 'The Saint Unveiled'

        for w in weapons:
            if w not in names: sys.exit(f'Unknown weapon {w}; {a.hero} has {", ".join(names)}')
            await pg.evaluate(f'seedRng({a.seed})')
            res, t0, left = [], time.time(), a.runs
            while left:
                n = min(100, left); left -= n
                res += await pg.evaluate(f"simBatch('{a.hero}','{w}',{n},'{a.bot}',{'true' if a.fresh else 'false'})")
            wins = sum(r['won'] for r in res); pr = wins / len(res)
            ci = 1.96 * math.sqrt(pr * (1 - pr) / len(res)) * 100
            deaths = collections.Counter(r['layer'] for r in res if not r['won'])
            killers = collections.Counter(r['killer'] for r in res if not r['won']).most_common(4)
            print(f'{names[w]:<12} full clear {pr*100:5.1f}%  (±{ci:.1f})   [{time.time()-t0:.0f}s]')
            print('             died on: ' + ', '.join(f'{FLOORS[k]} {deaths[k]/len(res)*100:.0f}%' for k in sorted(deaths)))
            st = sum(r['stalled'] for r in res)
            if st: print(f'             stalled (fight hit {60} turns, counted as a loss): {st/len(res)*100:.0f}%')
            print('             top killers: ' + ', '.join(f'{mon.get(k, k)} {v/len(res)*100:.0f}%' for k, v in killers))
        await b.close()

asyncio.run(main())
