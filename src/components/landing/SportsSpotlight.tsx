import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400";

export const SportsSpotlight = () => {
  const [sports, setSports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

        const top = Object.values(counts)
          .filter((s: any) => s.slug !== 'autre')
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 12);

        setSports(top);
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
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        </div>
      </section>
    );
  }

  if (sports.length === 0) return null;

  return (
    <section className="py-14">
      <div className="px-4 sm:px-6 lg:px-8">
        <h2 className="font-poppins font-extrabold text-[#1A1A1A] tracking-[-0.02em] mb-6 max-w-7xl mx-auto"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
          Les sports à la une
        </h2>
      </div>

      {/* Scroll horizontal */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-3 px-4 sm:px-6 lg:px-8" style={{ width: 'max-content' }}>
          {sports.map((sport: any) => (
            <button
              key={sport.id}
              onClick={() => navigate(`/events?sport=${sport.slug}`)}
              className="group relative flex-shrink-0 rounded-xl overflow-hidden text-left"
              style={{ width: '96px', height: '96px' }}
            >
              <img
                src={sport.image_url || FALLBACK_IMAGE}
                alt={sport.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-[#0A0A0A]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                <p className="text-white text-[10px] font-bold leading-tight">
                  {sport.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
