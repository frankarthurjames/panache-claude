import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EventCard } from "@/components/EventCard";
import { Loader2, MapPin, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Carousel, CarouselContent, CarouselItem,
  CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog, DialogContent, DialogTrigger,
} from "@/components/ui/dialog";
import { SEO } from "@/components/SEO";
import EventCheckout from "@/components/EventCheckout";

const PANACHE_ORG_ID = '6f8c37be-e1f5-4a19-98c3-98946ea7d034';

const EventDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [orgEventsCount, setOrgEventsCount] = useState<number>(0);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('events')
          .select(`
            *,
            organizations (
              id, name, logo_url, slug, website, address,
              billing_email, billing_country, created_by_user_id
            ),
            ticket_types (
              id, name, price_cents, currency, quantity, max_per_order
            ),
            registrations ( id, ticket_type_id )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setEvent(data);

        if (data?.organization_id) {
          const { count } = await supabase
            .from('events')
            .select('id', { count: 'exact' })
            .eq('organization_id', data.organization_id)
            .eq('status', 'published');
          setOrgEventsCount(count ?? 0);
        }

        const { data: nearby } = await supabase
          .from('events')
          .select('id, title, city, starts_at, images, ticket_types(*), sports(name)')
          .eq('status', 'published')
          .neq('id', id)
          .gte('starts_at', new Date().toISOString())
          .order('starts_at', { ascending: true })
          .limit(3)
          .eq('city', data.city || '');

        if (nearby && nearby.length > 0) {
          setNearbyEvents(nearby);
        } else {
          const { data: fallback } = await supabase
            .from('events')
            .select('id, title, city, starts_at, images, ticket_types(*), sports(name)')
            .eq('status', 'published')
            .neq('id', id)
            .gte('starts_at', new Date().toISOString())
            .order('starts_at', { ascending: true })
            .limit(3);
          setNearbyEvents(fallback || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F5F4F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Loader2 style={{ height: "32px", width: "32px", color: "#F97316" }} className="animate-spin" />
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: "100vh", background: "#F5F4F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#5A5A5A" }}>Événement non trouvé</p>
    </div>
  );

  const eventDate = new Date(event.starts_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const eventTime = (() => {
    const d = new Date(event.starts_at);
    return d.getHours() !== 0 || d.getMinutes() !== 0
      ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : null;
  })();

  const minPrice = event.ticket_types?.length > 0
    ? Math.min(...event.ticket_types.map((t: any) => t.price_cents)) / 100
    : null;

  const organization = event.organizations;
  const showClaimBanner = event.organization_id === PANACHE_ORG_ID;
  const cleanTitle = event.title?.replace(/^\[.*?\]\s*/, '') || '';
  const sport = event.sport?.name || event.sports?.name || null;

  const heroImage = event.images?.length > 0
    ? event.images[0]
    : "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&auto=format&fit=crop&q=80";

  const totalRemaining = event.ticket_types?.reduce((acc: number, t: any) => {
    const sold = (event.registrations || []).filter((r: any) => r.ticket_type_id === t.id).length;
    return acc + Math.max(0, t.quantity - sold);
  }, 0) ?? 0;

  const totalCapacity = event.ticket_types?.reduce((acc: number, t: any) => acc + t.quantity, 0) ?? 0;
  const isLowStock = totalCapacity > 0 && totalRemaining / totalCapacity < 0.2;

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(cleanTitle);

  return (
    <div style={{ minHeight: "100vh", background: "#F5F4F2" }}>
      <SEO
        title={cleanTitle}
        description={event.description?.slice(0, 160) || `${cleanTitle} — ${eventDate}`}
      />
      <Navbar />

      {/* HERO */}
      <div style={{ position: "relative", height: "520px", overflow: "hidden", background: "#0A0A0A" }}>
        <img
          src={heroImage}
          alt={cleanTitle}
          style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,10,10,0.92) 0%, rgba(10,10,10,0.4) 50%, rgba(10,10,10,0.15) 100%)"
        }} />

        {sport && (
          <div style={{ position: "absolute", top: "100px", left: "32px" }}>
            <span style={{
              background: "#F97316", color: "white",
              fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "6px 14px", borderRadius: "100px"
            }}>
              {sport}
            </span>
          </div>
        )}

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 32px 36px" }}>
          <h1
            className="font-poppins font-extrabold text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.03em", lineHeight: 1.06, marginBottom: "12px", maxWidth: "700px" }}
          >
            {cleanTitle}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "15px", fontWeight: 500, marginBottom: "16px" }}>
            {eventDate}{eventTime ? ` · ${eventTime}` : ''}{event.city ? ` · ${event.city}` : ''}
          </p>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <a
              href={`https://wa.me/?text=${shareTitle}%20${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#0A0A0A", color: "white",
                fontSize: "12px", fontWeight: 600,
                padding: "8px 14px", borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none"
              }}
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#0A0A0A", color: "white",
                fontSize: "12px", fontWeight: 600,
                padding: "8px 14px", borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.15)",
                textDecoration: "none"
              }}
            >
              Facebook
            </a>
            <button
              onClick={handleCopy}
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                background: "#0A0A0A", color: "white",
                fontSize: "12px", fontWeight: 600,
                padding: "8px 14px", borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer"
              }}
            >
              {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
              {copied ? "Copié !" : "Copier le lien"}
            </button>
          </div>
        </div>
      </div>

      {/* Claim banner */}
      {showClaimBanner && (
        <div style={{ background: "#FFF7ED", borderBottom: "1px solid #FED7AA", padding: "12px 32px", textAlign: "center" }}>
          <p style={{ fontSize: "13px", color: "#92400E" }}>
            Cet événement, c'est vous ?{" "}
            <a href={`/claim-event/${event.id}`} style={{ color: "#F97316", fontWeight: 600, textDecoration: "underline" }}>
              Créez votre fiche gratuitement →
            </a>
          </p>
        </div>
      )}

      {/* BODY */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 96px", display: "grid", gridTemplateColumns: "1fr 340px", gap: "48px", alignItems: "start" }}>

        {/* COLONNE GAUCHE */}
        <div>

          {event.description && (
            <div style={{ marginBottom: "40px" }}>
              <h2 className="font-poppins font-bold text-[#1A1A1A]"
                  style={{ fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                Description
              </h2>
              <p style={{ color: "#1A1A1A", fontSize: "15px", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {event.description}
              </p>
            </div>
          )}

          {(event.audience || event.level || event.venue_type || event.transport || event.pmr_access !== undefined) && (
            <div style={{ marginBottom: "40px" }}>
              <h2 className="font-poppins font-bold text-[#1A1A1A]"
                  style={{ fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "20px" }}>
                Détails pratiques
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                {event.audience && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Public</p>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>{event.audience}</p>
                  </div>
                )}
                {event.level && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Niveau</p>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>{event.level}</p>
                  </div>
                )}
                {event.venue_type && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Type de lieu</p>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>{event.venue_type}</p>
                  </div>
                )}
                {event.transport && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Pour venir</p>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>{event.transport}</p>
                  </div>
                )}
                {event.pmr_access && (
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>Accessibilité</p>
                    <p style={{ fontSize: "14px", color: "#1A1A1A", fontWeight: 500 }}>Accès PMR disponible</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {event.images?.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h2 className="font-poppins font-bold text-[#1A1A1A]"
                  style={{ fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                Photos
              </h2>
              <Carousel className="w-full">
                <CarouselContent>
                  {event.images.map((img: string, idx: number) => (
                    <CarouselItem key={idx} className="md:basis-1/2">
                      <div style={{ borderRadius: "12px", overflow: "hidden", aspectRatio: "16/9" }}>
                        <img src={img} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {event.images.length > 1 && <CarouselPrevious />}
                {event.images.length > 1 && <CarouselNext />}
              </Carousel>
            </div>
          )}

          {(event.venue || event.city) && (
            <div style={{ marginBottom: "40px" }}>
              <h2 className="font-poppins font-bold text-[#1A1A1A]"
                  style={{ fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "16px" }}>
                Localisation
              </h2>
              {event.venue && (
                <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E8E8E8", overflow: "hidden" }}>
                  <iframe
                    title="map"
                    width="100%"
                    height="280"
                    style={{ border: 0, display: "block" }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(event.venue + (event.city ? ', ' + event.city : ''))}&output=embed`}
                  />
                  <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <MapPin style={{ width: 16, height: 16, color: "#F97316", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{event.venue}</p>
                      {event.city && <p style={{ fontSize: "13px", color: "#5A5A5A" }}>{event.city}</p>}
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue + (event.city ? ', ' + event.city : ''))}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ marginLeft: "auto", fontSize: "12px", color: "#F97316", fontWeight: 600, textDecoration: "none" }}
                    >
                      Voir l'itinéraire →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {nearbyEvents.length > 0 && (
            <div>
              <h2 className="font-poppins font-bold text-[#1A1A1A]"
                  style={{ fontSize: "20px", letterSpacing: "-0.02em", marginBottom: "20px" }}>
                D'autres événements qui pourraient vous plaire
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {nearbyEvents.map((e: any) => {
                  const img = e.images?.[0] || "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80";
                  const minP = e.ticket_types?.length > 0 ? Math.min(...e.ticket_types.map((t: any) => t.price_cents)) / 100 : 0;
                  const priceDisplay = minP === 0 ? "Gratuit" : `À partir de ${minP.toFixed(0)}€`;
                  return (
                    <EventCard
                      key={e.id}
                      id={e.id}
                      title={e.title}
                      date={new Date(e.starts_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      location={e.city || ''}
                      image={img}
                      tag={(e.sports?.name || 'Sport').toUpperCase()}
                      tagColor="bg-black"
                      price={priceDisplay}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR DROITE */}
        <div style={{ position: "sticky", top: "96px" }}>
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #E8E8E8", overflow: "hidden" }}>

            <div style={{ padding: "24px 24px 20px", borderBottom: "1px solid #E8E8E8" }}>
              {minPrice !== null ? (
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span className="font-poppins font-extrabold text-[#F97316]"
                        style={{ fontSize: "42px", letterSpacing: "-0.03em", lineHeight: 1 }}>
                    {minPrice === 0 ? "Gratuit" : `${minPrice}€`}
                  </span>
                  {minPrice > 0 && (
                    <span style={{ fontSize: "14px", color: "#5A5A5A", fontWeight: 500 }}>/ billet</span>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: "15px", color: "#5A5A5A" }}>Contactez l'organisateur</p>
              )}

              {isLowStock && totalRemaining > 0 && (
                <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#EF4444" }}>
                    ⚡ Plus que {totalRemaining} place{totalRemaining > 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </div>

            {event.ticket_types?.length > 0 && (
              <div style={{ padding: "20px 24px", borderBottom: "1px solid #E8E8E8" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                  Billets disponibles
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {event.ticket_types.map((ticket: any) => {
                    const sold = (event.registrations || []).filter((r: any) => r.ticket_type_id === ticket.id).length;
                    const remaining = Math.max(0, ticket.quantity - sold);
                    return (
                      <div key={ticket.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#F5F4F2", borderRadius: "10px" }}>
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#1A1A1A" }}>{ticket.name}</p>
                          <p style={{ fontSize: "11px", color: "#5A5A5A", marginTop: "2px" }}>
                            {remaining > 0 ? `${remaining} restant${remaining > 1 ? 's' : ''}` : 'Épuisé'}
                          </p>
                        </div>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "#F97316" }}>
                          {ticket.price_cents === 0 ? "Gratuit" : `${(ticket.price_cents / 100).toFixed(2)}€`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ padding: "20px 24px" }}>
              {event.ticket_types?.length > 0 ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      style={{
                        width: "100%", height: "56px",
                        background: "#F97316", color: "white",
                        fontFamily: "DM Sans, sans-serif",
                        fontSize: "16px", fontWeight: 700,
                        borderRadius: "12px", border: "none",
                        cursor: "pointer", transition: "background 0.2s"
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#EA6C0A")}
                      onMouseLeave={e => (e.currentTarget.style.background = "#F97316")}
                    >
                      {minPrice === 0 ? "Réserver ma place gratuitement →" : `Réserver — À partir de ${minPrice}€ →`}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
                    <div className="max-h-[85vh] overflow-y-auto">
                      <EventCheckout
                        eventId={event.id}
                        eventTitle={cleanTitle}
                        eventDate={eventDate}
                        ticketTypes={event.ticket_types || []}
                        registrations={event.registrations || []}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ) : organization?.billing_email ? (
                <a
                  href={`mailto:${organization.billing_email}?subject=Inscription — ${cleanTitle}`}
                  style={{
                    display: "block", width: "100%", height: "56px",
                    background: "#F5F4F2", color: "#1A1A1A",
                    fontSize: "15px", fontWeight: 600,
                    borderRadius: "12px", border: "1px solid #E8E8E8",
                    textDecoration: "none", textAlign: "center",
                    lineHeight: "56px"
                  }}
                >
                  Contacter l'organisateur
                </a>
              ) : null}

              <p style={{ fontSize: "11px", color: "#5A5A5A", textAlign: "center", marginTop: "12px", lineHeight: 1.5 }}>
                Paiement sécurisé · Billet reçu par email
              </p>
            </div>

            {organization && organization.id !== PANACHE_ORG_ID && (
              <div style={{ padding: "20px 24px", borderTop: "1px solid #E8E8E8" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#5A5A5A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
                  Organisateur
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  {organization.logo_url ? (
                    <img src={organization.logo_url} alt={organization.name}
                         style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover", border: "1px solid #E8E8E8" }} />
                  ) : (
                    <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#F5F4F2", border: "1px solid #E8E8E8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#1A1A1A" }}>
                        {organization.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#1A1A1A" }}>{organization.name}</p>
                    <p style={{ fontSize: "12px", color: "#5A5A5A" }}>{orgEventsCount} événement{orgEventsCount > 1 ? 's' : ''} publié{orgEventsCount > 1 ? 's' : ''}</p>
                  </div>
                </div>
                {(organization.slug || organization.id) && (
                  <a
                    href={`/clubs/${organization.slug || organization.id}`}
                    style={{
                      display: "block", width: "100%", padding: "10px",
                      textAlign: "center", fontSize: "13px", fontWeight: 600,
                      color: "#1A1A1A", border: "1px solid #E8E8E8",
                      borderRadius: "10px", textDecoration: "none",
                      background: "white"
                    }}
                  >
                    Voir la page du club →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BARRE MOBILE FIXE */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: "white", borderTop: "1px solid #E8E8E8",
          padding: "12px 16px", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "12px",
          zIndex: 50
        }}
        className="md:hidden"
      >
        <div>
          <p className="font-poppins font-extrabold text-[#F97316]"
             style={{ fontSize: "22px", letterSpacing: "-0.02em", lineHeight: 1 }}>
            {minPrice === null ? "—" : minPrice === 0 ? "Gratuit" : `${minPrice}€`}
          </p>
          {minPrice !== null && minPrice > 0 && (
            <p style={{ fontSize: "11px", color: "#5A5A5A" }}>/ billet</p>
          )}
        </div>
        {event.ticket_types?.length > 0 ? (
          <Dialog>
            <DialogTrigger asChild>
              <button style={{
                flex: 1, maxWidth: "220px", height: "48px",
                background: "#F97316", color: "white",
                fontSize: "14px", fontWeight: 700,
                borderRadius: "10px", border: "none", cursor: "pointer"
              }}>
                {minPrice === 0 ? "Réserver gratuitement" : "Réserver →"}
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl bg-white border-0 shadow-2xl rounded-3xl p-0 overflow-hidden">
              <div className="max-h-[85vh] overflow-y-auto">
                <EventCheckout
                  eventId={event.id}
                  eventTitle={cleanTitle}
                  eventDate={eventDate}
                  ticketTypes={event.ticket_types || []}
                  registrations={event.registrations || []}
                />
              </div>
            </DialogContent>
          </Dialog>
        ) : organization?.billing_email ? (
          <a
            href={`mailto:${organization.billing_email}`}
            style={{
              flex: 1, maxWidth: "220px", height: "48px",
              background: "#F5F4F2", color: "#1A1A1A",
              fontSize: "14px", fontWeight: 600,
              borderRadius: "10px", border: "1px solid #E8E8E8",
              textDecoration: "none", textAlign: "center", lineHeight: "48px"
            }}
          >
            Contacter
          </a>
        ) : null}
      </div>

      <Footer />
    </div>
  );
};

export default EventDetail;
