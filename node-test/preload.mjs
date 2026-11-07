// src/preload.ts
import cp from "node:child_process";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import inspector from "node:inspector";
import { syncBuiltinESMExports } from "node:module";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import v8 from "node:v8";
import wt from "node:worker_threads";
var dir = process.env.JIFFY_NODE_TEST_DIR;
var root = process.env.JIFFY_ROOT ? resolve(process.env.JIFFY_ROOT) + "/" : "";
var inherited = process.env.JIFFY_NODE_TEST_FILE;
var direct = !inherited && !!process.env.NODE_TEST_CONTEXT && !!process.argv[1];
var test = !wt.isMainThread ? void 0 : direct ? resolve(process.argv[1]) : inherited;
var id = `${process.pid}-${randomBytes(4).toString("hex")}`;
var marks = 0;
var { writeFileSync, renameSync, realpathSync, readdirSync, statSync } = fs;
function put(name, value) {
  const tmp = join(dir, `.${name}.tmp`);
  writeFileSync(tmp, JSON.stringify(value));
  renameSync(tmp, join(dir, name));
}
function incomplete(why) {
  try {
    put(`x-${id}-${marks++}.json`, { test, why });
  } catch {
  }
}
if (dir && test) {
  try {
    put(`s-${id}.json`, { test, direct });
    if (!root) incomplete("JIFFY_ROOT is not set");
    else if (process.permission) incomplete("runs with --permission");
    else record(test);
  } catch (e) {
    incomplete(`recorder setup failed: ${String(e)}`);
  }
}
function record(test2) {
  process.env.JIFFY_NODE_TEST_FILE = test2;
  if (direct) {
    const filter = process.execArgv.find((a) => /^--test-(name-pattern|skip-pattern|only)\b/.test(a));
    if (filter) incomplete(`filtered run (${filter.split("=")[0]})`);
  }
  const session = new inspector.Session();
  session.connect();
  const post = (method, params) => {
    let out;
    let err = null;
    session.post(method, params, (e, r) => {
      err = e;
      out = r;
    });
    if (err) throw err;
    return out ?? {};
  };
  const shared = !!process.env.NODE_V8_COVERAGE;
  post("Profiler.enable");
  if (!shared) post("Profiler.startPreciseCoverage", { callCount: false, detailed: false });
  const results = direct ? watchResults() : null;
  const reads = /* @__PURE__ */ new Set();
  const add = (abs) => {
    reads.add(abs);
    try {
      const real = realpathSync(abs.endsWith("/") && abs.length > 1 ? abs.slice(0, -1) : abs);
      if (real !== abs.replace(/\/$/, "")) reads.add(real + (abs.endsWith("/") ? "/" : ""));
    } catch {
    }
  };
  const toPath = (p2) => {
    if (typeof p2 === "string") return p2;
    if (p2 instanceof URL) return p2.protocol === "file:" ? fileURLToPath(p2) : "";
    if (Buffer.isBuffer(p2)) return p2.toString();
    return "";
  };
  const note = (p2, isDir) => {
    const s = toPath(p2);
    if (!s) return;
    const abs = resolve(s) + (isDir ? "/" : "");
    if (!reads.has(abs) && !(SOURCE.test(abs) && fromLoader())) add(abs);
  };
  const noteTree = (p2) => {
    const s = toPath(p2);
    if (!s) return;
    const start = resolve(s);
    const stack = [start];
    for (let n = 0; stack.length && n < 1e4; n++) {
      const at = stack.pop();
      let isDir = false;
      try {
        isDir = statSync(at).isDirectory();
      } catch {
      }
      add(isDir ? at + "/" : at);
      if (!isDir) continue;
      try {
        for (const e of readdirSync(at)) stack.push(join(at, e));
      } catch (e) {
        incomplete(`cp read a directory the recorder couldn't list: ${String(e)}`);
        return;
      }
    }
    if (stack.length) incomplete("cp copied more than the 10,000 files and directories the recorder lists");
  };
  const readFlags = (f2) => f2 === void 0 || f2 === null || (typeof f2 === "string" ? f2[0] === "r" || f2.includes("+") : (Number(f2) & 3) !== 1);
  const wrap = (obj, name, before) => {
    const orig = obj[name];
    if (typeof orig !== "function") return;
    const wrapped = function(...a) {
      try {
        before(a);
      } catch {
      }
      return orig.apply(this, a);
    };
    const custom = orig[promisify.custom];
    for (const k of Reflect.ownKeys(orig))
      if (k !== "prototype" && !(k === promisify.custom && typeof custom === "function"))
        Object.defineProperty(wrapped, k, Object.getOwnPropertyDescriptor(orig, k));
    if (typeof custom === "function")
      Object.defineProperty(wrapped, promisify.custom, {
        ...Object.getOwnPropertyDescriptor(orig, promisify.custom),
        value: function(...a) {
          try {
            before(a);
          } catch {
          }
          return custom.apply(this, a);
        }
      });
    obj[name] = wrapped;
    return wrapped;
  };
  const file = (a) => note(a[0], false);
  const dirArg = (a) => note(a[0], true);
  const open = (a) => {
    if (readFlags(a[1])) note(a[0], false);
  };
  const tree = (a) => noteTree(a[0]);
  const f = fs;
  const p = fs.promises;
  const probes = ["stat", "lstat", "exists", "access", "realpath", "readlink"];
  for (const n of ["readFile", "copyFile", ...probes]) {
    wrap(f, n + "Sync", file);
    const cb = wrap(f, n, file);
    if (n === "realpath") {
      if (cb) wrap(cb, "native", file);
      const sync = f.realpathSync;
      wrap(sync, "native", file);
    }
  }
  wrap(f, "createReadStream", file);
  for (const n of ["readdir", "opendir"]) {
    wrap(f, n + "Sync", dirArg);
    wrap(f, n, dirArg);
    wrap(p, n, dirArg);
  }
  for (const n of ["openSync", "open"]) wrap(f, n, open);
  wrap(p, "open", open);
  for (const n of ["cpSync", "cp"]) wrap(f, n, tree);
  wrap(p, "cp", tree);
  for (const n of ["readFile", "copyFile", "stat", "lstat", "access", "realpath", "readlink"])
    wrap(p, n, file);
  const self = (process.env.NODE_OPTIONS ?? "").split(" ").find((o) => o.startsWith("--import=") && o.endsWith("/preload.mjs"));
  const Base = wt.Worker;
  wt.Worker = class Worker extends Base {
    constructor(...a) {
      const at = caller();
      if (!TOOLCHAIN.test(at)) incomplete(`started a worker thread (${at.replace(/^at /, "")})`);
      super(...a);
    }
  };
  const c = cp;
  const childCheck = (kind) => (a) => {
    const cmd = kind === "fork" ? process.execPath : String(a[0] ?? "");
    const args = Array.isArray(a[1]) ? a[1].map(String) : [];
    const opts = a.find((x, i) => i > 0 && x && typeof x === "object" && !Array.isArray(x)) ?? {};
    const line = kind.startsWith("exec") && !kind.startsWith("execFile") ? cmd : [cmd, ...args].join(" ");
    const program = basename(line.trim().split(/\s+/)[0] ?? "");
    if (NOT_NODE.has(program) && !opts.shell) return;
    const env = opts.env ?? process.env;
    const permission = [...args, ...opts.execArgv ?? [], env.NODE_OPTIONS ?? ""].some(
      (x) => /--(experimental-)?permission\b/.test(x)
    );
    const stripped = env.JIFFY_NODE_TEST_FILE !== test2 || !self || !(env.NODE_OPTIONS ?? "").includes(self);
    if (permission) incomplete(`started ${program} with --permission`);
    else if (stripped) incomplete(`started ${program} without the recorder's environment`);
  };
  for (const n of ["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync", "fork"])
    wrap(c, n, childCheck(n));
  syncBuiltinESMExports();
  process.on("exit", (code) => {
    try {
      const { result = [] } = post(
        shared ? "Profiler.getBestEffortCoverage" : "Profiler.takePreciseCoverage"
      );
      put(`p-${id}.json`, {
        test: test2,
        direct,
        code: direct ? code : null,
        results,
        scripts: compact(result),
        reads: [...reads].filter(
          (r) => r.startsWith(root) && !/\/(node_modules|\.git)(\/|$)/.test(r.slice(root.length - 1))
        )
      });
    } catch (e) {
      incomplete(`could not write its record: ${String(e)}`);
    }
  });
}
var NOT_NODE = new Set(
  "git gh ssh scp docker podman gitleaks rg grep egrep ls cat cp mv rm ln mkdir rmdir touch chmod tar gzip gunzip unzip zip curl wget openssl gpg python python3 pip uv ruby go cargo true false echo printf sleep kill ps which whoami id uname date head tail sort wc diff patch sed tr cut tee".split(
    " "
  )
);
function watchResults() {
  const r = { events: 0, enqueued: 0, tests: 0, failed: 0, skipped: 0, ms: 0 };
  let buf = Buffer.alloc(0);
  const parse = () => {
    let i = 0;
    while (i < buf.length) {
      const at = buf.indexOf(255, i);
      if (at < 0) {
        i = buf.length;
        break;
      }
      if (at + 6 > buf.length) {
        i = at;
        break;
      }
      const len = buf.readUInt32BE(at + 2);
      if (buf[at + 6] !== 255 || len > 64 * 1024 * 1024) {
        i = at + 1;
        continue;
      }
      if (at + 6 + len > buf.length) {
        i = at;
        break;
      }
      try {
        const e = v8.deserialize(buf.subarray(at + 6, at + 6 + len));
        if (typeof e?.type === "string" && e.type.startsWith("test:")) {
          r.events++;
          if (e.type === "test:enqueue" && e.data?.nesting === 0) r.enqueued++;
          if (e.type === "test:pass" || e.type === "test:fail") {
            if (e.data?.nesting === 0) {
              r.tests++;
              r.ms += e.data.details?.duration_ms ?? 0;
            }
            if (e.type === "test:fail") r.failed++;
            if (e.data?.skip || e.data?.todo) r.skipped++;
          }
        }
        i = at + 6 + len;
      } catch {
        i = at + 1;
      }
    }
    buf = buf.subarray(i);
  };
  const out = process.stdout;
  const write = out.write;
  out.write = function(chunk, ...rest) {
    try {
      if (Buffer.isBuffer(chunk) || chunk instanceof Uint8Array) {
        buf = buf.length ? Buffer.concat([buf, chunk]) : Buffer.from(chunk);
        parse();
      }
    } catch {
    }
    return write.call(this, chunk, ...rest);
  };
  return r;
}
var SOURCE = /\.([cm]?[jt]sx?)$/;
var LOADER = /node:internal\/modules\/|[\\/]node_modules[\\/](tsx|ts-node|jiti|esbuild-register|@swc-node[\\/]register|@babel[\\/]register|pirates)[\\/]/;
var FS = /\((node:fs|node:internal\/fs\/)|at (node:fs|node:internal\/fs\/)/;
var SELF = import.meta.url;
function caller() {
  const limit = Error.stackTraceLimit;
  Error.stackTraceLimit = 16;
  const stack = new Error().stack ?? "";
  Error.stackTraceLimit = limit;
  return stack.split("\n").slice(1).find((l) => !FS.test(l) && !l.includes(SELF))?.trim() ?? "";
}
var fromLoader = () => LOADER.test(caller());
var TOOLCHAIN = new RegExp(`${LOADER.source}|[\\\\/]node_modules[\\\\/](@esbuild|esbuild)[\\\\/]`);
function compact(result) {
  const out = [];
  for (const s of result) {
    if (!s.url.startsWith("file://") || s.url.includes("/node_modules/")) continue;
    let path;
    try {
      path = fileURLToPath(s.url.split("?")[0]);
    } catch {
      continue;
    }
    if (!path.startsWith(root) || !s.functions.length) continue;
    const top = s.functions[0].functionName ? void 0 : s.functions[0];
    const mod = top ?? { functionName: "", ranges: [{ startOffset: 0, endOffset: 0, count: 0 }] };
    const ran = s.functions.filter((f) => f.functionName && (f.ranges[0]?.count ?? 0) > 0);
    out.push({
      url: s.url,
      functions: [mod, ...ran].map((f) => ({ functionName: f.functionName, ranges: f.ranges.slice(0, 1) }))
    });
  }
  return out;
}
