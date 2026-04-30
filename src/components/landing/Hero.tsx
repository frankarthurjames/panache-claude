
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

const PLACEHOLDERS = [
  'Triathlon à Lyon...',
  'Trail en Bretagne...',
  'Football ce week-end...',
  'Natation en Île-de-France...',
  'Cyclisme en mai...',
];

export const Hero = ({ stats, loading }: HeroProps) => {
  const navigate = useNavigate();
  const [activePanel, setActivePanel] = useState<'sport' | 'region' | 'date' | null>(null);
  const [sport, setSport] = useState('');
  const [region, setRegion] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sports, setSports] = useState<{ name: string; slug: string }[]>([]);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    supabase
      .from('sports' as any)
      .select('name, slug')
      .order('name')
      .then(({ data }) => { if (data) setSports(data as any); });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const goSearch = () => {
    const params = new URLSearchParams();
    if (sport) params.append('sport', sport);
    if (region) params.append('region', region);
    if (dateFilter === 'Ce week-end') {
      const now = new Date();
      const day = now.getDay();
      const daysToFriday = day <= 5 ? 5 - day : 6;
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysToFriday);
      params.append('date_start', friday.toISOString().slice(0, 10));
    } else if (dateFilter === 'Ce mois') {
      params.append('month', new Date().toISOString().slice(0, 7));
    }
    navigate(params.toString() ? `/events?${params}` : '/events');
  };

  return (
    <header className="relative h-[700px] flex items-center justify-center overflow-hidden">
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
          Les événements sportifs<br />près de chez vous.
        </h1>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Ligne du haut — placeholder rotatif */}
            <div
              className="px-6 py-4 cursor-pointer"
              onClick={() => setActivePanel(activePanel ? null : 'sport')}
            >
              <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-1">
                Que cherchez-vous ?
              </p>
              <p className="text-gray-400 text-sm">
                {sport ? sports.find(s => s.slug === sport)?.name : PLACEHOLDERS[placeholderIdx]}
              </p>
            </div>

            <div className="border-t border-gray-100" />

            {/* 3 pills en ligne */}
            <div className="grid grid-cols-3 divide-x divide-gray-100">

              <button
                onClick={() => setActivePanel(activePanel === 'sport' ? null : 'sport')}
                className={`px-4 py-3 text-left transition-colors ${activePanel === 'sport' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Sport</p>
                <p className="text-sm text-gray-500 truncate">
                  {sport ? sports.find(s => s.slug === sport)?.name : 'Tous'}
                </p>
              </button>

              <button
                onClick={() => setActivePanel(activePanel === 'region' ? null : 'region')}
                className={`px-4 py-3 text-left transition-colors ${activePanel === 'region' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Région</p>
                <p className="text-sm text-gray-500 truncate">
                  {region || 'Partout'}
                </p>
              </button>

              <button
                onClick={() => setActivePanel(activePanel === 'date' ? null : 'date')}
                className={`px-4 py-3 text-left transition-colors ${activePanel === 'date' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wide">Quand</p>
                <p className="text-sm text-gray-500 truncate">
                  {dateFilter || 'Peu importe'}
                </p>
              </button>
            </div>

            {/* Bouton rechercher */}
            <div className="px-4 pb-4 pt-2">
              <Button
                onClick={goSearch}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-base flex items-center justify-center gap-2"
              >
                <Search className="h-5 w-5" />
                Rechercher
              </Button>
            </div>

            {/* Panneaux dépliants */}
            {activePanel === 'sport' && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSport(''); setActivePanel(null); }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!sport ? 'bg-orange-500 text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    Tous les sports
                  </button>
                  {sports.map(s => (
                    <button
                      key={s.slug}
                      onClick={() => { setSport(s.slug); setActivePanel(null); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${sport === s.slug ? 'bg-orange-500 text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'region' && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1">
                  <button
                    onClick={() => { setRegion(''); setActivePanel(null); }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!region ? 'bg-orange-500 text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    Toutes les régions
                  </button>
                  {REGIONS.map(r => (
                    <button
                      key={r.name}
                      onClick={() => { setRegion(r.name); setActivePanel(null); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${region === r.name ? 'bg-orange-500 text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activePanel === 'date' && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                <div className="grid grid-cols-2 gap-2">
                  {['Ce week-end', 'Ce mois', 'Dans 3 mois', 'Cette année'].map(label => (
                    <button
                      key={label}
                      onClick={() => { setDateFilter(dateFilter === label ? '' : label); setActivePanel(null); }}
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${dateFilter === label ? 'bg-orange-500 text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pills rapides */}
          <div className="flex gap-2 mt-4 flex-wrap justify-center">
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
      </div>
    </header>
  );
};
