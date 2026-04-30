import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";

export const LatestActivities = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from("events")
          .select(`id, title, starts_at, city, venue, images, ticket_types(price_cents), sports(name)`)
          .eq("status", "published")
          .eq("is_featured", false)
          .gte("starts_at", new Date().toISOString())
          .order("starts_at", { ascending: true })
          .limit(6);
        if (error) throw error;
        setActivities(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) return (
    <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
      </div>
    </section>
  );

  if (activities.length === 0) return null;

  return (
    <section style={{ padding: "80px 0", background: "#FAF8F5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>

        <div
          className="reveal"
          style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "36px" }}
        >
          <div>
            <span className="eyebrow">À ne pas manquer</span>
            <h2 className="sec-title">Événements à venir</h2>
          </div>
          <Link
            to="/events"
            style={{
              fontSize: "13px", fontWeight: 600, color: "#FF6B1A",
              textDecoration: "none", borderBottom: "1.5px solid #FF6B1A",
              paddingBottom: "1px", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Voir tout →
          </Link>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}
          className="ev-grid-responsive"
        >
          {activities.map((activity: any, idx) => {
            const imageUrl = activity.images?.length > 0 ? activity.images[0] : FALLBACK;
            const minPrice = activity.ticket_types?.length > 0
              ? Math.min(...activity.ticket_types.map((t: any) => t.price_cents))
              : 0;
            const isFree = minPrice === 0;
            const priceDisplay = isFree ? "Gratuit" : `À partir de ${(minPrice / 100).toFixed(0)}€`;
            const sport = (activity.sports?.name || "Sport").toUpperCase();
            const dateStr = format(new Date(activity.starts_at), "d MMM yyyy", { locale: fr });
            const city = activity.city || activity.venue || "";
            const cleanTitle = activity.title.replace(/^\[.*?\]\s*/, "");

            return (
              <button
                key={activity.id}
                className="reveal"
                onClick={() => navigate(`/events/${activity.id}`)}
                style={{
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1.5px solid #E8E5DF",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  padding: 0,
                  transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 14px 40px rgba(0,0,0,0.10)";
                  e.currentTarget.style.borderColor = "rgba(255,107,26,0.22)";
                  const img = e.currentTarget.querySelector("img") as HTMLImageElement;
                  if (img) img.style.transform = "scale(1.05)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)";
                  e.currentTarget.style.borderColor = "#E8E5DF";
                  const img = e.currentTarget.querySelector("img") as HTMLImageElement;
                  if (img) img.style.transform = "none";
                }}
              >
                <div style={{ height: "160px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  <img
                    src={imageUrl}
                    alt={cleanTitle}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)" }}
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.28) 0%, transparent 55%)" }} />
                  <span style={{
                    position: "absolute", top: "12px", left: "12px", zIndex: 2,
                    background: "rgba(255,255,255,0.94)", backdropFilter: "blur(6px)",
                    color: "#141414", fontSize: "9px", fontWeight: 700,
                    letterSpacing: "0.8px", textTransform: "uppercase",
                    padding: "4px 10px", borderRadius: "50px",
                  }}>
                    {sport}
                  </span>
                </div>

                <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", flex: 1, gap: "8px" }}>
                  <h3 style={{
                    fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                    fontSize: "15px", color: "#141414",
                    lineHeight: 1.3, letterSpacing: "-0.02em",
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {cleanTitle}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span style={{ fontSize: "11px", color: "#6B6B6B" }}>{dateStr}</span>
                    {city && <span style={{ fontSize: "11px", color: "#6B6B6B" }}>{city}</span>}
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: "12px", borderTop: "1px solid #E8E5DF", marginTop: "auto",
                  }}>
                    <span style={{
                      fontSize: "10px", fontWeight: isFree ? 600 : 700,
                      color: isFree ? "#166534" : "#9A3412",
                      background: isFree ? "#DCFCE7" : "#FFF2EB",
                      padding: "4px 10px", borderRadius: "50px",
                    }}>
                      {priceDisplay}
                    </span>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#FF6B1A" }}>
                      Voir →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: "40px", display: "flex", justifyContent: "center" }}>
          <Link
            to="/events"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px", fontWeight: 600, color: "#141414",
              border: "1.5px solid #E8E5DF", borderRadius: "50px",
              padding: "12px 28px", textDecoration: "none",
              transition: "border-color 0.15s, color 0.15s", display: "inline-block",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "#FF6B1A";
              e.currentTarget.style.color = "#FF6B1A";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "#E8E5DF";
              e.currentTarget.style.color = "#141414";
            }}
          >
            Voir tous les événements
          </Link>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) { .ev-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 640px) { .ev-grid-responsive { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
};
