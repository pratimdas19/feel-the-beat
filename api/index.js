
import express from 'express';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';

const app = express();
// Increase limit for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'secure-random-string-for-encryption'));

// --- CONFIGURATION ---
// We construct Redirect URIs dynamically based on the request to support both localhost and production.
const getRedirectUri = (req, provider) => {
    // 1. If APP_URL is set in Vercel (e.g. https://myapp.com), use it.
    // This is the most reliable way to prevent mismatch errors.
    if (process.env.APP_URL) {
        let baseUrl = process.env.APP_URL.replace(/\/$/, ''); // Remove trailing slash
        if (!baseUrl.startsWith('http')) {
            baseUrl = `https://${baseUrl}`; // Force protocol if missing
        }
        return `${baseUrl}/api/auth/${provider}/callback`;
    }

    // 2. Otherwise, construct dynamically. Force HTTPS on Vercel/Production.
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : (req.headers['x-forwarded-proto'] || 'http');
    const host = req.headers.host;
    return `${protocol}://${host}/api/auth/${provider}/callback`;
};

const SCOPES = {
    spotify: 'playlist-modify-public playlist-modify-private user-read-private ugc-image-upload',
    youtube: 'https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/userinfo.profile',
};

// Encryption helpers for storing tokens in cookies (Stateless backend)
const algorithm = 'aes-256-ctr';
// Fix: Ensure secret key is correct length for AES-256
const secretKey = crypto.createHash('sha256').update(String(process.env.COOKIE_SECRET || 'secure-random-string-for-encryption')).digest('base64').substr(0, 32);

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
};

const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);
  return decrpyted.toString();
};

// --- AUTH ROUTES ---

