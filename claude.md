# Survivor Fantasy League App

## Overview
A full-stack web application for running a fantasy game based on the TV show Survivor. Built with React, Vite, MongoDB, and deployed on Vercel. Players make picks, answer weekly questionnaires, and compete for points throughout the season.

## Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Vercel Serverless Functions
- **Database**: MongoDB Atlas
- **Icons**: Lucide React
- **Deployment**: Vercel (auto-deploy from GitHub main branch)

## Project Structure
```
survivor-fantasy-app/
├── src/
│   ├── app.jsx           # Main application component (all views & logic)
│   ├── main.jsx          # React entry point
│   └── db.js             # Storage API wrapper (storage, auth, backup, advantageApi, JWT token management)
├── api/
│   ├── lib/
│   │   ├── jwt.js        # JWT token utilities (generate, verify, cookie handling)
│   │   └── auth-middleware.js  # Authentication middleware for API routes
│   ├── storage/
│   │   └── [key].js      # MongoDB serverless function (dynamic route)
│   ├── auth.js           # Authentication API (login, logout, password management, token refresh)
│   ├── backup.js         # Backup/snapshot management API (admin only)
│   └── advantage.js      # Advantage API (atomic purchases, queue system)
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── vercel.json           # Vercel deployment config
└── .env                  # Environment variables (not in git)
```

## Key Features

### 1. Authentication
- Simple name/password login system with JWT tokens
- **JWT Token System**:
  - Access token (15 min expiry) stored in memory - sent via Authorization header
  - Refresh token (7 day expiry) stored in httpOnly secure cookie
  - Automatic token refresh on 401 responses
  - Token refresh on app load for "stay logged in" functionality
- **Password Security**: Server-side hashing with bcrypt (10 salt rounds)
  - Auto-migration: Legacy plaintext passwords hashed on first login
  - Minimum 8 character password requirement
- **Rate Limiting**: Brute force protection on login
  - 10 failed attempts per IP+player before lockout
  - 15 minute lockout duration
  - Tracks attempts in MongoDB (`ratelimit_` keys)
  - Clears on successful login
  - Admin can check/clear via `checkRateLimit` and `clearRateLimit` actions
- **API Authorization**:
  - All write operations require authentication
  - Admin-only operations (backup, delete, certain writes) require admin role
  - Public read access for: players, contestants, leagues, leagueMemberships, questionnaires, episodes
- Password recovery with security questions
- Passwords stored in MongoDB per player (hashed)
- "Stay logged in" option using localStorage + refresh token
- **Password visibility toggle**: Eye icon to show/hide password on login form
- **Login loading state**: Button shows "Loading..." until player data is ready
- **Name help tooltip**: Question mark icon next to Player Name explains names may vary (e.g., "Charles" → "Charlie")

### 2. Player Roles
- **Players**: 9 friends competing in the league
- **Admin (Jeff/Joshua)**: Has special controls panel, also plays as a contestant

### 3. Game Phases
5 sequential phases controlled by admin:
- `instinct-picks` - Pre-season pick selection
- `early-season` - Episodes 1-4
- `final-picks` - Post-merge pick selection
- `mid-season` - Merge to finale
- `finale` - Final episodes

**Phase Control**: Admin can move forward OR backward through phases (with confirmation for going back).

### 4. Home Page
Layout from top to bottom:
1. **Welcome Banner** - Gradient banner with "Welcome to Survivor Fantasy Season X, {Name}!"
2. **How to Play Section** - Explains each tab (Picks, Questionnaire, Leaderboard, Advantages) with icons
   - Includes "How Your Picks Earn Points" subsection with scoring breakdown
3. **Your Stats Section** - Total points, current rank, and 3 stat boxes (Players Competing, Survivors, Still in Game)
4. **Picks Status** - Two cards showing Instinct Pick and Final Pick status, plus questionnaire status
5. **Cast Accordion** - Collapsible section titled "Check Out This Season's Cast"
   - Default collapsed
   - Shows all contestants with photos and bio paragraphs
   - Tribe color-coded borders (purple/orange/teal)
   - Eliminated contestants marked

### 5. Picks System

**Picks Page Layout**:
1. **Info Banner** (blue) - Explains to read about cast in accordion, then scroll down to make picks
2. **Cast Accordion** - Same as Home page, lets players learn about contestants before picking
3. **Instinct Pick Section** - Pre-season pick selection
4. **Final Pick Section** - Post-merge pick selection

