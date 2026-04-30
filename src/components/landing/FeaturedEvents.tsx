import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";

export const FeaturedEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await supabase
          .from("events")
          .select(`id, title, starts_at, city, images, ticket_types(price_cents), sports(name)`)
          .eq("status", "published")
          .eq("is_featured", true)
          .gte("starts_at", new Date().toISOString())
          .order("featured_order", { ascending: true })
          .limit(3);
        setEvents(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return (
    <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
      <div className="panache-wrap" style={{ display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
      </div>
    </section>
  );

  if (events.length === 0) return null;

  const getImage   = (e: any) => e.images?.length > 0 ? e.images[0] : FALLBACK;
  const getSport   = (e: any) => (e.sports?.name || "Sport").toUpperCase();
  const getDate    = (e: any) => format(new Date(e.starts_at), "d MMM yyyy", { locale: fr });
  const cleanTitle = (t: string) => t.replace(/^\[.*?\]\s*/, "");
  const isFree     = (e: any) => !e.ticket_types?.length || Math.min(...e.ticket_types.map((t: any) => t.price_cents)) === 0;
  const getPrice   = (e: any) => {
    if (!e.ticket_types?.length) return null;
    const min = Math.min(...e.ticket_types.map((t: any) => t.price_cents));
    return min === 0 ? null : `À partir de ${(min / 100).toFixed(0)}€`;
  };

  const [main, ...rest] = events;

  return (
    <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
      <div className="panache-wrap">

        {/* Header — titre avec accent orange */}
        <div className="reveal" style={{ marginBottom: "28px" }}>
          <span className="eyebrow">Sélection éditoriale</span>
          <h2 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 700, fontStyle: "italic",
            fontSize: "clamp(32px, 3.8vw, 48px)",
            letterSpacing: "-0.03em", lineHeight: 1.1,
            color: "#141414",
            display: "flex", alignItems: "center", gap: "12px",
          }}>
            À la une
            <span style={{
              display: "inline-block",
              width: "36px", height: "4px",
              background: "#FF6B1A",
              borderRadius: "2px",
              marginBottom: "4px",
              flexShrink: 0,
            }} />
          </h2>
        </div>

        {/* Zone noire avec liseré orange en haut */}
        <div
          className="reveal"
          style={{
            background: "#141414",
            borderRadius: "20px",
            padding: "28px",
            borderTop: "3px solid #FF6B1A",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial orange subtil en fond */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 50% 60% at 100% 0%, rgba(255,107,26,0.08) 0%, transparent 70%)",
          }} />

          <div style={{
            display: "grid",
            gridTemplateColumns: "1.7fr 1fr",
            gap: "14px",
            position: "relative", zIndex: 1,
          }}>

            {/* Grande card */}
            {main && (
              <button
                onClick={() => navigate(`/events/${main.id}`)}
                style={{
                  borderRadius: "14px", overflow: "hidden",
                  background: "#1E1E1E",
                  border: "1.5px solid rgba(255,255,255,0.08)",
                  display: "flex", flexDirection: "column",
                  cursor: "pointer", textAlign: "left", padding: 0,
                  transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), border-color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.borderColor = "rgba(255,107,26,0.5)";
                  const img = e.currentTarget.querySelector("img") as HTMLImageElement;
                  if (img) img.style.transform = "scale(1.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  const img = e.currentTarget.querySelector("img") as HTMLImageElement;
                  if (img) img.style.transform = "none";
                }}
              >
                {/* Image */}
                <div style={{ height: "240px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={getImage(main)}
                    alt={cleanTitle(main.title)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                  <span style={{
                    position: "absolute", top: "12px", left: "12px",
                    background: "#FF6B1A", color: "white",
                    fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", padding: "4px 10px", borderRadius: "50px",
                  }}>
                    {getSport(main)}
                  </span>
                </div>

                {/* Corps */}
                <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {getDate(main)}{main.city ? ` · ${main.city}` : ""}
                  </p>
                  <h3 style={{
                    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                    fontSize: "18px", color: "white",
                    letterSpacing: "-0.02em", lineHeight: 1.3,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {cleanTitle(main.title)}
                  </h3>
                  {/* Footer card — prix + voir */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "auto",
                  }}>
                    {isFree(main)
                      ? <span style={{ fontSize: "11px", fontWeight: 600, color: "#4ADE80", background: "rgba(74,222,128,0.12)", padding: "4px 10px", borderRadius: "50px" }}>Gratuit</span>
                      : <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B1A", background: "rgba(255,107,26,0.12)", padding: "4px 10px", borderRadius: "50px" }}>{getPrice(main)}</span>
                    }
                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#FF6B1A" }}>Voir →</span>
                  </div>
                </div>
              </button>
            )}

            {/* Petites cards */}
            {rest.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {rest.map((e: any) => (
                  <button
                    key={e.id}
                    onClick={() => navigate(`/events/${e.id}`)}
                    style={{
                      borderRadius: "12px", overflow: "hidden",
                      background: "#1E1E1E",
                      border: "1.5px solid rgba(255,255,255,0.08)",
                      flex: 1, display: "flex", flexDirection: "column",
                      cursor: "pointer", textAlign: "left", padding: 0,
                      transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), border-color 0.15s",
                    }}
                    onMouseEnter={el => {
                      el.currentTarget.style.transform = "translateY(-3px)";
                      el.currentTarget.style.borderColor = "rgba(255,107,26,0.5)";
                      const img = el.currentTarget.querySelector("img") as HTMLImageElement;
                      if (img) img.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={el => {
                      el.currentTarget.style.transform = "none";
                      el.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      const img = el.currentTarget.querySelector("img") as HTMLImageElement;
                      if (img) img.style.transform = "none";
                    }}
                  >
                    {/* Image */}
                    <div style={{ height: "110px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      <img
                        src={getImage(e)}
                        alt={cleanTitle(e.title)}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
                      />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)" }} />
                      <span style={{
                        position: "absolute", top: "8px", left: "10px",
                        background: "#FF6B1A", color: "white",
                        fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em",
                        textTransform: "uppercase", padding: "3px 8px", borderRadius: "50px",
                      }}>
                        {getSport(e)}
                      </span>
                    </div>

                    {/* Corps */}
                    <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                      <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        {getDate(e)}{e.city ? ` · ${e.city}` : ""}
                      </p>
                      <h3 style={{
                        fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                        fontSize: "13px", color: "white",
                        letterSpacing: "-0.01em", lineHeight: 1.35,
                        display: "-webkit-box", WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {cleanTitle(e.title)}
                      </h3>
                      {/* Footer */}
                      <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", marginTop: "auto",
                      }}>
                        {isFree(e)
                          ? <span style={{ fontSize: "10px", fontWeight: 600, color: "#4ADE80", background: "rgba(74,222,128,0.12)", padding: "3px 8px", borderRadius: "50px" }}>Gratuit</span>
                          : <span style={{ fontSize: "10px", fontWeight: 600, color: "#FF6B1A", background: "rgba(255,107,26,0.12)", padding: "3px 8px", borderRadius: "50px" }}>{getPrice(e)}</span>
                        }
                        <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B1A" }}>Voir →</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .featured-grid-inner { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};
