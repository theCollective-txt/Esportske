import { Facebook, Twitter, Instagram, Youtube, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import logoImage from 'figma:asset/7066abf5535bce8ca18393d6d93fa8b7b995eb82.png';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoImage} alt="Hit Shuffle" className="h-8 w-8" />
              <span className="text-xl">Hit Shuffle</span>
            </div>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Where music lovers connect, discover, and create together. Join our vibrant community today.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Facebook className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Twitter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Instagram className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Youtube className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <h4 className="mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Artists</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Tracks</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Events</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Discussions</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Help Center</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Contact Us</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-foreground/80 hover:text-primary-foreground">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4">Stay Updated</h4>
            <p className="text-sm text-primary-foreground/80 mb-4">
              Get the latest news and updates from Hit Shuffle
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter your email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
              />
              <Button variant="secondary" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-primary-foreground/80 mb-4 md:mb-0">
            © 2025 Hit Shuffle. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-primary-foreground/80">
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>contact@hitshuffle.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}