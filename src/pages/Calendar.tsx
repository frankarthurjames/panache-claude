import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const isFicheComplete = (event: any): boolean => {
  return !!(
    event.description &&
    event.description.trim().length >= 50 &&
    event.sport_id &&
    event.city
  );
};

const CalendarPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('events')
          .select('id, title, starts_at, ends_at, city, region, description, sport_id, organization_id, website, images')
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true });

        if (error) {
          console.error('Erreur:', error);
          return;
        }

        setData(rows || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedByMonth = data.reduce((acc: any, event: any) => {
    const month = new Date(event.starts_at).toLocaleDateString('fr-FR', {
      month: 'long', year: 'numeric'
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO title="Calendrier des événements" description="Tous les événements sportifs à venir" />
      <Navbar variant="orange" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendrier des événements</h1>
          <p className="text-gray-500 text-sm">Tous les événements sportifs à venir</p>
        </div>

        {!loading && (
          <p className="text-sm text-gray-500 mb-8">
            <span className="font-semibold text-gray-900">{data.length}</span>
            {' '}événement{data.length > 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg font-medium">Aucun événement trouvé</p>
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
                    <div className="w-1 self-stretch rounded-full bg-orange-500 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-orange-500 uppercase tracking-wide mb-1">
                        {new Date(event.starts_at).toLocaleDateString('fr-FR', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                      <h3 className="font-bold text-gray-900 text-base leading-tight mb-1">{event.title}</h3>
                      {event.city && <p className="text-sm text-gray-500">{event.city}</p>}
                    </div>
                    {isFicheComplete(event) && (
                      <a
                        href={`/events/${event.id}`}
                        className="text-xs font-medium px-3 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors whitespace-nowrap flex-shrink-0"
                      >
                        Voir la fiche
                      </a>
                    )}
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
