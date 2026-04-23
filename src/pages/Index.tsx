
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { SportsSpotlight } from "@/components/landing/SportsSpotlight";
import { LatestActivities } from "@/components/landing/LatestActivities";
import { RegionsGrid } from "@/components/landing/RegionsGrid";
import { MonthlyCalendar } from "@/components/landing/MonthlyCalendar";
import { CtaBand } from "@/components/landing/CtaBand";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO
        title="Réservez vos activités sportives"
        description="Trouvez et réservez les meilleures activités sportives et événements près de chez vous avec Panache."
      />
      <Navbar />

      <Hero stats={{ totalEvents: 0, totalTickets: 0, satisfaction: 0 }} loading={false} />

      <main>
        {/* Section 1 — Sports à la une */}
        <SportsSpotlight />

        {/* Section 2 — Derniers événements */}
        <LatestActivities />

        {/* Section 3 — Régions */}
        <RegionsGrid />

        {/* Section 4 — Calendrier mensuel */}
        <MonthlyCalendar />

        {/* Section 5 — CTA organisateur */}
        <CtaBand />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
