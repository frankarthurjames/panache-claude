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
    <div className="px-4 sm:px-6 lg:px-8 py-14">
      <div className="bg-[#0A0A0A] rounded-3xl flex justify-center py-14">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
      </div>
    </div>
  );

  if (events.length === 0) return null;

  const getImage = (e: any) => e.images?.length > 0 ? e.images[0] : FALLBACK;
  const getPrice = (e: any) => {
    if (!e.ticket_types?.length) return null;
    const min = Math.min(...e.ticket_types.map((t: any) => t.price_cents));
    return min === 0 ? "Gratuit" : `À partir de ${(min / 100).toFixed(0)}€`;
  };
  const getSport = (e: any) => (e.sports?.name || "Sport").toUpperCase();
  const getDate = (e: any) => format(new Date(e.starts_at), "d MMM yyyy", { locale: fr });
  const cleanTitle = (t: string) => t.replace(/^\[.*?\]\s*/, "");
  const isFree = (e: any) => !e.ticket_types?.length || Math.min(...e.ticket_types.map((t: any) => t.price_cents)) === 0;

  const [main, ...rest] = events;

  return (
    <section className="py-14 px-4 sm:px-6 lg:px-8">
      <div className="bg-[#0A0A0A] rounded-3xl p-8">

        <div className="flex items-baseline justify-between mb-8">
          <h2
            className="font-poppins font-extrabold text-white tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
          >
            À la une
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {main && (
            <button
              onClick={() => navigate(`/events/${main.id}`)}
              className="lg:col-span-3 group rounded-2xl overflow-hidden bg-[#141414] border border-white/10 text-left flex flex-col"
            >
              <div style={{ height: "280px", position: "relative", width: "100%", overflow: "hidden" }}>
                <img
                  src={getImage(main)}
                  alt={cleanTitle(main.title)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                  className="group-hover:scale-105"
                />
                <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px" }}>
                  <span style={{ background: "#F97316", color: "white", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 12px", borderRadius: "100px" }}>
                    {getSport(main)}
                  </span>
                  {isFree(main) && (
                    <span style={{ background: "#16A34A", color: "white", fontSize: "10px", fontWeight: 700, padding: "6px 12px", borderRadius: "100px" }}>
                      Gratuit
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1">
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
                  {getDate(main)}{main.city ? ` · ${main.city}` : ""}
                </p>
                <h3
                  className="font-poppins font-bold text-white leading-tight tracking-[-0.02em] line-clamp-2"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                >
                  {cleanTitle(main.title)}
                </h3>
                {getPrice(main) && (
                  <p style={{ marginTop: "12px", color: "#F97316", fontWeight: 600, fontSize: "14px" }}>
                    {getPrice(main)}
                  </p>
                )}
              </div>
            </button>
          )}

          {rest.length > 0 && (
            <div className="lg:col-span-2 flex flex-col gap-4">
              {rest.map((e: any) => (
                <button
                  key={e.id}
                  onClick={() => navigate(`/events/${e.id}`)}
                  className="group rounded-2xl overflow-hidden bg-[#141414] border border-white/10 text-left flex flex-col flex-1"
                >
                  <div style={{ height: "130px", position: "relative", width: "100%", overflow: "hidden" }}>
                    <img
                      src={getImage(e)}
                      alt={cleanTitle(e.title)}
                      style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
                      className="group-hover:scale-105"
                    />
                    <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
                      <span style={{ background: "#F97316", color: "white", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "100px" }}>
                        {getSport(e)}
                      </span>
                      {isFree(e) && (
                        <span style={{ background: "#16A34A", color: "white", fontSize: "9px", fontWeight: 700, padding: "4px 10px", borderRadius: "100px" }}>
                          Gratuit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
                      {getDate(e)}{e.city ? ` · ${e.city}` : ""}
                    </p>
                    <h3 className="font-poppins font-bold text-white text-sm leading-tight tracking-[-0.01em] line-clamp-2">
                      {cleanTitle(e.title)}
                    </h3>
                    {getPrice(e) && (
                      <p style={{ marginTop: "8px", color: "#F97316", fontWeight: 600, fontSize: "12px" }}>
                        {getPrice(e)}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
