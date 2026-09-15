# Google OAuth Setup Guide

## One-time Google Cloud Console Setup

1. Go to https://console.cloud.google.com
2. Create a new project: click the project dropdown at top → "New Project" → name it "Survivor Fantasy" → Create
3. In the left menu: APIs & Services → OAuth consent screen
   - User Type: External → Create
   - App name: Survivor Fantasy
   - User support email: your email
   - Add your email to "Developer contact information"
   - Save and Continue through all steps (scopes, test users — skip for now)
4. APIs & Services → Credentials → + Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Name: Survivor Fantasy Web
   - Authorized redirect URIs: click "+ Add URI" → enter exactly:
     `https://survivor-fantasy-app.vercel.app/api/auth-google`
   - Click Create
5. Copy the **Client ID** and **Client Secret**

## Add to Vercel

1. Go to https://vercel.com → your project → Settings → Environment Variables
2. Add `GOOGLE_CLIENT_ID` = (paste client ID)
3. Add `GOOGLE_CLIENT_SECRET` = (paste client secret)
4. Redeploy (or wait for next push to main)

## Set Up Player Emails In-App

1. Log in as admin (Joshua)
2. Admin Panel → Player Management → scroll to "Google Account Mapping"
3. Enter each player's Google email address next to their name
4. Click "Save Email Mapping"
5. Players can now use "Sign in with Google"

## Testing

1. Open the app in an incognito window
2. Click "Sign in with Google"
3. Sign in with a Google account you mapped to a player
4. Should log in automatically
