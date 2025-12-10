import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function UpcomingEvents() {
  const events = [
    {
      id: 1,
      title: "Live Jam Session",
      date: "July 20, 2025",
      time: "7:00 PM",
      location: "Virtual",
      attendees: 156,
      type: "Live Stream",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Beat Making Workshop",
      date: "July 22, 2025",
      time: "3:00 PM",
      location: "Online",
      attendees: 89,
      type: "Workshop",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Community Showcase",
      date: "July 25, 2025",
      time: "8:00 PM",
      location: "Main Stage",
      attendees: 234,
      type: "Performance",
      image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=300&fit=crop"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join our vibrant community events and connect with fellow music enthusiasts
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                <div className="text-white text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm opacity-90">{event.date}</p>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">{event.type}</Badge>
                </div>
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees} attending</span>
                </div>
                
                <Button className="w-full mt-4">
                  Join Event
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            View All Events
          </Button>
        </div>
      </div>
    </section>
  );
}