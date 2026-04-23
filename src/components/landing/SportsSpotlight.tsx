
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
        // Count events per sport from published future events
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

        const topInit = Object.values(counts).sort((a: any, b: any) => b.count - a.count).slice(0, 6);
        const top = [...topInit];

        // Fill up to 6 with sports that have no events (alphabetical)
        if (top.length < 6) {
          const existingIds = new Set(top.map((s: any) => s.id));
          const { data: allSports } = await supabase
            .from("sports" as any)
            .select("id, name, slug, image_url")
            .order("name");

          for (const s of allSports || []) {
            if (top.length >= 6) break;
            if (!existingIds.has(s.id)) top.push({ ...s, count: 0 });
          }
        }

        setSports(top);
      } catch (err) {
        console.error("Error fetching sports:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

  return (
    <section className="relative py-24 overflow-hidden">
      <div
        className="absolute inset-0 bg-[#F97316]"
        style={{ zIndex: 0, clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)" }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-8">Les sports à la une</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sports.map((sport: any) => (
              <a
                key={sport.id}
                href={`/events?sport=${sport.slug}`}
                className="relative rounded-xl overflow-hidden h-32 cursor-pointer group"
              >
                <img
                  src={sport.image_url || FALLBACK_IMAGE}
                  alt={sport.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40" />
                <div className="absolute bottom-0 left-0 p-3">
                  <p className="text-white font-bold text-sm">{sport.name}</p>
                  {sport.count > 0 && (
                    <p className="text-white/80 text-xs">
                      {sport.count} événement{sport.count > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
