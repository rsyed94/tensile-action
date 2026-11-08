# Tensile CI step (built distribution)

The built GitHub Action for [Tensile](https://www.npmjs.com/package/tensile-ci), the delivery control plane for
agent-written code: one step in your existing CI that selects the tests a change can affect (failing closed to the
full suite), records evidence for Tensile's shadow reports, and uploads results to the Tensile service.

```yaml
- id: tensile
  uses: rsyed94/tensile-action@v1
  with:
    phase: select
    runner: vitest # vitest | jest | node-test | pytest
```

The node:test coverage recorder is at `rsyed94/tensile-action/node-test@v1`.

**Docs:** https://jiffy-app-production.up.railway.app/docs/install

## Versions

- `v1` moves to the newest 1.x release.
- `v1.2.3` tags never move. Pin one, or its commit, for a fixed version.

Each release is one commit here, built from a tagged commit of the Tensile source, checked (every runtime file
present, no secrets, no build-machine paths) and smoke-run before it is published. This repository contains only
the compiled action and is published automatically; it isn't the place for issues or changes.

Bundled third-party components keep their own licenses (see `dist/*.LICENSE`).
