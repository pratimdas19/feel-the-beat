
import React from 'react';
import { X, Disc, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Platform } from '../types';

interface StreamingAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: Platform) => void;
  targetPlatform: Platform;
}

const StreamingAuthModal: React.FC<StreamingAuthModalProps> = ({ isOpen, onClose, onConnect, targetPlatform }) => {
  if (!isOpen) return null;

  const getConfig = (p: Platform) => {
    switch(p) {
        case 'spotify': return { 
          name: 'Spotify', 
          bg: 'bg-[#1DB954] hover:bg-[#1ed760] text-white', 
          icon: Disc 
        };
        case 'youtube': return { 
          name: 'YouTube Music', 
          bg: 'bg-[#FF0000] hover:bg-[#cc0000] text-white', 
          icon: PlayCircle 
        };
        default: return { 
          name: 'Spotify', 
          bg: 'bg-[#1DB954] hover:bg-[#1ed760] text-white', 
          icon: Disc 
        };
    }
  };

  const config = getConfig(targetPlatform);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-brand-blue/90 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-brand-cream border-4 border-brand-text rounded-3xl shadow-[10px_10px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-brand-text/50 hover:text-brand-red transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="p-10 text-center">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 shadow-lg ${config.bg.split(' ')[0]}`}>
              <config.icon className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-black text-brand-blue mb-3 uppercase tracking-tight">
              Connect {config.name}
            </h2>
            <p className="text-brand-text/70 font-medium mb-8 leading-relaxed">
              To create this playlist in your library, we need permission to access your {config.name} account.
            </p>

            <button 
              onClick={() => onConnect(targetPlatform)}
              className={`
                w-full py-4 rounded-full font-black uppercase tracking-widest shadow-lg 
                transform transition-all hover:-translate-y-1 hover:shadow-xl active:translate-y-0 
                flex items-center justify-center gap-3
                ${config.bg}
              `}
            >
              <config.icon className="w-6 h-6" />
              Login to {config.name}
            </button>
            
            <p className="mt-6 text-xs text-brand-text/40 font-bold uppercase tracking-wider">
              Secure connection via OAuth 2.0
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StreamingAuthModal;
