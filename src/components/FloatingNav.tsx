import { Search, Calendar, Users, MapPin, Gamepad2, Settings, Trophy, LogOut, UserCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import logoImage from 'figma:asset/d71379c4510e7389463f3b7223ce4bebb78021ce.png';

interface FloatingNavProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  user: any;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onSignOut: () => void;
}

export function FloatingNav({ onNavigate, currentPage, user, onOpenAuth, onSignOut }: FloatingNavProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Main floating nav bar */}
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and brand */}
            <button 
              onClick={() => onNavigate('home')}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <img src={logoImage} alt="ESPORTS-KE" className="h-10 w-10" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-black gradient-text">ESPORTS-KE</h2>
                <p className="text-xs text-muted-foreground">Gaming Events</p>
              </div>
            </button>

            {/* Center navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={() => onNavigate('tournaments')}
              >
                <Calendar className="w-4 h-4" />
                Tournaments
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Gamepad2 className="w-4 h-4" />
                Scrims & Practice
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <MapPin className="w-4 h-4" />
                Gaming Lounges
              </Button>
              <Button variant="ghost" size="sm" className="gap-2">
                <Users className="w-4 h-4" />
                Community
              </Button>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Search bar */}
              <div className="hidden md:flex items-center gap-2 bg-muted/50 rounded-full px-4 py-2 min-w-[200px]">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search tournaments, games..."
                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
                />
              </div>

              {user ? (
                <>
                  {/* User menu */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full"
                    onClick={() => onNavigate('profile')}
                    title="My Tournaments"
                  >
                    <Trophy className="w-4 h-4" />
                  </Button>
                  
                  <button 
                    onClick={() => onNavigate('profile')}
                    className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-2 hover:bg-muted/70 transition-colors"
                  >
                    <UserCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">{user.email?.split('@')[0]}</span>
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
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Trophy className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="rounded-full px-4"
                    onClick={() => onOpenAuth('signin')}
                  >
                    Sign In
                  </Button>

                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-full px-6"
                    onClick={() => onOpenAuth('signup')}
                  >
                    Join Now
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}