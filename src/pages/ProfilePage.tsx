import { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy, User, Mail, Gamepad2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ProfilePageProps {
  user: any;
  accessToken: string;
  onNavigate: (page: string) => void;
}

export function ProfilePage({ user, accessToken, onNavigate }: ProfilePageProps) {
  const [profile, setProfile] = useState<any>(null);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchTournaments();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8711c492/profile`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
      } else {
        console.error('Failed to fetch profile:', data.error);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchTournaments = async () => {
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

      if (response.ok) {
        setTournaments(data.tournaments);
      } else {
        console.error('Failed to fetch tournaments:', data.error);
      }
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-32">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative pt-32 pb-16">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <Card className="bg-card/80 backdrop-blur-xl border-border mb-8">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center glow">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-3xl font-black mb-2">{profile?.name || 'Gamer'}</h1>
                    <div className="flex flex-col gap-2 text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{profile?.email || user.email}</span>
                      </div>
                      {profile?.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile?.favoriteGame && (
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4" />
                          <span>Main Game: {profile.favoriteGame}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-6">
                      <div>
                        <div className="text-2xl font-black gradient-text">{tournaments.length}</div>
                        <div className="text-sm text-muted-foreground">Tournaments Joined</div>
                      </div>
                      <div>
                        <div className="text-2xl font-black gradient-text">
                          {profile?.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Member Since</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Registered Tournaments */}
            <Card className="bg-card/80 backdrop-blur-xl border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-black">
                  MY <span className="gradient-text">TOURNAMENTS</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {tournaments.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground mb-6">
                      You haven't registered for any tournaments yet
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                      onClick={() => onNavigate('tournaments')}
                    >
                      Browse Tournaments
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tournaments.map((tournament, index) => (
                      <Card key={index} className="border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-black">{tournament.tournamentTitle}</h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>
                                    Registered on {new Date(tournament.registeredAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-primary/20 text-primary border-0">Registered</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