**Instinct Pick** (Pre-season):
- Select one contestant before Episode 1
- Earns bonus points: +1 per episode survived, +5 for making merge
- **Changeable until locked**: Players can change their pick until admin locks it

**Final Pick** (Post-merge):
- Opens when admin advances to `final-picks` phase
- Select from remaining (non-eliminated) contestants
- Same points as instinct pick (except no episode survival bonuses)
- **Changeable until locked**: Players can change their pick until admin locks it

**Picks Lock Control** (Admin - Phase Control panel):
- Instinct picks and Final picks can be locked/unlocked independently
- Players can change picks while unlocked
- Lock picks when ready to start scoring

**Points Earned by Picks**:
- Reward Win: +1
- Immunity Win: +2
- Journey: +1
- Votes Received (but not eliminated): +1 each
- Found Clue: +1
- Gained Idol/Advantage: +1
- Played Idol/Advantage: +1
- Incorrect Vote: -1
- Voted Out with Idol in Pocket: -2
- Episode Survived (Instinct only): +1
- Made Merge (Instinct only): +5
- **Finale Bonuses** (mutually exclusive - only ONE awarded per pick):
  - Final 5: +10
  - Final 3: +15
  - Sole Survivor: +20

### 6. Weekly Questionnaire
**Question Types** (Simplified):
- **Multiple Choice** - Admin enters custom answer options (add/remove as needed)
- **Dropdown (Remaining Cast)** - Auto-populates with non-eliminated contestants
- **True/False** - Simple true or false options
- **Question of the Week** - Always short answer (text response)

**Creation** (Admin):
- Title, episode number
- Add questions with "+ Multiple Choice", "+ Dropdown (Remaining Cast)", or "+ True/False"
- "Include Question of the Week" toggle (default: on, turn off for finale)
- Question of the Week text (can be anonymous during voting)
- Auto-deadline: Next Wednesday 7:59 PM EST
- Auto-lock: Wednesday 9:00 PM EST (episode start)

**Submission** (Players):
- Answer questions before deadline
- Question of the Week (required text response, if enabled)
- **Vote on LAST week's QotW** - voting happens during next week's questionnaire
- Late penalty: -5 points (flat rate for any late submission)

**QotW Voting Flow**:
- Week 1: Players answer Episode 1 QotW (no voting yet)
- Week 2: Players fill out Episode 2 questionnaire AND vote on Episode 1's QotW answers
- Voting is available until admin clicks "Close Voting" in QOTW Management
- Admin awards winner (+5 points) after closing voting

**Scoring**:
- Correct answer: +2
- Incorrect: -1 (optional questions) or 0 (required)
- Late penalty: -5 points (flat)
- No submission: 0 points (no penalty, just nothing scored)
- QotW Winner: +5 points

### 7. Leaderboard
- Real-time rankings with **tie display** (T-1, T-1, 3 instead of 1, 2, 3)
- Medal badges (gold, silver, bronze) based on rank
- Player initials in Survivor-style circles
- Total points from picks + questionnaires + QotW wins + challenges
- Expandable player details with point history
- "Your Rank" stat shows ties (T-X format)
- **Current user highlight**: Cyan glow effect distinguishes your row from others

### 8. Admin Controls (Jeff's Panel)

**Create Questionnaire**:
- Build weekly questionnaire with 3 question types
- Auto-archives previous questionnaires
- Sends notifications to all players

**Re-Open Questionnaire**:
- Shows "Re-Open" button when questionnaire deadline has passed
- Extends deadline to next Wednesday 7:59 PM (or 24 hours if sooner)
- Reactivates the questionnaire for submissions
- Sends notification to all players about new deadline

**Score Questionnaire**:
- View all player submissions
- Select correct answers from dropdowns
- Preview scores before releasing
- Auto-calculates QotW winner from votes
- Release scores with one click
- **Re-Score**: Edit correct answers after release
  - Calculates score adjustments (difference)
  - Does not re-apply advantage effects
  - Auto-backup before re-scoring

**Edit Cast**:
- Add/remove contestants
- Edit contestant names, tribes, images
- Drag & drop image upload support

