import movieJabberLogo from 'figma:asset/4edfee926cd1e5737fa591a63a7a7b859cb8668e.png';
import toonLogo from 'figma:asset/3902081750dcd1b91201a5d3a5c5ff38fa459304.png';

export function PartnersSection() {
  const partners = [
    { name: 'Movie Jabber', logo: movieJabberLogo },
    { name: 'YOUNG TOON', logo: toonLogo },
  ];

  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-2">
            <span className="gradient-text">SUPPORTED BY</span>
          </h2>
          <p className="text-muted-foreground">
            Partnering with industry leaders to bring you the best gaming experience
          </p>
        </div>

        {/* Partners Grid */}
        <div className="flex justify-center items-center gap-12 flex-wrap">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group relative w-48 h-32 bg-muted/30 rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 flex items-center justify-center p-6"
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="w-full h-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3">
                <p className="text-white font-black text-sm">{partner.name}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Optional: Partner with us CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Want to support Nairobi's gaming community?
          </p>
          <button className="text-primary hover:text-primary/80 font-black text-sm underline underline-offset-4">
            Become a Partner →
          </button>
        </div>
      </div>
    </section>
  );
}