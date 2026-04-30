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
        console.error("Error fetching featured events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  if (loading) return (
    <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "center" }}>
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
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>

        <div className="reveal" style={{ marginBottom: "28px" }}>
          <span className="eyebrow">Sélection éditoriale</span>
          <h2 className="sec-title">À la une</h2>
        </div>

        <div
          className="reveal"
          style={{ background: "#141414", borderRadius: "20px", padding: "28px" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: "14px" }}>

            {/* Grande card */}
            {main && (
              <button
                onClick={() => navigate(`/events/${main.id}`)}
                style={{
                  borderRadius: "14px", overflow: "hidden",
                  background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", flexDirection: "column",
                  cursor: "pointer", textAlign: "left", padding: 0,
                  transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "none")}
              >
                <div style={{ height: "240px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={getImage(main)}
                    alt={cleanTitle(main.title)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)", display: "block" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "none")}
                  />
                  <div className="overlay-featured" style={{ position: "absolute", inset: 0 }} />
                  <span
                    className="sport-chip"
                    style={{ position: "absolute", top: "12px", left: "12px", background: "#FF6B1A", color: "white" }}
                  >
                    {getSport(main)}
                  </span>
                </div>
                <div style={{ padding: "18px 20px", flex: 1 }}>
                  <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "6px" }}>
                    {getDate(main)}{main.city ? ` · ${main.city}` : ""}
                  </p>
                  <h3
                    style={{
                      fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                      fontSize: "17px", color: "white",
                      letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: "8px",
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}
                  >
                    {cleanTitle(main.title)}
                  </h3>
                  {isFree(main)
                    ? <span style={{ fontSize: "11px", fontWeight: 600, color: "#4ADE80" }}>Gratuit</span>
                    : getPrice(main) && <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B1A" }}>{getPrice(main)}</span>
                  }
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
                      background: "#1E1E1E", border: "1px solid rgba(255,255,255,0.08)",
                      flex: 1, display: "flex", flexDirection: "column",
                      cursor: "pointer", textAlign: "left", padding: 0,
                      transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1)",
                    }}
                    onMouseEnter={el => (el.currentTarget.style.transform = "translateY(-3px)")}
                    onMouseLeave={el => (el.currentTarget.style.transform = "none")}
                  >
                    <div style={{ height: "120px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                      <img
                        src={getImage(e)}
                        alt={cleanTitle(e.title)}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <div className="overlay-featured" style={{ position: "absolute", inset: 0 }} />
                      <span
                        className="sport-chip"
                        style={{
                          position: "absolute", top: "10px", left: "10px",
                          background: "#FF6B1A", color: "white",
                          fontSize: "8px", padding: "3px 8px",
                        }}
                      >
                        {getSport(e)}
                      </span>
                    </div>
                    <div style={{ padding: "14px 16px", flex: 1 }}>
                      <p style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "5px" }}>
                        {getDate(e)}{e.city ? ` · ${e.city}` : ""}
                      </p>
                      <h3
                        style={{
                          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                          fontSize: "13px", color: "white",
                          letterSpacing: "-0.01em", lineHeight: 1.35,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}
                      >
                        {cleanTitle(e.title)}
                      </h3>
                      {isFree(e)
                        ? <span style={{ fontSize: "10px", fontWeight: 600, color: "#4ADE80", marginTop: "4px", display: "block" }}>Gratuit</span>
                        : getPrice(e) && <span style={{ fontSize: "10px", fontWeight: 600, color: "#FF6B1A", marginTop: "4px", display: "block" }}>{getPrice(e)}</span>
                      }
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
