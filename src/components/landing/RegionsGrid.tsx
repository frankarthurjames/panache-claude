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
    <section style={{ padding: "56px 0" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ height: "32px", width: "32px", color: "#F97316" }} className="animate-spin" />
      </div>
    </section>
  );

  if (regions.length === 0) return null;

  return (
    <section style={{ padding: "56px 0" }}>
      <div style={{ padding: "0 24px", maxWidth: "1280px", margin: "0 auto 24px" }}>
        <h2
          className="font-poppins font-extrabold text-[#1A1A1A]"
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", letterSpacing: "-0.02em", marginBottom: "4px" }}
        >
          À la découverte des régions
        </h2>
        <p style={{ color: "#5A5A5A", fontSize: "14px", marginTop: "4px" }}>
          Explorez les événements sportifs près de chez vous ou partout en France.
        </p>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "8px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", gap: "12px", padding: "0 24px", width: "max-content" }}>
          {regions.map((region) => (
            <button
              key={region.name}
              onClick={() => navigate(`/events?region=${encodeURIComponent(region.name)}`)}
              style={{
                position: "relative",
                width: "140px",
                height: "88px",
                borderRadius: "12px",
                overflow: "hidden",
                flexShrink: 0,
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img
                src={region.image}
                alt={region.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.1) 100%)",
              }} />
              <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "10px 12px",
              }}>
                <p style={{
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  marginBottom: "2px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {region.name}
                </p>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "10px" }}>
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
