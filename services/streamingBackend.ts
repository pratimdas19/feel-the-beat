
import { Platform, PlaylistResponse } from "../types";

// CRITICAL: Set this to FALSE to use real Spotify/YouTube APIs.
// Ensure you have set up your .env variables (SPOTIFY_CLIENT_ID, etc.)
const USE_MOCK = false; 

export const streamingBackend = {
  checkAuth: async (): Promise<{ authenticated: boolean; provider?: Platform; profileName?: string }> => {
    if (USE_MOCK) return { authenticated: false };
    
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        return await res.json();
      }
      return { authenticated: false };
    } catch (e) {
      return { authenticated: false };
    }
  },

  login: (provider: Platform) => {
    if (USE_MOCK) {
      // Simulation for preview
      const width = 500;
      const height = 600;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      // Mock success after popup
      const popup = window.open('about:blank', 'Connect', `width=${width},height=${height},top=${top},left=${left}`);
      setTimeout(() => {
          popup?.close();
          window.location.href = '/?auth_success=true'; // Simulate callback
      }, 1500);
      return;
    }
    
    // Real Backend Redirect
    window.location.href = `/api/auth/${provider}`;
  },

  createPlaylist: async (playlistData: PlaylistResponse): Promise<string> => {
    if (USE_MOCK) {
      // Mock network delay
      await new Promise(r => setTimeout(r, 2000));
      // Mock returning a URL
      return 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M';
    }

    const res = await fetch('/api/create-playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlistData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to create playlist');
    }

    const data = await res.json();
    return data.url;
  }
};