// 1. Start Login
app.get('/api/auth/:provider', (req, res) => {
  const { provider } = req.params;
  const state = crypto.randomBytes(16).toString('hex');
  const redirectUri = getRedirectUri(req, provider);
  
  console.log(`[Auth Start] Provider: ${provider}, RedirectURI: ${redirectUri}`);
  
  // Store state in cookie to verify on callback (CSRF protection)
  res.cookie('auth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 300000 });

  if (provider === 'spotify') {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId) return res.status(500).send('Missing SPOTIFY_CLIENT_ID');
    
    const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(SCOPES.spotify)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    return res.redirect(url);
  }
  
  if (provider === 'youtube') {
    const clientId = process.env.YOUTUBE_CLIENT_ID;
    if (!clientId) return res.status(500).send('Missing YOUTUBE_CLIENT_ID');

    const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(SCOPES.youtube)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&access_type=offline&prompt=consent`;
    return res.redirect(url);
  }
  
  res.status(400).json({ error: 'Invalid provider.' });
});

// 2. Callback
app.get('/api/auth/:provider/callback', async (req, res) => {
  const { provider } = req.params;
  const { code, state, error } = req.query;
  const savedState = req.cookies.auth_state;
  const redirectUri = getRedirectUri(req, provider);

  if (error) return res.redirect(`/?error=${error}`);
  if (!state || state !== savedState) return res.redirect('/?error=csrf_mismatch');

  try {
    let accessToken, refreshToken, profileName;

    if (provider === 'spotify') {
      const tokenRes = await axios.post('https://accounts.spotify.com/api/token', new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }).toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token;

      const profileRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      profileName = profileRes.data.display_name;
    }

    if (provider === 'youtube') {
      const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: process.env.YOUTUBE_CLIENT_ID,
        client_secret: process.env.YOUTUBE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      });

      accessToken = tokenRes.data.access_token;
      refreshToken = tokenRes.data.refresh_token; 

      const profileRes = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      profileName = profileRes.data.name;
    }

    // Encrypt and store tokens in HTTP-only cookie
    const sessionData = JSON.stringify({ provider, accessToken, refreshToken, profileName });
    const encryptedSession = encrypt(sessionData);
    
    res.cookie('ftb_session_enc', encryptedSession, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    res.redirect('/?auth_success=true');

  } catch (err) {
    console.error('Auth Error:', err.response?.data || err.message);
    res.redirect('/?error=auth_failed');
  }
});

// 3. Get Session Info
app.get('/api/me', (req, res) => {
  const encryptedSession = req.cookies.ftb_session_enc;
  if (!encryptedSession) return res.json({ authenticated: false });

  try {
    const sessionData = JSON.parse(decrypt(encryptedSession));
    res.json({ 
      authenticated: true, 
      provider: sessionData.provider, 
      profileName: sessionData.profileName 
    });
  } catch (e) {
    res.json({ authenticated: false });
  }
});

// --- PLAYLIST CREATION ROUTES ---

app.post('/api/create-playlist', async (req, res) => {
  const encryptedSession = req.cookies.ftb_session_enc;
  if (!encryptedSession) return res.status(401).json({ error: 'Not authenticated' });

  const { playlistName, description, songs, coverArt } = req.body;
  
  try {
    const session = JSON.parse(decrypt(encryptedSession));
    const { provider, accessToken } = session;

    if (provider === 'spotify') {
      // 1. Get User ID
      const meRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userId = meRes.data.id;

      // 2. Create Playlist
      const createRes = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        name: playlistName,
        description: description + ' | Created by Feel The Beats AI',
        public: false
      }, { headers: { Authorization: `Bearer ${accessToken}` } });
      
      const playlistId = createRes.data.id;
      const externalUrl = createRes.data.external_urls.spotify;

      // 3. Search for Tracks 
      const trackUris = [];
      for (const song of songs) {
        const query = `track:${song.title} artist:${song.artist}`;
        try {
          const searchRes = await axios.get(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (searchRes.data.tracks.items.length > 0) {
            trackUris.push(searchRes.data.tracks.items[0].uri);
          }
        } catch (e) { console.warn(`Track not found: ${song.title}`); }
      }

      // 4. Add Tracks
      if (trackUris.length > 0) {
        // Chunk requests if > 100 tracks (we have 40, so one request is fine)
        await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          uris: trackUris
        }, { headers: { Authorization: `Bearer ${accessToken}` } });
      }

      // 5. Upload Cover Art (if available)
      if (coverArt && coverArt.startsWith('data:image/jpeg;base64,')) {
        try {
          const base64Data = coverArt.split(',')[1];
          await axios.put(`https://api.spotify.com/v1/playlists/${playlistId}/images`, base64Data, {
            headers: { 
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'image/jpeg'
            }
          });
        } catch (imgErr) {
          console.error('Failed to upload cover art. Scope might be missing or image too large.', imgErr.message);
        }
      }

      return res.json({ success: true, url: externalUrl });
    }

    if (provider === 'youtube') {
      // 1. Create Playlist
      const createRes = await axios.post('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
        snippet: {
          title: playlistName,
          description: description + ' | Created by Feel The Beats AI',
        },
        status: { privacyStatus: 'private' }
      }, { headers: { Authorization: `Bearer ${accessToken}` } });

      const playlistId = createRes.data.id;
      const playlistUrl = `https://music.youtube.com/playlist?list=${playlistId}`;

      // 2. Search & Add Videos
      for (const song of songs) {
        try {
          const searchRes = await axios.get(`https://www.googleapis.com/youtube/v3/search?part=id&q=${encodeURIComponent(song.title + ' ' + song.artist)}&type=video&maxResults=1`, {
             headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (searchRes.data.items.length > 0) {
            const videoId = searchRes.data.items[0].id.videoId;
            await axios.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
              snippet: {
                playlistId: playlistId,
                resourceId: { kind: 'youtube#video', videoId: videoId }
              }
            }, { headers: { Authorization: `Bearer ${accessToken}` } });
          }
        } catch (e) { /* continue */ }
      }

      return res.json({ success: true, url: playlistUrl });
    }

    return res.status(400).json({ error: 'Provider not implemented fully' });

  } catch (err) {
    console.error('Playlist Creation Error', err.message);
    res.status(500).json({ error: 'Failed to create playlist. Please try logging in again.' });
  }
});

export default app;
