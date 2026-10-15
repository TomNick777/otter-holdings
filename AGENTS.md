# Otter Holdings Public Edition

- Communicate with the owner in Simplified Chinese. Keep code and technical identifiers in English.
- This repository is a frozen portfolio demonstration. Do not expand it into an account-connected financial service.
- Publish only independently authored simulation. Never add account records, statements, private identifiers, database copies, real screenshots, old Git history or local absolute paths.
- `src/domain` owns financial calculations and quantity replay. `src/application` prepares display models. `src/web` renders models; it does not redefine financial completeness.
- Unknown amounts and quantities stay `null`; an available subtotal must not claim completeness.
- Geometry depends on supplied quantity and fixed instrument scale. Never infer transactions from ending balances or quotes.
- The separately requested SVG isometric edition is a snapshot design study. Its original relative-market-value height mapping is disclosed in its UI; do not confuse it with the quantity-driven Three.js city or infer transaction history from either.
- Protect pre-existing changes. Stage explicit paths only; review staged contents before committing.
- Run `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm audit:public` for source changes. Inspect affected desktop/mobile UI when changing presentation.
- No database, Electron, Evidence, provider account, external font or backend is needed to run the demonstration.
- `PROJECT_STATE.md` is the sole current state entry. Update it with actual evidence and ship it alongside the corresponding change.
