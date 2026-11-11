/**
 * 給 cluster 場景用的工具組：在畫布座標（左上角為原點、1920 x 1080）上畫方塊、
 * 文字與連線，管理右下角的「Step x of y  Name」與圖下方的字幕，
 * 並把 motion.tsx 的移動語彙包成 send()。
 *
 * 每個場景開頭呼叫一次 makeKit(view, steps)，之後只用它回傳的函式，
 * 顏色與字級都來自 theme.ts。
 */
import {Line, Node, Rect, Txt, type View2D} from '@motion-canvas/2d';
import {
  all,
  createRef,
  delay,
  easeOutCubic,
  type ThreadGenerator,
} from '@motion-canvas/core';
import {
  COLOR,
  FONT,
  STEP_LABEL,
  STROKE,
  SUBTITLE_Y,
  SHOW_CAPTIONS,
  TOKEN,
} from '../theme';
import {FONT_FAMILY} from './parts';
import {addToken, travel, vanish, flash, popIn, type Point, type Token} from './motion';

export type Align = 'left' | 'center' | 'right';

export interface Boxed {
  rect: Rect;
  label: Txt | null;
}

export interface TextOpts {
  size?: number;
  align?: Align;
  bold?: boolean;
  fill?: string;
}

export function makeKit(view: View2D, steps: number) {
  view.fill(COLOR.page);
  const root = createRef<Node>();
  view.add(<Node ref={root} position={[-960, -540]} />);
  const layers = {
    shapes: createRef<Node>(),
    lines: createRef<Node>(),
    labels: createRef<Node>(),
    trail: createRef<Node>(),
    tokens: createRef<Node>(),
  };
  // 由下往上：方塊、連線、文字、trail、移動中的卡片。
  root().add(<Node ref={layers.shapes} />);
  root().add(<Node ref={layers.lines} />);
  root().add(<Node ref={layers.labels} />);
  root().add(<Node ref={layers.trail} />);
  root().add(<Node ref={layers.tokens} />);

  /** 文字。align 'left' 時 x 是左緣，'center' 是中心，'right' 是右緣。 */
  const text = (x: number, y: number, content: string, o: TextOpts = {}): Txt => {
    const align = o.align ?? 'left';
    const txt = (
      <Txt
        position={[x, y]}
        offset={align === 'center' ? [0, 0] : align === 'left' ? [-1, 0] : [1, 0]}
        text={content}
        fontFamily={FONT_FAMILY}
        fontSize={o.size ?? FONT.label}
        fontWeight={o.bold ? 600 : 400}
        fill={o.fill ?? COLOR.ink}
        opacity={0}
      />
    ) as Txt;
    layers.labels().add(txt);
    return txt;
  };

  /**
   * 方塊。給左上角與寬高；有 content 時字放在方塊中央（或 titleLeft 時放左上，
   * 當成機器名稱）。
   */
  const box = (
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    content?: string,
    o: TextOpts & {title?: boolean; dash?: boolean} = {},
  ): Boxed => {
    const rect = (
      <Rect
        position={[x + w / 2, y + h / 2]}
        width={w}
        height={h}
        fill={fill}
        stroke={COLOR.ink}
        lineWidth={STROKE}
        lineDash={o.dash ? [12, 10] : []}
        radius={0}
        opacity={0}
      />
    ) as Rect;
    layers.shapes().add(rect);
    let label: Txt | null = null;
    if (content !== undefined) {
      label = o.title
        ? text(x + 24, y + 36, content, {
            size: o.size ?? FONT.nodeTitle,
            bold: o.bold ?? true,
            fill: o.fill,
          })
        : text(x + w / 2, y + h / 2, content, {
            size: o.size ?? FONT.service,
            align: o.align ?? 'center',
            bold: o.bold,
            fill: o.fill,
          });
    }
    return {rect, label};
  };

  /** 連線，end 先是 0，開場用 drawn() 畫出來。 */
  const link = (points: Point[], o: {arrow?: boolean; twoWay?: boolean} = {}): Line => {
    const line = (
      <Line
        points={points}
        stroke={COLOR.line}
        lineWidth={STROKE}
        endArrow={o.arrow ?? true}
        startArrow={o.twoWay ?? false}
        arrowSize={14}
        end={0}
      />
    ) as Line;
    layers.lines().add(line);
    return line;
  };

  // 步驟計數與字幕。
  const stepText = text(STEP_LABEL.x, STEP_LABEL.y, `Step 0 of ${steps}  Ready`, {
    size: FONT.step,
    align: 'right',
    fill: COLOR.dim,
  });
  const subtitle = text(960, SUBTITLE_Y, '', {
    size: FONT.subtitle,
    align: 'center',
    fill: COLOR.dim,
  });

  /** 一組元件淡入。 */
  const show = (nodes: (Rect | Txt | Line | null)[], d = 0.23): ThreadGenerator =>
    all(...nodes.filter(Boolean).map(n => n!.opacity(1, d)));
  const hide = (nodes: (Rect | Txt | Line | null)[], d = 0.2): ThreadGenerator =>
    all(...nodes.filter(Boolean).map(n => n!.opacity(0, d)));
  const showBox = (b: Boxed, d = 0.23) => show([b.rect, b.label], d);

  /** 線畫出來。 */
  const drawn = (lines: Line[], d = 0.33): ThreadGenerator =>
    all(...lines.map(l => l.end(1, d)));

  /** 換步驟計數，n 從 1 開始。 */
  const setStep = (n: number, name: string): ThreadGenerator =>
    stepText.text(`Step ${n} of ${steps}  ${name}`, 0.2);

  /** 換字幕：淡出時往下移、換字後往回淡入，中間沒有空檔。 */
  function* say(content: string): ThreadGenerator {
    if (!SHOW_CAPTIONS) return;
    if (subtitle.opacity() > 0) {
      yield* all(subtitle.opacity(0, 0.15), subtitle.y(SUBTITLE_Y + 12, 0.15));
    }
    subtitle.text(content);
    subtitle.y(SUBTITLE_Y - 12);
    yield* all(subtitle.opacity(1, 0.21), subtitle.y(SUBTITLE_Y, 0.21, easeOutCubic));
  }

  /** 一個步驟的開頭：計數與字幕一起換。放進該步驟的 all() 裡。 */
  const begin = (n: number, name: string, caption: string): ThreadGenerator =>
    all(setStep(n, name), say(caption));

  /** 寬度剛好包住文字的卡片寬度。 */
  const tokenWidth = (label: string) => Math.max(120, Math.round(label.length * 15.5 + 48));

  /**
   * 送一張卡片沿 path 走一趟，到站後收掉並讓 target 閃一下。
   * trail 給 false 就不畫軌跡（多張卡片走同一段線時只畫一條）。
   */
  function* send(
    label: string,
    path: Point[],
    duration: number,
    o: {target?: Rect; settle?: string; trail?: boolean | Point[]; keep?: boolean} = {},
  ): ThreadGenerator {
    const token = addToken(layers.tokens(), label, path[0], tokenWidth(label), {
      height: TOKEN.height,
      fontSize: TOKEN.font,
    });
    yield* travel(
      token,
      path,
      duration,
      o.trail === false
        ? undefined
        : {layer: layers.trail(), points: Array.isArray(o.trail) ? o.trail : undefined},
    );
    yield* all(
      o.keep ? waitNone() : vanish(token),
      o.target ? flash(o.target, o.settle ?? COLOR.service) : waitNone(),
    );
  }

  /** 原地彈出一張卡片（不移動），回傳它，之後可以 vanish()。 */
  function* pop(label: string, at: Point): Generator<unknown, Token, unknown> {
    const token = addToken(layers.tokens(), label, at, tokenWidth(label), {
      height: TOKEN.height,
      fontSize: TOKEN.font,
    });
    yield* popIn(token);
    return token;
  }

  return {
    root,
    layers,
    text,
    box,
    link,
    show,
    hide,
    showBox,
    drawn,
    setStep,
    say,
    begin,
    send,
    pop,
    stepText,
    /** 開場最後一步：計數出現。 */
    ready: (): ThreadGenerator => delay(0.1, stepText.opacity(1, 0.2)),
  };
}

function* waitNone(): ThreadGenerator {}
