import { Calendar, Users, MapPin, Clock, Gamepad2, Trophy, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FeaturedEventsProps {
  onNavigate: (page: string) => void;
}

export function FeaturedEvents({ onNavigate }: FeaturedEventsProps) {
  const featuredEvents = [
    {
      id: 1,
      title: 'FIFA 24 Championship',
      type: 'Tournament',
      host: 'Nairobi FC Gaming',
      date: 'Tonight',
      time: '8:00 PM EAT',
      duration: '4 hours',
      attendees: 48,
      maxAttendees: 64,
      location: 'Westlands Gaming Hub',
      image: 'https://images.unsplash.com/photo-1759701546851-1d903ac1a2e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudHxlbnwxfHx8fDE3NjUyNjQ3MjN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      tags: ['FIFA 24', 'Sports', '1v1']
    },
    {
      id: 2,
      title: 'Valorant 5v5 League',
      type: 'Competitive Match',
      host: 'Kenya Esports League',
      date: 'Tomorrow',
      time: '7:30 PM EAT',
      duration: '3 hours',
      attendees: 56,
      maxAttendees: 80,
      location: 'eSports Arena Karen',
      image: 'https://images.unsplash.com/photo-1763258986479-0962883e1747?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21wZXRpdGl2ZSUyMGdhbWluZyUyMHNldHVwfGVufDF8fHx8MTc2NTI2OTg3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      tags: ['Valorant', 'FPS', 'Team']
    },
    {
      id: 3,
      title: 'COD: Warzone Battle Royale',
      type: 'Tournament',
      host: 'Call of Duty Kenya',
      date: 'Saturday',
      time: '9:00 PM EAT',
      duration: '5 hours',
      attendees: 92,
      maxAttendees: 100,
      location: 'Cyber Arena Kileleshwa',
      image: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBjb250cm9sbGVyfGVufDF8fHx8MTc2NTM1NTc1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      tags: ['COD', 'Battle Royale', 'Squads']
    },
    {
      id: 4,
      title: 'CS:GO Scrims & Practice',
      type: 'Practice Session',
      host: 'Counter-Strike Nairobi',
      date: 'Sunday',
      time: '4:00 PM EAT',
      duration: '3 hours',
      attendees: 34,
      maxAttendees: 50,
      location: 'Game Lounge Westlands',
      image: 'https://images.unsplash.com/photo-1632603093711-0d93a0bcc6cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjByb29tJTIwbGlnaHRzfGVufDF8fHx8MTc2NTM1ODcxMnww&ixlib=rb-4.1.0&q=80&w=1080',
      isLive: false,
      tags: ['CS:GO', 'FPS', 'Practice']
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">
            NAIROBI <span className="gradient-text">TOURNAMENTS</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover competitive gaming events happening across Nairobi's top gaming venues
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEvents.map((event, index) => (
            <Card 
              key={event.id}
              className="group relative overflow-hidden hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Live indicator */}
                  {event.isLive && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 glow">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs text-white font-medium">LIVE NOW</span>
                    </div>
                  )}
                  
                  {/* Event type badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      {event.type}
                    </Badge>
                  </div>
                  
                  {/* Bottom info overlay */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{event.attendees}/{event.maxAttendees}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-16 w-16">
                      {event.isLive ? <Trophy className="w-8 h-8 text-white" /> : <Play className="w-8 h-8 text-white" />}
                    </Button>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-black text-lg mb-1">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">Hosted by {event.host}</p>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{event.time} • {event.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Action Button */}
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    {event.isLive ? 'Watch Now' : 'Register'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            className="gradient-border px-8"
            onClick={() => onNavigate('tournaments')}
          >
            View All Tournaments
          </Button>
        </div>
      </div>
    </section>
  );
}