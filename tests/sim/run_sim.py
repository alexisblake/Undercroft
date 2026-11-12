"""Undercroft balance simulator. Plays whole runs with a maxed hero and reports the full-clear rate per weapon line.

Run:  python3 tests/sim/run_sim.py                      (maxed Knight, all three lines, 1000 runs each)
      python3 tests/sim/run_sim.py --hero cutpurse --runs 500 --seed 7
      python3 tests/sim/run_sim.py --weapons shield,spear --bot simple --fresh
      python3 tests/sim/run_sim.py --heat 8             (maxed, two Heat 8 Pact sets; also --heat 16, --pacts hard,swift)
      python3 tests/sim/run_sim.py --fresh --add execute,flick (how much do these cards add to a starting deck?)
      python3 tests/sim/run_sim.py --heat-all 8 --runs 300 (every Pact combination worth exactly Heat 8)
      python3 tests/sim/run_sim.py --campaign 100       (100 saves from scratch, 120 runs each: progression curve)

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
HEAT_SETS = {8: [['hard', 'swift', 'bare'], ['tide', 'tight', 'lean', 'cursed', 'starved']],  # foes / you
             16: [['hard', 'mighty', 'swift', 'tide', 'bare', 'lean', 'cursed', 'starved', 'tight']]}

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
    ap.add_argument('--heat', type=int, choices=sorted(HEAT_SETS), help='run the preset Pact sets for this Heat')
    ap.add_argument('--pacts', default='', help='comma list of Pact ids, e.g. hard,swift')
    ap.add_argument('--add', default='', help='comma list of card ids added to the starting deck, e.g. flick,flick')
    ap.add_argument('--heat-all', type=int, default=0, help='every Pact combination worth exactly this Heat')
    ap.add_argument('--campaign', type=int, default=0, help='N saves from scratch instead of fixed-hero runs')
    ap.add_argument('--campaign-runs', type=int, default=120)
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

        if a.campaign:
            await campaigns(pg, a, weapons, names); await b.close(); return
        if a.heat_all:
            await heat_all(pg, a, weapons, names); await b.close(); return
        sets = HEAT_SETS[a.heat] if a.heat else [a.pacts.split(',')] if a.pacts else [[]]
        for pacts, w in [(ps, w) for ps in sets for w in weapons]:
            if w not in names: sys.exit(f'Unknown weapon {w}; {a.hero} has {", ".join(names)}')
            if pacts and pacts != sets[0] or pacts and w == weapons[0]:
                if w == weapons[0]: print(f'Pacts: {", ".join(pacts)} (Heat {await pg.evaluate(f"pactHeat({pacts})")})')
            await pg.evaluate(f'seedRng({a.seed})')
            res, t0, left = [], time.time(), a.runs
            while left:
                n = min(100, left); left -= n
                res += await pg.evaluate(f"simBatch('{a.hero}','{w}',{n},'{a.bot}',{'true' if a.fresh else 'false'},{pacts},{[c for c in a.add.split(',') if c]})")
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

async def heat_all(pg, a, weapons, names):
    pacts = await pg.evaluate("PACTS.map(p=>[p.id,p.heat])")
    combos = [[pacts[i][0] for i in range(len(pacts)) if m >> i & 1] for m in range(1 << len(pacts))]
    combos = [c for c in combos if sum(h for k, h in pacts if k in c) == a.heat_all]
    print(f'{len(combos)} Pact combinations worth Heat {a.heat_all}, {a.runs} runs each per line.\n')
    for w in weapons:
        rows = []
        for c in combos:
            await pg.evaluate(f'seedRng({a.seed})')
            res = await pg.evaluate(f"simBatch('{a.hero}','{w}',{a.runs},'{a.bot}',false,{c})")
            rows.append((sum(r['won'] for r in res) / len(res) * 100, c))
        rows.sort(); v = [r for r, _ in rows]
        print(f'{names[w]}: median {v[len(v)//2]:.0f}%, range {v[0]:.0f}–{v[-1]:.0f}%')
        print(f'  hardest: {", ".join(rows[0][1])} ({rows[0][0]:.0f}%)   easiest: {", ".join(rows[-1][1])} ({rows[-1][0]:.0f}%)')

async def campaigns(pg, a, weapons, names):
    print(f'Campaigns: {a.campaign} saves from scratch per line, {a.campaign_runs} runs each. '
          'Early runs use the first line until the chosen one unlocks.\n')
    for w in weapons:
        await pg.evaluate(f'seedRng({a.seed})')
        t0, camps = time.time(), []
        for _ in range(a.campaign):
            camps.append(await pg.evaluate(f"simCampaign('{a.hero}','{w}',{a.campaign_runs},'{a.bot}')"))
        firsts = sorted(next((r['i'] for r in c if r['won']), a.campaign_runs + 1) for c in camps)
        q = lambda f: firsts[min(len(firsts) - 1, int(f * len(firsts)))]
        never = sum(x > a.campaign_runs for x in firsts)
        rate = lambda rs: f"{sum(r['won'] for r in rs)/len(rs)*100:5.1f}% ({len(rs)} runs)" if rs else '   n/a'
        allr = [r for c in camps for r in c]
        maxed_at = sorted(next((r['i'] for r in c if r['perks'] >= 1 and r['tier'] == 3), a.campaign_runs + 1) for c in camps)
        print(f'{names[w]}   [{time.time()-t0:.0f}s]')
        print(f'  first clear on run: median {q(.5)}, middle half {q(.25)}–{q(.75)}' + (f', never in {never} saves' if never else ''))
        print(f'  fully maxed (all perks + final form) by run: median {maxed_at[len(maxed_at)//2]}')
        print(f'  runs 1–10:            {rate([r for r in allr if r["i"] <= 10])}')
        print(f'  halfway (40–60% perks) {rate([r for r in allr if .4 <= r["perks"] <= .6])}')
        for lo, hi, label in [(0, .25, 'perks 0–24%'), (.25, .5, 'perks 25–49%'), (.5, .75, 'perks 50–74%'),
                              (.75, 1, 'perks 75–99%'), (1, 2, 'perks 100%')]:
            print(f'  {label:<21} {rate([r for r in allr if lo <= r["perks"] < hi])}')
        print()

asyncio.run(main())
