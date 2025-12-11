import { useState } from 'react';
import { Search, Calendar, Users, MapPin, Gamepad2, Settings, Trophy, LogOut, UserCircle, Menu, X, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import logoImage from 'figma:asset/7066abf5535bce8ca18393d6d93fa8b7b995eb82.png';

interface FloatingNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user: any;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
  userProfile?: any;
}

export function FloatingNav({ onNavigate, currentPage, user, onOpenAuth, onSignOut, userProfile }: FloatingNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Main floating nav bar */}
        <div className="bg-card/95 backdrop-blur-md border border-border rounded-2xl px-6 py-4 relative z-50">
          <div className="flex items-center justify-between relative z-50">
            {/* Logo and brand */}
            <button 
              onClick={() => handleNavigate('home')}
              className="hover:opacity-80 transition-opacity"
            >
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden">
                <img src={logoImage} alt="ESPORTS-KE" className="w-full h-full object-cover" />
              </div>
            </button>

            {/* Center navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-2">
              <button 
                onClick={() => handleNavigate('tournaments')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-primary/10 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Tournaments
              </button>
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-primary/10 transition-colors"
                onClick={() => handleNavigate('scrims')}
              >
                <Gamepad2 className="w-4 h-4" />
                Scrims & Practice
              </button>
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-primary/10 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Gaming Lounges
              </button>
              <button 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-primary/10 transition-colors"
                onClick={() => window.open('https://forms.gle/QeiA3NRT7ri7wYAH9', '_blank')}
              >
                <Users className="w-4 h-4" />
                Community
              </button>
            </nav>

            {/* Right side actions - Desktop */}
            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {/* Search bar */}

              {user ? (
                <>
                  {userProfile?.role === 'admin' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hidden lg:flex"
                      onClick={() => handleNavigate('admin')}
                      title="Admin Panel"
                    >
                      <Shield className="w-4 h-4 text-primary" />
                    </Button>
                  )}
                  
                  <button 
                    onClick={() => handleNavigate('profile')}
                    className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2 hover:bg-muted/70 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium whitespace-nowrap">{user.email?.split('@')[0]}</span>
                  </button>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={onSignOut}
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 text-foreground hover:text-foreground"
                    onClick={() => onOpenAuth('signin')}
                  >
                    Sign In
                  </Button>

                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-full px-5 text-white"
                    onClick={() => onOpenAuth('signup')}
                  >
                    Join Now
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-border space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Mobile Search */}
              <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tournaments..."
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
                />
              </div>

              {/* Mobile Navigation */}
              <div className="space-y-1">
                <button
                  onClick={() => handleNavigate('tournaments')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-black">Tournaments</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors"
                  onClick={() => handleNavigate('scrims')}
                >
                  <Gamepad2 className="w-5 h-5 text-primary" />
                  <span className="font-black">Scrims & Practice</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <MapPin className="w-5 h-5 text-primary" />
                  <span className="font-black">Gaming Lounges</span>
                </button>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors"
                  onClick={() => window.open('https://forms.gle/QeiA3NRT7ri7wYAH9', '_blank')}
                >
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-black">Community</span>
                </button>
              </div>

              {/* Mobile User Actions */}
              <div className="pt-3 border-t border-border space-y-2">
                {user ? (
                  <>
                    {userProfile?.role === 'admin' && (
                      <button 
                        onClick={() => handleNavigate('admin')}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
                      >
                        <Shield className="w-5 h-5 text-primary" />
                        <div className="flex-1 text-left">
                          <p className="font-black text-primary">Admin Panel</p>
                          <p className="text-xs text-muted-foreground">Manage platform</p>
                        </div>
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleNavigate('profile')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <UserCircle className="w-5 h-5 text-primary" />
                      <div className="flex-1 text-left">
                        <p className="font-black">{user.email?.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground">View Profile</p>
                      </div>
                      <Trophy className="w-5 h-5 text-muted-foreground" />
                    </button>
                    
                    <Button
                      variant="outline"
                      className="w-full gap-2 rounded-xl"
                      onClick={() => {
                        onSignOut();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      className="w-full rounded-xl"
                      onClick={() => {
                        onOpenAuth('signin');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-xl"
                      onClick={() => {
                        onOpenAuth('signup');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Join Now
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}