**Eliminations**:
- Mark contestants as eliminated
- **Un-eliminate**: Toggle button to restore eliminated contestants
- Eliminated contestants removed from questionnaire dropdowns
- Visual indicators (red, opacity reduced)
- Auto-backup before each elimination/un-elimination

**Episode Scoring**:
- Score pick performance per episode
- Track immunity wins, advantages found, etc.

**QOTW Management**:
- Voting opens automatically when next week's questionnaire is created
- **Close Voting**: Ends the voting period for that week's QotW
- **Award Winner**: Gives +5 points to the player(s) with most votes
- View all answers with vote counts
- Status indicators: "Voting Open", "Voting Closed", "Winner Awarded"

**Phase Control**:
- Visual display of current phase (1 of 5)
- Previous/Next phase buttons
- Jump directly to any phase
- Phase guide with descriptions
- Confirmation required for going backward

**Season Management**:
- Archive current season
- Start new season (resets all game data - see below)
- View season history

**What gets reset on new season:**
- All picks (instinct and final)
- All questionnaires and submissions
- All QotW votes
- All pick scores
- All player advantages
- Player point totals (playerScores)
- Late penalties tracking
- Game phase (returns to instinct-picks)
- Season finalized flag
- Contestant elimination status (all reset to not eliminated)

**Tree Mail** (Notifications):
- Send notifications to specific players or broadcast to all
- View all current notifications with recipient info
- See read/unread status
- Delete individual notifications or clear all
- 7-day auto-expiry (old notifications cleaned on load)

**Password Management**:
- View all players with reset option
- **Password status indicator**: Shows whether each player has changed from default or not
  - 🟢 "Changed" - Player set a custom password
  - 🔴 "Default password" - Still using password123
  - 🟡 "No password set" - Player hasn't logged in yet
- Summary stats: Count of changed/default/not set passwords
- Reset any player's password to default ("password123")
- Uses server-side bcrypt hashing

**Backup Management**:
- **Auto-snapshots**: Created before risky actions
  - Before releasing questionnaire scores
  - Before episode scoring
  - Before contestant eliminations/un-eliminations
  - Before re-scoring questionnaires
- **Manual backup**: Create snapshot on demand
- **Export Data**: Download all game data as JSON file
- **Restore**: Revert to any previous snapshot
  - Creates safety backup before restoring
- **Delete**: Remove old snapshots
- Stores ~45-60 snapshots per season

### 9. Notifications System

**Bell Icon (Header)**:
- Shows unread count badge
- Dropdown shows latest 10 notifications
- Click to mark as read
- "Mark read" button - marks all as read
- "Clear all" button - deletes all notifications for current user (with confirmation)
- **Auto-expiry**: Notifications older than 7 days are automatically deleted on page load

**Banner Notifications (Home Page)**:
- Unseen notifications display as color-coded banners at top of Home page
- Per-user tracking: each player has independent seen/unseen status
- Banners marked as "seen" when:
  - User switches away from Home tab
  - User stays on Home tab for 30 seconds
  - User clicks X to dismiss manually
- Color-coded by type (green=scores, purple=QOTW, red=stolen, etc.)
- Shows max 5 banners at once

**Notification Types**:
- New questionnaire available
- Scores released (and re-scored)
- Final picks opening
- Phase changes
- Admin custom messages (Tree Mail)
- Advantage purchased (anonymous broadcast)
- Vote stolen (targeted alert to victim)
- Double Trouble applied (during score release)
- Thief in the Shadows / Points stolen (broadcast + targeted alert to victim)
- Wordle challenge started/ended/winner
- Season finalized

### 10. Wordle Challenge
Weekly mini-game where players guess a 5-letter Survivor-themed word.

**Gameplay**:
- 6 attempts to guess the word
- Color feedback: Green (correct), Yellow (wrong position), Gray (not in word)
- Timestamp-based timing: records `startedAt` and `completedAt`
- Shows "Started: [date/time]" during gameplay
- Winner determined by: fewest guesses, then fastest time (completedAt - startedAt)
- Confetti celebration when player solves the puzzle

**Admin Control** (Fully Manual):
- **Create Challenge**: Start a new challenge with random word
- **End Challenge**: Finalize and award points to winner
- No automatic creation or ending - admin has full control
- Challenges not tied to episodes (can run anytime)

