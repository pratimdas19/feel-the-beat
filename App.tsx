
import React, { useState } from 'react';
import { ViewState, PlaylistResponse, Platform } from './types';
import { generatePlaylistFromMood, generatePlaylistCover } from './services/geminiService';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import PlaylistResult from './components/PlaylistResult';
import Background from './components/Background';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HERO);
  const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(null);
  
  // App State
  const [platform, setPlatform] = useState<Platform>('spotify');

  // Toast State
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error', show: boolean }>({ msg: '', type: 'success', show: false });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type, show: true });
  };

  const handleGenerate = async (mood: string, selectedPlatform: Platform) => {
    setView(ViewState.GENERATING);
    setPlatform(selectedPlatform);
    
    const start = Date.now();
    
    try {
      // Run text generation and image generation in parallel
      const [data, coverArtUrl] = await Promise.all([
        generatePlaylistFromMood(mood),
        generatePlaylistCover(mood)
      ]);

      if (coverArtUrl) {
        data.coverArt = coverArtUrl;
      }
      
      setPlaylistData(data);
      
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 2000 - elapsed);
      
      setTimeout(() => {
        setView(ViewState.RESULTS);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, delay);
    } catch (e) {
      console.error("Failed to generate", e);
      setView(ViewState.HERO);
      showToast("Failed to generate playlist", "error");
    }
  };

  const handleReset = () => {
    setPlaylistData(null);
    setView(ViewState.HERO);
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-brand-orange selection:text-black">
      <Background />
      <Header onNavigate={setView} />
      
      <Toast 
        message={toast.msg}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />

      <main>
        <AnimatePresence mode="wait">
          {view === ViewState.HERO || view === ViewState.GENERATING ? (
            <motion.div
               key="hero"
               exit={{ opacity: 0, y: -50 }}
               transition={{ duration: 0.5 }}
            >
              <Hero onGenerate={handleGenerate} isGenerating={view === ViewState.GENERATING} />
              <Features />
            </motion.div>
          ) : view === ViewState.RESULTS && playlistData ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PlaylistResult 
                data={playlistData} 
                platform={platform}
                onReset={handleReset} 
              />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default App;
