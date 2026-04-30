import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/data/regions";

const QUICK_SPORTS = ['Triathlon', 'Trail', 'Football', 'Cyclisme', 'Natation'];

const PLACEHOLDERS = [
  'Triathlon à Lyon...',
  'Trail en Bretagne...',
  'Football ce week-end...',
  'Natation en Île-de-France...',
  'Cyclisme en mai...',
];

interface HeroProps {
  stats: { totalEvents: number; totalTickets: number; satisfaction: number };
  loading: boolean;
}

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
    <header className="relative h-[600px] md:h-[680px] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1600&q=80"
          alt="Sport background"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0A0A0A]/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/40 via-transparent to-[#0A0A0A]/60" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 mt-8">
        {/* Eyebrow */}
        <p className="text-[#F97316] text-xs font-bold uppercase tracking-[0.14em] mb-5">
          La billetterie du sport amateur
        </p>

        {/* H1 */}
        <h1 className="font-poppins font-extrabold text-white leading-[1.06] tracking-[-0.03em] mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
          Les événements sportifs<br />près de chez vous.
        </h1>

        <p className="text-white/70 text-base mb-8 max-w-lg mx-auto leading-relaxed">
          Découvrez et réservez vos billets pour tous les événements sportifs en France.
        </p>

        {/* Search box */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

            {/* Top — placeholder rotatif */}
            <div
              className="px-6 py-4 cursor-pointer border-b border-gray-100"
              onClick={() => setActivePanel(activePanel ? null : 'sport')}
            >
              <p className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.1em] mb-1">
                Que cherchez-vous ?
              </p>
              <p className="text-gray-400 text-sm">
                {sport ? sports.find(s => s.slug === sport)?.name : PLACEHOLDERS[placeholderIdx]}
              </p>
            </div>

            {/* 3 champs */}
            <div className="grid grid-cols-3 divide-x divide-gray-100">
              <button
                onClick={() => setActivePanel(activePanel === 'sport' ? null : 'sport')}
                className={`px-5 py-3 text-left transition-colors ${activePanel === 'sport' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.1em]">Sport</p>
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {sport ? sports.find(s => s.slug === sport)?.name : 'Tous'}
                </p>
              </button>

              <button
                onClick={() => setActivePanel(activePanel === 'region' ? null : 'region')}
                className={`px-5 py-3 text-left transition-colors ${activePanel === 'region' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.1em]">Région</p>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{region || 'Partout'}</p>
              </button>

              <button
                onClick={() => setActivePanel(activePanel === 'date' ? null : 'date')}
                className={`px-5 py-3 text-left transition-colors ${activePanel === 'date' ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
              >
                <p className="text-[10px] font-bold text-gray-900 uppercase tracking-[0.1em]">Quand</p>
                <p className="text-sm text-gray-500 mt-0.5 truncate">{dateFilter || 'Peu importe'}</p>
              </button>
            </div>

            {/* Bouton rechercher */}
            <div className="px-4 pb-4 pt-3">
              <button
                onClick={goSearch}
                className="w-full h-12 rounded-xl bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Search className="h-4 w-4" />
                Rechercher un événement
              </button>
            </div>

            {/* Panneaux dépliants */}
            {activePanel === 'sport' && (
              <div className="border-t border-gray-100 px-4 pb-4 pt-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSport(''); setActivePanel(null); }}
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!sport ? 'bg-[#F97316] text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    Tous les sports
                  </button>
                  {sports.map(s => (
                    <button
                      key={s.slug}
                      onClick={() => { setSport(s.slug); setActivePanel(null); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${sport === s.slug ? 'bg-[#F97316] text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
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
                    className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${!region ? 'bg-[#F97316] text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    Toutes les régions
                  </button>
                  {REGIONS.map(r => (
                    <button
                      key={r.name}
                      onClick={() => { setRegion(r.name); setActivePanel(null); }}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${region === r.name ? 'bg-[#F97316] text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
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
                      className={`px-3 py-2 rounded-lg text-sm text-left transition-colors ${dateFilter === label ? 'bg-[#F97316] text-white font-medium' : 'hover:bg-gray-100 text-gray-700'}`}
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
                className="bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-4 py-1.5 rounded-full border border-white/20 transition-colors"
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
