# INTEGRATION_GUIDE.md — CrisisMesh Member 4

## 1. Module Overview

This package contains Member 4's complete module for CrisisMesh AI:

- **Authority Dashboard** — Command Center, Priority Queue, Human Review Queue
- **Incident Management** — incident detail view, raw reports, timeline
- **Status Update API** — validated status transitions with confirmation on critical actions
- **Human Review Queue** — auto-surfaces low-confidence / fallback-scored incidents
- **AI Confidence Display** — every AI output shows confidence + fallback state
- **Audit History** — full traceable log of every authority action
- **Post-Disaster AI Agent** — structured JSON report generation via Claude API
- **Rule-based fallback** — deterministic report generator if the AI call fails
- **Report analytics** — severity/category/response-time charts

Nothing here duplicates or replaces Member 1 (intake), Member 2 (map), or
Member 3 (prioritization/matching) — see `shared/DATA_CONTRACT.md` for the
exact boundary.

## 2. Files to Copy

| My file | Destination in main project | Action |
|---|---|---|
| `frontend/authority/pages/*.jsx` | `src/pages/authority/` | Copy |
| `frontend/authority/components/*.jsx` | `src/components/authority/` | Copy |
| `frontend/authority/components/charts/*.jsx` | `src/components/authority/charts/` | Copy |
| `frontend/authority/services/*.js` | `src/services/authority/` | Copy |
| `frontend/authority/hooks/*.js` | `src/hooks/authority/` | Copy |
| `frontend/authority/utils/*.js` | `src/utils/authority/` | Copy |
| `frontend/authority/styles/theme.css` | `src/styles/authority-theme.css` | Copy, then `import` once in your app root |
| `backend/routes/*.js` | `server/routes/` | Copy |
| `backend/controllers/*.js` | `server/controllers/` | Copy |
| `backend/services/*.js` | `server/services/` | Copy (merge `firestoreService.js` if one already exists — see §3) |
| `backend/middleware/*.js` | `server/middleware/` | Copy |
| `backend/validators/*.js` | `server/validators/` | Copy |
| `backend/utils/httpErrors.js` | `server/utils/` | Copy |
| `ai/postDisasterAgent/*` | `server/ai/postDisasterAgent/` | Copy as-is (self-contained folder) |
| `shared/constants/statuses.js` | `shared/constants/` (or wherever the monorepo keeps cross-module constants) | Copy — this is the canonical status enum, other members should import from here |
| `shared/schemas/incidentSchema.js` | `shared/schemas/` | Copy (documentation only, no runtime effect) |
| `demo/seed-data/*` | `scripts/demo-seed/` (or similar, outside `src/`) | Copy — **never** ship in production build |
| `frontend/package.json` | n/a | **Do not copy as-is** — merge its `dependencies`/`peerDependencies` into the main frontend `package.json`, then delete |
| `backend/package.json` | n/a | **Do not copy as-is** — merge its `dependencies` into the main backend `package.json`, then delete |

Adjust destination paths to match the exact folder layout Members 1–3 have
already established; the table above assumes a fairly standard
`src/` (frontend) + `server/` (backend) split as implied by the project's
tech stack.

## 3. Existing Files That Must Be Modified

### `server/index.js` (or wherever Express app is bootstrapped)

**Why:** register Member 4's routes and mount the error handler.

**What to add:**
```js
// MEMBER 4 INTEGRATION START
const incidentRoutes = require('./routes/incidentRoutes');
const postDisasterRoutes = require('./routes/postDisasterRoutes');
const { errorHandler } = require('./middleware/errorHandler');

app.use('/api/incidents', incidentRoutes);
app.use('/api/post-disaster', postDisasterRoutes);
// mount AFTER all routes, including Members 1-3's:
app.use(errorHandler);
// MEMBER 4 INTEGRATION END
```

Do not overwrite the whole file — Members 1–3 likely already mount their
own routes here. Add these lines alongside theirs.

**Important:** `backend/services/firestoreService.js` expects
`admin.initializeApp()` to have already run before Member 4's routes are
hit. Confirm this happens once, early, in this same bootstrap file (or
wherever the project currently initializes Firebase Admin) — do not call
`initializeApp()` a second time inside Member 4's files.

### Frontend router (e.g. `src/App.jsx` or `src/router.jsx`)

**Why:** wire up the three authority pages.

