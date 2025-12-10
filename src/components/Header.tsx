import { Menu, Search, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import logoImage from 'figma:asset/d71379c4510e7389463f3b7223ce4bebb78021ce.png';

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={logoImage} alt="Hit Shuffle" className="h-12 w-12" />
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Home
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Artists
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Tracks
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Events
              </a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Community
              </a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search music, artists..." 
                className="w-64"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="icon">
              <User className="w-4 h-4" />
            </Button>
            
            <Button className="hidden md:inline-flex">
              Join Community
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}