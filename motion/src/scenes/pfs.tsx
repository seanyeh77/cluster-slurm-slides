/**
 * 平行檔案系統的讀寫流程（Introduction to Cluster）。
 *
 * Client 先向 Metadata Service 查 chunk 在哪裡，再同時對 4 台 Storage Node
 * 讀寫 Chunk 1 到 Chunk 4。最後一步是反例：只有一台 server 時，4 個 chunk
 * 只能依序經過同一台。
 *
 * 4 條資料線各自從 chunk 正下方出發，在 LANE_Y 橫移到自己的 Storage Node，
 * 橫移的區段互不重疊，4 張卡片才能同時走而不疊在一起。
 */
import {makeScene2D} from '@motion-canvas/2d';
import {all, delay, sequence} from '@motion-canvas/core';
import {COLOR, DIAGRAM, FONT, ROW} from '../theme';
import {step, type Point} from '../components/motion';
import {makeKit} from '../components/kit';

const STEPS = 3;
const STORE = {w: 380, gap: 40, h: 180};
const storeX = (i: number) => (1920 - (4 * STORE.w + 3 * STORE.gap)) / 2 + i * (STORE.w + STORE.gap);
const storeMid = (i: number) => storeX(i) + STORE.w / 2;
const LEFT = storeX(0);
const RIGHT = storeX(3) + STORE.w;
const META = {w: 420, h: 160};
const CLIENT_H = 170;
const GAP_TOP = 100; // Metadata Node 到 Client
const GAP_BOTTOM = 130; // Client 到 Storage Node
const TOTAL_H = META.h + GAP_TOP + CLIENT_H + GAP_BOTTOM + STORE.h;
const TOP = DIAGRAM.top + (DIAGRAM.bottom - DIAGRAM.top - TOTAL_H) / 2;
const META_X = 960 - META.w / 2;
const CLIENT_Y = TOP + META.h + GAP_TOP;
const CLIENT_BOTTOM = CLIENT_Y + CLIENT_H;
const STORE_Y = CLIENT_BOTTOM + GAP_BOTTOM;
/** chunk 方塊放在各自 Storage Node 的正上方，資料線就是一條直線。 */
const CHUNK_W = 200;
const CHUNK_Y = CLIENT_Y + ROW.title + 16;
const CHUNK_MID = CHUNK_Y + ROW.svc / 2;
const SLOT_Y = STORE_Y + ROW.title + 16;
const SLOT_MID = SLOT_Y + ROW.svc / 2;
const LANE_Y = (CLIENT_BOTTOM + STORE_Y) / 2;
const lane = (i: number): Point[] => [
  [storeMid(i), CLIENT_BOTTOM],
  [storeMid(i), STORE_Y],
];
/** 卡片的路徑：從第 i 個 chunk 出發，停在第 to 台的 slot 上 */
const route = (i: number, to = i): Point[] =>
  i === to
    ? [[storeMid(i), CHUNK_MID], [storeMid(i), SLOT_MID]]
    : [[storeMid(i), CHUNK_MID], [storeMid(i), LANE_Y], [storeMid(to), LANE_Y], [storeMid(to), SLOT_MID]];

export default makeScene2D(function* (view) {
  const k = makeKit(view, STEPS);
  const client = k.box(LEFT, CLIENT_Y, RIGHT - LEFT, CLIENT_H, COLOR.node, 'Client', {title: true});
  const chunks = [0, 1, 2, 3].map(i =>
    k.box(storeMid(i) - CHUNK_W / 2, CHUNK_Y, CHUNK_W, ROW.svc, COLOR.service, `Chunk ${i + 1}`),
  );
  const meta = k.box(META_X, TOP, META.w, META.h, COLOR.node, 'Metadata Node', {title: true});
  const metaSvc = k.box(META_X + 24, TOP + ROW.title + 8, META.w - 48, ROW.svc, COLOR.service, 'Metadata Service', {
    size: FONT.label,
  });
  const lookup = k.link([[960, CLIENT_Y], [960, TOP + META.h]], {twoWay: true});
  const lookupLabel = k.text(976, (CLIENT_Y + TOP + META.h) / 2, 'Lookup');

  const stores = [0, 1, 2, 3].map(i =>
    k.box(storeX(i), STORE_Y, STORE.w, STORE.h, COLOR.node, `Storage Node ${i + 1}`, {title: true}),
  );
  const slots = [0, 1, 2, 3].map(i =>
    k.box(storeX(i) + 24, SLOT_Y, STORE.w - 48, ROW.svc, COLOR.page, ''),
  );
  const lanes = [0, 1, 2, 3].map(i => k.link(lane(i)));
  const ioLabel = k.text(960, LANE_Y, 'Parallel I/O', {align: 'center'});

  // 開場
  yield* sequence(
    0.1,
    all(k.showBox(meta), k.showBox(metaSvc)),
    all(k.showBox(client), ...chunks.map(c => k.showBox(c)), k.drawn([lookup]), k.show([lookupLabel])),
    all(k.drawn(lanes), k.show([ioLabel])),
    sequence(0.07, ...stores.map((s, i) => all(k.showBox(s), k.showBox(slots[i])))),
  );
  yield* k.ready();

  yield* step('lookup');
  yield* all(
    k.begin(1, 'Lookup', 'Client 先向 Metadata Service 查詢各個 chunk 存在哪裡。'),
    k.send('Lookup', [[960, CLIENT_Y + 30], [960, TOP + ROW.title + 8 + ROW.svc / 2]], 0.8, {
      target: metaSvc.rect,
      trail: [[960, CLIENT_Y], [960, TOP + META.h]],
    }),
    delay(1.0, k.send('Locations', [[960, TOP + ROW.title + 8 + ROW.svc / 2], [960, CLIENT_Y + 30]], 0.8, {
      trail: [[960, TOP + META.h], [960, CLIENT_Y]],
      target: client.rect,
      settle: COLOR.node,
    })),
  );

  yield* step('parallel');
  yield* all(
    k.begin(2, 'Parallel I/O', '接著直接對 4 台 Storage Node 同時讀寫 Chunk 1 到 Chunk 4。'),
    ...[0, 1, 2, 3].map(i =>
      delay(i * 0.06, all(
        k.send(`Chunk ${i + 1}`, route(i), 1.2, {target: slots[i].rect, settle: COLOR.page, trail: lane(i)}),
        delay(1.35, slots[i].label!.text(`Chunk ${i + 1}`, 0.2)),
      )),
    ),
  );

  // 反例：只有一台 server，4 個 chunk 依序經過 Storage Node 1。
  yield* step('single');
  const others = [1, 2, 3];
  yield* all(
    k.begin(3, 'Single server', '只有一台 server 時，4 個 chunk 只能依序經過同一台，I/O 全部集中在它身上。'),
    ...slots.map(s => s.label!.text('', 0.2)),
    k.hide([ioLabel, ...others.flatMap(i => [stores[i].rect, stores[i].label, slots[i].rect, lanes[i]])], 0.3),
    stores[0].rect.stroke(COLOR.accent, 0.3),
    stores[0].rect.lineWidth(5, 0.3),
    delay(0.3, sequence(
      0.9,
      ...[0, 1, 2, 3].map(i =>
        all(
          k.send(`Chunk ${i + 1}`, route(i, 0), 1.0, {target: slots[0].rect, settle: COLOR.page, trail: i === 0 ? lane(0) : false}),
          delay(1.1, slots[0].label!.text(`Chunk ${i + 1}`, 0.15)),
        ),
      ),
    )),
  );
});
