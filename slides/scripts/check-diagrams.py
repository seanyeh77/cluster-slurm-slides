"""Check every SVG diagram of the built deck at every click step.

Usage (after `npm run build`):
    uv run --with playwright python scripts/check-diagrams.py dist [out-dir]
    (first time: uv run --with playwright playwright install chromium)

For each slide that shows an SVG diagram, the script steps through all clicks
and reports, in SVG user units:
  line-in-box   a line runs inside a box instead of ending at its edge
  line-on-text  a line crosses a text label
  text-overlap  two text labels overlap
  text-out-box  a label sticks out of the box it sits in
  clipped       something lies outside the viewBox, so its edge would be cut
It also saves a full-resolution screenshot of the diagram at every step to
out-dir (default: diagram-shots) for a visual check. Exit code 1 when any
issue is found.
"""
import asyncio
import json
import subprocess
import sys
from pathlib import Path

from playwright.async_api import async_playwright

DIST = sys.argv[1] if len(sys.argv) > 1 else 'dist'
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'diagram-shots')
PORT = 8791

# Runs in the page: inspect the visible SVG diagrams of the current slide.
INSPECT = r'''() => {
  const EPS = 1.5;
  const hidden = (el) => {
    for (let e = el; e && e.tagName !== 'svg'; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || +cs.opacity === 0) return true;
    }
    return false;
  };
  const shown = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const svgs = [...document.querySelectorAll('.slidev-layout svg')]
    .filter((s) => shown(s) && s.viewBox.baseVal && s.viewBox.baseVal.width > 0 && (s.closest('.sd') || s.classList.contains('dg')));
  const out = [];
  svgs.forEach((svg, si) => {
    const vb = svg.viewBox.baseVal;
    const issues = [];
    const rects = [], texts = [], segs = [];
    svg.querySelectorAll('rect, text, line, path').forEach((el) => {
      if (el.closest('defs, marker') || hidden(el)) return;
      const tag = el.tagName;
      if (tag === 'rect') {
        const b = el.getBBox();
        if (b.width > 0 && b.height > 0) rects.push({ x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height, el });
      } else if (tag === 'text') {
        if (!el.textContent.trim()) return;
        const b = el.getBBox();
        texts.push({ x0: b.x, y0: b.y, x1: b.x + b.width, y1: b.y + b.height, t: el.textContent.trim() });
      } else if (tag === 'line') {
        segs.push([+el.getAttribute('x1'), +el.getAttribute('y1'), +el.getAttribute('x2'), +el.getAttribute('y2')]);
      } else {
        // Absolute M, L, H, V paths only (the diagrams draw elbowed lines this way).
        const d = el.getAttribute('d') || '';
        const toks = d.match(/[MLHVZ]|-?[\d.]+/gi) || [];
        let x = 0, y = 0, cmd = 'M', i = 0, sx = 0, sy = 0;
        while (i < toks.length) {
          if (/[A-Z]/i.test(toks[i])) { cmd = toks[i++]; if (cmd === 'Z') { segs.push([x, y, sx, sy]); x = sx; y = sy; } continue; }
          if (cmd === 'M') { x = +toks[i++]; y = +toks[i++]; sx = x; sy = y; cmd = 'L'; }
          else if (cmd === 'L') { const nx = +toks[i++], ny = +toks[i++]; segs.push([x, y, nx, ny]); x = nx; y = ny; }
          else if (cmd === 'H') { const nx = +toks[i++]; segs.push([x, y, nx, y]); x = nx; }
          else if (cmd === 'V') { const ny = +toks[i++]; segs.push([x, y, x, ny]); y = ny; }
          else i++;
        }
      }
    });
    const fmt = (n) => Math.round(n);
    // Overlap length of an axis-aligned segment with the open interior of a box.
    const inside = (s, r, m) => {
      const [x1, y1, x2, y2] = s;
      if (Math.abs(y1 - y2) < 0.01) {
        if (y1 <= r.y0 + m || y1 >= r.y1 - m) return 0;
        return Math.max(0, Math.min(Math.max(x1, x2), r.x1 - m) - Math.max(Math.min(x1, x2), r.x0 + m));
      }
      if (Math.abs(x1 - x2) < 0.01) {
        if (x1 <= r.x0 + m || x1 >= r.x1 - m) return 0;
        return Math.max(0, Math.min(Math.max(y1, y2), r.y1 - m) - Math.max(Math.min(y1, y2), r.y0 + m));
      }
      return 0;
    };
    const segStr = (s) => `(${s.map(fmt).join(',')})`;
    segs.forEach((s) => {
      // A line may end on a box edge but must not run through the box.
      // Boxes that contain the whole segment are containers it is drawn in.
      rects.forEach((r) => {
        const len = inside(s, r, EPS);
        const segLen = Math.hypot(s[2] - s[0], s[3] - s[1]);
        if (len > 2 && len < segLen - 0.5) issues.push(`line-in-box ${segStr(s)} enters box (${fmt(r.x0)},${fmt(r.y0)},${fmt(r.x1)},${fmt(r.y1)}) for ${fmt(len)}`);
      });
      texts.forEach((t) => { if (inside(s, t, 0) > 0.5) issues.push(`line-on-text ${segStr(s)} crosses "${t.t}"`); });
      [[s[0], s[1]], [s[2], s[3]]].forEach(([x, y]) => {
        if (x < vb.x || y < vb.y || x > vb.x + vb.width || y > vb.y + vb.height) issues.push(`clipped line end (${fmt(x)},${fmt(y)})`);
      });
    });
    for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
      const a = texts[i], b = texts[j];
      if (a.x0 < b.x1 - 1 && b.x0 < a.x1 - 1 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1) issues.push(`text-overlap "${a.t}" and "${b.t}"`);
    }
    texts.forEach((t) => {
      const cx = (t.x0 + t.x1) / 2, cy = (t.y0 + t.y1) / 2;
      const host = rects.filter((r) => cx > r.x0 && cx < r.x1 && cy > r.y0 && cy < r.y1)
        .sort((a, b) => (a.x1 - a.x0) * (a.y1 - a.y0) - (b.x1 - b.x0) * (b.y1 - b.y0))[0];
      if (host && (t.x0 < host.x0 + 2 || t.x1 > host.x1 - 2 || t.y0 < host.y0 || t.y1 > host.y1)) issues.push(`text-out-box "${t.t}"`);
      if (t.x0 < vb.x || t.y0 < vb.y || t.x1 > vb.x + vb.width || t.y1 > vb.y + vb.height) issues.push(`clipped text "${t.t}"`);
    });
    rects.forEach((r) => {
      const sw = 1; // half of the 2 px stroke
      if (r.x0 - sw < vb.x || r.y0 - sw < vb.y || r.x1 + sw > vb.x + vb.width || r.y1 + sw > vb.y + vb.height) issues.push(`clipped box (${fmt(r.x0)},${fmt(r.y0)},${fmt(r.x1)},${fmt(r.y1)})`);
    });
    const b = svg.getBoundingClientRect();
    out.push({ si, issues: [...new Set(issues)], box: [b.x, b.y, b.width, b.height] });
  });
  return out;
}'''


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    srv = subprocess.Popen(['python3', '-m', 'http.server', str(PORT), '-d', DIST],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    found = []
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page(viewport={'width': 1920, 'height': 1080})
            await page.goto(f'http://localhost:{PORT}/index.html#/1')
            await page.wait_for_timeout(2500)
            total = int((await page.evaluate('() => document.querySelector(".tb-page")?.textContent || "0 / 0"')).split('/')[1])
            prev, step = None, 0
            for _ in range(5000):
                cur = int((await page.evaluate('() => location.hash')).split('/')[1].split('?')[0])
                step = step + 1 if cur == prev else 0
                if cur == prev and step > 40:
                    break
                prev = cur
                await page.wait_for_timeout(700)  # let fades finish
                for d in await page.evaluate(INSPECT):
                    x, y, w, h = d['box']
                    await page.screenshot(path=str(OUT / f'p{cur:03d}-s{step}-{d["si"]}.png'),
                                          clip={'x': max(0, x - 8), 'y': max(0, y - 8), 'width': w + 16, 'height': h + 16})
                    for issue in d['issues']:
                        found.append([cur, step, issue])
                if cur == total and step > 12:
                    break
                await page.keyboard.press('ArrowRight')
                await page.wait_for_timeout(120)
            await browser.close()
    finally:
        srv.terminate()
    for cur, step, issue in found:
        print(f'slide {cur} step {step}: {issue}')
    (OUT / 'report.json').write_text(json.dumps(found, ensure_ascii=False, indent=1))
    print(f'{len(found)} issue(s); screenshots in {OUT}')
    sys.exit(1 if found else 0)


asyncio.run(main())
