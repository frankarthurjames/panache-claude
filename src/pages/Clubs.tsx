import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ClubCard } from "@/components/ClubCard";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface Club {
  id: string;
  name: string;
  category: string;
  address: string | null;
  logo_url: string | null;
  eventCount?: number;
}

const SORTS = ["Nom", "Ville"];

const Clubs = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("Nom");
  const [sortOpen, setSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id, name, address, logo_url");
        if (error) throw error;

        const { data: eventsData } = await supabase
          .from("events")
          .select("organization_id")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString());

        const counts: Record<string, number> = {};
        for (const e of eventsData || []) {
          if (e.organization_id) counts[e.organization_id] = (counts[e.organization_id] || 0) + 1;
        }

        const result = (data || []).map(org => ({
          ...org,
          category: "Club",
          eventCount: counts[org.id] || 0,
        }));

        setClubs(result);
      } catch (err) {
        console.error("Error fetching clubs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClubs();
  }, []);

  const displayed = clubs
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.address || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "Nom") return a.name.localeCompare(b.name);
      if (sortBy === "Ville") return (a.address || "").localeCompare(b.address || "");
      return 0;
    });

  return (
    <div style={{ minHeight: "100vh", background: "#FAF8F5" }}>
      <SEO
        title="Clubs sportifs — Panache"
        description="Découvrez tous les clubs sportifs inscrits sur Panache."
      />
      <Navbar />

      {/* Hero section */}
      <div style={{ background: "#FFFFFF", paddingBottom: "0" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 40px 40px" }}>
          <span className="eyebrow">Nos partenaires</span>
          <h1 style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(32px, 4vw, 52px)",
            color: "#141414",
            letterSpacing: "-0.03em",
            lineHeight: 1.06,
            marginBottom: "32px",
          }}>
            Tous les clubs
          </h1>

          {/* Barre de recherche + tri */}
          <div style={{
            display: "flex",
            gap: "12px",
            alignItems: "center",
            flexWrap: "wrap",
          }}>
            {/* Search */}
            <div style={{ position: "relative", flex: "1", minWidth: "240px", maxWidth: "480px" }}>
              <Search
                size={16}
                color="#6B6B6B"
                style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Rechercher un club, une ville..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: "48px",
                  paddingLeft: "44px",
                  paddingRight: "16px",
                  borderRadius: "50px",
                  border: "1.5px solid #E8E5DF",
                  background: "white",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#141414",
                  outline: "none",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#FF6B1A")}
                onBlur={e => (e.currentTarget.style.borderColor = "#E8E5DF")}
              />
            </div>

            {/* Tri */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                style={{
                  height: "48px",
                  padding: "0 20px",
                  borderRadius: "50px",
                  border: "1.5px solid #E8E5DF",
                  background: "white",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#141414",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = "#FF6B1A")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "#E8E5DF")}
              >
                Trier : {sortBy}
                <ChevronDown size={14} />
              </button>
              {sortOpen && (
                <div style={{
                  position: "absolute", top: "52px", right: 0, zIndex: 50,
                  background: "white", borderRadius: "12px",
                  border: "1.5px solid #E8E5DF",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  overflow: "hidden", minWidth: "140px",
                }}>
                  {SORTS.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSortBy(s); setSortOpen(false); }}
                      style={{
                        display: "block", width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "13px",
                        fontWeight: sortBy === s ? 600 : 400,
                        color: sortBy === s ? "#FF6B1A" : "#141414",
                        background: sortBy === s ? "#FFF2EB" : "white",
                        border: "none", cursor: "pointer",
                        transition: "background 0.15s",
                        minHeight: "auto",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Compteur */}
            <span style={{ fontSize: "13px", color: "#6B6B6B", marginLeft: "4px" }}>
              {displayed.length} club{displayed.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Grille clubs */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 40px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#6B6B6B" }}>
            <p style={{ fontSize: "16px", marginBottom: "8px" }}>Aucun club trouvé.</p>
            <button
              onClick={() => setSearchQuery("")}
              style={{
                fontSize: "13px", fontWeight: 600,
                color: "#FF6B1A", background: "none",
                border: "none", cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
            className="clubs-grid"
          >
            {displayed.map(club => (
              <ClubCard
                key={club.id}
                id={club.id}
                name={club.name}
                category={club.category}
                location={club.address || undefined}
                logo={club.logo_url || undefined}
                eventCount={club.eventCount}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        @media (max-width: 960px) {
          .clubs-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 600px) {
          .clubs-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Clubs;
