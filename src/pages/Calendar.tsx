import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const isFicheComplete = (event: any): boolean => {
  return !!(
    event.description &&
    event.description.trim().length >= 50 &&
    event.sport_id &&
    event.city
  );
};

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, city, description, sport_id, organization_id, website, images")
        .eq("status", "published")
        .order("starts_at", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const orgIds = [...new Set(
        (data || []).map((e: any) => e.organization_id).filter(Boolean)
      )];

      const sportIds = [...new Set(
        (data || []).map((e: any) => e.sport_id).filter(Boolean)
      )];

      const [{ data: orgs }, { data: sports }] = await Promise.all([
        orgIds.length
          ? supabase.from("organizations").select("id, email, website").in("id", orgIds)
          : Promise.resolve({ data: [] }),
        sportIds.length
          ? supabase.from("sports" as any).select("id, name, slug").in("id", sportIds)
          : Promise.resolve({ data: [] }),
      ]);

      const orgsMap = Object.fromEntries((orgs || []).map((o: any) => [o.id, o]));
      const sportsMap = Object.fromEntries((sports as any[] || []).map((s: any) => [s.id, s]));

      const enriched = (data || []).map((e: any) => ({
        ...e,
        organization: orgsMap[e.organization_id] || null,
        sport: sportsMap[e.sport_id] || null,
      }));

      setEvents(enriched);
      setLoading(false);
    };

    fetchData();
  }, []);

  const availableSports = Array.from(
    new Map(
      events
        .filter((e: any) => e.sport)
        .map((e: any) => [e.sport.id, e.sport])
    ).values()
  ).sort((a: any, b: any) => a.name.localeCompare(b.name));

  const filteredEvents = sportFilter
    ? events.filter((e: any) => e.sport?.id === sportFilter)
    : events;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-24">
        <h1 className="text-3xl font-bold mb-8">Calendrier des événements</h1>
        {loading && <p>Chargement...</p>}
        {error && <p className="text-red-500">Erreur : {error}</p>}
        {!loading && !error && (
          <>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="h-10 rounded-full border border-gray-200 bg-white px-4 text-sm text-gray-600 focus:outline-none focus:border-orange-300 mb-6"
            >
              <option value="">Tous les sports</option>
              {availableSports.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p className="mb-4 text-gray-500">{filteredEvents.length} événement(s) trouvé(s)</p>
          </>
        )}
        {filteredEvents.map(event => (
          <div key={event.id}
               className="flex items-start justify-between gap-4 py-3 border-b border-gray-100">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-orange-500 font-bold uppercase mb-0.5">
                {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
              <p className="font-bold text-gray-900">{event.title}</p>
              <p className="text-sm text-gray-500">
                {event.sport?.name && (
                  <span className="text-orange-500 font-medium mr-2">{event.sport.name}</span>
                )}
                {event.sport?.name && event.city && <span className="mr-2">·</span>}
                {event.city}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
              {isFicheComplete(event) && (
                <a href={`/events/${event.id}`}
                   className="text-xs font-medium px-3 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors whitespace-nowrap">
                  Voir la fiche
                </a>
              )}
              {event.organization?.email && (
                <a href={`mailto:${event.organization.email}`}
                   className="text-xs font-medium px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:border-gray-300 transition-colors whitespace-nowrap">
                  Contacter
                </a>
              )}
              {(event.website || event.organization?.website) && (
                <a href={event.website || event.organization?.website}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-xs font-medium px-3 py-1.5 border border-gray-200 text-gray-600 rounded-full hover:border-gray-300 transition-colors whitespace-nowrap">
                  Site web
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default CalendarPage;
