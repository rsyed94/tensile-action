// Child process for vite-aliases.ts: asks the repo's own vitest for the resolved config of every project (its
// workspace or `projects`, `extends`, `mergeConfig`, plugin `config` hooks and all) and prints each project's root,
// final `resolve.alias` list, config files, setup files and settings as JSON on stdout. Aliases it can't trust (a
// plugin Jiffy can't follow) mark only the project's aliases `untrusted`; the rest is reported regardless. Run in a
// workspace copy, never the user's checkout: loading a config may write temp files next to it.
//   node vitest-aliases.mjs <root> [config]
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [root, config] = process.argv.slice(2);
// Framework plugins whose resolveId hooks serve only their own virtual modules, by exact name. vite-tsconfig-paths
// resolves tsconfig `paths`, which Jiffy reads itself (its include/baseUrl edge cases are a known risk, spec §5.1).
const FRAMEWORK = new Set([
  'vite:vue',
  'vite:vue-jsx',
  'vite:react-babel',
  'vite:react-refresh',
  'vite:react-swc',
  'vite:react-virtual-preamble',
  'vite-plugin-svelte',
  'vite-plugin-svelte:optimize-module',
  'vite-plugin-svelte-inspector',
  'solid',
  'vite-tsconfig-paths',
  '@tailwindcss/vite:scan',
  '@tailwindcss/vite:generate:serve',
  '@tailwindcss/vite:generate:build',
]);
// A project's resolved settings that decide which tests run and how they're judged.
const SETTINGS = [
  'include',
  'exclude',
  'testNamePattern',
  'includeSource',
  'setupFiles',
  'globalSetup',
  'environment',
  'environmentOptions',
  'env',
  'globals',
  'typecheck',
  'sequence',
  'retry',
  'bail',
  'passWithNoTests',
  'allowOnly',
];
// Plugins that add imports by transforming code (auto-imports, auto-registered components): the graph can't see
// those edges at all.
const INJECTS = /auto-?import|components/i;
const out = (v) => process.stdout.write(`\n@@JIFFY_ALIASES@@${JSON.stringify(v)}\n`);
const ser = (find) =>
  find instanceof RegExp
    ? { re: find.source, flags: find.flags }
    : typeof find === 'string'
      ? { s: find }
      : null;
const list = (x) => (Array.isArray(x) ? x : x ? [x] : []).filter((s) => typeof s === 'string');

let vitest;
let bare;
let empty;
try {
  const req = createRequire(`${root}/noop.js`);
  const version = req(req.resolve('vitest/package.json')).version;
  const node = await import(pathToFileURL(req.resolve('vitest/node')).href);
  if (typeof node.createVitest !== 'function') throw new Error(`vitest ${version}: no createVitest`);
  // The plugins this vitest and vite add on their own, from a bare project with no config: the only ones trusted
  // by name, besides the framework list.
  // A plain project and one with its own options get slightly different built-ins, so the bare config has both.
  empty = mkdtempSync(join(tmpdir(), 'jiffy-vitest-bare-'));
  writeFileSync(
    join(empty, 'vitest.config.mjs'),
    "export default { test: { projects: [{ test: { name: 'a' } }, { extends: true, resolve: { alias: { x: '/x' } }, test: { name: 'b' } }] } };\n",
  );
  bare = await node.createVitest(
    'test',
    { root: empty, config: join(empty, 'vitest.config.mjs'), watch: false, reporters: [] },
    {},
    {},
  );
  const builtin = new Set(
    (bare.projects ?? []).flatMap((p) =>
      (p.vite?.config?.plugins ?? []).map((pl) => pl?.name).filter(Boolean),
    ),
  );
  if (!builtin.size) throw new Error(`vitest ${version}: no built-in plugins to compare against`);
  const options = { root, config: config || undefined, watch: false, run: true, reporters: [] };
  vitest = await node.createVitest('test', options, {}, {});
  const projects = vitest.projects ?? [];
  if (!projects.length) throw new Error(`vitest ${version}: no projects resolved`);
  const result = [];
  for (const p of projects) {
    const vite = p.vite?.config ?? p.server?.config ?? {};
    const alias = vite.resolve?.alias;
    // Why this project's aliases can't be trusted. Its settings, config files and setup files still count.
    const untrusted = [];
    if (!Array.isArray(alias)) untrusted.push(`project ${p.name || '?'} has no resolved alias list`);
    const plugins = vite.plugins ?? [];
    // A plugin's resolveId hook can send an import anywhere, and a transform can add imports: Jiffy can't see
    // where. Only the built-in plugins, `alias` (resolve.alias, read here) and known framework plugins are trusted.
    const opaque = plugins
      .filter(
        (pl) =>
          INJECTS.test(pl?.name ?? '') ||
          (pl?.resolveId && !builtin.has(pl.name) && !FRAMEWORK.has(pl.name) && pl.name !== 'alias'),
      )
      .map((pl) => pl?.name || '(unnamed)');
    if (opaque.length)
      untrusted.push(
        `project ${p.name || '?'}: plugins resolve or add imports Jiffy can't follow (${opaque.join(', ')})`,
      );
    const entries = [];
    for (const a of Array.isArray(alias) ? alias : []) {
      const find = ser(a?.find);
      // Vite's own internal entries (`/^\/?@vite\//`) aren't the repo's.
      if (find?.re && /@vite\\?\//.test(find.re)) continue;
      if (!find || typeof a.replacement !== 'string') {
        untrusted.push(`an alias entry Jiffy can't read in ${p.name || '?'}`);
        continue;
      }
      entries.push({ find, replacement: a.replacement });
    }
    // .env files vite loads for mode `test` decide the environment tests see.
    const envDir = resolve(vite.root ?? root, typeof vite.envDir === 'string' ? vite.envDir : '.');
    const envFiles = ['.env', '.env.local', '.env.test', '.env.test.local']
      .map((f) => join(envDir, f))
      .filter((f) => existsSync(f));
    result.push({
      name: p.name ?? '',
      root: p.config?.root ?? vite.root ?? root,
      // Aliases the graph can't trust: it runs the whole suite.
      untrusted: untrusted.length ? untrusted.join('; ') : undefined,
      alias: entries,
      // Everything that decides how this project's tests run: its config, every module that config loaded, the
      // .env files, and its setup files.
      configFiles: [...list(vite.configFile), ...list(vite.configFileDependencies), ...envFiles],
      setupFiles: [...list(p.config?.setupFiles), ...list(p.config?.globalSetup)],
      // The settings that decide which tests run and how they're judged, compared with the reference commit's,
      // and the aliases and plugins, which decide what the tests load.
      settings: {
        ...Object.fromEntries(
          SETTINGS.map((k) => [
            k,
            JSON.stringify(p.config?.[k] ?? null, (key, x) =>
              key === 'seed'
                ? undefined // random per run
                : x instanceof RegExp
                  ? `/${x.source}/${x.flags}`
                  : typeof x === 'function'
                    ? `[function ${x.name}]`
                    : x,
            ),
          ]),
        ),
        'resolve.alias': JSON.stringify(entries),
        plugins: JSON.stringify(plugins.map((pl) => pl?.name ?? '(unnamed)')),
      },
    });
  }
  out({ ok: true, version, projects: result });
} catch (e) {
  out({ ok: false, error: String(e?.stack ?? e).slice(0, 2000) });
} finally {
  for (const v of [vitest, bare])
    try {
      await v?.close();
    } catch {
      // closing is best effort; the process exits anyway
    }
  if (empty) rmSync(empty, { recursive: true, force: true });
  process.exit(0);
}
