"""Cut a PixelLab sprite sheet into the game's animation strips.

Usage:
  python3 tools/slice_sheet.py SHEET.png NAME --rows "idle=8,hurt=2,atk=6,dead=5" [--cell 256] [--scale 0.5] [--kind enemies]

  SHEET   the sheet exactly as exported (transparent PNG, one animation per row, equal-size cells)
  NAME    folder name, e.g. gargoyle-frog  -> art/enemies/gargoyle-frog/<anim>.png
  --rows  animation=row number, counting the top row as 1 (row 1 is usually the rotation; skip it)
  --cell  frame size on the sheet; guessed from the sheet if left out
  --scale 0.5 for 256 sheets of regular mobs and heroes, 0.6667 for bosses, 1 for sheets drawn at game size
  --kind  enemies (default) or heroes

Frame counts are detected per row (empty cells at the end are dropped). Prints the entry to paste into
src/sprites/enemies.js (enemies) or the anims list for src/art.js (heroes).
"""
import argparse, os, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def guess_cell(im):
    a = np.array(im)[..., 3] > 0
    for c in (256, 216, 192, 171, 168, 160, 136, 128, 124, 116):
        if im.width % c == 0 and im.height % c == 0:
            return c
    sys.exit('Could not guess the cell size; pass --cell')

def downscale(img, size, colors=96):
    """Shrink with coverage-weighted averaging, then snap back to hard pixel art (no soft edges)."""
    a = np.array(img).astype(np.float32); al = a[..., 3:4] / 255
    pre = np.dstack([a[..., :3] * al, al * 255])
    ch = [np.array(Image.fromarray(pre[..., k]).resize((size, size), Image.BOX)) for k in range(4)]
    A = ch[3] / 255; rgb = np.dstack(ch[:3]) / np.maximum(A, 1e-6)[..., None]
    return np.dstack([rgb, np.where(A >= .5, 255, 0)]).clip(0, 255).astype(np.uint8)

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('sheet'); ap.add_argument('name')
    ap.add_argument('--rows', required=True); ap.add_argument('--cell', type=int)
    ap.add_argument('--scale', type=float, default=1.0); ap.add_argument('--kind', default='enemies')
    o = ap.parse_args()
    im = Image.open(o.sheet).convert('RGBA'); C = o.cell or guess_cell(im)
    out = round(C * o.scale); cols = im.width // C
    dest = os.path.join(ROOT, 'art', o.kind, o.name); os.makedirs(dest, exist_ok=True)
    frames_all = []; entries = []
    for spec in o.rows.split(','):
        anim, row = spec.split('='); r = int(row) - 1
        cells = [im.crop((c * C, r * C, (c + 1) * C, (r + 1) * C)) for c in range(cols)]
        while cells and not np.array(cells[-1])[..., 3].any(): cells.pop()
        if not cells: sys.exit(f'Row {row} ({anim}) is empty')
        if o.scale != 1: cells = [Image.fromarray(downscale(c, out), 'RGBA') for c in cells]
        strip = Image.new('RGBA', (out * len(cells), out))
        for i, c in enumerate(cells): strip.paste(c, (i * out, 0))
        frames_all.append((anim, strip, len(cells)))
    # one shared palette across every strip keeps colours identical between animations
    if o.scale != 1:
        big = Image.new('RGBA', (max(s.width for _, s, _ in frames_all), out * len(frames_all)))
        for i, (_, s, _) in enumerate(frames_all): big.paste(s, (0, i * out))
        arr = np.array(big); pal = Image.fromarray(arr[..., :3]).quantize(96, method=Image.MEDIANCUT, dither=Image.Dither.NONE).convert('RGB')
        q = np.dstack([np.array(pal), arr[..., 3]]).astype(np.uint8)
        frames_all = [(a, Image.fromarray(q[i * out:(i + 1) * out, :s.width], 'RGBA'), n) for i, (a, s, n) in enumerate(frames_all)]
    for anim, strip, n in frames_all:
        path = os.path.join(dest, anim + '.png'); strip.save(path, optimize=True)
        entries.append(f"{anim}:{{src:'art/{o.kind}/{o.name}/{anim}.png',n:{n}}}")
        print(f'  {anim:8s} {n:2d} frames -> art/{o.kind}/{o.name}/{anim}.png')
    idle = dict((a, s) for a, s, _ in frames_all).get('idle', frames_all[0][1])
    ys = np.where(np.array(idle)[..., 3].any(1))[0]; pad = out - 1 - ys.max(); drop = max(0, pad - 4)
    print(f'\nCharacter is {ys.max() - ys.min() + 1}px tall on a {out}px canvas.')
    if o.kind == 'enemies':
        print('\nPaste into EANIM in src/sprites/enemies.js (use the enemy id from src/data/enemies.js as the key):\n')
        print(f"ENEMY_ID:{{w:{out},h:{out},pix:1,scale:1,drop:{drop},noflip:1,anims:{{{','.join(entries)}}}}},")
        print('\nnoflip:1 means the sheet already faces left, toward the hero. Remove it if the sheet faces right.')
    else:
        print('\nanims for src/art.js:\n'); print('{' + ','.join(entries) + '}')

if __name__ == '__main__': main()