**Points**:
- Winner: +3 points

### 11. Weekly Admin Checklist
Compact status card at top of Admin Panel showing progress for current episode.

**Tracked Items**:
| Item | States |
|------|--------|
| **Q** (Questionnaire) | Not created → Collecting → Graded → Released |
| **QotW** | Voting (auto when next Q created) → Closed → Awarded |
| **Picks** | Not done → Scored |
| **Elim** | Not done → Done |
| **Wordle** | No challenge → Active → Awarded |

**Week Progression**:
- Episode number based on questionnaire episode numbers
- Only advances to next episode when ALL tasks complete
- Shows "All Done!" badge when episode is complete
- Prompts admin to create next episode's questionnaire

**Elimination Tracking**:
- Contestants marked eliminated now store `eliminatedEpisode`
- Checklist checks if any contestant was eliminated in current episode

### 12. Advantages System

**Scarcity Rule**: Only ONE of each advantage can exist in the game at a time. Once purchased, no one else can buy it. Once USED (resolved at score release), it returns to the shop for others to purchase.

**Weekly Queue System**: All advantages work the same way:
1. **Purchase**: Buy from the shop (costs points, atomic server-side operation prevents race conditions)
2. **Queue for Week**: Select which episode/week to use the advantage
3. **Resolution**: Effects automatically resolve when admin releases scores for that week

**Available Advantages**:

| Advantage | Cost | Effect | Needs Target |
|-----------|------|--------|--------------|
| Extra Vote | 15 pts | Your QOTW answer gets +1 bonus vote for the selected week | No |
| Vote Steal | 20 pts | Block a target player from voting in QOTW and cast their vote yourself | Yes |
| Double Trouble | 25 pts | Double your questionnaire score and QOTW bonus for the selected week | No |
| Thief in the Shadows | 30 pts | Steal 5 points from a target player when the week's scores are released | Yes |

**Shop UI States**:
- **Available** (purple): Can purchase if you have enough points
- **You Own This** (green): Already in your inventory
- **Someone Has Purchased This** (red): Another player owns it
- **Insufficient Points** (gray): Not enough points to buy

**Playing Advantages (Weekly Queue)**:
- Owned advantages appear in "Your Advantages" section
- Click "Queue for Week" to select which episode to use it
- Target-requiring advantages (Vote Steal, Thief in the Shadows) prompt for target selection
- Queued advantages show "Queued for Week X" with option to cancel
- All effects resolve automatically when admin releases scores for that week

**Resolution Order** (when admin releases scores):
1. Extra Vote / Vote Steal effects applied to QOTW vote counts
2. Double Trouble doubles the player's weekly points
3. Thief in the Shadows transfers 5 points from target to player
4. All queued advantages marked as used and return to shop

**Notifications**:
- Anonymous broadcast when any advantage is purchased
- Anonymous broadcast when any advantage is resolved (returns to shop)
- Targeted notification to victim (Vote Steal, Thief in the Shadows)

**API Endpoint** (`/api/advantage`):
- Atomic server-side operations prevent race conditions
- Actions: `purchase`, `queueForWeek`, `cancelQueue`

### 13. PWA (Progressive Web App)
The app is installable on mobile devices for an app-like experience.

**Installation**:
- **iPhone**: Safari → Share button → "Add to Home Screen"
- **Android**: Chrome → Menu → "Install app" or automatic prompt

**Features**:
- Custom flame icon on home screen
- Opens fullscreen (no browser UI)
- Themed status bar (amber)
- Shows as "Survivor FL" in app switcher

**Files**:
- `public/manifest.json` - App metadata and icon references
- `public/icons/` - PNG icons (192x192, 512x512, 180x180 for Apple)
- `index.html` - PWA meta tags and iOS support

### 14. Confetti Celebrations
Visual celebrations for key moments using canvas-confetti library.

**Triggers**:
- Wordle puzzle solved (single burst)
- Season finalized by admin (fireworks)
- First time viewing season winners podium (fireworks, per-user via localStorage)

**Accessibility**:
- Respects `prefers-reduced-motion` media query
- Users with motion sensitivity won't see animations

## Database Schema

### Collections
- **game_data**: Key-value store for all game state
- **backups**: Snapshot storage for data integrity

### Storage Collections (game_data)
All data stored in MongoDB `game_data` collection as key-value pairs:

