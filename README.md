# Tensile CI step (built distribution)

The built GitHub Action for [Tensile](https://www.npmjs.com/package/tensile-ci): one step in your existing CI that
selects the tests a change can affect (failing closed to the full suite), records evidence for Tensile's shadow
reports, and uploads results to the Tensile service. This repository contains only the compiled action; it is
published automatically and is not the place for issues or changes.

```yaml
- uses: rsyed94/tensile-action@v1
```

The node:test coverage recorder is at `rsyed94/tensile-action/node-test@v1`.

Bundled third-party components keep their own licenses (see `dist/*.LICENSE`).
