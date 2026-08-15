/**
 * No text style asks for a `lineHeight` smaller than its `fontSize`.
 *
 * This exists because of how the failure looks and where it comes from. The
 * design bundle is CSS, and CSS is full of `line-height:.95` — there it only
 * tightens the line box and lets the glyphs spill out of it, which is exactly
 * the effect the designer wanted on a 43px number. React Native **clips** to
 * that box, so the same declaration copied across cuts the tops off the digits.
 *
 * Nothing catches it: it compiles, it lints, it renders, and the number is still
 * readable enough that you can scroll past it. It shipped on the debts total and
 * was found by eye. There are three stages of that bundle left to translate.
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

/** The two keys inside one style object, in either order. `[^{}]` keeps the
 *  match from crossing into a neighbouring object. */
const PAIR =
  /fontSize:\s*([\d.]+)[^{}]{0,400}?lineHeight:\s*([\d.]+)|lineHeight:\s*([\d.]+)[^{}]{0,400}?fontSize:\s*([\d.]+)/gs;

describe('text styles', () => {
  it('never clips a glyph with a lineHeight under its fontSize', () => {
    const clipped: string[] = [];

    for (const file of [...sources('src'), ...sources('app')]) {
      const code = stripComments(fs.readFileSync(file, 'utf8'));
      const where = path.relative(ROOT, file);

      for (const match of code.matchAll(PAIR)) {
        const [fontSize, lineHeight] = match[1]
          ? [match[1], match[2]]
          : [match[4], match[3]];
        if (fontSize === undefined || lineHeight === undefined) continue;
        if (Number(lineHeight) < Number(fontSize)) {
          const line = code.slice(0, match.index).split('\n').length;
          clipped.push(
            `${where}:${line} → fontSize ${fontSize}, lineHeight ${lineHeight}`,
          );
        }
      }
    }

    expect(clipped).toEqual([]);
  });
});
