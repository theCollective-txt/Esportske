import { Play, Users, Music, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function Hero() {
  return (
    <section className="bg-gradient-to-r from-red-900 to-red-700 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl mb-6 tracking-tight">
            Welcome to Hit Shuffle
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Where music lovers connect, discover, and create together
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-red-900 hover:bg-gray-100">
              <Play className="w-5 h-5 mr-2" />
              Discover Music
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-red-900">
              <Users className="w-5 h-5 mr-2" />
              Join Community
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-xl mb-2">15K+ Members</h3>
                <p className="text-sm opacity-80">Active music enthusiasts</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Music className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-xl mb-2">50K+ Tracks</h3>
                <p className="text-sm opacity-80">Curated music library</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 text-white">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-3" />
                <h3 className="text-xl mb-2">Weekly Events</h3>
                <p className="text-sm opacity-80">Live sessions &amp; concerts</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}