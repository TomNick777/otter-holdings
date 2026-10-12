# PROJECT STATE

Product: frozen portfolio demonstration with independently authored simulation.

## Current scope

- IMPLEMENTED: Three.js investment city, six-account selection, stable asset lots, quantity timeline, current asset workspace and project explanation.
- IMPLEMENTED: independent synthetic account/quantity/quote input; domain decimal valuation and XIRR / Modified Dietz / strict TWR.
- TESTED: typecheck, 18/18 behavior tests, static build and publication-boundary scan pass on 2026-10-12 (Asia/Shanghai). The export contains 38 reviewed source/doc files and five generated static assets before Git initialization.
- RUNTIME VERIFIED: desktop rendering, twelve current buildings, account/asset selection, asset navigation, month/year replay, pause/speed/keyboard seek, and project explanation. Mobile 390×844 viewport has no document overflow; tables scroll within their container.
- RUNTIME VERIFIED: static assets run under the project subpath; there is no financial service or database. The obsolete Three.js shadow setting was replaced with the current PCF setting.
- Clean-clone verification: pending final verification.
- GitHub publication / hosted Demo: pending final verification.

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
