
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/data/regions";

interface HeroProps {
  stats: { totalEvents: number; totalTickets: number; satisfaction: number };
  loading: boolean;
}

const QUICK_SPORTS = ['Triathlon', 'Trail', 'Football', 'Cyclisme', 'Natation'];

export const Hero = ({ stats, loading }: HeroProps) => {
  const navigate = useNavigate();
  const [sport, setSport] = useState("");
  const [location, setLocation] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sports, setSports] = useState<{ name: string; slug: string }[]>([]);

  useEffect(() => {
    supabase
      .from('sports' as any)
      .select('name, slug')
      .order('name')
      .then(({ data }) => { if (data) setSports(data as any); });
  }, []);

  const goSearch = () => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (location) params.append('region', location);
    if (dateFilter === 'Ce week-end') {
      const now = new Date();
      const day = now.getDay();
      const daysToFriday = day <= 5 ? 5 - day : 6;
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysToFriday);
      params.append('date_start', friday.toISOString().slice(0, 10));
    } else if (dateFilter === 'Ce mois') {
      params.append('month', new Date().toISOString().slice(0, 7));
    } else if (dateFilter) {
      params.append('date', dateFilter);
    }
    navigate(params.toString() ? `/events?${params}` : '/events');
  };

  return (
    <header className="relative h-[620px] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80"
          alt="Sport background"
          className="h-full w-full object-cover brightness-50"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mt-16">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-10">
          Votre prochain événement<br />sportif commence ici
        </h1>

        {/* Search bar */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl md:rounded-full p-2 shadow-2xl overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0">

            {/* Région */}
            <div className="flex-1 w-full px-3">
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-12 border-0 w-full text-lg text-gray-400 bg-transparent focus:outline-none focus:text-gray-700 md:border-r border-gray-100"
              >
                <option value="">Région ou ville</option>
                {REGIONS.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Sport */}
            <div className="flex-1 w-full px-3">
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value)}
                className="h-12 border-0 w-full text-lg text-gray-400 bg-transparent focus:outline-none focus:text-gray-700 md:border-r border-gray-100"
              >
                <option value="">Sport</option>
                {sports.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="flex-1 w-full">
              <div className="flex gap-2 items-center h-12 px-3 flex-wrap">
                {['Ce week-end', 'Ce mois'].map(label => (
                  <button
                    key={label}
                    onClick={() => setDateFilter(dateFilter === label ? "" : label)}
                    className={`text-sm px-3 py-1 rounded-full border whitespace-nowrap transition-colors ${
                      dateFilter === label
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'border-gray-200 text-gray-500 hover:border-orange-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                <input
                  type="date"
                  className="text-sm text-gray-500 border-0 focus:outline-none bg-transparent"
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={goSearch}
              className="w-full md:w-14 h-12 md:h-14 md:rounded-full p-0 flex items-center justify-center hover:scale-105 transition-transform shadow-md shrink-0"
              style={{ background: "#F97316" }}
            >
              <Search className="h-6 w-6 text-white" />
            </Button>
          </div>
        </div>

        {/* Quick sport pills */}
        <div className="flex gap-2 mt-5 flex-wrap justify-center">
          {QUICK_SPORTS.map(s => (
            <button
              key={s}
              onClick={() => navigate(`/events?sport=${s.toLowerCase()}`)}
              className="bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-1.5 rounded-full backdrop-blur-sm transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
