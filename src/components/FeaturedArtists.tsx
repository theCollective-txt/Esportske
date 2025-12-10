import { Play, Heart, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function FeaturedArtists() {
  const artists = [
    {
      id: 1,
      name: "Alex Rivera",
      genre: "Indie Rock",
      followers: "2.3K",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      latest: "Midnight Dreams",
      plays: "45K"
    },
    {
      id: 2,
      name: "Luna Thompson",
      genre: "Electronic",
      followers: "1.8K",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      latest: "Neon Nights",
      plays: "32K"
    },
    {
      id: 3,
      name: "Marcus Chen",
      genre: "Hip Hop",
      followers: "3.1K",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      latest: "City Lights",
      plays: "67K"
    },
    {
      id: 4,
      name: "Sofia Martinez",
      genre: "Pop",
      followers: "2.7K",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
      latest: "Summer Vibes",
      plays: "89K"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">Featured Artists</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover amazing talents from our community and connect with fellow music creators
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <ImageWithFallback
                  src={artist.image}
                  alt={artist.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">{artist.genre}</Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <h3 className="text-lg mb-1">{artist.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{artist.followers} followers</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm">Latest: {artist.latest}</p>
                    <p className="text-xs text-muted-foreground">{artist.plays} plays</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-1" />
                    Follow
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Artists
          </Button>
        </div>
      </div>
    </section>
  );
}