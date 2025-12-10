import { Play, Users, Heart, ExternalLink, Verified } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function ArtistSpotlight() {
  const featuredArtists = [
    {
      id: 1,
      name: 'NEON LUNA',
      handle: '@neon_luna',
      genre: 'Synthwave',
      verified: true,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop',
      followers: '23.5K',
      monthlyListeners: '156K',
      latestTrack: 'Midnight Drive',
      trackPlays: '89.2K',
      isLive: true,
      gradient: 'from-red-600 to-red-800'
    },
    {
      id: 2,
      name: 'BASS WIZARD',
      handle: '@bass_wizard',
      genre: 'Dubstep',
      verified: true,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop',
      followers: '45.8K',
      monthlyListeners: '234K',
      latestTrack: 'Drop the Beat',
      trackPlays: '167K',
      isLive: false,
      gradient: 'from-red-500 to-red-700'
    },
    {
      id: 3,
      name: 'SOUL SISTER',
      handle: '@soul_sister',
      genre: 'Neo-Soul',
      verified: false,
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop',
      followers: '12.3K',
      monthlyListeners: '78K',
      latestTrack: 'Golden Hour',
      trackPlays: '45.6K',
      isLive: false,
      gradient: 'from-red-400 to-red-600'
    },
    {
      id: 4,
      name: 'CYBER PUNK',
      handle: '@cyber_punk',
      genre: 'Industrial',
      verified: true,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=500&fit=crop',
      followers: '67.2K',
      monthlyListeners: '298K',
      latestTrack: 'Digital Rebellion',
      trackPlays: '203K',
      isLive: true,
      gradient: 'from-red-700 to-red-900'
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black mb-4">
            ARTIST <span className="gradient-text">SPOTLIGHT</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Rising stars and established legends making waves in our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredArtists.map((artist, index) => (
            <Card 
              key={artist.id}
              className="group relative overflow-hidden border-0 bg-gradient-to-b from-card to-card/50 hover:scale-105 transition-all duration-500"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Artist Image */}
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${artist.gradient} opacity-60`}></div>
                  
                  {/* Live indicator */}
                  {artist.isLive && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1 glow">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="text-xs text-white font-medium">LIVE</span>
                    </div>
                  )}
                  
                  {/* Genre badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      {artist.genre}
                    </Badge>
                  </div>
                  
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 h-16 w-16">
                      <Play className="w-8 h-8 text-white" />
                    </Button>
                  </div>
                </div>

                {/* Artist Info */}
                <div className="p-6 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-lg">{artist.name}</h3>
                      {artist.verified && <Verified className="w-4 h-4 text-primary" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{artist.handle}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold gradient-text">{artist.followers}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold gradient-text">{artist.monthlyListeners}</div>
                      <div className="text-xs text-muted-foreground">Monthly</div>
                    </div>
                  </div>

                  {/* Latest Track */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Latest Track</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <h5 className="font-bold text-sm mb-1">{artist.latestTrack}</h5>
                    <p className="text-xs text-muted-foreground">{artist.trackPlays} plays</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      <Heart className="w-4 h-4 mr-1" />
                      Follow
                    </Button>
                    <Button size="sm" variant="outline" className="px-3">
                      <Users className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" className="gradient-border px-8">
            Discover More Artists
          </Button>
        </div>
      </div>
    </section>
  );
}