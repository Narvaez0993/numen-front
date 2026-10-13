/**
 * `color-mix(in srgb, a X%, b)`, which the design uses for the aurora and which
 * React Native has no equivalent for.
 *
 * Mixing happens on the sRGB components, exactly as the CSS function does with
 * `in srgb` — not in linear light. Matching the bundle matters more here than
 * being perceptually correct: the aurora is a 14–16% wash, and a "better" mix
 * would simply not be the colour the design shows.
 */
function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function toHex(value: number): string {
  return Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, '0');
}

/** `amount` is the share of `a`, 0..1 — `mix(au1, base, 0.16)` is 16% of au1. */
export function mixColors(a: string, b: string, amount: number): string {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  const t = Math.min(1, Math.max(0, amount));
  return `#${toHex(ar * t + br * (1 - t))}${toHex(ag * t + bg * (1 - t))}${toHex(
    ab * t + bb * (1 - t),
  )}`;
}
