// Which parts of the page get pulled into (or thrown out of) the black hole,
// and the spiral they travel. Shared by the collapse easter egg and the intro.

const REPLACED = new Set(["IMG", "SVG", "CANVAS", "VIDEO", "INPUT", "TEXTAREA", "SELECT", "BUTTON", "IFRAME"]);

/** Has a box you can see on its own: background, border or shadow. */
function hasVisualBox(style: CSSStyleDeclaration) {
  const bg = style.backgroundColor;
  return (
    (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") ||
    style.backgroundImage !== "none" ||
    parseFloat(style.borderTopWidth) + parseFloat(style.borderLeftWidth) > 0 ||
    style.boxShadow !== "none"
  );
}

/**
 * The pieces that get pulled in: walking down from the frame, an element is
 * taken whole when it's small enough and either looks like a box (cards, the
 * arcade console, buttons) or has nothing further to split into. Big plain
 * wrappers are split into their children. Inline elements can't be
 * transformed, so they always travel with their block.
 */
export function collectPieces(root: Element) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxArea = vw * vh * 0.33;
  const pieces: Element[] = [];

  const visit = (el: Element) => {
    if (pieces.length >= 500 || el.closest("[data-collapse-ignore]")) return;
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return;
    const r = el.getBoundingClientRect();
    const onScreen = r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw;
    const children = [...el.children];
    if (style.display === "contents") return children.forEach(visit);
    if (!onScreen) return;
    if (style.display === "inline") return; // moves with its parent block

    const blockKids = children.filter((c) => getComputedStyle(c).display !== "inline");
    const small = r.width * r.height <= maxArea;
    if (small && (hasVisualBox(style) || REPLACED.has(el.tagName.toUpperCase()) || blockKids.length === 0)) {
      pieces.push(el);
      return;
    }
    if (blockKids.length === 0) {
      pieces.push(el); // a big text block: still one piece
      return;
    }
    blockKids.forEach(visit);
  };

  [...root.children].forEach(visit);
  return pieces;
}

/**
 * Keyframes that spiral an element into (cx, cy), shrinking and fading.
 * "out" plays the same path backwards: from the centre to where it sits.
 */
export function spiralFrames(el: Element, cx: number, cy: number, direction: "in" | "out" = "in"): Keyframe[] {
  const r = el.getBoundingClientRect();
  const ex = r.left + r.width / 2;
  const ey = r.top + r.height / 2;
  const vx = ex - cx;
  const vy = ey - cy;
  const turn = (Math.atan2(vy, vx) > 0 ? 1 : -1) * (1.6 + Math.random() * 0.8);
  const frames: Keyframe[] = [];
  const N = 8;
  for (let k = 0; k <= N; k++) {
    const t = k / N;
    const s = t * t * t; // slow start, then falls in
    const a = s * turn * Math.PI;
    const shrink = 1 - s;
    const px = cx + (vx * Math.cos(a) - vy * Math.sin(a)) * shrink;
    const py = cy + (vx * Math.sin(a) + vy * Math.cos(a)) * shrink;
    frames.push({
      transform: `translate(${px - ex}px, ${py - ey}px) rotate(${(a * 180) / Math.PI}deg) scale(${Math.max(0.02, 1 - s * 0.98)}, ${Math.max(0.02, 1 - s * 0.99 - (t > 0.6 ? 0.2 : 0))})`,
      opacity: t < 0.75 ? 1 : 1 - (t - 0.75) / 0.25,
      offset: t,
    });
  }
  if (direction === "in") return frames;
  return frames.reverse().map((f) => ({ ...f, offset: 1 - (f.offset as number) }));
}
