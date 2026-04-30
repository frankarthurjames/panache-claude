import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/data/regions";
import { Loader2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

export const RegionsGrid = () => {
  useReveal(200);
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
          .sort((a, b) => b.count - a.count)
          .slice(0, 4);

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
    <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
      <div className="panache-wrap" style={{ display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
      </div>
    </section>
  );

  if (regions.length === 0) return null;

  const [featured, ...rest] = regions;

  const CardHover = {
    enter: (e: React.MouseEvent<HTMLButtonElement>) => {
      const bg = e.currentTarget.querySelector(".rcard-bg") as HTMLElement;
      const tint = e.currentTarget.querySelector(".rcard-tint") as HTMLElement;
      if (bg) { bg.style.transform = "scale(1.05)"; bg.style.filter = "brightness(0.88) saturate(1.2)"; }
      if (tint) tint.style.opacity = "1";
    },
    leave: (e: React.MouseEvent<HTMLButtonElement>) => {
      const bg = e.currentTarget.querySelector(".rcard-bg") as HTMLElement;
      const tint = e.currentTarget.querySelector(".rcard-tint") as HTMLElement;
      if (bg) { bg.style.transform = "none"; bg.style.filter = "brightness(0.7) saturate(1.1)"; }
      if (tint) tint.style.opacity = "0";
    },
  };

  return (
    <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
      <div className="panache-wrap">

        {/* Header */}
        <div
          className="reveal"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "28px" }}
        >
          <div>
            <span className="eyebrow">Par territoire</span>
            <h2 className="sec-title">À la découverte des régions</h2>
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
            Toutes les régions →
          </button>
        </div>

        {/* Grille — fix : wrapper avec CSS class pour éviter le conflit inline */}
        <div className="reveal regions-outer">
          <div className="regions-grid-inner">

            {/* Grande card featured */}
            {featured && (
              <button
                onClick={() => navigate(`/events?region=${encodeURIComponent(featured.name)}`)}
                className="rcard-featured"
                onMouseEnter={CardHover.enter}
                onMouseLeave={CardHover.leave}
                style={{
                  borderRadius: "12px", overflow: "hidden",
                  position: "relative", cursor: "pointer",
                  border: "none", padding: 0, display: "block",
                }}
              >
                <div
                  className="rcard-bg"
                  style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url('${featured.image}')`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    filter: "brightness(0.7) saturate(1.1)",
                    transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.3s",
                  }}
                />
                <div
                  className="rcard-tint"
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(255,107,26,0.22) 0%, transparent 60%)",
                    opacity: 0, transition: "opacity 0.3s",
                  }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 58%)",
                }} />
                <div style={{ position: "absolute", bottom: "18px", left: "20px", right: "16px" }}>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                    fontSize: "22px", color: "white",
                    lineHeight: 1.2, letterSpacing: "-0.02em",
                    marginBottom: "4px",
                  }}>
                    {featured.name}
                  </div>
                  <div style={{
                    fontSize: "11px", color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                    <span style={{
                      display: "inline-block", width: "6px", height: "6px",
                      background: "#FF6B1A", borderRadius: "50%",
                    }} />
                    {featured.count} événement{featured.count > 1 ? "s" : ""}
                  </div>
                </div>
              </button>
            )}

            {/* Petites cards */}
            {rest.map((region, idx) => (
              <button
                key={region.name}
                onClick={() => navigate(`/events?region=${encodeURIComponent(region.name)}`)}
                className={`reveal reveal-d${idx + 1} rcard-small`}
                onMouseEnter={CardHover.enter}
                onMouseLeave={CardHover.leave}
                style={{
                  borderRadius: "12px", overflow: "hidden",
                  position: "relative", cursor: "pointer",
                  border: "none", padding: 0, display: "block",
                }}
              >
                <div
                  className="rcard-bg"
                  style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url('${region.image}')`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    filter: "brightness(0.7) saturate(1.1)",
                    transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1), filter 0.3s",
                  }}
                />
                <div
                  className="rcard-tint"
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(255,107,26,0.22) 0%, transparent 60%)",
                    opacity: 0, transition: "opacity 0.3s",
                  }}
                />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 58%)",
                }} />
                <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "12px" }}>
                  <div style={{
                    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                    fontSize: "15px", color: "white",
                    lineHeight: 1.25, letterSpacing: "-0.02em",
                    marginBottom: "3px",
                  }}>
                    {region.name}
                  </div>
                  <div style={{
                    fontSize: "10px", color: "rgba(255,255,255,0.68)",
                    fontWeight: 500,
                    display: "flex", alignItems: "center", gap: "5px",
                  }}>
                    <span style={{
                      display: "inline-block", width: "5px", height: "5px",
                      background: "#FF6B1A", borderRadius: "50%",
                    }} />
                    {region.count} événement{region.count > 1 ? "s" : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .regions-grid-inner {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 12px;
        }
        .rcard-featured {
          height: 200px;
        }
        .rcard-small {
          height: 200px;
        }

        @media (max-width: 960px) {
          .regions-grid-inner {
            grid-template-columns: 1fr 1fr !important;
          }
          .rcard-featured {
            grid-column: span 2;
            height: 160px !important;
          }
          .rcard-small {
            height: 140px !important;
          }
        }

        @media (max-width: 480px) {
          .regions-grid-inner {
            grid-template-columns: 1fr !important;
          }
          .rcard-featured {
            grid-column: span 1 !important;
            height: 140px !important;
          }
          .rcard-small {
            height: 120px !important;
          }
        }
      `}</style>
    </section>
  );
};
