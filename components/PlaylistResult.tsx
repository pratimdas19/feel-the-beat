import React, { useState, useEffect } from 'react';
import { PlaylistResponse, User } from '../types';
import { Play, PlusCircle, Clock, CheckCircle2, Heart, Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaylistResultProps {
  data: PlaylistResponse;
  user: User | null;
  onReset: () => void;
  onSaveToLibrary: () => void;
  hasSavedToLibrary: boolean;
}

const PlaylistResult: React.FC<PlaylistResultProps> = ({ 
  data, 
  user, 
  onReset, 
  onSaveToLibrary,
  hasSavedToLibrary 
}) => {
  const [isSpotifySaved, setIsSpotifySaved] = useState(false);

  const handleSpotifySave = () => {
    // Simulation of saving to Spotify
    setTimeout(() => {
      setIsSpotifySaved(true);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-5xl mx-auto relative z-10"
    >
      <div className="flex flex-col md:flex-row items-end gap-8 mb-12">
        <div className="w-48 h-48 sm:w-60 sm:h-60 shadow-2xl relative group shrink-0 mx-auto md:mx-0">
           {/* Dynamic gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-spotify to-purple-600 animate-pulse-slow"></div>
          <img 
            src={`https://picsum.photos/seed/${data.playlistName.replace(/\s/g, '')}/400/400`} 
            alt="Playlist Art" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 cursor-pointer">
             <Play className="w-16 h-16 text-white fill-current" />
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <span className="uppercase text-xs font-bold tracking-widest text-spotify mb-2 block">AI Generated Playlist</span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            {data.playlistName}
          </h1>
          <p className="text-gray-400 max-w-xl text-lg mb-6 mx-auto md:mx-0">
            {data.description}
          </p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            {/* Save to App Library Button */}
            <button 
              onClick={onSaveToLibrary}
              disabled={hasSavedToLibrary}
              className={`
                px-8 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 transition-all transform
                ${hasSavedToLibrary 
                  ? 'bg-white/10 text-gray-300 cursor-default' 
                  : 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95'}
              `}
            >
              {hasSavedToLibrary ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Saved to Library
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {user ? 'Save to Library' : 'Login to Save'}
                </>
              )}
            </button>

            {/* Save to Spotify Button (Mock) */}
            <button 
              onClick={handleSpotifySave}
              disabled={isSpotifySaved}
              className={`
                px-8 py-3.5 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95
                ${isSpotifySaved ? 'bg-spotify text-white cursor-default' : 'bg-spotify hover:bg-spotify-light text-black'}
              `}
            >
              {isSpotifySaved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Added to Spotify
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Add to Spotify
                </>
              )}
            </button>
            
            <button 
              onClick={onReset}
              className="px-6 py-3.5 rounded-full border border-gray-600 font-bold text-sm tracking-wide hover:border-white hover:bg-white/10 transition-all"
            >
              Create New
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5">
        <div className="px-6 py-4 border-b border-white/5 text-gray-400 text-xs uppercase tracking-wider flex">
          <div className="w-12 text-center">#</div>
          <div className="flex-1">Title</div>
          <div className="hidden md:block w-1/3">Reason</div>
          <div className="w-16 text-right"><Clock className="w-4 h-4 ml-auto" /></div>
        </div>
        
        <div className="divide-y divide-white/5">
          {data.songs.map((song, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group px-6 py-3 flex items-center hover:bg-white/5 transition-colors cursor-default"
            >
              <div className="w-12 text-center text-gray-500 group-hover:text-spotify font-mono text-sm">
                {idx + 1}
              </div>
              <div className="flex-1 flex items-center gap-4 overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${song.title.replace(/\s/g, '')}/48/48`} 
                  alt="Art" 
                  className="w-10 h-10 rounded shadow-lg bg-dark-700 object-cover"
                />
                <div className="min-w-0">
                  <div className="font-medium text-white truncate group-hover:text-spotify transition-colors">
                    {song.title}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {song.artist}
                  </div>
                </div>
              </div>
              <div className="hidden md:block w-1/3 text-sm text-gray-500 italic px-4">
                "{song.moodReason}"
              </div>
              <div className="w-16 text-right text-sm text-gray-400 font-mono">
                {song.duration}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistResult;