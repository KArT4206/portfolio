// Is the page surface at a screen point dark? Walks up from the topmost
// element that isn't a floating overlay to the first opaque background.
const cache = new WeakMap<Element, boolean>();

function darkOf(start: Element): boolean {
  if (cache.has(start)) return cache.get(start)!;
  let el: Element | null = start;
  while (el) {
    const m = getComputedStyle(el).backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const [r, g, b, a = 1] = m[1].split(",").map(Number);
      if (a > 0.5) {
        const dark = 0.2126 * r + 0.7152 * g + 0.0722 * b < 60;
        cache.set(start, dark);
        return dark;
      }
    }
    el = el.parentElement;
  }
  cache.set(start, true);
  return true;
}

export function isDarkAt(x: number, y: number): boolean {
  for (const el of document.elementsFromPoint(x, y)) {
    if (!el.closest("[data-tone-ignore]")) return darkOf(el);
  }
  return true;
}
