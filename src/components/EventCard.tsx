import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const FALLBACK = "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image?: string;
  tag?: string;
  price?: string | number;
  isFree?: boolean;
  onClick?: () => void;
}

export const EventCard = ({
  id,
  title,
  date,
  location,
  image,
  tag,
  price,
  isFree,
  onClick,
}: EventCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) onClick();
    else navigate(`/events/${id}`);
  };

  const cleanTitle = title?.replace(/^\[.*?\]\s*/, "") || "";

  const priceDisplay = (() => {
    if (isFree || price === 0 || price === "0" || price === "Gratuit") return { label: "Gratuit", free: true };
    if (!price) return null;
    if (typeof price === "number") return { label: `À partir de ${price}€`, free: false };
    return { label: price, free: false };
  })();

  return (
    <button
      onClick={handleClick}
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
        const img = e.currentTarget.querySelector(".ec-img") as HTMLImageElement;
        if (img) img.style.transform = "scale(1.05)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.07)";
        const img = e.currentTarget.querySelector(".ec-img") as HTMLImageElement;
        if (img) img.style.transform = "none";
      }}
    >
      {/* Image */}
      <div style={{
        width: "100%",
        height: "180px",
        overflow: "hidden",
        flexShrink: 0,
        position: "relative",
        background: "#F2EFE9",
      }}>
        <img
          className="ec-img"
          src={image || FALLBACK}
          alt={cleanTitle}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 0.4s cubic-bezier(0.22,1,0.36,1)",
          }}
          onError={e => { (e.currentTarget as HTMLImageElement).src = FALLBACK; }}
        />
        {/* Badge sport */}
        {tag && (
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
            {tag}
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
        {/* Titre */}
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
          {cleanTitle}
        </h3>

        {/* Date + lieu */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {date && (
            <span style={{ fontSize: "12px", color: "#6B6B6B", fontWeight: 400 }}>
              {date}
            </span>
          )}
          {location && (
            <span style={{ fontSize: "12px", color: "#6B6B6B", fontWeight: 400 }}>
              {location}
            </span>
          )}
        </div>

        {/* Footer prix */}
        {priceDisplay && (
          <div>
            <span style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: "16px",
              fontWeight: 700,
              color: priceDisplay.free ? "#166534" : "#FF6B1A",
              marginTop: "auto",
              paddingTop: "10px",
              display: "block",
            }}>
              {priceDisplay.label}
            </span>
          </div>
        )}
      </div>
    </button>
  );
};

export default EventCard;
