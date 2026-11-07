// node:test reporter for Jiffy: per test file, every leaf test that passed or failed, named by its full path
// (suite titles and the test title joined with " > "), with the failure type and first message. A file that
// fails to load shows up as a top-level failure named after the file itself. `ms`: from the file's first test
// starting to its last result (module loading before that isn't included).
export default async function* reporter(source) {
  const files = {};
  const stacks = {};
  const times = {};
  for await (const { type, data } of source) {
    if (!data?.file) continue;
    if (type === 'test:start' || type === 'test:pass' || type === 'test:fail') {
      const t = (times[data.file] ??= [Date.now(), 0]);
      t[1] = Date.now();
    }
    const stack = (stacks[data.file] ??= []);
    if (type === 'test:start') {
      stack[data.nesting] = data.name;
      stack.length = data.nesting + 1;
      continue;
    }
    if (type !== 'test:pass' && type !== 'test:fail') continue;
    const f = (files[data.file] ??= { passed: [], skip: 0, failed: [] });
    const path = [...stack.slice(0, data.nesting), data.name].join(' > ');
    // A suite's own result repeats its children's; only a failure of the suite itself (a hook) is kept.
    const suite = data.details?.type === 'suite';
    if (data.skip || data.todo) {
      if (!suite) f.skip++;
      continue;
    }
    if (type === 'test:pass') {
      if (!suite) f.passed.push(path);
      continue;
    }
    const e = data.details?.error;
    // A parent failing only because a subtest failed repeats that subtest's result (which may be a timeout).
    if (e?.failureType === 'subtestsFailed') continue;
    // An error that wraps its cause often repeats the cause's message: keep each text once. ERR_TEST_FAILURE is
    // node:test's wrapper on every failure; codes like EADDRINUSE stay (they mark environment errors).
    const parts = [e?.message, e?.cause?.message, e?.cause?.code, e?.code].filter(
      (x) => x && x !== 'ERR_TEST_FAILURE',
    );
    const msg = [...new Set(parts)].join(' | ');
    f.failed.push({
      name: path,
      type: suite ? 'hookFailure' : (e?.failureType ?? ''),
      // node:test names a file that failed to load after the file (the path it was given).
      fileLevel:
        data.nesting === 0 &&
        (data.name === data.file || (/\.[cm]?[jt]sx?$/.test(data.name) && data.file.endsWith(data.name))),
      msg: msg.slice(0, 500),
    });
  }
  for (const [file, f] of Object.entries(files)) if (times[file]) f.ms = times[file][1] - times[file][0];
  yield JSON.stringify(files);
}
