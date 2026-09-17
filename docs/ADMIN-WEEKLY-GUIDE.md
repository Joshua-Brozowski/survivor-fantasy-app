# Admin Weekly Guide — Survivor Fantasy League

This guide is the single reference for running the game each week. Bookmark it.

---

## Pre-Season Launch Steps

These are one-time setup tasks before Episode 1 airs.

1. **Start New Season** (if not done)
   - Admin Panel → Season Management → Start New Season
   - Enter the new season number and confirm
   - This resets all picks, scores, questionnaires, and advantages

2. **Load the Cast**
   - Admin Panel → Edit Cast
   - If the cast list is empty, click the yellow "Load Default Cast" button
   - Otherwise add contestants manually or drag-and-drop photos

3. **Set Phase to `instinct-picks`**
   - Admin Panel → Phase Control
   - Should already be the default after a season reset
   - This is the phase where players make their pre-season picks

4. **Unlock Instinct Picks**
   - Phase Control panel → Picks Lock section → ensure Instinct picks are Unlocked
   - Players can now visit the Picks tab and choose their pre-season contestant

5. **Confirm Players Are In**
   - Admin Panel → Player Management → verify all 9 players appear
   - New player? Click "Add Player" — they get default password `password123`

6. **Send a Tree Mail blast**
   - Admin Panel → Tree Mail → "Send to All"
   - Let everyone know picks are open and the season has started

7. **Lock Instinct Picks before Episode 1**
   - Phase Control → Instinct Picks → Lock
   - Do this before the premiere airs so no one changes their pick mid-episode

8. **Advance to `early-season`**
   - Phase Control → Next Phase
   - Confirm the prompt; this opens episode scoring and questionnaires

---

## The Weekly Episode Cycle

### Monday – Tuesday (Pre-Episode Prep)
- Nothing required unless you want to pre-create this week's questionnaire
  - Admin Panel → Create Questionnaire
  - Set a release date/time in the future (optional scheduled feature)
  - Episode number auto-populates with the next number — verify it is correct
  - Add your questions, toggle QotW on/off, save

### Wednesday Night (Episode Night)

**Before 8:00 PM EST (episode start)**
- If you haven't created the questionnaire yet, do it now
- Questionnaire auto-locks at 9:00 PM EST (after episode starts)
- Players have until Wednesday at 7:59 PM to submit

**After the episode airs**
- See Thursday section — scoring happens Thursday morning once you've watched

### Thursday Morning (Scoring Day)

Exact order matters. Do NOT skip steps.

**Step 1 — Mark Eliminations**
- Admin Panel → Eliminations
- Toggle eliminated contestants — do this FIRST before any scoring
- Each elimination auto-creates a backup snapshot before saving

**Step 2 — Score Episode Picks**
- Admin Panel → Episode Scoring
- Episode number should auto-populate — verify it is correct
- For each remaining contestant with picks, check the appropriate boxes:
  - Survived, Made Merge (instinct only), Won Immunity, Won Reward, Journey
  - Found Idol/Advantage, Played Idol/Advantage, Incorrect Vote, Voted Out with Idol
  - Votes Received (enter count in the number field)
  - Finale bonuses only at end of season: Final 5, Final 3, Sole Survivor
- Click "Preview Scores" to see what each player would earn
- Click "Confirm & Save Scores" to commit (auto-backup is created first)

**Step 3 — Score the Questionnaire**
- Admin Panel → Score Questionnaire
- Select the correct answer for each question from the dropdowns
- Review the QotW section — auto-calculates the vote winner
- Check the "No Submission" penalty waiver toggles for any players you want to waive
- Click "Preview" to verify scores look right
- Click "Release Scores" (creates auto-backup first)
- All players receive a notification that scores are posted

**Step 4 — Award QotW Winner (if voting open)**
- Admin Panel → QOTW Management
- Click "Close Voting" if it is still open
- Click "Award Winner" — top vote-getter earns +5 points

**Step 5 — Check the Weekly Checklist**
- Top of Admin Panel shows the checklist: Q / QotW / Picks / Elim / Wordle
- All items should show Done/Complete before you consider the week finished

---

## Phase Advancement Guide

There are 5 phases. Advance when the real show reaches that milestone.

| Phase | Name | When to Advance To It |
|-------|------|-----------------------|
| 1 | `instinct-picks` | Start of season (default) |
| 2 | `early-season` | After locking instinct picks before Episode 1 |
| 3 | `final-picks` | After merge episode airs — opens Final Pick for all players |
| 4 | `mid-season` | After all players have submitted Final Picks and you lock them |
| 5 | `finale` | When the finale episode is approaching |

