# INTEGRATION_CHECKLIST.md — Member 4 (Round 2)

## Copy files
- [ ] Copy Member 4 frontend (`frontend/authority/*` → main project's `src/`)
- [ ] Copy Member 4 backend (`backend/*` → main project's `server/`)
- [ ] Copy `backend/tests/*` alongside wherever the main project keeps backend tests
- [ ] Copy `ai/postDisasterAgent/` as a self-contained folder
- [ ] Copy `shared/constants/statuses.js`, `shared/normalizeIncident.js`, `shared/schemas/incidentSchema.js`
- [ ] Copy `scripts/validate.js`
- [ ] Copy `demo/seed-data/` outside the production build path
- [ ] **Fix relative import paths** from `frontend/authority/hooks/*.js` to `shared/normalizeIncident.js` if the main project's folder depth differs (see INTEGRATION_GUIDE.md §2)

## Register & configure
- [ ] Register API routes (`/api/incidents`, `/api/post-disaster`) in the main server bootstrap
- [ ] Mount `errorHandler` middleware after all routes
- [ ] Wire the three authority pages into the frontend router, passing `MapComponent` and `onOpenQuickReport` if available
- [ ] Import `styles/theme.css` once at the app root
- [ ] Add environment variables from `ENV.example` to the real `.env`
- [ ] Install dependencies (`recharts`, `lucide-react`, `firebase`, `firebase-admin`, `express` if not already present)

## Firestore
- [ ] Confirm `admin.initializeApp()` runs once, before Member 4's routes are hit
- [ ] Verify Member 3's actual `incidents` writes match the canonical shape in `shared/DATA_CONTRACT.md` (`centerLocation`, `primaryTag`, `confidence` as a string enum, `scoringMethod`, `needsHumanReview`, `suggestedVolunteers`)
- [ ] Verify Member 1's actual `reports` writes match (`reportId`, no `incidentId` FK, `tag`, `mediaUrls`, `createdAt`)
- [ ] Add composite indexes from `firestore/indexes.md`
- [ ] Merge `firestore/security-rules-snippet.txt` into the main rules file
- [ ] Set the `role: "authority"` custom claim on authority accounts (or adjust `authMiddleware.js`)

## Cross-team connections
- [ ] Confirm the live map component is available to pass as `MapComponent`
- [ ] Confirm Member 1's quick-report opener is available to pass as `onOpenQuickReport`
- [ ] Confirm `volunteers` collection is populated so `suggestedVolunteerDetails` resolves to real data

## Verification (see TESTING.md for full detail)
- [ ] `cd backend && npm install && npm test` — should show 44/44 passing
- [ ] `npm run check` (`scripts/validate.js`) — should exit 0
- [ ] Seed demo data against a real (ideally emulator) Firebase project and confirm it appears
- [ ] Hit every endpoint in `API.md` with a real auth token
- [ ] Generate a post-disaster report with a real `ANTHROPIC_API_KEY` set, confirm `generatedBy: "ai"`
- [ ] Remove the key, confirm it falls back to `generatedBy: "rule_based_fallback"` cleanly
- [ ] Open the dashboard in an actual browser and run the full demo flow end-to-end
- [ ] Check responsive behavior at real tablet/mobile widths
- [ ] Check keyboard navigation and focus order

## Final pass
- [ ] No API keys committed or present in the frontend bundle
- [ ] Demo data clearly separated from production seeding
- [ ] `node_modules`, `.env`, and build artifacts excluded from version control
