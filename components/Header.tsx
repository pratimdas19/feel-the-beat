import React from 'react';
import { Music, Disc, LogIn, LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';
import { User, ViewState } from '../types';

interface HeaderProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: ViewState) => void;
  currentView: ViewState;
}

const Header: React.FC<HeaderProps> = ({ user, onOpenAuth, onLogout, onNavigate, currentView }) => {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50"
    >
      <div 
        className="flex items-center space-x-2 cursor-pointer group"
        onClick={() => onNavigate(ViewState.HERO)}
      >
        <Disc className="w-6 h-6 text-spotify animate-spin-slow group-hover:text-white transition-colors" />
        <span className="font-bold text-xl tracking-tighter group-hover:text-spotify transition-colors">Feel The Beats</span>
      </div>
      
      <div className="flex items-center space-x-4 sm:space-x-6 text-sm font-medium">
        {user ? (
          <>
            <span className="hidden sm:block text-gray-400">Hi, {user.name}</span>
            
            <button 
              onClick={() => onNavigate(ViewState.LIBRARY)}
              className={`flex items-center gap-2 transition-colors ${currentView === ViewState.LIBRARY ? 'text-spotify' : 'text-gray-300 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;