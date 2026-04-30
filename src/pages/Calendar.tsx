import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const PANACHE_ORG_ID = "00000000-0000-0000-0000-000000000001";

const isFicheComplete = (event: any): boolean => {
  return !!(
    event.description &&
    event.description.trim().length >= 50 &&
    event.sport_id &&
    event.city
  );
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const getMonthKey = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const getMonthLabel = (key: string) =>
  capitalize(new Date(`${key}-01`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));

const CalendarPage = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sportFilter, setSportFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, title, starts_at, city, description, sport_id, organization_id, website, images")
        .eq("status", "published")
        .gte("starts_at", new Date().toISOString())
        .order("starts_at", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const orgIds = [...new Set((data || []).map((e: any) => e.organization_id).filter(Boolean))];
      const sportIds = [...new Set((data || []).map((e: any) => e.sport_id).filter(Boolean))];

      const [{ data: orgs }, { data: sports }] = await Promise.all([
        orgIds.length
          ? supabase.from("organizations").select("id, email, website").in("id", orgIds)
          : Promise.resolve({ data: [] }),
        sportIds.length
          ? supabase.from("sports" as any).select("id, name, slug").in("id", sportIds)
          : Promise.resolve({ data: [] }),
      ]);

      const orgsMap = Object.fromEntries((orgs || []).map((o: any) => [o.id, o]));
      const sportsMap = Object.fromEntries((sports as any[] || []).map((s: any) => [s.id, s]));

      const enriched = (data || []).map((e: any) => ({
        ...e,
        organization: orgsMap[e.organization_id] || null,
        sport: sportsMap[e.sport_id] || null,
      }));

      setEvents(enriched);
      setLoading(false);
    };

    fetchData();
  }, []);

  const availableSports = Array.from(
    new Map(
      events.filter((e: any) => e.sport).map((e: any) => [e.sport.id, e.sport])
    ).values()
  ).sort((a: any, b: any) => a.name.localeCompare(b.name));

  const filteredEvents = sportFilter
    ? events.filter((e: any) => e.sport?.id === sportFilter)
    : events;

  const grouped: Record<string, any[]> = {};
  for (const e of filteredEvents) {
    const key = getMonthKey(e.starts_at);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  }
  const monthKeys = Object.keys(grouped).sort();

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4F2" }}>
      <Navbar />

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "112px 24px 96px" }}>

        <div style={{ marginBottom: "32px" }}>
          <h1
            className="font-poppins font-extrabold text-[#1A1A1A]"
            style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.03em", marginBottom: "8px" }}
          >
            Calendrier des événements
          </h1>
          <p style={{ color: "#5A5A5A", fontSize: "15px" }}>
            Tous les événements sportifs à venir en France.
          </p>
        </div>

        {!loading && !error && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              style={{
                height: "40px",
                borderRadius: "100px",
                border: "1px solid #E8E8E8",
                background: "white",
                padding: "0 16px",
                fontSize: "13px",
                color: "#1A1A1A",
                fontWeight: 500,
                cursor: "pointer",
                outline: "none",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              <option value="">Tous les sports</option>
              {availableSports.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <p style={{ color: "#5A5A5A", fontSize: "13px" }}>
              {filteredEvents.length} événement{filteredEvents.length > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {loading && (
          <p style={{ color: "#5A5A5A", fontSize: "14px" }}>Chargement...</p>
        )}
        {error && (
          <p style={{ color: "#EF4444", fontSize: "14px" }}>Erreur : {error}</p>
        )}

        {!loading && !error && monthKeys.map((monthKey) => (
          <div key={monthKey} style={{ marginBottom: "40px" }}>

            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
              paddingBottom: "10px",
              borderBottom: "2px solid #E8E8E8",
            }}>
              <h2
                className="font-poppins font-bold text-[#1A1A1A]"
                style={{ fontSize: "15px", letterSpacing: "-0.01em", textTransform: "capitalize" }}
              >
                {getMonthLabel(monthKey)}
              </h2>
              <span style={{
                background: "#F97316",
                color: "white",
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: "100px",
              }}>
                {grouped[monthKey].length}
              </span>
            </div>

            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E8E8E8", overflow: "hidden" }}>
              {grouped[monthKey].map((event, idx) => {
                const hasFiche = isFicheComplete(event);
                const cleanTitle = event.title.replace(/^\[.*?\]\s*/, "");

                return (
                  <div
                    key={event.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "14px 20px",
                      borderBottom: idx < grouped[monthKey].length - 1 ? "1px solid #F5F4F2" : "none",
                    }}
                  >
                    <div style={{ width: "44px", flexShrink: 0, textAlign: "center" }}>
                      <p style={{
                        fontSize: "18px",
                        fontWeight: 800,
                        fontFamily: "Poppins, sans-serif",
                        color: "#1A1A1A",
                        lineHeight: 1,
                        letterSpacing: "-0.02em",
                      }}>
                        {format(new Date(event.starts_at), "d", { locale: fr })}
                      </p>
                      <p style={{ fontSize: "9px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "2px" }}>
                        {format(new Date(event.starts_at), "MMM", { locale: fr })}
                      </p>
                    </div>

                    <div style={{ width: "1px", height: "32px", background: "#E8E8E8", flexShrink: 0 }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className="font-poppins font-bold"
                        style={{
                          fontSize: "14px",
                          color: hasFiche ? "#1A1A1A" : "#888",
                          letterSpacing: "-0.01em",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBottom: "3px",
                        }}
                      >
                        {cleanTitle}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {event.sport?.name && (
                          <span style={{
                            background: "#0A0A0A",
                            color: "white",
                            fontSize: "9px",
                            fontWeight: 700,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            padding: "2px 7px",
                            borderRadius: "100px",
                          }}>
                            {event.sport.name}
                          </span>
                        )}
                        {event.city && (
                          <span style={{ fontSize: "12px", color: "#5A5A5A" }}>
                            · {event.city}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexShrink: 0, alignItems: "center" }}>
                      {hasFiche ? (
                        <a
                          href={`/events/${event.id}`}
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "6px 14px",
                            background: "#F97316",
                            color: "white",
                            borderRadius: "100px",
                            whiteSpace: "nowrap",
                            textDecoration: "none",
                          }}
                        >
                          Voir la fiche
                        </a>
                      ) : (
                        <a
                          href={`/claim-event?id=${event.id}`}
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "6px 14px",
                            background: "transparent",
                            color: "#5A5A5A",
                            border: "1px solid #E8E8E8",
                            borderRadius: "100px",
                            whiteSpace: "nowrap",
                            textDecoration: "none",
                          }}
                        >
                          Cet événement, c'est vous ?
                        </a>
                      )}
                      {event.organization?.email && (
                        <a
                          href={`mailto:${event.organization.email}`}
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            padding: "6px 14px",
                            background: "transparent",
                            color: "#5A5A5A",
                            border: "1px solid #E8E8E8",
                            borderRadius: "100px",
                            whiteSpace: "nowrap",
                            textDecoration: "none",
                          }}
                        >
                          Contacter
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {!loading && !error && filteredEvents.length === 0 && (
          <div style={{ textAlign: "center", padding: "64px 0", color: "#5A5A5A" }}>
            <p style={{ fontSize: "15px", fontWeight: 500 }}>Aucun événement trouvé.</p>
            <p style={{ fontSize: "13px", marginTop: "8px" }}>Essayez un autre filtre.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CalendarPage;
