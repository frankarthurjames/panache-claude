import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

export const LatestActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id, title, starts_at, city, venue, images, description,
            organization:organizations(name),
            ticket_types(price_cents),
            sports(name)
          `)
          .eq('status', 'published')
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(6);
        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        </div>
      </section>
    );
  }

  if (activities.length === 0) return null;

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">

        {/* Header */}
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="font-poppins font-extrabold text-[#1A1A1A] tracking-[-0.02em]"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
            Les derniers événements
          </h2>
          <Link
            to="/events"
            className="text-[#F97316] text-sm font-semibold hover:underline"
          >
            Voir tout →
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((activity: any) => {
            const imageUrl = activity.images?.length > 0
              ? activity.images[0]
              : "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";

            const minPrice = activity.ticket_types?.length > 0
              ? Math.min(...activity.ticket_types.map((t: any) => t.price_cents))
              : 0;
            const priceDisplay = minPrice === 0 ? 'Gratuit' : `À partir de ${(minPrice / 100).toFixed(0)}€`;
            const isFree = minPrice === 0;
            const sport = (activity.sports?.name || 'Sport').toUpperCase();
            const dateStr = format(new Date(activity.starts_at), "d MMM yyyy", { locale: fr });
            const city = activity.city || activity.venue || '';
            const cleanTitle = activity.title.replace(/^\[.*?\]\s*/, '');

            return (
              <button
                key={activity.id}
                onClick={() => navigate(`/events/${activity.id}`)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-200 text-left block w-full"
              >
                {/* Image */}
                <img
                  src={imageUrl}
                  alt={cleanTitle}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/90 via-[#0A0A0A]/20 to-transparent" />

                {/* Badge sport — haut gauche */}
                <div className="absolute top-4 left-4">
                  <span className="bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-full">
                    {sport}
                  </span>
                </div>

                {/* Prix — haut droite */}
                <div className="absolute top-4 right-4">
                  <span className={`text-white text-[10px] font-bold px-3 py-1.5 rounded-full ${isFree ? 'bg-[#16A34A]' : 'bg-[#F97316]'}`}>
                    {priceDisplay}
                  </span>
                </div>

                {/* Contenu — bas */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-poppins font-bold text-white leading-tight tracking-[-0.01em] line-clamp-2 mb-2"
                      style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)' }}>
                    {cleanTitle}
                  </h3>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider">
                    {dateStr}{city ? ` · ${city}` : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA centré */}
        <div className="mt-10 flex justify-center">
          <Link
            to="/events"
            className="border border-[#E8E8E8] text-[#1A1A1A] hover:border-[#F97316] hover:text-[#F97316] font-semibold text-sm px-8 py-3 rounded-full transition-colors"
          >
            Voir tous les événements
          </Link>
        </div>
      </div>
    </section>
  );
};
