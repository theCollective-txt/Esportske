import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Gamepad2, Trophy, Play, Filter, Search, SlidersHorizontal, Swords } from 'lucide-react';
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

interface ScrimsPageProps {
  user: any;
  accessToken: string | null;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export function ScrimsPage({ user, accessToken, onOpenAuth }: ScrimsPageProps) {
  const [selectedGame, setSelectedGame] = useState('all');
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [registering, setRegistering] = useState<string | null>(null);
  const [registeredScrims, setRegisteredScrims] = useState<string[]>([]);
  const [scrims, setScrims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch scrims from backend
  useEffect(() => {
    fetchScrims();
    if (user && accessToken) {
      fetchRegisteredScrims();
    }
  }, [user, accessToken]);

  const fetchScrims = async () => {
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
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch scrims`);
      }

      const data = await response.json();
      
      if (!data.tournaments || !Array.isArray(data.tournaments)) {
        console.warn('No tournaments array in response:', data);
        setScrims([]);
        return;
      }

      // Filter only scrims/practice sessions
      const scrimsOnly = data.tournaments.filter((t: any) => t.type === 'scrim');
      setScrims(scrimsOnly);
    } catch (err: any) {
      console.error('Error fetching scrims:', err);
      setError(err.message || 'Failed to fetch scrims');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredScrims = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/my-tournaments`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const ids = data.tournaments?.map((t: any) => t.tournamentId) || [];
        setRegisteredScrims(ids);
      }
    } catch (err) {
      console.error('Error fetching registered scrims:', err);
    }
  };

  const handleRegister = async (scrimId: string, scrimTitle: string) => {
    if (!user) {
      onOpenAuth('signin');
      return;
    }

    setRegistering(scrimId);
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
            tournamentId: scrimId,
            tournamentTitle: scrimTitle,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Successfully registered for scrim!');
        setRegisteredScrims([...registeredScrims, scrimId]);
      } else {
        toast.error(data.error || 'Failed to register');
      }
    } catch (err: any) {
      console.error('Error registering for scrim:', err);
      toast.error('Failed to register for scrim');
    } finally {
      setRegistering(null);
    }
  };

  // Filter scrims based on selections
  const filteredScrims = scrims.filter((scrim) => {
    if (selectedGame !== 'all' && scrim.game !== selectedGame) return false;
    if (selectedLocation !== 'all' && scrim.location !== selectedLocation) return false;
    if (selectedDate !== 'all') {
      const scrimDate = new Date(scrim.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate === 'today' && scrimDate.toDateString() !== today.toDateString()) return false;
      if (selectedDate === 'week') {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (scrimDate < today || scrimDate > nextWeek) return false;
      }
      if (selectedDate === 'month') {
        const nextMonth = new Date(today);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        if (scrimDate < today || scrimDate > nextMonth) return false;
      }
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameColor = (game: string) => {
    const colors: Record<string, string> = {
      'FIFA 24': 'bg-green-500',
      'Valorant': 'bg-red-500',
      'Call of Duty': 'bg-orange-500',
      'CS:GO': 'bg-blue-500',
      'League of Legends': 'bg-purple-500',
      'Rocket League': 'bg-cyan-500',
      'Tekken 8': 'bg-yellow-500',
      'Apex Legends': 'bg-pink-500',
    };
    return colors[game] || 'bg-primary';
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Swords className="w-8 h-8 text-primary" />
            <h1 className="text-5xl font-black">Scrims & Practice</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Find practice sessions, scrims, and casual matches to sharpen your skills and connect with other players in Nairobi.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Select value={selectedGame} onValueChange={setSelectedGame}>
            <SelectTrigger className="gradient-border">
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

          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="gradient-border">
              <SelectValue placeholder="All Dates" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Dates</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="gradient-border">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="Westlands">Westlands</SelectItem>
              <SelectItem value="Karen">Karen</SelectItem>
              <SelectItem value="CBD">CBD</SelectItem>
              <SelectItem value="Kileleshwa">Kileleshwa</SelectItem>
              <SelectItem value="Kilimani">Kilimani</SelectItem>
              <SelectItem value="Lavington">Lavington</SelectItem>
              <SelectItem value="Parklands">Parklands</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {filteredScrims.length} {filteredScrims.length === 1 ? 'Scrim' : 'Scrims'}
            </Badge>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-muted-foreground">Loading scrims...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchScrims} variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredScrims.length === 0 && (
          <div className="text-center py-20">
            <Swords className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-black mb-2">No Scrims Found</h3>
            <p className="text-muted-foreground mb-4">
              {scrims.length === 0 
                ? "No scrims or practice sessions available at the moment." 
                : "Try adjusting your filters to see more scrims."}
            </p>
            {selectedGame !== 'all' || selectedDate !== 'all' || selectedLocation !== 'all' ? (
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
            ) : null}
          </div>
        )}

        {/* Scrims Grid */}
        {!loading && !error && filteredScrims.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScrims.map((scrim) => {
              const isRegistered = registeredScrims.includes(scrim.id);
              const isFull = scrim.maxAttendees && scrim.attendees >= scrim.maxAttendees;
              
              return (
                <Card key={scrim.id} className="overflow-hidden hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group gradient-border">
                  {/* Image */}
                  {scrim.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <ImageWithFallback 
                        src={scrim.imageUrl} 
                        alt={scrim.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={`${getGameColor(scrim.game)} text-white border-0`}>
                          {scrim.game}
                        </Badge>
                      </div>
                      {scrim.format && (
                        <div className="absolute top-4 right-4">
                          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                            {scrim.format}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Title */}
                    <h3 className="font-black text-xl mb-2 group-hover:text-primary transition-colors">
                      {scrim.title}
                    </h3>

                    {/* Host */}
                    {scrim.host && (
                      <p className="text-sm text-muted-foreground mb-4">
                        Hosted by {scrim.host}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span>{formatDate(scrim.startDate)}</span>
                      </div>

                      {scrim.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-500" />
                          <span>{scrim.location}</span>
                        </div>
                      )}

                      {scrim.maxAttendees && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span>
                            {scrim.attendees || 0}/{scrim.maxAttendees} {scrim.format === 'Team' ? 'teams' : 'players'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {scrim.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {scrim.description}
                      </p>
                    )}

                    {/* Register Button */}
                    <Button
                      onClick={() => handleRegister(scrim.id, scrim.title)}
                      disabled={isRegistered || isFull || registering === scrim.id}
                      className="w-full"
                      variant={isRegistered ? "outline" : "default"}
                    >
                      {registering === scrim.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Joining...
                        </>
                      ) : isRegistered ? (
                        'Registered ✓'
                      ) : isFull ? (
                        'Full'
                      ) : (
                        'Join Scrim'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
