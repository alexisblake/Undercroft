"""Undercroft smoke tests. Run: python3 tests/test_game.py  (needs: pip install playwright && playwright install chromium)

Checks that the game loads with no errors, every art file exists, every sprite strip
matches its frame count, every animation actually plays and hands back to idle, 0-cost cards are free,
the finishing blow plays before the enemy dies, and every enemy can be fought.
"""
import asyncio, functools, http.server, os, sys, threading
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAILS = []

def check(ok, msg):
    print(('  ok   ' if ok else '  FAIL ') + msg)
    if not ok: FAILS.append(msg)

def serve():
    class H(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def end_headers(self):
            self.send_header('Cache-Control', 'no-store'); super().end_headers()
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(H, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]

AUDIT = """() => {
  const out = [], box = document.createElement('div');
  box.style.cssText = 'position:fixed;left:0;top:0;width:128px'; document.body.appendChild(box);
  for (const k in EANIM) for (const a in EANIM[k].anims) {
    box.innerHTML = eanimHTML(k, a); const e = box.firstChild, n = EANIM[k].anims[a].n;
    const name = getComputedStyle(e).animationName;
    let back = 'n/a';
    if (a !== 'idle' && a !== 'dead') {
      e.dispatchEvent(new AnimationEvent('animationend', {bubbles: true}));
      back = getComputedStyle(e).animationName === 'run' + EANIM[k].anims.idle.n ? 'idle' : 'STUCK';
    }
    out.push([k, a, name === 'run' + n, back]);
  }
  for (const k in ART) if (ART[k].anims) for (const a in ART[k].anims) {
    box.innerHTML = stripHTML(k, '', '', a); const e = box.querySelector('.strip') || box.firstChild;
    out.push([k, a, getComputedStyle(e).animationName === 'run' + ART[k].anims[a].n, 'n/a']);
  }
  box.remove(); return out; }"""

DIMS = """async () => {
  const L = [], bad = [];
  for (const k in EANIM) { const E = EANIM[k]; for (const a in E.anims) L.push([k, a, E.anims[a], E.w / E.h]); }
  for (const k in ART) { const A = ART[k]; if (A.anims) for (const a in A.anims) L.push([k, a, A.anims[a], A.w / A.h]); }
  for (const [k, a, s, r] of L) { const im = new Image(); im.src = s.src; await im.decode().catch(() => {});
    if (Math.abs(im.naturalWidth / im.naturalHeight - s.n * r) > 0.01) bad.push(k + '/' + a); }
  return [L.length, bad]; }"""

async def main():
    port = serve(); url = f'http://127.0.0.1:{port}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 760})
        errs, missing = [], []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('response', lambda r: missing.append(r.url) if r.status >= 400 and '/art/' in r.url else None)
        await pg.goto(url)
        await pg.wait_for_function("typeof S!=='undefined' && S.screen==='home' && !!document.querySelector('[data-act]')", timeout=60000)
        print('Load'); check(not errs, f'no script errors on load {errs[:2]}'); check(not missing, f'all art files found {missing[:3]}')

        print('Sprite strips')
        n, bad = await pg.evaluate(DIMS); check(not bad, f'{n} strips match their frame counts {bad[:5]}')

        print('Animations')
        await pg.evaluate("()=>{startRun('runaway');enter({kind:'fight',mon:'rats'})}")
        rows = await pg.evaluate(AUDIT)
        dead = [f'{k}/{a}' for k, a, ok, _ in rows if not ok]
        stuck = [f'{k}/{a}' for k, a, _, back in rows if back == 'STUCK']
        check(not dead, f'{len(rows)} animations all play {dead[:6]}')
        check(not stuck, f'one-shot animations return to idle {stuck[:6]}')

        print('Zero-cost cards')
        r = await pg.evaluate("()=>{startRun('runaway');enter({kind:'fight',mon:'rats'});const f=run.fight;f.m.hp=99;f.plays=0;"
                              "f.hand=['flick','strike'];play(0);const free=f.hand.join()==='strike'&&f.m.hp===97;play(0);return [free,f.hand.includes('strike')]}")
        check(r == [True, True], f'a 0-cost card plays with no plays left; a 1-cost card does not {r}')

        print('Finishing blow')
        await pg.evaluate("()=>{startRun('runaway');enter({kind:'fight',mon:'rats'});const f=run.fight;f.m.hp=1;f.m.blk=0;f.plays=2;f.hand[0]='strike';play(0)}")
        mid = await pg.evaluate("()=>[document.querySelector('[data-hk]').className,S.dying||0]")
        await pg.wait_for_timeout(1600)
        after = await pg.evaluate("()=>S.dying||0")
        check('anim-atk' in mid[0] and mid[1] == 0 and after == 1, f'attack plays first, then the enemy dies {mid} -> {after}')

        print('Every enemy, both heroes')
        mons = await pg.evaluate("Object.keys(EANIM).filter(k=>k!=='saint2')")
        for hero in ['runaway', 'cutpurse']:
            for mon in mons:
                e0 = len(errs)
                await pg.evaluate(f"()=>{{startRun('{hero}');run.layer=MON2['{mon}']?2:1;enter({{kind:'fight',mon:'{mon}'}})}}")
                for _ in range(4):
                    await pg.evaluate("()=>{const f=run.fight;if(!f||S.dying||S.lock)return;f.m.hp=Math.max(f.m.hp,40);f.plays=2;play(0)}")
                    await pg.wait_for_timeout(60)
                    await pg.evaluate("()=>{if(!run.fight||S.dying||S.lock)return;run.hp=99;endTurn()}")
                    await pg.wait_for_timeout(60)
                if len(errs) > e0: check(False, f'{hero} vs {mon}: {errs[e0]}')
        check(not errs, f'{len(mons)*2} fights ran with no script errors')

        print('Drowned Saint phase 2')
        await pg.evaluate("()=>{startRun('runaway');run.layer=2;enter({kind:'fight',mon:'saint'});const f=run.fight;f.m.hp=1;f.m.blk=0;f.plays=2;f.hand[0]='strike';play(0)}")
        await pg.wait_for_timeout(6500)
        check(await pg.evaluate("()=>run.fight&&run.fight.m.id==='saint2'"), 'the Saint rises as the Saint Unveiled')
        await b.close()
    print(f"\n{'ALL PASSED' if not FAILS else str(len(FAILS)) + ' FAILED'}")
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
