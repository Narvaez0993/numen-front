/**
 * No text style boxes its glyphs tighter than they are drawn.
 *
 * The design bundle is CSS, and CSS is full of `line-height:.95` — there it only
 * tightens the line box and lets the glyphs spill out of it, which is exactly
 * the effect the designer wanted on a 43px number. React Native **clips** to
 * that box, so the same declaration copied across shaves the tops off the digits.
 *
 * **Equal is not enough.** The first fix set `lineHeight` to exactly `fontSize`
 * and the 2 in `$14.200` was still cut: a font draws taller than its em. Above
 * `BIG` the honest answer is to set no `lineHeight` at all and let the font's own
 * metrics size the box — which is what the amount input had already worked out
 * for itself, in a comment, two stages earlier.
 *
 * Nothing else catches it: it compiles, it lints, it renders, and the number is
 * still readable enough to scroll past. It shipped on the debts total and was
 * found by eye, twice. There are three stages of that bundle left to translate.
 *
 * The scan strips comments before looking. The first version did not, and it
 * missed the very bug it was written for: the comment explaining the fix sat
 * between the two properties and pushed them outside the window. A check that
 * cannot fail on its own motivating case is worse than no check.
 *
 * Only literal numbers in the same style object, in either order. A value
 * computed at runtime cannot be checked from here.
 */

import fs from 'node:fs';
import path from 'node:path';

/** This file sits three levels under `src`, so four hops reach the project. */
const ROOT = path.resolve(__dirname, '../../../..');

function sources(dir: string): string[] {
  const root = path.join(ROOT, dir);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) return sources(path.relative(ROOT, full));
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

/** Comments inflate the distance between the two properties and can contain
 *  text that looks like them. Out they go before anything is measured. */
function stripComments(code: string): string {
  // Same length out as in, so reported line numbers still point at the source.
  return code
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
    .replace(
      /(^|[^:])\/\/[^\n]*/g,
      (line, lead: string) => lead + ' '.repeat(line.length - lead.length),
    );
}

/** Where clipping starts to show. Below this a line box the height of the font
 *  is common and harmless — body copy sets `lineHeight` for rhythm, not for the
 *  glyphs — so the rule only bites on the sizes that carry numbers. */
const BIG = 24;

/** How much room a line box needs over its font size before it stops shaving
 *  ascenders. Under this, set none at all. */
const SAFE_RATIO = 1.15;

/** The two keys inside one style object, in either order. `[^{}]` keeps the
 *  match from crossing into a neighbouring object. */
const PAIR =
  /fontSize:\s*([\d.]+)[^{}]{0,400}?lineHeight:\s*([\d.]+)|lineHeight:\s*([\d.]+)[^{}]{0,400}?fontSize:\s*([\d.]+)/gs;

describe('text styles', () => {
  it('never boxes a glyph tighter than the font draws it', () => {
    const clipped: string[] = [];

    for (const file of [...sources('src'), ...sources('app')]) {
      const code = stripComments(fs.readFileSync(file, 'utf8'));
      const where = path.relative(ROOT, file);

      for (const match of code.matchAll(PAIR)) {
        const [fontSize, lineHeight] = match[1]
          ? [match[1], match[2]]
          : [match[4], match[3]];
        if (fontSize === undefined || lineHeight === undefined) continue;
        const size = Number(fontSize);
        const height = Number(lineHeight);
        const tight = size >= BIG ? height < size * SAFE_RATIO : height < size;
        if (tight) {
          const line = code.slice(0, match.index).split('\n').length;
          clipped.push(
            `${where}:${line} → fontSize ${fontSize}, lineHeight ${lineHeight}` +
              (size >= BIG ? ' (drop the lineHeight)' : ''),
          );
        }
      }
    }

    expect(clipped).toEqual([]);
  });
});
