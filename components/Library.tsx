
import React from 'react';
import { SavedPlaylist, Platform } from '../types';
import { Trash2, Calendar, Music, Loader2, Disc, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

interface LibraryProps {
  userId: string;
  onViewPlaylist: (playlist: SavedPlaylist) => void;
  onRefresh: () => void;
}

const Library: React.FC<LibraryProps> = ({ userId, onViewPlaylist, onRefresh }) => {
  const [playlists, setPlaylists] = React.useState<SavedPlaylist[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setPlaylists(authService.getUserPlaylists(userId));
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [userId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this playlist?')) {
      authService.deletePlaylist(id);
      setPlaylists(authService.getUserPlaylists(userId));
      onRefresh();
    }
  };

  const getPlatformBadge = (p: Platform) => {
      switch(p) {
        case 'youtube':
          return (
            <div className="p-1.5 rounded-full bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-300" title="YouTube Music">
              <PlayCircle className="w-4 h-4" />
            </div>
          );
        default: // spotify
          return (
            <div className="p-1.5 rounded-full bg-[#1DB954]/10 text-[#1DB954] hover:bg-[#1DB954] hover:text-white transition-all duration-300" title="Spotify">
              <Disc className="w-4 h-4" />
            </div>
          );
      }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-6xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full border-4 border-brand-cream bg-brand-orange flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]">
          <Music className="w-8 h-8 text-brand-blue" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-brand-cream uppercase tracking-tight">My Library</h1>
          <p className="text-brand-cream/70 font-bold tracking-wide">Your vibe collection</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-12 h-12 text-brand-cream animate-spin mb-4" />
          <p className="text-brand-cream font-bold animate-pulse">LOADING VIBES...</p>
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20 border-4 border-dashed border-brand-cream/20 rounded-3xl bg-brand-cream/5">
          <Music className="w-12 h-12 text-brand-cream/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-brand-cream mb-2">NO PLAYLISTS YET</h3>
          <p className="text-brand-cream/60">Generate a playlist to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, idx) => {
             const safeName = playlist.playlistName || 'Playlist';
             return (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onViewPlaylist(playlist)}
                className="group bg-brand-cream text-brand-text border-2 border-transparent hover:border-brand-orange transition-all cursor-pointer relative shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.2)] rounded-xl overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden border-b-4 border-brand-blue">
                  <img 
                    src={`https://picsum.photos/seed/${safeName.replace(/\s/g, '')}/400/400`} 
                    alt={safeName}
                    className="w-full h-full object-cover grayscale mix-blend-hard-light group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-brand-blue/20 group-hover:bg-transparent transition-colors" />
                </div>
                
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-black text-brand-blue text-xl leading-tight uppercase line-clamp-2">
                      {safeName}
                    </h3>
                    {/* Distinct Platform Icon */}
                    <div className="flex-shrink-0">
                      {getPlatformBadge(playlist.platform)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-brand-text/70 truncate mb-4 font-medium">
                    {playlist.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-brand-text/50 border-t border-brand-text/10 pt-3 font-bold uppercase">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(playlist.createdAt).toLocaleDateString()}
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, playlist.id)}
                      className="hover:text-brand-red transition-colors p-1"
                      title="Delete Playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Library;
