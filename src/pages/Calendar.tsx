import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const isFicheComplete = (event: any): boolean => {
  const hasDescription = event.description && event.description.trim().length >= 50;
  const hasSport = !!event.sports?.name;
  const hasCity = !!event.city;
  return hasDescription && hasSport && hasCity;
};

const CalendarPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sportFilter, setSportFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: rows } = await supabase
          .from('events')
          .select(`
            id, title, starts_at, ends_at,
            city, region, description, venue,
            images, website,
            organizations(id, name, email, website),
            sports(id, name, slug)
          `)
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true });
        setData(rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const availableSports = useMemo(() =>
    Array.from(
      new Map(
        data.filter(e => e.sports).map(e => [e.sports.id, e.sports])
      ).values()
    ).sort((a: any, b: any) => a.name.localeCompare(b.name)),
  [data]);

  const availableRegions = useMemo(() =>
    Array.from(new Set(data.filter(e => e.region).map(e => e.region))).sort(),
  [data]);

  const filteredEvents = useMemo(() =>
    data.filter(e => {
      if (sportFilter && e.sports?.slug !== sportFilter) return false;
      if (regionFilter && e.region !== regionFilter) return false;
      return true;
    }),
  [data, sportFilter, regionFilter]);

  const groupedByMonth = useMemo(() =>
    filteredEvents.reduce((acc: any, event: any) => {
      const month = new Date(event.starts_at).toLocaleDateString('fr-FR', {
        month: 'long', year: 'numeric'
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(event);
      return acc;
    }, {}),
  [filteredEvents]);

  const heroTitle = sportFilter
    ? `Événements · ${availableSports.find((s: any) => s.slug === sportFilter)?.name || ''}`
    : regionFilter
    ? `Événements en ${regionFilter}`
    : 'Calendrier des événements';

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO title={heroTitle} description="Tous les événements sportifs à venir" />
      <Navbar variant="orange" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">{heroTitle}</h1>
          <p className="text-gray-500 text-sm">Tous les événements sportifs à venir</p>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            value={sportFilter}
            onChange={(e) => setSportFilter(e.target.value)}
            className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-600 focus:outline-none focus:border-orange-300"
          >
            <option value="">Tous les sports</option>
            {availableSports.map((s: any) => (
              <option key={s.id} value={s.slug}>{s.name}</option>
            ))}
          </select>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-600 focus:outline-none focus:border-orange-300"
          >
            <option value="">Toutes les régions</option>
            {availableRegions.map((r: any) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {(sportFilter || regionFilter) && (
            <button
              onClick={() => { setSportFilter(''); setRegionFilter(''); }}
              className="h-10 px-4 rounded-full text-sm text-orange-500 border border-orange-200 hover:bg-orange-50 transition-colors"
            >
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Compteur */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-8">
            <span className="font-semibold text-gray-900">{filteredEvents.length}</span>
            {' '}événement{filteredEvents.length > 1 ? 's' : ''}
          </p>
        )}

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg font-medium mb-2">Aucun événement trouvé</p>
            <button
              onClick={() => { setSportFilter(''); setRegionFilter(''); }}
              className="text-orange-500 text-sm underline"
            >
              Voir tous les événements
            </button>
          </div>
        ) : (
          Object.entries(groupedByMonth).map(([month, events]: any) => (
            <div key={month} className="mb-10">
              <h2 className="text-lg font-bold text-gray-900 capitalize mb-4 pb-2 border-b-2 border-orange-500 inline-block">
                {month}
              </h2>

              <div className="space-y-0">
                {events.map((event: any, index: number) => (
                  <div
                    key={event.id}
                    className={`flex items-start justify-between gap-4 py-4 ${index < events.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {/* Barre gauche */}
                    <div className="w-1 self-stretch rounded-full bg-orange-500 flex-shrink-0 mt-1" />

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">
                        {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        })}
                        {event.ends_at &&
                          new Date(event.ends_at).toDateString() !== new Date(event.starts_at).toDateString() &&
                          ` → ${new Date(event.ends_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                        }
                      </p>
                      <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {event.sports?.name && (
                          <button
                            onClick={() => setSportFilter(event.sports.slug)}
                            className="text-orange-500 font-medium hover:underline mr-2"
                          >
                            {event.sports.name}
                          </button>
                        )}
                        {event.sports?.name && event.city && <span className="mr-2">·</span>}
                        {event.city}
                        {event.region && (
                          <>
                            <span className="mx-2">·</span>
                            <button
                              onClick={() => setRegionFilter(event.region)}
                              className="hover:text-orange-500 hover:underline transition-colors"
                            >
                              {event.region}
                            </button>
                          </>
                        )}
                        {event.organizations?.name && (
                          <>
                            <span className="mx-2">·</span>
                            <span>{event.organizations.name}</span>
                          </>
                        )}
                      </p>
                    </div>

                    {/* Boutons */}
                    <div className="flex flex-col gap-2 flex-shrink-0 items-end">
                      {isFicheComplete(event) && (
                        <a
                          href={`/events/${event.id}`}
                          className="text-xs font-medium px-3 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors whitespace-nowrap"
                        >
                          Voir la fiche
                        </a>
                      )}
                      {event.organizations?.email && (
                        <a
                          href={`mailto:${event.organizations.email}`}
                          className="text-xs font-medium px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:border-gray-300 transition-colors whitespace-nowrap"
                        >
                          Contacter
                        </a>
                      )}
                      {(event.website || event.organizations?.website) && (
                        <a
                          href={event.website || event.organizations?.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:border-gray-300 transition-colors whitespace-nowrap"
                        >
                          Site web
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CalendarPage;