**Key Structure**:
- `players` - Array of player objects
- `contestants` - Array of current season's cast
- `picks` - Array of player picks (instinct/final)
- `picksLocked` - Object with `{ instinct: boolean, final: boolean }`
- `gamePhase` - Current phase string
- `questionnaires` - Array of questionnaire objects
- `submissions` - Array of player questionnaire submissions
- `qotWVotes` - Array of QotW votes
- `latePenalties` - Legacy field (late penalties are now flat -5, not tracked)
- `pickScores` - Array of pick scoring events
- `playerAdvantages` - Array of player-owned advantages (with scarcity tracking)
- `episodes` - Array of episode recaps
- `notifications` - Array of notification objects (auto-cleaned after 7 days)
- `password_{playerId}` - Individual player passwords
- `security_{playerId}` - Security questions for password recovery
- `currentSeason` - Current season number
- `seasonHistory` - Archived season data
- `challenges` - Array of Wordle challenge objects
- `challengeAttempts` - Array of player challenge attempts

### Key Data Structures

**Player**:
```javascript
{
  id: number,
  name: string,
  isAdmin: boolean
}
```

**Contestant**:
```javascript
{
  id: number,
  name: string,
  tribe: string,
  image: string,
  eliminated?: boolean,
  eliminatedEpisode?: number  // Episode number when eliminated (for checklist tracking)
}
```

**Question**:
```javascript
{
  id: string,
  type: 'multiple-choice' | 'cast-dropdown' | 'true-false',
  text: string,
  required: boolean,
  options: string[]  // For multiple-choice only
}
```

**Notification**:
```javascript
{
  id: number,
  type: string,
  message: string,
  targetPlayerId: number | null,  // null = broadcast to all
  createdAt: ISO_string,
  readBy: number[],   // Array of user IDs who have read (bell icon)
  seenBy: number[]    // Array of user IDs who have seen banner (per-user tracking)
}
```

**PlayerAdvantage**:
```javascript
{
  id: number,
  playerId: number,
  advantageId: string,           // e.g., 'extra-vote', 'vote-steal', 'point-steal'
  name: string,
  description: string,
  type: string,
  cost: number,
  purchasedAt: ISO_string,
  used: boolean,                       // True when resolved at score release
  // Weekly queue system fields
  queuedForWeek: number | null,        // Episode number this is queued for
  targetPlayerId: number | null,       // For Vote Steal, Thief in the Shadows
  queuedAt: ISO_string | null,         // When queued for a week
  resolvedAt: ISO_string | null        // When the advantage effect was applied
}
```

**Backup Snapshot** (stored in `backups` collection):
```javascript
{
  id: number,                    // Timestamp-based ID
  trigger: string,               // e.g., 'manual', 'before-release-scores', 'before-episode-scoring'
  createdAt: ISO_string,
  data: {                        // Full game state snapshot
    players: [...],
    contestants: [...],
    picks: [...],
    // ... all BACKUP_KEYS
    _passwords: [...],           // Encrypted password data (not in exports)
    _security: [...]             // Security questions (not in exports)
  }
}
```

## API Routes

**Security & Reliability Features** (all endpoints):
- **JWT Authentication**: Access tokens via Authorization header, refresh tokens via httpOnly cookies
- **CORS Restriction**: Only allows requests from `survivor-fantasy-app.vercel.app`, `*.vercel.app` (previews), and `localhost`
- **Connection Health Check**: Pings MongoDB before reusing cached connections, auto-reconnects if unhealthy

### `/api/storage/[key]`
Vercel serverless function with dynamic routing for all database operations:

- **GET `/api/storage/{key}`** - Retrieve value by key
  - Public keys readable without auth: `players`, `contestants`, `leagues`, `leagueMemberships`, `questionnaires`, `episodes`, and league-prefixed versions
  - Other keys require authentication
- **POST `/api/storage/{key}`** - Set/update value for key (requires auth)
  - Admin-only keys: `players`, `contestants`, `leagues`, `leagueMemberships`, `advantages`
- **DELETE `/api/storage/{key}`** - Delete key (requires admin)

Returns JSON: `{ key, value }` or `{ error: 'Not found' }`

**Note**: The `[key]` in the filename (`api/storage/[key].js`) enables Vercel's file-system based dynamic routing. The key is accessed via `req.query.key`.

