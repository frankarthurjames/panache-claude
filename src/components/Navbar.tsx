import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(20px) saturate(1.8)",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.10)"
          : "1px solid rgba(0,0,0,0.07)",
        transition: "border-color 0.15s ease",
      }}>

        {/* ── Logo — toujours visible ── */}
        <Link to="/" style={{
          display: "flex", alignItems: "center",
          textDecoration: "none", flexShrink: 0,
        }}>
          <img
            src="/panachP.png"
            alt="Panache"
            style={{ height: "32px", width: "auto", display: "block" }}
          />
        </Link>

        {/* ── Nav desktop ── */}
        {!isMobile && (
          <ul style={{
            display: "flex", gap: "32px",
            listStyle: "none", margin: 0, padding: 0,
          }}>
            {[
              { label: "Événements", to: "/events" },
              { label: "Clubs",      to: "/clubs" },
              { label: "Calendrier", to: "/calendar" },
            ].map(({ label, to }) => (
              <li key={to}>
                <Link to={to} style={{
                  fontSize: "14px",
                  fontWeight: isActive(to) ? 600 : 500,
                  color: isActive(to) ? "#FF6B1A" : "#6B6B6B",
                  textDecoration: "none",
                  transition: "color 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/organisateurs" style={{
                fontSize: "14px", fontWeight: 600,
                color: "#FF6B1A", textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Pour les organisateurs
              </Link>
            </li>
          </ul>
        )}

        {/* ── Actions desktop ── */}
        {!isMobile && (
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexShrink: 0 }}>
            {user ? (
              <>
                <Link to="/dashboard" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px", fontWeight: 500, color: "#141414",
                  background: "none", border: "1.5px solid #E8E5DF",
                  borderRadius: "50px", padding: "9px 20px",
                  textDecoration: "none", display: "inline-flex",
                  alignItems: "center", minHeight: "40px",
                  transition: "border-color 0.15s, color 0.15s",
                }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px", fontWeight: 600,
                  color: "#FFFFFF", background: "#FF6B1A",
                  border: "none", borderRadius: "50px",
                  padding: "9px 22px", cursor: "pointer",
                  boxShadow: "0 2px 12px rgba(255,107,26,0.3)",
                  transition: "background 0.15s", minHeight: "40px",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#E85A0C")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#FF6B1A")}
                >
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px", fontWeight: 500, color: "#141414",
                  background: "none", border: "1.5px solid #E8E5DF",
                  borderRadius: "50px", padding: "9px 20px",
                  textDecoration: "none", display: "inline-flex",
                  alignItems: "center", minHeight: "40px",
                  transition: "border-color 0.15s, color 0.15s",
                }}>
                  Se connecter
                </Link>
                <Link to="/auth?tab=signup" style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px", fontWeight: 600,
                  color: "#FFFFFF", background: "#FF6B1A",
                  border: "none", borderRadius: "50px",
                  padding: "9px 22px", textDecoration: "none",
                  boxShadow: "0 2px 12px rgba(255,107,26,0.3)",
                  transition: "background 0.15s",
                  display: "inline-flex", alignItems: "center", minHeight: "40px",
                }}>
                  Vous êtes organisateur ?
                </Link>
              </>
            )}
          </div>
        )}

        {/* ── Hamburger mobile ── */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: "8px", minHeight: "auto",
              display: "flex", alignItems: "center",
            }}
            aria-label="Menu"
          >
            {menuOpen
              ? <X size={22} color="#141414" />
              : <Menu size={22} color="#141414" />
            }
          </button>
        )}
      </nav>

      {/* ── Menu mobile ── */}
      {isMobile && menuOpen && (
        <div style={{
          position: "fixed", top: "64px", left: 0, right: 0, zIndex: 199,
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #E8E5DF",
          padding: "20px 24px 28px",
          display: "flex", flexDirection: "column", gap: "4px",
        }}>
          {[
            { label: "Événements",             to: "/events" },
            { label: "Clubs",                  to: "/clubs" },
            { label: "Calendrier",             to: "/calendar" },
            { label: "Pour les organisateurs", to: "/organisateurs" },
          ].map(({ label, to }) => (
            <Link key={to} to={to} style={{
              fontSize: "16px",
              fontWeight: to === "/organisateurs" ? 600 : 500,
              color: to === "/organisateurs" ? "#FF6B1A" : "#141414",
              padding: "13px 0",
              borderBottom: "1px solid #F2EFE9",
              textDecoration: "none", display: "block",
            }}>
              {label}
            </Link>
          ))}
          <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {user ? (
              <>
                <Link to="/dashboard" style={{
                  textAlign: "center", padding: "13px",
                  border: "1.5px solid #E8E5DF", borderRadius: "50px",
                  fontSize: "15px", fontWeight: 500,
                  color: "#141414", textDecoration: "none",
                }}>
                  Dashboard
                </Link>
                <button onClick={handleSignOut} style={{
                  background: "#FF6B1A", color: "white",
                  border: "none", borderRadius: "50px",
                  padding: "13px", fontSize: "15px", fontWeight: 600,
                  cursor: "pointer", minHeight: "48px",
                }}>
                  Se déconnecter
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" style={{
                  textAlign: "center", padding: "13px",
                  border: "1.5px solid #E8E5DF", borderRadius: "50px",
                  fontSize: "15px", fontWeight: 500,
                  color: "#141414", textDecoration: "none",
                }}>
                  Se connecter
                </Link>
                <Link to="/auth?tab=signup" style={{
                  textAlign: "center", background: "#FF6B1A",
                  color: "white", borderRadius: "50px", padding: "13px",
                  fontSize: "15px", fontWeight: 600,
                  textDecoration: "none", display: "block",
                }}>
                  Vous êtes organisateur ?
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spacer */}
      <div style={{ height: "64px" }} />
    </>
  );
};
