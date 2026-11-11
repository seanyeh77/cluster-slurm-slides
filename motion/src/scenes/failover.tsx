/**
 * slurmctld 的 active-standby 備援（Building and Installing Slurm）。
 *
 * head1 執行 primary，持續把狀態寫入 StateSaveLocation；head2 以 heartbeat 確認它還在。
 * head1 超過 SlurmctldTimeout（預設 120 秒）沒有回應，head2 讀取最後的狀態接手，
 * Compute Node 的 slurmd 改連 head2。
 */
import {makeScene2D} from '@motion-canvas/2d';
import {all, createSignal, delay, linear, sequence} from '@motion-canvas/core';
import {COLOR, DIAGRAM, FONT, ROW} from '../theme';
import {step, flash, type Point} from '../components/motion';
import {makeKit} from '../components/kit';

const STEPS = 3;
const LEFT = 140;
const RIGHT = 1780;
const CMP_H = 150;
const HEAD = {w: 600, h: ROW.title + ROW.svc + 26};
const STORE_H = 90;
const GAP1 = 130; // Compute Nodes 到 head
const GAP2 = 130; // head 到 StateSaveLocation
const TOTAL_H = CMP_H + GAP1 + HEAD.h + GAP2 + STORE_H;
const TOP = DIAGRAM.top + (DIAGRAM.bottom - DIAGRAM.top - TOTAL_H) / 2;
const HEAD_Y = TOP + CMP_H + GAP1;
const STORE_Y = HEAD_Y + HEAD.h + GAP2;
const HX = [LEFT, RIGHT - HEAD.w]; // head1、head2 的左緣
const HMID = HX.map(x => x + HEAD.w / 2);
const SVC_Y = HEAD_Y + ROW.title;
const SVC_MID = SVC_Y + ROW.svc / 2;
const SLURMD = {w: 220, gap: 40};
const slurmdX = (i: number) => (1920 - (4 * SLURMD.w + 3 * SLURMD.gap)) / 2 + i * (SLURMD.w + SLURMD.gap);
const TIMEOUT = 120; // 秒，SlurmctldTimeout 的預設值

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);

  const cmp = k.box(LEFT, TOP, RIGHT - LEFT, CMP_H, COLOR.cluster, 'Compute Nodes', {title: true});
  const slurmds = [0, 1, 2, 3].map(i => k.box(slurmdX(i), TOP + ROW.title, SLURMD.w, ROW.svc, COLOR.service, 'slurmd'));
  const heads = [0, 1].map(i => k.box(HX[i], HEAD_Y, HEAD.w, HEAD.h, COLOR.node, `head${i + 1}`, {title: true}));
  const ctlds = [0, 1].map(i =>
    k.box(HX[i] + ROW.pad, SVC_Y, HEAD.w - 2 * ROW.pad, ROW.svc, COLOR.service, i === 0 ? 'slurmctld Primary' : 'slurmctld Backup'),
  );
  const store = k.box(LEFT, STORE_Y, RIGHT - LEFT, STORE_H, COLOR.storage, 'StateSaveLocation');

  const connect = [0, 1].map(i => k.link([[HMID[i], TOP + CMP_H], [HMID[i], HEAD_Y]]));
  const connectLabels = [0, 1].map(i => k.text(HMID[i] + 16, TOP + CMP_H + GAP1 / 2, 'Connect'));
  const write = k.link([[HMID[0], HEAD_Y + HEAD.h], [HMID[0], STORE_Y]]);
  const writeLabel = k.text(HMID[0] + 16, HEAD_Y + HEAD.h + GAP2 / 2, 'Write state');
  const read = k.link([[HMID[1], STORE_Y], [HMID[1], HEAD_Y + HEAD.h]]);
  const readLabel = k.text(HMID[1] + 16, HEAD_Y + HEAD.h + GAP2 / 2, 'Read state');
  const beat = k.link([[HX[1], SVC_MID], [HX[0] + HEAD.w, SVC_MID]]);
  const beatLabel = k.text(960, SVC_MID - 34, 'Heartbeat', {align: 'center'});
  const silent = createSignal(0);
  const timer = k.text(960, SVC_MID + 40, '', {align: 'center', fill: COLOR.dim, size: FONT.label});
  timer.text(() => `${Math.round(silent())} s`);

  yield* sequence(
    0.1,
    all(k.showBox(cmp), ...slurmds.map(s => k.showBox(s))),
    all(k.drawn([connect[0]]), k.show([connectLabels[0]]), ...[0, 1].map(i => all(k.showBox(heads[i]), k.showBox(ctlds[i])))),
    all(k.drawn([beat]), k.show([beatLabel])),
    all(k.drawn([write]), k.show([writeLabel]), k.showBox(store)),
  );
  yield* k.ready();

  const ping: Point[] = [[HMID[1], SVC_MID], [HMID[0], SVC_MID]];
  const pong: Point[] = [[HMID[0], SVC_MID], [HMID[1], SVC_MID]];
  const beatTrail: Point[] = [[HX[1], SVC_MID], [HX[0] + HEAD.w, SVC_MID]];

  yield* step('normal');
  yield* all(
    k.begin(1, 'Normal', 'head1 把 job queue 與 node 狀態寫入 StateSaveLocation；head2 定期以 heartbeat 確認 head1 仍在運作。'),
    k.send('State', [[HMID[0], SVC_MID], [HMID[0], STORE_Y + STORE_H / 2]], 0.9, {
      target: store.rect,
      settle: COLOR.storage,
      trail: [[HMID[0], HEAD_Y + HEAD.h], [HMID[0], STORE_Y]],
    }),
    delay(0.4, k.send('Ping', ping, 1.0, {target: ctlds[0].rect, trail: beatTrail})),
    delay(1.6, k.send('OK', pong, 1.0, {target: ctlds[1].rect, trail: false})),
  );

  yield* step('down');
  yield* all(
    k.begin(2, 'head1 down', 'head1 超過 SlurmctldTimeout 秒沒有回應時，head2 判定它故障；預設為 120 秒。'),
    ctlds[0].rect.fill(COLOR.page, 0.3),
    ctlds[0].label!.text('slurmctld Down', 0.3),
    delay(0.3, k.send('Ping', ping, 1.0, {trail: beatTrail})),
    delay(1.3, all(
      beatLabel.text('No response', 0.25),
      k.show([timer]),
      silent(TIMEOUT, 1.6, linear),
    )),
  );

  yield* step('takeover');
  yield* all(
    k.begin(3, 'Takeover', 'head2 讀取 head1 最後寫下的狀態，接手排程；slurmd 與指令改連 head2。'),
    k.hide([timer, connect[0], connectLabels[0]], 0.25),
    k.drawn([read]),
    k.show([readLabel]),
    delay(0.2, k.send('State', [[HMID[1], STORE_Y + STORE_H / 2], [HMID[1], SVC_MID]], 0.9, {
      target: ctlds[1].rect,
      trail: [[HMID[1], STORE_Y], [HMID[1], HEAD_Y + HEAD.h]],
    })),
    delay(1.2, ctlds[1].label!.text('slurmctld Active', 0.3)),
    delay(1.4, all(k.drawn([connect[1]], 0.4), k.show([connectLabels[1]]))),
    delay(1.6, all(...slurmds.map((s, i) => delay(i * 0.05, flash(s.rect))))),
    delay(1.8, flash(heads[1].rect, COLOR.node)),
  );
});