**Advancing**: Phase Control → Next Phase button (no confirmation needed going forward)

**Going backward**: Requires a confirmation prompt. Only do this if something went wrong. Going backward does NOT undo any scores or data — it only changes the UI phase gate.

**Picks Lock**:
- Instinct Picks: Lock before Episode 1 airs
- Final Picks: Unlock when you advance to `final-picks`, lock before the next episode after merge

---

## Advantages Management

Advantages are scarce (one owner at a time). They auto-resolve at score release.

**Granting Steal an Advantage Token**
- Admin Panel → Advantage Inspector → select a player → Grant Steal Token
- Player receives Tree Mail notification and a gold "Special Power" section in their Advantages tab
- Token expires in 3 days — remind the player if needed
- Player selects which advantage to steal from the modal; it executes atomically

**Checking Active Advantages**
- Admin Panel → Advantage Inspector → shows all active, queued, and used advantages

**What happens at score release**
1. Double Trouble: doubles the player's questionnaire + QotW points for that episode
2. Thief in the Shadows: transfers 5 points from the target to the player
3. Both are marked Used and return to the shop for others to buy

**If something resolves wrong**
- Restore from the `before-release-scores` snapshot (see Emergency Procedures)
- Re-score after fixing the issue

---

## Wordle Management

The Wordle schedule is pre-loaded for the season (`DEFAULT_WORDLE_SCHEDULE`).

**Automatic behavior**
- Challenges auto-release Thursday when any player loads the app
- Challenges auto-close Wednesday when you (admin) load the app
- After auto-close, manually click "Award Winner" in the checklist

**Manual override**
- Admin Panel → Wordle Schedule → Edit any week's word/date
- Click "Rollback" to undo the auto-release of a challenge that released too early

**Awarding the winner**
- Click "End Challenge" then confirm in the Wordle section of the checklist
- Top player earns +3 points; notification sent to all

---

## End of Season (Finalize)

Run these steps after the finale airs and all scoring is complete.

1. **Score the finale episode**
   - Use Episode Scoring as normal
   - Apply Finale Bonuses: Final 5 (+10), Final 3 (+15), Sole Survivor (+20) — one per contestant

2. **Award final QotW winner**
   - QOTW Management → Close Voting → Award Winner

3. **End any active Wordle challenge**
   - Wordle section → End Challenge

4. **Finalize the season**
   - Admin Panel → Season Management → Finalize Season
   - Review the podium and fun stats
   - Click "Finalize" — triggers confetti for all players when they view the leaderboard

5. **Archive and start next season**
   - Season Management → Archive Current Season (saves data for historical reference)
   - Season Management → Start New Season (resets game data, keeps players)

---

## Emergency Procedures

### Restore from Backup
- Admin Panel → Backup Management
- Find the relevant snapshot (labeled by trigger, e.g., `before-release-scores`)
- Click "Restore" — creates a safety backup first, then reverts all data
- Hard refresh the browser after restoring

### Un-Eliminate a Contestant
- Admin Panel → Eliminations
- Find the contestant — there is a toggle/button to restore them
- Each un-elimination auto-creates a backup before saving

### Re-Score a Questionnaire
- Admin Panel → Score Questionnaire → find the already-released questionnaire
- Click "Re-Score" button (visible after scores are released)
- Change the correct answers and re-release
- Note: Advantage effects (Double Trouble, etc.) are NOT re-applied during re-score
- Auto-backup is created before re-scoring

### Recover from a Bad Score Release
1. Admin Panel → Backup Management
2. Find `before-release-scores` snapshot with the correct timestamp
3. Restore it
4. Re-score the questionnaire correctly
5. Release again

### Delete a Player's Submission
- Score Questionnaire → find the player's row → trash icon
- Confirms before deleting; creates `before-delete-submission` snapshot first
- Appended to Submission Audit Log for accountability

### Player Locked Out (Rate Limited)
- Admin Panel → Player Management → Rate Limit section (or direct MongoDB Atlas)
- Delete the `ratelimit_IP_PLAYERID` document for that player
- Or wait 15 minutes for the lockout to expire automatically

### Reset a Player's Password
- Admin Panel → Password Management → Reset to Default
- Player's new password becomes `password123`
- Tell them to change it immediately in Settings
