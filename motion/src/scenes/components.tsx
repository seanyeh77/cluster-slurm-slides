/**
 * Slurm 的元件（Building and Installing Slurm）：指令把請求送給 slurmctld，
 * slurmctld 派送給每台 Compute Node 的 slurmd，記帳經 slurmdbd 寫進 MariaDB。
 */
import {makeScene2D} from '@motion-canvas/2d';
import {all, delay, sequence} from '@motion-canvas/core';
import {COLOR, DIAGRAM, ROW} from '../theme';
import {step, type Point} from '../components/motion';
import {makeKit} from '../components/kit';

const STEPS = 3;
const COL = {a: 160, b: 1040, w: 680}; // 左欄：Login、Head、Compute；右欄：DBD、MariaDB
const NODE_H = ROW.title + ROW.svc + 22; // 150
const GAP1 = 100; // Login 到 Head
const GAP2 = 120; // Head 到 Compute，放分岔
const CMP = {w: 320, h: NODE_H};
const TOTAL_H = NODE_H + GAP1 + NODE_H + GAP2 + CMP.h;
const TOP = DIAGRAM.top + (DIAGRAM.bottom - DIAGRAM.top - TOTAL_H) / 2;
const HEAD_Y = TOP + NODE_H + GAP1;
const CMP_Y = HEAD_Y + NODE_H + GAP2;
const FORK_Y = HEAD_Y + NODE_H + GAP2 / 2;
const A_MID = COL.a + COL.w / 2; // 500
const B_MID = COL.b + COL.w / 2;
const cmpX = [COL.a, COL.a + COL.w - CMP.w];
const cmpMid = cmpX.map(x => x + CMP.w / 2);
const svcY = (top: number) => top + ROW.title;
const svcMid = (top: number) => svcY(top) + ROW.svc / 2;

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);
  const inner = (x: number, w: number, top: number, text: string, fill = COLOR.service) =>
    k.box(x + ROW.pad, svcY(top), w - 2 * ROW.pad, ROW.svc, fill, text);

  const login = k.box(COL.a, TOP, COL.w, NODE_H, COLOR.node, 'Login Node', {title: true});
  const cmds = inner(COL.a, COL.w, TOP, 'sbatch, srun, sinfo');
  const head = k.box(COL.a, HEAD_Y, COL.w, NODE_H, COLOR.node, 'Head Node', {title: true});
  const ctld = inner(COL.a, COL.w, HEAD_Y, 'slurmctld');
  const computes = cmpX.map(x => k.box(x, CMP_Y, CMP.w, CMP.h, COLOR.node, 'Compute Node', {title: true}));
  const slurmds = cmpX.map(x => inner(x, CMP.w, CMP_Y, 'slurmd'));
  const dbd = k.box(COL.b, HEAD_Y, COL.w, NODE_H, COLOR.node, 'DBD Node', {title: true});
  const slurmdbd = inner(COL.b, COL.w, HEAD_Y, 'slurmdbd');
  const db = k.box(COL.b, CMP_Y, COL.w, CMP.h, COLOR.storage, 'MariaDB', {title: true});
  const table = inner(COL.b, COL.w, CMP_Y, 'slurm_acct_db', COLOR.page);

  const submit = k.link([[A_MID, TOP + NODE_H], [A_MID, HEAD_Y]]);
  const submitLabel = k.text(A_MID + 16, TOP + NODE_H + GAP1 / 2, 'Submit');
  const trunk = k.link([[A_MID, HEAD_Y + NODE_H], [A_MID, FORK_Y]], {arrow: false});
  const forks = cmpMid.map(x => k.link([[A_MID, FORK_Y], [x, FORK_Y], [x, CMP_Y]]));
  const dispatchLabel = k.text(A_MID + 16, (HEAD_Y + NODE_H + FORK_Y) / 2, 'Dispatch');
  const acct = k.link([[COL.a + COL.w, svcMid(HEAD_Y)], [COL.b, svcMid(HEAD_Y)]]);
  const acctLabel = k.text((COL.a + COL.w + COL.b) / 2, svcMid(HEAD_Y) - 34, 'Accounting', {align: 'center'});
  const store = k.link([[B_MID, HEAD_Y + NODE_H], [B_MID, CMP_Y]]);
  const storeLabel = k.text(B_MID + 16, (HEAD_Y + NODE_H + CMP_Y) / 2, 'Store');

  yield* sequence(
    0.1,
    all(k.showBox(login), k.showBox(cmds)),
    all(k.drawn([submit]), k.show([submitLabel]), k.showBox(head), k.showBox(ctld)),
    all(
      k.drawn([trunk, ...forks]),
      k.show([dispatchLabel]),
      ...computes.map(c => k.showBox(c)),
      ...slurmds.map(s => k.showBox(s)),
    ),
    all(k.drawn([acct]), k.show([acctLabel]), k.showBox(dbd), k.showBox(slurmdbd)),
    all(k.drawn([store]), k.show([storeLabel]), k.showBox(db), k.showBox(table)),
  );
  yield* k.ready();

  yield* step('submit');
  yield* all(
    k.begin(1, 'Submit', '使用者以 sbatch、srun、sinfo 把請求送給 Head Node 上的 slurmctld。'),
    k.send('Request', [[A_MID, svcMid(TOP)], [A_MID, svcMid(HEAD_Y)]], 0.8, {
      target: ctld.rect,
      trail: [[A_MID, TOP + NODE_H], [A_MID, HEAD_Y]],
    }),
  );

  yield* step('dispatch');
  const toCompute = (i: number): Point[] => [
    [A_MID, svcMid(HEAD_Y)],
    [A_MID, FORK_Y],
    [cmpMid[i], FORK_Y],
    [cmpMid[i], svcMid(CMP_Y)],
  ];
  yield* all(
    k.begin(2, 'Dispatch', 'slurmctld 把 job 派送給每台 Compute Node 上的 slurmd。'),
    ...[0, 1].map(i =>
      delay(i * 0.12, k.send('Job 42', toCompute(i), 1.1, {
        target: slurmds[i].rect,
        trail: [[A_MID, HEAD_Y + NODE_H], [A_MID, FORK_Y], [cmpMid[i], FORK_Y], [cmpMid[i], CMP_Y]],
      })),
    ),
  );

  yield* step('accounting');
  yield* all(
    k.begin(3, 'Accounting', 'slurmctld 把記帳資料交給 slurmdbd，由 slurmdbd 寫入 MariaDB。'),
    k.send('Record', [[A_MID, svcMid(HEAD_Y)], [B_MID, svcMid(HEAD_Y)]], 0.9, {
      target: slurmdbd.rect,
      trail: [[COL.a + COL.w, svcMid(HEAD_Y)], [COL.b, svcMid(HEAD_Y)]],
    }),
    delay(1.15, k.send('Record', [[B_MID, svcMid(HEAD_Y)], [B_MID, svcMid(CMP_Y)]], 0.8, {
      target: table.rect,
      settle: COLOR.page,
      trail: [[B_MID, HEAD_Y + NODE_H], [B_MID, CMP_Y]],
    })),
  );
});
