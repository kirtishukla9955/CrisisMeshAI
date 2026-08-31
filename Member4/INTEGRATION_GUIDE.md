# INTEGRATION_GUIDE.md — CrisisMesh Member 4 (Round 2)

## 1. Module Overview

This package contains Member 4's complete Round 2 module:

- **Authority Dashboard** (Command Center) — Top 3 Priority panel, Live
  Crisis Map integration boundary, Quick Report integration boundary,
  real-time Alerts Feed, sortable/searchable Incidents table
- **Human Review Queue** — auto-surfaces `needsHumanReview`, low/fallback
  confidence, and rule-based-fallback-scored incidents
- **Incident Detail** — AI Prioritization / Rule-Based Fallback
  explainability panel, raw reports, suggested-volunteer confirmation,
  timeline + audit log
- **Authority status actions** — validated 4-state transitions with a
  confirmation dialog on critical-incident resolution
- **Audit trail** — every mutation recorded as a `history` event
- **Post-Disaster AI Agent** — structured JSON report generation via
  Claude, 8-second timeout, deterministic rule-based fallback
- **Post-disaster report page** — period picker, canonical `insight_reports`
  rendering, browser print/export

Nothing here duplicates or replaces Member 1 (intake), Member 2 (map), or
Member 3 (prioritization/matching) — see `shared/DATA_CONTRACT.md` and the
"Member 4 Integration Boundaries" section in `README.md`.

## 2. Files to Copy

| My file | Destination in main project | Action |
|---|---|---|
| `frontend/authority/pages/*.jsx` | `src/pages/authority/` | Copy |
| `frontend/authority/components/*.jsx` | `src/components/authority/` | Copy |
| `frontend/authority/components/charts/CategoryBar.jsx` | `src/components/authority/charts/` | Copy |
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
| `backend/tests/*.test.js` | `server/tests/` (or wherever the main project keeps backend tests) | Copy |
| `ai/postDisasterAgent/*` | `server/ai/postDisasterAgent/` | Copy as-is (self-contained folder) |
| `shared/constants/statuses.js` | `shared/constants/` | Copy — canonical status/confidence/tag enums, other members should import from here |
| `shared/normalizeIncident.js` | `shared/` | Copy — **the** read-boundary adapter, must stay reachable from both frontend and backend relative paths |
| `shared/schemas/incidentSchema.js` | `shared/schemas/` | Copy (documentation only, no runtime effect) |
| `scripts/validate.js` | project root or `scripts/` | Copy — cross-platform static validation |
| `demo/seed-data/*` | `scripts/demo-seed/` (or similar, outside `src/`) | Copy — **never** ship in production build |
| `frontend/package.json` | n/a | **Do not copy as-is** — merge `dependencies`/`peerDependencies` into the main frontend `package.json`, then delete |
| `backend/package.json` | n/a | **Do not copy as-is** — merge `dependencies` into the main backend `package.json`, then delete |

**Path-sensitivity warning**: every frontend hook/service that imports
`shared/normalizeIncident.js` uses a relative path
(`../../../shared/normalizeIncident`). If the main project's folder depth
differs from this package's `frontend/authority/hooks/` → `shared/`
distance, update those import paths (or configure a build-tool alias)
after copying — don't just drop the files in and assume it resolves.

## 3. Existing Files That Must Be Modified

### `server/index.js` (or wherever Express app is bootstrapped)

**Why:** register Member 4's routes and mount the error handler.

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
own routes here. **Important:** `backend/services/firestoreService.js`
expects `admin.initializeApp()` to have already run before Member 4's
routes are hit. Confirm this happens once, early, in this same bootstrap
file — do not call `initializeApp()` a second time inside Member 4's files.

### Frontend router (e.g. `src/App.jsx` or `src/router.jsx`)

```jsx
// MEMBER 4 INTEGRATION START
import CommandCenterPage from './pages/authority/CommandCenterPage';
import IncidentDetailsPage from './pages/authority/IncidentDetailsPage';
import PostDisasterPage from './pages/authority/PostDisasterPage';

<Route path="/authority" element={
  <CommandCenterPage
    authority={authority}
    onOpenIncident={(id) => navigate(`/authority/incidents/${id}`)}
    onNavigate={(key) => navigate(`/authority/${key}`)}
    MapComponent={Member2LeafletMap}          // optional — see §12
    onOpenQuickReport={openMember1QuickReport} // optional — see §12
  />
} />
<Route path="/authority/incidents/:id" element={<IncidentDetailsPage ... />} />
<Route path="/authority/reports" element={<PostDisasterPage ... />} />
// MEMBER 4 INTEGRATION END
```

