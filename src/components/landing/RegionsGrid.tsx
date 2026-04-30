import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/data/regions";
import { Loader2 } from "lucide-react";

export const RegionsGrid = () => {
  const [regions, setRegions] = useState<{ name: string; image: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          .filter((r) => r.count > 0)
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

  if (loading) return (
    <section className="py-14 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
      </div>
    </section>
  );

  if (regions.length === 0) return null;

  return (
    <section className="py-14">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto mb-6">
          <h2
            className="font-poppins font-extrabold text-[#1A1A1A] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
          >
            À la découverte des régions
          </h2>
          <p className="text-[#5A5A5A] text-sm mt-1">
            Explorez les événements sportifs près de chez vous ou partout en France.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-3 px-4 sm:px-6 lg:px-8" style={{ width: "max-content" }}>
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => navigate(`/events?region=${encodeURIComponent(region.name)}`)}
              className="group relative flex-shrink-0 rounded-xl overflow-hidden text-left"
              style={{ width: "140px", height: "88px" }}
            >
              <img
                src={region.image}
                alt={region.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/80 via-[#0A0A0A]/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-bold text-xs leading-tight line-clamp-2">
                  {region.name}
                </p>
                <p className="text-white/70 text-[10px] mt-0.5">
                  {region.count} événement{region.count > 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
