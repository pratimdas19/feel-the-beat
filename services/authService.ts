
import { User, SavedPlaylist, PlaylistResponse, Platform } from '../types';

// Keys for LocalStorage
const USERS_KEY = 'ftb_users';
const SESSION_KEY = 'ftb_session';
const PLAYLISTS_KEY = 'ftb_playlists';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const authService = {
  // --- Auth Methods ---

  signup: (name: string, email: string, password: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser = { id: generateId(), name, email, password }; // Note: In real app, hash password
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login
    const { password: _, ...userWithoutPass } = newUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPass));
    return userWithoutPass;
  },

  login: (email: string, password: string): User => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: any) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const { password: _, ...userWithoutPass } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPass));
    return userWithoutPass;
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  // --- Playlist Methods ---

  savePlaylist: async (user: User, mood: string, playlist: PlaylistResponse, platform: Platform = 'spotify'): Promise<SavedPlaylist> => {
    // Simulate API Network Delay for "Transfer"
    await new Promise(resolve => setTimeout(resolve, 1500));

    const playlists = JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]');
    
    const newPlaylist: SavedPlaylist = {
      ...playlist,
      id: generateId(),
      userId: user.id,
      createdAt: Date.now(),
      mood,
      platform
    };

    playlists.push(newPlaylist);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
    return newPlaylist;
  },

  getUserPlaylists: (userId: string): SavedPlaylist[] => {
    const playlists = JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]');
    return playlists
      .filter((p: SavedPlaylist) => p.userId === userId)
      .sort((a: SavedPlaylist, b: SavedPlaylist) => b.createdAt - a.createdAt);
  },

  deletePlaylist: (playlistId: string) => {
    const playlists = JSON.parse(localStorage.getItem(PLAYLISTS_KEY) || '[]');
    const filtered = playlists.filter((p: SavedPlaylist) => p.id !== playlistId);
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(filtered));
  }
};
