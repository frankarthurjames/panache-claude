import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("events")
      .select("id, title, starts_at, city")
      .eq("status", "published")
      .order("starts_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setEvents(data || []);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pt-28 pb-24">
        <h1 className="text-3xl font-bold mb-8">
          Calendrier des événements
        </h1>
        {loading && <p>Chargement...</p>}
        {error && <p className="text-red-500">Erreur : {error}</p>}
        {!loading && !error && (
          <p className="mb-4 text-gray-500">
            {events.length} événement(s) trouvé(s)
          </p>
        )}
        {events.map(event => (
          <div key={event.id}
               className="py-3 border-b border-gray-100">
            <p className="text-xs text-orange-500 font-bold">
              {new Date(event.starts_at)
                .toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
            </p>
            <p className="font-bold text-gray-900">
              {event.title}
            </p>
            <p className="text-sm text-gray-500">
              {event.city}
            </p>
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
};

export default CalendarPage;
