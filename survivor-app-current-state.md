# SURVIVOR FANTASY LEAGUE - CURRENT APPLICATION STATE

**Last Updated**: December 2024
**Version**: 2.0 (Updated Frontend)
**Deployment**: Vercel (Auto-deploy from GitHub main branch)
**Database**: MongoDB Atlas
**Status**: Live and Functional

---

## TABLE OF CONTENTS
1. [Application Overview](#application-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Current Features (Implemented)](#current-features-implemented)
5. [Features Pending Implementation](#features-pending-implementation)
6. [User Roles & Access](#user-roles--access)
7. [Navigation & Pages](#navigation--pages)
8. [Database Schema](#database-schema)
9. [API Endpoints](#api-endpoints)
10. [Deployment Setup](#deployment-setup)
11. [Known Issues & Limitations](#known-issues--limitations)
12. [Next Steps](#next-steps)

---

## APPLICATION OVERVIEW

### What Is This App?
A fantasy league web application for CBS's Survivor Season 48 where 9 friends compete by:
- Making pre-season and post-merge contestant picks
- Answering weekly questionnaires about episode predictions
- Voting on "Question of the Week" best answers
- Earning points based on their picks' performance and quiz accuracy
- Purchasing advantages to gain competitive edges

### Target Audience
- **Primary**: 9 college friends competing in a private fantasy league
- **Admin**: Joshua (also competes as a player)
- **Season**: Survivor Season 48 (18 contestants, 3 tribes)

### Core Gameplay Loop
1. Players make "Instinct Pick" before season starts
2. Each week: Answer questionnaire, watch episode, earn points
3. At merge: Make "Final Pick" from remaining contestants
4. Throughout season: Purchase advantages, check leaderboard
5. End of season: Highest points wins the league

---

## TECH STACK

### Frontend
- **React 18.3.1** - UI framework
- **Vite 4.5.14** - Build tool and dev server
- **TailwindCSS** - Styling (via CDN in index.html)
- **Lucide React 0.263.1** - Icon library

### Backend
- **Vercel Serverless Functions** - API hosting
- **MongoDB 7.0.0** - Database (Atlas hosted)
- **Express-style routing** - API structure

### Deployment
- **Platform**: Vercel
- **Method**: Auto-deploy from GitHub (main branch)
- **Domain**: Custom Vercel URL
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`

### Dependencies
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "lucide-react": "^0.263.1",
  "mongodb": "^7.0.0"
}
```

---

## PROJECT STRUCTURE

```
survivor-fantasy-app/
├── src/
│   ├── app.jsx              # Main React application (complete)
│   ├── main.jsx             # React entry point
│   └── db.js                # Storage API wrapper (MongoDB calls)
├── api/
│   └── storage.js           # Vercel serverless function (MongoDB connector)
├── public/                  # Static assets (if any)
├── index.html               # HTML template (Tailwind CDN)
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── vercel.json              # Vercel deployment config
├── .env                     # Environment variables (not in git)
├── .gitignore               # Git ignore rules
└── README.md                # Project readme
```

### Key Files Explained

**`src/app.jsx`** (2000+ lines):
- Single-file React component containing entire app
- All 7 pages as sub-components
- Authentication logic
- Game state management
- All UI rendering

**`src/db.js`**:
- Wrapper around fetch calls to `/api/storage/*`
- Methods: `get(key)`, `set(key, value)`, `delete(key)`, `list(prefix)`
- Makes frontend database-agnostic

**`api/storage.js`**:
- Vercel serverless function
- Connects to MongoDB Atlas
- Handles GET/POST/DELETE for key-value storage
- CORS enabled for cross-origin requests

**`vercel.json`**:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" }
  ]
}
```

---

## CURRENT FEATURES (IMPLEMENTED)

### ✅ 1. Authentication System
**Status**: Fully functional
- Password-based login (no email required)
- Password recovery via phone number + 3-digit code (simulated SMS)
- First user automatically becomes admin
- Passwords stored in MongoDB per player (`password_{playerId}`)
- Session persists via React state (resets on page refresh)

**Implementation Details**:
- 9 pre-configured players in `INITIAL_PLAYERS` array
- Admin flag: `isAdmin: true` for first user (Joshua)
- Login checks MongoDB for existing password, creates if new

---

### ✅ 2. Home Page - Cast Display
**Status**: Fully functional
**Route**: `/` (default landing page after login)

**Features**:
- Welcome message with game description
- Cast accordion organized by 3 tribes:
  - **Manu** (Orange) - 6 contestants
  - **Loto** (Blue) - 6 contestants  
  - **Moana** (Yellow) - 6 contestants
- Click tribe header to expand/collapse
- Each contestant card shows:
  - Photo (from Survivor Wiki)
  - Name, age, hometown
  - Short bio

**Data Source**: 
- `SURVIVOR_48_CAST` array in app.jsx (18 contestants)
- Images hosted on static.wikia.nocookie.net

---

### ✅ 3. Dashboard Page - Personal Overview
**Status**: Fully functional
**Route**: `/dashboard`

**Displays**:
- Welcome message with player name
- **Large point total** prominently displayed
- **Picks Status**:
  - Instinct Pick: Shows selected contestant or "Not submitted"
  - Final Pick: Shows "Available after merge" or selected contestant
  - Lock status indicators (✓ Locked, ⚠ Not submitted)
- **Questionnaires Status**:
  - Count of completed questionnaires
  - Current questionnaire submission status
  - Button to view questionnaires
- **Quick Stats Grid**:
  - Total Points
  - Questionnaires Completed
  - QOTW Wins (from breakdown)
  - Advantages Owned

**Purpose**: One-stop overview of player's game status

---

### ✅ 4. Picks Page - Contestant Selection
**Status**: Fully functional
**Route**: `/picks`

**Two Pick Types**:

**Instinct Pick**:
- Available before season starts
- Choose 1 contestant from all 18
- Can change until admin locks picks
- Once locked: Shows selected contestant, no changes allowed
- If no submission when locked: "Picks locked - no submission"

**Final Pick**:
- Unlocks when admin enables "Merge"
- Choose 1 contestant from remaining (non-eliminated) contestants
- Can change until admin locks final picks
- Before merge: Shows "Available after merge"
- Once locked: Shows selected contestant

**UI Features**:
- Dropdown selection from cast list
- Current pick displayed if already submitted
- Green confirmation when pick submitted
- Lock status clearly indicated
- "Submit/Update Pick" button

**Data Storage**:
- Stored in `picks` array with structure:
  ```javascript
  {
    id: timestamp,
    playerId: number,
    contestantId: number,
    type: 'instinct' | 'final',
    timestamp: number
  }
  ```

---

### ✅ 5. Leaderboard Page - Rankings & Breakdowns
**Status**: Fully functional
**Route**: `/leaderboard`

**Features**:
- Real-time player rankings sorted by total points
- **Rank Badges**:
  - 1st place: Gold badge
  - 2nd place: Silver badge
  - 3rd place: Bronze badge
  - Others: Orange badge
- Player initial circles (Survivor-style)
- Admin crown icon for Joshua
- "YOU" badge for current user
- **Expandable Breakdown**: Click any player to see:
  - Point history with descriptions
  - Date of each score change
  - Positive (green) and negative (red) point values
  - Categories: Questionnaires, Episodes, QOTW wins, Advantages

**Point Breakdown Example**:
```
+ Week 1 Questionnaire: +3 pts (Jan 20)
+ Episode 1 Pick Performance: +2 pts (Jan 20)
+ QOTW Winner - Week 1: +5 pts (Jan 22)
- Purchased: Extra Vote: -5 pts (Jan 28)
```

**Data Structure**:
```javascript
playerScores[playerId] = {
  totalPoints: number,
  breakdown: [
    {
      description: string,
      points: number (can be negative),
      date: ISO_string
    }
  ]
}
```

---

### ✅ 6. Advantages Page - Power-Ups
**Status**: Fully functional
**Route**: `/advantages`

**Two Sections**:

**Your Advantages** (top):
- Grid of purchased advantages
- Shows: Name, description, purchase date
- Status: "Used" or "Use Advantage" button
- Empty state: "You haven't purchased any advantages yet"

**Available Advantages** (bottom):
- 9 default advantages to purchase:
  1. Extra Vote (5 pts) - Cast additional QOTW vote
  2. Vote Steal (8 pts) - Steal someone's QOTW vote
  3. Double Points (10 pts) - 2x points next questionnaire
  4. Immunity Idol (12 pts) - Protect from negative points
  5. Spy Network (6 pts) - See others' answers
  6. Point Shield (7 pts) - Block one deduction
  7. Fortune Teller (9 pts) - Hint for next questionnaire
  8. Risk & Reward (15 pts) - Double or nothing
  9. Legacy Advantage (20 pts) - Transfer points to player

**Purchase Flow**:
1. Click "Purchase" button
2. Confirmation dialog
3. Points deducted from player's score
4. Advantage added to "Your Advantages"
5. Breakdown entry: "Purchased: [Advantage Name]: -[cost] pts"

**Disabled State**: 
- "Insufficient Points" button when can't afford

**Data Storage**:
```javascript
playerAdvantages = [
  {
    id: timestamp,
    playerId: number,
    advantageId: string,
    name: string,
    description: string,
    purchasedAt: ISO_string,
    used: boolean
  }
]
```

---

### ✅ 7. Admin Panel - Game Management
**Status**: Partially functional (2 of 6 tabs complete)
**Route**: `/admin` (only visible to admin)
**Access**: Joshua only (isAdmin: true)

**Tab Structure**:
6 tabs available:
1. ✅ **Game Control** - COMPLETE
2. ✅ **Cast Management** - COMPLETE
3. ⏳ **Questionnaires** - Placeholder
4. ⏳ **Grading** - Placeholder
5. ⏳ **QOTW Management** - Placeholder
6. ⏳ **Episode Scoring** - Placeholder

#### Tab 1: Game Control (COMPLETE)

**Picks Management**:
- "Lock/Unlock Instinct Picks" button
- "Lock/Unlock Final Picks" button
- Current lock states displayed

**Season Progress**:
- "Enable Merge" button (toggles merge availability)
- Current game state summary:
  - Instinct Picks: 🔒 Locked / 🔓 Open
  - Final Picks: 🔒 Locked / 🔓 Open
  - Merge: ✓ Happened / ✗ Not yet
  - Current Week: [number]

**Actions**:
- Locking picks prevents players from changing selections
- Enabling merge opens Final Pick section for all players
- All changes save to MongoDB game_state immediately

#### Tab 2: Cast Management (COMPLETE)

**Features**:
- Grid display of all 18 contestants
- Each card shows: Photo, name, tribe
- Status indicator: Active or "✗ Eliminated"
- "Mark Eliminated" button for active contestants

**Elimination Flow**:
1. Admin clicks "Mark Eliminated"
2. Confirmation dialog
3. Contestant marked with `eliminated: true`
4. Card turns red with "✗ Eliminated" status
5. Removed from Final Pick dropdown for players

**Purpose**: 
- Track which contestants are still in the game
- Filter eliminated contestants from player pick options

---

### ✅ 8. Navigation System
**Status**: Fully functional

**Top Header**:
- Flame logo + "Survivor Fantasy" title
- "Season 48" subtitle
- User info (right side):
  - "Welcome back, [Name]"
  - Current point total
  - Admin crown (if admin)
  - Logout button

**Navigation Bar**:
- 6 main pages (with icons):
  - 🏠 Home
  - 📊 Dashboard
  - 🎯 Picks
  - 📝 Questionnaire
  - 🏆 Leaderboard
  - 🎁 Advantages
- Admin-only (if isAdmin):
  - 👑 Admin
- Active page highlighted with amber border
- Mobile responsive (horizontal scroll)

**Footer**:
- "The tribe has spoken. May the odds be ever in your favor."
- "Survivor Fantasy Game • Season 48"

---

### ✅ 9. Game State Management
**Status**: Fully functional

**Global State Object**:
```javascript
gameState = {
  instinctPicksLocked: boolean,
  finalPicksLocked: boolean,
  hasMergeHappened: boolean,
  currentWeek: number,
  seasonActive: boolean
}
```

**Stored in MongoDB**: `game_state` key

**Usage Throughout App**:
- Controls whether Picks page allows submissions
- Shows/hides Final Pick section
- Displays lock status on Dashboard
- Admin can toggle all flags

---

### ✅ 10. Player Score System
**Status**: Fully functional

**Score Structure**:
```javascript
playerScores[playerId] = {
  totalPoints: number,
  breakdown: [
    { description, points, date }
  ]
}
```

**Point Sources** (currently implemented):
- Advantage purchases (negative points)
- Manual admin updates (future: questionnaires, episodes, QOTW)

**Update Function**:
```javascript
updatePlayerScore(playerId, points, description)
```
- Adds points to total
- Appends breakdown entry with timestamp
- Saves to MongoDB

**Display Locations**:
- Header: Always visible
- Dashboard: Large prominent display
- Leaderboard: Full breakdown expandable

---

## FEATURES PENDING IMPLEMENTATION

### ⏳ 1. Questionnaire System
**Status**: Placeholder page exists
**Complexity**: HIGH (most complex feature)

**What's Needed**:
- Admin questionnaire creation interface
- 3 question types:
  - Multiple Choice (4 options)
  - Cast Dropdown (select contestant)
  - QOTW (free text)
- **CRITICAL RULE**: Each questionnaire MUST have exactly 1 QOTW
- Validation to enforce QOTW requirement
- Player submission form
- Auto-deadline: Next Wednesday 7:59 PM EST
- Auto-lock: Wednesday 9:00 PM EST (episode start)
- Late submission penalties (-1, -2, -3 cumulative)

**QOTW Inline Voting** (3 States):
1. **Not Open**: Clock icon + "Voting Not Yet Open"
2. **Voting Open**: 
   - Radio buttons for all answers (except your own)
   - Real-time vote counts visible
   - Cannot vote for yourself
   - Can only vote once
3. **Voting Closed**:
   - Final results sorted by votes
   - Winner highlighted with "+5 pts" badge

**Must Be**: Inline on Questionnaire page, NOT in a modal

---

### ⏳ 2. Questionnaire Grading (Admin)
**Status**: Admin tab placeholder exists
**Complexity**: MEDIUM

**What's Needed**:
- Admin selects questionnaire to grade
- Lists all player submissions
- Input correct answers for each question
- **CRITICAL**: Skip QOTW questions (type === 'qotw')
- Scoring: +2 correct, -1 incorrect (optional), 0 wrong (required)
- Preview scores before releasing
- "Release Scores" button
- Updates player scores with breakdown

**Validation Rules**:
- Can only grade questionnaires with status 'active'
- After grading, status changes to 'graded'
- QOTW must not be graded for correctness

---

### ⏳ 3. QOTW Management (Admin)
**Status**: Admin tab placeholder exists
**Complexity**: MEDIUM

**What's Needed**:
- Admin selects graded questionnaire
- "Open QOTW Voting" button
- Live vote tally display
- "Close QOTW Voting" button
- "Award Winner" button (after closing)
- Automatically adds +5 points to winner

**Flow**:
1. Questionnaire graded by admin
2. Admin opens QOTW voting
3. Players vote on best answer
4. Admin closes voting when ready
5. Admin awards winner 5 bonus points
6. Breakdown entry: "QOTW Winner - Week X: +5 pts"

---

### ⏳ 4. Episode Scoring (Admin)
**Status**: Admin tab placeholder exists
**Complexity**: HIGH

**What's Needed**:
- Admin inputs episode/week number
- System finds all players with picks
- For each player's picks (instinct + final):
  - Checkboxes:
    - ☑ Survived episode (+1)
    - ☑ Found idol/advantage (+2)
    - ☑ Went on journey (+1)
    - ☑ Won immunity (+1)
  - Real-time point calculation
- "Submit Episode Scoring" button
- Updates all player scores

**Critical Logic**:
```javascript
// Finding players with picks
const allKeys = await storage.list('');
const playerIds = new Set();

allKeys.keys.filter(k => k.startsWith('instinct_picks_')).forEach(k => {
  playerIds.add(k.replace('instinct_picks_', ''));
});

allKeys.keys.filter(k => k.startsWith('final_picks_')).forEach(k => {
  playerIds.add(k.replace('final_picks_', ''));
});
```

**Important**: 
- Always update score even if 0 points (for tracking)
- Include breakdown entry for every episode

---

### ⏳ 5. Advantage Usage
**Status**: Purchase works, usage not implemented
**Complexity**: MEDIUM

**What's Needed**:
- "Use Advantage" button functionality for each advantage type
- Different logic per advantage:
  - Extra Vote: Add extra QOTW vote capability
  - Vote Steal: Select player to steal vote from
  - Double Points: Apply 2x multiplier to next questionnaire
  - Immunity Idol: Activate protection from negative points
  - Spy Network: Reveal other players' answers
  - Point Shield: Activate shield
  - Fortune Teller: Display hint for upcoming questionnaire
  - Risk & Reward: Choose episode to double or lose points
  - Legacy Advantage: Select player and transfer point amount

**Each Usage**:
- Mark advantage as `used: true`
- Apply effect based on advantage type
- Some effects are immediate, some are ongoing

---

### ⏳ 6. Notifications System
**Status**: Not implemented
**Complexity**: LOW

**What's Needed**:
- Notification badge in header (mail icon with count)
- In-app notifications for:
  - New questionnaire available
  - Scores released
  - Final picks now open
  - QOTW voting open
  - Someone used advantage on you

**Storage**:
```javascript
notifications = [
  {
    id: timestamp,
    type: string,
    message: string,
    targetPlayerId: number | null,
    read: boolean,
    createdAt: ISO_string
  }
]
```

---

### ⏳ 7. Historical Questionnaires View
**Status**: Not implemented
**Complexity**: LOW

**What's Needed**:
- On Questionnaire page, show "Previous Questionnaires" section
- List of archived questionnaires
- Click to expand and see:
  - Your submitted answers
  - Correct answers
  - Your score
  - QOTW results

---

## USER ROLES & ACCESS

### Players (Standard Access)
**Count**: 9 users
**Names**: Joshua, Charlie, Emma, Tyler, Brayden, Dakota, Patia, Kaleigh, Sarah

**Can Access**:
- Home (cast display)
- Dashboard (personal stats)
- Picks (submit instinct + final)
- Questionnaire (answer questions, vote QOTW)
- Leaderboard (view rankings + breakdowns)
- Advantages (purchase + use)

**Cannot Access**:
- Admin panel

---

### Admin (Full Access)
**Count**: 1 user
**Name**: Joshua
**Flag**: `isAdmin: true`

**Additional Access**:
- Admin panel with 6 tabs
- Game control (lock picks, enable merge)
- Cast management (mark eliminated)
- Questionnaire creation (pending)
- Grading (pending)
- QOTW management (pending)
- Episode scoring (pending)

**Note**: Admin also plays as a regular contestant

---

## NAVIGATION & PAGES

### Complete Page Flow

```
Login Page
    ↓ (successful login)
Home Page (default)
    ↓ (navigation bar)
┌──────────────────────────────────────┐
│ Home | Dashboard | Picks | Quest... │
│ Leaderboard | Advantages | [Admin]  │
└──────────────────────────────────────┘
```

### Page Details

| Page | Route | Status | Purpose |
|------|-------|--------|---------|
| Home | / | ✅ Complete | View cast by tribe |
| Dashboard | /dashboard | ✅ Complete | Personal overview |
| Picks | /picks | ✅ Complete | Submit picks |
| Questionnaire | /questionnaire | ⏳ Placeholder | Answer weekly questions |
| Leaderboard | /leaderboard | ✅ Complete | Rankings & breakdowns |
| Advantages | /advantages | ✅ Complete | Purchase power-ups |
| Admin | /admin | 🔶 Partial | Game management (2/6 tabs) |

---

## DATABASE SCHEMA

### Storage Method
**Type**: Key-Value store in MongoDB
**Collection**: `game_data`
**Structure**:
```javascript
{
  key: string,
  value: string (JSON stringified),
  updatedAt: Date
}
```

### Current Keys in Use

#### 1. `players`
**Value**: Array of player objects
```javascript
[
  {
    id: number,
    name: string,
    phone: string,
    isAdmin: boolean
  }
]
```
**Initial Data**: 9 players (INITIAL_PLAYERS array)

---

#### 2. `contestants`
**Value**: Array of Survivor contestants
```javascript
[
  {
    id: number,
    name: string,
    tribe: 'Manu' | 'Loto' | 'Moana',
    age: number,
    hometown: string,
    bio: string,
    image: string (URL),
    eliminated: boolean
  }
]
```
**Initial Data**: 18 contestants (SURVIVOR_48_CAST array)

---

#### 3. `picks`
**Value**: Array of all player picks
```javascript
[
  {
    id: number (timestamp),
    playerId: number,
    contestantId: number,
    type: 'instinct' | 'final',
    timestamp: number
  }
]
```

---

#### 4. `game_state`
**Value**: Global game settings
```javascript
{
  instinctPicksLocked: boolean,
  finalPicksLocked: boolean,
  hasMergeHappened: boolean,
  currentWeek: number,
  seasonActive: boolean
}
```

---

#### 5. `player_scores`
**Value**: Object mapping player IDs to score data
```javascript
{
  "1": {
    totalPoints: number,
    breakdown: [
      {
        description: string,
        points: number,
        date: ISO_string
      }
    ]
  },
  "2": { ... }
}
```

---

#### 6. `advantages`
**Value**: Array of available advantages
```javascript
[
  {
    id: string,
    name: string,
    description: string,
    cost: number,
    type: string
  }
]
```
**Initial Data**: 9 advantages (DEFAULT_ADVANTAGES array)

---

#### 7. `player_advantages`
**Value**: Array of purchased advantages
```javascript
[
  {
    id: number (timestamp),
    playerId: number,
    advantageId: string,
    name: string,
    description: string,
    purchasedAt: ISO_string,
    used: boolean
  }
]
```

---

#### 8. `password_{playerId}`
**Value**: Plain string (password)
**Example**: `password_1` = "mypassword123"
**Note**: Passwords are stored per player

---

#### 9. `recovery_{playerId}`
**Value**: 3-digit recovery code
**Example**: `recovery_1` = "542"
**Note**: Temporary codes for password recovery

---

### Planned Keys (Not Yet Used)

- `questionnaires` - Array of questionnaire objects
- `submissions` - Array of player submissions
- `qotWVotes` - Array of QOTW vote objects
- `episodes` - Array of episode scoring data
- `notifications` - Array of notification objects

---

## API ENDPOINTS

### Base URL
- **Development**: `http://localhost:5173/api`
- **Production**: `https://your-app.vercel.app/api`

### Available Endpoints

#### GET /api/storage/:key
**Description**: Retrieve value for a key
**Response**:
```json
{
  "key": "players",
  "value": "[...]"
}
```
**Error**: 404 if key not found

---

#### POST /api/storage/:key
**Description**: Set/update value for a key
**Body**:
```json
{
  "value": "..."
}
```
**Response**:
```json
{
  "key": "players",
  "value": "..."
}
```

---

#### DELETE /api/storage/:key
**Description**: Delete a key
**Response**:
```json
{
  "key": "recovery_1",
  "deleted": true
}
```

---

#### GET /api/storage?prefix=xxx
**Description**: List all keys with optional prefix
**Example**: `/api/storage?prefix=instinct_picks_`
**Response**:
```json
{
  "keys": ["instinct_picks_1", "instinct_picks_2"],
  "prefix": "instinct_picks_"
}
```

**Note**: If no prefix, returns all keys

---

## DEPLOYMENT SETUP

### GitHub Repository
- **Auto-Deploy**: Enabled (pushes to main branch trigger deployment)
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`

### Vercel Configuration

**Environment Variables** (set in Vercel dashboard):
```
MONGODB_URI=mongodb+srv://survivoradmin:survivor50db@survivorfantasy.ynlkjbr.mongodb.net/survivor_fantasy?retryWrites=true&w=majority&appName=SurvivorFantasy
```

**Build Settings**:
- Framework Preset: Vite
- Node Version: 18.x
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `dist`

### MongoDB Atlas
- **Cluster**: SurvivorFantasy
- **Database**: survivor_fantasy
- **Collection**: game_data
- **Network Access**: Allow from anywhere (0.0.0.0/0)
- **User**: survivoradmin (read/write access)

---

## KNOWN ISSUES & LIMITATIONS

### Current Issues

1. **Session Persistence**
   - User session stored in React state only
   - Page refresh logs user out
   - **Solution**: Implement localStorage session or JWT tokens

2. **Password Security**
   - Passwords stored as plain text in MongoDB
   - **Solution**: Implement bcrypt hashing

3. **Image Loading**
   - Survivor Wiki images sometimes fail to load
   - Fallback placeholder exists but not ideal
   - **Solution**: Host images on Cloudinary or AWS S3

4. **Mobile Navigation**
   - Navigation bar scrolls horizontally on small screens
   - Functional but not ideal UX
   - **Solution**: Implement hamburger menu for mobile

5. **No Real-Time Updates**
   - Changes by other players not visible until page refresh
   - **Solution**: Implement WebSocket or polling

6. **QOTW System Not Implemented**
   - Most complex feature still pending
   - Blocks full gameplay loop
   - **Solution**: Build questionnaire + QOTW system next

---

### Technical Limitations

1. **Single-File Component**
   - Entire app in one 2000+ line app.jsx
   - Difficult to maintain and debug
   - **Recommendation**: Refactor into separate component files

2. **No Error Boundaries**
   - React errors crash entire app
   - **Recommendation**: Add error boundaries for graceful failures

3. **No Loading States**
   - MongoDB calls can be slow
   - No spinners or loading indicators
   - **Recommendation**: Add loading states to all async operations

4. **No Input Validation**
   - Forms accept any input
   - No client-side validation
   - **Recommendation**: Add validation with error messages

5. **No Confirmation Dialogs**
   - Some destructive actions (delete, eliminate) need better UX
   - Currently using `window.confirm()` (basic)
   - **Recommendation**: Build custom modal components

---

### Design Limitations

1. **Color Scheme**
   - Heavy use of amber/orange/red (Survivor theme)
   - May be too intense for long sessions
   - Accessibility concerns (contrast ratios)

2. **Responsiveness**
   - Works on mobile but not optimized
   - Some text too small on phones
   - Some buttons hard to tap

3. **Typography**
   - All text in system fonts
   - No distinctive branding
   - **Recommendation**: Add custom font for headers

---

## NEXT STEPS

### Priority 1: Complete Questionnaire System
**Estimated Time**: 8-10 hours
**Tasks**:
1. Build admin questionnaire creation form
2. Implement QOTW validation (exactly 1 per questionnaire)
3. Build player submission form
4. Implement deadline and late penalty logic
5. Build QOTW inline voting (3 states)
6. Test full workflow end-to-end

---

### Priority 2: Complete Admin Panel
**Estimated Time**: 6-8 hours
**Tasks**:
1. Build Grading tab (grade submissions, skip QOTW)
2. Build QOTW Management tab (open/close voting, award winner)
3. Build Episode Scoring tab (checkboxes + point calculation)
4. Test admin workflows

---

### Priority 3: Refactor for Maintainability
**Estimated Time**: 4-6 hours
**Tasks**:
1. Split app.jsx into separate component files
2. Create proper folder structure (components/, pages/, utils/)
3. Extract constants to separate file
4. Add PropTypes or TypeScript for type safety

---

### Priority 4: Improve UX/UI
**Estimated Time**: 4-6 hours
**Tasks**:
1. Add loading spinners to all async operations
2. Add success/error toast notifications (replace alerts)
3. Build custom modal