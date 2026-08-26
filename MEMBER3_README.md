# Member 3: AI Prioritization Agent + Volunteer Matching

This module is responsible for clustering incoming disaster reports, scoring them via an AI Prioritization agent, and finding nearby volunteers with the right skills.

## Critical Design Principle
**AI is never the last call.** All AI calls are wrapped in an 8-second hard timeout. If the AI fails, times out, or returns a low-confidence result, the system automatically falls back to a transparent Rule-Based Fallback logic. These incidents are flagged with `needsHumanReview = true` so they never silently fail.

## Rule-Based Fallback Logic
If the AI is unavailable, the `priorityScore` (0-100) is calculated as follows:
- Up to 10 reports in the cluster: +3 points per report (Max 30)
- Presence of critical tags (`injury`, `trapped`, `medical`): +25 points
- User tapped the SOS Emergency button (`isEmergency = true`): +20 points
- More verified app sources than anonymous SMS sources: +15 points (else +5)
- Any unresolved report is older than 30 minutes: +15 points

## Setup

1. Add your OpenAI API key and Firebase Admin credentials to `ai-backend/.env`
2. Start the backend: `cd ai-backend && node src/server.js` (runs the 60-second clustering cron job)
3. Start the frontend: `cd volunteer-frontend && npm run dev`

## Testing the Pipeline
You can manually inject 3 clustered dummy reports into your Firestore database by running:
`cd ai-backend && node scripts/test-seed.js`
Then, watch the backend console. Within 60 seconds, it will cluster them into two distinct incidents, score them, and output the result.
