/**
 * TreeWidth 的樹狀轉發（Building and Installing Slurm）。
 *
 * 以預設 TreeWidth=16 為例：slurmctld 只送給 16 個 slurmd，每個再轉發給 16 個，
 * 3 次就涵蓋 4096 個節點。右上角的計數是 slurmctld 自己送出幾份訊息。
 * 最後一步是反例：不轉發時，slurmctld 要自己送出 4096 份。
 */
import {Rect, makeScene2D} from '@motion-canvas/2d';
import {all, createSignal, delay, easeInOutCubic, sequence} from '@motion-canvas/core';
import {COLOR, DIAGRAM} from '../theme';
import {step} from '../components/motion';
import {makeKit} from '../components/kit';

const STEPS = 4;
const CTLD = {w: 400, h: 80};
const BAR_H = 80;
const GAP = 110; // 兩層之間，放 Forward 箭頭
const WIDTHS = [700, 1200, 1700];
const COUNTS = [16, 256, 4096];
const TOTAL_H = CTLD.h + 3 * (GAP + BAR_H);
const TOP = DIAGRAM.top + (DIAGRAM.bottom - DIAGRAM.top - TOTAL_H) / 2;
const barY = (i: number) => TOP + CTLD.h + GAP + i * (BAR_H + GAP);
const barX = (i: number) => 960 - WIDTHS[i] / 2;

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);

  const ctld = k.box(960 - CTLD.w / 2, TOP, CTLD.w, CTLD.h, COLOR.service, 'slurmctld');
  const bars = [0, 1, 2].map(i => k.box(barX(i), barY(i), WIDTHS[i], BAR_H, COLOR.page));
  // 每一層的填色從中間往兩邊長開，表示訊息正在擴散。
  const fills = [0, 1, 2].map(i => {
    const r = (
      <Rect x={960} y={barY(i) + BAR_H / 2} width={0} height={BAR_H - 2} fill={COLOR.storage} />
    ) as Rect;
    k.layers.shapes().add(r);
    return r;
  });
  const levels = [0, 1, 2].map(i => k.text(barX(i) + 24, barY(i) + BAR_H / 2, `Level ${i + 2}`, {bold: true}));
  const reached = [0, 1, 2].map(() => createSignal(0));
  const counts = [0, 1, 2].map(i => {
    const t = k.text(960, barY(i) + BAR_H / 2, '', {align: 'center'});
    t.text(() => `${Math.round(reached[i]())} slurmd`);
    return t;
  });
  const arrows = [0, 1, 2].map(i =>
    k.link([[960, i === 0 ? TOP + CTLD.h : barY(i - 1) + BAR_H], [960, barY(i)]]),
  );
  const forwardLabels = [0, 1, 2].map(i =>
    k.text(976, barY(i) - GAP / 2, i === 0 ? 'Send' : 'Forward'),
  );
  const sent = createSignal(0);
  const sentLabel = k.text(DIAGRAM.right, TOP + CTLD.h / 2, '', {align: 'right', fill: COLOR.dim});
  sentLabel.text(() => `Sent by slurmctld: ${Math.round(sent())}`);

  yield* sequence(
    0.1,
    k.showBox(ctld),
    ...[0, 1, 2].map(i => all(k.drawn([arrows[i]], 0.25), k.show([forwardLabels[i]]), k.showBox(bars[i]), k.show([levels[i]]))),
  );
  yield* k.ready();

  /** 第 i 層：訊息卡片沿箭頭下去，填色長開，計數跑到目標。 */
  const reach = (i: number, caption: string, name: string) =>
    all(
      k.begin(i + 1, name, caption),
      k.send('Message', [[960, i === 0 ? TOP + CTLD.h / 2 : barY(i - 1) + BAR_H / 2], [960, barY(i) + BAR_H / 2]], 0.8, {
        trail: [[960, i === 0 ? TOP + CTLD.h : barY(i - 1) + BAR_H], [960, barY(i)]],
      }),
      delay(0.85, all(
        fills[i].width(WIDTHS[i] - 2, 0.9, easeInOutCubic),
        k.show([counts[i]], 0.2),
        reached[i](COUNTS[i], 0.9, easeInOutCubic),
      )),
    );

  yield* step('level2');
  yield* all(
    reach(0, '以預設的 TreeWidth=16 為例，slurmctld 只直接傳給 16 個 slurmd。', 'Level 2'),
    k.show([sentLabel]),
    delay(0.85, sent(16, 0.9, easeInOutCubic)),
  );

  yield* step('level3');
  yield* reach(1, '每個 slurmd 再轉發給最多 16 個，第二次轉發涵蓋 256 個節點。', 'Level 3');

  yield* step('level4');
  yield* reach(2, '第三次轉發涵蓋 4096 個節點，slurmctld 自己仍只送出 16 份訊息。', 'Level 4');

  // 反例：沒有樹狀轉發，slurmctld 自己送給全部 4096 個。
  yield* step('flat');
  yield* all(
    k.begin(4, 'Without forwarding', '不轉發時，slurmctld 必須自己送出 4096 份訊息，負擔集中在一台。'),
    k.hide([bars[0].rect, bars[1].rect, fills[0], fills[1], levels[0], levels[1], counts[0], counts[1],
      arrows[1], arrows[2], forwardLabels[1], forwardLabels[2]], 0.3),
    delay(0.3, arrows[0].points([[960, TOP + CTLD.h], [960, barY(2)]], 0.5, easeInOutCubic)),
    delay(0.3, forwardLabels[0].y((TOP + CTLD.h + barY(2)) / 2, 0.5, easeInOutCubic)),
    delay(0.3, all(sentLabel.fill(COLOR.accent, 0.3), sent(4096, 1.2, easeInOutCubic))),
  );
});
