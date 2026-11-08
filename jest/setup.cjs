// Jest setupFilesAfterEnv entry (@jiffy/jest-plugin/setup): collects V8 coverage per test file itself, so
// code outside the project's rootDir (other workspace packages, their dist/) is recorded too. Jest's own
// --coverage keeps only files under rootDir. Plain CommonJS with no dependencies, because Jest loads it through
// the project's transform and module registry. Use it without --coverage: both would drive the same V8
// profiler. The reporter (@jiffy/jest-plugin) sets JIFFY_JEST_DIR and reads what this writes.
//
// Reads and child processes: the reporter starts Jest's workers with the node:test recorder's preload as a host
// (JIFFY_HOST), which wraps fs and child_process before Jest loads anything and leaves a host factory on the fs
// module. Each test file is a window of that host (begin here, end in the last afterAll): the repo files it read,
// lists or checks for, its Node children's functions and reads, and anything it ran where the recorder can't see it.
// Without a host (worker threads, no preload) the file's record says nothing about reads or children.
'use strict';
const inspector = require('node:inspector');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const { join } = require('node:path');

const dir = process.env.JIFFY_JEST_DIR;
const testPath = expect.getState().testPath;

if (dir && testPath) {
  // One session per worker process, kept on the (shared) inspector module: restarting precise coverage for every
  // test file would cost far more than a take (it deoptimizes everything).
  const key = Symbol.for('jiffy.session');
  let session = inspector[key];
  const post = (method, params) =>
    new Promise((res, rej) => session.post(method, params, (e, r) => (e ? rej(e) : res(r))));
  // Normally started already, since the worker started (the preload, or the reporter in band), and each file's last
  // afterAll takes its share: what ran since the last take (this file's setupFiles and environment, or whatever a
  // file that failed before its afterAll left) counts for this file. More, never less. There it runs in V8's binary
  // mode with a fresh copy of each module per file (packages/node-test/src/fresh.ts, which leaves its take here).
  // Without it (no preload: worker threads, a preload path NODE_OPTIONS can't carry), this file starts a session with
  // call counts, which costs more but makes every take a delta. Posted without waiting: an in-process session
  // handles them before the test file's modules load.
  const fresh = inspector[Symbol.for('jiffy.fresh')];
  if (!session) {
    session = inspector[key] = new inspector.Session();
    session.connect();
    post('Profiler.enable');
    post('Profiler.startPreciseCoverage', { callCount: true, detailed: false });
  }
  const getHost = fs[Symbol.for('jiffy.host')];
  let host = null;
  try {
    host = typeof getHost === 'function' ? getHost() : null;
    // Normally open already, for this file: the begin setup file (setupFiles, @jiffy/jest-plugin/begin) opens it
    // before Jest sets the file up, so everything its setup does counts for it, and in band the reporter opens it.
    // Anything else (a window an earlier file left open when it failed before its last afterAll) starts afresh.
    if (host) {
      if (!host.isOpen()) host.begin(testPath);
      else host.label = testPath;
      // Jest copied the environment into the test's process.env before this window opened (and in band before this
      // process had a host): a child started with {...process.env} must carry what reports to this window.
      Object.assign(process.env, host.childEnv());
    }
  } catch {
    host = null;
  }

  const collect = async (via) => {
    let result;
    const incomplete = [];
    if (fresh) {
      try {
        const take = fresh.take(session);
        // This file's own module copies, and what scripts that outlive a file ran in this worker so far.
        result = [...take.window, ...take.persistent];
        // Its modules are fresh copies only if Jest compiled them through the vm functions fresh.ts wraps, as it
        // compiled this setup file; otherwise binary mode may have reported their functions to an earlier file.
        if (!take.compiled.has(__filename))
          incomplete.push("Jest compiled this file's modules where the recorder can't make fresh copies");
      } catch (e) {
        result = [];
        incomplete.push(`coverage couldn't be taken: ${String(e)}`);
      }
    } else ({ result } = await post('Profiler.takePreciseCoverage'));
    const scripts = [];
    for (const s of result) {
      if (!/^(file:\/\/)?\//.test(s.url) || s.url.includes('/node_modules/') || s.url.endsWith(__filename))
        continue;
      // V8 lists a script's top level first, but only for scripts compiled after coverage started.
      const top = s.functions[0] && !s.functions[0].functionName ? s.functions[0] : null;
      const ran = s.functions.filter(
        (f) => f !== top && f.functionName && f.ranges[0] && f.ranges[0].count > 0,
      );
      // Jest re-runs every module per test file, so a script whose top level didn't run and none of whose
      // functions ran belongs to an earlier test file in this worker.
      if (!(top && top.ranges[0] && top.ranges[0].count > 0) && !ran.length) continue;
      const mod = top || { functionName: '', ranges: [{ startOffset: 0, endOffset: 0, count: 0 }] };
      scripts.push({
        url: s.url,
        functions: [mod, ...ran].map((f) => ({ functionName: f.functionName, ranges: f.ranges.slice(0, 1) })),
      });
    }
    let window = null;
    if (host) {
      try {
        window = await host.end();
        // The next file's window opens now, so its setupFiles and environment count for it.
        host.begin();
      } catch (e) {
        window = { reads: [], scripts: [], incomplete: [`the recorder's window failed: ${String(e)}`] };
      }
    }
    // One file per run (the same test file can run in several projects), renamed into place so the reporter
    // never reads half of it.
    const name = `${createHash('sha1').update(testPath).digest('hex')}.${process.pid}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
    const record = window
      ? {
          testPath,
          via,
          scripts,
          tracked: true,
          reads: window.reads,
          loaderReads: window.loaderReads,
          children: window.scripts,
          incomplete: [...incomplete, ...(window.incomplete ?? [])],
        }
      : { testPath, via, scripts, incomplete };
    fs.writeFileSync(join(dir, `${name}.tmp`), JSON.stringify(record));
    fs.renameSync(join(dir, `${name}.tmp`), join(dir, `${name}.json`));
  };

  // Root-level afterAll hooks run in the order they were added, so one added here would run before the test
  // file's own and miss what they call. jest-circus (29, 30) keeps its state on the test global under a symbol
  // described JEST_STATE_SYMBOL and adds hooks with rootDescribeBlock.hooks.push: keep ours last.
  afterAll(() => collect(last ? 'last' : 'afterAll'));
  const sym = Object.getOwnPropertySymbols(globalThis).find((x) => x.description === 'JEST_STATE_SYMBOL');
  const hooks =
    sym && globalThis[sym] && globalThis[sym].rootDescribeBlock && globalThis[sym].rootDescribeBlock.hooks;
  const ours = Array.isArray(hooks) ? hooks[hooks.length - 1] : undefined;
  const last = !!(ours && ours.type === 'afterAll');
  if (last) {
    hooks.push = function (...items) {
      const i = this.indexOf(ours);
      if (i !== -1) this.splice(i, 1);
      return Array.prototype.push.call(this, ...items, ours);
    };
  }
}
