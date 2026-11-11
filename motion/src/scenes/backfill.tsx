/**
 * Backfill 的排程方式（Introduction to Cluster）。
 *
 * Job A 佔 node01、node02 跑到 3 h；Job B 要 4 台 node，只能等到 3 h；
 * Job C 只要 2 小時，被 backfill 進 node03、node04 的空檔；Job D 排在 Job B 之後。
 * 時間游標掃過一遍後，最後一步是反例：沒有 backfill 時 Job C 只能排到 6 h。
 *
 * job 方塊的位置與寬度由訊號（開始時間、長度、列）算出來，見 components/schedule。
 */
import {Line, Node, makeScene2D} from '@motion-canvas/2d';
import {all, createSignal, delay, easeInOutCubic, linear} from '@motion-canvas/core';
import {COLOR, FONT, STROKE} from '../theme';
import {step, flash} from '../components/motion';
import {makeKit} from '../components/kit';
import {
  CHART,
  JobBar,
  NodeRows,
  TimeAxis,
  chartHeight,
  createJobBar,
  hourToX,
  rowY,
} from '../components/schedule';

const STEPS = 5;
const WINDOW = 3; // 觀察利用率的時間窗：0 h 到 3 h
const TOTAL_NODE_HOURS = CHART.rows * WINDOW;
const CARD = {y: 150, w: 360, h: 64};
const CARD_X = [640, 1040, 1440]; // Job B、C、D 的卡片中心
const LANE_Y = CHART.top - 44; // 卡片落進圖之前走的水平通道
const AXIS_Y = CHART.top + chartHeight + 28;
/** 第 row 列開始、佔 rows 列的方塊中心 y */
const barY = (row: number, rows: number) =>
  rowY(row) + ((rows - 1) * (CHART.rowHeight + CHART.rowGap)) / 2;
