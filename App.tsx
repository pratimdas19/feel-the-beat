import React, { useState, useEffect } from 'react';
import { ViewState, PlaylistResponse, User, SavedPlaylist } from './types';
import { generatePlaylistFromMood } from './services/geminiService';
import { authService } from './services/authService';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import PlaylistResult from './components/PlaylistResult';
import Background from './components/Background';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import Library from './components/Library';
import { AnimatePresence, motion } from 'framer-motion';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HERO);
  const [playlistData, setPlaylistData] = useState<PlaylistResponse | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // State to track if current generated playlist is saved
  const [currentPlaylistSaved, setCurrentPlaylistSaved] = useState(false);
  // Keep track of the mood for saving
  const [currentMood, setCurrentMood] = useState<string>("");

  useEffect(() => {
    // check session on load
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleGenerate = async (mood: string) => {
    setView(ViewState.GENERATING);
    setCurrentMood(mood);
    setCurrentPlaylistSaved(false);
    
    const start = Date.now();
    
    try {
      const data = await generatePlaylistFromMood(mood);
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
      alert("Something went wrong. Please try again.");
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
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // If we were trying to save a playlist, save it now
    if (view === ViewState.RESULTS && playlistData && !currentPlaylistSaved) {
        savePlaylistToUser(loggedInUser);
    } else if (view === ViewState.HERO) {
        // If on home screen, maybe go to library?
        // Optional: setView(ViewState.LIBRARY);
    }
  };

  const savePlaylistToUser = (targetUser: User) => {
    if (playlistData && currentMood) {
        authService.savePlaylist(targetUser, currentMood, playlistData);
        setCurrentPlaylistSaved(true);
    }
  };

  const handleSaveClick = () => {
    if (user) {
        savePlaylistToUser(user);
    } else {
        setIsAuthModalOpen(true);
    }
  };

  const handleViewLibraryPlaylist = (saved: SavedPlaylist) => {
      // Convert SavedPlaylist back to PlaylistResponse format for the Result view
      const { id, userId, createdAt, mood, ...data } = saved;
      setPlaylistData(data);
      setCurrentPlaylistSaved(true); // It's already saved since it comes from library
      setView(ViewState.RESULTS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-spotify selection:text-black">
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
                onReset={handleReset} 
                onSaveToLibrary={handleSaveClick}
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
                    onRefresh={() => {}} // Trigger re-render implicitly by authService updates
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