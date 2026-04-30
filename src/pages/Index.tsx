import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { FeaturedEvents } from "@/components/landing/FeaturedEvents";
import { LatestActivities } from "@/components/landing/LatestActivities";
import { SportsSpotlight } from "@/components/landing/SportsSpotlight";
import { RegionsGrid } from "@/components/landing/RegionsGrid";
import { MonthlyCalendar } from "@/components/landing/MonthlyCalendar";
import { supabase } from "@/integrations/supabase/client";
import { REGIONS } from "@/data/regions";
import { Search } from "lucide-react";

const QUICK_SPORTS = ["Triathlon", "Trail", "Football", "Cyclisme", "Natation"];

const useReveal = () => {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
};

const Hero = () => {
  const navigate = useNavigate();
  const [sport, setSport] = useState("");
  const [region, setRegion] = useState("");
  const [when, setWhen] = useState("");
  const [sports, setSports] = useState<{ name: string; slug: string }[]>([]);
  const [activePanel, setActivePanel] = useState<"sport" | "region" | "when" | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase
      .from("sports" as any)
      .select("name, slug")
      .order("name")
      .then(({ data }) => { if (data) setSports(data as any); });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const goSearch = () => {
    const params = new URLSearchParams();
    if (sport) params.append("sport", sport);
    if (region) params.append("region", region);
    if (when === "Ce week-end") {
      const now = new Date();
      const daysToFriday = now.getDay() <= 5 ? 5 - now.getDay() : 6;
      const friday = new Date(now);
      friday.setDate(now.getDate() + daysToFriday);
      params.append("date_start", friday.toISOString().slice(0, 10));
    } else if (when === "Ce mois") {
      params.append("month", new Date().toISOString().slice(0, 7));
    }
    navigate(params.toString() ? `/events?${params}` : "/events");
  };

  const sportLabel = sport
    ? sports.find((s) => s.slug === sport)?.name ?? "Tous les sports"
    : "Tous les sports";
  const regionLabel = region || "Partout en France";
  const whenLabel   = when   || "Peu importe";

  return (
    <header
      style={{
        position: "relative",
        height: "calc(100vh - 60px)",
        minHeight: "520px",
        maxHeight: "800px",
        overflow: "hidden",
      }}
    >
      <div
        className="animate-hero-zoom"
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1800&q=90')",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      />

      <div className="overlay-hero" style={{ position: "absolute", inset: 0 }} />

      <div
        style={{
          position: "relative", zIndex: 10,
          height: "100%",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 24px 60px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 5.5vw, 72px)",
            color: "white",
            lineHeight: 1.06,
            letterSpacing: "-0.03em",
            marginBottom: "28px",
            maxWidth: "860px",
          }}
        >
          Les événements sportifs<br />
          <span style={{ color: "#FF6B1A" }}>près de chez vous.</span>
        </h1>

        <div ref={panelRef} style={{ width: "100%", maxWidth: "680px" }}>
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)",
            }}
          >
            {/* Champ Sport */}
            <button
              onClick={() => setActivePanel(activePanel === "sport" ? null : "sport")}
              style={{
                padding: "16px 22px",
                textAlign: "left",
                background: activePanel === "sport" ? "#FAF8F5" : "white",
                border: "none",
                borderRight: "1.5px solid #EEEBE6",
                cursor: "pointer",
                transition: "background 0.15s",
                minHeight: "auto",
              }}
            >
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "5px" }}>
                Sport
              </div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: sport ? "#141414" : "#BDBDBD" }}>
                {sportLabel}
              </div>
            </button>

            {/* Champ Région */}
            <button
              onClick={() => setActivePanel(activePanel === "region" ? null : "region")}
              style={{
                padding: "16px 22px",
                textAlign: "left",
                background: activePanel === "region" ? "#FAF8F5" : "white",
                border: "none",
                borderRight: "1.5px solid #EEEBE6",
                cursor: "pointer",
                transition: "background 0.15s",
                minHeight: "auto",
              }}
            >
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "5px" }}>
                Région
              </div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: region ? "#141414" : "#BDBDBD" }}>
                {regionLabel}
              </div>
            </button>

            {/* Champ Quand */}
            <button
              onClick={() => setActivePanel(activePanel === "when" ? null : "when")}
              style={{
                padding: "16px 22px",
                textAlign: "left",
                background: activePanel === "when" ? "#FAF8F5" : "white",
                border: "none",
                cursor: "pointer",
                transition: "background 0.15s",
                minHeight: "auto",
              }}
            >
              <div style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "#6B6B6B", marginBottom: "5px" }}>
                Quand
              </div>
              <div style={{ fontSize: "14px", fontWeight: 500, color: when ? "#141414" : "#BDBDBD" }}>
                {whenLabel}
              </div>
            </button>

            {/* Bouton rechercher */}
            <button
              onClick={goSearch}
              style={{
                background: "#FF6B1A",
                color: "white",
                border: "none",
                padding: "0 26px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                transition: "background 0.15s",
                whiteSpace: "nowrap",
                minHeight: "auto",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#E85A0C")}
              onMouseLeave={e => (e.currentTarget.style.background = "#FF6B1A")}
            >
              <Search size={14} />
              Rechercher
            </button>
          </div>

          {/* Panneau Sport */}
          {activePanel === "sport" && (
            <div style={{
              background: "white", borderRadius: "14px", marginTop: "8px",
              padding: "16px", maxHeight: "200px", overflowY: "auto",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <button
                  onClick={() => { setSport(""); setActivePanel(null); }}
                  style={{
                    textAlign: "left", padding: "8px 12px", borderRadius: "8px",
                    fontSize: "13px", border: "none", cursor: "pointer",
                    background: !sport ? "#FF6B1A" : "transparent",
                    color: !sport ? "white" : "#141414",
                    fontWeight: !sport ? 600 : 400,
                    transition: "background 0.15s", minHeight: "auto",
                  }}
                >
                  Tous les sports
                </button>
                {sports.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => { setSport(s.slug); setActivePanel(null); }}
                    style={{
                      textAlign: "left", padding: "8px 12px", borderRadius: "8px",
                      fontSize: "13px", border: "none", cursor: "pointer",
                      background: sport === s.slug ? "#FF6B1A" : "transparent",
                      color: sport === s.slug ? "white" : "#141414",
                      fontWeight: sport === s.slug ? 600 : 400,
                      transition: "background 0.15s", minHeight: "auto",
                    }}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Panneau Région */}
          {activePanel === "region" && (
            <div style={{
              background: "white", borderRadius: "14px", marginTop: "8px",
              padding: "16px", maxHeight: "200px", overflowY: "auto",
              boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <button
                  onClick={() => { setRegion(""); setActivePanel(null); }}
                  style={{
                    textAlign: "left", padding: "8px 12px", borderRadius: "8px",
                    fontSize: "13px", border: "none", cursor: "pointer",
                    background: !region ? "#FF6B1A" : "transparent",
                    color: !region ? "white" : "#141414",
                    fontWeight: !region ? 600 : 400,
                    transition: "background 0.15s", minHeight: "auto",
                  }}
                >
                  Toutes les régions
                </button>
                {REGIONS.map((r) => (
                  <button
                    key={r.name}
                    onClick={() => { setRegion(r.name); setActivePanel(null); }}
                    style={{
                      textAlign: "left", padding: "8px 12px", borderRadius: "8px",
                      fontSize: "13px", border: "none", cursor: "pointer",
                      background: region === r.name ? "#FF6B1A" : "transparent",
                      color: region === r.name ? "white" : "#141414",
                      fontWeight: region === r.name ? 600 : 400,
                      transition: "background 0.15s", minHeight: "auto",
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Panneau Quand */}
          {activePanel === "when" && (
            <div style={{
              background: "white", borderRadius: "14px", marginTop: "8px",
              padding: "16px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                {["Ce week-end", "Ce mois", "Dans 3 mois", "Cette année"].map((label) => (
                  <button
                    key={label}
                    onClick={() => { setWhen(when === label ? "" : label); setActivePanel(null); }}
                    style={{
                      textAlign: "left", padding: "8px 12px", borderRadius: "8px",
                      fontSize: "13px", border: "none", cursor: "pointer",
                      background: when === label ? "#FF6B1A" : "transparent",
                      color: when === label ? "white" : "#141414",
                      fontWeight: when === label ? 600 : 400,
                      transition: "background 0.15s", minHeight: "auto",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags rapides */}
        <div style={{ display: "flex", gap: "8px", marginTop: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          {QUICK_SPORTS.map((s) => (
            <button
              key={s}
              onClick={() => navigate(`/events?sport=${s.toLowerCase()}`)}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "rgba(255,255,255,0.85)",
                fontSize: "12px", fontWeight: 500,
                padding: "6px 16px", borderRadius: "50px",
                cursor: "pointer",
                transition: "background 0.15s, border-color 0.15s",
                minHeight: "auto",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(255,107,26,0.35)";
                e.currentTarget.style.borderColor = "#FF6B1A";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

const CtaBand = () => {
  const navigate = useNavigate();
  return (
    <section style={{ padding: "80px 0", background: "#FFFFFF" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 40px" }}>
        <div
          className="reveal"
          style={{
            background: "#141414",
            borderRadius: "20px",
            padding: "64px 56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 60% 80% at 85% 50%, rgba(255,107,26,0.12) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 10% 20%, rgba(255,107,26,0.06) 0%, transparent 70%)",
          }} />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,0.38)", marginBottom: "14px" }}>
              Vous organisez un événement ?
            </div>
            <h2
              style={{
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(28px, 3.5vw, 44px)",
                color: "white",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
              }}
            >
              Rejoignez les clubs<br />
              qui ont choisi{" "}
              <em style={{ fontStyle: "italic", color: "#FF6B1A" }}>Panache</em>
            </h2>
          </div>

          <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "16px", flexShrink: 0 }}>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, textAlign: "right", maxWidth: "280px" }}>
              Créez votre événement en quelques minutes et touchez des milliers de pratiquants sportifs partout en France.
            </p>
            <button
              onClick={() => navigate("/auth?tab=signup")}
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px", fontWeight: 600,
                color: "#FF6B1A", background: "white",
                border: "none", borderRadius: "50px",
                padding: "14px 28px",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                transition: "transform 0.15s, box-shadow 0.15s",
                whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: "8px",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.25)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.2)";
              }}
            >
              Créer votre événement →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  useReveal();

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <SEO
        title="Les événements sportifs près de chez vous"
        description="Découvrez et réservez vos billets pour tous les événements sportifs en France. 1000+ événements, 40+ clubs, billetterie sécurisée."
      />
      <Navbar />
      <Hero />
      <main>
        <FeaturedEvents />
        <LatestActivities />
        <SportsSpotlight />
        <RegionsGrid />
        <MonthlyCalendar />
        <CtaBand />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
