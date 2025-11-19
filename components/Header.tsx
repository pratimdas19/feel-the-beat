
import React from 'react';
import { Disc, LogIn, LogOut, LayoutGrid } from 'lucide-react';
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
        <Disc className="w-8 h-8 text-brand-orange animate-spin-slow group-hover:text-brand-cream transition-colors" />
        <span className="font-black text-2xl tracking-tighter text-brand-cream transition-colors uppercase leading-none">
          Feel The <span className="text-brand-orange">Beats</span>
        </span>
      </div>
      
      <div className="flex items-center space-x-4 sm:space-x-6 text-sm font-bold tracking-wide uppercase">
        {user ? (
          <>
            <span className="hidden sm:block text-brand-cream/70">Hi, {user.name}</span>
            
            <button 
              onClick={() => onNavigate(ViewState.LIBRARY)}
              className={`flex items-center gap-2 transition-colors ${currentView === ViewState.LIBRARY ? 'text-brand-orange' : 'text-brand-cream hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </button>

            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-brand-cream hover:text-brand-red transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="
              flex items-center gap-2 
              bg-brand-orange text-brand-blue 
              px-6 py-2.5 rounded-full 
              transition-all duration-200
              shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] 
              hover:-translate-y-1 hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,0.2)]
              active:translate-y-0 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.2)]
            "
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
