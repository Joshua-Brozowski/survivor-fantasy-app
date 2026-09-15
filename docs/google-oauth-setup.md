# Google OAuth Setup Guide

## One-time Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create a new project: click the project dropdown at top → "New Project" → name it "Survivor Fantasy" → Create
3. In the left menu: APIs & Services → OAuth consent screen
   - User Type: External → Create
   - App name: Survivor Fantasy
   - User support email: your email
   - Application home page: `https://survivor-fantasy-app-gamma.vercel.app`
   - Add your email to "Developer contact information"
   - Save and Continue through all steps (scopes, test users — skip for now)
4. APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: Survivor Fantasy Web
   - Authorized JavaScript origins: `https://survivor-fantasy-app-gamma.vercel.app`
   - Authorized redirect URIs: click "+ Add URI" → enter exactly:
     `https://survivor-fantasy-app-gamma.vercel.app/api/auth-google`
   - Click Create
5. Copy the **Client ID** and **Client Secret**

## Add to Vercel

1. Go to https://vercel.com → your project → Settings → Environment Variables
2. Add `GOOGLE_CLIENT_ID` = (paste client ID)
3. Add `GOOGLE_CLIENT_SECRET` = (paste client secret)
4. Redeploy (or wait for next push to main)

## How Players Link Their Google Account

Players do this themselves — no admin action required:

1. Player logs out (or opens the app fresh)
2. Click "Sign in with Google"
3. If their Google email isn't linked yet, the app shows a **"Link Your Google Account"** screen
4. They enter their player name + existing password (one time only to prove identity)
5. Their Google email is saved and they're logged in — future sign-ins just need Google

**Alternatively, from Settings (while logged in via password):**
1. Click the gear icon (top right) to open Settings
2. Scroll to "Google Account" section
3. Click "Link Google Account"
4. Sign in with Google — email is linked automatically

## Admin Override

If a player can't self-link (e.g., forgot password, no security question set):
1. Log in as admin (Joshua)
2. Admin Panel → Player Management → scroll to "Google Account Mapping"
3. Enter the player's Google email address next to their name
4. Click "Save Email Mapping"

## Testing

1. Open the app in an incognito window
2. Click "Sign in with Google"
3. Sign in with a Google account linked to a player
4. Should log in automatically (or show the link screen if not yet linked)
