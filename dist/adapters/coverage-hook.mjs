// Preloaded into every Node process of a coverage run (NODE_OPTIONS=--import=<this>?d=<dir>), next to
// NODE_V8_COVERAGE=<dir>. V8 writes a process's coverage only when it exits normally, so on its own a killed
// process, or one started without the variables, would silently leave lines out. This module makes those
// visible, so coverage.ts can treat the test's coverage as partial (fail closed):
//   jiffy-proc-*    every process (and worker thread) that started, and whether its coverage lands here;
//   jiffy-exit-*    a process that reached its normal exit (one stopped after an early v8.takeCoverage() hasn't);
//   jiffy-hidden-*  a process coverage can't see: started with an environment that turns coverage off, or a
//                   JavaScript runtime other than Node (deno, bun, workerd, a browser);
//   jiffy-evaled-*  text of a changed file evaluated through vm without a file name (V8 can't attribute it);
//   jiffy-src-*     source maps of changed files that a test runner evaluates through vm.runInThisContext
//                   (vitest), which V8 coverage can't map on its own.
// It also lets vitest's fork workers write their coverage when the pool stops them with SIGTERM. Nothing here
// changes what a test sees, apart from that exit and the JIFFY_COV_OWNER variable.
import { Buffer } from 'node:buffer';
import cp from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { Module, syncBuiltinESMExports } from 'node:module';
import { basename, join } from 'node:path';
import { URL } from 'node:url';
import vm from 'node:vm';
import { threadId } from 'node:worker_threads';

const self = import.meta.url;
const dir = new URL(self).searchParams.get('d');