**Edge Caching**: Static data (`players`, `contestants`, `leagues`, `leagueMemberships`) is cached for 60 seconds with stale-while-revalidate. Dynamic data is not cached.

### `/api/auth`
Authentication and password management:

- **POST** with `action: 'login'` - Verify password, returns access token, sets refresh token cookie
- **POST** with `action: 'refresh'` - Refresh access token using refresh token cookie
- **POST** with `action: 'logout'` - Clear refresh token cookie
- **POST** with `action: 'setPassword'` - Set new hashed password
- **POST** with `action: 'resetToDefault'` - Reset to default password (hashed)
- **POST** with `action: 'verifyCurrentPassword'` - Verify before password change
- **POST** with `action: 'checkDefaultPasswords'` - Check which players still have default password (for admin)
- **POST** with `action: 'checkRateLimit'` - Check if a player is rate-limited (for debugging)
- **POST** with `action: 'clearRateLimit'` - Clear rate limit for a player (for lockout recovery)

### `/api/backup`
Snapshot management for data integrity. **All operations require admin authentication.**

- **POST** with `action: 'createSnapshot'` - Create backup with trigger label
- **GET** with `action: 'getSnapshots'` - List all snapshots (id, trigger, date)
- **POST** with `action: 'restoreSnapshot'` - Restore from snapshot (creates safety backup first)
- **GET** with `action: 'exportData'` - Export all game data as JSON
- **POST** with `action: 'deleteSnapshot'` - Delete a specific snapshot

### `/api/advantage`
Atomic advantage operations (prevents race conditions). **All operations require authentication.**
Players can only purchase/manage their own advantages (admins can act for any player).

- **POST** with `action: 'purchase'` - Atomically purchase an advantage (checks availability first)
  - Required: `playerId`, `advantageId`, `advantageName`, `advantageDescription`, `advantageType`, `advantageCost`, `leagueId`
  - Returns: `{ success, advantage, message }` or `{ error: 'ALREADY_PURCHASED' }`
