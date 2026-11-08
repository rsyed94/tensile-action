#!/usr/bin/env node
// Wraps a Jest config with the recorder, without editing it: writes a config that loads the original and adds the
// recorder's begin file (first setupFiles entry), setup file (last setupFilesAfterEnv entry) and reporter (after the
// config's own reporters, or 'default'). Inline projects get the setup files too: Jest doesn't pass top-level setup
// files down to them. Shipped as is in the public action (rsyed94/tensile-action/jest), so plain JavaScript.
//
//   node wrap-config.mjs --recorder <dir> --config <jest config> [--in-place]
//
//   default      writes tensile.jest.config.mjs beside the config (so <rootDir> is unchanged) and prints its path:
//                run Jest with --config <that path>.
//   --in-place   for a test command that names its config and can't take another --config: moves the config to
//                <name>.tensile-original<ext> and writes the wrapper under the original name, in the module format
//                that name loads as. `--restore` puts the original back.
//
//   node wrap-config.mjs --restore --config <jest config>     (either mode: original back, wrapper removed)
//
// Then it loads the wrapper as Jest would and fails (exit 1, everything put back) if that throws: a recorder that
// breaks the test run is worse than no recording. Supports .js, .mjs and .cjs configs, and .ts/.mts/.cts ones that
// Node can load itself (type stripping); a config in package.json isn't supported.
import { existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

const EXTS = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'];
const ORIGINAL = '.tensile-original';
const WRAPPER = 'tensile.jest.config.mjs';
const MARK = "// Written by Tensile's Jest recorder (wrap-config.mjs): the config below, plus the recorder.";

/** The module format Node loads a file as: by extension, or a .js/.ts file by its nearest package.json "type". */
function isEsm(file) {
  const ext = extname(file);
  if (ext === '.mjs' || ext === '.mts') return true;
  if (ext === '.cjs' || ext === '.cts') return false;
  for (let dir = dirname(file); ; dir = dirname(dir)) {
    const pkg = join(dir, 'package.json');
    if (existsSync(pkg)) {
      try {
        return JSON.parse(readFileSync(pkg, 'utf8')).type === 'module';
      } catch {
        return false;
      }
    }
    if (dirname(dir) === dir) return false;
  }
}

function originalOf(config) {
  const ext = extname(config);
  return join(dirname(config), `${basename(config, ext)}${ORIGINAL}${ext}`);
}

export function wrapperSource(original, recorder, esm) {
  const q = (s) => JSON.stringify(s);
  const body = `${MARK}
const original = ${q(pathToFileURL(original).href)};
const begin = ${q(join(recorder, 'begin.cjs'))};
const setup = ${q(join(recorder, 'setup.cjs'))};
const reporter = ${q(join(recorder, 'reporter.mjs'))};
const wrap = (c) => ({
  ...c,
  setupFiles: [begin, ...(c.setupFiles ?? [])],
  setupFilesAfterEnv: [...(c.setupFilesAfterEnv ?? []), setup],
});
const config = async (...args) => {
  const m = await import(original);
  let b = m.default ?? m;
  if (b && typeof b === 'object' && 'default' in b && (b.__esModule || Object.keys(b).length === 1)) b = b.default;
  if (typeof b === 'function') b = await b(...args);
  if (!b || typeof b !== 'object') throw new Error('tensile: the Jest config is not an object');
  // Jest takes a preset's reporters only when the config has none; setting ours would drop them.
  if (b.preset && !b.reporters) throw new Error("tensile: a preset's reporters can't be kept; set reporters in the config");
  const projects = b.projects?.map((p) => {
    if (!p || typeof p !== 'object') throw new Error('tensile: only inline Jest projects can be recorded');
    return wrap(p);
  });
  return {
    ...wrap(b),
    ...(projects ? { projects } : {}),
    reporters: [...(b.reporters ?? ['default']), reporter],
  };
};
`;
  return esm ? `${body}export default config;\n` : `'use strict';\n${body}module.exports = config;\n`;
}

/** Load a config file as Jest does (import, default export, call a function) and check it is an object. */
async function load(file) {
  const m = await import(pathToFileURL(file).href);
  let c = m.default ?? m;
  if (c && typeof c === 'object' && 'default' in c && (c.__esModule || Object.keys(c).length === 1))
    c = c.default;
  if (typeof c === 'function') c = await c();
  if (!c || typeof c !== 'object') throw new Error('not an object');
  return c;
}

/** Undo wrap(): put an in-place config's original back, and remove a wrapper written beside it. */
export function restore(config) {
  const original = originalOf(config);
  if (existsSync(original)) renameSync(original, config);
  const beside = join(dirname(config), WRAPPER);
  if (existsSync(beside) && readFileSync(beside, 'utf8').includes(MARK)) rmSync(beside, { force: true });
}

export async function wrap({ recorder, config, inPlace = false }) {
  config = resolve(config);
  recorder = resolve(recorder);
  if (!EXTS.includes(extname(config)))
    throw new Error(`${config}: not a Jest config file (${EXTS.join(' ')})`);
  if (!existsSync(config)) throw new Error(`${config}: no such file`);
  for (const f of ['begin.cjs', 'setup.cjs', 'reporter.mjs'])
    if (!existsSync(join(recorder, f))) throw new Error(`${recorder}: no ${f}`);
  let out;
  if (inPlace) {
    const original = originalOf(config);
    if (existsSync(original)) throw new Error(`${original} exists: already wrapped`);
    if (['.ts', '.mts', '.cts'].includes(extname(config)))
      throw new Error(
        `${config}: --in-place can't write a TypeScript config; run Jest with --config instead`,
      );
    out = config;
  } else {
    out = join(dirname(config), WRAPPER);
    if (existsSync(out)) throw new Error(`${out} exists: already wrapped`);
  }
  try {
    if (inPlace) {
      const esm = isEsm(config);
      renameSync(config, originalOf(config));
      writeFileSync(out, wrapperSource(originalOf(config), recorder, esm));
    } else writeFileSync(out, wrapperSource(config, recorder, true));
    const c = await load(out);
    if (!c.reporters?.includes(join(recorder, 'reporter.mjs'))) throw new Error('no recorder in it');
  } catch (e) {
    // Leave the config exactly as it was.
    if (inPlace && existsSync(originalOf(config))) {
      rmSync(config, { force: true });
      renameSync(originalOf(config), config);
    } else if (!inPlace) rmSync(out, { force: true });
    throw new Error(`the wrapped config doesn't load: ${e?.message ?? e}`);
  }
  return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      recorder: { type: 'string' },
      config: { type: 'string' },
      'in-place': { type: 'boolean' },
      restore: { type: 'boolean' },
    },
  });
  try {
    if (!values.config) throw new Error('--config is required');
    if (values.restore) restore(resolve(values.config));
    else {
      if (!values.recorder) throw new Error('--recorder is required');
      const out = await wrap({
        recorder: values.recorder,
        config: values.config,
        inPlace: values['in-place'],
      });
      console.log(out);
    }
  } catch (e) {
    console.error(`tensile jest: ${e?.message ?? e}`);
    process.exit(1);
  }
}
