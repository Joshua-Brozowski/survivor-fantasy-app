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
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # React entry point
│   └── db.js             # Storage API wrapper
├── api/
│   └── storage.js        # MongoDB serverless function
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── vercel.json           # Vercel deployment config
└── .env                  # Environment variables (not in git)
```

## Key Features

### 1. Authentication
- Simple name/password login system
- Password recovery with 3-digit SMS simulation
- Passwords stored in MongoDB per player

### 2. Player Roles
- **Players**: 9 friends competing in the league
- **Admin (Jeff)**: Has special controls panel, also plays as a contestant

### 3. Game Phases
- `instinct-picks` - Pre-season pick selection
- `early-season` - Episodes 1-4
- `final-picks` - Post-merge pick selection (triggered by admin)
- `mid-season` - Merge to finale
- `finale` - Final episodes

### 4. Picks System
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

### 5. Weekly Questionnaire
**Creation** (Admin):
- Title, episode number
- Question types: Tribe Immunity, Individual Immunity, Vote Out, Multiple Choice, True/False
- Question of the Week (text response)
- Auto-deadline: Next Wednesday 7:59 PM EST
- Auto-lock: Wednesday 9:00 PM EST (episode start)

**Submission** (Players):
- Answer required questions (immunity, vote-out)
- Optional prop-bet questions
- Question of the Week (required text response)
- Late penalties: -1, -2, -3... (cumulative per season)

**Scoring**:
- Correct answer: +2
- Incorrect required: 0
- Incorrect optional: -1
- No answer on optional: 0
- Late penalty: Variable based on offense count

**Question of the Week**:
- All players vote on best answer (after all submit)
- Cannot vote for yourself
- Winner(s) get +5 points
- Ties: all tied players get +5
- Can be anonymous or named (admin choice)

### 6. Leaderboard
- Real-time rankings
- Medal badges (gold, silver, bronze)
- Player initials in Survivor-style circles
- Total points from picks + questionnaires + QotW wins
- Stats: Leader, your rank, average score

### 7. Admin Controls (Jeff's Panel)

**Create Questionnaire**:
- Build weekly questionnaire with multiple question types
- Auto-archives previous questionnaires
- Sends notifications to all players

**Score Questionnaire**:
- View all player submissions
- Enter correct answers for each question
- Preview scores before releasing
- Auto-calculates QotW winner from votes
- Release scores with one click

**Manage Cast**:
- Mark contestants as eliminated
- Eliminated contestants removed from questionnaire dropdowns
- Visual indicators for eliminated status

**Advance Game Phase**:
- Progress through season phases
- Opens final picks when ready
- Sends notifications to players

### 8. Advantages System
**Types**: Custom advantages created by admin
- Examples: "Thief in Shadows" (steal points), "Double Trouble" (double points)
- Can require target player
- Optional expiration by episode number
- One-time use

**Usage**: Players activate from their Advantages tab

### 9. Notifications
In-app notification badge shows:
- New questionnaire available
- Scores released
- Final picks opening
- Advantages received

## Database Schema

### Storage Collections
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
- `advantages` - Array of advantage objects
- `episodes` - Array of episode recaps
- `notifications` - Array of notification objects
- `password_{playerId}` - Individual player passwords
- `recovery_{playerId}` - Temporary recovery codes

### Key Data Structures

**Player**:
```javascript
{
  id: number,
  name: string,
  phone: string,
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

**Pick**:
```javascript
{
  id: number,
  playerId: number,
  contestantId: number,
  type: 'instinct' | 'final',
  timestamp: number
}
```

**Questionnaire**:
```javascript
{
  id: number,
  title: string,
  episodeNumber: number,
  questions: Question[],
  qotw: { id: string, text: string, anonymous: boolean },
  deadline: ISO_string,
  lockedAt: ISO_string,
  status: 'active' | 'archived',
  scoresReleased: boolean,
  correctAnswers: object,
  qotwWinner?: number[]
}
```

**Submission**:
```javascript
{
  id: number,
  questionnaireId: number,
  playerId: number,
  answers: object,
  submittedAt: ISO_string,
  penalty: number,
  score?: number
}
```

## API Routes

### `/api/storage/:key`
Serverless function handling all database operations:

- **GET** - Retrieve value by key
- **POST** - Set/update value for key
- **DELETE** - Delete key
- **GET** (no key) - List keys with optional prefix

Returns JSON: `{ key, value }` or `{ keys, prefix }`

## Environment Variables

### Local (.env)
```
MONGODB_URI=mongodb+srv://survivoradmin:survivor50db@survivorfantasy.ynlkjbr.mongodb.net/survivor_fantasy?retryWrites=true&w=majority&appName=SurvivorFantasy
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
1. Push to GitHub main branch
2. Vercel auto-deploys in ~2 minutes
3. Live at: `https://survivor-fantasy-app.vercel.app`

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
- **Manu** (6 contestants)
- **Loto** (6 contestants)
- **Moana** (6 contestants)

Cast loaded from Survivor Wiki with images.

## Development Guidelines

### Adding New Features
1. Update state management in `App.jsx`
2. Create component function if needed
3. Add to navigation if user-facing
4. Update storage schema if persisting data
5. Test locally with `npm run dev`
6. Push to GitHub for auto-deploy

### Common Tasks

**Add a new player**:
```javascript
// In INITIAL_PLAYERS array
{ id: 10, name: "NewPlayer", phone: "1234567899", isAdmin: false }
```

**Change game phase**:
- Use "Advance Game Phase" button in Jeff's Controls
- Or manually update `gamePhase` in storage

**Reset for new season**:
- Update `SURVIVOR_48_CAST` with new contestants
- Reset picks, questionnaires, submissions in database
- Set `gamePhase` back to 'instinct-picks'

**Modify scoring rules**:
- Update `calculateTotalPoints()` function
- Update `calculateScores()` in AdminPanel

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
- Replace with stable image URLs
- Consider hosting images in `/public` folder

**Late penalty not applying**:
- Verify system time vs deadline time
- Check `latePenalties` object in database
- Ensure `isLate` calculation is correct

## Future Enhancements

### Planned Features
- [ ] Dashboard with stats overview
- [ ] Advantages activation interface
- [ ] Episode recap auto-generation (AI)
- [ ] Pick scoring automation
- [ ] Email notifications (vs in-app only)
- [ ] Historical season tracking
- [ ] Export standings to PDF/Excel
- [ ] Mobile app version

### Known Limitations
- No real SMS for password recovery (simulated)
- No email notifications (in-app only)
- Admin must manually score picks each episode
- No undo for eliminated contestants
- Single season support (no multi-season tracking)

## Contact & Credits
Created for Joshua's annual Survivor Fantasy League with college friends.
Built with assistance from Claude (Anthropic) - December 2024.

**Game Master**: Joshua
**Season**: Survivor 48 (premieres February 2026)
**Hosting**: Vercel
**Database**: MongoDB Atlas

---

*For Claude/AI assistants working on this codebase*: This app is fully functional and deployed. The main component is in `App.jsx` with all game logic, views, and state management. The admin panel has full CRUD operations for questionnaires and game management. MongoDB handles all persistence through the `/api/storage` serverless function. Focus on maintaining the existing architecture when adding features.