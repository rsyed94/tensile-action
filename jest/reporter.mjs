// packages/jest-plugin/src/index.ts
import { createHash } from "node:crypto";
import fs3, { existsSync as existsSync2, mkdirSync, mkdtempSync as mkdtempSync2, readdirSync as readdirSync3, readFileSync as readFileSync2, rmSync as rmSync2 } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";
import { createRequire } from "node:module";
import { basename as basename2, dirname as dirname2, join as join4, relative, resolve as resolve4, sep } from "node:path";
import { fileURLToPath as fileURLToPath4 } from "node:url";

// packages/engine/src/coverage/map.ts
var fnId = (path, name) => `${path}::${name}`;

// packages/engine/src/coverage/format.ts
var MAX_MAP_BYTES = 256 * 1024 * 1024;

// packages/engine/src/coverage/reads.ts
var READS_MARK = fnId("", "jiffy:reads");

// packages/engine/src/coverage/root.ts
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
function findRepoRoot(start) {
  for (let d = resolve(start); ; d = dirname(d)) {
    if (existsSync(join(d, ".git"))) return d;
    if (dirname(d) === d) return resolve(start);
  }
}

// packages/engine/src/coverage/v8.ts
import { fileURLToPath } from "node:url";

// packages/engine/src/classify.ts
var TEST_FILE = /(^|[./])(test|spec)\.[cm]?[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.py$/;

// packages/engine/src/coverage/v8.ts
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

// packages/engine/src/coverage/parts.ts
var PART_FORMAT = 2;
var FORMAT_MARK = fnId("", `jiffy:v${PART_FORMAT}`);
var CHILDREN_MARK = fnId("", "jiffy:children");
function alwaysRunPath(part) {
  return part.replace(/(\.json)?$/, ".always-run.json");
}

// packages/node-test/src/fresh.ts
import inspector from "node:inspector";
import { syncBuiltinESMExports } from "node:module";
import { fileURLToPath as fileURLToPath2 } from "node:url";
import vm from "node:vm";
var FRESH = /* @__PURE__ */ Symbol.for("jiffy.fresh");
var SESSION = /* @__PURE__ */ Symbol.for("jiffy.session");
var pathOf = (url) => {
  if (url.startsWith("file://")) {
    try {
      return fileURLToPath2(url.split("?")[0]);
    } catch {
      return null;
    }
  }
  return url.startsWith("/") ? url : null;
};
function startCoverage() {
  const mod = inspector;
  if (mod[SESSION]) return !!mod[FRESH];
  const session = new inspector.Session();
  session.connect();
  mod[SESSION] = session;
  session.post("Profiler.enable");
  let fresh = null;
  try {
    fresh = installFresh();
  } catch {
    fresh = null;
  }
  session.post("Profiler.startPreciseCoverage", { callCount: !fresh, detailed: false });
  if (fresh) mod[FRESH] = fresh;
  return !!fresh;
}
function installFresh() {
  let compiles = /* @__PURE__ */ new Map();
  const persistent = /* @__PURE__ */ new Map();
  const ran = /* @__PURE__ */ new Map();
  const named = (s) => s.functions.filter((f, i) => (f.ranges[0]?.count ?? 0) > 0 && (i === 0 || f.functionName)).map((f) => ({ ...f, ranges: f.ranges.slice(0, 1) }));
  const keep = (into, p, fns) => {
    if (!fns.length) return;
    let m2 = into.get(p);
    if (!m2) into.set(p, m2 = /* @__PURE__ */ new Map());
    for (const f of fns) if (f.functionName) m2.set(f.functionName, f);
  };
  let n = 0;
  const count = (filename) => {
    if (typeof filename === "string") compiles.set(filename, (compiles.get(filename) ?? 0) + 1);
  };
  const repo = (filename) => typeof filename === "string" && filename.startsWith("/") && !filename.includes("/node_modules/");
  const m = vm;
  const Original = m.Script;
  m.Script = class Script extends Original {
    constructor(code, options) {
      const filename = typeof options === "string" ? options : options?.filename;
      const jest = typeof code === "string" && code.startsWith('({"Object.<anonymous>":function(');
      super(jest && repo(filename) ? `${code}
//jiffy:${++n}` : code, options);
      if (jest) count(filename);
    }
  };
  const original = m.compileFunction;
  m.compileFunction = function compileFunction(code, params, options) {
    const jest = typeof code === "string" && Array.isArray(params) && params.includes("exports");
    const fn = original.call(
      this,
      jest && repo(options?.filename) ? `${code}
//jiffy:${++n}` : code,
      params,
      options
    );
    if (jest) count(options?.filename);
    return fn;
  };
  const STM = m.SourceTextModule;
  if (typeof STM === "function")
    m.SourceTextModule = class SourceTextModule extends STM {
      constructor(code, options) {
        const id = options?.identifier;
        const path = typeof id === "string" && id.startsWith("file://") ? pathOf(id) : id;
        super(typeof code === "string" && repo(path) ? `${code}
//jiffy:${++n}` : code, options);
        count(path);
      }
    };
  syncBuiltinESMExports();
  return {
    take(session) {
      const compiled = compiles;
      compiles = /* @__PURE__ */ new Map();
      const got = {};
      session.post("Profiler.takePreciseCoverage", (e, r) => {
        got.err = e;
        got.result = r?.result ?? [];
      });
      if (got.err) throw got.err;
      if (!got.result) throw new Error("the coverage take did not answer synchronously");
      const byPath = /* @__PURE__ */ new Map();
      for (const s of got.result) {
        const p = pathOf(s.url);
        if (!p) continue;
        const list = byPath.get(p);
        if (list) list.push(s);
        else byPath.set(p, [s]);
      }
      const window = [];
      for (const [p, scripts] of byPath) {
        const copies = compiled.get(p) ?? 0;
        if (copies && scripts.length <= copies) {
          window.push(...scripts);
          for (const s of scripts) {
            keep(ran, p, named(s));
            if (persistent.has(p)) keep(persistent, p, named(s));
          }
          continue;
        }
        const all = [...scripts.flatMap(named), ...ran.get(p)?.values() ?? []];
        if (!all.length) continue;
        if (!persistent.has(p)) persistent.set(p, /* @__PURE__ */ new Map());
        keep(persistent, p, all);
      }
      const top = { functionName: "", ranges: [{ startOffset: 0, endOffset: 0, count: 1 }] };
      return {
        window,
        persistent: [...persistent].map(([p, fns]) => ({ url: p, functions: [top, ...fns.values()] })),
        compiled: new Set(compiled.keys())
      };
    }
  };
}

// packages/node-test/src/hooks.ts
import cp from "node:child_process";
import fs from "node:fs";
import { syncBuiltinESMExports as syncBuiltinESMExports2 } from "node:module";
import { basename, join as join2, resolve as resolve2 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import { promisify } from "node:util";
import wt from "node:worker_threads";
var { realpathSync, readdirSync, statSync, openSync, readSync, closeSync } = fs;
var realpathNative = realpathSync.native;
var POSIX = process.platform !== "win32";
var SOURCE = /\.([cm]?[jt]sx?)$/;
var LOADER = new RegExp(
  [
    "^node:internal/modules/",
    String.raw`[\\/]node_modules[\\/](tsx|ts-node|jiti|esbuild-register|@swc-node[\\/]register|@babel[\\/]register|pirates)[\\/]`,
    String.raw`[\\/]node_modules[\\/](vitest|vite|vite-node|@vitest[\\/][^\\/]+|jest-runtime|jest-resolve|@jest[\\/][^\\/]+|babel-jest|ts-jest|@swc[\\/]jest)[\\/]`
  ].join("|")
);
var RUNNER = new RegExp(
  String.raw`[\\/]node_modules[\\/](@babel[\\/]core|babel-jest|@jest[\\/](transform|core)|ts-jest|jest-resolve|jest-haste-map|jest-config)[\\/]`
);
var FS = /^node:(fs|internal\/fs\/)|[\\/]node_modules[\\/]graceful-fs[\\/]/;
var SELF = new Set(
  [import.meta.url, import.meta.url.startsWith("file:") ? fileURLToPath3(import.meta.url) : ""].filter(
    Boolean
  )
);
var TOOLCHAIN = new RegExp(`${LOADER.source}|[\\\\/]node_modules[\\\\/](@esbuild|esbuild)[\\\\/]`);
var LIB = /[\\/]node_modules[\\/]/;
var URLISH = /^(node|data|file|https?|blob|npm|jsr|bun|virtual):/;
function sites(limit = 40) {
  const prepare = Error.prepareStackTrace;
  const before = Error.stackTraceLimit;
  let raw = [];
  try {
    Error.prepareStackTrace = (_e, cs) => cs;
    Error.stackTraceLimit = limit;
    raw = new Error().stack ?? [];
  } finally {
    Error.prepareStackTrace = prepare;
    Error.stackTraceLimit = before;
  }
  const out = [];
  out.whole = !Array.isArray(raw) || raw.length < limit;
  for (const c of Array.isArray(raw) ? raw.slice(1) : []) {
    const file = c.getFileName?.() ?? "";
    if (FS.test(file) || SELF.has(file)) continue;
    out.push({
      file,
      get text() {
        return `${c.getFunctionName?.() ?? "<anonymous>"} (${file}:${c.getLineNumber?.() ?? 0})`;
      }
    });
  }
  return out;
}
function readBy() {
  let s = sites(12);
  for (; ; ) {
    const first = s[0]?.file ?? "";
    for (const { file } of s) {
      if (RUNNER.test(file)) return { kind: "runner", first };
      if (LOADER.test(file)) return { kind: "loader", first };
      if (file && !LIB.test(file) && !file.startsWith("node:") && /[\\/]/.test(file))
        return { kind: LIB.test(first) ? "lib" : "test", first };
    }
    if (s.whole) return { kind: LIB.test(first) ? "lib" : "test", first };
    s = sites(40);
    s.whole = true;
  }
}
var NOT_NODE = new Set(
  "git gh ssh scp gitleaks rg grep egrep ls cat cp mv rm ln mkdir rmdir touch chmod tar gzip gunzip unzip zip curl wget openssl gpg true false echo printf sleep kill ps which whoami id uname date head tail sort wc diff patch sed tr cut tee ldconfig getconf sysctl sw_vers locale".split(
    " "
  )
);
var LIST_ONLY = new Set("ls rm rmdir mkdir mv touch chmod ln".split(" "));
var NODE_LAUNCHERS = new Set(
  "node nodejs npm npx pnpm pnpx yarn yarnpkg corepack tsx ts-node vite-node vitest jest mocha c8 nyc ava tap borp".split(
    " "
  )
);
function whichProgram(cmd, env, cwd) {
  if (!cmd) return "";
  if (cmd.includes("/")) return resolve2(cwd, cmd);
  for (const d of (env.PATH ?? process.env.PATH ?? "").split(":")) {
    if (!d) continue;
    const p = resolve2(cwd, d, cmd);
    try {
      if (statSync(p).isFile()) return p;
    } catch {
    }
  }
  return "";
}
function nodeShebang(abs) {
  if (!abs) return false;
  let fd;
  try {
    fd = openSync(abs, "r");
    const buf = Buffer.alloc(128);
    const n = readSync(fd, buf, 0, 128, 0);
    const line = buf.toString("utf8", 0, n).split("\n")[0] ?? "";
    return /^#!.*\bnode(\s|$)/.test(line) || /^#!.*\/env\s+(-S\s+)?(node|tsx)(\s|$)/.test(line);
  } catch {
    return false;
  } finally {
    if (fd !== void 0) closeSync(fd);
  }
}
function hasPreload(nodeOptions, preload) {
  if (!preload) return false;
  let want;
  try {
    want = realpathSync(preload);
  } catch {
    want = resolve2(preload);
  }
  for (const o of (nodeOptions ?? "").split(" ")) {
    if (!o.startsWith("--import=")) continue;
    const p = o.slice("--import=".length).replace(/^file:\/\//, "");
    try {
      if (realpathSync(p) === want) return true;
    } catch {
      if (resolve2(p) === want) return true;
    }
  }
  return false;
}
var installed = /* @__PURE__ */ Symbol.for("jiffy.hooks");
function installHooks(options) {
  const reg = fs;
  const held = reg[installed];
  if (held) {
    Object.assign(held, options);
    return false;
  }
  const o = reg[installed] = { ...options };
  const sink = {
    active: () => o.sink.active(),
    has: (abs) => o.sink.has(abs),
    read: (abs, kind) => o.sink.read(abs, kind),
    incomplete: (why) => o.sink.incomplete(why),
    keeps: (env) => o.sink.keeps(env)
  };
  let epoch;
  let reals = /* @__PURE__ */ new Map();
  const realOf = (p2) => {
    const e = o.sink.epoch?.();
    if (e !== epoch) {
      epoch = e;
      reals = /* @__PURE__ */ new Map();
    }
    let r = reals.get(p2);
    if (r === void 0) reals.set(p2, r = realpathNative(p2));
    return r;
  };
  const NOT_NORMAL = /\/\/|\/\.\.?(\/|$)/;
  const absolute = (s) => POSIX && s.charCodeAt(0) === 47 && !NOT_NORMAL.test(s) && (s.length === 1 || !s.endsWith("/")) ? s : resolve2(s);
  const inRepo = (abs) => {
    const r = o.root;
    const p2 = abs.endsWith("/") ? abs : abs + "/";
    if (!p2.startsWith(r)) return false;
    return !/\/(node_modules|\.git)(\/|$)/.test(abs.slice(r.length - 1));
  };
  const report = (abs, kind) => {
    if (inRepo(abs)) sink.read(abs, kind);
  };
  const add = (abs, kind) => {
    report(abs, kind);
    if (kind === "runner") return;
    try {
      const dir = abs.endsWith("/");
      const real = realOf(dir && abs.length > 1 ? abs.slice(0, -1) : abs);
      if (real !== abs.replace(/\/$/, "")) report(real + (dir ? "/" : ""), kind);
    } catch {
    }
  };
  const toPath = (p2) => {
    if (typeof p2 === "string") return p2;
    if (p2 instanceof URL) return p2.protocol === "file:" ? fileURLToPath3(p2) : "";
    if (Buffer.isBuffer(p2)) return p2.toString();
    return "";
  };
  const note = (p2, isDir) => {
    if (!sink.active()) return;
    const s = toPath(p2);
    if (!s || URLISH.test(s)) return;
    const abs = absolute(s) + (isDir ? "/" : "");
    if (sink.has(abs) || !inRepo(abs)) return;
    const { kind } = readBy();
    const k = kind === "runner" ? SOURCE.test(abs) ? "loader" : "runner" : kind === "loader" ? SOURCE.test(abs) ? "loader" : "test" : kind === "lib" && o.classifyLib ? "lib" : "test";
    add(abs, k);
  };
  const noteTree = (p2, what = "cp") => {
    if (!sink.active()) return;
    const s = toPath(p2);
    if (!s) return;
    const stack = [resolve2(s)];
    for (let n = 0; stack.length && n < 1e4; n++) {
      const at = stack.pop();
      let isDir = false;
      try {
        isDir = statSync(at).isDirectory();
      } catch {
      }
      if (isDir && sink.has(at + "/")) continue;
      add(isDir ? at + "/" : at, "test");
      if (!isDir) continue;
      try {
        for (const e of readdirSync(at))
          if (!(e === "node_modules" || e === ".git" || e === ".venv" || e === "venv"))
            stack.push(join2(at, e));
      } catch (e) {
        sink.incomplete(`${what} read a directory the recorder couldn't list: ${String(e)}`);
        return;
      }
    }
    if (stack.length)
      sink.incomplete(`${what} copied more than the 10,000 files and directories the recorder lists`);
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
  const Base = wt.Worker;
  wt.Worker = class Worker extends Base {
    constructor(...a) {
      try {
        if (sink.active()) {
          const s = sites();
          if (!s.some((x) => TOOLCHAIN.test(x.file)))
            sink.incomplete(`started a worker thread (${s[0]?.text ?? "unknown"})`);
        }
      } catch {
      }
      super(...a);
    }
  };
  const argRead = (w, cwd, listOnly) => {
    if (!w || w.startsWith("-")) return;
    const abs = resolve2(cwd, w);
    try {
      const st = statSync(abs);
      if (st.isDirectory()) {
        if (listOnly) add(abs + "/", "test");
        else noteTree(abs, "a child process");
      } else if (st.isFile() && !sink.has(abs)) add(abs, "test");
    } catch {
    }
  };
  const judge = (words, env, cwd, extra, shell) => {
    const cmd = words[0] ?? "";
    const program = basename(cmd);
    if (NOT_NODE.has(program)) {
      if (shell && words.some((w) => /[*?[]/.test(w)))
        return `ran ${program} on a shell glob the recorder can't expand`;
      return null;
    }
    const node = cmd === process.execPath || NODE_LAUNCHERS.has(program) || /^node\d*$/.test(program) || nodeShebang(whichProgram(cmd, env, cwd));
    if (!node) return `started ${program || "a process"}, which may run code the recorder can't follow`;
    const permission = [...words, ...extra, env.NODE_OPTIONS ?? ""].some(
      (x) => /--(experimental-)?permission\b/.test(x)
    );
    if (permission) return `started ${program} with --permission`;
    if (!sink.keeps(env)) return `started ${program} without the recorder's environment`;
    return null;
  };
  const c = cp;
  const childCheck = (kind) => (a) => {
    if (!sink.active()) return;
    const cmd = kind === "fork" ? process.execPath : String(a[0] ?? "");
    const args = Array.isArray(a[1]) ? a[1].map(String) : [];
    const opts = a.find((x, i) => i > 0 && x && typeof x === "object" && !Array.isArray(x)) ?? {};
    const cwd = typeof opts.cwd === "string" ? resolve2(opts.cwd) : opts.cwd instanceof URL ? fileURLToPath3(opts.cwd) : process.cwd();
    const env = opts.env ?? process.env;
    const shell = !!opts.shell || kind.startsWith("exec") && !kind.startsWith("execFile");
    const line = shell ? [cmd, ...args].join(" ") : "";
    const argv = kind === "fork" ? [process.execPath, String(a[0] ?? ""), ...args] : [cmd, ...args];
    const commands = shell ? line.split(/&&|\|\||[;|&\n()`]|\$\(/).map((seg) => seg.trim().split(/\s+/).filter(Boolean)).filter((ws) => ws.length) : [argv];
    let n = 0;
    for (const ws of commands) {
      const listOnly = LIST_ONLY.has(basename(ws.find((w) => !/^\w+=/.test(w)) ?? ""));
      for (const w of ws) if (n++ < 64) argRead(w, cwd, listOnly);
    }
    for (const raw of commands) {
      let i = 0;
      const own = { ...env };
      while (i < raw.length && /^\w+=/.test(raw[i])) {
        const [k, ...v] = raw[i].split("=");
        own[k] = v.join("=").replace(/^(["'])(.*)\1$/, "$2");
        i++;
      }
      const ws = raw.slice(i);
      if (!ws.length) continue;
      const why = judge(ws, own, cwd, opts.execArgv ?? [], shell);
      if (why) return sink.incomplete(why);
    }
  };
  for (const n of ["spawn", "spawnSync", "exec", "execSync", "execFile", "execFileSync", "fork"])
    wrap(c, n, childCheck(n));
  syncBuiltinESMExports2();
  return true;
}

// packages/node-test/src/host.ts
import fs2 from "node:fs";
import { tmpdir } from "node:os";
import { join as join3, resolve as resolve3 } from "node:path";
var { readdirSync: readdirSync2, readFileSync, rmSync, mkdtempSync, statSync: statSync2 } = fs2;
var HOST = /* @__PURE__ */ Symbol.for("jiffy.host");
var Host = class {
  root;
  dir;
  preload;
  token = "";
  n = 0;
  open = false;
  reads = /* @__PURE__ */ new Set();
  seen = /* @__PURE__ */ new Set();
  loader = /* @__PURE__ */ new Set();
  lib = /* @__PURE__ */ new Set();
  all = /* @__PURE__ */ new Set();
  libAll = /* @__PURE__ */ new Set();
  marks = [];
  past = /* @__PURE__ */ new Set();
  /** The hooks were already in place when this host started (the preload installed them at process start). */
  early;
  constructor(o) {
    this.root = resolve3(o.root).replace(/\/?$/, "/");
    process.env.JIFFY_ROOT = this.root.slice(0, -1) || "/";
    if (o.preload && !/[\s"'\\]/.test(o.preload)) {
      const dir = this.dir = mkdtempSync(join3(tmpdir(), "jiffy-children-"));
      process.env.JIFFY_NODE_TEST_DIR = dir;
      process.on("exit", () => {
        try {
          rmSync(dir, { recursive: true, force: true });
        } catch {
        }
      });
      this.preload = o.preload;
      if (!hasPreload(process.env.NODE_OPTIONS, o.preload))
        process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS + " " : ""}--import=${o.preload}`;
    }
    const sink = {
      active: () => this.open,
      // Only the test's own reads end the check early: a path the runner or a loader touched first (a resolver's stat
      // before the require) may still be read by the test later in the window.
      has: (abs) => this.reads.has(abs),
      read: (abs, kind) => {
        this.seen.add(abs);
        if (kind === "runner") return;
        if (kind === "loader") return void this.loader.add(abs);
        this.reads.add(abs);
        if (kind === "lib") this.lib.add(abs);
      },
      incomplete: (why) => {
        if (this.marks.length < 20) this.marks.push(why);
      },
      keeps: (env) => !!this.preload && env.JIFFY_NODE_TEST_FILE === this.token && env.JIFFY_NODE_TEST_DIR === this.dir && hasPreload(env.NODE_OPTIONS, this.preload),
      epoch: () => this.token
    };
    this.sink = sink;
    this.early = !installHooks({ root: this.root, sink, classifyLib: o.classifyLib });
  }
  sink;
  /** Turns the lib classification of reads on or off (the Vitest provider wants it; Jest doesn't). */
  classifyLib(on) {
    installHooks({ root: this.root, sink: this.sink, classifyLib: on });
  }
  /** A window is open (the preload opens the first one when the worker starts). */
  isOpen() {
    return this.open;
  }
  /** Who opened the open window (a test file, or a runner hook that knows a file is next); null when closed. */
  label = null;
  /** Starts a window (one test file), dropping whatever an unfinished one held. */
  begin(label = null) {
    this.label = label;
    if (this.token) this.past.add(this.token);
    this.token = `w${process.pid}-${++this.n}-${Math.random().toString(36).slice(2, 8)}`;
    process.env.JIFFY_NODE_TEST_FILE = this.token;
    this.reads = /* @__PURE__ */ new Set();
    this.seen = /* @__PURE__ */ new Set();
    this.loader = /* @__PURE__ */ new Set();
    this.lib = /* @__PURE__ */ new Set();
    this.marks = [];
    this.open = true;
  }
  /** The open window's token: what a child must carry in JIFFY_NODE_TEST_FILE to report to it. */
  get current() {
    return this.token;
  }
  /**
   * What a child needs in its environment to report to the open window. For a copy of the environment taken before
   * the window opened (Jest gives each test file its own process.env): assign this to it.
   */
  childEnv() {
    const out = {
      JIFFY_NODE_TEST_FILE: this.token,
      JIFFY_ROOT: process.env.JIFFY_ROOT ?? ""
    };
    if (this.dir) out.JIFFY_NODE_TEST_DIR = this.dir;
    if (process.env.NODE_OPTIONS) out.NODE_OPTIONS = process.env.NODE_OPTIONS;
    return out;
  }
  /** Ends the window: waits up to waitMs for its children's end records, then merges them. */
  async end(waitMs = 3e3) {
    this.open = false;
    this.label = null;
    const token = this.token;
    const reads = new Set(this.reads);
    const loaderReads = new Set(this.loader);
    for (const r of this.lib) this.libAll.add(r);
    const incomplete = [...this.marks];
    const scripts = [];
    let children = 0;
    if (this.dir) {
      const deadline = Date.now() + waitMs;
      for (; ; ) {
        const { starts, ends, marks, stale } = this.scan(token);
        const waiting = starts.filter((id) => !ends.has(id) || ends.get(id).signal === true);
        const alive = waiting.filter((id) => isAlive(Number(id.split("-")[0])));
        if (alive.length && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 50));
          continue;
        }
        for (const why of marks) incomplete.push(why);
        if (alive.length)
          incomplete.push(`${alive.length} of its child processes were still running when it finished`);
        else if (waiting.some((id) => !ends.has(id)))
          incomplete.push(`${waiting.length} of its child processes left no record (killed or terminated)`);
        for (const p of ends.values()) {
          children++;
          for (const s of p.scripts ?? []) scripts.push(s);
          for (const r of p.reads ?? []) reads.add(r);
          for (const r of p.loaderReads ?? []) loaderReads.add(r);
        }
        for (const name of stale) rmSync(join3(this.dir, name), { force: true });
        break;
      }
    }
    for (const r of reads) this.all.add(r);
    process.env.JIFFY_NODE_TEST_FILE = `${token}-closed`;
    return {
      reads: [...reads].sort(),
      // A loader's probe of a path that isn't there (resolution trying extensions) isn't an input.
      loaderReads: [...loaderReads].filter(isFile).sort(),
      libReads: [...this.libAll].sort(),
      allReads: [...this.all].sort(),
      scripts,
      incomplete,
      children
    };
  }
  /** This window's child records, and files to remove (this window's and closed windows'). */
  scan(token) {
    const starts = [];
    const ends = /* @__PURE__ */ new Map();
    const marks = [];
    const stale = [];
    for (const name of readdirSync2(this.dir).sort()) {
      const m = /^([spx])-(.+)\.json$/.exec(name);
      if (!m) continue;
      let json;
      try {
        json = JSON.parse(readFileSync(join3(this.dir, name), "utf8"));
      } catch {
        marks.push(`a child's record couldn't be read (${name})`);
        stale.push(name);
        continue;
      }
      if (json.test !== token) {
        if (json.test && this.past.has(json.test)) stale.push(name);
        continue;
      }
      stale.push(name);
      if (m[1] === "s") starts.push(m[2]);
      else if (m[1] === "p") ends.set(m[2], json);
      else marks.push(json.why ?? "a child was marked incomplete");
    }
    return { starts, ends, marks, stale };
  }
};
function isFile(p) {
  try {
    return statSync2(p).isFile();
  } catch {
    return false;
  }
}
function isAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
}

// packages/node-test/src/part.ts
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
function addRead(rec, abs, root) {
  const dir = abs.endsWith("/");
  const p = dir ? abs.slice(0, -1) : abs;
  const r = p.startsWith(root) ? p.slice(root.length) : p + "/" === root ? "" : null;
  if (r === null) return;
  if (dir) rec.loaded.add(r ? r + "/" : "./");
  else if (r) {
    rec.loaded.add(r);
    rec.fns.add(`${r}::*`);
  }
}

// packages/jest-plugin/src/index.ts
var SELF2 = import.meta.url.startsWith("file:") ? fileURLToPath4(import.meta.url) : "";
function preloadPath() {
  if (process.env.JIFFY_PRELOAD) return process.env.JIFFY_PRELOAD;
  if (!SELF2) return void 0;
  for (const p of [join4(dirname2(SELF2), "preload.mjs"), join4(dirname2(SELF2), "../../node-test/src/preload.ts")])
    if (existsSync2(p)) return resolve4(p);
  return void 0;
}
var JiffyJestReporter = class {
  root;
  outFile;
  /** Where setup.cjs writes one JSON per test file; workers inherit it through the environment. */
  setupDir;
  ownsSetupDir = false;
  withCoverage = 0;
  /** Test files with no trustworthy record, and why: they keep none, so the selector always runs them. */
  reasons = /* @__PURE__ */ new Map();
  records = {};
  get failed() {
    return new Set(this.reasons.keys());
  }
  constructor(globalConfig = {}, options = {}) {
    const rootDir = globalConfig.rootDir ?? process.cwd();
    const root = options.root ?? process.env.JIFFY_ROOT;
    this.root = (root ? resolve4(rootDir, root) : findRepoRoot(rootDir)).replace(/\/?$/, "/");
    const out = options.outFile ?? process.env.JIFFY_OUT;
    this.outFile = out ? resolve4(rootDir, out) : join4(rootDir, ".jiffy/coverage-jest.json");
    if (!process.env.JIFFY_JEST_DIR) {
      process.env.JIFFY_JEST_DIR = mkdtempSync2(join4(tmpdir2(), "jiffy-jest-"));
      this.ownsSetupDir = true;
    }
    this.setupDir = process.env.JIFFY_JEST_DIR;
    if (globalConfig.testNamePattern) this.filtered = `filtered run (-t ${globalConfig.testNamePattern})`;
    this.startHosts();
  }
  filtered = null;
  setupSeen = false;
  /**
   * Workers Jest starts after this inherit NODE_OPTIONS: the preload makes each one a host. In band, the windows run
   * in this process, so it hosts them itself (created on the first test file).
   */
  startHosts() {
    const preload = preloadPath();
    const root = this.root.slice(0, -1) || "/";
    process.env.JIFFY_ROOT ??= root;
    const shared = fs3;
    if (typeof shared[HOST] !== "function") {
      let host;
      shared[HOST] = () => host ??= new Host({ root, preload });
    }
    startCoverage();
    if (!preload || /[\s"'\\]/.test(preload) || hasPreload(process.env.NODE_OPTIONS, preload)) return;
    process.env.JIFFY_HOST = "jest";
    const opts = process.env.NODE_OPTIONS;
    process.env.NODE_OPTIONS = `${opts ? opts + " " : ""}--import=${preload}`;
  }
  /**
   * setup.cjs writes one file per run of a test file (<sha1 of its path>.<unique>.json). When a file runs in
   * several projects at once, one result can pick up another run's file too; the other run's result then
   * finds none, and a credit here says its coverage is already merged.
   */
  credits = /* @__PURE__ */ new Map();
  fromSetup(testFilePath) {
    const prefix = `${createHash("sha1").update(testFilePath).digest("hex")}.`;
    const files = readdirSync3(this.setupDir).filter((f) => f.startsWith(prefix) && f.endsWith(".json"));
    const records = files.map((f) => {
      const path = join4(this.setupDir, f);
      const data = JSON.parse(readFileSync2(path, "utf8"));
      rmSync2(path, { force: true });
      return data;
    });
    return { runs: files.length, records };
  }
  fail(test, why) {
    if (!this.reasons.has(test)) this.reasons.set(test, why);
    delete this.records[test];
  }
  /** Resolvers by module path, loaded once. */
  resolvers = /* @__PURE__ */ new Map();
  /**
   * The test file's snapshot file, which it depends on whether or not it exists. Workers see Jest check for it, but
   * in band Jest's own fs copy (graceful-fs, cloned before this reporter loaded) hides the check: so it's added here,
   * through the project's snapshotResolver when it has one.
   */
  snapshotPath(test, testPath) {
    const mod = test?.context?.config?.snapshotResolver;
    if (!mod) return join4(dirname2(testPath), "__snapshots__", `${basename2(testPath)}.snap`);
    try {
      let r = this.resolvers.get(mod);
      if (r === void 0) {
        r = createRequire(import.meta.url)(mod);
        this.resolvers.set(mod, r);
      }
      return r?.resolveSnapshotPath?.(testPath, ".snap");
    } catch {
      this.resolvers.set(mod, null);
      return void 0;
    }
  }
  onTestResult(testInfo, result) {
    const test = relative(this.root, result.testFilePath).split(sep).join("/");
    if (this.filtered) return this.fail(test, this.filtered);
    if (result.testExecError)
      return this.fail(test, "it failed to run (an import, a suite hook or its worker)");
    const setup = this.fromSetup(result.testFilePath);
    let scripts;
    let reads = [];
    let loaderReads = [];
    let tracked = false;
    if (setup.runs) {
      this.credits.set(test, (this.credits.get(test) ?? 0) + setup.runs - 1);
      this.setupSeen = true;
      const why = setup.records.flatMap((r) => r.incomplete ?? [])[0];
      if (why) return this.fail(test, why);
      scripts = setup.records.flatMap((r) => [...r.scripts, ...r.children ?? []]);
      reads = setup.records.flatMap((r) => r.reads ?? []);
      loaderReads = setup.records.flatMap((r) => r.loaderReads ?? []);
      tracked = setup.records.every((r) => r.tracked);
    } else if (this.credits.get(test)) {
      this.credits.set(test, this.credits.get(test) - 1);
      this.withCoverage++;
      return;
    } else {
      scripts = (result.v8Coverage ?? []).map((e) => "result" in e ? e.result : e);
    }
    if (!scripts.length) return this.fail(test, "no coverage was collected");
    this.withCoverage++;
    if (this.reasons.has(test)) return;
    const cov = fromV8(scripts, this.root);
    const rec = { loaded: new Set(cov.loaded), fns: new Set(cov.fns) };
    for (const r of reads) if (r !== result.testFilePath) addRead(rec, r, this.root);
    for (const r of loaderReads)
      if (r !== result.testFilePath && !TEST_FILE2.test(r) && r.startsWith(this.root) && !rec.loaded.has(r.slice(this.root.length)))
        addRead(rec, r, this.root);
    if (tracked) {
      const snap = this.snapshotPath(testInfo, result.testFilePath);
      if (snap) addRead(rec, resolve4(snap), this.root);
      else tracked = false;
    }
    const old = this.records[test];
    const loaded = [.../* @__PURE__ */ new Set([...old?.loaded ?? [], ...rec.loaded])].sort();
    const fns = [...old?.fns ?? [], ...rec.fns];
    const both = tracked && (!old || old.fns.includes(CHILDREN_MARK));
    this.records[test] = {
      loaded,
      fns: withMarks(
        fns.filter((f) => !f.startsWith("::")),
        { reads: both, children: both }
      )
    };
  }
  onRunComplete() {
    if (this.ownsSetupDir) {
      rmSync2(this.setupDir, { recursive: true, force: true });
      delete process.env.JIFFY_JEST_DIR;
    }
    const n = Object.keys(this.records).length;
    if (this.reasons.size && !this.withCoverage && !this.setupSeen && !this.filtered) {
      console.warn(
        "jiffy: no V8 coverage; add '@jiffy/jest-plugin/setup' to setupFilesAfterEnv (or run with --coverage --coverageProvider=v8)"
      );
      rmSync2(this.outFile, { force: true });
      rmSync2(alwaysRunPath(this.outFile), { force: true });
      return;
    }
    mkdirSync(dirname2(this.outFile), { recursive: true });
    writePart(this.outFile, this.records, Object.fromEntries([...this.reasons].sort()));
    console.log(
      `jiffy: recorded ${n} test files to ${this.outFile}` + (this.reasons.size ? `; ${this.reasons.size} have no record and always run (see the .always-run.json file)` : "")
    );
  }
};
export {
  JiffyJestReporter as default
};
