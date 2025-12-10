import { useState, useEffect } from 'react';
import { FloatingNav } from './components/FloatingNav';
import { HomePage } from './pages/HomePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { getSupabaseClient } from './utils/supabase/client';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        setUser(session.user);
        setAccessToken(session.access_token);
      }
    };

    checkSession();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    handleNavigate('home');
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Toaster position="top-center" />
      <FloatingNav 
        onNavigate={handleNavigate} 
        currentPage={currentPage}
        user={user}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />
      
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'tournaments' && (
        <TournamentsPage 
          user={user} 
          accessToken={accessToken}
          onOpenAuth={handleOpenAuth}
        />
      )}
      {currentPage === 'profile' && user && accessToken && (
        <ProfilePage 
          user={user}
          accessToken={accessToken}
          onNavigate={handleNavigate}
        />
      )}
      
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
      
      {/* Floating footer */}
      <footer className="p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-muted-foreground">
                © 2025 ESPORTS-KE. Connecting Nairobi's gamers. 🇰🇪
              </div>
              <div className="flex items-center gap-6 text-sm">
                <button 
                  onClick={() => handleNavigate('tournaments')}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tournaments
                </button>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Community</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Host Guide</a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}