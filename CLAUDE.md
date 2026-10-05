# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Yarn 4 workspaces + Turborepo, Node 20.19.6 (`.node-version`).

```sh
yarn build                         # turbo run build (tsc / vite) across all workspaces
yarn test                          # turbo run test (jest, depends on build)
yarn lint                          # turbo run lint (eslint)
yarn verify                        # build + test + lint — what the pre-push hook runs
yarn start                         # builds, then runs express + koa with nodemon/ts-node and front-end via serve
yarn turbo run <task> --filter=express   # scope any task to one workspace

yarn workspace express jest src/path/to/file.test.ts   # single test file
yarn workspace express jest -t "test name"             # single test by name
yarn workspace express load-test                       # k6 load test (src/load-tests/post-user.ts)
```

There are currently no test files; every `test` script uses `--passWithNoTests`. Jest config comes from `@app/jest-config` (ts-jest, `rootDir: src`).

Git hooks (husky): pre-commit runs lint-staged (eslint --fix + prettier on `*.ts`, sort-package-json); pre-push runs `turbo run verify`.

`docker-compose.yml` starts a local Postgres (nothing uses it yet). `docker-compose.load-test.yml` builds the image and runs k6 against it.

## Architecture

- `apps/express` — the only deployed service (Express 5). `apps/koa` is a parallel Koa implementation of the same server skeleton; `apps/front-end` is a standalone Vite + React app that doesn't use the shared packages.
- `packages/*` are internal libraries named `@app/*`:
  - `@app/config` — typed env var readers (`string`, `integer`, `boolean`, `oneOf`) that throw on missing/invalid values.
  - `@app/context` — `AsyncLocalStorage` request context holding `requestId`.
  - `@app/logger` — pino logger + pino-http middleware; a `mixin` injects the current `requestId` from `@app/context` into every log line.
  - `@app/tsconfig`, `@app/eslint-config`, `@app/jest-config` — shared configs each workspace extends.
- Shared packages resolve via `main: dist/index.js`, so they **must be built** before apps can import them (turbo's `^build` handles this for `build`/`start`/`test`; run `yarn build` before running an app any other way).
- Config is read at **module load time**: `@app/logger` reads `LOG_LEVEL`, `LOG_FORMAT`, `ENABLE_REQUEST_LOGGING` on import and throws if they're missing. That's why each app's `src/index.ts` calls `dotenv.config()` *before* importing anything from `@app/*` — keep that ordering. Copy `.env.example` to `.env` in an app to run it locally.
- Request flow in express (`src/server.ts`): Prometheus metrics (two `express-prom-bundle` instances — the second records a higher-resolution histogram as `http_request_highr_duration_seconds`; `/metrics` is exposed by the first) → JSON body → AsyncLocalStorage context → `x-request-id` (taken from header or generated, echoed back) → pino-http → routers → 404 → error handler (ZodError → 400, else 500). Route modules in `src/routes/` each export a `Router`; `resources.ts` holds deliberate CPU/memory/latency/error stress endpoints for testing autoscaling and observability.
- `src/index.ts` handles graceful shutdown via `http-terminator` on SIGTERM/SIGINT (pairs with the Helm `preStop` sleep).

ESLint enforces `simple-import-sort` with groups: side-effect → `node:` → packages → `@app/*` → absolute → parent → sibling. Unused vars/args must be prefixed `_`.

## Build & deployment

- The `Dockerfile` builds the whole monorepo and expects a `deps/` folder (gitignored) containing only the root yarn files and every workspace's `package.json`, for layer caching. Run `./copy-build-deps.sh` before `docker build`.
- The image is shared; the Helm chart picks the app via `container.command` (`node apps/express`).
- `apps/express/helm/` is the Helm chart (Deployment, Service, HPA, Traefik Ingress at `turbo-express.marc-lab.dev`, Prometheus `ServiceMonitor`). The image tag lives in `values-image.yaml`, separate from `values.yaml`, so CI can bump it alone.
- `.github/workflows/build-push-deploy.yml`: on push to `master`, builds and pushes to Harbor (`harbor.marc-lab.dev/library/turbo-playground`, tagged with SHA and `latest`), then commits the SHA into `values-image.yaml` as `github-actions[bot]`. ArgoCD (Application managed in the ArgoCD UI, not in this repo) auto-syncs that chart from `master`. Expect "Deploy turbo-express <sha>" commits on `master`; pull before pushing.
- `.github/workflows/test.yml` runs `yarn test` on pushes and PRs to `master`.
