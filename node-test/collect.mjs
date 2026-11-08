// src/collect.ts
import { existsSync as existsSync2, mkdirSync, readdirSync, readFileSync, renameSync as renameSync2, rmSync, writeFileSync as writeFileSync2 } from "node:fs";
import { join as join2, resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { parseArgs } from "node:util";

// ../engine/src/coverage/map.ts
var fnId = (path, name) => `${path}::${name}`;
var ANY_FN = "*";

// ../engine/src/coverage/format.ts
var MAX_MAP_BYTES = 256 * 1024 * 1024;

// ../engine/src/coverage/reads.ts
var READS_MARK = fnId("", "jiffy:reads");

// ../engine/src/coverage/root.ts
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
function findRepoRoot(start) {
  for (let d = resolve(start); ; d = dirname(d)) {
    if (existsSync(join(d, ".git"))) return d;
    if (dirname(d) === d) return resolve(start);
  }
}

// ../engine/src/coverage/v8.ts
import { fileURLToPath } from "node:url";

// ../engine/src/classify.ts
var TEST_FILE = /(^|[./])(test|spec)\.[cm]?[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.py$/;

// ../engine/src/coverage/v8.ts
function v8FunctionName(name) {
  return (name.split(".").at(-1) ?? name).replace(/^(get|set) /, "");
}
function urlToPath(url) {
  if (url.startsWith("file://")) {
    try {
      return fileURLToPath(url.split("?")[0]);
    } catch {
      return null;
    }
  }
  return url.startsWith("/") ? url.split("?")[0] : null;
}
function fromV8(scripts, root, normalize = (p) => p) {
  const loaded = /* @__PURE__ */ new Set();
  const fns = /* @__PURE__ */ new Set();
  for (const s of scripts) {
    const abs = urlToPath(s.url);
    if (!abs || !abs.startsWith(root) || abs.includes("/node_modules/")) continue;
    const rel = abs.slice(root.length);
    if (TEST_FILE.test(rel)) continue;
    const p = normalize(rel);
    loaded.add(p);
    for (const f of s.functions.slice(1)) {
      if (f.functionName && (f.ranges[0]?.count ?? 0) > 0) fns.add(fnId(p, v8FunctionName(f.functionName)));
    }
  }
  return { loaded, fns };
}

// ../engine/src/coverage/parts.ts
var PART_FORMAT = 2;
var FORMAT_MARK = fnId("", `jiffy:v${PART_FORMAT}`);
var CHILDREN_MARK = fnId("", "jiffy:children");
function alwaysRunPath(part) {
  return part.replace(/(\.json)?$/, ".always-run.json");
}

// src/part.ts
import { renameSync, writeFileSync } from "node:fs";
var FORMAT_VERSION = PART_FORMAT;
function writeAtomic(path, data) {
  writeFileSync(path + ".tmp", data);
  renameSync(path + ".tmp", path);
}
function writePart(path, records, alwaysRun) {
  const file = { format: "jiffy.always-run", version: FORMAT_VERSION, tests: alwaysRun };
  writeAtomic(alwaysRunPath(path), JSON.stringify(file));
  writeAtomic(path, JSON.stringify(records));
}
var TEST_FILE2 = /(^|[./])(test|spec)\.[cm]?[jt]sx?$/;
function withMarks(fns, marks) {
  const out = new Set(fns);
  out.add(FORMAT_MARK);
  if (marks.reads) out.add(READS_MARK);
  if (marks.children) out.add(CHILDREN_MARK);
  return [...out].sort();
}

// src/collect.ts
function collect(dir, root) {
  const started = /* @__PURE__ */ new Map();
  const ended = /* @__PURE__ */ new Map();
  const marks = /* @__PURE__ */ new Map();
  for (const name of readdirSync(dir).sort()) {
    const m = /^([spx])-(.+)\.json$/.exec(name);
    if (!m) continue;
    let json;
    try {
      json = JSON.parse(readFileSync(join2(dir, name), "utf8"));
    } catch (e) {
      throw new Error(`cannot read ${name}: ${e.message}`);
    }
    if (m[1] === "s") started.set(m[2], json);
    else if (m[1] === "p") ended.set(m[2], json);
    else {
      const x = json;
      if (!marks.has(x.test)) marks.set(x.test, x.why);
    }
  }
  const byTest = /* @__PURE__ */ new Map();
  const entry = (t) => byTest.get(t) ?? byTest.set(t, { starts: [], ends: [] }).get(t);
  for (const [id, s] of started) entry(s.test).starts.push(id);
  for (const p of ended.values()) entry(p.test).ends.push(p);
  for (const t of marks.keys()) entry(t);
  const rel = (abs) => abs.startsWith(root) ? abs.slice(root.length) : abs + "/" === root ? "" : null;
  const records = {};
  const unrecorded = {};
  const results = /* @__PURE__ */ new Map();
  for (const [abs, { starts, ends }] of byTest) {
    const t = rel(abs);
    if (!t) continue;
    const own = ends.find((p) => p.direct);
    const r = own?.results;
    const failed = !own || own.code !== 0 || !r || r.failed > 0;
    results.set(abs, {
      status: failed ? "failed" : "passed",
      tests: r?.tests ?? 0,
      skipped: r?.skipped ?? 0,
      ms: r?.ms ?? 0
    });
    const lost = starts.filter((id) => !ended.has(id)).length;
    const why = marks.has(abs) ? marks.get(abs) : lost ? `${lost} of its processes left no record (killed or terminated)` : !own ? "no record from its own process" : r?.failed ? "a test failed" : r?.skipped ? `${r.skipped} test(s) skipped or todo` : own.code !== 0 ? "its process exited with an error" : !r?.events ? "no test results seen" : r.tests < r.enqueued ? "its process ended before all its tests finished" : !own.scripts.some((s) => s.url.startsWith("file:") && fileURLToPath2(s.url) === abs) ? "its coverage doesn't include the test file itself" : null;
    if (why) {
      unrecorded[t] = why;
      continue;
    }
    const loaded = /* @__PURE__ */ new Set();
    const fns = /* @__PURE__ */ new Set();
    for (const p of ends) {
      const cov = fromV8(p.scripts, root);
      for (const l of cov.loaded) loaded.add(l);
      for (const f of cov.fns) fns.add(f);
      for (const read of p.reads) {
        const r2 = rel(read.endsWith("/") ? read.slice(0, -1) : read);
        if (r2 === null || r2 === t) continue;
        if (read.endsWith("/")) loaded.add(r2 ? r2 + "/" : "./");
        else if (r2) {
          loaded.add(r2);
          fns.add(fnId(r2, ANY_FN));
        }
      }
    }
    for (const p of ends)
      for (const read of p.loaderReads ?? []) {
        const r2 = rel(read);
        if (r2 && r2 !== t && !TEST_FILE2.test(r2) && !loaded.has(r2)) {
          loaded.add(r2);
          fns.add(fnId(r2, ANY_FN));
        }
      }
    records[t] = { loaded: [...loaded].sort(), fns: withMarks(fns, { reads: true, children: true }) };
  }
  return { records, unrecorded, results };
}
function writeAtomic2(path, data) {
  writeFileSync2(path + ".tmp", data);
  renameSync2(path + ".tmp", path);
}
function main() {
  const { values } = parseArgs({
    options: {
      dir: { type: "string" },
      root: { type: "string" },
      "out-dir": { type: "string" },
      verbose: { type: "boolean" }
    }
  });
  const dir = values.dir ?? process.env.JIFFY_NODE_TEST_DIR;
  const root = resolve2(values.root ?? process.env.JIFFY_ROOT ?? findRepoRoot(process.cwd())).replace(
    /\/?$/,
    "/"
  );
  const outDir = resolve2(values["out-dir"] ?? join2(root, ".jiffy"));
  if (!dir || !existsSync2(dir)) {
    console.log(
      `jiffy: no node:test records (${dir ?? "JIFFY_NODE_TEST_DIR unset"}); did the setup step run?`
    );
    return;
  }
  const coverage = join2(outDir, "coverage-node-test.json");
  let collected;
  try {
    collected = collect(dir, root);
  } catch (e) {
    rmSync(coverage, { force: true });
    rmSync(alwaysRunPath(coverage), { force: true });
    console.log(`::warning::jiffy: no node:test coverage part: ${e.message}`);
    return;
  }
  const { records, unrecorded, results } = collected;
  mkdirSync(outDir, { recursive: true });
  const testResults = [...results].map(([name, r]) => ({
    name,
    startTime: 0,
    endTime: Math.max(1, Math.round(r.ms)),
    status: r.status,
    tests: r.tests,
    skipped: r.skipped
  }));
  writeAtomic2(join2(outDir, "report-node-test.json"), JSON.stringify({ testResults }));
  writePart(coverage, records, unrecorded);
  const n = Object.keys(unrecorded).length;
  console.log(
    `jiffy: recorded ${Object.keys(records).length} node:test files to ${coverage}` + (n ? `; ${n} have no record and always run` : "")
  );
  const show = values.verbose ? n : 50;
  for (const [t, why] of Object.entries(unrecorded).slice(0, show)) console.log(`  ${t}: ${why}`);
  if (n > show) console.log(`  ... and ${n - show} more`);
}
if (import.meta.main ?? process.argv[1]?.endsWith("collect.mjs")) {
  try {
    main();
  } catch (e) {
    console.log(`::warning::jiffy: node:test collect failed: ${e.message}`);
  }
}
export {
  collect
};