/** 秒數換算：游標每小時走 0.35 秒 */
const SEC_PER_HOUR = 0.35;

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);

  const jobA = createJobBar({start: 0, duration: 0, row: 0, rows: 2});
  const jobB = createJobBar({start: 3, duration: 3, row: 0, rows: 4});
  const jobC = createJobBar({start: 0, duration: 2, row: 2, rows: 2});
  const jobD = createJobBar({start: 6, duration: 2, row: 0, rows: 2});
  const used = createSignal(0);
  const cursorHour = createSignal(0);

  // 底圖：node 列與時間軸。
  const chart = (<Node opacity={0} />) as Node;
  k.layers.shapes().add(chart);
  chart.add(<NodeRows names={['node01', 'node02', 'node03', 'node04']} />);
  chart.add(<TimeAxis y={AXIS_Y} />);

  // 空檔：node03、node04 的 0 h 到 3 h，虛線框加一個白底標籤。
  const idle = k.box(
    hourToX(0),
    rowY(2) - CHART.rowHeight / 2,
    WINDOW * CHART.pxPerHour,
    CHART.rowHeight * 2 + CHART.rowGap,
    COLOR.page,
    undefined,
    {dash: true},
  );
  const idleTag = k.box(hourToX(WINDOW / 2) - 60, barY(2, 2) - 26, 120, 52, COLOR.page, 'idle', {
    size: FONT.label,
    fill: COLOR.dim,
  });
  idleTag.rect.stroke(null);

  const bars = (
    <Node>
      <JobBar handle={jobA} label="Job A" />
      <JobBar handle={jobB} label="Job B" fill={COLOR.page} opacity={0} lineDash={[12, 10]} />
      <JobBar handle={jobC} label="Job C" fill={COLOR.service} opacity={0} />
      <JobBar handle={jobD} label="Job D" fill={COLOR.page} opacity={0} lineDash={[12, 10]} />
    </Node>
  ) as Node;
  k.layers.shapes().add(bars);

  const cursor = (
    <Line
      points={() => [
        [hourToX(cursorHour()), CHART.top - 20],
        [hourToX(cursorHour()), CHART.top + chartHeight + 20],
      ]}
      stroke={COLOR.ink}
      lineWidth={STROKE + 1}
      opacity={0}
    />
  ) as Line;
  k.layers.lines().add(cursor);

  const queueLabel = k.text(CHART.x0 - 24, CARD.y, 'Queue', {align: 'right', fill: COLOR.dim});
  const util = k.text(hourToX(CHART.hours), 70, '', {align: 'right', fill: COLOR.dim});
  util.text(() => `Utilization 0 h to ${WINDOW} h: ${Math.round((used() / TOTAL_NODE_HOURS) * 100)} %`);

  const card = (i: number, label: string) =>
    k.box(CARD_X[i] - CARD.w / 2, CARD.y - CARD.h / 2, CARD.w, CARD.h, COLOR.node, label, {
      size: FONT.label,
    });
  const cardB = card(0, 'Job B, 4 nodes, 3 h');
  const cardC = card(1, 'Job C, 2 nodes, 2 h');
  const cardD = card(2, 'Job D, 2 nodes, 2 h');

  /** 從 queue 卡片走到圖上一格：往下、橫移、再往下。 */
  const route = (i: number, toHour: number, toY: number): [number, number][] => [
    [CARD_X[i], CARD.y + CARD.h / 2],
    [CARD_X[i], LANE_Y],
    [hourToX(toHour), LANE_Y],
    [hourToX(toHour), toY],
  ];

  // 開場：底圖出現，Job A 從 0 h 長到 3 h。
  yield* all(
    chart.opacity(1, 0.3),
    k.show([queueLabel, util]),
    delay(0.2, all(jobA.duration(WINDOW, 0.6, easeInOutCubic), used(6, 0.6))),
    k.ready(),
  );

  yield* step('wait');
  yield* all(
    k.begin(1, 'Job B waits', 'Job B 需要 4 台 node，必須等 Job A 在 3h 結束後才能開始。'),
    k.showBox(cardB),
    delay(0.25, k.send('Job B', route(0, 4.5, barY(0, 4)), 1.2)),
    delay(0.25, cardB.rect.opacity(0.4, 0.3)),
    delay(1.5, all(jobB.rect().opacity(1, 0.25), flash(jobB.rect(), COLOR.page))),
    delay(1.7, all(k.showBox(idle), k.showBox(idleTag))),
  );

  yield* step('backfill');
  yield* all(
    k.begin(2, 'Backfill Job C', 'Job C 只需要 2 小時，能在 Job B 開始前完成，因此被 backfill 進空檔。'),
    k.showBox(cardC),
    delay(0.25, k.send('Job C', route(1, 1, barY(2, 2)), 1.2)),
    delay(0.25, cardC.rect.opacity(0.4, 0.3)),
    delay(1.5, all(
      jobC.rect().opacity(1, 0.2),
      k.hide([idle.rect, idleTag.rect, idleTag.label]),
      used(10, 0.5, easeInOutCubic),
      flash(jobC.rect()),
    )),
  );

  yield* step('queueD');
  yield* all(
    k.begin(3, 'Job D', 'Job D 排在 Job B 之後執行。'),
    k.showBox(cardD),
    delay(0.25, k.send('Job D', route(2, 7, barY(0, 2)), 1.2)),
    delay(0.25, cardD.rect.opacity(0.4, 0.3)),
    delay(1.5, all(jobD.rect().opacity(1, 0.25), flash(jobD.rect(), COLOR.page))),
  );

  // 時間往前走：游標一口氣掃到 8 h，每個 job 的開始與結束對準游標經過的時刻。
  const at = (hour: number) => hour * SEC_PER_HOUR;
  yield* step('run');
  yield* all(
    k.begin(4, 'Run', '時間往前走：Job C 先結束，Job A 結束後 Job B 在 3h 準時開始，接著是 Job D。'),
    k.hide([queueLabel, cardB.rect, cardB.label, cardC.rect, cardC.label, cardD.rect, cardD.label]),
    cursor.opacity(1, 0.2),
    cursorHour(CHART.hours, at(CHART.hours), linear),
    delay(at(2), flash(jobC.rect(), COLOR.node)),
    delay(at(3), all(
      flash(jobA.rect(), COLOR.node),
      flash(jobB.rect(), COLOR.service),
      jobB.rect().lineDash([0, 0], 0.2),
    )),
    delay(at(6), all(
      flash(jobB.rect(), COLOR.node),
      flash(jobD.rect(), COLOR.service),
      jobD.rect().lineDash([0, 0], 0.2),
    )),
    delay(at(8), flash(jobD.rect(), COLOR.node)),
  );

  // 反例：沒有 backfill，Job C 只能排在 Job B 之後。
  yield* step('noBackfill');
  yield* all(
    k.begin(5, 'Without backfill', '沒有 backfill 時，Job C 只能排在 Job B 之後，node03、node04 在前 3 小時閒置。'),
    cursor.opacity(0, 0.2),
    jobC.start(6, 1.0, easeInOutCubic),
    jobC.rect().stroke(COLOR.accent, 0.3),
    jobC.rect().lineWidth(5, 0.3),
    delay(0.8, all(k.showBox(idle), k.showBox(idleTag), used(6, 0.5, easeInOutCubic))),
  );
});
