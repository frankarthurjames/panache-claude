import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer
      style={{
        background: "#1E1E1E",
        padding: "32px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: "18px",
          fontWeight: 800,
          color: "#FF6B1A",
          letterSpacing: "-0.5px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            width: "6px",
            height: "6px",
            background: "#FF6B1A",
            borderRadius: "50%",
            opacity: 0.7,
            display: "inline-block",
          }}
        />
        Panache
      </div>

      {/* Liens */}
      <nav
        style={{
          display: "flex",
          gap: "24px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {[
          { label: "Événements",       to: "/events" },
          { label: "Clubs",            to: "/clubs" },
          { label: "Calendrier",       to: "/calendar" },
          { label: "Organisateurs",    to: "/organisateurs" },
          { label: "À propos",         to: "/about" },
          { label: "Mentions légales", to: "/legal/mentions-legales" },
          { label: "Contact",          to: "/contact" },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.38)",
              textDecoration: "none",
              transition: "color 0.15s",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.38)")}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Copyright */}
      <p
        style={{
          fontSize: "12px",
          color: "rgba(255,255,255,0.2)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        © Panache 2026
      </p>
    </footer>
  );
};
