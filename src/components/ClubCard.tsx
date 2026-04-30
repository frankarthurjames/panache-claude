import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";

interface ClubCardProps {
  id: string | number;
  name: string;
  category?: string;
  location?: string;
  logo?: string;
  eventCount?: number;
}

const FALLBACK_COLOR = "#FAF8F5";

export const ClubCard = ({ id, name, category, location, logo, eventCount }: ClubCardProps) => {
  const navigate = useNavigate();
  const initial = name?.charAt(0).toUpperCase() || "C";

  return (
    <button
      onClick={() => navigate(`/clubs/${id}`)}
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        transition: "transform 0.15s cubic-bezier(0.22,1,0.36,1), box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
      }}
    >
      {/* Header — fond crème avec logo centré */}
      <div style={{
        width: "100%",
        height: "120px",
        background: "#FAF8F5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
      }}>
        {logo ? (
          <img
            src={logo}
            alt={name}
            style={{
              width: "72px",
              height: "72px",
              objectFit: "contain",
              borderRadius: "12px",
            }}
            onError={e => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const next = e.currentTarget.nextElementSibling as HTMLElement;
              if (next) next.style.display = "flex";
            }}
          />
        ) : null}
        {/* Fallback initiale */}
        <div style={{
          width: "72px", height: "72px",
          background: "#FF6B1A",
          borderRadius: "12px",
          display: logo ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 800,
            fontSize: "28px",
            color: "white",
            lineHeight: 1,
          }}>
            {initial}
          </span>
        </div>

        {/* Badge catégorie */}
        {category && category !== "Club" && (
          <span style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(6px)",
            color: "#141414",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "50px",
          }}>
            {category}
          </span>
        )}
      </div>

      {/* Corps */}
      <div style={{
        padding: "14px 16px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        flex: 1,
      }}>
        <h3 style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 700,
          fontSize: "15px",
          color: "#141414",
          lineHeight: 1.3,
          letterSpacing: "-0.02em",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          margin: 0,
        }}>
          {name}
        </h3>

        {location && location !== "Lieu non précisé" && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <MapPin size={11} color="#6B6B6B" />
            <span style={{ fontSize: "12px", color: "#6B6B6B" }}>
              {location}
            </span>
          </div>
        )}

        {eventCount !== undefined && (
          <div style={{ marginTop: "auto", paddingTop: "10px" }}>
            <span style={{
              fontSize: "11px", fontWeight: 600,
              color: "#FF6B1A",
              background: "#FFF2EB",
              padding: "4px 10px",
              borderRadius: "50px",
              display: "inline-block",
            }}>
              {eventCount} événement{eventCount > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default ClubCard;
