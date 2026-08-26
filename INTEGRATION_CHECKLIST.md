# INTEGRATION_CHECKLIST.md — Member 4

Work through in order. Check off as you go.

## Copy files
- [ ] Copy Member 4 frontend components (`frontend/authority/*` → main project's `src/`)
- [ ] Copy Member 4 backend routes/controllers/services/middleware/validators (`backend/*` → main project's `server/`)
- [ ] Copy `ai/postDisasterAgent/` as a self-contained folder
- [ ] Copy `shared/constants/statuses.js` and `shared/schemas/incidentSchema.js`
- [ ] Copy `demo/seed-data/` outside the production build path

## Register & configure
- [ ] Register API routes in the main server bootstrap (`app.use('/api/incidents', ...)`, `app.use('/api/post-disaster', ...)`)
- [ ] Mount `errorHandler` middleware after all routes
- [ ] Wire the three authority pages into the frontend router
- [ ] Import `styles/theme.css` once at the app root
- [ ] Add environment variables from `ENV.example` to the real `.env`
- [ ] Install dependencies (`recharts`, `firebase`, `firebase-admin` if not already present)

## Firestore
- [ ] Confirm `admin.initializeApp()` runs once, before Member 4's routes are hit
- [ ] Verify the existing `incidents` schema matches `shared/DATA_CONTRACT.md` (field names for severity, priorityScore, aiConfidence, location, locationLabel, category)
- [ ] Add composite indexes from `firestore/indexes.md`
- [ ] Merge `firestore/security-rules-snippet.txt` into the main rules file
- [ ] Set the `role: "authority"` custom claim on authority accounts (or adjust `authMiddleware.js` to match the existing auth model)

## Cross-team connections
- [ ] Confirm Member 1's reports carry `incidentId`, `source`, `reporterType`, `hasMedia`
- [ ] Confirm Member 2's incidents carry `location` and `locationLabel`
- [ ] Confirm Member 3's incidents carry `severity`, `priorityScore`, `aiConfidence`, `aiFallbackUsed`, `category`
- [ ] (Optional) Embed Member 2's Leaflet component in `IncidentDetailsPage.jsx` per §12 of `INTEGRATION_GUIDE.md`

## Functional tests (see TESTING.md for detail)
- [ ] Test status updates end-to-end, including the illegal-transition `409` case
- [ ] Test audit history renders after a status change
- [ ] Test AI report generation with a real `ANTHROPIC_API_KEY`
- [ ] Test AI fallback by removing/breaking the API key
- [ ] Test human review queue picks up low-confidence/fallback incidents
- [ ] Run through the full demo flow end-to-end (brief §36)

## Final pass
- [ ] No API keys committed or present in the frontend bundle
- [ ] Demo data clearly separated from any production seeding
- [ ] `node_modules`, `.env`, and build artifacts excluded from version control
