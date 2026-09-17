# TODO: Automations & Improvements

Prioritized list of potential improvements. Feasibility is assessed based on current stack (React + Vite + Vercel Serverless + MongoDB). Season is live — anything marked High/Now is safe to ship incrementally.

---

## High Priority / Feasible Now (no external services needed)

These require only frontend/backend changes within the existing codebase.

### 1. Auto-increment episode number in Create Questionnaire
**Status: DONE** (implemented in `feature/improvements-sept-2026`)
Admin used to type the episode number manually each week. Now it auto-populates with `max existing episode + 1` when the Create Questionnaire view is opened. Admin still overrides if needed.

### 2. Leaderboard CSV export
**Status: DONE** (implemented in `feature/improvements-sept-2026`)
"Export CSV" button added to the leaderboard header. Downloads a ranked list (Rank, Player, Points) as a `.csv` file. No server changes needed — pure client-side Blob download.

### 3. Contestant pick count badge on Cast Editor
**Status: DONE** (implemented in `feature/improvements-sept-2026`)
Each contestant in the Edit Cast panel now shows a small amber badge with their pick count (e.g., "3 picks"). Helps admin understand stakes before eliminating someone.

### 4. Pickers displayed in Episode Scoring panel
**Status: ALREADY EXISTS** (was already implemented before this branch)
Each contestant card in episode scoring already shows "Picked by: PlayerA (instinct) · PlayerB (final)".

### 5. Admin action log viewer
The app already stores actions in `adminActionLog` MongoDB key (password resets, etc.). A simple read-only list view in Admin Panel would surface this data without any schema changes.
- Estimated effort: 1–2 hours
- Implementation: Add a new `adminView === 'action-log'` panel that reads `adminActionLog` and renders a table

### 6. Contestant pick count visible on Cast Editor (elimination confirmation)
**Status: DONE** — see item #3 above.

### 7. Inline questionnaire draft autosave
When admin is building a questionnaire, the current form state is lost if they navigate away. Autosave to `localStorage` every 30 seconds would prevent data loss.
- Estimated effort: 1–2 hours
- Key: `qDraft_leagueId` in localStorage; restore on view entry; clear on submit or cancel

### 8. Show player pick counts on Phase Control picks-status panel
The phase control already shows who has/hasn't picked. Adding instinct pick count vs final pick count as separate columns would make the pre-merge tracking cleaner.
- Estimated effort: 30 min — the data is already there in the `picks` array

### 9. Score release preview: show point deltas next to player names
Currently the score release preview shows each player's total new score. Showing the delta (+X this week) alongside would make it easier to spot errors before releasing.
- Estimated effort: 1 hour — calculate delta = (new score) - (current score) in the preview step

### 10. Episode scoring history viewer
Admin can re-score but there's no way to see all past episode scores for a contestant at a glance. A simple expandable history in Episode Scoring would help catch scoring mistakes.
- Estimated effort: 2–3 hours — read `pickScores` filtered by contestant/episode

---

## Medium Priority / Needs External Service

These are valuable but require integrating a third-party service.

### Email notifications on score release
Send an email to all players when scores are posted instead of relying on in-app Tree Mail.
- Service needed: SendGrid (free tier: 100 emails/day, plenty for 9 players)
- Vercel integration: add `SENDGRID_API_KEY` to env, call from `releaseScores` handler
- Template: "Week X scores are posted! You earned Y points. Check the leaderboard."
- Blocker: requires players to provide email addresses (currently optional via Google OAuth only)

### SMS reminders before questionnaire deadline
Automated text on Wednesday at 6 PM EST reminding players who haven't submitted yet.
- Service needed: Twilio (programmable SMS, ~$0.01/message)
- Implementation: Vercel cron job at 6 PM EST Wednesdays; check who hasn't submitted; send SMS
- Blocker: requires collecting phone numbers from players; GDPR-adjacent privacy consideration

### PWA push notifications
True push notifications (even when app is closed) for score releases and new questionnaires.
- Service needed: Web Push API + VAPID keys (free, no third party required), but needs a service worker
- Current state: App already has PWA support (`manifest.json`, icons); service worker is the missing piece
- Effort: Medium-high; requires service worker registration, push subscription management, server-side push sending
- Alternative: current Tree Mail + banner system works adequately for a small group

---

## Not Feasible / Won't Do

### Auto-score episode results
Would require the app to "know" what happened in the episode. There's no official Survivor data API. Manual scoring by admin (who has watched the episode) is the only reliable approach.

### Automatic contestant photo fetching
Survivor Wiki and CBS images are under copyright. Scraping or auto-fetching them would be legally risky. Drag-and-drop upload in Cast Editor is the correct solution.

### Live episode results feed
No real-time feed exists for Survivor episode results. This would require integrating an unofficial third-party service that itself scrapes CBS or Wikipedia — fragile and risky.

### Automatic pick scoring based on episode result
Related to "auto-score episode results" above. Without a reliable data source, this isn't feasible.

---

## Major App Improvements (longer-term)

These are worthwhile but larger in scope. Best addressed between seasons.

### Real-time leaderboard updates (polling every 60s)
Currently the leaderboard only refreshes on page load or tab switch. Adding a 60-second polling interval on the leaderboard tab would keep scores current without a full reload.
- Effort: Medium — add a `setInterval` in a `useEffect` for the leaderboard tab; re-fetch `playerScores` and `pickScores`

### Player comparison modal
Clicking a player on the leaderboard could open a side-by-side comparison: their picks vs yours, questionnaire scores by episode, pick score breakdown.
- Effort: Medium — all data is available; UI work is the primary task

### Historical season stats comparison
After multiple seasons, players will want to see who has performed best across seasons. The `seasonHistory` key already stores archived data.
- Effort: High — requires a new view that reads and aggregates `seasonHistory`; data format may vary between seasons

### Export end-of-season to PDF
A shareable PDF with the final leaderboard, pick results, and fun stats.
- Effort: Medium — use a client-side library like `jsPDF` or `html2canvas`; no server changes needed
- Alternative: The existing CSV export covers the leaderboard; a PDF would add pick history and fun stats

### Admin mobile UX improvements
The Admin Panel is information-dense and was designed desktop-first. On mobile, some panels (Episode Scoring, Score Questionnaire) require significant horizontal scrolling.
- Effort: High — requires redesigning those panels with mobile-first layouts; many tables would become card lists

### Episode recap auto-generation with AI (Claude API)
After scoring an episode, automatically generate a narrative recap ("This week, Tyler's pick Dee won immunity...") using the Claude API.
- Effort: Medium — add a Vercel serverless function that calls Claude API with episode scoring data as context; display in a new "Recaps" tab
- Cost: Very low for 9 players (~500 tokens per episode recap)
- Reference: See `docs/claude-api-reference.md` if added, or `CLAUDE.md` API section
