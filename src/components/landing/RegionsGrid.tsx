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
    <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
      </div>
    </section>
  );

  if (regions.length === 0) return null;

  const [featured, ...rest] = regions.slice(0, 4);

  return (
    <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>

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

        <div
          className="reveal regions-grid-responsive"
          style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr 1fr 1fr", gap: "12px" }}
        >
          {/* Grande card */}
          {featured && (
            <button
              onClick={() => navigate(`/events?region=${encodeURIComponent(featured.name)}`)}
              style={{
                borderRadius: "12px", overflow: "hidden",
                position: "relative", height: "180px",
                cursor: "pointer", border: "none", padding: 0,
              }}
              onMouseEnter={e => {
                const bg = e.currentTarget.querySelector(".rcard-bg") as HTMLElement;
                const tint = e.currentTarget.querySelector(".rcard-tint") as HTMLElement;
                if (bg) { bg.style.transform = "scale(1.05)"; bg.style.filter = "brightness(0.88) saturate(1.2)"; }
                if (tint) tint.style.opacity = "1";
              }}
              onMouseLeave={e => {
                const bg = e.currentTarget.querySelector(".rcard-bg") as HTMLElement;
                const tint = e.currentTarget.querySelector(".rcard-tint") as HTMLElement;
                if (bg) { bg.style.transform = "none"; bg.style.filter = "brightness(0.7) saturate(1.1)"; }
                if (tint) tint.style.opacity = "0";
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
                  background: "linear-gradient(135deg, rgba(255,107,26,0.18) 0%, transparent 60%)",
                  opacity: 0, transition: "opacity 0.3s",
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 58%)" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "18px" }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "20px", color: "white", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                  {featured.name}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.68)", fontWeight: 500, marginTop: "3px" }}>
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
              className="reveal"
              style={{
                borderRadius: "12px", overflow: "hidden",
                position: "relative", height: "180px",
                cursor: "pointer", border: "none", padding: 0,
              }}
              onMouseEnter={e => {
                const bg = e.currentTarget.querySelector(".rcard-bg") as HTMLElement;
                const tint = e.currentTarget.querySelector(".rcard-tint") as HTMLElement;
                if (bg) { bg.style.transform = "scale(1.05)"; bg.style.filter = "brightness(0.88) saturate(1.2)"; }
                if (tint) tint.style.opacity = "1";
              }}
              onMouseLeave={e => {
                const bg = e.currentTarget.querySelector(".rcard-bg") as HTMLElement;
                const tint = e.currentTarget.querySelector(".rcard-tint") as HTMLElement;
                if (bg) { bg.style.transform = "none"; bg.style.filter = "brightness(0.7) saturate(1.1)"; }
                if (tint) tint.style.opacity = "0";
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
                  background: "linear-gradient(135deg, rgba(255,107,26,0.18) 0%, transparent 60%)",
                  opacity: 0, transition: "opacity 0.3s",
                }}
              />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 58%)" }} />
              <div style={{ position: "absolute", bottom: "16px", left: "18px" }}>
                <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "15px", color: "white", lineHeight: 1.25, letterSpacing: "-0.02em" }}>
                  {region.name}
                </div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.68)", fontWeight: 500, marginTop: "3px" }}>
                  {region.count} événement{region.count > 1 ? "s" : ""}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .regions-grid-responsive { grid-template-columns: 1fr 1fr !important; }
          .regions-grid-responsive button { height: 130px !important; }
        }
        @media (max-width: 480px) {
          .regions-grid-responsive { grid-template-columns: 1fr !important; }
          .regions-grid-responsive button { height: 120px !important; }
        }
      `}</style>
    </section>
  );
};
