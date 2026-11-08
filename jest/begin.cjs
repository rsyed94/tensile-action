// Jest setupFiles entry (@jiffy/jest-plugin/begin): opens the recording window for the test file Jest is about to
// set up, in the worker's host (the node:test recorder's preload, started by the reporter), so the file's reads and
// children count from its first setup file on, including Jest's check for its snapshot file. Each file opens a fresh
// window, so a file that failed before the setup file's last afterAll can't leak into the next one. Optional: without
// it the setup file opens the window, a little later.
'use strict';
const getHost = require('node:fs')[Symbol.for('jiffy.host')];
if (process.env.JIFFY_JEST_DIR && typeof getHost === 'function') {
  try {
    const host = getHost();
    host.begin('jest:next');
    Object.assign(process.env, host.childEnv());
  } catch {
    // the setup file opens it instead
  }
}
