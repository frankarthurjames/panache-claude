import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { FeaturedEvents } from "@/components/landing/FeaturedEvents";
import { LatestActivities } from "@/components/landing/LatestActivities";
import { SportsSpotlight } from "@/components/landing/SportsSpotlight";
import { RegionsGrid } from "@/components/landing/RegionsGrid";
import { MonthlyCalendar } from "@/components/landing/MonthlyCalendar";
import { CtaBand } from "@/components/landing/CtaBand";
import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO
        title="Les événements sportifs près de chez vous"
        description="Découvrez et réservez vos billets pour tous les événements sportifs en France. 1000+ événements, 40+ clubs, billetterie sécurisée."
      />
      <Navbar />
      <Hero stats={{ totalEvents: 0, totalTickets: 0, satisfaction: 0 }} loading={false} />
      <main>
        <FeaturedEvents />
        <LatestActivities />
        <SportsSpotlight />
        <RegionsGrid />
        <MonthlyCalendar />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