if (dir) {
  const tag = `${process.pid}-${threadId}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  let n = 0;
  const note = (kind, data) => {
    try {
      writeFileSync(join(dir, `jiffy-${kind}-${tag}-${n++}.json`), JSON.stringify(data));
    } catch {
      // The directory is gone: the run's coverage is unusable anyway.
    }
  };
  const covered = (env) =>
    !!env && env.NODE_V8_COVERAGE === dir && String(env.NODE_OPTIONS ?? '').includes(self);
  // A node:test file runs in its own process, named in argv[1]: it owns every process it starts, which inherit
  // the owner through the environment (a process started by another test's process keeps that owner).
  if (process.env.NODE_TEST_CONTEXT && !process.env.JIFFY_COV_OWNER && process.argv[1])
    process.env.JIFFY_COV_OWNER = process.argv[1];
  const owner = process.env.JIFFY_COV_OWNER ?? null;
  note('proc', {
    pid: process.pid,
    ppid: process.ppid,
    thread: threadId,
    covered: covered(process.env),
    owner,
    tag,
  });
  if (threadId === 0) process.on('exit', () => note('exit', { pid: process.pid, tag }));

  // Processes coverage can't see. A JavaScript runtime other than Node never writes Node's coverage; a command
  // started with an environment that drops either variable (or a shell line or `env` that strips them) runs
  // without coverage or without this module, which matters for anything that can run JavaScript.
  const JS =
    /^(node|nodejs|npm|npx|pnpm|pnpx|yarn|tsx|ts-node|vitest|jest|mocha|sh|bash|zsh|dash|ksh|fish|env|xargs|nohup|timeout|time)(\.exe|\.cmd)?$/;
  // Never covered: other JavaScript runtimes and browsers, and commands that reset the environment.
  const RUNTIME =
    /^(deno|bun|bunx|workerd|wrangler|miniflare|electron|chrome|chromium|chromium-browser|google[- ]chrome.*|chrome-headless-shell|headless_shell|firefox|msedge|microsoft edge.*|webkit|minibrowser|qjs|quickjs|d8|jsc|hermes|sudo|doas|su|runuser|pkexec)(\.exe)?$/i;
  const STRIP =
    /(^|[\s;&|(])(env\s+(-[a-zA-Z]*[iu]|--ignore-environment|--unset)|unset\s|export\s+-n\s|NODE_OPTIONS=|NODE_V8_COVERAGE=)/;
  const RUNTIME_WORD =
    /(^|[\s;&|(/])(deno|bun|bunx|workerd|wrangler|miniflare|electron|chromium|google-chrome|firefox|sudo|doas|su|runuser)(\s|$)/i;
  const check = (name, args) => {
    const opts = args.find((a, i) => i > 0 && a !== null && typeof a === 'object' && !Array.isArray(a));
    const env = opts?.env ?? process.env;
    const cmd = name === 'fork' ? process.execPath : String(args[0] ?? '');
    const argv = Array.isArray(args[1]) ? args[1].map(String) : [];
    const shell = name === 'exec' || name === 'execSync' || !!opts?.shell;
    const line = [cmd, ...argv].join(' ');
    // A program path may hold spaces ("Google Chrome for Testing"); only a shell line splits on them.
    const prog = basename(shell ? (cmd.trim().split(/\s+/)[0] ?? '') : cmd);
    const hidden =
      RUNTIME.test(prog) ||
      ((shell || JS.test(prog)) && (STRIP.test(line) || RUNTIME_WORD.test(line))) ||
      (!covered(env) && (name === 'fork' || shell || cmd === process.execPath || JS.test(prog)));
    if (hidden) note('hidden', { pid: process.pid, call: name, cmd: line.slice(0, 200), owner });
  };
  for (const name of ['spawn', 'spawnSync', 'execFile', 'execFileSync', 'exec', 'execSync', 'fork']) {
    const orig = cp[name];
    if (typeof orig !== 'function') continue;
    const wrapped = {
      [name](...args) {
        check(name, args);
        return orig.apply(this, args);
      },
    }[name];
    // Keeps util.promisify.custom (exec, execFile), name and length.
    Object.defineProperties(wrapped, Object.getOwnPropertyDescriptors(orig));
    cp[name] = wrapped;
  }

  // The changed files (want.json): their source maps when vitest evaluates them, and their text when anything
  // evaluates it through vm or Module#_compile without naming a file. Text is compared without `export`, blanks
  // or semicolons and with one kind of quote (running a module as a script strips `export`; a transpiler may
  // rewrite quotes), in 32-character windows starting at each line, so short lines count too.
  let want = new Set();
  const norm = (s) =>
    s
      .replace(/\bexport\s+(default\s+)?/g, '')
      .replace(/[\s;]+/g, '')
      .replace(/['"`]/g, '"');
  const grams = new Set();
  try {
    want = new Set(JSON.parse(readFileSync(join(dir, 'want.json'), 'utf8')));
    for (const f of want) {
      let text = '';
      const starts = [];
      for (const l of readFileSync(f, 'utf8').split('\n')) {
        starts.push(text.length);
        text += norm(l);
      }
      for (const s of starts) if (text.length - s >= 32) grams.add(text.slice(s, s + 32));
    }
  } catch {
    // No list: nothing to keep.
  }
  if (want.size) {
    const INLINE =
      /\/\/[#@] sourceMappingURL=data:application\/json(?:;charset=[\w-]+)?;base64,([A-Za-z0-9+/=]+)/g;
    const fileOf = (options) => {
      const file = typeof options === 'string' ? options : options?.filename;
      if (typeof file !== 'string') return { file: undefined, path: undefined };
      const path = file.startsWith('file://') ? decodeURIComponent(new URL(file).pathname) : file;
      return { file, path: path.startsWith('/') ? path : undefined };
    };
    const evaled = (code, path) => {
      if (path || typeof code !== 'string') return;
      const c = norm(code);
      for (const g of grams)
        if (c.includes(g)) {
          note('evaled', { pid: process.pid, owner });
          return;
        }
    };
    // node -e / --eval: this process's own inline code.
    try {
      if (typeof process._eval === 'string') evaled(process._eval, undefined);
    } catch {
      // Never in the way of the test.
    }
    // require-from-string and bundlers compile CommonJS text through Module#_compile, not the public vm.
    const compile = Module.prototype._compile;
    if (typeof compile === 'function')
      Module.prototype._compile = function _compile(content, filename) {
        try {
          if (typeof filename !== 'string' || !filename.startsWith('/')) evaled(content, undefined);
        } catch {
          // Never in the way of the test.
        }
        return compile.apply(this, arguments);
      };
    const watch = (name, codeAt, optionsAt) => {
      const orig = vm[name];
      if (typeof orig !== 'function') return;
      vm[name] = {
        [name](...args) {
          try {
            evaled(args[codeAt], fileOf(args[optionsAt]).path);
          } catch {
            // Never in the way of the test.
          }
          return orig.apply(this, args);
        },
      }[name];
    };
    watch('runInNewContext', 0, 2);
    watch('runInContext', 0, 2);
    watch('compileFunction', 0, 2);
    const Script = vm.Script;
    vm.Script = new Proxy(Script, {
      construct(target, args, newTarget) {
        try {
          evaled(args[0], fileOf(args[1]).path);
        } catch {
          // Never in the way of the test.
        }
        return Reflect.construct(target, args, newTarget);
      },
    });
    const run = vm.runInThisContext;
    vm.runInThisContext = function runInThisContext(code, options) {
      try {
        const { file, path } = fileOf(options);
        evaled(code, path);
        if (typeof code === 'string' && path && want.has(path)) {
          const last = [...code.matchAll(INLINE)].pop();
          if (last)
            note('src', {
              pid: process.pid,
              url: file,
              length: code.length,
              lineLengths: code.split('\n').map((l) => l.length),
              lineOffset: (typeof options === 'object' && options?.lineOffset) || 0,
              columnOffset: (typeof options === 'object' && options?.columnOffset) || 0,
              map: Buffer.from(last[1], 'base64').toString('utf8'),
            });
        }
      } catch {
        // Unmapped: coverage.ts treats the file as unknown.
      }
      return run.apply(this, arguments);
    };
  }
  // Named ESM imports (import { spawn } from 'node:child_process') see the wrappers too.
  syncBuiltinESMExports();

  // Vitest's pool stops fork workers with SIGTERM, which would skip writing their coverage.
  if (/[\\/]vitest[\\/]dist[\\/]workers[\\/]/.test(process.argv[1] ?? ''))
    process.on('SIGTERM', () => process.exit(143));
}
