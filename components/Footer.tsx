import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 py-8 text-center text-gray-600 text-sm">
      <div className="flex items-center justify-center gap-2">
        <span>Crafted with rhythm & AI</span>
        <Heart className="w-3 h-3 text-spotify fill-current" />
        <span>by Feel The Beats</span>
      </div>
    </footer>
  );
};

export default Footer;