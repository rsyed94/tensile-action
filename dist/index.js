import { createRequire as __jiffyRequire } from 'node:module';
import { fileURLToPath as __jiffyPath } from 'node:url';
const require = __jiffyRequire(import.meta.url);

// src/index.ts
import { isMainThread as isMainThread2 } from "node:worker_threads";

// src/gate.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute as isAbsolute2, relative, resolve as resolve2, sep } from "node:path";

// src/context.ts
import { readFileSync } from "node:fs";
function isForkPr(event) {
  const head = event.pull_request?.head?.repo?.full_name;
  const base3 = event.repository?.full_name;
  return !head || !base3 || head.toLowerCase() !== base3.toLowerCase();
}
function readEvent(env) {
  const p = env.GITHUB_EVENT_PATH;
  if (!p) return {};
  return JSON.parse(readFileSync(p, "utf8"));
}
function planFor(env, event, baseOverride) {
  const name2 = env.GITHUB_EVENT_NAME ?? "";
  if (name2 === "merge_group")
    return { kind: "full", reason: "merge queue: full suite and matrix once at merge" };
  const ref = env.GITHUB_REF ?? "";
  const defaultBranch = event.repository?.default_branch;
  const isDispatch = name2 === "workflow_dispatch" || name2 === "repository_dispatch";
  const isBranchRun = name2 === "push" || isDispatch;
  if (isBranchRun) {
    const what = isDispatch ? `${name2} on` : "push to";
    if (!ref.startsWith("refs/heads/"))
      return {
        kind: "full",
        reason: `${isDispatch ? `${name2} on` : "push of"} ${ref || "an unknown ref"}: not a branch`
      };
    const branch = ref.slice("refs/heads/".length);
    if (branch === defaultBranch) return { kind: "full", reason: `${what} ${branch}: full suite and matrix` };
    if (/^releases?\//.test(branch))
      return { kind: "full", reason: `${what} ${branch}: release branches run everything` };
  }
  const isPr = name2 === "pull_request" || name2 === "pull_request_target";
  let expectHead;
  if (isPr) {
    expectHead = event.pull_request?.head?.sha;
    if (!expectHead) return { kind: "full", reason: "pull request event without a head sha" };
  }
  const withHead = (p) => ({
    kind: "select",
    ...p,
    ...expectHead && { expectHead }
  });
  if (baseOverride)
    return withHead({ baseCandidates: [baseOverride], describe: `input base ${baseOverride}` });
  if (isPr) {
    const sha = event.pull_request?.base?.sha;
    const baseRef = env.GITHUB_BASE_REF || event.pull_request?.base?.ref;
    const candidates = [sha, baseRef && `origin/${baseRef}`].filter((x) => !!x);
    if (!candidates.length) return { kind: "full", reason: "pull request event without a base" };
    return withHead({ baseCandidates: candidates, describe: `merge-base with ${baseRef ?? sha}` });
  }
  if (isBranchRun) {
    if (!defaultBranch)
      return { kind: "full", reason: `${name2} event without a default branch in the payload` };
    return {
      kind: "select",
      baseCandidates: [`origin/${defaultBranch}`],
      describe: `merge-base with origin/${defaultBranch}`
    };
  }
  if (!name2)
    return { kind: "select", baseCandidates: ["origin/main"], describe: "merge-base with origin/main" };
  return { kind: "full", reason: `${name2} event: no base to compare against` };
}

// src/io.ts
import { randomUUID } from "node:crypto";
import { appendFileSync } from "node:fs";
function getInput(env, name2) {
  return (env[`INPUT_${name2.replace(/ /g, "_").toUpperCase()}`] ?? "").trim();
}
function actionsSink(env) {
  const outFile = env.GITHUB_OUTPUT;
  const summaryFile = env.GITHUB_STEP_SUMMARY;
  return {
    outputs(entries) {
      if (!outFile) return void process.stdout.write(entries.map(([k, v]) => `${k}=${v}
`).join(""));
      const text = entries.map(([k, v]) => {
        const d = `ghadelimiter_${randomUUID()}`;
        return `${k}<<${d}
${v}
${d}
`;
      }).join("");
      appendFileSync(outFile, text);
    },
    summary(markdown) {
      if (summaryFile) appendFileSync(summaryFile, markdown);
    },
    log(line) {
      process.stdout.write(`${line.replace(/[\r\n]+/g, " ")}
`);
    },
    warning(message) {
      process.stdout.write(`::warning title=Jiffy::${escapeCommand(message)}
`);
    },
    state(name2, value) {
      const file = env.GITHUB_STATE;
      if (!file) return;
      const d = `ghadelimiter_${randomUUID()}`;
      appendFileSync(file, `${name2}<<${d}
${value}
${d}
`);
    }
  };
}
function escapeCommand(s) {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

// src/sample.ts
import { createHash } from "node:crypto";
function parseRate(raw2) {
  const pct2 = raw2.endsWith("%");
  const n = Number(pct2 ? raw2.slice(0, -1) : raw2);
  const rate = pct2 ? n / 100 : n;
  if (!raw2 || !Number.isFinite(rate) || rate < 0 || rate > 1)
    throw new Error(`must be a fraction or percentage between 0 and 1 (like 0.05 or 5%), got ${raw2}`);
  return rate;
}
function sampleOrder(tests, seed) {
  const keyed = [...tests].map(
    (t) => [createHash("sha256").update(`${seed}\0${t}`).digest("hex"), t]
  );
  return keyed.sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([, t]) => t);
}
function sampleSize(rate, n) {
  return rate > 0 && n > 0 ? Math.min(n, Math.max(1, Math.ceil(rate * n))) : 0;
}

// src/inputs.ts
var InputError = class extends Error {
};
var FALSE = /* @__PURE__ */ new Set(["false", "0", "no", "off", ""]);
function parseNumber(name2, raw2, dflt, { min, max = Infinity, integer }) {
  if (!raw2) return dflt;
  const n = Number(raw2);
  if (!Number.isFinite(n) || n < min || n > max || integer && !Number.isInteger(n))
    throw new InputError(
      `input ${name2} must be ${integer ? "an integer" : "a number"} >= ${min}${max < Infinity ? ` and <= ${max}` : ""}, got ${raw2}`
    );
  return n;
}
function killSwitch(env) {
  const vals = [getInput(env, "run-all"), (env.JIFFY_RUN_ALL ?? "").trim()];
  return vals.some((v) => !FALSE.has(v.toLowerCase()));
}
function parseSampleRate(raw2) {
  if (!raw2) return 0.05;
  try {
    return parseRate(raw2);
  } catch (e) {
    throw new InputError(`input sample-rate ${e.message}`);
  }
}
function parseServiceUrl(raw2) {
  if (!raw2) return "";
  let u;
  try {
    u = new URL(raw2);
  } catch {
    throw new InputError(`input service-url is not a URL: ${raw2}`);
  }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
  if (u.protocol !== "https:" && !(u.protocol === "http:" && local))
    throw new InputError(`input service-url must be https, got ${raw2}`);
  return raw2;
}
function parseInputs(env) {
  const mode = getInput(env, "mode") || "report";
  if (mode !== "report" && mode !== "enforce")
    throw new InputError(`input mode must be report or enforce, got ${JSON.stringify(mode)}`);
  return {
    map: getInput(env, "map"),
    base: getInput(env, "base"),
    durations: getInput(env, "durations"),
    mode,
    matrix: getInput(env, "matrix"),
    shards: parseNumber("shards", getInput(env, "shards"), 1, { min: 1, max: 256, integer: true }),
    killSwitch: killSwitch(env),
    maxMapAgeDays: parseNumber("max-map-age-days", getInput(env, "max-map-age-days"), 14, { min: 0 }),
    timeoutSeconds: parseNumber("timeout-seconds", getInput(env, "timeout-seconds"), 60, { min: 1 }),
    workingDirectory: getInput(env, "working-directory") || env.GITHUB_WORKSPACE || ".",
    sampleRate: parseSampleRate(getInput(env, "sample-rate")),
    serviceUrl: parseServiceUrl(getInput(env, "service-url")),
    quarantine: getInput(env, "quarantine"),
    always: getInput(env, "always").split(/[\n,]/).map((s) => s.trim()).filter(Boolean)
  };
}

// src/matrix.ts
var same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
function parseMatrix(text) {
  const m = JSON.parse(text);
  if (!m || typeof m !== "object" || Array.isArray(m)) throw new Error("matrix must be a JSON object");
  for (const [k, v] of Object.entries(m))
    if (!Array.isArray(v)) throw new Error(`matrix.${k} must be an array`);
  return m;
}
function expandMatrix(m) {
  const axes = Object.entries(m).filter(([k]) => k !== "include" && k !== "exclude");
  let combos = axes.length ? [{}] : [];
  for (const [k, vs] of axes) combos = combos.flatMap((c) => vs.map((v) => ({ ...c, [k]: v })));
  const excludes = m.exclude ?? [];
  combos = combos.filter((c) => !excludes.some((e) => Object.entries(e).every(([k, v]) => same(c[k], v))));
  const axisNames = new Set(axes.map(([k]) => k));
  const originals = combos.map((c) => ({ ...c }));
  for (const inc of m.include ?? []) {
    let matched = false;
    originals.forEach((orig, i2) => {
      if (Object.entries(inc).every(([k, v]) => !axisNames.has(k) || same(orig[k], v))) {
        Object.assign(combos[i2], inc);
        matched = true;
      }
    });
    if (!matched) combos.push({ ...inc });
  }
  return combos;
}
var LINUX = /ubuntu|linux/i;
function pruneMatrix(m) {
  const combos = expandMatrix(m);
  if (!combos.length) throw new Error("matrix has no combinations");
  const kept = combos.find((c) => Object.values(c).some((v) => typeof v === "string" && LINUX.test(v))) ?? combos[0];
  const matrix = Object.fromEntries(Object.entries(kept).map(([k, v]) => [k, [v]]));
  return { matrix, kept, total: combos.length };
}

// src/protocol.ts
var OIDC_AUDIENCE = "jiffy";
var SERVICE_TIMEOUT_MS = 5e3;
var PROTOCOL_VERSION = 1;
var seg = encodeURIComponent;
var servicePaths = {
  /**
   * GET: 200 with the newest binary coverage map (`application/octet-stream`, encodeMap format) recorded at
   * or before commit `before` on the default branch; 404 when there is none.
   */
  map: (owner, repo, before) => `/v1/maps/${seg(owner)}/${seg(repo)}?before=${seg(before)}`,
  /**
   * GET (the ledger, docs/spec/ledger.md §3.3): 200 with the newest *signed* map at or before `before` and its claims
   * and signature in headers (MAP_CLAIMS_HEADER, MAP_SIGNATURE_HEADER); 404 when there is none. The in-job step reads
   * maps only from here.
   */
  ledgerMap: (owner, repo, before) => `/v1/ledger/maps/${seg(owner)}/${seg(repo)}?before=${seg(before)}`,
  /** GET: 200 with a RepoConfig. */
  config: (owner, repo) => `/v1/repos/${seg(owner)}/${seg(repo)}/config`,
  /** GET: 200 with a QuarantineList (@jiffy/flaky/state): flaky tests kept out of the fast check (R13). */
  quarantine: (owner, repo) => `/v1/repos/${seg(owner)}/${seg(repo)}/quarantine`,
  /** POST a DecisionPayload: any 2xx (body optional, DecisionAck when present). */
  decisions: "/v1/decisions"
};
var MAP_CLAIMS_HEADER = "x-tensile-map-claims";
var MAP_SIGNATURE_HEADER = "x-tensile-map-signature";
var MAX_TRIGGERS = 50;
var EVIDENCE_PATH = "/v1/evidence";
var EVIDENCE_MAX_BYTES = 5 * 1024 * 1024;
var EVIDENCE_PREFIX = "jiffy-evidence-";
var PLACEHOLDER_SUBJECT = "evidence-step-unfinished";

// src/quarantine.ts
import { readFileSync as readFileSync2 } from "node:fs";
import { isAbsolute, resolve } from "node:path";

// ../flaky/src/state.ts
var STATE_VERSION = 1;
var isStr = (x) => typeof x === "string";
function parseQuarantine(json) {
  const o = json;
  if (!o || typeof o !== "object") throw new Error("quarantine must be a JSON object");
  if (o.version !== STATE_VERSION) throw new Error(`unsupported quarantine version ${String(o.version)}`);
  const entries = Array.isArray(o.tests) ? o.tests : o.quarantine && typeof o.quarantine === "object" ? Object.values(o.quarantine) : null;
  if (!entries) throw new Error("quarantine has neither tests[] nor quarantine{}");
  for (const e of entries)
    if (!e || !isStr(e.test) || !isStr(e.file) || !e.file || !isStr(e.reason))
      throw new Error(`malformed quarantine entry ${JSON.stringify(e)}`);
  return { version: STATE_VERSION, tests: entries };
}

// src/http.ts
var ServiceError = class extends Error {
  /** HTTP status, when the server answered. */
  status;
  constructor(message, status) {
    super(message);
    this.status = status;
  }
};
async function call(what, url, init2, timeoutMs) {
  let res;
  try {
    res = await fetch(url, { ...init2, signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const err2 = e;
    const why = err2.name === "TimeoutError" ? `timed out after ${timeoutMs / 1e3} s` : err2.message;
    throw new ServiceError(`${what}: ${why}`);
  }
  if (!res.ok) throw new ServiceError(`${what}: HTTP ${res.status}`, res.status);
  return res;
}
async function oidcToken(env, timeoutMs) {
  const reqUrl = env.ACTIONS_ID_TOKEN_REQUEST_URL;
  const reqToken = env.ACTIONS_ID_TOKEN_REQUEST_TOKEN;
  if (!reqUrl || !reqToken)
    throw new ServiceError("no OIDC token: the job needs `permissions: id-token: write`");
  const u = new URL(reqUrl);
  u.searchParams.set("audience", OIDC_AUDIENCE);
  const res = await call(
    "OIDC token request",
    u.href,
    { headers: { Authorization: `Bearer ${reqToken}`, Accept: "application/json" } },
    timeoutMs
  );
  const body2 = await res.json().catch(() => null);
  const token = body2?.value;
  if (typeof token !== "string" || !/^[\w.~+/=-]+$/.test(token))
    throw new ServiceError("OIDC token request: no token");
  process.stdout.write(`::add-mask::${token}
`);
  return token;
}

// src/service.ts
var base = (t) => t.url.replace(/\/+$/, "");
var auth = (token) => ({ Authorization: `Bearer ${token}` });
async function fetchConfig(t, token) {
  const path = servicePaths.config(t.owner, t.repo);
  const res = await call(`GET ${path}`, base(t) + path, { headers: auth(token) }, t.timeoutMs);
  const cfg = await res.json().catch(() => null);
  if (!cfg || typeof cfg.runAll !== "boolean") throw new ServiceError(`GET ${path}: malformed config`);
  if (cfg.mode !== void 0 && cfg.mode !== "report" && cfg.mode !== "enforce")
    throw new ServiceError(`GET ${path}: unknown mode ${JSON.stringify(cfg.mode)}`);
  if (cfg.selectionEnforce !== void 0 && (!Array.isArray(cfg.selectionEnforce) || cfg.selectionEnforce.some((k) => typeof k !== "string")))
    throw new ServiceError(`GET ${path}: selectionEnforce must be a list of strings`);
  const l = cfg.ledger;
  if (l !== void 0 && (!l || typeof l.stale !== "boolean" || typeof l.complete !== "boolean" || typeof l.lagMs !== "number" || !Array.isArray(l.reasons)))
    throw new ServiceError(`GET ${path}: malformed ledger freshness`);
  return cfg;
}
async function fetchQuarantine(t, token) {
  const path = servicePaths.quarantine(t.owner, t.repo);
  const res = await call(`GET ${path}`, base(t) + path, { headers: auth(token) }, t.timeoutMs);
  try {
    return parseQuarantine(await res.json());
  } catch (e) {
    throw new ServiceError(`GET ${path}: ${e.message}`);
  }
}
async function fetchMap(t, token, before) {
  const path = servicePaths.map(t.owner, t.repo, before);
  const res = await call(`GET ${path}`, base(t) + path, { headers: auth(token) }, t.timeoutMs);
  return Buffer.from(await res.arrayBuffer());
}
async function fetchSignedMap(t, token, before) {
  const path = servicePaths.ledgerMap(t.owner, t.repo, before);
  const res = await call(`GET ${path}`, base(t) + path, { headers: auth(token) }, t.timeoutMs);
  const claims = res.headers.get(MAP_CLAIMS_HEADER);
  const signature = res.headers.get(MAP_SIGNATURE_HEADER);
  const bytes = Buffer.from(await res.arrayBuffer());
  const offered = claims !== null || signature !== null;
  if (!claims || !signature || claims.length > 8192 || !/^[A-Za-z0-9_-]+$/.test(claims))
    return { bytes, signed: null, offered };
  return { bytes, signed: { claims: Buffer.from(claims, "base64url").toString("utf8"), signature }, offered };
}
async function postDecision(t, token, d) {
  const path = servicePaths.decisions;
  const res = await call(
    `POST ${path}`,
    base(t) + path,
    {
      method: "POST",
      headers: { ...auth(token), "Content-Type": "application/json" },
      body: JSON.stringify(d)
    },
    t.timeoutMs
  );
  await res.arrayBuffer();
}

// src/quarantine.ts
async function loadQuarantine(opts) {
  const entries = [];
  if (opts.file) {
    const p = isAbsolute(opts.file) ? opts.file : resolve(opts.cwd, opts.file);
    let json;
    try {
      json = JSON.parse(readFileSync2(p, "utf8"));
    } catch (e) {
      throw new Error(`cannot read ${opts.file}: ${e.message}`);
    }
    entries.push(...parseQuarantine(json).tests);
  }
  if (opts.service) entries.push(...(await fetchQuarantine(opts.service.target, opts.service.token)).tests);
  return entries;
}
var quarantinedFiles = (entries) => [...new Set(entries.map((e) => e.file))].sort();

// ../engine/src/classify.ts
var RUN_ALL_KINDS = /* @__PURE__ */ new Set([
  "lockfile",
  "manifest",
  "toolchain",
  "ci",
  "unknown"
]);
var TEST_FILE = /(^|[./])(test|spec)\.[cm]?[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.py$/;
var SOURCE_FILE = /\.([cm]?[jt]sx?|py)$/;
var SNAPSHOT = /(^|\/)__snapshots__\/([^/]+)\.snap$/;
var SYRUPY = /(^|\/)__snapshots__\/((?:test_[^/]+|[^/]+_test))(?:\.ambr|\/[^/]+)$/;
var base2 = (p) => p.slice(p.lastIndexOf("/") + 1);
var LOCKFILES = /* @__PURE__ */ new Set([
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
  "uv.lock",
  "poetry.lock",
  "Pipfile.lock",
  "pdm.lock",
  "Cargo.lock",
  "go.sum"
]);
var MANIFESTS = /* @__PURE__ */ new Set([
  "package.json",
  "pnpm-workspace.yaml",
  ".npmrc",
  ".yarnrc",
  ".yarnrc.yml",
  "bunfig.toml",
  "pyproject.toml",
  "setup.py",
  "setup.cfg",
  "Pipfile",
  "go.mod",
  "Cargo.toml"
]);
var TOOLCHAIN_NAMES = /* @__PURE__ */ new Set([
  ".nvmrc",
  ".node-version",
  ".python-version",
  ".tool-versions",
  "pytest.ini",
  "tox.ini",
  "noxfile.py",
  "conftest.py",
  ".babelrc",
  ".swcrc",
  "turbo.json",
  "nx.json",
  "lerna.json"
]);
var ENV_FILE = /^\.env(\.|$)/;
var TOOLCHAIN = [
  /^tsconfig(\..*)?\.json$/,
  /^jsconfig(\..*)?\.json$/,
  /^(vitest|vite|jest|babel|webpack|rollup|esbuild|tsup|rspack|playwright)\.(config|workspace|setup)(\.[\w-]+)*\.[cm]?[jt]s(on)?$/,
  /^requirements([-_.][\w-]+)?\.(txt|in)$/
];
var IGNORED = [
  /\.(md|mdx|markdown|rst|adoc)$/i,
  /\.(png|jpe?g|gif|svg|ico|webp|avif|bmp|mp4|mov|webm|pdf)$/i,
  /^docs?\//,
  /(^|\/)(LICEN[CS]E|NOTICE|AUTHORS|CODEOWNERS|CONTRIBUTORS)(\.\w+)?$/i,
  /^\.(vscode|idea|devcontainer|husky)\//,
  /(^|\/)\.(editorconfig|gitattributes|mailmap|prettierrc(\.\w+)?|prettierignore|eslintignore|markdownlint[\w.-]*)$/,
  /^\.github\/(ISSUE_TEMPLATE|DISCUSSION_TEMPLATE)\//,
  /^\.github\/(pull_request_template|PULL_REQUEST_TEMPLATE|FUNDING|SECURITY|SUPPORT|dependabot|release|labeler)(\.\w+)?/
];
var CI = [
  /^\.github\/(workflows|actions)\//,
  /^\.gitlab-ci\.yml$/,
  /^\.circleci\//,
  /^\.buildkite\//,
  /^azure-pipelines\.yml$/
];
function classify(path, opts = {}) {
  const name2 = base2(path);
  if (opts.knownTests?.has(path)) return "test";
  if (LOCKFILES.has(name2)) return "lockfile";
  if (MANIFESTS.has(name2)) return "manifest";
  if (TOOLCHAIN_NAMES.has(name2) || TOOLCHAIN.some((r) => r.test(name2))) return "toolchain";
  if (ENV_FILE.test(name2) && !SOURCE_FILE.test(name2)) return "toolchain";
  if (CI.some((r) => r.test(path))) return "ci";
  if (SNAPSHOT.test(path) || SYRUPY.test(path)) return "snapshot";
  if (IGNORED.some((r) => r.test(path))) return "ignored";
  if (TEST_FILE.test(path)) return "test";
  if (SOURCE_FILE.test(path)) return "source";
  return "unknown";
}
function snapshotTestFile(path) {
  const m = SNAPSHOT.exec(path);
  if (m) return path.slice(0, m.index) + (m[1] ?? "") + m[2];
  const py = SYRUPY.exec(path);
  if (py) return `${path.slice(0, py.index)}${py[1] ?? ""}${py[2]}.py`;
  return null;
}

// ../engine/src/coverage/map.ts
var fnId = (path, name2) => `${path}::${name2}`;
var ANY_FN = "*";
function splitFnId(id) {
  const i2 = id.lastIndexOf("::");
  return [id.slice(0, i2), id.slice(i2 + 2)];
}

// ../engine/src/diff.ts
var HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
function unquoteGitPath(p) {
  if (!p.startsWith('"')) return p;
  const body2 = p.slice(1, -1);
  const bytes = [];
  for (let i2 = 0; i2 < body2.length; i2++) {
    const c = body2[i2];
    if (c !== "\\") {
      bytes.push(...Buffer.from(c, "utf8"));
      continue;
    }
    const n = body2[++i2];
    if (/[0-7]/.test(n)) {
      bytes.push(parseInt(body2.slice(i2, i2 + 3), 8));
      i2 += 2;
    } else {
      bytes.push(
        { n: 10, t: 9, r: 13, '"': 34, "\\": 92, a: 7, b: 8, f: 12, v: 11 }[n] ?? n.charCodeAt(0)
      );
    }
  }
  return Buffer.from(bytes).toString("utf8");
}
function stripPrefix(p) {
  const u = unquoteGitPath(p.trim());
  if (u === "/dev/null") return null;
  return u.replace(/^[ab]\//, "");
}
function parseDiff(text) {
  const files = [];
  let cur = null;
  for (const line of text.split("\n")) {
    if (line.startsWith("diff --git ")) {
      const m = /^diff --git ("?a\/.*?"?) ("?b\/.*"?)$/.exec(line);
      const a = m ? stripPrefix(m[1]) : null;
      const b = m ? stripPrefix(m[2]) : null;
      cur = { path: b ?? a ?? "", oldPath: a, newPath: b, status: "modified", binary: false, hunks: [] };
      files.push(cur);
      continue;
    }
    if (!cur) continue;
    if (line.startsWith("new file mode")) {
      cur.status = "added";
      cur.oldPath = null;
    } else if (line.startsWith("deleted file mode")) {
      cur.status = "deleted";
      cur.newPath = null;
      cur.path = cur.oldPath ?? cur.path;
    } else if (line.startsWith("Binary files ") || line.startsWith("GIT binary patch")) {
      cur.binary = true;
    } else if (line.startsWith("--- ")) {
      cur.oldPath = stripPrefix(line.slice(4));
    } else if (line.startsWith("+++ ")) {
      cur.newPath = stripPrefix(line.slice(4));
      cur.path = cur.newPath ?? cur.oldPath ?? cur.path;
    } else if (line.startsWith("@@")) {
      const m = HUNK.exec(line);
      if (!m) continue;
      cur.hunks.push({
        oldStart: Number(m[1]),
        oldLines: m[2] === void 0 ? 1 : Number(m[2]),
        newStart: Number(m[3]),
        newLines: m[4] === void 0 ? 1 : Number(m[4])
      });
    }
  }
  return files;
}
function changedLines(f) {
  const oldL = [];
  const newL = [];
  for (const h of f.hunks) {
    for (let i2 = 0; i2 < h.oldLines; i2++) oldL.push(h.oldStart + i2);
    for (let i2 = 0; i2 < h.newLines; i2++) newL.push(h.newStart + i2);
  }
  return { old: oldL, new: newL };
}

// ../engine/src/git.ts
import { execFileSync, spawnSync } from "node:child_process";
var MAX = 1 << 30;
function git(repo, args2, input) {
  return execFileSync("git", ["-C", repo, "-c", "core.quotePath=false", ...args2], {
    encoding: "utf8",
    maxBuffer: MAX,
    input,
    stdio: ["pipe", "pipe", "pipe"]
  });
}
function mergeBase(repo, a, b) {
  return git(repo, ["merge-base", a, b]).trim();
}
function gitDiff(repo, base3, head, paths = []) {
  const args2 = ["diff", "--no-color", "--no-ext-diff", "--no-renames", "--no-textconv", "-U0", base3, head];
  return parseDiff(git(repo, paths.length ? [...args2, "--", ...paths] : args2));
}
var OID = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
var promisors = /* @__PURE__ */ new Map();
function promisorRemote(repo) {
  let r = promisors.get(repo);
  if (r === void 0) {
    const res = spawnSync("git", [
      "-C",
      repo,
      "config",
      "--get-regexp",
      "^(remote\\..*\\.promisor|extensions\\.partialclone)$"
    ]);
    r = null;
    for (const l of res.status === 0 ? res.stdout.toString().split("\n") : []) {
      const m = /^remote\.(.+)\.promisor true$/.exec(l) ?? /^extensions\.partialclone (.+)$/.exec(l);
      if (m) {
        r = m[1];
        break;
      }
    }
    promisors.set(repo, r);
  }
  return r;
}
function prefetchBlobs(repo, specs) {
  const remote = promisorRemote(repo);
  const oids = specs.filter((s) => OID.test(s));
  if (!remote || !oids.length) return;
  const check = spawnSync("git", ["-C", repo, "cat-file", "--batch-check"], {
    input: oids.join("\n") + "\n",
    maxBuffer: MAX,
    env: { ...process.env, GIT_NO_LAZY_FETCH: "1" }
  });
  if (check.status !== 0) return;
  const missing = check.stdout.toString().split("\n").filter((l) => l.endsWith(" missing")).map((l) => l.slice(0, -" missing".length));
  if (!missing.length) return;
  spawnSync(
    "git",
    [
      "-C",
      repo,
      "-c",
      "fetch.negotiationAlgorithm=noop",
      "fetch",
      remote,
      "--quiet",
      "--no-tags",
      "--no-write-fetch-head",
      "--recurse-submodules=no",
      "--filter=blob:none",
      "--stdin"
    ],
    { input: missing.join("\n") + "\n", maxBuffer: MAX }
  );
}
function readBlobs(repo, specs) {
  const out2 = /* @__PURE__ */ new Map();
  if (!specs.length) return out2;
  prefetchBlobs(repo, specs);
  const res = spawnSync("git", ["-C", repo, "cat-file", "--batch"], {
    input: specs.join("\n") + "\n",
    maxBuffer: MAX
  });
  if (res.status !== 0) throw new Error(`git cat-file failed: ${res.stderr.toString()}`);
  const buf = res.stdout;
  let o = 0;
  for (const spec of specs) {
    const nl = buf.indexOf(10, o);
    const header = buf.toString("utf8", o, nl);
    o = nl + 1;
    if (header.endsWith(" missing") || header.endsWith(" ambiguous")) {
      out2.set(spec, null);
      continue;
    }
    const size = Number(header.split(" ")[2]);
    out2.set(spec, buf.toString("utf8", o, o + size));
    o += size + 1;
  }
  return out2;
}

// ../engine/src/refs/resolve.ts
import { builtinModules } from "node:module";
var JS_EXTS = [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"];
var JS_FILE = /\.([cm]?[jt]sx?)$/;
var OUT_DIRS = /^(dist|build|lib|out)\//;
var isJs = (p) => JS_FILE.test(p) && !/\.d\.[cm]?ts$/.test(p);
var isPy = (p) => p.endsWith(".py");
var dirOf = (p) => p.slice(0, Math.max(0, p.lastIndexOf("/")));
var baseOf = (p) => p.slice(p.lastIndexOf("/") + 1);
function normalize(path) {
  const out2 = [];
  for (const seg2 of path.split("/")) {
    if (seg2 === "" || seg2 === ".") continue;
    if (seg2 === "..") {
      if (!out2.length) return null;
      out2.pop();
    } else out2.push(seg2);
  }
  return out2.join("/");
}
function names(path) {
  const stem = baseOf(path).replace(/\.[^.]+$/, "");
  if (stem !== "index" && stem !== "__init__") return [stem];
  const dir = baseOf(dirOf(path));
  const up = baseOf(dirOf(dirOf(path)));
  return [dir, ...up && (dir === "src" || dir === "lib") ? [up] : []].filter(Boolean);
}
function stems(path) {
  const stem = baseOf(path).replace(/\.[^.]+$/, "");
  if (stem === "index") return [...names(path), "index", "'.", '".'];
  if (stem === "__init__") return [...names(path), "from ."];
  return [stem];
}
var BUILTINS = new Set(builtinModules);
function alias(dir, key, values, base3) {
  const targets = [];
  const add2 = (v) => {
    if (typeof v === "string") targets.push(v);
    else if (Array.isArray(v)) v.forEach(add2);
    else if (v && typeof v === "object") Object.values(v).forEach(add2);
  };
  values.forEach(add2);
  const star = key.indexOf("*");
  return {
    dir,
    key,
    prefix: star < 0 ? null : key.slice(0, star),
    suffix: star < 0 ? "" : key.slice(star + 1),
    targets,
    base: base3 || dir
  };
}
var Resolver = class {
  files;
  byBase = /* @__PURE__ */ new Map();
  pkgs;
  entries = /* @__PURE__ */ new Map();
  cache = /* @__PURE__ */ new Map();
  tree;
  /** Names of directories at the repo root and at the top of each package and its src/. */
  dirs = /* @__PURE__ */ new Set();
  /** Every dependency any package.json declares. */
  deps = /* @__PURE__ */ new Set();
  /** package.json `imports` and tsconfig `paths`, scoped to the directory that declares them. */
  aliases = [];
  /** `workspaces` defaults to every package.json at head with a name (outside node_modules). */
  constructor(tree, workspaces) {
    this.tree = tree;
    this.files = new Set(tree.paths());
    for (const f of this.files) {
      if (!isPy(f)) continue;
      const b = baseOf(f) === "__init__.py" ? baseOf(dirOf(f)) : baseOf(f).slice(0, -3);
      const list3 = this.byBase.get(b);
      if (list3) list3.push(f);
      else this.byBase.set(b, [f]);
    }
    {
      const manifests = [...this.files].filter(
        (f) => (f === "package.json" || f.endsWith("/package.json")) && !f.includes("node_modules/")
      );
      tree.prefetch?.(manifests);
      const found = [];
      for (const m of manifests) {
        try {
          const pj = JSON.parse(tree.read(m) ?? "{}");
          if (typeof pj.name === "string" && pj.name) found.push({ name: pj.name, root: dirOf(m) });
          if (pj.imports && typeof pj.imports === "object")
            for (const [k, v] of Object.entries(pj.imports)) this.aliases.push(alias(dirOf(m), k, [v], ""));
          for (const k of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
            const d = pj[k];
            if (d && typeof d === "object") for (const n of Object.keys(d)) this.deps.add(n);
          }
        } catch {
        }
      }
      workspaces ??= found;
      const configs = [...this.files].filter(
        (f) => /(^|\/)[tj]sconfig[\w.-]*\.json$/.test(f) && !f.includes("node_modules/")
      );
      tree.prefetch?.(configs);
      for (const f of configs) {
        try {
          const text = (tree.read(f) ?? "{}").replace(/\/\*[\s\S]*?\*\/|(^|[^:"])\/\/.*$/gm, "$1").replace(/,(\s*[}\]])/g, "$1");
          const co = JSON.parse(text).compilerOptions;
          const base3 = normalize(`${dirOf(f)}/${co?.baseUrl ?? "."}`) ?? "";
          for (const [k, v] of Object.entries(co?.paths ?? {}))
            this.aliases.push(alias(dirOf(f), k, v, base3));
        } catch {
        }
      }
    }
    this.pkgs = [...workspaces].sort((a, b) => b.name.length - a.name.length);
    const tops = ["", "src/", ...this.pkgs.flatMap((w) => w.root ? [`${w.root}/`, `${w.root}/src/`] : [])];
    for (const f of this.files)
      for (const t of isJs(f) ? tops : []) {
        if (!f.startsWith(t)) continue;
        const rest = f.slice(t.length);
        const slash = rest.indexOf("/");
        if (slash > 0) this.dirs.add(rest.slice(0, slash));
      }
  }
  /** A Python file's module name below its source root: pkg/sub/mod.py -> pkg.sub.mod (when pkg/ is a package). */
  pyModuleName(path) {
    const parts2 = path.replace(/\.py$/, "").split("/");
    if (parts2.at(-1) === "__init__") parts2.pop();
    let i2 = parts2.length - 1;
    while (i2 > 0 && this.files.has(`${parts2.slice(0, i2).join("/")}/__init__.py`)) i2--;
    return parts2.slice(i2).join(".");
  }
  /** Names of the workspace packages whose directory holds `path`. */
  packageNamesFor(path) {
    return this.pkgs.filter((w) => !w.root || path.startsWith(w.root + "/")).map((w) => w.name);
  }
  /** A JS/TS specifier from `from` to repo files. */
  js(from, spec) {
    const key = `${dirOf(from)}\0${spec}`;
    let r = this.cache.get(key);
    if (r === void 0) this.cache.set(key, r = this.resolveJs(from, spec));
    return r;
  }
  file(stem) {
    if (this.files.has(stem) && isJs(stem)) return [stem];
    const bare = stem.replace(/\.([cm]?js|jsx)$/, "");
    for (const e of JS_EXTS) if (this.files.has(bare + e)) return [bare + e];
    for (const e of JS_EXTS) if (this.files.has(`${stem}/index${e}`)) return [`${stem}/index${e}`];
    return [];
  }
  resolveJs(from, spec) {
    if (spec.startsWith(".") || spec.startsWith("/")) {
      const p = normalize(spec.startsWith("/") ? spec : `${dirOf(from)}/${spec}`);
      const f = p === null ? [] : this.file(p);
      return f.length ? f : "unknown";
    }
    if (spec.startsWith("node:")) return "external";
    const aliased = this.alias(from, spec);
    if (aliased.length) return aliased;
    if (spec.startsWith("#")) return "unknown";
    const pkg = this.pkgs.find((w) => spec === w.name || spec.startsWith(w.name + "/"));
    if (!pkg) {
      const parts2 = spec.split("/");
      const name2 = spec.startsWith("@") ? parts2.slice(0, 2).join("/") : parts2[0];
      const dep = BUILTINS.has(name2) || this.deps.has(name2);
      return dep && !this.dirs.has(parts2[0]) ? "external" : "unknown";
    }
    const sub = spec.slice(pkg.name.length + 1);
    const found = sub ? this.subpath(pkg.root, sub) : this.entry(pkg.root);
    return found.length ? found : "unknown";
  }
  /** Alias keys that may name `path` (`@cfg`, or the `@/` of `@/*`): substrings its importers contain. */
  aliasNeedles(path) {
    const out2 = [];
    for (const a of this.aliases) {
      if (a.prefix !== null) out2.push(a.prefix || a.suffix);
      else if (a.targets.some(
        (t) => normalize(`${a.base}/${t}`) === path || this.alias(a.dir ? `${a.dir}/x` : "x", a.key).includes(path)
      ))
        out2.push(a.key);
    }
    return out2.filter(Boolean);
  }
  alias(from, spec) {
    for (const a of this.aliases) {
      if (a.dir && !from.startsWith(a.dir + "/")) continue;
      const star = a.prefix !== null && spec.startsWith(a.prefix) && spec.endsWith(a.suffix);
      if (!(a.key === spec || star)) continue;
      const mid = star ? spec.slice(a.prefix.length, spec.length - a.suffix.length) : "";
      for (const t of a.targets) {
        const p = normalize(`${a.base}/${t.replace("*", mid)}`);
        const found = p === null ? [] : [...this.file(p), ...this.subpath("", p)];
        if (found.length) return [...new Set(found)];
      }
    }
    return [];
  }
  subpath(root, sub) {
    const base3 = root ? `${root}/` : "";
    const cands = [sub, sub.replace(OUT_DIRS, ""), sub.replace(OUT_DIRS, "src/"), `src/${sub}`];
    for (const c of cands) {
      const f = this.file(base3 + c);
      if (f.length) return f;
    }
    return [];
  }
  /** A workspace package's entry file: package.json exports/module/main mapped back from build output. */
  entry(root) {
    const hit = this.entries.get(root);
    if (hit) return hit;
    const fields = [];
    try {
      const pj = JSON.parse(this.tree.read(root ? `${root}/package.json` : "package.json") ?? "{}");
      const dot = (e) => {
        if (typeof e === "string") fields.push(e);
        else if (e && typeof e === "object") {
          const o = e;
          if ("." in o) dot(o["."]);
          else
            for (const k of ["source", "import", "module", "default", "require", "node"])
              if (k in o) dot(o[k]);
        }
      };
      for (const f of [pj.source, pj.module, pj.main]) if (f) fields.push(f);
      dot(pj.exports);
    } catch {
    }
    const out2 = /* @__PURE__ */ new Set();
    for (const f of [...fields, "index", "src/index"])
      for (const x of this.subpath(root, f.replace(/^\.\//, ""))) out2.add(x);
    const r = [...out2];
    this.entries.set(root, r);
    return r;
  }
  /**
   * A Python module (`a.b`, `.a.b`, `..`) imported from `from`: the files it can be. Absolute names match any
   * file whose path ends with a/b.py or a/b/__init__.py, since we don't know the source roots.
   */
  py(from, spec) {
    const key = `${spec.startsWith(".") ? dirOf(from) : ""}\0${spec}\0py`;
    let r = this.cache.get(key);
    if (r === void 0) this.cache.set(key, r = this.resolvePy(from, spec));
    return r;
  }
  resolvePy(from, spec) {
    const dots = /^\.*/.exec(spec)[0].length;
    const rest = spec.slice(dots);
    if (dots) {
      let dir = dirOf(from);
      for (let i2 = 1; i2 < dots; i2++) dir = dirOf(dir);
      const p = [dir, ...rest ? rest.split(".") : []].filter(Boolean).join("/");
      const out3 = [`${p}.py`, `${p}/__init__.py`].filter((f) => this.files.has(f));
      return out3.length ? out3 : "unknown";
    }
    const parts2 = rest.split(".");
    const last = parts2.at(-1);
    const tail = parts2.join("/");
    const rootOk = (f, matched) => {
      const above = f.slice(0, f.length - matched.length - 1);
      return !above || !this.files.has(`${above}/__init__.py`);
    };
    const out2 = (this.byBase.get(last) ?? []).filter(
      (f) => [`${tail}.py`, `${tail}/__init__.py`].some((m) => (f === m || f.endsWith(`/${m}`)) && rootOk(f, m))
    );
    return out2.length ? out2 : "external";
  }
};
function mayBe(r, spec, path) {
  if (r === "external") return false;
  if (r !== "unknown") return r.includes(path);
  if (spec.startsWith(".") || spec.startsWith("/")) return false;
  const last = baseOf(
    spec.replace(/^#/, "").replace(/\/+$/, "").replace(/\/index(\.[cm]?[jt]sx?)?$/, "")
  ).replace(/\.[cm]?[jt]sx?$/, "");
  return names(path).includes(last);
}

// ../engine/src/globs.ts
var CALL = /import\.meta\.(?:glob|globEager)\b|import\.meta\.webpackContext\b|\brequire\.context\b/g;
var HINT = /import\.meta\.(?:glob|webpackContext)|require\.context/;
var MAGIC = /[*?[\]{}()]/;
var cache = /* @__PURE__ */ new Map();
var MAX_BYTES = 2 * 1024 * 1024;
var MAX_CALLS = 1e3;
var GLOB_FILE = /\.(vue|svelte|astro|mdx|html?)$/;
var CACHE_LIMIT = 5e4;
var dirOf2 = (p) => p.slice(0, Math.max(0, p.lastIndexOf("/")));
function normalize2(p) {
  const out2 = [];
  for (const s of p.split("/")) {
    if (s === "" || s === ".") continue;
    if (s === "..") {
      if (!out2.length) return null;
      out2.pop();
    } else out2.push(s);
  }
  return out2.join("/");
}
function literal(src, i2) {
  const q = src[i2];
  if (q !== "'" && q !== '"' && q !== "`") return null;
  let v = "";
  for (let j = i2 + 1; j < src.length && j < i2 + 4096; j++) {
    const c = src[j];
    if (c === "\\") {
      v += src[++j] ?? "";
      continue;
    }
    if (q === "`" && c === "$" && src[j + 1] === "{") return null;
    if (c === q) return { value: v, end: j + 1 };
    if (c === "\n" && q !== "`") return null;
    v += c;
  }
  return null;
}
var skipSpace = (src, i2) => {
  while (i2 < src.length && /\s/.test(src[i2])) i2++;
  return i2;
};
function firstArg(src, i2) {
  i2 = skipSpace(src, i2);
  if (src[i2] === "<") {
    const close = src.slice(i2, i2 + 500).indexOf(">");
    if (close < 0) return null;
    i2 = skipSpace(src, i2 + close + 1);
  }
  if (src[i2] !== "(") return null;
  i2 = skipSpace(src, i2 + 1);
  if (src[i2] !== "[") {
    const l = literal(src, i2);
    return l && { values: [l.value], end: l.end };
  }
  const values = [];
  i2 = skipSpace(src, i2 + 1);
  while (src[i2] !== "]") {
    const l = literal(src, i2);
    if (!l) return null;
    values.push(l.value);
    i2 = skipSpace(src, l.end);
    if (src[i2] === ",") i2 = skipSpace(src, i2 + 1);
    else if (src[i2] !== "]") return null;
  }
  return { values, end: i2 + 1 };
}
function globDirs(file, src) {
  if (!HINT.test(src)) return [];
  if (src.length > MAX_BYTES) return null;
  const dirs = /* @__PURE__ */ new Set();
  const here = dirOf2(file);
  const ancestors = [];
  for (let d = here; ; d = dirOf2(d)) {
    ancestors.push(d);
    if (!d) break;
  }
  let calls = 0;
  for (const m of src.matchAll(CALL)) {
    const after = skipSpace(src, m.index + m[0].length);
    if (src[after] !== "(" && src[after] !== "<") {
      if (src[after] === "/" || src[after] === ")" || src[m.index - 1] === "(") return null;
      continue;
    }
    if (++calls > MAX_CALLS) return null;
    const arg = firstArg(src, after);
    if (!arg) return null;
    const isGlob = m[0].includes("glob");
    if (isGlob) {
      if (/\bbase\b/.test(src.slice(arg.end, arg.end + 2e3))) return null;
    }
    for (const pat of arg.values) {
      if (isGlob && pat.startsWith("!")) continue;
      const segs = pat.split("/");
      let n = segs.findIndex((s) => MAGIC.test(s));
      if (n < 0) n = isGlob ? segs.length - 1 : segs.length;
      const prefix = segs.slice(0, n).join("/");
      if (pat.startsWith("./") || pat.startsWith("../") || !isGlob && (pat === "." || pat === "..")) {
        const d = normalize2(`${here}/${prefix}`);
        dirs.add(d ?? "");
      } else if (pat.startsWith("/")) {
        for (const a of ancestors) dirs.add(normalize2(`${a}/${prefix}`) ?? "");
      } else return null;
    }
  }
  return [...dirs];
}
function globSites(tree) {
  const files = tree.paths().filter((p) => (isJs(p) || GLOB_FILE.test(p)) && !p.includes("node_modules/"));
  const uncached = files.filter((p) => {
    const id = tree.id?.(p);
    return !id || !cache.has(id);
  });
  tree.prefetch?.(uncached);
  const out2 = [];
  for (const f of files) {
    const id = tree.id?.(f);
    let hit = id ? cache.get(id) : void 0;
    if (hit === void 0) {
      const src = tree.read(f);
      const dirs = src === null ? [] : globDirs(f, src);
      hit = dirs !== null && !dirs.length ? false : dirs;
      if (id) {
        if (cache.size >= CACHE_LIMIT) cache.clear();
        cache.set(id, hit);
      }
    }
    if (hit !== false) out2.push({ file: f, dirs: hit });
  }
  return out2;
}
function underDirs(path, dirs) {
  return dirs === null || dirs.some((d) => d === "" || path.startsWith(d + "/"));
}

// ../engine/src/spans/python.ts
import { createRequire } from "node:module";

// ../../node_modules/.pnpm/web-tree-sitter@0.27.1/node_modules/web-tree-sitter/web-tree-sitter.js
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var Edit = class {
  static {
    __name(this, "Edit");
  }
  /** The start position of the change. */
  startPosition;
  /** The end position of the change before the edit. */
  oldEndPosition;
  /** The end position of the change after the edit. */
  newEndPosition;
  /** The start index of the change. */
  startIndex;
  /** The end index of the change before the edit. */
  oldEndIndex;
  /** The end index of the change after the edit. */
  newEndIndex;
  constructor({
    startIndex,
    oldEndIndex,
    newEndIndex,
    startPosition,
    oldEndPosition,
    newEndPosition
  }) {
    this.startIndex = startIndex >>> 0;
    this.oldEndIndex = oldEndIndex >>> 0;
    this.newEndIndex = newEndIndex >>> 0;
    this.startPosition = startPosition;
    this.oldEndPosition = oldEndPosition;
    this.newEndPosition = newEndPosition;
  }
  /**
   * Edit a point and index to keep it in-sync with source code that has been edited.
   *
   * This function updates a single point's byte offset and row/column position
   * based on an edit operation. This is useful for editing points without
   * requiring a tree or node instance.
   */
  editPoint(point, index) {
    let newIndex = index;
    const newPoint = { ...point };
    if (index >= this.oldEndIndex) {
      newIndex = this.newEndIndex + (index - this.oldEndIndex);
      const originalRow = point.row;
      newPoint.row = this.newEndPosition.row + (point.row - this.oldEndPosition.row);
      newPoint.column = originalRow === this.oldEndPosition.row ? this.newEndPosition.column + (point.column - this.oldEndPosition.column) : point.column;
    } else if (index > this.startIndex) {
      newIndex = this.newEndIndex;
      newPoint.row = this.newEndPosition.row;
      newPoint.column = this.newEndPosition.column;
    }
    return { point: newPoint, index: newIndex };
  }
  /**
   * Edit a range to keep it in-sync with source code that has been edited.
   *
   * This function updates a range's start and end positions based on an edit
   * operation. This is useful for editing ranges without requiring a tree
   * or node instance.
   */
  editRange(range) {
    const newRange = {
      startIndex: range.startIndex,
      startPosition: { ...range.startPosition },
      endIndex: range.endIndex,
      endPosition: { ...range.endPosition }
    };
    if (range.endIndex >= this.oldEndIndex) {
      if (range.endIndex !== Number.MAX_SAFE_INTEGER) {
        newRange.endIndex = this.newEndIndex + (range.endIndex - this.oldEndIndex);
        newRange.endPosition = {
          row: this.newEndPosition.row + (range.endPosition.row - this.oldEndPosition.row),
          column: range.endPosition.row === this.oldEndPosition.row ? this.newEndPosition.column + (range.endPosition.column - this.oldEndPosition.column) : range.endPosition.column
        };
        if (newRange.endIndex < this.newEndIndex) {
          newRange.endIndex = Number.MAX_SAFE_INTEGER;
          newRange.endPosition = { row: Number.MAX_SAFE_INTEGER, column: Number.MAX_SAFE_INTEGER };
        }
      }
    } else if (range.endIndex > this.startIndex) {
      newRange.endIndex = this.startIndex;
      newRange.endPosition = { ...this.startPosition };
    }
    if (range.startIndex >= this.oldEndIndex) {
      newRange.startIndex = this.newEndIndex + (range.startIndex - this.oldEndIndex);
      newRange.startPosition = {
        row: this.newEndPosition.row + (range.startPosition.row - this.oldEndPosition.row),
        column: range.startPosition.row === this.oldEndPosition.row ? this.newEndPosition.column + (range.startPosition.column - this.oldEndPosition.column) : range.startPosition.column
      };
      if (newRange.startIndex < this.newEndIndex) {
        newRange.startIndex = Number.MAX_SAFE_INTEGER;
        newRange.startPosition = { row: Number.MAX_SAFE_INTEGER, column: Number.MAX_SAFE_INTEGER };
      }
    } else if (range.startIndex > this.startIndex) {
      newRange.startIndex = this.startIndex;
      newRange.startPosition = { ...this.startPosition };
    }
    return newRange;
  }
};
var SIZE_OF_SHORT = 2;
var SIZE_OF_INT = 4;
var SIZE_OF_CURSOR = 4 * SIZE_OF_INT;
var SIZE_OF_NODE = 5 * SIZE_OF_INT;
var SIZE_OF_POINT = 2 * SIZE_OF_INT;
var SIZE_OF_RANGE = 2 * SIZE_OF_INT + 2 * SIZE_OF_POINT;
var ZERO_POINT = { row: 0, column: 0 };
var INTERNAL = /* @__PURE__ */ Symbol("INTERNAL");
function assertInternal(x) {
  if (x !== INTERNAL) throw new Error("Illegal constructor");
}
__name(assertInternal, "assertInternal");
function isPoint(point) {
  return !!point && typeof point.row === "number" && typeof point.column === "number";
}
__name(isPoint, "isPoint");
function setModule(module2) {
  C = module2;
}
__name(setModule, "setModule");
var C;
function newFinalizer(handler) {
  try {
    return new FinalizationRegistry(handler);
  } catch (e) {
    console.error("Unsupported FinalizationRegistry:", e);
    return;
  }
}
__name(newFinalizer, "newFinalizer");
var finalizer = newFinalizer((address) => {
  C._ts_lookahead_iterator_delete(address);
});
var LookaheadIterator = class {
  static {
    __name(this, "LookaheadIterator");
  }
  /** @internal */
  [0] = 0;
  // Internal handle for Wasm
  /** @internal */
  language;
  /** @internal */
  positioned = false;
  /** @internal */
  constructor(internal, address, language) {
    assertInternal(internal);
    this[0] = address;
    this.language = language;
    finalizer?.register(this, address, this);
  }
  /**
   * Get the current symbol of the lookahead iterator.
   *
   * Returns `null` if the iterator is not positioned on a symbol:
   *
   * - Before the first iteration step
   * - After the iterator is exhausted
   * - After a {@link reset} or {@link resetState} call
   */
  get currentTypeId() {
    return this.positioned ? C._ts_lookahead_iterator_current_symbol(this[0]) : null;
  }
  /**
   * Get the current symbol name of the lookahead iterator.
   *
   * Returns `null` if the iterator is not positioned on a symbol.
   */
  get currentType() {
    const id = this.currentTypeId;
    if (id === null) return null;
    return this.language.types[id] ?? C.UTF8ToString(C._ts_language_symbol_name(this.language[0], id));
  }
  /** Delete the lookahead iterator, freeing its resources. */
  delete() {
    finalizer?.unregister(this);
    C._ts_lookahead_iterator_delete(this[0]);
    this[0] = 0;
  }
  /**
   * Reset the lookahead iterator.
   *
   * This returns `true` if the language was set successfully and `false`
   * otherwise.
   */
  reset(language, stateId) {
    if (C._ts_lookahead_iterator_reset(this[0], language[0], stateId)) {
      this.language = language;
      this.positioned = false;
      return true;
    }
    return false;
  }
  /**
   * Reset the lookahead iterator to another state.
   *
   * This returns `true` if the iterator was reset to the given state and
   * `false` otherwise.
   */
  resetState(stateId) {
    if (!C._ts_lookahead_iterator_reset_state(this[0], stateId)) return false;
    this.positioned = false;
    return true;
  }
  /**
   * Returns an iterator that iterates over the symbols of the lookahead iterator.
   *
   * The iterator will yield the current symbol name as a string for each step
   * until there are no more symbols to iterate over.
   */
  [Symbol.iterator]() {
    return {
      next: /* @__PURE__ */ __name(() => {
        this.positioned = Boolean(C._ts_lookahead_iterator_next(this[0]));
        const value = this.currentType;
        return value === null ? { done: true, value: "" } : { done: false, value };
      }, "next")
    };
  }
};
function getText(tree, startIndex, endIndex, startPosition) {
  const length = endIndex - startIndex;
  let result = tree.textCallback(startIndex, startPosition);
  if (result) {
    startIndex += result.length;
    while (startIndex < endIndex) {
      const string = tree.textCallback(startIndex, startPosition);
      if (string && string.length > 0) {
        startIndex += string.length;
        result += string;
      } else {
        break;
      }
    }
    if (startIndex > endIndex) {
      result = result.slice(0, length);
    }
  }
  return result ?? "";
}
__name(getText, "getText");
var finalizer2 = newFinalizer((address) => {
  C._ts_tree_delete(address);
});
var Tree = class _Tree {
  static {
    __name(this, "Tree");
  }
  /** @internal */
  [0] = 0;
  // Internal handle for Wasm
  /** @internal */
  textCallback;
  /** The language that was used to parse the syntax tree. */
  language;
  /** @internal */
  constructor(internal, address, language, textCallback) {
    assertInternal(internal);
    this[0] = address;
    this.language = language;
    this.textCallback = textCallback;
    finalizer2?.register(this, address, this);
  }
  /** Create a shallow copy of the syntax tree. This is very fast. */
  copy() {
    const address = C._ts_tree_copy(this[0]);
    return new _Tree(INTERNAL, address, this.language, this.textCallback);
  }
  /** Delete the syntax tree, freeing its resources. */
  delete() {
    finalizer2?.unregister(this);
    C._ts_tree_delete(this[0]);
    this[0] = 0;
  }
  /** Get the root node of the syntax tree. */
  get rootNode() {
    C._ts_tree_root_node_wasm(this[0]);
    return unmarshalNode(this);
  }
  /**
   * Get the root node of the syntax tree, but with its position shifted
   * forward by the given offset.
   */
  rootNodeWithOffset(offsetBytes, offsetExtent) {
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    C.setValue(address, offsetBytes, "i32");
    marshalPoint(address + SIZE_OF_INT, offsetExtent);
    C._ts_tree_root_node_with_offset_wasm(this[0]);
    return unmarshalNode(this);
  }
  /**
   * Edit the syntax tree to keep it in sync with source code that has been
   * edited.
   *
   * You must describe the edit both in terms of byte offsets and in terms of
   * row/column coordinates.
   */
  edit(edit) {
    marshalEdit(edit);
    C._ts_tree_edit_wasm(this[0]);
  }
  /** Create a new {@link TreeCursor} starting from the root of the tree. */
  walk() {
    return this.rootNode.walk();
  }
  /**
   * Compare this old edited syntax tree to a new syntax tree representing
   * the same document, returning a sequence of ranges whose syntactic
   * structure has changed.
   *
   * For this to work correctly, this syntax tree must have been edited such
   * that its ranges match up to the new tree. Generally, you'll want to
   * call this method right after calling one of the [`Parser::parse`]
   * functions. Call it on the old tree that was passed to parse, and
   * pass the new tree that was returned from `parse`.
   */
  getChangedRanges(other) {
    if (!(other instanceof _Tree)) {
      throw new TypeError("Argument must be a Tree");
    }
    C._ts_tree_get_changed_ranges_wasm(this[0], other[0]);
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(count);
    if (count > 0) {
      let address = buffer;
      for (let i2 = 0; i2 < count; i2++) {
        result[i2] = unmarshalRange(address);
        address += SIZE_OF_RANGE;
      }
      C._free(buffer);
    }
    return result;
  }
  /** Get the included ranges that were used to parse the syntax tree. */
  getIncludedRanges() {
    C._ts_tree_included_ranges_wasm(this[0]);
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(count);
    if (count > 0) {
      let address = buffer;
      for (let i2 = 0; i2 < count; i2++) {
        result[i2] = unmarshalRange(address);
        address += SIZE_OF_RANGE;
      }
      C._free(buffer);
    }
    return result;
  }
};
var finalizer3 = newFinalizer((address) => {
  C._ts_tree_cursor_delete_wasm(address);
});
var TreeCursor = class _TreeCursor {
  static {
    __name(this, "TreeCursor");
  }
  /** @internal */
  // @ts-expect-error: never read
  [0] = 0;
  // Internal handle for Wasm
  /** @internal */
  // @ts-expect-error: never read
  [1] = 0;
  // Internal handle for Wasm
  /** @internal */
  // @ts-expect-error: never read
  [2] = 0;
  // Internal handle for Wasm
  /** @internal */
  // @ts-expect-error: never read
  [3] = 0;
  // Internal handle for Wasm
  /** @internal */
  tree;
  /** @internal */
  constructor(internal, tree) {
    assertInternal(internal);
    this.tree = tree;
    unmarshalTreeCursor(this);
    finalizer3?.register(this, this.tree[0], this);
  }
  /** Creates a deep copy of the tree cursor. This allocates new memory. */
  copy() {
    const copy = new _TreeCursor(INTERNAL, this.tree);
    C._ts_tree_cursor_copy_wasm(this.tree[0]);
    unmarshalTreeCursor(copy);
    return copy;
  }
  /** Delete the tree cursor, freeing its resources. */
  delete() {
    finalizer3?.unregister(this);
    marshalTreeCursor(this);
    C._ts_tree_cursor_delete_wasm(this.tree[0]);
    this[0] = this[1] = this[2] = 0;
  }
  /** Get the tree cursor's current {@link Node}. */
  get currentNode() {
    marshalTreeCursor(this);
    C._ts_tree_cursor_current_node_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /**
   * Get the numerical field id of this tree cursor's current node.
   *
   * See also {@link TreeCursor#currentFieldName}.
   */
  get currentFieldId() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_field_id_wasm(this.tree[0]);
  }
  /** Get the field name of this tree cursor's current node. */
  get currentFieldName() {
    return this.tree.language.fields[this.currentFieldId];
  }
  /**
   * Get the depth of the cursor's current node relative to the original
   * node that the cursor was constructed with.
   */
  get currentDepth() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_depth_wasm(this.tree[0]);
  }
  /**
   * Get the index of the cursor's current node out of all of the
   * descendants of the original node that the cursor was constructed with.
   */
  get currentDescendantIndex() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_descendant_index_wasm(this.tree[0]);
  }
  /** Get the type of the cursor's current node. */
  get nodeType() {
    return this.tree.language.types[this.nodeTypeId] || "ERROR";
  }
  /** Get the type id of the cursor's current node. */
  get nodeTypeId() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_node_type_id_wasm(this.tree[0]);
  }
  /** Get the state id of the cursor's current node. */
  get nodeStateId() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_node_state_id_wasm(this.tree[0]);
  }
  /** Get the id of the cursor's current node. */
  get nodeId() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_node_id_wasm(this.tree[0]);
  }
  /**
   * Check if the cursor's current node is *named*.
   *
   * Named nodes correspond to named rules in the grammar, whereas
   * *anonymous* nodes correspond to string literals in the grammar.
   */
  get nodeIsNamed() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_node_is_named_wasm(this.tree[0]) === 1;
  }
  /**
   * Check if the cursor's current node is *missing*.
   *
   * Missing nodes are inserted by the parser in order to recover from
   * certain kinds of syntax errors.
   */
  get nodeIsMissing() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_current_node_is_missing_wasm(this.tree[0]) === 1;
  }
  /** Get the string content of the cursor's current node. */
  get nodeText() {
    marshalTreeCursor(this);
    const startIndex = C._ts_tree_cursor_start_index_wasm(this.tree[0]);
    const endIndex = C._ts_tree_cursor_end_index_wasm(this.tree[0]);
    C._ts_tree_cursor_start_position_wasm(this.tree[0]);
    const startPosition = unmarshalPoint(TRANSFER_BUFFER);
    return getText(this.tree, startIndex, endIndex, startPosition);
  }
  /** Get the start position of the cursor's current node. */
  get startPosition() {
    marshalTreeCursor(this);
    C._ts_tree_cursor_start_position_wasm(this.tree[0]);
    return unmarshalPoint(TRANSFER_BUFFER);
  }
  /** Get the end position of the cursor's current node. */
  get endPosition() {
    marshalTreeCursor(this);
    C._ts_tree_cursor_end_position_wasm(this.tree[0]);
    return unmarshalPoint(TRANSFER_BUFFER);
  }
  /** Get the start index of the cursor's current node. */
  get startIndex() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_start_index_wasm(this.tree[0]);
  }
  /** Get the end index of the cursor's current node. */
  get endIndex() {
    marshalTreeCursor(this);
    return C._ts_tree_cursor_end_index_wasm(this.tree[0]);
  }
  /**
   * Move this cursor to the first child of its current node.
   *
   * This returns `true` if the cursor successfully moved, and returns
   * `false` if there were no children.
   */
  gotoFirstChild() {
    marshalTreeCursor(this);
    const result = C._ts_tree_cursor_goto_first_child_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Move this cursor to the last child of its current node.
   *
   * This returns `true` if the cursor successfully moved, and returns
   * `false` if there were no children.
   *
   * Note that this function may be slower than
   * {@link TreeCursor#gotoFirstChild} because it needs to
   * iterate through all the children to compute the child's position.
   */
  gotoLastChild() {
    marshalTreeCursor(this);
    const result = C._ts_tree_cursor_goto_last_child_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Move this cursor to the parent of its current node.
   *
   * This returns `true` if the cursor successfully moved, and returns
   * `false` if there was no parent node (the cursor was already on the
   * root node).
   *
   * Note that the node the cursor was constructed with is considered the root
   * of the cursor, and the cursor cannot walk outside this node.
   */
  gotoParent() {
    marshalTreeCursor(this);
    const result = C._ts_tree_cursor_goto_parent_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Move this cursor to the next sibling of its current node.
   *
   * This returns `true` if the cursor successfully moved, and returns
   * `false` if there was no next sibling node.
   *
   * Note that the node the cursor was constructed with is considered the root
   * of the cursor, and the cursor cannot walk outside this node.
   */
  gotoNextSibling() {
    marshalTreeCursor(this);
    const result = C._ts_tree_cursor_goto_next_sibling_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Move this cursor to the previous sibling of its current node.
   *
   * This returns `true` if the cursor successfully moved, and returns
   * `false` if there was no previous sibling node.
   *
   * Note that this function may be slower than
   * {@link TreeCursor#gotoNextSibling} due to how node
   * positions are stored. In the worst case, this will need to iterate
   * through all the children up to the previous sibling node to recalculate
   * its position. Also note that the node the cursor was constructed with is
   * considered the root of the cursor, and the cursor cannot walk outside this node.
   */
  gotoPreviousSibling() {
    marshalTreeCursor(this);
    const result = C._ts_tree_cursor_goto_previous_sibling_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Move the cursor to the node that is the nth descendant of
   * the original node that the cursor was constructed with, where
   * zero represents the original node itself.
   */
  gotoDescendant(goalDescendantIndex) {
    marshalTreeCursor(this);
    C._ts_tree_cursor_goto_descendant_wasm(this.tree[0], goalDescendantIndex);
    unmarshalTreeCursor(this);
  }
  /**
   * Move this cursor to the first child of its current node that contains or
   * starts after the given byte offset.
   *
   * This returns `true` if the cursor successfully moved to a child node, and returns
   * `false` if no such child was found.
   */
  gotoFirstChildForIndex(goalIndex) {
    marshalTreeCursor(this);
    C.setValue(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalIndex, "i32");
    const result = C._ts_tree_cursor_goto_first_child_for_index_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Move this cursor to the first child of its current node that contains or
   * starts after the given byte offset.
   *
   * This returns the index of the child node if one was found, and returns
   * `null` if no such child was found.
   */
  gotoFirstChildForPosition(goalPosition) {
    marshalTreeCursor(this);
    marshalPoint(TRANSFER_BUFFER + SIZE_OF_CURSOR, goalPosition);
    const result = C._ts_tree_cursor_goto_first_child_for_position_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
    return result === 1;
  }
  /**
   * Re-initialize this tree cursor to start at the original node that the
   * cursor was constructed with.
   */
  reset(node) {
    marshalNode(node);
    marshalTreeCursor(this, TRANSFER_BUFFER + SIZE_OF_NODE);
    C._ts_tree_cursor_reset_wasm(this.tree[0]);
    unmarshalTreeCursor(this);
  }
  /**
   * Re-initialize a tree cursor to the same position as another cursor.
   *
   * Unlike {@link TreeCursor#reset}, this will not lose parent
   * information and allows reusing already created cursors.
   */
  resetTo(cursor) {
    marshalTreeCursor(this, TRANSFER_BUFFER);
    marshalTreeCursor(cursor, TRANSFER_BUFFER + SIZE_OF_CURSOR);
    C._ts_tree_cursor_reset_to_wasm(this.tree[0], cursor.tree[0]);
    unmarshalTreeCursor(this);
  }
};
var Node = class {
  static {
    __name(this, "Node");
  }
  /** @internal */
  // @ts-expect-error: never read
  [0] = 0;
  // Internal handle for Wasm
  /** @internal */
  _children;
  /** @internal */
  _namedChildren;
  /** @internal */
  constructor(internal, {
    id,
    tree,
    startIndex,
    startPosition,
    other
  }) {
    assertInternal(internal);
    this[0] = other;
    this.id = id;
    this.tree = tree;
    this.startIndex = startIndex;
    this.startPosition = startPosition;
  }
  /**
   * The numeric id for this node that is unique.
   *
   * Within a given syntax tree, no two nodes have the same id. However:
   *
   * * If a new tree is created based on an older tree, and a node from the old tree is reused in
   *   the process, then that node will have the same id in both trees.
   *
   * * A node not marked as having changes does not guarantee it was reused.
   *
   * * If a node is marked as having changed in the old tree, it will not be reused.
   */
  id;
  /** The byte index where this node starts. */
  startIndex;
  /** The position where this node starts. */
  startPosition;
  /** The tree that this node belongs to. */
  tree;
  /** Get this node's type as a numerical id. */
  get typeId() {
    marshalNode(this);
    return C._ts_node_symbol_wasm(this.tree[0]);
  }
  /**
   * Get the node's type as a numerical id as it appears in the grammar,
   * ignoring aliases.
   */
  get grammarId() {
    marshalNode(this);
    return C._ts_node_grammar_symbol_wasm(this.tree[0]);
  }
  /** Get this node's type as a string. */
  get type() {
    return this.tree.language.types[this.typeId] || "ERROR";
  }
  /**
   * Get this node's symbol name as it appears in the grammar, ignoring
   * aliases as a string.
   */
  get grammarType() {
    return this.tree.language.types[this.grammarId] || "ERROR";
  }
  /**
   * Check if this node is *named*.
   *
   * Named nodes correspond to named rules in the grammar, whereas
   * *anonymous* nodes correspond to string literals in the grammar.
   */
  get isNamed() {
    marshalNode(this);
    return C._ts_node_is_named_wasm(this.tree[0]) === 1;
  }
  /**
   * Check if this node is *extra*.
   *
   * Extra nodes represent things like comments, which are not required
   * by the grammar, but can appear anywhere.
   */
  get isExtra() {
    marshalNode(this);
    return C._ts_node_is_extra_wasm(this.tree[0]) === 1;
  }
  /**
   * Check if this node represents a syntax error.
   *
   * Syntax errors represent parts of the code that could not be incorporated
   * into a valid syntax tree.
   */
  get isError() {
    marshalNode(this);
    return C._ts_node_is_error_wasm(this.tree[0]) === 1;
  }
  /**
   * Check if this node is *missing*.
   *
   * Missing nodes are inserted by the parser in order to recover from
   * certain kinds of syntax errors.
   */
  get isMissing() {
    marshalNode(this);
    return C._ts_node_is_missing_wasm(this.tree[0]) === 1;
  }
  /** Check if this node has been edited. */
  get hasChanges() {
    marshalNode(this);
    return C._ts_node_has_changes_wasm(this.tree[0]) === 1;
  }
  /**
   * Check if this node represents a syntax error or contains any syntax
   * errors anywhere within it.
   */
  get hasError() {
    marshalNode(this);
    return C._ts_node_has_error_wasm(this.tree[0]) === 1;
  }
  /** Get the byte index where this node ends. */
  get endIndex() {
    marshalNode(this);
    return C._ts_node_end_index_wasm(this.tree[0]);
  }
  /** Get the position where this node ends. */
  get endPosition() {
    marshalNode(this);
    C._ts_node_end_point_wasm(this.tree[0]);
    return unmarshalPoint(TRANSFER_BUFFER);
  }
  /** Get the string content of this node. */
  get text() {
    return getText(this.tree, this.startIndex, this.endIndex, this.startPosition);
  }
  /** Get this node's parse state. */
  get parseState() {
    marshalNode(this);
    return C._ts_node_parse_state_wasm(this.tree[0]);
  }
  /** Get the parse state after this node. */
  get nextParseState() {
    marshalNode(this);
    return C._ts_node_next_parse_state_wasm(this.tree[0]);
  }
  /** Check if this node is equal to another node. */
  equals(other) {
    return this.tree === other.tree && this.id === other.id;
  }
  /**
   * Get the node's child at the given index, where zero represents the first child.
   *
   * This method is fairly fast, but its cost is technically log(n), so if
   * you might be iterating over a long list of children, you should use
   * {@link Node#children} instead.
   */
  child(index) {
    marshalNode(this);
    C._ts_node_child_wasm(this.tree[0], index);
    return unmarshalNode(this.tree);
  }
  /**
   * Get this node's *named* child at the given index.
   *
   * See also {@link Node#isNamed}.
   * This method is fairly fast, but its cost is technically log(n), so if
   * you might be iterating over a long list of children, you should use
   * {@link Node#namedChildren} instead.
   */
  namedChild(index) {
    marshalNode(this);
    C._ts_node_named_child_wasm(this.tree[0], index);
    return unmarshalNode(this.tree);
  }
  /**
   * Get this node's child with the given numerical field id.
   *
   * See also {@link Node#childForFieldName}. You can
   * convert a field name to an id using {@link Language#fieldIdForName}.
   */
  childForFieldId(fieldId) {
    marshalNode(this);
    C._ts_node_child_by_field_id_wasm(this.tree[0], fieldId);
    return unmarshalNode(this.tree);
  }
  /**
   * Get the first child with the given field name.
   *
   * If multiple children may have the same field name, access them using
   * {@link Node#childrenForFieldName}.
   */
  childForFieldName(fieldName) {
    const fieldId = this.tree.language.fields.indexOf(fieldName);
    if (fieldId !== -1) return this.childForFieldId(fieldId);
    return null;
  }
  /** Get the field name of this node's child at the given index. */
  fieldNameForChild(index) {
    marshalNode(this);
    const address = C._ts_node_field_name_for_child_wasm(this.tree[0], index);
    if (!address) return null;
    return C.AsciiToString(address);
  }
  /** Get the field name of this node's named child at the given index. */
  fieldNameForNamedChild(index) {
    marshalNode(this);
    const address = C._ts_node_field_name_for_named_child_wasm(this.tree[0], index);
    if (!address) return null;
    return C.AsciiToString(address);
  }
  /**
   * Get an array of this node's children with a given field name.
   *
   * See also {@link Node#children}.
   */
  childrenForFieldName(fieldName) {
    const fieldId = this.tree.language.fields.indexOf(fieldName);
    if (fieldId !== -1 && fieldId !== 0) return this.childrenForFieldId(fieldId);
    return [];
  }
  /**
    * Get an array of this node's children with a given field id.
    *
    * See also {@link Node#childrenForFieldName}.
    */
  childrenForFieldId(fieldId) {
    marshalNode(this);
    C._ts_node_children_by_field_id_wasm(this.tree[0], fieldId);
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(count);
    if (count > 0) {
      let address = buffer;
      for (let i2 = 0; i2 < count; i2++) {
        result[i2] = unmarshalNode(this.tree, address);
        address += SIZE_OF_NODE;
      }
      C._free(buffer);
    }
    return result;
  }
  /** Get the node's first child that contains or starts after the given byte offset. */
  firstChildForIndex(index) {
    marshalNode(this);
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    C.setValue(address, index, "i32");
    C._ts_node_first_child_for_byte_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get the node's first named child that contains or starts after the given byte offset. */
  firstNamedChildForIndex(index) {
    marshalNode(this);
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    C.setValue(address, index, "i32");
    C._ts_node_first_named_child_for_byte_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get this node's number of children. */
  get childCount() {
    marshalNode(this);
    return C._ts_node_child_count_wasm(this.tree[0]);
  }
  /**
   * Get this node's number of *named* children.
   *
   * See also {@link Node#isNamed}.
   */
  get namedChildCount() {
    marshalNode(this);
    return C._ts_node_named_child_count_wasm(this.tree[0]);
  }
  /** Get this node's first child. */
  get firstChild() {
    return this.child(0);
  }
  /**
   * Get this node's first named child.
   *
   * See also {@link Node#isNamed}.
   */
  get firstNamedChild() {
    return this.namedChild(0);
  }
  /** Get this node's last child. */
  get lastChild() {
    return this.child(this.childCount - 1);
  }
  /**
   * Get this node's last named child.
   *
   * See also {@link Node#isNamed}.
   */
  get lastNamedChild() {
    return this.namedChild(this.namedChildCount - 1);
  }
  /**
   * Iterate over this node's children.
   *
   * If you're walking the tree recursively, you may want to use the
   * {@link TreeCursor} APIs directly instead.
   */
  get children() {
    if (!this._children) {
      marshalNode(this);
      C._ts_node_children_wasm(this.tree[0]);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      this._children = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0; i2 < count; i2++) {
          this._children[i2] = unmarshalNode(this.tree, address);
          address += SIZE_OF_NODE;
        }
        C._free(buffer);
      }
    }
    return this._children;
  }
  /**
   * Iterate over this node's named children.
   *
   * See also {@link Node#children}.
   */
  get namedChildren() {
    if (!this._namedChildren) {
      marshalNode(this);
      C._ts_node_named_children_wasm(this.tree[0]);
      const count = C.getValue(TRANSFER_BUFFER, "i32");
      const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      this._namedChildren = new Array(count);
      if (count > 0) {
        let address = buffer;
        for (let i2 = 0; i2 < count; i2++) {
          this._namedChildren[i2] = unmarshalNode(this.tree, address);
          address += SIZE_OF_NODE;
        }
        C._free(buffer);
      }
    }
    return this._namedChildren;
  }
  /**
   * Get the descendants of this node that are the given type, or in the given types array.
   *
   * The types array should contain node type strings, which can be retrieved from {@link Language#types}.
   *
   * Additionally, a `startPosition` and `endPosition` can be passed in to restrict the search to a byte range.
   */
  descendantsOfType(types, startPosition = ZERO_POINT, endPosition = ZERO_POINT) {
    if (!Array.isArray(types)) types = [types];
    const symbols = [];
    const typesBySymbol = this.tree.language.types;
    for (const node_type of types) {
      if (node_type == "ERROR") {
        symbols.push(65535);
      }
    }
    for (let i2 = 0, n = typesBySymbol.length; i2 < n; i2++) {
      if (types.includes(typesBySymbol[i2])) {
        symbols.push(i2);
      }
    }
    const symbolsAddress = C._malloc(SIZE_OF_INT * symbols.length);
    for (let i2 = 0, n = symbols.length; i2 < n; i2++) {
      C.setValue(symbolsAddress + i2 * SIZE_OF_INT, symbols[i2], "i32");
    }
    marshalNode(this);
    C._ts_node_descendants_of_type_wasm(
      this.tree[0],
      symbolsAddress,
      symbols.length,
      startPosition.row,
      startPosition.column,
      endPosition.row,
      endPosition.column
    );
    const descendantCount = C.getValue(TRANSFER_BUFFER, "i32");
    const descendantAddress = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(descendantCount);
    if (descendantCount > 0) {
      let address = descendantAddress;
      for (let i2 = 0; i2 < descendantCount; i2++) {
        result[i2] = unmarshalNode(this.tree, address);
        address += SIZE_OF_NODE;
      }
    }
    C._free(descendantAddress);
    C._free(symbolsAddress);
    return result;
  }
  /** Get this node's next sibling. */
  get nextSibling() {
    marshalNode(this);
    C._ts_node_next_sibling_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get this node's previous sibling. */
  get previousSibling() {
    marshalNode(this);
    C._ts_node_prev_sibling_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /**
   * Get this node's next *named* sibling.
   *
   * See also {@link Node#isNamed}.
   */
  get nextNamedSibling() {
    marshalNode(this);
    C._ts_node_next_named_sibling_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /**
   * Get this node's previous *named* sibling.
   *
   * See also {@link Node#isNamed}.
   */
  get previousNamedSibling() {
    marshalNode(this);
    C._ts_node_prev_named_sibling_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get the node's number of descendants, including one for the node itself. */
  get descendantCount() {
    marshalNode(this);
    return C._ts_node_descendant_count_wasm(this.tree[0]);
  }
  /**
   * Get this node's immediate parent.
   * Prefer {@link Node#childWithDescendant} for iterating over this node's ancestors.
   */
  get parent() {
    marshalNode(this);
    C._ts_node_parent_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /**
   * Get the node that contains `descendant`.
   *
   * Note that this can return `descendant` itself.
   */
  childWithDescendant(descendant) {
    marshalNode(this);
    marshalNode(descendant, 1);
    C._ts_node_child_with_descendant_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get the smallest node within this node that spans the given byte range. */
  descendantForIndex(start2, end = start2) {
    if (typeof start2 !== "number" || typeof end !== "number") {
      throw new Error("Arguments must be numbers");
    }
    marshalNode(this);
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    C.setValue(address, start2, "i32");
    C.setValue(address + SIZE_OF_INT, end, "i32");
    C._ts_node_descendant_for_index_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get the smallest named node within this node that spans the given byte range. */
  namedDescendantForIndex(start2, end = start2) {
    if (typeof start2 !== "number" || typeof end !== "number") {
      throw new Error("Arguments must be numbers");
    }
    marshalNode(this);
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    C.setValue(address, start2, "i32");
    C.setValue(address + SIZE_OF_INT, end, "i32");
    C._ts_node_named_descendant_for_index_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get the smallest node within this node that spans the given point range. */
  descendantForPosition(start2, end = start2) {
    if (!isPoint(start2) || !isPoint(end)) {
      throw new Error("Arguments must be {row, column} objects");
    }
    marshalNode(this);
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    marshalPoint(address, start2);
    marshalPoint(address + SIZE_OF_POINT, end);
    C._ts_node_descendant_for_position_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /** Get the smallest named node within this node that spans the given point range. */
  namedDescendantForPosition(start2, end = start2) {
    if (!isPoint(start2) || !isPoint(end)) {
      throw new Error("Arguments must be {row, column} objects");
    }
    marshalNode(this);
    const address = TRANSFER_BUFFER + SIZE_OF_NODE;
    marshalPoint(address, start2);
    marshalPoint(address + SIZE_OF_POINT, end);
    C._ts_node_named_descendant_for_position_wasm(this.tree[0]);
    return unmarshalNode(this.tree);
  }
  /**
   * Create a new {@link TreeCursor} starting from this node.
   *
   * Note that the given node is considered the root of the cursor,
   * and the cursor cannot walk outside this node.
   */
  walk() {
    marshalNode(this);
    C._ts_tree_cursor_new_wasm(this.tree[0]);
    return new TreeCursor(INTERNAL, this.tree);
  }
  /**
   * Edit this node to keep it in-sync with source code that has been edited.
   *
   * This function is only rarely needed. When you edit a syntax tree with
   * the {@link Tree#edit} method, all of the nodes that you retrieve from
   * the tree afterward will already reflect the edit. You only need to
   * use {@link Node#edit} when you have a specific {@link Node} instance that
   * you want to keep and continue to use after an edit.
   */
  edit(edit) {
    if (this.startIndex >= edit.oldEndIndex) {
      this.startIndex = edit.newEndIndex + (this.startIndex - edit.oldEndIndex);
      let subbedPointRow;
      let subbedPointColumn;
      if (this.startPosition.row > edit.oldEndPosition.row) {
        subbedPointRow = this.startPosition.row - edit.oldEndPosition.row;
        subbedPointColumn = this.startPosition.column;
      } else {
        subbedPointRow = 0;
        subbedPointColumn = this.startPosition.column;
        if (this.startPosition.column >= edit.oldEndPosition.column) {
          subbedPointColumn = this.startPosition.column - edit.oldEndPosition.column;
        }
      }
      if (subbedPointRow > 0) {
        this.startPosition.row += subbedPointRow;
        this.startPosition.column = subbedPointColumn;
      } else {
        this.startPosition.column += subbedPointColumn;
      }
    } else if (this.startIndex > edit.startIndex) {
      this.startIndex = edit.newEndIndex;
      this.startPosition.row = edit.newEndPosition.row;
      this.startPosition.column = edit.newEndPosition.column;
    }
  }
  /** Get the S-expression representation of this node. */
  toString() {
    marshalNode(this);
    const address = C._ts_node_to_string_wasm(this.tree[0]);
    const result = C.AsciiToString(address);
    C._free(address);
    return result;
  }
};
function unmarshalCaptures(query, tree, address, patternIndex, result) {
  for (let i2 = 0, n = result.length; i2 < n; i2++) {
    const captureIndex = C.getValue(address, "i32");
    address += SIZE_OF_INT;
    const node = unmarshalNode(tree, address);
    address += SIZE_OF_NODE;
    result[i2] = { patternIndex, name: query.captureNames[captureIndex], node };
  }
  return address;
}
__name(unmarshalCaptures, "unmarshalCaptures");
function marshalNode(node, index = 0) {
  let address = TRANSFER_BUFFER + index * SIZE_OF_NODE;
  C.setValue(address, node.id, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node.startIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node.startPosition.row, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node.startPosition.column, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, node[0], "i32");
}
__name(marshalNode, "marshalNode");
function unmarshalNode(tree, address = TRANSFER_BUFFER) {
  const id = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  if (id === 0) return null;
  const index = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  const row = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  const column = C.getValue(address, "i32");
  address += SIZE_OF_INT;
  const other = C.getValue(address, "i32");
  const result = new Node(INTERNAL, {
    id,
    tree,
    startIndex: index,
    startPosition: { row, column },
    other
  });
  return result;
}
__name(unmarshalNode, "unmarshalNode");
function marshalTreeCursor(cursor, address = TRANSFER_BUFFER) {
  C.setValue(address + 0 * SIZE_OF_INT, cursor[0], "i32");
  C.setValue(address + 1 * SIZE_OF_INT, cursor[1], "i32");
  C.setValue(address + 2 * SIZE_OF_INT, cursor[2], "i32");
  C.setValue(address + 3 * SIZE_OF_INT, cursor[3], "i32");
}
__name(marshalTreeCursor, "marshalTreeCursor");
function unmarshalTreeCursor(cursor) {
  cursor[0] = C.getValue(TRANSFER_BUFFER + 0 * SIZE_OF_INT, "i32");
  cursor[1] = C.getValue(TRANSFER_BUFFER + 1 * SIZE_OF_INT, "i32");
  cursor[2] = C.getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
  cursor[3] = C.getValue(TRANSFER_BUFFER + 3 * SIZE_OF_INT, "i32");
}
__name(unmarshalTreeCursor, "unmarshalTreeCursor");
function marshalPoint(address, point) {
  C.setValue(address, point.row, "i32");
  C.setValue(address + SIZE_OF_INT, point.column, "i32");
}
__name(marshalPoint, "marshalPoint");
function unmarshalPoint(address) {
  const result = {
    row: C.getValue(address, "i32") >>> 0,
    column: C.getValue(address + SIZE_OF_INT, "i32") >>> 0
  };
  return result;
}
__name(unmarshalPoint, "unmarshalPoint");
function marshalRange(address, range) {
  marshalPoint(address, range.startPosition);
  address += SIZE_OF_POINT;
  marshalPoint(address, range.endPosition);
  address += SIZE_OF_POINT;
  C.setValue(address, range.startIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, range.endIndex, "i32");
  address += SIZE_OF_INT;
}
__name(marshalRange, "marshalRange");
function unmarshalRange(address) {
  const result = {};
  result.startPosition = unmarshalPoint(address);
  address += SIZE_OF_POINT;
  result.endPosition = unmarshalPoint(address);
  address += SIZE_OF_POINT;
  result.startIndex = C.getValue(address, "i32") >>> 0;
  address += SIZE_OF_INT;
  result.endIndex = C.getValue(address, "i32") >>> 0;
  return result;
}
__name(unmarshalRange, "unmarshalRange");
function marshalEdit(edit, address = TRANSFER_BUFFER) {
  marshalPoint(address, edit.startPosition);
  address += SIZE_OF_POINT;
  marshalPoint(address, edit.oldEndPosition);
  address += SIZE_OF_POINT;
  marshalPoint(address, edit.newEndPosition);
  address += SIZE_OF_POINT;
  C.setValue(address, edit.startIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, edit.oldEndIndex, "i32");
  address += SIZE_OF_INT;
  C.setValue(address, edit.newEndIndex, "i32");
  address += SIZE_OF_INT;
}
__name(marshalEdit, "marshalEdit");
function unmarshalLanguageMetadata(address) {
  const major_version = C.getValue(address, "i32");
  const minor_version = C.getValue(address += SIZE_OF_INT, "i32");
  const patch_version = C.getValue(address += SIZE_OF_INT, "i32");
  return { major_version, minor_version, patch_version };
}
__name(unmarshalLanguageMetadata, "unmarshalLanguageMetadata");
var LANGUAGE_FUNCTION_REGEX = /^tree_sitter_\w+$/;
var Language = class _Language {
  static {
    __name(this, "Language");
  }
  /** @internal */
  [0] = 0;
  // Internal handle for Wasm
  /**
   * A list of all node types in the language. The index of each type in this
   * array is its node type id.
   */
  types;
  /**
   * A list of all field names in the language. The index of each field name in
   * this array is its field id.
   */
  fields;
  /** @internal */
  constructor(internal, address) {
    assertInternal(internal);
    this[0] = address;
    this.types = new Array(C._ts_language_symbol_count(this[0]));
    for (let i2 = 0, n = this.types.length; i2 < n; i2++) {
      if (C._ts_language_symbol_type(this[0], i2) < 2) {
        this.types[i2] = C.UTF8ToString(C._ts_language_symbol_name(this[0], i2));
      }
    }
    this.fields = new Array(C._ts_language_field_count(this[0]) + 1);
    for (let i2 = 0, n = this.fields.length; i2 < n; i2++) {
      const fieldName = C._ts_language_field_name_for_id(this[0], i2);
      if (fieldName !== 0) {
        this.fields[i2] = C.UTF8ToString(fieldName);
      } else {
        this.fields[i2] = null;
      }
    }
  }
  /**
   * Gets the name of the language.
   */
  get name() {
    const ptr = C._ts_language_name(this[0]);
    if (ptr === 0) return null;
    return C.UTF8ToString(ptr);
  }
  /**
   * Gets the ABI version of the language.
   */
  get abiVersion() {
    return C._ts_language_abi_version(this[0]);
  }
  /**
  * Get the metadata for this language. This information is generated by the
  * CLI, and relies on the language author providing the correct metadata in
  * the language's `tree-sitter.json` file.
  */
  get metadata() {
    C._ts_language_metadata_wasm(this[0]);
    const length = C.getValue(TRANSFER_BUFFER, "i32");
    if (length === 0) return null;
    return unmarshalLanguageMetadata(TRANSFER_BUFFER + SIZE_OF_INT);
  }
  /**
   * Gets the number of fields in the language.
   */
  get fieldCount() {
    return this.fields.length - 1;
  }
  /**
   * Gets the number of states in the language.
   */
  get stateCount() {
    return C._ts_language_state_count(this[0]);
  }
  /**
   * Get the field id for a field name.
   */
  fieldIdForName(fieldName) {
    const result = this.fields.indexOf(fieldName);
    return result !== -1 ? result : null;
  }
  /**
   * Get the field name for a field id.
   */
  fieldNameForId(fieldId) {
    return this.fields[fieldId] ?? null;
  }
  /**
   * Get the node type id for a node type name.
   */
  idForNodeType(type, named) {
    const typeLength = C.lengthBytesUTF8(type);
    const typeAddress = C._malloc(typeLength + 1);
    C.stringToUTF8(type, typeAddress, typeLength + 1);
    const result = C._ts_language_symbol_for_name(this[0], typeAddress, typeLength, named ? 1 : 0);
    C._free(typeAddress);
    return result || null;
  }
  /**
   * Gets the number of node types in the language.
   */
  get nodeTypeCount() {
    return C._ts_language_symbol_count(this[0]);
  }
  /**
   * Get the node type name for a node type id.
   */
  nodeTypeForId(typeId) {
    const name2 = C._ts_language_symbol_name(this[0], typeId);
    return name2 ? C.UTF8ToString(name2) : null;
  }
  /**
   * Check if a node type is named.
   *
   * @see {@link https://tree-sitter.github.io/tree-sitter/using-parsers/2-basic-parsing.html#named-vs-anonymous-nodes}
   */
  nodeTypeIsNamed(typeId) {
    return C._ts_language_type_is_named_wasm(this[0], typeId) ? true : false;
  }
  /**
   * Check if a node type is visible.
   */
  nodeTypeIsVisible(typeId) {
    return C._ts_language_type_is_visible_wasm(this[0], typeId) ? true : false;
  }
  /**
   * Get the supertypes ids of this language.
   *
   * @see {@link https://tree-sitter.github.io/tree-sitter/using-parsers/6-static-node-types.html?highlight=supertype#supertype-nodes}
   */
  get supertypes() {
    C._ts_language_supertypes_wasm(this[0]);
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(count);
    if (count > 0) {
      let address = buffer;
      for (let i2 = 0; i2 < count; i2++) {
        result[i2] = C.getValue(address, "i16");
        address += SIZE_OF_SHORT;
      }
    }
    return result;
  }
  /**
   * Get the subtype ids for a given supertype node id.
   */
  subtypes(supertype) {
    C._ts_language_subtypes_wasm(this[0], supertype);
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(count);
    if (count > 0) {
      let address = buffer;
      for (let i2 = 0; i2 < count; i2++) {
        result[i2] = C.getValue(address, "i16");
        address += SIZE_OF_SHORT;
      }
    }
    return result;
  }
  /**
   * Get the next state id for a given state id and node type id.
   */
  nextState(stateId, typeId) {
    return C._ts_language_next_state(this[0], stateId, typeId);
  }
  /**
   * Create a new lookahead iterator for this language and parse state.
   *
   * This returns `null` if state is invalid for this language.
   *
   * Iterating {@link LookaheadIterator} will yield valid symbols in the given
   * parse state. A newly created iterator is not positioned on a symbol, so
   * {@link LookaheadIterator#currentType} returns `null` until the first
   * iteration step.
   *
   * Lookahead iterators can be useful for generating suggestions and improving
   * syntax error diagnostics. To get symbols valid in an `ERROR` node, use the
   * lookahead iterator on its first leaf node state. For `MISSING` nodes, a
   * lookahead iterator created on the previous non-extra leaf node may be
   * appropriate.
   */
  lookaheadIterator(stateId) {
    const address = C._ts_lookahead_iterator_new(this[0], stateId);
    if (address) return new LookaheadIterator(INTERNAL, address, this);
    return null;
  }
  /**
   * Load a language from a WebAssembly module.
   * The module can be provided as a path to a file, a `URL` to a file, or as a
   * buffer.
   */
  static async load(input) {
    let binary2;
    if (input instanceof Uint8Array) {
      binary2 = input;
    } else if (globalThis.process?.versions.node) {
      const fs2 = await import("fs/promises");
      binary2 = await fs2.readFile(input);
    } else {
      const response = await fetch(input);
      if (!response.ok) {
        const body2 = await response.text();
        throw new Error(`Language.load failed with status ${response.status}.

${body2}`);
      }
      const retryResp = response.clone();
      try {
        binary2 = await WebAssembly.compileStreaming(response);
      } catch (reason) {
        console.error("wasm streaming compile failed:", reason);
        console.error("falling back to ArrayBuffer instantiation");
        binary2 = new Uint8Array(await retryResp.arrayBuffer());
      }
    }
    const mod = await C.loadWebAssemblyModule(binary2, { loadAsync: true });
    return _Language.loadFromWasmExports(mod, { sync: false });
  }
  static loadFromWasmExports(mod, { sync }) {
    const symbolNames = Object.keys(mod);
    const functionName2 = symbolNames.find((key) => LANGUAGE_FUNCTION_REGEX.test(key) && !key.includes("external_scanner_"));
    if (!functionName2) {
      console.log(`Couldn't find language function in Wasm file. Symbols:
${JSON.stringify(symbolNames, null, 2)}`);
      throw new Error(`Language.${sync ? "loadSync" : "load"} failed: no language function found in Wasm file`);
    }
    const languageAddress = mod[functionName2]();
    return new _Language(INTERNAL, languageAddress);
  }
  /**
   * Load a language synchronously from a pre-compiled WebAssembly module.
   * Use this when the host environment provides a `WebAssembly.Module` directly.
   */
  static loadSync(wasmModule) {
    const mod = C.loadWebAssemblyModule(wasmModule, { loadAsync: false });
    return _Language.loadFromWasmExports(mod, { sync: true });
  }
};
async function Module2(moduleArg = {}) {
  var moduleRtn;
  var Module = moduleArg;
  var ENVIRONMENT_IS_WEB = typeof window == "object";
  var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
  var ENVIRONMENT_IS_NODE = typeof process == "object" && process.versions?.node && process.type != "renderer";
  if (ENVIRONMENT_IS_NODE) {
    const { createRequire: createRequire4 } = await import("module");
    var require = createRequire4(import.meta.url);
  }
  Module.currentQueryProgressCallback = null;
  Module.currentProgressCallback = null;
  Module.currentLogCallback = null;
  Module.currentParseCallback = null;
  var arguments_ = [];
  var thisProgram = "./this.program";
  var quit_ = /* @__PURE__ */ __name((status, toThrow) => {
    throw toThrow;
  }, "quit_");
  var _scriptName = import.meta.url;
  var scriptDirectory = "";
  function locateFile(path) {
    if (Module["locateFile"]) {
      return Module["locateFile"](path, scriptDirectory);
    }
    return scriptDirectory + path;
  }
  __name(locateFile, "locateFile");
  var readAsync, readBinary;
  if (ENVIRONMENT_IS_NODE) {
    var fs = require("fs");
    if (_scriptName.startsWith("file:")) {
      scriptDirectory = require("path").dirname(require("url").fileURLToPath(_scriptName)) + "/";
    }
    readBinary = /* @__PURE__ */ __name((filename) => {
      filename = isFileURI(filename) ? new URL(filename) : filename;
      var ret = fs.readFileSync(filename);
      return ret;
    }, "readBinary");
    readAsync = /* @__PURE__ */ __name(async (filename, binary2 = true) => {
      filename = isFileURI(filename) ? new URL(filename) : filename;
      var ret = fs.readFileSync(filename, binary2 ? void 0 : "utf8");
      return ret;
    }, "readAsync");
    if (process.argv.length > 1) {
      thisProgram = process.argv[1].replace(/\\/g, "/");
    }
    arguments_ = process.argv.slice(2);
    quit_ = /* @__PURE__ */ __name((status, toThrow) => {
      process.exitCode = status;
      throw toThrow;
    }, "quit_");
  } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    try {
      scriptDirectory = new URL(".", _scriptName).href;
    } catch {
    }
    {
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = /* @__PURE__ */ __name((url) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.responseType = "arraybuffer";
          xhr.send(null);
          return new Uint8Array(
            /** @type{!ArrayBuffer} */
            xhr.response
          );
        }, "readBinary");
      }
      readAsync = /* @__PURE__ */ __name(async (url) => {
        if (isFileURI(url)) {
          return new Promise((resolve7, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
              if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                resolve7(xhr.response);
                return;
              }
              reject(xhr.status);
            };
            xhr.onerror = reject;
            xhr.send(null);
          });
        }
        var response = await fetch(url, {
          credentials: "same-origin"
        });
        if (response.ok) {
          return response.arrayBuffer();
        }
        throw new Error(response.status + " : " + response.url);
      }, "readAsync");
    }
  } else {
  }
  var out = console.log.bind(console);
  var err = console.error.bind(console);
  var dynamicLibraries = [];
  var wasmBinary;
  var ABORT = false;
  var EXITSTATUS;
  var isFileURI = /* @__PURE__ */ __name((filename) => filename.startsWith("file://"), "isFileURI");
  var readyPromiseResolve, readyPromiseReject;
  var wasmMemory;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  var HEAP64, HEAPU64;
  var HEAP_DATA_VIEW;
  var runtimeInitialized = false;
  function updateMemoryViews() {
    var b = wasmMemory.buffer;
    Module["HEAP8"] = HEAP8 = new Int8Array(b);
    Module["HEAP16"] = HEAP16 = new Int16Array(b);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
    Module["HEAP32"] = HEAP32 = new Int32Array(b);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
    Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
    Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b);
    Module["HEAP_DATA_VIEW"] = HEAP_DATA_VIEW = new DataView(b);
    LE_HEAP_UPDATE();
  }
  __name(updateMemoryViews, "updateMemoryViews");
  function initMemory() {
    if (Module["wasmMemory"]) {
      wasmMemory = Module["wasmMemory"];
    } else {
      var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 33554432;
      wasmMemory = new WebAssembly.Memory({
        "initial": INITIAL_MEMORY / 65536,
        // In theory we should not need to emit the maximum if we want "unlimited"
        // or 4GB of memory, but VMs error on that atm, see
        // https://github.com/emscripten-core/emscripten/issues/14130
        // And in the pthreads case we definitely need to emit a maximum. So
        // always emit one.
        "maximum": 32768
      });
    }
    updateMemoryViews();
  }
  __name(initMemory, "initMemory");
  var __RELOC_FUNCS__ = [];
  function preRun() {
    if (Module["preRun"]) {
      if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
      while (Module["preRun"].length) {
        addOnPreRun(Module["preRun"].shift());
      }
    }
    callRuntimeCallbacks(onPreRuns);
  }
  __name(preRun, "preRun");
  function initRuntime() {
    runtimeInitialized = true;
    callRuntimeCallbacks(__RELOC_FUNCS__);
    wasmExports["__wasm_call_ctors"]();
    callRuntimeCallbacks(onPostCtors);
  }
  __name(initRuntime, "initRuntime");
  function preMain() {
  }
  __name(preMain, "preMain");
  function postRun() {
    if (Module["postRun"]) {
      if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
      while (Module["postRun"].length) {
        addOnPostRun(Module["postRun"].shift());
      }
    }
    callRuntimeCallbacks(onPostRuns);
  }
  __name(postRun, "postRun");
  function abort(what) {
    Module["onAbort"]?.(what);
    what = "Aborted(" + what + ")";
    err(what);
    ABORT = true;
    what += ". Build with -sASSERTIONS for more info.";
    var e = new WebAssembly.RuntimeError(what);
    readyPromiseReject?.(e);
    throw e;
  }
  __name(abort, "abort");
  var wasmBinaryFile;
  function findWasmBinary() {
    if (Module["locateFile"]) {
      return locateFile("web-tree-sitter.wasm");
    }
    return new URL("web-tree-sitter.wasm", import.meta.url).href;
  }
  __name(findWasmBinary, "findWasmBinary");
  function getBinarySync(file) {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "both async and sync fetching of the wasm failed";
  }
  __name(getBinarySync, "getBinarySync");
  async function getWasmBinary(binaryFile) {
    if (!wasmBinary) {
      try {
        var response = await readAsync(binaryFile);
        return new Uint8Array(response);
      } catch {
      }
    }
    return getBinarySync(binaryFile);
  }
  __name(getWasmBinary, "getWasmBinary");
  async function instantiateArrayBuffer(binaryFile, imports) {
    try {
      var binary2 = await getWasmBinary(binaryFile);
      var instance2 = await WebAssembly.instantiate(binary2, imports);
      return instance2;
    } catch (reason) {
      err(`failed to asynchronously prepare wasm: ${reason}`);
      abort(reason);
    }
  }
  __name(instantiateArrayBuffer, "instantiateArrayBuffer");
  async function instantiateAsync(binary2, binaryFile, imports) {
    if (!binary2 && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
      try {
        var response = fetch(binaryFile, {
          credentials: "same-origin"
        });
        var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
        return instantiationResult;
      } catch (reason) {
        err(`wasm streaming compile failed: ${reason}`);
        err("falling back to ArrayBuffer instantiation");
      }
    }
    return instantiateArrayBuffer(binaryFile, imports);
  }
  __name(instantiateAsync, "instantiateAsync");
  function getWasmImports() {
    return {
      "env": wasmImports,
      "wasi_snapshot_preview1": wasmImports,
      "GOT.mem": new Proxy(wasmImports, GOTHandler),
      "GOT.func": new Proxy(wasmImports, GOTHandler)
    };
  }
  __name(getWasmImports, "getWasmImports");
  async function createWasm() {
    function receiveInstance(instance2, module2) {
      wasmExports = instance2.exports;
      wasmExports = relocateExports(wasmExports, 1024);
      var metadata2 = getDylinkMetadata(module2);
      if (metadata2.neededDynlibs) {
        dynamicLibraries = metadata2.neededDynlibs.concat(dynamicLibraries);
      }
      mergeLibSymbols(wasmExports, "main");
      LDSO.init();
      loadDylibs();
      __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"]);
      assignWasmExports(wasmExports);
      return wasmExports;
    }
    __name(receiveInstance, "receiveInstance");
    function receiveInstantiationResult(result2) {
      return receiveInstance(result2["instance"], result2["module"]);
    }
    __name(receiveInstantiationResult, "receiveInstantiationResult");
    var info2 = getWasmImports();
    if (Module["instantiateWasm"]) {
      return new Promise((resolve7, reject) => {
        Module["instantiateWasm"](info2, (mod, inst) => {
          resolve7(receiveInstance(mod, inst));
        });
      });
    }
    wasmBinaryFile ??= findWasmBinary();
    var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info2);
    var exports = receiveInstantiationResult(result);
    return exports;
  }
  __name(createWasm, "createWasm");
  class ExitStatus {
    static {
      __name(this, "ExitStatus");
    }
    name = "ExitStatus";
    constructor(status) {
      this.message = `Program terminated with exit(${status})`;
      this.status = status;
    }
  }
  var GOT = {};
  var currentModuleWeakSymbols = /* @__PURE__ */ new Set([]);
  var GOTHandler = {
    get(obj, symName) {
      var rtn = GOT[symName];
      if (!rtn) {
        rtn = GOT[symName] = new WebAssembly.Global({
          "value": "i32",
          "mutable": true
        });
      }
      if (!currentModuleWeakSymbols.has(symName)) {
        rtn.required = true;
      }
      return rtn;
    }
  };
  var LE_ATOMICS_NATIVE_BYTE_ORDER = [];
  var LE_HEAP_LOAD_F32 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getFloat32(byteOffset, true), "LE_HEAP_LOAD_F32");
  var LE_HEAP_LOAD_F64 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getFloat64(byteOffset, true), "LE_HEAP_LOAD_F64");
  var LE_HEAP_LOAD_I16 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getInt16(byteOffset, true), "LE_HEAP_LOAD_I16");
  var LE_HEAP_LOAD_I32 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getInt32(byteOffset, true), "LE_HEAP_LOAD_I32");
  var LE_HEAP_LOAD_I64 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getBigInt64(byteOffset, true), "LE_HEAP_LOAD_I64");
  var LE_HEAP_LOAD_U32 = /* @__PURE__ */ __name((byteOffset) => HEAP_DATA_VIEW.getUint32(byteOffset, true), "LE_HEAP_LOAD_U32");
  var LE_HEAP_STORE_F32 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setFloat32(byteOffset, value, true), "LE_HEAP_STORE_F32");
  var LE_HEAP_STORE_F64 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setFloat64(byteOffset, value, true), "LE_HEAP_STORE_F64");
  var LE_HEAP_STORE_I16 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setInt16(byteOffset, value, true), "LE_HEAP_STORE_I16");
  var LE_HEAP_STORE_I32 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setInt32(byteOffset, value, true), "LE_HEAP_STORE_I32");
  var LE_HEAP_STORE_I64 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setBigInt64(byteOffset, value, true), "LE_HEAP_STORE_I64");
  var LE_HEAP_STORE_U32 = /* @__PURE__ */ __name((byteOffset, value) => HEAP_DATA_VIEW.setUint32(byteOffset, value, true), "LE_HEAP_STORE_U32");
  var callRuntimeCallbacks = /* @__PURE__ */ __name((callbacks) => {
    while (callbacks.length > 0) {
      callbacks.shift()(Module);
    }
  }, "callRuntimeCallbacks");
  var onPostRuns = [];
  var addOnPostRun = /* @__PURE__ */ __name((cb) => onPostRuns.push(cb), "addOnPostRun");
  var onPreRuns = [];
  var addOnPreRun = /* @__PURE__ */ __name((cb) => onPreRuns.push(cb), "addOnPreRun");
  var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : void 0;
  var findStringEnd = /* @__PURE__ */ __name((heapOrArray, idx, maxBytesToRead, ignoreNul) => {
    var maxIdx = idx + maxBytesToRead;
    if (ignoreNul) return maxIdx;
    while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
    return idx;
  }, "findStringEnd");
  var UTF8ArrayToString = /* @__PURE__ */ __name((heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
    var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
      return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
    }
    var str = "";
    while (idx < endPtr) {
      var u0 = heapOrArray[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heapOrArray[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode((u0 & 31) << 6 | u1);
        continue;
      }
      var u2 = heapOrArray[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = (u0 & 15) << 12 | u1 << 6 | u2;
      } else {
        u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
      }
    }
    return str;
  }, "UTF8ArrayToString");
  var getDylinkMetadata = /* @__PURE__ */ __name((binary2) => {
    var offset = 0;
    var end = 0;
    function getU8() {
      return binary2[offset++];
    }
    __name(getU8, "getU8");
    function getLEB() {
      var ret = 0;
      var mul = 1;
      while (1) {
        var byte = binary2[offset++];
        ret += (byte & 127) * mul;
        mul *= 128;
        if (!(byte & 128)) break;
      }
      return ret;
    }
    __name(getLEB, "getLEB");
    function getString() {
      var len = getLEB();
      offset += len;
      return UTF8ArrayToString(binary2, offset - len, len);
    }
    __name(getString, "getString");
    function getStringList() {
      var count2 = getLEB();
      var rtn = [];
      while (count2--) rtn.push(getString());
      return rtn;
    }
    __name(getStringList, "getStringList");
    function failIf(condition, message) {
      if (condition) throw new Error(message);
    }
    __name(failIf, "failIf");
    if (binary2 instanceof WebAssembly.Module) {
      var dylinkSection = WebAssembly.Module.customSections(binary2, "dylink.0");
      failIf(dylinkSection.length === 0, "need dylink section");
      binary2 = new Uint8Array(dylinkSection[0]);
      end = binary2.length;
    } else {
      var int32View = new Uint32Array(new Uint8Array(binary2.subarray(0, 24)).buffer);
      var magicNumberFound = int32View[0] == 1836278016 || int32View[0] == 6386541;
      failIf(!magicNumberFound, "need to see wasm magic number");
      failIf(binary2[8] !== 0, "need the dylink section to be first");
      offset = 9;
      var section_size = getLEB();
      end = offset + section_size;
      var name2 = getString();
      failIf(name2 !== "dylink.0");
    }
    var customSection = {
      neededDynlibs: [],
      tlsExports: /* @__PURE__ */ new Set(),
      weakImports: /* @__PURE__ */ new Set(),
      runtimePaths: []
    };
    var WASM_DYLINK_MEM_INFO = 1;
    var WASM_DYLINK_NEEDED = 2;
    var WASM_DYLINK_EXPORT_INFO = 3;
    var WASM_DYLINK_IMPORT_INFO = 4;
    var WASM_DYLINK_RUNTIME_PATH = 5;
    var WASM_SYMBOL_TLS = 256;
    var WASM_SYMBOL_BINDING_MASK = 3;
    var WASM_SYMBOL_BINDING_WEAK = 1;
    while (offset < end) {
      var subsectionType = getU8();
      var subsectionSize = getLEB();
      if (subsectionType === WASM_DYLINK_MEM_INFO) {
        customSection.memorySize = getLEB();
        customSection.memoryAlign = getLEB();
        customSection.tableSize = getLEB();
        customSection.tableAlign = getLEB();
      } else if (subsectionType === WASM_DYLINK_NEEDED) {
        customSection.neededDynlibs = getStringList();
      } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
        var count = getLEB();
        while (count--) {
          var symname = getString();
          var flags2 = getLEB();
          if (flags2 & WASM_SYMBOL_TLS) {
            customSection.tlsExports.add(symname);
          }
        }
      } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
        var count = getLEB();
        while (count--) {
          var modname = getString();
          var symname = getString();
          var flags2 = getLEB();
          if ((flags2 & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
            customSection.weakImports.add(symname);
          }
        }
      } else if (subsectionType === WASM_DYLINK_RUNTIME_PATH) {
        customSection.runtimePaths = getStringList();
      } else {
        offset += subsectionSize;
      }
    }
    return customSection;
  }, "getDylinkMetadata");
  function getValue(ptr, type = "i8") {
    if (type.endsWith("*")) type = "*";
    switch (type) {
      case "i1":
        return HEAP8[ptr];
      case "i8":
        return HEAP8[ptr];
      case "i16":
        return LE_HEAP_LOAD_I16((ptr >> 1) * 2);
      case "i32":
        return LE_HEAP_LOAD_I32((ptr >> 2) * 4);
      case "i64":
        return LE_HEAP_LOAD_I64((ptr >> 3) * 8);
      case "float":
        return LE_HEAP_LOAD_F32((ptr >> 2) * 4);
      case "double":
        return LE_HEAP_LOAD_F64((ptr >> 3) * 8);
      case "*":
        return LE_HEAP_LOAD_U32((ptr >> 2) * 4);
      default:
        abort(`invalid type for getValue: ${type}`);
    }
  }
  __name(getValue, "getValue");
  var newDSO = /* @__PURE__ */ __name((name2, handle2, syms) => {
    var dso = {
      refcount: Infinity,
      name: name2,
      exports: syms,
      global: true
    };
    LDSO.loadedLibsByName[name2] = dso;
    if (handle2 != void 0) {
      LDSO.loadedLibsByHandle[handle2] = dso;
    }
    return dso;
  }, "newDSO");
  var LDSO = {
    loadedLibsByName: {},
    loadedLibsByHandle: {},
    init() {
      newDSO("__main__", 0, wasmImports);
    }
  };
  var ___heap_base = 82240;
  var alignMemory = /* @__PURE__ */ __name((size, alignment) => Math.ceil(size / alignment) * alignment, "alignMemory");
  var getMemory = /* @__PURE__ */ __name((size) => {
    if (runtimeInitialized) {
      return _calloc(size, 1);
    }
    var ret = ___heap_base;
    var end = ret + alignMemory(size, 16);
    ___heap_base = end;
    GOT["__heap_base"].value = end;
    return ret;
  }, "getMemory");
  var isInternalSym = /* @__PURE__ */ __name((symName) => ["__cpp_exception", "__c_longjmp", "__wasm_apply_data_relocs", "__dso_handle", "__tls_size", "__tls_align", "__set_stack_limits", "_emscripten_tls_init", "__wasm_init_tls", "__wasm_call_ctors", "__start_em_asm", "__stop_em_asm", "__start_em_js", "__stop_em_js"].includes(symName) || symName.startsWith("__em_js__"), "isInternalSym");
  var uleb128EncodeWithLen = /* @__PURE__ */ __name((arr) => {
    const n = arr.length;
    return [n % 128 | 128, n >> 7, ...arr];
  }, "uleb128EncodeWithLen");
  var wasmTypeCodes = {
    "i": 127,
    // i32
    "p": 127,
    // i32
    "j": 126,
    // i64
    "f": 125,
    // f32
    "d": 124,
    // f64
    "e": 111
  };
  var generateTypePack = /* @__PURE__ */ __name((types) => uleb128EncodeWithLen(Array.from(types, (type) => {
    var code3 = wasmTypeCodes[type];
    return code3;
  })), "generateTypePack");
  var convertJsFunctionToWasm = /* @__PURE__ */ __name((func2, sig) => {
    var bytes = Uint8Array.of(
      0,
      97,
      115,
      109,
      // magic ("\0asm")
      1,
      0,
      0,
      0,
      // version: 1
      1,
      ...uleb128EncodeWithLen([
        1,
        // count: 1
        96,
        // param types
        ...generateTypePack(sig.slice(1)),
        // return types (for now only supporting [] if `void` and single [T] otherwise)
        ...generateTypePack(sig[0] === "v" ? "" : sig[0])
      ]),
      // The rest of the module is static
      2,
      7,
      // import section
      // (import "e" "f" (func 0 (type 0)))
      1,
      1,
      101,
      1,
      102,
      0,
      0,
      7,
      5,
      // export section
      // (export "f" (func 0 (type 0)))
      1,
      1,
      102,
      0,
      0
    );
    var module2 = new WebAssembly.Module(bytes);
    var instance2 = new WebAssembly.Instance(module2, {
      "e": {
        "f": func2
      }
    });
    var wrappedFunc = instance2.exports["f"];
    return wrappedFunc;
  }, "convertJsFunctionToWasm");
  var wasmTableMirror = [];
  var wasmTable = new WebAssembly.Table({
    "initial": 31,
    "element": "anyfunc"
  });
  var getWasmTableEntry = /* @__PURE__ */ __name((funcPtr) => {
    var func2 = wasmTableMirror[funcPtr];
    if (!func2) {
      wasmTableMirror[funcPtr] = func2 = wasmTable.get(funcPtr);
    }
    return func2;
  }, "getWasmTableEntry");
  var updateTableMap = /* @__PURE__ */ __name((offset, count) => {
    if (functionsInTableMap) {
      for (var i2 = offset; i2 < offset + count; i2++) {
        var item = getWasmTableEntry(i2);
        if (item) {
          functionsInTableMap.set(item, i2);
        }
      }
    }
  }, "updateTableMap");
  var functionsInTableMap;
  var getFunctionAddress = /* @__PURE__ */ __name((func2) => {
    if (!functionsInTableMap) {
      functionsInTableMap = /* @__PURE__ */ new WeakMap();
      updateTableMap(0, wasmTable.length);
    }
    return functionsInTableMap.get(func2) || 0;
  }, "getFunctionAddress");
  var freeTableIndexes = [];
  var getEmptyTableSlot = /* @__PURE__ */ __name(() => {
    if (freeTableIndexes.length) {
      return freeTableIndexes.pop();
    }
    return wasmTable["grow"](1);
  }, "getEmptyTableSlot");
  var setWasmTableEntry = /* @__PURE__ */ __name((idx, func2) => {
    wasmTable.set(idx, func2);
    wasmTableMirror[idx] = wasmTable.get(idx);
  }, "setWasmTableEntry");
  var addFunction = /* @__PURE__ */ __name((func2, sig) => {
    var rtn = getFunctionAddress(func2);
    if (rtn) {
      return rtn;
    }
    var ret = getEmptyTableSlot();
    try {
      setWasmTableEntry(ret, func2);
    } catch (err2) {
      if (!(err2 instanceof TypeError)) {
        throw err2;
      }
      var wrapped = convertJsFunctionToWasm(func2, sig);
      setWasmTableEntry(ret, wrapped);
    }
    functionsInTableMap.set(func2, ret);
    return ret;
  }, "addFunction");
  var updateGOT = /* @__PURE__ */ __name((exports, replace) => {
    for (var symName in exports) {
      if (isInternalSym(symName)) {
        continue;
      }
      var value = exports[symName];
      GOT[symName] ||= new WebAssembly.Global({
        "value": "i32",
        "mutable": true
      });
      if (replace || GOT[symName].value == 0) {
        if (typeof value == "function") {
          GOT[symName].value = addFunction(value);
        } else if (typeof value == "number") {
          GOT[symName].value = value;
        } else {
          err(`unhandled export type for '${symName}': ${typeof value}`);
        }
      }
    }
  }, "updateGOT");
  var relocateExports = /* @__PURE__ */ __name((exports, memoryBase2, replace) => {
    var relocated = {};
    for (var e in exports) {
      var value = exports[e];
      if (typeof value == "object") {
        value = value.value;
      }
      if (typeof value == "number") {
        value += memoryBase2;
      }
      relocated[e] = value;
    }
    updateGOT(relocated, replace);
    return relocated;
  }, "relocateExports");
  var isSymbolDefined = /* @__PURE__ */ __name((symName) => {
    var existing = wasmImports[symName];
    if (!existing || existing.stub) {
      return false;
    }
    return true;
  }, "isSymbolDefined");
  var dynCall = /* @__PURE__ */ __name((sig, ptr, args2 = [], promising = false) => {
    var func2 = getWasmTableEntry(ptr);
    var rtn = func2(...args2);
    function convert(rtn2) {
      return rtn2;
    }
    __name(convert, "convert");
    return convert(rtn);
  }, "dynCall");
  var stackSave = /* @__PURE__ */ __name(() => _emscripten_stack_get_current(), "stackSave");
  var stackRestore = /* @__PURE__ */ __name((val) => __emscripten_stack_restore(val), "stackRestore");
  var createInvokeFunction = /* @__PURE__ */ __name((sig) => (ptr, ...args2) => {
    var sp = stackSave();
    try {
      return dynCall(sig, ptr, args2);
    } catch (e) {
      stackRestore(sp);
      if (e !== e + 0) throw e;
      _setThrew(1, 0);
      if (sig[0] == "j") return 0n;
    }
  }, "createInvokeFunction");
  var resolveGlobalSymbol = /* @__PURE__ */ __name((symName, direct = false) => {
    var sym;
    if (isSymbolDefined(symName)) {
      sym = wasmImports[symName];
    } else if (symName.startsWith("invoke_")) {
      sym = wasmImports[symName] = createInvokeFunction(symName.split("_")[1]);
    }
    return {
      sym,
      name: symName
    };
  }, "resolveGlobalSymbol");
  var onPostCtors = [];
  var addOnPostCtor = /* @__PURE__ */ __name((cb) => onPostCtors.push(cb), "addOnPostCtor");
  var UTF8ToString = /* @__PURE__ */ __name((ptr, maxBytesToRead, ignoreNul) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead, ignoreNul) : "", "UTF8ToString");
  var loadWebAssemblyModule = /* @__PURE__ */ __name((binary, flags, libName, localScope, handle) => {
    var metadata = getDylinkMetadata(binary);
    function loadModule() {
      var memAlign = Math.pow(2, metadata.memoryAlign);
      var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0;
      var tableBase = metadata.tableSize ? wasmTable.length : 0;
      if (handle) {
        HEAP8[handle + 8] = 1;
        LE_HEAP_STORE_U32((handle + 12 >> 2) * 4, memoryBase);
        LE_HEAP_STORE_I32((handle + 16 >> 2) * 4, metadata.memorySize);
        LE_HEAP_STORE_U32((handle + 20 >> 2) * 4, tableBase);
        LE_HEAP_STORE_I32((handle + 24 >> 2) * 4, metadata.tableSize);
      }
      if (metadata.tableSize) {
        wasmTable.grow(metadata.tableSize);
      }
      var moduleExports;
      function resolveSymbol(sym) {
        var resolved = resolveGlobalSymbol(sym).sym;
        if (!resolved && localScope) {
          resolved = localScope[sym];
        }
        if (!resolved) {
          resolved = moduleExports[sym];
        }
        return resolved;
      }
      __name(resolveSymbol, "resolveSymbol");
      var proxyHandler = {
        get(stubs, prop) {
          switch (prop) {
            case "__memory_base":
              return memoryBase;
            case "__table_base":
              return tableBase;
          }
          if (prop in wasmImports && !wasmImports[prop].stub) {
            var res = wasmImports[prop];
            return res;
          }
          if (!(prop in stubs)) {
            var resolved;
            stubs[prop] = (...args2) => {
              resolved ||= resolveSymbol(prop);
              return resolved(...args2);
            };
          }
          return stubs[prop];
        }
      };
      var proxy = new Proxy({}, proxyHandler);
      currentModuleWeakSymbols = metadata.weakImports;
      var info = {
        "GOT.mem": new Proxy({}, GOTHandler),
        "GOT.func": new Proxy({}, GOTHandler),
        "env": proxy,
        "wasi_snapshot_preview1": proxy
      };
      function postInstantiation(module, instance) {
        updateTableMap(tableBase, metadata.tableSize);
        moduleExports = relocateExports(instance.exports, memoryBase);
        if (!flags.allowUndefined) {
          reportUndefinedSymbols();
        }
        function addEmAsm(addr, body) {
          var args = [];
          var arity = 0;
          for (; arity < 16; arity++) {
            if (body.indexOf("$" + arity) != -1) {
              args.push("$" + arity);
            } else {
              break;
            }
          }
          args = args.join(",");
          var func = `(${args}) => { ${body} };`;
          ASM_CONSTS[start] = eval(func);
        }
        __name(addEmAsm, "addEmAsm");
        if ("__start_em_asm" in moduleExports) {
          var start = moduleExports["__start_em_asm"];
          var stop = moduleExports["__stop_em_asm"];
          while (start < stop) {
            var jsString = UTF8ToString(start);
            addEmAsm(start, jsString);
            start = HEAPU8.indexOf(0, start) + 1;
          }
        }
        function addEmJs(name, cSig, body) {
          var jsArgs = [];
          cSig = cSig.slice(1, -1);
          if (cSig != "void") {
            cSig = cSig.split(",");
            for (var i in cSig) {
              var jsArg = cSig[i].split(" ").pop();
              jsArgs.push(jsArg.replace("*", ""));
            }
          }
          var func = `(${jsArgs}) => ${body};`;
          moduleExports[name] = eval(func);
        }
        __name(addEmJs, "addEmJs");
        for (var name in moduleExports) {
          if (name.startsWith("__em_js__")) {
            var start = moduleExports[name];
            var jsString = UTF8ToString(start);
            var parts = jsString.split("<::>");
            addEmJs(name.replace("__em_js__", ""), parts[0], parts[1]);
            delete moduleExports[name];
          }
        }
        var applyRelocs = moduleExports["__wasm_apply_data_relocs"];
        if (applyRelocs) {
          if (runtimeInitialized) {
            applyRelocs();
          } else {
            __RELOC_FUNCS__.push(applyRelocs);
          }
        }
        var init = moduleExports["__wasm_call_ctors"];
        if (init) {
          if (runtimeInitialized) {
            init();
          } else {
            addOnPostCtor(init);
          }
        }
        return moduleExports;
      }
      __name(postInstantiation, "postInstantiation");
      if (flags.loadAsync) {
        return (async () => {
          var instance2;
          if (binary instanceof WebAssembly.Module) {
            instance2 = new WebAssembly.Instance(binary, info);
          } else {
            ({ module: binary, instance: instance2 } = await WebAssembly.instantiate(binary, info));
          }
          return postInstantiation(binary, instance2);
        })();
      }
      var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
      var instance = new WebAssembly.Instance(module, info);
      return postInstantiation(module, instance);
    }
    __name(loadModule, "loadModule");
    flags = {
      ...flags,
      rpath: {
        parentLibPath: libName,
        paths: metadata.runtimePaths
      }
    };
    if (flags.loadAsync) {
      return metadata.neededDynlibs.reduce((chain, dynNeeded) => chain.then(() => loadDynamicLibrary(dynNeeded, flags, localScope)), Promise.resolve()).then(loadModule);
    }
    metadata.neededDynlibs.forEach((needed) => loadDynamicLibrary(needed, flags, localScope));
    return loadModule();
  }, "loadWebAssemblyModule");
  var mergeLibSymbols = /* @__PURE__ */ __name((exports, libName2) => {
    for (var [sym, exp] of Object.entries(exports)) {
      const setImport = /* @__PURE__ */ __name((target) => {
        if (!isSymbolDefined(target)) {
          wasmImports[target] = exp;
        }
      }, "setImport");
      setImport(sym);
      const main_alias = "__main_argc_argv";
      if (sym == "main") {
        setImport(main_alias);
      }
      if (sym == main_alias) {
        setImport("main");
      }
    }
  }, "mergeLibSymbols");
  var asyncLoad = /* @__PURE__ */ __name(async (url) => {
    var arrayBuffer = await readAsync(url);
    return new Uint8Array(arrayBuffer);
  }, "asyncLoad");
  function loadDynamicLibrary(libName2, flags2 = {
    global: true,
    nodelete: true
  }, localScope2, handle2) {
    var dso = LDSO.loadedLibsByName[libName2];
    if (dso) {
      if (!flags2.global) {
        if (localScope2) {
          Object.assign(localScope2, dso.exports);
        }
      } else if (!dso.global) {
        dso.global = true;
        mergeLibSymbols(dso.exports, libName2);
      }
      if (flags2.nodelete && dso.refcount !== Infinity) {
        dso.refcount = Infinity;
      }
      dso.refcount++;
      if (handle2) {
        LDSO.loadedLibsByHandle[handle2] = dso;
      }
      return flags2.loadAsync ? Promise.resolve(true) : true;
    }
    dso = newDSO(libName2, handle2, "loading");
    dso.refcount = flags2.nodelete ? Infinity : 1;
    dso.global = flags2.global;
    function loadLibData() {
      if (handle2) {
        var data2 = LE_HEAP_LOAD_U32((handle2 + 28 >> 2) * 4);
        var dataSize = LE_HEAP_LOAD_U32((handle2 + 32 >> 2) * 4);
        if (data2 && dataSize) {
          var libData = HEAP8.slice(data2, data2 + dataSize);
          return flags2.loadAsync ? Promise.resolve(libData) : libData;
        }
      }
      var libFile = locateFile(libName2);
      if (flags2.loadAsync) {
        return asyncLoad(libFile);
      }
      if (!readBinary) {
        throw new Error(`${libFile}: file not found, and synchronous loading of external files is not available`);
      }
      return readBinary(libFile);
    }
    __name(loadLibData, "loadLibData");
    function getExports() {
      if (flags2.loadAsync) {
        return loadLibData().then((libData) => loadWebAssemblyModule(libData, flags2, libName2, localScope2, handle2));
      }
      return loadWebAssemblyModule(loadLibData(), flags2, libName2, localScope2, handle2);
    }
    __name(getExports, "getExports");
    function moduleLoaded(exports) {
      if (dso.global) {
        mergeLibSymbols(exports, libName2);
      } else if (localScope2) {
        Object.assign(localScope2, exports);
      }
      dso.exports = exports;
    }
    __name(moduleLoaded, "moduleLoaded");
    if (flags2.loadAsync) {
      return getExports().then((exports) => {
        moduleLoaded(exports);
        return true;
      });
    }
    moduleLoaded(getExports());
    return true;
  }
  __name(loadDynamicLibrary, "loadDynamicLibrary");
  var reportUndefinedSymbols = /* @__PURE__ */ __name(() => {
    for (var [symName, entry] of Object.entries(GOT)) {
      if (entry.value == 0) {
        var value = resolveGlobalSymbol(symName, true).sym;
        if (!value && !entry.required) {
          continue;
        }
        if (typeof value == "function") {
          entry.value = addFunction(value, value.sig);
        } else if (typeof value == "number") {
          entry.value = value;
        } else {
          throw new Error(`bad export type for '${symName}': ${typeof value}`);
        }
      }
    }
  }, "reportUndefinedSymbols");
  var runDependencies = 0;
  var dependenciesFulfilled = null;
  var removeRunDependency = /* @__PURE__ */ __name((id) => {
    runDependencies--;
    Module["monitorRunDependencies"]?.(runDependencies);
    if (runDependencies == 0) {
      if (dependenciesFulfilled) {
        var callback = dependenciesFulfilled;
        dependenciesFulfilled = null;
        callback();
      }
    }
  }, "removeRunDependency");
  var addRunDependency = /* @__PURE__ */ __name((id) => {
    runDependencies++;
    Module["monitorRunDependencies"]?.(runDependencies);
  }, "addRunDependency");
  var loadDylibs = /* @__PURE__ */ __name(async () => {
    if (!dynamicLibraries.length) {
      reportUndefinedSymbols();
      return;
    }
    addRunDependency("loadDylibs");
    for (var lib of dynamicLibraries) {
      await loadDynamicLibrary(lib, {
        loadAsync: true,
        global: true,
        nodelete: true,
        allowUndefined: true
      });
    }
    reportUndefinedSymbols();
    removeRunDependency("loadDylibs");
  }, "loadDylibs");
  var noExitRuntime = true;
  function setValue(ptr, value, type = "i8") {
    if (type.endsWith("*")) type = "*";
    switch (type) {
      case "i1":
        HEAP8[ptr] = value;
        break;
      case "i8":
        HEAP8[ptr] = value;
        break;
      case "i16":
        LE_HEAP_STORE_I16((ptr >> 1) * 2, value);
        break;
      case "i32":
        LE_HEAP_STORE_I32((ptr >> 2) * 4, value);
        break;
      case "i64":
        LE_HEAP_STORE_I64((ptr >> 3) * 8, BigInt(value));
        break;
      case "float":
        LE_HEAP_STORE_F32((ptr >> 2) * 4, value);
        break;
      case "double":
        LE_HEAP_STORE_F64((ptr >> 3) * 8, value);
        break;
      case "*":
        LE_HEAP_STORE_U32((ptr >> 2) * 4, value);
        break;
      default:
        abort(`invalid type for setValue: ${type}`);
    }
  }
  __name(setValue, "setValue");
  var ___memory_base = new WebAssembly.Global({
    "value": "i32",
    "mutable": false
  }, 1024);
  var ___stack_high = 82240;
  var ___stack_low = 16704;
  var ___stack_pointer = new WebAssembly.Global({
    "value": "i32",
    "mutable": true
  }, 82240);
  var ___table_base = new WebAssembly.Global({
    "value": "i32",
    "mutable": false
  }, 1);
  var __abort_js = /* @__PURE__ */ __name(() => abort(""), "__abort_js");
  __abort_js.sig = "v";
  var getHeapMax = /* @__PURE__ */ __name(() => (
    // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
    // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
    // for any code that deals with heap sizes, which would require special
    // casing all heap size related code to treat 0 specially.
    2147483648
  ), "getHeapMax");
  var growMemory = /* @__PURE__ */ __name((size) => {
    var oldHeapSize = wasmMemory.buffer.byteLength;
    var pages = (size - oldHeapSize + 65535) / 65536 | 0;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return 1;
    } catch (e) {
    }
  }, "growMemory");
  var _emscripten_resize_heap = /* @__PURE__ */ __name((requestedSize) => {
    var oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      return false;
    }
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
      var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
      var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
      var replacement = growMemory(newSize);
      if (replacement) {
        return true;
      }
    }
    return false;
  }, "_emscripten_resize_heap");
  _emscripten_resize_heap.sig = "ip";
  var _fd_close = /* @__PURE__ */ __name((fd) => 52, "_fd_close");
  _fd_close.sig = "ii";
  var INT53_MAX = 9007199254740992;
  var INT53_MIN = -9007199254740992;
  var bigintToI53Checked = /* @__PURE__ */ __name((num2) => num2 < INT53_MIN || num2 > INT53_MAX ? NaN : Number(num2), "bigintToI53Checked");
  function _fd_seek(fd, offset, whence, newOffset) {
    offset = bigintToI53Checked(offset);
    return 70;
  }
  __name(_fd_seek, "_fd_seek");
  _fd_seek.sig = "iijip";
  var printCharBuffers = [null, [], []];
  var printChar = /* @__PURE__ */ __name((stream, curr) => {
    var buffer = printCharBuffers[stream];
    if (curr === 0 || curr === 10) {
      (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
      buffer.length = 0;
    } else {
      buffer.push(curr);
    }
  }, "printChar");
  var _fd_write = /* @__PURE__ */ __name((fd, iov, iovcnt, pnum) => {
    var num2 = 0;
    for (var i2 = 0; i2 < iovcnt; i2++) {
      var ptr = LE_HEAP_LOAD_U32((iov >> 2) * 4);
      var len = LE_HEAP_LOAD_U32((iov + 4 >> 2) * 4);
      iov += 8;
      for (var j = 0; j < len; j++) {
        printChar(fd, HEAPU8[ptr + j]);
      }
      num2 += len;
    }
    LE_HEAP_STORE_U32((pnum >> 2) * 4, num2);
    return 0;
  }, "_fd_write");
  _fd_write.sig = "iippp";
  function _tree_sitter_log_callback(isLexMessage, messageAddress) {
    if (Module.currentLogCallback) {
      const message = UTF8ToString(messageAddress);
      Module.currentLogCallback(message, isLexMessage !== 0);
    }
  }
  __name(_tree_sitter_log_callback, "_tree_sitter_log_callback");
  function _tree_sitter_parse_callback(inputBufferAddress, index, row, column, lengthAddress) {
    const INPUT_BUFFER_SIZE = 10 * 1024;
    const string = Module.currentParseCallback(index, {
      row,
      column
    });
    if (typeof string === "string") {
      setValue(lengthAddress, string.length, "i32");
      stringToUTF16(string, inputBufferAddress, INPUT_BUFFER_SIZE);
    } else {
      setValue(lengthAddress, 0, "i32");
    }
  }
  __name(_tree_sitter_parse_callback, "_tree_sitter_parse_callback");
  function _tree_sitter_progress_callback(currentOffset, hasError) {
    if (Module.currentProgressCallback) {
      return Module.currentProgressCallback({
        currentOffset,
        hasError
      });
    }
    return false;
  }
  __name(_tree_sitter_progress_callback, "_tree_sitter_progress_callback");
  function _tree_sitter_query_progress_callback(currentOffset) {
    if (Module.currentQueryProgressCallback) {
      return Module.currentQueryProgressCallback({
        currentOffset
      });
    }
    return false;
  }
  __name(_tree_sitter_query_progress_callback, "_tree_sitter_query_progress_callback");
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = /* @__PURE__ */ __name(() => noExitRuntime || runtimeKeepaliveCounter > 0, "keepRuntimeAlive");
  var _proc_exit = /* @__PURE__ */ __name((code3) => {
    EXITSTATUS = code3;
    if (!keepRuntimeAlive()) {
      Module["onExit"]?.(code3);
      ABORT = true;
    }
    quit_(code3, new ExitStatus(code3));
  }, "_proc_exit");
  _proc_exit.sig = "vi";
  var exitJS = /* @__PURE__ */ __name((status, implicit) => {
    EXITSTATUS = status;
    _proc_exit(status);
  }, "exitJS");
  var handleException = /* @__PURE__ */ __name((e) => {
    if (e instanceof ExitStatus || e == "unwind") {
      return EXITSTATUS;
    }
    quit_(1, e);
  }, "handleException");
  var lengthBytesUTF8 = /* @__PURE__ */ __name((str) => {
    var len = 0;
    for (var i2 = 0; i2 < str.length; ++i2) {
      var c = str.charCodeAt(i2);
      if (c <= 127) {
        len++;
      } else if (c <= 2047) {
        len += 2;
      } else if (c >= 55296 && c <= 57343) {
        len += 4;
        ++i2;
      } else {
        len += 3;
      }
    }
    return len;
  }, "lengthBytesUTF8");
  var stringToUTF8Array = /* @__PURE__ */ __name((str, heap, outIdx, maxBytesToWrite) => {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i2 = 0; i2 < str.length; ++i2) {
      var u = str.codePointAt(i2);
      if (u <= 127) {
        if (outIdx >= endIdx) break;
        heap[outIdx++] = u;
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) break;
        heap[outIdx++] = 192 | u >> 6;
        heap[outIdx++] = 128 | u & 63;
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) break;
        heap[outIdx++] = 224 | u >> 12;
        heap[outIdx++] = 128 | u >> 6 & 63;
        heap[outIdx++] = 128 | u & 63;
      } else {
        if (outIdx + 3 >= endIdx) break;
        heap[outIdx++] = 240 | u >> 18;
        heap[outIdx++] = 128 | u >> 12 & 63;
        heap[outIdx++] = 128 | u >> 6 & 63;
        heap[outIdx++] = 128 | u & 63;
        i2++;
      }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
  }, "stringToUTF8Array");
  var stringToUTF8 = /* @__PURE__ */ __name((str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite), "stringToUTF8");
  var stackAlloc = /* @__PURE__ */ __name((sz) => __emscripten_stack_alloc(sz), "stackAlloc");
  var stringToUTF8OnStack = /* @__PURE__ */ __name((str) => {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8(str, ret, size);
    return ret;
  }, "stringToUTF8OnStack");
  var AsciiToString = /* @__PURE__ */ __name((ptr) => {
    var str = "";
    while (1) {
      var ch = HEAPU8[ptr++];
      if (!ch) return str;
      str += String.fromCharCode(ch);
    }
  }, "AsciiToString");
  var stringToUTF16 = /* @__PURE__ */ __name((str, outPtr, maxBytesToWrite) => {
    maxBytesToWrite ??= 2147483647;
    if (maxBytesToWrite < 2) return 0;
    maxBytesToWrite -= 2;
    var startPtr = outPtr;
    var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
    for (var i2 = 0; i2 < numCharsToWrite; ++i2) {
      var codeUnit = str.charCodeAt(i2);
      LE_HEAP_STORE_I16((outPtr >> 1) * 2, codeUnit);
      outPtr += 2;
    }
    LE_HEAP_STORE_I16((outPtr >> 1) * 2, 0);
    return outPtr - startPtr;
  }, "stringToUTF16");
  LE_ATOMICS_NATIVE_BYTE_ORDER = new Int8Array(new Int16Array([1]).buffer)[0] === 1 ? [
    /* little endian */
    ((x) => x),
    ((x) => x),
    void 0,
    ((x) => x)
  ] : [
    /* big endian */
    ((x) => x),
    ((x) => ((x & 65280) << 8 | (x & 255) << 24) >> 16),
    void 0,
    ((x) => x >> 24 & 255 | x >> 8 & 65280 | (x & 65280) << 8 | (x & 255) << 24)
  ];
  function LE_HEAP_UPDATE() {
    HEAPU16.unsigned = ((x) => x & 65535);
    HEAPU32.unsigned = ((x) => x >>> 0);
  }
  __name(LE_HEAP_UPDATE, "LE_HEAP_UPDATE");
  {
    initMemory();
    if (Module["noExitRuntime"]) noExitRuntime = Module["noExitRuntime"];
    if (Module["print"]) out = Module["print"];
    if (Module["printErr"]) err = Module["printErr"];
    if (Module["dynamicLibraries"]) dynamicLibraries = Module["dynamicLibraries"];
    if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
    if (Module["arguments"]) arguments_ = Module["arguments"];
    if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
    if (Module["preInit"]) {
      if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
      while (Module["preInit"].length > 0) {
        Module["preInit"].shift()();
      }
    }
  }
  Module["setValue"] = setValue;
  Module["getValue"] = getValue;
  Module["UTF8ToString"] = UTF8ToString;
  Module["stringToUTF8"] = stringToUTF8;
  Module["lengthBytesUTF8"] = lengthBytesUTF8;
  Module["AsciiToString"] = AsciiToString;
  Module["stringToUTF16"] = stringToUTF16;
  Module["loadWebAssemblyModule"] = loadWebAssemblyModule;
  Module["LE_HEAP_STORE_I64"] = LE_HEAP_STORE_I64;
  var ASM_CONSTS = {};
  var _malloc, _calloc, _realloc, _free, _ts_range_edit, _memcmp, _ts_language_symbol_count, _ts_language_state_count, _ts_language_abi_version, _ts_language_name, _ts_language_field_count, _ts_language_next_state, _ts_language_symbol_name, _ts_language_symbol_for_name, _strncmp, _ts_language_symbol_type, _ts_language_field_name_for_id, _ts_lookahead_iterator_new, _ts_lookahead_iterator_delete, _ts_lookahead_iterator_reset_state, _ts_lookahead_iterator_reset, _ts_lookahead_iterator_next, _ts_lookahead_iterator_current_symbol, _ts_point_edit, _ts_parser_delete, _ts_parser_reset, _ts_parser_set_language, _ts_parser_set_included_ranges, _ts_query_new, _ts_query_delete, _iswspace, _iswalnum, _ts_query_copy, _ts_query_pattern_count, _ts_query_capture_count, _ts_query_string_count, _ts_query_capture_name_for_id, _ts_query_capture_quantifier_for_id, _ts_query_string_value_for_id, _ts_query_predicates_for_pattern, _ts_query_start_byte_for_pattern, _ts_query_end_byte_for_pattern, _ts_query_is_pattern_rooted, _ts_query_is_pattern_non_local, _ts_query_is_pattern_guaranteed_at_step, _ts_query_disable_capture, _ts_query_disable_pattern, _ts_tree_copy, _ts_tree_delete, _ts_init, _ts_parser_new_wasm, _ts_parser_enable_logger_wasm, _ts_parser_parse_wasm, _ts_parser_included_ranges_wasm, _ts_language_type_is_named_wasm, _ts_language_type_is_visible_wasm, _ts_language_metadata_wasm, _ts_language_supertypes_wasm, _ts_language_subtypes_wasm, _ts_tree_root_node_wasm, _ts_tree_root_node_with_offset_wasm, _ts_tree_edit_wasm, _ts_tree_included_ranges_wasm, _ts_tree_get_changed_ranges_wasm, _ts_tree_cursor_new_wasm, _ts_tree_cursor_copy_wasm, _ts_tree_cursor_delete_wasm, _ts_tree_cursor_reset_wasm, _ts_tree_cursor_reset_to_wasm, _ts_tree_cursor_goto_first_child_wasm, _ts_tree_cursor_goto_last_child_wasm, _ts_tree_cursor_goto_first_child_for_index_wasm, _ts_tree_cursor_goto_first_child_for_position_wasm, _ts_tree_cursor_goto_next_sibling_wasm, _ts_tree_cursor_goto_previous_sibling_wasm, _ts_tree_cursor_goto_descendant_wasm, _ts_tree_cursor_goto_parent_wasm, _ts_tree_cursor_current_node_type_id_wasm, _ts_tree_cursor_current_node_state_id_wasm, _ts_tree_cursor_current_node_is_named_wasm, _ts_tree_cursor_current_node_is_missing_wasm, _ts_tree_cursor_current_node_id_wasm, _ts_tree_cursor_start_position_wasm, _ts_tree_cursor_end_position_wasm, _ts_tree_cursor_start_index_wasm, _ts_tree_cursor_end_index_wasm, _ts_tree_cursor_current_field_id_wasm, _ts_tree_cursor_current_depth_wasm, _ts_tree_cursor_current_descendant_index_wasm, _ts_tree_cursor_current_node_wasm, _ts_node_symbol_wasm, _ts_node_field_name_for_child_wasm, _ts_node_field_name_for_named_child_wasm, _ts_node_children_by_field_id_wasm, _ts_node_first_child_for_byte_wasm, _ts_node_first_named_child_for_byte_wasm, _ts_node_grammar_symbol_wasm, _ts_node_child_count_wasm, _ts_node_named_child_count_wasm, _ts_node_child_wasm, _ts_node_named_child_wasm, _ts_node_child_by_field_id_wasm, _ts_node_next_sibling_wasm, _ts_node_prev_sibling_wasm, _ts_node_next_named_sibling_wasm, _ts_node_prev_named_sibling_wasm, _ts_node_descendant_count_wasm, _ts_node_parent_wasm, _ts_node_child_with_descendant_wasm, _ts_node_descendant_for_index_wasm, _ts_node_named_descendant_for_index_wasm, _ts_node_descendant_for_position_wasm, _ts_node_named_descendant_for_position_wasm, _ts_node_start_point_wasm, _ts_node_end_point_wasm, _ts_node_start_index_wasm, _ts_node_end_index_wasm, _ts_node_to_string_wasm, _ts_node_children_wasm, _ts_node_named_children_wasm, _ts_node_descendants_of_type_wasm, _ts_node_is_named_wasm, _ts_node_has_changes_wasm, _ts_node_has_error_wasm, _ts_node_is_error_wasm, _ts_node_is_missing_wasm, _ts_node_is_extra_wasm, _ts_node_parse_state_wasm, _ts_node_next_parse_state_wasm, _ts_query_matches_wasm, _ts_query_captures_wasm, _memset, _memcpy, _memmove, _iswalpha, _iswblank, _iswdigit, _iswlower, _iswpunct, _iswupper, _iswxdigit, _memchr, _strlen, _strcmp, _strncat, _strncpy, _towlower, _towupper, _setThrew, __emscripten_stack_restore, __emscripten_stack_alloc, _emscripten_stack_get_current, ___wasm_apply_data_relocs;
  function assignWasmExports(wasmExports2) {
    Module["_malloc"] = _malloc = wasmExports2["malloc"];
    Module["_calloc"] = _calloc = wasmExports2["calloc"];
    Module["_realloc"] = _realloc = wasmExports2["realloc"];
    Module["_free"] = _free = wasmExports2["free"];
    Module["_ts_range_edit"] = _ts_range_edit = wasmExports2["ts_range_edit"];
    Module["_memcmp"] = _memcmp = wasmExports2["memcmp"];
    Module["_ts_language_symbol_count"] = _ts_language_symbol_count = wasmExports2["ts_language_symbol_count"];
    Module["_ts_language_state_count"] = _ts_language_state_count = wasmExports2["ts_language_state_count"];
    Module["_ts_language_abi_version"] = _ts_language_abi_version = wasmExports2["ts_language_abi_version"];
    Module["_ts_language_name"] = _ts_language_name = wasmExports2["ts_language_name"];
    Module["_ts_language_field_count"] = _ts_language_field_count = wasmExports2["ts_language_field_count"];
    Module["_ts_language_next_state"] = _ts_language_next_state = wasmExports2["ts_language_next_state"];
    Module["_ts_language_symbol_name"] = _ts_language_symbol_name = wasmExports2["ts_language_symbol_name"];
    Module["_ts_language_symbol_for_name"] = _ts_language_symbol_for_name = wasmExports2["ts_language_symbol_for_name"];
    Module["_strncmp"] = _strncmp = wasmExports2["strncmp"];
    Module["_ts_language_symbol_type"] = _ts_language_symbol_type = wasmExports2["ts_language_symbol_type"];
    Module["_ts_language_field_name_for_id"] = _ts_language_field_name_for_id = wasmExports2["ts_language_field_name_for_id"];
    Module["_ts_lookahead_iterator_new"] = _ts_lookahead_iterator_new = wasmExports2["ts_lookahead_iterator_new"];
    Module["_ts_lookahead_iterator_delete"] = _ts_lookahead_iterator_delete = wasmExports2["ts_lookahead_iterator_delete"];
    Module["_ts_lookahead_iterator_reset_state"] = _ts_lookahead_iterator_reset_state = wasmExports2["ts_lookahead_iterator_reset_state"];
    Module["_ts_lookahead_iterator_reset"] = _ts_lookahead_iterator_reset = wasmExports2["ts_lookahead_iterator_reset"];
    Module["_ts_lookahead_iterator_next"] = _ts_lookahead_iterator_next = wasmExports2["ts_lookahead_iterator_next"];
    Module["_ts_lookahead_iterator_current_symbol"] = _ts_lookahead_iterator_current_symbol = wasmExports2["ts_lookahead_iterator_current_symbol"];
    Module["_ts_point_edit"] = _ts_point_edit = wasmExports2["ts_point_edit"];
    Module["_ts_parser_delete"] = _ts_parser_delete = wasmExports2["ts_parser_delete"];
    Module["_ts_parser_reset"] = _ts_parser_reset = wasmExports2["ts_parser_reset"];
    Module["_ts_parser_set_language"] = _ts_parser_set_language = wasmExports2["ts_parser_set_language"];
    Module["_ts_parser_set_included_ranges"] = _ts_parser_set_included_ranges = wasmExports2["ts_parser_set_included_ranges"];
    Module["_ts_query_new"] = _ts_query_new = wasmExports2["ts_query_new"];
    Module["_ts_query_delete"] = _ts_query_delete = wasmExports2["ts_query_delete"];
    Module["_iswspace"] = _iswspace = wasmExports2["iswspace"];
    Module["_iswalnum"] = _iswalnum = wasmExports2["iswalnum"];
    Module["_ts_query_copy"] = _ts_query_copy = wasmExports2["ts_query_copy"];
    Module["_ts_query_pattern_count"] = _ts_query_pattern_count = wasmExports2["ts_query_pattern_count"];
    Module["_ts_query_capture_count"] = _ts_query_capture_count = wasmExports2["ts_query_capture_count"];
    Module["_ts_query_string_count"] = _ts_query_string_count = wasmExports2["ts_query_string_count"];
    Module["_ts_query_capture_name_for_id"] = _ts_query_capture_name_for_id = wasmExports2["ts_query_capture_name_for_id"];
    Module["_ts_query_capture_quantifier_for_id"] = _ts_query_capture_quantifier_for_id = wasmExports2["ts_query_capture_quantifier_for_id"];
    Module["_ts_query_string_value_for_id"] = _ts_query_string_value_for_id = wasmExports2["ts_query_string_value_for_id"];
    Module["_ts_query_predicates_for_pattern"] = _ts_query_predicates_for_pattern = wasmExports2["ts_query_predicates_for_pattern"];
    Module["_ts_query_start_byte_for_pattern"] = _ts_query_start_byte_for_pattern = wasmExports2["ts_query_start_byte_for_pattern"];
    Module["_ts_query_end_byte_for_pattern"] = _ts_query_end_byte_for_pattern = wasmExports2["ts_query_end_byte_for_pattern"];
    Module["_ts_query_is_pattern_rooted"] = _ts_query_is_pattern_rooted = wasmExports2["ts_query_is_pattern_rooted"];
    Module["_ts_query_is_pattern_non_local"] = _ts_query_is_pattern_non_local = wasmExports2["ts_query_is_pattern_non_local"];
    Module["_ts_query_is_pattern_guaranteed_at_step"] = _ts_query_is_pattern_guaranteed_at_step = wasmExports2["ts_query_is_pattern_guaranteed_at_step"];
    Module["_ts_query_disable_capture"] = _ts_query_disable_capture = wasmExports2["ts_query_disable_capture"];
    Module["_ts_query_disable_pattern"] = _ts_query_disable_pattern = wasmExports2["ts_query_disable_pattern"];
    Module["_ts_tree_copy"] = _ts_tree_copy = wasmExports2["ts_tree_copy"];
    Module["_ts_tree_delete"] = _ts_tree_delete = wasmExports2["ts_tree_delete"];
    Module["_ts_init"] = _ts_init = wasmExports2["ts_init"];
    Module["_ts_parser_new_wasm"] = _ts_parser_new_wasm = wasmExports2["ts_parser_new_wasm"];
    Module["_ts_parser_enable_logger_wasm"] = _ts_parser_enable_logger_wasm = wasmExports2["ts_parser_enable_logger_wasm"];
    Module["_ts_parser_parse_wasm"] = _ts_parser_parse_wasm = wasmExports2["ts_parser_parse_wasm"];
    Module["_ts_parser_included_ranges_wasm"] = _ts_parser_included_ranges_wasm = wasmExports2["ts_parser_included_ranges_wasm"];
    Module["_ts_language_type_is_named_wasm"] = _ts_language_type_is_named_wasm = wasmExports2["ts_language_type_is_named_wasm"];
    Module["_ts_language_type_is_visible_wasm"] = _ts_language_type_is_visible_wasm = wasmExports2["ts_language_type_is_visible_wasm"];
    Module["_ts_language_metadata_wasm"] = _ts_language_metadata_wasm = wasmExports2["ts_language_metadata_wasm"];
    Module["_ts_language_supertypes_wasm"] = _ts_language_supertypes_wasm = wasmExports2["ts_language_supertypes_wasm"];
    Module["_ts_language_subtypes_wasm"] = _ts_language_subtypes_wasm = wasmExports2["ts_language_subtypes_wasm"];
    Module["_ts_tree_root_node_wasm"] = _ts_tree_root_node_wasm = wasmExports2["ts_tree_root_node_wasm"];
    Module["_ts_tree_root_node_with_offset_wasm"] = _ts_tree_root_node_with_offset_wasm = wasmExports2["ts_tree_root_node_with_offset_wasm"];
    Module["_ts_tree_edit_wasm"] = _ts_tree_edit_wasm = wasmExports2["ts_tree_edit_wasm"];
    Module["_ts_tree_included_ranges_wasm"] = _ts_tree_included_ranges_wasm = wasmExports2["ts_tree_included_ranges_wasm"];
    Module["_ts_tree_get_changed_ranges_wasm"] = _ts_tree_get_changed_ranges_wasm = wasmExports2["ts_tree_get_changed_ranges_wasm"];
    Module["_ts_tree_cursor_new_wasm"] = _ts_tree_cursor_new_wasm = wasmExports2["ts_tree_cursor_new_wasm"];
    Module["_ts_tree_cursor_copy_wasm"] = _ts_tree_cursor_copy_wasm = wasmExports2["ts_tree_cursor_copy_wasm"];
    Module["_ts_tree_cursor_delete_wasm"] = _ts_tree_cursor_delete_wasm = wasmExports2["ts_tree_cursor_delete_wasm"];
    Module["_ts_tree_cursor_reset_wasm"] = _ts_tree_cursor_reset_wasm = wasmExports2["ts_tree_cursor_reset_wasm"];
    Module["_ts_tree_cursor_reset_to_wasm"] = _ts_tree_cursor_reset_to_wasm = wasmExports2["ts_tree_cursor_reset_to_wasm"];
    Module["_ts_tree_cursor_goto_first_child_wasm"] = _ts_tree_cursor_goto_first_child_wasm = wasmExports2["ts_tree_cursor_goto_first_child_wasm"];
    Module["_ts_tree_cursor_goto_last_child_wasm"] = _ts_tree_cursor_goto_last_child_wasm = wasmExports2["ts_tree_cursor_goto_last_child_wasm"];
    Module["_ts_tree_cursor_goto_first_child_for_index_wasm"] = _ts_tree_cursor_goto_first_child_for_index_wasm = wasmExports2["ts_tree_cursor_goto_first_child_for_index_wasm"];
    Module["_ts_tree_cursor_goto_first_child_for_position_wasm"] = _ts_tree_cursor_goto_first_child_for_position_wasm = wasmExports2["ts_tree_cursor_goto_first_child_for_position_wasm"];
    Module["_ts_tree_cursor_goto_next_sibling_wasm"] = _ts_tree_cursor_goto_next_sibling_wasm = wasmExports2["ts_tree_cursor_goto_next_sibling_wasm"];
    Module["_ts_tree_cursor_goto_previous_sibling_wasm"] = _ts_tree_cursor_goto_previous_sibling_wasm = wasmExports2["ts_tree_cursor_goto_previous_sibling_wasm"];
    Module["_ts_tree_cursor_goto_descendant_wasm"] = _ts_tree_cursor_goto_descendant_wasm = wasmExports2["ts_tree_cursor_goto_descendant_wasm"];
    Module["_ts_tree_cursor_goto_parent_wasm"] = _ts_tree_cursor_goto_parent_wasm = wasmExports2["ts_tree_cursor_goto_parent_wasm"];
    Module["_ts_tree_cursor_current_node_type_id_wasm"] = _ts_tree_cursor_current_node_type_id_wasm = wasmExports2["ts_tree_cursor_current_node_type_id_wasm"];
    Module["_ts_tree_cursor_current_node_state_id_wasm"] = _ts_tree_cursor_current_node_state_id_wasm = wasmExports2["ts_tree_cursor_current_node_state_id_wasm"];
    Module["_ts_tree_cursor_current_node_is_named_wasm"] = _ts_tree_cursor_current_node_is_named_wasm = wasmExports2["ts_tree_cursor_current_node_is_named_wasm"];
    Module["_ts_tree_cursor_current_node_is_missing_wasm"] = _ts_tree_cursor_current_node_is_missing_wasm = wasmExports2["ts_tree_cursor_current_node_is_missing_wasm"];
    Module["_ts_tree_cursor_current_node_id_wasm"] = _ts_tree_cursor_current_node_id_wasm = wasmExports2["ts_tree_cursor_current_node_id_wasm"];
    Module["_ts_tree_cursor_start_position_wasm"] = _ts_tree_cursor_start_position_wasm = wasmExports2["ts_tree_cursor_start_position_wasm"];
    Module["_ts_tree_cursor_end_position_wasm"] = _ts_tree_cursor_end_position_wasm = wasmExports2["ts_tree_cursor_end_position_wasm"];
    Module["_ts_tree_cursor_start_index_wasm"] = _ts_tree_cursor_start_index_wasm = wasmExports2["ts_tree_cursor_start_index_wasm"];
    Module["_ts_tree_cursor_end_index_wasm"] = _ts_tree_cursor_end_index_wasm = wasmExports2["ts_tree_cursor_end_index_wasm"];
    Module["_ts_tree_cursor_current_field_id_wasm"] = _ts_tree_cursor_current_field_id_wasm = wasmExports2["ts_tree_cursor_current_field_id_wasm"];
    Module["_ts_tree_cursor_current_depth_wasm"] = _ts_tree_cursor_current_depth_wasm = wasmExports2["ts_tree_cursor_current_depth_wasm"];
    Module["_ts_tree_cursor_current_descendant_index_wasm"] = _ts_tree_cursor_current_descendant_index_wasm = wasmExports2["ts_tree_cursor_current_descendant_index_wasm"];
    Module["_ts_tree_cursor_current_node_wasm"] = _ts_tree_cursor_current_node_wasm = wasmExports2["ts_tree_cursor_current_node_wasm"];
    Module["_ts_node_symbol_wasm"] = _ts_node_symbol_wasm = wasmExports2["ts_node_symbol_wasm"];
    Module["_ts_node_field_name_for_child_wasm"] = _ts_node_field_name_for_child_wasm = wasmExports2["ts_node_field_name_for_child_wasm"];
    Module["_ts_node_field_name_for_named_child_wasm"] = _ts_node_field_name_for_named_child_wasm = wasmExports2["ts_node_field_name_for_named_child_wasm"];
    Module["_ts_node_children_by_field_id_wasm"] = _ts_node_children_by_field_id_wasm = wasmExports2["ts_node_children_by_field_id_wasm"];
    Module["_ts_node_first_child_for_byte_wasm"] = _ts_node_first_child_for_byte_wasm = wasmExports2["ts_node_first_child_for_byte_wasm"];
    Module["_ts_node_first_named_child_for_byte_wasm"] = _ts_node_first_named_child_for_byte_wasm = wasmExports2["ts_node_first_named_child_for_byte_wasm"];
    Module["_ts_node_grammar_symbol_wasm"] = _ts_node_grammar_symbol_wasm = wasmExports2["ts_node_grammar_symbol_wasm"];
    Module["_ts_node_child_count_wasm"] = _ts_node_child_count_wasm = wasmExports2["ts_node_child_count_wasm"];
    Module["_ts_node_named_child_count_wasm"] = _ts_node_named_child_count_wasm = wasmExports2["ts_node_named_child_count_wasm"];
    Module["_ts_node_child_wasm"] = _ts_node_child_wasm = wasmExports2["ts_node_child_wasm"];
    Module["_ts_node_named_child_wasm"] = _ts_node_named_child_wasm = wasmExports2["ts_node_named_child_wasm"];
    Module["_ts_node_child_by_field_id_wasm"] = _ts_node_child_by_field_id_wasm = wasmExports2["ts_node_child_by_field_id_wasm"];
    Module["_ts_node_next_sibling_wasm"] = _ts_node_next_sibling_wasm = wasmExports2["ts_node_next_sibling_wasm"];
    Module["_ts_node_prev_sibling_wasm"] = _ts_node_prev_sibling_wasm = wasmExports2["ts_node_prev_sibling_wasm"];
    Module["_ts_node_next_named_sibling_wasm"] = _ts_node_next_named_sibling_wasm = wasmExports2["ts_node_next_named_sibling_wasm"];
    Module["_ts_node_prev_named_sibling_wasm"] = _ts_node_prev_named_sibling_wasm = wasmExports2["ts_node_prev_named_sibling_wasm"];
    Module["_ts_node_descendant_count_wasm"] = _ts_node_descendant_count_wasm = wasmExports2["ts_node_descendant_count_wasm"];
    Module["_ts_node_parent_wasm"] = _ts_node_parent_wasm = wasmExports2["ts_node_parent_wasm"];
    Module["_ts_node_child_with_descendant_wasm"] = _ts_node_child_with_descendant_wasm = wasmExports2["ts_node_child_with_descendant_wasm"];
    Module["_ts_node_descendant_for_index_wasm"] = _ts_node_descendant_for_index_wasm = wasmExports2["ts_node_descendant_for_index_wasm"];
    Module["_ts_node_named_descendant_for_index_wasm"] = _ts_node_named_descendant_for_index_wasm = wasmExports2["ts_node_named_descendant_for_index_wasm"];
    Module["_ts_node_descendant_for_position_wasm"] = _ts_node_descendant_for_position_wasm = wasmExports2["ts_node_descendant_for_position_wasm"];
    Module["_ts_node_named_descendant_for_position_wasm"] = _ts_node_named_descendant_for_position_wasm = wasmExports2["ts_node_named_descendant_for_position_wasm"];
    Module["_ts_node_start_point_wasm"] = _ts_node_start_point_wasm = wasmExports2["ts_node_start_point_wasm"];
    Module["_ts_node_end_point_wasm"] = _ts_node_end_point_wasm = wasmExports2["ts_node_end_point_wasm"];
    Module["_ts_node_start_index_wasm"] = _ts_node_start_index_wasm = wasmExports2["ts_node_start_index_wasm"];
    Module["_ts_node_end_index_wasm"] = _ts_node_end_index_wasm = wasmExports2["ts_node_end_index_wasm"];
    Module["_ts_node_to_string_wasm"] = _ts_node_to_string_wasm = wasmExports2["ts_node_to_string_wasm"];
    Module["_ts_node_children_wasm"] = _ts_node_children_wasm = wasmExports2["ts_node_children_wasm"];
    Module["_ts_node_named_children_wasm"] = _ts_node_named_children_wasm = wasmExports2["ts_node_named_children_wasm"];
    Module["_ts_node_descendants_of_type_wasm"] = _ts_node_descendants_of_type_wasm = wasmExports2["ts_node_descendants_of_type_wasm"];
    Module["_ts_node_is_named_wasm"] = _ts_node_is_named_wasm = wasmExports2["ts_node_is_named_wasm"];
    Module["_ts_node_has_changes_wasm"] = _ts_node_has_changes_wasm = wasmExports2["ts_node_has_changes_wasm"];
    Module["_ts_node_has_error_wasm"] = _ts_node_has_error_wasm = wasmExports2["ts_node_has_error_wasm"];
    Module["_ts_node_is_error_wasm"] = _ts_node_is_error_wasm = wasmExports2["ts_node_is_error_wasm"];
    Module["_ts_node_is_missing_wasm"] = _ts_node_is_missing_wasm = wasmExports2["ts_node_is_missing_wasm"];
    Module["_ts_node_is_extra_wasm"] = _ts_node_is_extra_wasm = wasmExports2["ts_node_is_extra_wasm"];
    Module["_ts_node_parse_state_wasm"] = _ts_node_parse_state_wasm = wasmExports2["ts_node_parse_state_wasm"];
    Module["_ts_node_next_parse_state_wasm"] = _ts_node_next_parse_state_wasm = wasmExports2["ts_node_next_parse_state_wasm"];
    Module["_ts_query_matches_wasm"] = _ts_query_matches_wasm = wasmExports2["ts_query_matches_wasm"];
    Module["_ts_query_captures_wasm"] = _ts_query_captures_wasm = wasmExports2["ts_query_captures_wasm"];
    Module["_memset"] = _memset = wasmExports2["memset"];
    Module["_memcpy"] = _memcpy = wasmExports2["memcpy"];
    Module["_memmove"] = _memmove = wasmExports2["memmove"];
    Module["_iswalpha"] = _iswalpha = wasmExports2["iswalpha"];
    Module["_iswblank"] = _iswblank = wasmExports2["iswblank"];
    Module["_iswdigit"] = _iswdigit = wasmExports2["iswdigit"];
    Module["_iswlower"] = _iswlower = wasmExports2["iswlower"];
    Module["_iswpunct"] = _iswpunct = wasmExports2["iswpunct"];
    Module["_iswupper"] = _iswupper = wasmExports2["iswupper"];
    Module["_iswxdigit"] = _iswxdigit = wasmExports2["iswxdigit"];
    Module["_memchr"] = _memchr = wasmExports2["memchr"];
    Module["_strlen"] = _strlen = wasmExports2["strlen"];
    Module["_strcmp"] = _strcmp = wasmExports2["strcmp"];
    Module["_strncat"] = _strncat = wasmExports2["strncat"];
    Module["_strncpy"] = _strncpy = wasmExports2["strncpy"];
    Module["_towlower"] = _towlower = wasmExports2["towlower"];
    Module["_towupper"] = _towupper = wasmExports2["towupper"];
    _setThrew = wasmExports2["setThrew"];
    __emscripten_stack_restore = wasmExports2["_emscripten_stack_restore"];
    __emscripten_stack_alloc = wasmExports2["_emscripten_stack_alloc"];
    _emscripten_stack_get_current = wasmExports2["emscripten_stack_get_current"];
    ___wasm_apply_data_relocs = wasmExports2["__wasm_apply_data_relocs"];
  }
  __name(assignWasmExports, "assignWasmExports");
  var wasmImports = {
    /** @export */
    __heap_base: ___heap_base,
    /** @export */
    __indirect_function_table: wasmTable,
    /** @export */
    __memory_base: ___memory_base,
    /** @export */
    __stack_high: ___stack_high,
    /** @export */
    __stack_low: ___stack_low,
    /** @export */
    __stack_pointer: ___stack_pointer,
    /** @export */
    __table_base: ___table_base,
    /** @export */
    _abort_js: __abort_js,
    /** @export */
    emscripten_resize_heap: _emscripten_resize_heap,
    /** @export */
    fd_close: _fd_close,
    /** @export */
    fd_seek: _fd_seek,
    /** @export */
    fd_write: _fd_write,
    /** @export */
    memory: wasmMemory,
    /** @export */
    tree_sitter_log_callback: _tree_sitter_log_callback,
    /** @export */
    tree_sitter_parse_callback: _tree_sitter_parse_callback,
    /** @export */
    tree_sitter_progress_callback: _tree_sitter_progress_callback,
    /** @export */
    tree_sitter_query_progress_callback: _tree_sitter_query_progress_callback
  };
  function callMain(args2 = []) {
    var entryFunction = resolveGlobalSymbol("main").sym;
    if (!entryFunction) return;
    args2.unshift(thisProgram);
    var argc = args2.length;
    var argv = stackAlloc((argc + 1) * 4);
    var argv_ptr = argv;
    args2.forEach((arg) => {
      LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, stringToUTF8OnStack(arg));
      argv_ptr += 4;
    });
    LE_HEAP_STORE_U32((argv_ptr >> 2) * 4, 0);
    try {
      var ret = entryFunction(argc, argv);
      exitJS(
        ret,
        /* implicit = */
        true
      );
      return ret;
    } catch (e) {
      return handleException(e);
    }
  }
  __name(callMain, "callMain");
  function run(args2 = arguments_) {
    if (runDependencies > 0) {
      dependenciesFulfilled = run;
      return;
    }
    preRun();
    if (runDependencies > 0) {
      dependenciesFulfilled = run;
      return;
    }
    function doRun() {
      Module["calledRun"] = true;
      if (ABORT) return;
      initRuntime();
      preMain();
      readyPromiseResolve?.(Module);
      Module["onRuntimeInitialized"]?.();
      var noInitialRun = Module["noInitialRun"] || false;
      if (!noInitialRun) callMain(args2);
      postRun();
    }
    __name(doRun, "doRun");
    if (Module["setStatus"]) {
      Module["setStatus"]("Running...");
      setTimeout(() => {
        setTimeout(() => Module["setStatus"](""), 1);
        doRun();
      }, 1);
    } else {
      doRun();
    }
  }
  __name(run, "run");
  var wasmExports;
  wasmExports = await createWasm();
  run();
  if (runtimeInitialized) {
    moduleRtn = Module;
  } else {
    moduleRtn = new Promise((resolve7, reject) => {
      readyPromiseResolve = resolve7;
      readyPromiseReject = reject;
    });
  }
  return moduleRtn;
}
__name(Module2, "Module");
var web_tree_sitter_default = Module2;
var Module3 = null;
async function initializeBinding(moduleOptions) {
  return Module3 ??= await web_tree_sitter_default(moduleOptions);
}
__name(initializeBinding, "initializeBinding");
function checkModule() {
  return !!Module3;
}
__name(checkModule, "checkModule");
var TRANSFER_BUFFER;
var LANGUAGE_VERSION;
var MIN_COMPATIBLE_VERSION;
var finalizer4 = newFinalizer((addresses) => {
  C._ts_parser_delete(addresses[0]);
  C._free(addresses[1]);
});
var Parser = class {
  static {
    __name(this, "Parser");
  }
  /** @internal */
  [0] = 0;
  // Internal handle for Wasm
  /** @internal */
  [1] = 0;
  // Internal handle for Wasm
  /** @internal */
  logCallback = null;
  /** The parser's current language. */
  language = null;
  /**
   * This must always be called before creating a Parser.
   *
   * You can optionally pass in options to configure the Wasm module, the most common
   * one being `locateFile` to help the module find the `.wasm` file.
   */
  static async init(moduleOptions) {
    setModule(await initializeBinding(moduleOptions));
    TRANSFER_BUFFER = C._ts_init();
    LANGUAGE_VERSION = C.getValue(TRANSFER_BUFFER, "i32");
    MIN_COMPATIBLE_VERSION = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
  }
  /**
   * Create a new parser.
   */
  constructor() {
    this.initialize();
    finalizer4?.register(this, [this[0], this[1]], this);
  }
  /** @internal */
  initialize() {
    if (!checkModule()) {
      throw new Error("cannot construct a Parser before calling `init()`");
    }
    C._ts_parser_new_wasm();
    this[0] = C.getValue(TRANSFER_BUFFER, "i32");
    this[1] = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
  }
  /** Delete the parser, freeing its resources. */
  delete() {
    finalizer4?.unregister(this);
    C._ts_parser_delete(this[0]);
    C._free(this[1]);
    this[0] = 0;
    this[1] = 0;
  }
  /**
   * Set the language that the parser should use for parsing.
   *
   * If the language was not successfully assigned, an error will be thrown.
   * This happens if the language was generated with an incompatible
   * version of the Tree-sitter CLI. Check the language's version using
   * {@link Language#version} and compare it to this library's
   * {@link LANGUAGE_VERSION} and {@link MIN_COMPATIBLE_VERSION} constants.
   */
  setLanguage(language) {
    let address;
    if (!language) {
      address = 0;
      this.language = null;
    } else if (language.constructor === Language) {
      address = language[0];
      const version = C._ts_language_abi_version(address);
      if (version < MIN_COMPATIBLE_VERSION || LANGUAGE_VERSION < version) {
        throw new Error(
          `Incompatible language version ${version}. Compatibility range ${MIN_COMPATIBLE_VERSION} through ${LANGUAGE_VERSION}.`
        );
      }
      this.language = language;
    } else {
      throw new Error("Argument must be a Language");
    }
    C._ts_parser_set_language(this[0], address);
    return this;
  }
  /**
   * Parse a slice of UTF8 text.
   *
   * @param {string | ParseCallback} callback - The UTF8-encoded text to parse or a callback function.
   *
   * @param {Tree | null} [oldTree] - A previous syntax tree parsed from the same document. If the text of the
   *   document has changed since `oldTree` was created, then you must edit `oldTree` to match
   *   the new text using {@link Tree#edit}.
   *
   * @param {ParseOptions} [options] - Options for parsing the text.
   *  This can be used to set the included ranges, or a progress callback.
   *
   * @returns {Tree | null} A {@link Tree} if parsing succeeded, or `null` if:
   *  - The parser has not yet had a language assigned with {@link Parser#setLanguage}.
   *  - The progress callback returned true.
   */
  parse(callback, oldTree, options) {
    if (typeof callback === "string") {
      C.currentParseCallback = (index) => callback.slice(index);
    } else if (typeof callback === "function") {
      C.currentParseCallback = callback;
    } else {
      throw new Error("Argument must be a string or a function");
    }
    if (options?.progressCallback) {
      C.currentProgressCallback = options.progressCallback;
    } else {
      C.currentProgressCallback = null;
    }
    if (this.logCallback) {
      C.currentLogCallback = this.logCallback;
      C._ts_parser_enable_logger_wasm(this[0], 1);
    } else {
      C.currentLogCallback = null;
      C._ts_parser_enable_logger_wasm(this[0], 0);
    }
    let rangeCount = 0;
    let rangeAddress = 0;
    if (options?.includedRanges) {
      rangeCount = options.includedRanges.length;
      rangeAddress = C._calloc(rangeCount, SIZE_OF_RANGE);
      let address = rangeAddress;
      for (let i2 = 0; i2 < rangeCount; i2++) {
        marshalRange(address, options.includedRanges[i2]);
        address += SIZE_OF_RANGE;
      }
    }
    const treeAddress = C._ts_parser_parse_wasm(
      this[0],
      this[1],
      oldTree ? oldTree[0] : 0,
      rangeAddress,
      rangeCount
    );
    if (!treeAddress) {
      C.currentParseCallback = null;
      C.currentLogCallback = null;
      C.currentProgressCallback = null;
      return null;
    }
    if (!this.language) {
      throw new Error("Parser must have a language to parse");
    }
    const result = new Tree(INTERNAL, treeAddress, this.language, C.currentParseCallback);
    C.currentParseCallback = null;
    C.currentLogCallback = null;
    C.currentProgressCallback = null;
    return result;
  }
  /**
   * Instruct the parser to start the next parse from the beginning.
   *
   * If the parser previously failed because of a callback, 
   * then by default, it will resume where it left off on the
   * next call to {@link Parser#parse} or other parsing functions.
   * If you don't want to resume, and instead intend to use this parser to
   * parse some other document, you must call `reset` first.
   */
  reset() {
    C._ts_parser_reset(this[0]);
  }
  /** Get the ranges of text that the parser will include when parsing. */
  getIncludedRanges() {
    C._ts_parser_included_ranges_wasm(this[0]);
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const buffer = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const result = new Array(count);
    if (count > 0) {
      let address = buffer;
      for (let i2 = 0; i2 < count; i2++) {
        result[i2] = unmarshalRange(address);
        address += SIZE_OF_RANGE;
      }
      C._free(buffer);
    }
    return result;
  }
  /** Set the logging callback that a parser should use during parsing. */
  setLogger(callback) {
    if (!callback) {
      this.logCallback = null;
    } else if (typeof callback !== "function") {
      throw new Error("Logger callback must be a function");
    } else {
      this.logCallback = callback;
    }
    return this;
  }
  /** Get the parser's current logger. */
  getLogger() {
    return this.logCallback;
  }
};
var PREDICATE_STEP_TYPE_CAPTURE = 1;
var PREDICATE_STEP_TYPE_STRING = 2;
var QUERY_WORD_REGEX = /[\w-]+/g;
var CaptureQuantifier = {
  Zero: 0,
  ZeroOrOne: 1,
  ZeroOrMore: 2,
  One: 3,
  OneOrMore: 4
};
var isCaptureStep = /* @__PURE__ */ __name((step) => step.type === "capture", "isCaptureStep");
var isStringStep = /* @__PURE__ */ __name((step) => step.type === "string", "isStringStep");
var QueryErrorKind = {
  Syntax: 1,
  NodeName: 2,
  FieldName: 3,
  CaptureName: 4,
  PatternStructure: 5
};
var QueryError = class _QueryError extends Error {
  constructor(kind, info2, index, length) {
    super(_QueryError.formatMessage(kind, info2));
    this.kind = kind;
    this.info = info2;
    this.index = index;
    this.length = length;
    this.name = "QueryError";
  }
  kind;
  info;
  index;
  length;
  static {
    __name(this, "QueryError");
  }
  /** Formats an error message based on the error kind and info */
  static formatMessage(kind, info2) {
    switch (kind) {
      case QueryErrorKind.NodeName:
        return `Bad node name '${info2.word}'`;
      case QueryErrorKind.FieldName:
        return `Bad field name '${info2.word}'`;
      case QueryErrorKind.CaptureName:
        return `Bad capture name @${info2.word}`;
      case QueryErrorKind.PatternStructure:
        return `Bad pattern structure at offset ${info2.suffix}`;
      case QueryErrorKind.Syntax:
        return `Bad syntax at offset ${info2.suffix}`;
    }
  }
};
function parseAnyPredicate(steps, index, operator, textPredicates) {
  if (steps.length !== 3) {
    throw new Error(
      `Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}`
    );
  }
  if (!isCaptureStep(steps[1])) {
    throw new Error(
      `First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}"`
    );
  }
  const isPositive = operator === "eq?" || operator === "any-eq?";
  const matchAll = !operator.startsWith("any-");
  if (isCaptureStep(steps[2])) {
    const captureName1 = steps[1].name;
    const captureName2 = steps[2].name;
    textPredicates[index].push((captures) => {
      const nodes1 = [];
      const nodes2 = [];
      for (const c of captures) {
        if (c.name === captureName1) nodes1.push(c.node);
        if (c.name === captureName2) nodes2.push(c.node);
      }
      const compare = /* @__PURE__ */ __name((n1, n2, positive) => {
        return positive ? n1.text === n2.text : n1.text !== n2.text;
      }, "compare");
      return matchAll ? nodes1.every((n1) => nodes2.some((n2) => compare(n1, n2, isPositive))) : nodes1.some((n1) => nodes2.some((n2) => compare(n1, n2, isPositive)));
    });
  } else {
    const captureName = steps[1].name;
    const stringValue2 = steps[2].value;
    const matches = /* @__PURE__ */ __name((n) => n.text === stringValue2, "matches");
    const doesNotMatch = /* @__PURE__ */ __name((n) => n.text !== stringValue2, "doesNotMatch");
    textPredicates[index].push((captures) => {
      const nodes = [];
      for (const c of captures) {
        if (c.name === captureName) nodes.push(c.node);
      }
      const test = isPositive ? matches : doesNotMatch;
      return matchAll ? nodes.every(test) : nodes.some(test);
    });
  }
}
__name(parseAnyPredicate, "parseAnyPredicate");
function parseMatchPredicate(steps, index, operator, textPredicates) {
  if (steps.length !== 3) {
    throw new Error(
      `Wrong number of arguments to \`#${operator}\` predicate. Expected 2, got ${steps.length - 1}.`
    );
  }
  if (steps[1].type !== "capture") {
    throw new Error(
      `First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`
    );
  }
  if (steps[2].type !== "string") {
    throw new Error(
      `Second argument of \`#${operator}\` predicate must be a string. Got @${steps[2].name}.`
    );
  }
  const isPositive = operator === "match?" || operator === "any-match?";
  const matchAll = !operator.startsWith("any-");
  const captureName = steps[1].name;
  const regex = new RegExp(steps[2].value);
  textPredicates[index].push((captures) => {
    const nodes = [];
    for (const c of captures) {
      if (c.name === captureName) nodes.push(c.node.text);
    }
    const test = /* @__PURE__ */ __name((text, positive) => {
      return positive ? regex.test(text) : !regex.test(text);
    }, "test");
    if (nodes.length === 0) return !isPositive;
    return matchAll ? nodes.every((text) => test(text, isPositive)) : nodes.some((text) => test(text, isPositive));
  });
}
__name(parseMatchPredicate, "parseMatchPredicate");
function parseAnyOfPredicate(steps, index, operator, textPredicates) {
  if (steps.length < 2) {
    throw new Error(
      `Wrong number of arguments to \`#${operator}\` predicate. Expected at least 1. Got ${steps.length - 1}.`
    );
  }
  if (steps[1].type !== "capture") {
    throw new Error(
      `First argument of \`#${operator}\` predicate must be a capture. Got "${steps[1].value}".`
    );
  }
  const isPositive = operator === "any-of?";
  const captureName = steps[1].name;
  const stringSteps = steps.slice(2);
  if (!stringSteps.every(isStringStep)) {
    throw new Error(
      `Arguments to \`#${operator}\` predicate must be strings.".`
    );
  }
  const values = stringSteps.map((s) => s.value);
  textPredicates[index].push((captures) => {
    const nodes = [];
    for (const c of captures) {
      if (c.name === captureName) nodes.push(c.node.text);
    }
    if (nodes.length === 0) return !isPositive;
    return nodes.every((text) => values.includes(text)) === isPositive;
  });
}
__name(parseAnyOfPredicate, "parseAnyOfPredicate");
function parseIsPredicate(steps, index, operator, assertedProperties, refutedProperties) {
  if (steps.length < 2 || steps.length > 3) {
    throw new Error(
      `Wrong number of arguments to \`#${operator}\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`
    );
  }
  if (!steps.every(isStringStep)) {
    throw new Error(
      `Arguments to \`#${operator}\` predicate must be strings.".`
    );
  }
  const properties = operator === "is?" ? assertedProperties : refutedProperties;
  if (!properties[index]) properties[index] = {};
  properties[index][steps[1].value] = steps[2]?.value ?? null;
}
__name(parseIsPredicate, "parseIsPredicate");
function parseSetDirective(steps, index, setProperties) {
  if (steps.length < 2 || steps.length > 3) {
    throw new Error(`Wrong number of arguments to \`#set!\` predicate. Expected 1 or 2. Got ${steps.length - 1}.`);
  }
  if (!steps.every(isStringStep)) {
    throw new Error(`Arguments to \`#set!\` predicate must be strings.".`);
  }
  if (!setProperties[index]) setProperties[index] = {};
  setProperties[index][steps[1].value] = steps[2]?.value ?? null;
}
__name(parseSetDirective, "parseSetDirective");
function parsePattern(index, stepType, stepValueId, captureNames, stringValues, steps, textPredicates, predicates, setProperties, assertedProperties, refutedProperties) {
  if (stepType === PREDICATE_STEP_TYPE_CAPTURE) {
    const name2 = captureNames[stepValueId];
    steps.push({ type: "capture", name: name2 });
  } else if (stepType === PREDICATE_STEP_TYPE_STRING) {
    steps.push({ type: "string", value: stringValues[stepValueId] });
  } else if (steps.length > 0) {
    if (steps[0].type !== "string") {
      throw new Error("Predicates must begin with a literal value");
    }
    const operator = steps[0].value;
    switch (operator) {
      case "any-not-eq?":
      case "not-eq?":
      case "any-eq?":
      case "eq?":
        parseAnyPredicate(steps, index, operator, textPredicates);
        break;
      case "any-not-match?":
      case "not-match?":
      case "any-match?":
      case "match?":
        parseMatchPredicate(steps, index, operator, textPredicates);
        break;
      case "not-any-of?":
      case "any-of?":
        parseAnyOfPredicate(steps, index, operator, textPredicates);
        break;
      case "is?":
      case "is-not?":
        parseIsPredicate(steps, index, operator, assertedProperties, refutedProperties);
        break;
      case "set!":
        parseSetDirective(steps, index, setProperties);
        break;
      default:
        predicates[index].push({ operator, operands: steps.slice(1) });
    }
    steps.length = 0;
  }
}
__name(parsePattern, "parsePattern");
var finalizer5 = newFinalizer((address) => {
  C._ts_query_delete(address);
});
var Query = class {
  static {
    __name(this, "Query");
  }
  /** @internal */
  [0] = 0;
  // Internal handle for Wasm
  /** @internal */
  exceededMatchLimit;
  /** @internal */
  textPredicates;
  /** The names of the captures used in the query. */
  captureNames;
  /** The quantifiers of the captures used in the query. */
  captureQuantifiers;
  /**
   * The other user-defined predicates associated with the given index.
   *
   * This includes predicates with operators other than:
   * - `match?`
   * - `eq?` and `not-eq?`
   * - `any-of?` and `not-any-of?`
   * - `is?` and `is-not?`
   * - `set!`
   */
  predicates;
  /** The properties for predicates with the operator `set!`. */
  setProperties;
  /** The properties for predicates with the operator `is?`. */
  assertedProperties;
  /** The properties for predicates with the operator `is-not?`. */
  refutedProperties;
  /** The maximum number of in-progress matches for this cursor. */
  matchLimit;
  /**
   * Create a new query from a string containing one or more S-expression
   * patterns.
   *
   * The query is associated with a particular language, and can only be run
   * on syntax nodes parsed with that language. References to Queries can be
   * shared between multiple threads.
   *
   * @link {@see https://tree-sitter.github.io/tree-sitter/using-parsers/queries}
   */
  constructor(language, source) {
    const sourceLength = C.lengthBytesUTF8(source);
    const sourceAddress = C._malloc(sourceLength + 1);
    C.stringToUTF8(source, sourceAddress, sourceLength + 1);
    const address = C._ts_query_new(
      language[0],
      sourceAddress,
      sourceLength,
      TRANSFER_BUFFER,
      TRANSFER_BUFFER + SIZE_OF_INT
    );
    if (!address) {
      const errorId = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
      const errorByte = C.getValue(TRANSFER_BUFFER, "i32");
      const errorIndex = C.UTF8ToString(sourceAddress, errorByte).length;
      const suffix = source.slice(errorIndex, errorIndex + 100).split("\n")[0];
      const word = suffix.match(QUERY_WORD_REGEX)?.[0] ?? "";
      C._free(sourceAddress);
      switch (errorId) {
        case QueryErrorKind.Syntax:
          throw new QueryError(QueryErrorKind.Syntax, { suffix: `${errorIndex}: '${suffix}'...` }, errorIndex, 0);
        case QueryErrorKind.NodeName:
          throw new QueryError(errorId, { word }, errorIndex, word.length);
        case QueryErrorKind.FieldName:
          throw new QueryError(errorId, { word }, errorIndex, word.length);
        case QueryErrorKind.CaptureName:
          throw new QueryError(errorId, { word }, errorIndex, word.length);
        case QueryErrorKind.PatternStructure:
          throw new QueryError(errorId, { suffix: `${errorIndex}: '${suffix}'...` }, errorIndex, 0);
      }
    }
    const stringCount = C._ts_query_string_count(address);
    const captureCount = C._ts_query_capture_count(address);
    const patternCount = C._ts_query_pattern_count(address);
    const captureNames = new Array(captureCount);
    const captureQuantifiers = new Array(patternCount);
    const stringValues = new Array(stringCount);
    for (let i2 = 0; i2 < captureCount; i2++) {
      const nameAddress = C._ts_query_capture_name_for_id(
        address,
        i2,
        TRANSFER_BUFFER
      );
      const nameLength = C.getValue(TRANSFER_BUFFER, "i32");
      captureNames[i2] = C.UTF8ToString(nameAddress, nameLength);
    }
    for (let i2 = 0; i2 < patternCount; i2++) {
      const captureQuantifiersArray = new Array(captureCount);
      for (let j = 0; j < captureCount; j++) {
        const quantifier = C._ts_query_capture_quantifier_for_id(address, i2, j);
        captureQuantifiersArray[j] = quantifier;
      }
      captureQuantifiers[i2] = captureQuantifiersArray;
    }
    for (let i2 = 0; i2 < stringCount; i2++) {
      const valueAddress = C._ts_query_string_value_for_id(
        address,
        i2,
        TRANSFER_BUFFER
      );
      const nameLength = C.getValue(TRANSFER_BUFFER, "i32");
      stringValues[i2] = C.UTF8ToString(valueAddress, nameLength);
    }
    const setProperties = new Array(patternCount);
    const assertedProperties = new Array(patternCount);
    const refutedProperties = new Array(patternCount);
    const predicates = new Array(patternCount);
    const textPredicates = new Array(patternCount);
    for (let i2 = 0; i2 < patternCount; i2++) {
      const predicatesAddress = C._ts_query_predicates_for_pattern(address, i2, TRANSFER_BUFFER);
      const stepCount = C.getValue(TRANSFER_BUFFER, "i32");
      predicates[i2] = [];
      textPredicates[i2] = [];
      const steps = new Array();
      let stepAddress = predicatesAddress;
      for (let j = 0; j < stepCount; j++) {
        const stepType = C.getValue(stepAddress, "i32");
        stepAddress += SIZE_OF_INT;
        const stepValueId = C.getValue(stepAddress, "i32");
        stepAddress += SIZE_OF_INT;
        parsePattern(
          i2,
          stepType,
          stepValueId,
          captureNames,
          stringValues,
          steps,
          textPredicates,
          predicates,
          setProperties,
          assertedProperties,
          refutedProperties
        );
      }
      Object.freeze(textPredicates[i2]);
      Object.freeze(predicates[i2]);
      Object.freeze(setProperties[i2]);
      Object.freeze(assertedProperties[i2]);
      Object.freeze(refutedProperties[i2]);
    }
    C._free(sourceAddress);
    this[0] = address;
    this.captureNames = captureNames;
    this.captureQuantifiers = captureQuantifiers;
    this.textPredicates = textPredicates;
    this.predicates = predicates;
    this.setProperties = setProperties;
    this.assertedProperties = assertedProperties;
    this.refutedProperties = refutedProperties;
    this.exceededMatchLimit = false;
    finalizer5?.register(this, address, this);
  }
  /** Delete the query, freeing its resources. */
  delete() {
    finalizer5?.unregister(this);
    C._ts_query_delete(this[0]);
    this[0] = 0;
  }
  /**
   * Iterate over all of the matches in the order that they were found.
   *
   * Each match contains the index of the pattern that matched, and a list of
   * captures. Because multiple patterns can match the same set of nodes,
   * one match may contain captures that appear *before* some of the
   * captures from a previous match.
   *
   * @param {Node} node - The node to execute the query on.
   *
   * @param {QueryOptions} options - Options for query execution.
   */
  matches(node, options = {}) {
    const startPosition = options.startPosition ?? ZERO_POINT;
    const endPosition = options.endPosition ?? ZERO_POINT;
    const startIndex = options.startIndex ?? 0;
    const endIndex = options.endIndex ?? 0;
    const startContainingPosition = options.startContainingPosition ?? ZERO_POINT;
    const endContainingPosition = options.endContainingPosition ?? ZERO_POINT;
    const startContainingIndex = options.startContainingIndex ?? 0;
    const endContainingIndex = options.endContainingIndex ?? 0;
    const matchLimit = options.matchLimit ?? 4294967295;
    const maxStartDepth = options.maxStartDepth ?? 4294967295;
    const progressCallback = options.progressCallback;
    if (typeof matchLimit !== "number") {
      throw new Error("Arguments must be numbers");
    }
    this.matchLimit = matchLimit;
    if (endIndex !== 0 && startIndex > endIndex) {
      throw new Error("`startIndex` cannot be greater than `endIndex`");
    }
    if (endPosition !== ZERO_POINT && (startPosition.row > endPosition.row || startPosition.row === endPosition.row && startPosition.column > endPosition.column)) {
      throw new Error("`startPosition` cannot be greater than `endPosition`");
    }
    if (endContainingIndex !== 0 && startContainingIndex > endContainingIndex) {
      throw new Error("`startContainingIndex` cannot be greater than `endContainingIndex`");
    }
    if (endContainingPosition !== ZERO_POINT && (startContainingPosition.row > endContainingPosition.row || startContainingPosition.row === endContainingPosition.row && startContainingPosition.column > endContainingPosition.column)) {
      throw new Error("`startContainingPosition` cannot be greater than `endContainingPosition`");
    }
    if (progressCallback) {
      C.currentQueryProgressCallback = progressCallback;
    }
    marshalNode(node);
    C._ts_query_matches_wasm(
      this[0],
      node.tree[0],
      startPosition.row,
      startPosition.column,
      endPosition.row,
      endPosition.column,
      startIndex,
      endIndex,
      startContainingPosition.row,
      startContainingPosition.column,
      endContainingPosition.row,
      endContainingPosition.column,
      startContainingIndex,
      endContainingIndex,
      matchLimit,
      maxStartDepth
    );
    const rawCount = C.getValue(TRANSFER_BUFFER, "i32");
    const startAddress = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const didExceedMatchLimit = C.getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
    const result = new Array(rawCount);
    this.exceededMatchLimit = Boolean(didExceedMatchLimit);
    let filteredCount = 0;
    let address = startAddress;
    for (let i2 = 0; i2 < rawCount; i2++) {
      const patternIndex = C.getValue(address, "i32");
      address += SIZE_OF_INT;
      const captureCount = C.getValue(address, "i32");
      address += SIZE_OF_INT;
      const captures = new Array(captureCount);
      address = unmarshalCaptures(this, node.tree, address, patternIndex, captures);
      if (this.textPredicates[patternIndex].every((p) => p(captures))) {
        result[filteredCount] = { patternIndex, captures };
        const setProperties = this.setProperties[patternIndex];
        result[filteredCount].setProperties = setProperties;
        const assertedProperties = this.assertedProperties[patternIndex];
        result[filteredCount].assertedProperties = assertedProperties;
        const refutedProperties = this.refutedProperties[patternIndex];
        result[filteredCount].refutedProperties = refutedProperties;
        filteredCount++;
      }
    }
    result.length = filteredCount;
    C._free(startAddress);
    C.currentQueryProgressCallback = null;
    return result;
  }
  /**
   * Iterate over all of the individual captures in the order that they
   * appear.
   *
   * This is useful if you don't care about which pattern matched, and just
   * want a single, ordered sequence of captures.
   *
   * @param {Node} node - The node to execute the query on.
   *
   * @param {QueryOptions} options - Options for query execution.
   */
  captures(node, options = {}) {
    const startPosition = options.startPosition ?? ZERO_POINT;
    const endPosition = options.endPosition ?? ZERO_POINT;
    const startIndex = options.startIndex ?? 0;
    const endIndex = options.endIndex ?? 0;
    const startContainingPosition = options.startContainingPosition ?? ZERO_POINT;
    const endContainingPosition = options.endContainingPosition ?? ZERO_POINT;
    const startContainingIndex = options.startContainingIndex ?? 0;
    const endContainingIndex = options.endContainingIndex ?? 0;
    const matchLimit = options.matchLimit ?? 4294967295;
    const maxStartDepth = options.maxStartDepth ?? 4294967295;
    const progressCallback = options.progressCallback;
    if (typeof matchLimit !== "number") {
      throw new Error("Arguments must be numbers");
    }
    this.matchLimit = matchLimit;
    if (endIndex !== 0 && startIndex > endIndex) {
      throw new Error("`startIndex` cannot be greater than `endIndex`");
    }
    if (endPosition !== ZERO_POINT && (startPosition.row > endPosition.row || startPosition.row === endPosition.row && startPosition.column > endPosition.column)) {
      throw new Error("`startPosition` cannot be greater than `endPosition`");
    }
    if (endContainingIndex !== 0 && startContainingIndex > endContainingIndex) {
      throw new Error("`startContainingIndex` cannot be greater than `endContainingIndex`");
    }
    if (endContainingPosition !== ZERO_POINT && (startContainingPosition.row > endContainingPosition.row || startContainingPosition.row === endContainingPosition.row && startContainingPosition.column > endContainingPosition.column)) {
      throw new Error("`startContainingPosition` cannot be greater than `endContainingPosition`");
    }
    if (progressCallback) {
      C.currentQueryProgressCallback = progressCallback;
    }
    marshalNode(node);
    C._ts_query_captures_wasm(
      this[0],
      node.tree[0],
      startPosition.row,
      startPosition.column,
      endPosition.row,
      endPosition.column,
      startIndex,
      endIndex,
      startContainingPosition.row,
      startContainingPosition.column,
      endContainingPosition.row,
      endContainingPosition.column,
      startContainingIndex,
      endContainingIndex,
      matchLimit,
      maxStartDepth
    );
    const count = C.getValue(TRANSFER_BUFFER, "i32");
    const startAddress = C.getValue(TRANSFER_BUFFER + SIZE_OF_INT, "i32");
    const didExceedMatchLimit = C.getValue(TRANSFER_BUFFER + 2 * SIZE_OF_INT, "i32");
    const result = new Array();
    this.exceededMatchLimit = Boolean(didExceedMatchLimit);
    const captures = new Array();
    let address = startAddress;
    for (let i2 = 0; i2 < count; i2++) {
      const patternIndex = C.getValue(address, "i32");
      address += SIZE_OF_INT;
      const captureCount = C.getValue(address, "i32");
      address += SIZE_OF_INT;
      const captureIndex = C.getValue(address, "i32");
      address += SIZE_OF_INT;
      captures.length = captureCount;
      address = unmarshalCaptures(this, node.tree, address, patternIndex, captures);
      if (this.textPredicates[patternIndex].every((p) => p(captures))) {
        const capture = captures[captureIndex];
        const setProperties = this.setProperties[patternIndex];
        capture.setProperties = setProperties;
        const assertedProperties = this.assertedProperties[patternIndex];
        capture.assertedProperties = assertedProperties;
        const refutedProperties = this.refutedProperties[patternIndex];
        capture.refutedProperties = refutedProperties;
        result.push(capture);
      }
    }
    C._free(startAddress);
    C.currentQueryProgressCallback = null;
    return result;
  }
  /** Get the predicates for a given pattern. */
  predicatesForPattern(patternIndex) {
    return this.predicates[patternIndex];
  }
  /**
   * Disable a certain capture within a query.
   *
   * This prevents the capture from being returned in matches, and also
   * avoids any resource usage associated with recording the capture.
   */
  disableCapture(captureName) {
    const captureNameLength = C.lengthBytesUTF8(captureName);
    const captureNameAddress = C._malloc(captureNameLength + 1);
    C.stringToUTF8(captureName, captureNameAddress, captureNameLength + 1);
    C._ts_query_disable_capture(this[0], captureNameAddress, captureNameLength);
    C._free(captureNameAddress);
  }
  /**
   * Disable a certain pattern within a query.
   *
   * This prevents the pattern from matching, and also avoids any resource
   * usage associated with the pattern. This throws an error if the pattern
   * index is out of bounds.
   */
  disablePattern(patternIndex) {
    if (patternIndex >= this.predicates.length) {
      throw new Error(
        `Pattern index is ${patternIndex} but the pattern count is ${this.predicates.length}`
      );
    }
    C._ts_query_disable_pattern(this[0], patternIndex);
  }
  /**
   * Check if, on its last execution, this cursor exceeded its maximum number
   * of in-progress matches.
   */
  didExceedMatchLimit() {
    return this.exceededMatchLimit;
  }
  /** Get the byte offset where the given pattern starts in the query's source. */
  startIndexForPattern(patternIndex) {
    if (patternIndex >= this.predicates.length) {
      throw new Error(
        `Pattern index is ${patternIndex} but the pattern count is ${this.predicates.length}`
      );
    }
    return C._ts_query_start_byte_for_pattern(this[0], patternIndex);
  }
  /** Get the byte offset where the given pattern ends in the query's source. */
  endIndexForPattern(patternIndex) {
    if (patternIndex >= this.predicates.length) {
      throw new Error(
        `Pattern index is ${patternIndex} but the pattern count is ${this.predicates.length}`
      );
    }
    return C._ts_query_end_byte_for_pattern(this[0], patternIndex);
  }
  /** Get the number of patterns in the query. */
  patternCount() {
    return C._ts_query_pattern_count(this[0]);
  }
  /** Get the index for a given capture name. */
  captureIndexForName(captureName) {
    return this.captureNames.indexOf(captureName);
  }
  /** Check if a given pattern within a query has a single root node. */
  isPatternRooted(patternIndex) {
    return C._ts_query_is_pattern_rooted(this[0], patternIndex) === 1;
  }
  /** Check if a given pattern within a query has a single root node. */
  isPatternNonLocal(patternIndex) {
    return C._ts_query_is_pattern_non_local(this[0], patternIndex) === 1;
  }
  /**
   * Check if a given step in a query is 'definite'.
   *
   * A query step is 'definite' if its parent pattern will be guaranteed to
   * match successfully once it reaches the step.
   */
  isPatternGuaranteedAtStep(byteIndex) {
    return C._ts_query_is_pattern_guaranteed_at_step(this[0], byteIndex) === 1;
  }
};

// ../engine/src/spans/python.ts
var parser = null;
var loading = null;
function initPython() {
  loading ??= (async () => {
    const require4 = createRequire(import.meta.url);
    await Parser.init();
    const lang = await Language.load(__jiffyPath(new URL("./tree-sitter-python.wasm", import.meta.url)));
    parser = new Parser().setLanguage(lang);
  })();
  return loading;
}
function parsePython(source) {
  if (!parser) throw new Error("Python parser not initialised: await initParsers() first");
  return parser.parse(source);
}
var moduleName = (n) => n.text.replace(/\s+/g, "");
function pyImportBindings(n) {
  const out2 = [];
  if (n.type === "import_statement") {
    for (const c of n.childrenForFieldName("name")) {
      if (!c) continue;
      if (c.type === "aliased_import") {
        const spec = moduleName(c.childForFieldName("name"));
        out2.push({ local: c.childForFieldName("alias").text, spec, imported: "*" });
      } else {
        const spec = moduleName(c);
        out2.push({ local: spec.split(".")[0], spec, imported: "*", packages: true });
      }
    }
  } else if (n.type === "import_from_statement") {
    const spec = moduleName(n.childForFieldName("module_name"));
    if (n.namedChildren.some((c) => c?.type === "wildcard_import"))
      out2.push({ local: "*", spec, imported: "*" });
    for (const c of n.childrenForFieldName("name")) {
      if (!c) continue;
      const name2 = c.type === "aliased_import" ? c.childForFieldName("name") : c;
      const local = c.type === "aliased_import" ? c.childForFieldName("alias").text : name2.text;
      out2.push({ local, spec, imported: moduleName(name2), maybeSubmodule: true });
    }
  }
  return out2;
}
var lastLine = (n) => n.endPosition.column === 0 && n.endPosition.row > n.startPosition.row ? n.endPosition.row : n.endPosition.row + 1;
var isTypeChecking = (n) => !!n && (n.type === "identifier" && n.text === "TYPE_CHECKING" || n.type === "attribute" && n.childForFieldName("attribute")?.text === "TYPE_CHECKING");
var isOverload = (dec) => {
  const e = dec.namedChildren[0];
  return !!e && (e.type === "identifier" && e.text === "overload" || e.type === "attribute" && e.childForFieldName("attribute")?.text === "overload");
};
function stringStatement(n) {
  if (n.type !== "expression_statement" || n.namedChildCount !== 1) return null;
  const s = n.namedChildren[0];
  const plain2 = (x) => x.type === "string" && !x.namedChildren.some((c) => c?.type === "interpolation");
  if (plain2(s)) return s;
  if (s.type === "concatenated_string" && s.namedChildren.every((c) => !!c && plain2(c))) return s;
  return null;
}
function firstErrorLine(root) {
  const c = root.walk();
  try {
    for (; ; ) {
      const n = c.currentNode;
      if (n.isError || n.isMissing) return n.startPosition.row + 1;
      if (n.hasError && c.gotoFirstChild()) continue;
      while (!c.gotoNextSibling()) if (!c.gotoParent()) return root.startPosition.row + 1;
    }
  } finally {
    c.delete();
  }
}
function pySpans(_path, source) {
  const tree = parsePython(source);
  if (!tree) return { ok: false, error: { message: "tree-sitter returned no tree" } };
  try {
    const root = tree.rootNode;
    if (root.hasError)
      return { ok: false, error: { message: `syntax error at line ${firstErrorLine(root)}` } };
    const functions = [];
    const typeRanges = [];
    const importRanges = [];
    const inertNodes = /* @__PURE__ */ new Set();
    const bindings = /* @__PURE__ */ new Map();
    const visit = (n, prefix, inFunction, topLevel) => {
      let first = n.type === "module" || n.type === "block";
      for (const c of n.namedChildren) {
        if (!c) continue;
        const t = c.type;
        if (t === "comment" || t === "string" || t === "concatenated_string") continue;
        const docstring = first;
        first = false;
        const s = stringStatement(c);
        if (s) {
          if (!(docstring && s.text.includes(">>>"))) inertNodes.add(c.id);
          continue;
        }
        if (topLevel && (t === "import_statement" || t === "import_from_statement")) {
          importRanges.push([c.startPosition.row + 1, lastLine(c)]);
          for (const b of pyImportBindings(c))
            if (!b.packages && b.local !== "*") bindings.set(b.local, `${b.spec}#${b.imported}`);
        }
        if (inFunction && t === "expression_statement" && c.namedChildCount === 1) {
          const a = c.namedChildren[0];
          if (a.type === "assignment" && a.childForFieldName("type") && !a.childForFieldName("right")) {
            typeRanges.push([c.startPosition.row + 1, lastLine(c)]);
            continue;
          }
        }
        if (t === "if_statement" && isTypeChecking(c.childForFieldName("condition"))) {
          const body2 = c.childForFieldName("consequence");
          if (body2 && body2.startPosition.row > c.startPosition.row)
            typeRanges.push([body2.startPosition.row + 1, lastLine(body2)]);
          visit(c, prefix, inFunction, false);
          continue;
        }
        let def = c;
        if (t === "decorated_definition") {
          def = c.childForFieldName("definition");
          if (def.type === "function_definition" && c.namedChildren.some((d) => d?.type === "decorator" && isOverload(d)))
            typeRanges.push([c.startPosition.row + 1, lastLine(c)]);
        }
        if (def.type === "function_definition") {
          const q = prefix + def.childForFieldName("name").text;
          const body2 = def.childForFieldName("body");
          const colon = body2.previousSibling;
          const shared = !!colon && colon.type === ":" && colon.endPosition.row === body2.startPosition.row;
          const start2 = body2.startPosition.row + (shared ? 2 : 1);
          const end = lastLine(def);
          if (start2 <= end) functions.push({ name: q, start: start2, end });
          visit(body2, `${q}.<locals>.`, true, false);
        } else if (def.type === "class_definition") {
          const q = prefix + def.childForFieldName("name").text;
          visit(def.childForFieldName("body"), `${q}.`, false, false);
        } else if (def === c && c.namedChildCount) {
          visit(c, prefix, inFunction, false);
        }
      }
    };
    visit(root, "", false, true);
    const lineCount = source.split("\n").length;
    const code3 = new Uint8Array(lineCount + 2);
    const cur = root.walk();
    try {
      let down = true;
      for (; ; ) {
        if (down) {
          const n = cur.currentNode;
          if (n.type !== "comment" && !inertNodes.has(n.id)) {
            if (n.childCount === 0) {
              for (let r = n.startPosition.row; r <= n.endPosition.row; r++) code3[r + 1] = 1;
            } else if (cur.gotoFirstChild()) continue;
          }
        }
        if (cur.gotoNextSibling()) down = true;
        else if (cur.gotoParent()) down = false;
        else break;
      }
    } finally {
      cur.delete();
    }
    const blankLines = /* @__PURE__ */ new Set();
    for (let l = 1; l <= lineCount; l++) if (!code3[l]) blankLines.add(l);
    const spans = { functions, typeRanges, importRanges, bindings, blankLines, lineCount };
    return { ok: true, spans };
  } finally {
    tree.delete();
  }
}
var pythonParser = {
  language: "python",
  extensions: [".py"],
  ready: () => parser !== null,
  parse: pySpans
};

// ../engine/src/refs/python.ts
var lastLine2 = (n) => n.endPosition.column === 0 && n.endPosition.row > n.startPosition.row ? n.endPosition.row : n.endPosition.row + 1;
var PURE_DECORATORS = /^(field_validator|model_validator|field_serializer|model_serializer|computed_field|validator|root_validator|overload|typing\.overload|typing_extensions\.overload|dataclass|dataclasses\.dataclass|property|staticmethod|classmethod|abstractmethod|abc\.abstractmethod|final|typing\.final|override|typing_extensions\.override|runtime_checkable|typing\.runtime_checkable|total_ordering|functools\.\w+|cache|lru_cache|cached_property|wraps|deprecated|typing_extensions\.deprecated|contextmanager|contextlib\.\w+|asynccontextmanager)(\(|$)/;
var DYNAMIC_SCOPE = /* @__PURE__ */ new Set(["globals", "locals", "vars", "exec", "eval"]);
var PURE_CALLS = new Set(
  "TypeVar ParamSpec TypeVarTuple NewType namedtuple NamedTuple TypedDict cast frozenset set dict list tuple str int float bool bytes object range sorted len min max sum any all zip enumerate isinstance Path pathlib.Path PurePath field dataclasses.field Field ConfigDict SettingsConfigDict TypeAdapter PrivateAttr SkipValidation pydantic.Field pydantic.ConfigDict pydantic.TypeAdapter ContextVar contextvars.ContextVar Lock RLock Event threading.Lock threading.RLock threading.Event threading.local Decimal decimal.Decimal timedelta timezone partial functools.partial re.compile compile Enum IntEnum StrEnum enum.Enum Literal Annotated Optional Union ClassVar Final getLogger logging.getLogger os.getenv os.environ.get os.getcwd os.cpu_count json.loads json.dumps defaultdict OrderedDict Counter deque collections.namedtuple collections.defaultdict collections.OrderedDict collections.Counter collections.deque uuid.uuid4 uuid.UUID time.time time.monotonic weakref.WeakSet weakref.WeakValueDictionary weakref.WeakKeyDictionary weakref.ref ipaddress.ip_network ipaddress.ip_address ipaddress.IPv4Network ipaddress.IPv6Network operator.itemgetter operator.attrgetter operator.methodcaller itemgetter attrgetter methodcaller".split(" ")
);
var PURE_PREFIXES = [
  "os.path.",
  "typing.",
  "typing_extensions.",
  "itertools.",
  "math.",
  "datetime.",
  "pytest.mark."
];
var REGISTERING_BASES = /^(models\.Model|db\.Model|DeclarativeBase)$/;
var LOADERS = /* @__PURE__ */ new Set(["import_module", "__import__"]);
var FRESH = /* @__PURE__ */ new Set([
  "dictionary",
  "list",
  "set",
  "tuple",
  "string",
  "concatenated_string",
  "integer",
  "float",
  "true",
  "false",
  "none",
  "lambda",
  "list_comprehension",
  "dictionary_comprehension",
  "set_comprehension"
]);
function targetNames(t, names2, roots) {
  if (!t) return;
  switch (t.type) {
    case "identifier":
      names2.push(t.text);
      return;
    case "pattern_list":
    case "tuple_pattern":
    case "list_pattern":
    case "parenthesized_expression":
    case "list_splat_pattern":
      for (const c of t.namedChildren) targetNames(c, names2, roots);
      return;
    case "attribute":
    case "subscript": {
      let cur = t;
      while (cur && (cur.type === "attribute" || cur.type === "subscript"))
        cur = cur.childForFieldName(cur.type === "attribute" ? "object" : "value");
      roots.push(cur?.type === "identifier" ? cur.text : "");
      return;
    }
    default:
      roots.push("");
  }
}
function stringValue(n) {
  if (!n || n.type !== "string" || n.namedChildren.some((c) => c?.type === "interpolation")) return null;
  return n.namedChildren.filter((c) => c?.type === "string_content").map((c) => c.text).join("");
}
function pyRefs(_path, source) {
  const tree = parsePython(source);
  if (!tree) return { error: "tree-sitter returned no tree" };
  try {
    const root = tree.rootNode;
    if (root.hasError) return { error: "syntax error" };
    const out2 = {
      statements: [],
      fnRefs: /* @__PURE__ */ new Map(),
      imports: [],
      exports: [],
      exportsAll: true,
      specRefs: [],
      dynamicLoaders: []
    };
    let stmt = null;
    let stmtIndex = 0;
    let lambdaDepth = 0;
    let decoratorDepth = 0;
    const bases = /* @__PURE__ */ new Map();
    const registering = /* @__PURE__ */ new Set();
    const classFacts = (n, name2, body2, s) => {
      const args2 = n.childForFieldName("superclasses");
      const list3 = [];
      for (const a of args2?.namedChildren ?? []) {
        if (!a) continue;
        if (a.type === "keyword_argument") {
          if (a.childForFieldName("name")?.text === "metaclass") s.opaque ??= "metaclass";
          continue;
        }
        const text = a.text.replace(/\s+/g, "");
        list3.push(text);
        if (REGISTERING_BASES.test(text)) s.opaque ??= `base ${text} registers subclasses`;
      }
      bases.set(name2, list3);
      for (const st of body2.namedChildren) {
        if (!st) continue;
        const def = st.type === "decorated_definition" ? st.childForFieldName("definition") : st;
        if (def?.type === "function_definition" && def.childForFieldName("name")?.text === "__init_subclass__")
          registering.add(name2);
        if (st.type !== "expression_statement") continue;
        const e = st.namedChildren[0];
        if (!e || e.type === "string" || e.type === "concatenated_string") continue;
        if (e.type !== "assignment" && e.type !== "augmented_assignment") {
          s.opaque ??= "class-body expression";
          continue;
        }
        const roots = [];
        targetNames(e.childForFieldName("left"), [], roots);
        if (roots.length) s.opaque ??= `class-body assignment to ${roots[0] || "an expression"}`;
      }
    };
    const ref = (name2, fn) => {
      if (fn === null) stmt?.refs.add(name2);
      else {
        let s = out2.fnRefs.get(name2);
        if (!s) out2.fnRefs.set(name2, s = /* @__PURE__ */ new Set());
        s.add(fn);
      }
    };
    const walk = (n, prefix, fn) => {
      switch (n.type) {
        case "comment":
          return;
        case "identifier":
          return ref(n.text, fn);
        case "import_statement":
        case "import_from_statement":
        case "future_import_statement":
          if (fn !== null)
            for (const b of pyImportBindings(n)) out2.specRefs.push({ spec: b.spec, fn, stmt: stmtIndex });
          return;
        case "attribute": {
          const obj = n.childForFieldName("object");
          if (obj.text === "sys" && n.childForFieldName("attribute").text === "modules")
            out2.dynamicScope ??= "sys.modules";
          if (obj.type !== "identifier") return walk(obj, prefix, fn);
          ref(`${obj.text}.${n.childForFieldName("attribute").text}`, fn);
          return ref(`${obj.text}.`, fn);
        }
        case "keyword_argument":
          walk(n.childForFieldName("value"), prefix, fn);
          return;
        case "lambda":
          lambdaDepth++;
          for (const c of n.namedChildren) if (c) walk(c, prefix, fn);
          lambdaDepth--;
          return;
        case "call": {
          const f = n.childForFieldName("function");
          const callee = f.type === "attribute" ? f.childForFieldName("attribute").text : f.text;
          if (fn === null && stmt && !lambdaDepth && !decoratorDepth) {
            const dotted = f.text.replace(/\s+/g, "");
            if (!PURE_CALLS.has(dotted) && !PURE_PREFIXES.some((p) => dotted.startsWith(p)))
              stmt.opaque ??= `call to ${dotted.split("(")[0]}`;
          }
          if (f.type === "identifier" && DYNAMIC_SCOPE.has(callee)) out2.dynamicScope ??= `${callee}()`;
          if (LOADERS.has(callee)) {
            const arg = n.childForFieldName("arguments")?.namedChildren[0];
            const s = stringValue(arg);
            if (s === null || s.startsWith(".")) out2.dynamicLoaders.push(fn);
            else out2.specRefs.push({ spec: s, fn, stmt: stmtIndex });
          }
          break;
        }
        case "function_definition": {
          const q = prefix + n.childForFieldName("name").text;
          stmt?.fns.push(q);
          const params = n.childForFieldName("parameters");
          if (params) walkParams(params, prefix, fn);
          const ret = n.childForFieldName("return_type");
          if (ret) walk(ret, prefix, fn);
          walk(n.childForFieldName("body"), `${q}.<locals>.`, q);
          return;
        }
        case "class_definition": {
          const name2 = n.childForFieldName("name").text;
          const q = prefix + name2;
          for (const k of ["superclasses", "type_parameters"]) {
            const c = n.childForFieldName(k);
            if (c) walk(c, prefix, fn);
          }
          const body2 = n.childForFieldName("body");
          if (fn === null && stmt && prefix === "") classFacts(n, name2, body2, stmt);
          walk(body2, `${q}.`, fn);
          return;
        }
        case "decorator":
          if (fn === null && stmt && prefix !== "") {
            const text = n.text.replace(/^@\s*/, "");
            if (!PURE_DECORATORS.test(text)) stmt.opaque ??= `decorator @${text.split("(")[0]}`;
          }
          decoratorDepth++;
          for (const c of n.namedChildren) if (c) walk(c, prefix, fn);
          decoratorDepth--;
          return;
      }
      for (const c of n.namedChildren) if (c) walk(c, prefix, fn);
    };
    const walkParams = (params, prefix, fn) => {
      for (const p of params.namedChildren) {
        if (!p) continue;
        for (const k of ["value", "type"]) {
          const c = p.childForFieldName(k);
          if (c) walk(c, prefix, fn);
        }
      }
    };
    const freshDefs = /* @__PURE__ */ new Set();
    const mutations = [];
    root.namedChildren.forEach((c) => {
      if (!c) return;
      stmtIndex = out2.statements.length;
      const s = {
        start: c.startPosition.row + 1,
        end: lastLine2(c),
        defines: [],
        refs: /* @__PURE__ */ new Set(),
        fns: []
      };
      stmt = s;
      out2.statements.push(s);
      const t = c.type;
      if (t === "comment") return;
      if (t === "import_statement" || t === "import_from_statement" || t === "future_import_statement") {
        s.isImport = true;
        if (t === "future_import_statement") s.opaque = "__future__ import";
        for (const b of pyImportBindings(c)) {
          out2.imports.push(b);
          if (b.local !== "*") s.defines.push(b.local);
          else s.opaque = "star import";
        }
        return;
      }
      let def = c;
      if (t === "decorated_definition") {
        def = c.childForFieldName("definition");
        for (const d of c.namedChildren) {
          if (d?.type !== "decorator") continue;
          const text = d.text.replace(/^@\s*/, "");
          if (!PURE_DECORATORS.test(text)) s.opaque = `decorator @${text.split("(")[0]}`;
          walk(d, "", null);
        }
      }
      if (def.type === "function_definition" || def.type === "class_definition") {
        const name2 = def.childForFieldName("name").text;
        s.defines.push(name2);
        freshDefs.add(name2);
        walk(def, "", null);
        return;
      }
      if (t === "expression_statement") {
        const e = c.namedChildren[0];
        if (c.namedChildCount === 1 && e && (e.type === "string" || e.type === "concatenated_string")) return;
        if (e && (e.type === "assignment" || e.type === "augmented_assignment")) {
          const names2 = [];
          const roots = [];
          for (let a = e; a && (a.type === "assignment" || a.type === "augmented_assignment"); ) {
            targetNames(a.childForFieldName("left"), names2, roots);
            if (a.type === "augmented_assignment") s.refs.add(a.childForFieldName("left").text);
            a = a.childForFieldName("right");
          }
          s.defines.push(...names2);
          const value = e.childForFieldName("right");
          if (e.type === "assignment" && value && FRESH.has(value.type) && e.childForFieldName("left")?.type === "identifier")
            freshDefs.add(names2[0]);
          if (roots.length) mutations.push([s, roots]);
        } else s.opaque = "top-level expression";
        walk(c, "", null);
        return;
      }
      if (t === "type_alias_statement") {
        const name2 = c.childForFieldName("left")?.text;
        if (name2) s.defines.push(name2);
        walk(c, "", null);
        return;
      }
      if (t === "if_statement") {
        const cond = c.childForFieldName("condition");
        const typeChecking = !!cond && /^(typing\.)?TYPE_CHECKING$/.test(cond.text) && !c.childForFieldName("alternative");
        if (typeChecking) return;
      }
      if (t === "pass_statement") return;
      s.opaque = `top-level ${t}`;
      const collect = (n) => {
        if (n.type === "assignment" || n.type === "augmented_assignment")
          targetNames(n.childForFieldName("left"), s.defines, []);
        else if (n.type === "function_definition" || n.type === "class_definition")
          s.defines.push(n.childForFieldName("name").text);
        else if (n.type === "import_statement" || n.type === "import_from_statement") {
          for (const b of pyImportBindings(n)) {
            out2.imports.push(b);
            if (b.local !== "*") s.defines.push(b.local);
          }
          return;
        }
        if (n.type === "function_definition" || n.type === "class_definition") return;
        for (const k of n.namedChildren) if (k) collect(k);
      };
      collect(c);
      walk(c, "", null);
    });
    for (const [s, roots] of mutations)
      for (const r of roots) {
        if (r && freshDefs.has(r)) s.defines.push(r);
        else s.opaque = `assignment to ${r || "an expression"}`;
      }
    out2.classes = { bases, registering };
    return out2;
  } finally {
    tree.delete();
  }
}

// ../../node_modules/.pnpm/oxc-parser@0.157.0/node_modules/oxc-parser/src-js/index.js
import { createRequire as createRequire3 } from "node:module";

// ../../node_modules/.pnpm/oxc-parser@0.157.0/node_modules/oxc-parser/src-js/bindings.js
import { createRequire as createRequire2 } from "module";
var require2 = createRequire2(import.meta.url);
var { readFileSync: readFileSync3 } = require2("fs");
var nativeBinding = null;
var __napiLoadedBindingTarget = "native";
var loadErrors = [];
var isMusl = () => {
  let musl = false;
  if (process.platform === "linux") {
    musl = isMuslFromFilesystem();
    if (musl === null) {
      musl = isMuslFromReport();
    }
    if (musl === null) {
      musl = isMuslFromChildProcess();
    }
  }
  return musl;
};
var isFileMusl = (f) => f.includes("libc.musl-") || f.includes("ld-musl-");
var isMuslFromFilesystem = () => {
  try {
    return readFileSync3("/usr/bin/ldd", "utf-8").includes("musl");
  } catch {
    return null;
  }
};
var isMuslFromReport = () => {
  let report = null;
  if (process.report && typeof process.report.getReport === "function") {
    process.report.excludeNetwork = true;
    report = process.report.getReport();
  }
  if (!report) {
    return null;
  }
  if (report.header && report.header.glibcVersionRuntime) {
    return false;
  }
  if (Array.isArray(report.sharedObjects)) {
    if (report.sharedObjects.some(isFileMusl)) {
      return true;
    }
  }
  return false;
};
var isMuslFromChildProcess = () => {
  try {
    return require2("child_process").execSync("ldd --version", { encoding: "utf8" }).includes("musl");
  } catch (e) {
    return false;
  }
};
function requireNative() {
  if (process.env.NAPI_RS_NATIVE_LIBRARY_PATH) {
    try {
      const overrideBinding = require2(process.env.NAPI_RS_NATIVE_LIBRARY_PATH);
      __napiLoadedBindingTarget = overrideBinding && typeof overrideBinding.__napiBindingTarget === "string" ? overrideBinding.__napiBindingTarget : "native";
      return overrideBinding;
    } catch (err2) {
      loadErrors.push(err2);
    }
  } else if (process.platform === "android") {
    if (process.arch === "arm64") {
      try {
        return require2("./parser.android-arm64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-android-arm64");
        const bindingPackageVersion = require2("@oxc-parser/binding-android-arm64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "arm") {
      try {
        return require2("./parser.android-arm-eabi.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-android-arm-eabi");
        const bindingPackageVersion = require2("@oxc-parser/binding-android-arm-eabi/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Android ${process.arch}`));
    }
  } else if (process.platform === "win32") {
    if (process.arch === "x64") {
      if (process.config && process.config.variables && process.config.variables.shlib_suffix === "dll.a" || process.config && process.config.variables && process.config.variables.node_target_type === "shared_library") {
        try {
          return require2("./parser.win32-x64-gnu.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-win32-x64-gnu");
          const bindingPackageVersion = require2("@oxc-parser/binding-win32-x64-gnu/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        try {
          return require2("./parser.win32-x64-msvc.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-win32-x64-msvc");
          const bindingPackageVersion = require2("@oxc-parser/binding-win32-x64-msvc/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      }
    } else if (process.arch === "ia32") {
      try {
        return require2("./parser.win32-ia32-msvc.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-win32-ia32-msvc");
        const bindingPackageVersion = require2("@oxc-parser/binding-win32-ia32-msvc/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "arm64") {
      try {
        return require2("./parser.win32-arm64-msvc.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-win32-arm64-msvc");
        const bindingPackageVersion = require2("@oxc-parser/binding-win32-arm64-msvc/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Windows: ${process.arch}`));
    }
  } else if (process.platform === "darwin") {
    try {
      return require2("./parser.darwin-universal.node");
    } catch (e) {
      loadErrors.push(e);
    }
    try {
      const binding = require2("@oxc-parser/binding-darwin-universal");
      const bindingPackageVersion = require2("@oxc-parser/binding-darwin-universal/package.json").version;
      if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
        throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
      }
      return binding;
    } catch (e) {
      loadErrors.push(e);
    }
    if (process.arch === "x64") {
      try {
        return require2("./parser.darwin-x64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-darwin-x64");
        const bindingPackageVersion = require2("@oxc-parser/binding-darwin-x64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "arm64") {
      try {
        return require2("./parser.darwin-arm64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-darwin-arm64");
        const bindingPackageVersion = require2("@oxc-parser/binding-darwin-arm64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on macOS: ${process.arch}`));
    }
  } else if (process.platform === "freebsd") {
    if (process.arch === "x64") {
      try {
        return require2("./parser.freebsd-x64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-freebsd-x64");
        const bindingPackageVersion = require2("@oxc-parser/binding-freebsd-x64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "arm64") {
      try {
        return require2("./parser.freebsd-arm64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-freebsd-arm64");
        const bindingPackageVersion = require2("@oxc-parser/binding-freebsd-arm64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on FreeBSD: ${process.arch}`));
    }
  } else if (process.platform === "linux") {
    if (process.arch === "x64") {
      if (isMusl()) {
        try {
          return require2("./parser.linux-x64-musl.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-x64-musl");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-x64-musl/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        try {
          return require2("./parser.linux-x64-gnu.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-x64-gnu");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-x64-gnu/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      }
    } else if (process.arch === "arm64") {
      if (isMusl()) {
        try {
          return require2("./parser.linux-arm64-musl.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-arm64-musl");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-arm64-musl/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        try {
          return require2("./parser.linux-arm64-gnu.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-arm64-gnu");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-arm64-gnu/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      }
    } else if (process.arch === "arm") {
      if (isMusl()) {
        try {
          return require2("./parser.linux-arm-musleabihf.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-arm-musleabihf");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-arm-musleabihf/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        try {
          return require2("./parser.linux-arm-gnueabihf.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-arm-gnueabihf");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-arm-gnueabihf/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      }
    } else if (process.arch === "loong64") {
      if (isMusl()) {
        try {
          return require2("./parser.linux-loong64-musl.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-loong64-musl");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-loong64-musl/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        try {
          return require2("./parser.linux-loong64-gnu.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-loong64-gnu");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-loong64-gnu/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      }
    } else if (process.arch === "riscv64") {
      if (isMusl()) {
        try {
          return require2("./parser.linux-riscv64-musl.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-riscv64-musl");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-riscv64-musl/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      } else {
        try {
          return require2("./parser.linux-riscv64-gnu.node");
        } catch (e) {
          loadErrors.push(e);
        }
        try {
          const binding = require2("@oxc-parser/binding-linux-riscv64-gnu");
          const bindingPackageVersion = require2("@oxc-parser/binding-linux-riscv64-gnu/package.json").version;
          if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
            throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
          return binding;
        } catch (e) {
          loadErrors.push(e);
        }
      }
    } else if (process.arch === "ppc64") {
      try {
        return require2("./parser.linux-ppc64-gnu.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-linux-ppc64-gnu");
        const bindingPackageVersion = require2("@oxc-parser/binding-linux-ppc64-gnu/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "s390x") {
      try {
        return require2("./parser.linux-s390x-gnu.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-linux-s390x-gnu");
        const bindingPackageVersion = require2("@oxc-parser/binding-linux-s390x-gnu/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on Linux: ${process.arch}`));
    }
  } else if (process.platform === "openharmony") {
    if (process.arch === "arm64") {
      try {
        return require2("./parser.openharmony-arm64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-openharmony-arm64");
        const bindingPackageVersion = require2("@oxc-parser/binding-openharmony-arm64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "x64") {
      try {
        return require2("./parser.openharmony-x64.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-openharmony-x64");
        const bindingPackageVersion = require2("@oxc-parser/binding-openharmony-x64/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else if (process.arch === "arm") {
      try {
        return require2("./parser.openharmony-arm.node");
      } catch (e) {
        loadErrors.push(e);
      }
      try {
        const binding = require2("@oxc-parser/binding-openharmony-arm");
        const bindingPackageVersion = require2("@oxc-parser/binding-openharmony-arm/package.json").version;
        if (bindingPackageVersion !== "0.157.0" && process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          throw new Error(`Native binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
        }
        return binding;
      } catch (e) {
        loadErrors.push(e);
      }
    } else {
      loadErrors.push(new Error(`Unsupported architecture on OpenHarmony: ${process.arch}`));
    }
  } else {
    loadErrors.push(new Error(`Unsupported OS: ${process.platform}, architecture: ${process.arch}`));
  }
}
function createLoadErrorChain(errors) {
  return errors.reduce((previous, current) => {
    let message;
    try {
      message = current && typeof current.message === "string" ? current.message : String(current);
    } catch {
      message = "Unknown error";
    }
    const error = new Error(message);
    error.cause = previous;
    return error;
  }, null);
}
var __napiWasiFlavors = ["wasm32-wasi", "wasm32-wasip1"];
var __napiWasiFlavor = process.env.NAPI_RS_WASI_FLAVOR;
var __napiWasiFlavorRequested = typeof __napiWasiFlavor === "string" && __napiWasiFlavor.length > 0;
if (__napiWasiFlavorRequested && __napiWasiFlavors.indexOf(__napiWasiFlavor) === -1) {
  throw new Error(
    'Unsupported WASI flavor "' + __napiWasiFlavor + '". Available flavors: ' + __napiWasiFlavors.join(", ")
  );
}
var forceWasiError = process.env.NAPI_RS_FORCE_WASI === "error";
var forceWasi = process.env.NAPI_RS_FORCE_WASI === "true" || forceWasiError || __napiWasiFlavorRequested;
if (!forceWasi) {
  nativeBinding = requireNative();
}
if (!nativeBinding || forceWasi) {
  let wasiBinding = null;
  let wasiBindingLoaded = false;
  const wasiBindingErrors = [];
  const __napiWasiResolveCandidate = (specifier, isPackage, localArtifacts) => {
    try {
      require2.resolve(specifier);
    } catch (resolveError) {
      if (!resolveError || resolveError.code !== "MODULE_NOT_FOUND") {
        throw resolveError;
      }
      if (isPackage) {
        try {
          require2.resolve(specifier + "/package.json");
        } catch (packageError) {
          if (packageError && packageError.code === "MODULE_NOT_FOUND") {
            return resolveError;
          }
          throw resolveError;
        }
        throw resolveError;
      }
      return resolveError;
    }
    if (localArtifacts) {
      let artifactError = null;
      for (let i2 = 0; i2 < localArtifacts.length; i2++) {
        try {
          require2.resolve(localArtifacts[i2]);
          return null;
        } catch (resolveError) {
          if (!resolveError || resolveError.code !== "MODULE_NOT_FOUND") {
            throw resolveError;
          }
          artifactError = resolveError;
        }
      }
      return artifactError;
    }
    return null;
  };
  if (!wasiBindingLoaded && (!__napiWasiFlavorRequested || __napiWasiFlavor === "wasm32-wasi")) {
    let candidateError = null;
    let candidateFailed = false;
    try {
      candidateError = __napiWasiResolveCandidate("./parser.wasi.cjs", false, ["./parser.wasm32-wasi.debug.wasm", "./parser.wasm32-wasi.wasm"]);
      candidateFailed = candidateError !== null;
      if (!candidateFailed) {
        wasiBinding = require2("./parser.wasi.cjs");
        nativeBinding = wasiBinding;
        __napiLoadedBindingTarget = "wasm32-wasi";
        wasiBindingLoaded = true;
      }
    } catch (err2) {
      candidateError = err2;
      candidateFailed = true;
    }
    if (candidateFailed) {
      wasiBindingErrors.push(candidateError);
      loadErrors.push(candidateError);
    }
  }
  if (!wasiBindingLoaded && (!__napiWasiFlavorRequested || __napiWasiFlavor === "wasm32-wasip1")) {
    let candidateError = null;
    let candidateFailed = false;
    try {
      candidateError = __napiWasiResolveCandidate("./parser.wasip1.cjs", false, ["./parser.wasm32-wasip1.debug.wasm", "./parser.wasm32-wasip1.wasm"]);
      candidateFailed = candidateError !== null;
      if (!candidateFailed) {
        wasiBinding = require2("./parser.wasip1.cjs");
        nativeBinding = wasiBinding;
        __napiLoadedBindingTarget = "wasm32-wasip1";
        wasiBindingLoaded = true;
      }
    } catch (err2) {
      candidateError = err2;
      candidateFailed = true;
    }
    if (candidateFailed) {
      wasiBindingErrors.push(candidateError);
      loadErrors.push(candidateError);
    }
  }
  if (!wasiBindingLoaded && (!__napiWasiFlavorRequested || __napiWasiFlavor === "wasm32-wasi")) {
    let candidateError = null;
    let candidateFailed = false;
    try {
      candidateError = __napiWasiResolveCandidate("@oxc-parser/binding-wasm32-wasi", true, void 0);
      candidateFailed = candidateError !== null;
      if (!candidateFailed) {
        if (process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          const bindingPackageVersion = require2("@oxc-parser/binding-wasm32-wasi/package.json").version;
          if (bindingPackageVersion !== "0.157.0") {
            throw new Error(`WASI binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
        }
        wasiBinding = require2("@oxc-parser/binding-wasm32-wasi");
        nativeBinding = wasiBinding;
        __napiLoadedBindingTarget = "wasm32-wasi";
        wasiBindingLoaded = true;
      }
    } catch (err2) {
      candidateError = err2;
      candidateFailed = true;
    }
    if (candidateFailed) {
      wasiBindingErrors.push(candidateError);
      loadErrors.push(candidateError);
    }
  }
  if (!wasiBindingLoaded && (!__napiWasiFlavorRequested || __napiWasiFlavor === "wasm32-wasip1")) {
    let candidateError = null;
    let candidateFailed = false;
    try {
      candidateError = __napiWasiResolveCandidate("@oxc-parser/binding-wasm32-wasip1", true, void 0);
      candidateFailed = candidateError !== null;
      if (!candidateFailed) {
        if (process.env.NAPI_RS_ENFORCE_VERSION_CHECK && process.env.NAPI_RS_ENFORCE_VERSION_CHECK !== "0") {
          const bindingPackageVersion = require2("@oxc-parser/binding-wasm32-wasip1/package.json").version;
          if (bindingPackageVersion !== "0.157.0") {
            throw new Error(`WASI binding package version mismatch, expected 0.157.0 but got ${bindingPackageVersion}. You can reinstall dependencies to fix this issue.`);
          }
        }
        wasiBinding = require2("@oxc-parser/binding-wasm32-wasip1");
        nativeBinding = wasiBinding;
        __napiLoadedBindingTarget = "wasm32-wasip1";
        wasiBindingLoaded = true;
      }
    } catch (err2) {
      candidateError = err2;
      candidateFailed = true;
    }
    if (candidateFailed) {
      wasiBindingErrors.push(candidateError);
      loadErrors.push(candidateError);
    }
  }
  if (!wasiBindingLoaded && forceWasi && !forceWasiError && !__napiWasiFlavorRequested) {
    nativeBinding = requireNative();
  }
  if ((forceWasiError || __napiWasiFlavorRequested) && !wasiBindingLoaded) {
    const error = new Error(
      __napiWasiFlavorRequested ? 'WASI binding for flavor "' + __napiWasiFlavor + '" not found' : "WASI binding not found and NAPI_RS_FORCE_WASI is set to error"
    );
    error.cause = createLoadErrorChain(wasiBindingErrors);
    throw error;
  }
}
if (!nativeBinding && globalThis.process?.versions?.["webcontainer"]) {
  try {
    nativeBinding = require2("./webcontainer-fallback.cjs");
  } catch (err2) {
    loadErrors.push(err2);
  }
}
if (!nativeBinding) {
  if (loadErrors.length > 0) {
    const error = new Error(
      `Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try \`npm i\` again after removing both package-lock.json and node_modules directory.`
    );
    error.cause = createLoadErrorChain(loadErrors);
    throw error;
  }
  throw new Error(`Failed to load native binding`);
}
var { Severity, ParseResult, ExportExportNameKind, ExportImportNameKind, ExportLocalNameKind, ImportNameKind, parse, parseSync, rawTransferSupported } = nativeBinding;
var { getBufferOffset, parseRaw, parseRawSync } = nativeBinding;

// ../../node_modules/.pnpm/oxc-parser@0.157.0/node_modules/oxc-parser/src-js/wrap.js
function wrap(result) {
  let program, module2, comments, errors;
  return {
    get program() {
      if (!program) program = jsonParseAst(result.program);
      return program;
    },
    get module() {
      if (!module2) module2 = result.module;
      return module2;
    },
    get comments() {
      if (!comments) comments = result.comments;
      return comments;
    },
    get errors() {
      if (!errors) errors = result.errors;
      return errors;
    }
  };
}
function jsonParseAst(programJson) {
  const { node: program, fixes } = JSON.parse(programJson);
  for (const fixPath of fixes) {
    applyFix(program, fixPath);
  }
  return program;
}
function applyFix(program, fixPath) {
  let node = program;
  for (const key of fixPath) {
    node = node[key];
  }
  if (node.bigint) {
    node.value = BigInt(node.bigint);
  } else {
    try {
      node.value = RegExp(node.regex.pattern, node.regex.flags);
    } catch {
    }
  }
}

// ../../node_modules/.pnpm/oxc-parser@0.157.0/node_modules/oxc-parser/src-js/generated/visit/keys.js
var { freeze } = Object;
var $EMPTY = freeze([]);
var DECORATORS__KEY__TYPE_ANNOTATION__VALUE = freeze([
  "decorators",
  "key",
  "typeAnnotation",
  "value"
]);
var LEFT__RIGHT = freeze(["left", "right"]);
var ARGUMENT = freeze(["argument"]);
var BODY = freeze(["body"]);
var LABEL = freeze(["label"]);
var CALLEE__TYPE_ARGUMENTS__ARGUMENTS = freeze(["callee", "typeArguments", "arguments"]);
var EXPRESSION = freeze(["expression"]);
var DECORATORS__ID__TYPE_PARAMETERS__SUPER_CLASS__SUPER_TYPE_ARGUMENTS__IMPLEMENTS__BODY = freeze([
  "decorators",
  "id",
  "typeParameters",
  "superClass",
  "superTypeArguments",
  "implements",
  "body"
]);
var TEST__CONSEQUENT__ALTERNATE = freeze(["test", "consequent", "alternate"]);
var LEFT__RIGHT__BODY = freeze(["left", "right", "body"]);
var ID__TYPE_PARAMETERS__PARAMS__RETURN_TYPE__BODY = freeze([
  "id",
  "typeParameters",
  "params",
  "returnType",
  "body"
]);
var KEY__VALUE = freeze(["key", "value"]);
var LOCAL = freeze(["local"]);
var OBJECT__PROPERTY = freeze(["object", "property"]);
var DECORATORS__KEY__TYPE_ANNOTATION = freeze(["decorators", "key", "typeAnnotation"]);
var EXPRESSION__TYPE_ANNOTATION = freeze(["expression", "typeAnnotation"]);
var TYPE_PARAMETERS__PARAMS__RETURN_TYPE = freeze(["typeParameters", "params", "returnType"]);
var EXPRESSION__TYPE_ARGUMENTS = freeze(["expression", "typeArguments"]);
var MEMBERS = freeze(["members"]);
var ID__BODY = freeze(["id", "body"]);
var TYPES = freeze(["types"]);
var TYPE_ANNOTATION = freeze(["typeAnnotation"]);
var PARAMS = freeze(["params"]);
var keys_default = freeze({
  // Leaf nodes
  DebuggerStatement: $EMPTY,
  EmptyStatement: $EMPTY,
  Literal: $EMPTY,
  PrivateIdentifier: $EMPTY,
  Super: $EMPTY,
  TemplateElement: $EMPTY,
  ThisExpression: $EMPTY,
  JSXClosingFragment: $EMPTY,
  JSXEmptyExpression: $EMPTY,
  JSXIdentifier: $EMPTY,
  JSXOpeningFragment: $EMPTY,
  JSXText: $EMPTY,
  TSAnyKeyword: $EMPTY,
  TSBigIntKeyword: $EMPTY,
  TSBooleanKeyword: $EMPTY,
  TSIntrinsicKeyword: $EMPTY,
  TSJSDocUnknownType: $EMPTY,
  TSNeverKeyword: $EMPTY,
  TSNullKeyword: $EMPTY,
  TSNumberKeyword: $EMPTY,
  TSObjectKeyword: $EMPTY,
  TSStringKeyword: $EMPTY,
  TSSymbolKeyword: $EMPTY,
  TSThisType: $EMPTY,
  TSUndefinedKeyword: $EMPTY,
  TSUnknownKeyword: $EMPTY,
  TSVoidKeyword: $EMPTY,
  // Non-leaf nodes
  AccessorProperty: DECORATORS__KEY__TYPE_ANNOTATION__VALUE,
  ArrayExpression: freeze(["elements"]),
  ArrayPattern: freeze(["decorators", "elements", "typeAnnotation"]),
  ArrowFunctionExpression: freeze(["typeParameters", "params", "returnType", "body"]),
  AssignmentExpression: LEFT__RIGHT,
  AssignmentPattern: freeze(["decorators", "left", "right", "typeAnnotation"]),
  AwaitExpression: ARGUMENT,
  BinaryExpression: LEFT__RIGHT,
  BlockStatement: BODY,
  BreakStatement: LABEL,
  CallExpression: CALLEE__TYPE_ARGUMENTS__ARGUMENTS,
  CatchClause: freeze(["param", "body"]),
  ChainExpression: EXPRESSION,
  ClassBody: BODY,
  ClassDeclaration: DECORATORS__ID__TYPE_PARAMETERS__SUPER_CLASS__SUPER_TYPE_ARGUMENTS__IMPLEMENTS__BODY,
  ClassExpression: DECORATORS__ID__TYPE_PARAMETERS__SUPER_CLASS__SUPER_TYPE_ARGUMENTS__IMPLEMENTS__BODY,
  ConditionalExpression: TEST__CONSEQUENT__ALTERNATE,
  ContinueStatement: LABEL,
  Decorator: EXPRESSION,
  DoWhileStatement: freeze(["body", "test"]),
  ExportAllDeclaration: freeze(["exported", "source", "attributes"]),
  ExportDefaultDeclaration: freeze(["declaration"]),
  ExportNamedDeclaration: freeze(["declaration", "specifiers", "source", "attributes"]),
  ExportSpecifier: freeze(["local", "exported"]),
  ExpressionStatement: EXPRESSION,
  ForInStatement: LEFT__RIGHT__BODY,
  ForOfStatement: LEFT__RIGHT__BODY,
  ForStatement: freeze(["init", "test", "update", "body"]),
  FunctionDeclaration: ID__TYPE_PARAMETERS__PARAMS__RETURN_TYPE__BODY,
  FunctionExpression: ID__TYPE_PARAMETERS__PARAMS__RETURN_TYPE__BODY,
  Identifier: freeze(["decorators", "typeAnnotation"]),
  IfStatement: TEST__CONSEQUENT__ALTERNATE,
  ImportAttribute: KEY__VALUE,
  ImportDeclaration: freeze(["specifiers", "source", "attributes"]),
  ImportDefaultSpecifier: LOCAL,
  ImportExpression: freeze(["source", "options"]),
  ImportNamespaceSpecifier: LOCAL,
  ImportSpecifier: freeze(["imported", "local"]),
  LabeledStatement: freeze(["label", "body"]),
  LogicalExpression: LEFT__RIGHT,
  MemberExpression: OBJECT__PROPERTY,
  MetaProperty: freeze(["meta", "property"]),
  MethodDefinition: freeze(["decorators", "key", "value"]),
  NewExpression: CALLEE__TYPE_ARGUMENTS__ARGUMENTS,
  ObjectExpression: freeze(["properties"]),
  ObjectPattern: freeze(["decorators", "properties", "typeAnnotation"]),
  ParenthesizedExpression: EXPRESSION,
  Program: BODY,
  Property: KEY__VALUE,
  PropertyDefinition: DECORATORS__KEY__TYPE_ANNOTATION__VALUE,
  RestElement: freeze(["decorators", "argument", "typeAnnotation"]),
  ReturnStatement: ARGUMENT,
  SequenceExpression: freeze(["expressions"]),
  SpreadElement: ARGUMENT,
  StaticBlock: BODY,
  SwitchCase: freeze(["test", "consequent"]),
  SwitchStatement: freeze(["discriminant", "cases"]),
  TaggedTemplateExpression: freeze(["tag", "typeArguments", "quasi"]),
  TemplateLiteral: freeze(["quasis", "expressions"]),
  ThrowStatement: ARGUMENT,
  TryStatement: freeze(["block", "handler", "finalizer"]),
  UnaryExpression: ARGUMENT,
  UpdateExpression: ARGUMENT,
  V8IntrinsicExpression: freeze(["name", "arguments"]),
  VariableDeclaration: freeze(["declarations"]),
  VariableDeclarator: freeze(["id", "init"]),
  WhileStatement: freeze(["test", "body"]),
  WithStatement: freeze(["object", "body"]),
  YieldExpression: ARGUMENT,
  JSXAttribute: freeze(["name", "value"]),
  JSXClosingElement: freeze(["name"]),
  JSXElement: freeze(["openingElement", "children", "closingElement"]),
  JSXExpressionContainer: EXPRESSION,
  JSXFragment: freeze(["openingFragment", "children", "closingFragment"]),
  JSXMemberExpression: OBJECT__PROPERTY,
  JSXNamespacedName: freeze(["namespace", "name"]),
  JSXOpeningElement: freeze(["name", "typeArguments", "attributes"]),
  JSXSpreadAttribute: ARGUMENT,
  JSXSpreadChild: EXPRESSION,
  TSAbstractAccessorProperty: DECORATORS__KEY__TYPE_ANNOTATION,
  TSAbstractMethodDefinition: KEY__VALUE,
  TSAbstractPropertyDefinition: DECORATORS__KEY__TYPE_ANNOTATION,
  TSArrayType: freeze(["elementType"]),
  TSAsExpression: EXPRESSION__TYPE_ANNOTATION,
  TSCallSignatureDeclaration: TYPE_PARAMETERS__PARAMS__RETURN_TYPE,
  TSClassImplements: EXPRESSION__TYPE_ARGUMENTS,
  TSConditionalType: freeze(["checkType", "extendsType", "trueType", "falseType"]),
  TSConstructSignatureDeclaration: TYPE_PARAMETERS__PARAMS__RETURN_TYPE,
  TSConstructorType: TYPE_PARAMETERS__PARAMS__RETURN_TYPE,
  TSDeclareFunction: ID__TYPE_PARAMETERS__PARAMS__RETURN_TYPE__BODY,
  TSEmptyBodyFunctionExpression: freeze(["id", "typeParameters", "params", "returnType"]),
  TSEnumBody: MEMBERS,
  TSEnumDeclaration: ID__BODY,
  TSEnumMember: freeze(["id", "initializer"]),
  TSExportAssignment: EXPRESSION,
  TSExternalModuleReference: EXPRESSION,
  TSFunctionType: TYPE_PARAMETERS__PARAMS__RETURN_TYPE,
  TSImportEqualsDeclaration: freeze(["id", "moduleReference"]),
  TSImportType: freeze(["source", "options", "qualifier", "typeArguments"]),
  TSIndexSignature: freeze(["parameters", "typeAnnotation"]),
  TSIndexedAccessType: freeze(["objectType", "indexType"]),
  TSInferType: freeze(["typeParameter"]),
  TSInstantiationExpression: EXPRESSION__TYPE_ARGUMENTS,
  TSInterfaceBody: BODY,
  TSInterfaceDeclaration: freeze(["id", "typeParameters", "extends", "body"]),
  TSInterfaceHeritage: EXPRESSION__TYPE_ARGUMENTS,
  TSIntersectionType: TYPES,
  TSJSDocNonNullableType: TYPE_ANNOTATION,
  TSJSDocNullableType: TYPE_ANNOTATION,
  TSLiteralType: freeze(["literal"]),
  TSMappedType: freeze(["key", "constraint", "nameType", "typeAnnotation"]),
  TSMethodSignature: freeze(["key", "typeParameters", "params", "returnType"]),
  TSModuleBlock: BODY,
  TSModuleDeclaration: ID__BODY,
  TSNamedTupleMember: freeze(["label", "elementType"]),
  TSNamespaceExportDeclaration: freeze(["id"]),
  TSNonNullExpression: EXPRESSION,
  TSOptionalType: TYPE_ANNOTATION,
  TSParameterProperty: freeze(["decorators", "parameter"]),
  TSParenthesizedType: TYPE_ANNOTATION,
  TSPropertySignature: freeze(["key", "typeAnnotation"]),
  TSQualifiedName: LEFT__RIGHT,
  TSRestType: TYPE_ANNOTATION,
  TSSatisfiesExpression: EXPRESSION__TYPE_ANNOTATION,
  TSTemplateLiteralType: freeze(["quasis", "types"]),
  TSTupleType: freeze(["elementTypes"]),
  TSTypeAliasDeclaration: freeze(["id", "typeParameters", "typeAnnotation"]),
  TSTypeAnnotation: TYPE_ANNOTATION,
  TSTypeAssertion: freeze(["typeAnnotation", "expression"]),
  TSTypeLiteral: MEMBERS,
  TSTypeOperator: TYPE_ANNOTATION,
  TSTypeParameter: freeze(["name", "constraint", "default"]),
  TSTypeParameterDeclaration: PARAMS,
  TSTypeParameterInstantiation: PARAMS,
  TSTypePredicate: freeze(["parameterName", "typeAnnotation"]),
  TSTypeQuery: freeze(["exprName", "typeArguments"]),
  TSTypeReference: freeze(["typeName", "typeArguments"]),
  TSUnionType: TYPES
});

// ../../node_modules/.pnpm/oxc-parser@0.157.0/node_modules/oxc-parser/src-js/raw-transfer/supported.js
var rawTransferIsSupported = null;
function rawTransferSupported2() {
  if (rawTransferIsSupported === null) {
    rawTransferIsSupported = rawTransferRuntimeSupported() && rawTransferSupported();
  }
  return rawTransferIsSupported;
}
function rawTransferRuntimeSupported() {
  let global;
  try {
    global = globalThis;
  } catch {
    return false;
  }
  const isBun = !!global.Bun || !!global.process?.versions?.bun;
  if (isBun) return false;
  const isDeno = !!global.Deno;
  if (isDeno) {
    const match2 = Deno.version?.deno?.match(/^(\d+)\./);
    return !!match2 && match2[1] * 1 >= 2;
  }
  const isNode2 = global.process?.release?.name === "node";
  if (!isNode2) return false;
  const match = process.version?.match(/^v(\d+)\./);
  return !!match && match[1] * 1 >= 22;
}

// ../../node_modules/.pnpm/oxc-parser@0.157.0/node_modules/oxc-parser/src-js/index.js
var require3 = createRequire3(import.meta.url);
var parseSyncRaw = null;
var parseRaw2;
var parseSyncLazy = null;
var parseLazy;
var LazyVisitor;
function loadRawTransfer() {
  if (parseSyncRaw === null) {
    ({ parseSyncRaw, parse: parseRaw2 } = require3("./raw-transfer/eager.js"));
  }
}
function loadRawTransferLazy() {
  if (parseSyncLazy === null) {
    ({ parseSyncLazy, parse: parseLazy, Visitor: LazyVisitor } = require3("./raw-transfer/lazy.js"));
  }
}
function parseSync2(filename, sourceText, options) {
  if (options?.experimentalRawTransfer) {
    loadRawTransfer();
    return parseSyncRaw(filename, sourceText, options);
  }
  if (options?.experimentalLazy) {
    loadRawTransferLazy();
    return parseSyncLazy(filename, sourceText, options);
  }
  return wrap(parseSync(filename, sourceText, options));
}

// ../engine/src/spans/typescript.ts
var isNode = (x) => !!x && typeof x === "object" && typeof x.type === "string";
function lineIndex(src) {
  const starts = [0];
  for (let i2 = 0; i2 < src.length; i2++) if (src.charCodeAt(i2) === 10) starts.push(i2 + 1);
  return (off) => {
    let lo = 0;
    let hi = starts.length - 1;
    while (lo < hi) {
      const m = lo + hi + 1 >> 1;
      if (starts[m] <= off) lo = m;
      else hi = m - 1;
    }
    return lo + 1;
  };
}
function keyName(key, computed) {
  if (!isNode(key) || computed) return null;
  if (key.type === "Identifier") return key.name;
  if (key.type === "PrivateIdentifier") return `#${key.name}`;
  if (key.type === "Literal" && (typeof key.value === "string" || typeof key.value === "number"))
    return String(key.value);
  return null;
}
var TYPE_ONLY = /* @__PURE__ */ new Set(["TSInterfaceDeclaration", "TSTypeAliasDeclaration", "TSDeclareFunction"]);
var CLASS = /* @__PURE__ */ new Set(["ClassDeclaration", "ClassExpression"]);
var FUNCTION_VALUE = /* @__PURE__ */ new Set(["ArrowFunctionExpression", "FunctionExpression"]);
function functionName(n, parent, classNames) {
  if ((n.type === "FunctionDeclaration" || n.type === "FunctionExpression") && isNode(n.id))
    return n.id.name;
  if (n.type === "MethodDefinition" || n.type === "TSAbstractMethodDefinition")
    return n.kind === "constructor" ? classNames.at(-1) ?? null : keyName(n.key, n.computed);
  if (FUNCTION_VALUE.has(n.type) && parent) {
    if (parent.type === "VariableDeclarator" && isNode(parent.id) && parent.id.type === "Identifier")
      return parent.id.name;
    if (parent.type === "Property" || parent.type === "PropertyDefinition")
      return keyName(parent.key, parent.computed);
  }
  return null;
}
function isTypeOnly(n) {
  if (TYPE_ONLY.has(n.type)) return true;
  if (n.declare === true) return true;
  if ((n.type === "ImportDeclaration" || n.type === "TSImportEqualsDeclaration") && n.importKind === "type")
    return true;
  if ((n.type === "ExportNamedDeclaration" || n.type === "ExportAllDeclaration") && n.exportKind === "type")
    return true;
  return false;
}
var raw = rawTransferSupported2();
function parseTs(path, source) {
  if (raw) {
    try {
      return parseSync2(path, source, { experimentalRawTransfer: true });
    } catch (e) {
      if (!/Cannot find module|raw transfer/i.test(String(e))) throw e;
      raw = false;
    }
  }
  return parseSync2(path, source);
}
function tsSpans(path, source) {
  let r;
  try {
    r = parseTs(path, source);
  } catch (e) {
    return { ok: false, error: { message: String(e) } };
  }
  const fatal = r.errors.filter((e) => e.severity === "Error");
  if (fatal.length) return { ok: false, error: { message: fatal[0].message } };
  const line = lineIndex(source);
  const functions = [];
  const typeRanges = [];
  const importRanges = [];
  const classNames = [];
  const visit = (n, parent) => {
    const name2 = functionName(n, parent, classNames);
    if (name2) {
      const decorators = n.decorators ?? [];
      const start2 = decorators.length ? line(decorators.at(-1).end) + 1 : line(n.start);
      if (start2 <= line(n.end)) functions.push({ name: name2, start: start2, end: line(n.end) });
    }
    if (isTypeOnly(n)) {
      typeRanges.push([line(n.start), line(n.end)]);
      return;
    }
    const isClass = CLASS.has(n.type);
    if (isClass) classNames.push(isNode(n.id) ? n.id.name : null);
    for (const k in n) {
      if (k === "type" || k === "start" || k === "end") continue;
      const v = n[k];
      if (Array.isArray(v)) {
        for (const c of v) if (isNode(c)) visit(c, n);
      } else if (isNode(v)) visit(v, n);
    }
    if (isClass) classNames.pop();
  };
  const bindings = /* @__PURE__ */ new Map();
  const reexportRanges = [];
  for (const stmt of r.program.body) {
    const isImport = stmt.type === "ImportDeclaration" && stmt.specifiers.length > 0 || stmt.type === "TSImportEqualsDeclaration";
    const isReexport = stmt.type === "ExportNamedDeclaration" && stmt.source != null || stmt.type === "ExportAllDeclaration";
    if (isReexport && !isTypeOnly(stmt)) reexportRanges.push([line(stmt.start), line(stmt.end)]);
    if (isImport && !isTypeOnly(stmt)) {
      importRanges.push([line(stmt.start), line(stmt.end)]);
      if (stmt.type === "ImportDeclaration") {
        const from = stmt.source.value;
        for (const sp of stmt.specifiers) {
          if (sp.importKind === "type") continue;
          const imported = sp.type === "ImportDefaultSpecifier" ? "default" : sp.type === "ImportNamespaceSpecifier" ? "*" : keyName(sp.imported, false) ?? "?";
          bindings.set(sp.local.name, `${from}#${imported}`);
        }
      } else if (isNode(stmt.id)) {
        const ref = stmt.moduleReference;
        const from = isNode(ref.expression) ? String(ref.expression.value) : "internal";
        bindings.set(stmt.id.name, `${from}#=`);
      }
    }
    visit(stmt, null);
  }
  const chars = source.split("");
  for (const c of r.comments) for (let i2 = c.start; i2 < c.end; i2++) if (chars[i2] !== "\n") chars[i2] = " ";
  const blankLines = /* @__PURE__ */ new Set();
  const lines3 = chars.join("").split("\n");
  lines3.forEach((l, i2) => {
    if (!l.trim()) blankLines.add(i2 + 1);
  });
  const spans = {
    functions,
    typeRanges,
    importRanges,
    reexportRanges,
    bindings,
    blankLines,
    lineCount: lines3.length
  };
  return { ok: true, spans };
}
var typescriptParser = {
  language: "typescript",
  extensions: [".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"],
  parse: tsSpans
};

// ../engine/src/refs/typescript.ts
var TYPE_KEYS = /* @__PURE__ */ new Set([
  "typeAnnotation",
  "returnType",
  "typeParameters",
  "typeArguments",
  "superTypeArguments",
  "implements"
]);
var MOCKS = /* @__PURE__ */ new Set(["mock", "doMock", "unmock", "doUnmock", "setMock"]);
var LOADS = /* @__PURE__ */ new Set(["importActual", "requireActual", "importMock", "requireMock"]);
var isLoadCall = (callee) => callee.type === "MemberExpression" && !callee.computed && LOADS.has(callee.property.name);
var isMockCall = (callee) => callee.type === "MemberExpression" && !callee.computed && MOCKS.has(callee.property.name);
function staticString(n) {
  if (!isNode(n)) return null;
  if (n.type === "Literal" && typeof n.value === "string") return n.value;
  if (n.type === "TemplateLiteral" && n.expressions.length === 0) {
    const q = n.quasis[0];
    return q ? q.value.cooked ?? null : "";
  }
  return null;
}
var FRESH2 = /* @__PURE__ */ new Set([
  "ObjectExpression",
  "ArrayExpression",
  "NewExpression",
  "ArrowFunctionExpression",
  "FunctionExpression",
  "ClassExpression",
  "Literal",
  "TemplateLiteral"
]);
var unwrap = (n) => n.type === "TSAsExpression" || n.type === "TSSatisfiesExpression" || n.type === "TSNonNullExpression" || n.type === "ParenthesizedExpression" ? unwrap(n.expression) : n;
var PURE_CALLS2 = new Set(
  "require Symbol Symbol.for String String.raw String.fromCharCode Number Number.parseInt Number.parseFloat Number.isFinite Number.isInteger Boolean BigInt parseInt parseFloat isNaN isFinite Array Array.from Array.of Array.isArray Object.freeze Object.keys Object.values Object.entries Object.fromEntries Object.create Object.getOwnPropertyNames Object.getPrototypeOf Object.is JSON.parse JSON.stringify Date Date.now Date.parse RegExp Error TypeError RangeError SyntaxError Map Set WeakMap WeakSet WeakRef URL URLSearchParams TextEncoder TextDecoder AbortController Promise Promise.resolve Promise.reject Buffer.from Buffer.alloc structuredClone encodeURIComponent decodeURIComponent fileURLToPath pathToFileURL url.fileURLToPath url.pathToFileURL createRequire module.createRequire process.cwd os.homedir os.tmpdir os.platform os.arch os.cpus os.hostname os.type os.release createContext React.createContext forwardRef React.forwardRef memo React.memo lazy React.lazy css keyframes cva clsx z.object z.string z.number z.boolean z.bigint z.date z.symbol z.undefined z.null z.void z.any z.unknown z.never z.array z.tuple z.union z.discriminatedUnion z.intersection z.record z.map z.set z.literal z.enum z.nativeEnum z.optional z.nullable z.lazy z.promise z.function z.instanceof z.custom z.preprocess z.strictObject z.looseObject z.coerce.string z.coerce.number z.coerce.boolean z.coerce.date z.coerce.bigint".split(" ")
);
var PURE_PREFIXES2 = ["Math.", "Intl.", "path.", "path.posix.", "path.win32."];
var MEMBERS2 = /* @__PURE__ */ new Set([
  "MethodDefinition",
  "PropertyDefinition",
  "AccessorProperty",
  "TSAbstractMethodDefinition",
  "TSAbstractPropertyDefinition"
]);
var PURE_METHODS = new Set(
  "map filter reduce reduceRight flatMap flat slice concat join sort toSorted reverse toReversed includes indexOf find findIndex some every at entries keys values fill split trim trimStart trimEnd toLowerCase toUpperCase replace replaceAll padStart padEnd startsWith endsWith repeat charAt normalize toString toFixed then catch finally min max length optional nullable nullish default prefault catch array or and transform refine superRefine check pipe brand readonly strict strip passthrough partial required pick omit extend merge safeExtend keyof element int positive negative nonnegative nonpositive email url uuid cuid regex datetime date time finite safe multipleOf step gt gte lt lte nonempty size lowercase uppercase overwrite unwrap exclude extract options".split(" ")
);
var CALLS_BACK = /* @__PURE__ */ new Set(["Array.from", "Promise", "JSON.parse", "JSON.stringify"]);
function calleeText(n) {
  const c = n.type === "TaggedTemplateExpression" ? n.tag : n.callee;
  const dotted = (x) => {
    x = unwrap(x);
    if (x.type === "Identifier") return x.name;
    if (x.type === "CallExpression") {
      const c2 = dotted(x.callee);
      return c2 && `${c2}()`;
    }
    if (x.type === "MetaProperty")
      return `${x.meta.name}.${x.property.name}`;
    if (x.type === "MemberExpression" && !x.computed) {
      const o = dotted(x.object);
      const p = keyName(x.property, false);
      return o && p ? `${o}.${p}` : null;
    }
    return null;
  };
  return dotted(c) ?? "an expression";
}
function isPureCall(n) {
  const name2 = calleeText(n);
  if (CALLS_BACK.has(name2)) return inlineArgs(n);
  if (PURE_CALLS2.has(name2) || PURE_PREFIXES2.some((p) => name2.startsWith(p))) return true;
  const callee = unwrap(n.type === "TaggedTemplateExpression" ? n.tag : n.callee);
  if (callee.type !== "MemberExpression" || callee.computed) return false;
  const method = keyName(callee.property, false);
  if (method === null || !PURE_METHODS.has(method) || !inlineArgs(n)) return false;
  const obj = unwrap(callee.object);
  if (obj.type === "CallExpression" || obj.type === "NewExpression") return isPureCall(obj);
  return ["ArrayExpression", "ObjectExpression", "Literal", "TemplateLiteral"].includes(obj.type);
}
function inlineArgs(n) {
  const inline = /* @__PURE__ */ new Set([
    "Literal",
    "TemplateLiteral",
    "ArrowFunctionExpression",
    "FunctionExpression",
    "ObjectExpression",
    "ArrayExpression"
  ]);
  return (n.arguments ?? []).every((a) => inline.has(unwrap(a).type));
}
function rootName(n) {
  let cur = n;
  while (cur.type === "MemberExpression" || cur.type === "TSNonNullExpression" || cur.type === "ParenthesizedExpression")
    cur = cur.type === "MemberExpression" ? cur.object : cur.expression;
  return cur.type === "Identifier" ? cur.name : null;
}
function patternNames(p, out2) {
  if (!isNode(p)) return out2;
  switch (p.type) {
    case "Identifier":
      out2.push(p.name);
      break;
    case "ObjectPattern":
      for (const prop of p.properties)
        patternNames(prop.type === "RestElement" ? prop.argument : prop.value, out2);
      break;
    case "ArrayPattern":
      for (const e of p.elements) patternNames(e, out2);
      break;
    case "AssignmentPattern":
      patternNames(p.left, out2);
      break;
    case "RestElement":
      patternNames(p.argument, out2);
      break;
    case "TSParameterProperty":
      patternNames(p.parameter, out2);
      break;
  }
  return out2;
}
function tsRefs(path, source) {
  let r;
  try {
    r = parseTs(path, source);
  } catch (e) {
    return { error: String(e) };
  }
  const fatal = r.errors.filter((e) => e.severity === "Error");
  if (fatal.length) return { error: fatal[0].message };
  const line = lineIndex(source);
  const out2 = {
    statements: [],
    fnRefs: /* @__PURE__ */ new Map(),
    imports: [],
    exports: [],
    specRefs: [],
    dynamicLoaders: []
  };
  const classNames = [];
  let stmtIndex = 0;
  let mockDepth = 0;
  let destructured = null;
  const names2 = (n) => destructured?.node === n ? { names: destructured.names } : {};
  let stmt = null;
  const ref = (name2, fn) => {
    if (fn === null) stmt?.refs.add(name2);
    else {
      let s = out2.fnRefs.get(name2);
      if (!s) out2.fnRefs.set(name2, s = /* @__PURE__ */ new Set());
      s.add(fn);
    }
  };
  const member = (obj, m, fn) => {
    const name2 = obj.name;
    const p = m.property;
    const prop = p.type === "JSXIdentifier" ? p.name : keyName(p, false);
    if (prop !== null) ref(`${name2}.${prop}`, fn);
    ref(`${name2}.`, fn);
  };
  const pattern = (p, fn) => {
    if (!isNode(p)) return;
    switch (p.type) {
      case "Identifier":
        return;
      case "ObjectPattern":
        for (const prop of p.properties) {
          if (prop.type === "RestElement") pattern(prop.argument, fn);
          else {
            if (prop.computed) walk(prop.key, prop, "key", fn);
            pattern(prop.value, fn);
          }
        }
        return;
      case "ArrayPattern":
        for (const e of p.elements) pattern(e, fn);
        return;
      case "AssignmentPattern":
        pattern(p.left, fn);
        walk(p.right, p, "right", fn);
        return;
      case "RestElement":
        pattern(p.argument, fn);
        return;
      case "TSParameterProperty":
        for (const d of p.decorators ?? []) walk(d, p, "decorators", fn);
        pattern(p.parameter, fn);
        return;
      default:
        walk(p, null, "", fn);
    }
  };
  const walk = (n, parent, key, fn) => {
    if (isTypeOnly(n) || n.type.startsWith("TSType") && n.type !== "TSTypeAssertion") return;
    if (fn === null && stmt && n.decorators?.length && MEMBERS2.has(n.type))
      stmt.opaque ??= "decorated class member";
    const name2 = functionName(n, parent, classNames);
    if (name2) {
      fn = name2;
      stmt?.fns.push(name2);
    }
    switch (n.type) {
      case "Identifier": {
        if (!parent) return ref(n.name, fn);
        const t = parent.type;
        if (key === "object" && t === "MemberExpression" && !parent.computed) return member(n, parent, fn);
        if (key === "property" && t === "MemberExpression" && !parent.computed) return;
        if (key === "key" && !parent.computed && t !== "AssignmentPattern") return;
        if (key === "label" || key === "meta" || key === "property" && t === "MetaProperty") return;
        if (key === "id" && t !== "TSImportEqualsDeclaration") return;
        if (key === "exported" || key === "local" || key === "imported") return;
        return ref(n.name, fn);
      }
      case "JSXIdentifier":
        if (key === "name" && parent?.type === "JSXAttribute") return;
        if (key === "property" && parent?.type === "JSXMemberExpression") return;
        if (key === "object" && parent?.type === "JSXMemberExpression") return member(n, parent, fn);
        return ref(n.name, fn);
      case "VariableDeclarator": {
        pattern(n.id, fn);
        if (!isNode(n.init)) return;
        const load = n.init.type === "AwaitExpression" ? n.init.argument : n.init;
        const keys = isNode(n.id) && n.id.type === "ObjectPattern" ? n.id.properties : null;
        if (keys && keys.every((k) => k.type === "Property" && keyName(k.key, k.computed) !== null)) {
          destructured = { node: load, names: keys.map((k) => keyName(k.key, k.computed)) };
        }
        walk(n.init, n, "init", fn);
        destructured = null;
        return;
      }
      case "CatchClause":
        pattern(n.param, fn);
        walk(n.body, n, "body", fn);
        return;
      case "WithStatement":
        out2.dynamicScope ??= "with statement";
        break;
      case "StaticBlock":
        if (fn === null && stmt) stmt.opaque ??= "class static block";
        break;
      case "NewExpression":
      case "TaggedTemplateExpression":
        if (fn === null && stmt && !mockDepth && !isPureCall(n)) stmt.opaque ??= `call to ${calleeText(n)}`;
        break;
      case "ImportExpression": {
        if (mockDepth) break;
        const s = staticString(n.source);
        if (s === null) out2.dynamicLoaders.push(fn);
        else out2.specRefs.push({ spec: s, fn, stmt: stmtIndex, ...names2(n) });
        break;
      }
      case "CallExpression": {
        const callee = n.callee;
        const args2 = n.arguments;
        if (callee.type === "Identifier" && callee.name === "eval") out2.dynamicScope ??= "eval";
        const glob = calleeText(n);
        if (/^import\.meta\.(glob|webpackContext)|^require\.context$/.test(glob)) out2.dynamicLoaders.push(fn);
        const s = args2.length ? staticString(args2[0]) : null;
        if (mockDepth) break;
        if (fn === null && stmt && !isPureCall(n)) stmt.opaque ??= `call to ${calleeText(n)}`;
        if (callee.type === "Identifier" && callee.name === "require") {
          if (s === null) out2.dynamicLoaders.push(fn);
          else out2.specRefs.push({ spec: s, fn, stmt: stmtIndex, ...names2(n) });
        } else if (isMockCall(callee)) {
          mockDepth++;
          for (const k in n) {
            const v = n[k];
            if (Array.isArray(v)) {
              for (const c of v) if (isNode(c)) walk(c, n, k, fn);
            } else if (isNode(v) && k !== "type") walk(v, n, k, fn);
          }
          mockDepth--;
          return;
        } else if (s !== null && isLoadCall(callee)) {
          out2.specRefs.push({ spec: s, fn, stmt: stmtIndex, ...names2(n) });
        }
        break;
      }
    }
    if (n.type === "FunctionDeclaration" || n.type === "FunctionExpression" || n.type === "ArrowFunctionExpression") {
      for (const p of n.params) pattern(p, fn);
      if (isNode(n.body)) walk(n.body, n, "body", fn);
      return;
    }
    const isClass = CLASS.has(n.type);
    if (isClass) classNames.push(isNode(n.id) ? n.id.name : null);
    for (const k in n) {
      if (k === "type" || k === "start" || k === "end" || TYPE_KEYS.has(k)) continue;
      const v = n[k];
      if (Array.isArray(v)) {
        for (const c of v) if (isNode(c)) walk(c, n, k, fn);
      } else if (isNode(v)) walk(v, n, k, fn);
    }
    if (isClass) classNames.pop();
  };
  const localDefs = /* @__PURE__ */ new Set();
  const freshDefs = /* @__PURE__ */ new Set();
  const assignments = [];
  const body2 = r.program.body;
  body2.forEach((s, i2) => {
    stmtIndex = i2;
    const stmt0 = {
      start: line(s.start),
      end: line(s.end),
      defines: [],
      refs: /* @__PURE__ */ new Set(),
      fns: []
    };
    stmt = stmt0;
    out2.statements.push(stmt0);
    if (isTypeOnly(s)) return;
    let decl = s;
    if (s.type === "ExportNamedDeclaration") {
      const exportsFrom = isNode(s.source) ? s.source.value : void 0;
      for (const sp of s.specifiers) {
        if (sp.exportKind === "type") continue;
        const local = keyName(sp.local, false) ?? "?";
        const exported = keyName(sp.exported, false) ?? local;
        out2.exports.push(
          exportsFrom ? { exported, spec: exportsFrom, imported: local, stmt: i2 } : { exported, local, stmt: i2 }
        );
        if (!exportsFrom) stmt0.refs.add(local);
      }
      if (!isNode(s.declaration)) return;
      decl = s.declaration;
      if (isTypeOnly(decl)) return;
    } else if (s.type === "ExportAllDeclaration") {
      const spec = s.source.value;
      const ns = isNode(s.exported) ? keyName(s.exported, false) : null;
      out2.exports.push(
        ns ? { exported: ns, spec, imported: "*", stmt: i2 } : { exported: "*", spec, stmt: i2 }
      );
      return;
    } else if (s.type === "ExportDefaultDeclaration") {
      decl = s.declaration;
      const id = isNode(decl.id) ? decl.id.name : null;
      stmt0.defines.push("default");
      if (id) {
        stmt0.defines.push(id);
        localDefs.add(id);
        freshDefs.add(id);
      }
      out2.exports.push({ exported: "default", local: id ?? "default", stmt: i2 });
      if (CLASS.has(decl.type) && decl.decorators?.length)
        stmt0.opaque = "decorated class";
      walk(decl, s, "declaration", null);
      return;
    }
    switch (decl.type) {
      case "ImportDeclaration": {
        stmt0.isImport = true;
        const spec = decl.source.value;
        const specs = decl.specifiers;
        if (!specs.length) stmt0.opaque = "side-effect import";
        for (const sp of specs) {
          if (sp.importKind === "type") continue;
          const imported = sp.type === "ImportDefaultSpecifier" ? "default" : sp.type === "ImportNamespaceSpecifier" ? "*" : keyName(sp.imported, false) ?? "?";
          const local = sp.local.name;
          out2.imports.push({ local, spec, imported });
          stmt0.defines.push(local);
        }
        return;
      }
      case "TSImportEqualsDeclaration": {
        stmt0.isImport = true;
        const local = decl.id.name;
        stmt0.defines.push(local);
        const ref2 = decl.moduleReference;
        if (ref2.type === "TSExternalModuleReference") {
          const spec = ref2.expression.value;
          out2.imports.push({ local, spec, imported: "*" });
        } else {
          walk(ref2, decl, "moduleReference", null);
        }
        return;
      }
      case "VariableDeclaration":
        for (const d of decl.declarations) {
          patternNames(d.id, stmt0.defines);
          if (isNode(d.id) && d.id.type === "Identifier" && isNode(d.init) && FRESH2.has(unwrap(d.init).type))
            freshDefs.add(d.id.name);
        }
        break;
      case "FunctionDeclaration":
      case "ClassDeclaration":
      case "TSEnumDeclaration":
      case "TSModuleDeclaration":
        if (isNode(decl.id) && decl.id.type === "Identifier") {
          stmt0.defines.push(decl.id.name);
          freshDefs.add(decl.id.name);
        } else stmt0.opaque = "unnamed declaration";
        if (CLASS.has(decl.type) && decl.decorators?.length)
          stmt0.opaque = "decorated class";
        if (decl.type === "TSModuleDeclaration" && JSON.stringify(decl.body ?? null).includes('"ExpressionStatement"'))
          stmt0.opaque = "namespace with statements";
        break;
      case "ExpressionStatement": {
        const e = decl.expression;
        if (typeof decl.directive === "string") stmt0.opaque = "directive";
        else if (e.type === "AssignmentExpression" || e.type === "UpdateExpression") {
          assignments.push([
            stmt0,
            rootName(e.type === "AssignmentExpression" ? e.left : e.argument)
          ]);
        } else stmt0.opaque = "top-level expression";
        break;
      }
      case "EmptyStatement":
        return;
      case "TSExportAssignment":
        stmt0.opaque = "export =";
        break;
      default:
        stmt0.opaque = `top-level ${decl.type}`;
    }
    for (const d of stmt0.defines) localDefs.add(d);
    if (s !== decl) for (const d of stmt0.defines) out2.exports.push({ exported: d, local: d, stmt: i2 });
    walk(decl, s === decl ? null : s, "declaration", null);
  });
  for (const [s, root] of assignments) {
    if (root && freshDefs.has(root)) s.defines.push(root);
    else s.opaque = `assignment to ${root ?? "an expression"}`;
  }
  return out2;
}

// ../engine/src/refs/tree.ts
var BLOB_CACHE_LIMIT = 5e4;
var blobCache = /* @__PURE__ */ new Map();
function gitTree(repo, rev) {
  let ids = null;
  let paths = null;
  const list3 = () => {
    if (ids) return ids;
    ids = /* @__PURE__ */ new Map();
    for (const l of git(repo, ["ls-tree", "-r", "-z", "--full-tree", rev]).split("\0")) {
      const tab = l.indexOf("	");
      if (tab < 0) continue;
      const [, type, id] = l.slice(0, tab).split(" ");
      if (type === "blob") ids.set(l.slice(tab + 1), id);
    }
    return ids;
  };
  const prefetch = (paths2) => {
    const missing = [
      ...new Set(paths2.map((p) => list3().get(p)).filter((id) => !!id && !blobCache.has(id)))
    ];
    if (!missing.length) return;
    if (blobCache.size + missing.length > BLOB_CACHE_LIMIT) blobCache.clear();
    for (const [id, text] of readBlobs(repo, missing)) blobCache.set(id, text);
  };
  return {
    paths: () => paths ??= [...list3().keys()],
    read: (p) => {
      const id = list3().get(p);
      if (!id) return null;
      if (!blobCache.has(id)) prefetch([p]);
      return blobCache.get(id) ?? null;
    },
    prefetch,
    id: (p) => list3().get(p)
  };
}

// ../engine/src/refs/index.ts
var resolvers = /* @__PURE__ */ new WeakMap();
var resolverFor = (ctx) => {
  let r = resolvers.get(ctx.tree);
  if (!r) resolvers.set(ctx.tree, r = new Resolver(ctx.tree, ctx.workspaces));
  return r;
};
var REFS_CACHE_LIMIT = 2e4;
var refsCache = /* @__PURE__ */ new Map();
var regexCache = /* @__PURE__ */ new Map();
function quotedAround(src, needle) {
  const out2 = [];
  for (let i2 = src.indexOf(needle), n = 0; i2 >= 0; i2 = src.indexOf(needle, i2 + needle.length), n++) {
    if (n > 200) return null;
    const lineStart = src.lastIndexOf("\n", i2) + 1;
    let j = QUOTES.includes(needle[0]) ? i2 : i2 - 1;
    while (j >= lineStart && !QUOTES.includes(src[j])) j--;
    if (j < lineStart) continue;
    const end = src.indexOf(src[j], i2 + needle.length);
    const lineEnd = src.indexOf("\n", i2);
    if (end < 0 || lineEnd >= 0 && end > lineEnd) continue;
    out2.push(src.slice(j + 1, end));
  }
  return out2;
}
var QUOTES = `'"\``;
var PY_IMPORT = /^[ \t]*(?:from[ \t]+(\.*[\w.]*)[ \t]+import[ \t]+(\([^)]*\)|[^\n#]*(?:\\\n[^\n#]*)*)|import[ \t]+([^\n#;]+))/gm;
var pyImportCache = /* @__PURE__ */ new Map();
var pyIndexes = /* @__PURE__ */ new WeakMap();
function pyIndex(tree, files, resolve7) {
  let index = pyIndexes.get(tree);
  if (index) return index;
  index = /* @__PURE__ */ new Map();
  for (const p of files) {
    const src = tree.read(p);
    if (!src) continue;
    for (const m of pyImportedModules(src, tree.id?.(p))) {
      const r = resolve7(p, m);
      if (!Array.isArray(r)) continue;
      for (const t of r) {
        let s = index.get(t);
        if (!s) index.set(t, s = /* @__PURE__ */ new Set());
        s.add(p);
      }
    }
  }
  pyIndexes.set(tree, index);
  return index;
}
function pyImportedModules(src, id) {
  const hit = id ? pyImportCache.get(id) : void 0;
  if (hit) return hit;
  const out2 = [];
  const first = (x) => x.trim().split(/\s+/)[0] ?? "";
  for (const m of src.matchAll(PY_IMPORT)) {
    if (m[3] !== void 0) {
      for (const part of m[3].split(",")) if (first(part)) out2.push(first(part));
      continue;
    }
    const mod = m[1];
    out2.push(mod);
    for (const part of m[2].replace(/[()\\]/g, " ").split(",")) {
      const name2 = first(part);
      if (name2 && name2 !== "*") out2.push(mod.endsWith(".") ? mod + name2 : `${mod}.${name2}`);
    }
  }
  if (id) {
    if (pyImportCache.size >= REFS_CACHE_LIMIT) pyImportCache.clear();
    pyImportCache.set(id, out2);
  }
  return out2;
}
var keysFor = (name2) => [name2, `${name2}.`];
var nsKeys = (ns, members) => [
  ns,
  `${ns}.__dict__`,
  ...[...members].map((m) => `${ns}.${m}`)
];
var plain = (key) => !key.includes(".");
function moduleRefs(path, source, id) {
  const key = id ? `${path}\0${id}` : null;
  const hit = key ? refsCache.get(key) : void 0;
  if (hit) return hit;
  const r = isPy(path) ? pyRefs(path, source) : tsRefs(path, source);
  if (key) {
    if (refsCache.size >= REFS_CACHE_LIMIT) refsCache.clear();
    refsCache.set(key, r);
  }
  return r;
}
var JS_LOADER = /\b(?:import|require)\s*\(\s*(?:[^'"`\s)]|`[^`]*\$\{)|import\.meta\.(?:glob|webpackContext)|require\.context\s*\(/;
var PY_LOADER = /\b(?:import_module|__import__)\s*\(/;
var NAMESPACE_HINT = /\*\s*as\b|export\s*\*|\brequire\s*\(|\bimport\s*\(|\bimport\s+\w+\s*=|Actual\s*\(/g;
var nsSpecCache = /* @__PURE__ */ new Map();
function namespaceSpecs(src, id) {
  const hit = id ? nsSpecCache.get(id) : void 0;
  if (hit) return hit;
  const out2 = [];
  for (const m of src.matchAll(NAMESPACE_HINT)) {
    const q = /(['"`])([^'"`\n]*)\1/.exec(src.slice(m.index, m.index + 300));
    out2.push(q ? q[2] : "");
  }
  if (id) {
    if (nsSpecCache.size >= REFS_CACHE_LIMIT) nsSpecCache.clear();
    nsSpecCache.set(id, out2);
  }
  return out2;
}
var add = (set, xs) => {
  for (const x of xs) set.add(x);
};
function resolveReferences(seeds, ctx) {
  const res = {
    units: /* @__PURE__ */ new Set(),
    tests: /* @__PURE__ */ new Set(),
    fileLevel: /* @__PURE__ */ new Map(),
    names: /* @__PURE__ */ new Map(),
    parsed: 0,
    importers: /* @__PURE__ */ new Map()
  };
  const budget = ctx.maxFiles ?? 400;
  const over = () => {
    if (res.parsed <= budget) return false;
    res.exhausted ??= `more than ${budget} files to follow`;
    return true;
  };
  const parsedPaths = /* @__PURE__ */ new Set();
  const { tree } = ctx;
  const resolve7 = () => resolverFor(ctx);
  const exportedSeen = /* @__PURE__ */ new Map();
  let loadersDone = { js: false, py: false };
  const refsOf = (path) => {
    if (!parsedPaths.has(path)) {
      parsedPaths.add(path);
      res.parsed++;
    }
    const src = tree.read(path);
    if (src === null) return { error: "not found at head" };
    return moduleRefs(path, src, tree.id?.(path));
  };
  const widen = (path, why) => {
    if (ctx.isTest(path)) res.tests.add(path);
    else if (!res.fileLevel.has(path)) res.fileLevel.set(path, why);
  };
  const sourcesOf = /* @__PURE__ */ (() => {
    const cache2 = /* @__PURE__ */ new Map();
    return (lang) => {
      let list3 = cache2.get(lang);
      if (!list3) {
        const test = lang === "js" ? isJs : isPy;
        list3 = tree.paths().filter((p) => test(p) && !p.includes("node_modules/"));
        tree.prefetch?.(list3);
        cache2.set(lang, list3);
      }
      return list3;
    };
  })();
  const addLoaders = (lang) => {
    if (loadersDone[lang]) return;
    loadersDone = { ...loadersDone, [lang]: true };
    const rx = lang === "js" ? JS_LOADER : PY_LOADER;
    for (const p of sourcesOf(lang)) {
      if (over()) return;
      const src = tree.read(p);
      if (!src || !cachedTest(rx, p, src)) continue;
      const r = refsOf(p);
      if ("error" in r) continue;
      for (const fn of r.dynamicLoaders) {
        if (fn === null) widen(p, "dynamic import at module level");
        else if (ctx.isTest(p)) res.tests.add(p);
        else res.units.add(fnId(p, fn));
      }
    }
  };
  const cachedTest = (rx, p, src) => {
    const id = tree.id?.(p);
    const key = id && `${rx.source}\0${id}`;
    let hit = key ? regexCache.get(key) : void 0;
    if (hit === void 0) {
      hit = rx.test(src);
      if (key) {
        if (regexCache.size >= REFS_CACHE_LIMIT) regexCache.clear();
        regexCache.set(key, hit);
      }
    }
    return hit;
  };
  const namedByString = (path) => {
    const parts2 = resolve7().pyModuleName(path).split(".");
    const names2 = parts2.map((_, i2) => parts2.slice(i2).join(".")).filter((n) => n.includes("."));
    if (!names2.length) return null;
    for (const p of sourcesOf("py")) {
      const src = tree.read(p);
      if (!src || !src.includes(names2.at(-1))) continue;
      for (const n of names2) if (src.includes(`"${n}"`) || src.includes(`'${n}'`)) return n;
    }
    return null;
  };
  const importersOf = (path, exported) => isPy(path) ? pyImportersOf(path) : jsImportersOf(path, exported);
  const pyImportersOf = (path) => {
    const index = pyIndex(tree, sourcesOf("py"), (p, m) => resolve7().py(p, m));
    const cands = new Set(index.get(path) ?? []);
    const needles = stems(path);
    for (const p of sourcesOf("py")) {
      if (cands.has(p) || p === path) continue;
      const src = tree.read(p);
      if (src && cachedTest(PY_LOADER, p, src) && needles.some((n) => mentions(src, n, p, path)))
        cands.add(p);
    }
    cands.delete(path);
    res.importers.set(path, cands);
    const out2 = [];
    for (const p of cands) {
      if (over()) break;
      const r = refsOf(p);
      if ("error" in r) widen(p, `parse error: ${r.error}`);
      else out2.push([p, r]);
    }
    return out2;
  };
  const jsImportersOf = (path, exported) => {
    const lang = "js";
    const needles = [...stems(path), ...resolve7().packageNamesFor(path), ...resolve7().aliasNeedles(path)];
    const named = [...exported].filter((e) => e !== "default" && e !== "*");
    const anyName = exported.has("default") || exported.has("*");
    const out2 = [];
    const importers = /* @__PURE__ */ new Set();
    res.importers.set(path, importers);
    for (const p of sourcesOf(lang)) {
      if (over()) break;
      if (p === path) continue;
      const src = tree.read(p);
      if (!src || !needles.some((n) => src.includes(n))) continue;
      if (!needles.some((n) => mentions(src, n, p, path))) continue;
      importers.add(p);
      if (!anyName && !named.some((n) => src.includes(n)) && !namespaceSpecs(src, tree.id?.(p)).some((q) => q === "" || mayResolveTo(p, q, path)))
        continue;
      const r = refsOf(p);
      if ("error" in r) {
        widen(p, `parse error: ${r.error}`);
        continue;
      }
      out2.push([p, r]);
    }
    return out2;
  };
  const mentions = (src, needle, from, path) => {
    const qs = quotedAround(src, needle);
    return qs === null || qs.some((q) => mayResolveTo(from, q, path));
  };
  const mayResolveTo = (from, spec, path) => {
    if (isPy(from)) {
      const r = resolve7().py(from, spec);
      return r !== "external" && r !== "unknown" && r.includes(path);
    }
    return mayBe(resolve7().js(from, spec), spec, path);
  };
  const queue = [];
  const enqueue = (path, names2, exported = []) => queue.push({ path, names: new Set(names2), exported: new Set(exported) });
  for (const s of seeds) {
    enqueue(s.path, [...s.names].flatMap(keysFor), s.exported);
    if (s.added) addLoaders(isPy(s.path) ? "py" : "js");
  }
  while (queue.length) {
    if (over()) break;
    const { path, names: incoming, exported: incomingExported } = queue.shift();
    if (res.fileLevel.has(path) || res.tests.has(path)) continue;
    const r = refsOf(path);
    if ("error" in r) {
      widen(path, `parse error: ${r.error}`);
      continue;
    }
    let names2 = res.names.get(path);
    if (!names2) res.names.set(path, names2 = /* @__PURE__ */ new Set());
    const fresh = [...incoming].filter((n) => !names2.has(n));
    for (const n of fresh) names2.add(n);
    if (fresh.length && r.dynamicScope) {
      widen(path, r.dynamicScope);
      continue;
    }
    let widened = false;
    const done = /* @__PURE__ */ new Set();
    for (let grew = fresh.length > 0; grew && !widened; ) {
      grew = false;
      r.statements.forEach((s, i2) => {
        if (widened || done.has(i2) || s.isImport) return;
        let hit = null;
        for (const x of s.refs)
          if (names2.has(x)) {
            hit = x;
            break;
          }
        if (hit === null) return;
        done.add(i2);
        if (s.opaque) {
          widen(path, `${s.opaque} uses ${hit} (line ${s.start})`);
          widened = true;
          return;
        }
        for (const fn of s.fns) res.units.add(fnId(path, fn));
        for (const d of s.defines)
          for (const k of keysFor(d))
            if (!names2.has(k)) {
              names2.add(k);
              fresh.push(k);
              grew = true;
            }
      });
    }
    if (widened) continue;
    for (const n of fresh) for (const fn of r.fnRefs.get(n) ?? []) res.units.add(fnId(path, fn));
    if (ctx.isTest(path)) {
      const uses = (k) => r.fnRefs.has(k) || r.statements.some((s) => !s.isImport && s.refs.has(k));
      if ([...names2].some(uses)) res.tests.add(path);
      continue;
    }
    let seenExp = exportedSeen.get(path);
    if (!seenExp) exportedSeen.set(path, seenExp = /* @__PURE__ */ new Set());
    const exp = /* @__PURE__ */ new Set();
    const freshSet = new Set(fresh);
    for (const e of incomingExported) exp.add(e);
    for (const e of r.exports) if (e.local !== void 0 && freshSet.has(e.local)) exp.add(e.exported);
    if (r.exportsAll) {
      for (const n of fresh) if (plain(n)) exp.add(n);
    }
    for (const e of [...exp]) if (seenExp.has(e)) exp.delete(e);
    if (!exp.size) continue;
    for (const e of exp) seenExp.add(e);
    addLoaders(isPy(path) ? "py" : "js");
    const named = isPy(path) ? namedByString(path) : null;
    if (named) {
      widen(path, `module named by string "${named}"`);
      continue;
    }
    for (const [imp, ir] of importersOf(path, exp)) {
      if (res.fileLevel.has(imp) || res.tests.has(imp)) continue;
      const nI = /* @__PURE__ */ new Set();
      const eI = /* @__PURE__ */ new Set();
      for (const b of ir.imports) {
        if (isPy(imp)) {
          const mod = b.spec;
          if (b.packages) {
            const parts2 = mod.split(".");
            if (parts2.some((_, k) => mayResolveTo(imp, parts2.slice(0, k + 1).join("."), path)))
              add(nI, keysFor(b.local));
            continue;
          }
          if (b.maybeSubmodule && mayResolveTo(imp, mod.endsWith(".") ? mod + b.imported : `${mod}.${b.imported}`, path))
            add(nI, nsKeys(b.local, exp));
          if (!mayResolveTo(imp, mod, path)) continue;
          if (b.local === "*") {
            if (exp.has("__all__")) widen(imp, `star import of ${path}, whose __all__ changed`);
            for (const e of exp) add(nI, keysFor(e));
          } else if (b.imported === "*") add(nI, nsKeys(b.local, exp));
          else if (exp.has(b.imported)) add(nI, keysFor(b.local));
        } else if (mayResolveTo(imp, b.spec, path)) {
          if (b.imported === "*") add(nI, nsKeys(b.local, exp));
          else if (exp.has(b.imported)) add(nI, keysFor(b.local));
        }
      }
      for (const e of ir.exports) {
        if (e.spec === void 0 || !mayResolveTo(imp, e.spec, path)) continue;
        if (e.exported === "*")
          add(
            eI,
            [...exp].filter((x) => x !== "default")
          );
        else if (e.imported === "*" || exp.has(e.imported)) eI.add(e.exported);
      }
      for (const sr of ir.specRefs) {
        if (!mayResolveTo(imp, sr.spec, path)) continue;
        if (sr.names && !sr.names.some((n) => exp.has(n))) continue;
        if (sr.fn !== null) {
          if (ctx.isTest(imp)) res.tests.add(imp);
          else res.units.add(fnId(imp, sr.fn));
          continue;
        }
        const s = ir.statements[sr.stmt];
        if (!s || s.opaque) widen(imp, `${s?.opaque ?? "statement"} loads ${path}`);
        else {
          for (const d of s.defines) add(nI, keysFor(d));
          for (const fn of s.fns) res.units.add(fnId(imp, fn));
        }
      }
      if (!nI.size && !eI.size) continue;
      enqueue(imp, nI, eI);
    }
  }
  for (const [p, keys] of res.names) res.names.set(p, new Set([...keys].filter(plain)));
  for (const u of res.units) {
    const p = u.slice(0, u.lastIndexOf("::"));
    if (res.fileLevel.has(p)) res.units.delete(u);
  }
  return res;
}
function resolveSpecAll(ctx, from, spec) {
  const r = resolverFor(ctx);
  return isPy(from) ? r.py(from, spec) : r.js(from, spec);
}
function resolveSpec(ctx, from, spec) {
  const r = isPy(from) ? resolverFor(ctx).py(from, spec) : resolverFor(ctx).js(from, spec);
  return Array.isArray(r) && r.length ? r[0] : null;
}
function exportedNames(path, ctx, seen = /* @__PURE__ */ new Set()) {
  if (seen.has(path)) return /* @__PURE__ */ new Set();
  seen.add(path);
  const src = ctx.tree.read(path);
  if (src === null) return null;
  const r = moduleRefs(path, src, ctx.tree.id?.(path));
  if ("error" in r) return null;
  const out2 = /* @__PURE__ */ new Set();
  if (r.exportsAll) {
    for (const s of r.statements) for (const d of s.defines) out2.add(d);
    return out2;
  }
  const resolver = resolverFor(ctx);
  for (const e of r.exports) {
    if (e.exported !== "*") {
      out2.add(e.exported);
      continue;
    }
    const target = resolver.js(path, e.spec);
    if (target === "external" || target === "unknown" || !target.length) return null;
    const names2 = exportedNames(target[0], ctx, seen);
    if (!names2) return null;
    for (const n of names2) if (n !== "default") out2.add(n);
  }
  return out2;
}
function pyBaseRegisters(ctx, path, name2) {
  const r = refsAt(ctx, path);
  if (!r) return true;
  const seen = /* @__PURE__ */ new Set();
  return (r.classes?.bases.get(name2) ?? []).some((b) => pyClassRegisters(ctx, path, r, b, seen));
}
function refsAt(ctx, path) {
  const src = ctx.tree.read(path);
  if (src === null) return null;
  const r = moduleRefs(path, src, ctx.tree.id?.(path));
  return "error" in r ? null : r;
}
function pyClassRegisters(ctx, path, r, expr, seen) {
  const text = expr.replace(/\[.*$/, "");
  const key = `${path}\0${text}`;
  if (seen.has(key)) return false;
  seen.add(key);
  if (seen.size > 200) return true;
  if (!/^\w+(\.\w+)*$/.test(text)) return false;
  const parts2 = text.split(".");
  const local = parts2[0];
  const imp = r.imports.find((b) => b.local === local);
  if (parts2.length === 1 && !imp) {
    if (r.classes?.registering.has(local)) return true;
    if (r.classes?.bases.has(local))
      return r.classes.bases.get(local).some((b) => pyClassRegisters(ctx, path, r, b, seen));
    return r.statements.some((s) => !s.isImport && s.defines.includes(local));
  }
  if (!imp) return false;
  let mod;
  let rest;
  if (imp.packages) [mod, rest] = [parts2.slice(0, -1).join("."), parts2.slice(-1)];
  else if (imp.imported === "*") [mod, rest] = [imp.spec, parts2.slice(1)];
  else {
    const sub = imp.spec.endsWith(".") ? imp.spec + imp.imported : `${imp.spec}.${imp.imported}`;
    const asModule = parts2.length > 1 ? resolveAll(ctx, path, sub) : [];
    if (asModule.length) [mod, rest] = [sub, parts2.slice(1)];
    else [mod, rest] = [imp.spec, [imp.imported, ...parts2.slice(1)]];
  }
  const targets = resolveAll(ctx, path, mod);
  if (rest.length !== 1) return targets.length > 0;
  for (const target of targets) {
    const tr = refsAt(ctx, target);
    if (!tr || pyClassRegisters(ctx, target, tr, rest[0], seen)) return true;
  }
  return false;
}
function resolveAll(ctx, from, spec) {
  const r = resolverFor(ctx).py(from, spec);
  return Array.isArray(r) ? r : [];
}

// ../engine/src/spans/types.ts
function lineUnits(spans, opts) {
  const n = spans.lineCount;
  const fn = new Array(n + 2).fill(null);
  const ordered = [...spans.functions].sort(
    (a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start
  );
  for (const s of ordered) for (let i2 = Math.max(1, s.start); i2 <= Math.min(n, s.end); i2++) fn[i2] = s.name;
  const typeLine = new Uint8Array(n + 2);
  for (const [a, b] of spans.typeRanges) for (let i2 = a; i2 <= Math.min(n, b); i2++) typeLine[i2] = 1;
  const importLine = new Uint8Array(n + 2);
  for (const [a, b] of spans.importRanges) for (let i2 = a; i2 <= Math.min(n, b); i2++) importLine[i2] = 1;
  if (opts.reexportLines === "inert")
    for (const [a, b] of spans.reexportRanges ?? [])
      for (let i2 = a; i2 <= Math.min(n, b); i2++) importLine[i2] = 1;
  return (line) => {
    if (spans.blankLines.has(line) || typeLine[line]) return { kind: "inert" };
    const name2 = fn[line];
    if (name2) return { kind: "function", name: name2 };
    if (importLine[line]) return opts.importLines === "inert" ? { kind: "inert" } : { kind: "module" };
    return { kind: "module" };
  };
}

// ../engine/src/spans/index.ts
var PARSERS = [typescriptParser, pythonParser];
function initParsers() {
  return initPython();
}
function parserFor(path) {
  if (path.endsWith(".d.ts") || path.endsWith(".d.mts") || path.endsWith(".d.cts")) return typescriptParser;
  const dot = path.lastIndexOf(".");
  const ext = dot < 0 ? "" : path.slice(dot);
  const p = PARSERS.find((x) => x.extensions.includes(ext));
  return p && (p.ready?.() ?? true) ? p : null;
}

// ../engine/src/workspaces.ts
var globToRegex = (g) => new RegExp(
  `^${g.replace(/\/+$/, "").split("**").map((part) => part.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]+")).join(".+")}$`
);
function pnpmWorkspaceGlobs(yaml) {
  const out2 = [];
  let inPackages = false;
  for (const raw2 of yaml.split("\n")) {
    const line = raw2.replace(/#.*$/, "");
    if (/^packages\s*:/.test(line)) inPackages = true;
    else if (/^\S/.test(line)) inPackages = false;
    else if (inPackages) {
      const m = /^\s*-\s*['"]?([^'"]+?)['"]?\s*$/.exec(line);
      if (m) out2.push(m[1]);
    }
  }
  return out2;
}
function workspaceDirs(globs, files) {
  const dirs = [...files].filter((f) => f.endsWith("/package.json")).map((f) => f.slice(0, -"/package.json".length));
  const inc = globs.filter((g) => !g.startsWith("!")).map(globToRegex);
  const exc = globs.filter((g) => g.startsWith("!")).map((g) => globToRegex(g.slice(1)));
  return dirs.filter(
    (d) => !d.includes("node_modules/") && inc.some((r) => r.test(d)) && !exc.some((r) => r.test(d))
  );
}
function readWorkspaces(repo, rev) {
  const files = git(repo, ["ls-tree", "-r", "--name-only", rev]).split("\n").filter(Boolean);
  const top = readBlobs(repo, [`${rev}:package.json`, `${rev}:pnpm-workspace.yaml`]);
  let globs = [];
  const rootPkg = top.get(`${rev}:package.json`);
  if (rootPkg) {
    try {
      const w = JSON.parse(rootPkg).workspaces;
      globs = Array.isArray(w) ? w : w?.packages ?? [];
    } catch {
    }
  }
  const pnpm = top.get(`${rev}:pnpm-workspace.yaml`);
  if (pnpm) globs.push(...pnpmWorkspaceGlobs(pnpm));
  const dirs = workspaceDirs(globs, files);
  const blobs = readBlobs(
    repo,
    dirs.map((d) => `${rev}:${d}/package.json`)
  );
  const out2 = [];
  for (const root of dirs) {
    try {
      const p = JSON.parse(blobs.get(`${rev}:${root}/package.json`) ?? "{}");
      if (!p.name) continue;
      const deps = new Set(
        [p.dependencies, p.devDependencies, p.peerDependencies, p.optionalDependencies].flatMap(
          (d) => Object.keys(d ?? {})
        )
      );
      out2.push({ root, name: p.name, deps });
    } catch {
      continue;
    }
  }
  return out2;
}
function mergeWorkspaces(a, b) {
  const by = /* @__PURE__ */ new Map();
  for (const w of [...a, ...b]) {
    const prev = by.get(w.root);
    if (prev) for (const d of w.deps) prev.deps.add(d);
    else by.set(w.root, { root: w.root, name: w.name, deps: new Set(w.deps) });
  }
  return [...by.values()];
}
function packageAndDependents(graph, root) {
  const start2 = graph.find((w) => w.root === root);
  if (!start2) return [];
  const seen = /* @__PURE__ */ new Set([start2.name]);
  const roots = [start2.root];
  for (let changed = true; changed; ) {
    changed = false;
    for (const w of graph) {
      if (seen.has(w.name) || ![...w.deps].some((d) => seen.has(d))) continue;
      seen.add(w.name);
      roots.push(w.root);
      changed = true;
    }
  }
  return roots;
}

// ../engine/src/changes.ts
var WORKFLOW = /^\.github\/workflows\/[^/]+\.ya?ml$/;
var RUNS_TESTS = /\b(test|tests|vitest|jest|pytest|mocha|ava|playwright|cypress|jiffy)\b/i;
function swappedBindings(oldSpans, newSpans) {
  if (!oldSpans.bindings || !newSpans.bindings) return [];
  const out2 = [];
  for (const [local, from] of newSpans.bindings) {
    const before = oldSpans.bindings.get(local);
    if (before !== void 0 && before !== from) out2.push(local);
  }
  return out2;
}
function importBindings(r) {
  const m = /* @__PURE__ */ new Map();
  for (const b of r.imports)
    m.set(b.local, [m.get(b.local), `${b.spec}#${b.imported}`].filter(Boolean).join("|"));
  return m;
}
function referenceSeed(path, sides, swapped, read, ctx) {
  const names2 = new Set(swapped);
  const exported = /* @__PURE__ */ new Set();
  const units = /* @__PURE__ */ new Set();
  const refs = {};
  const refsOf = (side) => {
    const hit = refs[side];
    if (hit) return hit;
    const src = sides[side]?.src ?? read(side);
    if (src === null) return `could not read ${side} side`;
    const r = moduleRefs(path, src);
    if ("error" in r) return `parse error (${side}): ${r.error}`;
    return refs[side] = r;
  };
  for (const side of ["old", "new"]) {
    const s = sides[side];
    if (!s?.lines.length) continue;
    const r = refsOf(side);
    if (typeof r === "string") return r;
    if (r.dynamicScope) return r.dynamicScope;
    for (const l of s.lines) {
      const i2 = r.statements.findIndex((x) => x.start <= l && l <= x.end);
      const st = r.statements[i2];
      if (!st) return `line ${l} (${side}) is outside any statement`;
      if (st.opaque) return `${st.opaque} (line ${l}, ${side})`;
      if (st.isImport) {
        const other = refsOf(side === "old" ? "new" : "old");
        if (typeof other === "string") return other;
        const [a, b] = [importBindings(r), importBindings(other)];
        for (const d of st.defines) if (a.get(d) !== b.get(d)) names2.add(d);
        continue;
      }
      for (const d of st.defines) {
        if (r.classes?.bases.has(d) && pyBaseRegisters(ctx, path, d))
          return `${d} subclasses a class that registers subclasses (line ${l}, ${side})`;
        names2.add(d);
      }
      if (side === "new") for (const fn of st.fns) units.add(fnId(path, fn));
      for (const e of r.exports) {
        if (e.stmt !== i2) continue;
        if (e.exported !== "*") exported.add(e.exported);
        else {
          const target = resolveSpec(ctx, path, e.spec);
          const all = target && exportedNames(target, ctx);
          if (!all) return `export * from ${e.spec} can't be followed`;
          for (const n of all) if (n !== "default") exported.add(n);
        }
      }
    }
  }
  return { path, names: names2, exported, units };
}
function analyzeChanges(diffs, read, opts = {}) {
  const lineOpts = {
    importLines: opts.importLines ?? "inert",
    reexportLines: opts.reexportLines ?? "module"
  };
  const cs = {
    files: [],
    units: /* @__PURE__ */ new Set(),
    fileLevel: /* @__PURE__ */ new Set(),
    changedTests: /* @__PURE__ */ new Set(),
    refUnits: /* @__PURE__ */ new Set(),
    refTests: /* @__PURE__ */ new Set(),
    refImporters: /* @__PURE__ */ new Map(),
    runAll: [],
    packageScopes: []
  };
  const pending = [];
  let ctx;
  const refCtx = () => ctx ??= opts.references === false || !opts.tree ? null : {
    tree: opts.tree,
    workspaces: Array.isArray(opts.workspaces) ? opts.workspaces : void 0,
    isTest: (p) => !!opts.knownTests?.has(p) || classify(p) === "test"
  };
  const packageOf2 = (p) => opts.packageRoots?.find((r) => p.startsWith(r + "/")) ?? null;
  let graph = null;
  const workspaces = () => graph ??= typeof opts.workspaces === "function" ? opts.workspaces() : opts.workspaces ?? [];
  for (const d of diffs) {
    const kind = classify(d.path, { knownTests: opts.knownTests });
    const fc = { path: d.path, kind, status: d.status, units: [] };
    cs.files.push(fc);
    if (kind === "ignored") {
      fc.fileLevel = "read";
      continue;
    }
    if (kind === "ci" && opts.ciConfig === "ignore") continue;
    if (kind === "test") {
      cs.changedTests.add(d.path);
      continue;
    }
    if (kind === "snapshot") {
      const t = snapshotTestFile(d.path);
      if (t && (!opts.knownTests || opts.knownTests.has(t))) cs.changedTests.add(t);
      else fc.runAll = "snapshot without a known test file";
    } else if (kind === "ci" && WORKFLOW.test(d.path)) {
      const gated = opts.testWorkflows ? opts.testWorkflows.includes(d.path) : [read("new", d.path), read("old", d.path)].some((t) => t === null || RUNS_TESTS.test(t));
      if (gated) fc.runAll = "ci";
      else fc.note = "workflow does not run gated tests";
    } else if (RUN_ALL_KINDS.has(kind)) {
      const root = kind !== "lockfile" && opts.nonCodeInPackage === "package" ? packageOf2(d.path) : null;
      const dir = d.path.slice(0, Math.max(0, d.path.lastIndexOf("/")));
      const scoped = kind === "manifest" && d.path.endsWith("/package.json") ? packageAndDependents(workspaces(), dir) : [];
      if (root) fc.packageScope = [root];
      else if (scoped.length) {
        fc.packageScope = scoped;
        fc.note = "workspace manifest: package and its dependents";
      } else fc.runAll = kind === "unknown" ? "unknown file type" : kind;
    } else if (d.status === "deleted") {
      fc.fileLevel = "deleted";
    } else if (d.binary) {
      fc.fileLevel = "binary";
    } else {
      const parser2 = parserFor(d.path);
      if (!parser2) {
        fc.fileLevel = "no-parser";
      } else {
        const lines3 = changedLines(d);
        const units = /* @__PURE__ */ new Set();
        let moduleLevel = false;
        const parsedSides = {};
        const moduleSides = {};
        for (const side of ["old", "new"]) {
          const ls = lines3[side];
          if (!ls.length) continue;
          const src = read(side, d.path);
          if (src === null) {
            fc.runAll = `could not read ${side} side`;
            break;
          }
          const parsed = parser2.parse(d.path, src);
          if (!parsed.ok) {
            fc.runAll = `parse error (${side}): ${parsed.error.message}`;
            break;
          }
          parsedSides[side] = parsed.spans;
          const at = lineUnits(parsed.spans, lineOpts);
          const mod = moduleSides[side] = { src, lines: [] };
          for (const l of ls) {
            const u = at(l);
            if (u.kind === "function") units.add(fnId(d.path, u.name));
            else if (u.kind === "module") {
              moduleLevel = true;
              mod.lines.push(l);
            }
          }
        }
        fc.units = [...units];
        const swapped = opts.importSwap !== false && parsedSides.old && parsedSides.new ? swappedBindings(parsedSides.old, parsedSides.new) : [];
        const fallback = swapped.length ? "import-swap" : moduleLevel ? "module-level" : null;
        if (fallback && !fc.runAll) {
          const seed = refCtx() ? referenceSeed(d.path, moduleSides, swapped, (side) => read(side, d.path), refCtx()) : null;
          if (seed && typeof seed !== "string") pending.push({ fc, seed, fallback });
          else {
            fc.fileLevel = fallback;
            if (swapped.length) fc.note = `import source changed: ${swapped.join(", ")}`;
            else if (seed) fc.note = `references: ${seed}`;
          }
        }
        if (d.status === "added" && !fc.runAll && !fc.fileLevel && refCtx()) {
          const p = pending.find((x) => x.fc === fc);
          if (p) p.seed.added = true;
          else
            pending.push({
              fc,
              seed: { path: d.path, names: [], units: /* @__PURE__ */ new Set(), added: true },
              fallback: "module-level"
            });
        }
      }
    }
    if (fc.runAll) cs.runAll.push({ path: d.path, reason: fc.runAll });
    for (const root of fc.packageScope ?? []) cs.packageScopes.push({ path: d.path, root, reason: kind });
    for (const u of fc.units) cs.units.add(u);
  }
  for (const { fc, seed, fallback } of pending) {
    const r = resolveReferences([seed], refCtx());
    const self = r.exhausted ?? r.fileLevel.get(fc.path);
    if (self !== void 0) {
      fc.fileLevel = fallback;
      fc.note = `references: ${self}`;
      continue;
    }
    for (const u of seed.units) r.units.add(u);
    fc.references = {
      names: [...seed.names, ...seed.exported ?? []].filter((n, i2, a) => a.indexOf(n) === i2).sort(),
      units: [...r.units].sort(),
      tests: [...r.tests].sort(),
      files: [...r.fileLevel].map(([path, reason]) => ({ path, reason }))
    };
    for (const u of r.units) cs.refUnits.add(u);
    for (const t of r.tests) cs.refTests.add(t);
    for (const p of r.fileLevel.keys()) cs.fileLevel.add(p);
    for (const [p, imps] of r.importers) {
      const prev = cs.refImporters.get(p);
      if (prev) for (const i2 of imps) prev.add(i2);
      else cs.refImporters.set(p, new Set(imps));
    }
  }
  const listed = cs.files.filter(
    (f) => !f.runAll && (f.status === "added" || f.status === "deleted" || f.kind === "ignored")
  );
  if (listed.length && opts.tree) {
    const isTest = (p) => !!opts.knownTests?.has(p) || classify(p) === "test";
    for (const site of globSites(opts.tree)) {
      const hits = listed.filter((f) => f.path !== site.file && underDirs(f.path, site.dirs));
      if (!hits.length) continue;
      if (isTest(site.file)) cs.refTests.add(site.file);
      else cs.fileLevel.add(site.file);
      for (const f of hits) f.note = [f.note, `in a directory ${site.file} globs`].filter(Boolean).join("; ");
    }
  }
  for (const fc of cs.files) if (fc.fileLevel) cs.fileLevel.add(fc.path);
  return cs;
}
function changesFromGit(repo, base3, head, opts = {}) {
  const diffs = gitDiff(repo, base3, head);
  const specs = [];
  for (const d of diffs) {
    const kind = classify(d.path, { knownTests: opts.knownTests });
    const wanted = kind === "source" && parserFor(d.path) || kind === "ci" && WORKFLOW.test(d.path);
    if (d.binary || !wanted) continue;
    if (d.oldPath && d.status !== "added") specs.push(`${base3}:${d.oldPath}`);
    if (d.newPath && d.status !== "deleted") specs.push(`${head}:${d.newPath}`);
  }
  const blobs = readBlobs(repo, specs);
  const workspaces = opts.workspaces ?? (() => mergeWorkspaces(readWorkspaces(repo, base3), readWorkspaces(repo, head)));
  return analyzeChanges(diffs, (side, p) => blobs.get(`${side === "old" ? base3 : head}:${p}`) ?? null, {
    ...opts,
    workspaces,
    tree: opts.tree ?? gitTree(repo, head)
  });
}

// ../engine/src/coverage/format.ts
import { gunzipSync, gzipSync } from "node:zlib";
var MAGIC2 = "JFYM";
var VERSION = 1;
var Reader = class {
  o = 0;
  buf;
  constructor(buf) {
    this.buf = buf;
  }
  varint() {
    let r = 0;
    let s = 1;
    let b;
    do {
      b = this.buf[this.o++];
      r += (b & 127) * s;
      s *= 128;
    } while (b & 128);
    return r;
  }
  bytes(n) {
    const b = this.buf.subarray(this.o, this.o + n);
    this.o += n;
    return b;
  }
};
var MAX_MAP_BYTES = 256 * 1024 * 1024;
function decodeMap(gz, limits = {}) {
  let buf;
  try {
    buf = gunzipSync(gz, { maxOutputLength: limits.maxBytes ?? MAX_MAP_BYTES });
  } catch (e) {
    if (e.code === "ERR_BUFFER_TOO_LARGE")
      throw new Error(`coverage map is larger than ${limits.maxBytes ?? MAX_MAP_BYTES} bytes uncompressed`);
    throw e;
  }
  if (buf.toString("ascii", 0, 4) !== MAGIC2) throw new Error("not a Jiffy coverage map");
  if (buf[4] !== VERSION) throw new Error(`unsupported coverage map version ${buf[4]}`);
  const r = new Reader(buf);
  r.o = 5;
  const count = (what, max = Infinity) => {
    const n = r.varint();
    if (n > buf.length - r.o || n > max) throw new Error(`coverage map: ${what} count ${n} is out of range`);
    return n;
  };
  const at = (table, i2, what) => {
    const v = table[i2];
    if (v === void 0) throw new Error(`coverage map: ${what} index ${i2} is out of range`);
    return v;
  };
  const meta = JSON.parse(r.bytes(count("meta bytes")).toString("utf8"));
  const nStrings = count("string");
  const strings = nStrings ? r.bytes(count("string bytes")).toString("utf8").split("\n") : (r.varint(), []);
  const files = Array.from({ length: count("file") }, () => at(strings, r.varint(), "string"));
  const fns = Array.from({ length: count("function", limits.maxFns) }, () => {
    const f = at(files, r.varint(), "file");
    return fnId(f, at(strings, r.varint(), "string"));
  });
  const deltas = (table, what) => {
    const n = count(what);
    const out2 = new Array(n);
    let prev = 0;
    for (let i2 = 0; i2 < n; i2++) out2[i2] = at(table, prev += r.varint(), what);
    return out2;
  };
  const tests = /* @__PURE__ */ new Map();
  const nTests = count("test", limits.maxTests);
  for (let i2 = 0; i2 < nTests; i2++) {
    const t = at(strings, r.varint(), "string");
    tests.set(t, { loaded: new Set(deltas(files, "file")), fns: new Set(deltas(fns, "function")) });
  }
  return { meta, tests };
}

// ../engine/src/coverage/reads.ts
var READS_MARK = fnId("", "jiffy:reads");
var READS_VERSION = 1;

// ../engine/src/coverage/parts.ts
var PART_FORMAT = 2;
var FORMAT_MARK = fnId("", `jiffy:v${PART_FORMAT}`);
var CHILDREN_MARK = fnId("", "jiffy:children");
var CHILDREN_VERSION = 1;
function mapAlwaysRun(map) {
  const v = map.meta.alwaysRun;
  if (v === void 0) return [];
  if (!Array.isArray(v) || !v.every((t) => typeof t === "string" && t !== "")) return null;
  return v;
}
function mapMarks(map) {
  return { reads: map.meta.reads === READS_VERSION, children: map.meta.children === CHILDREN_VERSION };
}

// ../engine/src/durations.ts
function durationsFromReport(report, root) {
  const out2 = /* @__PURE__ */ new Map();
  for (const t of report.testResults) {
    const name2 = t.name.startsWith(root) ? t.name.slice(root.length) : t.name;
    out2.set(name2, Math.max(1e-3, (t.endTime - t.startTime) / 1e3));
  }
  return out2;
}
function median(xs) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ../engine/src/specs.ts
var MAX_SPEC_SCAN_BYTES = 2 * 1024 * 1024;
var MAX_CLAUSE = 8192;
var isIdStart = (c) => c >= 97 && c <= 122 || c >= 65 && c <= 90 || c === 36 || c === 95 || c > 127;
var isId = (c) => isIdStart(c) || c >= 48 && c <= 57;
var isWs = (c) => c === 32 || c === 9 || c === 10 || c === 13 || c === 11 || c === 12 || c === 65279;
var SPEC_CALLS = /* @__PURE__ */ new Set([
  "require",
  "mock",
  "doMock",
  "unmock",
  "importActual",
  "importMock",
  "requireActual",
  "requireMock",
  "resolve"
]);
function jsSpecs(src) {
  if (src.length > MAX_SPEC_SCAN_BYTES) return "unreadable";
  const n = src.length;
  const out2 = /* @__PURE__ */ new Set();
  const code3 = (j) => src.charCodeAt(j);
  const skip = (j) => {
    while (j < n) {
      const c = code3(j);
      if (isWs(c)) j++;
      else if (c === 47 && code3(j + 1) === 47) {
        const e = src.indexOf("\n", j + 2);
        j = e < 0 ? n : e + 1;
      } else if (c === 47 && code3(j + 1) === 42) {
        const e = src.indexOf("*/", j + 2);
        j = e < 0 ? n : e + 2;
      } else break;
    }
    return j;
  };
  const str = (j) => {
    const q = code3(j);
    if (q !== 39 && q !== 34 && q !== 96) return null;
    let k = j + 1;
    let interp = false;
    while (k < n) {
      const c = code3(k);
      if (c === 92) k += 2;
      else if (c === q) break;
      else if (q !== 96 && c === 10) return null;
      else {
        if (q === 96 && c === 36 && code3(k + 1) === 123) interp = true;
        k++;
      }
    }
    if (k >= n) return null;
    return interp ? null : [src.slice(j + 1, k), k + 1];
  };
  const pastString = (j) => {
    const q = code3(j);
    let k = j + 1;
    while (k < n) {
      const c = code3(k);
      if (c === 92) k += 2;
      else if (c === q) return k + 1;
      else if (q !== 96 && c === 10) return k + 1;
      else k++;
    }
    return n;
  };
  const word = (j) => {
    let k = j;
    while (k < n && isId(code3(k))) k++;
    return [src.slice(j, k), k];
  };
  const callArg = (j) => {
    let k = skip(j);
    if (code3(k) !== 40) return j;
    k = skip(k + 1);
    const s = str(k);
    if (s) out2.add(s[0]);
    return s ? s[1] : k;
  };
  const clause = (j, typeOnly) => {
    const stop2 = Math.min(n, j + MAX_CLAUSE);
    let k = j;
    while (k < stop2) {
      k = skip(k);
      if (k >= stop2) break;
      const c = code3(k);
      if (c === 123 || c === 125 || c === 44 || c === 42) {
        k++;
        continue;
      }
      if (c === 39 || c === 34) {
        k = pastString(k);
        continue;
      }
      if (!isIdStart(c)) return k;
      const [w, e] = word(k);
      if (w === "from") {
        const s = str(skip(e));
        if (s && !typeOnly) out2.add(s[0]);
        return s ? s[1] : e;
      }
      if (w === "import" || w === "export") return k;
      k = e;
    }
    return k;
  };
  const pastRegex = (j) => {
    let k = j + 1;
    let inClass = false;
    while (k < n) {
      const c = code3(k);
      if (c === 10) return k;
      if (c === 92) k += 2;
      else {
        if (c === 91) inClass = true;
        else if (c === 93) inClass = false;
        else if (c === 47 && !inClass) return k + 1;
        k++;
      }
    }
    return n;
  };
  const REGEX_AFTER = new Set([..."(,=:[!&|?{};+-*%<>~^"].map((x) => x.charCodeAt(0)));
  const REGEX_WORDS = /* @__PURE__ */ new Set([
    "return",
    "typeof",
    "case",
    "do",
    "else",
    "in",
    "of",
    "new",
    "delete",
    "void",
    "throw",
    "yield",
    "await"
  ]);
  let prevSig = 0;
  let prevWord = "";
  let i2 = 0;
  while (i2 < n) {
    const c = code3(i2);
    if (c === 39 || c === 34 || c === 96) {
      i2 = pastString(i2);
      prevSig = 1;
      prevWord = "";
      continue;
    }
    if (c === 47 && (code3(i2 + 1) === 47 || code3(i2 + 1) === 42)) {
      i2 = skip(i2);
      continue;
    }
    if (c === 47) {
      if (prevSig === 0 || REGEX_AFTER.has(prevSig) || prevSig === 1 && REGEX_WORDS.has(prevWord)) {
        i2 = pastRegex(i2);
        prevSig = 1;
      } else {
        i2++;
        prevSig = c;
      }
      prevWord = "";
      continue;
    }
    if (!isIdStart(c)) {
      if (!isWs(c)) {
        prevSig = c >= 48 && c <= 57 ? 1 : c;
        prevWord = "";
      }
      i2++;
      continue;
    }
    const prev = i2 > 0 ? code3(i2 - 1) : 0;
    const [w, e] = word(i2);
    prevSig = 1;
    prevWord = w;
    if (isId(prev) || prev >= 48 && prev <= 57) {
      i2 = e;
      continue;
    }
    const member = prev === 46;
    if (!member && w === "import") {
      const j = skip(e);
      if (code3(j) === 40) i2 = callArg(e);
      else if (code3(j) === 46)
        i2 = e;
      else {
        const s = str(j);
        if (s) {
          out2.add(s[0]);
          i2 = s[1];
        } else {
          const [t, te] = word(j);
          const next = skip(te);
          const typeOnly = t === "type" && (code3(next) === 123 || isIdStart(code3(next)) && word(next)[0] !== "from");
          i2 = clause(typeOnly ? te : j, typeOnly);
        }
      }
      continue;
    }
    if (!member && w === "export") {
      let j = skip(e);
      let typeOnly = false;
      const [t, te] = word(j);
      if (t === "type") {
        typeOnly = true;
        j = skip(te);
      }
      i2 = code3(j) === 123 || code3(j) === 42 ? clause(j, typeOnly) : Math.max(e, j);
      continue;
    }
    if (w === "require" && !member || member && SPEC_CALLS.has(w)) {
      i2 = Math.max(e, callArg(e));
      continue;
    }
    i2 = e;
  }
  return [...out2];
}
function pySpecs(src) {
  if (src.length > MAX_SPEC_SCAN_BYTES) return "unreadable";
  const out2 = /* @__PURE__ */ new Set();
  const lines3 = src.split("\n");
  const noComment = (x) => {
    const h = x.indexOf("#");
    return h < 0 ? x : x.slice(0, h);
  };
  const HEAD = /^(try|else|finally|if|elif|while|for|with|except)\b[^:]*:/;
  const names2 = (s) => s.replace(/[()\\]/g, " ").split(",").map((x) => x.trim().split(/\s+/)[0] ?? "").filter((x) => /^[\w.]+$/.test(x));
  const statements = (raw2) => noComment(raw2).split(";").map((x) => {
    let t = x.trimStart();
    for (let k = 0; k < 4; k++) {
      const m = HEAD.exec(t);
      if (!m) break;
      t = t.slice(m[0].length).trimStart();
    }
    return t;
  });
  for (let i2 = 0; i2 < lines3.length; i2++) {
    const parts2 = statements(lines3[i2]);
    for (let pi = 0; pi < parts2.length; pi++) {
      const line = parts2[pi];
      if (line.startsWith("import ") || line.startsWith("import	")) {
        for (const m of names2(line.slice(7))) out2.add(m);
        continue;
      }
      if (!line.startsWith("from ") && !line.startsWith("from	")) continue;
      const rest = line.slice(5).trimStart();
      const sp = rest.search(/\s/);
      if (sp < 0) continue;
      const mod = rest.slice(0, sp);
      if (!mod || !/^\.*[\w.]*$/.test(mod)) continue;
      out2.add(mod);
      let tail = rest.slice(sp).trimStart();
      if (!tail.startsWith("import")) continue;
      tail = tail.slice(6);
      if (pi === parts2.length - 1 && tail.includes("(") && !tail.includes(")"))
        for (let k = 1; k <= 500 && i2 + 1 < lines3.length; k++) {
          const more = noComment(lines3[++i2]);
          tail += " " + more;
          if (more.includes(")")) break;
        }
      for (const name2 of names2(tail))
        if (/^\w+$/.test(name2)) out2.add(mod.endsWith(".") ? mod + name2 : `${mod}.${name2}`);
    }
  }
  return [...out2];
}

// ../engine/src/select.ts
var fnFilesCache = /* @__PURE__ */ new WeakMap();
function filesWithFns(map) {
  let s = fnFilesCache.get(map);
  if (!s) {
    s = /* @__PURE__ */ new Set();
    for (const cov of map.tests.values()) for (const f of cov.fns) s.add(splitFnId(f)[0]);
    fnFilesCache.set(map, s);
  }
  return s;
}
function select({ changes, map, allTests, always }) {
  const universe = new Set(allTests ?? map?.tests.keys() ?? []);
  for (const t of changes.changedTests) universe.add(t);
  const tests = /* @__PURE__ */ new Map();
  const add2 = (t, r) => {
    const rs = tests.get(t);
    if (rs) rs.push(r);
    else tests.set(t, [r]);
  };
  const everything = (r) => {
    for (const t of universe) add2(t, r);
    return { runAll: true, tests, skipped: [] };
  };
  if (!map) return everything({ kind: "no-coverage-map" });
  const alwaysRun = mapAlwaysRun(map);
  if (alwaysRun === null) return everything({ kind: "no-coverage-map" });
  for (const t of alwaysRun) universe.add(t);
  if (changes.runAll.length) return everything({ kind: "run-all", triggers: changes.runAll });
  for (const t of changes.changedTests) add2(t, { kind: "changed-test" });
  for (const t of changes.refTests) {
    universe.add(t);
    add2(t, { kind: "reference", fns: [] });
  }
  const refUnits = [];
  const fileLevel = new Set(changes.fileLevel);
  if (changes.refUnits.size) {
    const recorded = filesWithFns(map);
    for (const u of changes.refUnits) {
      const f = splitFnId(u)[0];
      if (recorded.has(f)) refUnits.push(u);
      else fileLevel.add(f);
    }
  }
  for (const t of universe)
    if (!map.tests.has(t) && !changes.changedTests.has(t)) add2(t, { kind: "no-coverage-record" });
  for (const t of alwaysRun)
    if (map.tests.has(t) && !changes.changedTests.has(t)) add2(t, { kind: "no-coverage-record" });
  if (changes.units.size || fileLevel.size || refUnits.length || changes.refImporters.size) {
    const withAny = (units) => new Map([...units].map((u) => [u, fnId(splitFnId(u)[0], ANY_FN)]));
    const anyFn = withAny(changes.units);
    const anyRef = withAny(refUnits);
    for (const [t, cov] of map.tests) {
      const fns = [];
      for (const [u, any] of anyFn) if (cov.fns.has(u) || cov.fns.has(any)) fns.push(u);
      if (fns.length) add2(t, { kind: "function", fns });
      const refs = [];
      for (const [u, any] of anyRef) if (cov.fns.has(u) || cov.fns.has(any)) refs.push(u);
      if (refs.length) add2(t, { kind: "reference", fns: refs });
      const files = [];
      for (const f of fileLevel) if (cov.loaded.has(f)) files.push(f);
      for (const [f, importers] of changes.refImporters) {
        if (fileLevel.has(f) || !cov.loaded.has(f) || importers.has(t)) continue;
        let seen = false;
        for (const l of cov.loaded)
          if (importers.has(l)) {
            seen = true;
            break;
          }
        if (!seen) files.push(f);
      }
      if (files.length) add2(t, { kind: "module", files });
    }
  }
  const byDir = /* @__PURE__ */ new Map();
  for (const f of changes.files) {
    if (f.runAll || f.status !== "added" && f.status !== "deleted") continue;
    for (let i2 = f.path.indexOf("/"), d = "./"; ; i2 = f.path.indexOf("/", i2 + 1)) {
      const l = byDir.get(d);
      if (l) l.push(f.path);
      else byDir.set(d, [f.path]);
      if (i2 < 0) break;
      d = f.path.slice(0, i2 + 1);
    }
  }
  if (byDir.size)
    for (const [t, cov] of map.tests) {
      let files = null;
      for (const l of cov.loaded) {
        if (!l.endsWith("/")) continue;
        for (const f of byDir.get(l) ?? []) (files ??= /* @__PURE__ */ new Set()).add(f);
      }
      if (files) add2(t, { kind: "module", files: [...files].sort() });
    }
  for (const { root, path } of changes.packageScopes) {
    for (const t of universe) {
      if (!t.startsWith(root + "/")) continue;
      const rs = tests.get(t);
      const r = rs?.find((x) => x.kind === "package" && x.root === root);
      if (r && r.kind === "package") r.files.push(path);
      else add2(t, { kind: "package", root, files: [path] });
    }
  }
  if (always) {
    for (const t of universe) if (always(t)) add2(t, { kind: "always" });
  }
  const skipped = [...universe].filter((t) => !tests.has(t));
  return { runAll: false, tests, skipped };
}

// ../engine/src/plan.ts
var PLAN_VERSION = "plan@1";
var DEFAULT_BOUNDS = { maxCommits: 200, maxAgeDays: 14, maxFiles: 2e3 };
var ms = (a, b) => Math.round((b - a) * 10) / 10;
function revOk(repo, rev) {
  try {
    git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
    return true;
  } catch {
    return false;
  }
}
function isAncestor(repo, a, b) {
  try {
    git(repo, ["merge-base", "--is-ancestor", a, b]);
    return true;
  } catch {
    return false;
  }
}
function mapStaleness(repo, map, base3, now, createdAt, bounds) {
  const commit = map.meta.commit;
  if (typeof commit !== "string" || !/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/.test(commit))
    return "coverage map has no commit";
  if (!revOk(repo, commit))
    return `coverage map commit ${commit.slice(0, 10)} is not in this checkout (check out with fetch-depth: 0)`;
  if (!isAncestor(repo, commit, base3))
    return `coverage map commit ${commit.slice(0, 10)} is not an ancestor of the base ${base3.slice(0, 10)}`;
  const distance = Number(git(repo, ["rev-list", "--count", `${commit}..${base3}`]).trim());
  if (!Number.isFinite(distance)) return "cannot count commits since the map";
  if (distance > bounds.maxCommits)
    return `stale coverage map: ${distance} commits behind the base (max ${bounds.maxCommits})`;
  const committed = Number(git(repo, ["show", "-s", "--format=%ct", commit]).trim()) * 1e3;
  const built = createdAt ? Date.parse(createdAt) : NaN;
  if (!Number.isFinite(committed)) return "cannot read the map commit date";
  if (createdAt != null && Number.isNaN(built)) return "coverage map build time is not a date";
  const oldest = Math.min(committed, Number.isNaN(built) ? committed : built);
  const ageDays = (now - oldest) / 864e5;
  if (bounds.maxAgeDays > 0 && ageDays > bounds.maxAgeDays)
    return `stale coverage map: its commit is ${ageDays.toFixed(1)} days old (max ${bounds.maxAgeDays})`;
  const alwaysRun = mapAlwaysRun(map);
  if (alwaysRun === null) return "coverage map meta.alwaysRun is malformed";
  return {
    commit,
    distance,
    ageDays: Math.round(ageDays * 100) / 100,
    ...mapMarks(map),
    alwaysRun: alwaysRun.length
  };
}
function packageOf(roots, p) {
  let best = null;
  for (const r of roots) if (p.startsWith(r + "/") && (!best || r.length > best.length)) best = r;
  return best;
}
function affectedPackages(graph, changes) {
  if (!graph.length) return null;
  const roots = graph.map((w) => w.root);
  const out2 = /* @__PURE__ */ new Set();
  for (const f of changes.files) {
    if (f.kind === "ignored" || f.kind === "ci" && !f.runAll) continue;
    const root = packageOf(roots, f.path);
    if (!root) return null;
    for (const r of packageAndDependents(graph, root)) out2.add(r);
  }
  return out2;
}
function staticSpecs(path, src) {
  return isPy(path) ? pySpecs(src) : jsSpecs(src);
}
function staticReach(tree, changed, isTest, maxFiles, workspaces) {
  const code3 = tree.paths().filter((p) => (isJs(p) || isPy(p)) && !p.includes("node_modules/"));
  if (code3.length > maxFiles)
    return {
      tests: /* @__PURE__ */ new Map(),
      exhausted: `${code3.length} code files, over the ${maxFiles} the walk reads`,
      parsed: 0,
      orphans: []
    };
  tree.prefetch?.(code3);
  const ctx = { tree, ...workspaces && { workspaces } };
  const byName = /* @__PURE__ */ new Map();
  for (const f of code3)
    for (const n of names(f)) {
      const l = byName.get(n);
      if (l) l.push(f);
      else byName.set(n, [f]);
    }
  const importers = /* @__PURE__ */ new Map();
  const link = (target, from) => {
    if (target === from) return;
    const s = importers.get(target);
    if (s) s.add(from);
    else importers.set(target, /* @__PURE__ */ new Set([from]));
  };
  for (const c of code3) {
    const specs = staticSpecs(c, tree.read(c) ?? "");
    if (specs === "unreadable") {
      for (const t of code3) link(t, c);
      continue;
    }
    for (const spec of specs) {
      const r = resolveSpecAll(ctx, c, spec);
      if (r === "external") continue;
      if (r !== "unknown") {
        for (const t of r) link(t, c);
        continue;
      }
      const last = (isPy(c) ? spec.split(".") : spec.replace(/\/+$/, "").split("/")).at(-1) ?? "";
      const stem = last.replace(/^#/, "").replace(/\.[cm]?[jt]sx?$/, "");
      for (const t of byName.get(stem) ?? []) if (mayBe(r, spec, t)) link(t, c);
    }
  }
  const reach = new Map(changed.map((c) => [c, /* @__PURE__ */ new Set([c])]));
  const queue = [...changed];
  for (let i2 = 0; i2 < queue.length; i2++) {
    const f = queue[i2];
    const from = reach.get(f);
    for (const c of importers.get(f) ?? []) {
      let r = reach.get(c);
      const before = r?.size ?? -1;
      if (!r) reach.set(c, r = /* @__PURE__ */ new Set());
      for (const x of from) r.add(x);
      if (r.size !== before) queue.push(c);
    }
  }
  const tests = /* @__PURE__ */ new Map();
  for (const [f, from] of reach) if (isTest(f)) tests.set(f, from);
  const orphans = changed.filter((f) => !importers.get(f)?.size);
  return { tests, exhausted: null, parsed: code3.length, orphans };
}
var SPAWN = new RegExp(
  [
    /['"`](?:node:)?(?:child_process|worker_threads|cluster)['"`]/,
    /['"`](?:execa|zx|cross-spawn|tinyexec|nano-spawn|@npmcli\/promise-spawn|tinypool|piscina|workerpool|threads|shelljs|node-pty|@lydell\/node-pty|concurrently)(?:\/[^'"`]*)?['"`]/,
    /\b(?:spawn|spawnSync|fork|execa|execaSync|execaNode|execaCommand|execaCommandSync)\s*\(/,
    /\$\s*`/,
    /process\.execPath|\bnew\s+(?:Worker|Tinypool|Piscina)\s*\(|\bBun\.spawn/,
    /^[ \t]*(?:import|from)\s+(?:subprocess|multiprocessing|concurrent\.futures|pty|pexpect)\b/,
    /\bsubprocess\.|\bmultiprocessing\b|\bProcessPoolExecutor\b|\bsys\.executable\b/,
    /\bcreate_subprocess_(?:exec|shell)\b|\brunpytest_subprocess\b|\bspawn_pytest\b|\bpytester\b|\btestdir\b/,
    /^[ \t]*(?:import|from)\s+(?:sh|plumbum)\b/,
    /^[ \t]*from\s+os\s+import\b[^\n]*\b(?:system|popen|exec\w*|spawn\w*|fork\w*|posix_spawn\w*)\b/,
    /\bos\.(?:system|popen|fork|forkpty|exec\w*|spawn\w*|posix_spawn\w*)\s*\(/
  ].map((r) => r.source).join("|"),
  "m"
);
function spawners(tree, tests, workspaces, depth = 3) {
  const ctx = { tree, ...workspaces && { workspaces } };
  let byName = null;
  const named = (stem) => {
    if (!byName) {
      byName = /* @__PURE__ */ new Map();
      for (const f of tree.paths())
        if ((isJs(f) || isPy(f)) && !f.includes("node_modules/"))
          for (const n of names(f)) {
            const l = byName.get(n);
            if (l) l.push(f);
            else byName.set(n, [f]);
          }
    }
    return byName.get(stem) ?? [];
  };
  const direct = /* @__PURE__ */ new Map();
  const imports = /* @__PURE__ */ new Map();
  const spawns = (f) => {
    let v = direct.get(f);
    if (v === void 0) {
      const src = tree.read(f);
      v = src !== null && (src.length > 2 * 1024 * 1024 || SPAWN.test(src));
      direct.set(f, v);
    }
    return v;
  };
  const importsOf = (f) => {
    let l = imports.get(f);
    if (!l) {
      l = [];
      const src = tree.read(f);
      const specs = src === null ? [] : staticSpecs(f, src);
      if (specs !== "unreadable")
        for (const s of specs) {
          const r = resolveSpecAll(ctx, f, s);
          if (Array.isArray(r)) l.push(...r.filter((x) => isJs(x) || isPy(x)));
          else if (r === "unknown") {
            const last = (isPy(f) ? s.split(".") : s.replace(/\/+$/, "").split("/")).at(-1) ?? "";
            const stem = last.replace(/^#/, "").replace(/\.[cm]?[jt]sx?$/, "");
            l.push(...named(stem).filter((x) => x !== f && mayBe(r, s, x)));
          }
        }
      imports.set(f, l);
    }
    return l;
  };
  tree.prefetch?.(tests);
  const out2 = /* @__PURE__ */ new Map();
  for (const t of tests) {
    const seen = /* @__PURE__ */ new Set([t]);
    const hits = [];
    let frontier = [t];
    for (let d = 0; d <= depth && frontier.length; d++) {
      const next = [];
      for (const f of frontier) {
        if (spawns(f)) hits.push(f);
        if (d < depth) {
          for (const i2 of importsOf(f))
            if (!seen.has(i2)) {
              seen.add(i2);
              next.push(i2);
            }
        }
      }
      tree.prefetch?.(next);
      frontier = next;
    }
    if (hits.length) out2.set(t, hits.sort());
  }
  return out2;
}
var RUNNER_CONFIG = /(^|\/)(vite|vitest|jest|webpack|rollup|babel|rspack)\.(config|workspace)(\.[\w-]+)*\.[cm]?[jt]s(on)?$|(^|\/)\.babelrc(\.json)?$/;
var ALIAS_OR_PLUGIN = /\b(alias|moduleNameMapper|resolveId|plugins|modulePaths|moduleDirectories)\b/;
function opaqueRunnerConfigs(tree) {
  const configs = tree.paths().filter((p) => RUNNER_CONFIG.test(p) && !p.includes("node_modules/"));
  tree.prefetch?.(configs);
  return configs.filter((p) => {
    const src = tree.read(p);
    return src === null || ALIAS_OR_PLUGIN.test(src);
  });
}
var FIXTURE_DIR = /(^|\/)(tests?|__tests__|fixtures?|__fixtures__|testdata|test-data|__mocks__|__snapshots__)\/|^specs?\//i;
var POSSIBLE_TEST = /(^|\/)(__tests__|tests?|specs?)\/|(^|[./_-])(test|spec)\.[cm]?[jt]sx?$|(^|\/)test[_-][^/]*\.[cm]?[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.py$/;
function headTests(tree) {
  return tree.paths().filter((p) => TEST_FILE.test(p) && !p.includes("node_modules/"));
}
function planSelection(input) {
  const t0 = performance.now();
  const bounds = { ...DEFAULT_BOUNDS, ...input.bounds };
  const { repo, head, base: base3 } = input;
  const inScope = input.inScope ?? (() => true);
  const timings = { mapMs: 0, diffMs: 0, selectMs: 0, staticMs: 0 };
  const plan = (p) => ({
    runAll: false,
    reasons: [],
    map: null,
    changes: null,
    tests: /* @__PURE__ */ new Map(),
    skipped: [],
    universe: [],
    timings,
    ...p
  });
  const everything = (from2, basis2, reasons2, rest = {}) => plan({ runAll: true, reasons: reasons2, basis: basis2, from: from2, ...rest });
  let mapInfo = null;
  if (input.map) {
    const s = mapStaleness(repo, input.map, base3, input.now, input.mapCreatedAt, bounds);
    timings.mapMs = ms(t0, performance.now());
    if (typeof s === "string") return everything(base3, "none", [s]);
    mapInfo = s;
  }
  const from = mapInfo?.commit ?? base3;
  const tree = gitTree(repo, head);
  const graph = (() => {
    try {
      return readWorkspaces(repo, head);
    } catch {
      return [];
    }
  })();
  const basis = input.map ? "coverage" : graph.length && input.packageGrain !== false ? "package" : "none";
  if (basis === "none")
    return everything(from, "none", [
      "no coverage map, and not a workspace monorepo (package grain needs one)"
    ]);
  const t1 = performance.now();
  const fileCount = git(repo, ["diff", "--name-only", "-z", "--no-renames", from, head]).split("\0").filter(Boolean).length;
  if (fileCount > bounds.maxFiles)
    return everything(
      from,
      basis,
      [`the change since the map touches ${fileCount} files (max ${bounds.maxFiles})`],
      {
        map: mapInfo
      }
    );
  const alwaysRun = input.map ? mapAlwaysRun(input.map) ?? [] : [];
  const knownTests = /* @__PURE__ */ new Set([...input.map?.tests.keys() ?? [], ...alwaysRun, ...headTests(tree)]);
  const universeSet = new Set(knownTests);
  const headFiles = new Set(tree.paths());
  for (const t of input.allTests ?? [])
    if (headFiles.has(t) && (knownTests.has(t) || (isJs(t) || isPy(t)) && POSSIBLE_TEST.test(t)))
      universeSet.add(t);
  const changes = changesFromGit(repo, from, head, { knownTests, tree });
  for (const t of changes.changedTests) universeSet.add(t);
  const t2 = performance.now();
  timings.diffMs = ms(t1, t2);
  const reasons = [];
  for (const t of changes.runAll) reasons.push(`changed ${t.path} (${t.reason})`);
  const policy = new Set(input.policyFiles ?? []);
  for (const f of changes.files) if (policy.has(f.path)) reasons.push(`changed ${f.path} (selection policy)`);
  for (const f of changes.files)
    if (f.kind === "ignored" && FIXTURE_DIR.test(f.path))
      reasons.push(`changed ${f.path} (in a test or fixture directory, so a test may read it)`);
  if (input.map) {
    const odd = [...input.map.tests.keys(), ...alwaysRun].find((t) => classify(t) !== "test");
    if (odd) {
      for (const f of changes.files)
        if (f.status === "added" && f.kind === "source" && !knownTests.has(f.path))
          reasons.push(
            `added ${f.path}: the runner collects tests by its own names (${odd}), so it may be a test`
          );
    }
  }
  for (const f of changes.files)
    if (f.status !== "deleted" && (isJs(f.path) || isPy(f.path)) && POSSIBLE_TEST.test(f.path) && !universeSet.has(f.path) && !f.path.includes("node_modules/"))
      reasons.push(`changed ${f.path}: it may be a test the runner collects by its own names`);
  const universe = [...universeSet].filter(inScope).sort();
  if (reasons.length) return everything(from, basis, reasons, { map: mapInfo, changes, universe });
  const empty = { meta: {}, tests: /* @__PURE__ */ new Map() };
  const sel = select({ changes, map: input.map ?? empty, allTests: universeSet, always: input.always });
  const tests = new Map(sel.tests);
  const add2 = (t, r) => {
    const rs = tests.get(t);
    if (rs) rs.push(r);
    else tests.set(t, [r]);
  };
  const affected = affectedPackages(graph, changes);
  const roots = graph.map((w) => w.root);
  const inAffected = (t) => {
    if (!affected) return true;
    const root = packageOf(roots, t);
    return !root || affected.has(root);
  };
  if (basis === "package")
    for (const [t, rs] of tests) {
      if (!rs.every((r) => r.kind === "no-coverage-record")) continue;
      if (inAffected(t)) tests.set(t, [{ kind: "package-grain", root: packageOf(roots, t) ?? "." }]);
      else tests.delete(t);
    }
  const t3 = performance.now();
  timings.selectMs = ms(t2, t3);
  const changedCode = changes.files.filter(
    (f) => f.status !== "deleted" && (f.kind === "source" || f.kind === "test") && (isJs(f.path) || isPy(f.path))
  ).map((f) => f.path);
  if (changedCode.length) {
    const isTest = (p) => universeSet.has(p) || classify(p, { knownTests }) === "test";
    const r = staticReach(tree, changedCode, isTest, input.staticMaxFiles ?? 5e4, graph);
    timings.staticMs = ms(t3, performance.now());
    if (r.exhausted)
      return everything(from, basis, [`static graph: ${r.exhausted}`], { map: mapInfo, changes, universe });
    const testKind = new Set(changes.changedTests);
    for (const [t, files] of r.tests) {
      const record = input.map?.tests.get(t);
      const unseen = [...files].filter((f) => f !== t && (testKind.has(f) || !record?.loaded.has(f)));
      if (unseen.length && universeSet.has(t)) add2(t, { kind: "static", files: unseen.sort() });
    }
  }
  if (input.map) {
    for (const f of changes.changedTests)
      for (const [t, rec] of input.map.tests)
        if (t !== f && rec.loaded.has(f) && universeSet.has(t)) add2(t, { kind: "module", files: [f] });
  }
  if (basis === "coverage" && mapInfo && !mapInfo.children) {
    const t4 = performance.now();
    for (const [t, files] of spawners(
      tree,
      universe.filter((t5) => !tests.has(t5)),
      graph
    ))
      add2(t, { kind: "spawns", files });
    timings.staticMs += ms(t4, performance.now());
  }
  if (basis === "package") {
    const wouldSkip = universe.some((t) => !tests.has(t));
    const opaque = wouldSkip ? opaqueRunnerConfigs(tree) : [];
    if (opaque.length)
      return everything(
        from,
        basis,
        [
          `no coverage map, and ${opaque.slice(0, 3).join(", ")} declare aliases or plugins the static graph can't read`
        ],
        { map: mapInfo, changes, universe }
      );
  }
  const windowMs = (input.historyWindowDays ?? 7) * 864e5;
  for (const h of input.history ?? []) {
    const at = Date.parse(h.failedAt);
    if (Number.isNaN(at) || input.now - at > windowMs || !universeSet.has(h.file) || !inAffected(h.file))
      continue;
    add2(h.file, { kind: "history", failedAt: h.failedAt });
  }
  for (const t of [...tests.keys()]) if (!inScope(t)) tests.delete(t);
  const skipped = universe.filter((t) => !tests.has(t));
  return plan({ basis, from, map: mapInfo, changes, tests, skipped, universe });
}

// ../engine/src/index.ts
try {
  await initParsers();
} catch (e) {
  process.emitWarning(
    `jiffy: Python parser unavailable, Python changes fall back to file level: ${String(e)}`
  );
}

// src/shards.ts
function balanceShards(tests, durations, n) {
  const count = Math.max(1, Math.min(n, tests.length));
  const known = tests.map((t) => durations.get(t)).filter((d) => d !== void 0);
  const fallback = known.length ? median(known) : 1;
  const est = (t) => durations.get(t) ?? fallback;
  const shards = fullRunShards(count);
  const sorted = [...tests].sort((a, b) => est(b) - est(a) || (a < b ? -1 : 1));
  for (const t of sorted) {
    let min = shards[0];
    for (const s of shards) if (s.seconds < min.seconds) min = s;
    min.tests.push(t);
    min.seconds += est(t);
  }
  for (const s of shards) {
    s.tests.sort();
    s.seconds = Math.round(s.seconds * 10) / 10;
  }
  return shards;
}
function fullRunShards(n) {
  return Array.from({ length: n }, (_, index) => ({
    index,
    total: n,
    label: `${index + 1}/${n}`,
    tests: [],
    seconds: 0
  }));
}

// src/summary.ts
var MAX_ROWS = 300;
var MAX_SKIPPED = 1e3;
var MAX_BYTES2 = 9e5;
var esc = (s) => s.replace(/[&<>"'|`]/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\r?\n/g, " ");
var code = (s) => `<code>${esc(s)}</code>`;
var list = (xs, n = 3) => xs.slice(0, n).map(code).join(", ") + (xs.length > n ? ` and ${xs.length - n} more` : "");
var fnName = (id) => id.slice(id.lastIndexOf("::") + 2);
var short = (sha) => sha.slice(0, 10);
var pct = (x) => `${(x * 100).toFixed(1)}%`;
function runAllReason(sel, d) {
  if (d.mapProblem) return d.mapProblem;
  const triggers = d.changes.runAll;
  if (triggers.length) {
    const shown = triggers.slice(0, 3).map((t) => `${t.path} (${t.reason})`);
    return `changed ${shown.join(", ")}${triggers.length > 3 ? ` and ${triggers.length - 3} more` : ""}`;
  }
  return sel.runAll ? "the change runs everything" : "";
}
function describeReason(r) {
  switch (r.kind) {
    case "run-all":
      return "the change runs everything";
    case "no-coverage-map":
      return "no usable coverage map";
    case "changed-test":
      return "changed in this change";
    case "no-coverage-record":
      return "no coverage record yet";
    case "function":
      return `executed changed ${list(r.fns)}`;
    case "reference":
      return r.fns.length ? `executed ${list(r.fns)}, which uses a name changed outside a function` : "imports a name changed outside a function";
    case "module":
      return `loaded ${list(r.files)}, changed outside a function`;
    case "package":
      return `in ${code(r.root)}, where ${list(r.files)} changed`;
    case "always":
      return "configured to always run";
  }
}
function describeFile(f) {
  const note = f.note ? ` (${esc(f.note)})` : "";
  if (f.runAll) return `runs everything: ${esc(f.runAll)}`;
  if (f.packageScope?.length) return `runs every test in ${list(f.packageScope, 5)}${note}`;
  if (f.kind === "test") return "runs itself";
  if (f.kind === "snapshot") return "runs its test file";
  const parts2 = [];
  if (f.units.length) parts2.push(`functions ${list(f.units.map(fnName), 5)}`);
  if (f.fileLevel) parts2.push(`every test that loaded it (${f.fileLevel})`);
  if (parts2.length) return parts2.join("; ") + note;
  if (f.kind === "source") return `only inert lines (blank, comments, types, imports)${note}`;
  return `affects no tests${note}`;
}
function renderSummary(r) {
  const d = r.decision;
  const sel = d?.selection;
  const out2 = [];
  const report = r.mode === "report" && sel;
  const universe = sel ? sel.tests.size + sel.skipped.length : 0;
  const durations = d?.durations;
  const sampled = new Set(report ? d?.sampled ?? [] : r.sampled);
  const share = () => {
    if (!sel) return "";
    if (!durations?.size) return `${pct(sel.tests.size / Math.max(1, universe))} of test files`;
    let all = 0;
    let picked = 0;
    for (const [t, s] of durations) {
      all += s;
      if (sel.tests.has(t) || sampled.has(t)) picked += s;
    }
    return `${pct(picked / Math.max(all, 1e-9))} of past test time`;
  };
  const sampledNote = sampled.size ? `, ${sampled.size} of them sampled` : "";
  if (report && !sel.runAll) {
    const n = sel.tests.size + sampled.size;
    out2.push(`## Jiffy (report mode): would run ${n} of ${universe} test files (${share()}${sampledNote})`);
    out2.push("", "> Report mode changes nothing: this run tests everything. Set `mode: enforce` to skip.");
  } else if (report) {
    out2.push("## Jiffy (report mode): would run everything");
    out2.push("", `> ${esc(runAllReason(sel, d))}`);
  } else if (r.runAll) {
    out2.push("## Jiffy: running everything", "", `> ${esc(r.reason ?? "")}`);
  } else {
    out2.push(`## Jiffy: ${r.tests.length} of ${universe} test files (${share()}${sampledNote})`);
  }
  out2.push("");
  for (const w of r.warnings) out2.push(`> **Warning:** ${esc(w)}`, "");
  if (d) {
    const facts = [
      `Base ${code(short(d.base))} (${esc(d.baseFrom)}) \u2192 head ${code(short(d.head))}.`,
      d.map ? `Map: ${d.map.tests} tests, ${(d.map.bytes / 1024).toFixed(1)} KB` + (d.map.commit ? `, recorded at ${code(short(d.map.commit))}` : "") + (d.map.createdAt ? ` on ${esc(d.map.createdAt)}` : "") + "." : "",
      `Took ${Math.round(r.ms)} ms (map ${d.timings.mapMs} ms, diff ${d.timings.diffMs} ms, select ${d.timings.selectMs} ms).`
    ];
    out2.push(facts.filter(Boolean).join(" "), "");
  }
  if (r.pruned) {
    const combo = Object.entries(r.pruned.kept).map(([k, v]) => `${esc(k)}: ${code(typeof v === "string" ? v : JSON.stringify(v))}`).join(", ");
    const verb = r.mode === "report" ? "Would run" : "Running";
    out2.push(
      `**Matrix:** ${verb} 1 of ${r.pruned.total} combinations (${combo}). The full matrix runs at merge.`,
      ""
    );
  }
  if (r.quarantine.length) {
    const byFile = /* @__PURE__ */ new Map();
    for (const e of r.quarantine) {
      const why = `${esc(e.test.slice(e.file.length + 3) || e.test)}: ${esc(e.reason)}, ${e.flips} flip(s), last ${esc(e.lastSeen)}`;
      byFile.set(e.file, [...byFile.get(e.file) ?? [], why]);
    }
    out2.push(`### ${r.mode === "report" ? "Would quarantine" : "Quarantined"} (${byFile.size})`, "");
    out2.push(
      "Flaky tests (R13): these files run apart from the fast check, so their results are reported but don't decide it, and they are never sampled, so never counted as misses. At merge they run normally.",
      ""
    );
    out2.push("| Test file | Flaky tests |", "| --- | --- |");
    for (const [file, whys] of [...byFile].sort(([a], [b]) => a < b ? -1 : 1).slice(0, MAX_ROWS))
      out2.push(`| ${code(file)} | ${whys.join("<br>")} |`);
    out2.push("");
  }
  if (sel && !sel.runAll) {
    const rows = [...sel.tests.entries()].sort(([a], [b]) => a < b ? -1 : 1);
    out2.push(`### ${report ? "Would select" : "Selected"} (${rows.length})`, "");
    if (rows.length) {
      out2.push("| Test file | Why |", "| --- | --- |");
      const gone = new Set(d.gone);
      for (const [t, rs] of rows.slice(0, MAX_ROWS))
        out2.push(
          `| ${code(t)} | ${rs.map(describeReason).join("; ")}${gone.has(t) ? "; not at head, so not run" : ""} |`
        );
      if (rows.length > MAX_ROWS) out2.push(`| \u2026 | ${rows.length - MAX_ROWS} more |`);
    } else out2.push("Nothing in this change affects a test.");
    out2.push("");
    if (sampled.size) {
      out2.push(`### ${report ? "Would sample" : "Sampled"} (${sampled.size})`, "");
      out2.push(
        "Skipped by the selection, run anyway as a check (R14). A failure here is a miss: the selection should have picked the test, and the suite goes back to running everything.",
        ""
      );
      for (const t of [...sampled].sort()) out2.push(`- ${code(t)}`);
      out2.push("");
    }
    const skipped = sel.skipped.filter((t) => !sampled.has(t)).sort();
    out2.push(`<details><summary>${report ? "Would skip" : "Skipped"} (${skipped.length})</summary>`, "");
    out2.push(
      "Each of these executed none of the changed functions, loaded none of the files changed outside a function, and is not itself changed.",
      ""
    );
    for (const t of skipped.slice(0, MAX_SKIPPED)) out2.push(`- ${code(t)}`);
    if (skipped.length > MAX_SKIPPED) out2.push(`- \u2026 ${skipped.length - MAX_SKIPPED} more`);
    out2.push("", "</details>", "");
  }
  if (d?.changes.files.length) {
    const files = d.changes.files;
    out2.push(`<details><summary>Changed files (${files.length})</summary>`, "");
    out2.push("| File | Kind | Effect |", "| --- | --- | --- |");
    for (const f of files.slice(0, MAX_ROWS))
      out2.push(`| ${code(f.path)} | ${f.kind} | ${describeFile(f)} |`);
    if (files.length > MAX_ROWS) out2.push(`| \u2026 | | ${files.length - MAX_ROWS} more |`);
    out2.push("", "</details>", "");
  }
  let md = out2.join("\n") + "\n";
  if (Buffer.byteLength(md) > MAX_BYTES2)
    md = Buffer.from(md).subarray(0, MAX_BYTES2).toString("utf8") + "\n\n\u2026 summary truncated\n";
  return md;
}

// src/gate.ts
var rawMatrix = (env) => getInput(env, "matrix");
function repoPath(repo, input) {
  if (!input) return null;
  const rel = relative(resolve2(repo), resolve2(process.cwd(), input));
  return rel && !rel.startsWith("..") && !isAbsolute2(rel) ? rel.split(sep).join("/") : null;
}
function rawShards(env) {
  const n = Number(getInput(env, "shards"));
  return Number.isInteger(n) && n >= 1 ? Math.min(n, MAX_JOBS) : 1;
}
var MAX_JOBS = 256;
var OUTPUT_BUDGET = 256 * 1024;
function shardCap(requested, matrix) {
  let combos = 1;
  if (matrix)
    try {
      combos = Math.max(1, expandMatrix(parseMatrix(matrix)).length);
    } catch {
    }
  const shards = Math.max(1, Math.min(requested, Math.floor(MAX_JOBS / combos)));
  return { shards, capped: shards < requested };
}
function serviceFor(env, deps) {
  let url;
  try {
    url = parseServiceUrl(getInput(env, "service-url"));
  } catch {
    return null;
  }
  if (!url) return null;
  const [owner = "", repo = ""] = (env.GITHUB_REPOSITORY ?? "").split("/");
  const timeoutMs = deps.serviceTimeoutMs ?? SERVICE_TIMEOUT_MS;
  let token = null;
  return {
    target: { url, owner, repo, timeoutMs },
    token: () => token ??= owner && repo ? oidcToken(env, timeoutMs) : Promise.reject(new Error("GITHUB_REPOSITORY is not set"))
  };
}
function fullResult(env, inputs, reason, decision) {
  const matrix = inputs?.matrix ?? rawMatrix(env);
  const cap3 = shardCap(inputs?.shards ?? rawShards(env), matrix);
  return {
    runAll: true,
    reason,
    mode: inputs?.mode ?? null,
    tests: [],
    sampled: [],
    quarantined: [],
    quarantine: [],
    shards: fullRunShards(cap3.shards),
    matrix,
    pruned: null,
    decision,
    warnings: cap3.capped ? [`shards cut to ${cap3.shards} to stay within ${MAX_JOBS} matrix jobs`] : [],
    ms: 0
  };
}
var outputBytes = (r) => Buffer.byteLength(JSON.stringify(r.tests)) * 2 + Buffer.byteLength(JSON.stringify(r.sampled)) + Buffer.byteLength(JSON.stringify(r.quarantined)) + Buffer.byteLength(JSON.stringify(r.shards));
async function decideLocal(env, deps, svc) {
  const now = deps.now ?? Date.now;
  let inputs = null;
  let event = {};
  const done = (result2) => ({ result: result2, inputs, event });
  const full = (reason, decision2 = null) => done(fullResult(env, inputs, reason, decision2));
  if (killSwitch(env)) return full("kill switch is on (run-all input or JIFFY_RUN_ALL)");
  try {
    inputs = parseInputs(env);
  } catch (e) {
    if (!(e instanceof InputError)) throw e;
    return full(`invalid input: ${e.message}`);
  }
  let plan;
  try {
    event = readEvent(env);
    plan = planFor(env, event, inputs.base);
  } catch (e) {
    return full(`cannot read the event payload: ${e.message}`);
  }
  if (plan.kind === "full") return full(plan.reason);
  let token = null;
  if (svc) {
    try {
      token = await svc.token();
      const cfg = await fetchConfig(svc.target, token);
      if (cfg.runAll) return full(`service kill switch is on${cfg.reason ? `: ${cfg.reason}` : ""}`);
      if (cfg.mode) inputs.mode = cfg.mode;
    } catch (e) {
      return full(`service: ${e.message}`);
    }
  }
  let quarantine = [];
  const quarantineWarnings = [];
  try {
    quarantine = await loadQuarantine({
      file: inputs.quarantine,
      cwd: process.cwd(),
      service: svc && token ? { target: svc.target, token } : null
    });
  } catch (e) {
    quarantineWarnings.push(`quarantine: ${e.message}; quarantining nothing`);
  }
  const qFiles = quarantinedFiles(quarantine);
  let decision;
  try {
    decision = await deps.decide(
      {
        repo: inputs.workingDirectory,
        map: inputs.map,
        durations: inputs.durations,
        maxMapAgeDays: inputs.maxMapAgeDays,
        baseCandidates: plan.baseCandidates,
        now: now(),
        sampleRate: inputs.sampleRate,
        quarantined: qFiles,
        always: inputs.always,
        ...repoPath(inputs.workingDirectory, inputs.quarantine) && {
          quarantineFile: repoPath(inputs.workingDirectory, inputs.quarantine)
        },
        ...plan.expectHead && { expectHead: plan.expectHead },
        ...svc && token && !inputs.map && { service: { target: svc.target, token } }
      },
      inputs.timeoutSeconds * 1e3
    );
  } catch (e) {
    return full(`error: ${e.message}`);
  }
  let pruned = null;
  let prunedText = "";
  if (inputs.matrix) {
    try {
      const p = pruneMatrix(parseMatrix(inputs.matrix));
      pruned = { kept: p.kept, total: p.total };
      prunedText = JSON.stringify(p.matrix);
    } catch (e) {
      return full(`invalid matrix: ${e.message}`, decision);
    }
  }
  const sel = decision.selection;
  const present = new Set(decision.quarantinePresent);
  if (decision.quarantineIgnored)
    quarantineWarnings.push(`${decision.quarantineIgnored}; quarantining nothing`);
  const applied = quarantine.filter((e) => present.has(e.file));
  if (inputs.mode === "report") {
    const r = full("report mode: everything runs; the summary shows what enforce mode would skip", decision);
    r.result.pruned = pruned;
    r.result.quarantine = applied;
    r.result.warnings.push(...quarantineWarnings);
    return r;
  }
  if (sel.runAll) {
    const r = full(runAllReason(sel, decision), decision);
    r.result.quarantined = decision.quarantinePresent;
    r.result.quarantine = applied;
    r.result.warnings.push(...quarantineWarnings);
    if (!decision.mapProblem) {
      r.result.matrix = prunedText;
      r.result.pruned = pruned;
    }
    return r;
  }
  const gone = new Set(decision.gone);
  const toRun = [...[...sel.tests.keys()].filter((t) => !gone.has(t)), ...decision.sampled].sort();
  const tests = toRun.filter((t) => !present.has(t));
  const quarantined = toRun.filter((t) => present.has(t));
  const broken = [...tests, ...quarantined].find((t) => /[\r\n]/.test(t));
  if (broken) return full(`a test path contains a line break: ${JSON.stringify(broken)}`, decision);
  const cap3 = shardCap(inputs.shards, prunedText);
  const result = {
    runAll: false,
    reason: null,
    mode: inputs.mode,
    tests,
    sampled: decision.sampled,
    quarantined,
    quarantine: applied.filter((e) => quarantined.includes(e.file)),
    shards: tests.length ? balanceShards(tests, decision.durations ?? /* @__PURE__ */ new Map(), cap3.shards) : [],
    matrix: prunedText,
    pruned,
    decision,
    warnings: [
      ...cap3.capped ? [`shards cut to ${cap3.shards} to stay within ${MAX_JOBS} matrix jobs`] : [],
      ...quarantineWarnings
    ],
    ms: 0
  };
  const bytes = outputBytes(result);
  if (bytes > OUTPUT_BUDGET)
    return full(
      `the test list needs ${Math.round(bytes / 1024)} KB of outputs, over the ${OUTPUT_BUDGET / 1024} KB budget`,
      decision
    );
  return done(result);
}
function decisionPayload(env, r, event) {
  const d = r.decision;
  const sel = d && !d.selection.runAll ? d.selection : null;
  const report = r.mode === "report";
  const sampledList = report ? d?.sampled ?? [] : r.sampled;
  const sampled = new Set(sampledList);
  return {
    version: PROTOCOL_VERSION,
    repository: env.GITHUB_REPOSITORY ?? "",
    event: env.GITHUB_EVENT_NAME ?? "",
    ref: env.GITHUB_REF ?? "",
    sha: d?.head ?? env.GITHUB_SHA ?? "",
    base: d?.base ?? null,
    pullRequest: event.pull_request?.number ?? null,
    run: {
      id: env.GITHUB_RUN_ID ?? "",
      attempt: Number(env.GITHUB_RUN_ATTEMPT ?? 1),
      workflow: env.GITHUB_WORKFLOW ?? "",
      job: env.GITHUB_JOB ?? ""
    },
    mode: r.mode,
    runAll: r.runAll,
    reason: r.reason,
    selected: sel ? [...sel.tests].map(([test, reasons]) => ({ test, reasons })) : [],
    sampled: sampledList,
    quarantined: report ? quarantinedFiles(r.quarantine) : r.quarantined,
    skipped: sel ? sel.skipped.filter((t) => !sampled.has(t)) : [],
    matrix: r.pruned,
    map: d?.map ? {
      source: d.map.source,
      tests: d.map.tests,
      ...d.map.commit && { commit: d.map.commit },
      ...d.map.createdAt && { createdAt: d.map.createdAt }
    } : null,
    timings: { totalMs: Math.round(r.ms), ...d?.timings },
    selection: d ? {
      runAll: d.selection.runAll,
      mapProblem: d.mapProblem,
      triggers: d.changes.runAll.slice(0, MAX_TRIGGERS),
      triggerCount: d.changes.runAll.length
    } : null
  };
}
async function decideGate(env, deps) {
  const start2 = performance.now();
  const svc = serviceFor(env, deps);
  const { result, inputs, event } = await decideLocal(env, deps, svc);
  let r = result;
  r.ms = performance.now() - start2;
  if (svc) {
    try {
      await postDecision(svc.target, await svc.token(), decisionPayload(env, r, event));
    } catch (e) {
      const why = `service: ${e.message}`;
      if (r.runAll) r.warnings.push(why);
      else r = fullResult(env, inputs, why, r.decision);
    }
    r.ms = performance.now() - start2;
  }
  const decisionFile = getInput(env, "decision-file");
  if (decisionFile)
    try {
      const p = resolve2(process.cwd(), decisionFile);
      mkdirSync(dirname(p), { recursive: true });
      writeFileSync(p, JSON.stringify(decisionPayload(env, r, event), null, 1) + "\n");
    } catch (e) {
      r.warnings.push(`could not write decision-file: ${e.message}`);
    }
  return r;
}
function writeOutputs(sink, r) {
  sink.outputs([
    ["reason", r.reason ?? ""],
    ["tests", JSON.stringify(r.tests)],
    ["tests-lines", r.tests.join("\n")],
    ["sampled", JSON.stringify(r.sampled)],
    ["quarantined", JSON.stringify(r.quarantined)],
    ["shards", JSON.stringify(r.shards)],
    ["matrix", r.matrix],
    ["run-all", String(r.runAll)]
  ]);
}
var LOUD = /^(error|internal|invalid|service)/;
async function runGate(env, sink, deps) {
  let r;
  try {
    r = await decideGate(env, deps);
  } catch (e) {
    r = fullResult(env, null, `internal error: ${e.message}`, null);
  }
  writeOutputs(sink, r);
  if (r.runAll) sink.log(`Jiffy: running everything: ${r.reason}`);
  else sink.log(`Jiffy: ${r.tests.length} test files (${r.sampled.length} sampled)`);
  if (r.reason && LOUD.test(r.reason)) sink.warning(`running everything: ${r.reason}`);
  for (const w of r.warnings) sink.warning(w);
  try {
    sink.summary(renderSummary(r));
  } catch (e) {
    sink.warning(`could not write the job summary: ${e.message}`);
  }
  return r;
}

// src/start.ts
import { execFileSync as execFileSync2 } from "node:child_process";
import { createHash as createHash3 } from "node:crypto";
import { mkdirSync as mkdirSync2, readFileSync as readFileSync4, writeFileSync as writeFileSync2 } from "node:fs";
import { tmpdir } from "node:os";
import { dirname as dirname2, join } from "node:path";

// src/identity.ts
import { createHash as createHash2 } from "node:crypto";
var sha1 = (s) => createHash2("sha1").update(s).digest("hex");
var JOB_MAX = 200;
var CONTROL_ALL = /[\u0000-\u001f\u007f]/g;
function fitLine(s, max) {
  const one = s.replace(CONTROL_ALL, " ");
  if (one.length <= max) return one;
  const tag = `~${sha1(s).slice(0, 16)}`;
  let cut = max - tag.length;
  if (/[\ud800-\udbff]/.test(one[cut - 1])) cut--;
  return one.slice(0, cut) + tag;
}
var AMBIGUOUS = /[/=\u0000-\u001f\u007f]/;
function matrixKeyOf(raw2) {
  const s = raw2.trim();
  if (!s || s === "null" || s === "{}") return "";
  const hashed = (values) => `sha1:${sha1(s).slice(0, 16)}${values ? `:${sha1(values.join(", ")).slice(0, 16)}` : ""}`;
  let v;
  try {
    v = JSON.parse(s);
  } catch {
    return s.length <= 200 && !AMBIGUOUS.test(s) ? s : hashed();
  }
  if (!v || typeof v !== "object" || Array.isArray(v)) return hashed();
  const parts2 = Object.entries(v).map(([k, x]) => [
    k,
    x !== null && typeof x === "object" ? JSON.stringify(x) : String(x)
  ]);
  const key = parts2.map(([k, x]) => `${k}=${x}`).join("/");
  return key.length > 200 || parts2.some(([k, x]) => AMBIGUOUS.test(k) || AMBIGUOUS.test(x)) ? hashed(parts2.map(([, x]) => x)) : key;
}
var slug = (s, max) => s.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, max) || "x";
function workflowFile(env) {
  const ref = env.GITHUB_WORKFLOW_REF ?? "";
  const m = /\/\.github\/workflows\/([^@]+)@/.exec(ref);
  return m ? m[1] : "";
}
function jobIdentity(env) {
  const job = env.GITHUB_JOB || "job";
  const wf = workflowFile(env);
  return fitLine(wf ? `${wf}:${job}` : job, JOB_MAX);
}
function artifactName(env, matrixRaw) {
  const job = env.GITHUB_JOB || "job";
  const key = matrixKeyOf(matrixRaw);
  const id = sha1(
    [env.GITHUB_WORKFLOW_REF ?? "", job, matrixRaw.trim(), env.GITHUB_RUN_ATTEMPT ?? "1"].join("\0")
  ).slice(0, 10);
  return [EVIDENCE_PREFIX + slug(job, 60), ...key ? [slug(key, 60)] : [], id].join("-");
}

// src/limits.ts
var MAX_WORKFLOWS = 200;
var MAX_YAML_BYTES = 128 * 1024;
var MAX_POLICY_BYTES = 64 * 1024;
var isWorkflowFile = (p) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p);

// src/start.ts
var POLICY_FILE = "jiffy.yml";
var StepProblem = class extends Error {
  problem;
  subject;
  constructor(problem, subject, message) {
    super(message);
    this.problem = problem;
    this.subject = subject;
  }
};
var firstLine = (e) => String(e?.message ?? e).split("\n").find((l) => l.trim())?.slice(0, 300) ?? "unknown error";
var GIT_ENV = { GIT_NO_REPLACE_OBJECTS: "1", GIT_TERMINAL_PROMPT: "0" };
var GIT_OVERRIDES = [
  "-c",
  "core.hooksPath=/dev/null",
  "-c",
  "core.fsmonitor=false",
  "-c",
  "remote.origin.uploadpack=git-upload-pack"
];
function gitRunner(cwd, timeoutMs, extraEnv = {}) {
  return (args2, opts = {}) => execFileSync2("git", [...GIT_OVERRIDES, ...args2], {
    cwd,
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: opts.maxBuffer ?? 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, ...extraEnv, ...GIT_ENV }
  });
}
function gitAuthEnv(cwd, token, server) {
  if (!token) return {};
  const key = `http.${(server || "https://github.com").replace(/\/+$/, "")}/.extraheader`;
  if (tryGit(gitRunner(cwd, 3e4), ["config", "--get-all", key])) return {};
  return {
    GIT_CONFIG_COUNT: "1",
    GIT_CONFIG_KEY_0: key,
    GIT_CONFIG_VALUE_0: `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString("base64")}`
  };
}
var sha256 = (text) => createHash3("sha256").update(text).digest("hex");
var tryGit = (git2, args2) => {
  try {
    return git2(args2).trim();
  } catch {
    return null;
  }
};
function evidenceSkip(env, event, platform) {
  const eventName = env.GITHUB_EVENT_NAME ?? "";
  const pr = event.pull_request;
  if (eventName !== "pull_request" || !pr?.number || !pr.head?.sha)
    return {
      status: "skipped",
      reason: `evidence is for pull_request events (this is ${eventName || "not an Actions run"})`
    };
  if (isForkPr(event))
    return {
      status: "unavailable",
      reason: "pull request from a fork: GitHub gives its workflows no OIDC token, so evidence is unavailable"
    };
  if (/^dependabot\[bot\]$/i.test(env.GITHUB_ACTOR ?? ""))
    return {
      status: "unavailable",
      reason: "Dependabot pull request: its workflows get no OIDC token, so evidence is unavailable"
    };
  if (platform === "win32")
    return { status: "unavailable", reason: "the evidence step is not supported on Windows runners yet" };
  return null;
}
function evidencePaths(env) {
  const artifact = artifactName(env, getInput(env, "matrix-key"));
  const dir = getInput(env, "evidence-dir") || join(env.RUNNER_TEMP || tmpdir(), "jiffy-evidence");
  return {
    artifact,
    file: join(dir, `${artifact}.json`),
    stateFile: join(dir, ".state", `${artifact}.json`)
  };
}
function placeholderFinding() {
  return {
    type: "tool_problem",
    problem: "tests_could_not_run",
    subject: PLACEHOLDER_SUBJECT,
    action: "investigate",
    title: "The evidence step didn't finish (its setup failed, or it timed out or was stopped).",
    evidence: [],
    id: sha1(["tool_problem", "tests_could_not_run", PLACEHOLDER_SUBJECT].join("\0")).slice(0, 16)
  };
}
function writePlaceholder(env, event, file, known = {}) {
  const pr = event.pull_request;
  const f = placeholderFinding();
  const body2 = {
    evidence: {
      schema: 1,
      tool: { name: "jiffy", version: "0.0.0" },
      repo: env.GITHUB_REPOSITORY ?? "",
      pr: pr.number,
      head: pr.head.sha,
      base: known.base ?? pr.base?.sha ?? "",
      ...known.tree && { tree: known.tree },
      mode: "ci",
      policyHash: "none",
      status: "inconclusive",
      summary: f.title,
      findings: [f],
      expected: [],
      budget: { limitSeconds: 0, usedSeconds: 0, truncated: false },
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    job: jobIdentity(env),
    matrixKey: matrixKeyOf(getInput(env, "matrix-key")),
    runId: Math.max(0, Number(env.GITHUB_RUN_ID) || 0),
    attempt: Math.max(1, Number(env.GITHUB_RUN_ATTEMPT) || 1)
  };
  mkdirSync2(dirname2(file), { recursive: true });
  const text = JSON.stringify(body2) + "\n";
  writeFileSync2(file, text);
  return sha256(text);
}
var isShallow = (git2) => tryGit(git2, ["rev-parse", "--is-shallow-repository"]) === "true";
var hasCommit = (git2, rev) => tryGit(git2, ["cat-file", "-e", `${rev}^{commit}`]) !== null;
function gitFetch(git2, args2, what = "the reference commit") {
  try {
    git2(["fetch", "--no-tags", "--no-recurse-submodules", "--quiet", ...args2]);
  } catch (e) {
    throw new StepProblem(
      "config",
      "checkout",
      `Could not fetch ${what} (${firstLine(e)}). Pass the job token to the evidence start step (token: github.token), or check out with fetch-depth: 0.`
    );
  }
}
function resolveReference(git2, pr, runSha) {
  const tested = tryGit(git2, ["rev-parse", "HEAD"]);
  if (!tested) throw new StepProblem("config", "checkout", "The working directory is not a git checkout.");
  const prHead = pr.head?.sha ?? "";
  const target = pr.base?.sha ?? "";
  if (!target) throw new StepProblem("config", "event", "The pull request event has no base sha.");
  if (tested === prHead) {
    const mb = () => tryGit(git2, ["merge-base", target, tested]);
    if (!hasCommit(git2, target) || !mb()) {
      if (isShallow(git2)) {
        for (const depth of [50, 200, 1e3]) {
          gitFetch(git2, [`--depth=${depth}`, "origin", tested, target]);
          if (mb()) break;
        }
        if (!mb()) gitFetch(git2, ["--unshallow", "origin", tested, target]);
      } else gitFetch(git2, ["origin", target]);
    }
    const reference2 = mb();
    if (!reference2)
      throw new StepProblem(
        "config",
        "checkout",
        `No merge-base between the PR head and its base ${target}.`
      );
    return { tested, reference: reference2, baseSide: target, how: "head" };
  }
  if (runSha && tested !== runSha)
    throw new StepProblem(
      "config",
      "checkout",
      `The checkout (${tested.slice(0, 12)}) is neither this run's commit (${runSha.slice(0, 12)}) nor the PR head; Jiffy can't tell what was tested.`
    );
  const raw2 = tryGit(git2, ["cat-file", "commit", tested]) ?? "";
  const parents = [...raw2.matchAll(/^parent ([0-9a-f]{40,64})$/gm)].map((m) => m[1]);
  if (parents.length !== 2 || parents[1] !== prHead)
    throw new StepProblem(
      "config",
      "checkout",
      `The checkout (${tested.slice(0, 12)}) is not a merge of the PR head (${prHead.slice(0, 12)}) the event names; Jiffy can't tell what was tested.`
    );
  const reference = parents[0];
  const need = [reference, prHead, ...reference === target ? [] : [target]];
  if (need.some((c) => !hasCommit(git2, c))) {
    if (isShallow(git2))
      gitFetch(git2, ["--depth=2", "origin", tested, ...reference === target ? [] : [target]]);
    else gitFetch(git2, ["origin", ...need]);
  }
  if (!hasCommit(git2, reference))
    throw new StepProblem(
      "config",
      "checkout",
      `The reference commit ${reference} is missing after fetching.`
    );
  if (reference !== target) {
    if (isShallow(git2) && tryGit(git2, ["merge-base", "--is-ancestor", target, reference]) === null)
      gitFetch(git2, ["--deepen=200", "origin", reference]);
    if (tryGit(git2, ["merge-base", "--is-ancestor", target, reference]) === null)
      throw new StepProblem(
        "config",
        "checkout",
        `The merge commit's first parent (${reference.slice(0, 12)}) doesn't descend from the base the event names (${target.slice(0, 12)}).`
      );
  }
  return { tested, reference, baseSide: reference, how: "merge" };
}
function workflowsAt(git2, rev) {
  const files = {};
  const unreadable = [];
  let out2;
  try {
    out2 = git2(["ls-tree", "-z", "--long", rev, "--", ".github/workflows/"]);
  } catch (e) {
    unreadable.push({
      path: ".github/workflows",
      reason: `can't be listed at ${rev.slice(0, 12)} (${firstLine(e)})`
    });
    return { files, unreadable };
  }
  let n = 0;
  for (const entry of out2.split("\0")) {
    const m = /^(\d+) (\w+) ([0-9a-f]+)\s+(-|\d+)\t(.+)$/s.exec(entry);
    if (!m) continue;
    const [, mode, type, sha, size, path] = m;
    if (!isWorkflowFile(path)) continue;
    if (++n > MAX_WORKFLOWS) {
      unreadable.push({
        path: ".github/workflows",
        reason: `more than ${MAX_WORKFLOWS} workflow files; the rest weren't read`
      });
      break;
    }
    if (type !== "blob" || mode === "120000") unreadable.push({ path, reason: "not a regular file" });
    else if (Number(size) > MAX_YAML_BYTES)
      unreadable.push({ path, reason: `larger than ${MAX_YAML_BYTES / 1024} KB` });
    else {
      const text = tryGit(git2, ["cat-file", "blob", sha]);
      if (text === null) unreadable.push({ path, reason: "could not be read" });
      else files[path] = text;
    }
  }
  return { files, unreadable };
}
function readPolicy(git2, defaultBranch) {
  const ref = "refs/jiffy/default-branch";
  try {
    git2([
      "fetch",
      "--no-tags",
      "--no-recurse-submodules",
      "--quiet",
      ...isShallow(git2) ? ["--depth=1"] : [],
      "origin",
      `+refs/heads/${defaultBranch}:${ref}`
    ]);
  } catch (e) {
    return {
      text: null,
      problem: `The default branch (${defaultBranch}) couldn't be fetched to read ${POLICY_FILE}: ${firstLine(e)}`
    };
  }
  let entry;
  try {
    entry = git2(["ls-tree", "-z", "--long", ref, "--", POLICY_FILE]).replace(/\0$/, "");
  } catch (e) {
    return { text: null, problem: `${POLICY_FILE} on ${defaultBranch} couldn't be listed: ${firstLine(e)}` };
  }
  if (!entry) return { text: null, problem: null };
  const m = /^(\d+) (\w+) ([0-9a-f]+)\s+(-|\d+)\t/.exec(entry);
  if (!m || m[2] !== "blob" || m[1] === "120000")
    return { text: null, problem: `${POLICY_FILE} on ${defaultBranch} is not a regular file` };
  if (Number(m[4]) > MAX_POLICY_BYTES)
    return {
      text: null,
      problem: `${POLICY_FILE} on ${defaultBranch} is larger than ${MAX_POLICY_BYTES / 1024} KB`
    };
  const text = tryGit(git2, ["cat-file", "blob", m[3]]);
  return text === null ? { text: null, problem: `${POLICY_FILE} on ${defaultBranch} couldn't be read` } : { text, problem: null };
}
var runOf = (env) => `${env.GITHUB_RUN_ID ?? ""}/${env.GITHUB_RUN_ATTEMPT ?? ""}`;
function collectState(git2, env, event) {
  const pr = event.pull_request;
  const state = {
    version: 1,
    run: runOf(env),
    ref: null,
    tree: null,
    policy: { text: null, problem: null },
    workflows: null,
    changed: [],
    problems: []
  };
  const problem = (e, fallback) => state.problems.push(
    e instanceof StepProblem ? { problem: e.problem, subject: e.subject, message: e.message } : {
      problem: fallback.problem,
      subject: fallback.subject,
      message: `${fallback.prefix}${firstLine(e)}`
    }
  );
  try {
    state.ref = resolveReference(git2, pr, env.GITHUB_SHA);
  } catch (e) {
    problem(e, {
      problem: "tests_could_not_run",
      subject: "evidence-step",
      prefix: "The evidence step failed: "
    });
    return state;
  }
  const ref = state.ref;
  const defaultBranch = event.repository?.default_branch;
  state.policy = defaultBranch ? readPolicy(git2, defaultBranch) : { text: null, problem: `The event names no default branch to read ${POLICY_FILE} from.` };
  try {
    const head = workflowsAt(git2, ref.tested);
    state.workflows = {
      base: workflowsAt(git2, ref.baseSide),
      head,
      dispatchHead: ref.tested === pr.head.sha ? head : workflowsAt(git2, pr.head.sha)
    };
    state.changed = git2(["diff", "--name-only", "-z", "--no-renames", ref.reference, ref.tested]).split("\0").filter(Boolean);
    state.tree = tryGit(git2, ["rev-parse", `${ref.tested}^{tree}`]);
  } catch (e) {
    problem(e, {
      problem: "config",
      subject: ".github/workflows",
      prefix: "Could not look for main-only workflows: "
    });
  }
  return state;
}
function saveState(file, state) {
  mkdirSync2(dirname2(file), { recursive: true });
  writeFileSync2(file, JSON.stringify(state));
}
function runStart(env, sink, opts = {}) {
  Object.assign(process.env, { GIT_NO_REPLACE_OBJECTS: "1" });
  let event;
  try {
    event = readEvent(env);
  } catch (e) {
    return {
      file: null,
      artifact: null,
      status: "skipped",
      reason: `cannot read the event payload: ${firstLine(e)}`
    };
  }
  const skip = evidenceSkip(env, event, opts.platform ?? process.platform);
  if (skip) return { file: null, artifact: null, ...skip };
  const paths = evidencePaths(env);
  sink.outputs([
    ["sha256", writePlaceholder(env, event, paths.file)],
    ["file", paths.file],
    ["artifact", paths.artifact],
    ["status", "inconclusive"]
  ]);
  const cwd = getInput(env, "working-directory") || env.GITHUB_WORKSPACE || process.cwd();
  const auth2 = gitAuthEnv(cwd, getInput(env, "token"), env.GITHUB_SERVER_URL);
  const state = collectState(gitRunner(cwd, opts.gitTimeoutMs ?? 18e4, auth2), env, event);
  if (state.ref)
    sink.outputs([
      ["sha256", writePlaceholder(env, event, paths.file, { base: state.ref.reference, tree: state.tree })]
    ]);
  saveState(paths.stateFile, state);
  return {
    file: paths.file,
    artifact: paths.artifact,
    status: "inconclusive",
    reason: state.problems.length ? `read what it needs from git, with problems: ${state.problems.map((p) => p.message).join("; ")}` : `read what it needs from git (tested ${state.ref?.tested.slice(0, 12)}, reference ${state.ref?.reference.slice(0, 12)})`
  };
}
function mainStart(env, sink) {
  let o;
  try {
    o = runStart(env, sink);
  } catch (e) {
    o = { file: null, artifact: null, status: "skipped", reason: `internal error: ${firstLine(e)}` };
    sink.warning(`Jiffy evidence start: ${o.reason}`);
  }
  if (!o.file)
    sink.outputs([
      ["file", ""],
      ["artifact", ""],
      ["status", o.status]
    ]);
  sink.log(`Jiffy evidence start: ${o.reason}`);
  return 0;
}

// src/step/outcome.ts
import { createHash as createHash5 } from "node:crypto";
import { existsSync, mkdirSync as mkdirSync3, readFileSync as readFileSync5, statSync, writeFileSync as writeFileSync3 } from "node:fs";
import { dirname as dirname3, isAbsolute as isAbsolute3, join as join2, resolve as resolve3 } from "node:path";

// ../flaky/src/results.ts
var RANK = { passed: 0, retried: 1, failed: 2 };
var combine = (a, b) => RANK[a] >= RANK[b] ? a : b;
var slashes = (p) => p.replace(/\\/g, "/");
function relative2(path, root) {
  let p = slashes(path);
  if (root) {
    const r = slashes(root).replace(/\/?$/, "/");
    if (p.startsWith(r)) p = p.slice(r.length);
  }
  return p.replace(/^\.\//, "");
}
var Collector = class {
  byId = /* @__PURE__ */ new Map();
  add(file, name2, outcome) {
    if (!outcome) return;
    const id = `${file} > ${name2}`;
    const r = this.byId.get(id);
    if (r) r.outcome = combine(r.outcome, outcome);
    else this.byId.set(id, { id, file, name: name2, outcome });
  }
  done() {
    return [...this.byId.values()];
  }
};
function jsonOutcome(a) {
  if (a.status === "failed") return "failed";
  if (a.status !== "passed") return null;
  return a.retryReasons?.length || a.failureMessages?.length ? "retried" : "passed";
}
function fromJson(report, opts) {
  if (!Array.isArray(report.testResults)) throw new Error("not a Vitest/Jest JSON report (no testResults)");
  const out2 = new Collector();
  for (const file of report.testResults) {
    if (typeof file.name !== "string") continue;
    const path = relative2(file.name, opts.root);
    const cases = file.assertionResults ?? [];
    for (const a of cases) {
      const name2 = a.fullName || [...a.ancestorTitles ?? [], a.title ?? ""].filter(Boolean).join(" ");
      out2.add(path, name2, jsonOutcome(a));
    }
    if (file.status === "failed" && !cases.some((a) => a.status === "failed"))
      out2.add(path, "(file)", "failed");
  }
  return out2.done();
}
var ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}
function attrs(s) {
  const out2 = {};
  for (const m of s.matchAll(/([^\s=/]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g))
    out2[m[1]] = decode(m[2] ?? m[3] ?? "");
  return out2;
}
var looksLikePath = (s) => !!s && (/[/\\]/.test(s) || /\.(?:[cm]?[jt]sx?|py|java|kt|scala|groovy)$/.test(s));
var CLASS_EXTS = [".py", ".java", ".kt", ".scala", ".groovy"];
function classResolver(files) {
  if (!files) return () => null;
  const byBase = /* @__PURE__ */ new Map();
  for (const f of files) {
    const b = f.slice(f.lastIndexOf("/") + 1);
    byBase.set(b, [...byBase.get(b) ?? [], f]);
  }
  return (cls) => {
    const parts2 = cls.split(".");
    for (let n = parts2.length; n >= 1; n--) {
      const stem = parts2.slice(0, n).join("/");
      for (const ext of CLASS_EXTS) {
        const want = stem + ext;
        const hits = (byBase.get(parts2[n - 1] + ext) ?? []).filter(
          (f) => f === want || f.endsWith("/" + want)
        );
        if (hits.length === 1) return hits[0];
        if (hits.length > 1) return null;
      }
    }
    return null;
  };
}
var SKIP = [
  ["<!--", "-->"],
  ["<![CDATA[", "]]>"],
  ["<?", "?>"],
  ["<!DOCTYPE", ">"]
];
function stripMarkup(xml) {
  const out2 = [];
  let start2 = 0;
  let i2 = 0;
  for (; ; ) {
    const lt = xml.indexOf("<", i2);
    if (lt < 0) break;
    const m = SKIP.find(([open]) => xml.startsWith(open, lt));
    if (!m) {
      i2 = lt + 1;
      continue;
    }
    out2.push(xml.slice(start2, lt));
    const end = xml.indexOf(m[1], lt + m[0].length);
    if (end < 0) return out2.join("");
    start2 = i2 = end + m[1].length;
  }
  out2.push(xml.slice(start2));
  return out2.join("");
}
function fromJunit(xml, opts) {
  const body2 = stripMarkup(xml);
  if (!/<testsuites?[\s>]/.test(body2)) throw new Error("not a JUnit XML report (no <testsuite>)");
  const resolveClass = classResolver(opts.files);
  const out2 = new Collector();
  const suites = [];
  let tc = null;
  const finish = () => {
    if (!tc) return;
    const suite = suites[suites.length - 1] ?? {};
    const { classname, name: name2 = "" } = tc.a;
    const rawFile = [tc.a.file, suite.file, classname, suite.name].find(looksLikePath) ?? (classname && resolveClass(classname)) ?? classname ?? suite.name ?? "";
    const file = relative2(rawFile, opts.root);
    const prefix = classname && !looksLikePath(classname) && !name2.startsWith(classname) ? `${classname} > ` : "";
    const outcome = tc.failed ? "failed" : tc.skipped ? null : tc.reran ? "retried" : "passed";
    out2.add(file, prefix + name2, outcome);
    tc = null;
  };
  for (const m of body2.matchAll(/<(\/?)([\w:.-]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g)) {
    const [, close, tag, rest = "", selfClose] = m;
    if (tag === "testsuite") {
      if (close) suites.pop();
      else if (!selfClose) suites.push(attrs(rest));
    } else if (tag === "testcase") {
      if (close) finish();
      else {
        finish();
        tc = { a: attrs(rest), failed: false, skipped: false, reran: false };
        if (selfClose) finish();
      }
    } else if (tc && !close) {
      if (tag === "failure" || tag === "error") tc.failed = true;
      else if (tag === "skipped") tc.skipped = true;
      else if (/^(flaky|rerun)(Failure|Error)$/.test(tag)) tc.reran = true;
    }
  }
  finish();
  return out2.done();
}
function parseResults(text, opts = {}) {
  const t = text.trimStart();
  return t.startsWith("<") ? fromJunit(t, opts) : fromJson(JSON.parse(t), opts);
}

// ../ledger/src/contract.ts
import { createHash as createHash4 } from "node:crypto";
var LIMITS = {
  /** Test results in one upload. A bigger suite sends several parts. */
  testsPerUpload: 5e4,
  /** Raw body bytes of one upload. */
  uploadBytes: 8 * 1024 * 1024,
  /** Parts per (run, attempt, job, matrix). */
  partsPerJob: 64,
  testIdChars: 1e3,
  fileChars: 500,
  jobKeyChars: 200,
  /** Canonical JSON of the matrix values. */
  matrixChars: 2e3,
  steps: 200,
  /** One test (or step) longer than this is a clock error. */
  durationMs: 24 * 3600 * 1e3
};
var isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function canonicalJson(v) {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(",")}]`;
  if (isObj(v))
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(",")}}`;
  return JSON.stringify(v ?? null);
}
function matrixKey(matrix) {
  if (matrix === void 0) return "?";
  const c = canonicalJson(matrix ?? {});
  return c.length <= 64 ? c : `h:${createHash4("sha256").update(c).digest("hex").slice(0, 32)}`;
}
var sha2562 = (s) => createHash4("sha256").update(s).digest("hex");

// src/step/records.ts
var DECISION_SCHEMA = "tensile.selection-decision";
var RECORD_SCHEMA = "tensile.selection-record";
var STEP_POLICY_VERSION = "select-step@1";
var MAX_PROPOSED_BYTES = 48 * 1024;
function unknownFreshness(reason) {
  return { watermark: null, lagMs: Number.MAX_SAFE_INTEGER, stale: true, complete: false, reasons: [reason] };
}
function barKey(p) {
  const wf = /^[^/]+\/[^/]+\/(.+?)@/.exec(p.workflowRef)?.[1] ?? "?";
  const scope = sha2562(JSON.stringify([p.root, [...p.testPaths].sort(), [...p.always].sort()])).slice(0, 12);
  return `${wf}#${p.job}#${p.runner}#${scope}#${STEP_POLICY_VERSION}`;
}
var jobKey = (d) => `${d.run.id}/${d.run.attempt}/${d.run.job}/${matrixKey(d.matrix)}`;
var subjectId = (d) => d.checkRunId ? String(d.checkRunId) : jobKey(d);
function ledgerDecision(d) {
  const selected = d.selected.map((s) => s.test);
  const lists = { selected, sampled: d.sampled };
  const base3 = {
    runAll: d.runAll,
    reasons: d.reasons.slice(0, 20),
    basis: d.basis,
    mapVerified: d.map?.verified ?? false,
    // The control room's fields (control-plane.md module 8).
    enforceable: d.enforceable,
    enforceBlockers: d.enforceBlockers.slice(0, 10),
    skippedShare: d.runAll ? 0 : Math.round(d.skippedShare * 1e4) / 1e4,
    skippedShareBasis: d.skippedShareBasis,
    testStep: d.testStep,
    runner: d.runner,
    barKey: d.barKey,
    // The plan's rule version: the service counts a decision only when it recomputed it with the same rules.
    engine: PLAN_VERSION,
    counts: {
      universe: d.universe,
      selected: selected.length,
      sampled: d.sampled.length,
      skipped: d.skipped.length
    },
    skippedSha256: sha2562(d.skipped.join("\n")),
    selectedSha256: sha2562(selected.join("\n"))
  };
  const withLists = { ...base3, ...lists, listsComplete: true };
  const proposed = Buffer.byteLength(JSON.stringify(withLists)) <= MAX_PROPOSED_BYTES ? withLists : { ...base3, selected: null, sampled: null, listsComplete: false };
  const enforced = d.mode === "enforce";
  return {
    module: "smart_execution",
    kind: "select",
    repoId: Number(d.repoId) || 0,
    subject: { type: "job", id: subjectId(d) },
    headSha: d.head,
    prNumber: d.prNumber,
    mode: d.mode,
    proposed,
    safeDefault: d.runAll,
    // Enforcing, the job ran what was proposed (the selected and sampled tests, or everything).
    applied: enforced ? { runAll: d.runAll, ran: d.runAll ? "everything" : "selected+sampled" } : null,
    inputs: {
      freshness: d.ledger ?? unknownFreshness("no ledger read: the step had no service"),
      refs: {
        map: d.map,
        base: d.base,
        from: d.from,
        head: d.head,
        event: d.event,
        ref: d.ref,
        run: d.run,
        matrix: d.matrix === void 0 ? "?" : canonicalJson(d.matrix),
        requestedMode: d.requestedMode,
        modeReason: d.modeReason
      }
    },
    policyVersion: STEP_POLICY_VERSION,
    idempotencyKey: `select:${jobKey(d)}`
  };
}
var cap = (xs, n = 200) => xs.slice(0, n);
function judge(d, report, testOutcome, reportSha256) {
  const kind = d.mode === "enforce" && !d.runAll ? "selected_run" : "full_suite";
  const evidence = { reportSha256, run: d.run };
  const empty = {
    failed: [],
    missed: [],
    sampledMisses: [],
    unseenSkipped: d.skipped.length,
    unknownTests: [],
    reportTests: 0,
    testOutcome
  };
  if (!report)
    return { kind, verdict: "unknown", observed: empty, evidence, note: "no readable test report" };
  const failed = [...new Set(report.failed)].sort();
  const seen = new Set(report.seen);
  const selected = new Set(d.selected.map((s) => s.test));
  const sampled = new Set(d.sampled);
  const skipped = new Set(d.skipped);
  const missed = d.runAll ? [] : failed.filter((f) => skipped.has(f) || !selected.has(f) && !sampled.has(f));
  const sampledMisses = d.runAll ? [] : failed.filter((f) => sampled.has(f));
  const unseenSkipped = d.runAll ? 0 : d.skipped.filter((t) => !seen.has(t)).length;
  const unknownTests = d.runAll ? [] : [...seen].filter((t) => !selected.has(t) && !sampled.has(t) && !skipped.has(t)).sort();
  const observed = {
    failed: cap(failed),
    missed: cap(missed),
    sampledMisses: cap(sampledMisses),
    unseenSkipped,
    unknownTests: cap(unknownTests),
    reportTests: seen.size,
    testOutcome
  };
  const out2 = (verdict, note) => ({
    kind,
    verdict,
    observed,
    evidence,
    ...note && { note }
  });
  if (kind === "selected_run") {
    if (sampledMisses.length) return out2("miss");
    return out2("unknown", "enforced: skipped tests did not run; the main safety net judges them");
  }
  if (missed.length) return out2("miss");
  if (!seen.size) return out2("unknown", "the report lists no tests");
  if (testOutcome && testOutcome !== "success" && !failed.length)
    return out2("unknown", `the test step concluded ${testOutcome} but the report lists no failure`);
  if (d.runAll) return out2("correct");
  if (unseenSkipped) return out2("unknown", `${unseenSkipped} skipped tests are not in the report`);
  if (unknownTests.length)
    return out2(
      "unknown",
      `${unknownTests.length} test files in the report are unknown to selection (${unknownTests[0]}): it can't vouch for the suite`
    );
  return out2("correct");
}
function selectionRecord(d, outcomes) {
  return { schema: RECORD_SCHEMA, version: 1, decision: ledgerDecision(d), outcomes };
}

// src/step/summary.ts
var esc2 = (s) => s.replace(/[&<>"'|`]/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\r?\n/g, " ");
var code2 = (s) => `<code>${esc2(s)}</code>`;
var list2 = (xs, n = 3) => xs.slice(0, n).map(code2).join(", ") + (xs.length > n ? ` and ${xs.length - n} more` : "");
var MAX_ROWS2 = 200;
var MAX_BYTES3 = 9e5;
function describePlanReason(r) {
  switch (r.kind) {
    case "static":
      return `its static imports reach ${list2(r.files)}`;
    case "history":
      return `failed recently (${esc2(r.failedAt.slice(0, 10))}) in an affected package`;
    case "package-grain":
      return `no coverage map; ${code2(r.root)} is affected`;
    case "spawns":
      return `starts processes the map's recorder didn't follow (${list2(r.files)})`;
    default:
      return describeReason(r);
  }
}
function cap2(md) {
  return Buffer.byteLength(md) > MAX_BYTES3 ? md.slice(0, MAX_BYTES3) + "\n\n(truncated)\n" : md;
}
function renderDecision(d) {
  const out2 = [`### Tensile selection (${d.mode})`, ""];
  const total = d.universe;
  const runs = d.selected.length + d.sampled.length;
  if (d.runAll) out2.push(`**Runs everything:** ${esc2(d.reasons.join("; ") || "no reason recorded")}`, "");
  else if (d.mode === "enforce")
    out2.push(
      `Runs **${runs} of ${total}** test files (${d.sampled.length} sampled as a check); skips ${d.skipped.length}.`,
      ""
    );
  else
    out2.push(
      `Everything runs (shadow). Selection would run **${runs} of ${total}** test files and skip ${d.skipped.length}.`,
      ""
    );
  if (d.modeReason) out2.push(`Not enforcing: ${esc2(d.modeReason)}.`, "");
  if (d.map)
    out2.push(
      `Map: ${code2(d.map.source)}${d.map.commit ? ` at ${code2(d.map.commit.slice(0, 10))}` : ""}, ${d.map.verified ? `signature verified (key ${code2(d.map.keyId ?? "")})` : `**unverified**${d.map.problem ? ` (${esc2(d.map.problem)})` : ""}`}${d.map.distance !== null ? `, ${d.map.distance} commits behind the base` : ""}.`,
      ""
    );
  else if (!d.runAll) out2.push(`No coverage map: ${esc2(d.basis)} grain.`, "");
  if (!d.runAll && d.selected.length) {
    out2.push("<details><summary>Selected tests and why</summary>", "", "| Test | Why |", "| --- | --- |");
    for (const s of d.selected.slice(0, MAX_ROWS2))
      out2.push(`| ${code2(s.test)} | ${s.reasons.map(describePlanReason).join("; ")} |`);
    if (d.selected.length > MAX_ROWS2) out2.push(`| \u2026 | ${d.selected.length - MAX_ROWS2} more |`);
    out2.push("", "</details>", "");
  }
  const t = d.timings;
  if (t.stepMs !== void 0) out2.push(`Decided in ${t.stepMs} ms.`, "");
  return cap2(out2.join("\n"));
}
function renderOutcome(d, o) {
  const out2 = ["### Tensile selection: outcome", ""];
  const o2 = o.observed;
  if (o.verdict === "miss")
    out2.push(
      `**Miss:** selection ${d.mode === "enforce" ? "skipped" : "would have skipped"} failing test file(s) ${list2(o2.missed.length ? o2.missed : o2.sampledMisses, 10)}.`,
      ""
    );
  else if (o.verdict === "correct")
    out2.push(
      d.runAll ? "Nothing was skipped, so nothing could be missed." : `No miss: ${o2.failed.length} failing test file(s), all selected; every skipped test passed.`,
      ""
    );
  else out2.push(`Unknown: ${esc2(o.note ?? "not enough evidence")}.`, "");
  out2.push(`Verdict \`${o.verdict}\` (${o.kind}), recorded for the ledger.`, "");
  return cap2(out2.join("\n"));
}

// src/step/outcome.ts
var MAX_REPORT_BYTES = 64 * 1024 * 1024;
var recordPath = (decisionFile) => join2(dirname3(decisionFile), "selection-record.json");
function readDecision(file) {
  const d = JSON.parse(readFileSync5(file, "utf8"));
  if (d?.schema !== DECISION_SCHEMA || d.version !== 1)
    throw new Error(`${file} is not a selection decision`);
  return d;
}
function readReports(paths, repo, root) {
  const hash = createHash5("sha256");
  const failed = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  let any = false;
  const repoRoot = resolve3(repo).replace(/\\/g, "/").replace(/\/?$/, "/");
  const prefix = root.replace(/^\.\/?/, "").replace(/\/+$/, "");
  for (const p of paths) {
    const abs = isAbsolute3(p) ? p : resolve3(repo, p);
    if (!existsSync(abs)) continue;
    if (statSync(abs).size > MAX_REPORT_BYTES) throw new Error(`${p} is over ${MAX_REPORT_BYTES} bytes`);
    const buf = readFileSync5(abs);
    hash.update(buf);
    for (const r of parseResults(buf.toString("utf8"), { root: repoRoot })) {
      const file = prefix && !r.file.startsWith(prefix + "/") && !r.file.startsWith("/") ? `${prefix}/${r.file}` : r.file;
      seen.add(file);
      if (r.outcome === "failed") failed.add(file);
    }
    any = true;
  }
  if (!any) return null;
  return { tests: { failed: [...failed].sort(), seen: [...seen].sort() }, sha256: hash.digest("hex") };
}
var lines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
function runOutcomePhase(env, sink, decisionFile) {
  let d;
  try {
    d = readDecision(decisionFile);
  } catch (e) {
    sink.warning(`no selection decision to judge (${e.message})`);
    return null;
  }
  const repo = getInput(env, "working-directory") || env.GITHUB_WORKSPACE || ".";
  const testOutcome = getInput(env, "test-outcome") || null;
  let report = null;
  try {
    report = readReports(lines(getInput(env, "report")), repo, d.root);
  } catch (e) {
    sink.warning(`test report unreadable: ${e.message}`);
  }
  const outcome = judge(d, report?.tests ?? null, testOutcome, report?.sha256 ?? null);
  const record = selectionRecord(d, [outcome]);
  const out2 = recordPath(decisionFile);
  try {
    mkdirSync3(dirname3(out2), { recursive: true });
    writeFileSync3(out2, JSON.stringify(record) + "\n");
  } catch (e) {
    sink.warning(`could not write the selection record: ${e.message}`);
  }
  sink.outputs([
    ["record-file", out2],
    ["verdict", outcome.verdict],
    ["missed", JSON.stringify(outcome.observed.missed)]
  ]);
  if (outcome.verdict === "miss")
    sink.warning(
      `selection would have missed failing test file(s): ${outcome.observed.missed.slice(0, 5).join(", ")}`
    );
  try {
    sink.summary(renderOutcome(d, outcome));
  } catch (e) {
    sink.warning(`could not write the job summary: ${e.message}`);
  }
  return record;
}
function runPost(env, sink) {
  const decisionFile = env.STATE_decision;
  if (!decisionFile || !getInput(env, "report")) return null;
  if (existsSync(recordPath(decisionFile))) return null;
  return runOutcomePhase(env, sink, decisionFile);
}
var RECORD_UPLOAD_PATH = "/v1/ledger/selection-records";
async function sendRecord(env, sink, record, opts = {}) {
  if (!record) return "skipped";
  let url;
  try {
    url = parseServiceUrl(getInput(env, "service-url"));
  } catch (e) {
    sink.warning(`selection record not sent: ${e.message}`);
    return "failed";
  }
  if (!url) return "skipped";
  if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    sink.warning(
      "selection record not sent: no OIDC token (the job needs `permissions: id-token: write`; fork and Dependabot PRs get none)"
    );
    return "skipped";
  }
  const timeoutMs = opts.timeoutMs ?? 1e4;
  try {
    const token = await oidcToken(env, timeoutMs);
    await call(
      `POST ${RECORD_UPLOAD_PATH}`,
      url.replace(/\/+$/, "") + RECORD_UPLOAD_PATH,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(record)
      },
      timeoutMs
    );
    return "sent";
  } catch (e) {
    sink.warning(`selection record not sent: ${e.message}`);
    return "failed";
  }
}

// src/step/select.ts
import { mkdirSync as mkdirSync4, writeFileSync as writeFileSync4 } from "node:fs";
import { dirname as dirname4, join as join3, resolve as resolve4 } from "node:path";

// ../ledger/src/signing.ts
import {
  createHash as createHash6,
  createPrivateKey,
  createPublicKey,
  sign as edSign,
  verify as edVerify
} from "node:crypto";
var MAP_FORMAT = "jiffy.map.gz/1";
var MAP_CLAIMS_VERSION = 1;
var KID = /^[A-Za-z0-9_.-]{1,64}$/;
function mapPublicKey(kid, key) {
  if (!KID.test(kid)) throw new Error("map key id must be 1-64 of [A-Za-z0-9_.-]");
  let k;
  if (typeof key === "object") k = createPublicKey({ key: { ...key }, format: "jwk" });
  else if (key.trim().startsWith("-----")) k = createPublicKey(key.trim());
  else k = createPublicKey({ key: Buffer.from(key.trim(), "base64"), format: "der", type: "spki" });
  if (k.asymmetricKeyType !== "ed25519") throw new Error(`map key ${kid} is not an Ed25519 key`);
  return { kid, publicKey: k };
}
function mapSha256(bytes) {
  return createHash6("sha256").update(bytes).digest("hex");
}
var MAX_CLAIMS_CHARS = 4096;
var HEX40 = /^[0-9a-f]{40}$/;
var HEX64 = /^[0-9a-f]{64}$/;
function verifyMap(keys, signed, expect) {
  const no = (reason) => ({ ok: false, reason });
  if (!signed || typeof signed !== "object") return no("no signature");
  const { claims: text, signature } = signed;
  if (typeof text !== "string" || typeof signature !== "string") return no("no signature");
  if (text.length > MAX_CLAIMS_CHARS || signature.length > 200) return no("signature too large");
  let c;
  try {
    c = JSON.parse(text);
  } catch {
    return no("claims are not JSON");
  }
  if (!c || typeof c !== "object" || Array.isArray(c)) return no("claims are not an object");
  if (c.v !== MAP_CLAIMS_VERSION) return no(`claims version ${String(c.v)} is not ${MAP_CLAIMS_VERSION}`);
  if (canonicalJson(c) !== text) return no("claims are not canonical");
  const key = keys.find((k) => k.kid === c.kid);
  if (!key) return no(`unknown signing key ${String(c.kid)}`);
  let good = false;
  try {
    good = edVerify(null, Buffer.from(text), key.publicKey, Buffer.from(signature, "base64url"));
  } catch {
    good = false;
  }
  if (!good) return no("bad signature");
  if (typeof c.host !== "string" || c.host.toLowerCase() !== expect.host.toLowerCase())
    return no(`map is for host ${String(c.host)}, not ${expect.host}`);
  if (c.repoId !== expect.repoId) return no(`map is for repo ${String(c.repoId)}, not ${expect.repoId}`);
  if (expect.tenant !== void 0 && c.tenant !== expect.tenant) return no("map is for another tenant");
  if (typeof c.sha !== "string" || !HEX40.test(c.sha)) return no("map commit is not a sha");
  if (expect.sha !== void 0 && c.sha !== expect.sha) return no(`map is for ${c.sha}, not ${expect.sha}`);
  if (typeof c.mapSha256 !== "string" || !HEX64.test(c.mapSha256)) return no("map hash is not a sha256");
  if (expect.mapSha256 !== void 0 && c.mapSha256 !== expect.mapSha256)
    return no("map bytes do not match the signed hash");
  if (c.format !== MAP_FORMAT) return no(`map format ${String(c.format)} is not ${MAP_FORMAT}`);
  const at = Date.parse(c.createdAt);
  if (!Number.isFinite(at)) return no("map has no signing time");
  const now = (expect.now ?? /* @__PURE__ */ new Date()).getTime();
  if (at > now + 6e4) return no("map signing time is in the future");
  if (expect.maxAgeMs !== void 0 && now - at > expect.maxAgeMs)
    return no(
      `map signed ${Math.round((now - at) / 1e3)}s ago, over the ${Math.round(expect.maxAgeMs / 1e3)}s bound`
    );
  return { ok: true, claims: c };
}

// src/step/keys.ts
var PINNED_MAP_KEYS = Object.freeze([]);
var KEY_ORIGIN = "https://jiffy-app-production.up.railway.app";
var KID2 = /^[A-Za-z0-9_.-]{1,64}$/;
var X = /^[A-Za-z0-9_-]{43}$/;
var MAX_KEYS_BYTES = 64 * 1024;
function toMapKeys(keys) {
  const out2 = [];
  for (const k of keys) {
    if (!KID2.test(k.kid) || !X.test(k.x)) continue;
    try {
      out2.push(mapPublicKey(k.kid, { kty: "OKP", crv: "Ed25519", x: k.x }));
    } catch {
    }
  }
  return out2;
}
function parsePublishedKeys(json) {
  const keys = json && typeof json === "object" ? json.keys : void 0;
  if (!Array.isArray(keys)) return [];
  const out2 = [];
  for (const k of keys.slice(0, 32)) {
    if (!k || typeof k !== "object") continue;
    const j = k;
    if (j.kty !== "OKP" || j.crv !== "Ed25519") continue;
    if (j.status !== "active" && j.status !== "verify") continue;
    if (typeof j.kid !== "string" || typeof j.x !== "string" || !KID2.test(j.kid) || !X.test(j.x)) continue;
    out2.push({ kid: j.kid, x: j.x });
  }
  return out2;
}
async function fetchPublishedKeys(origin, timeoutMs = 5e3) {
  try {
    const u = new URL("/v1/keys", origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
    if (u.protocol !== "https:" && !(u.protocol === "http:" && local)) return [];
    const res = await fetch(u, { signal: AbortSignal.timeout(timeoutMs), redirect: "error" });
    if (!res.ok) return [];
    const text = await res.text();
    if (text.length > MAX_KEYS_BYTES) return [];
    return parsePublishedKeys(JSON.parse(text));
  } catch {
    return [];
  }
}

// src/step/native.ts
var RUNNERS = ["vitest", "jest", "node-test", "pytest"];
var EXTS = {
  vitest: /\.[cm]?[jt]sx?$/,
  jest: /\.[cm]?[jt]sx?$/,
  "node-test": /\.[cm]?[jt]sx?$/,
  pytest: /\.py$/
};
var runsFile = (runner, path) => EXTS[runner].test(path);
function shellQuote(s) {
  return /^[\w@%+=:,./-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`;
}
function underRoot(root, path) {
  const r = root.replace(/^\.\/?/, "").replace(/\/+$/, "");
  if (!r) return path;
  return path.startsWith(r + "/") ? path.slice(r.length + 1) : null;
}
function unsafeForRunner(runner, files) {
  const dash = files.find((f) => f.startsWith("-"));
  if (dash) return `${JSON.stringify(dash)} would read as an option`;
  if (runner === "node-test") {
    const glob = files.find((f) => /[*?[\]{}!]/.test(f));
    if (glob) return `node --test reads ${JSON.stringify(glob)} as a glob`;
  }
  return null;
}
function nativeArgs(runner, root, tests) {
  const files = [
    ...new Set(
      [...tests].filter((t) => runsFile(runner, t)).map((t) => underRoot(root, t)).filter((t) => t !== null)
    )
  ].sort();
  if (!files.length) return { files, args: "" };
  const quoted = files.map(shellQuote);
  switch (runner) {
    case "vitest":
      return { files, args: quoted.join(" ") };
    case "jest":
      return { files, args: ["--runTestsByPath", ...quoted].join(" ") };
    case "node-test":
      return { files, args: quoted.join(" ") };
    case "pytest":
      return { files, args: quoted.join(" ") };
  }
}

// src/step/select.ts
var lines2 = (s) => s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
function num(name2, raw2, dflt, min, integer = false) {
  if (!raw2) return dflt;
  const n = Number(raw2);
  if (!Number.isFinite(n) || n < min || integer && !Number.isInteger(n))
    throw new InputError(
      `input ${name2} must be ${integer ? "an integer" : "a number"} >= ${min}, got ${raw2}`
    );
  return n;
}
function defaultPolicyFiles(env) {
  const out2 = [".github/tensile.yml", ".github/tensile.yaml", "jiffy.yml", ".jiffy.yml", ".github/jiffy.yml"];
  const m = /^[^/]+\/[^/]+\/(.+?)@/.exec(env.GITHUB_WORKFLOW_REF ?? "");
  if (m) out2.push(m[1]);
  return out2;
}
function decisionPath(env) {
  return resolve4(
    process.cwd(),
    getInput(env, "decision-file") || join3(env.RUNNER_TEMP || ".tensile", "tensile", "selection-decision.json")
  );
}
function parseStepInputs(env) {
  const mode = getInput(env, "mode") || "shadow";
  if (mode !== "shadow" && mode !== "enforce")
    throw new InputError(
      `input mode must be shadow or enforce for the in-job step, got ${JSON.stringify(mode)}`
    );
  const runner = getInput(env, "runner") || "vitest";
  if (!RUNNERS.includes(runner))
    throw new InputError(`input runner must be one of ${RUNNERS.join(", ")}, got ${JSON.stringify(runner)}`);
  const map = getInput(env, "map");
  let matrix;
  const rawMatrix2 = getInput(env, "matrix-key");
  if (rawMatrix2) {
    try {
      const v = JSON.parse(rawMatrix2);
      if (v !== null && (typeof v !== "object" || Array.isArray(v))) throw new Error("not an object");
      matrix = v;
    } catch (e) {
      throw new InputError(`input matrix-key must be toJSON(matrix): ${e.message}`);
    }
  }
  return {
    mode,
    runner,
    root: getInput(env, "root"),
    map,
    mapSignature: getInput(env, "map-signature") || (map ? `${map}.sig.json` : ""),
    serviceUrl: parseServiceUrl(getInput(env, "service-url")),
    testPaths: lines2(getInput(env, "test-paths")),
    always: lines2(getInput(env, "always")),
    policyFiles: [...defaultPolicyFiles(env), ...lines2(getInput(env, "policy-files"))],
    durations: getInput(env, "durations"),
    history: getInput(env, "history"),
    maxMapCommits: num("max-map-commits", getInput(env, "max-map-commits"), 200, 0, true),
    maxMapAgeDays: num("max-map-age-days", getInput(env, "max-map-age-days"), 14, 0),
    timeoutSeconds: num("timeout-seconds", getInput(env, "timeout-seconds"), 60, 1),
    sampleRate: (() => {
      try {
        return parseRate(getInput(env, "sample-rate") || "5%");
      } catch (e) {
        throw new InputError(`input sample-rate ${e.message}`);
      }
    })(),
    workingDirectory: getInput(env, "working-directory") || env.GITHUB_WORKSPACE || ".",
    decisionFile: decisionPath(env),
    checkRunId: (() => {
      const raw2 = getInput(env, "check-run-id");
      if (!raw2) return null;
      if (!/^\d{1,19}$/.test(raw2))
        throw new InputError(`input check-run-id must be job.check_run_id, got ${raw2}`);
      return Number(raw2);
    })(),
    testStep: getInput(env, "test-step"),
    ...matrix !== void 0 && { matrix }
  };
}
var ARGS_BUDGET = 200 * 1024;
function baseDecision(env, inputs, event) {
  return {
    schema: DECISION_SCHEMA,
    version: 1,
    repository: env.GITHUB_REPOSITORY ?? "",
    repoId: env.GITHUB_REPOSITORY_ID ?? "",
    ownerId: env.GITHUB_REPOSITORY_OWNER_ID ?? "",
    host: (() => {
      try {
        return new URL(env.GITHUB_SERVER_URL || "https://github.com").host.toLowerCase();
      } catch {
        return "";
      }
    })(),
    event: env.GITHUB_EVENT_NAME ?? "",
    ref: env.GITHUB_REF ?? "",
    prNumber: event.pull_request?.number ?? null,
    run: {
      id: env.GITHUB_RUN_ID ?? "",
      attempt: Number(env.GITHUB_RUN_ATTEMPT ?? 1) || 1,
      job: env.GITHUB_JOB ?? "",
      workflowRef: env.GITHUB_WORKFLOW_REF ?? ""
    },
    ...inputs?.matrix !== void 0 && { matrix: inputs.matrix },
    head: env.GITHUB_SHA ?? null,
    base: null,
    from: null,
    requestedMode: inputs?.mode ?? "shadow",
    mode: "shadow",
    modeReason: null,
    runAll: true,
    reasons: [],
    basis: "none",
    map: null,
    ledger: null,
    runner: inputs?.runner ?? "vitest",
    root: inputs?.root ?? "",
    barKey: barKey({
      workflowRef: env.GITHUB_WORKFLOW_REF ?? "",
      job: env.GITHUB_JOB ?? "",
      runner: inputs?.runner ?? "vitest",
      root: inputs?.root ?? "",
      testPaths: inputs?.testPaths ?? [],
      always: inputs?.always ?? []
    }),
    checkRunId: inputs?.checkRunId ?? null,
    testStep: inputs?.testStep || null,
    enforceable: false,
    enforceBlockers: ["selection runs everything"],
    skippedShare: 0,
    skippedShareBasis: "files",
    universe: 0,
    selected: [],
    sampled: [],
    skipped: [],
    timings: {},
    decidedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
}
async function decideStep(env, deps) {
  const start2 = performance.now();
  const now = deps.now ?? Date.now;
  const warnings = [];
  let inputs = null;
  let event = {};
  try {
    event = readEvent(env);
  } catch {
  }
  const full = (reason, d) => {
    const decision2 = d ?? baseDecision(env, inputs, event);
    decision2.reasons = [reason, ...decision2.reasons];
    decision2.runAll = true;
    decision2.mode = "shadow";
    decision2.timings.stepMs = Math.round(performance.now() - start2);
    return { decision: decision2, runAll: true, args: "", files: [], skip: false, warnings };
  };
  if (killSwitch(env)) return full("kill switch is on (run-all input or JIFFY_RUN_ALL)");
  try {
    inputs = parseStepInputs(env);
  } catch (e) {
    if (!(e instanceof InputError)) throw e;
    return full(`invalid input: ${e.message}`);
  }
  let plan;
  try {
    event = readEvent(env);
    plan = planFor(env, event, "");
  } catch (e) {
    return full(`cannot read the event payload: ${e.message}`);
  }
  if (plan.kind === "full") return full(plan.reason);
  let cfg = null;
  let target = null;
  let token = null;
  if (inputs.serviceUrl) {
    const [owner = "", repo = ""] = (env.GITHUB_REPOSITORY ?? "").split("/");
    target = { url: inputs.serviceUrl, owner, repo, timeoutMs: deps.serviceTimeoutMs ?? 5e3 };
    try {
      token = await oidcToken(env, target.timeoutMs);
      cfg = await fetchConfig(target, token);
    } catch (e) {
      warnings.push(`service: ${e.message}; shadow only`);
      cfg = null;
    }
    if (cfg?.runAll) return full(`service kill switch is on${cfg.reason ? `: ${cfg.reason}` : ""}`);
  }
  const decision = baseDecision(env, inputs, event);
  decision.ledger = cfg?.ledger ?? null;
  if (decision.ledger?.stale)
    return full(`the ledger is stale (${decision.ledger.reasons.join("; ") || "behind"})`, decision);
  const source = inputs.map ? { kind: "file", path: inputs.map, signature: inputs.mapSignature } : target && token ? { kind: "service", target, token } : { kind: "none" };
  let w;
  try {
    w = await deps.work(
      {
        repo: inputs.workingDirectory,
        baseCandidates: plan.baseCandidates,
        ...plan.expectHead && { expectHead: plan.expectHead },
        source,
        keys: [...deps.keys ?? PINNED_MAP_KEYS],
        keyOrigin: deps.keyOrigin === void 0 ? KEY_ORIGIN : deps.keyOrigin,
        expect: { host: decision.host, tenantId: decision.ownerId, repoId: decision.repoId },
        now: now(),
        bounds: { maxCommits: inputs.maxMapCommits, maxAgeDays: inputs.maxMapAgeDays },
        durations: inputs.durations,
        history: inputs.history,
        testPaths: inputs.testPaths,
        always: inputs.always,
        policyFiles: inputs.policyFiles,
        sampleRate: inputs.sampleRate
      },
      inputs.timeoutSeconds * 1e3
    );
  } catch (e) {
    return full(`error: ${e.message}`, decision);
  }
  Object.assign(decision, {
    head: w.head,
    base: w.base,
    from: w.from,
    map: w.map,
    runAll: w.runAll,
    reasons: w.reasons,
    basis: w.basis,
    universe: w.universe,
    selected: w.selected,
    sampled: w.sampled,
    skipped: w.skipped,
    skippedShare: w.skippedShare,
    skippedShareBasis: w.skippedShareBasis,
    timings: w.timings
  });
  const bad = [...w.selected.map((s) => s.test), ...w.sampled].find((t) => /^-|[\r\n\0]/.test(t));
  if (bad) {
    decision.runAll = true;
    decision.reasons = [`a test path can't be passed to the runner: ${JSON.stringify(bad)}`];
  }
  const list3 = nativeArgs(inputs.runner, inputs.root, [...w.selected.map((s) => s.test), ...w.sampled]);
  const unsafe = unsafeForRunner(inputs.runner, list3.files);
  const blockers = [];
  if (decision.runAll) blockers.push("selection runs everything");
  if (!decision.map?.verified)
    blockers.push(`the map is not verified${decision.map?.problem ? ` (${decision.map.problem})` : ""}`);
  if (!decision.ledger) blockers.push("no ledger freshness from the service");
  else if (decision.ledger.stale) blockers.push("the ledger is stale");
  else if (!decision.ledger.complete) blockers.push("the ledger has blocking gaps");
  if (!decision.runAll && unsafe) blockers.push(`a test path can't be passed to the runner: ${unsafe}`);
  if (!decision.runAll && Buffer.byteLength(list3.args) > ARGS_BUDGET)
    blockers.push(
      `the test list needs ${Math.round(Buffer.byteLength(list3.args) / 1024)} KB, over the output budget`
    );
  if (!decision.runAll && !decision.skipped.length) blockers.push("nothing is skipped");
  decision.enforceable = blockers.length === 0;
  decision.enforceBlockers = blockers;
  const why = [];
  if (inputs.mode !== "enforce") why.push("shadow mode");
  else {
    if (!cfg?.selectionEnforce?.includes(decision.barKey))
      why.push(
        cfg ? `the service hasn't enabled enforcement for ${decision.barKey} (its shadow bar isn't met)` : "no service config"
      );
    why.push(...blockers.filter((b) => b !== "nothing is skipped" && b !== "selection runs everything"));
  }
  decision.mode = why.length ? "shadow" : "enforce";
  decision.modeReason = inputs.mode === "enforce" && why.length ? why.join("; ") : null;
  decision.timings.stepMs = Math.round(performance.now() - start2);
  if (decision.mode !== "enforce" || decision.runAll)
    return { decision, runAll: true, args: "", files: [], skip: false, warnings };
  return {
    decision,
    runAll: false,
    args: list3.args,
    files: list3.files,
    skip: list3.files.length === 0,
    warnings
  };
}
function writeStepOutputs(sink, r, decisionFile) {
  sink.outputs([
    ["mode", r.decision.mode],
    ["reason", r.runAll ? r.decision.modeReason ?? r.decision.reasons[0] ?? "" : ""],
    ["args", r.args],
    ["files", r.files.join("\n")],
    ["count", String(r.files.length)],
    ["skip", String(r.skip)],
    ["decision-file", decisionFile],
    ["run-all", String(r.runAll)]
  ]);
}
async function runSelectPhase(env, sink, deps) {
  let r;
  try {
    r = await decideStep(env, deps);
  } catch (e) {
    const decision = baseDecision(env, null, {});
    decision.reasons = [`internal error: ${e.message}`];
    r = { decision, runAll: true, args: "", files: [], skip: false, warnings: [] };
  }
  let file = "";
  try {
    file = decisionPath(env);
    mkdirSync4(dirname4(file), { recursive: true });
    writeFileSync4(file, JSON.stringify(r.decision) + "\n");
    sink.state?.("decision", file);
  } catch (e) {
    r.warnings.push(`could not write the decision file: ${e.message}`);
    file = "";
  }
  writeStepOutputs(sink, r, file);
  const d = r.decision;
  if (r.runAll)
    sink.log(
      `Tensile (${d.mode}): running everything${d.runAll ? `: ${d.reasons[0] ?? ""}` : `; would run ${d.selected.length + d.sampled.length} of ${d.universe} test files`}`
    );
  else sink.log(`Tensile (enforce): ${r.files.length} test files (${d.sampled.length} sampled)`);
  for (const w of r.warnings) sink.warning(w);
  try {
    sink.summary(renderDecision(d));
  } catch (e) {
    sink.warning(`could not write the job summary: ${e.message}`);
  }
  return r;
}

// src/upload.ts
import { createHash as createHash7 } from "node:crypto";
import { lstatSync, readdirSync, readFileSync as readFileSync6 } from "node:fs";
import { basename, join as join4 } from "node:path";
var MAX_ARTIFACTS = 200;
var TIMEOUT_MS = 3e4;
var RETRIES = [1e3, 4e3];
function findEvidenceFiles(dir) {
  const files = [];
  const skipped = [];
  let names2;
  try {
    names2 = readdirSync(dir).sort();
  } catch {
    return { files, skipped };
  }
  if (names2.length === 1 && names2[0].startsWith(EVIDENCE_PREFIX) && names2[0].endsWith(".json")) {
    const f = join4(dir, names2[0]);
    try {
      const fst = lstatSync(f);
      if (fst.isFile()) {
        if (fst.size > EVIDENCE_MAX_BYTES) skipped.push(`${names2[0]}: over ${EVIDENCE_MAX_BYTES >> 20} MB`);
        else files.push(f);
        return { files, skipped };
      }
    } catch {
    }
  }
  for (const name2 of names2) {
    if (!name2.startsWith(EVIDENCE_PREFIX)) continue;
    const art = join4(dir, name2);
    let st;
    try {
      st = lstatSync(art);
    } catch {
      continue;
    }
    if (!st.isDirectory()) {
      skipped.push(`${name2}: not an artifact directory (download without merge-multiple)`);
      continue;
    }
    if (files.length >= MAX_ARTIFACTS) {
      skipped.push(`${name2}: more than ${MAX_ARTIFACTS} artifacts`);
      continue;
    }
    let inside;
    try {
      inside = readdirSync(art);
    } catch {
      skipped.push(`${name2}: can't be read`);
      continue;
    }
    const want = `${name2}.json`;
    if (inside.length !== 1 || inside[0] !== want) {
      skipped.push(
        `${name2}: must hold exactly ${want}, holds ${inside.length} entr${inside.length === 1 ? "y" : "ies"}`
      );
      continue;
    }
    const f = join4(art, want);
    let fst;
    try {
      fst = lstatSync(f);
    } catch {
      skipped.push(`${name2}: can't be read`);
      continue;
    }
    if (!fst.isFile()) skipped.push(`${name2}: not a regular file`);
    else if (fst.size > EVIDENCE_MAX_BYTES) skipped.push(`${name2}: over ${EVIDENCE_MAX_BYTES >> 20} MB`);
    else files.push(f);
  }
  return { files, skipped };
}
function expectedHashes(v) {
  if (!v.trim()) return null;
  return new Set(v.split(/[\s,]+/).filter((h) => /^[0-9a-f]{64}$/.test(h)));
}
function parseUpload(text) {
  let v;
  try {
    v = JSON.parse(text);
  } catch (e) {
    return `not JSON (${e.message.slice(0, 100)})`;
  }
  const o = v;
  if (!o || typeof o !== "object") return "not an object";
  const ev = o.evidence;
  if (!ev || typeof ev !== "object" || ev.schema !== 1) return "no schema 1 evidence";
  if (typeof ev.repo !== "string" || typeof ev.head !== "string") return "evidence without repo or head";
  if (typeof o.job !== "string" || !o.job) return "no job";
  if (typeof o.matrixKey !== "string") return "no matrixKey";
  if (!Number.isInteger(o.runId) || o.runId < 0) return "no runId";
  if (!Number.isInteger(o.attempt) || o.attempt < 1) return "no attempt";
  return {
    evidence: ev,
    job: fitLine(o.job, JOB_MAX),
    matrixKey: o.matrixKey,
    runId: o.runId,
    attempt: o.attempt
  };
}
function isPlaceholder(u) {
  const f = u.evidence.findings;
  return Array.isArray(f) && f.length === 1 && f[0]?.type === "tool_problem" && f[0].subject === PLACEHOLDER_SUBJECT;
}
var sleep = (ms2) => new Promise((r) => setTimeout(r, ms2));
async function post(url, token, body2, retries) {
  for (let i2 = 0; ; i2++) {
    try {
      const res = await call(
        `POST ${EVIDENCE_PATH}`,
        url,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: body2
        },
        TIMEOUT_MS
      );
      const ack = await res.json().catch(() => null);
      return typeof ack?.id === "string" ? `accepted (${ack.id.slice(0, 64)})` : `HTTP ${res.status}`;
    } catch (e) {
      const status = e instanceof ServiceError ? e.status : void 0;
      const retryable = status === void 0 || status >= 500 || status === 429;
      if (!retryable || i2 >= retries.length) throw e;
      await sleep(retries[i2]);
    }
  }
}
async function runUpload(env, opts = {}) {
  const done = (ok, reason, results2 = []) => ({
    ok,
    reason,
    results: results2
  });
  let event;
  try {
    event = readEvent(env);
  } catch (e) {
    return done(false, `cannot read the event payload: ${e.message}`);
  }
  if (env.GITHUB_EVENT_NAME !== "pull_request" || !event.pull_request)
    return done(true, "not a pull_request run; nothing to upload");
  if (isForkPr(event))
    return done(true, "pull request from a fork: no OIDC token, so Jiffy shows the evidence as unavailable");
  if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
    return done(
      true,
      "no OIDC token for this run (Dependabot pull requests and forks get none, or the job lacks `id-token: write`), so Jiffy shows the evidence as unavailable"
    );
  let url;
  try {
    url = parseServiceUrl(getInput(env, "service-url"));
  } catch (e) {
    return done(false, e.message);
  }
  if (!url) return done(false, "input service-url is required to upload evidence");
  const dir = getInput(env, "evidence-dir") || "jiffy-evidence";
  const { files, skipped } = findEvidenceFiles(dir);
  const results = skipped.map((s) => ({ file: s.split(":")[0], ok: false, detail: s }));
  if (!files.length && !skipped.length)
    return done(true, `no evidence files in ${dir} (the evidence step skipped or did not run)`);
  let token = null;
  try {
    token = await oidcToken(env, TIMEOUT_MS);
  } catch (e) {
    return done(false, e.message, results);
  }
  const target = url.replace(/\/+$/, "") + EVIDENCE_PATH;
  const expected = expectedHashes(getInput(env, "evidence-sha256"));
  const uploads = [];
  for (const f of files) {
    const name2 = basename(f);
    let text;
    try {
      text = readFileSync6(f, "utf8");
    } catch (e) {
      results.push({
        file: name2,
        ok: false,
        detail: `can't be read (${e.message.slice(0, 100)})`
      });
      continue;
    }
    if (expected) {
      const sha = createHash7("sha256").update(text).digest("hex");
      if (!expected.has(sha)) {
        results.push({
          file: name2,
          ok: false,
          detail: `its sha256 (${sha.slice(0, 12)}) doesn't match what the evidence step wrote (${expected.size ? [...expected].map((h) => h.slice(0, 12)).join(", ") : "nothing it vouched for"}); not uploaded, so Jiffy shows this evidence as unavailable`
        });
        continue;
      }
    }
    const upload = parseUpload(text);
    if (typeof upload === "string") results.push({ file: name2, ok: false, detail: upload });
    else uploads.push({ name: name2, upload });
  }
  const leg = (u) => JSON.stringify([u.job, u.matrixKey, u.runId]);
  const latest = /* @__PURE__ */ new Map();
  const latestReal = /* @__PURE__ */ new Map();
  for (const { upload: u } of uploads) {
    latest.set(leg(u), Math.max(latest.get(leg(u)) ?? 0, u.attempt));
    if (!isPlaceholder(u)) latestReal.set(leg(u), Math.max(latestReal.get(leg(u)) ?? 0, u.attempt));
  }
  for (const { name: name2, upload } of uploads) {
    const k = leg(upload);
    const superseded = upload.attempt < (latestReal.get(k) ?? 0) ? `skipped: attempt ${latestReal.get(k)} has a result` : isPlaceholder(upload) && upload.attempt < latest.get(k) ? `skipped: attempt ${upload.attempt} didn't finish and a later attempt ran` : null;
    if (superseded) {
      results.push({ file: name2, ok: true, detail: superseded });
      continue;
    }
    const matched = expected ? "sha256 matches the evidence step; " : "";
    try {
      const detail = await post(target, token, JSON.stringify(upload), opts.retries ?? RETRIES);
      results.push({ file: name2, ok: true, detail: `${matched}${detail}` });
    } catch (e) {
      results.push({ file: name2, ok: false, detail: `${matched}${e.message}` });
    }
  }
  const failed = results.filter((r) => !r.ok).length;
  return done(
    !failed,
    failed ? `${failed} of ${results.length} evidence file(s) not uploaded; Jiffy shows that evidence as unavailable` : `${results.length} file(s) uploaded`,
    results
  );
}
var cell = (s) => s.replace(/[|\r\n]/g, " ");
function uploadSummary(o) {
  const lines3 = ["## Jiffy evidence upload", "", `${o.reason}.`, ""];
  if (o.results.length) {
    lines3.push("| File | Result |", "| --- | --- |");
    for (const r of o.results) lines3.push(`| ${cell(r.file)} | ${r.ok ? "\u2713" : "\u2717"} ${cell(r.detail)} |`);
    lines3.push("");
  }
  return lines3.join("\n");
}
async function mainUpload(env, sink) {
  let o;
  try {
    o = await runUpload(env);
  } catch (e) {
    o = { ok: false, reason: `internal error: ${e.message}`, results: [] };
  }
  sink.log(`Jiffy evidence upload: ${o.reason}`);
  for (const r of o.results) sink.log(`  ${r.ok ? "ok" : "FAILED"} ${r.file}: ${r.detail}`);
  if (!o.ok) sink.warning(`evidence upload: ${o.reason}`);
  try {
    sink.summary(uploadSummary(o));
  } catch {
  }
  return 0;
}

// src/worker.ts
import { isMainThread, parentPort, Worker, workerData } from "node:worker_threads";

// src/decide.ts
import { existsSync as existsSync2, readFileSync as readFileSync7 } from "node:fs";
import { isAbsolute as isAbsolute4, resolve as resolve5 } from "node:path";
var isUrl = (s) => /^https?:\/\//i.test(s);
async function readSource(src, cwd) {
  if (isUrl(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const p = isAbsolute4(src) ? src : resolve5(cwd, src);
  if (!existsSync2(p)) throw new Error("file not found");
  return readFileSync7(p);
}
async function loadMap(from, { cwd, now, maxAgeDays }) {
  if (!from) return { map: null, info: null, problem: "no coverage map configured" };
  const src = typeof from === "string" ? from : from.label;
  let raw2;
  let map;
  try {
    raw2 = typeof from === "string" ? await readSource(from, cwd) : await from.read();
  } catch (e) {
    return { map: null, info: null, problem: `cannot read coverage map ${src}: ${e.message}` };
  }
  try {
    map = decodeMap(raw2);
  } catch (e) {
    return { map: null, info: null, problem: `cannot decode coverage map ${src}: ${e.message}` };
  }
  const { commit, createdAt } = map.meta;
  const info2 = {
    source: src,
    bytes: raw2.length,
    tests: map.tests.size,
    ...typeof commit === "string" && { commit },
    ...typeof createdAt === "string" && { createdAt }
  };
  if (!map.tests.size) return { map: null, info: info2, problem: "coverage map has no tests" };
  if (maxAgeDays > 0) {
    const at = typeof createdAt === "string" ? Date.parse(createdAt) : NaN;
    if (Number.isNaN(at))
      return { map: null, info: info2, problem: "coverage map has no createdAt, so its age is unknown" };
    const days = (now - at) / 864e5;
    if (days > maxAgeDays)
      return {
        map: null,
        info: info2,
        problem: `coverage map is stale: recorded ${days.toFixed(1)} days ago (max-map-age-days ${maxAgeDays})`
      };
  }
  return { map, info: info2, problem: null };
}
var slashes2 = (p) => p.replace(/\\/g, "/");
function parseDurations(text, repo) {
  const json = JSON.parse(text);
  if (json && typeof json === "object" && Array.isArray(json.testResults)) {
    const report = json;
    const root = slashes2(repo).replace(/\/?$/, "/");
    return durationsFromReport(
      { testResults: report.testResults.map((t) => ({ ...t, name: slashes2(t.name) })) },
      root
    );
  }
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const out2 = /* @__PURE__ */ new Map();
    for (const [k, v] of Object.entries(json)) {
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0)
        throw new Error(`durations: ${k} is not a number of seconds`);
      out2.set(slashes2(k), v);
    }
    return out2;
  }
  throw new Error("durations must be a Vitest/Jest JSON report or a {file: seconds} object");
}
function resolveBase(repo, candidates) {
  const tried = [];
  for (const c of candidates) {
    try {
      git(repo, ["rev-parse", "--verify", "--quiet", `${c}^{commit}`]);
    } catch {
      tried.push(c);
      continue;
    }
    return { base: mergeBase(repo, c, "HEAD"), from: c };
  }
  throw new Error(
    `cannot resolve a base (tried ${tried.join(", ")}); check out with fetch-depth: 0 so the base is present`
  );
}
function missingAt(repo, rev, paths) {
  const ok = paths.filter((p) => !p.includes("\n"));
  if (!ok.length) return [];
  const lines3 = git(
    repo,
    ["cat-file", "--batch-check"],
    ok.map((p) => `${rev}:${p}`).join("\n") + "\n"
  ).split("\n");
  return ok.filter((_, i2) => !/^[0-9a-f]+ blob \d+$/.test(lines3[i2] ?? ""));
}
function checkHead(repo, head, expect) {
  const want = expect.toLowerCase();
  if (head === want) return;
  const parents = git(repo, ["rev-list", "--parents", "-n", "1", head]).trim().split(" ").slice(1);
  if (parents.length > 1 && parents.includes(want)) return;
  throw new Error(
    `HEAD ${head.slice(0, 10)} is not the pull request's head ${want.slice(0, 10)} or a merge of it (pull_request_target checks out the base unless told otherwise)`
  );
}
function testsAddedSince(repo, since, head) {
  const out2 = git(repo, ["diff", "--name-only", "-z", "--no-renames", "--diff-filter=A", since, head]);
  return out2.split("\0").filter((p) => p && classify(p) === "test");
}
var resolves = (repo, rev) => {
  try {
    git(repo, ["rev-parse", "--verify", "--quiet", `${rev}^{commit}`]);
    return true;
  } catch {
    return false;
  }
};
async function decide(input) {
  const { repo, service } = input;
  const t0 = performance.now();
  const head = git(repo, ["rev-parse", "HEAD"]).trim();
  if (input.expectHead) checkHead(repo, head, input.expectHead);
  const { base: base3, from } = resolveBase(repo, input.baseCandidates);
  if (base3 === head)
    throw new Error(`HEAD is the base (${head.slice(0, 10)}): there is no change to compare`);
  const t1 = performance.now();
  const source = !input.map && service ? {
    label: `${service.target.url} (map before ${base3.slice(0, 10)})`,
    read: () => fetchMap(service.target, service.token, base3)
  } : input.map;
  const loaded = await loadMap(source, {
    cwd: process.cwd(),
    now: input.now,
    maxAgeDays: input.maxMapAgeDays
  });
  const { info: info2 } = loaded;
  let { map, problem } = loaded;
  let durations = null;
  if (input.durations) {
    const p = isAbsolute4(input.durations) ? input.durations : resolve5(process.cwd(), input.durations);
    durations = parseDurations(readFileSync7(p, "utf8"), repo);
  }
  let added = [];
  if (map) {
    const commit = map.meta.commit;
    if (typeof commit !== "string" || !commit) {
      problem = "coverage map has no commit, so tests added since it was recorded are unknown";
    } else if (!resolves(repo, commit)) {
      problem = `coverage map commit ${commit.slice(0, 10)} is not in this checkout (check out with fetch-depth: 0)`;
    } else added = testsAddedSince(repo, commit, head);
    if (problem) map = null;
  }
  const t2 = performance.now();
  const alwaysRun = map ? mapAlwaysRun(map) ?? [] : [];
  const knownTests = /* @__PURE__ */ new Set([
    ...map?.tests.keys() ?? [],
    ...alwaysRun,
    ...durations?.keys() ?? [],
    ...added
  ]);
  const changes = changesFromGit(repo, base3, head, { knownTests });
  const t3 = performance.now();
  const allTests = knownTests;
  const prefixes = input.always ?? [];
  const always = prefixes.length ? (t) => prefixes.some((p) => t.startsWith(p)) : void 0;
  const selection = select({ changes, map, allTests, always });
  const t4 = performance.now();
  const quarantined = new Set(input.quarantined ?? []);
  const missing = new Set(
    missingAt(repo, head, [.../* @__PURE__ */ new Set([...selection.tests.keys(), ...selection.skipped, ...quarantined])])
  );
  const gone = [...selection.tests.keys()].filter((t) => missing.has(t));
  const present = selection.skipped.filter((t) => !missing.has(t) && !quarantined.has(t));
  const sampled = selection.runAll ? [] : sampleOrder(present, head).slice(0, sampleSize(input.sampleRate, present.length)).sort();
  const known = /* @__PURE__ */ new Set([...selection.tests.keys(), ...selection.skipped]);
  const edited = input.quarantineFile && changes.files.some((f) => f.path === input.quarantineFile) ? input.quarantineFile : null;
  const quarantinePresent = edited ? [] : [...quarantined].filter((t) => known.has(t) && !missing.has(t) && !changes.changedTests.has(t)).sort();
  const quarantineIgnored = edited ? `the change edits the quarantine list ${edited}` : null;
  const t5 = performance.now();
  const ms2 = (a, b) => Math.round((b - a) * 10) / 10;
  return {
    base: base3,
    baseFrom: from,
    head,
    map: info2,
    mapProblem: problem,
    durations,
    changes,
    selection,
    gone,
    sampled,
    quarantinePresent,
    quarantineIgnored,
    timings: { mapMs: ms2(t1, t2), diffMs: ms2(t0, t1) + ms2(t2, t3) + ms2(t4, t5), selectMs: ms2(t3, t4) }
  };
}

// src/step/work.ts
import { existsSync as existsSync3, readFileSync as readFileSync8, statSync as statSync2 } from "node:fs";
import { isAbsolute as isAbsolute5, resolve as resolve6 } from "node:path";
function skippedShareOf(universe, skipped, durations) {
  if (!universe.length) return { share: 0, basis: "files" };
  if (durations && universe.every((t) => durations.has(t))) {
    const total = universe.reduce((s, t) => s + durations.get(t), 0);
    if (total > 0) {
      const sk = skipped.reduce((s, t) => s + (durations.get(t) ?? 0), 0);
      return { share: Math.min(1, Math.max(0, sk / total)), basis: "durations" };
    }
  }
  return { share: Math.min(1, skipped.length / universe.length), basis: "files" };
}
var isUrl2 = (s) => /^https:\/\//i.test(s);
var MAX_MAP_BYTES2 = 64 * 1024 * 1024;
async function readSource2(src, cwd) {
  if (isUrl2(src)) {
    const res = await fetch(src, { signal: AbortSignal.timeout(15e3) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const len = Number(res.headers.get("content-length") ?? 0);
    if (len > MAX_MAP_BYTES2) throw new Error(`${len} bytes, over ${MAX_MAP_BYTES2}`);
    const b = Buffer.from(await res.arrayBuffer());
    if (b.length > MAX_MAP_BYTES2) throw new Error(`${b.length} bytes, over ${MAX_MAP_BYTES2}`);
    return b;
  }
  const p = isAbsolute5(src) ? src : resolve6(cwd, src);
  if (!existsSync3(p)) return null;
  const size = statSync2(p).size;
  if (size > MAX_MAP_BYTES2) throw new Error(`${size} bytes, over ${MAX_MAP_BYTES2}`);
  return readFileSync8(p);
}
function prefixMatcher(prefixes) {
  if (!prefixes.length) return void 0;
  const rx = prefixes.map(
    (g) => new RegExp(
      `^${g.replace(/[.+^${}()|[\]\\?]/g, "\\$&").replace(/\*\*/g, "\0").replace(/\*/g, "[^/]*").replace(/\0/g, ".*")}`
    )
  );
  return (p) => rx.some((r) => r.test(p));
}
var MAX_SIGNATURE_BYTES = 16 * 1024;
function parseSignedMap(text) {
  if (!text.trim() || text.length > MAX_SIGNATURE_BYTES) return null;
  try {
    const v = JSON.parse(text);
    if (!v || typeof v.claims !== "string" || typeof v.signature !== "string") return null;
    return { claims: v.claims, signature: v.signature };
  } catch {
    return null;
  }
}
async function verifyMapBytes(bytes, signed, metaCommit, input) {
  const repoId = /^\d{1,19}$/.test(input.expect.repoId) ? Number(input.expect.repoId) : NaN;
  const tenant = /^\d{1,19}$/.test(input.expect.tenantId) ? Number(input.expect.tenantId) : NaN;
  if (!Number.isSafeInteger(repoId) || !Number.isSafeInteger(tenant) || !input.expect.host)
    return { ok: false, reason: "the job's repo id, owner id or host is unknown" };
  if (typeof metaCommit !== "string") return { ok: false, reason: "the map has no commit" };
  const maxAgeDays = input.bounds.maxAgeDays ?? 14;
  const expect = {
    host: input.expect.host,
    repoId,
    tenant,
    sha: metaCommit,
    mapSha256: mapSha256(bytes),
    ...maxAgeDays > 0 && { maxAgeMs: maxAgeDays * 864e5 },
    now: new Date(input.now)
  };
  const v = verifyMap(toMapKeys(input.keys), signed, expect);
  if (v.ok || !v.reason.startsWith("unknown signing key") || !input.keyOrigin) return v;
  const published = await fetchPublishedKeys(input.keyOrigin);
  return verifyMap(toMapKeys([...input.keys, ...published]), signed, expect);
}
function parseHistory(text) {
  const v = JSON.parse(text);
  if (!Array.isArray(v)) throw new Error("history must be a JSON array of {file, failedAt}");
  return v.filter(
    (x) => !!x && typeof x === "object" && typeof x.file === "string" && typeof x.failedAt === "string"
  );
}
async function loadMap2(input, base3, cwd) {
  const src = input.source;
  if (src.kind === "none") return { map: null, use: null, fatal: null };
  let bytes;
  let signed = null;
  let offered = false;
  let label;
  if (src.kind === "service") {
    label = `${src.target.url} (map before ${base3.slice(0, 10)})`;
    try {
      const r = await fetchSignedMap(src.target, src.token, base3);
      bytes = r.bytes;
      signed = r.signed;
      offered = r.offered;
    } catch (e) {
      if (e instanceof ServiceError && e.status === 404) bytes = null;
      else throw e;
    }
  } else {
    label = src.path;
    bytes = await readSource2(src.path, cwd);
    if (bytes) {
      const s = await readSource2(src.signature, cwd).catch(() => null);
      offered = !!s && s.length > 0;
      signed = s ? parseSignedMap(s.toString("utf8")) : null;
    }
  }
  if (!bytes) return { map: null, use: null, fatal: null };
  const use = {
    source: label,
    commit: null,
    verified: false,
    keyId: null,
    problem: null,
    createdAt: null,
    distance: null,
    ageDays: null
  };
  let map;
  try {
    map = decodeMap(bytes);
  } catch (e) {
    return {
      map: null,
      use: { ...use, problem: `cannot decode: ${e.message}` },
      fatal: "the coverage map cannot be decoded"
    };
  }
  use.commit = typeof map.meta.commit === "string" ? map.meta.commit : null;
  use.createdAt = typeof map.meta.createdAt === "string" ? map.meta.createdAt : null;
  if (!map.tests.size)
    return { map: null, use: { ...use, problem: "no tests" }, fatal: "the coverage map has no tests" };
  if (!offered) return { map, use: { ...use, problem: "the map has no signature" }, fatal: null };
  const v = signed ? await verifyMapBytes(bytes, signed, map.meta.commit, input) : { ok: false, reason: "the signature is malformed" };
  if (v.ok) {
    use.verified = true;
    use.keyId = v.claims.kid;
    use.createdAt = v.claims.createdAt;
    return { map, use, fatal: null };
  }
  use.problem = v.reason;
  return { map: null, use, fatal: `coverage map signature: ${v.reason}` };
}
async function work(input) {
  const { repo } = input;
  const t0 = performance.now();
  const head = git(repo, ["rev-parse", "HEAD"]).trim();
  if (input.expectHead) checkHead(repo, head, input.expectHead);
  const { base: base3 } = resolveBase(repo, input.baseCandidates);
  if (base3 === head)
    throw new Error(`HEAD is the base (${head.slice(0, 10)}): there is no change to compare`);
  const cwd = process.cwd();
  const loaded = await loadMap2(input, base3, cwd);
  const t1 = performance.now();
  const durations = input.durations ? parseDurations(
    readFileSync8(isAbsolute5(input.durations) ? input.durations : resolve6(cwd, input.durations), "utf8"),
    repo
  ) : null;
  let history = [];
  const notes = [];
  if (input.history)
    try {
      history = parseHistory(
        readFileSync8(isAbsolute5(input.history) ? input.history : resolve6(cwd, input.history), "utf8")
      );
    } catch (e) {
      notes.push(`history unreadable (${e.message}); no history additions`);
    }
  const result = (r) => ({
    head,
    base: base3,
    from: base3,
    map: loaded.use,
    runAll: true,
    reasons: [],
    basis: "none",
    universe: 0,
    selected: [],
    sampled: [],
    skipped: [],
    skippedShare: 0,
    skippedShareBasis: "files",
    timings: {},
    ...r
  });
  if (loaded.fatal) return result({ reasons: [loaded.fatal], timings: { mapMs: Math.round(t1 - t0) } });
  const inScope = prefixMatcher(input.testPaths);
  const alwaysMatch = prefixMatcher(input.always);
  const plan = planSelection({
    repo,
    head,
    base: base3,
    map: loaded.map,
    mapCreatedAt: loaded.use?.createdAt ?? null,
    now: input.now,
    bounds: input.bounds,
    ...durations && { allTests: durations.keys() },
    ...inScope && { inScope },
    ...alwaysMatch && { always: alwaysMatch },
    policyFiles: input.policyFiles,
    history
  });
  const map = loaded.use ? { ...loaded.use, distance: plan.map?.distance ?? null, ageDays: plan.map?.ageDays ?? null } : null;
  if (map && !plan.map && plan.runAll) map.problem ??= plan.reasons[0] ?? null;
  const timings = { totalMs: 0, ...plan.timings, mapLoadMs: Math.round((t1 - t0) * 10) / 10 };
  if (plan.runAll)
    return result({
      from: plan.from,
      map,
      reasons: [...plan.reasons, ...notes],
      basis: plan.basis,
      universe: plan.universe.length,
      timings
    });
  const missing = new Set(missingAt(repo, head, [...plan.tests.keys(), ...plan.skipped]));
  const selected = [...plan.tests].filter(([t]) => !missing.has(t)).map(([test, reasons]) => ({ test, reasons })).sort((a, b) => a.test < b.test ? -1 : a.test > b.test ? 1 : 0);
  const present = plan.skipped.filter((t) => !missing.has(t));
  const sampled = sampleOrder(present, head).slice(0, sampleSize(input.sampleRate, present.length)).sort();
  const sampledSet = new Set(sampled);
  const skipped = present.filter((t) => !sampledSet.has(t));
  const share = skippedShareOf(plan.universe, skipped, durations);
  timings.totalMs = Math.round((performance.now() - t0) * 10) / 10;
  return result({
    from: plan.from,
    map,
    runAll: false,
    reasons: notes,
    basis: plan.basis,
    universe: plan.universe.length,
    selected,
    sampled,
    skipped,
    skippedShare: share.share,
    skippedShareBasis: share.basis,
    timings
  });
}

// src/worker.ts
function decideInWorker(input, timeoutMs) {
  return inWorker({ jiffyDecide: input }, timeoutMs);
}
function stepInWorker(input, timeoutMs) {
  return inWorker({ jiffyStep: input }, timeoutMs);
}
function inWorker(data2, timeoutMs) {
  return new Promise((resolve7, reject) => {
    const w = new Worker(new URL(import.meta.url), { workerData: data2 });
    const timer = setTimeout(() => {
      reject(new Error(`timed out after ${timeoutMs / 1e3} s`));
      void w.terminate();
    }, timeoutMs);
    const done = () => clearTimeout(timer);
    w.once("message", (m) => {
      done();
      if (m.ok) resolve7(m.decision);
      else reject(new Error(m.error));
    });
    w.once("error", (e) => {
      done();
      reject(e);
    });
    w.once("exit", (code3) => {
      done();
      reject(new Error(`decision worker exited with code ${code3}`));
    });
  });
}
var data = isMainThread ? null : workerData;
if (data?.jiffyDecide || data?.jiffyStep) {
  let reply;
  try {
    reply = {
      ok: true,
      decision: data.jiffyDecide ? await decide(data.jiffyDecide) : await work(data.jiffyStep)
    };
  } catch (e) {
    reply = { ok: false, error: e.message };
  }
  parentPort.postMessage(reply);
}

// src/index.ts
var EVIDENCE_MODULE = import.meta.url.endsWith(".ts") ? "./evidence.ts" : "./evidence.js";
async function legacy(env, sink, evidence) {
  if (evidence === "upload") process.exitCode = await mainUpload(env, sink);
  else if (evidence === "start") process.exitCode = mainStart(env, sink);
  else if (evidence === "true") {
    const mod = await import(EVIDENCE_MODULE);
    await mod.main(env, sink);
  } else if (evidence && evidence !== "false") {
    sink.warning(
      `input evidence must be start, true, false or upload, got ${JSON.stringify(evidence)}; doing nothing`
    );
    process.exitCode = 1;
  } else await runGate(env, sink, { decide: decideInWorker });
}
if (isMainThread2) {
  const env = process.env;
  const sink = actionsSink(env);
  const evidence = getInput(env, "evidence").toLowerCase();
  const phase = getInput(env, "phase").toLowerCase();
  try {
    if (env.STATE_isPost === "true") await sendRecord(env, sink, runPost(env, sink));
    else {
      sink.state?.("isPost", "true");
      if (phase === "select") await runSelectPhase(env, sink, { work: stepInWorker });
      else if (phase === "outcome")
        await sendRecord(env, sink, runOutcomePhase(env, sink, decisionPath(env)));
      else if (phase) {
        sink.warning(`input phase must be select or outcome, got ${JSON.stringify(phase)}; doing nothing`);
        process.exitCode = 1;
      } else await legacy(env, sink, evidence);
    }
  } catch (e) {
    process.stdout.write(`::error title=Jiffy::${escapeCommand(e.message)}
`);
    process.exitCode = 1;
  }
  process.exit();
}
