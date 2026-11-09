import { createRequire as __jiffyRequire } from 'node:module';
import { fileURLToPath as __jiffyPath } from 'node:url';
const require = __jiffyRequire(import.meta.url);
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/identity.js
var require_identity = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/identity.js"(exports) {
    "use strict";
    var ALIAS = /* @__PURE__ */ Symbol.for("yaml.alias");
    var DOC = /* @__PURE__ */ Symbol.for("yaml.document");
    var MAP = /* @__PURE__ */ Symbol.for("yaml.map");
    var PAIR = /* @__PURE__ */ Symbol.for("yaml.pair");
    var SCALAR = /* @__PURE__ */ Symbol.for("yaml.scalar");
    var SEQ = /* @__PURE__ */ Symbol.for("yaml.seq");
    var NODE_TYPE = /* @__PURE__ */ Symbol.for("yaml.node.type");
    var isAlias = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === ALIAS;
    var isDocument = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === DOC;
    var isMap = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === MAP;
    var isPair = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === PAIR;
    var isScalar = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SCALAR;
    var isSeq = (node) => !!node && typeof node === "object" && node[NODE_TYPE] === SEQ;
    function isCollection(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case MAP:
          case SEQ:
            return true;
        }
      return false;
    }
    function isNode2(node) {
      if (node && typeof node === "object")
        switch (node[NODE_TYPE]) {
          case ALIAS:
          case MAP:
          case SCALAR:
          case SEQ:
            return true;
        }
      return false;
    }
    var hasAnchor = (node) => (isScalar(node) || isCollection(node)) && !!node.anchor;
    exports.ALIAS = ALIAS;
    exports.DOC = DOC;
    exports.MAP = MAP;
    exports.NODE_TYPE = NODE_TYPE;
    exports.PAIR = PAIR;
    exports.SCALAR = SCALAR;
    exports.SEQ = SEQ;
    exports.hasAnchor = hasAnchor;
    exports.isAlias = isAlias;
    exports.isCollection = isCollection;
    exports.isDocument = isDocument;
    exports.isMap = isMap;
    exports.isNode = isNode2;
    exports.isPair = isPair;
    exports.isScalar = isScalar;
    exports.isSeq = isSeq;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/visit.js
var require_visit = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/visit.js"(exports) {
    "use strict";
    var identity = require_identity();
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP2 = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove node");
    function visit(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = visit_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        visit_(null, node, visitor_, Object.freeze([]));
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP2;
    visit.REMOVE = REMOVE;
    function visit_(key, node, visitor, path) {
      const ctrl = callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visit_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i2 = 0; i2 < node.items.length; ++i2) {
            const ci = visit_(i2, node.items[i2], visitor, path);
            if (typeof ci === "number")
              i2 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i2, 1);
              i2 -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = visit_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = visit_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    async function visitAsync(node, visitor) {
      const visitor_ = initVisitor(visitor);
      if (identity.isDocument(node)) {
        const cd = await visitAsync_(null, node.contents, visitor_, Object.freeze([node]));
        if (cd === REMOVE)
          node.contents = null;
      } else
        await visitAsync_(null, node, visitor_, Object.freeze([]));
    }
    visitAsync.BREAK = BREAK;
    visitAsync.SKIP = SKIP2;
    visitAsync.REMOVE = REMOVE;
    async function visitAsync_(key, node, visitor, path) {
      const ctrl = await callVisitor(key, node, visitor, path);
      if (identity.isNode(ctrl) || identity.isPair(ctrl)) {
        replaceNode(key, path, ctrl);
        return visitAsync_(key, ctrl, visitor, path);
      }
      if (typeof ctrl !== "symbol") {
        if (identity.isCollection(node)) {
          path = Object.freeze(path.concat(node));
          for (let i2 = 0; i2 < node.items.length; ++i2) {
            const ci = await visitAsync_(i2, node.items[i2], visitor, path);
            if (typeof ci === "number")
              i2 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              node.items.splice(i2, 1);
              i2 -= 1;
            }
          }
        } else if (identity.isPair(node)) {
          path = Object.freeze(path.concat(node));
          const ck = await visitAsync_("key", node.key, visitor, path);
          if (ck === BREAK)
            return BREAK;
          else if (ck === REMOVE)
            node.key = null;
          const cv = await visitAsync_("value", node.value, visitor, path);
          if (cv === BREAK)
            return BREAK;
          else if (cv === REMOVE)
            node.value = null;
        }
      }
      return ctrl;
    }
    function initVisitor(visitor) {
      if (typeof visitor === "object" && (visitor.Collection || visitor.Node || visitor.Value)) {
        return Object.assign({
          Alias: visitor.Node,
          Map: visitor.Node,
          Scalar: visitor.Node,
          Seq: visitor.Node
        }, visitor.Value && {
          Map: visitor.Value,
          Scalar: visitor.Value,
          Seq: visitor.Value
        }, visitor.Collection && {
          Map: visitor.Collection,
          Seq: visitor.Collection
        }, visitor);
      }
      return visitor;
    }
    function callVisitor(key, node, visitor, path) {
      if (typeof visitor === "function")
        return visitor(key, node, path);
      if (identity.isMap(node))
        return visitor.Map?.(key, node, path);
      if (identity.isSeq(node))
        return visitor.Seq?.(key, node, path);
      if (identity.isPair(node))
        return visitor.Pair?.(key, node, path);
      if (identity.isScalar(node))
        return visitor.Scalar?.(key, node, path);
      if (identity.isAlias(node))
        return visitor.Alias?.(key, node, path);
      return void 0;
    }
    function replaceNode(key, path, node) {
      const parent = path[path.length - 1];
      if (identity.isCollection(parent)) {
        parent.items[key] = node;
      } else if (identity.isPair(parent)) {
        if (key === "key")
          parent.key = node;
        else
          parent.value = node;
      } else if (identity.isDocument(parent)) {
        parent.contents = node;
      } else {
        const pt = identity.isAlias(parent) ? "alias" : "scalar";
        throw new Error(`Cannot replace node with ${pt} parent`);
      }
    }
    exports.visit = visit;
    exports.visitAsync = visitAsync;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/directives.js
var require_directives = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/directives.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    var escapeChars = {
      "!": "%21",
      ",": "%2C",
      "[": "%5B",
      "]": "%5D",
      "{": "%7B",
      "}": "%7D"
    };
    var escapeTagName = (tn) => tn.replace(/[!,[\]{}]/g, (ch) => escapeChars[ch]);
    var Directives = class _Directives {
      constructor(yaml, tags) {
        this.docStart = null;
        this.docEnd = false;
        this.yaml = Object.assign({}, _Directives.defaultYaml, yaml);
        this.tags = Object.assign({}, _Directives.defaultTags, tags);
      }
      clone() {
        const copy = new _Directives(this.yaml, this.tags);
        copy.docStart = this.docStart;
        return copy;
      }
      /**
       * During parsing, get a Directives instance for the current document and
       * update the stream state according to the current version's spec.
       */
      atDocument() {
        const res = new _Directives(this.yaml, this.tags);
        switch (this.yaml.version) {
          case "1.1":
            this.atNextDocument = true;
            break;
          case "1.2":
            this.atNextDocument = false;
            this.yaml = {
              explicit: _Directives.defaultYaml.explicit,
              version: "1.2"
            };
            this.tags = Object.assign({}, _Directives.defaultTags);
            break;
        }
        return res;
      }
      /**
       * @param onError - May be called even if the action was successful
       * @returns `true` on success
       */
      add(line, onError) {
        if (this.atNextDocument) {
          this.yaml = { explicit: _Directives.defaultYaml.explicit, version: "1.1" };
          this.tags = Object.assign({}, _Directives.defaultTags);
          this.atNextDocument = false;
        }
        const parts2 = line.trim().split(/[ \t]+/);
        const name2 = parts2.shift();
        switch (name2) {
          case "%TAG": {
            if (parts2.length !== 2) {
              onError(0, "%TAG directive should contain exactly two parts");
              if (parts2.length < 2)
                return false;
            }
            const [handle2, prefix] = parts2;
            this.tags[handle2] = prefix;
            return true;
          }
          case "%YAML": {
            this.yaml.explicit = true;
            if (parts2.length !== 1) {
              onError(0, "%YAML directive should contain exactly one part");
              return false;
            }
            const [version] = parts2;
            if (version === "1.1" || version === "1.2") {
              this.yaml.version = version;
              return true;
            } else {
              const isValid = /^\d+\.\d+$/.test(version);
              onError(6, `Unsupported YAML version ${version}`, isValid);
              return false;
            }
          }
          default:
            onError(0, `Unknown directive ${name2}`, true);
            return false;
        }
      }
      /**
       * Resolves a tag, matching handles to those defined in %TAG directives.
       *
       * @returns Resolved tag, which may also be the non-specific tag `'!'` or a
       *   `'!local'` tag, or `null` if unresolvable.
       */
      tagName(source, onError) {
        if (source === "!")
          return "!";
        if (source[0] !== "!") {
          onError(`Not a valid tag: ${source}`);
          return null;
        }
        if (source[1] === "<") {
          const verbatim = source.slice(2, -1);
          if (verbatim === "!" || verbatim === "!!") {
            onError(`Verbatim tags aren't resolved, so ${source} is invalid.`);
            return null;
          }
          if (source[source.length - 1] !== ">")
            onError("Verbatim tags must end with a >");
          return verbatim;
        }
        const [, handle2, suffix] = source.match(/^(.*!)([^!]*)$/s);
        if (!suffix)
          onError(`The ${source} tag has no suffix`);
        const prefix = this.tags[handle2];
        if (prefix) {
          try {
            return prefix + decodeURIComponent(suffix);
          } catch (error) {
            onError(String(error));
            return null;
          }
        }
        if (handle2 === "!")
          return source;
        onError(`Could not resolve tag: ${source}`);
        return null;
      }
      /**
       * Given a fully resolved tag, returns its printable string form,
       * taking into account current tag prefixes and defaults.
       */
      tagString(tag) {
        for (const [handle2, prefix] of Object.entries(this.tags)) {
          if (tag.startsWith(prefix))
            return handle2 + escapeTagName(tag.substring(prefix.length));
        }
        return tag[0] === "!" ? tag : `!<${tag}>`;
      }
      toString(doc) {
        const lines4 = this.yaml.explicit ? [`%YAML ${this.yaml.version || "1.2"}`] : [];
        const tagEntries = Object.entries(this.tags);
        let tagNames;
        if (doc && tagEntries.length > 0 && identity.isNode(doc.contents)) {
          const tags = {};
          visit.visit(doc.contents, (_key, node) => {
            if (identity.isNode(node) && node.tag)
              tags[node.tag] = true;
          });
          tagNames = Object.keys(tags);
        } else
          tagNames = [];
        for (const [handle2, prefix] of tagEntries) {
          if (handle2 === "!!" && prefix === "tag:yaml.org,2002:")
            continue;
          if (!doc || tagNames.some((tn) => tn.startsWith(prefix)))
            lines4.push(`%TAG ${handle2} ${prefix}`);
        }
        return lines4.join("\n");
      }
    };
    Directives.defaultYaml = { explicit: false, version: "1.2" };
    Directives.defaultTags = { "!!": "tag:yaml.org,2002:" };
    exports.Directives = Directives;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/anchors.js
var require_anchors = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/anchors.js"(exports) {
    "use strict";
    var identity = require_identity();
    var visit = require_visit();
    function anchorIsValid(anchor) {
      if (/[\x00-\x19\s,[\]{}]/.test(anchor)) {
        const sa = JSON.stringify(anchor);
        const msg = `Anchor must not contain whitespace or control characters: ${sa}`;
        throw new Error(msg);
      }
      return true;
    }
    function anchorNames(root) {
      const anchors = /* @__PURE__ */ new Set();
      visit.visit(root, {
        Value(_key, node) {
          if (node.anchor)
            anchors.add(node.anchor);
        }
      });
      return anchors;
    }
    function findNewAnchor(prefix, exclude) {
      for (let i2 = 1; true; ++i2) {
        const name2 = `${prefix}${i2}`;
        if (!exclude.has(name2))
          return name2;
      }
    }
    function createNodeAnchors(doc, prefix) {
      const aliasObjects = [];
      const sourceObjects = /* @__PURE__ */ new Map();
      let prevAnchors = null;
      return {
        onAnchor: (source) => {
          aliasObjects.push(source);
          prevAnchors ?? (prevAnchors = anchorNames(doc));
          const anchor = findNewAnchor(prefix, prevAnchors);
          prevAnchors.add(anchor);
          return anchor;
        },
        /**
         * With circular references, the source node is only resolved after all
         * of its child nodes are. This is why anchors are set only after all of
         * the nodes have been created.
         */
        setAnchors: () => {
          for (const source of aliasObjects) {
            const ref = sourceObjects.get(source);
            if (typeof ref === "object" && ref.anchor && (identity.isScalar(ref.node) || identity.isCollection(ref.node))) {
              ref.node.anchor = ref.anchor;
            } else {
              const error = new Error("Failed to resolve repeated object (this should not happen)");
              error.source = source;
              throw error;
            }
          }
        },
        sourceObjects
      };
    }
    exports.anchorIsValid = anchorIsValid;
    exports.anchorNames = anchorNames;
    exports.createNodeAnchors = createNodeAnchors;
    exports.findNewAnchor = findNewAnchor;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/applyReviver.js
var require_applyReviver = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/applyReviver.js"(exports) {
    "use strict";
    function applyReviver(reviver, obj, key, val) {
      if (val && typeof val === "object") {
        if (Array.isArray(val)) {
          for (let i2 = 0, len = val.length; i2 < len; ++i2) {
            const v0 = val[i2];
            const v1 = applyReviver(reviver, val, String(i2), v0);
            if (v1 === void 0)
              delete val[i2];
            else if (v1 !== v0)
              val[i2] = v1;
          }
        } else if (val instanceof Map) {
          for (const k of Array.from(val.keys())) {
            const v0 = val.get(k);
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              val.delete(k);
            else if (v1 !== v0)
              val.set(k, v1);
          }
        } else if (val instanceof Set) {
          for (const v0 of Array.from(val)) {
            const v1 = applyReviver(reviver, val, v0, v0);
            if (v1 === void 0)
              val.delete(v0);
            else if (v1 !== v0) {
              val.delete(v0);
              val.add(v1);
            }
          }
        } else {
          for (const [k, v0] of Object.entries(val)) {
            const v1 = applyReviver(reviver, val, k, v0);
            if (v1 === void 0)
              delete val[k];
            else if (v1 !== v0)
              val[k] = v1;
          }
        }
      }
      return reviver.call(obj, key, val);
    }
    exports.applyReviver = applyReviver;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/toJS.js
var require_toJS = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/toJS.js"(exports) {
    "use strict";
    var identity = require_identity();
    function toJS(value, arg, ctx) {
      if (Array.isArray(value))
        return value.map((v, i2) => toJS(v, String(i2), ctx));
      if (value && typeof value.toJSON === "function") {
        if (!ctx || !identity.hasAnchor(value))
          return value.toJSON(arg, ctx);
        const data2 = { aliasCount: 0, count: 1, res: void 0 };
        ctx.anchors.set(value, data2);
        ctx.onCreate = (res2) => {
          data2.res = res2;
          delete ctx.onCreate;
        };
        const res = value.toJSON(arg, ctx);
        if (ctx.onCreate)
          ctx.onCreate(res);
        return res;
      }
      if (typeof value === "bigint" && !ctx?.keep)
        return Number(value);
      return value;
    }
    exports.toJS = toJS;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Node.js
var require_Node = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Node.js"(exports) {
    "use strict";
    var applyReviver = require_applyReviver();
    var identity = require_identity();
    var toJS = require_toJS();
    var NodeBase = class {
      constructor(type) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: type });
      }
      /** Create a copy of this node.  */
      clone() {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** A plain JavaScript representation of this node. */
      toJS(doc, { mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        if (!identity.isDocument(doc))
          throw new TypeError("A document argument is required");
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc,
          keep: true,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this, "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
    };
    exports.NodeBase = NodeBase;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Alias.js
var require_Alias = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Alias.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var visit = require_visit();
    var identity = require_identity();
    var Node2 = require_Node();
    var toJS = require_toJS();
    var Alias = class extends Node2.NodeBase {
      constructor(source) {
        super(identity.ALIAS);
        this.source = source;
        Object.defineProperty(this, "tag", {
          set() {
            throw new Error("Alias nodes cannot have tags");
          }
        });
      }
      /**
       * Resolve the value of this alias within `doc`, finding the last
       * instance of the `source` anchor before this node.
       */
      resolve(doc, ctx) {
        if (ctx?.maxAliasCount === 0)
          throw new ReferenceError("Alias resolution is disabled");
        let nodes;
        if (ctx?.aliasResolveCache) {
          nodes = ctx.aliasResolveCache;
        } else {
          nodes = [];
          visit.visit(doc, {
            Node: (_key, node) => {
              if (identity.isAlias(node) || identity.hasAnchor(node))
                nodes.push(node);
            }
          });
          if (ctx)
            ctx.aliasResolveCache = nodes;
        }
        let found = void 0;
        for (const node of nodes) {
          if (node === this)
            break;
          if (node.anchor === this.source)
            found = node;
        }
        if (found && ctx) {
          const { anchors: anchors2, doc: doc2, maxAliasCount } = ctx;
          let data2 = anchors2.get(found);
          if (!data2) {
            toJS.toJS(found, null, ctx);
            data2 = anchors2.get(found);
          }
          if (data2?.res === void 0) {
            const msg = "This should not happen: Alias anchor was not resolved?";
            throw new ReferenceError(msg);
          }
          if (maxAliasCount >= 0) {
            data2.count += 1;
            if (data2.aliasCount === 0)
              data2.aliasCount = getAliasCount(doc2, found, anchors2);
            if (data2.count * data2.aliasCount > maxAliasCount) {
              const msg = "Excessive alias count indicates a resource exhaustion attack";
              throw new ReferenceError(msg);
            }
          }
        }
        return found;
      }
      toJSON(_arg, ctx) {
        if (!ctx)
          return { source: this.source };
        const source = this.resolve(ctx.doc, ctx);
        if (!source) {
          const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
          throw new ReferenceError(msg);
        }
        return ctx.anchors.get(source).res;
      }
      toString(ctx, _onComment, _onChompKeep) {
        const src = `*${this.source}`;
        if (ctx) {
          anchors.anchorIsValid(this.source);
          if (ctx.options.verifyAliasOrder && !ctx.anchors.has(this.source)) {
            const msg = `Unresolved alias (the anchor must be set before the alias): ${this.source}`;
            throw new Error(msg);
          }
          if (ctx.implicitKey)
            return `${src} `;
        }
        return src;
      }
    };
    function getAliasCount(doc, node, anchors2) {
      if (identity.isAlias(node)) {
        const source = node.resolve(doc);
        const anchor = anchors2 && source && anchors2.get(source);
        return anchor ? anchor.count * anchor.aliasCount : 0;
      } else if (identity.isCollection(node)) {
        let count = 0;
        for (const item of node.items) {
          const c = getAliasCount(doc, item, anchors2);
          if (c > count)
            count = c;
        }
        return count;
      } else if (identity.isPair(node)) {
        const kc = getAliasCount(doc, node.key, anchors2);
        const vc = getAliasCount(doc, node.value, anchors2);
        return Math.max(kc, vc);
      }
      return 1;
    }
    exports.Alias = Alias;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Scalar.js
var require_Scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Node2 = require_Node();
    var toJS = require_toJS();
    var isScalarValue = (value) => !value || typeof value !== "function" && typeof value !== "object";
    var Scalar = class extends Node2.NodeBase {
      constructor(value) {
        super(identity.SCALAR);
        this.value = value;
      }
      toJSON(arg, ctx) {
        return ctx?.keep ? this.value : toJS.toJS(this.value, arg, ctx);
      }
      toString() {
        return String(this.value);
      }
    };
    Scalar.BLOCK_FOLDED = "BLOCK_FOLDED";
    Scalar.BLOCK_LITERAL = "BLOCK_LITERAL";
    Scalar.PLAIN = "PLAIN";
    Scalar.QUOTE_DOUBLE = "QUOTE_DOUBLE";
    Scalar.QUOTE_SINGLE = "QUOTE_SINGLE";
    exports.Scalar = Scalar;
    exports.isScalarValue = isScalarValue;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/createNode.js
var require_createNode = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/createNode.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var defaultTagPrefix = "tag:yaml.org,2002:";
    function findTagObject(value, tagName, tags) {
      if (tagName) {
        const match = tags.filter((t) => t.tag === tagName);
        const tagObj = match.find((t) => !t.format) ?? match[0];
        if (!tagObj)
          throw new Error(`Tag ${tagName} not found`);
        return tagObj;
      }
      return tags.find((t) => t.identify?.(value) && !t.format);
    }
    function createNode(value, tagName, ctx) {
      if (identity.isDocument(value))
        value = value.contents;
      if (identity.isNode(value))
        return value;
      if (identity.isPair(value)) {
        const map = ctx.schema[identity.MAP].createNode?.(ctx.schema, null, ctx);
        map.items.push(value);
        return map;
      }
      if (value instanceof String || value instanceof Number || value instanceof Boolean || typeof BigInt !== "undefined" && value instanceof BigInt) {
        value = value.valueOf();
      }
      const { aliasDuplicateObjects, onAnchor, onTagObj, schema, sourceObjects } = ctx;
      let ref = void 0;
      if (aliasDuplicateObjects && value && typeof value === "object") {
        ref = sourceObjects.get(value);
        if (ref) {
          ref.anchor ?? (ref.anchor = onAnchor(value));
          return new Alias.Alias(ref.anchor);
        } else {
          ref = { anchor: null, node: null };
          sourceObjects.set(value, ref);
        }
      }
      if (tagName?.startsWith("!!"))
        tagName = defaultTagPrefix + tagName.slice(2);
      let tagObj = findTagObject(value, tagName, schema.tags);
      if (!tagObj) {
        if (value && typeof value.toJSON === "function") {
          value = value.toJSON();
        }
        if (!value || typeof value !== "object") {
          const node2 = new Scalar.Scalar(value);
          if (ref)
            ref.node = node2;
          return node2;
        }
        tagObj = value instanceof Map ? schema[identity.MAP] : Symbol.iterator in Object(value) ? schema[identity.SEQ] : schema[identity.MAP];
      }
      if (onTagObj) {
        onTagObj(tagObj);
        delete ctx.onTagObj;
      }
      const node = tagObj?.createNode ? tagObj.createNode(ctx.schema, value, ctx) : typeof tagObj?.nodeClass?.from === "function" ? tagObj.nodeClass.from(ctx.schema, value, ctx) : new Scalar.Scalar(value);
      if (tagName)
        node.tag = tagName;
      else if (!tagObj.default)
        node.tag = tagObj.tag;
      if (ref)
        ref.node = node;
      return node;
    }
    exports.createNode = createNode;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Collection.js
var require_Collection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Collection.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var identity = require_identity();
    var Node2 = require_Node();
    function collectionFromPath(schema, path, value) {
      let v = value;
      for (let i2 = path.length - 1; i2 >= 0; --i2) {
        const k = path[i2];
        if (typeof k === "number" && Number.isInteger(k) && k >= 0) {
          const a = [];
          a[k] = v;
          v = a;
        } else {
          v = /* @__PURE__ */ new Map([[k, v]]);
        }
      }
      return createNode.createNode(v, void 0, {
        aliasDuplicateObjects: false,
        keepUndefined: false,
        onAnchor: () => {
          throw new Error("This should not happen, please report a bug.");
        },
        schema,
        sourceObjects: /* @__PURE__ */ new Map()
      });
    }
    var isEmptyPath = (path) => path == null || typeof path === "object" && !!path[Symbol.iterator]().next().done;
    var Collection = class extends Node2.NodeBase {
      constructor(type, schema) {
        super(type);
        Object.defineProperty(this, "schema", {
          value: schema,
          configurable: true,
          enumerable: false,
          writable: true
        });
      }
      /**
       * Create a copy of this collection.
       *
       * @param schema - If defined, overwrites the original's schema
       */
      clone(schema) {
        const copy = Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this));
        if (schema)
          copy.schema = schema;
        copy.items = copy.items.map((it) => identity.isNode(it) || identity.isPair(it) ? it.clone(schema) : it);
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /**
       * Adds a value to the collection. For `!!map` and `!!omap` the value must
       * be a Pair instance or a `{ key, value }` object, which may not have a key
       * that already exists in the map.
       */
      addIn(path, value) {
        if (isEmptyPath(path))
          this.add(value);
        else {
          const [key, ...rest] = path;
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.addIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
      /**
       * Removes a value from the collection.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.delete(key);
        const node = this.get(key, true);
        if (identity.isCollection(node))
          return node.deleteIn(rest);
        else
          throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        const [key, ...rest] = path;
        const node = this.get(key, true);
        if (rest.length === 0)
          return !keepScalar && identity.isScalar(node) ? node.value : node;
        else
          return identity.isCollection(node) ? node.getIn(rest, keepScalar) : void 0;
      }
      hasAllNullValues(allowScalar) {
        return this.items.every((node) => {
          if (!identity.isPair(node))
            return false;
          const n = node.value;
          return n == null || allowScalar && identity.isScalar(n) && n.value == null && !n.commentBefore && !n.comment && !n.tag;
        });
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       */
      hasIn(path) {
        const [key, ...rest] = path;
        if (rest.length === 0)
          return this.has(key);
        const node = this.get(key, true);
        return identity.isCollection(node) ? node.hasIn(rest) : false;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        const [key, ...rest] = path;
        if (rest.length === 0) {
          this.set(key, value);
        } else {
          const node = this.get(key, true);
          if (identity.isCollection(node))
            node.setIn(rest, value);
          else if (node === void 0 && this.schema)
            this.set(key, collectionFromPath(this.schema, rest, value));
          else
            throw new Error(`Expected YAML collection at ${key}. Remaining path: ${rest}`);
        }
      }
    };
    exports.Collection = Collection;
    exports.collectionFromPath = collectionFromPath;
    exports.isEmptyPath = isEmptyPath;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyComment.js
var require_stringifyComment = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyComment.js"(exports) {
    "use strict";
    var stringifyComment = (str) => str.replace(/^(?!$)(?: $)?/gm, "#");
    function indentComment(comment, indent) {
      if (/^\n+$/.test(comment))
        return comment.substring(1);
      return indent ? comment.replace(/^(?! *$)/gm, indent) : comment;
    }
    var lineComment = (str, indent, comment) => str.endsWith("\n") ? indentComment(comment, indent) : comment.includes("\n") ? "\n" + indentComment(comment, indent) : (str.endsWith(" ") ? "" : " ") + comment;
    exports.indentComment = indentComment;
    exports.lineComment = lineComment;
    exports.stringifyComment = stringifyComment;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/foldFlowLines.js
var require_foldFlowLines = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/foldFlowLines.js"(exports) {
    "use strict";
    var FOLD_FLOW = "flow";
    var FOLD_BLOCK = "block";
    var FOLD_QUOTED = "quoted";
    function foldFlowLines(text, indent, mode = "flow", { indentAtStart, lineWidth = 80, minContentWidth = 20, onFold, onOverflow } = {}) {
      if (!lineWidth || lineWidth < 0)
        return text;
      if (lineWidth < minContentWidth)
        minContentWidth = 0;
      const endStep = Math.max(1 + minContentWidth, 1 + lineWidth - indent.length);
      if (text.length <= endStep)
        return text;
      const folds = [];
      const escapedFolds = {};
      let end = lineWidth - indent.length;
      if (typeof indentAtStart === "number") {
        if (indentAtStart > lineWidth - Math.max(2, minContentWidth))
          folds.push(0);
        else
          end = lineWidth - indentAtStart;
      }
      let split = void 0;
      let prev = void 0;
      let overflow = false;
      let i2 = -1;
      let escStart = -1;
      let escEnd = -1;
      if (mode === FOLD_BLOCK) {
        i2 = consumeMoreIndentedLines(text, i2, indent.length);
        if (i2 !== -1)
          end = i2 + endStep;
      }
      for (let ch; ch = text[i2 += 1]; ) {
        if (mode === FOLD_QUOTED && ch === "\\") {
          escStart = i2;
          switch (text[i2 + 1]) {
            case "x":
              i2 += 3;
              break;
            case "u":
              i2 += 5;
              break;
            case "U":
              i2 += 9;
              break;
            default:
              i2 += 1;
          }
          escEnd = i2;
        }
        if (ch === "\n") {
          if (mode === FOLD_BLOCK)
            i2 = consumeMoreIndentedLines(text, i2, indent.length);
          end = i2 + indent.length + endStep;
          split = void 0;
        } else {
          if (ch === " " && prev && prev !== " " && prev !== "\n" && prev !== "	") {
            const next = text[i2 + 1];
            if (next && next !== " " && next !== "\n" && next !== "	")
              split = i2;
          }
          if (i2 >= end) {
            if (split) {
              folds.push(split);
              end = split + endStep;
              split = void 0;
            } else if (mode === FOLD_QUOTED) {
              while (prev === " " || prev === "	") {
                prev = ch;
                ch = text[i2 += 1];
                overflow = true;
              }
              const j = i2 > escEnd + 1 ? i2 - 2 : escStart - 1;
              if (escapedFolds[j])
                return text;
              folds.push(j);
              escapedFolds[j] = true;
              end = j + endStep;
              split = void 0;
            } else {
              overflow = true;
            }
          }
        }
        prev = ch;
      }
      if (overflow && onOverflow)
        onOverflow();
      if (folds.length === 0)
        return text;
      if (onFold)
        onFold();
      let res = text.slice(0, folds[0]);
      for (let i3 = 0; i3 < folds.length; ++i3) {
        const fold = folds[i3];
        const end2 = folds[i3 + 1] || text.length;
        if (fold === 0)
          res = `
${indent}${text.slice(0, end2)}`;
        else {
          if (mode === FOLD_QUOTED && escapedFolds[fold])
            res += `${text[fold]}\\`;
          res += `
${indent}${text.slice(fold + 1, end2)}`;
        }
      }
      return res;
    }
    function consumeMoreIndentedLines(text, i2, indent) {
      let end = i2;
      let start2 = i2 + 1;
      let ch = text[start2];
      while (ch === " " || ch === "	") {
        if (i2 < start2 + indent) {
          ch = text[++i2];
        } else {
          do {
            ch = text[++i2];
          } while (ch && ch !== "\n");
          end = i2;
          start2 = i2 + 1;
          ch = text[start2];
        }
      }
      return end;
    }
    exports.FOLD_BLOCK = FOLD_BLOCK;
    exports.FOLD_FLOW = FOLD_FLOW;
    exports.FOLD_QUOTED = FOLD_QUOTED;
    exports.foldFlowLines = foldFlowLines;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyString.js
var require_stringifyString = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyString.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var foldFlowLines = require_foldFlowLines();
    var getFoldOptions = (ctx, isBlock) => ({
      indentAtStart: isBlock ? ctx.indent.length : ctx.indentAtStart,
      lineWidth: ctx.options.lineWidth,
      minContentWidth: ctx.options.minContentWidth
    });
    var containsDocumentMarker = (str) => /^(%|---|\.\.\.)/m.test(str);
    function lineLengthOverLimit(str, lineWidth, indentLength) {
      if (!lineWidth || lineWidth < 0)
        return false;
      const limit = lineWidth - indentLength;
      const strLen = str.length;
      if (strLen <= limit)
        return false;
      for (let i2 = 0, start2 = 0; i2 < strLen; ++i2) {
        if (str[i2] === "\n") {
          if (i2 - start2 > limit)
            return true;
          start2 = i2 + 1;
          if (strLen - start2 <= limit)
            return false;
        }
      }
      return true;
    }
    function doubleQuotedString(value, ctx) {
      const json = JSON.stringify(value);
      if (ctx.options.doubleQuotedAsJSON)
        return json;
      const { implicitKey } = ctx;
      const minMultiLineLength = ctx.options.doubleQuotedMinMultiLineLength;
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      let str = "";
      let start2 = 0;
      for (let i2 = 0, ch = json[i2]; ch; ch = json[++i2]) {
        if (ch === " " && json[i2 + 1] === "\\" && json[i2 + 2] === "n") {
          str += json.slice(start2, i2) + "\\ ";
          i2 += 1;
          start2 = i2;
          ch = "\\";
        }
        if (ch === "\\")
          switch (json[i2 + 1]) {
            case "u":
              {
                str += json.slice(start2, i2);
                const code3 = json.substr(i2 + 2, 4);
                switch (code3) {
                  case "0000":
                    str += "\\0";
                    break;
                  case "0007":
                    str += "\\a";
                    break;
                  case "000b":
                    str += "\\v";
                    break;
                  case "001b":
                    str += "\\e";
                    break;
                  case "0085":
                    str += "\\N";
                    break;
                  case "00a0":
                    str += "\\_";
                    break;
                  case "2028":
                    str += "\\L";
                    break;
                  case "2029":
                    str += "\\P";
                    break;
                  default:
                    if (code3.substr(0, 2) === "00")
                      str += "\\x" + code3.substr(2);
                    else
                      str += json.substr(i2, 6);
                }
                i2 += 5;
                start2 = i2 + 1;
              }
              break;
            case "n":
              if (implicitKey || json[i2 + 2] === '"' || json.length < minMultiLineLength) {
                i2 += 1;
              } else {
                str += json.slice(start2, i2) + "\n\n";
                while (json[i2 + 2] === "\\" && json[i2 + 3] === "n" && json[i2 + 4] !== '"') {
                  str += "\n";
                  i2 += 2;
                }
                str += indent;
                if (json[i2 + 2] === " ")
                  str += "\\";
                i2 += 1;
                start2 = i2 + 1;
              }
              break;
            default:
              i2 += 1;
          }
      }
      str = start2 ? str + json.slice(start2) : json;
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_QUOTED, getFoldOptions(ctx, false));
    }
    function singleQuotedString(value, ctx) {
      if (ctx.options.singleQuote === false || ctx.implicitKey && value.includes("\n") || /[ \t]\n|\n[ \t]/.test(value))
        return doubleQuotedString(value, ctx);
      const indent = ctx.indent || (containsDocumentMarker(value) ? "  " : "");
      const res = "'" + value.replace(/'/g, "''").replace(/\n+/g, `$&
${indent}`) + "'";
      return ctx.implicitKey ? res : foldFlowLines.foldFlowLines(res, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function quotedString(value, ctx) {
      const { singleQuote } = ctx.options;
      let qs;
      if (singleQuote === false)
        qs = doubleQuotedString;
      else {
        const hasDouble = value.includes('"');
        const hasSingle = value.includes("'");
        if (hasDouble && !hasSingle)
          qs = singleQuotedString;
        else if (hasSingle && !hasDouble)
          qs = doubleQuotedString;
        else
          qs = singleQuote ? singleQuotedString : doubleQuotedString;
      }
      return qs(value, ctx);
    }
    var blockEndNewlines;
    try {
      blockEndNewlines = new RegExp("(^|(?<!\n))\n+(?!\n|$)", "g");
    } catch {
      blockEndNewlines = /\n+(?!\n|$)/g;
    }
    function blockString({ comment, type, value }, ctx, onComment, onChompKeep) {
      const { blockQuote, commentString, lineWidth } = ctx.options;
      if (!blockQuote || /\n[\t ]+$/.test(value)) {
        return quotedString(value, ctx);
      }
      const indent = ctx.indent || (ctx.forceBlockIndent || containsDocumentMarker(value) ? "  " : "");
      const literal2 = blockQuote === "literal" ? true : blockQuote === "folded" || type === Scalar.Scalar.BLOCK_FOLDED ? false : type === Scalar.Scalar.BLOCK_LITERAL ? true : !lineLengthOverLimit(value, lineWidth, indent.length);
      if (!value)
        return literal2 ? "|\n" : ">\n";
      let chomp;
      let endStart;
      for (endStart = value.length; endStart > 0; --endStart) {
        const ch = value[endStart - 1];
        if (ch !== "\n" && ch !== "	" && ch !== " ")
          break;
      }
      let end = value.substring(endStart);
      const endNlPos = end.indexOf("\n");
      if (endNlPos === -1) {
        chomp = "-";
      } else if (value === end || endNlPos !== end.length - 1) {
        chomp = "+";
        if (onChompKeep)
          onChompKeep();
      } else {
        chomp = "";
      }
      if (end) {
        value = value.slice(0, -end.length);
        if (end[end.length - 1] === "\n")
          end = end.slice(0, -1);
        end = end.replace(blockEndNewlines, `$&${indent}`);
      }
      let startWithSpace = false;
      let startEnd;
      let startNlPos = -1;
      for (startEnd = 0; startEnd < value.length; ++startEnd) {
        const ch = value[startEnd];
        if (ch === " ")
          startWithSpace = true;
        else if (ch === "\n")
          startNlPos = startEnd;
        else
          break;
      }
      let start2 = value.substring(0, startNlPos < startEnd ? startNlPos + 1 : startEnd);
      if (start2) {
        value = value.substring(start2.length);
        start2 = start2.replace(/\n+/g, `$&${indent}`);
      }
      const indentSize = indent ? "2" : "1";
      let header = (startWithSpace ? indentSize : "") + chomp;
      if (comment) {
        header += " " + commentString(comment.replace(/ ?[\r\n]+/g, " "));
        if (onComment)
          onComment();
      }
      if (!literal2) {
        const foldedValue = value.replace(/\n+/g, "\n$&").replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g, "$1$2").replace(/\n+/g, `$&${indent}`);
        let literalFallback = false;
        const foldOptions = getFoldOptions(ctx, true);
        if (blockQuote !== "folded" && type !== Scalar.Scalar.BLOCK_FOLDED) {
          foldOptions.onOverflow = () => {
            literalFallback = true;
          };
        }
        const body2 = foldFlowLines.foldFlowLines(`${start2}${foldedValue}${end}`, indent, foldFlowLines.FOLD_BLOCK, foldOptions);
        if (!literalFallback)
          return `>${header}
${indent}${body2}`;
      }
      value = value.replace(/\n+/g, `$&${indent}`);
      return `|${header}
${indent}${start2}${value}${end}`;
    }
    function plainString(item, ctx, onComment, onChompKeep) {
      const { type, value } = item;
      const { actualString, implicitKey, indent, indentStep, inFlow } = ctx;
      if (implicitKey && value.includes("\n") || inFlow && /[[\]{},]/.test(value)) {
        return quotedString(value, ctx);
      }
      if (/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(value)) {
        return implicitKey || inFlow || !value.includes("\n") ? quotedString(value, ctx) : blockString(item, ctx, onComment, onChompKeep);
      }
      if (!implicitKey && !inFlow && type !== Scalar.Scalar.PLAIN && value.includes("\n")) {
        return blockString(item, ctx, onComment, onChompKeep);
      }
      if (containsDocumentMarker(value)) {
        if (indent === "") {
          ctx.forceBlockIndent = true;
          return blockString(item, ctx, onComment, onChompKeep);
        } else if (implicitKey && indent === indentStep) {
          return quotedString(value, ctx);
        }
      }
      const str = value.replace(/\n+/g, `$&
${indent}`);
      if (actualString) {
        const test = (tag) => tag.default && tag.tag !== "tag:yaml.org,2002:str" && tag.test?.test(str);
        const { compat, tags } = ctx.doc.schema;
        if (tags.some(test) || compat?.some(test))
          return quotedString(value, ctx);
      }
      return implicitKey ? str : foldFlowLines.foldFlowLines(str, indent, foldFlowLines.FOLD_FLOW, getFoldOptions(ctx, false));
    }
    function stringifyString(item, ctx, onComment, onChompKeep) {
      const { implicitKey, inFlow } = ctx;
      const ss = typeof item.value === "string" ? item : Object.assign({}, item, { value: String(item.value) });
      let { type } = item;
      if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
        if (/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(ss.value))
          type = Scalar.Scalar.QUOTE_DOUBLE;
      }
      const _stringify = (_type) => {
        switch (_type) {
          case Scalar.Scalar.BLOCK_FOLDED:
          case Scalar.Scalar.BLOCK_LITERAL:
            return implicitKey || inFlow ? quotedString(ss.value, ctx) : blockString(ss, ctx, onComment, onChompKeep);
          case Scalar.Scalar.QUOTE_DOUBLE:
            return doubleQuotedString(ss.value, ctx);
          case Scalar.Scalar.QUOTE_SINGLE:
            return singleQuotedString(ss.value, ctx);
          case Scalar.Scalar.PLAIN:
            return plainString(ss, ctx, onComment, onChompKeep);
          default:
            return null;
        }
      };
      let res = _stringify(type);
      if (res === null) {
        const { defaultKeyType, defaultStringType } = ctx.options;
        const t = implicitKey && defaultKeyType || defaultStringType;
        res = _stringify(t);
        if (res === null)
          throw new Error(`Unsupported default string type ${t}`);
      }
      return res;
    }
    exports.stringifyString = stringifyString;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringify.js
var require_stringify = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringify.js"(exports) {
    "use strict";
    var anchors = require_anchors();
    var identity = require_identity();
    var stringifyComment = require_stringifyComment();
    var stringifyString = require_stringifyString();
    function createStringifyContext(doc, options) {
      const opt = Object.assign({
        blockQuote: true,
        commentString: stringifyComment.stringifyComment,
        defaultKeyType: null,
        defaultStringType: "PLAIN",
        directives: null,
        doubleQuotedAsJSON: false,
        doubleQuotedMinMultiLineLength: 40,
        falseStr: "false",
        flowCollectionPadding: true,
        indentSeq: true,
        lineWidth: 80,
        minContentWidth: 20,
        nullStr: "null",
        simpleKeys: false,
        singleQuote: null,
        trailingComma: false,
        trueStr: "true",
        verifyAliasOrder: true
      }, doc.schema.toStringOptions, options);
      let inFlow;
      switch (opt.collectionStyle) {
        case "block":
          inFlow = false;
          break;
        case "flow":
          inFlow = true;
          break;
        default:
          inFlow = null;
      }
      return {
        anchors: /* @__PURE__ */ new Set(),
        doc,
        flowCollectionPadding: opt.flowCollectionPadding ? " " : "",
        indent: "",
        indentStep: typeof opt.indent === "number" ? " ".repeat(opt.indent) : "  ",
        inFlow,
        options: opt
      };
    }
    function getTagObject(tags, item) {
      if (item.tag) {
        const match = tags.filter((t) => t.tag === item.tag);
        if (match.length > 0)
          return match.find((t) => t.format === item.format) ?? match[0];
      }
      let tagObj = void 0;
      let obj;
      if (identity.isScalar(item)) {
        obj = item.value;
        let match = tags.filter((t) => t.identify?.(obj));
        if (match.length > 1) {
          const testMatch = match.filter((t) => t.test);
          if (testMatch.length > 0)
            match = testMatch;
        }
        tagObj = match.find((t) => t.format === item.format) ?? match.find((t) => !t.format);
      } else {
        obj = item;
        tagObj = tags.find((t) => t.nodeClass && obj instanceof t.nodeClass);
      }
      if (!tagObj) {
        const name2 = obj?.constructor?.name ?? (obj === null ? "null" : typeof obj);
        throw new Error(`Tag not resolved for ${name2} value`);
      }
      return tagObj;
    }
    function stringifyProps(node, tagObj, { anchors: anchors$1, doc }) {
      if (!doc.directives)
        return "";
      const props = [];
      const anchor = (identity.isScalar(node) || identity.isCollection(node)) && node.anchor;
      if (anchor && anchors.anchorIsValid(anchor)) {
        anchors$1.add(anchor);
        props.push(`&${anchor}`);
      }
      const tag = node.tag ?? (tagObj.default ? null : tagObj.tag);
      if (tag)
        props.push(doc.directives.tagString(tag));
      return props.join(" ");
    }
    function stringify(item, ctx, onComment, onChompKeep) {
      if (identity.isPair(item))
        return item.toString(ctx, onComment, onChompKeep);
      if (identity.isAlias(item)) {
        if (ctx.doc.directives)
          return item.toString(ctx);
        if (ctx.resolvedAliases?.has(item)) {
          throw new TypeError(`Cannot stringify circular structure without alias nodes`);
        } else {
          if (ctx.resolvedAliases)
            ctx.resolvedAliases.add(item);
          else
            ctx.resolvedAliases = /* @__PURE__ */ new Set([item]);
          item = item.resolve(ctx.doc);
        }
      }
      let tagObj = void 0;
      const node = identity.isNode(item) ? item : ctx.doc.createNode(item, { onTagObj: (o) => tagObj = o });
      tagObj ?? (tagObj = getTagObject(ctx.doc.schema.tags, node));
      const props = stringifyProps(node, tagObj, ctx);
      if (props.length > 0)
        ctx.indentAtStart = (ctx.indentAtStart ?? 0) + props.length + 1;
      const str = typeof tagObj.stringify === "function" ? tagObj.stringify(node, ctx, onComment, onChompKeep) : identity.isScalar(node) ? stringifyString.stringifyString(node, ctx, onComment, onChompKeep) : node.toString(ctx, onComment, onChompKeep);
      if (!props)
        return str;
      return identity.isScalar(node) || str[0] === "{" || str[0] === "[" ? `${props} ${str}` : `${props}
${ctx.indent}${str}`;
    }
    exports.createStringifyContext = createStringifyContext;
    exports.stringify = stringify;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyPair.js
var require_stringifyPair = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyPair.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyPair({ key, value }, ctx, onComment, onChompKeep) {
      const { allNullValues, doc, indent, indentStep, options: { commentString, indentSeq, simpleKeys } } = ctx;
      let keyComment = identity.isNode(key) && key.comment || null;
      if (simpleKeys) {
        if (keyComment) {
          throw new Error("With simple keys, key nodes cannot have comments");
        }
        if (identity.isCollection(key) || !identity.isNode(key) && typeof key === "object") {
          const msg = "With simple keys, collection cannot be used as a key value";
          throw new Error(msg);
        }
      }
      let explicitKey = !simpleKeys && (!key || keyComment && value == null && !ctx.inFlow || identity.isCollection(key) || (identity.isScalar(key) ? key.type === Scalar.Scalar.BLOCK_FOLDED || key.type === Scalar.Scalar.BLOCK_LITERAL : typeof key === "object"));
      ctx = Object.assign({}, ctx, {
        allNullValues: false,
        implicitKey: !explicitKey && (simpleKeys || !allNullValues),
        indent: indent + indentStep
      });
      let keyCommentDone = false;
      let chompKeep = false;
      let str = stringify.stringify(key, ctx, () => keyCommentDone = true, () => chompKeep = true);
      if (!explicitKey && !ctx.inFlow && str.length > 1024) {
        if (simpleKeys)
          throw new Error("With simple keys, single line scalar must not span more than 1024 characters");
        explicitKey = true;
      }
      if (ctx.inFlow) {
        if (allNullValues || value == null) {
          if (keyCommentDone && onComment)
            onComment();
          return str === "" ? "?" : explicitKey ? `? ${str}` : str;
        }
      } else if (allNullValues && !simpleKeys || value == null && explicitKey) {
        str = `? ${str}`;
        if (keyComment && !keyCommentDone) {
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        } else if (chompKeep && onChompKeep)
          onChompKeep();
        return str;
      }
      if (keyCommentDone)
        keyComment = null;
      if (explicitKey) {
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
        str = `? ${str}
${indent}:`;
      } else {
        str = `${str}:`;
        if (keyComment)
          str += stringifyComment.lineComment(str, ctx.indent, commentString(keyComment));
      }
      let vsb, vcb, valueComment;
      if (identity.isNode(value)) {
        vsb = !!value.spaceBefore;
        vcb = value.commentBefore;
        valueComment = value.comment;
      } else {
        vsb = false;
        vcb = null;
        valueComment = null;
        if (value && typeof value === "object")
          value = doc.createNode(value);
      }
      ctx.implicitKey = false;
      if (!explicitKey && !keyComment && identity.isScalar(value))
        ctx.indentAtStart = str.length + 1;
      chompKeep = false;
      if (!indentSeq && indentStep.length >= 2 && !ctx.inFlow && !explicitKey && identity.isSeq(value) && !value.flow && !value.tag && !value.anchor) {
        ctx.indent = ctx.indent.substring(2);
      }
      let valueCommentDone = false;
      const valueStr = stringify.stringify(value, ctx, () => valueCommentDone = true, () => chompKeep = true);
      let ws = " ";
      if (keyComment || vsb || vcb) {
        ws = vsb ? "\n" : "";
        if (vcb) {
          const cs = commentString(vcb);
          ws += `
${stringifyComment.indentComment(cs, ctx.indent)}`;
        }
        if (valueStr === "" && !ctx.inFlow) {
          if (ws === "\n" && valueComment)
            ws = "\n\n";
        } else {
          ws += `
${ctx.indent}`;
        }
      } else if (!explicitKey && identity.isCollection(value)) {
        const vs0 = valueStr[0];
        const nl0 = valueStr.indexOf("\n");
        const hasNewline = nl0 !== -1;
        const flow = ctx.inFlow ?? value.flow ?? value.items.length === 0;
        if (hasNewline || !flow) {
          let hasPropsLine = false;
          if (hasNewline && (vs0 === "&" || vs0 === "!")) {
            let sp0 = valueStr.indexOf(" ");
            if (vs0 === "&" && sp0 !== -1 && sp0 < nl0 && valueStr[sp0 + 1] === "!") {
              sp0 = valueStr.indexOf(" ", sp0 + 1);
            }
            if (sp0 === -1 || nl0 < sp0)
              hasPropsLine = true;
          }
          if (!hasPropsLine)
            ws = `
${ctx.indent}`;
        }
      } else if (valueStr === "" || valueStr[0] === "\n") {
        ws = "";
      }
      str += ws + valueStr;
      if (ctx.inFlow) {
        if (valueCommentDone && onComment)
          onComment();
      } else if (valueComment && !valueCommentDone) {
        str += stringifyComment.lineComment(str, ctx.indent, commentString(valueComment));
      } else if (chompKeep && onChompKeep) {
        onChompKeep();
      }
      return str;
    }
    exports.stringifyPair = stringifyPair;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js
var require_log = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/log.js"(exports) {
    "use strict";
    var node_process = __require("process");
    function debug(logLevel, ...messages) {
      if (logLevel === "debug")
        console.log(...messages);
    }
    function warn(logLevel, warning) {
      if (logLevel === "debug" || logLevel === "warn") {
        if (typeof node_process.emitWarning === "function")
          node_process.emitWarning(warning);
        else
          console.warn(warning);
      }
    }
    exports.debug = debug;
    exports.warn = warn;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/merge.js
var require_merge = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/merge.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var MERGE_KEY = "<<";
    var merge = {
      identify: (value) => value === MERGE_KEY || typeof value === "symbol" && value.description === MERGE_KEY,
      default: "key",
      tag: "tag:yaml.org,2002:merge",
      test: /^<<$/,
      resolve: () => Object.assign(new Scalar.Scalar(Symbol(MERGE_KEY)), {
        addToJSMap: addMergeToJSMap
      }),
      stringify: () => MERGE_KEY
    };
    var isMergeKey = (ctx, key) => (merge.identify(key) || identity.isScalar(key) && (!key.type || key.type === Scalar.Scalar.PLAIN) && merge.identify(key.value)) && ctx?.doc.schema.tags.some((tag) => tag.tag === merge.tag && tag.default);
    function addMergeToJSMap(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (identity.isSeq(source))
        for (const it of source.items)
          mergeValue(ctx, map, it);
      else if (Array.isArray(source))
        for (const it of source)
          mergeValue(ctx, map, it);
      else
        mergeValue(ctx, map, source);
    }
    function mergeValue(ctx, map, value) {
      const source = resolveAliasValue(ctx, value);
      if (!identity.isMap(source))
        throw new Error("Merge sources must be maps or map aliases");
      const srcMap = source.toJSON(null, ctx, Map);
      for (const [key, value2] of srcMap) {
        if (map instanceof Map) {
          if (!map.has(key))
            map.set(key, value2);
        } else if (map instanceof Set) {
          map.add(key);
        } else if (!Object.prototype.hasOwnProperty.call(map, key)) {
          Object.defineProperty(map, key, {
            value: value2,
            writable: true,
            enumerable: true,
            configurable: true
          });
        }
      }
      return map;
    }
    function resolveAliasValue(ctx, value) {
      return ctx && identity.isAlias(value) ? value.resolve(ctx.doc, ctx) : value;
    }
    exports.addMergeToJSMap = addMergeToJSMap;
    exports.isMergeKey = isMergeKey;
    exports.merge = merge;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/addPairToJSMap.js
var require_addPairToJSMap = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/addPairToJSMap.js"(exports) {
    "use strict";
    var log = require_log();
    var merge = require_merge();
    var stringify = require_stringify();
    var identity = require_identity();
    var toJS = require_toJS();
    function addPairToJSMap(ctx, map, { key, value }) {
      if (identity.isNode(key) && key.addToJSMap)
        key.addToJSMap(ctx, map, value);
      else if (merge.isMergeKey(ctx, key))
        merge.addMergeToJSMap(ctx, map, value);
      else {
        const jsKey = toJS.toJS(key, "", ctx);
        if (map instanceof Map) {
          map.set(jsKey, toJS.toJS(value, jsKey, ctx));
        } else if (map instanceof Set) {
          map.add(jsKey);
        } else {
          const stringKey = stringifyKey(key, jsKey, ctx);
          const jsValue = toJS.toJS(value, stringKey, ctx);
          if (stringKey in map)
            Object.defineProperty(map, stringKey, {
              value: jsValue,
              writable: true,
              enumerable: true,
              configurable: true
            });
          else
            map[stringKey] = jsValue;
        }
      }
      return map;
    }
    function stringifyKey(key, jsKey, ctx) {
      if (jsKey === null)
        return "";
      if (typeof jsKey !== "object")
        return String(jsKey);
      if (identity.isNode(key) && ctx?.doc) {
        const strCtx = stringify.createStringifyContext(ctx.doc, {});
        strCtx.anchors = /* @__PURE__ */ new Set();
        for (const node of ctx.anchors.keys())
          strCtx.anchors.add(node.anchor);
        strCtx.inFlow = true;
        strCtx.inStringifyKey = true;
        const strKey = key.toString(strCtx);
        if (!ctx.mapKeyWarned) {
          let jsonStr = JSON.stringify(strKey);
          if (jsonStr.length > 40)
            jsonStr = jsonStr.substring(0, 36) + '..."';
          log.warn(ctx.doc.options.logLevel, `Keys with collection values will be stringified due to JS Object restrictions: ${jsonStr}. Set mapAsMap: true to use object keys.`);
          ctx.mapKeyWarned = true;
        }
        return strKey;
      }
      return JSON.stringify(jsKey);
    }
    exports.addPairToJSMap = addPairToJSMap;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Pair.js
var require_Pair = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/Pair.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyPair = require_stringifyPair();
    var addPairToJSMap = require_addPairToJSMap();
    var identity = require_identity();
    function createPair(key, value, ctx) {
      const k = createNode.createNode(key, void 0, ctx);
      const v = createNode.createNode(value, void 0, ctx);
      return new Pair(k, v);
    }
    var Pair = class _Pair {
      constructor(key, value = null) {
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.PAIR });
        this.key = key;
        this.value = value;
      }
      clone(schema) {
        let { key, value } = this;
        if (identity.isNode(key))
          key = key.clone(schema);
        if (identity.isNode(value))
          value = value.clone(schema);
        return new _Pair(key, value);
      }
      toJSON(_, ctx) {
        const pair = ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        return addPairToJSMap.addPairToJSMap(ctx, pair, this);
      }
      toString(ctx, onComment, onChompKeep) {
        return ctx?.doc ? stringifyPair.stringifyPair(this, ctx, onComment, onChompKeep) : JSON.stringify(this);
      }
    };
    exports.Pair = Pair;
    exports.createPair = createPair;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyCollection.js
var require_stringifyCollection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyCollection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyCollection(collection, ctx, options) {
      const flow = ctx.inFlow ?? collection.flow;
      const stringify2 = flow ? stringifyFlowCollection : stringifyBlockCollection;
      return stringify2(collection, ctx, options);
    }
    function stringifyBlockCollection({ comment, items }, ctx, { blockItemPrefix, flowChars, itemIndent, onChompKeep, onComment }) {
      const { indent, options: { commentString } } = ctx;
      const itemCtx = Object.assign({}, ctx, { indent: itemIndent, type: null });
      let chompKeep = false;
      const lines4 = [];
      for (let i2 = 0; i2 < items.length; ++i2) {
        const item = items[i2];
        let comment2 = null;
        if (identity.isNode(item)) {
          if (!chompKeep && item.spaceBefore)
            lines4.push("");
          addCommentBefore(ctx, lines4, item.commentBefore, chompKeep);
          if (item.comment)
            comment2 = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (!chompKeep && ik.spaceBefore)
              lines4.push("");
            addCommentBefore(ctx, lines4, ik.commentBefore, chompKeep);
          }
        }
        chompKeep = false;
        let str2 = stringify.stringify(item, itemCtx, () => comment2 = null, () => chompKeep = true);
        if (comment2)
          str2 += stringifyComment.lineComment(str2, itemIndent, commentString(comment2));
        if (chompKeep && comment2)
          chompKeep = false;
        lines4.push(blockItemPrefix + str2);
      }
      let str;
      if (lines4.length === 0) {
        str = flowChars.start + flowChars.end;
      } else {
        str = lines4[0];
        for (let i2 = 1; i2 < lines4.length; ++i2) {
          const line = lines4[i2];
          str += line ? `
${indent}${line}` : "\n";
        }
      }
      if (comment) {
        str += "\n" + stringifyComment.indentComment(commentString(comment), indent);
        if (onComment)
          onComment();
      } else if (chompKeep && onChompKeep)
        onChompKeep();
      return str;
    }
    function stringifyFlowCollection({ items }, ctx, { flowChars, itemIndent }) {
      const { indent, indentStep, flowCollectionPadding: fcPadding, options: { commentString } } = ctx;
      itemIndent += indentStep;
      const itemCtx = Object.assign({}, ctx, {
        indent: itemIndent,
        inFlow: true,
        type: null
      });
      let reqNewline = false;
      let linesAtValue = 0;
      const lines4 = [];
      for (let i2 = 0; i2 < items.length; ++i2) {
        const item = items[i2];
        let comment = null;
        if (identity.isNode(item)) {
          if (item.spaceBefore)
            lines4.push("");
          addCommentBefore(ctx, lines4, item.commentBefore, false);
          if (item.comment)
            comment = item.comment;
        } else if (identity.isPair(item)) {
          const ik = identity.isNode(item.key) ? item.key : null;
          if (ik) {
            if (ik.spaceBefore)
              lines4.push("");
            addCommentBefore(ctx, lines4, ik.commentBefore, false);
            if (ik.comment)
              reqNewline = true;
          }
          const iv = identity.isNode(item.value) ? item.value : null;
          if (iv) {
            if (iv.comment)
              comment = iv.comment;
            if (iv.commentBefore)
              reqNewline = true;
          } else if (item.value == null && ik?.comment) {
            comment = ik.comment;
          }
        }
        if (comment)
          reqNewline = true;
        let str = stringify.stringify(item, itemCtx, () => comment = null);
        reqNewline || (reqNewline = lines4.length > linesAtValue || str.includes("\n"));
        if (i2 < items.length - 1) {
          str += ",";
        } else if (ctx.options.trailingComma) {
          if (ctx.options.lineWidth > 0) {
            reqNewline || (reqNewline = lines4.reduce((sum, line) => sum + line.length + 2, 2) + (str.length + 2) > ctx.options.lineWidth);
          }
          if (reqNewline) {
            str += ",";
          }
        }
        if (comment)
          str += stringifyComment.lineComment(str, itemIndent, commentString(comment));
        lines4.push(str);
        linesAtValue = lines4.length;
      }
      const { start: start2, end } = flowChars;
      if (lines4.length === 0) {
        return start2 + end;
      } else {
        if (!reqNewline) {
          const len = lines4.reduce((sum, line) => sum + line.length + 2, 2);
          reqNewline = ctx.options.lineWidth > 0 && len > ctx.options.lineWidth;
        }
        if (reqNewline) {
          let str = start2;
          for (const line of lines4)
            str += line ? `
${indentStep}${indent}${line}` : "\n";
          return `${str}
${indent}${end}`;
        } else {
          return `${start2}${fcPadding}${lines4.join(" ")}${fcPadding}${end}`;
        }
      }
    }
    function addCommentBefore({ indent, options: { commentString } }, lines4, comment, chompKeep) {
      if (comment && chompKeep)
        comment = comment.replace(/^\n+/, "");
      if (comment) {
        const ic = stringifyComment.indentComment(commentString(comment), indent);
        lines4.push(ic.trimStart());
      }
    }
    exports.stringifyCollection = stringifyCollection;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLMap.js
var require_YAMLMap = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLMap.js"(exports) {
    "use strict";
    var stringifyCollection = require_stringifyCollection();
    var addPairToJSMap = require_addPairToJSMap();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    function findPair(items, key) {
      const k = identity.isScalar(key) ? key.value : key;
      for (const it of items) {
        if (identity.isPair(it)) {
          if (it.key === key || it.key === k)
            return it;
          if (identity.isScalar(it.key) && it.key.value === k)
            return it;
        }
      }
      return void 0;
    }
    var YAMLMap = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:map";
      }
      constructor(schema) {
        super(identity.MAP, schema);
        this.items = [];
      }
      /**
       * A generic collection parsing method that can be extended
       * to other node classes that inherit from YAMLMap
       */
      static from(schema, obj, ctx) {
        const { keepUndefined, replacer } = ctx;
        const map = new this(schema);
        const add2 = (key, value) => {
          if (typeof replacer === "function")
            value = replacer.call(obj, key, value);
          else if (Array.isArray(replacer) && !replacer.includes(key))
            return;
          if (value !== void 0 || keepUndefined)
            map.items.push(Pair.createPair(key, value, ctx));
        };
        if (obj instanceof Map) {
          for (const [key, value] of obj)
            add2(key, value);
        } else if (obj && typeof obj === "object") {
          for (const key of Object.keys(obj))
            add2(key, obj[key]);
        }
        if (typeof schema.sortMapEntries === "function") {
          map.items.sort(schema.sortMapEntries);
        }
        return map;
      }
      /**
       * Adds a value to the collection.
       *
       * @param overwrite - If not set `true`, using a key that is already in the
       *   collection will throw. Otherwise, overwrites the previous value.
       */
      add(pair, overwrite) {
        let _pair;
        if (identity.isPair(pair))
          _pair = pair;
        else if (!pair || typeof pair !== "object" || !("key" in pair)) {
          _pair = new Pair.Pair(pair, pair?.value);
        } else
          _pair = new Pair.Pair(pair.key, pair.value);
        const prev = findPair(this.items, _pair.key);
        const sortEntries = this.schema?.sortMapEntries;
        if (prev) {
          if (!overwrite)
            throw new Error(`Key ${_pair.key} already set`);
          if (identity.isScalar(prev.value) && Scalar.isScalarValue(_pair.value))
            prev.value.value = _pair.value;
          else
            prev.value = _pair.value;
        } else if (sortEntries) {
          const i2 = this.items.findIndex((item) => sortEntries(_pair, item) < 0);
          if (i2 === -1)
            this.items.push(_pair);
          else
            this.items.splice(i2, 0, _pair);
        } else {
          this.items.push(_pair);
        }
      }
      delete(key) {
        const it = findPair(this.items, key);
        if (!it)
          return false;
        const del = this.items.splice(this.items.indexOf(it), 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const it = findPair(this.items, key);
        const node = it?.value;
        return (!keepScalar && identity.isScalar(node) ? node.value : node) ?? void 0;
      }
      has(key) {
        return !!findPair(this.items, key);
      }
      set(key, value) {
        this.add(new Pair.Pair(key, value), true);
      }
      /**
       * @param ctx - Conversion context, originally set in Document#toJS()
       * @param {Class} Type - If set, forces the returned collection type
       * @returns Instance of Type, Map, or Object
       */
      toJSON(_, ctx, Type) {
        const map = Type ? new Type() : ctx?.mapAsMap ? /* @__PURE__ */ new Map() : {};
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const item of this.items)
          addPairToJSMap.addPairToJSMap(ctx, map, item);
        return map;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        for (const item of this.items) {
          if (!identity.isPair(item))
            throw new Error(`Map items must all be pairs; found ${JSON.stringify(item)} instead`);
        }
        if (!ctx.allNullValues && this.hasAllNullValues(false))
          ctx = Object.assign({}, ctx, { allNullValues: true });
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "",
          flowChars: { start: "{", end: "}" },
          itemIndent: ctx.indent || "",
          onChompKeep,
          onComment
        });
      }
    };
    exports.YAMLMap = YAMLMap;
    exports.findPair = findPair;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/map.js
var require_map = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/map.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLMap = require_YAMLMap();
    var map = {
      collection: "map",
      default: true,
      nodeClass: YAMLMap.YAMLMap,
      tag: "tag:yaml.org,2002:map",
      resolve(map2, onError) {
        if (!identity.isMap(map2))
          onError("Expected a mapping for this tag");
        return map2;
      },
      createNode: (schema, obj, ctx) => YAMLMap.YAMLMap.from(schema, obj, ctx)
    };
    exports.map = map;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLSeq.js
var require_YAMLSeq = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/nodes/YAMLSeq.js"(exports) {
    "use strict";
    var createNode = require_createNode();
    var stringifyCollection = require_stringifyCollection();
    var Collection = require_Collection();
    var identity = require_identity();
    var Scalar = require_Scalar();
    var toJS = require_toJS();
    var YAMLSeq = class extends Collection.Collection {
      static get tagName() {
        return "tag:yaml.org,2002:seq";
      }
      constructor(schema) {
        super(identity.SEQ, schema);
        this.items = [];
      }
      add(value) {
        this.items.push(value);
      }
      /**
       * Removes a value from the collection.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       *
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return false;
        const del = this.items.splice(idx, 1);
        return del.length > 0;
      }
      get(key, keepScalar) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          return void 0;
        const it = this.items[idx];
        return !keepScalar && identity.isScalar(it) ? it.value : it;
      }
      /**
       * Checks if the collection includes a value with the key `key`.
       *
       * `key` must contain a representation of an integer for this to succeed.
       * It may be wrapped in a `Scalar`.
       */
      has(key) {
        const idx = asItemIndex(key);
        return typeof idx === "number" && idx < this.items.length;
      }
      /**
       * Sets a value in this collection. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       *
       * If `key` does not contain a representation of an integer, this will throw.
       * It may be wrapped in a `Scalar`.
       */
      set(key, value) {
        const idx = asItemIndex(key);
        if (typeof idx !== "number")
          throw new Error(`Expected a valid index, not ${key}.`);
        const prev = this.items[idx];
        if (identity.isScalar(prev) && Scalar.isScalarValue(value))
          prev.value = value;
        else
          this.items[idx] = value;
      }
      toJSON(_, ctx) {
        const seq = [];
        if (ctx?.onCreate)
          ctx.onCreate(seq);
        let i2 = 0;
        for (const item of this.items)
          seq.push(toJS.toJS(item, String(i2++), ctx));
        return seq;
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        return stringifyCollection.stringifyCollection(this, ctx, {
          blockItemPrefix: "- ",
          flowChars: { start: "[", end: "]" },
          itemIndent: (ctx.indent || "") + "  ",
          onChompKeep,
          onComment
        });
      }
      static from(schema, obj, ctx) {
        const { replacer } = ctx;
        const seq = new this(schema);
        if (obj && Symbol.iterator in Object(obj)) {
          let i2 = 0;
          for (let it of obj) {
            if (typeof replacer === "function") {
              const key = obj instanceof Set ? it : String(i2++);
              it = replacer.call(obj, key, it);
            }
            seq.items.push(createNode.createNode(it, void 0, ctx));
          }
        }
        return seq;
      }
    };
    function asItemIndex(key) {
      let idx = identity.isScalar(key) ? key.value : key;
      if (idx && typeof idx === "string")
        idx = Number(idx);
      return typeof idx === "number" && Number.isInteger(idx) && idx >= 0 ? idx : null;
    }
    exports.YAMLSeq = YAMLSeq;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/seq.js
var require_seq = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/seq.js"(exports) {
    "use strict";
    var identity = require_identity();
    var YAMLSeq = require_YAMLSeq();
    var seq = {
      collection: "seq",
      default: true,
      nodeClass: YAMLSeq.YAMLSeq,
      tag: "tag:yaml.org,2002:seq",
      resolve(seq2, onError) {
        if (!identity.isSeq(seq2))
          onError("Expected a sequence for this tag");
        return seq2;
      },
      createNode: (schema, obj, ctx) => YAMLSeq.YAMLSeq.from(schema, obj, ctx)
    };
    exports.seq = seq;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/string.js
var require_string = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/string.js"(exports) {
    "use strict";
    var stringifyString = require_stringifyString();
    var string = {
      identify: (value) => typeof value === "string",
      default: true,
      tag: "tag:yaml.org,2002:str",
      resolve: (str) => str,
      stringify(item, ctx, onComment, onChompKeep) {
        ctx = Object.assign({ actualString: true }, ctx);
        return stringifyString.stringifyString(item, ctx, onComment, onChompKeep);
      }
    };
    exports.string = string;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/null.js
var require_null = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/common/null.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var nullTag = {
      identify: (value) => value == null,
      createNode: () => new Scalar.Scalar(null),
      default: true,
      tag: "tag:yaml.org,2002:null",
      test: /^(?:~|[Nn]ull|NULL)?$/,
      resolve: () => new Scalar.Scalar(null),
      stringify: ({ source }, ctx) => typeof source === "string" && nullTag.test.test(source) ? source : ctx.options.nullStr
    };
    exports.nullTag = nullTag;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/bool.js
var require_bool = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var boolTag = {
      identify: (value) => typeof value === "boolean",
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,
      resolve: (str) => new Scalar.Scalar(str[0] === "t" || str[0] === "T"),
      stringify({ source, value }, ctx) {
        if (source && boolTag.test.test(source)) {
          const sv = source[0] === "t" || source[0] === "T";
          if (value === sv)
            return source;
        }
        return value ? ctx.options.trueStr : ctx.options.falseStr;
      }
    };
    exports.boolTag = boolTag;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyNumber.js
var require_stringifyNumber = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyNumber.js"(exports) {
    "use strict";
    function stringifyNumber({ format, minFractionDigits, tag, value }) {
      if (typeof value === "bigint")
        return String(value);
      const num3 = typeof value === "number" ? value : Number(value);
      if (!isFinite(num3))
        return isNaN(num3) ? ".nan" : num3 < 0 ? "-.inf" : ".inf";
      let n = Object.is(value, -0) ? "-0" : JSON.stringify(value);
      if (!format && minFractionDigits && (!tag || tag === "tag:yaml.org,2002:float") && /^-?\d/.test(n) && !n.includes("e")) {
        let i2 = n.indexOf(".");
        if (i2 < 0) {
          i2 = n.length;
          n += ".";
        }
        let d = minFractionDigits - (n.length - i2 - 1);
        while (d-- > 0)
          n += "0";
      }
      return n;
    }
    exports.stringifyNumber = stringifyNumber;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/float.js
var require_float = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str),
      stringify(node) {
        const num3 = Number(node.value);
        return isFinite(num3) ? num3.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str));
        const dot = str.indexOf(".");
        if (dot !== -1 && str[str.length - 1] === "0")
          node.minFractionDigits = str.length - dot - 1;
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/int.js
var require_int = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    var intResolve = (str, offset, radix, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str.substring(offset), radix);
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value) && value >= 0)
        return prefix + value.toString(radix);
      return stringifyNumber.stringifyNumber(node);
    }
    var intOct = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^0o[0-7]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 8, opt),
      stringify: (node) => intStringify(node, 8, "0o")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: (value) => intIdentify(value) && value >= 0,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^0x[0-9a-fA-F]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/schema.js
var require_schema = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/core/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.boolTag,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float
    ];
    exports.schema = schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/json/schema.js
var require_schema2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/json/schema.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var map = require_map();
    var seq = require_seq();
    function intIdentify(value) {
      return typeof value === "bigint" || Number.isInteger(value);
    }
    var stringifyJSON = ({ value }) => JSON.stringify(value);
    var jsonScalars = [
      {
        identify: (value) => typeof value === "string",
        default: true,
        tag: "tag:yaml.org,2002:str",
        resolve: (str) => str,
        stringify: stringifyJSON
      },
      {
        identify: (value) => value == null,
        createNode: () => new Scalar.Scalar(null),
        default: true,
        tag: "tag:yaml.org,2002:null",
        test: /^null$/,
        resolve: () => null,
        stringify: stringifyJSON
      },
      {
        identify: (value) => typeof value === "boolean",
        default: true,
        tag: "tag:yaml.org,2002:bool",
        test: /^true$|^false$/,
        resolve: (str) => str === "true",
        stringify: stringifyJSON
      },
      {
        identify: intIdentify,
        default: true,
        tag: "tag:yaml.org,2002:int",
        test: /^-?(?:0|[1-9][0-9]*)$/,
        resolve: (str, _onError, { intAsBigInt }) => intAsBigInt ? BigInt(str) : parseInt(str, 10),
        stringify: ({ value }) => intIdentify(value) ? value.toString() : JSON.stringify(value)
      },
      {
        identify: (value) => typeof value === "number",
        default: true,
        tag: "tag:yaml.org,2002:float",
        test: /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,
        resolve: (str) => parseFloat(str),
        stringify: stringifyJSON
      }
    ];
    var jsonError = {
      default: true,
      tag: "",
      test: /^/,
      resolve(str, onError) {
        onError(`Unresolved plain scalar ${JSON.stringify(str)}`);
        return str;
      }
    };
    var schema = [map.map, seq.seq].concat(jsonScalars, jsonError);
    exports.schema = schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/binary.js
var require_binary = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/binary.js"(exports) {
    "use strict";
    var node_buffer = __require("buffer");
    var Scalar = require_Scalar();
    var stringifyString = require_stringifyString();
    var binary2 = {
      identify: (value) => value instanceof Uint8Array,
      // Buffer inherits from Uint8Array
      default: false,
      tag: "tag:yaml.org,2002:binary",
      /**
       * Returns a Buffer in node and an Uint8Array in browsers
       *
       * To use the resulting buffer as an image, you'll want to do something like:
       *
       *   const blob = new Blob([buffer], { type: 'image/jpeg' })
       *   document.querySelector('#photo').src = URL.createObjectURL(blob)
       */
      resolve(src, onError) {
        if (typeof node_buffer.Buffer === "function") {
          return node_buffer.Buffer.from(src, "base64");
        } else if (typeof atob === "function") {
          const str = atob(src.replace(/[\n\r]/g, ""));
          const buffer = new Uint8Array(str.length);
          for (let i2 = 0; i2 < str.length; ++i2)
            buffer[i2] = str.charCodeAt(i2);
          return buffer;
        } else {
          onError("This environment does not support reading binary tags; either Buffer or atob is required");
          return src;
        }
      },
      stringify({ comment, type, value }, ctx, onComment, onChompKeep) {
        if (!value)
          return "";
        const buf = value;
        let str;
        if (typeof node_buffer.Buffer === "function") {
          str = buf instanceof node_buffer.Buffer ? buf.toString("base64") : node_buffer.Buffer.from(buf.buffer).toString("base64");
        } else if (typeof btoa === "function") {
          let s = "";
          for (let i2 = 0; i2 < buf.length; ++i2)
            s += String.fromCharCode(buf[i2]);
          str = btoa(s);
        } else {
          throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");
        }
        type ?? (type = Scalar.Scalar.BLOCK_LITERAL);
        if (type !== Scalar.Scalar.QUOTE_DOUBLE) {
          const lineWidth = Math.max(ctx.options.lineWidth - ctx.indent.length, ctx.options.minContentWidth);
          const n = Math.ceil(str.length / lineWidth);
          const lines4 = new Array(n);
          for (let i2 = 0, o = 0; i2 < n; ++i2, o += lineWidth) {
            lines4[i2] = str.substr(o, lineWidth);
          }
          str = lines4.join(type === Scalar.Scalar.BLOCK_LITERAL ? "\n" : " ");
        }
        return stringifyString.stringifyString({ comment, type, value: str }, ctx, onComment, onChompKeep);
      }
    };
    exports.binary = binary2;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/pairs.js
var require_pairs = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/pairs.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLSeq = require_YAMLSeq();
    function resolvePairs(seq, onError) {
      if (identity.isSeq(seq)) {
        for (let i2 = 0; i2 < seq.items.length; ++i2) {
          let item = seq.items[i2];
          if (identity.isPair(item))
            continue;
          else if (identity.isMap(item)) {
            if (item.items.length > 1)
              onError("Each pair must have its own sequence indicator");
            const pair = item.items[0] || new Pair.Pair(new Scalar.Scalar(null));
            if (item.commentBefore)
              pair.key.commentBefore = pair.key.commentBefore ? `${item.commentBefore}
${pair.key.commentBefore}` : item.commentBefore;
            if (item.comment) {
              const cn = pair.value ?? pair.key;
              cn.comment = cn.comment ? `${item.comment}
${cn.comment}` : item.comment;
            }
            item = pair;
          }
          seq.items[i2] = identity.isPair(item) ? item : new Pair.Pair(item);
        }
      } else
        onError("Expected a sequence for this tag");
      return seq;
    }
    function createPairs(schema, iterable, ctx) {
      const { replacer } = ctx;
      const pairs2 = new YAMLSeq.YAMLSeq(schema);
      pairs2.tag = "tag:yaml.org,2002:pairs";
      let i2 = 0;
      if (iterable && Symbol.iterator in Object(iterable))
        for (let it of iterable) {
          if (typeof replacer === "function")
            it = replacer.call(iterable, String(i2++), it);
          let key, value;
          if (Array.isArray(it)) {
            if (it.length === 2) {
              key = it[0];
              value = it[1];
            } else
              throw new TypeError(`Expected [key, value] tuple: ${it}`);
          } else if (it && it instanceof Object) {
            const keys = Object.keys(it);
            if (keys.length === 1) {
              key = keys[0];
              value = it[key];
            } else {
              throw new TypeError(`Expected tuple with one key, not ${keys.length} keys`);
            }
          } else {
            key = it;
          }
          pairs2.items.push(Pair.createPair(key, value, ctx));
        }
      return pairs2;
    }
    var pairs = {
      collection: "seq",
      default: false,
      tag: "tag:yaml.org,2002:pairs",
      resolve: resolvePairs,
      createNode: createPairs
    };
    exports.createPairs = createPairs;
    exports.pairs = pairs;
    exports.resolvePairs = resolvePairs;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/omap.js
var require_omap = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/omap.js"(exports) {
    "use strict";
    var identity = require_identity();
    var toJS = require_toJS();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var pairs = require_pairs();
    var YAMLOMap = class _YAMLOMap extends YAMLSeq.YAMLSeq {
      constructor() {
        super();
        this.add = YAMLMap.YAMLMap.prototype.add.bind(this);
        this.delete = YAMLMap.YAMLMap.prototype.delete.bind(this);
        this.get = YAMLMap.YAMLMap.prototype.get.bind(this);
        this.has = YAMLMap.YAMLMap.prototype.has.bind(this);
        this.set = YAMLMap.YAMLMap.prototype.set.bind(this);
        this.tag = _YAMLOMap.tag;
      }
      /**
       * If `ctx` is given, the return type is actually `Map<unknown, unknown>`,
       * but TypeScript won't allow widening the signature of a child method.
       */
      toJSON(_, ctx) {
        if (!ctx)
          return super.toJSON(_);
        const map = /* @__PURE__ */ new Map();
        if (ctx?.onCreate)
          ctx.onCreate(map);
        for (const pair of this.items) {
          let key, value;
          if (identity.isPair(pair)) {
            key = toJS.toJS(pair.key, "", ctx);
            value = toJS.toJS(pair.value, key, ctx);
          } else {
            key = toJS.toJS(pair, "", ctx);
          }
          if (map.has(key))
            throw new Error("Ordered maps must not include duplicate keys");
          map.set(key, value);
        }
        return map;
      }
      static from(schema, iterable, ctx) {
        const pairs$1 = pairs.createPairs(schema, iterable, ctx);
        const omap2 = new this();
        omap2.items = pairs$1.items;
        return omap2;
      }
    };
    YAMLOMap.tag = "tag:yaml.org,2002:omap";
    var omap = {
      collection: "seq",
      identify: (value) => value instanceof Map,
      nodeClass: YAMLOMap,
      default: false,
      tag: "tag:yaml.org,2002:omap",
      resolve(seq, onError) {
        const pairs$1 = pairs.resolvePairs(seq, onError);
        const seenKeys = [];
        for (const { key } of pairs$1.items) {
          if (identity.isScalar(key)) {
            if (seenKeys.includes(key.value)) {
              onError(`Ordered maps must not include duplicate keys: ${key.value}`);
            } else {
              seenKeys.push(key.value);
            }
          }
        }
        return Object.assign(new YAMLOMap(), pairs$1);
      },
      createNode: (schema, iterable, ctx) => YAMLOMap.from(schema, iterable, ctx)
    };
    exports.YAMLOMap = YAMLOMap;
    exports.omap = omap;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/bool.js
var require_bool2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/bool.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function boolStringify({ value, source }, ctx) {
      const boolObj = value ? trueTag : falseTag;
      if (source && boolObj.test.test(source))
        return source;
      return value ? ctx.options.trueStr : ctx.options.falseStr;
    }
    var trueTag = {
      identify: (value) => value === true,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,
      resolve: () => new Scalar.Scalar(true),
      stringify: boolStringify
    };
    var falseTag = {
      identify: (value) => value === false,
      default: true,
      tag: "tag:yaml.org,2002:bool",
      test: /^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,
      resolve: () => new Scalar.Scalar(false),
      stringify: boolStringify
    };
    exports.falseTag = falseTag;
    exports.trueTag = trueTag;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/float.js
var require_float2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/float.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var stringifyNumber = require_stringifyNumber();
    var floatNaN = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,
      resolve: (str) => str.slice(-3).toLowerCase() === "nan" ? NaN : str[0] === "-" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY,
      stringify: stringifyNumber.stringifyNumber
    };
    var floatExp = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "EXP",
      test: /^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,
      resolve: (str) => parseFloat(str.replace(/_/g, "")),
      stringify(node) {
        const num3 = Number(node.value);
        return isFinite(num3) ? num3.toExponential() : stringifyNumber.stringifyNumber(node);
      }
    };
    var float = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      test: /^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,
      resolve(str) {
        const node = new Scalar.Scalar(parseFloat(str.replace(/_/g, "")));
        const dot = str.indexOf(".");
        if (dot !== -1) {
          const f = str.substring(dot + 1).replace(/_/g, "");
          if (f[f.length - 1] === "0")
            node.minFractionDigits = f.length;
        }
        return node;
      },
      stringify: stringifyNumber.stringifyNumber
    };
    exports.float = float;
    exports.floatExp = floatExp;
    exports.floatNaN = floatNaN;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/int.js
var require_int2 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/int.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    var intIdentify = (value) => typeof value === "bigint" || Number.isInteger(value);
    function intResolve(str, offset, radix, { intAsBigInt }) {
      const sign = str[0];
      if (sign === "-" || sign === "+")
        offset += 1;
      str = str.substring(offset).replace(/_/g, "");
      if (intAsBigInt) {
        switch (radix) {
          case 2:
            str = `0b${str}`;
            break;
          case 8:
            str = `0o${str}`;
            break;
          case 16:
            str = `0x${str}`;
            break;
        }
        const n2 = BigInt(str);
        return sign === "-" ? BigInt(-1) * n2 : n2;
      }
      const n = parseInt(str, radix);
      return sign === "-" ? -1 * n : n;
    }
    function intStringify(node, radix, prefix) {
      const { value } = node;
      if (intIdentify(value)) {
        const str = value.toString(radix);
        return value < 0 ? "-" + prefix + str.substr(1) : prefix + str;
      }
      return stringifyNumber.stringifyNumber(node);
    }
    var intBin = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "BIN",
      test: /^[-+]?0b[0-1_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 2, opt),
      stringify: (node) => intStringify(node, 2, "0b")
    };
    var intOct = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "OCT",
      test: /^[-+]?0[0-7_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 1, 8, opt),
      stringify: (node) => intStringify(node, 8, "0")
    };
    var int = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      test: /^[-+]?[0-9][0-9_]*$/,
      resolve: (str, _onError, opt) => intResolve(str, 0, 10, opt),
      stringify: stringifyNumber.stringifyNumber
    };
    var intHex = {
      identify: intIdentify,
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "HEX",
      test: /^[-+]?0x[0-9a-fA-F_]+$/,
      resolve: (str, _onError, opt) => intResolve(str, 2, 16, opt),
      stringify: (node) => intStringify(node, 16, "0x")
    };
    exports.int = int;
    exports.intBin = intBin;
    exports.intHex = intHex;
    exports.intOct = intOct;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/set.js
var require_set = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/set.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSet = class _YAMLSet extends YAMLMap.YAMLMap {
      constructor(schema) {
        super(schema);
        this.tag = _YAMLSet.tag;
      }
      add(key) {
        let pair;
        if (identity.isPair(key))
          pair = key;
        else if (key && typeof key === "object" && "key" in key && "value" in key && key.value === null)
          pair = new Pair.Pair(key.key, null);
        else
          pair = new Pair.Pair(key, null);
        const prev = YAMLMap.findPair(this.items, pair.key);
        if (!prev)
          this.items.push(pair);
      }
      /**
       * If `keepPair` is `true`, returns the Pair matching `key`.
       * Otherwise, returns the value of that Pair's key.
       */
      get(key, keepPair) {
        const pair = YAMLMap.findPair(this.items, key);
        return !keepPair && identity.isPair(pair) ? identity.isScalar(pair.key) ? pair.key.value : pair.key : pair;
      }
      set(key, value) {
        if (typeof value !== "boolean")
          throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof value}`);
        const prev = YAMLMap.findPair(this.items, key);
        if (prev && !value) {
          this.items.splice(this.items.indexOf(prev), 1);
        } else if (!prev && value) {
          this.items.push(new Pair.Pair(key));
        }
      }
      toJSON(_, ctx) {
        return super.toJSON(_, ctx, Set);
      }
      toString(ctx, onComment, onChompKeep) {
        if (!ctx)
          return JSON.stringify(this);
        if (this.hasAllNullValues(true))
          return super.toString(Object.assign({}, ctx, { allNullValues: true }), onComment, onChompKeep);
        else
          throw new Error("Set items must all have null values");
      }
      static from(schema, iterable, ctx) {
        const { replacer } = ctx;
        const set2 = new this(schema);
        if (iterable && Symbol.iterator in Object(iterable))
          for (let value of iterable) {
            if (typeof replacer === "function")
              value = replacer.call(iterable, value, value);
            set2.items.push(Pair.createPair(value, null, ctx));
          }
        return set2;
      }
    };
    YAMLSet.tag = "tag:yaml.org,2002:set";
    var set = {
      collection: "map",
      identify: (value) => value instanceof Set,
      nodeClass: YAMLSet,
      default: false,
      tag: "tag:yaml.org,2002:set",
      createNode: (schema, iterable, ctx) => YAMLSet.from(schema, iterable, ctx),
      resolve(map, onError) {
        if (identity.isMap(map)) {
          if (map.hasAllNullValues(true))
            return Object.assign(new YAMLSet(), map);
          else
            onError("Set items must all have null values");
        } else
          onError("Expected a mapping for this tag");
        return map;
      }
    };
    exports.YAMLSet = YAMLSet;
    exports.set = set;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js
var require_timestamp = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/timestamp.js"(exports) {
    "use strict";
    var stringifyNumber = require_stringifyNumber();
    function parseSexagesimal(str, asBigInt) {
      const sign = str[0];
      const parts2 = sign === "-" || sign === "+" ? str.substring(1) : str;
      const num3 = (n) => asBigInt ? BigInt(n) : Number(n);
      const res = parts2.replace(/_/g, "").split(":").reduce((res2, p) => res2 * num3(60) + num3(p), num3(0));
      return sign === "-" ? num3(-1) * res : res;
    }
    function stringifySexagesimal(node) {
      let { value } = node;
      let num3 = (n) => n;
      if (typeof value === "bigint")
        num3 = (n) => BigInt(n);
      else if (isNaN(value) || !isFinite(value))
        return stringifyNumber.stringifyNumber(node);
      let sign = "";
      if (value < 0) {
        sign = "-";
        value *= num3(-1);
      }
      const _60 = num3(60);
      const parts2 = [value % _60];
      if (value < 60) {
        parts2.unshift(0);
      } else {
        value = (value - parts2[0]) / _60;
        parts2.unshift(value % _60);
        if (value >= 60) {
          value = (value - parts2[0]) / _60;
          parts2.unshift(value);
        }
      }
      return sign + parts2.map((n) => String(n).padStart(2, "0")).join(":").replace(/000000\d*$/, "");
    }
    var intTime = {
      identify: (value) => typeof value === "bigint" || Number.isInteger(value),
      default: true,
      tag: "tag:yaml.org,2002:int",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,
      resolve: (str, _onError, { intAsBigInt }) => parseSexagesimal(str, intAsBigInt),
      stringify: stringifySexagesimal
    };
    var floatTime = {
      identify: (value) => typeof value === "number",
      default: true,
      tag: "tag:yaml.org,2002:float",
      format: "TIME",
      test: /^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,
      resolve: (str) => parseSexagesimal(str, false),
      stringify: stringifySexagesimal
    };
    var timestamp = {
      identify: (value) => value instanceof Date,
      default: true,
      tag: "tag:yaml.org,2002:timestamp",
      // If the time zone is omitted, the timestamp is assumed to be specified in UTC. The time part
      // may be omitted altogether, resulting in a date format. In such a case, the time part is
      // assumed to be 00:00:00Z (start of day, UTC).
      test: RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),
      resolve(str) {
        const match = str.match(timestamp.test);
        if (!match)
          throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");
        const [, year, month, day, hour, minute, second] = match.map(Number);
        const millisec = match[7] ? Number((match[7] + "00").substr(1, 3)) : 0;
        let date = Date.UTC(year, month - 1, day, hour || 0, minute || 0, second || 0, millisec);
        const tz = match[8];
        if (tz && tz !== "Z") {
          let d = parseSexagesimal(tz, false);
          if (Math.abs(d) < 30)
            d *= 60;
          date -= 6e4 * d;
        }
        return new Date(date);
      },
      stringify: ({ value }) => value?.toISOString().replace(/(T00:00:00)?\.000Z$/, "") ?? ""
    };
    exports.floatTime = floatTime;
    exports.intTime = intTime;
    exports.timestamp = timestamp;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/schema.js
var require_schema3 = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/yaml-1.1/schema.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var binary2 = require_binary();
    var bool = require_bool2();
    var float = require_float2();
    var int = require_int2();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var set = require_set();
    var timestamp = require_timestamp();
    var schema = [
      map.map,
      seq.seq,
      string.string,
      _null.nullTag,
      bool.trueTag,
      bool.falseTag,
      int.intBin,
      int.intOct,
      int.int,
      int.intHex,
      float.floatNaN,
      float.floatExp,
      float.float,
      binary2.binary,
      merge.merge,
      omap.omap,
      pairs.pairs,
      set.set,
      timestamp.intTime,
      timestamp.floatTime,
      timestamp.timestamp
    ];
    exports.schema = schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/tags.js
var require_tags = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/tags.js"(exports) {
    "use strict";
    var map = require_map();
    var _null = require_null();
    var seq = require_seq();
    var string = require_string();
    var bool = require_bool();
    var float = require_float();
    var int = require_int();
    var schema = require_schema();
    var schema$1 = require_schema2();
    var binary2 = require_binary();
    var merge = require_merge();
    var omap = require_omap();
    var pairs = require_pairs();
    var schema$2 = require_schema3();
    var set = require_set();
    var timestamp = require_timestamp();
    var schemas = /* @__PURE__ */ new Map([
      ["core", schema.schema],
      ["failsafe", [map.map, seq.seq, string.string]],
      ["json", schema$1.schema],
      ["yaml11", schema$2.schema],
      ["yaml-1.1", schema$2.schema]
    ]);
    var tagsByName = {
      binary: binary2.binary,
      bool: bool.boolTag,
      float: float.float,
      floatExp: float.floatExp,
      floatNaN: float.floatNaN,
      floatTime: timestamp.floatTime,
      int: int.int,
      intHex: int.intHex,
      intOct: int.intOct,
      intTime: timestamp.intTime,
      map: map.map,
      merge: merge.merge,
      null: _null.nullTag,
      omap: omap.omap,
      pairs: pairs.pairs,
      seq: seq.seq,
      set: set.set,
      timestamp: timestamp.timestamp
    };
    var coreKnownTags = {
      "tag:yaml.org,2002:binary": binary2.binary,
      "tag:yaml.org,2002:merge": merge.merge,
      "tag:yaml.org,2002:omap": omap.omap,
      "tag:yaml.org,2002:pairs": pairs.pairs,
      "tag:yaml.org,2002:set": set.set,
      "tag:yaml.org,2002:timestamp": timestamp.timestamp
    };
    function getTags(customTags, schemaName, addMergeTag) {
      const schemaTags = schemas.get(schemaName);
      if (schemaTags && !customTags) {
        return addMergeTag && !schemaTags.includes(merge.merge) ? schemaTags.concat(merge.merge) : schemaTags.slice();
      }
      let tags = schemaTags;
      if (!tags) {
        if (Array.isArray(customTags))
          tags = [];
        else {
          const keys = Array.from(schemas.keys()).filter((key) => key !== "yaml11").map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown schema "${schemaName}"; use one of ${keys} or define customTags array`);
        }
      }
      if (Array.isArray(customTags)) {
        for (const tag of customTags)
          tags = tags.concat(tag);
      } else if (typeof customTags === "function") {
        tags = customTags(tags.slice());
      }
      if (addMergeTag)
        tags = tags.concat(merge.merge);
      return tags.reduce((tags2, tag) => {
        const tagObj = typeof tag === "string" ? tagsByName[tag] : tag;
        if (!tagObj) {
          const tagName = JSON.stringify(tag);
          const keys = Object.keys(tagsByName).map((key) => JSON.stringify(key)).join(", ");
          throw new Error(`Unknown custom tag ${tagName}; use one of ${keys}`);
        }
        if (!tags2.includes(tagObj))
          tags2.push(tagObj);
        return tags2;
      }, []);
    }
    exports.coreKnownTags = coreKnownTags;
    exports.getTags = getTags;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/Schema.js
var require_Schema = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/schema/Schema.js"(exports) {
    "use strict";
    var identity = require_identity();
    var map = require_map();
    var seq = require_seq();
    var string = require_string();
    var tags = require_tags();
    var sortMapEntriesByKey = (a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
    var Schema = class _Schema {
      constructor({ compat, customTags, merge, resolveKnownTags, schema, sortMapEntries, toStringDefaults }) {
        this.compat = Array.isArray(compat) ? tags.getTags(compat, "compat") : compat ? tags.getTags(null, compat) : null;
        this.name = typeof schema === "string" && schema || "core";
        this.knownTags = resolveKnownTags ? tags.coreKnownTags : {};
        this.tags = tags.getTags(customTags, this.name, merge);
        this.toStringOptions = toStringDefaults ?? null;
        Object.defineProperty(this, identity.MAP, { value: map.map });
        Object.defineProperty(this, identity.SCALAR, { value: string.string });
        Object.defineProperty(this, identity.SEQ, { value: seq.seq });
        this.sortMapEntries = typeof sortMapEntries === "function" ? sortMapEntries : sortMapEntries === true ? sortMapEntriesByKey : null;
      }
      clone() {
        const copy = Object.create(_Schema.prototype, Object.getOwnPropertyDescriptors(this));
        copy.tags = this.tags.slice();
        return copy;
      }
    };
    exports.Schema = Schema;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyDocument.js
var require_stringifyDocument = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/stringify/stringifyDocument.js"(exports) {
    "use strict";
    var identity = require_identity();
    var stringify = require_stringify();
    var stringifyComment = require_stringifyComment();
    function stringifyDocument(doc, options) {
      const lines4 = [];
      let hasDirectives = options.directives === true;
      if (options.directives !== false && doc.directives) {
        const dir = doc.directives.toString(doc);
        if (dir) {
          lines4.push(dir);
          hasDirectives = true;
        } else if (doc.directives.docStart)
          hasDirectives = true;
      }
      if (hasDirectives)
        lines4.push("---");
      const ctx = stringify.createStringifyContext(doc, options);
      const { commentString } = ctx.options;
      if (doc.commentBefore) {
        if (lines4.length !== 1)
          lines4.unshift("");
        const cs = commentString(doc.commentBefore);
        lines4.unshift(stringifyComment.indentComment(cs, ""));
      }
      let chompKeep = false;
      let contentComment = null;
      if (doc.contents) {
        if (identity.isNode(doc.contents)) {
          if (doc.contents.spaceBefore && hasDirectives)
            lines4.push("");
          if (doc.contents.commentBefore) {
            const cs = commentString(doc.contents.commentBefore);
            lines4.push(stringifyComment.indentComment(cs, ""));
          }
          ctx.forceBlockIndent = !!doc.comment;
          contentComment = doc.contents.comment;
        }
        const onChompKeep = contentComment ? void 0 : () => chompKeep = true;
        let body2 = stringify.stringify(doc.contents, ctx, () => contentComment = null, onChompKeep);
        if (contentComment)
          body2 += stringifyComment.lineComment(body2, "", commentString(contentComment));
        if ((body2[0] === "|" || body2[0] === ">") && lines4[lines4.length - 1] === "---") {
          lines4[lines4.length - 1] = `--- ${body2}`;
        } else
          lines4.push(body2);
      } else {
        lines4.push(stringify.stringify(doc.contents, ctx));
      }
      if (doc.directives?.docEnd) {
        if (doc.comment) {
          const cs = commentString(doc.comment);
          if (cs.includes("\n")) {
            lines4.push("...");
            lines4.push(stringifyComment.indentComment(cs, ""));
          } else {
            lines4.push(`... ${cs}`);
          }
        } else {
          lines4.push("...");
        }
      } else {
        let dc = doc.comment;
        if (dc && chompKeep)
          dc = dc.replace(/^\n+/, "");
        if (dc) {
          if ((!chompKeep || contentComment) && lines4[lines4.length - 1] !== "")
            lines4.push("");
          lines4.push(stringifyComment.indentComment(commentString(dc), ""));
        }
      }
      return lines4.join("\n") + "\n";
    }
    exports.stringifyDocument = stringifyDocument;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/Document.js
var require_Document = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/doc/Document.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var Collection = require_Collection();
    var identity = require_identity();
    var Pair = require_Pair();
    var toJS = require_toJS();
    var Schema = require_Schema();
    var stringifyDocument = require_stringifyDocument();
    var anchors = require_anchors();
    var applyReviver = require_applyReviver();
    var createNode = require_createNode();
    var directives = require_directives();
    var Document = class _Document {
      constructor(value, replacer, options) {
        this.commentBefore = null;
        this.comment = null;
        this.errors = [];
        this.warnings = [];
        Object.defineProperty(this, identity.NODE_TYPE, { value: identity.DOC });
        let _replacer = null;
        if (typeof replacer === "function" || Array.isArray(replacer)) {
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const opt = Object.assign({
          intAsBigInt: false,
          keepSourceTokens: false,
          logLevel: "warn",
          prettyErrors: true,
          strict: true,
          stringKeys: false,
          uniqueKeys: true,
          version: "1.2"
        }, options);
        this.options = opt;
        let { version } = opt;
        if (options?._directives) {
          this.directives = options._directives.atDocument();
          if (this.directives.yaml.explicit)
            version = this.directives.yaml.version;
        } else
          this.directives = new directives.Directives({ version });
        this.setSchema(version, options);
        this.contents = value === void 0 ? null : this.createNode(value, _replacer, options);
      }
      /**
       * Create a deep copy of this Document and its contents.
       *
       * Custom Node values that inherit from `Object` still refer to their original instances.
       */
      clone() {
        const copy = Object.create(_Document.prototype, {
          [identity.NODE_TYPE]: { value: identity.DOC }
        });
        copy.commentBefore = this.commentBefore;
        copy.comment = this.comment;
        copy.errors = this.errors.slice();
        copy.warnings = this.warnings.slice();
        copy.options = Object.assign({}, this.options);
        if (this.directives)
          copy.directives = this.directives.clone();
        copy.schema = this.schema.clone();
        copy.contents = identity.isNode(this.contents) ? this.contents.clone(copy.schema) : this.contents;
        if (this.range)
          copy.range = this.range.slice();
        return copy;
      }
      /** Adds a value to the document. */
      add(value) {
        if (assertCollection(this.contents))
          this.contents.add(value);
      }
      /** Adds a value to the document. */
      addIn(path, value) {
        if (assertCollection(this.contents))
          this.contents.addIn(path, value);
      }
      /**
       * Create a new `Alias` node, ensuring that the target `node` has the required anchor.
       *
       * If `node` already has an anchor, `name` is ignored.
       * Otherwise, the `node.anchor` value will be set to `name`,
       * or if an anchor with that name is already present in the document,
       * `name` will be used as a prefix for a new unique anchor.
       * If `name` is undefined, the generated anchor will use 'a' as a prefix.
       */
      createAlias(node, name2) {
        if (!node.anchor) {
          const prev = anchors.anchorNames(this);
          node.anchor = // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !name2 || prev.has(name2) ? anchors.findNewAnchor(name2 || "a", prev) : name2;
        }
        return new Alias.Alias(node.anchor);
      }
      createNode(value, replacer, options) {
        let _replacer = void 0;
        if (typeof replacer === "function") {
          value = replacer.call({ "": value }, "", value);
          _replacer = replacer;
        } else if (Array.isArray(replacer)) {
          const keyToStr = (v) => typeof v === "number" || v instanceof String || v instanceof Number;
          const asStr = replacer.filter(keyToStr).map(String);
          if (asStr.length > 0)
            replacer = replacer.concat(asStr);
          _replacer = replacer;
        } else if (options === void 0 && replacer) {
          options = replacer;
          replacer = void 0;
        }
        const { aliasDuplicateObjects, anchorPrefix, flow, keepUndefined, onTagObj, tag } = options ?? {};
        const { onAnchor, setAnchors, sourceObjects } = anchors.createNodeAnchors(
          this,
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          anchorPrefix || "a"
        );
        const ctx = {
          aliasDuplicateObjects: aliasDuplicateObjects ?? true,
          keepUndefined: keepUndefined ?? false,
          onAnchor,
          onTagObj,
          replacer: _replacer,
          schema: this.schema,
          sourceObjects
        };
        const node = createNode.createNode(value, tag, ctx);
        if (flow && identity.isCollection(node))
          node.flow = true;
        setAnchors();
        return node;
      }
      /**
       * Convert a key and a value into a `Pair` using the current schema,
       * recursively wrapping all values as `Scalar` or `Collection` nodes.
       */
      createPair(key, value, options = {}) {
        const k = this.createNode(key, null, options);
        const v = this.createNode(value, null, options);
        return new Pair.Pair(k, v);
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      delete(key) {
        return assertCollection(this.contents) ? this.contents.delete(key) : false;
      }
      /**
       * Removes a value from the document.
       * @returns `true` if the item was found and removed.
       */
      deleteIn(path) {
        if (Collection.isEmptyPath(path)) {
          if (this.contents == null)
            return false;
          this.contents = null;
          return true;
        }
        return assertCollection(this.contents) ? this.contents.deleteIn(path) : false;
      }
      /**
       * Returns item at `key`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      get(key, keepScalar) {
        return identity.isCollection(this.contents) ? this.contents.get(key, keepScalar) : void 0;
      }
      /**
       * Returns item at `path`, or `undefined` if not found. By default unwraps
       * scalar values from their surrounding node; to disable set `keepScalar` to
       * `true` (collections are always returned intact).
       */
      getIn(path, keepScalar) {
        if (Collection.isEmptyPath(path))
          return !keepScalar && identity.isScalar(this.contents) ? this.contents.value : this.contents;
        return identity.isCollection(this.contents) ? this.contents.getIn(path, keepScalar) : void 0;
      }
      /**
       * Checks if the document includes a value with the key `key`.
       */
      has(key) {
        return identity.isCollection(this.contents) ? this.contents.has(key) : false;
      }
      /**
       * Checks if the document includes a value at `path`.
       */
      hasIn(path) {
        if (Collection.isEmptyPath(path))
          return this.contents !== void 0;
        return identity.isCollection(this.contents) ? this.contents.hasIn(path) : false;
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      set(key, value) {
        if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, [key], value);
        } else if (assertCollection(this.contents)) {
          this.contents.set(key, value);
        }
      }
      /**
       * Sets a value in this document. For `!!set`, `value` needs to be a
       * boolean to add/remove the item from the set.
       */
      setIn(path, value) {
        if (Collection.isEmptyPath(path)) {
          this.contents = value;
        } else if (this.contents == null) {
          this.contents = Collection.collectionFromPath(this.schema, Array.from(path), value);
        } else if (assertCollection(this.contents)) {
          this.contents.setIn(path, value);
        }
      }
      /**
       * Change the YAML version and schema used by the document.
       * A `null` version disables support for directives, explicit tags, anchors, and aliases.
       * It also requires the `schema` option to be given as a `Schema` instance value.
       *
       * Overrides all previously set schema options.
       */
      setSchema(version, options = {}) {
        if (typeof version === "number")
          version = String(version);
        let opt;
        switch (version) {
          case "1.1":
            if (this.directives)
              this.directives.yaml.version = "1.1";
            else
              this.directives = new directives.Directives({ version: "1.1" });
            opt = { resolveKnownTags: false, schema: "yaml-1.1" };
            break;
          case "1.2":
          case "next":
            if (this.directives)
              this.directives.yaml.version = version;
            else
              this.directives = new directives.Directives({ version });
            opt = { resolveKnownTags: true, schema: "core" };
            break;
          case null:
            if (this.directives)
              delete this.directives;
            opt = null;
            break;
          default: {
            const sv = JSON.stringify(version);
            throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${sv}`);
          }
        }
        if (options.schema instanceof Object)
          this.schema = options.schema;
        else if (opt)
          this.schema = new Schema.Schema(Object.assign(opt, options));
        else
          throw new Error(`With a null YAML version, the { schema: Schema } option is required`);
      }
      // json & jsonArg are only used from toJSON()
      toJS({ json, jsonArg, mapAsMap, maxAliasCount, onAnchor, reviver } = {}) {
        const ctx = {
          anchors: /* @__PURE__ */ new Map(),
          doc: this,
          keep: !json,
          mapAsMap: mapAsMap === true,
          mapKeyWarned: false,
          maxAliasCount: typeof maxAliasCount === "number" ? maxAliasCount : 100
        };
        const res = toJS.toJS(this.contents, jsonArg ?? "", ctx);
        if (typeof onAnchor === "function")
          for (const { count, res: res2 } of ctx.anchors.values())
            onAnchor(res2, count);
        return typeof reviver === "function" ? applyReviver.applyReviver(reviver, { "": res }, "", res) : res;
      }
      /**
       * A JSON representation of the document `contents`.
       *
       * @param jsonArg Used by `JSON.stringify` to indicate the array index or
       *   property name.
       */
      toJSON(jsonArg, onAnchor) {
        return this.toJS({ json: true, jsonArg, mapAsMap: false, onAnchor });
      }
      /** A YAML representation of the document. */
      toString(options = {}) {
        if (this.errors.length > 0)
          throw new Error("Document with errors cannot be stringified");
        if ("indent" in options && (!Number.isInteger(options.indent) || Number(options.indent) <= 0)) {
          const s = JSON.stringify(options.indent);
          throw new Error(`"indent" option must be a positive integer, not ${s}`);
        }
        return stringifyDocument.stringifyDocument(this, options);
      }
    };
    function assertCollection(contents) {
      if (identity.isCollection(contents))
        return true;
      throw new Error("Expected a YAML collection as document contents");
    }
    exports.Document = Document;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/errors.js
var require_errors = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/errors.js"(exports) {
    "use strict";
    var YAMLError = class extends Error {
      constructor(name2, pos, code3, message) {
        super();
        this.name = name2;
        this.code = code3;
        this.message = message;
        this.pos = pos;
      }
    };
    var YAMLParseError = class extends YAMLError {
      constructor(pos, code3, message) {
        super("YAMLParseError", pos, code3, message);
      }
    };
    var YAMLWarning = class extends YAMLError {
      constructor(pos, code3, message) {
        super("YAMLWarning", pos, code3, message);
      }
    };
    var prettifyError = (src, lc) => (error) => {
      if (error.pos[0] === -1)
        return;
      error.linePos = error.pos.map((pos) => lc.linePos(pos));
      const { line, col } = error.linePos[0];
      error.message += ` at line ${line}, column ${col}`;
      let ci = col - 1;
      let lineStr = src.substring(lc.lineStarts[line - 1], lc.lineStarts[line]).replace(/[\n\r]+$/, "");
      if (ci >= 60 && lineStr.length > 80) {
        const trimStart = Math.min(ci - 39, lineStr.length - 79);
        lineStr = "\u2026" + lineStr.substring(trimStart);
        ci -= trimStart - 1;
      }
      if (lineStr.length > 80)
        lineStr = lineStr.substring(0, 79) + "\u2026";
      if (line > 1 && /^ *$/.test(lineStr.substring(0, ci))) {
        let prev = src.substring(lc.lineStarts[line - 2], lc.lineStarts[line - 1]);
        if (prev.length > 80)
          prev = prev.substring(0, 79) + "\u2026\n";
        lineStr = prev + lineStr;
      }
      if (/[^ ]/.test(lineStr)) {
        let count = 1;
        const end = error.linePos[1];
        if (end?.line === line && end.col > col) {
          count = Math.max(1, Math.min(end.col - col, 80 - ci));
        }
        const pointer = " ".repeat(ci) + "^".repeat(count);
        error.message += `:

${lineStr}
${pointer}
`;
      }
    };
    exports.YAMLError = YAMLError;
    exports.YAMLParseError = YAMLParseError;
    exports.YAMLWarning = YAMLWarning;
    exports.prettifyError = prettifyError;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-props.js
var require_resolve_props = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-props.js"(exports) {
    "use strict";
    function resolveProps(tokens, { flow, indicator, next, offset, onError, parentIndent, startOnNewline }) {
      let spaceBefore = false;
      let atNewline = startOnNewline;
      let hasSpace = startOnNewline;
      let comment = "";
      let commentSep = "";
      let hasNewline = false;
      let reqSpace = false;
      let tab = null;
      let anchor = null;
      let tag = null;
      let newlineAfterProp = null;
      let comma = null;
      let found = null;
      let start2 = null;
      for (const token of tokens) {
        if (reqSpace) {
          if (token.type !== "space" && token.type !== "newline" && token.type !== "comma")
            onError(token.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
          reqSpace = false;
        }
        if (tab) {
          if (atNewline && token.type !== "comment" && token.type !== "newline") {
            onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
          }
          tab = null;
        }
        switch (token.type) {
          case "space":
            if (!flow && (indicator !== "doc-start" || next?.type !== "flow-collection") && token.source.includes("	")) {
              tab = token;
            }
            hasSpace = true;
            break;
          case "comment": {
            if (!hasSpace)
              onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
            const cb = token.source.substring(1) || " ";
            if (!comment)
              comment = cb;
            else
              comment += commentSep + cb;
            commentSep = "";
            atNewline = false;
            break;
          }
          case "newline":
            if (atNewline) {
              if (comment)
                comment += token.source;
              else if (!found || indicator !== "seq-item-ind")
                spaceBefore = true;
            } else
              commentSep += token.source;
            atNewline = true;
            hasNewline = true;
            if (anchor || tag)
              newlineAfterProp = token;
            hasSpace = true;
            break;
          case "anchor":
            if (anchor)
              onError(token, "MULTIPLE_ANCHORS", "A node can have at most one anchor");
            if (token.source.endsWith(":"))
              onError(token.offset + token.source.length - 1, "BAD_ALIAS", "Anchor ending in : is ambiguous", true);
            anchor = token;
            start2 ?? (start2 = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          case "tag": {
            if (tag)
              onError(token, "MULTIPLE_TAGS", "A node can have at most one tag");
            tag = token;
            start2 ?? (start2 = token.offset);
            atNewline = false;
            hasSpace = false;
            reqSpace = true;
            break;
          }
          case indicator:
            if (anchor || tag)
              onError(token, "BAD_PROP_ORDER", `Anchors and tags must be after the ${token.source} indicator`);
            if (found)
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.source} in ${flow ?? "collection"}`);
            found = token;
            atNewline = indicator === "seq-item-ind" || indicator === "explicit-key-ind";
            hasSpace = false;
            break;
          case "comma":
            if (flow) {
              if (comma)
                onError(token, "UNEXPECTED_TOKEN", `Unexpected , in ${flow}`);
              comma = token;
              atNewline = false;
              hasSpace = false;
              break;
            }
          // else fallthrough
          default:
            onError(token, "UNEXPECTED_TOKEN", `Unexpected ${token.type} token`);
            atNewline = false;
            hasSpace = false;
        }
      }
      const last = tokens[tokens.length - 1];
      const end = last ? last.offset + last.source.length : offset;
      if (reqSpace && next && next.type !== "space" && next.type !== "newline" && next.type !== "comma" && (next.type !== "scalar" || next.source !== "")) {
        onError(next.offset, "MISSING_CHAR", "Tags and anchors must be separated from the next token by white space");
      }
      if (tab && (atNewline && tab.indent <= parentIndent || next?.type === "block-map" || next?.type === "block-seq"))
        onError(tab, "TAB_AS_INDENT", "Tabs are not allowed as indentation");
      return {
        comma,
        found,
        spaceBefore,
        comment,
        hasNewline,
        anchor,
        tag,
        newlineAfterProp,
        end,
        start: start2 ?? end
      };
    }
    exports.resolveProps = resolveProps;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-contains-newline.js
var require_util_contains_newline = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-contains-newline.js"(exports) {
    "use strict";
    function containsNewline(key) {
      if (!key)
        return null;
      switch (key.type) {
        case "alias":
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          if (key.source.includes("\n"))
            return true;
          if (key.end) {
            for (const st of key.end)
              if (st.type === "newline")
                return true;
          }
          return false;
        case "flow-collection":
          for (const it of key.items) {
            for (const st of it.start)
              if (st.type === "newline")
                return true;
            if (it.sep) {
              for (const st of it.sep)
                if (st.type === "newline")
                  return true;
            }
            if (containsNewline(it.key) || containsNewline(it.value))
              return true;
          }
          return false;
        default:
          return true;
      }
    }
    exports.containsNewline = containsNewline;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-flow-indent-check.js
var require_util_flow_indent_check = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-flow-indent-check.js"(exports) {
    "use strict";
    var utilContainsNewline = require_util_contains_newline();
    function flowIndentCheck(indent, fc, onError) {
      if (fc?.type === "flow-collection") {
        const end = fc.end[0];
        if (end.indent === indent && (end.source === "]" || end.source === "}") && utilContainsNewline.containsNewline(fc)) {
          const msg = "Flow end indicator should be more indented than parent";
          onError(end, "BAD_INDENT", msg, true);
        }
      }
    }
    exports.flowIndentCheck = flowIndentCheck;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-map-includes.js
var require_util_map_includes = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-map-includes.js"(exports) {
    "use strict";
    var identity = require_identity();
    function mapIncludes(ctx, items, search) {
      const { uniqueKeys } = ctx.options;
      if (uniqueKeys === false)
        return false;
      const isEqual = typeof uniqueKeys === "function" ? uniqueKeys : (a, b) => a === b || identity.isScalar(a) && identity.isScalar(b) && a.value === b.value;
      return items.some((pair) => isEqual(pair.key, search));
    }
    exports.mapIncludes = mapIncludes;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-map.js
var require_resolve_block_map = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-map.js"(exports) {
    "use strict";
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    var utilMapIncludes = require_util_map_includes();
    var startColMsg = "All mapping items must start at the same column";
    function resolveBlockMap({ composeNode, composeEmptyNode }, ctx, bm, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLMap.YAMLMap;
      const map = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      let offset = bm.offset;
      let commentEnd = null;
      for (const collItem of bm.items) {
        const { start: start2, key, sep: sep2, value } = collItem;
        const keyProps = resolveProps.resolveProps(start2, {
          indicator: "explicit-key-ind",
          next: key ?? sep2?.[0],
          offset,
          onError,
          parentIndent: bm.indent,
          startOnNewline: true
        });
        const implicitKey = !keyProps.found;
        if (implicitKey) {
          if (key) {
            if (key.type === "block-seq")
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "A block sequence may not be used as an implicit map key");
            else if ("indent" in key && key.indent !== bm.indent)
              onError(offset, "BAD_INDENT", startColMsg);
          }
          if (!keyProps.anchor && !keyProps.tag && !sep2) {
            commentEnd = keyProps.end;
            if (keyProps.comment) {
              if (map.comment)
                map.comment += "\n" + keyProps.comment;
              else
                map.comment = keyProps.comment;
            }
            continue;
          }
          if (keyProps.newlineAfterProp || utilContainsNewline.containsNewline(key)) {
            onError(key ?? start2[start2.length - 1], "MULTILINE_IMPLICIT_KEY", "Implicit keys need to be on a single line");
          }
        } else if (keyProps.found?.indent !== bm.indent) {
          onError(offset, "BAD_INDENT", startColMsg);
        }
        ctx.atKey = true;
        const keyStart = keyProps.end;
        const keyNode = key ? composeNode(ctx, key, keyProps, onError) : composeEmptyNode(ctx, keyStart, start2, null, keyProps, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bm.indent, key, onError);
        ctx.atKey = false;
        if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
          onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
        const valueProps = resolveProps.resolveProps(sep2 ?? [], {
          indicator: "map-value-ind",
          next: value,
          offset: keyNode.range[2],
          onError,
          parentIndent: bm.indent,
          startOnNewline: !key || key.type === "block-scalar"
        });
        offset = valueProps.end;
        if (valueProps.found) {
          if (implicitKey) {
            if (value?.type === "block-map" && !valueProps.hasNewline)
              onError(offset, "BLOCK_AS_IMPLICIT_KEY", "Nested mappings are not allowed in compact mappings");
            if (ctx.options.strict && keyProps.start < valueProps.found.offset - 1024)
              onError(keyNode.range, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit block mapping key");
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : composeEmptyNode(ctx, offset, sep2, null, valueProps, onError);
          if (ctx.schema.compat)
            utilFlowIndentCheck.flowIndentCheck(bm.indent, value, onError);
          offset = valueNode.range[2];
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        } else {
          if (implicitKey)
            onError(keyNode.range, "MISSING_CHAR", "Implicit map keys need to be followed by map values");
          if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          map.items.push(pair);
        }
      }
      if (commentEnd && commentEnd < offset)
        onError(commentEnd, "IMPOSSIBLE", "Map comment with trailing content");
      map.range = [bm.offset, offset, commentEnd ?? offset];
      return map;
    }
    exports.resolveBlockMap = resolveBlockMap;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-seq.js
var require_resolve_block_seq = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-seq.js"(exports) {
    "use strict";
    var YAMLSeq = require_YAMLSeq();
    var resolveProps = require_resolve_props();
    var utilFlowIndentCheck = require_util_flow_indent_check();
    function resolveBlockSeq({ composeNode, composeEmptyNode }, ctx, bs, onError, tag) {
      const NodeClass = tag?.nodeClass ?? YAMLSeq.YAMLSeq;
      const seq = new NodeClass(ctx.schema);
      if (ctx.atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = bs.offset;
      let commentEnd = null;
      for (const { start: start2, value } of bs.items) {
        const props = resolveProps.resolveProps(start2, {
          indicator: "seq-item-ind",
          next: value,
          offset,
          onError,
          parentIndent: bs.indent,
          startOnNewline: true
        });
        if (!props.found) {
          if (props.anchor || props.tag || value) {
            if (value?.type === "block-seq")
              onError(props.end, "BAD_INDENT", "All sequence items must start at the same column");
            else
              onError(offset, "MISSING_CHAR", "Sequence item without - indicator");
          } else {
            commentEnd = props.end;
            if (props.comment)
              seq.comment = props.comment;
            continue;
          }
        }
        const node = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, start2, null, props, onError);
        if (ctx.schema.compat)
          utilFlowIndentCheck.flowIndentCheck(bs.indent, value, onError);
        offset = node.range[2];
        seq.items.push(node);
      }
      seq.range = [bs.offset, offset, commentEnd ?? offset];
      return seq;
    }
    exports.resolveBlockSeq = resolveBlockSeq;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-end.js
var require_resolve_end = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-end.js"(exports) {
    "use strict";
    function resolveEnd(end, offset, reqSpace, onError) {
      let comment = "";
      if (end) {
        let hasSpace = false;
        let sep2 = "";
        for (const token of end) {
          const { source, type } = token;
          switch (type) {
            case "space":
              hasSpace = true;
              break;
            case "comment": {
              if (reqSpace && !hasSpace)
                onError(token, "MISSING_CHAR", "Comments must be separated from other tokens by white space characters");
              const cb = source.substring(1) || " ";
              if (!comment)
                comment = cb;
              else
                comment += sep2 + cb;
              sep2 = "";
              break;
            }
            case "newline":
              if (comment)
                sep2 += source;
              hasSpace = true;
              break;
            default:
              onError(token, "UNEXPECTED_TOKEN", `Unexpected ${type} at node end`);
          }
          offset += source.length;
        }
      }
      return { comment, offset };
    }
    exports.resolveEnd = resolveEnd;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-collection.js
var require_resolve_flow_collection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Pair = require_Pair();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    var utilContainsNewline = require_util_contains_newline();
    var utilMapIncludes = require_util_map_includes();
    var blockMsg = "Block collections are not allowed within flow collections";
    var isBlock = (token) => token && (token.type === "block-map" || token.type === "block-seq");
    function resolveFlowCollection({ composeNode, composeEmptyNode }, ctx, fc, onError, tag) {
      const isMap = fc.start.source === "{";
      const fcName = isMap ? "flow map" : "flow sequence";
      const NodeClass = tag?.nodeClass ?? (isMap ? YAMLMap.YAMLMap : YAMLSeq.YAMLSeq);
      const coll = new NodeClass(ctx.schema);
      coll.flow = true;
      const atRoot = ctx.atRoot;
      if (atRoot)
        ctx.atRoot = false;
      if (ctx.atKey)
        ctx.atKey = false;
      let offset = fc.offset + fc.start.source.length;
      for (let i2 = 0; i2 < fc.items.length; ++i2) {
        const collItem = fc.items[i2];
        const { start: start2, key, sep: sep2, value } = collItem;
        const props = resolveProps.resolveProps(start2, {
          flow: fcName,
          indicator: "explicit-key-ind",
          next: key ?? sep2?.[0],
          offset,
          onError,
          parentIndent: fc.indent,
          startOnNewline: false
        });
        if (!props.found) {
          if (!props.anchor && !props.tag && !sep2 && !value) {
            if (i2 === 0 && props.comma)
              onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
            else if (i2 < fc.items.length - 1)
              onError(props.start, "UNEXPECTED_TOKEN", `Unexpected empty item in ${fcName}`);
            if (props.comment) {
              if (coll.comment)
                coll.comment += "\n" + props.comment;
              else
                coll.comment = props.comment;
            }
            offset = props.end;
            continue;
          }
          if (!isMap && ctx.options.strict && utilContainsNewline.containsNewline(key))
            onError(
              key,
              // checked by containsNewline()
              "MULTILINE_IMPLICIT_KEY",
              "Implicit keys of flow sequence pairs need to be on a single line"
            );
        }
        if (i2 === 0) {
          if (props.comma)
            onError(props.comma, "UNEXPECTED_TOKEN", `Unexpected , in ${fcName}`);
        } else {
          if (!props.comma)
            onError(props.start, "MISSING_CHAR", `Missing , between ${fcName} items`);
          if (props.comment) {
            let prevItemComment = "";
            loop: for (const st of start2) {
              switch (st.type) {
                case "comma":
                case "space":
                  break;
                case "comment":
                  prevItemComment = st.source.substring(1);
                  break loop;
                default:
                  break loop;
              }
            }
            if (prevItemComment) {
              let prev = coll.items[coll.items.length - 1];
              if (identity.isPair(prev))
                prev = prev.value ?? prev.key;
              if (prev.comment)
                prev.comment += "\n" + prevItemComment;
              else
                prev.comment = prevItemComment;
              props.comment = props.comment.substring(prevItemComment.length + 1);
            }
          }
        }
        if (!isMap && !sep2 && !props.found) {
          const valueNode = value ? composeNode(ctx, value, props, onError) : composeEmptyNode(ctx, props.end, sep2, null, props, onError);
          coll.items.push(valueNode);
          offset = valueNode.range[2];
          if (isBlock(value))
            onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
        } else {
          ctx.atKey = true;
          const keyStart = props.end;
          const keyNode = key ? composeNode(ctx, key, props, onError) : composeEmptyNode(ctx, keyStart, start2, null, props, onError);
          if (isBlock(key))
            onError(keyNode.range, "BLOCK_IN_FLOW", blockMsg);
          ctx.atKey = false;
          const valueProps = resolveProps.resolveProps(sep2 ?? [], {
            flow: fcName,
            indicator: "map-value-ind",
            next: value,
            offset: keyNode.range[2],
            onError,
            parentIndent: fc.indent,
            startOnNewline: false
          });
          if (valueProps.found) {
            if (!isMap && !props.found && ctx.options.strict) {
              if (sep2)
                for (const st of sep2) {
                  if (st === valueProps.found)
                    break;
                  if (st.type === "newline") {
                    onError(st, "MULTILINE_IMPLICIT_KEY", "Implicit keys of flow sequence pairs need to be on a single line");
                    break;
                  }
                }
              if (props.start < valueProps.found.offset - 1024)
                onError(valueProps.found, "KEY_OVER_1024_CHARS", "The : indicator must be at most 1024 chars after the start of an implicit flow sequence key");
            }
          } else if (value) {
            if ("source" in value && value.source?.[0] === ":")
              onError(value, "MISSING_CHAR", `Missing space after : in ${fcName}`);
            else
              onError(valueProps.start, "MISSING_CHAR", `Missing , or : between ${fcName} items`);
          }
          const valueNode = value ? composeNode(ctx, value, valueProps, onError) : valueProps.found ? composeEmptyNode(ctx, valueProps.end, sep2, null, valueProps, onError) : null;
          if (valueNode) {
            if (isBlock(value))
              onError(valueNode.range, "BLOCK_IN_FLOW", blockMsg);
          } else if (valueProps.comment) {
            if (keyNode.comment)
              keyNode.comment += "\n" + valueProps.comment;
            else
              keyNode.comment = valueProps.comment;
          }
          const pair = new Pair.Pair(keyNode, valueNode);
          if (ctx.options.keepSourceTokens)
            pair.srcToken = collItem;
          if (isMap) {
            const map = coll;
            if (utilMapIncludes.mapIncludes(ctx, map.items, keyNode))
              onError(keyStart, "DUPLICATE_KEY", "Map keys must be unique");
            map.items.push(pair);
          } else {
            const map = new YAMLMap.YAMLMap(ctx.schema);
            map.flow = true;
            map.items.push(pair);
            const endRange = (valueNode ?? keyNode).range;
            map.range = [keyNode.range[0], endRange[1], endRange[2]];
            coll.items.push(map);
          }
          offset = valueNode ? valueNode.range[2] : valueProps.end;
        }
      }
      const expectedEnd = isMap ? "}" : "]";
      const [ce, ...ee] = fc.end;
      let cePos = offset;
      if (ce?.source === expectedEnd)
        cePos = ce.offset + ce.source.length;
      else {
        const name2 = fcName[0].toUpperCase() + fcName.substring(1);
        const msg = atRoot ? `${name2} must end with a ${expectedEnd}` : `${name2} in block collection must be sufficiently indented and end with a ${expectedEnd}`;
        onError(offset, atRoot ? "MISSING_CHAR" : "BAD_INDENT", msg);
        if (ce && ce.source.length !== 1)
          ee.unshift(ce);
      }
      if (ee.length > 0) {
        const end = resolveEnd.resolveEnd(ee, cePos, ctx.options.strict, onError);
        if (end.comment) {
          if (coll.comment)
            coll.comment += "\n" + end.comment;
          else
            coll.comment = end.comment;
        }
        coll.range = [fc.offset, cePos, end.offset];
      } else {
        coll.range = [fc.offset, cePos, cePos];
      }
      return coll;
    }
    exports.resolveFlowCollection = resolveFlowCollection;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-collection.js
var require_compose_collection = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-collection.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var resolveBlockMap = require_resolve_block_map();
    var resolveBlockSeq = require_resolve_block_seq();
    var resolveFlowCollection = require_resolve_flow_collection();
    function resolveCollection(CN, ctx, token, onError, tagName, tag) {
      const coll = token.type === "block-map" ? resolveBlockMap.resolveBlockMap(CN, ctx, token, onError, tag) : token.type === "block-seq" ? resolveBlockSeq.resolveBlockSeq(CN, ctx, token, onError, tag) : resolveFlowCollection.resolveFlowCollection(CN, ctx, token, onError, tag);
      const Coll = coll.constructor;
      if (tagName === "!" || tagName === Coll.tagName) {
        coll.tag = Coll.tagName;
        return coll;
      }
      if (tagName)
        coll.tag = tagName;
      return coll;
    }
    function composeCollection(CN, ctx, token, props, onError) {
      const tagToken = props.tag;
      const tagName = !tagToken ? null : ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg));
      if (token.type === "block-seq") {
        const { anchor, newlineAfterProp: nl } = props;
        const lastProp = anchor && tagToken ? anchor.offset > tagToken.offset ? anchor : tagToken : anchor ?? tagToken;
        if (lastProp && (!nl || nl.offset < lastProp.offset)) {
          const message = "Missing newline after block sequence props";
          onError(lastProp, "MISSING_CHAR", message);
        }
      }
      const expType = token.type === "block-map" ? "map" : token.type === "block-seq" ? "seq" : token.start.source === "{" ? "map" : "seq";
      if (!tagToken || !tagName || tagName === "!" || tagName === YAMLMap.YAMLMap.tagName && expType === "map" || tagName === YAMLSeq.YAMLSeq.tagName && expType === "seq") {
        return resolveCollection(CN, ctx, token, onError, tagName);
      }
      let tag = ctx.schema.tags.find((t) => t.tag === tagName && t.collection === expType);
      if (!tag) {
        const kt = ctx.schema.knownTags[tagName];
        if (kt?.collection === expType) {
          ctx.schema.tags.push(Object.assign({}, kt, { default: false }));
          tag = kt;
        } else {
          if (kt) {
            onError(tagToken, "BAD_COLLECTION_TYPE", `${kt.tag} used for ${expType} collection, but expects ${kt.collection ?? "scalar"}`, true);
          } else {
            onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, true);
          }
          return resolveCollection(CN, ctx, token, onError, tagName);
        }
      }
      const coll = resolveCollection(CN, ctx, token, onError, tagName, tag);
      const res = tag.resolve?.(coll, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg), ctx.options) ?? coll;
      const node = identity.isNode(res) ? res : new Scalar.Scalar(res);
      node.range = coll.range;
      node.tag = tagName;
      if (tag?.format)
        node.format = tag.format;
      return node;
    }
    exports.composeCollection = composeCollection;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-scalar.js
var require_resolve_block_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-block-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    function resolveBlockScalar(ctx, scalar, onError) {
      const start2 = scalar.offset;
      const header = parseBlockScalarHeader(scalar, ctx.options.strict, onError);
      if (!header)
        return { value: "", type: null, comment: "", range: [start2, start2, start2] };
      const type = header.mode === ">" ? Scalar.Scalar.BLOCK_FOLDED : Scalar.Scalar.BLOCK_LITERAL;
      const lines4 = scalar.source ? splitLines(scalar.source) : [];
      let chompStart = lines4.length;
      for (let i2 = lines4.length - 1; i2 >= 0; --i2) {
        const content = lines4[i2][1];
        if (content === "" || content === "\r")
          chompStart = i2;
        else
          break;
      }
      if (chompStart === 0) {
        const value2 = header.chomp === "+" && lines4.length > 0 ? "\n".repeat(Math.max(1, lines4.length - 1)) : "";
        let end2 = start2 + header.length;
        if (scalar.source)
          end2 += scalar.source.length;
        return { value: value2, type, comment: header.comment, range: [start2, end2, end2] };
      }
      let trimIndent = scalar.indent + header.indent;
      let offset = scalar.offset + header.length;
      let contentStart = 0;
      for (let i2 = 0; i2 < chompStart; ++i2) {
        const [indent, content] = lines4[i2];
        if (content === "" || content === "\r") {
          if (header.indent === 0 && indent.length > trimIndent)
            trimIndent = indent.length;
        } else {
          if (indent.length < trimIndent) {
            const message = "Block scalars with more-indented leading empty lines must use an explicit indentation indicator";
            onError(offset + indent.length, "MISSING_CHAR", message);
          }
          if (header.indent === 0)
            trimIndent = indent.length;
          contentStart = i2;
          if (trimIndent === 0 && !ctx.atRoot) {
            const message = "Block scalar values in collections must be indented";
            onError(offset, "BAD_INDENT", message);
          }
          break;
        }
        offset += indent.length + content.length + 1;
      }
      for (let i2 = lines4.length - 1; i2 >= chompStart; --i2) {
        if (lines4[i2][0].length > trimIndent)
          chompStart = i2 + 1;
      }
      let value = "";
      let sep2 = "";
      let prevMoreIndented = false;
      for (let i2 = 0; i2 < contentStart; ++i2)
        value += lines4[i2][0].slice(trimIndent) + "\n";
      for (let i2 = contentStart; i2 < chompStart; ++i2) {
        let [indent, content] = lines4[i2];
        offset += indent.length + content.length + 1;
        const crlf = content[content.length - 1] === "\r";
        if (crlf)
          content = content.slice(0, -1);
        if (content && indent.length < trimIndent) {
          const src = header.indent ? "explicit indentation indicator" : "first line";
          const message = `Block scalar lines must not be less indented than their ${src}`;
          onError(offset - content.length - (crlf ? 2 : 1), "BAD_INDENT", message);
          indent = "";
        }
        if (type === Scalar.Scalar.BLOCK_LITERAL) {
          value += sep2 + indent.slice(trimIndent) + content;
          sep2 = "\n";
        } else if (indent.length > trimIndent || content[0] === "	") {
          if (sep2 === " ")
            sep2 = "\n";
          else if (!prevMoreIndented && sep2 === "\n")
            sep2 = "\n\n";
          value += sep2 + indent.slice(trimIndent) + content;
          sep2 = "\n";
          prevMoreIndented = true;
        } else if (content === "") {
          if (sep2 === "\n")
            value += "\n";
          else
            sep2 = "\n";
        } else {
          value += sep2 + content;
          sep2 = " ";
          prevMoreIndented = false;
        }
      }
      switch (header.chomp) {
        case "-":
          break;
        case "+":
          for (let i2 = chompStart; i2 < lines4.length; ++i2)
            value += "\n" + lines4[i2][0].slice(trimIndent);
          if (value[value.length - 1] !== "\n")
            value += "\n";
          break;
        default:
          value += "\n";
      }
      const end = start2 + header.length + scalar.source.length;
      return { value, type, comment: header.comment, range: [start2, end, end] };
    }
    function parseBlockScalarHeader({ offset, props }, strict, onError) {
      if (props[0].type !== "block-scalar-header") {
        onError(props[0], "IMPOSSIBLE", "Block scalar header not found");
        return null;
      }
      const { source } = props[0];
      const mode = source[0];
      let indent = 0;
      let chomp = "";
      let error = -1;
      for (let i2 = 1; i2 < source.length; ++i2) {
        const ch = source[i2];
        if (!chomp && (ch === "-" || ch === "+"))
          chomp = ch;
        else {
          const n = Number(ch);
          if (!indent && n)
            indent = n;
          else if (error === -1)
            error = offset + i2;
        }
      }
      if (error !== -1)
        onError(error, "UNEXPECTED_TOKEN", `Block scalar header includes extra characters: ${source}`);
      let hasSpace = false;
      let comment = "";
      let length = source.length;
      for (let i2 = 1; i2 < props.length; ++i2) {
        const token = props[i2];
        switch (token.type) {
          case "space":
            hasSpace = true;
          // fallthrough
          case "newline":
            length += token.source.length;
            break;
          case "comment":
            if (strict && !hasSpace) {
              const message = "Comments must be separated from other tokens by white space characters";
              onError(token, "MISSING_CHAR", message);
            }
            length += token.source.length;
            comment = token.source.substring(1);
            break;
          case "error":
            onError(token, "UNEXPECTED_TOKEN", token.message);
            length += token.source.length;
            break;
          /* istanbul ignore next should not happen */
          default: {
            const message = `Unexpected token in block scalar header: ${token.type}`;
            onError(token, "UNEXPECTED_TOKEN", message);
            const ts = token.source;
            if (ts && typeof ts === "string")
              length += ts.length;
          }
        }
      }
      return { mode, indent, chomp, comment, length };
    }
    function splitLines(source) {
      const split = source.split(/\n( *)/);
      const first = split[0];
      const m = first.match(/^( *)/);
      const line0 = m?.[1] ? [m[1], first.slice(m[1].length)] : ["", first];
      const lines4 = [line0];
      for (let i2 = 1; i2 < split.length; i2 += 2)
        lines4.push([split[i2], split[i2 + 1]]);
      return lines4;
    }
    exports.resolveBlockScalar = resolveBlockScalar;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-scalar.js
var require_resolve_flow_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/resolve-flow-scalar.js"(exports) {
    "use strict";
    var Scalar = require_Scalar();
    var resolveEnd = require_resolve_end();
    function resolveFlowScalar(scalar, strict, onError) {
      const { offset, type, source, end } = scalar;
      let _type;
      let value;
      const _onError = (rel, code3, msg) => onError(offset + rel, code3, msg);
      switch (type) {
        case "scalar":
          _type = Scalar.Scalar.PLAIN;
          value = plainValue(source, _onError);
          break;
        case "single-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_SINGLE;
          value = singleQuotedValue(source, _onError);
          break;
        case "double-quoted-scalar":
          _type = Scalar.Scalar.QUOTE_DOUBLE;
          value = doubleQuotedValue(source, _onError);
          break;
        /* istanbul ignore next should not happen */
        default:
          onError(scalar, "UNEXPECTED_TOKEN", `Expected a flow scalar value, but found: ${type}`);
          return {
            value: "",
            type: null,
            comment: "",
            range: [offset, offset + source.length, offset + source.length]
          };
      }
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, strict, onError);
      return {
        value,
        type: _type,
        comment: re.comment,
        range: [offset, valueEnd, re.offset]
      };
    }
    function plainValue(source, onError) {
      let badChar = "";
      switch (source[0]) {
        /* istanbul ignore next should not happen */
        case "	":
          badChar = "a tab character";
          break;
        case ",":
          badChar = "flow indicator character ,";
          break;
        case "%":
          badChar = "directive indicator character %";
          break;
        case "|":
        case ">": {
          badChar = `block scalar indicator ${source[0]}`;
          break;
        }
        case "@":
        case "`": {
          badChar = `reserved character ${source[0]}`;
          break;
        }
      }
      if (badChar)
        onError(0, "BAD_SCALAR_START", `Plain value cannot start with ${badChar}`);
      return unfoldLines(source);
    }
    function singleQuotedValue(source, onError) {
      if (source[source.length - 1] !== "'" || source.length === 1)
        onError(source.length, "MISSING_CHAR", "Missing closing 'quote");
      return unfoldLines(source.slice(1, -1)).replace(/''/g, "'");
    }
    function unfoldLines(source) {
      const line = /(.*?)\r?\n/sy;
      let match = line.exec(source);
      if (!match)
        return source;
      let trimEnd, trimBoth;
      try {
        trimEnd = new RegExp("(?<![ 	])[ 	]+$");
        trimBoth = new RegExp("^[ 	]+|(?<![ 	])[ 	]+$", "g");
      } catch {
        trimEnd = /[ \t]+$/;
        trimBoth = /^[ \t]+|[ \t]+$/g;
      }
      let res = match[1].replace(trimEnd, "");
      let sep2 = " ";
      let pos = line.lastIndex;
      while (match = line.exec(source)) {
        const lm = match[1].replace(trimBoth, "");
        if (lm === "") {
          if (sep2 === "\n")
            res += sep2;
          else
            sep2 = "\n";
        } else {
          res += sep2 + lm;
          sep2 = " ";
        }
        pos = line.lastIndex;
      }
      const last = /[ \t]*(.*)/sy;
      last.lastIndex = pos;
      match = last.exec(source);
      return res + sep2 + (match?.[1] ?? "");
    }
    function doubleQuotedValue(source, onError) {
      let res = "";
      for (let i2 = 1; i2 < source.length - 1; ++i2) {
        const ch = source[i2];
        if (ch === "\r" && source[i2 + 1] === "\n")
          continue;
        if (ch === "\n") {
          const { fold, offset } = foldNewline(source, i2);
          res += fold;
          i2 = offset;
        } else if (ch === "\\") {
          let next = source[++i2];
          const cc = escapeCodes[next];
          if (cc)
            res += cc;
          else if (next === "\n") {
            next = source[i2 + 1];
            while (next === " " || next === "	")
              next = source[++i2 + 1];
          } else if (next === "\r" && source[i2 + 1] === "\n") {
            next = source[++i2 + 1];
            while (next === " " || next === "	")
              next = source[++i2 + 1];
          } else if (next === "x" || next === "u" || next === "U") {
            const length = next === "x" ? 2 : next === "u" ? 4 : 8;
            res += parseCharCode(source, i2 + 1, length, onError);
            i2 += length;
          } else {
            const raw2 = source.substr(i2 - 1, 2);
            onError(i2 - 1, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw2}`);
            res += raw2;
          }
        } else if (ch === " " || ch === "	") {
          const wsStart = i2;
          let next = source[i2 + 1];
          while (next === " " || next === "	")
            next = source[++i2 + 1];
          if (next !== "\n" && !(next === "\r" && source[i2 + 2] === "\n"))
            res += i2 > wsStart ? source.slice(wsStart, i2 + 1) : ch;
        } else {
          res += ch;
        }
      }
      if (source[source.length - 1] !== '"' || source.length === 1)
        onError(source.length, "MISSING_CHAR", 'Missing closing "quote');
      return res;
    }
    function foldNewline(source, offset) {
      let fold = "";
      let ch = source[offset + 1];
      while (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        if (ch === "\r" && source[offset + 2] !== "\n")
          break;
        if (ch === "\n")
          fold += "\n";
        offset += 1;
        ch = source[offset + 1];
      }
      if (!fold)
        fold = " ";
      return { fold, offset };
    }
    var escapeCodes = {
      "0": "\0",
      // null character
      a: "\x07",
      // bell character
      b: "\b",
      // backspace
      e: "\x1B",
      // escape character
      f: "\f",
      // form feed
      n: "\n",
      // line feed
      r: "\r",
      // carriage return
      t: "	",
      // horizontal tab
      v: "\v",
      // vertical tab
      N: "\x85",
      // Unicode next line
      _: "\xA0",
      // Unicode non-breaking space
      L: "\u2028",
      // Unicode line separator
      P: "\u2029",
      // Unicode paragraph separator
      " ": " ",
      '"': '"',
      "/": "/",
      "\\": "\\",
      "	": "	"
    };
    function parseCharCode(source, offset, length, onError) {
      const cc = source.substr(offset, length);
      const ok = cc.length === length && /^[0-9a-fA-F]+$/.test(cc);
      const code3 = ok ? parseInt(cc, 16) : NaN;
      try {
        return String.fromCodePoint(code3);
      } catch {
        const raw2 = source.substr(offset - 2, length + 2);
        onError(offset - 2, "BAD_DQ_ESCAPE", `Invalid escape sequence ${raw2}`);
        return raw2;
      }
    }
    exports.resolveFlowScalar = resolveFlowScalar;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-scalar.js
var require_compose_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-scalar.js"(exports) {
    "use strict";
    var identity = require_identity();
    var Scalar = require_Scalar();
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    function composeScalar(ctx, token, tagToken, onError) {
      const { value, type, comment, range } = token.type === "block-scalar" ? resolveBlockScalar.resolveBlockScalar(ctx, token, onError) : resolveFlowScalar.resolveFlowScalar(token, ctx.options.strict, onError);
      const tagName = tagToken ? ctx.directives.tagName(tagToken.source, (msg) => onError(tagToken, "TAG_RESOLVE_FAILED", msg)) : null;
      let tag;
      if (ctx.options.stringKeys && ctx.atKey) {
        tag = ctx.schema[identity.SCALAR];
      } else if (tagName)
        tag = findScalarTagByName(ctx.schema, value, tagName, tagToken, onError);
      else if (token.type === "scalar")
        tag = findScalarTagByTest(ctx, value, token, onError);
      else
        tag = ctx.schema[identity.SCALAR];
      let scalar;
      try {
        const res = tag.resolve(value, (msg) => onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg), ctx.options);
        scalar = identity.isScalar(res) ? res : new Scalar.Scalar(res);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        onError(tagToken ?? token, "TAG_RESOLVE_FAILED", msg);
        scalar = new Scalar.Scalar(value);
      }
      scalar.range = range;
      scalar.source = value;
      if (type)
        scalar.type = type;
      if (tagName)
        scalar.tag = tagName;
      if (tag.format)
        scalar.format = tag.format;
      if (comment)
        scalar.comment = comment;
      return scalar;
    }
    function findScalarTagByName(schema, value, tagName, tagToken, onError) {
      if (tagName === "!")
        return schema[identity.SCALAR];
      const matchWithTest = [];
      for (const tag of schema.tags) {
        if (!tag.collection && tag.tag === tagName) {
          if (tag.default && tag.test)
            matchWithTest.push(tag);
          else
            return tag;
        }
      }
      for (const tag of matchWithTest)
        if (tag.test?.test(value))
          return tag;
      const kt = schema.knownTags[tagName];
      if (kt && !kt.collection) {
        schema.tags.push(Object.assign({}, kt, { default: false, test: void 0 }));
        return kt;
      }
      onError(tagToken, "TAG_RESOLVE_FAILED", `Unresolved tag: ${tagName}`, tagName !== "tag:yaml.org,2002:str");
      return schema[identity.SCALAR];
    }
    function findScalarTagByTest({ atKey, directives, schema }, value, token, onError) {
      const tag = schema.tags.find((tag2) => (tag2.default === true || atKey && tag2.default === "key") && tag2.test?.test(value)) || schema[identity.SCALAR];
      if (schema.compat) {
        const compat = schema.compat.find((tag2) => tag2.default && tag2.test?.test(value)) ?? schema[identity.SCALAR];
        if (tag.tag !== compat.tag) {
          const ts = directives.tagString(tag.tag);
          const cs = directives.tagString(compat.tag);
          const msg = `Value may be parsed as either ${ts} or ${cs}`;
          onError(token, "TAG_RESOLVE_FAILED", msg, true);
        }
      }
      return tag;
    }
    exports.composeScalar = composeScalar;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-empty-scalar-position.js
var require_util_empty_scalar_position = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/util-empty-scalar-position.js"(exports) {
    "use strict";
    function emptyScalarPosition(offset, before, pos) {
      if (before) {
        pos ?? (pos = before.length);
        for (let i2 = pos - 1; i2 >= 0; --i2) {
          let st = before[i2];
          switch (st.type) {
            case "space":
            case "comment":
            case "newline":
              offset -= st.source.length;
              continue;
          }
          st = before[++i2];
          while (st?.type === "space") {
            offset += st.source.length;
            st = before[++i2];
          }
          break;
        }
      }
      return offset;
    }
    exports.emptyScalarPosition = emptyScalarPosition;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-node.js
var require_compose_node = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-node.js"(exports) {
    "use strict";
    var Alias = require_Alias();
    var identity = require_identity();
    var composeCollection = require_compose_collection();
    var composeScalar = require_compose_scalar();
    var resolveEnd = require_resolve_end();
    var utilEmptyScalarPosition = require_util_empty_scalar_position();
    var CN = { composeNode, composeEmptyNode };
    function composeNode(ctx, token, props, onError) {
      const atKey = ctx.atKey;
      const { spaceBefore, comment, anchor, tag } = props;
      let node;
      let isSrcToken = true;
      switch (token.type) {
        case "alias":
          node = composeAlias(ctx, token, onError);
          if (anchor || tag)
            onError(token, "ALIAS_PROPS", "An alias node must not specify any properties");
          break;
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "block-scalar":
          node = composeScalar.composeScalar(ctx, token, tag, onError);
          if (anchor)
            node.anchor = anchor.source.substring(1);
          break;
        case "block-map":
        case "block-seq":
        case "flow-collection":
          try {
            node = composeCollection.composeCollection(CN, ctx, token, props, onError);
            if (anchor)
              node.anchor = anchor.source.substring(1);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            onError(token, "RESOURCE_EXHAUSTION", message);
          }
          break;
        default: {
          const message = token.type === "error" ? token.message : `Unsupported token (type: ${token.type})`;
          onError(token, "UNEXPECTED_TOKEN", message);
          isSrcToken = false;
        }
      }
      node ?? (node = composeEmptyNode(ctx, token.offset, void 0, null, props, onError));
      if (anchor && node.anchor === "")
        onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      if (atKey && ctx.options.stringKeys && (!identity.isScalar(node) || typeof node.value !== "string" || node.tag && node.tag !== "tag:yaml.org,2002:str")) {
        const msg = "With stringKeys, all keys must be strings";
        onError(tag ?? token, "NON_STRING_KEY", msg);
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        if (token.type === "scalar" && token.source === "")
          node.comment = comment;
        else
          node.commentBefore = comment;
      }
      if (ctx.options.keepSourceTokens && isSrcToken)
        node.srcToken = token;
      return node;
    }
    function composeEmptyNode(ctx, offset, before, pos, { spaceBefore, comment, anchor, tag, end }, onError) {
      const token = {
        type: "scalar",
        offset: utilEmptyScalarPosition.emptyScalarPosition(offset, before, pos),
        indent: -1,
        source: ""
      };
      const node = composeScalar.composeScalar(ctx, token, tag, onError);
      if (anchor) {
        node.anchor = anchor.source.substring(1);
        if (node.anchor === "")
          onError(anchor, "BAD_ALIAS", "Anchor cannot be an empty string");
      }
      if (spaceBefore)
        node.spaceBefore = true;
      if (comment) {
        node.comment = comment;
        node.range[2] = end;
      }
      return node;
    }
    function composeAlias({ options }, { offset, source, end }, onError) {
      const alias2 = new Alias.Alias(source.substring(1));
      if (alias2.source === "")
        onError(offset, "BAD_ALIAS", "Alias cannot be an empty string");
      if (alias2.source.endsWith(":"))
        onError(offset + source.length - 1, "BAD_ALIAS", "Alias ending in : is ambiguous", true);
      const valueEnd = offset + source.length;
      const re = resolveEnd.resolveEnd(end, valueEnd, options.strict, onError);
      alias2.range = [offset, valueEnd, re.offset];
      if (re.comment)
        alias2.comment = re.comment;
      return alias2;
    }
    exports.composeEmptyNode = composeEmptyNode;
    exports.composeNode = composeNode;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-doc.js
var require_compose_doc = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/compose-doc.js"(exports) {
    "use strict";
    var Document = require_Document();
    var composeNode = require_compose_node();
    var resolveEnd = require_resolve_end();
    var resolveProps = require_resolve_props();
    function composeDoc(options, directives, { offset, start: start2, value, end }, onError) {
      const opts = Object.assign({ _directives: directives }, options);
      const doc = new Document.Document(void 0, opts);
      const ctx = {
        atKey: false,
        atRoot: true,
        directives: doc.directives,
        options: doc.options,
        schema: doc.schema
      };
      const props = resolveProps.resolveProps(start2, {
        indicator: "doc-start",
        next: value ?? end?.[0],
        offset,
        onError,
        parentIndent: 0,
        startOnNewline: true
      });
      if (props.found) {
        doc.directives.docStart = true;
        if (value && (value.type === "block-map" || value.type === "block-seq") && !props.hasNewline)
          onError(props.end, "MISSING_CHAR", "Block collection cannot start on same line with directives-end marker");
      }
      doc.contents = value ? composeNode.composeNode(ctx, value, props, onError) : composeNode.composeEmptyNode(ctx, props.end, start2, null, props, onError);
      const contentEnd = doc.contents.range[2];
      const re = resolveEnd.resolveEnd(end, contentEnd, false, onError);
      if (re.comment)
        doc.comment = re.comment;
      doc.range = [offset, contentEnd, re.offset];
      return doc;
    }
    exports.composeDoc = composeDoc;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/composer.js
var require_composer = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/compose/composer.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var directives = require_directives();
    var Document = require_Document();
    var errors = require_errors();
    var identity = require_identity();
    var composeDoc = require_compose_doc();
    var resolveEnd = require_resolve_end();
    function getErrorPos(src) {
      if (typeof src === "number")
        return [src, src + 1];
      if (Array.isArray(src))
        return src.length === 2 ? src : [src[0], src[1]];
      const { offset, source } = src;
      return [offset, offset + (typeof source === "string" ? source.length : 1)];
    }
    function parsePrelude(prelude) {
      let comment = "";
      let atComment = false;
      let afterEmptyLine = false;
      for (let i2 = 0; i2 < prelude.length; ++i2) {
        const source = prelude[i2];
        switch (source[0]) {
          case "#":
            comment += (comment === "" ? "" : afterEmptyLine ? "\n\n" : "\n") + (source.substring(1) || " ");
            atComment = true;
            afterEmptyLine = false;
            break;
          case "%":
            if (prelude[i2 + 1]?.[0] !== "#")
              i2 += 1;
            atComment = false;
            break;
          default:
            if (!atComment)
              afterEmptyLine = true;
            atComment = false;
        }
      }
      return { comment, afterEmptyLine };
    }
    var Composer = class {
      constructor(options = {}) {
        this.doc = null;
        this.atDirectives = false;
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
        this.onError = (source, code3, message, warning) => {
          const pos = getErrorPos(source);
          if (warning)
            this.warnings.push(new errors.YAMLWarning(pos, code3, message));
          else
            this.errors.push(new errors.YAMLParseError(pos, code3, message));
        };
        this.directives = new directives.Directives({ version: options.version || "1.2" });
        this.options = options;
      }
      decorate(doc, afterDoc) {
        const { comment, afterEmptyLine } = parsePrelude(this.prelude);
        if (comment) {
          const dc = doc.contents;
          if (afterDoc) {
            doc.comment = doc.comment ? `${doc.comment}
${comment}` : comment;
          } else if (afterEmptyLine || doc.directives.docStart || !dc) {
            doc.commentBefore = comment;
          } else if (identity.isCollection(dc) && !dc.flow && dc.items.length > 0) {
            let it = dc.items[0];
            if (identity.isPair(it))
              it = it.key;
            const cb = it.commentBefore;
            it.commentBefore = cb ? `${comment}
${cb}` : comment;
          } else {
            const cb = dc.commentBefore;
            dc.commentBefore = cb ? `${comment}
${cb}` : comment;
          }
        }
        if (afterDoc) {
          for (let i2 = 0; i2 < this.errors.length; ++i2)
            doc.errors.push(this.errors[i2]);
          for (let i2 = 0; i2 < this.warnings.length; ++i2)
            doc.warnings.push(this.warnings[i2]);
        } else {
          doc.errors = this.errors;
          doc.warnings = this.warnings;
        }
        this.prelude = [];
        this.errors = [];
        this.warnings = [];
      }
      /**
       * Current stream status information.
       *
       * Mostly useful at the end of input for an empty stream.
       */
      streamInfo() {
        return {
          comment: parsePrelude(this.prelude).comment,
          directives: this.directives,
          errors: this.errors,
          warnings: this.warnings
        };
      }
      /**
       * Compose tokens into documents.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *compose(tokens, forceDoc = false, endOffset = -1) {
        for (const token of tokens)
          yield* this.next(token);
        yield* this.end(forceDoc, endOffset);
      }
      /** Advance the composer by one CST token. */
      *next(token) {
        if (node_process.env.LOG_STREAM)
          console.dir(token, { depth: null });
        switch (token.type) {
          case "directive":
            this.directives.add(token.source, (offset, message, warning) => {
              const pos = getErrorPos(token);
              pos[0] += offset;
              this.onError(pos, "BAD_DIRECTIVE", message, warning);
            });
            this.prelude.push(token.source);
            this.atDirectives = true;
            break;
          case "document": {
            const doc = composeDoc.composeDoc(this.options, this.directives, token, this.onError);
            if (this.atDirectives && !doc.directives.docStart)
              this.onError(token, "MISSING_CHAR", "Missing directives-end/doc-start indicator line");
            this.decorate(doc, false);
            if (this.doc)
              yield this.doc;
            this.doc = doc;
            this.atDirectives = false;
            break;
          }
          case "byte-order-mark":
          case "space":
            break;
          case "comment":
          case "newline":
            this.prelude.push(token.source);
            break;
          case "error": {
            const msg = token.source ? `${token.message}: ${JSON.stringify(token.source)}` : token.message;
            const error = new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg);
            if (this.atDirectives || !this.doc)
              this.errors.push(error);
            else
              this.doc.errors.push(error);
            break;
          }
          case "doc-end": {
            if (!this.doc) {
              const msg = "Unexpected doc-end without preceding document";
              this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", msg));
              break;
            }
            this.doc.directives.docEnd = true;
            const end = resolveEnd.resolveEnd(token.end, token.offset + token.source.length, this.doc.options.strict, this.onError);
            this.decorate(this.doc, true);
            if (end.comment) {
              const dc = this.doc.comment;
              this.doc.comment = dc ? `${dc}
${end.comment}` : end.comment;
            }
            this.doc.range[2] = end.offset;
            break;
          }
          default:
            this.errors.push(new errors.YAMLParseError(getErrorPos(token), "UNEXPECTED_TOKEN", `Unsupported token ${token.type}`));
        }
      }
      /**
       * Call at end of input to yield any remaining document.
       *
       * @param forceDoc - If the stream contains no document, still emit a final document including any comments and directives that would be applied to a subsequent document.
       * @param endOffset - Should be set if `forceDoc` is also set, to set the document range end and to indicate errors correctly.
       */
      *end(forceDoc = false, endOffset = -1) {
        if (this.doc) {
          this.decorate(this.doc, true);
          yield this.doc;
          this.doc = null;
        } else if (forceDoc) {
          const opts = Object.assign({ _directives: this.directives }, this.options);
          const doc = new Document.Document(void 0, opts);
          if (this.atDirectives)
            this.onError(endOffset, "MISSING_CHAR", "Missing directives-end indicator line");
          doc.range = [0, endOffset, endOffset];
          this.decorate(doc, false);
          yield doc;
        }
      }
    };
    exports.Composer = Composer;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-scalar.js
var require_cst_scalar = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-scalar.js"(exports) {
    "use strict";
    var resolveBlockScalar = require_resolve_block_scalar();
    var resolveFlowScalar = require_resolve_flow_scalar();
    var errors = require_errors();
    var stringifyString = require_stringifyString();
    function resolveAsScalar(token, strict = true, onError) {
      if (token) {
        const _onError = (pos, code3, message) => {
          const offset = typeof pos === "number" ? pos : Array.isArray(pos) ? pos[0] : pos.offset;
          if (onError)
            onError(offset, code3, message);
          else
            throw new errors.YAMLParseError([offset, offset + 1], code3, message);
        };
        switch (token.type) {
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return resolveFlowScalar.resolveFlowScalar(token, strict, _onError);
          case "block-scalar":
            return resolveBlockScalar.resolveBlockScalar({ options: { strict } }, token, _onError);
        }
      }
      return null;
    }
    function createScalarToken(value, context) {
      const { implicitKey = false, indent, inFlow = false, offset = -1, type = "PLAIN" } = context;
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey,
        indent: indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      const end = context.end ?? [
        { type: "newline", offset: -1, indent, source: "\n" }
      ];
      switch (source[0]) {
        case "|":
        case ">": {
          const he = source.indexOf("\n");
          const head = source.substring(0, he);
          const body2 = source.substring(he + 1) + "\n";
          const props = [
            { type: "block-scalar-header", offset, indent, source: head }
          ];
          if (!addEndtoBlockProps(props, end))
            props.push({ type: "newline", offset: -1, indent, source: "\n" });
          return { type: "block-scalar", offset, indent, props, source: body2 };
        }
        case '"':
          return { type: "double-quoted-scalar", offset, indent, source, end };
        case "'":
          return { type: "single-quoted-scalar", offset, indent, source, end };
        default:
          return { type: "scalar", offset, indent, source, end };
      }
    }
    function setScalarValue(token, value, context = {}) {
      let { afterKey = false, implicitKey = false, inFlow = false, type } = context;
      let indent = "indent" in token ? token.indent : null;
      if (afterKey && typeof indent === "number")
        indent += 2;
      if (!type)
        switch (token.type) {
          case "single-quoted-scalar":
            type = "QUOTE_SINGLE";
            break;
          case "double-quoted-scalar":
            type = "QUOTE_DOUBLE";
            break;
          case "block-scalar": {
            const header = token.props[0];
            if (header.type !== "block-scalar-header")
              throw new Error("Invalid block scalar header");
            type = header.source[0] === ">" ? "BLOCK_FOLDED" : "BLOCK_LITERAL";
            break;
          }
          default:
            type = "PLAIN";
        }
      const source = stringifyString.stringifyString({ type, value }, {
        implicitKey: implicitKey || indent === null,
        indent: indent !== null && indent > 0 ? " ".repeat(indent) : "",
        inFlow,
        options: { blockQuote: true, lineWidth: -1 }
      });
      switch (source[0]) {
        case "|":
        case ">":
          setBlockScalarValue(token, source);
          break;
        case '"':
          setFlowScalarValue(token, source, "double-quoted-scalar");
          break;
        case "'":
          setFlowScalarValue(token, source, "single-quoted-scalar");
          break;
        default:
          setFlowScalarValue(token, source, "scalar");
      }
    }
    function setBlockScalarValue(token, source) {
      const he = source.indexOf("\n");
      const head = source.substring(0, he);
      const body2 = source.substring(he + 1) + "\n";
      if (token.type === "block-scalar") {
        const header = token.props[0];
        if (header.type !== "block-scalar-header")
          throw new Error("Invalid block scalar header");
        header.source = head;
        token.source = body2;
      } else {
        const { offset } = token;
        const indent = "indent" in token ? token.indent : -1;
        const props = [
          { type: "block-scalar-header", offset, indent, source: head }
        ];
        if (!addEndtoBlockProps(props, "end" in token ? token.end : void 0))
          props.push({ type: "newline", offset: -1, indent, source: "\n" });
        for (const key of Object.keys(token))
          if (key !== "type" && key !== "offset")
            delete token[key];
        Object.assign(token, { type: "block-scalar", indent, props, source: body2 });
      }
    }
    function addEndtoBlockProps(props, end) {
      if (end)
        for (const st of end)
          switch (st.type) {
            case "space":
            case "comment":
              props.push(st);
              break;
            case "newline":
              props.push(st);
              return true;
          }
      return false;
    }
    function setFlowScalarValue(token, source, type) {
      switch (token.type) {
        case "scalar":
        case "double-quoted-scalar":
        case "single-quoted-scalar":
          token.type = type;
          token.source = source;
          break;
        case "block-scalar": {
          const end = token.props.slice(1);
          let oa = source.length;
          if (token.props[0].type === "block-scalar-header")
            oa -= token.props[0].source.length;
          for (const tok of end)
            tok.offset += oa;
          delete token.props;
          Object.assign(token, { type, source, end });
          break;
        }
        case "block-map":
        case "block-seq": {
          const offset = token.offset + source.length;
          const nl = { type: "newline", offset, indent: token.indent, source: "\n" };
          delete token.items;
          Object.assign(token, { type, source, end: [nl] });
          break;
        }
        default: {
          const indent = "indent" in token ? token.indent : -1;
          const end = "end" in token && Array.isArray(token.end) ? token.end.filter((st) => st.type === "space" || st.type === "comment" || st.type === "newline") : [];
          for (const key of Object.keys(token))
            if (key !== "type" && key !== "offset")
              delete token[key];
          Object.assign(token, { type, indent, source, end });
        }
      }
    }
    exports.createScalarToken = createScalarToken;
    exports.resolveAsScalar = resolveAsScalar;
    exports.setScalarValue = setScalarValue;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-stringify.js
var require_cst_stringify = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-stringify.js"(exports) {
    "use strict";
    var stringify = (cst) => "type" in cst ? stringifyToken(cst) : stringifyItem(cst);
    function stringifyToken(token) {
      switch (token.type) {
        case "block-scalar": {
          let res = "";
          for (const tok of token.props)
            res += stringifyToken(tok);
          return res + token.source;
        }
        case "block-map":
        case "block-seq": {
          let res = "";
          for (const item of token.items)
            res += stringifyItem(item);
          return res;
        }
        case "flow-collection": {
          let res = token.start.source;
          for (const item of token.items)
            res += stringifyItem(item);
          for (const st of token.end)
            res += st.source;
          return res;
        }
        case "document": {
          let res = stringifyItem(token);
          if (token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
        default: {
          let res = token.source;
          if ("end" in token && token.end)
            for (const st of token.end)
              res += st.source;
          return res;
        }
      }
    }
    function stringifyItem({ start: start2, key, sep: sep2, value }) {
      let res = "";
      for (const st of start2)
        res += st.source;
      if (key)
        res += stringifyToken(key);
      if (sep2)
        for (const st of sep2)
          res += st.source;
      if (value)
        res += stringifyToken(value);
      return res;
    }
    exports.stringify = stringify;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-visit.js
var require_cst_visit = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst-visit.js"(exports) {
    "use strict";
    var BREAK = /* @__PURE__ */ Symbol("break visit");
    var SKIP2 = /* @__PURE__ */ Symbol("skip children");
    var REMOVE = /* @__PURE__ */ Symbol("remove item");
    function visit(cst, visitor) {
      if ("type" in cst && cst.type === "document")
        cst = { start: cst.start, value: cst.value };
      _visit(Object.freeze([]), cst, visitor);
    }
    visit.BREAK = BREAK;
    visit.SKIP = SKIP2;
    visit.REMOVE = REMOVE;
    visit.itemAtPath = (cst, path) => {
      let item = cst;
      for (const [field, index] of path) {
        const tok = item?.[field];
        if (tok && "items" in tok) {
          item = tok.items[index];
        } else
          return void 0;
      }
      return item;
    };
    visit.parentCollection = (cst, path) => {
      const parent = visit.itemAtPath(cst, path.slice(0, -1));
      const field = path[path.length - 1][0];
      const coll = parent?.[field];
      if (coll && "items" in coll)
        return coll;
      throw new Error("Parent collection not found");
    };
    function _visit(path, item, visitor) {
      let ctrl = visitor(item, path);
      if (typeof ctrl === "symbol")
        return ctrl;
      for (const field of ["key", "value"]) {
        const token = item[field];
        if (token && "items" in token) {
          for (let i2 = 0; i2 < token.items.length; ++i2) {
            const ci = _visit(Object.freeze(path.concat([[field, i2]])), token.items[i2], visitor);
            if (typeof ci === "number")
              i2 = ci - 1;
            else if (ci === BREAK)
              return BREAK;
            else if (ci === REMOVE) {
              token.items.splice(i2, 1);
              i2 -= 1;
            }
          }
          if (typeof ctrl === "function" && field === "key")
            ctrl = ctrl(item, path);
        }
      }
      return typeof ctrl === "function" ? ctrl(item, path) : ctrl;
    }
    exports.visit = visit;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst.js
var require_cst = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/cst.js"(exports) {
    "use strict";
    var cstScalar = require_cst_scalar();
    var cstStringify = require_cst_stringify();
    var cstVisit = require_cst_visit();
    var BOM = "\uFEFF";
    var DOCUMENT = "";
    var FLOW_END = "";
    var SCALAR = "";
    var isCollection = (token) => !!token && "items" in token;
    var isScalar = (token) => !!token && (token.type === "scalar" || token.type === "single-quoted-scalar" || token.type === "double-quoted-scalar" || token.type === "block-scalar");
    function prettyToken(token) {
      switch (token) {
        case BOM:
          return "<BOM>";
        case DOCUMENT:
          return "<DOC>";
        case FLOW_END:
          return "<FLOW_END>";
        case SCALAR:
          return "<SCALAR>";
        default:
          return JSON.stringify(token);
      }
    }
    function tokenType(source) {
      switch (source) {
        case BOM:
          return "byte-order-mark";
        case DOCUMENT:
          return "doc-mode";
        case FLOW_END:
          return "flow-error-end";
        case SCALAR:
          return "scalar";
        case "---":
          return "doc-start";
        case "...":
          return "doc-end";
        case "":
        case "\n":
        case "\r\n":
          return "newline";
        case "-":
          return "seq-item-ind";
        case "?":
          return "explicit-key-ind";
        case ":":
          return "map-value-ind";
        case "{":
          return "flow-map-start";
        case "}":
          return "flow-map-end";
        case "[":
          return "flow-seq-start";
        case "]":
          return "flow-seq-end";
        case ",":
          return "comma";
      }
      switch (source[0]) {
        case " ":
        case "	":
          return "space";
        case "#":
          return "comment";
        case "%":
          return "directive-line";
        case "*":
          return "alias";
        case "&":
          return "anchor";
        case "!":
          return "tag";
        case "'":
          return "single-quoted-scalar";
        case '"':
          return "double-quoted-scalar";
        case "|":
        case ">":
          return "block-scalar-header";
      }
      return null;
    }
    exports.createScalarToken = cstScalar.createScalarToken;
    exports.resolveAsScalar = cstScalar.resolveAsScalar;
    exports.setScalarValue = cstScalar.setScalarValue;
    exports.stringify = cstStringify.stringify;
    exports.visit = cstVisit.visit;
    exports.BOM = BOM;
    exports.DOCUMENT = DOCUMENT;
    exports.FLOW_END = FLOW_END;
    exports.SCALAR = SCALAR;
    exports.isCollection = isCollection;
    exports.isScalar = isScalar;
    exports.prettyToken = prettyToken;
    exports.tokenType = tokenType;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/lexer.js
var require_lexer = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/lexer.js"(exports) {
    "use strict";
    var cst = require_cst();
    function isEmpty(ch) {
      switch (ch) {
        case void 0:
        case " ":
        case "\n":
        case "\r":
        case "	":
          return true;
        default:
          return false;
      }
    }
    var hexDigits = new Set("0123456789ABCDEFabcdef");
    var tagChars = new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()");
    var flowIndicatorChars = new Set(",[]{}");
    var invalidAnchorChars = new Set(" ,[]{}\n\r	");
    var isNotAnchorChar = (ch) => !ch || invalidAnchorChars.has(ch);
    var Lexer = class {
      constructor() {
        this.atEnd = false;
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        this.buffer = "";
        this.flowKey = false;
        this.flowLevel = 0;
        this.indentNext = 0;
        this.indentValue = 0;
        this.lineEndPos = null;
        this.next = null;
        this.pos = 0;
      }
      /**
       * Generate YAML tokens from the `source` string. If `incomplete`,
       * a part of the last line may be left as a buffer for the next call.
       *
       * @returns A generator of lexical tokens
       */
      *lex(source, incomplete = false) {
        if (source) {
          if (typeof source !== "string")
            throw TypeError("source is not a string");
          this.buffer = this.buffer ? this.buffer + source : source;
          this.lineEndPos = null;
        }
        this.atEnd = !incomplete;
        let next = this.next ?? "stream";
        while (next && (incomplete || this.hasChars(1)))
          next = yield* this.parseNext(next);
      }
      atLineEnd() {
        let i2 = this.pos;
        let ch = this.buffer[i2];
        while (ch === " " || ch === "	")
          ch = this.buffer[++i2];
        if (!ch || ch === "#" || ch === "\n")
          return true;
        if (ch === "\r")
          return this.buffer[i2 + 1] === "\n";
        return false;
      }
      charAt(n) {
        return this.buffer[this.pos + n];
      }
      continueScalar(offset) {
        let ch = this.buffer[offset];
        if (this.indentNext > 0) {
          let indent = 0;
          while (ch === " ")
            ch = this.buffer[++indent + offset];
          if (ch === "\r") {
            const next = this.buffer[indent + offset + 1];
            if (next === "\n" || !next && !this.atEnd)
              return offset + indent + 1;
          }
          return ch === "\n" || indent >= this.indentNext || !ch && !this.atEnd ? offset + indent : -1;
        }
        if (ch === "-" || ch === ".") {
          const dt = this.buffer.substr(offset, 3);
          if ((dt === "---" || dt === "...") && isEmpty(this.buffer[offset + 3]))
            return -1;
        }
        return offset;
      }
      getLine() {
        let end = this.lineEndPos;
        if (typeof end !== "number" || end !== -1 && end < this.pos) {
          end = this.buffer.indexOf("\n", this.pos);
          this.lineEndPos = end;
        }
        if (end === -1)
          return this.atEnd ? this.buffer.substring(this.pos) : null;
        if (this.buffer[end - 1] === "\r")
          end -= 1;
        return this.buffer.substring(this.pos, end);
      }
      hasChars(n) {
        return this.pos + n <= this.buffer.length;
      }
      setNext(state) {
        this.buffer = this.buffer.substring(this.pos);
        this.pos = 0;
        this.lineEndPos = null;
        this.next = state;
        return null;
      }
      peek(n) {
        return this.buffer.substr(this.pos, n);
      }
      *parseNext(next) {
        switch (next) {
          case "stream":
            return yield* this.parseStream();
          case "line-start":
            return yield* this.parseLineStart();
          case "block-start":
            return yield* this.parseBlockStart();
          case "doc":
            return yield* this.parseDocument();
          case "flow":
            return yield* this.parseFlowCollection();
          case "quoted-scalar":
            return yield* this.parseQuotedScalar();
          case "block-scalar":
            return yield* this.parseBlockScalar();
          case "plain-scalar":
            return yield* this.parsePlainScalar();
        }
      }
      *parseStream() {
        let line = this.getLine();
        if (line === null)
          return this.setNext("stream");
        if (line[0] === cst.BOM) {
          yield* this.pushCount(1);
          line = line.substring(1);
        }
        if (line[0] === "%") {
          let dirEnd = line.length;
          let cs = line.indexOf("#");
          while (cs !== -1) {
            const ch = line[cs - 1];
            if (ch === " " || ch === "	") {
              dirEnd = cs - 1;
              break;
            } else {
              cs = line.indexOf("#", cs + 1);
            }
          }
          while (true) {
            const ch = line[dirEnd - 1];
            if (ch === " " || ch === "	")
              dirEnd -= 1;
            else
              break;
          }
          const n = (yield* this.pushCount(dirEnd)) + (yield* this.pushSpaces(true));
          yield* this.pushCount(line.length - n);
          this.pushNewline();
          return "stream";
        }
        if (this.atLineEnd()) {
          const sp = yield* this.pushSpaces(true);
          yield* this.pushCount(line.length - sp);
          yield* this.pushNewline();
          return "stream";
        }
        yield cst.DOCUMENT;
        return yield* this.parseLineStart();
      }
      *parseLineStart() {
        const ch = this.charAt(0);
        if (!ch && !this.atEnd)
          return this.setNext("line-start");
        if (ch === "-" || ch === ".") {
          if (!this.atEnd && !this.hasChars(4))
            return this.setNext("line-start");
          const s = this.peek(3);
          if ((s === "---" || s === "...") && isEmpty(this.charAt(3))) {
            yield* this.pushCount(3);
            this.indentValue = 0;
            this.indentNext = 0;
            return s === "---" ? "doc" : "stream";
          }
        }
        this.indentValue = yield* this.pushSpaces(false);
        if (this.indentNext > this.indentValue && !isEmpty(this.charAt(1)))
          this.indentNext = this.indentValue;
        return yield* this.parseBlockStart();
      }
      *parseBlockStart() {
        const [ch0, ch1] = this.peek(2);
        if (!ch1 && !this.atEnd)
          return this.setNext("block-start");
        if ((ch0 === "-" || ch0 === "?" || ch0 === ":") && isEmpty(ch1)) {
          const n = (yield* this.pushCount(1)) + (yield* this.pushSpaces(true));
          this.indentNext = this.indentValue + 1;
          this.indentValue += n;
          return "block-start";
        }
        return "doc";
      }
      *parseDocument() {
        yield* this.pushSpaces(true);
        const line = this.getLine();
        if (line === null)
          return this.setNext("doc");
        let n = yield* this.pushIndicators();
        switch (line[n]) {
          case "#":
            yield* this.pushCount(line.length - n);
          // fallthrough
          case void 0:
            yield* this.pushNewline();
            return yield* this.parseLineStart();
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel = 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            return "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "doc";
          case '"':
          case "'":
            return yield* this.parseQuotedScalar();
          case "|":
          case ">":
            n += yield* this.parseBlockScalarHeader();
            n += yield* this.pushSpaces(true);
            yield* this.pushCount(line.length - n);
            yield* this.pushNewline();
            return yield* this.parseBlockScalar();
          default:
            return yield* this.parsePlainScalar();
        }
      }
      *parseFlowCollection() {
        let nl, sp;
        let indent = -1;
        do {
          nl = yield* this.pushNewline();
          if (nl > 0) {
            sp = yield* this.pushSpaces(false);
            this.indentValue = indent = sp;
          } else {
            sp = 0;
          }
          sp += yield* this.pushSpaces(true);
        } while (nl + sp > 0);
        const line = this.getLine();
        if (line === null)
          return this.setNext("flow");
        if (indent !== -1 && indent < this.indentNext && line[0] !== "#" || indent === 0 && (line.startsWith("---") || line.startsWith("...")) && isEmpty(line[3])) {
          const atFlowEndMarker = indent === this.indentNext - 1 && this.flowLevel === 1 && (line[0] === "]" || line[0] === "}");
          if (!atFlowEndMarker) {
            this.flowLevel = 0;
            yield cst.FLOW_END;
            return yield* this.parseLineStart();
          }
        }
        let n = 0;
        while (line[n] === ",") {
          n += yield* this.pushCount(1);
          n += yield* this.pushSpaces(true);
          this.flowKey = false;
        }
        n += yield* this.pushIndicators();
        switch (line[n]) {
          case void 0:
            return "flow";
          case "#":
            yield* this.pushCount(line.length - n);
            return "flow";
          case "{":
          case "[":
            yield* this.pushCount(1);
            this.flowKey = false;
            this.flowLevel += 1;
            return "flow";
          case "}":
          case "]":
            yield* this.pushCount(1);
            this.flowKey = true;
            this.flowLevel -= 1;
            return this.flowLevel ? "flow" : "doc";
          case "*":
            yield* this.pushUntil(isNotAnchorChar);
            return "flow";
          case '"':
          case "'":
            this.flowKey = true;
            return yield* this.parseQuotedScalar();
          case ":": {
            const next = this.charAt(1);
            if (this.flowKey || isEmpty(next) || next === ",") {
              this.flowKey = false;
              yield* this.pushCount(1);
              yield* this.pushSpaces(true);
              return "flow";
            }
          }
          // fallthrough
          default:
            this.flowKey = false;
            return yield* this.parsePlainScalar();
        }
      }
      *parseQuotedScalar() {
        const quote = this.charAt(0);
        let end = this.buffer.indexOf(quote, this.pos + 1);
        if (quote === "'") {
          while (end !== -1 && this.buffer[end + 1] === "'")
            end = this.buffer.indexOf("'", end + 2);
        } else {
          while (end !== -1) {
            let n = 0;
            while (this.buffer[end - 1 - n] === "\\")
              n += 1;
            if (n % 2 === 0)
              break;
            end = this.buffer.indexOf('"', end + 1);
          }
        }
        const qb = this.buffer.substring(0, end);
        let nl = qb.indexOf("\n", this.pos);
        if (nl !== -1) {
          while (nl !== -1) {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = qb.indexOf("\n", cs);
          }
          if (nl !== -1) {
            end = nl - (qb[nl - 1] === "\r" ? 2 : 1);
          }
        }
        if (end === -1) {
          if (!this.atEnd)
            return this.setNext("quoted-scalar");
          end = this.buffer.length;
        }
        yield* this.pushToIndex(end + 1, false);
        return this.flowLevel ? "flow" : "doc";
      }
      *parseBlockScalarHeader() {
        this.blockScalarIndent = -1;
        this.blockScalarKeep = false;
        let i2 = this.pos;
        while (true) {
          const ch = this.buffer[++i2];
          if (ch === "+")
            this.blockScalarKeep = true;
          else if (ch > "0" && ch <= "9")
            this.blockScalarIndent = Number(ch) - 1;
          else if (ch !== "-")
            break;
        }
        return yield* this.pushUntil((ch) => isEmpty(ch) || ch === "#");
      }
      *parseBlockScalar() {
        let nl = this.pos - 1;
        let indent = 0;
        let ch;
        loop: for (let i3 = this.pos; ch = this.buffer[i3]; ++i3) {
          switch (ch) {
            case " ":
              indent += 1;
              break;
            case "\n":
              nl = i3;
              indent = 0;
              break;
            case "\r": {
              const next = this.buffer[i3 + 1];
              if (!next && !this.atEnd)
                return this.setNext("block-scalar");
              if (next === "\n")
                break;
            }
            // fallthrough
            default:
              break loop;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("block-scalar");
        if (indent >= this.indentNext) {
          if (this.blockScalarIndent === -1)
            this.indentNext = indent;
          else {
            this.indentNext = this.blockScalarIndent + (this.indentNext === 0 ? 1 : this.indentNext);
          }
          do {
            const cs = this.continueScalar(nl + 1);
            if (cs === -1)
              break;
            nl = this.buffer.indexOf("\n", cs);
          } while (nl !== -1);
          if (nl === -1) {
            if (!this.atEnd)
              return this.setNext("block-scalar");
            nl = this.buffer.length;
          }
        }
        let i2 = nl + 1;
        ch = this.buffer[i2];
        while (ch === " ")
          ch = this.buffer[++i2];
        if (ch === "	") {
          while (ch === "	" || ch === " " || ch === "\r" || ch === "\n")
            ch = this.buffer[++i2];
          nl = i2 - 1;
        } else if (!this.blockScalarKeep) {
          do {
            let i3 = nl - 1;
            let ch2 = this.buffer[i3];
            if (ch2 === "\r")
              ch2 = this.buffer[--i3];
            const lastChar = i3;
            while (ch2 === " ")
              ch2 = this.buffer[--i3];
            if (ch2 === "\n" && i3 >= this.pos && i3 + 1 + indent > lastChar)
              nl = i3;
            else
              break;
          } while (true);
        }
        yield cst.SCALAR;
        yield* this.pushToIndex(nl + 1, true);
        return yield* this.parseLineStart();
      }
      *parsePlainScalar() {
        const inFlow = this.flowLevel > 0;
        let end = this.pos - 1;
        let i2 = this.pos - 1;
        let ch;
        while (ch = this.buffer[++i2]) {
          if (ch === ":") {
            const next = this.buffer[i2 + 1];
            if (isEmpty(next) || inFlow && flowIndicatorChars.has(next))
              break;
            end = i2;
          } else if (isEmpty(ch)) {
            let next = this.buffer[i2 + 1];
            if (ch === "\r") {
              if (next === "\n") {
                i2 += 1;
                ch = "\n";
                next = this.buffer[i2 + 1];
              } else
                end = i2;
            }
            if (next === "#" || inFlow && flowIndicatorChars.has(next))
              break;
            if (ch === "\n") {
              const cs = this.continueScalar(i2 + 1);
              if (cs === -1)
                break;
              i2 = Math.max(i2, cs - 2);
            }
          } else {
            if (inFlow && flowIndicatorChars.has(ch))
              break;
            end = i2;
          }
        }
        if (!ch && !this.atEnd)
          return this.setNext("plain-scalar");
        yield cst.SCALAR;
        yield* this.pushToIndex(end + 1, true);
        return inFlow ? "flow" : "doc";
      }
      *pushCount(n) {
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos += n;
          return n;
        }
        return 0;
      }
      *pushToIndex(i2, allowEmpty) {
        const s = this.buffer.slice(this.pos, i2);
        if (s) {
          yield s;
          this.pos += s.length;
          return s.length;
        } else if (allowEmpty)
          yield "";
        return 0;
      }
      *pushIndicators() {
        let n = 0;
        loop: while (true) {
          switch (this.charAt(0)) {
            case "!":
              n += yield* this.pushTag();
              n += yield* this.pushSpaces(true);
              continue loop;
            case "&":
              n += yield* this.pushUntil(isNotAnchorChar);
              n += yield* this.pushSpaces(true);
              continue loop;
            case "-":
            // this is an error
            case "?":
            // this is an error outside flow collections
            case ":": {
              const inFlow = this.flowLevel > 0;
              const ch1 = this.charAt(1);
              if (isEmpty(ch1) || inFlow && flowIndicatorChars.has(ch1)) {
                if (!inFlow)
                  this.indentNext = this.indentValue + 1;
                else if (this.flowKey)
                  this.flowKey = false;
                n += yield* this.pushCount(1);
                n += yield* this.pushSpaces(true);
                continue loop;
              }
            }
          }
          break loop;
        }
        return n;
      }
      *pushTag() {
        if (this.charAt(1) === "<") {
          let i2 = this.pos + 2;
          let ch = this.buffer[i2];
          while (!isEmpty(ch) && ch !== ">")
            ch = this.buffer[++i2];
          return yield* this.pushToIndex(ch === ">" ? i2 + 1 : i2, false);
        } else {
          let i2 = this.pos + 1;
          let ch = this.buffer[i2];
          while (ch) {
            if (tagChars.has(ch))
              ch = this.buffer[++i2];
            else if (ch === "%" && hexDigits.has(this.buffer[i2 + 1]) && hexDigits.has(this.buffer[i2 + 2])) {
              ch = this.buffer[i2 += 3];
            } else
              break;
          }
          return yield* this.pushToIndex(i2, false);
        }
      }
      *pushNewline() {
        const ch = this.buffer[this.pos];
        if (ch === "\n")
          return yield* this.pushCount(1);
        else if (ch === "\r" && this.charAt(1) === "\n")
          return yield* this.pushCount(2);
        else
          return 0;
      }
      *pushSpaces(allowTabs) {
        let i2 = this.pos - 1;
        let ch;
        do {
          ch = this.buffer[++i2];
        } while (ch === " " || allowTabs && ch === "	");
        const n = i2 - this.pos;
        if (n > 0) {
          yield this.buffer.substr(this.pos, n);
          this.pos = i2;
        }
        return n;
      }
      *pushUntil(test) {
        let i2 = this.pos;
        let ch = this.buffer[i2];
        while (!test(ch))
          ch = this.buffer[++i2];
        return yield* this.pushToIndex(i2, false);
      }
    };
    exports.Lexer = Lexer;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/line-counter.js
var require_line_counter = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/line-counter.js"(exports) {
    "use strict";
    var LineCounter = class {
      constructor() {
        this.lineStarts = [];
        this.addNewLine = (offset) => this.lineStarts.push(offset);
        this.linePos = (offset) => {
          let low = 0;
          let high = this.lineStarts.length;
          while (low < high) {
            const mid = low + high >> 1;
            if (this.lineStarts[mid] < offset)
              low = mid + 1;
            else
              high = mid;
          }
          if (this.lineStarts[low] === offset)
            return { line: low + 1, col: 1 };
          if (low === 0)
            return { line: 0, col: offset };
          const start2 = this.lineStarts[low - 1];
          return { line: low, col: offset - start2 + 1 };
        };
      }
    };
    exports.LineCounter = LineCounter;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/parser.js
var require_parser = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/parse/parser.js"(exports) {
    "use strict";
    var node_process = __require("process");
    var cst = require_cst();
    var lexer = require_lexer();
    function includesToken(list3, type) {
      for (let i2 = 0; i2 < list3.length; ++i2)
        if (list3[i2].type === type)
          return true;
      return false;
    }
    function findNonEmptyIndex(list3) {
      for (let i2 = 0; i2 < list3.length; ++i2) {
        switch (list3[i2].type) {
          case "space":
          case "comment":
          case "newline":
            break;
          default:
            return i2;
        }
      }
      return -1;
    }
    function isFlowToken(token) {
      switch (token?.type) {
        case "alias":
        case "scalar":
        case "single-quoted-scalar":
        case "double-quoted-scalar":
        case "flow-collection":
          return true;
        default:
          return false;
      }
    }
    function getPrevProps(parent) {
      switch (parent.type) {
        case "document":
          return parent.start;
        case "block-map": {
          const it = parent.items[parent.items.length - 1];
          return it.sep ?? it.start;
        }
        case "block-seq":
          return parent.items[parent.items.length - 1].start;
        /* istanbul ignore next should not happen */
        default:
          return [];
      }
    }
    function getFirstKeyStartProps(prev) {
      if (prev.length === 0)
        return [];
      let i2 = prev.length;
      loop: while (--i2 >= 0) {
        switch (prev[i2].type) {
          case "doc-start":
          case "explicit-key-ind":
          case "map-value-ind":
          case "seq-item-ind":
          case "newline":
            break loop;
        }
      }
      while (prev[++i2]?.type === "space") {
      }
      return prev.splice(i2, prev.length);
    }
    function arrayPushArray(target, source) {
      if (source.length < 1e5)
        Array.prototype.push.apply(target, source);
      else
        for (let i2 = 0; i2 < source.length; ++i2)
          target.push(source[i2]);
    }
    function fixFlowSeqItems(fc) {
      if (fc.start.type === "flow-seq-start") {
        for (const it of fc.items) {
          if (it.sep && !it.value && !includesToken(it.start, "explicit-key-ind") && !includesToken(it.sep, "map-value-ind")) {
            if (it.key)
              it.value = it.key;
            delete it.key;
            if (isFlowToken(it.value)) {
              if (it.value.end)
                arrayPushArray(it.value.end, it.sep);
              else
                it.value.end = it.sep;
            } else
              arrayPushArray(it.start, it.sep);
            delete it.sep;
          }
        }
      }
    }
    var Parser2 = class {
      /**
       * @param onNewLine - If defined, called separately with the start position of
       *   each new line (in `parse()`, including the start of input).
       */
      constructor(onNewLine) {
        this.atNewLine = true;
        this.atScalar = false;
        this.indent = 0;
        this.offset = 0;
        this.onKeyLine = false;
        this.stack = [];
        this.source = "";
        this.type = "";
        this.lexer = new lexer.Lexer();
        this.onNewLine = onNewLine;
      }
      /**
       * Parse `source` as a YAML stream.
       * If `incomplete`, a part of the last line may be left as a buffer for the next call.
       *
       * Errors are not thrown, but yielded as `{ type: 'error', message }` tokens.
       *
       * @returns A generator of tokens representing each directive, document, and other structure.
       */
      *parse(source, incomplete = false) {
        if (this.onNewLine && this.offset === 0)
          this.onNewLine(0);
        for (const lexeme of this.lexer.lex(source, incomplete))
          yield* this.next(lexeme);
        if (!incomplete)
          yield* this.end();
      }
      /**
       * Advance the parser by the `source` of one lexical token.
       */
      *next(source) {
        this.source = source;
        if (node_process.env.LOG_TOKENS)
          console.log("|", cst.prettyToken(source));
        if (this.atScalar) {
          this.atScalar = false;
          yield* this.step();
          this.offset += source.length;
          return;
        }
        const type = cst.tokenType(source);
        if (!type) {
          const message = `Not a YAML token: ${source}`;
          yield* this.pop({ type: "error", offset: this.offset, message, source });
          this.offset += source.length;
        } else if (type === "scalar") {
          this.atNewLine = false;
          this.atScalar = true;
          this.type = "scalar";
        } else {
          this.type = type;
          yield* this.step();
          switch (type) {
            case "newline":
              this.atNewLine = true;
              this.indent = 0;
              if (this.onNewLine)
                this.onNewLine(this.offset + source.length);
              break;
            case "space":
              if (this.atNewLine && source[0] === " ")
                this.indent += source.length;
              break;
            case "explicit-key-ind":
            case "map-value-ind":
            case "seq-item-ind":
              if (this.atNewLine)
                this.indent += source.length;
              break;
            case "doc-mode":
            case "flow-error-end":
              return;
            default:
              this.atNewLine = false;
          }
          this.offset += source.length;
        }
      }
      /** Call at end of input to push out any remaining constructions */
      *end() {
        while (this.stack.length > 0)
          yield* this.pop();
      }
      get sourceToken() {
        const st = {
          type: this.type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
        return st;
      }
      *step() {
        const top = this.peek(1);
        if (this.type === "doc-end" && top?.type !== "doc-end") {
          while (this.stack.length > 0)
            yield* this.pop();
          this.stack.push({
            type: "doc-end",
            offset: this.offset,
            source: this.source
          });
          return;
        }
        if (!top)
          return yield* this.stream();
        switch (top.type) {
          case "document":
            return yield* this.document(top);
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return yield* this.scalar(top);
          case "block-scalar":
            return yield* this.blockScalar(top);
          case "block-map":
            return yield* this.blockMap(top);
          case "block-seq":
            return yield* this.blockSequence(top);
          case "flow-collection":
            return yield* this.flowCollection(top);
          case "doc-end":
            return yield* this.documentEnd(top);
        }
        yield* this.pop();
      }
      peek(n) {
        return this.stack[this.stack.length - n];
      }
      *pop(error) {
        const token = error ?? this.stack.pop();
        if (!token) {
          const message = "Tried to pop an empty stack";
          yield { type: "error", offset: this.offset, source: "", message };
        } else if (this.stack.length === 0) {
          yield token;
        } else {
          const top = this.peek(1);
          if (token.type === "block-scalar") {
            token.indent = "indent" in top ? top.indent : 0;
          } else if (token.type === "flow-collection" && top.type === "document") {
            token.indent = 0;
          }
          if (token.type === "flow-collection")
            fixFlowSeqItems(token);
          switch (top.type) {
            case "document":
              top.value = token;
              break;
            case "block-scalar":
              top.props.push(token);
              break;
            case "block-map": {
              const it = top.items[top.items.length - 1];
              if (it.value) {
                top.items.push({ start: [], key: token, sep: [] });
                this.onKeyLine = true;
                return;
              } else if (it.sep) {
                it.value = token;
              } else {
                Object.assign(it, { key: token, sep: [] });
                this.onKeyLine = !it.explicitKey;
                return;
              }
              break;
            }
            case "block-seq": {
              const it = top.items[top.items.length - 1];
              if (it.value)
                top.items.push({ start: [], value: token });
              else
                it.value = token;
              break;
            }
            case "flow-collection": {
              const it = top.items[top.items.length - 1];
              if (!it || it.value)
                top.items.push({ start: [], key: token, sep: [] });
              else if (it.sep)
                it.value = token;
              else
                Object.assign(it, { key: token, sep: [] });
              return;
            }
            /* istanbul ignore next should not happen */
            default:
              yield* this.pop();
              yield* this.pop(token);
          }
          if ((top.type === "document" || top.type === "block-map" || top.type === "block-seq") && (token.type === "block-map" || token.type === "block-seq")) {
            const last = token.items[token.items.length - 1];
            if (last && !last.sep && !last.value && last.start.length > 0 && findNonEmptyIndex(last.start) === -1 && (token.indent === 0 || last.start.every((st) => st.type !== "comment" || st.indent < token.indent))) {
              if (top.type === "document")
                top.end = last.start;
              else
                top.items.push({ start: last.start });
              token.items.splice(-1, 1);
            }
          }
        }
      }
      *stream() {
        switch (this.type) {
          case "directive-line":
            yield { type: "directive", offset: this.offset, source: this.source };
            return;
          case "byte-order-mark":
          case "space":
          case "comment":
          case "newline":
            yield this.sourceToken;
            return;
          case "doc-mode":
          case "doc-start": {
            const doc = {
              type: "document",
              offset: this.offset,
              start: []
            };
            if (this.type === "doc-start")
              doc.start.push(this.sourceToken);
            this.stack.push(doc);
            return;
          }
        }
        yield {
          type: "error",
          offset: this.offset,
          message: `Unexpected ${this.type} token in YAML stream`,
          source: this.source
        };
      }
      *document(doc) {
        if (doc.value)
          return yield* this.lineEnd(doc);
        switch (this.type) {
          case "doc-start": {
            if (findNonEmptyIndex(doc.start) !== -1) {
              yield* this.pop();
              yield* this.step();
            } else
              doc.start.push(this.sourceToken);
            return;
          }
          case "anchor":
          case "tag":
          case "space":
          case "comment":
          case "newline":
            doc.start.push(this.sourceToken);
            return;
        }
        const bv = this.startBlockValue(doc);
        if (bv)
          this.stack.push(bv);
        else {
          yield {
            type: "error",
            offset: this.offset,
            message: `Unexpected ${this.type} token in YAML document`,
            source: this.source
          };
        }
      }
      *scalar(scalar) {
        if (this.type === "map-value-ind") {
          const prev = getPrevProps(this.peek(2));
          const start2 = getFirstKeyStartProps(prev);
          let sep2;
          if (scalar.end) {
            sep2 = scalar.end;
            sep2.push(this.sourceToken);
            delete scalar.end;
          } else
            sep2 = [this.sourceToken];
          const map = {
            type: "block-map",
            offset: scalar.offset,
            indent: scalar.indent,
            items: [{ start: start2, key: scalar, sep: sep2 }]
          };
          this.onKeyLine = true;
          this.stack[this.stack.length - 1] = map;
        } else
          yield* this.lineEnd(scalar);
      }
      *blockScalar(scalar) {
        switch (this.type) {
          case "space":
          case "comment":
          case "newline":
            scalar.props.push(this.sourceToken);
            return;
          case "scalar":
            scalar.source = this.source;
            this.atNewLine = true;
            this.indent = 0;
            if (this.onNewLine) {
              let nl = this.source.indexOf("\n") + 1;
              while (nl !== 0) {
                this.onNewLine(this.offset + nl);
                nl = this.source.indexOf("\n", nl) + 1;
              }
            }
            yield* this.pop();
            break;
          /* istanbul ignore next should not happen */
          default:
            yield* this.pop();
            yield* this.step();
        }
      }
      *blockMap(map) {
        const it = map.items[map.items.length - 1];
        switch (this.type) {
          case "newline":
            this.onKeyLine = false;
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              it.start.push(this.sourceToken);
            }
            return;
          case "space":
          case "comment":
            if (it.value) {
              map.items.push({ start: [this.sourceToken] });
            } else if (it.sep) {
              it.sep.push(this.sourceToken);
            } else {
              if (this.atIndentedComment(it.start, map.indent)) {
                const prev = map.items[map.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  map.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
        }
        if (this.indent >= map.indent) {
          const atMapIndent = !this.onKeyLine && this.indent === map.indent;
          const atNextItem = atMapIndent && (it.sep || it.explicitKey) && this.type !== "seq-item-ind";
          let start2 = [];
          if (atNextItem && it.sep && !it.value) {
            const nl = [];
            for (let i2 = 0; i2 < it.sep.length; ++i2) {
              const st = it.sep[i2];
              switch (st.type) {
                case "newline":
                  nl.push(i2);
                  break;
                case "space":
                  break;
                case "comment":
                  if (st.indent > map.indent)
                    nl.length = 0;
                  break;
                default:
                  nl.length = 0;
              }
            }
            if (nl.length >= 2)
              start2 = it.sep.splice(nl[1]);
          }
          switch (this.type) {
            case "anchor":
            case "tag":
              if (atNextItem || it.value) {
                start2.push(this.sourceToken);
                map.items.push({ start: start2 });
                this.onKeyLine = true;
              } else if (it.sep) {
                it.sep.push(this.sourceToken);
              } else {
                it.start.push(this.sourceToken);
              }
              return;
            case "explicit-key-ind":
              if (!it.sep && !it.explicitKey) {
                it.start.push(this.sourceToken);
                it.explicitKey = true;
              } else if (atNextItem || it.value) {
                start2.push(this.sourceToken);
                map.items.push({ start: start2, explicitKey: true });
              } else {
                this.stack.push({
                  type: "block-map",
                  offset: this.offset,
                  indent: this.indent,
                  items: [{ start: [this.sourceToken], explicitKey: true }]
                });
              }
              this.onKeyLine = true;
              return;
            case "map-value-ind":
              if (it.explicitKey) {
                if (!it.sep) {
                  if (includesToken(it.start, "newline")) {
                    Object.assign(it, { key: null, sep: [this.sourceToken] });
                  } else {
                    const start3 = getFirstKeyStartProps(it.start);
                    this.stack.push({
                      type: "block-map",
                      offset: this.offset,
                      indent: this.indent,
                      items: [{ start: start3, key: null, sep: [this.sourceToken] }]
                    });
                  }
                } else if (it.value) {
                  map.items.push({ start: [], key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start2, key: null, sep: [this.sourceToken] }]
                  });
                } else if (isFlowToken(it.key) && !includesToken(it.sep, "newline")) {
                  const start3 = getFirstKeyStartProps(it.start);
                  const key = it.key;
                  const sep2 = it.sep;
                  sep2.push(this.sourceToken);
                  delete it.key;
                  delete it.sep;
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: start3, key, sep: sep2 }]
                  });
                } else if (start2.length > 0) {
                  it.sep = it.sep.concat(start2, this.sourceToken);
                } else {
                  it.sep.push(this.sourceToken);
                }
              } else {
                if (!it.sep) {
                  Object.assign(it, { key: null, sep: [this.sourceToken] });
                } else if (it.value || atNextItem) {
                  map.items.push({ start: start2, key: null, sep: [this.sourceToken] });
                } else if (includesToken(it.sep, "map-value-ind")) {
                  this.stack.push({
                    type: "block-map",
                    offset: this.offset,
                    indent: this.indent,
                    items: [{ start: [], key: null, sep: [this.sourceToken] }]
                  });
                } else {
                  it.sep.push(this.sourceToken);
                }
              }
              this.onKeyLine = true;
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs2 = this.flowScalar(this.type);
              if (atNextItem || it.value) {
                map.items.push({ start: start2, key: fs2, sep: [] });
                this.onKeyLine = true;
              } else if (it.sep) {
                this.stack.push(fs2);
              } else {
                Object.assign(it, { key: fs2, sep: [] });
                this.onKeyLine = true;
              }
              return;
            }
            default: {
              const bv = this.startBlockValue(map);
              if (bv) {
                if (bv.type === "block-seq") {
                  if (!it.explicitKey && it.sep && !includesToken(it.sep, "newline")) {
                    yield* this.pop({
                      type: "error",
                      offset: this.offset,
                      message: "Unexpected block-seq-ind on same line with key",
                      source: this.source
                    });
                    return;
                  }
                } else if (atMapIndent) {
                  map.items.push({ start: start2 });
                }
                this.stack.push(bv);
                return;
              }
            }
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *blockSequence(seq) {
        const it = seq.items[seq.items.length - 1];
        switch (this.type) {
          case "newline":
            if (it.value) {
              const end = "end" in it.value ? it.value.end : void 0;
              const last = Array.isArray(end) ? end[end.length - 1] : void 0;
              if (last?.type === "comment")
                end?.push(this.sourceToken);
              else
                seq.items.push({ start: [this.sourceToken] });
            } else
              it.start.push(this.sourceToken);
            return;
          case "space":
          case "comment":
            if (it.value)
              seq.items.push({ start: [this.sourceToken] });
            else {
              if (this.atIndentedComment(it.start, seq.indent)) {
                const prev = seq.items[seq.items.length - 2];
                const end = prev?.value?.end;
                if (Array.isArray(end)) {
                  arrayPushArray(end, it.start);
                  end.push(this.sourceToken);
                  seq.items.pop();
                  return;
                }
              }
              it.start.push(this.sourceToken);
            }
            return;
          case "anchor":
          case "tag":
            if (it.value || this.indent <= seq.indent)
              break;
            it.start.push(this.sourceToken);
            return;
          case "seq-item-ind":
            if (this.indent !== seq.indent)
              break;
            if (it.value || includesToken(it.start, "seq-item-ind"))
              seq.items.push({ start: [this.sourceToken] });
            else
              it.start.push(this.sourceToken);
            return;
        }
        if (this.indent > seq.indent) {
          const bv = this.startBlockValue(seq);
          if (bv) {
            this.stack.push(bv);
            return;
          }
        }
        yield* this.pop();
        yield* this.step();
      }
      *flowCollection(fc) {
        const it = fc.items[fc.items.length - 1];
        if (this.type === "flow-error-end") {
          let top;
          do {
            yield* this.pop();
            top = this.peek(1);
          } while (top?.type === "flow-collection");
        } else if (fc.end.length === 0) {
          switch (this.type) {
            case "comma":
            case "explicit-key-ind":
              if (!it || it.sep)
                fc.items.push({ start: [this.sourceToken] });
              else
                it.start.push(this.sourceToken);
              return;
            case "map-value-ind":
              if (!it || it.value)
                fc.items.push({ start: [], key: null, sep: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                Object.assign(it, { key: null, sep: [this.sourceToken] });
              return;
            case "space":
            case "comment":
            case "newline":
            case "anchor":
            case "tag":
              if (!it || it.value)
                fc.items.push({ start: [this.sourceToken] });
              else if (it.sep)
                it.sep.push(this.sourceToken);
              else
                it.start.push(this.sourceToken);
              return;
            case "alias":
            case "scalar":
            case "single-quoted-scalar":
            case "double-quoted-scalar": {
              const fs2 = this.flowScalar(this.type);
              if (!it || it.value)
                fc.items.push({ start: [], key: fs2, sep: [] });
              else if (it.sep)
                this.stack.push(fs2);
              else
                Object.assign(it, { key: fs2, sep: [] });
              return;
            }
            case "flow-map-end":
            case "flow-seq-end":
              fc.end.push(this.sourceToken);
              return;
          }
          const bv = this.startBlockValue(fc);
          if (bv)
            this.stack.push(bv);
          else {
            yield* this.pop();
            yield* this.step();
          }
        } else {
          const parent = this.peek(2);
          if (parent.type === "block-map" && (this.type === "map-value-ind" && parent.indent === fc.indent || this.type === "newline" && !parent.items[parent.items.length - 1].sep)) {
            yield* this.pop();
            yield* this.step();
          } else if (this.type === "map-value-ind" && parent.type !== "flow-collection") {
            const prev = getPrevProps(parent);
            const start2 = getFirstKeyStartProps(prev);
            fixFlowSeqItems(fc);
            const sep2 = fc.end.splice(1, fc.end.length);
            sep2.push(this.sourceToken);
            const map = {
              type: "block-map",
              offset: fc.offset,
              indent: fc.indent,
              items: [{ start: start2, key: fc, sep: sep2 }]
            };
            this.onKeyLine = true;
            this.stack[this.stack.length - 1] = map;
          } else {
            yield* this.lineEnd(fc);
          }
        }
      }
      flowScalar(type) {
        if (this.onNewLine) {
          let nl = this.source.indexOf("\n") + 1;
          while (nl !== 0) {
            this.onNewLine(this.offset + nl);
            nl = this.source.indexOf("\n", nl) + 1;
          }
        }
        return {
          type,
          offset: this.offset,
          indent: this.indent,
          source: this.source
        };
      }
      startBlockValue(parent) {
        switch (this.type) {
          case "alias":
          case "scalar":
          case "single-quoted-scalar":
          case "double-quoted-scalar":
            return this.flowScalar(this.type);
          case "block-scalar-header":
            return {
              type: "block-scalar",
              offset: this.offset,
              indent: this.indent,
              props: [this.sourceToken],
              source: ""
            };
          case "flow-map-start":
          case "flow-seq-start":
            return {
              type: "flow-collection",
              offset: this.offset,
              indent: this.indent,
              start: this.sourceToken,
              items: [],
              end: []
            };
          case "seq-item-ind":
            return {
              type: "block-seq",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: [this.sourceToken] }]
            };
          case "explicit-key-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start2 = getFirstKeyStartProps(prev);
            start2.push(this.sourceToken);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: start2, explicitKey: true }]
            };
          }
          case "map-value-ind": {
            this.onKeyLine = true;
            const prev = getPrevProps(parent);
            const start2 = getFirstKeyStartProps(prev);
            return {
              type: "block-map",
              offset: this.offset,
              indent: this.indent,
              items: [{ start: start2, key: null, sep: [this.sourceToken] }]
            };
          }
        }
        return null;
      }
      atIndentedComment(start2, indent) {
        if (this.type !== "comment")
          return false;
        if (this.indent <= indent)
          return false;
        return start2.every((st) => st.type === "newline" || st.type === "space");
      }
      *documentEnd(docEnd) {
        if (this.type !== "doc-mode") {
          if (docEnd.end)
            docEnd.end.push(this.sourceToken);
          else
            docEnd.end = [this.sourceToken];
          if (this.type === "newline")
            yield* this.pop();
        }
      }
      *lineEnd(token) {
        switch (this.type) {
          case "comma":
          case "doc-start":
          case "doc-end":
          case "flow-seq-end":
          case "flow-map-end":
          case "map-value-ind":
            yield* this.pop();
            yield* this.step();
            break;
          case "newline":
            this.onKeyLine = false;
          // fallthrough
          case "space":
          case "comment":
          default:
            if (token.end)
              token.end.push(this.sourceToken);
            else
              token.end = [this.sourceToken];
            if (this.type === "newline")
              yield* this.pop();
        }
      }
    };
    exports.Parser = Parser2;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/public-api.js
var require_public_api = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/public-api.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var errors = require_errors();
    var log = require_log();
    var identity = require_identity();
    var lineCounter = require_line_counter();
    var parser2 = require_parser();
    function parseOptions(options) {
      const prettyErrors = options.prettyErrors !== false;
      const lineCounter$1 = options.lineCounter || prettyErrors && new lineCounter.LineCounter() || null;
      return { lineCounter: lineCounter$1, prettyErrors };
    }
    function parseAllDocuments2(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser2.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      const docs = Array.from(composer$1.compose(parser$1.parse(source)));
      if (prettyErrors && lineCounter2)
        for (const doc of docs) {
          doc.errors.forEach(errors.prettifyError(source, lineCounter2));
          doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
        }
      if (docs.length > 0)
        return docs;
      return Object.assign([], { empty: true }, composer$1.streamInfo());
    }
    function parseDocument(source, options = {}) {
      const { lineCounter: lineCounter2, prettyErrors } = parseOptions(options);
      const parser$1 = new parser2.Parser(lineCounter2?.addNewLine);
      const composer$1 = new composer.Composer(options);
      let doc = null;
      for (const _doc of composer$1.compose(parser$1.parse(source), true, source.length)) {
        if (!doc)
          doc = _doc;
        else if (doc.options.logLevel !== "silent") {
          doc.errors.push(new errors.YAMLParseError(_doc.range.slice(0, 2), "MULTIPLE_DOCS", "Source contains multiple documents; please use YAML.parseAllDocuments()"));
          break;
        }
      }
      if (prettyErrors && lineCounter2) {
        doc.errors.forEach(errors.prettifyError(source, lineCounter2));
        doc.warnings.forEach(errors.prettifyError(source, lineCounter2));
      }
      return doc;
    }
    function parse4(src, reviver, options) {
      let _reviver = void 0;
      if (typeof reviver === "function") {
        _reviver = reviver;
      } else if (options === void 0 && reviver && typeof reviver === "object") {
        options = reviver;
      }
      const doc = parseDocument(src, options);
      if (!doc)
        return null;
      doc.warnings.forEach((warning) => log.warn(doc.options.logLevel, warning));
      if (doc.errors.length > 0) {
        if (doc.options.logLevel !== "silent")
          throw doc.errors[0];
        else
          doc.errors = [];
      }
      return doc.toJS(Object.assign({ reviver: _reviver }, options));
    }
    function stringify(value, replacer, options) {
      let _replacer = null;
      if (typeof replacer === "function" || Array.isArray(replacer)) {
        _replacer = replacer;
      } else if (options === void 0 && replacer) {
        options = replacer;
      }
      if (typeof options === "string")
        options = options.length;
      if (typeof options === "number") {
        const indent = Math.round(options);
        options = indent < 1 ? void 0 : indent > 8 ? { indent: 8 } : { indent };
      }
      if (value === void 0) {
        const { keepUndefined } = options ?? replacer ?? {};
        if (!keepUndefined)
          return void 0;
      }
      if (identity.isDocument(value) && !_replacer)
        return value.toString(options);
      return new Document.Document(value, _replacer, options).toString(options);
    }
    exports.parse = parse4;
    exports.parseAllDocuments = parseAllDocuments2;
    exports.parseDocument = parseDocument;
    exports.stringify = stringify;
  }
});

// ../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/.pnpm/yaml@2.9.1/node_modules/yaml/dist/index.js"(exports) {
    "use strict";
    var composer = require_composer();
    var Document = require_Document();
    var Schema = require_Schema();
    var errors = require_errors();
    var Alias = require_Alias();
    var identity = require_identity();
    var Pair = require_Pair();
    var Scalar = require_Scalar();
    var YAMLMap = require_YAMLMap();
    var YAMLSeq = require_YAMLSeq();
    var cst = require_cst();
    var lexer = require_lexer();
    var lineCounter = require_line_counter();
    var parser2 = require_parser();
    var publicApi = require_public_api();
    var visit = require_visit();
    exports.Composer = composer.Composer;
    exports.Document = Document.Document;
    exports.Schema = Schema.Schema;
    exports.YAMLError = errors.YAMLError;
    exports.YAMLParseError = errors.YAMLParseError;
    exports.YAMLWarning = errors.YAMLWarning;
    exports.Alias = Alias.Alias;
    exports.isAlias = identity.isAlias;
    exports.isCollection = identity.isCollection;
    exports.isDocument = identity.isDocument;
    exports.isMap = identity.isMap;
    exports.isNode = identity.isNode;
    exports.isPair = identity.isPair;
    exports.isScalar = identity.isScalar;
    exports.isSeq = identity.isSeq;
    exports.Pair = Pair.Pair;
    exports.Scalar = Scalar.Scalar;
    exports.YAMLMap = YAMLMap.YAMLMap;
    exports.YAMLSeq = YAMLSeq.YAMLSeq;
    exports.CST = cst;
    exports.Lexer = lexer.Lexer;
    exports.LineCounter = lineCounter.LineCounter;
    exports.Parser = parser2.Parser;
    exports.parse = publicApi.parse;
    exports.parseAllDocuments = publicApi.parseAllDocuments;
    exports.parseDocument = publicApi.parseDocument;
    exports.stringify = publicApi.stringify;
    exports.visit = visit.visit;
    exports.visitAsync = visit.visitAsync;
  }
});

// src/index.ts
import { isMainThread as isMainThread2 } from "node:worker_threads";

// src/gate.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute as isAbsolute2, relative, resolve as resolve2, sep } from "node:path";

// src/context.ts
var import_yaml = __toESM(require_dist(), 1);
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
var MERGE_QUEUE_BRANCH = /^(gh-readonly-queue\/|trunk-merge\/|trunk-temp\/|mergify\/merge-queue\/|gtmq_|mq-tmp-|automation\/bors\/|staging$|staging\.tmp$|trying$|auto$)/;
function isQueueBranch(branch, prefixes = []) {
  return MERGE_QUEUE_BRANCH.test(branch) || prefixes.some((p) => p && branch.startsWith(p));
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
    if (MERGE_QUEUE_BRANCH.test(branch))
      return {
        kind: "full",
        reason: `${what} ${branch}: merge queue branches run everything (the landing run)`
      };
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
var SHA = /^[0-9a-f]{40}$/;
function pushShadowBase(env, event) {
  if (env.GITHUB_EVENT_NAME !== "push") return null;
  const branch = event.repository?.default_branch;
  if (!branch || env.GITHUB_REF !== `refs/heads/${branch}`) return null;
  const before = event.before ?? "";
  const sha = env.GITHUB_SHA ?? "";
  if (!SHA.test(before) || /^0+$/.test(before) || !SHA.test(sha) || before === sha) return null;
  if (event.forced !== false || event.created === true) return null;
  if (event.after !== void 0 && event.after !== sha) return null;
  return before;
}
var MAX_GLOB = 1024;
function branchGlob(pattern) {
  const toks = [];
  for (let i2 = 0; i2 < pattern.length && pattern.length <= MAX_GLOB; i2++) {
    const c = pattern[i2];
    if (c === "*") {
      if (toks.at(-1)?.k !== "star") toks.push({ k: "star" });
    } else if (c === "?") toks.push({ k: "one" });
    else if (c === "[" && pattern.indexOf("]", i2 + 2) > 0) {
      toks.push({ k: "one" });
      i2 = pattern.indexOf("]", i2 + 2);
    } else toks.push({ k: "lit", c });
  }
  return {
    test(s) {
      if (pattern.length > MAX_GLOB || s.length > MAX_GLOB) return true;
      let prev = new Array(s.length + 1).fill(false);
      prev[0] = true;
      for (const t of toks) {
        const cur = new Array(s.length + 1).fill(false);
        for (let j = 0; j <= s.length; j++) {
          if (t.k === "star") cur[j] = prev[j] || j > 0 && cur[j - 1];
          else if (j > 0) cur[j] = prev[j - 1] && (t.k === "one" || s[j - 1] === t.c);
        }
        prev = cur;
      }
      return prev[s.length];
    }
  };
}
function landingBranchReason(branch, landing) {
  if (!landing || landing.readAt === null)
    return `the repo's landing mode isn't known, so ${branch} may be a protected or deployment branch`;
  if (isQueueBranch(branch, landing.queuePrefixes)) return `${branch} is the repo's merge-queue branch`;
  const p = landing.landingBranches.find((x) => branchGlob(x).test(branch));
  return p === void 0 ? null : `${branch} is a protected or deployment branch (${p})`;
}
function targetBranch(env, event) {
  const name2 = env.GITHUB_EVENT_NAME ?? "";
  if (name2 === "pull_request" || name2 === "pull_request_target")
    return env.GITHUB_BASE_REF || event.pull_request?.base?.ref || null;
  return event.repository?.default_branch ?? null;
}
function jobCheckNames(workflowText, jobId) {
  let doc;
  try {
    doc = (0, import_yaml.parse)(workflowText);
  } catch {
    return null;
  }
  const jobs = doc && typeof doc === "object" ? doc.jobs : void 0;
  if (!jobs || typeof jobs !== "object" || !Object.prototype.hasOwnProperty.call(jobs, jobId)) return null;
  const job = jobs[jobId];
  if (!job || typeof job !== "object" || "uses" in job) return null;
  const n = job.name;
  if (n === void 0 || n === null) return [jobId];
  if (typeof n !== "string" || !n || n.includes("${{")) return null;
  return [n];
}
function requiredJob(landing, target, names2) {
  if (!landing || landing.readAt === null)
    return { required: true, why: "the repo's landing mode isn't known: every job counts as required" };
  if (target !== landing.defaultBranch)
    return {
      required: true,
      why: `the change lands on ${target ?? "an unknown branch"}, not ${landing.defaultBranch} (the branch the landing mode was read for)`
    };
  if (landing.mode === "queue")
    return { required: false, why: "an enforced merge queue runs everything before landing" };
  if (landing.requiredChecks === null)
    return { required: true, why: "no enforced merge queue, and the required checks can't be read" };
  if (!landing.requiredChecks.length)
    return { required: false, why: "no enforced merge queue, and no check is required" };
  if (!names2)
    return {
      required: true,
      why: "no enforced merge queue, and this job's check name can't be read from the workflow"
    };
  const lower = names2.map((n) => n.toLowerCase());
  const hit = landing.requiredChecks.find((raw2) => {
    const c = raw2.toLowerCase();
    return c.includes(" / ") || lower.some((n) => c === n || c.startsWith(`${n} (`));
  });
  return hit === void 0 ? { required: false, why: "no enforced merge queue, and this job is not a required check" } : {
    required: true,
    why: `no enforced merge queue, and this job is the required check ${JSON.stringify(hit)}`
  };
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
      process.stdout.write(`::warning title=Tensile::${escapeCommand(message)}
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
var base = (p) => p.slice(p.lastIndexOf("/") + 1);
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
  const name2 = base(path);
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
var deadline = null;
function setGitDeadline(at) {
  deadline = at;
}
function bounded() {
  if (deadline === null) return {};
  const left = deadline - Date.now();
  if (left <= 0) throw new Error("git: past the deadline");
  return { timeout: left, killSignal: "SIGKILL" };
}
function git(repo, args2, input) {
  return execFileSync("git", ["-C", repo, "-c", "core.quotePath=false", ...args2], {
    encoding: "utf8",
    maxBuffer: MAX,
    input,
    stdio: ["pipe", "pipe", "pipe"],
    ...bounded()
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
    const res = spawnSync(
      "git",
      ["-C", repo, "config", "--get-regexp", "^(remote\\..*\\.promisor|extensions\\.partialclone)$"],
      bounded()
    );
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
    env: { ...process.env, GIT_NO_LAZY_FETCH: "1" },
    ...bounded()
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
    { input: missing.join("\n") + "\n", maxBuffer: MAX, ...bounded() }
  );
}
function readBlobs(repo, specs) {
  const out2 = /* @__PURE__ */ new Map();
  if (!specs.length) return out2;
  prefetchBlobs(repo, specs);
  const res = spawnSync("git", ["-C", repo, "cat-file", "--batch"], {
    input: specs.join("\n") + "\n",
    maxBuffer: MAX,
    ...bounded()
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

// ../engine/src/graph/util.ts
var isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var dirOf3 = (p) => p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
var baseOf2 = (p) => p.slice(p.lastIndexOf("/") + 1);
function normalize3(p) {
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
var MAX_CONFIG_BYTES = 4 * 1024 * 1024;
function parseJsonc(text) {
  if (text.length > MAX_CONFIG_BYTES) throw new Error(`over ${MAX_CONFIG_BYTES} bytes`);
  let out2 = "";
  let i2 = 0;
  const n = text.length;
  while (i2 < n) {
    const c = text[i2];
    if (c === '"') {
      let j = i2 + 1;
      while (j < n && text[j] !== '"') j += text[j] === "\\" ? 2 : 1;
      out2 += text.slice(i2, j + 1);
      i2 = j + 1;
    } else if (c === "/" && text[i2 + 1] === "/") {
      while (i2 < n && text[i2] !== "\n") i2++;
    } else if (c === "/" && text[i2 + 1] === "*") {
      const end = text.indexOf("*/", i2 + 2);
      if (end < 0) throw new Error("unterminated comment");
      i2 = end + 2;
    } else {
      out2 += c;
      i2++;
    }
  }
  let clean = "";
  for (let k = 0; k < out2.length; k++) {
    const c = out2[k];
    if (c === '"') {
      let j = k + 1;
      while (j < out2.length && out2[j] !== '"') j += out2[j] === "\\" ? 2 : 1;
      clean += out2.slice(k, j + 1);
      k = j;
      continue;
    }
    if (c === ",") {
      let j = k + 1;
      while (j < out2.length && /\s/.test(out2[j])) j++;
      if (out2[j] === "}" || out2[j] === "]") continue;
    }
    clean += c;
  }
  return JSON.parse(clean);
}
var MAX_GLOB_LENGTH = 512;
var MAX_ALTERNATIVES = 64;
function expandBraces(g) {
  const open = g.indexOf("{");
  if (open < 0) {
    if (g.includes("}")) throw new Error(`unbalanced } in ${g}`);
    return [g];
  }
  let depth = 0;
  const parts2 = [];
  let start2 = open + 1;
  for (let i2 = open; i2 < g.length; i2++) {
    const c = g[i2];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        parts2.push(g.slice(start2, i2));
        const out2 = [];
        for (const p of parts2)
          for (const rest of expandBraces(g.slice(0, open) + p + g.slice(i2 + 1))) {
            out2.push(rest);
            if (out2.length > MAX_ALTERNATIVES)
              throw new Error(`over ${MAX_ALTERNATIVES} alternatives in ${g}`);
          }
        return out2;
      }
    } else if (c === "," && depth === 1) {
      parts2.push(g.slice(start2, i2));
      start2 = i2 + 1;
    }
  }
  throw new Error(`unbalanced { in ${g}`);
}
function tokenize(g) {
  const out2 = [];
  for (let i2 = 0; i2 < g.length; i2++) {
    const c = g[i2];
    if (c === "*") {
      if (g[i2 + 1] === "*") {
        while (g[i2 + 1] === "*") i2++;
        const dirs = g[i2 + 1] === "/";
        if (dirs) i2++;
        const prev = out2.at(-1);
        if (!(prev?.t === "globstar" && prev.dirs && dirs)) out2.push({ t: "globstar", dirs });
      } else if (out2.at(-1)?.t !== "star") out2.push({ t: "star" });
    } else if (c === "?") out2.push({ t: "one", test: (x) => x !== "/" });
    else if (c === "[") {
      const end = g.indexOf("]", i2 + 2);
      if (end < 0) {
        out2.push({ t: "lit", c });
        continue;
      }
      let body2 = g.slice(i2 + 1, end);
      const neg = body2.startsWith("!") || body2.startsWith("^");
      if (neg) body2 = body2.slice(1);
      const ranges = [];
      for (let k = 0; k < body2.length; k++)
        if (body2[k + 1] === "-" && k + 2 < body2.length) {
          ranges.push([body2[k], body2[k + 2]]);
          k += 2;
        } else ranges.push([body2[k], body2[k]]);
      out2.push({ t: "one", test: (x) => x !== "/" && ranges.some(([a, b]) => a <= x && x <= b) !== neg });
      i2 = end;
    } else out2.push({ t: "lit", c });
  }
  return out2;
}
function matchTokens(toks, path) {
  const n = path.length;
  const memo = new Uint8Array((toks.length + 1) * (n + 1));
  const go = (i2, j) => {
    const k = i2 * (n + 1) + j;
    if (memo[k]) return memo[k] === 1;
    let r;
    if (i2 === toks.length) r = j === n || path[j] === "/";
    else {
      const tok = toks[i2];
      if (tok.t === "lit") r = j < n && path[j] === tok.c && go(i2 + 1, j + 1);
      else if (tok.t === "one") r = j < n && tok.test(path[j]) && go(i2 + 1, j + 1);
      else if (tok.t === "star") r = go(i2 + 1, j) || j < n && path[j] !== "/" && go(i2, j + 1);
      else if (tok.dirs)
        r = go(i2 + 1, j) || j < n && (() => {
          const slash = path.indexOf("/", j);
          return slash >= 0 && go(i2, slash + 1);
        })();
      else r = go(i2 + 1, j) || j < n && go(i2, j + 1);
    }
    memo[k] = r ? 1 : 2;
    return r;
  };
  return go(0, 0);
}
var compiled = /* @__PURE__ */ new Map();
function compileGlob(glob) {
  const hit = compiled.get(glob);
  if (hit) return hit;
  if (glob.length > MAX_GLOB_LENGTH) throw new Error(`glob over ${MAX_GLOB_LENGTH} characters`);
  const g = glob.replace(/^\.\//, "").replace(/\/+$/, "");
  const out2 = expandBraces(g).map(tokenize);
  if (compiled.size > 1e4) compiled.clear();
  compiled.set(glob, out2);
  return out2;
}
function globMatch(glob, path) {
  if (glob.startsWith("!")) return false;
  return compileGlob(glob).some((t) => matchTokens(t, path));
}

// ../engine/src/lockfile.ts
var import_yaml3 = __toESM(require_dist(), 1);

// ../engine/src/graph/locks.ts
var import_yaml2 = __toESM(require_dist(), 1);
var MAX_LOCK_BYTES = 32 * 1024 * 1024;
var Unattributable = class extends Error {
};
function canon(v) {
  if (Array.isArray(v)) return `[${v.map(canon).join(",")}]`;
  if (isObj(v))
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}`;
  return JSON.stringify(v) ?? "null";
}
function closure(g, dir) {
  const own = /* @__PURE__ */ new Map();
  const links = /* @__PURE__ */ new Set();
  const start2 = g.workspaces.get(dir);
  const stack = [];
  for (const d of g.deps(start2)) {
    if ("link" in d) links.add(d.link);
    else stack.push(d.key);
  }
  while (stack.length) {
    const k = stack.pop();
    if (own.has(k)) continue;
    own.set(k, g.entries.get(k) ?? "null");
    for (const d of g.deps(k)) {
      if ("link" in d) links.add(d.link);
      else stack.push(d.key);
    }
  }
  return { own, links };
}
function sameMap(a, b) {
  if (!a || !b || a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
}
function diffGraphs(a, b) {
  if (a.shared !== b.shared) return "a shared section (settings, metadata) changed";
  try {
    const dirs = [.../* @__PURE__ */ new Set([...a.workspaces.keys(), ...b.workspaces.keys()])];
    const ca = new Map([...a.workspaces.keys()].map((d) => [d, closure(a, d)]));
    const cb = new Map([...b.workspaces.keys()].map((d) => [d, closure(b, d)]));
    const direct = /* @__PURE__ */ new Set();
    for (const d of dirs) {
      const ka = a.workspaces.get(d);
      const kb = b.workspaces.get(d);
      if (ka === void 0 || kb === void 0 || a.entries.get(ka) !== b.entries.get(kb) || !sameMap(ca.get(d)?.own, cb.get(d)?.own))
        direct.add(d);
    }
    const viaLinks = /* @__PURE__ */ new Set();
    for (let grew = true; grew; ) {
      grew = false;
      for (const d of dirs) {
        if (direct.has(d) || viaLinks.has(d)) continue;
        const links = [...ca.get(d)?.links ?? [], ...cb.get(d)?.links ?? []];
        if (links.some((l) => direct.has(l) || viaLinks.has(l))) {
          viaLinks.add(d);
          grew = true;
        }
      }
    }
    const reached = (g, c) => {
      const s = new Set(g.workspaces.values());
      for (const x of c.values()) for (const k of x.own.keys()) s.add(k);
      return s;
    };
    const ra = reached(a, ca);
    const rb = reached(b, cb);
    const changedNames = /* @__PURE__ */ new Set();
    for (const k of /* @__PURE__ */ new Set([...a.entries.keys(), ...b.entries.keys()])) {
      if (a.entries.get(k) === b.entries.get(k)) continue;
      if (!(a.entries.has(k) && ra.has(k)) && !(b.entries.has(k) && rb.has(k)))
        return `changed entry ${k} is reached by no workspace`;
      const n = b.names.get(k) ?? a.names.get(k);
      if (n) changedNames.add(n);
    }
    return { direct, viaLinks, changedNames: [...changedNames].sort(), importers: dirs };
  } catch (e) {
    if (e instanceof Unattributable) return `can't attribute: ${e.message}`;
    throw e;
  }
}
var NPM_IMPORTER_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies"
];
var NPM_ENTRY_FIELDS = ["dependencies", "optionalDependencies", "peerDependencies"];
function npmResolve(packages, from, name2) {
  for (let dir = from; ; ) {
    const key = `${dir ? `${dir}/` : ""}node_modules/${name2}`;
    if (key in packages) return key;
    if (!dir) return null;
    dir = dir.includes("/") ? dir.slice(0, dir.lastIndexOf("/")) : "";
  }
}
function npmGraph(text) {
  if (text.length > MAX_LOCK_BYTES) return `over ${MAX_LOCK_BYTES} bytes`;
  let doc;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    return `unparseable (${e.message.split("\n")[0]})`;
  }
  if (!isObj(doc)) return "not an object";
  const v = doc.lockfileVersion;
  if (v !== 2 && v !== 3) return `lockfileVersion ${JSON.stringify(v)} is not one we read (2, 3)`;
  const packages = doc.packages;
  if (!isObj(packages) || !isObj(packages[""])) return "no packages section";
  const workspaces = /* @__PURE__ */ new Map();
  const entries = /* @__PURE__ */ new Map();
  const names2 = /* @__PURE__ */ new Map();
  for (const [k, e] of Object.entries(packages)) {
    if (!isObj(e)) return `entry ${k || "."} is malformed`;
    entries.set(k, canon(e));
    const nm = k.lastIndexOf("node_modules/");
    names2.set(k, nm < 0 ? typeof e.name === "string" ? e.name : k : k.slice(nm + "node_modules/".length));
    if (!/(^|\/)node_modules\//.test(k)) {
      const d = normalize3(k);
      if (d === null) return `entry ${k} climbs out of the repo`;
      workspaces.set(d, k);
    }
  }
  const deps = (key) => {
    const e = packages[key];
    const isWorkspace = !/(^|\/)node_modules\//.test(key);
    const out2 = [];
    const meta = isObj(e.peerDependenciesMeta) ? e.peerDependenciesMeta : {};
    for (const f of isWorkspace ? NPM_IMPORTER_FIELDS : NPM_ENTRY_FIELDS) {
      const d = e[f];
      if (d === void 0) continue;
      if (!isObj(d)) throw new Unattributable(`${key || "."}: ${f} malformed`);
      for (const n of Object.keys(d)) {
        const r = npmResolve(packages, key, n);
        if (r === null) {
          if (f === "optionalDependencies" || f === "peerDependencies" || isObj(meta[n])) continue;
          throw new Unattributable(`${key || "."}: ${n} has no entry`);
        }
        const t = packages[r];
        if (t.link === true) {
          const target = typeof t.resolved === "string" ? normalize3(t.resolved) : null;
          if (target === null) throw new Unattributable(`${r} links nowhere`);
          if (workspaces.has(target)) out2.push({ link: target });
          else out2.push({ key: r });
        } else out2.push({ key: r });
      }
    }
    return out2;
  };
  const top = Object.fromEntries(
    Object.entries(doc).filter(([k]) => k !== "packages" && k !== "dependencies" && k !== "version")
  );
  return { workspaces, entries, names: names2, deps, shared: canon(top) };
}
function npmLockDiff(oldText, newText) {
  const a = npmGraph(oldText);
  if (typeof a === "string") return `base lockfile ${a}`;
  const b = npmGraph(newText);
  if (typeof b === "string") return `head lockfile ${b}`;
  return diffGraphs(a, b);
}
var descriptors = (key) => key.split(/,\s*/).map((s) => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
var descName = (d) => {
  const at = d.indexOf("@", 1);
  return at < 0 ? d : d.slice(0, at);
};
function berryGraph(doc) {
  const byDesc = /* @__PURE__ */ new Map();
  const workspaces = /* @__PURE__ */ new Map();
  const entries = /* @__PURE__ */ new Map();
  const names2 = /* @__PURE__ */ new Map();
  for (const [k, e] of Object.entries(doc)) {
    if (k === "__metadata") continue;
    if (!isObj(e)) return `entry ${k} is malformed`;
    entries.set(k, canon(e));
    const ds = descriptors(k);
    names2.set(k, descName(ds[0] ?? k));
    for (const d of ds) byDesc.set(d, k);
    const m = typeof e.resolution === "string" ? /@workspace:(.+)$/.exec(e.resolution) : null;
    if (m) {
      const dir = normalize3(m[1]);
      if (dir === null) return `workspace ${m[1]} climbs out of the repo`;
      workspaces.set(dir, k);
    }
  }
  const workspaceOf = new Map([...workspaces].map(([d, k]) => [k, d]));
  const deps = (key) => {
    const e = doc[key];
    const out2 = [];
    const meta = isObj(e.dependenciesMeta) ? e.dependenciesMeta : {};
    const fields = workspaceOf.has(key) ? ["dependencies", "peerDependencies"] : ["dependencies"];
    for (const f of fields) {
      const d = e[f];
      if (d === void 0) continue;
      if (!isObj(d)) throw new Unattributable(`${key}: ${f} malformed`);
      for (const [n, range] of Object.entries(d)) {
        const r = String(range);
        const k = byDesc.get(`${n}@${r}`) ?? byDesc.get(`${n}@npm:${r}`);
        if (!k) {
          const opt = isObj(meta[n]) && meta[n].optional === true;
          if (f === "peerDependencies" || opt) continue;
          throw new Unattributable(`${key}: ${n}@${r} has no entry`);
        }
        const w = workspaceOf.get(k);
        out2.push(w !== void 0 ? { link: w } : { key: k });
      }
    }
    return out2;
  };
  return { workspaces, entries, names: names2, deps, shared: canon(doc.__metadata ?? null) };
}
function parseYarnClassic(text) {
  const out2 = /* @__PURE__ */ new Map();
  let cur = null;
  let section = null;
  const unq = (s) => s.trim().replace(/^"(.*)"$/, "$1");
  for (const raw2 of text.split("\n")) {
    if (!raw2.trim() || raw2.startsWith("#")) continue;
    const indent = raw2.length - raw2.trimStart().length;
    const line = raw2.trim();
    if (indent === 0) {
      if (!line.endsWith(":")) return `unexpected line ${line.slice(0, 60)}`;
      cur = { fields: {} };
      section = null;
      for (const d of descriptors(line.slice(0, -1))) out2.set(d, cur);
    } else if (!cur) return "a field before any entry";
    else if (indent === 2) {
      if (line.endsWith(":")) {
        section = {};
        cur.fields[unq(line.slice(0, -1))] = section;
      } else {
        section = null;
        const sp = line.search(/\s/);
        if (sp < 0) return `unexpected line ${line.slice(0, 60)}`;
        cur.fields[unq(line.slice(0, sp))] = unq(line.slice(sp + 1));
      }
    } else if (indent === 4 && section) {
      const m = /^("[^"]+"|\S+)\s+(.+)$/.exec(line);
      if (!m) return `unexpected line ${line.slice(0, 60)}`;
      section[unq(m[1])] = unq(m[2]);
    } else return `unexpected indentation at ${line.slice(0, 60)}`;
  }
  return out2;
}
function classicGraph(text, manifests) {
  const parsed = parseYarnClassic(text);
  if (typeof parsed === "string") return parsed;
  const keyOf = /* @__PURE__ */ new Map();
  for (const [d, e] of parsed) if (!keyOf.has(e)) keyOf.set(e, d);
  const entryOf = new Map([...keyOf].map(([e, k]) => [k, e]));
  const entries = /* @__PURE__ */ new Map();
  const names2 = /* @__PURE__ */ new Map();
  for (const [e, k] of keyOf) {
    entries.set(k, canon(e.fields));
    names2.set(k, descName(k));
  }
  const workspaces = /* @__PURE__ */ new Map();
  const byName = /* @__PURE__ */ new Map();
  for (const [dir, m] of manifests) {
    const k = `workspace:${dir}`;
    workspaces.set(dir, k);
    entries.set(k, canon(m));
    if (typeof m.name === "string") byName.set(m.name, dir);
  }
  const deps = (key) => {
    const out2 = [];
    const ws = key.startsWith("workspace:") ? manifests.get(key.slice("workspace:".length)) : null;
    const fields = ws ? ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"] : ["dependencies", "optionalDependencies"];
    const src = ws ?? entryOf.get(key)?.fields ?? {};
    for (const f of fields) {
      const d = src[f];
      if (d === void 0) continue;
      if (!isObj(d)) throw new Unattributable(`${key}: ${f} malformed`);
      for (const [n, range] of Object.entries(d)) {
        const e = parsed.get(`${n}@${String(range)}`);
        if (e) out2.push({ key: keyOf.get(e) });
        else if (byName.has(n)) out2.push({ link: byName.get(n) });
        else if (f === "optionalDependencies" || f === "peerDependencies") continue;
        else throw new Unattributable(`${key}: ${n}@${String(range)} has no entry`);
      }
    }
    return out2;
  };
  return { workspaces, entries, names: names2, deps, shared: "" };
}
function yarnLockDiff(oldText, newText, manifests) {
  const graph = (text, side) => {
    if (text.length > MAX_LOCK_BYTES) return `over ${MAX_LOCK_BYTES} bytes`;
    if (/^__metadata:/m.test(text)) {
      let doc;
      try {
        doc = (0, import_yaml2.parse)(text, { maxAliasCount: 0, uniqueKeys: true, strict: true });
      } catch (e) {
        return `unparseable (${e.message.split("\n")[0]})`;
      }
      if (!isObj(doc)) return "not a mapping";
      return berryGraph(doc);
    }
    if (!/^# yarn lockfile v1$/m.test(text)) return "not a yarn lockfile we read (berry, v1)";
    if (!manifests) return "yarn v1 lockfile without the workspace manifests";
    return classicGraph(text, manifests[side]);
  };
  const a = graph(oldText, "old");
  if (typeof a === "string") return `base lockfile ${a}`;
  const b = graph(newText, "new");
  if (typeof b === "string") return `head lockfile ${b}`;
  return diffGraphs(a, b);
}

// ../engine/src/lockfile.ts
var MAX_LOCKFILE_BYTES = 32 * 1024 * 1024;
var dirOf4 = (p) => p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
var baseOf3 = (p) => p.slice(p.lastIndexOf("/") + 1);
function normalize4(p) {
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
var isObj2 = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
function canon2(v) {
  if (Array.isArray(v)) return `[${v.map(canon2).join(",")}]`;
  if (isObj2(v))
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon2(v[k])}`).join(",")}}`;
  return JSON.stringify(v) ?? "null";
}
var DEP_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];
var KNOWN_TOP = /* @__PURE__ */ new Set(["lockfileVersion", "importers", "packages", "snapshots"]);
var Unattributable2 = class extends Error {
};
function parseLock(text) {
  if (text.length > MAX_LOCKFILE_BYTES) return `over ${MAX_LOCKFILE_BYTES} bytes`;
  let docs;
  try {
    const parsed = (0, import_yaml3.parseAllDocuments)(text, { uniqueKeys: true, strict: true });
    if (!Array.isArray(parsed)) return "unparseable (empty)";
    docs = parsed.map((d) => {
      if (d.errors.length) throw d.errors[0];
      return d.toJS({ maxAliasCount: 0 });
    });
  } catch (e) {
    return `unparseable (${e.message.split("\n")[0]})`;
  }
  const main = docs.filter((d) => isObj2(d) && "importers" in d);
  if (docs.length === 1 && main.length === 0) {
    if (!isObj2(docs[0])) return "not a mapping";
  } else if (main.length !== 1)
    return `${main.length} lockfile documents with importers among ${docs.length}`;
  const doc = docs.length === 1 ? docs[0] : main[0];
  const others = docs.filter((d) => d !== doc);
  if (!isObj2(doc)) return "not a mapping";
  const v = String(doc.lockfileVersion ?? "");
  const version = v === "9.0" ? "9" : v === "6.0" || v === "6.1" ? "6" : null;
  if (!version) return `lockfileVersion ${JSON.stringify(doc.lockfileVersion)} is not one we read (6.x, 9.0)`;
  if (!isObj2(doc.importers)) return "no importers (not a workspace lockfile)";
  const importers = /* @__PURE__ */ new Map();
  for (const [k, raw2] of Object.entries(doc.importers)) {
    const id = normalize4(k);
    const e = raw2 === null ? {} : raw2;
    if (id === null || !isObj2(e)) return `importer ${k} is malformed`;
    importers.set(id, e);
  }
  const packages = doc.packages ?? {};
  const snapshots = doc.snapshots ?? {};
  if (!isObj2(packages) || !isObj2(snapshots)) return "packages or snapshots malformed";
  return { version, top: doc, importers, packages, snapshots, others };
}
function withoutPeers(key) {
  const at = key.indexOf("@", 1);
  const paren = key.indexOf("(", at < 0 ? 0 : at);
  return paren < 0 ? key : key.slice(0, paren);
}
function keyName(key) {
  const k = key.startsWith("/") ? key.slice(1) : key;
  const at = k.indexOf("@", 1);
  return at < 0 ? k : k.slice(0, at);
}
function resolveDep(p, name2, version) {
  const table = p.version === "9" ? p.snapshots : p.packages;
  const fallback = p.version === "9" ? p.packages : null;
  const candidates = p.version === "9" ? [`${name2}@${version}`, version] : [version.startsWith("/") ? version : `/${name2}@${version}`, version, `/${version}`];
  for (const c of candidates) if (c in table || fallback && c in fallback) return c;
  throw new Unattributable2(`${name2}@${version} has no entry`);
}
function fingerprint(p, key) {
  if (p.version === "9") return canon2([p.packages[withoutPeers(key)] ?? null, p.snapshots[key] ?? null]);
  return canon2(p.packages[key] ?? null);
}
function depsOf(p, key) {
  const e = p.version === "9" ? p.snapshots[key] : p.packages[key];
  if (!isObj2(e)) return [];
  const out2 = [];
  for (const f of ["dependencies", "optionalDependencies"]) {
    const d = e[f];
    if (d === void 0) continue;
    if (!isObj2(d)) throw new Unattributable2(`${key}: ${f} malformed`);
    for (const [n, v] of Object.entries(d)) out2.push([n, String(v)]);
  }
  return out2;
}
function importerClosure(p, id) {
  const entry = p.importers.get(id);
  const own = /* @__PURE__ */ new Map();
  const links = /* @__PURE__ */ new Set();
  const stack = [];
  for (const f of DEP_FIELDS) {
    const deps = entry[f];
    if (deps === void 0) continue;
    if (!isObj2(deps)) throw new Unattributable2(`importer ${id || "."}: ${f} malformed`);
    for (const [name2, spec] of Object.entries(deps)) {
      const version = isObj2(spec) ? String(spec.version ?? "") : String(spec);
      if (!version) throw new Unattributable2(`importer ${id || "."}: ${name2} has no version`);
      if (version.startsWith("link:")) {
        const target = normalize4(`${id}/${version.slice(5)}`);
        if (target !== null && p.importers.has(target)) links.add(target);
        else own.set(`link:${target ?? version}`, "");
        continue;
      }
      stack.push(resolveDep(p, name2, version));
    }
  }
  while (stack.length) {
    const k = stack.pop();
    if (own.has(k)) continue;
    own.set(k, fingerprint(p, k));
    for (const [n, v] of depsOf(p, k)) {
      if (v.startsWith("link:")) throw new Unattributable2(`${k} links to ${v}`);
      stack.push(resolveDep(p, n, v));
    }
  }
  return { own, links };
}
var sameMap2 = (a, b) => {
  if (!a || !b || a.size !== b.size) return false;
  for (const [k, v] of a) if (b.get(k) !== v) return false;
  return true;
};
function pnpmSettings(npmrc, workspaceYaml) {
  const s = { nodeLinker: "isolated", shamefullyHoist: false, publicHoistPattern: [] };
  let publicSet = false;
  for (const raw2 of (npmrc ?? "").split("\n")) {
    const line = raw2.replace(/^\s+|\s+$/g, "");
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;
    const m = /^([\w.[\]-]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const [, k, v] = m;
    const val = v.replace(/^["']|["']$/g, "");
    if (k === "node-linker") s.nodeLinker = val;
    else if (k === "shamefully-hoist") s.shamefullyHoist = val === "true";
    else if (k === "public-hoist-pattern" || k === "public-hoist-pattern[]") {
      if (!publicSet) s.publicHoistPattern = [];
      publicSet = true;
      if (val) s.publicHoistPattern.push(val);
    }
  }
  if (workspaceYaml) {
    let doc;
    try {
      doc = (0, import_yaml3.parse)(workspaceYaml, { maxAliasCount: 0 });
    } catch {
      return "pnpm-workspace.yaml is unparseable";
    }
    if (isObj2(doc)) {
      if (doc.nodeLinker !== void 0) s.nodeLinker = String(doc.nodeLinker);
      if (doc.shamefullyHoist !== void 0) s.shamefullyHoist = doc.shamefullyHoist === true;
      if (doc.publicHoistPattern !== void 0) {
        const p = doc.publicHoistPattern;
        s.publicHoistPattern = (Array.isArray(p) ? p : [p]).map(String);
        publicSet = true;
      }
    }
  }
  if (!publicSet) s.publicHoistPattern = ["*eslint*", "*prettier*"];
  return s;
}
var globRx = (g) => new RegExp(`^${g.replace(/[.+^${}()|[\]\\?]/g, "\\$&").replace(/\*/g, ".*")}$`);
function pnpmLockDiff(oldText, newText, settings) {
  const a = parseLock(oldText);
  if (typeof a === "string") return `base lockfile ${a}`;
  const b = parseLock(newText);
  if (typeof b === "string") return `head lockfile ${b}`;
  if (a.version !== b.version) return "lockfileVersion changed";
  if (canon2(a.others) !== canon2(b.others)) return "another lockfile document (config dependencies) changed";
  for (const k of /* @__PURE__ */ new Set([...Object.keys(a.top), ...Object.keys(b.top)])) {
    if (KNOWN_TOP.has(k)) continue;
    if (canon2(a.top[k]) !== canon2(b.top[k])) return `shared section ${k} changed`;
  }
  if (settings.nodeLinker !== "isolated")
    return `node-linker is ${settings.nodeLinker}: every package sees every dependency`;
  if (settings.shamefullyHoist) return "shamefully-hoist: every package sees every dependency";
  try {
    const ids = /* @__PURE__ */ new Set([...a.importers.keys(), ...b.importers.keys()]);
    const closures = (p) => {
      const m = /* @__PURE__ */ new Map();
      for (const id of p.importers.keys()) m.set(id, importerClosure(p, id));
      return m;
    };
    const ca = closures(a);
    const cb = closures(b);
    const direct = /* @__PURE__ */ new Set();
    for (const id of ids) {
      const x = ca.get(id);
      const y = cb.get(id);
      if (!x || !y || canon2(a.importers.get(id)) !== canon2(b.importers.get(id)) || !sameMap2(x.own, y.own))
        direct.add(id);
    }
    const viaLinks = /* @__PURE__ */ new Set();
    for (let grew = true; grew; ) {
      grew = false;
      for (const id of ids) {
        if (direct.has(id) || viaLinks.has(id)) continue;
        const links = [...ca.get(id)?.links ?? [], ...cb.get(id)?.links ?? []];
        if (links.some((l) => direct.has(l) || viaLinks.has(l))) {
          viaLinks.add(id);
          grew = true;
        }
      }
    }
    const reached = (c) => {
      const s = /* @__PURE__ */ new Set();
      for (const x of c.values())
        for (const k of x.own.keys()) {
          s.add(k);
          s.add(withoutPeers(k));
        }
      return s;
    };
    const ra = reached(ca);
    const rb = reached(cb);
    const changedNames = /* @__PURE__ */ new Set();
    const entries = (p) => p.version === "9" ? [
      ...Object.keys(p.snapshots).map((k) => [k, fingerprint(p, k)]),
      // A packages entry with no snapshot (none expected in v9) is checked under its own key.
      ...Object.keys(p.packages).filter((k) => !(k in p.snapshots)).map((k) => [k, fingerprint(p, k)])
    ] : Object.keys(p.packages).map((k) => [k, fingerprint(p, k)]);
    const ea = new Map(entries(a));
    const eb = new Map(entries(b));
    for (const k of /* @__PURE__ */ new Set([...ea.keys(), ...eb.keys()])) {
      if (ea.get(k) === eb.get(k)) continue;
      if (!(ea.has(k) && ra.has(k)) && !(eb.has(k) && rb.has(k)))
        return `changed entry ${k} is reached by no importer`;
      changedNames.add(keyName(k));
    }
    const pub = settings.publicHoistPattern.map(globRx);
    const hoistedClosure = (p, entries2) => {
      const seen = /* @__PURE__ */ new Set();
      const stack = [...entries2.keys()].filter((k) => pub.some((r) => r.test(keyName(k))));
      while (stack.length) {
        const k = stack.pop();
        if (seen.has(k)) continue;
        seen.add(k);
        for (const [n, v] of depsOf(p, k)) {
          if (v.startsWith("link:")) continue;
          stack.push(resolveDep(p, n, v));
        }
      }
      return seen;
    };
    const ha = hoistedClosure(a, ea);
    const hb = hoistedClosure(b, eb);
    const hoisted = [.../* @__PURE__ */ new Set([...ea.keys(), ...eb.keys()])].filter((k) => ea.get(k) !== eb.get(k) && (ha.has(k) || hb.has(k))).map(keyName);
    if (hoisted.length)
      return `${hoisted.slice(0, 3).join(", ")} ${hoisted.length > 1 ? "are" : "is"} hoisted to the root node_modules (public-hoist-pattern), where every package can import ${hoisted.length > 1 ? "them" : "it"}`;
    return { direct, viaLinks, changedNames: [...changedNames].sort(), importers: [...ids] };
  } catch (e) {
    if (e instanceof Unattributable2) return `can't attribute: ${e.message}`;
    throw e;
  }
}
var NODE_ROOT_LOCKS = /* @__PURE__ */ new Set(["bun.lock", "bun.lockb"]);
var NPM_LOCKS = /* @__PURE__ */ new Set(["package-lock.json", "npm-shrinkwrap.json"]);
var PY_ROOT_LOCKS = /* @__PURE__ */ new Set(["uv.lock", "poetry.lock", "Pipfile.lock", "pdm.lock"]);
function scopeOf(d) {
  if (d.direct.has("")) return { kind: "all", reason: "lockfile: the root workspace's dependencies changed" };
  const dirs = [...d.direct, ...d.viaLinks].filter((x) => x !== "").sort();
  const importerDirs = d.importers.filter((x) => x !== "").sort();
  return {
    kind: "dirs",
    dirs,
    rootOwned: d.viaLinks.has(""),
    importerDirs,
    note: dirs.length ? `lockfile: dependencies changed for ${dirs.join(", ")}${d.changedNames.length ? ` (${d.changedNames.slice(0, 5).join(", ")}${d.changedNames.length > 5 ? ", ..." : ""})` : ""}` : "lockfile: no workspace\u2019s dependencies changed"
  };
}
function lockfileScope(l) {
  const dir = dirOf4(l.path);
  const name2 = baseOf3(l.path);
  if (dir) return { kind: "all", reason: `lockfile in ${dir}/: who installs and uses it is unknown` };
  if (NODE_ROOT_LOCKS.has(name2))
    return { kind: "all", reason: "lockfile: a hoisted node_modules lets any package import any dependency" };
  if (NPM_LOCKS.has(name2) || name2 === "yarn.lock") {
    if (l.oldText === null || l.newText === null) return { kind: "all", reason: "lockfile added or deleted" };
    let d2;
    try {
      d2 = NPM_LOCKS.has(name2) ? npmLockDiff(l.oldText, l.newText) : yarnLockDiff(l.oldText, l.newText, l.yarnManifests?.());
    } catch (e) {
      d2 = `unreadable (${e.message.split("\n")[0]})`;
    }
    if (typeof d2 === "string") return { kind: "all", reason: `lockfile: ${d2}` };
    return scopeOf(d2);
  }
  if (PY_ROOT_LOCKS.has(name2))
    return { kind: "all", reason: "lockfile: one environment lets any module import any dependency" };
  if (name2 !== "pnpm-lock.yaml") return { kind: "all", reason: "lockfile" };
  if (l.oldText === null || l.newText === null) return { kind: "all", reason: "lockfile added or deleted" };
  const settings = pnpmSettings(l.readHead(".npmrc"), l.readHead("pnpm-workspace.yaml"));
  if (typeof settings === "string") return { kind: "all", reason: `lockfile: ${settings}` };
  const d = pnpmLockDiff(l.oldText, l.newText, settings);
  if (typeof d === "string") return { kind: "all", reason: `lockfile: ${d}` };
  if (d.direct.has("")) return { kind: "all", reason: "lockfile: the root importer's dependencies changed" };
  const dirs = [...d.direct, ...d.viaLinks].filter((x) => x !== "").sort();
  const importerDirs = d.importers.filter((x) => x !== "").sort();
  return {
    kind: "dirs",
    dirs,
    rootOwned: d.viaLinks.has(""),
    importerDirs,
    note: dirs.length ? `lockfile: dependencies changed for ${dirs.join(", ")}${d.changedNames.length ? ` (${d.changedNames.slice(0, 5).join(", ")}${d.changedNames.length > 5 ? ", ..." : ""})` : ""}` : "lockfile: no importer\u2019s dependencies changed"
  };
}

// ../engine/src/spans/python.ts
import { createRequire } from "node:module";

// ../../node_modules/.pnpm/web-tree-sitter@0.27.1/node_modules/web-tree-sitter/web-tree-sitter.js
var __defProp2 = Object.defineProperty;
var __name = (target, value) => __defProp2(target, "name", { value, configurable: true });
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
          return new Promise((resolve8, reject) => {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "arraybuffer";
            xhr.onload = () => {
              if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                resolve8(xhr.response);
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
      return new Promise((resolve8, reject) => {
        Module["instantiateWasm"](info2, (mod, inst) => {
          resolve8(receiveInstance(mod, inst));
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
  var bigintToI53Checked = /* @__PURE__ */ __name((num3) => num3 < INT53_MIN || num3 > INT53_MAX ? NaN : Number(num3), "bigintToI53Checked");
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
    var num3 = 0;
    for (var i2 = 0; i2 < iovcnt; i2++) {
      var ptr = LE_HEAP_LOAD_U32((iov >> 2) * 4);
      var len = LE_HEAP_LOAD_U32((iov + 4 >> 2) * 4);
      iov += 8;
      for (var j = 0; j < len; j++) {
        printChar(fd, HEAPU8[ptr + j]);
      }
      num3 += len;
    }
    LE_HEAP_STORE_U32((pnum >> 2) * 4, num3);
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
    moduleRtn = new Promise((resolve8, reject) => {
      readyPromiseResolve = resolve8;
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
var { readFileSync: readFileSync2 } = require2("fs");
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
    return readFileSync2("/usr/bin/ldd", "utf-8").includes("musl");
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
var { Severity, ParseResult, ExportExportNameKind, ExportImportNameKind, ExportLocalNameKind, ImportNameKind, parse: parse3, parseSync, rawTransferSupported } = nativeBinding;
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
function keyName2(key, computed) {
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
    return n.kind === "constructor" ? classNames.at(-1) ?? null : keyName2(n.key, n.computed);
  if (FUNCTION_VALUE.has(n.type) && parent) {
    if (parent.type === "VariableDeclarator" && isNode(parent.id) && parent.id.type === "Identifier")
      return parent.id.name;
    if (parent.type === "Property" || parent.type === "PropertyDefinition")
      return keyName2(parent.key, parent.computed);
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
          const imported = sp.type === "ImportDefaultSpecifier" ? "default" : sp.type === "ImportNamespaceSpecifier" ? "*" : keyName2(sp.imported, false) ?? "?";
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
  const lines4 = chars.join("").split("\n");
  lines4.forEach((l, i2) => {
    if (!l.trim()) blankLines.add(i2 + 1);
  });
  const spans = {
    functions,
    typeRanges,
    importRanges,
    reexportRanges,
    bindings,
    blankLines,
    lineCount: lines4.length
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
      const p = keyName2(x.property, false);
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
  const method = keyName2(callee.property, false);
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
    const prop = p.type === "JSXIdentifier" ? p.name : keyName2(p, false);
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
        if (keys && keys.every((k) => k.type === "Property" && keyName2(k.key, k.computed) !== null)) {
          destructured = { node: load, names: keys.map((k) => keyName2(k.key, k.computed)) };
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
        const local = keyName2(sp.local, false) ?? "?";
        const exported = keyName2(sp.exported, false) ?? local;
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
      const ns = isNode(s.exported) ? keyName2(s.exported, false) : null;
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
          const imported = sp.type === "ImportDefaultSpecifier" ? "default" : sp.type === "ImportNamespaceSpecifier" ? "*" : keyName2(sp.imported, false) ?? "?";
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
function pyIndex(tree, files, resolve8) {
  let index = pyIndexes.get(tree);
  if (index) return index;
  index = /* @__PURE__ */ new Map();
  for (const p of files) {
    const src = tree.read(p);
    if (!src) continue;
    for (const m of pyImportedModules(src, tree.id?.(p))) {
      const r = resolve8(p, m);
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
  const resolve8 = () => resolverFor(ctx);
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
    const parts2 = resolve8().pyModuleName(path).split(".");
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
    const index = pyIndex(tree, sourcesOf("py"), (p, m) => resolve8().py(p, m));
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
    const needles = [...stems(path), ...resolve8().packageNamesFor(path), ...resolve8().aliasNeedles(path)];
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
      const r = resolve8().py(from, spec);
      return r !== "external" && r !== "unknown" && r.includes(path);
    }
    return mayBe(resolve8().js(from, spec), spec, path);
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
    const narrowed = (kind === "ci" || kind === "unknown") && opts.narrow ? opts.narrow(d.path, kind, read) : null;
    if (kind === "snapshot") {
      const t = snapshotTestFile(d.path);
      if (t && (!opts.knownTests || opts.knownTests.has(t))) cs.changedTests.add(t);
      else fc.runAll = "snapshot without a known test file";
    } else if (narrowed) {
      fc.fileLevel = "read";
      fc.note = narrowed;
    } else if (kind === "ci" && WORKFLOW.test(d.path)) {
      const gated = opts.strictWorkflows ? true : opts.testWorkflows ? opts.testWorkflows.includes(d.path) : [read("new", d.path), read("old", d.path)].some((t) => t === null || RUNS_TESTS.test(t));
      if (gated) fc.runAll = "ci";
      else fc.note = "workflow does not run gated tests";
    } else if (kind === "lockfile" && opts.lockfiles === "importers") {
      const scope = lockfileScope({
        path: d.path,
        oldText: d.status === "added" ? null : read("old", d.path),
        newText: d.status === "deleted" ? null : read("new", d.path),
        readHead: (p) => opts.tree?.read(p) ?? null,
        yarnManifests: () => {
          const side = (s) => {
            const m = /* @__PURE__ */ new Map();
            const dirs = ["", ...workspaces().map((w) => w.root)];
            opts.prefetchAny?.(
              s,
              dirs.map((dir) => dir ? `${dir}/package.json` : "package.json")
            );
            for (const dir of dirs) {
              const text = (opts.readAny ?? read)(s, dir ? `${dir}/package.json` : "package.json");
              if (text === null) continue;
              try {
                const j = JSON.parse(text);
                if (isObj(j)) m.set(dir, j);
              } catch {
              }
            }
            return m;
          };
          return { old: side("old"), new: side("new") };
        }
      });
      if (scope.kind === "all") fc.runAll = scope.reason;
      else {
        const roots = /* @__PURE__ */ new Set();
        for (const dir of scope.dirs) {
          roots.add(dir);
          for (const r of packageAndDependents(workspaces(), dir)) roots.add(r);
        }
        fc.packageScope = [...roots].sort();
        fc.note = scope.note;
        fc.fileLevel = "read";
        if (scope.rootOwned) {
          fc.note += "; the root importer links to one, so tests outside every importer run";
          cs.packageScopes.push({ path: d.path, root: "", reason: kind, except: scope.importerDirs });
        }
      }
    } else if (RUN_ALL_KINDS.has(kind)) {
      const root = kind !== "lockfile" && opts.nonCodeInPackage === "package" ? packageOf2(d.path) : null;
      const dir = d.path.slice(0, Math.max(0, d.path.lastIndexOf("/")));
      const scoped = kind === "manifest" && d.path.endsWith("/package.json") ? packageAndDependents(workspaces(), dir) : [];
      const fb = !root && !scoped.length && kind !== "lockfile" ? opts.fallback?.(d.path, kind) : null;
      if (root) fc.packageScope = [root];
      else if (scoped.length) {
        fc.packageScope = scoped;
        fc.note = "workspace manifest: package and its dependents";
      } else if (fb?.kind === "scope" || fb?.kind === "readers") {
        fc.fileLevel = "read";
        fc.note = fb.note;
        if (fb.kind === "scope") {
          fc.packageScope = fb.roots;
          if (fb.rootPackage)
            cs.packageScopes.push({
              path: d.path,
              root: "",
              reason: kind,
              except: fb.packageRoots
            });
        }
      } else if (fb?.kind === "all")
        fc.runAll = `${kind === "unknown" ? "unknown file type" : kind}: ${fb.reason}`;
      else fc.runAll = kind === "unknown" ? "unknown file type" : kind;
    } else if (d.status === "deleted") {
      fc.fileLevel = "deleted";
    } else if (d.binary) {
      fc.fileLevel = "binary";
    } else {
      const parser2 = parserFor(d.path);
      if (!parser2) {
        fc.fileLevel = "no-parser";
      } else {
        const lines4 = changedLines(d);
        const units = /* @__PURE__ */ new Set();
        let moduleLevel = false;
        const parsedSides = {};
        const moduleSides = {};
        for (const side of ["old", "new"]) {
          const ls = lines4[side];
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
    (f) => !f.runAll && (f.status === "added" || f.status === "deleted" || f.kind === "ignored" || f.fileLevel === "read")
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
    const wanted = kind === "source" && parserFor(d.path) || kind === "ci" && WORKFLOW.test(d.path) || kind === "lockfile" && /^(pnpm-lock\.yaml|package-lock\.json|npm-shrinkwrap\.json|yarn\.lock)$/.test(d.path) && opts.lockfiles === "importers";
    if (d.binary || !wanted) continue;
    if (d.oldPath && d.status !== "added") specs.push(`${base3}:${d.oldPath}`);
    if (d.newPath && d.status !== "deleted") specs.push(`${head}:${d.newPath}`);
  }
  const blobs = readBlobs(repo, specs);
  const workspaces = opts.workspaces ?? (() => mergeWorkspaces(readWorkspaces(repo, base3), readWorkspaces(repo, head)));
  const readAny = (side, p) => {
    const spec = `${side === "old" ? base3 : head}:${p}`;
    if (!blobs.has(spec)) for (const [k, v] of readBlobs(repo, [spec])) blobs.set(k, v);
    return blobs.get(spec) ?? null;
  };
  const prefetchAny = (side, paths) => {
    const specs2 = paths.map((p) => `${side === "old" ? base3 : head}:${p}`).filter((x) => !blobs.has(x));
    for (const [k, v] of readBlobs(repo, specs2)) blobs.set(k, v);
  };
  return analyzeChanges(diffs, (side, p) => blobs.get(`${side === "old" ? base3 : head}:${p}`) ?? null, {
    ...opts,
    workspaces,
    readAny,
    prefetchAny,
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

// ../engine/src/narrow.ts
var WORKFLOW2 = /^\.github\/workflows\/[^/]+\.ya?ml$/;
var LOCAL_USES = /^[ \t]*-?[ \t]*uses:[ \t]*['"]?\.\/([^'"\s#]*)['"]?/gm;
var DATA_FILE = /\.(json|jsonc|json5|jsonl|ndjson|ya?ml|toml|txt|csv|tsv|xml|html?|ini|properties)$/i;
var CONFIG_NAME = [
  /^(Dockerfile|Containerfile|Makefile|GNUmakefile|makefile|justfile|Justfile|Taskfile|Procfile|Brewfile|Gemfile|Rakefile|Vagrantfile|Jenkinsfile|CMakeLists|BUILD|WORKSPACE|MODULE|Pipfile|MANIFEST)(\..*)?$/,
  /\.(dockerfile|mk|cmake|bzl|bazel|nix)$/i,
  /^(docker-)?compose([.-][\w.-]*)?\.ya?ml$/,
  /(^|[.\-_])(config|conf|settings)\.\w+$/i,
  /^(renovate|biome|deno|jsr|vercel|firebase|app|angular|project|workspace|rush|components|tsdoc|api-extractor|typedoc|cypress|nodemon|lefthook|import_map|importmap|pyrightconfig|manifest|codecov|environment|mkdocs|sonar-project|wrangler|netlify|fly|render|railway|now|package|bunfig|ruff|mypy|pylintrc|setup|tox|pytest|constraints|requirements)\b[\w.-]*$/i,
  /\.code-workspace$/
];
var RUNNER_CONFIG = /(^|\/)(vite|vitest|jest|webpack|rollup|babel|rspack|rsbuild|esbuild|tsup|postcss|tailwind|svelte|astro|nuxt|next)\.(config|workspace)(\.[\w-]+)*\.[cm]?[jt]s(on)?$|(^|\/)\.babelrc(\.[cm]?js(on)?)?$/;
var MAIN_PROCESS = /\b(plugins|transform|globalSetup|globalTeardown|preprocess|resolveId|setupNodeEvents)\b/;
var PKG_RUNNER_KEYS = /"(babel|globalSetup|globalTeardown|transform)"\s*:/;
var TEXT_FILE = /\.([cm]?[jt]sx?|py|json|jsonc|json5|ya?ml|toml|txt|xml|html?|ini|cfg|properties|sh|bash|zsh|fish|ps1|bat|cmd|mk|just|rb|go|rs|java|kt|kts|gradle|php|pl|lua|swift|cs|scala|groovy|r|jl|vue|svelte|astro|mdx)$/i;
var NAMED_SCRIPT = /^(Dockerfile|Containerfile|Makefile|GNUmakefile|makefile|justfile|Justfile|Taskfile|Rakefile|Procfile|Jenkinsfile)(\..*)?$/;
var MAX_CORPUS_FILES = 3e4;
var MAX_CORPUS_BYTES = 256 * 1024 * 1024;
var MAX_TEXT = 2 * 1024 * 1024;
var baseOf4 = (p) => p.slice(p.lastIndexOf("/") + 1);
var dirOf5 = (p) => p.includes("/") ? p.slice(0, p.lastIndexOf("/")) : "";
function normalize5(p) {
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
function jobSetup(tree, workflow) {
  const first = tree.read(workflow);
  if (first === null) return null;
  const workflows = /* @__PURE__ */ new Set([workflow]);
  const actions = /* @__PURE__ */ new Set();
  const texts = [];
  const queue = [[workflow, first]];
  while (queue.length) {
    const [, text] = queue.shift();
    texts.push(text);
    for (const m of text.matchAll(LOCAL_USES)) {
      const target = normalize5(m[1].replace(/@.*$/, ""));
      if (target === null) continue;
      if (WORKFLOW2.test(target)) {
        if (workflows.has(target)) continue;
        workflows.add(target);
        const t = tree.read(target);
        if (t !== null) queue.push([target, t]);
      } else {
        if (actions.has(target)) continue;
        actions.add(target);
        const prefix = target ? `${target}/` : "";
        const t = tree.read(`${prefix}action.yml`) ?? tree.read(`${prefix}action.yaml`);
        if (t !== null) queue.push([target, t]);
      }
    }
  }
  return { workflows: [...workflows].sort(), actions: [...actions].sort(), texts };
}
function jobActionFile(setup, path) {
  for (const a of setup.actions) if (a === "" || path === a || path.startsWith(`${a}/`)) return a || ".";
  return null;
}
function mainProcessReaders(tree) {
  const paths = tree.paths().filter((p) => !p.includes("node_modules/"));
  const configs = paths.filter((p) => RUNNER_CONFIG.test(p));
  const pkgs = paths.filter((p) => p === "package.json" || p.endsWith("/package.json"));
  tree.prefetch?.([...configs, ...pkgs]);
  for (const c of configs) {
    if (/(^|\/)(babel\.config|\.babelrc)/.test(c)) return `${c} configures Babel transforms`;
    const src = tree.read(c);
    if (src === null || MAIN_PROCESS.test(src))
      return `${c} declares plugins, transforms or global setup that read files no recorder sees`;
  }
  for (const p of pkgs) {
    const src = tree.read(p);
    if (src !== null && PKG_RUNNER_KEYS.test(src)) return `${p} configures Babel, transforms or global setup`;
  }
  return null;
}
function corpus(ctx) {
  const loaded = /* @__PURE__ */ new Set();
  for (const rec of ctx.map.tests.values()) for (const l of rec.loaded) loaded.add(l);
  const paths = ctx.tree.paths().filter(
    (p) => !p.includes("node_modules/") && // Extensionless files are scripts as often as not (`scripts/setup-db`).
    (TEXT_FILE.test(p) || NAMED_SCRIPT.test(baseOf4(p)) || !baseOf4(p).includes(".")) && !ctx.isTest(p) && !((isJs(p) || isPy(p)) && loaded.has(p)) && !["ignored", "lockfile", "snapshot", "test"].includes(classify(p))
  );
  if (paths.length > MAX_CORPUS_FILES) return `${paths.length} files could name it (max ${MAX_CORPUS_FILES})`;
  ctx.tree.prefetch?.(paths);
  const out2 = [];
  let bytes = 0;
  for (const p of paths) {
    const text = ctx.tree.read(p);
    if (text === null) continue;
    bytes += text.length;
    if (bytes > MAX_CORPUS_BYTES) return `over ${MAX_CORPUS_BYTES} bytes of files could name it`;
    if (text.length > MAX_TEXT) {
      if (isJs(p) || isPy(p) || NAMED_SCRIPT.test(baseOf4(p)) || !baseOf4(p).includes("."))
        return `${p} is too large to scan`;
      continue;
    }
    out2.push({ path: p, text });
  }
  return out2;
}
var esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function namesPath(text, from, path, workspaceRoots = []) {
  if (text.includes(baseOf4(path))) return true;
  const fromDir = dirOf5(from);
  const segs = path.split("/");
  for (let i2 = segs.length - 1; i2 >= 1; i2--) {
    const dir = segs.slice(0, i2).join("/");
    if (workspaceRoots.some((r) => r === dir || r.startsWith(`${dir}/`))) break;
    const forms = [dir, baseOf4(dir)];
    if (fromDir && dir.startsWith(`${fromDir}/`)) forms.push(dir.slice(fromDir.length + 1));
    for (const f of forms) {
      const rx = f.includes("/") ? new RegExp(`(^|[^\\w.-])(\\./)?${esc(f)}(?![\\w.-])`) : new RegExp(`(['"\`]|\\./|^|\\s)${esc(f)}(/|['"\`])`, "m");
      if (rx.test(text)) return true;
    }
  }
  return false;
}
function configInput(path, workspaceRoots) {
  const name2 = baseOf4(path);
  const dir = dirOf5(path);
  if (path.split("/").some((s) => s.startsWith("."))) return "a dotfile or in a dot directory";
  if (!dir) return "at the repo root";
  if (workspaceRoots.includes(dir)) return `at the root of the workspace package ${dir}`;
  if (CONFIG_NAME.some((r) => r.test(name2))) return "a tool config or build file by name";
  if (/^action\.ya?ml$/.test(name2)) return "an action definition";
  return null;
}
function loadedNamers(tree, map, tests, path, workspaceRoots = []) {
  const loaded = /* @__PURE__ */ new Set();
  for (const rec of map.tests.values())
    for (const l of rec.loaded) if (!l.endsWith("/") && (isJs(l) || isPy(l))) loaded.add(l);
  const candidates = [.../* @__PURE__ */ new Set([...loaded, ...tests])].filter((p) => p !== path);
  tree.prefetch?.(candidates);
  const namers = /* @__PURE__ */ new Set();
  for (const c of candidates) {
    const text = tree.read(c);
    if (text !== null && namesPath(text, c, path, workspaceRoots)) namers.add(c);
  }
  return namers;
}
function nonCodeNarrowing(ctx) {
  let mainProcess;
  let texts;
  const narrowWorkflow = (path, read) => {
    const setup = ctx.setup;
    if (!setup || !WORKFLOW2.test(path) || setup.workflows.includes(path)) return null;
    const job = setup.texts.join("\n");
    if (/\bworkflow_run\b/.test(job) || /action-download-artifact/.test(job)) return null;
    if (/download-artifact/.test(job) && /\brun[-_]id\s*:/.test(job)) return null;
    const sides = [read("old", path), read("new", path)];
    if (/actions\/cache/.test(job) && sides.some((t) => t !== null && /actions\/cache(\/save)?@/.test(t)))
      return null;
    return `workflow ${path} defines none of this job's steps; only tests that read it run`;
  };
  const narrowData = (path) => {
    if (!DATA_FILE.test(path) || path.startsWith(".github/")) return null;
    if (configInput(path, ctx.workspaceRoots)) return null;
    const dir = dirOf5(path);
    const actionDir = ctx.tree.read(`${dir}/action.yml`) !== null || ctx.tree.read(`${dir}/action.yaml`) !== null;
    if (actionDir && !ctx.setup) return null;
    if (ctx.tree.read(".gitmodules") !== null) return null;
    mainProcess ??= mainProcessReaders(ctx.tree);
    if (mainProcess) return null;
    texts ??= corpus(ctx);
    if (typeof texts === "string") return null;
    if (texts.some((t) => t.path !== path && namesPath(t.text, t.path, path, ctx.workspaceRoots)))
      return null;
    return "a data file no build, CI or config file names; only tests that read it run";
  };
  return (path, kind, read) => {
    if (!ctx.readsAndChildren) return null;
    if (kind === "ci") return narrowWorkflow(path, read);
    if (kind === "unknown") return narrowData(path);
    return null;
  };
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
  const lines4 = src.split("\n");
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
  for (let i2 = 0; i2 < lines4.length; i2++) {
    const parts2 = statements(lines4[i2]);
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
        for (let k = 1; k <= 500 && i2 + 1 < lines4.length; k++) {
          const more = noComment(lines4[++i2]);
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
  for (const { root, path, except } of changes.packageScopes) {
    const under = (f) => root === "" ? !(except ?? []).some((e) => f.startsWith(e + "/")) : f.startsWith(root + "/");
    const scoped = (t) => {
      const rs = tests.get(t);
      const r = rs?.find((x) => x.kind === "package" && x.root === root);
      if (r && r.kind === "package") {
        if (!r.files.includes(path)) r.files.push(path);
      } else add2(t, { kind: "package", root, files: [path] });
    };
    for (const t of universe) if (under(t)) scoped(t);
    if (root !== "")
      for (const [t, cov] of map.tests) {
        if (tests.get(t)?.some((x) => x.kind === "package" && x.root === root)) continue;
        for (const l of cov.loaded)
          if (l.startsWith(root + "/")) {
            scoped(t);
            break;
          }
      }
  }
  if (always) {
    for (const t of universe) if (always(t)) add2(t, { kind: "always" });
  }
  const skipped = [...universe].filter((t) => !tests.has(t));
  return { runAll: false, tests, skipped };
}

// ../engine/src/graph/nx.ts
var WORKSPACE_ROOT = /^\{workspaceRoot\}\/(.+)$/;
function rootGlobs(inputs) {
  if (!Array.isArray(inputs)) return [];
  const out2 = [];
  for (const i2 of inputs) {
    const s = typeof i2 === "string" ? i2 : isObj(i2) && typeof i2.fileset === "string" ? i2.fileset : null;
    const m = s ? WORKSPACE_ROOT.exec(s) : null;
    if (m) out2.push(m[1]);
  }
  return out2;
}
function configGlobs(cfg, targetsKey) {
  const out2 = [];
  if (isObj(cfg.namedInputs)) for (const v of Object.values(cfg.namedInputs)) out2.push(...rootGlobs(v));
  const targets = cfg[targetsKey];
  if (isObj(targets)) {
    for (const t of Object.values(targets)) if (isObj(t)) out2.push(...rootGlobs(t.inputs));
  }
  return out2;
}
function nxConfig(tree, files) {
  const cfg = { used: false, projects: [], inputs: [] };
  const nxText = tree.read("nx.json");
  if (nxText !== null) {
    cfg.used = true;
    let nx;
    try {
      nx = parseJsonc(nxText);
    } catch (e) {
      return `nx.json is unparseable (${e.message})`;
    }
    if (!isObj(nx)) return "nx.json is not an object";
    for (const g of configGlobs(nx, "targetDefaults"))
      cfg.inputs.push({ glob: g, roots: null, from: "nx.json" });
    if (isObj(nx.implicitDependencies))
      for (const [file, v] of Object.entries(nx.implicitDependencies)) {
        const names2 = Array.isArray(v) ? v.filter((x) => typeof x === "string") : null;
        cfg.inputs.push({
          glob: file,
          roots: null,
          from: "nx.json implicitDependencies",
          ...names2 && { names: names2 }
        });
      }
  }
  const projectFiles = files.filter((f) => f === "project.json" || f.endsWith("/project.json"));
  tree.prefetch?.(projectFiles);
  for (const f of projectFiles) {
    const text = tree.read(f);
    if (text === null) continue;
    cfg.used = true;
    let p;
    try {
      p = parseJsonc(text);
    } catch (e) {
      return `${f} is unparseable (${e.message})`;
    }
    if (!isObj(p)) return `${f} is not an object`;
    const root = dirOf3(f);
    if (root === "") return "project.json at the repo root (one project holds every file)";
    const implicit = Array.isArray(p.implicitDependencies) ? p.implicitDependencies.filter((x) => typeof x === "string" && !x.startsWith("!")) : [];
    cfg.projects.push({ root, name: typeof p.name === "string" ? p.name : null, implicit });
    for (const g of configGlobs(p, "targets")) cfg.inputs.push({ glob: g, roots: [root], from: f });
  }
  return cfg;
}

// ../engine/src/graph/turbo.ts
var TURBO_ROOT = /^\$TURBO_ROOT\$\/(.+)$/;
function taskRootInputs(cfg) {
  const out2 = [];
  for (const key of ["tasks", "pipeline"]) {
    const tasks = cfg[key];
    if (!isObj(tasks)) continue;
    for (const t of Object.values(tasks)) {
      if (!isObj(t) || !Array.isArray(t.inputs)) continue;
      for (const i2 of t.inputs) {
        const m = typeof i2 === "string" ? TURBO_ROOT.exec(i2) : null;
        if (m) out2.push(m[1]);
      }
    }
  }
  return out2;
}
function turboConfig(tree, files, roots) {
  const out2 = [];
  const configs = files.filter(
    (f) => f === "turbo.json" || f.endsWith("/turbo.json") && roots.includes(dirOf3(f))
  );
  tree.prefetch?.(configs);
  for (const f of configs) {
    const text = tree.read(f);
    if (text === null) continue;
    let cfg;
    try {
      cfg = parseJsonc(text);
    } catch (e) {
      return `${f} is unparseable (${e.message})`;
    }
    if (!isObj(cfg)) return `${f} is not an object`;
    const scope = f === "turbo.json" ? null : [dirOf3(f)];
    if (f === "turbo.json" && cfg.globalDependencies !== void 0) {
      if (!Array.isArray(cfg.globalDependencies)) return "turbo.json globalDependencies is not a list";
      for (const g of cfg.globalDependencies)
        if (typeof g === "string" && !g.startsWith("!"))
          out2.push({ glob: g, roots: null, from: "turbo.json" });
    }
    for (const g of taskRootInputs(cfg)) out2.push({ glob: g, roots: scope, from: f });
  }
  return out2;
}

// ../engine/src/graph/index.ts
var DEP_FIELDS2 = ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"];
function readJson(tree, path) {
  const text = tree.read(path);
  if (text === null) return null;
  if (text.length > MAX_CONFIG_BYTES) return { error: `${path} is over ${MAX_CONFIG_BYTES} bytes` };
  try {
    return { value: JSON.parse(text) };
  } catch (e) {
    return { error: `${path} is unparseable (${e.message.split("\n")[0]})` };
  }
}
function readPackageGraph(tree) {
  const files = tree.paths().filter((p) => !p.includes("node_modules/"));
  const graph = { packages: [], tools: [], inputs: [], rootDeps: /* @__PURE__ */ new Set() };
  const fail = (why) => ({ ...graph, unreadable: why });
  const byRoot = /* @__PURE__ */ new Map();
  const pkg = (root) => {
    let p = byRoot.get(root);
    if (!p) byRoot.set(root, p = { root, names: [], deps: /* @__PURE__ */ new Set() });
    return p;
  };
  const globs = [];
  const rootPkg = readJson(tree, "package.json");
  if (rootPkg && "error" in rootPkg) return fail(rootPkg.error);
  if (rootPkg && isObj(rootPkg.value)) {
    const w = rootPkg.value.workspaces;
    const list3 = Array.isArray(w) ? w : isObj(w) && Array.isArray(w.packages) ? w.packages : [];
    if (list3.length) graph.tools.push("workspaces");
    for (const g of list3) if (typeof g === "string") globs.push(g);
    for (const f of DEP_FIELDS2) {
      const deps = rootPkg.value[f];
      if (isObj(deps)) for (const n of Object.keys(deps)) graph.rootDeps.add(n);
    }
  }
  const pnpm = tree.read("pnpm-workspace.yaml");
  if (pnpm !== null) {
    globs.push(...pnpmWorkspaceGlobs(pnpm));
    graph.tools.push("pnpm");
  }
  const dirs = workspaceDirs(globs, files).filter((d) => d !== "");
  tree.prefetch?.(dirs.map((d) => `${d}/package.json`));
  for (const d of dirs) {
    const j = readJson(tree, `${d}/package.json`);
    if (!j) continue;
    if ("error" in j) return fail(j.error);
    if (!isObj(j.value)) return fail(`${d}/package.json is not an object`);
    const p = pkg(d);
    if (typeof j.value.name === "string") p.names.push(j.value.name);
    for (const f of DEP_FIELDS2) {
      const deps = j.value[f];
      if (isObj(deps)) for (const n of Object.keys(deps)) p.deps.add(n);
    }
  }
  if (tree.read("nx.json") !== null) {
    const nx = nxConfig(tree, files);
    if (typeof nx === "string") return fail(nx);
    if (nx.used) graph.tools.push("nx");
    for (const pr of nx.projects) {
      const p = pkg(pr.root);
      if (pr.name && !p.names.includes(pr.name)) p.names.push(pr.name);
      for (const d of pr.implicit) p.deps.add(d);
      if (!p.names.length) p.names.push(baseOf2(pr.root));
    }
    graph.inputs.push(...nx.inputs);
  }
  if (tree.read("turbo.json") !== null) {
    const turbo = turboConfig(tree, files, [...byRoot.keys()]);
    if (typeof turbo === "string") return fail(turbo);
    graph.tools.push("turbo");
    graph.inputs.push(...turbo);
  }
  try {
    for (const i2 of graph.inputs) compileGlob(i2.glob);
    const allNames = [...byRoot.values()].flatMap((p) => p.names);
    for (const p of byRoot.values())
      for (const d of [...p.deps])
        if (/[*?{[]/.test(d)) {
          p.deps.delete(d);
          for (const n of allNames) if (globMatch(d, n)) p.deps.add(n);
        }
  } catch (e) {
    return fail(`a declared glob can't be read (${e.message})`);
  }
  graph.packages = [...byRoot.values()].sort((a, b) => a.root.localeCompare(b.root));
  return graph;
}
function mergeGraphs(a, b) {
  const by = /* @__PURE__ */ new Map();
  for (const p of [...a.packages, ...b.packages]) {
    const prev = by.get(p.root);
    if (!prev) by.set(p.root, { root: p.root, names: [...p.names], deps: new Set(p.deps) });
    else {
      for (const n of p.names) if (!prev.names.includes(n)) prev.names.push(n);
      for (const d of p.deps) prev.deps.add(d);
    }
  }
  const unreadable = a.unreadable ?? b.unreadable;
  return {
    packages: [...by.values()].sort((x, y) => x.root.localeCompare(y.root)),
    tools: [.../* @__PURE__ */ new Set([...a.tools, ...b.tools])],
    inputs: [...a.inputs, ...b.inputs],
    rootDeps: /* @__PURE__ */ new Set([...a.rootDeps, ...b.rootDeps]),
    ...unreadable && { unreadable }
  };
}
function owningPackage(graph, path) {
  let best = null;
  for (const p of graph.packages)
    if (path.startsWith(`${p.root}/`) && (!best || p.root.length > best.root.length)) best = p;
  return best;
}
function enclosingPackages(graph, path) {
  return graph.packages.filter((p) => path.startsWith(`${p.root}/`));
}
function rootDependsOn(graph, roots) {
  return graph.packages.some((p) => roots.includes(p.root) && p.names.some((n) => graph.rootDeps.has(n)));
}
function withDependents(graph, roots) {
  const out2 = /* @__PURE__ */ new Set();
  const names2 = /* @__PURE__ */ new Set();
  const add2 = (p) => {
    out2.add(p.root);
    for (const n of p.names) names2.add(n);
  };
  for (const r of roots) {
    const p = graph.packages.find((x) => x.root === r);
    if (p) add2(p);
  }
  for (let grew = true; grew; ) {
    grew = false;
    for (const p of graph.packages) {
      if (out2.has(p.root) || ![...p.deps].some((d) => names2.has(d))) continue;
      add2(p);
      grew = true;
    }
  }
  return [...out2].sort();
}
function declaredInputs(graph, path) {
  return graph.inputs.filter((i2) => globMatch(i2.glob, path));
}

// ../engine/src/graph/fallback.ts
var ENV_FILE2 = /^\.env(\.|$)/;
var INSTALL_CONFIG = /* @__PURE__ */ new Set([
  ".npmrc",
  ".yarnrc",
  ".yarnrc.yml",
  "bunfig.toml",
  "pnpm-workspace.yaml",
  ".pnpmfile.cjs",
  ".pnpmfile.mjs"
]);
var RUNTIME_VERSION = /* @__PURE__ */ new Set([".nvmrc", ".node-version", ".tool-versions", ".python-version"]);
var GRAPH_CONFIG = /* @__PURE__ */ new Set(["turbo.json", "nx.json", "lerna.json", "rush.json"]);
var DOCKERISH = /^(Dockerfile|Containerfile)(\..*)?$|\.dockerfile$|^\.dockerignore$/i;
var BUILDS_IMAGES = /\b(docker|podman|buildx|buildah|kaniko)\b|build-push-action/i;
var BUILD_FILE = /^(Dockerfile|Containerfile|Makefile|GNUmakefile|makefile|justfile|Justfile|Taskfile|Procfile|Jenkinsfile|CMakeLists|BUILD|WORKSPACE|MODULE)(\..*)?$|\.(dockerfile|mk|cmake|bzl|bazel|nix)$|^(docker-)?compose([.-][\w.-]*)?\.ya?ml$/;
var DATA_TEXT = /\.(jsonl|ndjson|csv|tsv|txt|xml|html?|svg|po|pot|snap|lock)$/i;
var JSON_CONFIG = /^(package|project|turbo|nx|lerna|rush|tsconfig[\w.-]*|jsconfig[\w.-]*|[\w.-]*\.config|[\w.-]*rc|renovate|vercel|firebase|app|angular|components|deno|biome)\.json5?c?$|^\.[\w.-]+rc(\.json)?$/;
var LINT_CONFIG = /^\.?(eslint|oxlint|oxfmt|prettier|stylelint|biome|dprint|commitlint|lintstaged|lint-staged|markdownlint|cspell|typos|knip|syncpack|coderabbit|codecov|renovate|sonar-project|release-please)[\w.-]*$|^\.editorconfig$|^\.[\w-]*ignore$|^\.gitattributes$|^CODEOWNERS$/i;
var MAX_NAMER_FILES = 1e5;
var PY_PROJECT = /^(pyproject\.toml|setup\.py|setup\.cfg|Pipfile|conftest\.py|pytest\.ini|tox\.ini|noxfile\.py|requirements([-_.][\w-]+)?\.(txt|in))$/;
function namerFile(p) {
  const n = baseOf2(p);
  if (LINT_CONFIG.test(n) || DATA_TEXT.test(n)) return false;
  if (/\.json5?c?$/i.test(n)) return JSON_CONFIG.test(n) || CONFIG_NAME.some((r) => r.test(n));
  return TEXT_FILE.test(p) || NAMED_SCRIPT.test(n) || !n.includes(".");
}
var esc2 = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var START = `(?<![\\w.\\-])`;
var fileRx = (t) => new RegExp(`${START}${esc2(t)}(?![\\w.\\-/])`);
var dirRx = (t) => new RegExp(`${START}${esc2(t)}(?:/?(?![\\w.\\-/])|/(?=[*{]))`);
function innerDirs(path, root) {
  const out2 = [];
  for (let d = dirOf3(path); d && d !== root && (root === "" || d.startsWith(`${root}/`)); d = dirOf3(d))
    out2.push(d);
  return out2;
}
function packageFallback(ctx) {
  const { tree, graph } = ctx;
  const usable2 = graph.packages.length > 0 && !graph.unreadable;
  const tools = new Set(graph.tools);
  const buildCache = tools.has("turbo") || tools.has("nx");
  let globals;
  const globalTexts = () => {
    if (globals) return globals;
    const paths = tree.paths().filter(
      (p) => (!p.includes("/") || !ctx.setup && p.startsWith(".github/")) && // The build cache's own declarations are read as declarations (`declared`), not as namers.
      !GRAPH_CONFIG.has(p) && namerFile(p) && !["ignored", "lockfile", "snapshot"].includes(classify(p))
    );
    tree.prefetch?.(paths);
    globals = [];
    for (const p of paths) {
      const text = tree.read(p);
      if (text !== null) globals.push({ path: p, text });
    }
    if (ctx.setup) ctx.setup.texts.forEach((text, i2) => globals.push({ path: `job setup ${i2}`, text }));
    return globals;
  };
  let corpus2;
  const corpusTexts = () => {
    if (corpus2) return corpus2;
    const paths = tree.paths().filter(
      (p) => p.includes("/") && !p.startsWith(".github/") && !p.includes("node_modules/") && namerFile(p) && !["ignored", "lockfile", "snapshot"].includes(classify(p))
    );
    if (paths.length > MAX_NAMER_FILES)
      return corpus2 = `${paths.length} files could name it (max ${MAX_NAMER_FILES})`;
    tree.prefetch?.(paths);
    const out2 = [];
    let bytes = 0;
    for (const p of paths) {
      const text = tree.read(p);
      if (text === null) continue;
      bytes += text.length;
      if (bytes > MAX_CORPUS_BYTES) return corpus2 = `over ${MAX_CORPUS_BYTES} bytes of files could name it`;
      if (text.length <= MAX_TEXT) out2.push({ path: p, text });
    }
    return corpus2 = out2;
  };
  const anchored = /* @__PURE__ */ new Map();
  const withAnchor = (texts, anchor) => {
    let hit = anchored.get(anchor);
    if (!hit) anchored.set(anchor, hit = texts.filter((t) => t.text.includes(anchor)));
    return hit;
  };
  const globalNamer = (path, root) => {
    const file = [fileRx(path)];
    const dirs = innerDirs(path, root).filter((d) => root !== "" || d.includes("/")).map(dirRx);
    const rel = root ? path.slice(root.length + 1) : null;
    const relRx = rel ? fileRx(rel.includes("/") ? rel : `./${rel}`) : null;
    const baseRx = fileRx(baseOf2(path));
    const inRootRx = root ? new RegExp(`${START}${esc2(root)}(?![\\w.\\-])`) : null;
    for (const t of globalTexts()) {
      if (t.path === path) continue;
      if (file.some((r) => r.test(t.text)) || dirs.some((r) => r.test(t.text))) return t.path;
      if (inRootRx && t.text.includes(root) && inRootRx.test(t.text)) {
        const image = DOCKERISH.test(baseOf2(path)) && (BUILDS_IMAGES.test(t.text) || BUILD_FILE.test(baseOf2(t.path)));
        if (image || relRx.test(t.text) || baseRx.test(t.text)) return t.path;
      }
    }
    return null;
  };
  const scanned = /* @__PURE__ */ new Map();
  const scan = (texts, rx, anchor) => {
    const key = `${anchor}\0${rx.source}`;
    let hit = scanned.get(key);
    if (!hit)
      scanned.set(
        key,
        hit = withAnchor(texts, anchor).filter((t) => rx.test(t.text)).map((t) => t.path)
      );
    return hit;
  };
  const namersOf = (path, root, names2, kind) => {
    const texts = corpusTexts();
    if (typeof texts === "string") return texts;
    const rel = root ? path.slice(root.length + 1) : path;
    const relDirs = innerDirs(path, root).map((d) => root ? d.slice(root.length + 1) : d);
    const prefixes = root ? [baseOf2(root), ...names2] : [""];
    const tests = [];
    for (const pre of prefixes) {
      const join6 = (x) => pre ? `${pre}/${x}` : x;
      tests.push({ rx: fileRx(join6(rel)), anchor: baseOf2(rel) });
      for (const d of relDirs) {
        if (root || d.includes("/")) tests.push({ rx: dirRx(join6(d)), anchor: baseOf2(d) });
        else tests.push({ rx: new RegExp(`(['"\`]|\\./|\\.\\./|^|\\s)${esc2(d)}(/|['"\`])`, "m"), anchor: d });
      }
    }
    if (root && (kind !== "unknown" || DOCKERISH.test(baseOf2(path)))) {
      tests.push({ rx: dirRx(root), anchor: root });
      tests.push({ rx: new RegExp(`/${esc2(baseOf2(root))}/?(?![\\w.\\-/])`), anchor: `/${baseOf2(root)}` });
    }
    const packages = /* @__PURE__ */ new Set();
    let rootPackage = false;
    for (const { rx, anchor } of tests)
      for (const p of scan(texts, rx, anchor)) {
        if (p === path || root && p.startsWith(`${root}/`)) continue;
        const n = baseOf2(p);
        if (BUILD_FILE.test(n) || NAMED_SCRIPT.test(n)) return { packages, rootPackage, all: p };
        const owner = owningPackage(graph, p);
        if (owner) packages.add(owner.root);
        else if (classify(p) === "test") rootPackage = true;
        else return { packages, rootPackage, all: p };
      }
    return { packages, rootPackage, all: null };
  };
  const scoped = (path, kind, owners, what) => {
    const owner = owners.reduce(
      (a, p) => !a || p.root.length > a.root.length ? p : a,
      null
    );
    const root = owner?.root ?? "";
    const g = globalNamer(path, root);
    if (g)
      return { kind: "all", reason: `${what}; ${g} names it, and may build or run it for every package` };
    const n = namersOf(path, root, owner?.names ?? [], kind);
    if (typeof n === "string") return { kind: "all", reason: `${what}; can't check who names it: ${n}` };
    if (n.all)
      return { kind: "all", reason: `${what}; ${n.all} names it, and may build or run it for every package` };
    const start2 = /* @__PURE__ */ new Set([...n.packages, ...owners.map((p) => p.root)]);
    const scope = withDependents(graph, start2);
    const rootPackage = root === "" || n.rootPackage || rootDependsOn(graph, scope);
    const others = [...n.packages].filter((r) => !owners.some((p) => p.root === r));
    return {
      kind: "scope",
      roots: scope,
      rootPackage,
      packageRoots: graph.packages.map((p) => p.root),
      note: `${what}: ${root ? `${owners.map((p) => p.root).join(", ")} and dependents` : "the tests outside every package"}${others.length ? `, and ${others.join(", ")}, which name it` : ""}${root && rootPackage ? ", and the tests outside every package" : ""}, plus the tests that read it`
    };
  };
  const declared2 = (path) => {
    const hits = declaredInputs(graph, path);
    if (!hits.length) return null;
    const every = hits.find((h) => h.roots === null && !h.names);
    if (every)
      return { kind: "all", reason: `an input of every package's tasks (${every.from}: ${every.glob})` };
    const start2 = /* @__PURE__ */ new Set();
    for (const h of hits) {
      for (const r of h.roots ?? []) start2.add(r);
      for (const n of h.names ?? []) {
        const p = graph.packages.find((x) => x.names.includes(n));
        if (!p) return { kind: "all", reason: `${h.from} names ${n}, which is no project we know` };
        start2.add(p.root);
      }
    }
    const scope = withDependents(graph, start2);
    return {
      kind: "scope",
      roots: scope,
      rootPackage: rootDependsOn(graph, scope),
      packageRoots: graph.packages.map((p) => p.root),
      note: `declared as an input of ${[...start2].sort().join(", ")} (${hits.map((h) => h.from).join(", ")}): those and their dependents, plus the tests that read it`
    };
  };
  return (path, kind) => {
    if (!usable2 || kind !== "unknown" && kind !== "toolchain" && kind !== "manifest") return null;
    const name2 = baseOf2(path);
    if (ENV_FILE2.test(name2) || INSTALL_CONFIG.has(name2) || RUNTIME_VERSION.has(name2)) return null;
    if (!ctx.setup)
      for (let d = dirOf3(path); ; d = dirOf3(d)) {
        const pre = d ? `${d}/` : "";
        if (tree.read(`${pre}action.yml`) !== null || tree.read(`${pre}action.yaml`) !== null) return null;
        if (!d) break;
      }
    const owners = enclosingPackages(graph, path);
    if (owners.length) {
      if (owners.some((p) => path === `${p.root}/package.json`)) return null;
      return scoped(path, kind, owners, `in the package ${owners.map((p) => p.root).join(" and ")}`);
    }
    if (kind !== "unknown" && !(PY_PROJECT.test(name2) && path.includes("/")) || GRAPH_CONFIG.has(name2))
      return null;
    if (path.split("/").some((s) => s.startsWith("."))) return null;
    if (path.includes("/")) {
      const s = scoped(path, kind, [], `in ${dirOf3(path)}/, outside every workspace package`);
      const decl2 = declared2(path);
      if (s.kind !== "scope" || !decl2) return s;
      if (decl2.kind !== "scope") return decl2;
      return {
        ...s,
        roots: [.../* @__PURE__ */ new Set([...s.roots, ...decl2.roots])].sort(),
        note: `${s.note}; ${decl2.note}`
      };
    }
    if (CONFIG_NAME.some((r) => r.test(name2)) || DOCKERISH.test(name2) || BUILD_FILE.test(name2)) return null;
    const g = globalNamer(path, "");
    if (g) return { kind: "all", reason: `a repo-root file ${g} names` };
    const decl = declared2(path);
    if (decl) return decl;
    if (buildCache && ctx.format2)
      return {
        kind: "readers",
        note: `a repo-root file no ${tools.has("turbo") ? "turbo.json" : "Nx"} input declares; only tests that read it run`
      };
    return null;
  };
}

// ../engine/src/plan.ts
var PLAN_VERSION = "plan@3";
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
  if (!graph.packages.length) return null;
  const roots = graph.packages.map((w) => w.root);
  const out2 = /* @__PURE__ */ new Set();
  for (const f of changes.files) {
    if (f.kind === "ignored" || f.kind === "ci" && !f.runAll) continue;
    if (f.packageScope && !f.runAll) {
      for (const s of f.packageScope) {
        if (!roots.includes(s)) return null;
        for (const r of withDependents(graph, [s])) out2.add(r);
      }
      continue;
    }
    if (f.fileLevel === "read" && !f.runAll) continue;
    const root = packageOf(roots, f.path);
    if (!root) return null;
    for (const r of withDependents(graph, [root])) out2.add(r);
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
var RUNNER_CONFIG2 = /(^|\/)(vite|vitest|jest|webpack|rollup|babel|rspack)\.(config|workspace)(\.[\w-]+)*\.[cm]?[jt]s(on)?$|(^|\/)\.babelrc(\.json)?$/;
var ALIAS_OR_PLUGIN = /\b(alias|moduleNameMapper|resolveId|plugins|modulePaths|moduleDirectories)\b/;
function opaqueRunnerConfigs(tree) {
  const configs = tree.paths().filter((p) => RUNNER_CONFIG2.test(p) && !p.includes("node_modules/"));
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
  const pkgGraph = (() => {
    try {
      return mergeGraphs(readPackageGraph(gitTree(repo, from)), readPackageGraph(tree));
    } catch (e) {
      return { packages: [], tools: [], inputs: [], rootDeps: /* @__PURE__ */ new Set(), unreadable: String(e) };
    }
  })();
  const workspaceRoots = [.../* @__PURE__ */ new Set([...graph.map((w) => w.root), ...pkgGraph.packages.map((p) => p.root)])];
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
  const setup = input.workflow ? jobSetup(tree, input.workflow) : null;
  const narrow = input.map && mapInfo ? nonCodeNarrowing({
    tree,
    map: input.map,
    readsAndChildren: mapInfo.reads && mapInfo.children,
    setup,
    workspaceRoots,
    isTest: (p) => knownTests.has(p) || classify(p) === "test"
  }) : void 0;
  const changes = changesFromGit(repo, from, head, {
    knownTests,
    tree,
    strictWorkflows: true,
    // Lockfiles narrow only with records that list reads and a known job setup that sets no install flags (a
    // `--shamefully-hoist` or `npm_config_node_linker` there hoists what the lockfile files says is isolated).
    ...mapInfo?.reads && mapInfo.children && setup && !/hoist|node[-_]linker|npm_config_|pnpm_config_/i.test(setup.texts.join("\n")) && {
      lockfiles: "importers"
    },
    ...narrow && { narrow },
    // Selection rule 4 (plan@3): the package-graph fallback for files that would run everything.
    ...!pkgGraph.unreadable && pkgGraph.packages.length && {
      fallback: packageFallback({
        tree,
        graph: pkgGraph,
        format2: !!(mapInfo?.reads && mapInfo.children),
        setup
      })
    }
  });
  for (const t of changes.changedTests) universeSet.add(t);
  const t2 = performance.now();
  timings.diffMs = ms(t1, t2);
  const reasons = [];
  for (const t of changes.runAll) reasons.push(`changed ${t.path} (${t.reason})`);
  const policy = new Set(input.policyFiles ?? []);
  for (const f of changes.files) if (policy.has(f.path)) reasons.push(`changed ${f.path} (selection policy)`);
  if (setup)
    for (const f of changes.files) {
      const a = jobActionFile(setup, f.path);
      if (a) reasons.push(`changed ${f.path} (in ${a}, a local action this job's workflow uses)`);
    }
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
  const wsGraph = { packages: graph.map((w) => ({ root: w.root, names: [w.name], deps: w.deps })) };
  const affected = affectedPackages(wsGraph, changes);
  const roots = wsGraph.packages.map((w) => w.root);
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
    (f) => f.status !== "deleted" && ((f.kind === "source" || f.kind === "test") && (isJs(f.path) || isPy(f.path)) || !f.runAll && f.kind !== "lockfile" && f.kind !== "ignored" && f.kind !== "ci" && !!f.packageScope)
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
  if (input.map && mapInfo && changes.files.some((f) => f.kind === "unknown" && f.fileLevel === "read")) {
    const tracked = new Set(
      git(repo, ["ls-tree", "-r", "-z", "--name-only", mapInfo.commit]).split("\0").filter(Boolean)
    );
    for (const [t, rec] of input.map.tests) {
      const generated = [...rec.loaded].filter((l) => !l.endsWith("/") && !tracked.has(l));
      if (generated.length && universeSet.has(t))
        add2(t, { kind: "module", files: generated.slice(0, 5).sort() });
    }
  }
  if (input.map)
    for (const f of changes.files) {
      if (f.kind !== "unknown" || f.fileLevel !== "read" || f.runAll) continue;
      const namers = loadedNamers(tree, input.map, universeSet, f.path, workspaceRoots);
      if (!namers.size) continue;
      for (const [t, rec] of input.map.tests)
        if (universeSet.has(t) && (namers.has(t) || [...namers].some((n) => rec.loaded.has(n))))
          add2(t, { kind: "module", files: [f.path] });
      for (const n of namers) if (universeSet.has(n)) add2(n, { kind: "module", files: [f.path] });
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

// ../engine/src/shard.ts
import { createHash as createHash2 } from "node:crypto";
var SHARD_VERSION = "shard@1";
var MAX_SHARDS = 256;
var MAX_SECONDS = 86400;
var usable = (v) => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= MAX_SECONDS;
function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
var uniqueTests = (tests) => [...new Set(tests)].sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
function estimateDurations(tests, src) {
  const all = uniqueTests(tests);
  const seconds = /* @__PURE__ */ new Map();
  const counts = { ledger: 0, history: 0, fallback: 0 };
  const missing = [];
  for (const t of all) {
    const l = src.ledger?.get(t);
    const h = src.history?.get(t);
    if (usable(l)) {
      seconds.set(t, l);
      counts.ledger++;
    } else if (usable(h)) {
      seconds.set(t, h);
      counts.history++;
    } else missing.push(t);
  }
  const known = [...seconds.values()];
  const fallbackSeconds = known.length ? Math.max(1e-3, median(known)) : 1;
  for (const t of missing) seconds.set(t, fallbackSeconds);
  counts.fallback = missing.length;
  const basis = counts.ledger + counts.history === 0 ? "files" : counts.ledger === all.length ? "ledger" : counts.history === all.length ? "history" : "mixed";
  return { seconds, counts, basis, fallbackSeconds };
}
var emptyShards = (n) => Array.from({ length: n }, (_, index) => ({
  index,
  total: n,
  label: `${index + 1}/${n}`,
  tests: [],
  seconds: 0
}));
function checkCount(n) {
  if (!Number.isInteger(n) || n < 1 || n > MAX_SHARDS)
    throw new Error(`shard count must be an integer from 1 to ${MAX_SHARDS}, got ${n}`);
}
var Lightest = class {
  h;
  load;
  constructor(load) {
    this.load = load;
    this.h = load.map((_, i2) => i2);
  }
  less(a, b) {
    return this.load[a] < this.load[b] || this.load[a] === this.load[b] && a < b;
  }
  top() {
    return this.h[0];
  }
  /** Call after raising the top's load. */
  siftTop() {
    const h = this.h;
    let i2 = 0;
    for (; ; ) {
      const l = 2 * i2 + 1;
      const r = l + 1;
      let m = i2;
      if (l < h.length && this.less(h[l], h[m])) m = l;
      if (r < h.length && this.less(h[r], h[m])) m = r;
      if (m === i2) return;
      [h[i2], h[m]] = [h[m], h[i2]];
      i2 = m;
    }
  }
};
function assignShards(tests, seconds, n) {
  checkCount(n);
  const all = uniqueTests(tests);
  const ms2 = (t) => {
    const s = seconds.get(t);
    return usable(s) ? Math.round(s * 1e3) : 0;
  };
  const count = Math.max(1, Math.min(n, all.length));
  const shards = emptyShards(count);
  const load = new Array(count).fill(0);
  const heap = new Lightest(load);
  const order = all.map((t) => ({ t, ms: ms2(t) })).sort((a, b) => b.ms - a.ms || (a.t < b.t ? -1 : 1));
  for (const { t, ms: d } of order) {
    const i2 = heap.top();
    shards[i2].tests.push(t);
    load[i2] += d;
    heap.siftTop();
  }
  for (const s of shards) {
    s.tests.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    s.seconds = Math.round(load[s.index] / 100) / 10;
  }
  return shards;
}
function estimate(shards, est, model) {
  const p = Math.max(1, model.parallelism);
  let wall = 0;
  let billed = 0;
  for (const s of shards) {
    let longest = 0;
    for (const t of s.tests) longest = Math.max(longest, est.get(t) ?? 0);
    const job = model.setupSeconds + Math.max(s.seconds / p, longest);
    wall = Math.max(wall, job);
    billed += Math.max(1, Math.ceil(job / 60 - 1e-9));
  }
  return { wallSeconds: Math.round(wall * 10) / 10, billedMinutes: billed };
}
var DEFAULT_AUTO = { targetSeconds: 600, maxShards: 16, maxCostRatio: 1.5 };
var DEFAULT_MODEL = { setupSeconds: 60, parallelism: 1 };
function chooseShardCount(tests, est, model, opts) {
  checkCount(opts.maxShards);
  const all = uniqueTests(tests);
  const top = Math.max(1, Math.min(opts.maxShards, all.length));
  const candidates = [];
  let fastest = Infinity;
  let flat = 0;
  for (let n = 1; n <= top && flat < 4; n++) {
    const c = { n, ...estimate(assignShards(all, est, n), est, model) };
    candidates.push(c);
    if (c.wallSeconds < fastest - 1e-9) {
      fastest = c.wallSeconds;
      flat = 0;
    } else flat++;
  }
  const one = candidates[0];
  const cap3 = one.billedMinutes * Math.max(1, opts.maxCostRatio);
  const within = candidates.filter((c) => c.billedMinutes <= cap3 + 1e-9);
  const meets = within.find((c) => c.wallSeconds <= opts.targetSeconds);
  if (meets)
    return {
      n: meets.n,
      why: meets.n === 1 ? `one job already finishes within the ${fmt(opts.targetSeconds)} target` : `the fewest shards that finish within the ${fmt(opts.targetSeconds)} target`,
      candidates
    };
  const best = Math.min(...within.map((c) => c.wallSeconds));
  const pick = within.find((c) => c.wallSeconds <= best * 1.02);
  return {
    n: pick.n,
    why: `no count within the cost cap (${opts.maxCostRatio}x one job's billed minutes, at most ${opts.maxShards} shards) meets the ${fmt(opts.targetSeconds)} target; the fastest within it`,
    candidates
  };
}
var fmt = (s) => s >= 60 ? `${Math.round(s / 60 * 10) / 10} min` : `${Math.round(s)} s`;
function planShards(tests, src, opts) {
  const all = uniqueTests(tests);
  const e = estimateDurations(all, src);
  const model = { ...DEFAULT_MODEL, ...opts.model };
  let n;
  let why;
  if (opts.shards === "auto") {
    const c = chooseShardCount(all, e.seconds, model, { ...DEFAULT_AUTO, ...opts.auto });
    n = c.n;
    why = c.why;
  } else {
    checkCount(opts.shards);
    n = opts.shards;
    why = "fixed shard count";
  }
  const shards = assignShards(all, e.seconds, n);
  const one = estimate(assignShards(all, e.seconds, 1), e.seconds, model);
  return {
    version: SHARD_VERSION,
    n: shards.length,
    choice: opts.shards === "auto" ? "auto" : "fixed",
    why,
    shards,
    basis: e.basis,
    counts: e.counts,
    fallbackSeconds: Math.round(e.fallbackSeconds * 1e3) / 1e3,
    model,
    estimate: {
      ...estimate(shards, e.seconds, model),
      unshardedWallSeconds: one.wallSeconds,
      unshardedBilledMinutes: one.billedMinutes
    },
    digest: shardDigest(shards)
  };
}
var shardDigest = (shards) => createHash2("sha256").update(JSON.stringify([SHARD_VERSION, shards.length, shards.map((s) => s.tests)])).digest("hex");
function parseShardLabel(label) {
  const m = /^\s*(\d{1,3})\s*\/\s*(\d{1,3})\s*$/.exec(label);
  const i2 = m ? Number(m[1]) : NaN;
  const total = m ? Number(m[2]) : NaN;
  if (!m || total < 1 || total > MAX_SHARDS || i2 < 1 || i2 > total)
    throw new Error(
      `shard must look like "2/4" (1-based index / total, total 1-${MAX_SHARDS}), got ${JSON.stringify(label)}`
    );
  return { index: i2 - 1, total };
}
function projectSharding(fileSeconds, opts = {}) {
  const tests = uniqueTests([...fileSeconds.keys()].filter((t) => usable(fileSeconds.get(t))));
  const est = new Map(tests.map((t) => [t, fileSeconds.get(t)]));
  const serial = tests.reduce((s, t) => s + est.get(t), 0);
  const wall = usable(opts.wallSeconds ?? void 0) && opts.wallSeconds > 0 ? opts.wallSeconds : null;
  const parallelism = wall ? Math.max(1, serial / wall) : 1;
  const startup = wall ? Math.max(0, wall - serial / parallelism) : 0;
  const model = {
    setupSeconds: (opts.setupSeconds ?? DEFAULT_MODEL.setupSeconds) + startup,
    parallelism
  };
  const auto = { ...DEFAULT_AUTO, ...opts.auto };
  const choice = tests.length ? chooseShardCount(tests, est, model, auto) : { n: 1, why: "no measured test files", candidates: [] };
  const unsharded = estimate(assignShards(tests, est, 1), est, model);
  const most = Math.max(1, Math.min(MAX_SHARDS, tests.length));
  const ns = [.../* @__PURE__ */ new Set([...opts.ns ?? [2, 4, 8], choice.n])].filter((n) => Number.isInteger(n) && n >= 1 && n <= most).sort((a, b) => a - b);
  const options = ns.map((n) => ({ n, ...estimate(assignShards(tests, est, n), est, model) }));
  return {
    kind: "projection",
    version: SHARD_VERSION,
    files: tests.length,
    serialSeconds: Math.round(serial * 10) / 10,
    observedWallSeconds: wall === null ? null : Math.round(wall * 10) / 10,
    parallelism: Math.round(parallelism * 100) / 100,
    setupSeconds: Math.round(model.setupSeconds * 10) / 10,
    unsharded,
    options,
    auto: { ...options.find((o) => o.n === choice.n), why: choice.why }
  };
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
function num(name2, raw2, dflt, min, max, integer = false) {
  if (!raw2) return dflt;
  const n = Number(raw2);
  if (!Number.isFinite(n) || n < min || n > max || integer && !Number.isInteger(n))
    throw new InputError(
      `input ${name2} must be ${integer ? "an integer" : "a number"} >= ${min} and <= ${max}, got ${raw2}`
    );
  return n;
}
var MAX_PLAN_FILES = 5e4;
function parseShardCount(raw2) {
  if (!raw2) return 1;
  if (raw2.trim().toLowerCase() === "auto") return "auto";
  const n = Number(raw2);
  if (!Number.isInteger(n) || n < 1 || n > MAX_SHARDS)
    throw new InputError(`input shards must be auto or an integer >= 1 and <= ${MAX_SHARDS}, got ${raw2}`);
  return n;
}
function parseShardSettings(env) {
  return {
    shards: parseShardCount(getInput(env, "shards")),
    auto: {
      targetSeconds: num("shard-target-minutes", getInput(env, "shard-target-minutes"), 10, 0.1, 24 * 60) * 60,
      maxShards: num("shard-max", getInput(env, "shard-max"), 16, 1, MAX_SHARDS, true),
      maxCostRatio: num("shard-cost-cap", getInput(env, "shard-cost-cap"), 1.5, 1, 100)
    },
    setupSeconds: num("shard-setup-seconds", getInput(env, "shard-setup-seconds"), 60, 0, 24 * 3600)
  };
}
function selectedShards(tests, durations, settings, cap3) {
  return planShards(tests, { history: durations }, shardPlanOptions(settings, cap3));
}
var shardPlanOptions = (settings, cap3) => ({
  shards: settings.shards === "auto" ? "auto" : Math.min(settings.shards, cap3),
  auto: { ...settings.auto, maxShards: Math.min(settings.auto.maxShards, cap3) },
  model: { setupSeconds: settings.setupSeconds }
});
function fullRunCount(durations, settings, cap3) {
  if (settings.shards !== "auto") return { n: Math.min(settings.shards, cap3), plan: null };
  if (!durations?.size) return { n: 1, plan: null };
  if (durations.size > MAX_PLAN_FILES) return { n: 1, plan: null };
  const plan = planShards(durations.keys(), { history: durations }, shardPlanOptions(settings, cap3));
  return { n: plan.n, plan };
}
var fullRunShards = (n) => emptyShards(n);
function planSummary(plan, n, full) {
  return plan ? {
    n,
    choice: plan.choice,
    why: plan.why,
    basis: plan.basis,
    unmeasured: plan.counts.fallback,
    estimated: plan.estimate,
    digest: full ? null : plan.digest,
    runnerShards: full
  } : {
    n,
    choice: "fixed",
    why: n > 1 ? "fixed shard count" : "one shard",
    basis: null,
    runnerShards: full
  };
}
function nativeShardArgs(runner, label) {
  const { index, total } = parseShardLabel(label);
  const l = `${index + 1}/${total}`;
  switch (runner) {
    case "vitest":
    case "jest":
      return `--shard=${l}`;
    case "node-test":
      return `--test-shard=${l}`;
    case "pytest":
      return `--jiffy-shard=${l}`;
  }
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
    shard: parseShardSettings(env),
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
  /**
   * GET (OIDC, the ledger): 200 with the `durations: ledger` and `history: ledger` inputs for a UTC day
   * (step/ledger-inputs.ts LedgerInputs): per-file mean durations and recent failures from whole days before `until`.
   */
  selectInputs: (owner, repo, until) => `/v1/ledger/select-inputs/${seg(owner)}/${seg(repo)}?until=${seg(until)}`,
  /** GET: 200 with a RepoConfig. */
  config: (owner, repo) => `/v1/repos/${seg(owner)}/${seg(repo)}/config`,
  /** GET: 200 with a QuarantineList (@jiffy/flaky/state): flaky tests kept out of the fast check (R13). */
  quarantine: (owner, repo) => `/v1/repos/${seg(owner)}/${seg(repo)}/quarantine`,
  /**
   * GET (OIDC, the ledger): 200 with the repo's flaky-test quarantine list, signed (`{claims, signature}`,
   * @jiffy/ledger/signing QuarantineClaims). The step's quarantine override reads only this.
   */
  quarantineList: (owner, repo) => `/v1/ledger/quarantine/${seg(owner)}/${seg(repo)}`,
  /** POST (OIDC): the step's per-test results (`tensile.ci-upload`, docs/spec/ledger.md §6.1). */
  ledgerUploads: "/v1/ledger/uploads",
  /**
   * POST (OIDC): the step's selection record (`tensile.selection-record`, ledger §8.1). 202 `{id}` once recorded; an
   * enforced decision is posted here before it takes effect (bindDecision), and its outcome after the job.
   */
  selectionRecords: "/v1/ledger/selection-records",
  /** POST (OIDC): the step's quarantine override record (`tensile.quarantine-record`), recorded as a claim. */
  quarantineRecords: "/v1/ledger/quarantine-records",
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
import { readFileSync as readFileSync3 } from "node:fs";
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

// ../ledger/src/contract.ts
import { createHash as createHash3 } from "node:crypto";
var CI_UPLOAD_SCHEMA = "tensile.ci-upload";
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
var isObj3 = (v) => !!v && typeof v === "object" && !Array.isArray(v);
function canonicalJson(v) {
  if (Array.isArray(v)) return `[${v.map(canonicalJson).join(",")}]`;
  if (isObj3(v))
    return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canonicalJson(v[k])}`).join(",")}}`;
  return JSON.stringify(v ?? null);
}
function matrixKey(matrix) {
  if (matrix === void 0) return "?";
  const c = canonicalJson(matrix ?? {});
  return c.length <= 64 ? c : `h:${createHash3("sha256").update(c).digest("hex").slice(0, 32)}`;
}
function workflowFile(workflowRef) {
  const m = /^[^/]+\/[^/]+\/(.+?)@/.exec(workflowRef ?? "");
  return m?.[1] ?? "?";
}
function envKey(workflow, jobKey2, matrix, runner) {
  return `${workflow}#${jobKey2}#${matrix}#${runner}`;
}
var sha256 = (s) => createHash3("sha256").update(s).digest("hex");

// src/step/ledger-inputs.ts
var MAX_LANDING_LIST = 500;
var strList = (v, what) => {
  if (!Array.isArray(v) || v.length > MAX_LANDING_LIST || v.some((x) => typeof x !== "string" || x.length > 1e3))
    throw new Error(`the landing mode's ${what} is not a list of names`);
  return v;
};
function parseLanding(v) {
  if (!isObj4(v)) throw new Error("the landing mode is not an object");
  if (v.mode !== "queue" && v.mode !== "no_queue" && v.mode !== "unknown")
    throw new Error(`unknown landing mode ${JSON.stringify(v.mode)}`);
  if (typeof v.defaultBranch !== "string" || !v.defaultBranch)
    throw new Error("the landing mode names no default branch");
  if (v.readAt !== null && (typeof v.readAt !== "string" || !Number.isFinite(Date.parse(v.readAt))))
    throw new Error("the landing mode has no valid readAt");
  return {
    mode: v.mode,
    defaultBranch: v.defaultBranch,
    requiredChecks: v.requiredChecks === null ? null : strList(v.requiredChecks, "required checks"),
    landingBranches: strList(v.landingBranches, "landing branches"),
    queuePrefixes: strList(v.queuePrefixes, "queue prefixes"),
    readAt: v.readAt
  };
}
var MAX_INPUT_FILES = 5e4;
var DAY = /^\d{4}-\d{2}-\d{2}$/;
var isObj4 = (v) => !!v && typeof v === "object" && !Array.isArray(v);
var utcDay = (ms2) => new Date(ms2).toISOString().slice(0, 10);
function validDay(s) {
  return typeof s === "string" && DAY.test(s) && utcDay(Date.parse(`${s}T00:00:00Z`)) === s;
}
function durationsText(d) {
  const out2 = {};
  for (const k of Object.keys(d).sort()) out2[k] = Math.round(d[k] * 1e3) / 1e3;
  return JSON.stringify(out2);
}
function historyText(h) {
  const rows = h.map((x) => ({ file: x.file, failedAt: x.failedAt })).sort(
    (a, b) => a.file < b.file ? -1 : a.file > b.file ? 1 : a.failedAt < b.failedAt ? -1 : a.failedAt > b.failedAt ? 1 : 0
  );
  return JSON.stringify(rows);
}
var inputDigest = (text) => sha256(text);
function parseLedgerInputs(v) {
  if (!isObj4(v) || !validDay(v.until)) throw new Error("the ledger inputs have no valid until day");
  if (!isObj4(v.durations)) throw new Error("the ledger inputs have no durations object");
  if (!Array.isArray(v.history)) throw new Error("the ledger inputs have no history list");
  const files = Object.keys(v.durations);
  if (files.length > MAX_INPUT_FILES || v.history.length > MAX_INPUT_FILES)
    throw new Error(`the ledger inputs list over ${MAX_INPUT_FILES} files`);
  const durations = {};
  for (const f of files) {
    const s = v.durations[f];
    if (!f || typeof s !== "number" || !Number.isFinite(s) || s < 0)
      throw new Error(`the ledger's duration for ${JSON.stringify(f.slice(0, 100))} is not seconds`);
    durations[f] = s;
  }
  const history = [];
  for (const h of v.history) {
    if (!isObj4(h) || typeof h.file !== "string" || !h.file || typeof h.failedAt !== "string")
      throw new Error("a ledger history entry is not {file, failedAt}");
    history.push({ file: h.file, failedAt: h.failedAt });
  }
  return {
    until: v.until,
    durations,
    history,
    landing: v.landing === void 0 || v.landing === null ? null : parseLanding(v.landing)
  };
}

// src/service.ts
var base2 = (t) => t.url.replace(/\/+$/, "");
var auth = (token) => ({ Authorization: `Bearer ${token}` });
async function fetchConfig(t, token) {
  const path = servicePaths.config(t.owner, t.repo);
  const res = await call(`GET ${path}`, base2(t) + path, { headers: auth(token) }, t.timeoutMs);
  const cfg = await res.json().catch(() => null);
  if (!cfg || typeof cfg.runAll !== "boolean") throw new ServiceError(`GET ${path}: malformed config`);
  if (cfg.mode !== void 0 && cfg.mode !== "report" && cfg.mode !== "enforce")
    throw new ServiceError(`GET ${path}: unknown mode ${JSON.stringify(cfg.mode)}`);
  if (cfg.selectionEnforce !== void 0 && (!Array.isArray(cfg.selectionEnforce) || cfg.selectionEnforce.some((k) => typeof k !== "string")))
    throw new ServiceError(`GET ${path}: selectionEnforce must be a list of strings`);
  if (cfg.landingMode !== void 0 && cfg.landingMode !== "queue" && cfg.landingMode !== "no_queue" && cfg.landingMode !== "unknown")
    throw new ServiceError(`GET ${path}: unknown landingMode ${JSON.stringify(cfg.landingMode)}`);
  const l = cfg.ledger;
  if (l !== void 0 && (!l || typeof l.stale !== "boolean" || typeof l.complete !== "boolean" || typeof l.lagMs !== "number" || !Array.isArray(l.reasons)))
    throw new ServiceError(`GET ${path}: malformed ledger freshness`);
  return cfg;
}
async function fetchSelectInputs(t, token, until) {
  const path = servicePaths.selectInputs(t.owner, t.repo, until);
  const res = await call(`GET ${path}`, base2(t) + path, { headers: auth(token) }, t.timeoutMs);
  let v;
  try {
    v = parseLedgerInputs(await res.json());
  } catch (e) {
    throw new ServiceError(`GET ${path}: ${e.message}`);
  }
  if (v.until !== until) throw new ServiceError(`GET ${path}: the answer is for ${v.until}, not ${until}`);
  return v;
}
async function bindDecision(t, token, record) {
  const path = servicePaths.selectionRecords;
  const res = await call(
    `POST ${path}`,
    base2(t) + path,
    {
      method: "POST",
      headers: { ...auth(token), "Content-Type": "application/json" },
      body: JSON.stringify(record)
    },
    t.timeoutMs
  );
  const body2 = await res.json().catch(() => null);
  const id = body2?.id;
  if (typeof id !== "string" || !id || id.length > 200)
    throw new ServiceError(`POST ${path}: no decision id in the answer`);
  return id;
}
async function fetchQuarantine(t, token) {
  const path = servicePaths.quarantine(t.owner, t.repo);
  const res = await call(`GET ${path}`, base2(t) + path, { headers: auth(token) }, t.timeoutMs);
  try {
    return parseQuarantine(await res.json());
  } catch (e) {
    throw new ServiceError(`GET ${path}: ${e.message}`);
  }
}
async function fetchMap(t, token, before) {
  const path = servicePaths.map(t.owner, t.repo, before);
  const res = await call(`GET ${path}`, base2(t) + path, { headers: auth(token) }, t.timeoutMs);
  return Buffer.from(await res.arrayBuffer());
}
async function fetchSignedMap(t, token, before) {
  const path = servicePaths.ledgerMap(t.owner, t.repo, before);
  const res = await call(`GET ${path}`, base2(t) + path, { headers: auth(token) }, t.timeoutMs);
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
    base2(t) + path,
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
      json = JSON.parse(readFileSync3(p, "utf8"));
    } catch (e) {
      throw new Error(`cannot read ${opts.file}: ${e.message}`);
    }
    entries.push(...parseQuarantine(json).tests);
  }
  if (opts.service) entries.push(...(await fetchQuarantine(opts.service.target, opts.service.token)).tests);
  return entries;
}
var quarantinedFiles = (entries) => [...new Set(entries.map((e) => e.file))].sort();

// src/summary.ts
var MAX_ROWS = 300;
var MAX_SKIPPED = 1e3;
var MAX_BYTES2 = 9e5;
var esc3 = (s) => s.replace(/[&<>"'|`]/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\r?\n/g, " ");
var code = (s) => `<code>${esc3(s)}</code>`;
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
  const note = f.note ? ` (${esc3(f.note)})` : "";
  if (f.runAll) return `runs everything: ${esc3(f.runAll)}`;
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
    out2.push(`## Tensile (report mode): would run ${n} of ${universe} test files (${share()}${sampledNote})`);
    out2.push("", "> Report mode changes nothing: this run tests everything. Set `mode: enforce` to skip.");
  } else if (report) {
    out2.push("## Tensile (report mode): would run everything");
    out2.push("", `> ${esc3(runAllReason(sel, d))}`);
  } else if (r.runAll) {
    out2.push("## Tensile: running everything", "", `> ${esc3(r.reason ?? "")}`);
  } else {
    out2.push(`## Tensile: ${r.tests.length} of ${universe} test files (${share()}${sampledNote})`);
  }
  out2.push("");
  for (const w of r.warnings) out2.push(`> **Warning:** ${esc3(w)}`, "");
  if (d) {
    const facts = [
      `Base ${code(short(d.base))} (${esc3(d.baseFrom)}) \u2192 head ${code(short(d.head))}.`,
      d.map ? `Map: ${d.map.tests} tests, ${(d.map.bytes / 1024).toFixed(1)} KB` + (d.map.commit ? `, recorded at ${code(short(d.map.commit))}` : "") + (d.map.createdAt ? ` on ${esc3(d.map.createdAt)}` : "") + "." : "",
      `Took ${Math.round(r.ms)} ms (map ${d.timings.mapMs} ms, diff ${d.timings.diffMs} ms, select ${d.timings.selectMs} ms).`
    ];
    out2.push(facts.filter(Boolean).join(" "), "");
  }
  if (r.pruned) {
    const combo = Object.entries(r.pruned.kept).map(([k, v]) => `${esc3(k)}: ${code(typeof v === "string" ? v : JSON.stringify(v))}`).join(", ");
    const verb = r.mode === "report" ? "Would run" : "Running";
    out2.push(
      `**Matrix:** ${verb} 1 of ${r.pruned.total} combinations (${combo}). The full matrix runs at merge.`,
      ""
    );
  }
  if (r.quarantine.length) {
    const byFile = /* @__PURE__ */ new Map();
    for (const e of r.quarantine) {
      const why = `${esc3(e.test.slice(e.file.length + 3) || e.test)}: ${esc3(e.reason)}, ${e.flips} flip(s), last ${esc3(e.lastSeen)}`;
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
var GATE_POLICY_VERSION = "legacy-gate@1";
function gateBarKey(env) {
  const wf = /^[^/]+\/[^/]+\/(.+?)@/.exec(env.GITHUB_WORKFLOW_REF ?? "")?.[1];
  const job = env.GITHUB_JOB ?? "";
  if (!wf || !job) return null;
  return `${wf}#${job}#${GATE_POLICY_VERSION}`;
}
function enforceBlocked(cfg, key, env, event) {
  const into = event.pull_request?.base?.ref;
  const main = event.repository?.default_branch;
  if (env.GITHUB_EVENT_NAME !== "pull_request" || !into || !main || into !== main)
    return "only a pull request into the default branch, whose landing mode the service reads, may enforce";
  if (!cfg) return "no service config";
  if (!key) return "no workflow ref or job to grant enforcement for";
  if (!Array.isArray(cfg.selectionEnforce) || !cfg.selectionEnforce.includes(key))
    return `the service hasn't enabled enforcement for ${key}`;
  if (cfg.landingMode !== "queue")
    return `the repo isn't read as a merge-queue repo (landing mode ${cfg.landingMode ?? "unknown"}): its PR runs may be the landing gate`;
  return null;
}
function repoPath(repo, input) {
  if (!input) return null;
  const rel = relative(resolve2(repo), resolve2(process.cwd(), input));
  return rel && !rel.startsWith("..") && !isAbsolute2(rel) ? rel.split(sep).join("/") : null;
}
function rawShards(env) {
  try {
    const n = parseShardCount(getInput(env, "shards"));
    return n === "auto" ? 1 : Math.min(n, MAX_JOBS);
  } catch {
    return 1;
  }
}
var requestedShards = (s) => s.shards === "auto" ? s.auto.maxShards : s.shards;
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
  const cap3 = shardCap(inputs ? requestedShards(inputs.shard) : rawShards(env), matrix);
  const count = inputs ? fullRunCount(decision?.durations ?? null, inputs.shard, cap3.shards) : { n: cap3.shards, plan: null };
  return {
    runAll: true,
    reason,
    mode: inputs?.mode ?? null,
    tests: [],
    sampled: [],
    quarantined: [],
    quarantine: [],
    shards: fullRunShards(count.n),
    shardPlan: planSummary(count.plan, count.n, true),
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
  const asked = inputs.mode;
  inputs.mode = "report";
  let plan;
  try {
    event = readEvent(env);
    plan = planFor(env, event, inputs.base);
  } catch (e) {
    return full(`cannot read the event payload: ${e.message}`);
  }
  if (plan.kind === "full") return full(plan.reason);
  let token = null;
  let cfg = svc ? null : deps.config ?? null;
  let mode = asked;
  if (svc) {
    try {
      token = await svc.token();
      cfg = await fetchConfig(svc.target, token);
      if (cfg.runAll) return full(`service kill switch is on${cfg.reason ? `: ${cfg.reason}` : ""}`);
      if (cfg.mode) mode = cfg.mode;
    } catch (e) {
      return full(`service: ${e.message}`);
    }
  }
  let refused = null;
  if (mode === "enforce") {
    refused = enforceBlocked(cfg, gateBarKey(env), env, event);
    if (!refused) inputs.mode = "enforce";
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
    const r = full(
      refused ? `report mode (enforce refused: ${refused}): everything runs together; the summary shows what enforce mode would skip` : "report mode: everything runs; the summary shows what enforce mode would skip",
      decision
    );
    r.result.pruned = pruned;
    r.result.quarantine = applied;
    r.result.warnings.push(...quarantineWarnings);
    if (refused) r.result.warnings.push(`enforce mode refused, everything runs: ${refused}`);
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
  const cap3 = shardCap(requestedShards(inputs.shard), prunedText);
  const shardPlan = tests.length ? selectedShards(tests, decision.durations ?? /* @__PURE__ */ new Map(), inputs.shard, cap3.shards) : null;
  const result = {
    runAll: false,
    reason: null,
    mode: inputs.mode,
    tests,
    sampled: decision.sampled,
    quarantined,
    quarantine: applied.filter((e) => quarantined.includes(e.file)),
    shards: shardPlan?.shards ?? [],
    shardPlan: planSummary(shardPlan, shardPlan?.n ?? 0, false),
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
    ["shard-plan", JSON.stringify(r.shardPlan)],
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
  if (r.runAll) sink.log(`Tensile: running everything: ${r.reason}`);
  else sink.log(`Tensile: ${r.tests.length} test files (${r.sampled.length} sampled)`);
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
import { createHash as createHash5 } from "node:crypto";
import { mkdirSync as mkdirSync2, readFileSync as readFileSync4, writeFileSync as writeFileSync2 } from "node:fs";
import { tmpdir } from "node:os";
import { dirname as dirname2, join } from "node:path";

// src/identity.ts
import { createHash as createHash4 } from "node:crypto";
var sha1 = (s) => createHash4("sha1").update(s).digest("hex");
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
function workflowFile2(env) {
  const ref = env.GITHUB_WORKFLOW_REF ?? "";
  const m = /\/\.github\/workflows\/([^@]+)@/.exec(ref);
  return m ? m[1] : "";
}
function jobIdentity(env) {
  const job = env.GITHUB_JOB || "job";
  const wf = workflowFile2(env);
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
var POLICY_FILE = "tensile.yml";
var POLICY_FILES = [POLICY_FILE, "jiffy.yml"];
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
var sha2562 = (text) => createHash5("sha256").update(text).digest("hex");
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
  return sha2562(text);
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
      `The checkout (${tested.slice(0, 12)}) is neither this run's commit (${runSha.slice(0, 12)}) nor the PR head; Tensile can't tell what was tested.`
    );
  const raw2 = tryGit(git2, ["cat-file", "commit", tested]) ?? "";
  const parents = [...raw2.matchAll(/^parent ([0-9a-f]{40,64})$/gm)].map((m) => m[1]);
  if (parents.length !== 2 || parents[1] !== prHead)
    throw new StepProblem(
      "config",
      "checkout",
      `The checkout (${tested.slice(0, 12)}) is not a merge of the PR head (${prHead.slice(0, 12)}) the event names; Tensile can't tell what was tested.`
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
  let entry = "";
  let file = POLICY_FILE;
  for (const f of POLICY_FILES) {
    file = f;
    try {
      entry = git2(["ls-tree", "-z", "--long", ref, "--", f]).replace(/\0$/, "");
    } catch (e) {
      return { text: null, problem: `${f} on ${defaultBranch} couldn't be listed: ${firstLine(e)}` };
    }
    if (entry) break;
  }
  if (!entry) return { text: null, problem: null };
  const m = /^(\d+) (\w+) ([0-9a-f]+)\s+(-|\d+)\t/.exec(entry);
  if (!m || m[2] !== "blob" || m[1] === "120000")
    return { text: null, problem: `${file} on ${defaultBranch} is not a regular file`, path: file };
  if (Number(m[4]) > MAX_POLICY_BYTES)
    return {
      text: null,
      problem: `${file} on ${defaultBranch} is larger than ${MAX_POLICY_BYTES / 1024} KB`,
      path: file
    };
  const text = tryGit(git2, ["cat-file", "blob", m[3]]);
  return text === null ? { text: null, problem: `${file} on ${defaultBranch} couldn't be read`, path: file } : { text, problem: null, path: file };
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
    sink.warning(`Tensile evidence start: ${o.reason}`);
  }
  if (!o.file)
    sink.outputs([
      ["file", ""],
      ["artifact", ""],
      ["status", o.status]
    ]);
  sink.log(`Tensile evidence start: ${o.reason}`);
  return 0;
}

// src/step/outcome.ts
import { createHash as createHash8 } from "node:crypto";
import { existsSync as existsSync3, mkdirSync as mkdirSync3, readFileSync as readFileSync8, statSync as statSync2, writeFileSync as writeFileSync3 } from "node:fs";
import { dirname as dirname3, isAbsolute as isAbsolute5, join as join3, resolve as resolve5 } from "node:path";

// ../flaky/src/results.ts
var RANK_ALL = { skipped: -1, passed: 0, retried: 1, failed: 2 };
var combineAll = (a, b) => RANK_ALL[a] >= RANK_ALL[b] ? a : b;
var MAX_PROBLEMS = 20;
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
  problems = [];
  problem(p) {
    if (this.problems.length < MAX_PROBLEMS) this.problems.push(p.slice(0, 300));
  }
  add(file, name2, outcome, durationMs, retries) {
    const id = `${file} > ${name2}`;
    const r = this.byId.get(id);
    const ms2 = durationMs !== void 0 && Number.isFinite(durationMs) && durationMs >= 0 ? durationMs : void 0;
    if (r) {
      r.outcome = combineAll(r.outcome, outcome);
      if (ms2 !== void 0) r.durationMs = (r.durationMs ?? 0) + ms2;
      if (retries) r.retries = (r.retries ?? 0) + retries;
    } else
      this.byId.set(id, {
        id,
        file,
        name: name2,
        outcome,
        ...ms2 !== void 0 && { durationMs: ms2 },
        ...retries ? { retries } : {}
      });
  }
  done() {
    return [...this.byId.values()];
  }
};
var SKIPPED = /* @__PURE__ */ new Set(["pending", "skipped", "todo", "disabled"]);
function jsonOutcome(a) {
  if (a.status === "failed") return "failed";
  if (a.status !== "passed") return SKIPPED.has(String(a.status)) ? "skipped" : null;
  return a.retryReasons?.length || a.failureMessages?.length ? "retried" : "passed";
}
function fromJson(report, opts) {
  if (!report || typeof report !== "object" || !Array.isArray(report.testResults))
    throw new Error("not a Vitest/Jest JSON report (no testResults)");
  const out2 = new Collector();
  let cases = 0;
  let failedCases = 0;
  for (const file of report.testResults) {
    if (!file || typeof file.name !== "string") {
      out2.problem("a test file entry has no name");
      continue;
    }
    const path = relative2(file.name, opts.root);
    const list3 = Array.isArray(file.assertionResults) ? file.assertionResults : [];
    for (const a of list3) {
      if (!a || typeof a !== "object") continue;
      const name2 = a.fullName || [...a.ancestorTitles ?? [], a.title ?? ""].filter(Boolean).join(" ");
      cases++;
      const o = jsonOutcome(a);
      if (o === null) {
        out2.problem(`${path}: a test has status ${JSON.stringify(a.status)}`);
        continue;
      }
      if (o === "failed") failedCases++;
      const retries = o === "retried" ? a.retryReasons?.length ?? a.failureMessages?.length ?? 0 : 0;
      out2.add(path, name2, o, typeof a.duration === "number" ? a.duration : void 0, retries);
    }
    if (file.status === "failed" && !list3.some((a) => a?.status === "failed")) {
      out2.add(path, "(file)", "failed");
      out2.problem(`${path} failed outside any test (it didn't load, or a hook threw)`);
    }
  }
  if (typeof report.numRuntimeErrorTestSuites === "number" && report.numRuntimeErrorTestSuites > 0)
    out2.problem(`${report.numRuntimeErrorTestSuites} test file(s) failed to run`);
  if (report.wasInterrupted === true) out2.problem("the run was interrupted");
  if (typeof report.numFailedTests === "number" && report.numFailedTests !== failedCases)
    out2.problem(`the report counts ${report.numFailedTests} failed tests but lists ${failedCases}`);
  if (typeof report.numTotalTests === "number" && report.numTotalTests !== cases)
    out2.problem(`the report counts ${report.numTotalTests} tests but lists ${cases}`);
  if (report.success === false && failedCases === 0 && !out2.problems.length)
    out2.problem("the report says the run failed, with no failing test");
  return { format: "json", tests: out2.done(), problems: out2.problems };
}
var ENTITIES = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
    if (e[0] === "#") {
      const n = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(n) && n >= 0 && n <= 1114111 ? String.fromCodePoint(n) : m;
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
function nodeTotals(xml) {
  const out2 = {};
  const tail = xml.slice(-4096);
  for (const m of tail.matchAll(/<!--\s*(fail|cancelled)\s+(\d{1,9})\s*-->/g))
    out2[m[1]] = Number(m[2]);
  return out2;
}
var declared = (v) => v !== void 0 && /^\d{1,9}$/.test(v.trim()) ? Number(v.trim()) : null;
function fromJunit(xml, opts) {
  const totals = nodeTotals(xml);
  const body2 = stripMarkup(xml);
  if (!/<testsuites?[\s>]/.test(body2)) throw new Error("not a JUnit XML report (no <testsuite>)");
  const resolveClass = classResolver(opts.files);
  const out2 = new Collector();
  const suites = [];
  let rootDecl = null;
  let allCases = 0;
  let allFailures = 0;
  let failedCases = 0;
  let tc = null;
  const finish = () => {
    if (!tc) return;
    const suite = suites[suites.length - 1]?.a ?? {};
    const { classname, name: name2 = "" } = tc.a;
    const rawFile = [tc.a.file, suite.file, classname, suite.name].find(looksLikePath) ?? (classname && resolveClass(classname)) ?? classname ?? suite.name ?? "";
    const file = relative2(rawFile, opts.root);
    const prefix = classname && !looksLikePath(classname) && !name2.startsWith(classname) ? `${classname} > ` : "";
    const outcome = tc.failures ? "failed" : tc.skipped ? "skipped" : tc.reruns ? "retried" : "passed";
    const secs = tc.a.time !== void 0 ? Number(tc.a.time) : NaN;
    out2.add(file, prefix + name2, outcome, Number.isFinite(secs) ? secs * 1e3 : void 0, tc.reruns);
    allCases++;
    allFailures += tc.failures;
    if (tc.failures) failedCases++;
    for (const s of suites) {
      s.cases++;
      s.failures += tc.failures;
    }
    tc = null;
  };
  for (const m of body2.matchAll(/<(\/?)([\w:.-]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>/g)) {
    const [, close, tag, rest = "", selfClose] = m;
    if (tag === "testsuites") {
      if (!close && !rootDecl) rootDecl = attrs(rest);
    } else if (tag === "testsuite") {
      finish();
      if (close) {
        const s = suites.pop();
        if (s) {
          const tests = declared(s.a.tests);
          const bad = (declared(s.a.failures) ?? 0) + (declared(s.a.errors) ?? 0);
          const label = s.a.name ? `suite ${JSON.stringify(s.a.name.slice(0, 100))}` : "a suite";
          if (tests !== null && tests !== s.cases)
            out2.problem(`${label} counts ${tests} tests but lists ${s.cases}`);
          if ((s.a.failures !== void 0 || s.a.errors !== void 0) && bad !== s.failures)
            out2.problem(`${label} counts ${bad} failures and errors but lists ${s.failures}`);
        }
      } else if (!selfClose) suites.push({ a: attrs(rest), cases: 0, failures: 0 });
      else {
        const a = attrs(rest);
        if ((declared(a.failures) ?? 0) + (declared(a.errors) ?? 0) > 0)
          out2.problem(`an empty suite ${JSON.stringify((a.name ?? "").slice(0, 100))} counts failures`);
      }
    } else if (tag === "testcase") {
      if (close) finish();
      else {
        finish();
        tc = { a: attrs(rest), failures: 0, skipped: false, reruns: 0 };
        if (selfClose) finish();
      }
    } else if (!close && (tag === "failure" || tag === "error")) {
      if (tc) tc.failures++;
      else out2.problem(`a ${tag} outside any test case`);
    } else if (tc && !close) {
      if (tag === "skipped") tc.skipped = true;
      else if (/^(flaky|rerun)(Failure|Error)$/.test(tag)) tc.reruns++;
    }
  }
  finish();
  if (suites.length) out2.problem("the report ends inside a suite (cut short)");
  if (rootDecl) {
    const tests = declared(rootDecl.tests);
    const bad = (declared(rootDecl.failures) ?? 0) + (declared(rootDecl.errors) ?? 0);
    if (tests !== null && tests !== allCases)
      out2.problem(`the report counts ${tests} tests but lists ${allCases}`);
    if ((rootDecl.failures !== void 0 || rootDecl.errors !== void 0) && bad !== allFailures)
      out2.problem(`the report counts ${bad} failures and errors but lists ${allFailures}`);
  }
  if (totals.cancelled) out2.problem(`${totals.cancelled} test(s) were cancelled`);
  if (totals.fail !== void 0 && totals.fail !== failedCases)
    out2.problem(`the report counts ${totals.fail} failed tests but lists ${failedCases}`);
  if (!/<\/testsuites?\s*>\s*$/.test(body2.trimEnd()) && !/<testsuites?[^>]*\/>\s*$/.test(body2.trimEnd()))
    out2.problem("the report does not end with its closing tag (cut short)");
  return { format: "junit", tests: out2.done(), problems: out2.problems };
}
function parseReport(text, opts = {}) {
  const t = text.trimStart();
  return t.startsWith("<") ? fromJunit(t, opts) : fromJson(JSON.parse(t), opts);
}
function parseResults(text, opts = {}) {
  const out2 = [];
  for (const r of parseReport(text, opts).tests)
    if (r.outcome !== "skipped") out2.push({ id: r.id, file: r.file, name: r.name, outcome: r.outcome });
  return out2;
}

// src/decide.ts
import { existsSync, readFileSync as readFileSync5 } from "node:fs";
import { isAbsolute as isAbsolute3, resolve as resolve3 } from "node:path";
var isUrl = (s) => /^https?:\/\//i.test(s);
async function readSource(src, cwd) {
  if (isUrl(src)) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }
  const p = isAbsolute3(src) ? src : resolve3(cwd, src);
  if (!existsSync(p)) throw new Error("file not found");
  return readFileSync5(p);
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
  const lines4 = git(
    repo,
    ["cat-file", "--batch-check"],
    ok.map((p) => `${rev}:${p}`).join("\n") + "\n"
  ).split("\n");
  return ok.filter((_, i2) => !/^[0-9a-f]+ blob \d+$/.test(lines4[i2] ?? ""));
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
    const p = isAbsolute3(input.durations) ? input.durations : resolve3(process.cwd(), input.durations);
    durations = parseDurations(readFileSync5(p, "utf8"), repo);
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

// src/step/override.ts
import { createHash as createHash7 } from "node:crypto";
import { readFileSync as readFileSync7 } from "node:fs";
import { join as join2 } from "node:path";

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
var QUARANTINE_CLAIMS_TYPE = "tensile.quarantine/1";
var QUARANTINE_MAX_TESTS = 1e3;
var MAX_LIST_CHARS = 1024 * 1024;
var isStr2 = (v, max) => typeof v === "string" && v.length > 0 && v.length <= max;
function verifyQuarantine(keys, signed, expect) {
  const no = (reason) => ({ ok: false, reason });
  if (!signed || typeof signed !== "object") return no("no signature");
  const { claims: text, signature } = signed;
  if (typeof text !== "string" || typeof signature !== "string") return no("no signature");
  if (text.length > MAX_LIST_CHARS || signature.length > 200) return no("signature too large");
  let c;
  try {
    c = JSON.parse(text);
  } catch {
    return no("claims are not JSON");
  }
  if (!c || typeof c !== "object" || Array.isArray(c)) return no("claims are not an object");
  if (c.t !== QUARANTINE_CLAIMS_TYPE) return no("claims are not a quarantine list");
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
    return no(`list is for host ${String(c.host)}, not ${expect.host}`);
  if (c.repoId !== expect.repoId) return no(`list is for repo ${String(c.repoId)}, not ${expect.repoId}`);
  if (expect.tenant !== void 0 && c.tenant !== expect.tenant) return no("list is for another tenant");
  const at = Date.parse(c.createdAt);
  if (!Number.isFinite(at)) return no("list has no signing time");
  const now = (expect.now ?? /* @__PURE__ */ new Date()).getTime();
  if (at > now + 6e4) return no("list signing time is in the future");
  if (now - at > expect.maxAgeMs)
    return no(
      `list signed ${Math.round((now - at) / 1e3)}s ago, over the ${Math.round(expect.maxAgeMs / 1e3)}s bound`
    );
  if (typeof c.enforce !== "boolean") return no("list has no enforce flag");
  if (!c.ledger || typeof c.ledger.stale !== "boolean" || typeof c.ledger.complete !== "boolean")
    return no("list has no ledger freshness");
  if (typeof c.complete !== "boolean") return no("list has no completeness flag");
  if (!Array.isArray(c.tests) || c.tests.length > QUARANTINE_MAX_TESTS) return no("list tests are malformed");
  if (c.enforceOnly !== void 0 && (!Array.isArray(c.enforceOnly) || c.enforceOnly.length > QUARANTINE_MAX_TESTS || c.enforceOnly.some((x) => !isStr2(x, 100))))
    return no("list enforceOnly is malformed");
  for (const e of c.tests) {
    const x = e;
    if (!x || typeof x !== "object" || !isStr2(x.test, 1e3) || !isStr2(x.env, 2e3) || !isStr2(x.decisionId, 100) || !isStr2(x.expiresAt, 40) || !Number.isFinite(Date.parse(x.expiresAt)) || !Array.isArray(x.owners) || x.owners.some((o) => !isStr2(o, 200)))
      return no("a list entry is malformed");
  }
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

// src/step/results.ts
import { existsSync as existsSync2, readFileSync as readFileSync6, statSync } from "node:fs";
import { isAbsolute as isAbsolute4, resolve as resolve4 } from "node:path";
var MAX_REPORT_BYTES = 64 * 1024 * 1024;
var UPLOAD_BUDGET = LIMITS.uploadBytes - 64 * 1024;
var RANK = { skipped: -1, passed: 0, retried: 1, failed: 2 };
var lines = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
function readStepResults(paths, repo, root, notBefore) {
  const repoRoot = resolve4(repo).replace(/\\/g, "/").replace(/\/?$/, "/");
  const prefix = root.replace(/^\.\/?/, "").replace(/\/+$/, "");
  const reports = [];
  const byId = /* @__PURE__ */ new Map();
  for (const p of paths) {
    const abs = isAbsolute4(p) ? p : resolve4(repo, p);
    if (!existsSync2(abs)) {
      reports.push({ path: p, status: "missing", problems: [] });
      continue;
    }
    try {
      const st = statSync(abs);
      if (!st.isFile()) throw new Error("not a file");
      if (st.size > MAX_REPORT_BYTES) throw new Error(`over ${MAX_REPORT_BYTES} bytes`);
      if (notBefore !== null && st.mtimeMs < notBefore - 1e3) {
        reports.push({
          path: p,
          status: "stale",
          why: `written ${new Date(st.mtimeMs).toISOString()}, before this job's tests began`,
          problems: []
        });
        continue;
      }
      const parsed = parseReport(readFileSync6(abs, "utf8"), { root: repoRoot });
      for (const r of parsed.tests) {
        const file = prefix && !r.file.startsWith(prefix + "/") && !r.file.startsWith("/") ? `${prefix}/${r.file}` : r.file;
        const id = `${file} > ${r.name}`;
        const had = byId.get(id);
        if (!had) byId.set(id, { ...r, id, file });
        else {
          if (RANK[r.outcome] > RANK[had.outcome]) had.outcome = r.outcome;
          if (r.durationMs !== void 0) had.durationMs = (had.durationMs ?? 0) + r.durationMs;
          if (r.retries) had.retries = (had.retries ?? 0) + r.retries;
        }
      }
      reports.push({ path: p, status: "read", format: parsed.format, problems: parsed.problems });
    } catch (e) {
      reports.push({ path: p, status: "unreadable", why: e.message.slice(0, 200), problems: [] });
    }
  }
  return { reports, tests: [...byId.values()] };
}
var resultsComplete = (r) => r.reports.length > 0 && r.reports.every((x) => x.status === "read" && !x.problems.length);
var FRAMEWORK = {
  vitest: "vitest",
  jest: "jest",
  "node-test": "node-test",
  pytest: "pytest"
};
function stepEnv(env, d) {
  const runner = env.RUNNER_OS && env.RUNNER_ARCH ? `${env.RUNNER_OS}/${env.RUNNER_ARCH}` : "?";
  return envKey(
    workflowFile(env.GITHUB_WORKFLOW_REF ?? null),
    env.GITHUB_JOB || "?",
    matrixKey(d.matrix),
    runner
  );
}
function buildUpload(env, d, r, now) {
  const runId = Number(env.GITHUB_RUN_ID);
  const attempt = Number(env.GITHUB_RUN_ATTEMPT || 1);
  if (!Number.isSafeInteger(runId) || runId <= 0 || !Number.isSafeInteger(attempt) || attempt <= 0)
    return null;
  if (!env.GITHUB_JOB || !r.reports.some((x) => x.status === "read")) return null;
  const valid = r.tests.filter(
    (t) => t.id.length <= LIMITS.testIdChars && t.file.length > 0 && t.file.length <= LIMITS.fileChars && // eslint-disable-next-line no-control-regex
    !/[\u0000-\u001f\u007f]/.test(t.id + t.file) && t.id.isWellFormed() && t.file.isWellFormed()
  );
  let complete = resultsComplete(r) && valid.length === r.tests.length;
  const totals = { tests: 0, passed: 0, failed: 0, skipped: 0, retried: 0 };
  for (const t of valid) {
    totals.tests++;
    totals[t.outcome]++;
  }
  const ordered = [...valid].sort((a, b) => RANK[b.outcome] - RANK[a.outcome]);
  const tests = [];
  let bytes = 0;
  for (const t of ordered) {
    if (tests.length >= LIMITS.testsPerUpload) break;
    const ms2 = t.durationMs !== void 0 ? Math.min(Math.round(t.durationMs), LIMITS.durationMs) : void 0;
    const row = {
      id: t.id,
      file: t.file,
      outcome: t.outcome,
      ...ms2 !== void 0 && { durationMs: ms2 },
      ...t.retries ? { retries: t.retries } : {}
    };
    bytes += Buffer.byteLength(JSON.stringify(row)) + 1;
    if (bytes > UPLOAD_BUDGET) break;
    tests.push(row);
  }
  if (tests.length < valid.length) complete = false;
  const matrix = d.matrix;
  return {
    schema: CI_UPLOAD_SCHEMA,
    version: 1,
    run: { id: runId, attempt },
    job: {
      key: env.GITHUB_JOB.slice(0, LIMITS.jobKeyChars),
      ...matrix !== void 0 && { matrix },
      ...env.RUNNER_OS && env.RUNNER_ARCH && { runner: { os: env.RUNNER_OS, arch: env.RUNNER_ARCH } },
      ...d.checkRunId && { checkRunId: d.checkRunId }
    },
    part: "default",
    partCount: 1,
    tool: { framework: FRAMEWORK[d.runner] ?? "other", step: "tensile-step@1" },
    startedAt: d.decidedAt,
    finishedAt: now.toISOString(),
    complete,
    totals,
    tests
  };
}
async function sendResults(env, sink, upload, opts = {}) {
  if (!upload) return "skipped";
  if (/^(false|0|off|no)$/i.test(getInput(env, "upload-results"))) return "skipped";
  let url;
  try {
    url = parseServiceUrl(getInput(env, "service-url"));
  } catch (e) {
    sink.warning(`test results not sent: ${e.message}`);
    return "failed";
  }
  if (!url) return "skipped";
  if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
    sink.warning("test results not sent: no OIDC token (the job needs `permissions: id-token: write`)");
    return "skipped";
  }
  const timeoutMs = opts.timeoutMs ?? 15e3;
  try {
    const token = await oidcToken(env, timeoutMs);
    await call(
      `POST ${servicePaths.ledgerUploads}`,
      url.replace(/\/+$/, "") + servicePaths.ledgerUploads,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(upload)
      },
      timeoutMs
    );
    return "sent";
  } catch (e) {
    sink.warning(`test results not sent: ${e.message}`);
    return "failed";
  }
}
var reportPaths = (env) => lines(getInput(env, "report"));

// src/step/override.ts
var OVERRIDE_RECORD_SCHEMA = "tensile.quarantine-record";
var LIST_MAX_AGE_MS = 10 * 6e4;
var MAX_NAMED = 100;
function runnerProblems(runner, dirs) {
  if (runner !== "vitest") return [];
  for (const dir of dirs) {
    try {
      const v = JSON.parse(readFileSync7(join2(dir, "node_modules", "vitest", "package.json"), "utf8")).version;
      const major = typeof v === "string" ? Number(/^(\d+)\./.exec(v)?.[1]) : NaN;
      if (!Number.isFinite(major)) return ["the Vitest version is unreadable"];
      return major >= 5 ? [] : [`Vitest ${String(v)}: its JUnit reporter leaves out unhandled errors before Vitest 5`];
    } catch {
    }
  }
  return [
    "Vitest's version can't be read (node_modules/vitest): unhandled errors may be missing from the report"
  ];
}
function decideOverride(x) {
  const failed = x.results.tests.filter((t) => t.outcome === "failed");
  const quarantined = [];
  const notQuarantined = [];
  const reasons = [];
  if (x.list.ok) {
    const byTest = /* @__PURE__ */ new Map();
    for (const e of x.list.claims.tests)
      if (e.env === x.env && Date.parse(e.expiresAt) > x.now) byTest.set(e.test, e);
    for (const t of failed) {
      const e = byTest.get(t.id);
      if (e)
        quarantined.push({ test: t.id, decisionId: e.decisionId, owners: e.owners, expiresAt: e.expiresAt });
      else notQuarantined.push(t.id);
    }
  } else {
    for (const t of failed) notQuarantined.push(t.id);
    reasons.push(`no usable quarantine list: ${x.list.reason}`);
  }
  const out2 = (verdict) => ({
    verdict,
    reasons: verdict === "would_pass" ? [] : reasons,
    failedCount: failed.length,
    quarantined,
    notQuarantined
  });
  if (x.testOutcome === "success") return out2("passed");
  if (x.testOutcome !== "failure")
    reasons.push(
      x.testOutcome ? `the test step's outcome is ${x.testOutcome}, not failure` : "no test-outcome input: the step can\u2019t tell the tests failed"
    );
  if (x.event !== "pull_request")
    reasons.push(`a ${x.event || "unknown"} event: only pull requests are ever turned green`);
  else if (!x.landsOn?.base || !x.landsOn.defaultBranch || x.landsOn.base !== x.landsOn.defaultBranch)
    reasons.push(
      `the pull request lands on ${x.landsOn?.base ?? "an unknown branch"}, not the default branch (${x.landsOn?.defaultBranch ?? "unknown"}) the landing mode is read for`
    );
  const reports = x.results.reports;
  if (!reports.length) reasons.push("no test report configured");
  if (!x.dated) reasons.push("no select-phase decision in this job: the reports can't be dated to this run");
  for (const p of x.runnerProblems ?? []) reasons.push(p);
  for (const r of reports) {
    if (r.status !== "read") reasons.push(`report ${r.path} is ${r.status}${r.why ? ` (${r.why})` : ""}`);
    else if (r.format !== "junit")
      reasons.push(
        `report ${r.path} is ${r.format}: only JUnit XML shows failures outside tests (use the runner's JUnit reporter)`
      );
    for (const p of r.problems.slice(0, 3)) reasons.push(`report ${r.path}: ${p}`);
  }
  if (!resultsComplete(x.results) && reports.length && !reasons.some((s) => s.startsWith("report ")))
    reasons.push("the results are incomplete");
  if (x.testOutcome === "failure" && failed.length === 0)
    reasons.push(
      "the test step failed but the report lists no failing test (a crash, or a failure outside the tests)"
    );
  if (x.list.ok) {
    const c = x.list.claims;
    if (c.ledger.stale) reasons.push("the list was read from a stale ledger");
    if (!c.ledger.complete) reasons.push("the list was read from a ledger with gaps");
    if (!c.complete) reasons.push("the list is incomplete");
  }
  if (notQuarantined.length && x.list.ok) return out2("stays_red");
  if (reasons.length) return out2("unknown");
  if (failed.length > 0 && quarantined.length === failed.length && notQuarantined.length === 0)
    return out2("would_pass");
  reasons.push("internal: no failing test matched");
  return out2("unknown");
}
var TEST_CODE = /(^|[./])(test|spec)\.[cm]?[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.py$|(^|\/)(test|tests|__tests__|__mocks__|__fixtures__|fixtures?|e2e|spec|testdata|conftest\.py)(\/|$)/;
var changesTestCode = (files) => files.some((f) => TEST_CODE.test(f));
function overrideMode(requested, list3, o, changed = null) {
  if (requested !== "enforce") return { requested, mode: "shadow", applied: false, why: null };
  if (!list3.ok) return { requested, mode: "shadow", applied: false, why: `no usable list: ${list3.reason}` };
  if (!list3.claims.enforce) {
    const only = Array.isArray(list3.claims.enforceOnly) ? new Set(list3.claims.enforceOnly) : null;
    if (only?.size && changed !== null && !changesTestCode(changed) && o.verdict === "would_pass" && o.quarantined.length > 0 && o.quarantined.length === o.failedCount && o.quarantined.every((q) => only.has(q.decisionId)))
      return { requested, mode: "enforce", applied: true, why: null };
    return {
      requested,
      mode: "shadow",
      applied: false,
      why: only?.size ? changed === null ? "on for low-risk failures only, and the change's files couldn't be read" : changesTestCode(changed) ? "on for low-risk failures only, and this change edits test code" : "on for low-risk failures only, and not every failing test is a quarantined test with enough confirmed flips" : "the service hasn't enabled the override for this repo (its opt-in or the module's bar)"
    };
  }
  return { requested, mode: "enforce", applied: o.verdict === "would_pass", why: null };
}
function overrideExit(requested, testOutcome, m) {
  if (requested !== "enforce") return 0;
  if (testOutcome === "success") return 0;
  return m.applied ? 0 : 1;
}
async function fetchList(opts) {
  let signed;
  try {
    const path = servicePaths.quarantineList(opts.owner, opts.repo);
    const res = await call(
      `GET ${path}`,
      opts.serviceUrl.replace(/\/+$/, "") + path,
      { headers: { Authorization: `Bearer ${opts.token}` } },
      opts.timeoutMs
    );
    const text = await res.text();
    if (text.length > 2 * 1024 * 1024) return { ok: false, reason: "the list is too large" };
    signed = JSON.parse(text);
  } catch (e) {
    return { ok: false, reason: e.message.slice(0, 200) };
  }
  const expect = { ...opts.expect, maxAgeMs: LIST_MAX_AGE_MS, now: opts.now };
  let v = verifyQuarantine(toMapKeys(opts.keys), signed, expect);
  if (!v.ok && /^unknown signing key/.test(v.reason) && opts.keyOrigin) {
    const published = await fetchPublishedKeys(opts.keyOrigin);
    v = verifyQuarantine(toMapKeys([...opts.keys, ...published]), signed, expect);
  }
  if (!v.ok) return { ok: false, reason: `unverified: ${v.reason}` };
  return {
    ok: true,
    claims: v.claims,
    sha256: createHash7("sha256").update(String(signed.claims)).digest("hex")
  };
}
function overrideRecord(env, d, x, o, m, matrixKeyOf2) {
  return {
    schema: OVERRIDE_RECORD_SCHEMA,
    version: 1,
    run: {
      id: env.GITHUB_RUN_ID ?? "",
      attempt: Number(env.GITHUB_RUN_ATTEMPT ?? 1) || 1,
      job: env.GITHUB_JOB ?? "",
      matrixKey: matrixKeyOf2(d.matrix)
    },
    checkRunId: d.checkRunId,
    event: x.event,
    env: x.env,
    requestedMode: m.requested,
    mode: m.mode,
    applied: m.applied,
    verdict: o.verdict,
    reasons: o.reasons.slice(0, 20).map((r) => r.slice(0, 300)),
    testOutcome: x.testOutcome,
    failed: {
      count: o.failedCount,
      tests: x.results.tests.filter((t) => t.outcome === "failed").slice(0, MAX_NAMED).map((t) => t.id.slice(0, 500))
    },
    quarantined: o.quarantined.slice(0, MAX_NAMED).map((q) => ({ test: q.test.slice(0, 500), decisionId: q.decisionId })),
    notQuarantined: {
      count: o.notQuarantined.length,
      tests: o.notQuarantined.slice(0, MAX_NAMED).map((t) => t.slice(0, 500))
    },
    list: x.list.ok ? {
      ok: true,
      reason: null,
      sha256: x.list.sha256,
      signedAt: x.list.claims.createdAt,
      entries: x.list.claims.tests.length,
      enforce: x.list.claims.enforce
    } : {
      ok: false,
      reason: x.list.reason.slice(0, 300),
      sha256: null,
      signedAt: null,
      entries: 0,
      enforce: false
    },
    reports: x.results.reports.map((r) => ({
      format: r.format ?? null,
      status: r.status,
      problems: r.problems.length
    })),
    decidedAt: new Date(x.now).toISOString()
  };
}
function reportOverride(sink, o, m) {
  if (o.verdict === "passed" && !o.quarantined.length) return;
  for (const q of o.quarantined.slice(0, 20))
    sink.warning(
      `quarantined test failed: ${q.test} (owners: ${q.owners.join(", ") || "none in CODEOWNERS"}; quarantined until ${q.expiresAt}; evidence: decision ${q.decisionId})`
    );
  if (o.verdict === "would_pass")
    sink.log(
      m.applied ? `Tensile quarantine (enforce): every failure (${o.failedCount}) is a quarantined flaky test; the job passes` : `Tensile quarantine (shadow): every failure (${o.failedCount}) is a quarantined flaky test; enforce would pass the job${m.why ? ` (not enforced: ${m.why})` : ""}`
    );
  else if (o.verdict === "stays_red")
    sink.log(
      `Tensile quarantine: ${o.notQuarantined.length} failing test(s) aren't quarantined; the job stays red: ${o.notQuarantined.slice(0, 5).join(", ")}`
    );
  else if (o.verdict === "unknown")
    sink.log(`Tensile quarantine: unknown, the exit code is left alone: ${o.reasons.slice(0, 3).join("; ")}`);
}
async function sendOverrideRecord(env, sink, record, opts = {}) {
  let url;
  try {
    url = parseServiceUrl(getInput(env, "service-url"));
  } catch {
    return { status: "failed", id: null };
  }
  if (!url || !env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
    return { status: "skipped", id: null };
  const timeoutMs = opts.timeoutMs ?? 1e4;
  try {
    const token = await oidcToken(env, timeoutMs);
    const res = await call(
      `POST ${servicePaths.quarantineRecords}`,
      url.replace(/\/+$/, "") + servicePaths.quarantineRecords,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(record)
      },
      timeoutMs
    );
    const body2 = await res.json().catch(() => null);
    const id = typeof body2?.id === "string" && body2.id && body2.id.length <= 200 ? body2.id : null;
    return { status: "sent", id };
  } catch (e) {
    sink.warning(`quarantine record not sent: ${e.message}`);
    return { status: "failed", id: null };
  }
}
function landsOnOf(env) {
  let ev = {};
  try {
    ev = readEvent(env);
  } catch {
  }
  return {
    base: env.GITHUB_BASE_REF || ev.pull_request?.base?.ref || null,
    defaultBranch: ev.repository?.default_branch ?? null
  };
}
function requestedMode(env) {
  const v = getInput(env, "quarantine-mode").toLowerCase();
  if (v === "enforce" || v === "auto") return "enforce";
  if (v === "off") return v;
  return "shadow";
}
async function runOverride(env, sink, d, results, deps) {
  const requested = requestedMode(env);
  const testOutcome = getInput(env, "test-outcome") || null;
  const now = (deps.now ?? Date.now)();
  const fallback = (why) => {
    const o = {
      verdict: "unknown",
      reasons: [why],
      failedCount: 0,
      quarantined: [],
      notQuarantined: []
    };
    const m = { requested, mode: "shadow", applied: false, why };
    return { exit: overrideExit(requested, testOutcome, m), override: o, mode: m, record: null };
  };
  if (requested === "off") return fallback("quarantine-mode is off");
  try {
    let list3 = { ok: false, reason: "no service-url" };
    let url = "";
    try {
      url = parseServiceUrl(getInput(env, "service-url"));
    } catch (e) {
      list3 = { ok: false, reason: e.message };
    }
    const repoId = Number(d.repoId);
    const tenant = Number(d.ownerId);
    if (url && testOutcome === "failure") {
      if (!Number.isSafeInteger(repoId) || repoId <= 0 || !Number.isSafeInteger(tenant) || tenant <= 0)
        list3 = { ok: false, reason: "no repository or owner id in the environment" };
      else {
        try {
          const token = await oidcToken(env, deps.timeoutMs ?? 1e4);
          const [owner = "", repo = ""] = (env.GITHUB_REPOSITORY ?? "").split("/");
          list3 = await fetchList({
            serviceUrl: url,
            owner,
            repo,
            token,
            expect: { host: d.host, repoId, tenant },
            keys: deps.keys ?? PINNED_MAP_KEYS,
            keyOrigin: deps.keyOrigin === void 0 ? KEY_ORIGIN : deps.keyOrigin,
            now: new Date(now),
            timeoutMs: deps.timeoutMs ?? 1e4
          });
        } catch (e) {
          list3 = { ok: false, reason: e.message.slice(0, 200) };
        }
      }
    } else if (url) list3 = { ok: false, reason: "not fetched: the tests did not fail" };
    const input = {
      event: d.event,
      testOutcome,
      results,
      list: list3,
      env: stepEnv(env, d),
      now,
      dated: deps.dated,
      landsOn: landsOnOf(env),
      runnerProblems: deps.runnerProblems ?? []
    };
    const o = decideOverride(input);
    let m = overrideMode(requested, list3, o, deps.changed ?? null);
    if (deps.shadowOnly && m.mode === "enforce")
      m = { requested, mode: "shadow", applied: false, why: deps.shadowOnly };
    reportOverride(sink, o, m);
    const record = overrideRecord(env, d, input, o, m, deps.matrixKeyOf);
    return { exit: overrideExit(requested, testOutcome, m), override: o, mode: m, record };
  } catch (e) {
    return fallback(`internal error: ${e.message}`);
  }
}

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
  const scope = sha256(JSON.stringify([p.root, [...p.testPaths].sort(), [...p.always].sort()])).slice(0, 12);
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
    skippedSha256: sha256(d.skipped.join("\n")),
    selectedSha256: sha256(selected.join("\n")),
    // Sharding (docs/design/sharding.md): this leg's shard, and the projection, labelled as one.
    ...d.shard && { shard: d.shard },
    ...d.shardProjection && { shardProjection: d.shardProjection },
    // The low-risk scope's facts (app modules/scopes.ts): kept only when they fit, else dropped (out of scope).
    ...d.scope && Buffer.byteLength(JSON.stringify(d.scope)) <= 24 * 1024 && { scope: d.scope },
    ...d.fullSuite && { fullSuite: d.fullSuite },
    ...d.inputs && { inputs: d.inputs },
    ...d.landing && { landing: d.landing }
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
    // A full-suite rule (a default-branch push) ran everything whatever the plan says: nothing was saved.
    safeDefault: d.runAll || !!d.fullSuite,
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
var esc4 = (s) => s.replace(/[&<>"'|`]/g, (c) => `&#${c.charCodeAt(0)};`).replace(/\r?\n/g, " ");
var code2 = (s) => `<code>${esc4(s)}</code>`;
var list2 = (xs, n = 3) => xs.slice(0, n).map(code2).join(", ") + (xs.length > n ? ` and ${xs.length - n} more` : "");
var MAX_ROWS2 = 200;
var MAX_BYTES3 = 9e5;
function describePlanReason(r) {
  switch (r.kind) {
    case "static":
      return `its static imports reach ${list2(r.files)}`;
    case "history":
      return `failed recently (${esc4(r.failedAt.slice(0, 10))}) in an affected package`;
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
  if (d.runAll) out2.push(`**Runs everything:** ${esc4(d.reasons.join("; ") || "no reason recorded")}`, "");
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
  if (d.modeReason) out2.push(`Not enforcing: ${esc4(d.modeReason)}.`, "");
  if (d.map)
    out2.push(
      `Map: ${code2(d.map.source)}${d.map.commit ? ` at ${code2(d.map.commit.slice(0, 10))}` : ""}, ${d.map.verified ? `signature verified (key ${code2(d.map.keyId ?? "")})` : `**unverified**${d.map.problem ? ` (${esc4(d.map.problem)})` : ""}`}${d.map.distance !== null ? `, ${d.map.distance} commits behind the base` : ""}.`,
      ""
    );
  else if (!d.runAll) out2.push(`No coverage map: ${esc4(d.basis)} grain.`, "");
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
  else out2.push(`Unknown: ${esc4(o.note ?? "not enough evidence")}.`, "");
  out2.push(`Verdict \`${o.verdict}\` (${o.kind}), recorded for the ledger.`, "");
  const p = d.shardProjection;
  if (p && p.auto.n > 1) {
    const min = (s) => `${Math.round(s / 60 * 10) / 10} min`;
    out2.push(
      `Sharding (projection from this run's ${p.files} test files, not a measured run): with ${p.auto.n} shards, feedback in about ${min(p.auto.wallSeconds)} instead of ${min(p.unsharded.wallSeconds)}, ${p.auto.billedMinutes} billed minutes instead of ${p.unsharded.billedMinutes} (${p.setupSeconds} s of setup per job assumed).`,
      ""
    );
  }
  return cap2(out2.join("\n"));
}

// src/step/outcome.ts
var MAX_REPORT_BYTES2 = 64 * 1024 * 1024;
var recordPath = (decisionFile) => join3(dirname3(decisionFile), "selection-record.json");
var resultsPath = (decisionFile) => join3(dirname3(decisionFile), "ci-upload.json");
function readDecision(file) {
  const d = JSON.parse(readFileSync8(file, "utf8"));
  if (d?.schema !== DECISION_SCHEMA || d.version !== 1)
    throw new Error(`${file} is not a selection decision`);
  return d;
}
function readReports(paths, repo, root) {
  const hash = createHash8("sha256");
  const failed = /* @__PURE__ */ new Set();
  const seen = /* @__PURE__ */ new Set();
  let any = false;
  const repoRoot = resolve5(repo).replace(/\\/g, "/").replace(/\/?$/, "/");
  const prefix = root.replace(/^\.\/?/, "").replace(/\/+$/, "");
  for (const p of paths) {
    const abs = isAbsolute5(p) ? p : resolve5(repo, p);
    if (!existsSync3(abs)) continue;
    if (statSync2(abs).size > MAX_REPORT_BYTES2) throw new Error(`${p} is over ${MAX_REPORT_BYTES2} bytes`);
    const buf = readFileSync8(abs);
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
function reportDurations(paths, repo) {
  const files = /* @__PURE__ */ new Map();
  let start2 = Infinity;
  let end = -Infinity;
  for (const p of paths) {
    const abs = isAbsolute5(p) ? p : resolve5(repo, p);
    if (!existsSync3(abs) || statSync2(abs).size > MAX_REPORT_BYTES2) continue;
    const text = readFileSync8(abs, "utf8");
    if (!text.trimStart().startsWith("{")) continue;
    let json;
    try {
      json = JSON.parse(text);
      if (!Array.isArray(json.testResults)) continue;
      for (const [f, s] of parseDurations(text, repo)) files.set(f, (files.get(f) ?? 0) + s);
    } catch {
      continue;
    }
    for (const t of json.testResults) {
      if (typeof t.startTime === "number" && Number.isFinite(t.startTime))
        start2 = Math.min(start2, t.startTime);
      if (typeof t.endTime === "number" && Number.isFinite(t.endTime)) end = Math.max(end, t.endTime);
    }
  }
  if (!files.size) return null;
  return { files, wallSeconds: end > start2 ? (end - start2) / 1e3 : null };
}
function shardProjectionFor(env, d, reports, repo) {
  if (d.shard) return null;
  const r = reportDurations(reports, repo);
  if (!r) return null;
  const raw2 = Number(getInput(env, "shard-setup-seconds") || "60");
  const setupSeconds = Number.isFinite(raw2) && raw2 >= 0 && raw2 <= 86400 ? raw2 : 60;
  return projectSharding(r.files, { wallSeconds: r.wallSeconds, setupSeconds });
}
var lines2 = (s) => s.split("\n").map((x) => x.trim()).filter(Boolean);
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
    report = readReports(lines2(getInput(env, "report")), repo, d.root);
  } catch (e) {
    sink.warning(`test report unreadable: ${e.message}`);
  }
  const outcome = judge(d, report?.tests ?? null, testOutcome, report?.sha256 ?? null);
  try {
    d.shardProjection = shardProjectionFor(env, d, lines2(getInput(env, "report")), repo);
  } catch (e) {
    sink.warning(`no sharding projection: ${e.message}`);
  }
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
  if (existsSync3(recordPath(decisionFile))) return null;
  return runOutcomePhase(env, sink, decisionFile);
}
function changedFiles(decisionFile, repo) {
  try {
    const d = readDecision(decisionFile);
    if (!d.base || !d.head) return null;
    return git(repo, ["diff", "--name-only", "-z", "--no-renames", d.base, d.head]).split("\0").filter(Boolean);
  } catch {
    return null;
  }
}
function jobFacts(env, decisionFile) {
  try {
    const d = readDecision(decisionFile);
    const at = Date.parse(d.decidedAt);
    return { d, dated: Number.isFinite(at), sharded: Boolean(d.shard) || getInput(env, "shard") !== "" };
  } catch {
  }
  let matrix;
  try {
    const raw2 = getInput(env, "matrix-key");
    if (raw2) {
      const v = JSON.parse(raw2);
      if (v === null || typeof v === "object" && !Array.isArray(v)) matrix = v;
    }
  } catch {
    matrix = void 0;
  }
  const crid = getInput(env, "check-run-id");
  const runner = getInput(env, "runner") || "vitest";
  let host = "";
  try {
    host = new URL(env.GITHUB_SERVER_URL || "https://github.com").host.toLowerCase();
  } catch {
    host = "";
  }
  return {
    d: {
      ...matrix !== void 0 && { matrix },
      checkRunId: /^\d{1,19}$/.test(crid) ? Number(crid) : null,
      event: env.GITHUB_EVENT_NAME ?? "",
      host,
      repoId: env.GITHUB_REPOSITORY_ID ?? "",
      ownerId: env.GITHUB_REPOSITORY_OWNER_ID ?? "",
      runner,
      root: getInput(env, "root"),
      decidedAt: (/* @__PURE__ */ new Date()).toISOString()
    },
    dated: false,
    // Any shard input, even one that doesn't parse, makes this a sharded leg: it never applies the override.
    sharded: getInput(env, "shard") !== ""
  };
}
async function runResultsAndOverride(env, sink, decisionFile, opts) {
  const enforcing = opts.canEnforce && requestedMode(env) === "enforce";
  const testOutcome = getInput(env, "test-outcome") || null;
  const failClosed = enforcing && testOutcome !== "success" ? 1 : 0;
  try {
    const { d, dated, sharded } = jobFacts(env, decisionFile);
    const repo = getInput(env, "working-directory") || env.GITHUB_WORKSPACE || ".";
    const results = readStepResults(reportPaths(env), repo, d.root, dated ? Date.parse(d.decidedAt) : null);
    const upload = buildUpload(env, d, results, /* @__PURE__ */ new Date());
    if (upload && opts.canEnforce)
      try {
        const out2 = resultsPath(decisionFile);
        writeFileSync3(out2, JSON.stringify(upload) + "\n");
        sink.outputs([
          ["results-file", out2]
        ]);
      } catch (e) {
        sink.warning(`could not write the test results file: ${e.message}`);
      }
    await sendResults(env, sink, upload);
    const r = await runOverride(env, sink, d, results, {
      changed: changedFiles(decisionFile, repo),
      ...opts.deps,
      matrixKeyOf: matrixKey,
      dated,
      runnerProblems: runnerProblems(d.runner, [resolve5(repo, d.root || "."), resolve5(repo)]),
      shadowOnly: sharded ? "a sharded leg never applies the override (docs/design/sharding.md)" : null
    });
    const sent = r.record ? await sendOverrideRecord(env, sink, r.record) : null;
    if (!opts.canEnforce) return 0;
    if (r.mode.applied && testOutcome !== "success" && !sent?.id) {
      process.stdout.write(
        `::error title=Tensile::the tests failed; the quarantine override would pass the job, but the service didn't record it (no record, no action), so the job stays red
`
      );
      return 1;
    }
    if (r.exit !== 0)
      process.stdout.write(
        `::error title=Tensile::the tests failed${r.override.reasons.length ? ` (${escapeCommand(r.override.reasons[0])})` : ""}; quarantine-mode enforce keeps the job red
`
      );
    return r.exit;
  } catch (e) {
    sink.warning(
      `quarantine override: internal error, the job's result is left as the tests left it: ${e.message}`
    );
    return failClosed;
  }
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
import { mkdirSync as mkdirSync4, readFileSync as readFileSync9, writeFileSync as writeFileSync4 } from "node:fs";
import { tmpdir as tmpdir2 } from "node:os";
import { dirname as dirname4, join as join4, resolve as resolve6 } from "node:path";

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
var lines3 = (s) => s.split(/[\n,]/).map((x) => x.trim()).filter(Boolean);
function num2(name2, raw2, dflt, min, integer = false) {
  if (!raw2) return dflt;
  const n = Number(raw2);
  if (!Number.isFinite(n) || n < min || integer && !Number.isInteger(n))
    throw new InputError(
      `input ${name2} must be ${integer ? "an integer" : "a number"} >= ${min}, got ${raw2}`
    );
  return n;
}
function runningWorkflow(env) {
  const m = /^([^/]+\/[^/]+)\/(.+?)@/.exec(env.GITHUB_WORKFLOW_REF ?? "");
  if (!m || m[1].toLowerCase() !== (env.GITHUB_REPOSITORY ?? "").toLowerCase()) return null;
  return m[2];
}
function defaultPolicyFiles(env) {
  const out2 = [".github/tensile.yml", ".github/tensile.yaml", "jiffy.yml", ".jiffy.yml", ".github/jiffy.yml"];
  const w = /^[^/]+\/[^/]+\/(.+?)@/.exec(env.GITHUB_WORKFLOW_REF ?? "")?.[1];
  if (w) out2.push(w);
  return out2;
}
function decisionPath(env) {
  return resolve6(
    process.cwd(),
    getInput(env, "decision-file") || join4(env.RUNNER_TEMP || ".tensile", "tensile", "selection-decision.json")
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
    testPaths: lines3(getInput(env, "test-paths")),
    always: lines3(getInput(env, "always")),
    policyFiles: [...defaultPolicyFiles(env), ...lines3(getInput(env, "policy-files"))],
    workflow: runningWorkflow(env),
    durations: getInput(env, "durations"),
    history: getInput(env, "history"),
    maxMapCommits: num2("max-map-commits", getInput(env, "max-map-commits"), 200, 0, true),
    maxMapAgeDays: num2("max-map-age-days", getInput(env, "max-map-age-days"), 14, 0),
    timeoutSeconds: num2("timeout-seconds", getInput(env, "timeout-seconds"), 60, 1),
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
    ...matrix !== void 0 && { matrix },
    shard: (() => {
      const raw2 = getInput(env, "shard");
      if (!raw2) return null;
      try {
        const { index, total } = parseShardLabel(raw2);
        return { label: `${index + 1}/${total}`, index, total };
      } catch (e) {
        throw new InputError(`input ${e.message}`);
      }
    })()
  };
}
function stepShard(inputs, tests, durations) {
  if (!inputs.shard) return void 0;
  const { label, index, total } = inputs.shard;
  let wouldRun = null;
  if (tests) {
    const plan = planShards(tests, { history: durations }, { shards: total });
    const mine = plan.shards[index]?.tests ?? [];
    wouldRun = {
      files: mine.length,
      sha256: sha256(mine.join("\n")),
      digest: plan.digest,
      basis: plan.basis,
      seconds: plan.shards[index]?.seconds ?? 0
    };
  }
  return { label, index, total, args: nativeShardArgs(inputs.runner, label), wouldRun };
}
function readDurations(inputs) {
  if (!inputs.durations) return /* @__PURE__ */ new Map();
  try {
    return parseDurations(
      readFileSync9(resolve6(process.cwd(), inputs.durations), "utf8"),
      inputs.workingDirectory
    );
  } catch {
    return /* @__PURE__ */ new Map();
  }
}
function inputRecord(path, until) {
  if (!path) return null;
  let text;
  try {
    text = readFileSync9(resolve6(process.cwd(), path), "utf8");
  } catch {
    return { source: "file", sha256: "", entries: 0 };
  }
  let entries = 0;
  try {
    const v = JSON.parse(text);
    entries = Array.isArray(v) ? v.length : v && typeof v === "object" ? Object.keys(v).length : 0;
  } catch {
  }
  return until ? { source: "ledger", sha256: inputDigest(text), entries, until } : { source: "file", sha256: inputDigest(text), entries };
}
var MAX_WORKFLOW_BYTES = 1024 * 1024;
function checkNames(env, inputs) {
  const job = env.GITHUB_JOB ?? "";
  if (!inputs.workflow || !job) return null;
  for (const dir of new Set(
    [env.GITHUB_WORKSPACE, inputs.workingDirectory].filter((d) => !!d)
  )) {
    try {
      const p = resolve6(dir, inputs.workflow);
      const text = readFileSync9(p);
      if (text.length > MAX_WORKFLOW_BYTES) return null;
      return jobCheckNames(text.toString("utf8"), job);
    } catch {
    }
  }
  return null;
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
    const shard2 = inputs ? stepShard(inputs, null, /* @__PURE__ */ new Map()) : void 0;
    if (shard2) decision2.shard = shard2;
    return {
      decision: decision2,
      runAll: true,
      args: "",
      files: [],
      skip: false,
      shardArgs: shard2?.args ?? "",
      warnings
    };
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
  let fullSuite = null;
  if (plan.kind === "full") {
    const before = pushShadowBase(env, event);
    if (!before) return full(plan.reason);
    fullSuite = plan.reason;
    plan = {
      kind: "select",
      baseCandidates: [before],
      describe: `the push's before ${before.slice(0, 10)}`,
      expectHead: env.GITHUB_SHA
    };
  }
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
  if (fullSuite) decision.fullSuite = fullSuite;
  decision.ledger = cfg?.ledger ?? null;
  if (decision.ledger?.stale)
    return full(`the ledger is stale (${decision.ledger.reasons.join("; ") || "behind"})`, decision);
  const fromLedger = { durations: inputs.durations === "ledger", history: inputs.history === "ledger" };
  let until = null;
  let li = null;
  let liProblem = "no service-url (or no id-token: write)";
  if (target && token) {
    until = utcDay(now());
    try {
      li = await fetchSelectInputs(target, token, until);
    } catch (e) {
      liProblem = e.message;
    }
  }
  const landing = deps.landing !== void 0 ? deps.landing : li?.landing ?? null;
  if (target && token && !li) warnings.push(`landing mode: ${liProblem}; every job counts as required`);
  if (fromLedger.durations || fromLedger.history) {
    if (!target || !token)
      return full("durations or history is ledger, which needs service-url (and id-token: write)", decision);
    if (!li) return full(`could not read the ledger's durations and history: ${liProblem}`, decision);
    try {
      const dir = join4(env.RUNNER_TEMP || tmpdir2(), "tensile");
      mkdirSync4(dir, { recursive: true });
      if (fromLedger.durations) {
        inputs.durations = join4(dir, "ledger-durations.json");
        writeFileSync4(inputs.durations, durationsText(li.durations));
      }
      if (fromLedger.history) {
        inputs.history = join4(dir, "ledger-history.json");
        writeFileSync4(inputs.history, historyText(li.history));
      }
    } catch (e) {
      return full(`could not read the ledger's durations and history: ${e.message}`, decision);
    }
  }
  decision.inputs = {
    durations: inputRecord(inputs.durations, fromLedger.durations ? until : null),
    history: inputRecord(inputs.history, fromLedger.history ? until : null)
  };
  const evName = env.GITHUB_EVENT_NAME ?? "";
  const ref = env.GITHUB_REF ?? "";
  if (!fullSuite && (evName === "push" || evName === "workflow_dispatch" || evName === "repository_dispatch") && ref.startsWith("refs/heads/")) {
    const branch = ref.slice("refs/heads/".length);
    const why2 = landingBranchReason(branch, landing);
    if (why2) {
      fullSuite = `${evName} on ${branch}: a landing run runs everything (${why2})`;
      decision.fullSuite = fullSuite;
    }
  }
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
        workflow: inputs.workflow,
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
    timings: w.timings,
    ...w.scope && { scope: w.scope }
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
  const landsOn = targetBranch(env, event);
  const req = requiredJob(landing, landsOn, checkNames(env, inputs));
  decision.landing = {
    mode: landing?.mode ?? "unknown",
    readAt: landing?.readAt ?? null,
    target: landsOn,
    required: req.required,
    why: req.why
  };
  if (req.required) blockers.push(`the landing gate runs in full: ${req.why}`);
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
  if (inputs.mode === "enforce" && inputs.shard)
    why.push(
      "the legs of a sharded job can't yet show they planned the same split (docs/design/sharding.md): use a planning job's matrix to enforce"
    );
  if (fullSuite) why.push(`${fullSuite}: the job runs everything, and the plan is recorded in shadow`);
  const shard = stepShard(
    inputs,
    decision.runAll ? null : [...w.selected.map((s) => s.test), ...w.sampled],
    readDurations(inputs)
  );
  if (shard) decision.shard = shard;
  decision.mode = why.length ? "shadow" : "enforce";
  decision.modeReason = inputs.mode === "enforce" && why.length ? why.join("; ") : null;
  decision.timings.stepMs = Math.round(performance.now() - start2);
  if (decision.mode === "enforce" && !decision.runAll) {
    try {
      if (!target || !token) throw new Error("no service to record it with");
      decision.bound = { decisionId: await bindDecision(target, token, selectionRecord(decision, [])) };
    } catch (e) {
      decision.mode = "shadow";
      decision.modeReason = `no record, no action: the service didn't record the decision before it took effect (${e.message.slice(0, 200)})`;
      decision.timings.stepMs = Math.round(performance.now() - start2);
    }
  }
  if (decision.mode !== "enforce" || decision.runAll)
    return {
      decision,
      runAll: true,
      args: "",
      files: [],
      skip: false,
      shardArgs: shard?.args ?? "",
      warnings
    };
  return {
    decision,
    runAll: false,
    args: list3.args,
    files: list3.files,
    skip: list3.files.length === 0,
    shardArgs: "",
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
    // Only with run-all: a selected list is already this job's whole share.
    ["shard-args", r.runAll ? r.shardArgs : ""],
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
    r = { decision, runAll: true, args: "", files: [], skip: false, shardArgs: "", warnings: [] };
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
import { createHash as createHash9 } from "node:crypto";
import { lstatSync, readdirSync, readFileSync as readFileSync10 } from "node:fs";
import { basename, join as join5 } from "node:path";
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
    const f = join5(dir, names2[0]);
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
    const art = join5(dir, name2);
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
    const f = join5(art, want);
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
    return done(
      true,
      "pull request from a fork: no OIDC token, so Tensile shows the evidence as unavailable"
    );
  if (!env.ACTIONS_ID_TOKEN_REQUEST_URL || !env.ACTIONS_ID_TOKEN_REQUEST_TOKEN)
    return done(
      true,
      "no OIDC token for this run (Dependabot pull requests and forks get none, or the job lacks `id-token: write`), so Tensile shows the evidence as unavailable"
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
      text = readFileSync10(f, "utf8");
    } catch (e) {
      results.push({
        file: name2,
        ok: false,
        detail: `can't be read (${e.message.slice(0, 100)})`
      });
      continue;
    }
    if (expected) {
      const sha = createHash9("sha256").update(text).digest("hex");
      if (!expected.has(sha)) {
        results.push({
          file: name2,
          ok: false,
          detail: `its sha256 (${sha.slice(0, 12)}) doesn't match what the evidence step wrote (${expected.size ? [...expected].map((h) => h.slice(0, 12)).join(", ") : "nothing it vouched for"}); not uploaded, so Tensile shows this evidence as unavailable`
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
    failed ? `${failed} of ${results.length} evidence file(s) not uploaded; Tensile shows that evidence as unavailable` : `${results.length} file(s) uploaded`,
    results
  );
}
var cell = (s) => s.replace(/[|\r\n]/g, " ");
function uploadSummary(o) {
  const lines4 = ["## Tensile evidence upload", "", `${o.reason}.`, ""];
  if (o.results.length) {
    lines4.push("| File | Result |", "| --- | --- |");
    for (const r of o.results) lines4.push(`| ${cell(r.file)} | ${r.ok ? "\u2713" : "\u2717"} ${cell(r.detail)} |`);
    lines4.push("");
  }
  return lines4.join("\n");
}
async function mainUpload(env, sink) {
  let o;
  try {
    o = await runUpload(env);
  } catch (e) {
    o = { ok: false, reason: `internal error: ${e.message}`, results: [] };
  }
  sink.log(`Tensile evidence upload: ${o.reason}`);
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

// src/step/work.ts
import { existsSync as existsSync4, readFileSync as readFileSync11, statSync as statSync3 } from "node:fs";
import { isAbsolute as isAbsolute6, resolve as resolve7 } from "node:path";
var SCOPE_MAX_FILES = 300;
function scopeFactsAt(repo, base3, head) {
  try {
    const files = git(repo, ["diff", "--name-only", "-z", "--no-renames", base3, head]).split("\0").filter(Boolean);
    const roots = readWorkspaces(repo, head).map((w) => w.root).slice(0, 500);
    const truncated = files.length > SCOPE_MAX_FILES;
    return { files: truncated ? [] : files, filesTruncated: truncated, packageRoots: roots };
  } catch {
    return void 0;
  }
}
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
  const p = isAbsolute6(src) ? src : resolve7(cwd, src);
  if (!existsSync4(p)) return null;
  const size = statSync3(p).size;
  if (size > MAX_MAP_BYTES2) throw new Error(`${size} bytes, over ${MAX_MAP_BYTES2}`);
  return readFileSync11(p);
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
    readFileSync11(isAbsolute6(input.durations) ? input.durations : resolve7(cwd, input.durations), "utf8"),
    repo
  ) : null;
  let history = [];
  const notes = [];
  if (input.history)
    try {
      history = parseHistory(
        readFileSync11(isAbsolute6(input.history) ? input.history : resolve7(cwd, input.history), "utf8")
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
    workflow: input.workflow ?? null,
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
  const scope = scopeFactsAt(repo, base3, head);
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
    timings,
    ...scope && { scope }
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
  return new Promise((resolve8, reject) => {
    const w = new Worker(new URL(import.meta.url), {
      workerData: { ...data2, gitDeadline: Date.now() + timeoutMs }
    });
    const timer = setTimeout(() => {
      reject(new Error(`timed out after ${timeoutMs / 1e3} s`));
      void w.terminate();
    }, timeoutMs);
    const done = () => clearTimeout(timer);
    w.once("message", (m) => {
      done();
      if (m.ok) resolve8(m.decision);
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
  if (typeof data.gitDeadline === "number") setGitDeadline(data.gitDeadline);
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
    if (env.STATE_isPost === "true") {
      const record = runPost(env, sink);
      await sendRecord(env, sink, record);
      if (record && env.STATE_decision)
        await runResultsAndOverride(env, sink, env.STATE_decision, { canEnforce: false });
    } else {
      sink.state?.("isPost", "true");
      if (phase === "select") await runSelectPhase(env, sink, { work: stepInWorker });
      else if (phase === "outcome") {
        const file = decisionPath(env);
        await sendRecord(env, sink, runOutcomePhase(env, sink, file));
        process.exitCode = await runResultsAndOverride(env, sink, file, { canEnforce: true });
      } else if (phase) {
        sink.warning(`input phase must be select or outcome, got ${JSON.stringify(phase)}; doing nothing`);
        process.exitCode = 1;
      } else await legacy(env, sink, evidence);
    }
  } catch (e) {
    process.stdout.write(`::error title=Tensile::${escapeCommand(e.message)}
`);
    process.exitCode = 1;
  }
  process.exit();
}
