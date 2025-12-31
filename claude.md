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
│   └── db.js             # Storage API wrapper (storage, auth, backup)
├── api/
│   ├── storage/
│   │   └── [key].js      # MongoDB serverless function (dynamic route)
│   ├── auth.js           # Authentication API (password hashing with bcrypt)
│   └── backup.js         # Backup/snapshot management API
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── vercel.json           # Vercel deployment config
└── .env                  # Environment variables (not in git)
```

## Key Features

### 1. Authentication
- Simple name/password login system
- **Password Security**: Server-side hashing with bcrypt (10 salt rounds)
  - Auto-migration: Legacy plaintext passwords hashed on first login
  - Minimum 8 character password requirement
- Password recovery with security questions
- Passwords stored in MongoDB per player (hashed)
- "Remember me" option using localStorage
- **Demo/Guest Mode**: Allows exploring the app without an account
  - Click "Demo / Guest" button on login screen
  - Can view all features and interact with UI
  - Nothing saves to MongoDB (local state only)
  - Admin panel visible but read-only
  - All actions show "(Demo mode - not saved)" alerts

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
- Welcome message with season stats (players, contestants, remaining)
- **"How to Play" section** - Explains each tab with icons
- **Cast Accordion** - Collapsible section titled "Check Out This Season's Cast"
  - Default collapsed
  - Shows all 18 contestants with photos and bio paragraphs
  - Tribe color-coded borders (orange/blue/green)
  - Eliminated contestants marked

### 5. Picks System
**Instinct Pick** (Pre-season):
- Select one contestant before Episode 1
- Earns bonus points: +1 per episode survived, +5 for making merge
- Cannot be changed once submitted

**Final Pick** (Post-merge):
- Opens when admin advances to `final-picks` phase
- Select from remaining (non-eliminated) contestants
- Same points as instinct pick (except no episode survival bonuses)

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
- Question of the Week text (can be anonymous during voting)
- Auto-deadline: Next Wednesday 7:59 PM EST
- Auto-lock: Wednesday 9:00 PM EST (episode start)

**Submission** (Players):
- Answer questions before deadline
- Question of the Week (required text response)
- Late penalties: -1, -2, -3... (cumulative per season)

**Scoring**:
- Correct answer: +2
- Incorrect: -1 (optional questions) or 0 (required)
- Late penalty: Variable based on offense count
- QotW Winner: +5 points

### 7. Leaderboard
- Real-time rankings
- Medal badges (gold, silver, bronze)
- Player initials in Survivor-style circles
- Total points from picks + questionnaires + QotW wins
- Expandable player details

### 8. Admin Controls (Jeff's Panel)

**Create Questionnaire**:
- Build weekly questionnaire with 3 question types
- Auto-archives previous questionnaires
- Sends notifications to all players

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
- Manage Question of the Week voting
- View/set winners manually if needed

**Phase Control**:
- Visual display of current phase (1 of 5)
- Previous/Next phase buttons
- Jump directly to any phase
- Phase guide with descriptions
- Confirmation required for going backward

**Season Management**:
- Archive current season
- Start new season
- View season history

**Tree Mail** (Notifications):
- Send notifications to specific players or broadcast to all
- View all current notifications with recipient info
- See read/unread status
- Delete individual notifications or clear all
- 7-day auto-expiry (old notifications cleaned on load)

**Password Management**:
- View all players with reset option
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
- "Mark all read" button
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
- Scores released
- Final picks opening
- Phase changes
- Admin custom messages (Tree Mail)
- Advantage purchased/played (anonymous broadcasts)
- Vote/advantage stolen (targeted alerts)
- Double Trouble/Immunity Idol applied

### 10. Advantages System

**Scarcity Rule**: Only ONE of each advantage can exist in the game at a time. Once purchased, no one else can buy it. Once PLAYED, it returns to the shop for others to purchase.

**Available Advantages**:

| Advantage | Cost | Effect |
|-----------|------|--------|
| Extra Vote | 15 pts | Cast an additional vote in QOTW voting |
| Vote Steal | 20 pts | Steal a player's vote (blocks them from voting, auto-votes for you) |
| Double Trouble | 25 pts | Double ALL your weekly points when scores are released |
| Immunity Idol | 30 pts | Negate all negative points for the week |
| Knowledge is Power | 35 pts | Steal another player's advantage (wasted if they have none) |

**Shop UI States**:
- **Available** (purple): Can purchase if you have enough points
- **You Own This** (green): Already in your inventory
- **Someone Has Purchased This** (red): Another player owns it
- **Insufficient Points** (gray): Not enough points to buy

**Playing Advantages**:
- Owned advantages appear above shop with "Play Advantage" button
- Some advantages require target selection (Vote Steal, Knowledge is Power)
- QOTW advantages (Extra Vote, Vote Steal) require voting to be open
- Weekly advantages (Double Trouble, Immunity Idol) link to active questionnaire
- Effects apply automatically when admin releases scores

**Notifications**:
- Anonymous broadcast when any advantage is purchased
- Anonymous broadcast when any advantage is played (returns to shop)
- Targeted notification to victim (Vote Steal, Knowledge is Power)

## Database Schema

### Collections
- **game_data**: Key-value store for all game state
- **backups**: Snapshot storage for data integrity

### Storage Collections (game_data)
All data stored in MongoDB `game_data` collection as key-value pairs:

**Key Structure**:
- `players` - Array of player objects
- `contestants` - Array of Survivor 48 cast
- `picks` - Array of player picks (instinct/final)
- `gamePhase` - Current phase string
- `questionnaires` - Array of questionnaire objects
- `submissions` - Array of player questionnaire submissions
- `qotWVotes` - Array of QotW votes
- `latePenalties` - Object of player late penalty counts
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
  eliminated?: boolean
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
  advantageId: string,           // e.g., 'extra-vote', 'vote-steal'
  name: string,
  description: string,
  type: string,
  purchasedAt: ISO_string,
  used: boolean,
  activated: boolean,
  usedAt: ISO_string | null,
  targetPlayerId: number | null,       // For Vote Steal, Knowledge is Power
  linkedQuestionnaireId: number | null, // Links effect to specific questionnaire
  wasted: boolean,                     // True if Knowledge is Power found no advantage
  stolenFrom: number | null            // If this advantage was stolen via Knowledge is Power
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

### `/api/storage/[key]`
Vercel serverless function with dynamic routing for all database operations:

- **GET `/api/storage/{key}`** - Retrieve value by key
- **POST `/api/storage/{key}`** - Set/update value for key
- **DELETE `/api/storage/{key}`** - Delete key

Returns JSON: `{ key, value }` or `{ error: 'Not found' }`

**Note**: The `[key]` in the filename (`api/storage/[key].js`) enables Vercel's file-system based dynamic routing. The key is accessed via `req.query.key`.

### `/api/auth`
Server-side password management with bcrypt hashing:

- **POST** with `action: 'login'` - Verify password (auto-migrates plaintext to hashed)
- **POST** with `action: 'setPassword'` - Set new hashed password
- **POST** with `action: 'resetToDefault'` - Reset to default password (hashed)
- **POST** with `action: 'verifyCurrentPassword'` - Verify before password change

### `/api/backup`
Snapshot management for data integrity:

- **POST** with `action: 'createSnapshot'` - Create backup with trigger label
- **GET** with `action: 'getSnapshots'` - List all snapshots (id, trigger, date)
- **POST** with `action: 'restoreSnapshot'` - Restore from snapshot (creates safety backup first)
- **GET** with `action: 'exportData'` - Export all game data as JSON
- **POST** with `action: 'deleteSnapshot'` - Delete a specific snapshot

## Environment Variables

### Local (.env)
```
MONGODB_URI=<your-mongodb-connection-string>
```

### Vercel Dashboard
Add same variable: `MONGODB_URI` (without VITE_ prefix for backend)

## Deployment

### Local Development
```bash
npm install
npm run dev
# Opens at http://localhost:5173
```

### Production Deployment
1. Work on `dev` branch
2. When ready, merge to `main` branch
3. Vercel auto-deploys in ~2 minutes
4. Live at: `https://survivor-fantasy-app.vercel.app`

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

## Survivor 48 Cast
18 contestants across 3 tribes:
- **Manu** (6 contestants) - Orange theme
- **Loto** (6 contestants) - Blue theme
- **Moana** (6 contestants) - Green theme

Cast includes placeholder bios for each contestant (to be updated with real info).

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
- [x] Demo/Guest mode for app exploration
- [x] Password hashing with bcrypt (server-side security)
- [x] Auto-backup system with snapshots
- [x] Un-eliminate contestants
- [x] Re-score questionnaires
- [x] Admin password reset for players
- [x] Manual backup & JSON export

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
**Season**: Survivor 48 (premieres February 2026)
**Hosting**: Vercel
**Database**: MongoDB Atlas

---

*For Claude/AI assistants working on this codebase*: This app is fully functional and deployed. The main component is in `app.jsx` with all game logic, views, and state management. The admin panel has full CRUD operations for questionnaires, cast management, phase control, and notifications. MongoDB handles all persistence through the `/api/storage` serverless function. Focus on maintaining the existing architecture when adding features. Always test with `npm run build` before recommending merge to main.
