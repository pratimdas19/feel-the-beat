import React from 'react';
import { SavedPlaylist } from '../types';
import { Play, Trash2, Calendar, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { authService } from '../services/authService';

interface LibraryProps {
  userId: string;
  onViewPlaylist: (playlist: SavedPlaylist) => void;
  onRefresh: () => void; // Trigger re-fetch of playlists
}

const Library: React.FC<LibraryProps> = ({ userId, onViewPlaylist, onRefresh }) => {
  const [playlists, setPlaylists] = React.useState<SavedPlaylist[]>([]);

  React.useEffect(() => {
    setPlaylists(authService.getUserPlaylists(userId));
  }, [userId]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this playlist?')) {
      authService.deletePlaylist(id);
      setPlaylists(authService.getUserPlaylists(userId));
      onRefresh();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-8 max-w-6xl mx-auto relative z-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-spotify/20 flex items-center justify-center">
          <Music className="w-6 h-6 text-spotify" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">My Library</h1>
          <p className="text-gray-400">Your generated vibe collection</p>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No playlists yet</h3>
          <p className="text-gray-500">Generate a playlist to save it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, idx) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onViewPlaylist(playlist)}
              className="group bg-dark-800 border border-white/5 rounded-xl overflow-hidden hover:border-spotify/50 transition-all cursor-pointer relative"
            >
              <div className="aspect-square relative overflow-hidden">
                <img 
                  src={`https://picsum.photos/seed/${playlist.playlistName.replace(/\s/g, '')}/400/400`} 
                  alt={playlist.playlistName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Play className="w-12 h-12 text-white fill-current drop-shadow-lg" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 text-xs text-white px-2 py-1 rounded backdrop-blur-md flex items-center gap-1">
                   <Music className="w-3 h-3" /> {playlist.songs.length}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-white text-lg truncate mb-1 group-hover:text-spotify transition-colors">
                  {playlist.playlistName}
                </h3>
                <p className="text-sm text-gray-400 truncate mb-3">
                  {playlist.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(playlist.createdAt).toLocaleDateString()}
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, playlist.id)}
                    className="hover:text-red-400 transition-colors p-1"
                    title="Delete Playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library;