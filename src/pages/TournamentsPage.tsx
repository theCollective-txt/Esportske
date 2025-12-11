import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Gamepad2, Trophy, Play, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface TournamentsPageProps {
  user: any;
  accessToken: string | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export function TournamentsPage({ user, accessToken, onOpenAuth }: TournamentsPageProps) {
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeredTournaments, setRegisteredTournaments] = useState<string[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tournaments from backend
  useEffect(() => {
    fetchTournaments();
    if (user && accessToken) {
      fetchRegisteredTournaments();
    }
  }, [user, accessToken]);

  const fetchTournaments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/tournaments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch tournaments`);
      }

      const data = await response.json();
      
      if (!data.tournaments || !Array.isArray(data.tournaments)) {
        console.warn('No tournaments array in response:', data);
        setTournaments([]);
        return;
      }

      // Filter only tournaments (not scrims)
      const tournamentsOnly = data.tournaments.filter((t: any) => t.type !== 'scrim');
      setTournaments(tournamentsOnly);
    } catch (err: any) {
      console.error('Error fetching tournaments:', err);
      setError(err.message || 'Failed to fetch tournaments');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredTournaments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/my-tournaments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.tournaments) {
        setRegisteredTournaments(data.tournaments.map((t: any) => t.tournamentId));
      }
    } catch (err: any) {
      console.error('Error fetching registered tournaments:', err);
    }
  };

  const handleRegister = async (tournamentId: string, tournamentTitle: string) => {
    if (!user || !accessToken) {
      toast.error('Please sign in to register for tournaments');
      onOpenAuth('signup');
      return;
    }

    setRegistering(tournamentId);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/register-tournament`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tournamentId,
            tournamentTitle,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      setRegisteredTournaments([...registeredTournaments, tournamentId]);
      toast.success(`Successfully registered for ${tournamentTitle}! 🎮`);
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register for tournament');
    } finally {
      setRegistering(null);
    }
  };

  // Filter tournaments based on selections
  const filteredTournaments = tournaments.filter(tournament => {
    const gameMatch = selectedGame === 'all' || tournament.game === selectedGame;
    const locationMatch = selectedLocation === 'all' || tournament.area === selectedLocation;
    // Add more filter logic as needed
    return gameMatch && locationMatch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-7xl font-black mb-4">
              BROWSE <span className="gradient-text">TOURNAMENTS</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find and join competitive gaming tournaments across Nairobi
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-5xl mx-auto">
            <Card className="bg-card/80 backdrop-blur-xl border-border">
              <CardContent className="p-6">
                {/* Search Bar */}
                <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-3 mb-4">
                  <Search className="w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search tournaments, games, locations..."
                    className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground"
                  />
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Game</label>
                    <Select value={selectedGame} onValueChange={setSelectedGame}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Games" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Games</SelectItem>
                        <SelectItem value="FIFA 24">FIFA 24</SelectItem>
                        <SelectItem value="Valorant">Valorant</SelectItem>
                        <SelectItem value="Call of Duty">Call of Duty</SelectItem>
                        <SelectItem value="CS:GO">CS:GO</SelectItem>
                        <SelectItem value="League of Legends">League of Legends</SelectItem>
                        <SelectItem value="Rocket League">Rocket League</SelectItem>
                        <SelectItem value="Tekken 8">Tekken 8</SelectItem>
                        <SelectItem value="Apex Legends">Apex Legends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Date</label>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Dates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="tomorrow">Tomorrow</SelectItem>
                        <SelectItem value="this-week">This Week</SelectItem>
                        <SelectItem value="this-month">This Month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Locations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="Westlands">Westlands</SelectItem>
                        <SelectItem value="Karen">Karen</SelectItem>
                        <SelectItem value="CBD">CBD</SelectItem>
                        <SelectItem value="Kileleshwa">Kileleshwa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tournament Results */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">
              {loading ? 'Loading...' : `${filteredTournaments.length} Tournaments Found`}
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading tournaments...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-16">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={fetchTournaments} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredTournaments.length === 0 && (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-black mb-2">No Tournaments Found</h3>
              <p className="text-muted-foreground mb-6">
                {tournaments.length === 0 
                  ? 'No tournaments have been created yet. Check back soon!'
                  : 'No tournaments match your filters. Try adjusting your search criteria.'}
              </p>
              {tournaments.length > 0 && (
                <Button 
                  onClick={() => {
                    setSelectedGame('all');
                    setSelectedDate('all');
                    setSelectedLocation('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Tournaments Grid */}
          {!loading && !error && filteredTournaments.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTournaments.map((tournament, index) => (
                  <Card 
                    key={tournament.id}
                    className="group relative overflow-hidden hover:scale-105 transition-all duration-500"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-0">
                      {/* Tournament Image */}
                      <div className="relative h-48 overflow-hidden">
                        <ImageWithFallback
                          src={tournament.image}
                          alt={tournament.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        
                        {/* Live indicator */}
                        {tournament.isLive && (
                          <div className="absolute top-3 right-3 flex items-center gap-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 glow">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span className="text-xs text-white font-medium">LIVE NOW</span>
                          </div>
                        )}
                        
                        {/* Event type badge */}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="bg-black/50 text-white border-0">
                            {tournament.type || 'Tournament'}
                          </Badge>
                        </div>
                        
                        {/* Bottom info overlay */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm font-medium">{tournament.date || 'TBA'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{tournament.attendees || 0}/{tournament.maxAttendees || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Play button overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-16 w-16">
                            {tournament.isLive ? <Trophy className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                          </Button>
                        </div>
                      </div>

                      {/* Tournament Info */}
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="font-black text-lg mb-1">{tournament.title}</h3>
                          <p className="text-sm text-muted-foreground">Hosted by {tournament.host || 'ESPORTS-KE'}</p>
                        </div>

                        {/* Tournament Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{tournament.time || 'TBA'} • {tournament.duration || 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{tournament.location || 'Location TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="w-4 h-4" />
                            <span>{tournament.prizePool || 'Prize TBA'}</span>
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {(tournament.tags || []).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {tournament.skillLevel && (
                            <Badge variant="secondary" className="text-xs">
                              {tournament.skillLevel}
                            </Badge>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                          onClick={() => handleRegister(tournament.id, tournament.title)}
                          disabled={registering === tournament.id || registeredTournaments.includes(tournament.id)}
                        >
                          {registering === tournament.id ? 'Registering...' : tournament.isLive ? 'Watch Now' : registeredTournaments.includes(tournament.id) ? 'Registered' : 'Register Now'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="gradient-border px-8">
                  Load More Tournaments
                </Button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}