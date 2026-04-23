
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800";

export const SportsSpotlight = () => {
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data: eventRows } = await supabase
          .from("events")
          .select("sport_id, sports(id, name, slug, image_url)")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .not("sport_id", "is", null);

        const counts: Record<string, any> = {};
        for (const row of eventRows || []) {
          const s = row.sports as any;
          if (!s) continue;
          if (!counts[s.id]) counts[s.id] = { ...s, count: 0 };
          counts[s.id].count++;
        }

        const topInit = Object.values(counts)
          .filter((s: any) => s.slug !== 'autre')
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 12);

        setSports(topInit);
      } catch (err) {
        console.error("Error fetching sports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </section>
    );
  }

  if (sports.length === 0) return null;

  return (
    <section className="py-16">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 max-w-7xl mx-auto">Les sports à la une</h2>
      </div>
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
          {sports.map((sport: any) => (
            <a
              key={sport.id}
              href={`/events?sport=${sport.slug}`}
              className="relative rounded-xl overflow-hidden cursor-pointer group flex-shrink-0"
              style={{ width: '160px', height: '200px' }}
            >
              <img
                src={sport.image_url || FALLBACK_IMAGE}
                alt={sport.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-base leading-tight">{sport.name}</p>
                {sport.count > 0 && (
                  <p className="text-white/80 text-xs mt-1">
                    {sport.count} événement{sport.count > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
