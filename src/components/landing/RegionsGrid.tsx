import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/data/regions";
import { Loader2 } from "lucide-react";

export const RegionsGrid = () => {
  const [regions, setRegions] = useState<{ name: string; image: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const { data } = await supabase
          .from("events")
          .select("region")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString())
          .not("region", "is", null);

        const counts: Record<string, number> = {};
        for (const e of data || []) {
          if (e.region) counts[e.region] = (counts[e.region] || 0) + 1;
        }

        const result = REGIONS
          .map((r) => ({ ...r, count: counts[r.name] || 0 }))
          .sort((a, b) => b.count - a.count);

        setRegions(result);
      } catch (err) {
        console.error("Error fetching regions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
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

  if (regions.length === 0) return null;

  return (
    <section className="py-16">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-900 max-w-7xl mx-auto">À la découverte des régions</h2>
      </div>
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
          {regions.map((region) => (
            <a
              key={region.name}
              href={`/events?region=${encodeURIComponent(region.name)}`}
              className="relative rounded-xl overflow-hidden cursor-pointer group flex-shrink-0"
              style={{ width: '160px', height: '200px' }}
            >
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-bold text-base leading-tight">{region.name}</p>
                <p className="text-white/80 text-xs mt-1">
                  {region.count} événement{region.count > 1 ? 's' : ''}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
