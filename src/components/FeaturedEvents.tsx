import { useState, useEffect } from 'react';
import { Calendar, Users, MapPin, Clock, Gamepad2, Trophy, Play } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { TournamentDetailsModal } from './TournamentDetailsModal';

interface FeaturedEventsProps {
  onNavigate: (page: string) => void;
  user?: any;
  accessToken?: string;
  onOpenAuthModal?: () => void;
  onRefreshProfile?: () => void;
}

export function FeaturedEvents({ onNavigate, user, accessToken, onOpenAuthModal, onRefreshProfile }: FeaturedEventsProps) {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<any>(null);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    setLoading(true);
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
        setFeaturedEvents([]);
        return;
      }
      
      // Filter only tournaments (not scrims) and show only the first 4
      const tournamentsOnly = data.tournaments.filter((t: any) => t.type !== 'scrim');
      setFeaturedEvents(tournamentsOnly.slice(0, 4));
    } catch (err: any) {
      console.error('Error fetching featured events:', err);
      setFeaturedEvents([]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground">Loading tournaments...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && featuredEvents.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-black mb-2">No Tournaments Yet</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for upcoming tournaments!
            </p>
          </div>
        )}

        {/* Featured Events Grid */}
        {!loading && featuredEvents.length > 0 && (
          <>
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
                          {event.type || 'Tournament'}
                        </Badge>
                      </div>
                      
                      {/* Bottom info overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">{event.date || 'TBA'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{event.attendees || 0}/{event.maxAttendees || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Play button overlay - removed */}
                    </div>

                    {/* Event Info */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-black text-lg mb-1">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">Hosted by {event.host || 'ESPORTS-KE'}</p>
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{event.time || 'TBA'} • {event.duration || 'TBA'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location || 'Location TBA'}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {(event.tags || []).map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        onClick={() => setSelectedTournament(event)}
                      >
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
          </>
        )}
      </div>
      
      {/* Tournament Details Modal */}
      {selectedTournament && (
        <TournamentDetailsModal
          tournament={selectedTournament}
          onClose={() => setSelectedTournament(null)}
          user={user}
          accessToken={accessToken}
          onOpenAuthModal={onOpenAuthModal}
          onRegistrationSuccess={onRefreshProfile}
        />
      )}
    </section>
  );
}