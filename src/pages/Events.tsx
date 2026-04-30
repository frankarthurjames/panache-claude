import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";

const SORT_OPTIONS = [
  { label: "Date (proche)", value: "date_asc" },
  { label: "Date (lointaine)", value: "date_desc" },
  { label: "Gratuit d'abord", value: "price_asc" },
];

const Events = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  useReveal(200);

  const [events, setEvents] = useState<any[]>([]);
  const [sports, setSports] = useState<{ name: string; slug: string }[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filtres
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [activeSport, setActiveSport] = useState(searchParams.get("sport") || "");
  const [activeRegion, setActiveRegion] = useState(searchParams.get("region") || "");
  const [activeSort, setActiveSort] = useState("date_asc");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // Fetch sports
  useEffect(() => {
    supabase
      .from("sports" as any)
      .select("name, slug")
      .order("name")
      .then(({ data }) => { if (data) setSports(data as any); });
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("events")
        .select(`
          id, title, starts_at, city, region, images,
          ticket_types(price_cents),
          sports(name, slug)
        `, { count: "exact" })
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString());

      if (activeSport) query = query.eq("sports.slug", activeSport);
      if (activeRegion) query = query.eq("region", activeRegion);
      if (search) query = query.ilike("title", `%${search}%`);

      if (activeSort === "date_asc")  query = query.order("starts_at", { ascending: true });
      if (activeSort === "date_desc") query = query.order("starts_at", { ascending: false });
      if (activeSort === "price_asc") query = query.order("starts_at", { ascending: true });

      query = query.limit(48);

      const { data, count } = await query;
      let result = data || [];

      // Tri prix côté client
      if (activeSort === "price_asc") {
        result = result.sort((a: any, b: any) => {
          const pa = a.ticket_types?.length ? Math.min(...a.ticket_types.map((t: any) => t.price_cents)) : 0;
          const pb = b.ticket_types?.length ? Math.min(...b.ticket_types.map((t: any) => t.price_cents)) : 0;
          return pa - pb;
        });
      }

      setEvents(result);
      setTotal(count || 0);

      // Extraire régions uniques
      const r = [...new Set((data || []).map((e: any) => e.region).filter(Boolean))].sort();
      setRegions(r as string[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeSport, activeRegion, search, activeSort]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const clearFilters = () => {
    setSearch("");
    setActiveSport("");
    setActiveRegion("");
    setActiveSort("date_asc");
    setSearchParams({});
  };

  const hasFilters = search || activeSport || activeRegion;

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <SEO
        title="Tous les événements sportifs — Panache"
        description="Découvrez et réservez vos billets pour tous les événements sportifs en France."
      />
      <Navbar />

      {/* ── HERO ── */}
      <div style={{
        position: "relative",
        height: "280px",
        overflow: "hidden",
        background: "#0A0A0A",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1800&q=90')",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          opacity: 0.45,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)",
        }} />
        <div style={{
          position: "relative", zIndex: 10,
          height: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "20px",
        }}>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 4vw, 52px)",
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.06,
            margin: 0,
          }}>
            Tous les événements
          </h1>

          {/* Barre de recherche */}
          <div style={{
            display: "flex",
            gap: "10px",
            maxWidth: "640px",
          }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16}
                color="#6B6B6B"
                style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", zIndex: 2 }}
              />
              <input
                type="text"
                placeholder="Rechercher un événement, un sport, une ville..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") fetchEvents(); }}
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "44px",
                  paddingRight: "16px",
                  borderRadius: "12px",
                  border: "none",
                  background: "white",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#141414",
                  outline: "none",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
              />
            </div>
            <button
              onClick={() => fetchEvents()}
              style={{
                height: "48px",
                padding: "0 24px",
                background: "#FF6B1A",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.15s",
                whiteSpace: "nowrap",
                minHeight: "auto",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#E85A0C")}
              onMouseLeave={e => (e.currentTarget.style.background = "#FF6B1A")}
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTRES ── */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #E8E5DF",
        position: "sticky",
        top: "64px",
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          height: "56px",
          overflowX: "auto",
        }}
          className="scrollbar-hide"
        >
          {/* Bouton filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              height: "36px", padding: "0 14px",
              borderRadius: "50px",
              border: `1.5px solid ${showFilters ? "#FF6B1A" : "#E8E5DF"}`,
              background: showFilters ? "#FFF2EB" : "white",
              color: showFilters ? "#FF6B1A" : "#141414",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", fontWeight: 600,
              cursor: "pointer", flexShrink: 0,
              transition: "all 0.15s",
              minHeight: "auto",
            }}
          >
            <SlidersHorizontal size={14} />
            Filtres
            {hasFilters && (
              <span style={{
                background: "#FF6B1A", color: "white",
                borderRadius: "50%", width: "16px", height: "16px",
                fontSize: "10px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {[search, activeSport, activeRegion].filter(Boolean).length}
              </span>
            )}
          </button>

          <div style={{ width: "1px", height: "24px", background: "#E8E5DF", flexShrink: 0 }} />

          {/* Pills sports */}
          <button
            onClick={() => setActiveSport("")}
            style={{
              height: "36px", padding: "0 14px",
              borderRadius: "50px",
              border: `1.5px solid ${!activeSport ? "#FF6B1A" : "#E8E5DF"}`,
              background: !activeSport ? "#FF6B1A" : "white",
              color: !activeSport ? "white" : "#141414",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px", fontWeight: 500,
              cursor: "pointer", flexShrink: 0,
              transition: "all 0.15s", minHeight: "auto",
            }}
          >
            Tous
          </button>

          {sports.map(sport => (
            <button
              key={sport.slug}
              onClick={() => setActiveSport(activeSport === sport.slug ? "" : sport.slug)}
              style={{
                height: "36px", padding: "0 14px",
                borderRadius: "50px",
                border: `1.5px solid ${activeSport === sport.slug ? "#FF6B1A" : "#E8E5DF"}`,
                background: activeSport === sport.slug ? "#FF6B1A" : "white",
                color: activeSport === sport.slug ? "white" : "#141414",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: 500,
                cursor: "pointer", flexShrink: 0,
                transition: "all 0.15s", minHeight: "auto",
              }}
            >
              {sport.name}
            </button>
          ))}

          {/* Tri */}
          <div style={{ marginLeft: "auto", position: "relative", flexShrink: 0 }}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              style={{
                height: "36px", padding: "0 14px",
                borderRadius: "50px",
                border: "1.5px solid #E8E5DF",
                background: "white",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px", fontWeight: 500,
                color: "#141414",
                cursor: "pointer", minHeight: "auto",
                transition: "border-color 0.15s",
              }}
            >
              {SORT_OPTIONS.find(s => s.value === activeSort)?.label} ↕
            </button>
            {sortOpen && (
              <div style={{
                position: "absolute", top: "42px", right: 0,
                background: "white", borderRadius: "12px",
                border: "1.5px solid #E8E5DF",
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                overflow: "hidden", minWidth: "180px", zIndex: 200,
              }}>
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setActiveSort(opt.value); setSortOpen(false); }}
                    style={{
                      display: "block", width: "100%",
                      padding: "12px 16px", textAlign: "left",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: activeSort === opt.value ? 600 : 400,
                      color: activeSort === opt.value ? "#FF6B1A" : "#141414",
                      background: activeSort === opt.value ? "#FFF2EB" : "white",
                      border: "none", cursor: "pointer", minHeight: "auto",
                      transition: "background 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panneau filtres avancés */}
        {showFilters && (
          <div style={{
            borderTop: "1px solid #E8E5DF",
            background: "#FAF8F5",
            padding: "16px 40px",
          }}>
            <div style={{
              maxWidth: "1200px", margin: "0 auto",
              display: "flex", gap: "24px", alignItems: "flex-start",
              flexWrap: "wrap",
            }}>
              {/* Région */}
              <div>
                <p style={{
                  fontSize: "11px", fontWeight: 700,
                  letterSpacing: "1.5px", textTransform: "uppercase",
                  color: "#6B6B6B", marginBottom: "10px",
                }}>
                  Région
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  <button
                    onClick={() => setActiveRegion("")}
                    style={{
                      height: "32px", padding: "0 12px",
                      borderRadius: "50px",
                      border: `1.5px solid ${!activeRegion ? "#FF6B1A" : "#E8E5DF"}`,
                      background: !activeRegion ? "#FF6B1A" : "white",
                      color: !activeRegion ? "white" : "#141414",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px", fontWeight: 500,
                      cursor: "pointer", minHeight: "auto",
                    }}
                  >
                    Toutes
                  </button>
                  {regions.map(r => (
                    <button
                      key={r}
                      onClick={() => setActiveRegion(activeRegion === r ? "" : r)}
                      style={{
                        height: "32px", padding: "0 12px",
                        borderRadius: "50px",
                        border: `1.5px solid ${activeRegion === r ? "#FF6B1A" : "#E8E5DF"}`,
                        background: activeRegion === r ? "#FF6B1A" : "white",
                        color: activeRegion === r ? "white" : "#141414",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px", fontWeight: 500,
                        cursor: "pointer", minHeight: "auto",
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    marginLeft: "auto", alignSelf: "flex-end",
                    display: "flex", alignItems: "center", gap: "6px",
                    height: "32px", padding: "0 12px",
                    borderRadius: "50px",
                    border: "1.5px solid #E8E5DF",
                    background: "white",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px", fontWeight: 600,
                    color: "#6B6B6B",
                    cursor: "pointer", minHeight: "auto",
                  }}
                >
                  <X size={12} />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── CONTENU ── */}
      <main style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 40px 80px",
      }}>
        {/* Compteur + filtres actifs */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px", flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px", color: "#6B6B6B",
          }}>
            {loading ? "Chargement..." : (
              <>
                <span style={{ fontWeight: 600, color: "#141414" }}>{total}</span>
                {" "}événement{total > 1 ? "s" : ""}
                {activeSport && <span> · <span style={{ color: "#FF6B1A" }}>{sports.find(s => s.slug === activeSport)?.name}</span></span>}
                {activeRegion && <span> · <span style={{ color: "#FF6B1A" }}>{activeRegion}</span></span>}
              </>
            )}
          </p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "13px", fontWeight: 600, color: "#6B6B6B",
                background: "none", border: "none",
                cursor: "pointer", minHeight: "auto",
                textDecoration: "underline",
              }}
            >
              <X size={12} />
              Effacer les filtres
            </button>
          )}
        </div>

        {/* Grille */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "18px", fontWeight: 600, color: "#141414", marginBottom: "8px" }}>
              Aucun événement trouvé
            </p>
            <p style={{ fontSize: "14px", color: "#6B6B6B", marginBottom: "24px" }}>
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <button
              onClick={clearFilters}
              style={{
                background: "#FF6B1A", color: "white",
                border: "none", borderRadius: "50px",
                padding: "12px 28px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Voir tous les événements
            </button>
          </div>
        ) : (
          <div
            className="events-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
            }}
          >
            {events.map((event: any, idx) => {
              const image = event.images?.length > 0 ? event.images[0] : FALLBACK;
              const minPrice = event.ticket_types?.length > 0
                ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
                : 0;
              const isFree = minPrice === 0;
              const priceDisplay = isFree
                ? "Gratuit"
                : `À partir de ${(minPrice / 100).toFixed(0)}€`;
              const sport = event.sports?.name || "";
              const dateStr = format(new Date(event.starts_at), "d MMM yyyy", { locale: fr });
              const city = event.city || event.region || "";

              return (
                <div key={event.id} className={`reveal reveal-d${(idx % 3) + 1}`}>
                  <EventCard
                    id={event.id}
                    title={event.title}
                    date={dateStr}
                    location={city}
                    image={image}
                    tag={sport}
                    price={priceDisplay}
                    isFree={isFree}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 960px) {
          .events-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .events-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Events;
