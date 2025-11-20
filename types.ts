
export type Platform = 'spotify' | 'youtube';

export interface Song {
  title: string;
  artist: string;
  moodReason: string;
  duration: string;
}

export interface PlaylistResponse {
  playlistName: string;
  description: string;
  songs: Song[];
  coverArt?: string; // Base64 data URL
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface SavedPlaylist extends PlaylistResponse {
  id: string;
  userId: string;
  createdAt: number;
  mood: string;
  platform: Platform;
}

export interface StreamingState {
  isConnected: boolean;
  provider: Platform | null;
  profileName?: string;
}

export enum ViewState {
  HERO = 'HERO',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS',
  LIBRARY = 'LIBRARY',
}
