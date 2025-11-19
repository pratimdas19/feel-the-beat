import React, { useState, KeyboardEvent } from 'react';
import { ArrowRight, Sparkles, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onGenerate: (mood: string) => void;
  isGenerating: boolean;
}

const Hero: React.FC<HeroProps> = ({ onGenerate, isGenerating }) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() && !isGenerating) {
      onGenerate(input);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-spotify mb-8">
          <Sparkles className="w-3 h-3" />
          <span>Powered by Gemini 2.5 Flash</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
          Feel The <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotify to-emerald-300">Beats.</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
          Your mood. Your music. Instantly. <br className="hidden md:block"/>
          Describe how you feel, and let AI curate the vibe.
        </p>

        <div className="relative max-w-xl mx-auto group">
          <div className="absolute -inset-1 bg-gradient-to-r from-spotify to-blue-600 rounded-full opacity-20 group-hover:opacity-50 blur transition duration-500"></div>
          <div className="relative bg-black rounded-full p-2 flex items-center border border-white/10 focus-within:border-spotify/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder="How are you feeling today?"
              className="flex-1 bg-transparent text-white px-6 py-4 text-lg outline-none placeholder-gray-500"
            />
            
            <div className="flex items-center pr-2 gap-2">
               {input && !isGenerating && (
                  <motion.button
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     onClick={() => setInput('')}
                     className="p-2 text-gray-500 hover:text-white"
                  >
                     <span className="text-xs font-bold">CLR</span>
                  </motion.button>
               )}
               <button 
                 onClick={() => input.trim() && onGenerate(input)}
                 disabled={isGenerating || !input.trim()}
                 className={`
                   p-4 rounded-full transition-all duration-300 flex items-center justify-center
                   ${input.trim() && !isGenerating ? 'bg-spotify hover:bg-spotify-light text-black rotate-0' : 'bg-dark-700 text-gray-500 cursor-not-allowed -rotate-90'}
                 `}
               >
                 {isGenerating ? (
                   <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                 ) : (
                   <ArrowRight className="w-5 h-5" />
                 )}
               </button>
            </div>
          </div>
        </div>

        {/* Decorative waveforms/equalizer */}
        {isGenerating && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="mt-12 flex items-center justify-center gap-1 h-8"
           >
              {[...Array(10)].map((_, i) => (
                 <motion.div
                    key={i}
                    animate={{ 
                       height: [10, 32, 10],
                       backgroundColor: ["#1DB954", "#ffffff", "#1DB954"] 
                    }}
                    transition={{ 
                       repeat: Infinity, 
                       duration: 1, 
                       delay: i * 0.1,
                       ease: "easeInOut" 
                    }}
                    className="w-2 rounded-full"
                 />
              ))}
           </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Hero;