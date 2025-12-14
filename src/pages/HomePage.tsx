import { DynamicHero } from '../components/DynamicHero';
import { LiveFeed } from '../components/LiveFeed';
import { FeaturedEvents } from '../components/FeaturedEvents';
import { PartnersSection } from '../components/PartnersSection';

interface HomePageProps {
  onNavigate: (page: string) => void;
  user?: any;
  accessToken?: string;
  onOpenAuthModal?: () => void;
  onRefreshProfile?: () => void;
}

export function HomePage({ onNavigate, user, accessToken, onOpenAuthModal, onRefreshProfile }: HomePageProps) {
  return (
    <main className="relative">
      <DynamicHero onNavigate={onNavigate} />
      <PartnersSection />
      <FeaturedEvents 
        onNavigate={onNavigate}
        user={user}
        accessToken={accessToken}
        onOpenAuthModal={onOpenAuthModal}
        onRefreshProfile={onRefreshProfile}
      />
      <LiveFeed />
      
      {/* Call to action section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-secondary/5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black mb-6">
            READY TO <span className="gradient-text">COMPETE</span> IN NAIROBI?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Nairobi's hottest gaming community. From Westlands to Karen, from CBD to Kileleshwa - 
            find tournaments, connect with fellow gamers, and level up your competitive gaming.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://discord.gg/pyv8XukVu2" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-white px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform glow inline-block"
            >
              Join ESPORTS-KE
            </a>
            <button 
              onClick={() => onNavigate('tournaments')}
              className="border-2 border-primary text-primary px-12 py-4 rounded-full font-bold text-lg hover:bg-primary hover:text-white transition-colors"
            >
              Find Tournaments
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}