
import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Loader2, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Sport {
  id: string;
  name: string;
  slug: string;
}

const normalize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSportParam = searchParams.get('sport') || "Tous";
  const initialQuery = searchParams.get('q') || "";
  const regionFilter = searchParams.get('region');
  const monthFilter = searchParams.get('month');

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedSportSlug, setSelectedSportSlug] = useState(initialSportParam);
  const [dbSports, setDbSports] = useState<Sport[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("Date");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Only fetch sports that have at least one published upcoming event
        const { data: eventsForSports } = await supabase
          .from('events')
          .select('sport_id, sports:sport_id(id, name, slug)')
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString());

        const sportsWithEvents = Array.from(
          new Map(
            (eventsForSports || [])
              .filter(e => e.sports)
              .map(e => [(e.sports as any).id, e.sports])
          ).values()
        ).sort((a: any, b: any) => a.name.localeCompare(b.name)) as Sport[];

        setDbSports(sportsWithEvents);

        const { data: eventsData, error } = await supabase
          .from('events')
          .select(`*, sports:sport_id(name, slug), ticket_types(price_cents)`)
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true });

        if (error) throw error;

        const completeEvents = (eventsData || []).filter(e =>
          e.description &&
          e.description.trim().length >= 50 &&
          e.sport_id &&
          e.city
        );

        const formatted = completeEvents.map(event => {
          const minPrice = event.ticket_types?.length > 0
            ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
            : 0;

          let tag = (event.sports as any)?.name;
          const tagSlug = (event.sports as any)?.slug || "sport";
          let tagColor = "bg-orange-500";

          if (!tag) {
            const m = event.title.match(/^\[(.*?)\]/);
            tag = m ? m[1] : "Sport";
            const tl = event.title.toLowerCase();
            if (tl.includes("natation") || tl.includes("aquatique")) tagColor = "bg-blue-500";
            else if (tl.includes("vtt") || tl.includes("cyclisme")) tagColor = "bg-green-600";
            else if (tl.includes("football")) tagColor = "bg-emerald-600";
            else if (tl.includes("kayak")) tagColor = "bg-sky-500";
          } else {
            if (tagSlug === "vtt" || tagSlug === "cyclisme") tagColor = "bg-green-600";
            else if (tagSlug === "natation") tagColor = "bg-blue-500";
            else if (tagSlug === "football") tagColor = "bg-emerald-600";
            else if (tagSlug === "athletisme") tagColor = "bg-red-500";
          }

          const hasMultiple = event.ticket_types &&
            new Set(event.ticket_types.map((t: any) => t.price_cents)).size > 1;
          const minPriceStr = minPrice > 0 ? `${(minPrice / 100).toFixed(0)}€` : 'Gratuit';
          const priceDisplay = hasMultiple ? `Dès ${minPriceStr}` : minPriceStr;

          return {
            id: event.id,
            title: event.title,
            date: new Date(event.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
            location: event.city || 'Lieu à confirmer',
            image: event.images?.[0] || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            tag,
            tagColor,
            tagSlug,
            price: priceDisplay,
            price_cents: minPrice,
            starts_at: event.starts_at,
            region: event.region || null,
          };
        }) || [];

        setAllEvents(formatted);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const displayedEvents = useMemo(() => {
    let filtered = [...allEvents];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.tag.toLowerCase().includes(q)
      );
    }

    if (selectedSportSlug !== "Tous") {
      const target = normalize(selectedSportSlug);
      filtered = filtered.filter(e =>
        normalize(e.tagSlug) === target || normalize(e.tag) === target
      );
    }

    if (regionFilter) filtered = filtered.filter(e => e.region === regionFilter);

    if (monthFilter) {
      const [y, m] = monthFilter.split("-").map(Number);
      filtered = filtered.filter(e => {
        const d = new Date(e.starts_at);
        return d.getFullYear() === y && d.getMonth() + 1 === m;
      });
    }

    filtered.sort((a, b) => {
      if (sortBy === "Prix") return a.price_cents - b.price_cents;
      if (sortBy === "Nom") return a.title.localeCompare(b.title);
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    });

    return filtered;
  }, [searchQuery, selectedSportSlug, sortBy, allEvents, regionFilter, monthFilter]);

  const handleSportSelect = (slug: string) => {
    setSelectedSportSlug(slug);
    const p = new URLSearchParams(searchParams);
    if (slug === "Tous") { p.delete('sport'); } else { p.set('sport', slug); }
    setSearchParams(p);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const p = new URLSearchParams(searchParams);
    if (val) { p.set('q', val); } else { p.delete('q'); }
    setSearchParams(p);
  };

  const clearFilter = (key: string) => {
    const p = new URLSearchParams(searchParams);
    p.delete(key);
    setSearchParams(p);
  };

  // Dynamic hero title
  const heroTitle = regionFilter
    ? `Événements en ${regionFilter}`
    : selectedSportSlug !== 'Tous'
    ? `Événements · ${dbSports.find(s => s.slug === selectedSportSlug)?.name || selectedSportSlug}`
    : monthFilter
    ? `Événements · ${new Date(`${monthFilter}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    : 'Tous les événements';

  // Active filter badge (region or month)
  const activeFilterLabel = regionFilter
    ? `Région : ${regionFilter}`
    : monthFilter
    ? `Mois : ${new Date(`${monthFilter}-01`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    : null;
  const activeFilterKey = regionFilter ? 'region' : monthFilter ? 'month' : null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO
        title={heroTitle}
        description="Parcourez et réservez parmi une large sélection d'événements sportifs et activités."
      />
      <Navbar variant="orange" />

      {/* Hero */}
      <div className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div
          className="absolute bottom-0 left-0 w-full h-24 bg-white z-10"
          style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
        />

        <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-10 tracking-tight">{heroTitle}</h1>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:max-w-xl text-black">
              <Input
                placeholder="Rechercher un événement, un lieu..."
                className="h-14 rounded-full pl-6 pr-14 border-0 bg-white/95 focus:bg-white transition-colors shadow-lg text-lg"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Button
                className="absolute right-2 top-2 h-10 w-10 rounded-full p-0 flex items-center justify-center hover:scale-105 transition-transform shadow-md"
                style={{ background: "#F97316" }}
              >
                <Search className="h-5 w-5 text-white" />
              </Button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-medium text-white/80 whitespace-nowrap">Trier par</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white h-10 px-6 gap-2 min-w-[160px] justify-between font-medium backdrop-blur-sm">
                    {sortBy}
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem onClick={() => setSortBy("Date")}>Date</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Prix")}>Prix</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("Nom")}>Nom</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Ligne 1 — Pills sport (fond blanc) */}
      <div className="border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar pt-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <button
            onClick={() => handleSportSelect('Tous')}
            className={`rounded-full px-5 h-9 text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              selectedSportSlug === 'Tous'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          {dbSports.map(sport => (
            <button
              key={sport.id}
              onClick={() => handleSportSelect(sport.slug)}
              className={`rounded-full px-5 h-9 text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                selectedSportSlug === sport.slug
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {sport.name}
            </button>
          ))}
        </div>

        {/* Ligne 2 — Compteur + filtre actif */}
        {(activeFilterLabel || !loading) && (
          <div className="flex items-center justify-between pb-3 pt-1 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <span className="text-sm text-gray-500">
              {loading ? '' : `${displayedEvents.length} événement${displayedEvents.length !== 1 ? 's' : ''}`}
            </span>
            {activeFilterLabel && activeFilterKey && (
              <button
                onClick={() => clearFilter(activeFilterKey)}
                className="flex items-center gap-1.5 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-3 py-1 hover:bg-orange-100 transition-colors"
              >
                {activeFilterLabel}
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Grid */}
      <main className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto pt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            Aucun événement trouvé.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedEvents.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                date={event.date}
                location={event.location}
                image={event.image}
                tag={event.tag}
                tagColor={event.tagColor}
                price={event.price}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Events;
