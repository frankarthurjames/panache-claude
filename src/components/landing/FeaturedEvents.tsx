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
    const fetch = async () => {
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
    fetch();
  }, []);

  if (loading) return (
    <section className="bg-[#0A0A0A] py-14 flex justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
    </section>
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
    <section className="bg-[#0A0A0A] py-14 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="flex items-baseline justify-between mb-8">
          <h2
            className="font-poppins font-extrabold text-white tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
          >
            À la une
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Grande card gauche — 3/5 */}
          {main && (
            <button
              onClick={() => navigate(`/events/${main.id}`)}
              className="lg:col-span-3 group rounded-2xl overflow-hidden bg-[#141414] border border-white/10 text-left flex flex-col"
            >
              <div className="relative w-full overflow-hidden" style={{ height: "280px" }}>
                <img
                  src={getImage(main)}
                  alt={cleanTitle(main.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-full">
                    {getSport(main)}
                  </span>
                  {isFree(main) && (
                    <span className="bg-[#16A34A] text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                      Gratuit
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1">
                <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">
                  {getDate(main)}{main.city ? ` · ${main.city}` : ""}
                </p>
                <h3
                  className="font-poppins font-bold text-white leading-tight tracking-[-0.02em] line-clamp-2"
                  style={{ fontSize: "clamp(1.1rem, 2vw, 1.5rem)" }}
                >
                  {cleanTitle(main.title)}
                </h3>
                {getPrice(main) && (
                  <p className="mt-3 text-[#F97316] font-semibold text-sm">
                    {getPrice(main)}
                  </p>
                )}
              </div>
            </button>
          )}

          {/* 2 petites cards droite — 2/5 */}
          {rest.length > 0 && (
            <div className="lg:col-span-2 flex flex-col gap-4">
              {rest.map((e: any) => (
                <button
                  key={e.id}
                  onClick={() => navigate(`/events/${e.id}`)}
                  className="group rounded-2xl overflow-hidden bg-[#141414] border border-white/10 text-left flex flex-col flex-1"
                >
                  <div className="relative w-full overflow-hidden" style={{ height: "130px" }}>
                    <img
                      src={getImage(e)}
                      alt={cleanTitle(e.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="bg-[#F97316] text-white text-[9px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full">
                        {getSport(e)}
                      </span>
                      {isFree(e) && (
                        <span className="bg-[#16A34A] text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                          Gratuit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider mb-1.5">
                      {getDate(e)}{e.city ? ` · ${e.city}` : ""}
                    </p>
                    <h3 className="font-poppins font-bold text-white text-sm leading-tight tracking-[-0.01em] line-clamp-2">
                      {cleanTitle(e.title)}
                    </h3>
                    {getPrice(e) && (
                      <p className="mt-2 text-[#F97316] font-semibold text-xs">
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
