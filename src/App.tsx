import { useState, useEffect } from 'react';
import { FloatingNav } from './components/FloatingNav';
import { HomePage } from './pages/HomePage';
import { TournamentsPage } from './pages/TournamentsPage';
import { ScrimsPage } from './pages/ScrimsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPanel } from './components/AdminPanel';
import { BlogPage } from './components/BlogPage';
import { AuthModal } from './components/AuthModal';
import { getSupabaseClient } from './utils/supabase/client';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from './components/ui/sonner';
import { createClient } from '@supabase/supabase-js';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const supabase = getSupabaseClient();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        setUser(session.user);
        setAccessToken(session.access_token);
        
        // Fetch user profile
        await fetchUserProfile(session.access_token);
      }
    };

    checkSession();
    
    // Periodically refresh user profile to pick up role changes
    const profileRefreshInterval = setInterval(() => {
      if (accessToken) {
        fetchUserProfile(accessToken);
      }
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(profileRefreshInterval);
  }, [accessToken]);

  const fetchUserProfile = async (token: string) => {
    try {
      console.log('Fetching user profile with token:', token ? 'Token present' : 'No token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      console.log('Profile response status:', response.status);
      
      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Non-JSON response received:', textResponse);
        
        if (response.status === 401) {
          // Token expired or invalid - try to refresh session
          console.log('Token invalid or expired, attempting to refresh session...');
          const supabase = createClient(
            `https://${projectId}.supabase.co`,
            publicAnonKey
          );
          const { data: { session }, error } = await supabase.auth.refreshSession();
          
          if (session?.access_token) {
            console.log('Session refreshed successfully');
            setAccessToken(session.access_token);
            // Retry fetching profile with new token
            await fetchUserProfile(session.access_token);
          } else {
            console.log('Session refresh failed or no active session:', error);
            // Clear invalid session
            setAccessToken(null);
            setUserProfile(null);
          }
        }
        return;
      }
      
      const data = await response.json();
      console.log('Profile response data:', data);
      
      if (response.ok) {
        setUserProfile(data.profile);
      } else if (response.status === 401) {
        // Token expired or invalid - try to refresh session
        console.log('Token invalid or expired, attempting to refresh session...');
        const supabase = createClient(
          `https://${projectId}.supabase.co`,
          publicAnonKey
        );
        const { data: { session }, error } = await supabase.auth.refreshSession();
        
        if (session?.access_token) {
          console.log('Session refreshed successfully');
          setAccessToken(session.access_token);
          // Retry fetching profile with new token
          await fetchUserProfile(session.access_token);
        } else {
          console.log('Session refresh failed or no active session:', error);
          // Clear invalid session
          setAccessToken(null);
          setUserProfile(null);
        }
      } else {
        console.error('Failed to fetch profile - HTTP', response.status, ':', data.error);
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      console.error('Error details:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' = 'signin') => {
    console.log('Opening auth modal with mode:', mode);
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    setAccessToken(token);
    setUser(userData);
    fetchUserProfile(token);
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
        userProfile={userProfile}
        onOpenAuth={handleOpenAuth}
        onSignOut={handleSignOut}
      />
      
      {currentPage === 'home' && (
        <HomePage 
          onNavigate={handleNavigate} 
          user={userProfile}
          accessToken={accessToken || undefined}
          onOpenAuthModal={() => {
            setAuthMode('signin');
            setAuthModalOpen(true);
          }}
          onRefreshProfile={() => {
            if (accessToken) {
              fetchUserProfile(accessToken);
            }
          }}
        />
      )}
      {currentPage === 'tournaments' && (
        <TournamentsPage 
          user={user} 
          accessToken={accessToken}
          onOpenAuth={handleOpenAuth}
        />
      )}
      {currentPage === 'scrims' && (
        <ScrimsPage 
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
      {currentPage === 'admin' && user && accessToken && userProfile?.role === 'admin' && (
        <AdminPanel 
          accessToken={accessToken}
          onNavigate={handleNavigate}
        />
      )}
      {currentPage === 'blog' && (
        <BlogPage />
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