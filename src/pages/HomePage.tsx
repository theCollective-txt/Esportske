import { DynamicHero } from '../components/DynamicHero';
import { LiveFeed } from '../components/LiveFeed';
import { FeaturedEvents } from '../components/FeaturedEvents';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  return (
    <main className="relative">
      <DynamicHero onNavigate={onNavigate} />
      <FeaturedEvents onNavigate={onNavigate} />
      <LiveFeed />
      
      {/* Call to action section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black mb-6">
            READY TO <span className="gradient-text">COMPETE</span> IN NAIROBI?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Nairobi's hottest gaming community. From Westlands to Karen, from CBD to Kileleshwa - 
            find tournaments, connect with fellow gamers, and level up your competitive gaming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-primary via-secondary to-accent text-white px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform glow">
              Join ESPORTS-KE
            </button>
            <button 
              onClick={() => onNavigate('tournaments')}
              className="border-2 border-primary text-primary px-12 py-4 rounded-full font-bold text-lg hover:bg-primary hover:text-white transition-colors"
            >
              Find Tournaments
            </button>
          </div>
          
          {/* Quick stats */}
          <div className="flex items-center justify-center gap-12 mt-12 text-center">
            <div>
              <div className="text-3xl font-black gradient-text">63</div>
              <div className="text-sm text-muted-foreground">Tournaments This Month</div>
            </div>
            <div>
              <div className="text-3xl font-black gradient-text">2.4K</div>
              <div className="text-sm text-muted-foreground">Nairobi Gamers</div>
            </div>
            <div>
              <div className="text-3xl font-black gradient-text">18</div>
              <div className="text-sm text-muted-foreground">Gaming Venues</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
