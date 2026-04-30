import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/landing/Hero";
import { SportsSpotlight } from "@/components/landing/SportsSpotlight";
import { LatestActivities } from "@/components/landing/LatestActivities";
import { RegionsGrid } from "@/components/landing/RegionsGrid";
import { MonthlyCalendar } from "@/components/landing/MonthlyCalendar";
import { CtaBand } from "@/components/landing/CtaBand";
import { SEO } from "@/components/SEO";

const StatsBar = () => (
  <div className="bg-white border-b border-[#E8E8E8]">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#E8E8E8]">
        {[
          { num: "1 000+", label: "événements" },
          { num: "40+",    label: "clubs actifs" },
          { num: "0€",     label: "pour publier" },
          { num: "2%",     label: "de commission" },
        ].map(({ num, label }) => (
          <div key={label} className="py-4 px-6 text-center">
            <p className="font-poppins font-extrabold text-xl text-[#F97316] leading-none tracking-[-0.02em]">
              {num}
            </p>
            <p className="text-xs text-[#5A5A5A] font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans">
      <SEO
        title="Les événements sportifs près de chez vous"
        description="Découvrez et réservez vos billets pour tous les événements sportifs en France. 1000+ événements, 40+ clubs, billetterie sécurisée."
      />
      <Navbar />
      <Hero stats={{ totalEvents: 0, totalTickets: 0, satisfaction: 0 }} loading={false} />
      <StatsBar />
      <main>
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
