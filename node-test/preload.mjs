// src/preload.ts
import { randomBytes } from "node:crypto";
import fs3 from "node:fs";
import inspector2 from "node:inspector";
import { join as join3, resolve as resolve3 } from "node:path";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import v8 from "node:v8";
import wt2 from "node:worker_threads";

// src/hooks.ts
import cp from "node:child_process";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
  [import.meta.url, import.meta.url.startsWith("file:") ? fileURLToPath(import.meta.url) : ""].filter(
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
  if (cmd.includes("/")) return resolve(cwd, cmd);
  for (const d of (env.PATH ?? process.env.PATH ?? "").split(":")) {
    if (!d) continue;
    const p = resolve(cwd, d, cmd);
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
    want = resolve(preload);
  }
  for (const o of (nodeOptions ?? "").split(" ")) {
    if (!o.startsWith("--import=")) continue;
    const p = o.slice("--import=".length).replace(/^file:\/\//, "");
    try {
      if (realpathSync(p) === want) return true;
    } catch {
      if (resolve(p) === want) return true;
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
  const absolute = (s) => POSIX && s.charCodeAt(0) === 47 && !NOT_NORMAL.test(s) && (s.length === 1 || !s.endsWith("/")) ? s : resolve(s);
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
      const dir2 = abs.endsWith("/");
      const real = realOf(dir2 && abs.length > 1 ? abs.slice(0, -1) : abs);
      if (real !== abs.replace(/\/$/, "")) report(real + (dir2 ? "/" : ""), kind);
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
    const stack = [resolve(s)];
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
            stack.push(join(at, e));
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
    const abs = resolve(cwd, w);
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
    const cwd = typeof opts.cwd === "string" ? resolve(opts.cwd) : opts.cwd instanceof URL ? fileURLToPath(opts.cwd) : process.cwd();
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
  syncBuiltinESMExports();
  return true;
}

// src/fresh.ts
import inspector from "node:inspector";
import { syncBuiltinESMExports as syncBuiltinESMExports2 } from "node:module";
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
        const id2 = options?.identifier;
        const path = typeof id2 === "string" && id2.startsWith("file://") ? pathOf(id2) : id2;
        super(typeof code === "string" && repo(path) ? `${code}
//jiffy:${++n}` : code, options);
        count(path);
      }
    };
  syncBuiltinESMExports2();
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

// src/host.ts
import fs2 from "node:fs";
import { tmpdir } from "node:os";
import { join as join2, resolve as resolve2 } from "node:path";
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
    this.root = resolve2(o.root).replace(/\/?$/, "/");
    process.env.JIFFY_ROOT = this.root.slice(0, -1) || "/";
    if (o.preload && !/[\s"'\\]/.test(o.preload)) {
      const dir2 = this.dir = mkdtempSync(join2(tmpdir(), "jiffy-children-"));
      process.env.JIFFY_NODE_TEST_DIR = dir2;
      process.on("exit", () => {
        try {
          rmSync(dir2, { recursive: true, force: true });
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
    const incomplete2 = [...this.marks];
    const scripts = [];
    let children = 0;
    if (this.dir) {
      const deadline = Date.now() + waitMs;
      for (; ; ) {
        const { starts, ends, marks: marks2, stale } = this.scan(token);
        const waiting = starts.filter((id2) => !ends.has(id2) || ends.get(id2).signal === true);
        const alive = waiting.filter((id2) => isAlive(Number(id2.split("-")[0])));
        if (alive.length && Date.now() < deadline) {
          await new Promise((r) => setTimeout(r, 50));
          continue;
        }
        for (const why of marks2) incomplete2.push(why);
        if (alive.length)
          incomplete2.push(`${alive.length} of its child processes were still running when it finished`);
        else if (waiting.some((id2) => !ends.has(id2)))
          incomplete2.push(`${waiting.length} of its child processes left no record (killed or terminated)`);
        for (const p of ends.values()) {
          children++;
          for (const s of p.scripts ?? []) scripts.push(s);
          for (const r of p.reads ?? []) reads.add(r);
          for (const r of p.loaderReads ?? []) loaderReads.add(r);
        }
        for (const name of stale) rmSync(join2(this.dir, name), { force: true });
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
      incomplete: incomplete2,
      children
    };
  }
  /** This window's child records, and files to remove (this window's and closed windows'). */
  scan(token) {
    const starts = [];
    const ends = /* @__PURE__ */ new Map();
    const marks2 = [];
    const stale = [];
    for (const name of readdirSync2(this.dir).sort()) {
      const m = /^([spx])-(.+)\.json$/.exec(name);
      if (!m) continue;
      let json;
      try {
        json = JSON.parse(readFileSync(join2(this.dir, name), "utf8"));
      } catch {
        marks2.push(`a child's record couldn't be read (${name})`);
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
      else marks2.push(json.why ?? "a child was marked incomplete");
    }
    return { starts, ends, marks: marks2, stale };
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

// src/preload.ts
var dir = process.env.JIFFY_NODE_TEST_DIR;
var root = process.env.JIFFY_ROOT ? resolve3(process.env.JIFFY_ROOT) + "/" : "";
var inherited = process.env.JIFFY_NODE_TEST_FILE;
var direct = !inherited && !!process.env.NODE_TEST_CONTEXT && !!process.argv[1];
var test = !wt2.isMainThread ? void 0 : direct ? resolve3(process.argv[1]) : inherited;
var id = `${process.pid}-${randomBytes(4).toString("hex")}`;
var marks = 0;
var { writeFileSync, renameSync, statSync: statSync3 } = fs3;
function put(name, value) {
  const tmp = join3(dir, `.${name}.tmp`);
  writeFileSync(tmp, JSON.stringify(value));
  renameSync(tmp, join3(dir, name));
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
} else if (!test && (process.env.JIFFY_HOST === "1" || process.env.JIFFY_HOST === "jest") && root) {
  const jest = process.env.JIFFY_HOST === "jest";
  delete process.env.JIFFY_HOST;
  try {
    if (jest) startCoverage();
    installHooks({
      root,
      sink: { active: () => false, has: () => true, read() {
      }, incomplete() {
      }, keeps: () => true }
    });
    const self = import.meta.url.startsWith("file:") ? fileURLToPath3(import.meta.url) : void 0;
    const host = new Host({ root, preload: self });
    if (jest) host.begin();
    fs3[HOST] = (o) => {
      if (o?.classifyLib !== void 0) host.classifyLib(o.classifyLib);
      return host;
    };
  } catch {
  }
}
function record(test2) {
  process.env.JIFFY_NODE_TEST_FILE = test2;
  if (direct) {
    const filter = process.execArgv.find((a) => /^--test-(name-pattern|skip-pattern|only)\b/.test(a));
    if (filter) incomplete(`filtered run (${filter.split("=")[0]})`);
  }
  const session = new inspector2.Session();
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
  const loaderReads = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  const self = import.meta.url.startsWith("file:") ? fileURLToPath3(import.meta.url) : void 0;
  installHooks({
    root,
    sink: {
      active: () => true,
      // Only the test's own reads end the check early (a loader's stat may come before the test's read).
      has: (abs) => reads.has(abs),
      read: (abs, kind) => {
        seen.add(abs);
        if (kind === "loader") loaderReads.add(abs);
        else if (kind !== "runner") reads.add(abs);
      },
      incomplete,
      keeps: (env) => env.JIFFY_NODE_TEST_FILE === test2 && env.JIFFY_NODE_TEST_DIR === dir && hasPreload(env.NODE_OPTIONS, self)
    }
  });
  const write = (code, signal = false) => {
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
        reads: [...reads],
        // A loader's probe of a path that isn't there (resolution trying extensions) isn't an input.
        signal,
        loaderReads: [...loaderReads].filter((f) => {
          try {
            return statSync3(f).isFile();
          } catch {
            return false;
          }
        })
      });
    } catch (e) {
      incomplete(`could not write its record: ${String(e)}`);
    }
  };
  process.on("exit", (code) => write(code));
  if (!direct)
    for (const sig of ["SIGTERM", "SIGINT", "SIGHUP"]) {
      const onSignal = () => {
        process.removeListener(sig, onSignal);
        write(null, true);
        if (process.listenerCount(sig) === 0) process.kill(process.pid, sig);
      };
      process.on(sig, onSignal);
    }
  const limit = Number(process.env.JIFFY_FILE_TIMEOUT);
  if (direct && limit > 0)
    setTimeout(() => {
      incomplete(`still running after JIFFY_FILE_TIMEOUT=${limit}s; stopped`);
      process.exit(1);
    }, limit * 1e3).unref();
}
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
function compact(result) {
  const out = [];
  for (const s of result) {
    if (!s.url.startsWith("file://") || s.url.includes("/node_modules/") || s.url === import.meta.url)
      continue;
    let path;
    try {
      path = fileURLToPath3(s.url.split("?")[0]);
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
