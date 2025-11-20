
import React, { useState, KeyboardEvent } from 'react';
import { ArrowRight, PlayCircle, Disc } from 'lucide-react';
import { motion } from 'framer-motion';
import { Platform } from '../types';

interface HeroProps {
  onGenerate: (mood: string, platform: Platform) => void;
  isGenerating: boolean;
}

const Hero: React.FC<HeroProps> = ({ onGenerate, isGenerating }) => {
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>('spotify');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !isGenerating) {
      onGenerate(input, platform);
    }
  };

  const platforms = [
    { 
      id: 'spotify' as Platform, 
      label: 'Spotify', 
      activeBg: 'bg-[#1DB954]', 
      activeBorder: 'border-[#1DB954]',
      hoverText: 'group-hover:text-[#1DB954]',
      icon: Disc 
    },
    { 
      id: 'youtube' as Platform, 
      label: 'YouTube Music', 
      activeBg: 'bg-[#FF0000]', 
      activeBorder: 'border-[#FF0000]',
      hoverText: 'group-hover:text-[#FF0000]',
      icon: PlayCircle 
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10 pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto w-full"
      >
        {/* Single Line Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-4 text-brand-cream uppercase whitespace-nowrap flex flex-wrap justify-center gap-4">
          Feel The <span className="text-brand-orange">Beats.</span>
        </h1>
        
        {/* Updated Subheadline */}
        <p className="text-lg sm:text-xl text-brand-cream/70 mb-12 max-w-2xl mx-auto font-bold tracking-wide uppercase">
          Your mood, Your playlist, Your space.
        </p>

        <div className="max-w-xl mx-auto w-full relative group">
            {/* Input Box - Pill Shape with Neon Glow */}
            <div 
              className="
                relative bg-brand-cream p-2 rounded-full 
                flex items-center mb-8 transition-all duration-300 ease-out
                shadow-[0_0_20px_rgba(255,153,0,0.15)] 
                hover:shadow-[0_0_30px_rgba(255,153,0,0.4)]
                focus-within:shadow-[0_0_40px_rgba(255,153,0,0.6)]
                focus-within:scale-[1.02]
              "
            >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isGenerating}
                  placeholder="HOW ARE YOU FEELING?"
                  className="flex-1 bg-transparent text-brand-text px-6 py-4 text-lg md:text-xl font-bold outline-none placeholder-brand-text/30 uppercase rounded-l-full"
                />
                <button 
                    onClick={() => input.trim() && onGenerate(input, platform)}
                    disabled={isGenerating || !input.trim()}
                    className={`
                    p-4 rounded-full transition-all duration-300 flex items-center justify-center
                    ${input.trim() && !isGenerating 
                      ? 'bg-brand-orange text-brand-blue hover:scale-110 hover:rotate-12 shadow-lg' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                >
                    {isGenerating ? (
                    <div className="w-6 h-6 border-4 border-brand-blue border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                    <ArrowRight className="w-6 h-6 stroke-[3]" />
                    )}
                </button>
            </div>

            {/* Platform Selector Buttons - Equal Size & Distinct */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-[80%] sm:w-full mx-auto">
                {platforms.map((p) => {
                    const isActive = platform === p.id;
                    return (
                        <button
                            key={p.id}
                            onClick={() => setPlatform(p.id)}
                            disabled={isGenerating}
                            className={`
                                group relative h-14 rounded-xl font-bold uppercase tracking-widest text-xs border-2 transition-all duration-300 ease-out
                                flex items-center justify-center gap-3 outline-none
                                focus-visible:ring-4 focus-visible:ring-white/30
                                ${isActive 
                                    ? `${p.activeBg} ${p.activeBorder} text-white shadow-[0_6px_0_0_rgba(0,0,0,0.3)] translate-y-[-2px]` 
                                    : `bg-brand-cream border-transparent text-brand-text/40 shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:bg-white hover:text-brand-text hover:shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:translate-y-[-2px]`
                                }
                                active:translate-y-[1px] active:shadow-[0_2px_0_0_rgba(0,0,0,0.2)]
                                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            <p.icon 
                                className={`
                                    w-5 h-5 transition-colors duration-300
                                    ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-current'}
                                    ${!isActive && p.hoverText}
                                `} 
                            />
                            <span className={!isActive ? p.hoverText : ''}>{p.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Hero;
