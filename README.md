<p align="center">
  <img src="./banner.png" alt="Feel The Beats Banner" width="100%">
</p>

# FEEL THE BEATS — Developer Documentation

**Feel The Beats** is a personal project exploring AI-driven mood analysis and multi-platform playlist creation.  
The application generates a **40-song playlist** from a user-provided mood prompt and creates that playlist directly inside **Spotify, Apple Music, or YouTube Music**.  
This README focuses on architecture, implementation, API usage, and technical decisions.

---

## 🏗️ Architecture Overview

The project is built around a **client → API → provider** architecture.

### **Client (Frontend)**
- Built with a modern UI framework (React / Next / VibeCode system)
- Components:
  - `MoodInput` — captures mood prompt
  - `PlaylistPreview` — displays generated tracklist + cover art
  - `PlatformSelector` — Spotify / Apple Music / YouTube Music
  - `AuthFlow` — triggers provider-specific OAuth
  - `CreatePlaylistButton` — final playlist creation action

### **API Layer**
- Serverless API endpoints (or backend server) handle:
  - OAuth login & token exchange
  - Refresh token rotation
  - Playlist creation requests
  - AI processing and cover generation
- All API keys and secrets stored in environment variables (`.env`)

### **Provider Integrations**
- **Spotify Web API**
- **Apple Music API + MusicKit JS**
- **YouTube Data API v3**

---

## ⚙️ Flow Summary

### **1. Mood → AI → Music Metadata**
User provides mood prompt → AI model converts it into:
- Genre tags  
- Energy/tempo descriptors  
- Mood-based keywords  
- Aesthetic cues for cover art

### **2. Track Retrieval**
Based on the generated metadata:
- Spotify: `/v1/search` with multi-tag queries  
- Apple Music: `/v1/catalog/{storefront}/search`  
- YouTube Music: YouTube Data API keyword search  

The system composes a **40-track normalized list**, consistent across platforms.

### **3. OAuth Authentication**
Provider-specific login flow is triggered **before playlist creation**.

**Spotify OAuth**
- Scope: `playlist-modify-public`, `playlist-modify-private`
- Flow: Authorization Code (with PKCE)
- Token Exchange → Access Token + Refresh Token

**Apple Music**
- Client uses MusicKit for:
  - Authorization  
  - User token retrieval  
  - Playlist creation in user's library
- Requires server-generated **developer token (JWT)**

**YouTube Music**
- Uses YouTube Data API OAuth
- Scope: `https://www.googleapis.com/auth/youtube.force-ssl`

### **4. Playlist Creation**
Each provider receives:
playlistName
tracks[]
coverArtURL
description


Endpoints:
- **Spotify**  
  - `POST /v1/users/{user_id}/playlists`
  - `POST /v1/playlists/{playlist_id}/tracks`

- **Apple Music**  
  - `POST /v1/me/library/playlists`

- **YouTube**  
  - `POST /youtube/v3/playlists`
  - `POST /youtube/v3/playlistItems`

### **5. Playlist Cover Generation**
AI-based image generation system:
- Accepts mood prompt  
- Produces 1:1 cover art  
- Uses:
  - Colour psychology  
  - Mood descriptors  
  - Abstract shapes or gradients  
- Saved temporarily in storage / returned as URL  
- Applied to playlist (Spotify doesn't support custom cover via API, so displayed client-side)

---

## 🛠️ Tech Stack

### **Frontend**
- React / Next / Vite (depending on setup)
- MusicKit JS (Apple Music)
- OAuth popup handler
- Tailwind / custom CSS (neon aesthetic)

### **Backend**
- Node.js / Serverless (Vercel / Netlify / Cloud Function)
- OAuth token exchange handlers
- Custom AI mood → metadata processor
- AI image generation wrapper
- Track normalizer across platforms

### **AI Layer**
- Mood parsing  
- Metadata conversion  
- Playlist sequencing  
- Cover art generation  

---

## 📦 Project Structure

/src
/components
MoodInput.jsx
PlatformSelector.jsx
PlaylistPreview.jsx
/api
/auth
spotify.js
applemusic.js
youtube.js
/playlist
create.js
/services
aiProcessor.js
coverGenerator.js
trackFetcher.js
/ui
/public
/banner.png
README.md

---


---


---

## 🧪 Testing
Test scenarios:
- Mood prompts with vastly different energies
- OAuth failures and token expiry
- Playlists with duplicate/invalid tracks removed
- Cover art fallback rendering
- Multi-platform playlist consistency

---

## 🔮 Future Improvements
- Better ranking algorithm for mood → track mapping  
- Multi-mood blending and weight adjustment  
- More advanced cover art styling  
- User history–based recommendations  
- Cross-platform playlist syncing  

---

### 🧡 Personal Note
This is a personal exploration project — not a production system.  
The goal was to deepen my understanding of:
- AI-enhanced UX  
- Multi-provider integration  
- OAuth 2.0 flows  
- Playlist generation logic  
- Clean front-end interaction design  


