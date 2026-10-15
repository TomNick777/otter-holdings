# PROJECT STATE

Product: frozen portfolio demonstration with independently authored simulation.

## Isometric design edition — 2026-10-15

- IMPLEMENTED: separate `/isometric/` static entry preserving the original SVG campus, cream palette, navigation and overview layout. Two independently authored fictional account snapshots replace all private inputs. No original runtime, API, database or financial records are included.
- IMPLEMENTED: account selection, building/cash inspection, keyboard activation, valuation breakdown with native modal focus handling, and explicit unknown history/performance. Amount aggregation reuses the domain valuation function; the renderer consumes application output. The original SVG relative-value height mapping is disclosed separately from the quantity-driven Three.js edition.
- TESTED: TypeScript check, 18/18 existing behavior tests, both-entry static build and public-file audit passed. The original city remains the root entry and links to the separate design edition.
- RUNTIME VERIFIED (local): project-subpath rendering, building keyboard selection, cash inspection, account switching and valuation dialog; responsive 390×844 viewport has no horizontal document overflow. Public hosting of this addition is pending deployment at this checkpoint.
- Scope: owner-requested additional design presentation; original financial application remains archived. No account-connected capabilities were resumed.

## Current scope

- IMPLEMENTED: Three.js investment city, six-account selection, stable asset lots, quantity timeline, current asset workspace and project explanation.
- IMPLEMENTED: independent synthetic account/quantity/quote input; domain decimal valuation and XIRR / Modified Dietz / strict TWR.
- TESTED: typecheck, 18/18 behavior tests, static build and publication-boundary scan pass on 2026-10-12 (Asia/Shanghai). The export contains 38 reviewed source/doc files and five generated static assets before Git initialization.
- RUNTIME VERIFIED: desktop rendering, twelve current buildings, account/asset selection, asset navigation, month/year replay, pause/speed/keyboard seek, and project explanation. Mobile 390×844 viewport has no document overflow; tables scroll within their container.
- RUNTIME VERIFIED: static assets run under the project subpath; there is no financial service or database. The obsolete Three.js shadow setting was replaced with the current PCF setting.
- TESTED: a fresh Git clone installs with the frozen lockfile and passes typecheck, 18/18 tests, build and public-file audit without original-project dependencies.
- RUNTIME VERIFIED: the hosted Demo renders twelve current buildings and opens the asset workspace; the hosted origin has no browser errors or warnings in the observed session.
- Published: [GitHub source](https://github.com/TomNick777/otter-holdings), [static Demo](https://tomnick777.github.io/otter-holdings/). First Linux CI + Pages deployment passed for source checkpoint `32eceff` ([workflow evidence](https://github.com/TomNick777/otter-holdings/actions/runs/38202394696)).
- Release scope is complete and frozen. Subsequent documentation checkpoints do not change the verified application build.

## Boundaries

- No financial account connection, database, private documents, real financial records or inherited Git history.
- Unknown values remain null; current valuations are not reused as historical quantities or returns.
- Source, tests, documentation and static Demo are released together. MIT license selected by the owner.
- Public scope is frozen. No new financial capabilities are planned.

## Commands

Node.js 24+, pnpm 11.7.0. `pnpm install --frozen-lockfile`, then `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm audit:public`.

`pnpm dev` builds and serves locally; `pnpm preview` serves the existing static build. Neither starts a database or financial service.

## Known limits

- Fixed demonstration window: 2025-01-01 through 2025-09-20.
- Account charts represent simulated position market values; cash is separately displayed.
- Building heights represent per-instrument quantity changes, not cross-asset monetary comparisons.
- Public-boundary scanning is a guard; newly added data and images still require source review.
- WebGL-unavailable and system reduced-motion behavior are implemented; forced runtime verification of those environment modes is UNKNOWN.