- **POST** with `action: 'queueForWeek'` - Queue an advantage for a specific episode
  - Required: `advantageId` (player's advantage ID), `weekNumber`, `leagueId`
  - Optional: `targetPlayerId` (for Vote Steal, Thief in the Shadows)
- **POST** with `action: 'cancelQueue'` - Cancel a queued advantage before resolution
  - Required: `advantageId` (player's advantage ID), `leagueId`

## Environment Variables

### Local (.env)
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<random-secure-string-for-access-tokens>
JWT_REFRESH_SECRET=<different-random-secure-string-for-refresh-tokens>
```

### Vercel Dashboard
Add these environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for signing access tokens (generate a random 32+ char string)
- `JWT_REFRESH_SECRET` - Secret for signing refresh tokens (different from JWT_SECRET)

**Important**: Generate secure random secrets for production. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Deployment

### Local Development
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

**Note**: Local dev server (Vite) does NOT serve Vercel serverless functions. API calls to `/api/*` will fail locally. For full testing with backend, deploy to production.

### Production Deployment
**IMPORTANT**: Currently working directly on `main` branch for testing (backend required).

1. Make changes on `main` branch
2. Run `npm run build` to verify no errors
3. Commit and push to `main`
4. Vercel auto-deploys in ~2 minutes
5. Live at: `https://survivor-fantasy-app.vercel.app`

**Standard workflow** (when not actively testing):
1. Work on `dev` branch
2. When ready, merge to `main` branch
3. Vercel auto-deploys

## Current Players
1. Joshua (Admin/Jeff)
2. Charlie
3. Emma
4. Tyler
5. Brayden
6. Dakota
7. Patia
8. Kaleigh
9. Sarah

## Player Management (Admin)
- **Add Player**: Admin can add new players via Admin Panel → Player Management
- New players get default password: `password123`
- Players cannot be removed (to preserve data integrity)

## Multi-League System
The app supports multiple isolated leagues (e.g., Friends, Family, Work leagues). Each league has completely independent game data.

**Features:**
- League state: `leagues`, `leagueMemberships`, `currentLeagueId`
- League Management admin panel (create leagues, assign players)
- Auto-creates "Main League" on first load with all existing players
- Admin (Joshua) auto-added to all new leagues
- League selector shown after login for players in multiple leagues
- League switcher dropdown in header for multi-league players
- Automatic data migration from single-league to multi-league on upgrade
- Backup system supports all leagues

**Login Flow (Multi-League):**
1. Player enters name + password
2. System validates credentials
3. If player is in 1 league → auto-loads that league
4. If player is in multiple leagues → shows league selector
5. Header shows "Season X • League Name" with dropdown to switch

**Data Model:**
```javascript
// Global keys (shared across all leagues)
players, leagues, leagueMemberships, contestants, password_{id}, security_{id}

// League-specific keys (prefixed with league_{id}_)
league_1_picks, league_1_questionnaires, league_1_submissions, league_1_qotWVotes,
league_1_pickScores, league_1_playerScores, league_1_latePenalties,
league_1_playerAdvantages, league_1_episodes, league_1_notifications,
league_1_challenges, league_1_challengeAttempts, league_1_gamePhase,
league_1_currentSeason, league_1_seasonHistory, league_1_seasonFinalized
```

**Storage Helper (`src/db.js`):**
- `createLeagueStorage(leagueId)` - Creates league-scoped storage interface
- `LEAGUE_SPECIFIC_KEYS` - List of keys that are league-specific
- `GLOBAL_KEYS` - List of keys shared across leagues

**Backup System (`api/backup.js`):**
- Version 2.0 backups include all leagues
- Backwards compatible with version 1.0 (single-league) backups
- Restore from legacy backups auto-migrates to league_1_

## Cast Management
Season 50 has 24 contestants across 3 tribes (8 per tribe) - the largest cast in Survivor history.

**Current Tribes (Season 50):**
- **Purple** (8 players) - Colby, Kyle, Q, Rizo, Angelina, Aubry, Genevieve, Stephenie
- **Orange** (8 players) - Christian, Joe, Ozzy, Rick, Cirie, Emily, Jenna, Savannah
- **Teal** (8 players) - Charlie, Coach, Jonathan, Mike, Chrissy, Dee, Kamilla, Tiffany

**Updating for a new season:**
1. Update cast names, tribes, and images via "Edit Cast" in Admin Panel
2. Update `CONTESTANT_BIOS` object in app.jsx (or clear bios)
3. Upload cast photos to `public/cast/` folder
4. Update tribe color mapping in app.jsx if tribe names change
5. Note: The `DEFAULT_CAST` constant in app.jsx contains default/fallback data

**Cast Photo Management:**
- Photos stored in `public/cast/` folder (e.g., `Angelina Keeley.jpg`)
- Auto-sync: On app load, contestant image paths are synced from `DEFAULT_CAST` if they differ from database
- Image display uses `object-cover object-top` to ensure faces are visible (not cropped at center)
- Bios stored in `CONTESTANT_BIOS` object in app.jsx (key is contestant ID)

## Development Guidelines

### Adding New Features
1. Update state management in `app.jsx`
2. Create component function if needed
3. Add to navigation if user-facing
4. Update storage schema if persisting data
5. Test locally with `npm run dev`
6. Commit to `dev` branch
7. Merge to `main` when ready to deploy

### Common Tasks

**Add a new player**:
```javascript
// In INITIAL_PLAYERS array
{ id: 10, name: "NewPlayer", isAdmin: false }
```

**Change game phase**:
- Use "Phase Control" in Jeff's Controls
- Can go forward or backward with confirmation

**Reset for new season**:
- Use "Season Management" in Jeff's Controls
- Archives current season and resets data

**Update contestant bios**:
- Edit `CONTESTANT_BIOS` object in app.jsx
- Key is contestant ID, value is bio text

## Troubleshooting

**Can't see updates after push**:
- Check Vercel deployment logs
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache

**Database connection issues**:
- Verify MongoDB URI in Vercel env variables
- Check MongoDB Atlas network access (0.0.0.0/0)
- Ensure database user has read/write permissions

**Images not loading**:
- Survivor Wiki images may expire
- Replace with stable image URLs or base64
- Drag & drop images in Cast Editor

**Notification dropdown hidden**:
- Header has z-50 to ensure dropdown appears on top

**Can't login (rate limited)**:
- After 10 failed attempts, account is locked for 15 minutes
- To clear: `curl -X POST "https://survivor-fantasy-app-gamma.vercel.app/api/auth" -H "Content-Type: application/json" -d '{"action":"clearRateLimit","playerId":PLAYER_ID}'`

**Login button does nothing for multi-league users**:
- Users in multiple leagues see a "Select League" screen after login
- League selector must render BEFORE the login form in app.jsx

**Database Performance**:
- Ensure `game_data` collection has an index on `{ key: 1 }` in MongoDB Atlas
- To create: Atlas → Collections → game_data → Indexes → Create Index → `{ "key": 1 }`

## Future Enhancements

### Completed Features
- [x] Dashboard with stats overview
- [x] Advantages activation interface
- [x] Phase control (forward & backward)
- [x] Tree Mail notification management
- [x] Cast bios and accordion display
- [x] Simplified questionnaire types
- [x] Wordle Challenge mini-game
- [x] Full Advantages System with scarcity rules
- [x] Banner notifications on Home page (per-user tracking)
- [x] Password hashing with bcrypt (server-side security)
- [x] Auto-backup system with snapshots
- [x] Un-eliminate contestants
- [x] Re-score questionnaires
- [x] Admin password reset for players
- [x] Manual backup & JSON export
- [x] Changeable picks (until admin locks)
- [x] Picks lock control (instinct & final separate)
- [x] Re-open questionnaire (extend deadline)
- [x] Clear all notifications button
- [x] QOTW voting visibility fix (admin-controlled)
- [x] Weekly advantage queue system (buy → queue → resolve at score release)
- [x] Password visibility toggle on login
- [x] Login loading state (prevents premature login attempts)
- [x] Leaderboard current user highlight (cyan glow)
- [x] Cast photo auto-sync from DEFAULT_CAST
- [x] Admin password status indicator (see who changed from default)
- [x] Home page rework (Welcome banner, How to Play at top, separate Stats section)
- [x] Cast accordion on Picks page with info banner
- [x] Login name help tooltip (explains name variations)
- [x] CORS restriction (API only accepts requests from allowed origins)
- [x] Database connection health check (auto-reconnect on stale connections)
- [x] Score release loading state (prevents double-click issues)
- [x] Season reset clears notifications
- [x] Episode scoring confirmation dialog
- [x] Edge caching for static data (players, contestants, leagues)
- [x] PWA support (installable app with home screen icon)
- [x] Confetti celebrations (Wordle wins, season finalized)
- [x] Wordle timestamp-based timing (more reliable than running timer)
- [x] Login rate limiting (brute force protection)
- [x] JWT authentication (access tokens + httpOnly refresh token cookies)
- [x] API authorization (protected endpoints, admin-only operations)

### Planned Features
- [ ] Episode recap auto-generation (AI)
- [ ] Pick scoring automation
- [ ] Email/SMS notifications
- [ ] Historical season comparisons
- [ ] Export standings to PDF/Excel
- [ ] Mobile app version

### Known Limitations
- No real SMS for password recovery (uses security questions)
- No email notifications (in-app only via Tree Mail)
- Admin must manually score picks each episode
- Single active season (past seasons archived)

## Contact & Credits
Created for Joshua's annual Survivor Fantasy League with college friends.
Built with assistance from Claude (Anthropic) - December 2024.

**Game Master**: Joshua
**Current Season**: Stored in MongoDB `currentSeason` key (dynamically displayed in app)
**Hosting**: Vercel
**Database**: MongoDB Atlas

---

*For Claude/AI assistants working on this codebase*:

**IMPORTANT - Current Workflow**: Working directly on `main` branch because local dev cannot test serverless functions. Be careful with changes - they deploy immediately to production.

**Architecture Notes**:
- Main component is `app.jsx` with all game logic, views, and state management
- AdminPanel is a separate function component - ensure all required props are passed
- MongoDB handles persistence through `/api/storage` serverless function
- Always run `npm run build` before committing to catch errors

**Common Prop Issues**:
- AdminPanel needs many props from App (check function signature when adding features)
- Functions defined in App (like `togglePicksLock`) can't use AdminPanel's `requireRealUser`
- State variables used in AdminPanel must be passed as props (e.g., `passwordStatus`, `loadingPasswordStatus`)

**Testing**: Since local dev doesn't support API routes, all testing happens on production. Make small, incremental changes.
