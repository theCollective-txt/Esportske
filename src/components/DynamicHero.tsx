import { useState, useEffect } from 'react';
import { Calendar, Users, Gamepad2, MapPin, Play, Trophy } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DynamicHeroProps {
  onNavigate: (page: string) => void;
}

export function DynamicHero({ onNavigate }: DynamicHeroProps) {
  const [upcomingTournaments, setUpcomingTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingTournaments();
  }, []);

  const fetchUpcomingTournaments = async () => {
    setLoading(true);
    try {
      console.log('Fetching tournaments with projectId:', projectId);
      console.log('Using publicAnonKey:', publicAnonKey ? 'Key exists' : 'Key is missing');
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/tournaments`;
      console.log('Request URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch tournaments`);
      }

      const data = await response.json();
      console.log('Tournaments data received:', data);
      
      if (!data.tournaments || !Array.isArray(data.tournaments)) {
        console.warn('No tournaments array in response:', data);
        setUpcomingTournaments([]);
        return;
      }

      // Filter tournaments within the next 7 days (excluding scrims)
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);

      const filtered = data.tournaments.filter((tournament: any) => {
        if (!tournament.startDate) return false;
        if (tournament.type === 'scrim') return false; // Exclude scrims
        const tournamentDate = new Date(tournament.startDate);
        return tournamentDate >= now && tournamentDate <= oneWeekFromNow;
      });

      // Sort by date (closest first) and limit to 6
      const sorted = filtered.sort((a: any, b: any) => {
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        return dateA - dateB;
      }).slice(0, 6);

      console.log('Filtered tournaments:', sorted.length);
      setUpcomingTournaments(sorted);
    } catch (err: any) {
      console.error('Error fetching upcoming tournaments:', err);
      setUpcomingTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  // Card positioning and styling variants for up to 6 cards
  const cardVariants = [
    { position: 'lg:top-0 lg:right-0', rotate: 'lg:rotate-3', bgColor: 'bg-primary/10', border: 'border-primary/20', glow: 'glow' },
    { position: 'lg:top-32 lg:left-0', rotate: 'lg:-rotate-6', bgColor: 'bg-accent/10', border: 'border-accent/20', glow: 'glow-accent' },
    { position: 'lg:bottom-20 lg:right-8', rotate: 'lg:rotate-6', bgColor: 'bg-secondary/10', border: 'border-secondary/20', glow: 'glow-secondary' },
    { position: 'lg:top-64 lg:right-16', rotate: 'lg:-rotate-3', bgColor: 'bg-primary/10', border: 'border-primary/20', glow: 'glow' },
    { position: 'lg:bottom-32 lg:left-8', rotate: 'lg:rotate-4', bgColor: 'bg-secondary/10', border: 'border-secondary/20', glow: 'glow-secondary' },
    { position: 'lg:top-16 lg:left-16', rotate: 'lg:-rotate-2', bgColor: 'bg-accent/10', border: 'border-accent/20', glow: 'glow-accent' },
  ];

  const formatTournamentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'TODAY';
    if (days === 1) return 'TOMORROW';
    if (days < 7) return `IN ${days} DAYS`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

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
            <div className="space-y-6 md:space-y-8">
              {/* Main heading with experimental layout */}
              <div className="space-y-1 md:space-y-2">
                <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-black leading-none tracking-tight">
                  <span className="block text-white">LEVEL</span>
                  <span className="block text-primary">UP</span>
                  <span className="block text-white">YOUR</span>
                  <span className="block text-secondary">GAME</span>
                </h1>
                
                {/* Decorative line */}
                <div className="flex items-center gap-2 md:gap-3 py-2">
                  <div className="h-0.5 md:h-1 w-12 md:w-16 bg-primary"></div>
                  <div className="h-0.5 md:h-1 w-6 md:w-8 bg-secondary"></div>
                  <div className="h-0.5 md:h-1 w-3 md:w-4 bg-primary"></div>
                </div>
              </div>
              
              {/* Description with gaming context */}
              <div className="space-y-2 md:space-y-3 max-w-xl">
                <p className="text-lg sm:text-xl text-white leading-relaxed">
                  Join Kenya's most competitive gaming community.
                </p>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  From Westlands to Karen, discover tournaments, compete in scrims, 
                  attend watch parties, and connect with the best gamers across Nairobi.
                </p>
              </div>
              
              {/* Quick stats inline */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse flex-shrink-0"></div>
                  <span className="text-xs sm:text-sm text-muted-foreground">FIFA • VALORANT • COD • CS:GO</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:opacity-90 rounded-full px-8 glow"
                onClick={() => onNavigate('tournaments')}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Browse Tournaments
              </Button>
              <Button size="lg" variant="outline" className="gradient-border rounded-full px-8" asChild>
                <a href="https://forms.gle/QeiA3NRT7ri7wYAH9" target="_blank" rel="noopener noreferrer">
                  <Gamepad2 className="w-5 h-5 mr-2" />
                  Join Community
                </a>
              </Button>
            </div>
          </div>

          {/* Floating event cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative h-auto md:min-h-[500px] lg:h-[600px]">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground">Loading tournaments...</p>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && upcomingTournaments.length === 0 && (
                <div className="flex items-center justify-center h-full min-h-[300px]">
                  <Card className="w-full max-w-sm bg-primary/10 border-primary/20">
                    <CardContent className="p-8 text-center">
                      <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h4 className="font-bold text-white mb-2">No Upcoming Tournaments</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        No tournaments scheduled within the next week.
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => onNavigate('tournaments')}
                        className="gradient-border"
                      >
                        View All Tournaments
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Dynamic Tournament Cards - Grid on mobile/tablet, absolute positioning on desktop */}
              {!loading && upcomingTournaments.length > 0 && (
                <>
                  {/* Mobile/Tablet: Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                    {upcomingTournaments.map((tournament, index) => {
                      const variant = cardVariants[index];
                      const isLive = tournament.isLive;
                      
                      return (
                        <Card 
                          key={tournament.id}
                          className={`${variant.bgColor} ${variant.border} ${variant.glow} hover:scale-105 transition-all duration-500`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <CardContent className="p-6">
                            {/* Live indicator or Date */}
                            {isLive ? (
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-primary">LIVE NOW</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span className="text-xs font-bold text-white">
                                  {formatTournamentDate(tournament.startDate)}
                                </span>
                              </div>
                            )}

                            {/* Tournament Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                {isLive ? (
                                  <Trophy className="w-6 h-6 text-white" />
                                ) : (
                                  <Gamepad2 className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-white truncate">{tournament.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {tournament.host || 'ESPORTS-KE'}
                                </p>
                              </div>
                            </div>

                            {/* Tournament Details */}
                            <div className="space-y-2">
                              {tournament.maxAttendees && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Users className="w-4 h-4 text-accent flex-shrink-0" />
                                  <span className="truncate">
                                    {tournament.attendees || 0}/{tournament.maxAttendees} {tournament.format === 'Team' ? 'teams' : 'players'}
                                  </span>
                                </div>
                              )}
                              {tournament.location && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="truncate">{tournament.location}</span>
                                </div>
                              )}
                              {tournament.prizePool && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                  <span className="truncate">{tournament.prizePool}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* Desktop: Floating Absolute Layout */}
                  <div className="hidden lg:block">
                    {upcomingTournaments.map((tournament, index) => {
                      const variant = cardVariants[index];
                      const isLive = tournament.isLive;
                      
                      return (
                        <Card 
                          key={tournament.id}
                          className={`absolute ${variant.position} w-72 ${variant.bgColor} ${variant.border} ${variant.glow} ${variant.rotate} hover:rotate-0 transition-transform duration-500`}
                        >
                          <CardContent className="p-6">
                            {/* Live indicator or Date */}
                            {isLive ? (
                              <div className="flex items-center gap-2 mb-3">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-xs font-bold text-primary">LIVE NOW</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar className="w-4 h-4 text-accent" />
                                <span className="text-xs font-bold text-white">
                                  {formatTournamentDate(tournament.startDate)}
                                </span>
                              </div>
                            )}

                            {/* Tournament Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                                {isLive ? (
                                  <Trophy className="w-6 h-6 text-white" />
                                ) : (
                                  <Gamepad2 className="w-6 h-6 text-white" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-white truncate">{tournament.title}</h4>
                                <p className="text-sm text-muted-foreground truncate">
                                  {tournament.host || 'ESPORTS-KE'}
                                </p>
                              </div>
                            </div>

                            {/* Tournament Details */}
                            <div className="space-y-2">
                              {tournament.maxAttendees && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Users className="w-4 h-4 text-accent flex-shrink-0" />
                                  <span className="truncate">
                                    {tournament.attendees || 0}/{tournament.maxAttendees} {tournament.format === 'Team' ? 'teams' : 'players'}
                                  </span>
                                </div>
                              )}
                              {tournament.location && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="truncate">{tournament.location}</span>
                                </div>
                              )}
                              {tournament.prizePool && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                  <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                  <span className="truncate">{tournament.prizePool}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}