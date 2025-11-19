
import React from 'react';
import { Disc } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewState } from '../types';

interface HeaderProps {
  onNavigate: (view: ViewState) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
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
    </motion.header>
  );
};

export default Header;
