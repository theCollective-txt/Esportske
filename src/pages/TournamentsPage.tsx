import { useState } from 'react';
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
  const [registering, setRegistering] = useState<number | null>(null);
  const [registeredTournaments, setRegisteredTournaments] = useState<number[]>([]);

  const handleRegister = async (tournamentId: number, tournamentTitle: string) => {
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

  const tournaments = [
    {
      id: 1,
      title: 'FIFA 24 Championship',
      game: 'FIFA 24',
      type: 'Tournament',
      format: '1v1 Bracket',
      host: 'Nairobi FC Gaming',
      date: 'Tonight',
      fullDate: 'Dec 10, 2025',
      time: '8:00 PM EAT',
      duration: '4 hours',
      attendees: 48,
      maxAttendees: 64,
      location: 'Westlands Gaming Hub',
      area: 'Westlands',
      image: 'https://images.unsplash.com/photo-1759701546851-1d903ac1a2e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudHxlbnwxfHx8fDE3NjUyNjQ3MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 50,000',
      skillLevel: 'All Levels',
      tags: ['FIFA 24', 'Sports', '1v1']
    },
    {
      id: 2,
      title: 'Valorant 5v5 League',
      game: 'Valorant',
      type: 'Competitive Match',
      format: '5v5 Teams',
      host: 'Kenya Esports League',
      date: 'Tomorrow',
      fullDate: 'Dec 11, 2025',
      time: '7:30 PM EAT',
      duration: '3 hours',
      attendees: 56,
      maxAttendees: 80,
      location: 'eSports Arena Karen',
      area: 'Karen',
      image: 'https://images.unsplash.com/photo-1763258986479-0962883e1747?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGl2ZSUyMGdhbWluZyUyMHNldHVwfGVufDF8fHx8MTc2NTI2OTg3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 100,000',
      skillLevel: 'Advanced',
      tags: ['Valorant', 'FPS', 'Team']
    },
    {
      id: 3,
      title: 'COD: Warzone Battle Royale',
      game: 'Call of Duty',
      type: 'Tournament',
      format: 'Squad BR',
      host: 'Call of Duty Kenya',
      date: 'Saturday',
      fullDate: 'Dec 14, 2025',
      time: '9:00 PM EAT',
      duration: '5 hours',
      attendees: 92,
      maxAttendees: 100,
      location: 'Cyber Arena Kileleshwa',
      area: 'Kileleshwa',
      image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBjb250cm9sbGVyfGVufDF8fHx8MTc2NTM1NTc1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 75,000',
      skillLevel: 'Intermediate',
      tags: ['COD', 'Battle Royale', 'Squads']
    },
    {
      id: 4,
      title: 'CS:GO Scrims & Practice',
      game: 'CS:GO',
      type: 'Practice Session',
      format: '5v5 Scrims',
      host: 'Counter-Strike Nairobi',
      date: 'Sunday',
      fullDate: 'Dec 15, 2025',
      time: '4:00 PM EAT',
      duration: '3 hours',
      attendees: 34,
      maxAttendees: 50,
      location: 'Game Lounge Westlands',
      area: 'Westlands',
      image: 'https://images.unsplash.com/photo-1632603093711-0d93a0bcc6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjByb29tJTIwbGlnaHRzfGVufDF8fHx8MTc2NTM1ODcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'Free',
      skillLevel: 'All Levels',
      tags: ['CS:GO', 'FPS', 'Practice']
    },
    {
      id: 5,
      title: 'League of Legends 5v5',
      game: 'League of Legends',
      type: 'Tournament',
      format: '5v5 Teams',
      host: 'MOBA Kenya',
      date: 'Dec 12',
      fullDate: 'Dec 12, 2025',
      time: '6:00 PM EAT',
      duration: '4 hours',
      attendees: 40,
      maxAttendees: 50,
      location: 'Tech Gaming Hub CBD',
      area: 'CBD',
      image: 'https://images.unsplash.com/photo-1758410473607-e78a23fd6e57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwY29tcGV0aXRpb24lMjBzY3JlZW58ZW58MXx8fHwxNzY1MzU4NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 80,000',
      skillLevel: 'Advanced',
      tags: ['LoL', 'MOBA', 'Team']
    },
    {
      id: 6,
      title: 'Rocket League 3v3 Cup',
      game: 'Rocket League',
      type: 'Tournament',
      format: '3v3 Teams',
      host: 'Rocket League KE',
      date: 'Dec 13',
      fullDate: 'Dec 13, 2025',
      time: '7:00 PM EAT',
      duration: '3 hours',
      attendees: 28,
      maxAttendees: 36,
      location: 'Gaming Lounge Karen',
      area: 'Karen',
      image: 'https://images.unsplash.com/photo-1758524944460-98b67346a1e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0b3VybmFtZW50JTIwcGxheWVyc3xlbnwxfHx8fDE3NjUzNTg3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 40,000',
      skillLevel: 'Intermediate',
      tags: ['Rocket League', 'Sports', 'Team']
    },
    {
      id: 7,
      title: 'Tekken 8 Fighting Tournament',
      game: 'Tekken 8',
      type: 'Tournament',
      format: '1v1 Bracket',
      host: 'Fighting Game Community KE',
      date: 'Dec 16',
      fullDate: 'Dec 16, 2025',
      time: '5:00 PM EAT',
      duration: '4 hours',
      attendees: 32,
      maxAttendees: 32,
      location: 'Arcade Lounge Westlands',
      area: 'Westlands',
      image: 'https://images.unsplash.com/photo-1733945761558-e24d0620e1c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBoZWFkc2V0JTIwc2V0dXB8ZW58MXx8fHwxNzY1MzU4NzUwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 60,000',
      skillLevel: 'All Levels',
      tags: ['Tekken 8', 'Fighting', '1v1']
    },
    {
      id: 8,
      title: 'Apex Legends Squad Finals',
      game: 'Apex Legends',
      type: 'Tournament',
      format: '3v3 BR',
      host: 'Apex Kenya',
      date: 'Dec 17',
      fullDate: 'Dec 17, 2025',
      time: '8:00 PM EAT',
      duration: '4 hours',
      attendees: 54,
      maxAttendees: 60,
      location: 'eSports Hub CBD',
      area: 'CBD',
      image: 'https://images.unsplash.com/photo-1677694690511-2e0646619c91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBjb25zb2xlfGVufDF8fHx8MTc2NTM1ODc1MHww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      prizePool: 'KES 90,000',
      skillLevel: 'Advanced',
      tags: ['Apex', 'Battle Royale', 'Squads']
    }
  ];

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
              {filteredTournaments.length} Tournaments Found
            </h2>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              More Filters
            </Button>
          </div>

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
                        {tournament.type}
                      </Badge>
                    </div>
                    
                    {/* Bottom info overlay */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{tournament.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span className="text-sm">{tournament.attendees}/{tournament.maxAttendees}</span>
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
                      <p className="text-sm text-muted-foreground">Hosted by {tournament.host}</p>
                    </div>

                    {/* Tournament Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{tournament.time} • {tournament.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{tournament.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        <span>{tournament.prizePool}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {tournament.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">
                        {tournament.skillLevel}
                      </Badge>
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
        </div>
      </section>
    </div>
  );
}