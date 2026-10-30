// Pixel buddy sprite builder. The body is a fixed 16x13 grid; legs, eyes,
// mouth and props are composed on top so every pose is one SVG path.

export type Legs = "stand" | "walk1" | "walk2" | "sit" | "cross1" | "cross2" | "air";
export type Eyes = "open" | "closed" | "angry" | "dizzy" | "wide";
export type Mouth = "smile" | "o" | "flat" | "grin";
export type Prop =
  | "wave"
  | "armsUp"
  | "book"
  | "laptop"
  | "cup"
  | "helmet"
  | "torch"
  | "sweat"
  | "pushup";

export type Pose = {
  legs?: Legs;
  eyes?: Eyes;
  mouth?: Mouth;
  props?: Prop[];
  look?: [number, number]; // pupil offset, each 0 or 1
};

const BODY = [
  ".....######.....",
  "...##########...",
  "..############..",
  ".##############.",
  ".##############.",
  ".##############.",
  ".##############.",
  ".##############.",
  ".##############.",
  ".##############.",
  "..############..",
  "...##########...",
];

const LEGS: Record<Legs, string[]> = {
  stand: ["....##....##....", "....##....##....", "...###....###..."],
  walk1: ["....##...##.....", "...##.....##....", "..##.......##..."],
  walk2: [".....##..##.....", "....##....##....", "....###...###..."],
  sit: ["..###......###..", "................", "................"],
  cross1: [".....##.##......", "......###.......", ".....##.##......"],
  cross2: ["......##.##.....", ".......###......", "......##.##....."],
  air: ["...##......##...", "..##........##..", "................"],
};

type Px = [number, number];

// Eye sockets are holes (left: x 4-5, right: x 10-11, rows 5-6).
const EYE_HOLES: Record<Eyes, Px[]> = {
  open: [[4, 5], [5, 5], [4, 6], [5, 6], [10, 5], [11, 5], [10, 6], [11, 6]],
  wide: [[4, 4], [5, 4], [4, 5], [5, 5], [4, 6], [5, 6], [10, 4], [11, 4], [10, 5], [11, 5], [10, 6], [11, 6]],
  closed: [[3, 6], [4, 6], [5, 6], [10, 6], [11, 6], [12, 6]],
  angry: [[4, 5], [5, 6], [4, 6], [11, 5], [10, 6], [11, 6]],
  dizzy: [[4, 5], [5, 6], [5, 5], [4, 6], [10, 5], [11, 6], [11, 5], [10, 6]],
};

const MOUTH_HOLES: Record<Mouth, Px[]> = {
  smile: [[6, 8], [9, 8], [7, 9], [8, 9]],
  grin: [[6, 8], [7, 8], [8, 8], [9, 8], [7, 9], [8, 9]],
  o: [[7, 8], [8, 8], [7, 9], [8, 9]],
  flat: [[6, 9], [7, 9], [8, 9], [9, 9]],
};

const PROPS: Record<Prop, Px[]> = {
  wave: [[16, 6], [17, 5], [17, 4], [18, 3], [18, 2], [19, 2]],
  armsUp: [[-1, 5], [-2, 4], [-2, 3], [-3, 2], [16, 5], [17, 4], [17, 3], [18, 2]],
  book: [[3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9], [11, 9], [12, 9], [3, 10], [12, 10], [7, 10], [8, 10]],
  laptop: [
    [2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
    [2, 9], [13, 9], [2, 10], [13, 10], [2, 11], [13, 11],
    [0, 12], [1, 12], [2, 12], [3, 12], [4, 12], [5, 12], [6, 12], [7, 12], [8, 12], [9, 12], [10, 12], [11, 12], [12, 12], [13, 12], [14, 12], [15, 12],
  ],
  cup: [[16, 7], [17, 7], [18, 7], [16, 8], [18, 8], [19, 8], [16, 9], [18, 9], [19, 9], [16, 10], [17, 10], [18, 10]],
  helmet: [
    [4, -3], [5, -3], [6, -3], [7, -3], [8, -3], [9, -3], [10, -3], [11, -3],
    [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [8, -2], [9, -2], [10, -2], [11, -2], [12, -2],
    [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1], [6, -1], [7, -1], [8, -1], [9, -1], [10, -1], [11, -1], [12, -1], [13, -1], [14, -1], [15, -1],
  ],
  torch: [[16, 7], [17, 6], [17, 5], [17, 4], [17, 3], [17, 2], [16, 1], [17, 1], [18, 1], [17, 0], [17, -1]],
  sweat: [[15, -1], [15, 0], [14, 0], [15, 1]],
  pushup: [[-1, 12], [-2, 12], [16, 12], [17, 12]],
};

// Pupils sit inside the eye holes; look shifts them 1px.
function pupils(eyes: Eyes, look: [number, number]): Px[] {
  if (eyes !== "open" && eyes !== "wide") return [];
  const [lx, ly] = look;
  const y = 5 + ly;
  return [
    [4 + lx, y],
    [10 + lx, y],
  ];
}

// Book and laptop sit in front of the body, so they render as a second,
// half-tone path instead of disappearing into the solid fill.
const ACCENT_PROPS = new Set<Prop>(["book", "laptop"]);

const toPath = (px: Px[]) => px.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join("");

export function buildPath(pose: Pose): { body: string; accent: string } {
  const { legs = "stand", eyes = "open", mouth = "smile", props = [], look = [0, 1] } = pose;
  const holes = new Set([...EYE_HOLES[eyes], ...MOUTH_HOLES[mouth]].map(([x, y]) => `${x},${y}`));
  const px: Px[] = [];

  BODY.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === "#" && !holes.has(`${x},${y}`)) px.push([x, y]);
    }
  });
  LEGS[legs].forEach((row, i) => {
    for (let x = 0; x < row.length; x++) if (row[x] === "#") px.push([x, 12 + i]);
  });
  px.push(...pupils(eyes, look));
  const accent: Px[] = [];
  for (const p of props) (ACCENT_PROPS.has(p) ? accent : px).push(...PROPS[p]);

  return { body: toPath(px), accent: toPath(accent) };
}