All three pages take navigation callbacks as props rather than importing a
specific router, so they drop into whatever routing setup the team picked.

### Global stylesheet / app root

```js
// MEMBER 4 INTEGRATION START
import './styles/authority-theme.css';
// MEMBER 4 INTEGRATION END
```

## 4. Dependencies

See `DEPENDENCIES.md` and the two manifests in this package
(`frontend/package.json`, `backend/package.json`) — reference manifests to
merge, not standalone apps to run.

```bash
npm install recharts lucide-react   # frontend — react/react-dom/firebase assumed already present
npm install firebase-admin express   # backend (skip whichever is already installed)
```

## 5. Environment Variables

Copy `ENV.example` to your real `.env` and fill in actual values. Never
commit the filled-in file.

## 6. Firestore

See `firestore/collections.md` (schema + ownership), `firestore/indexes.md`
(composite indexes Member 4's queries need), and
`firestore/security-rules-snippet.txt` (merge into the project's rules).

## 7. APIs to Register

- `GET/PATCH /api/incidents/*`, `POST /api/incidents/:id/notes`,
  `POST /api/incidents/:id/confirm-volunteer`,
  `GET /api/incidents/:id/history` — `backend/routes/incidentRoutes.js`
- `POST/GET /api/post-disaster/*` — `backend/routes/postDisasterRoutes.js`

Full docs in `API.md` — every endpoint listed there was diffed directly
against the route files during the Round 2 final audit, so it should match
exactly.

## 8. Firebase / Auth Configuration Required

- `firebase-admin` initialized once at server bootstrap (see §3)
- Authority accounts should carry a custom claim `{ role: "authority" }`
  (checked in `backend/middleware/authMiddleware.js`) — adjust that file's
  check if the main project's auth model differs
- Frontend must already have Firebase initialized before Member 4's
  `services/api.js` and the `hooks/*` files call `getAuth()`/`getFirestore()`

## 9. How the Frontend Connects to the Backend

`services/api.js` reads `VITE_API_BASE_URL` (default `/api`), attaches the
current Firebase Auth user's ID token as a Bearer token, and calls the
Express routes above for all writes. `hooks/useIncidents.js`,
`hooks/useIncident.js`, and `hooks/useAlertsFeed.js` additionally use
direct Firestore `onSnapshot` listeners for live reads — **every document
those listeners receive is passed through `shared/normalizeIncident.js`
client-side** before any component sees it, exactly mirroring what the
backend does for REST responses. This is the one rule every future Member
4 change must preserve: no component or hook may read a raw Firestore
document's fields directly.

## 10. How the Post-Disaster AI Agent Works

See `ai/postDisasterAgent/README.md` for the full pipeline.

## 11. How This Module Connects to the Other Three Members

See `shared/DATA_CONTRACT.md` and the "Member 4 Integration Boundaries"
section of `README.md`.

## 12. Wiring Up the Two Integration Boundaries

- **Live map**: pass Member 2's real map component as the `MapComponent`
  prop to `CommandCenterPage` (which forwards it to `LiveCrisisMap`). It
  must accept `{ incidents, onIncidentSelect }` — `incidents` is already
  normalized, `onIncidentSelect(incidentId)` should navigate to the detail
  page. Until wired, a clearly-labeled non-geographic placeholder renders
  instead.
- **Quick Report**: pass Member 1's report-intake opener as the
  `onOpenQuickReport` prop. Until wired, the panel shows a "not connected"
  state and does nothing on click — it never fakes a submission.

## 13. Integration Order

See `INTEGRATION_CHECKLIST.md` for the full step-by-step order. At a
glance: copy files → install dependencies → set env vars → register
backend routes → wire frontend routes → merge Firestore rules/indexes →
confirm Members 1–3's incident/report writes match
`shared/DATA_CONTRACT.md` → run `npm test` and `npm run check` → smoke
test manually in a browser (see `TESTING.md` for what that needs to cover,
since none of it has been done yet in this package).
