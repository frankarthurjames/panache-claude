import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const MonthlyCalendar = () => {
  useReveal(200);
  const [months, setMonths] = useState<{ month: string; count: number; slug: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonths = async () => {
      try {
        const { data } = await supabase
          .from("events")
          .select("starts_at")
          .eq("status", "published")
          .gte("starts_at", new Date().toISOString().slice(0, 10) + "T00:00:00.000Z")
          .order("starts_at", { ascending: true });

        const countsByKey: Record<string, number> = {};
        const labelsByKey: Record<string, string> = {};

        for (const e of data || []) {
          const d = new Date(e.starts_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          countsByKey[key] = (countsByKey[key] || 0) + 1;
          if (!labelsByKey[key]) {
            labelsByKey[key] = capitalize(
              new Date(`${key}-01`).toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })
            );
          }
        }

        const result = Object.entries(countsByKey)
          .slice(0, 8)
          .map(([slug, count]) => ({ month: labelsByKey[slug], count, slug }));

        setMonths(result);
      } catch (err) {
        console.error("Error fetching months:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonths();
  }, []);

  if (loading) return (
    <section style={{ padding: "80px 0", background: "#F2EFE9" }}>
      <div className="panache-wrap" style={{ display: "flex", justifyContent: "center" }}>
        <Loader2 style={{ width: 32, height: 32, color: "#FF6B1A" }} className="animate-spin" />
      </div>
    </section>
  );

  if (months.length === 0) return null;

  return (
    <section style={{ padding: "80px 0", background: "#F2EFE9" }}>
      <div className="panache-wrap">

        <div className="reveal" style={{ marginBottom: "28px" }}>
          <span className="eyebrow">Planifiez</span>
          <h2 className="sec-title">Calendrier des événements</h2>
        </div>

        <div
          className="cal-grid-responsive"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
        >
          {months.map(({ month, count, slug }, idx) => (
            <button
              key={slug}
              className="reveal"
              onClick={() => navigate(`/events?month=${slug}`)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "white",
                border: "1.5px solid #E8E5DF",
                borderRadius: "12px",
                padding: "16px 22px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, background 0.15s, transform 0.15s",
                minHeight: "auto",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "#FF6B1A";
                e.currentTarget.style.background = "#FFF2EB";
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "#E8E5DF";
                e.currentTarget.style.background = "white";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "15px", fontWeight: 600,
                color: "#141414", letterSpacing: "-0.01em",
                textTransform: "capitalize",
              }}>
                {month}
              </span>
              <span style={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "15px", fontWeight: 700,
                fontStyle: "italic", color: "#FF6B1A",
                whiteSpace: "nowrap",
              }}>
                {count} événement{count > 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cal-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};
