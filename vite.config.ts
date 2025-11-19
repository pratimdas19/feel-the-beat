import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.SPOTIFY_CLIENT_ID': JSON.stringify(env.SPOTIFY_CLIENT_ID),
      'process.env.SPOTIFY_CLIENT_SECRET': JSON.stringify(env.SPOTIFY_CLIENT_SECRET),
      'process.env.YOUTUBE_CLIENT_ID': JSON.stringify(env.YOUTUBE_CLIENT_ID),
      'process.env.YOUTUBE_CLIENT_SECRET': JSON.stringify(env.YOUTUBE_CLIENT_SECRET),
      'process.env.COOKIE_SECRET': JSON.stringify(env.COOKIE_SECRET),
      'process.env.NODE_ENV': JSON.stringify(env.NODE_ENV),
    },
  };
});