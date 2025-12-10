import { MessageCircle, Heart, Share2, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';

export function CommunityDiscussion() {
  const discussions = [
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "SJ",
      topic: "Music Production",
      title: "Best DAW for beginners in 2025?",
      excerpt: "I'm just starting with music production and looking for recommendations on digital audio workstations. What would you suggest for someone completely new to...",
      replies: 23,
      likes: 45,
      timeAgo: "2 hours ago"
    },
    {
      id: 2,
      author: "Mike Rodriguez",
      avatar: "MR",
      topic: "Live Performance",
      title: "Tips for overcoming stage fright",
      excerpt: "I have my first live performance coming up next month and I'm getting really nervous. Any experienced performers have advice for dealing with stage anxiety?",
      replies: 18,
      likes: 67,
      timeAgo: "5 hours ago"
    },
    {
      id: 3,
      author: "Emma Wilson",
      avatar: "EW",
      topic: "Collaboration",
      title: "Looking for a vocalist for indie rock project",
      excerpt: "I'm a guitarist/songwriter looking for a vocalist to collaborate on some indie rock tracks. Based in NYC but open to remote collaboration...",
      replies: 12,
      likes: 29,
      timeAgo: "1 day ago"
    },
    {
      id: 4,
      author: "David Kim",
      avatar: "DK",
      topic: "Gear Review",
      title: "Audio-Technica ATH-M50x vs Sony MDR-7506",
      excerpt: "I'm looking to upgrade my studio headphones and these two models keep coming up. Has anyone used both and can share their thoughts on the comparison?",
      replies: 31,
      likes: 58,
      timeAgo: "2 days ago"
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl mb-4">Community Discussions</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join the conversation and connect with fellow music enthusiasts
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {discussions.map((discussion) => (
            <Card key={discussion.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarFallback>{discussion.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{discussion.author}</span>
                      <Badge variant="outline" className="text-xs">
                        {discussion.topic}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {discussion.timeAgo}
                      </div>
                    </div>
                    <h3 className="text-lg leading-tight">{discussion.title}</h3>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {discussion.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {discussion.replies} replies
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Heart className="w-4 h-4 mr-1" />
                      {discussion.likes}
                    </Button>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button size="lg">
            View All Discussions
          </Button>
        </div>
      </div>
    </section>
  );
}