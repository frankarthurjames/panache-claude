import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800";

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
          .slice(0, 5);

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
    <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
      <div className="panache-wrap" style={{ display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
      </div>
    </section>
  );

  if (sports.length === 0) return null;

  const [featured, ...rest] = sports;

  return (
    <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
      <div className="panache-wrap">

        <div
          className="reveal"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}
        >
          <div>
            <span className="eyebrow">Explorez</span>
            <h2 className="sec-title">Sports populaires</h2>
          </div>
          <button
            onClick={() => navigate("/events")}
            style={{
              fontSize: "13px", fontWeight: 600, color: "#FF6B1A",
              background: "none", border: "none",
              borderBottom: "1.5px solid #FF6B1A",
              paddingBottom: "1px", cursor: "pointer",
              whiteSpace: "nowrap", flexShrink: 0, minHeight: "auto",
            }}
          >
            Tous les sports →
          </button>
        </div>

        {/* Grille asymétrique — 2.1fr 1fr 1fr / 2 rangées */}
        <div
          className="reveal sports-grid-responsive"
          style={{
            display: "grid",
            gridTemplateColumns: "2.1fr 1fr 1fr",
            gridTemplateRows: "165px 165px",
            gap: "10px",
          }}
        >
          {/* Grande card — span 2 rangées */}
          {featured && (
            <button
              onClick={() => navigate(`/events?sport=${featured.slug}`)}
              className="sport-feat-card"
              style={{
                gridRow: "span 2", borderRadius: "12px",
                overflow: "hidden", position: "relative",
                cursor: "pointer", border: "none", padding: 0,
              }}
            >
              <div
                style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url('${featured.image_url || FALLBACK}')`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  filter: "brightness(0.72) saturate(1.1)",
                  transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.3s",
                }}
                className="sport-bg-img"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 65%)" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "18px" }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "26px", color: "white", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  {featured.name}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", fontWeight: 500, marginTop: "3px" }}>
                  {featured.count} événement{featured.count > 1 ? "s" : ""}
                </div>
              </div>
            </button>
          )}

          {/* 4 petites cards */}
          {rest.map((sport: any, idx: number) => (
            <button
              key={sport.id}
              onClick={() => navigate(`/events?sport=${sport.slug}`)}
              className="reveal"
              style={{
                borderRadius: "12px", overflow: "hidden",
                position: "relative", cursor: "pointer",
                border: "none", padding: 0,
              }}
            >
              <div
                style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url('${sport.image_url || FALLBACK}')`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  filter: "brightness(0.72) saturate(1.1)",
                  transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.3s",
                }}
                className="sport-bg-img"
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 65%)" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "18px" }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "18px", color: "white", lineHeight: 1.2, letterSpacing: "-0.02em" }}>
                  {sport.name}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.65)", fontWeight: 500, marginTop: "3px" }}>
                  {sport.count} événement{sport.count > 1 ? "s" : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .sport-feat-card:hover .sport-bg-img,
        button:hover .sport-bg-img {
          transform: scale(1.06);
          filter: brightness(0.88) saturate(1.2) !important;
        }
        @media (max-width: 768px) {
          .sports-grid-responsive {
            grid-template-columns: 1fr 1fr !important;
            grid-template-rows: auto !important;
          }
          .sport-feat-card {
            grid-row: span 1 !important;
            grid-column: span 2 !important;
            height: 180px !important;
          }
        }
        @media (max-width: 480px) {
          .sports-grid-responsive { grid-template-columns: 1fr !important; }
          .sport-feat-card { grid-column: span 1 !important; height: 160px !important; }
        }
      `}</style>
    </section>
  );
};
