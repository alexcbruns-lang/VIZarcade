# 🎵 Synthwave — Spotify Visual Experience

A real-time music visualizer that reacts to your Spotify playback with dynamic particle systems, geometric shapes, waveforms, and beat-synced lighting.

---

## Setup Instructions

### Step 1 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with GitHub
2. Click **"Add New Project"**
3. Import this GitHub repository
4. Click **Deploy** — no build settings needed
5. **Copy your Vercel URL** (e.g. `https://your-app-name.vercel.app`)

---

### Step 2 — Create Spotify Developer App

1. Go to [developer.spotify.com](https://developer.spotify.com) and log in
2. Click **"Create App"**
3. Fill in:
   - **App name:** anything (e.g. "Synthwave Visualizer")
   - **Redirect URI:** `https://your-app-name.vercel.app/callback`
     *(use your actual Vercel URL from Step 1)*
   - Check **Web API** and **Web Playback SDK**
4. Click **Save**
5. Go to **Settings** and copy your **Client ID**

---

### Step 3 — Add Your Client ID

1. Open `index.html` in this repository
2. Find this line near the top of the `<script>` section:
   ```
   const CLIENT_ID = window.SPOTIFY_CLIENT_ID || 'YOUR_CLIENT_ID';
   ```
3. Replace `YOUR_CLIENT_ID` with your actual Client ID:
   ```
   const CLIENT_ID = window.SPOTIFY_CLIENT_ID || 'abc123yourClientIdHere';
   ```
4. Save and commit the file — Vercel will auto-redeploy

---

### Step 4 — Use It!

1. Open your Vercel URL
2. Click **Connect Spotify**
3. Authorize the app
4. Start playing music on Spotify (on any device)
5. Watch the visuals react to your music!
6. Hit **⛶ FULLSCREEN** for the full concert experience

---

## Features

- 🎨 Dynamic color palette that shifts with song mood (valence + energy)
- 💥 Beat-synced ring explosions
- 🌊 Multi-layer waveform reacting to tempo and energy
- ✨ Particle trails flowing with the music
- 🔷 Rotating geometric shapes pulsing to the beat
- 📊 Live stats: BPM, Energy, Key, Mood
- 🖥️ Fullscreen mode for second display / concert use

---

## Notes

- Requires a **Spotify Premium** account for playback data
- The app reads what's currently playing on any of your Spotify devices
- Token expires after 1 hour — just re-click "Connect Spotify" to refresh
