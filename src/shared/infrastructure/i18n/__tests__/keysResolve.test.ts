/**
 * Every `t('…')` in the app resolves, in both languages.
 *
 * This exists because of how the failure looks: a key that does not exist is
 * rendered VERBATIM. The screen does not crash, nothing is logged, tsc and
 * eslint are happy — you just ship a button that says
 * `subscriptions.form.frequency.monthly`. It shipped exactly once, and the same
 * scan then found six more on Home, in the first-run path nobody had opened
 * since the redesign began.
 *
 * The scan is deliberately conservative. It only looks at keys written as
 * literals — a key built at runtime cannot be checked from here — and it skips
 * calls that pass a `defaultValue`, because those are allowed to be missing by
 * design.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '../../../../..');
const LOCALES = ['es', 'en'] as const;

type Tree = Record<string, unknown>;

function load(language: string): Tree {
  const file = path.join(
    ROOT,
    'src/shared/infrastructure/i18n/locales',
    `${language}.json`,
  );
  return JSON.parse(fs.readFileSync(file, 'utf8')) as Tree;
}

function at(tree: Tree, key: string): unknown {
  let node: unknown = tree;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null || !(part in node)) return undefined;
    node = (node as Tree)[part];
  }
  return node;
}

/** i18next stores plurals as `key_one` / `key_other`, so a bare hit can miss. */
function resolves(tree: Tree, key: string): boolean {
  return (
    at(tree, key) !== undefined ||
    at(tree, `${key}_one`) !== undefined ||
    at(tree, `${key}_other`) !== undefined
  );
}

function sources(dir: string): string[] {
  const root = path.join(ROOT, dir);
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) return sources(path.relative(ROOT, full));
    return entry.name.endsWith('.tsx') ? [full] : [];
  });
}

// `t(` must not be the tail of another identifier — `queryByText(`, `.get(`.
const CALL = /(?<![A-Za-z0-9_$.])t\(\s*'([a-zA-Z0-9_.]+)'\s*(,\s*\{[^}]*\})?\s*\)/g;
/** `t(\`a.b.${x}\`)` — the prefix has to be a group of keys. */
const TEMPLATE = /(?<![A-Za-z0-9_$.])t\(\s*`([a-zA-Z0-9_.]+)\.\$\{/g;

describe.each(LOCALES)('%s translations', (language) => {
  const tree = load(language);
  const files = [...sources('src'), ...sources('app')];

  it('has every literal key the app asks for', () => {
    const missing: string[] = [];

    for (const file of files) {
      const code = fs.readFileSync(file, 'utf8');
      const where = path.relative(ROOT, file);

      for (const match of code.matchAll(CALL)) {
        const [, key, options] = match;
        if (options?.includes('defaultValue')) continue;
        if (key && !resolves(tree, key)) missing.push(`${where} → ${key}`);
      }

      for (const match of code.matchAll(TEMPLATE)) {
        const key = match[1];
        const group = key === undefined ? undefined : at(tree, key);
        if (typeof group !== 'object' || group === null) {
          missing.push(`${where} → ${key}.*`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});
