
import React, { useState, useEffect } from 'react';
import { ViewState, PlaylistResponse, User, SavedPlaylist, Platform } from './types';
import { generatePlaylistFromMood, generatePlaylistCover } from './services/geminiService';
import { authService } from './services/authService';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import PlaylistResult from './components/PlaylistResult';
import Background from './components/Background';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Library from './components/Library';
import Toast from './components/Toast';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HERO);
  const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(null);
  
  // Auth State (App Level - for saving to library)
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // App State
  const [currentPlaylistSaved, setCurrentPlaylistSaved] = useState(false);
  const [currentMood, setCurrentMood] = useState<string>("");
  const [platform, setPlatform] = useState<Platform>('spotify');

  // Toast State
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error', show: boolean }>({ msg: '', type: 'success', show: false });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type, show: true });
  };

  const handleGenerate = async (mood: string, selectedPlatform: Platform) => {
    setView(ViewState.GENERATING);
    setCurrentMood(mood);
    setPlatform(selectedPlatform);
    setCurrentPlaylistSaved(false);
    
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
    setCurrentPlaylistSaved(false);
    setView(ViewState.HERO);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setView(ViewState.HERO);
    showToast("Logged out successfully", "success");
  };

  const handleLoginSuccess = async (loggedInUser: User) => {
    setUser(loggedInUser);
    showToast(`Welcome back, ${loggedInUser.name}`, "success");
  };

  // This saves to the internal 'Feel The Beats' library, distinct from the Streaming Service transfer
  const savePlaylistToUser = async () => {
    if (!user) {
        // If not logged in to app, we can still save silently if we want, 
        // but usually we want to link it. For now, silent return or prompt.
        // The main CTA handles the streaming service connection.
        return; 
    }
    
    if (playlistData && currentMood) {
        try {
            await authService.savePlaylist(user, currentMood, playlistData, platform);
            setCurrentPlaylistSaved(true);
            showToast("Saved to your internal library", "success");
        } catch (e) {
            console.error(e);
        }
    }
  };

  const handleViewLibraryPlaylist = (saved: SavedPlaylist) => {
      const { id, userId, createdAt, mood, platform: savedPlatform, ...data } = saved;
      setPlaylistData(data);
      setPlatform(savedPlatform || 'spotify');
      setCurrentPlaylistSaved(true);
      setView(ViewState.RESULTS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-brand-orange selection:text-black">
      <Background />
      <Header 
        user={user} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNavigate={setView}
        currentView={view}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      
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
                user={user}
                platform={platform}
                onReset={handleReset} 
                onSaveToLibrary={savePlaylistToUser}
                hasSavedToLibrary={currentPlaylistSaved}
              />
            </motion.div>
          ) : view === ViewState.LIBRARY && user ? (
              <motion.div
                  key="library"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Library 
                    userId={user.id} 
                    onViewPlaylist={handleViewLibraryPlaylist}
                    onRefresh={() => {}} 
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