**What to add:**
```jsx
// MEMBER 4 INTEGRATION START
import CommandCenterPage from './pages/authority/CommandCenterPage';
import IncidentDetailsPage from './pages/authority/IncidentDetailsPage';
import PostDisasterPage from './pages/authority/PostDisasterPage';

// Example with react-router — adapt to whatever router the project uses:
<Route path="/authority" element={<CommandCenterPage authority={authority} onOpenIncident={...} onNavigate={...} />} />
<Route path="/authority/incidents/:id" element={<IncidentDetailsPage ... />} />
<Route path="/authority/reports" element={<PostDisasterPage ... />} />
// MEMBER 4 INTEGRATION END
```

The three pages are intentionally router-agnostic — they take `onNavigate` /
`onOpenIncident` / `onBack` callbacks as props rather than importing a
specific router, so they drop into whatever routing setup (React Router,
Next.js, plain state-based navigation) the team already picked.

### Global stylesheet / app root

**Why:** load the design tokens used by every Member 4 component.

**What to add:**
```js
// MEMBER 4 INTEGRATION START
import './styles/authority-theme.css';
// MEMBER 4 INTEGRATION END
```

## 4. Dependencies

See `DEPENDENCIES.md`, and the two manifests included in this package:
`frontend/package.json` and `backend/package.json`. These are **reference
manifests documenting what this slice needs** — merge their
`dependencies`/`peerDependencies` entries into the main project's existing
`package.json` files rather than running `npm install` against them
directly (there's no build config or server entry file here, by design —
this isn't meant to run standalone).

```bash
npm install recharts                       # frontend — react/react-dom/firebase assumed already present
npm install firebase-admin express          # backend (skip whichever is already installed)
```

## 5. Environment Variables

Copy `ENV.example` to your real `.env` and fill in actual values — see
`ENV.example` for the full list (`ANTHROPIC_API_KEY`,
`FIREBASE_PROJECT_ID`, etc.). Never commit the filled-in file.

## 6. Firestore

See `firestore/collections.md` for the full schema and ownership table,
`firestore/indexes.md` for the composite indexes Member 4's queries need,
and `firestore/security-rules-snippet.txt` to merge into the project's
rules file.

## 7. APIs to Register

- `POST/GET/PATCH /api/incidents/*` — `backend/routes/incidentRoutes.js`
- `POST/GET /api/post-disaster/*` — `backend/routes/postDisasterRoutes.js`

Full docs in `API.md`.

## 8. Firebase / Auth Configuration Required

- `firebase-admin` initialized once at server bootstrap (see §3)
- Authority accounts should carry a custom claim `{ role: "authority" }`
  (checked in `backend/middleware/authMiddleware.js`). If the main project's
  auth model doesn't use custom claims yet, either add one during authority
  onboarding or simplify the middleware's role check — flagged clearly in
  that file with a comment.
- Frontend must already have Firebase initialized (`firebase/app`) before
  Member 4's `services/api.js`, `hooks/useIncidents.js`, etc. call
  `getAuth()` / `getFirestore()`.

## 9. How the Frontend Connects to the Backend

`frontend/authority/services/api.js` reads `VITE_API_BASE_URL` (default
`/api`), attaches the current Firebase Auth user's ID token as a Bearer
token, and calls the Express routes above. `incidentService.js` and
`reportService.js` wrap that for incident/report operations respectively.
The Command Center and incident detail pages additionally use direct
Firestore `onSnapshot` listeners (`hooks/useIncidents.js`,
`hooks/useIncident.js`) for live updates, rather than polling the REST API —
writes still go through the REST API so validation/audit logging happens
server-side.

## 10. How the Post-Disaster AI Agent Works

See `ai/postDisasterAgent/README.md` for the full pipeline (input →
preprocessing → prompt → structured output → validation → fallback →
storage → frontend consumption).

## 11. How This Module Connects to the Other Three Members

See `shared/DATA_CONTRACT.md` — the authoritative list of exactly which
incident fields Member 4 reads from Members 1–3, and which fields Member 4
produces for the rest of the app.

## 12. Optional: Map Embed in Incident Detail

The brief asks that the incident detail page show the incident's location
on a Leaflet map "if map integration already exists," without rebuilding
Member 2's module. `IncidentDetailsPage.jsx` currently renders coordinates
as text in the `Field` component. To embed Member 2's map component instead,
replace that block with Member 2's existing `<CrisisMap incidents={[incident]} />`
(or equivalent) — pass just the single incident so it renders one pin.

## 13. Integration Order

See `INTEGRATION_CHECKLIST.md` for the step-by-step order, but at a glance:
copy files → install dependencies → set env vars → register backend routes
→ wire frontend routes → merge Firestore rules/indexes → confirm
Members 1-3's incident writes match the field names in
`shared/DATA_CONTRACT.md` → smoke test (see `TESTING.md`).
