import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=400";

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
          .filter((s: any) => s.slug !== "autre")
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

  if (loading) return (
    <section style={{ padding: "56px 0" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ height: "32px", width: "32px", color: "#F97316" }} className="animate-spin" />
      </div>
    </section>
  );

  if (sports.length === 0) return null;

  return (
    <section style={{ padding: "56px 0" }}>
      <div style={{ padding: "0 24px", maxWidth: "1280px", margin: "0 auto 24px" }}>
        <h2
          className="font-poppins font-extrabold text-[#1A1A1A]"
          style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", letterSpacing: "-0.02em", marginBottom: "4px" }}
        >
          Les sports à la une
        </h2>
        <p style={{ color: "#5A5A5A", fontSize: "14px", marginTop: "4px" }}>
          Du running au yoga, trouvez votre prochain événement.
        </p>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "8px", WebkitOverflowScrolling: "touch" }}>
        <div style={{ display: "flex", gap: "12px", padding: "0 24px", width: "max-content" }}>
          {sports.map((sport: any) => (
            <button
              key={sport.id}
              onClick={() => navigate(`/events?sport=${sport.slug}`)}
              style={{
                position: "relative",
                width: "96px",
                height: "96px",
                borderRadius: "12px",
                overflow: "hidden",
                flexShrink: 0,
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img
                src={sport.image_url || FALLBACK}
                alt={sport.name}
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
                padding: "8px 4px",
                textAlign: "center",
              }}>
                <p style={{ color: "white", fontSize: "10px", fontWeight: 700, lineHeight: 1.2 }}>
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
