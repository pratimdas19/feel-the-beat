export interface Song {
  title: string;
  artist: string;
  moodReason: string; // Why this song fits the mood
  duration: string; // Mock duration
}

export interface PlaylistResponse {
  playlistName: string;
  description: string;
  songs: Song[];
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
}

export enum ViewState {
  HERO = 'HERO',
  GENERATING = 'GENERATING',
  RESULTS = 'RESULTS',
  LIBRARY = 'LIBRARY',
}