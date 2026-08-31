# DEPENDENCIES.md — Member 4 (Round 2)

## Frontend (`frontend/package.json`)

```bash
npm install recharts lucide-react
```

| Package | Why |
|---|---|
| `recharts` | The one chart on the post-disaster report page (incident count by area). Carried over from Round 1, unchanged. |
| `lucide-react` | **New in Round 2.** SVG icon set, used for the guide's required color+icon+text status pattern (every badge pairs a color with an icon and a text label, never color alone) instead of emoji. |

`react`, `react-dom`, and `firebase` are declared as `peerDependencies`,
not `dependencies` — the main project already installs these; adding a
second copy risks two React instances in the same bundle.

`frontend/package-lock.json` was regenerated via
`npm install --package-lock-only` after adding `lucide-react`, so it's
consistent with `package.json` — verified directly (grepped the lockfile
for `lucide-react` before and after regenerating).

## Backend (`backend/package.json`)

```bash
npm install firebase-admin express
```

| Package | Why |
|---|---|
| `firebase-admin` | Firestore/Auth server SDK. Check the main project's `package.json` first — don't install a second, conflicting version. |
| `express` | Already required by the project's chosen backend stack. |

No AI SDK package — `ai/postDisasterAgent/agent.js` calls the Anthropic
API directly via Node's built-in global `fetch` (Node 18+), avoiding an
extra dependency.

**Tests add zero new dependencies.** `backend/tests/*.test.js` use Node's
built-in `node:test` and `node:assert/strict` modules exclusively — no
Jest, Mocha, or any other test framework was installed.

## Nothing else

No PDF library — the post-disaster report's export feature uses the
browser's native print-to-PDF (`window.print()` + a print stylesheet in
`theme.css`), not a new dependency.

## Known issue: npm audit warnings

`npm install --package-lock-only` reported pre-existing moderate/high
severity advisories in transitive dependencies (mostly from
`firebase-admin`'s and the dev tooling's dependency trees) when
regenerating both lockfiles. These are not new — they existed in the
originally-uploaded `package-lock.json` files before any Member 4 changes,
and running `npm audit fix --force` was deliberately **not** attempted
here, since that can introduce breaking version bumps without a live
environment to test them in. Whoever integrates this should run
`npm audit` in their own environment and decide whether to address them
before shipping.
