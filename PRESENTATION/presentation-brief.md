# Presentation Brief for Claude

## Your Task
Create a **6–8 slide presentation** (designed to fill about 10 minutes of speaking time) about building a full-stack web application using Claude Code as the primary development partner. The presenter is Joshua — a non-professional developer who built a real, live, production application with his friends as the users, using AI coding assistance as the engine.

The tone should be **personal, honest, and genuinely impressive** — not a sales pitch for AI, but a real story of what it's actually like to build something serious with Claude Code. Think TED Talk energy meets engineering post-mortem.

---

## Slide Format Instructions
For each slide, provide:
- **Slide title** (punchy, not corporate)
- **Headline** (the one sentence that stays in the audience's mind)
- **3–5 bullet points or a short paragraph** of speaker notes / talking points
- **Visual suggestion** (what the slide should look like — image, diagram, screenshot concept, color palette)
- **Design direction**: Dark theme throughout. Use deep navy, charcoal black, amber/gold accents, and touches of Survivor-red. Fonts should feel modern and slightly dramatic — think cinematic, not startup pitch deck.

---

## Context: The Project

**What was built:** Survivor Fantasy League App — a full-stack web app where 9 friends compete in a fantasy game based on the CBS TV show *Survivor*. Players make pre-season contestant picks, answer weekly prediction questionnaires, compete in Wordle challenges, purchase in-game advantages (like stealing points from opponents), and track their standing on a live leaderboard throughout the season.

**Who built it:** Joshua, who is not a professional software engineer. He had some coding background but had never built a full production web application with real users, real authentication, real database operations, and real money implications (well, bragging rights — but those count).

**Timeline:** Built starting December 2024, continuously iterated through February 2026, with Season 51 of the show launching September 23, 2026. The app has been live and used in production by real players for multiple seasons.

**Why it matters:** This is not a tutorial project. This app handles real login sessions, real JWT authentication with refresh tokens, real MongoDB Atlas reads/writes on every user action, a real serverless backend on Vercel, and real complexity — a single app.jsx file that grew to over 11,000 lines managing dozens of interconnected game states. It works. It's been stress-tested by actual users on their phones. It has auto-backups, rate limiting, Google OAuth, a Progressive Web App manifest for installing on phones, and an admin panel that Joshua uses live during episodes to score picks, release questionnaire results, and manage the game.

---

## Tech Stack (use exactly these)
- **Frontend:** React 18 + Vite
- **Styling:** TailwindCSS (utility-first, no custom CSS files)
- **Backend:** Vercel Serverless Functions (Node.js) — no dedicated server, functions spin up on demand
- **Database:** MongoDB Atlas (cloud-hosted, key-value document store pattern)
- **Authentication:** JWT tokens (access token in memory, refresh token in httpOnly cookie) + Google OAuth
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **AI Integration:** Google Gemini 1.5 Flash (for auto-suggesting questionnaire questions and AI-powered episode recaps)
- **Deployment:** Vercel (auto-deploys from GitHub `main` branch push — 2 minutes from commit to live)
- **PWA:** Progressive Web App — installable on iPhone and Android as a home screen app
- **Development Tool:** Claude Code (Anthropic's CLI coding assistant) — the central thesis of this presentation

---

## The Claude Code Angle (this is the heart of the presentation)

Claude Code is Anthropic's official CLI tool that runs in your terminal and acts as an AI coding partner. It can read files, write files, run shell commands, search the codebase, run builds, and iteratively fix its own errors — all in conversation.

**How Joshua actually used it:**
- Described features in plain English ("I want players to be able to steal another player's purchased advantage") and Claude Code designed, implemented, and wired up the entire feature end-to-end
- Caught and fixed React Rules of Hooks violations that were causing crash screens in production
- Navigated an 11,000+ line monolith confidently — knowing which line to edit in which file for any given change
- Ran `npm run build` to catch TypeErrors before deploying, then fixed them automatically
- Maintained CLAUDE.md — a detailed living documentation file checked into the repo that gave Claude persistent context about the app's architecture, design decisions, known quirks, and rules
- Used parallel sub-agents (the Agent tool) to split large features into simultaneous workstreams — e.g., one agent researching the codebase while another drafted the implementation
- Deployed exclusively to production for real testing (Vercel serverless functions can't run locally), which meant Claude Code had to write correct code on the first meaningful try

**The constraint that shaped everything:**
The Vite local dev server cannot run Vercel serverless functions. This means all API calls (auth, database reads/writes, advantage operations) only work in production. Every significant feature had to be built, committed, pushed to GitHub, and verified on the live site with real users potentially watching. This forced both Joshua and Claude Code to be precise, to think through edge cases before shipping, and to rely on `npm run build` passing as a minimum bar before any commit.

**The CLAUDE.md file:**
One of the most important decisions was maintaining a detailed `CLAUDE.md` file in the repository root — essentially a living technical spec that Claude Code reads at the start of every conversation. It covers the full architecture, every feature, every design decision (including WHY certain decisions were made, like why the iOS PWA status bar is set to `"black"` instead of `"black-translucent"`), the database schema, the current players, the deployment workflow, and known quirks. This file made it possible to pick up a conversation mid-feature and have Claude Code immediately understand the full context of a 9-month-old codebase.

---

## Key Features to Highlight (pick the most visually interesting / impressive ones)

### 1. The Advantages System
Players can spend earned points to purchase real-game-changing advantages:
- **Double Trouble** (8 pts): Doubles your questionnaire score for the week
- **Thief in the Shadows** (10 pts): Steals 5 points from a target opponent at score release
- **Steal an Advantage**: Admin-granted token that lets you immediately steal any advantage another player owns

Scarcity rule: only ONE of each advantage exists in the game. If someone buys it, no one else can until the original owner plays it and it resolves. The purchase is atomic server-side to prevent race conditions.

### 2. JWT Authentication with Google OAuth
Full token-based auth system: access tokens expire in 15 minutes and live in memory (no localStorage), refresh tokens live in httpOnly secure cookies for 7 days. Auto-refresh on 401 responses. Brute-force rate limiting (10 attempts before 15-minute lockout). Google OAuth as the primary login path. Self-service account linking.

### 3. Cross-League Fan-Out Architecture
Multiple leagues (e.g., a "Friends League" and a "Family League") can share players. When a player in both leagues submits their weekly questionnaire answers, the submission automatically fans out to their other league's data — they only fill out the form once. Same for Wordle guesses and contestant picks. All fan-outs are idempotent and silent (never block the main action if a secondary league write fails).

### 4. Admin Panel Live Game Management
Joshua runs the entire game live during Survivor episodes from his phone:
- Score contestants' performance episode by episode (points fan out to all pickers automatically)
- Release questionnaire scores (with auto-backup before every release)
- Manage the Wordle schedule (13 pre-loaded words for the season, auto-release/close)
- Grant special advantage tokens to specific players
- Weekly checklist tracking all admin tasks per episode

### 5. Auto-Backup Snapshot System
Before any risky operation (releasing scores, eliminating contestants, re-scoring), the app automatically creates a timestamped snapshot of the full game state in MongoDB. Admin can restore any snapshot with a confirmation click. ~45–60 snapshots per season.

### 6. Progressive Web App
Installable on phones — players tap "Add to Home Screen" and get a full-screen app icon. Custom flame logo. No browser chrome visible. Works on iPhone (Safari) and Android (Chrome).

---

## Honest Challenges to Include (makes it credible)

- **The 11,000-line monolith**: `app.jsx` was never intentionally architected as a monolith — it grew organically as features were added. Claude Code navigated it well, but splitting it would be a real project.
- **Production-only testing**: No local API testing meant bugs could only be confirmed on the live site. This created pressure to get things right before pushing.
- **React Rules of Hooks violations**: A real example — a `useEffect` was accidentally placed inside a conditional block in AdminPanel, causing a crash (orange error screen) for the Usage Analytics admin view. Claude Code diagnosed it, traced the React component lifecycle issue, moved the hook to the top level, and pushed the fix. Users hard-refreshed and it was gone.
- **Context and memory**: Claude Code has a context window. On very long sessions building complex features, earlier context got compressed. The CLAUDE.md file was the solution — persistent, searchable, always-loaded context that kept Claude oriented even after session restarts.
- **Scope creep in real time**: New ideas kept coming mid-build. "Can we add a cross-league fan-out so players don't have to submit twice?" required re-architecting how questionnaires were stored (from per-league to global keys), updating the backup system, and writing a migration block — all while the season was live.

---

## Numbers to Include Somewhere
- **11,000+ lines** in a single React component file (app.jsx)
- **9 players** competing across 1–2 leagues
- **5 serverless API endpoints** (`/api/storage`, `/api/auth`, `/api/backup`, `/api/advantage`, `/api/gemini-episode`)
- **~45–60 auto-snapshots** created per season
- **21 contestants** in Season 51 across 2 tribes
- **2 minutes** from git push to production deployment
- **15 minutes** for JWT brute-force lockout
- **10 months** of continuous development
- **0 dedicated servers** — entirely serverless
- **1 CLAUDE.md file** that grew to ~500+ lines of living documentation

---

## Suggested Slide Structure

### Slide 1 — The Hook
**"I built a production app with 9 real users and no engineering team. Here's what that actually looks like."**
Visual: Full-bleed dark slide with a flame icon, the app's logo/name "Survivor Fantasy League," and a single dramatic stat — like "11,000 lines. 0 engineers. 1 season." Speaker talks about what the app is and why it exists.

### Slide 2 — The Game
**"Fantasy football for people who watch Survivor."**
Visual: Screenshot concept of the leaderboard or home page. Show the competitive stakes — real players, real points, real bragging rights. Speaker explains the game mechanics briefly: picks, questionnaires, advantages, Wordle, leaderboard.

### Slide 3 — The Stack
**"Modern, serverless, and built for a $0/month infrastructure bill."**
Visual: Clean architecture diagram — React frontend → Vercel Serverless Functions → MongoDB Atlas. Label each layer. Include the tech logos (React, Vite, Tailwind, Vercel, MongoDB). Speaker walks through why each choice was made (Vercel for zero-ops deployment, MongoDB Atlas for a free-tier document store, serverless functions for zero server management).

### Slide 4 — Claude Code as Co-Engineer
**"I described what I wanted in plain English. The code appeared."**
Visual: Split screen or terminal aesthetic — on one side a plain-English description ("I want players to be able to steal another player's advantage"), on the other side actual code or a file tree showing what got built. Speaker talks about what Claude Code actually does, how the workflow felt, and the CLAUDE.md file as the memory layer.

### Slide 5 — The Hard Parts
**"Production-only testing, a 11,000-line monolith, and a React crash during episode night."**
Visual: Dark slide with a mock error screen (the orange React error boundary), then a "fixed" indicator. Speaker shares the real challenges — the hooks violation story, the production-testing constraint, the organic monolith, scope creep mid-season.

### Slide 6 — What Got Built
**"A real game engine that runs live from my phone during Survivor episodes."**
Visual: Feature grid or icon cards — Auth + OAuth, Advantages System, Cross-League Sync, Admin Panel, Auto-Backups, PWA, AI Questionnaire Suggestions. Speaker highlights the most impressive features and their real-world complexity.

### Slide 7 — The Numbers
**"The receipts."**
Visual: Large-type stat card layout. Each stat on its own visual element. Speaker reads the numbers and contextualizes them — 11,000 lines, 2-minute deploys, 0 servers, 9 players, 10 months.

### Slide 8 — The Takeaway
**"AI coding tools don't replace the builder. They raise the ceiling on what one person can build."**
Visual: Simple, minimal — the flame icon large, a single closing statement. Speaker reflects: What changed with AI coding? What stayed the same? What would be impossible without it? What's coming for Season 52?

---

## Presentation Style Notes
- **Not a tutorial** — don't explain what React is. Assume the audience knows tech.
- **First-person and honest** — "I did this, it worked, here's where it broke"
- **Cinematic energy** — this is a story, not a feature walkthrough
- **Dark theme** with amber/gold as the primary accent color (matches the Survivor torch aesthetic)
- **Minimal text per slide** — the speaker carries the content; slides are visual anchors
- **End with something memorable** — the Season 51 launch date (September 23, 2026) or a quote about what AI-assisted development actually feels like

---

## Final Note to Claude
When you generate this presentation, please create full slide content — not just outlines. For each slide write the actual headline text, the speaker notes in full sentences (3–4 sentences minimum per slide), and specific, actionable visual direction. If you output in a format compatible with Gamma.app, Google Slides AI, or as a Markdown structure that can be imported, please do so. The goal is a polished, compelling 10-minute story about what it means to build real software in the AI coding era, told by the person who actually did it.
