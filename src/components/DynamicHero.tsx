import { Calendar, Users, Gamepad2, MapPin, Play, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface DynamicHeroProps {
  onNavigate: (page: string) => void;
}

export function DynamicHero({ onNavigate }: DynamicHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Main content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary text-sm font-medium">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                NAIROBI'S GAMING COMMUNITY
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-black leading-none">
                NAIROBI
                <br />
                <span className="text-primary">GAMERS</span>
                <br />
                UNITE
                <br />
                <span className="text-secondary">HERE</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Join Nairobi's most competitive gaming community. From Westlands to Karen, 
                discover tournaments, scrims, watch parties, and connect with fellow gamers 
                across the city.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-full px-8 glow"
                onClick={() => onNavigate('tournaments')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Browse Tournaments
              </Button>
              <Button size="lg" variant="outline" className="gradient-border rounded-full px-8" asChild>
                <a href="https://discord.gg/SCR5SpJM4T" target="_blank" rel="noopener noreferrer">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Join Community
                </a>
              </Button>
            </div>

            {/* Live stats */}
            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-2xl font-black gradient-text">18</div>
                <div className="text-xs text-muted-foreground">Tournaments This Week</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black gradient-text">6</div>
                <div className="text-xs text-muted-foreground">Live Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black gradient-text">2.4K</div>
                <div className="text-xs text-muted-foreground">Nairobi Gamers</div>
              </div>
            </div>
          </div>

          {/* Floating event cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-[600px]">
              {/* Card 1 - Live Tournament */}
              <Card className="absolute top-0 right-0 w-72 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 glow rotate-3 hover:rotate-0 transition-transform duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-primary">LIVE NOW</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold">FIFA 24 Cup</h4>
                      <p className="text-sm text-muted-foreground">@nairobifc</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-accent" />
                      <span>32 players competing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>Westlands Gaming Hub</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2 - Upcoming Tournament */}
              <Card className="absolute top-32 left-0 w-64 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20 glow-accent -rotate-6 hover:rotate-0 transition-transform duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold">TONIGHT 8PM EAT</span>
                  </div>
                  <h5 className="font-bold mb-2">COD: Warzone Scrims</h5>
                  <p className="text-sm text-muted-foreground mb-3">Squad practice session</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" />
                    <span className="text-sm">eSports Arena Karen</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3 - Popular Tournament */}
              <Card className="absolute bottom-20 right-8 w-60 bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/20 glow-secondary rotate-6 hover:rotate-0 transition-transform duration-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Gamepad2 className="w-6 h-6 text-secondary" />
                    <span className="font-bold">This Weekend</span>
                  </div>
                  <h5 className="font-bold mb-1">Valorant Championships</h5>
                  <p className="text-sm text-muted-foreground mb-3">5v5 Team Tournament</p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 bg-primary rounded-full border-2 border-card"></div>
                      <div className="w-6 h-6 bg-secondary rounded-full border-2 border-card"></div>
                      <div className="w-6 h-6 bg-accent rounded-full border-2 border-card"></div>
                    </div>
                    <span className="text-xs text-muted-foreground">12 teams registered</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}