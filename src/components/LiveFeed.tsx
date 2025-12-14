import { Heart, MessageCircle, Share2, Calendar, Users, Gamepad2, MoreHorizontal, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LiveFeed() {
  const feedItems = [
    {
      id: 1,
      type: 'tournament_found',
      user: { name: 'Brian Kimani', handle: '@brian_fps', avatar: 'BK' },
      content: {
        title: 'Just signed up for FIFA tournament in Westlands',
        description: 'Found this awesome FIFA 24 1v1 bracket tournament. Prize pool KES 50K! Ready to compete 🎮',
        eventTitle: 'FIFA 24 Weekend Cup',
        eventTime: 'Saturday 2:00 PM EAT',
        attendees: 32,
        image: 'https://images.unsplash.com/photo-1758410473607-e78a23fd6e57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwY29tcGV0aXRpb24lMjBzY3JlZW58ZW58MXx8fHwxNzY1MzU4NzQ5fDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      stats: { likes: 67, comments: 19, shares: 12 },
      timeAgo: '2h'
    },
    {
      id: 2,
      type: 'tournament_joined',
      user: { name: 'Faith Wambui', handle: '@faith_valorant', avatar: 'FW' },
      content: {
        title: 'Just registered for Valorant League Finals',
        description: 'So hyped! Finally made it to the finals with my squad. Time to show what we\'re made of! 🔥',
        eventTitle: 'Valorant League Finals',
        eventTime: 'Friday 8:00 PM EAT',
        attendees: 80,
        image: 'https://images.unsplash.com/photo-1758524944460-98b67346a1e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0b3VybmFtZW50JTIwcGxheWVyc3xlbnwxfHx8fDE3NjUzNTg3NDl8MA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      stats: { likes: 124, comments: 34, shares: 18 },
      timeAgo: '4h'
    },
    {
      id: 3,
      type: 'tournament_live',
      user: { name: 'Kevin Omondi', handle: '@kev_cod_ke', avatar: 'KO' },
      content: {
        title: 'Watching COD Warzone tournament live at Karen Arena!',
        description: 'Epic squad battles going down right now. The competition is insane! ⚡',
        eventTitle: 'COD Warzone Championship',
        eventTime: 'Live Now',
        attendees: 48,
        image: 'https://images.unsplash.com/photo-1733945761558-e24d0620e1c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBoZWFkc2V0JTIwc2V0dXB8ZW58MXx8fHwxNzY1MzU4NzUwfDA&ixlib=rb-4.1.0&q=80&w=1080'
      },
      stats: { likes: 156, comments: 42, shares: 29 },
      timeAgo: 'Live',
      isLive: true
    },
    {
      id: 4,
      type: 'tournament_recap',
      user: { name: 'James Mwangi', handle: '@james_csgo', avatar: 'JM' },
      content: {
        title: 'What a final at Cyber Arena Kileleshwa!',
        description: 'Participated in the CS:GO finals tonight. Intense matches! Congrats to all teams who competed! 🏆',
        eventTitle: 'CS:GO Championship Finals',
        eventTime: 'Last night',
        attendees: 96,
        image: 'https://images.unsplash.com/photo-1677694690511-2e0646619c91?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWRlbyUyMGdhbWUlMjBjb25zb2xlfGVufDF8fHx8MTc2NTM1ODc1MHww&ixlib=rb-4.1.0&q=80&w=1080'
      },
      stats: { likes: 243, comments: 67, shares: 41 },
      timeAgo: '1d'
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-black mb-2">
              NAIROBI <span className="gradient-text">GAMING FEED</span>
            </h2>
            <p className="text-muted-foreground">See what's happening in Nairobi's esports community</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              Live from 254
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {feedItems.map((item, index) => (
            <Card 
              key={item.id} 
              className={`overflow-hidden hover:shadow-2xl transition-all duration-500 ${
                item.isLive ? 'ring-2 ring-primary/20 glow' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="ring-2 ring-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold">
                        {item.user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold">{item.user.name}</h4>
                        {item.isLive && (
                          <Badge variant="destructive" className="text-xs px-2 py-0">
                            LIVE
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{item.user.handle} • {item.timeAgo}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <div className="px-4 pb-4">
                  <h5 className="font-bold mb-2">{item.content.title}</h5>
                  <p className="text-muted-foreground mb-4">{item.content.description}</p>
                </div>

                {/* Event Card */}
                <div className="mx-4 mb-4 bg-muted/50 rounded-lg overflow-hidden">
                  <div className="relative h-32">
                    <ImageWithFallback
                      src={item.content.image}
                      alt={item.content.eventTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <h6 className="font-bold text-white text-sm">{item.content.eventTitle}</h6>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{item.content.eventTime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{item.content.attendees} {item.isLive ? 'playing' : 'registered'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 flex items-center justify-between border-t border-border">
                  <div className="flex items-center gap-6">
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-red-500">
                      <Heart className="w-4 h-4" />
                      {item.stats.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                      <MessageCircle className="w-4 h-4" />
                      {item.stats.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-accent">
                      <Share2 className="w-4 h-4" />
                      {item.stats.shares}
                    </Button>
                  </div>
                  
                  {item.isLive && (
                    <Button size="sm" className="bg-primary text-primary-foreground">
                      Join Live
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="gradient-border">
            Load More Gaming Updates
          </Button>
        </div>
      </div>
    </section>
  );
}