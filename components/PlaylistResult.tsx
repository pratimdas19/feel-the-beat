
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { PlaylistResponse, User, Song, Platform, StreamingState } from '../types';
import { Clock, ExternalLink, Disc, Music, PlayCircle, Loader2, AlertCircle, RefreshCw, ArrowDownCircle, Play, Pause, SkipForward, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchSongArtwork } from '../services/itunesService';
import { streamingBackend } from '../services/streamingBackend';
import StreamingAuthModal from './StreamingAuthModal';

interface PlaylistResultProps {
  data: PlaylistResponse;
  user: User | null;
  platform: Platform;
  onReset: () => void;
  onSaveToLibrary: () => Promise<void>;
  hasSavedToLibrary: boolean;
}

interface SongRowProps {
  song: Song;
  index: number;
  platform: Platform;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

const SongRow: React.FC<SongRowProps> = ({ song, index, platform, isPlaying, onPlay, onPause }) => {
  const safeTitle = song.title || 'Track';
  const [imageSrc, setImageSrc] = useState<string>(
    `https://picsum.photos/seed/${safeTitle.replace(/\s/g, '')}/100/100`
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      await new Promise(resolve => setTimeout(resolve, index * 50));
      if (!isMounted) return;
      
      // Using the iTunes service which now returns both art and preview
      try {
        const query = encodeURIComponent(`${song.artist} ${song.title}`);
        const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
        const data = await res.json();
        
        if (isMounted && data.results && data.results.length > 0) {
             const item = data.results[0];
             setImageSrc(item.artworkUrl100);
             setPreviewUrl(item.previewUrl);
        }
        setIsLoaded(true);
      } catch (e) {
        setIsLoaded(true);
      }
    };
    loadDetails();
    return () => { isMounted = false; };
  }, [song, index]);

  const hoverColorClass = 
    platform === 'spotify' ? 'group-hover:text-spotify' :
    platform === 'apple' ? 'group-hover:text-apple' :
    'group-hover:text-youtube';

  const pulseBgClass = 
    platform === 'spotify' ? 'bg-spotify' :
    platform === 'apple' ? 'bg-apple' :
    'bg-youtube';
    
  const iconColorClass = 
    platform === 'spotify' ? 'text-spotify' :
    platform === 'apple' ? 'text-apple' :
    'text-youtube';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group px-2 py-2 sm:px-4 flex items-center border-b border-brand-text/10 hover:bg-brand-blue/5 transition-all duration-200 cursor-pointer"
    >
      <div className={`w-6 sm:w-8 text-center text-brand-text/50 font-mono text-xs sm:text-sm font-bold ${hoverColorClass} transition-colors duration-300 flex justify-center`}>
        {isPlaying ? (
            <div className="relative flex items-center justify-center">
               <div className={`w-2 h-2 rounded-full ${pulseBgClass} animate-ping absolute`} />
               <div className={`w-2 h-2 rounded-full ${pulseBgClass}`} />
            </div>
        ) : (
            index + 1
        )}
      </div>
      
      <div className="flex-1 flex items-center gap-2 sm:gap-4 overflow-hidden pl-2">
        <div className="relative w-8 h-8 sm:w-10 sm:h-10 shrink-0 shadow-sm bg-brand-text/10 overflow-hidden rounded-sm group/img transform-gpu">
           <img 
            src={imageSrc}
            alt={song.title || 'Song'}
            className={`
                w-full h-full object-cover transform transition-transform duration-500 ease-out
                scale-100 group-hover/img:scale-110 group-hover/img:-rotate-1
                ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
          {/* Parallax/Depth Effect */}
          <div className={`absolute inset-0 ${pulseBgClass} mix-blend-overlay opacity-0 group-hover/img:opacity-40 group-hover/img:animate-pulse transition-opacity duration-300 pointer-events-none`} />
          
          {/* Play Overlay with Dynamic Spring Button */}
          {previewUrl && (
              <div 
                onClick={(e) => { e.stopPropagation(); isPlaying ? onPause() : onPlay(); }}
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300 cursor-pointer z-10"
              >
                  <div className="
                    bg-brand-cream rounded-full p-1.5 shadow-xl
                    transform scale-50 opacity-0 translate-y-2
                    group-hover/img:scale-100 group-hover/img:opacity-100 group-hover/img:translate-y-0
                    transition-all duration-300 cubic-bezier(0.175, 0.885, 0.32, 1.275)
                  ">
                      {isPlaying ? (
                          <Pause className={`w-3 h-3 ${iconColorClass} fill-current`} />
                      ) : (
                          <Play className={`w-3 h-3 ${iconColorClass} fill-current ml-0.5`} />
                      )}
                  </div>
              </div>
          )}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className={`font-bold text-brand-text truncate ${hoverColorClass} transition-colors duration-300 text-xs sm:text-sm uppercase leading-tight`}>
            {song.title || 'Unknown Title'}
          </div>
          <div className="text-[10px] sm:text-xs text-brand-text/60 truncate font-medium group-hover:text-brand-text/80 transition-colors">
            {song.artist || 'Unknown Artist'}
          </div>
        </div>
      </div>

      <div className="hidden md:block w-1/3 text-xs text-brand-text/50 italic px-4 group-hover:text-brand-text/70 transition-colors truncate">
        "{song.moodReason}"
      </div>
      
      <div className="w-10 sm:w-12 text-right text-[10px] sm:text-xs text-brand-text/50 font-mono font-bold group-hover:text-brand-text transition-colors">
        {song.duration}
      </div>
    </motion.div>
  );
};

const PlaylistResult: React.FC<PlaylistResultProps> = ({ 
  data, 
  user, 
  platform,
  onReset, 
  onSaveToLibrary, 
  hasSavedToLibrary 
}) => {
  const [streamingState, setStreamingState] = useState<StreamingState>({ isConnected: false, provider: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Audio Player State
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if URL has params indicating auth success (Mock or Real)
  useEffect(() => {
    // Real Backend Check
    streamingBackend.checkAuth().then(auth => {
      if (auth.authenticated) {
        setStreamingState({ isConnected: true, provider: auth.provider as Platform, profileName: auth.profileName });
      }
    });

    // Handle mock auth success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth_success')) {
      setStreamingState({ isConnected: true, provider: platform }); 
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [platform]);

  // Audio Effect
  useEffect(() => {
      if (currentSongIndex === null) {
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
          }
          setIsPlaying(false);
          return;
      }

      const song = data.songs[currentSongIndex];
      const playSong = async () => {
          if (audioRef.current) {
              audioRef.current.pause();
          }
          
          try {
            const query = encodeURIComponent(`${song.artist} ${song.title}`);
            const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
            const d = await res.json();
            if (d.results && d.results.length > 0 && d.results[0].previewUrl) {
                const audio = new Audio(d.results[0].previewUrl);
                audio.volume = 0.5;
                audio.onended = () => handleSkip();
                audioRef.current = audio;
                audio.play();
                setIsPlaying(true);
            } else {
                // No preview available, skip to next or stop
                handleSkip();
            }
          } catch (e) {
              console.error(e);
              setIsPlaying(false);
          }
      };

      if (isPlaying) {
          if (audioRef.current && audioRef.current.src.includes(encodeURIComponent(song.title || ''))) {
            audioRef.current.play();
          } else {
            playSong();
          }
      } else if (audioRef.current) {
          audioRef.current.pause();
      }

      return () => {
          // Don't pause on unmount of effect unless index changed to null
      }
  }, [currentSongIndex, isPlaying, data.songs]);

  const handlePlayPause = (index: number) => {
      if (currentSongIndex === index) {
          setIsPlaying(!isPlaying);
      } else {
          setCurrentSongIndex(index);
          setIsPlaying(true);
      }
  };

  const handleSkip = () => {
      if (currentSongIndex !== null && currentSongIndex < data.songs.length - 1) {
          setCurrentSongIndex(currentSongIndex + 1);
          setIsPlaying(true);
      } else {
          setIsPlaying(false);
          setCurrentSongIndex(null);
      }
  };

  const handleClosePlayer = () => {
      setIsPlaying(false);
      setCurrentSongIndex(null);
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
      }
  };

  const handleCreatePlaylist = async () => {
    if (!streamingState.isConnected) {
      setIsModalOpen(true);
      return;
    }

    setIsCreating(true);
    setError(null);
    try {
      const url = await streamingBackend.createPlaylist(data);
      setCreatedUrl(url);
      if (!hasSavedToLibrary) {
        await onSaveToLibrary();
      }
    } catch (err) {
      setError("Failed to create playlist on provider. Try reconnecting.");
      setStreamingState({ isConnected: false, provider: null });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnect = (p: Platform) => {
    streamingBackend.login(p);
    setTimeout(() => {
        setStreamingState({ isConnected: true, provider: p, profileName: 'Demo User' });
        setIsModalOpen(false);
    }, 1000);
  };
  
  const safePlaylistName = data.playlistName || 'My Playlist';

  const getPlatformConfig = () => {
      switch(platform) {
          case 'spotify': return { name: 'Spotify', bg: 'bg-[#1DB954]', icon: Disc, text: 'text-[#1DB954]' };
          case 'apple': return { name: 'Apple Music', bg: 'bg-[#FA243C]', icon: Music, text: 'text-[#FA243C]' };
          case 'youtube': return { name: 'YouTube Music', bg: 'bg-[#FF0000]', icon: PlayCircle, text: 'text-[#FF0000]' };
          default: return { name: 'Spotify', bg: 'bg-brand-green', icon: Disc, text: 'text-brand-green' };
      }
  };

  const pConfig = getPlatformConfig();
  
  // Fallback image logic
  const coverArtSrc = data.coverArt 
    ? data.coverArt 
    : `https://picsum.photos/seed/${safePlaylistName.replace(/\s/g, '')}/400/400`;

  // Standardized Button Class - Synced via Grid on tablet/mobile
  const buttonBaseClass = `
    w-full px-2 py-3 sm:px-8 sm:py-4 
    font-black text-[10px] sm:text-sm uppercase tracking-wider 
    flex items-center justify-center gap-2 transition-all 
    border-2 border-transparent 
    min-w-0
    shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] 
    hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] 
    active:translate-y-0 active:shadow-none
  `;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-4 sm:pt-24 pb-8 sm:pb-12 px-2 sm:px-8 max-w-6xl mx-auto relative z-10"
    >
      <StreamingAuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConnect={handleConnect}
        targetPlatform={platform}
      />

      {/* Floating Music Player - Portaled to Body for Fixed Positioning */}
      {currentSongIndex !== null && createPortal(
        <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-brand-blue text-brand-cream p-3 sm:p-4 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.5)] border-4 border-brand-cream flex items-center gap-3 sm:gap-4 max-w-[90vw] sm:max-w-md">
              {/* Mini Album Art */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-cream/10 overflow-hidden border-2 border-brand-cream shrink-0 animate-spin-slow" style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}>
                 <img src={`https://picsum.photos/seed/${data.songs[currentSongIndex].title.replace(/\s/g, '')}/100/100`} className="w-full h-full object-cover" alt="art" />
              </div>
              
              <div className="min-w-0 flex-1 max-w-[120px] sm:max-w-[160px]">
                  <div className="text-[10px] sm:text-xs font-bold text-brand-cream truncate">
                      {data.songs[currentSongIndex].title}
                  </div>
                  <div className="text-[8px] sm:text-[10px] text-brand-cream/60 truncate">
                      {data.songs[currentSongIndex].artist}
                  </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-orange text-brand-blue flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                    {isPlaying ? (
                        <Pause className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                    ) : (
                        <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-current ml-0.5" />
                    )}
                </button>
                <button 
                  onClick={handleSkip}
                  className="p-2 hover:bg-brand-cream/10 rounded-full transition-colors"
                >
                    <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                </button>
                <div className="w-px h-6 bg-brand-cream/20 mx-1"></div>
                 <button 
                  onClick={handleClosePlayer}
                  className="p-1 hover:bg-brand-red rounded-full transition-colors group"
                >
                    <X className="w-4 h-4 group-hover:text-white text-brand-cream/50" />
                </button>
              </div>
          </div>
        </div>,
        document.body
      )}

      <div className="bg-brand-cream text-brand-text shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,0.2)] border-2 border-transparent">
        
        <div className="p-4 md:p-8 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 border-b-4 border-brand-blue">
            <div className="w-32 h-32 sm:w-48 sm:h-48 shadow-none border-2 sm:border-4 border-brand-text relative group shrink-0 mx-auto md:mx-0 overflow-hidden bg-brand-blue">
              {/* Generated AI Cover Art */}
              <img 
                  src={coverArtSrc}
                  alt="Playlist Art" 
                  className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-all duration-700"
              />
               {/* Removed AI ART Badge */}
            </div>
            
            <div className="text-center md:text-left flex-1 w-full">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1 sm:mb-2">
                    <pConfig.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${pConfig.text}`} />
                    <span className="uppercase text-[10px] sm:text-xs font-black tracking-widest text-brand-text/60">
                        Generated for {pConfig.name}
                    </span>
                </div>
                
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-2 sm:mb-4 uppercase leading-none text-brand-blue">
                    {data.playlistName || 'Untitled'}
                </h1>
                <p className="text-brand-text/70 text-sm sm:text-lg mb-4 sm:mb-6 mx-auto md:mx-0 font-medium leading-tight max-w-md md:max-w-xl line-clamp-2 sm:line-clamp-none">
                    {data.description || 'No description available.'}
                </p>
                
                {/* Buttons Container - Grid for Sync on Tablet/Mobile, Flex on Desktop */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full lg:flex lg:justify-start lg:w-auto">
                    {!createdUrl ? (
                        <button 
                        onClick={handleCreatePlaylist}
                        disabled={isCreating}
                        className={`${buttonBaseClass} bg-brand-orange text-brand-blue lg:w-auto`}
                        >
                        {isCreating ? (
                            <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            Importing...
                            </>
                        ) : (
                            <>
                            <ArrowDownCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            Import
                            </>
                        )}
                        </button>
                    ) : (
                        <button 
                        onClick={() => window.open(createdUrl, '_blank')}
                        className={`${buttonBaseClass} bg-brand-green text-brand-cream lg:w-auto`}
                        >
                            <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5" />
                            Open
                        </button>
                    )}
                    
                    <button 
                    onClick={onReset}
                    className={`${buttonBaseClass} bg-brand-blue text-brand-cream lg:w-auto`}
                    >
                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                        Create New
                    </button>
                </div>
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-brand-red font-bold text-xs sm:text-sm animate-bounce justify-center md:justify-start">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
            </div>
        </div>

        <div className="bg-brand-cream">
            <div className="px-2 py-2 sm:px-4 border-b-2 border-brand-text/10 text-brand-text/40 text-[10px] sm:text-xs uppercase font-bold tracking-wider flex">
            <div className="w-6 sm:w-8 text-center">#</div>
            <div className="flex-1 pl-2">Track</div>
            <div className="hidden md:block w-1/3 px-4">Vibe Check</div>
            <div className="w-10 sm:w-12 text-right"><Clock className="w-3 h-3 ml-auto" /></div>
            </div>
            
            <div className="pb-8">
            {(data.songs || []).map((song, idx) => (
                <SongRow 
                    key={`${song.title}-${idx}`} 
                    song={song} 
                    index={idx} 
                    platform={platform}
                    isPlaying={currentSongIndex === idx && isPlaying}
                    onPlay={() => handlePlayPause(idx)}
                    onPause={() => handlePlayPause(idx)}
                />
            ))}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlaylistResult;
