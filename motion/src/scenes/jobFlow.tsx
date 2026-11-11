/**
 * 一個 job 的流程（Introduction to Cluster）：Login Node 送出，slurmctld 派送，
 * Compute Node 執行，輸出寫進 Shared Storage，再從 Login Node 讀回來。
 * 最後一步是反例：沒有共用儲存時，輸出留在 Compute Node 的本機磁碟。
 */
import {Rect, makeScene2D} from '@motion-canvas/2d';
import {all, delay, easeInOutCubic, sequence} from '@motion-canvas/core';
import {COLOR, DIAGRAM, ROW} from '../theme';
import {step} from '../components/motion';
import {makeKit} from '../components/kit';

const STEPS = 6;
const W = 440; // 一台機器的寬度
const GAP = 180; // 機器之間的通道，放箭頭的標籤
const X = [0, 1, 2].map(i => DIAGRAM.left + 40 + i * (W + GAP)); // 120, 740, 1360
const H = ROW.title + 3 * ROW.svc + 2 * ROW.gap + ROW.pad; // 312
const STORE_GAP = 150;
const STORE_H = 80;
const TOTAL_H = H + STORE_GAP + STORE_H;
const TOP = DIAGRAM.top + (DIAGRAM.bottom - DIAGRAM.top - TOTAL_H) / 2;
const STORE_Y = TOP + H + STORE_GAP;
/** 第 r 列服務方塊的上緣與中心 */
const rowTop = (r: number) => TOP + ROW.title + r * (ROW.svc + ROW.gap);
const rowMid = (r: number) => rowTop(r) + ROW.svc / 2;
const IN_X = (i: number) => X[i] + ROW.pad;
const IN_W = W - 2 * ROW.pad;
const MID = (i: number) => X[i] + W / 2;
const STORE_MID = STORE_Y + STORE_H / 2;

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);

  const login = k.box(X[0], TOP, W, H, COLOR.node, 'Login Node', {title: true});
  const sbatch = k.box(IN_X(0), rowTop(0), IN_W, ROW.svc, COLOR.service, 'sbatch job.sh');
  const cat = k.box(IN_X(0), rowTop(1), IN_W, ROW.svc, COLOR.page, 'cat slurm-42.out');
  const result = k.box(IN_X(0), rowTop(2), IN_W, ROW.svc, COLOR.page, 'Job 42 output');

  const head = k.box(X[1], TOP, W, H, COLOR.node, 'Head Node', {title: true});
  const ctld = k.box(IN_X(1), rowTop(0), IN_W, ROW.svc, COLOR.service, 'slurmctld');
  const queue = k.box(IN_X(1), rowTop(1), IN_W, ROW.svc, COLOR.page, 'Queue empty');

  const compute = k.box(X[2], TOP, W, H, COLOR.node, 'Compute Node', {title: true});
  const slurmd = k.box(IN_X(2), rowTop(0), IN_W, ROW.svc, COLOR.service, 'slurmd');
  const slot = k.box(IN_X(2), rowTop(1), IN_W, ROW.svc, COLOR.page);
  // 進度條：錨點在左緣，寬度從 0 長到整格。
  const progress = (
    <Rect
      position={[IN_X(2) + 1, rowMid(1)]}
      offset={[-1, 0]}
      width={0}
      height={ROW.svc - 2}
      fill={COLOR.storage}
    />
  ) as Rect;
  k.layers.shapes().add(progress);
  const slotText = k.text(MID(2), rowMid(1), 'idle', {align: 'center'});
  const disk = k.box(IN_X(2), rowTop(2), IN_W, ROW.svc, COLOR.page);
  const diskName = k.text(IN_X(2) + 20, rowMid(2), 'Local disk');
  const diskFile = k.text(IN_X(2) + IN_W - 20, rowMid(2), 'slurm-42.out', {align: 'right'});

  const store = k.box(X[0], STORE_Y, X[2] + W - X[0], STORE_H, COLOR.storage, 'Shared Storage', {
    bold: true,
  });
  /** 寫進共用儲存的檔案，出現在 Compute Node 正下方。 */
  const FILE_W = 300;
  const file = k.box(MID(2) - FILE_W / 2, STORE_MID - 26, FILE_W, 52, COLOR.page, 'slurm-42.out', {
    size: 28,
  });

  const submit = k.link([[X[0] + W, rowMid(0)], [X[1], rowMid(0)]]);
  const submitLabel = k.text((X[0] + W + X[1]) / 2, rowMid(0) - 34, 'Submit', {align: 'center'});
  const dispatch = k.link([[X[1] + W, rowMid(0)], [X[2], rowMid(0)]]);
  const dispatchLabel = k.text((X[1] + W + X[2]) / 2, rowMid(0) - 34, 'Dispatch', {align: 'center'});
  const write = k.link([[MID(2), TOP + H], [MID(2), STORE_Y]]);
  const writeLabel = k.text(MID(2) + 16, (TOP + H + STORE_Y) / 2, 'Write');
  const read = k.link([[MID(0), STORE_Y], [MID(0), TOP + H]]);
  const readLabel = k.text(MID(0) + 16, (TOP + H + STORE_Y) / 2, 'Read');

  // 開場：三台機器依序長出來，再畫線與共用儲存。
  yield* sequence(
    0.1,
    all(k.showBox(login), k.showBox(sbatch)),
    all(k.showBox(head), k.showBox(ctld), k.showBox(queue)),
    all(k.showBox(compute), k.showBox(slurmd), k.showBox(slot), k.show([slotText])),
  );
  yield* all(
    k.drawn([submit, dispatch]),
    k.show([submitLabel, dispatchLabel]),
    delay(0.15, all(k.showBox(store), k.drawn([write, read]), k.show([writeLabel, readLabel]))),
    k.ready(),
  );

  yield* step('submit');
  yield* all(
    k.begin(1, 'Submit', '使用者在 Login Node 以 sbatch 送出 job，交給 Head Node 的 slurmctld。'),
    k.send('Job 42', [[MID(0), rowMid(0)], [MID(1), rowMid(0)]], 1.0, {
      target: ctld.rect,
      trail: [[X[0] + W, rowMid(0)], [X[1], rowMid(0)]],
    }),
    delay(1.1, queue.label!.text('Job 42 pending', 0.3)),
  );

  yield* step('dispatch');
  yield* all(
    k.begin(2, 'Dispatch', 'slurmctld 排程後，把 job 派送給 Compute Node 的 slurmd。'),
    queue.label!.text('Job 42 scheduled', 0.3),
    delay(0.3, k.send('Job 42', [[MID(1), rowMid(0)], [MID(2), rowMid(0)]], 1.0, {
      target: slurmd.rect,
      trail: [[X[1] + W, rowMid(0)], [X[2], rowMid(0)]],
    })),
    delay(1.4, all(queue.label!.text('Queue empty', 0.3), slotText.text('Job 42', 0.3))),
  );

  yield* step('run');
  yield* all(
    k.begin(3, 'Run', 'slurmd 在 Compute Node 上執行 job。'),
    slotText.text('Job 42 running', 0.25),
    delay(0.2, progress.width(IN_W - 2, 1.6, easeInOutCubic)),
    delay(1.85, slotText.text('Job 42 done', 0.25)),
  );

  yield* step('write');
  yield* all(
    k.begin(4, 'Write output', 'job 的輸出寫到 Shared Storage 上的 slurm-42.out。'),
    k.send('slurm-42.out', [[MID(2), rowMid(1)], [MID(2), STORE_MID]], 0.9, {
      target: store.rect,
      settle: COLOR.storage,
      trail: [[MID(2), TOP + H], [MID(2), STORE_Y]],
    }),
    delay(1.0, k.showBox(file)),
  );

  yield* step('read');
  yield* all(
    k.begin(5, 'Read output', '使用者回到 Login Node，就能直接讀取同一個檔案。'),
    k.showBox(cat),
    delay(0.3, k.send('slurm-42.out', [[MID(2), STORE_MID], [MID(0), STORE_MID], [MID(0), rowMid(2)]], 1.6, {
      trail: [[MID(0), STORE_Y], [MID(0), TOP + H]],
    })),
    delay(1.95, all(k.showBox(result), result.rect.fill(COLOR.flash, 0.17).to(COLOR.page, 0.23))),
  );

  // 反例：拿掉共用儲存，輸出只寫進 Compute Node 的本機磁碟。
  yield* step('noShared');
  yield* all(
    k.begin(6, 'Without shared storage', '沒有共用儲存時，輸出只留在 Compute Node 的本機磁碟，Login Node 讀不到。'),
    k.hide([store.rect, store.label, file.rect, file.label, write, writeLabel, read, readLabel], 0.3),
    delay(0.2, all(
      k.showBox(disk),
      k.show([diskName]),
      disk.rect.stroke(COLOR.accent, 0.2),
      disk.rect.lineWidth(4, 0.2),
    )),
    delay(0.4, k.send('slurm-42.out', [[MID(2), rowMid(1)], [MID(2), rowMid(2)]], 0.6, {
      trail: false,
    })),
    delay(1.2, k.show([diskFile])),
    delay(1.4, result.label!.text('No such file', 0.3)),
  );
});
