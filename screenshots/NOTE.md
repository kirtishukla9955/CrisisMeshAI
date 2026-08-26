# screenshots/ — NOTE

This folder is intentionally empty in the delivered package.

Capturing real screenshots requires a running instance of the integrated
app (React dev server + a live Firebase project + actual incident/report
data) rendered in a browser. The environment this package was built in has
no browser and no live Firebase project, so any "screenshot" produced here
would have to be fabricated — which would misrepresent what's actually been
built and tested.

## What to capture once the module is running (for the team's demo deck)

1. **Command Center** — full dashboard with KPI tiles and priority queue populated (use `demo/seed-data/` if no real data exists yet)
2. **Incident Details** — an open critical incident showing priority score, AI confidence, and the action panel
3. **Human Review Queue** — at least one low-confidence or fallback-scored incident visible
4. **Post-Disaster AI Report** — a generated report showing the executive summary and hardest-hit areas
5. **AI Loading State** — the multi-stage "Analyzing incident history…" sequence mid-animation
6. **AI Failure/Fallback State** — trigger by unsetting `ANTHROPIC_API_KEY` temporarily, then generate a report and capture the "Rule-Based Fallback" badge

Suggested tool: your browser's built-in screenshot capture, or `cmd+shift+4`
(Mac) / Snipping Tool (Windows) once `npm run dev` is up. Save as PNG,
named to match the list above (e.g. `01-command-center.png`).
