/**
 * steps.sh 使用的資源（Introduction to Cluster）。
 *
 * sbatch 要到 2 台 node、每台 4 個 task 的 allocation；script 本身只在 batch host
 * （slurm-compute）執行；srun 開 step 0 用滿 8 個 task，srun -n 2 開 step 1 只用 2 個。
 * 右邊是 slurm-44.out，每一行都對應左邊某一格 task 的輸出。
 * 最後一步是反例：script 裡直接執行 ./a.out，另一台 node 整段時間閒置。
 */
import {makeScene2D, type Txt} from '@motion-canvas/2d';
import {all, delay, sequence, type ThreadGenerator} from '@motion-canvas/core';
import {COLOR, DIAGRAM, FONT} from '../theme';
import {step, flash, type Point} from '../components/motion';
import {makeKit} from '../components/kit';

const STEPS = 5;
const NODE = {x: 140, w: 940, h: 230, gap: 60};
const SLOT = {w: 200, h: 110, gap: 20, top: 92}; // top：相對於機器上緣
const SCRIPT = {w: 220, h: 52};
const PANEL = {x: 1200, w: 620};
const LINE = {first: 92, step: 42, size: 26};
const PAD = 28; // allocation 虛線框與機器之間
const BLOCK_H = 2 * NODE.h + NODE.gap + 2 * PAD;
const LABEL_H = 56; // 虛線框上方的標籤列
const TOP = DIAGRAM.top + (DIAGRAM.bottom - DIAGRAM.top - BLOCK_H - LABEL_H) / 2 + LABEL_H;
const ALLOC_Y = TOP; // 虛線框上緣
const nodeY = (n: number) => ALLOC_Y + PAD + n * (NODE.h + NODE.gap);
const slotX = (s: number) => NODE.x + 30 + s * (SLOT.w + SLOT.gap);
const slotMid = (n: number, s: number): Point => [slotX(s) + SLOT.w / 2, nodeY(n) + SLOT.top + SLOT.h / 2];
const SCRIPT_X = NODE.x + NODE.w - 24 - SCRIPT.w;
const SCRIPT_MID: Point = [SCRIPT_X + SCRIPT.w / 2, nodeY(0) + 12 + SCRIPT.h / 2];

/** slurm-44.out 的 11 行，依序是 script、step 0、step 1 的輸出 */
const OUTPUT = [
  'slurm-compute',
  ...Array(4).fill('slurm-compute'),
  ...Array(4).fill('slurm-head'),
  'slurm-compute',
  'slurm-compute',
];

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);

  const names = ['slurm-compute', 'slurm-head'];
  const nodes = [0, 1].map(n => k.box(NODE.x, nodeY(n), NODE.w, NODE.h, COLOR.node, names[n], {title: true}));
  const batchTag = k.text(NODE.x + 290, nodeY(0) + 36, 'Batch host', {fill: COLOR.dim});
  const slots = [0, 1].map(n =>
    [0, 1, 2, 3].map(s => k.box(slotX(s), nodeY(n) + SLOT.top, SLOT.w, SLOT.h, COLOR.page, 'idle', {
      size: FONT.label,
      fill: COLOR.dim,
    })),
  );
  const script = k.box(SCRIPT_X, nodeY(0) + 12, SCRIPT.w, SCRIPT.h, COLOR.service, 'steps.sh', {size: FONT.label});

  const alloc = k.box(NODE.x - PAD, ALLOC_Y, NODE.w + 2 * PAD, BLOCK_H, 'rgba(0,0,0,0)', undefined, {dash: true});
  const allocLabel = k.text(NODE.x - PAD, ALLOC_Y - 30, 'Job 44 allocation, 2 nodes x 4 tasks', {fill: COLOR.dim});

  const panel = k.box(PANEL.x, ALLOC_Y, PANEL.w, BLOCK_H, COLOR.page, 'slurm-44.out', {title: true});
  const lines: Txt[] = OUTPUT.map((t, i) =>
    k.text(PANEL.x + 24, ALLOC_Y + LINE.first + i * LINE.step, t, {size: LINE.size}),
  );

  /** 一個 task：卡片從 script 走到格子，格子亮起並顯示 hostname。 */
  const task = (n: number, s: number, label = 'hostname', d = 0.7): ThreadGenerator => {
    const [x, y] = slotMid(n, s);
    return all(
      k.send(label, [SCRIPT_MID, [x, SCRIPT_MID[1]], [x, y]], d, {trail: false}),
      delay(d + 0.2, all(
        slots[n][s].label!.text(label, 0.15),
        slots[n][s].label!.fill(COLOR.ink, 0.15),
        flash(slots[n][s].rect, COLOR.service),
      )),
    );
  };
  /** 格子全部回到 idle */
  const reset = (): ThreadGenerator =>
    all(...slots.flat().map(b => all(b.rect.fill(COLOR.page, 0.2), b.label!.text('idle', 0.2), b.label!.fill(COLOR.dim, 0.2))));
  const print = (from: number, to: number, at: number): ThreadGenerator =>
    delay(at, sequence(0.08, ...lines.slice(from, to).map(l => l.opacity(1, 0.15))));

  yield* sequence(
    0.1,
    ...[0, 1].map(n => all(k.showBox(nodes[n]), ...slots[n].map(b => k.showBox(b)))),
    all(k.show([batchTag]), k.showBox(panel)),
  );
  yield* k.ready();

  yield* step('allocate');
  yield* all(
    k.begin(1, 'Allocate', 'sbatch 先向 Slurm 要一塊資源：2 台 node，每台 4 個 task。'),
    k.showBox(alloc, 0.3),
    delay(0.15, k.show([allocLabel])),
    delay(0.2, all(...slots.flat().map(b => flash(b.rect, COLOR.page)))),
  );

  yield* step('script');
  yield* all(
    k.begin(2, 'Batch script', 'script 本身只在 batch host，也就是 slurm-compute 上執行。'),
    k.showBox(script),
    delay(0.2, flash(script.rect)),
    delay(0.4, k.send('hostname', [SCRIPT_MID, [PANEL.x + 160, SCRIPT_MID[1]], [PANEL.x + 160, ALLOC_Y + LINE.first]], 0.9, {
      trail: false,
    })),
    print(0, 1, 1.4),
  );

  yield* step('step0');
  yield* all(
    k.begin(3, 'Step 0', 'step 0：srun 用滿整塊 allocation，共 8 個 task。'),
    ...[0, 1].flatMap(n => [0, 1, 2, 3].map(s => delay((n * 4 + s) * 0.06, task(n, s)))),
    print(1, 9, 1.6),
  );

  yield* step('step1');
  yield* all(
    k.begin(4, 'Step 1', 'step 1：srun -n 2 只使用其中 2 個 task。'),
    reset(),
    delay(0.3, all(task(0, 0), delay(0.06, task(0, 1)))),
    print(9, 11, 1.4),
  );

  // 反例：沒有 srun，./a.out 只在 batch host 的一個 task 上執行。
  yield* step('noSrun');
  yield* all(
    k.begin(5, 'Without srun', '在 script 裡直接執行 ./a.out、沒有加 srun，程式只在 batch host 上跑，另一台 node 整段時間閒置。'),
    reset(),
    k.hide(lines, 0.2),
    script.label!.text('./a.out', 0.2),
    delay(0.3, task(0, 0, 'a.out')),
    delay(0.3, all(nodes[1].rect.stroke(COLOR.accent, 0.3), nodes[1].rect.lineWidth(5, 0.3))),
  );
});
