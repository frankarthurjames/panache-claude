
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { EventCard } from "@/components/EventCard";
import { Facebook, Instagram, Linkedin, MapPin, Phone, Globe, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { SEO } from "@/components/SEO";

const ClubDetail = () => {
    const { id } = useParams();
    const [club, setClub] = useState<any>(null);
    const [clubEvents, setClubEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClubData = async () => {
            if (!id) return;
            try {
                setLoading(true);

                // Try slug first (SEO), fallback to UUID
                let { data: org, error: orgError } = await supabase
                    .from('organizations')
                    .select('*, sports:sport_id(name, slug)')
                    .eq('slug', id)
                    .single();

                if (orgError || !org) {
                    const result = await supabase
                        .from('organizations')
                        .select('*, sports:sport_id(name, slug)')
                        .eq('id', id)
                        .single();
                    org = result.data;
                    orgError = result.error;
                }

                if (orgError) throw orgError;
                setClub(org);

                // Fetch published events for this org (using real UUID)
                const { data: events, error: eventsError } = await supabase
                    .from('events')
                    .select(`
                        id, title, starts_at, city, venue, images,
                        registration_type, external_registration_url,
                        sports:sport_id ( name, slug ),
                        ticket_types ( price_cents )
                    `)
                    .eq('organization_id', org.id)
                    .eq('status', 'published')
                    .gte('starts_at', new Date().toISOString())
                    .order('starts_at', { ascending: true });

                if (eventsError) throw eventsError;
                setClubEvents(events || []);

            } catch (err) {
                console.error("Error fetching club data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClubData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!club) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Club introuvable</h1>
                <Link to="/" className="text-orange-500 hover:underline">Retour à l'accueil</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans">
            <SEO
                title={club.name}
                description={club.description?.substring(0, 160) || `Découvrez le club ${club.name} sur Panache.`}
                image={club.logo_url || club.banner_url}
            />
            {/* Hero */}
            <div style={{
                position: 'relative',
                minHeight: '420px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingBottom: '48px',
            }}>
                {/* Image de fond */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img
                        src={club.banner_url || 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&q=80'}
                        alt={club.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0) 100%)' }} />
                </div>

                {/* Navbar par-dessus */}
                <div style={{ position: 'relative', zIndex: 20 }}>
                    <Navbar variant="transparent" />
                </div>

                {/* Contenu hero */}
                <div className="container mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>

                        {/* Logo */}
                        {club.logo_url && (
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '12px',
                                overflow: 'hidden', background: 'white', flexShrink: 0,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
                            }}>
                                <img src={club.logo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                        )}

                        {/* Nom + infos */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {club.sports?.name && (
                                <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px', display: 'block' }}>
                                    {club.sports.name}
                                </span>
                            )}
                            <h1 style={{
                                fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontStyle: 'italic',
                                fontSize: 'clamp(28px, 5vw, 52px)', color: 'white',
                                letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '16px',
                            }}>
                                {club.name}
                            </h1>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {club.members_count && (
                                    <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>
                                        👥 {club.members_count} licenciés
                                    </span>
                                )}
                                {club.founded_year && (
                                    <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>
                                        📅 Fondé en {club.founded_year}
                                    </span>
                                )}
                                {club.federation && (
                                    <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>
                                        🏅 {club.federation}
                                    </span>
                                )}
                                {club.accessibility_pmr && (
                                    <span style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', color: 'white', padding: '5px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 500 }}>
                                        ♿ Accès PMR
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Description & Events */}
                    <div className="lg:col-span-2 space-y-12">
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Description</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {club.description}
                            </p>
                        </section>

                        {/* Infos clés */}
                        {(club.practice_type || club.public_type) && (
                            <div className="grid grid-cols-2 gap-4 border border-gray-100 rounded-2xl p-5">
                                {club.practice_type && (
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Pratique</p>
                                        <p className="text-sm font-semibold text-gray-900">{club.practice_type}</p>
                                    </div>
                                )}
                                {club.public_type && (
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Public</p>
                                        <p className="text-sm font-semibold text-gray-900">{club.public_type}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bon à savoir */}
                        {club.bon_a_savoir && (
                            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                                <p className="text-xs text-orange-500 font-bold uppercase tracking-wide mb-2">
                                    💡 Bon à savoir
                                </p>
                                <p className="text-sm text-gray-800 leading-relaxed">{club.bon_a_savoir}</p>
                            </div>
                        )}

                        {/* Infrastructures */}
                        {(club.venue_1 || club.venue_2 || club.venue_3 || club.accessibility_pmr) && (
                            <div className="border border-gray-100 rounded-2xl p-5">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Infrastructures</h2>
                                <div className="space-y-2">
                                    {[club.venue_1, club.venue_2, club.venue_3]
                                        .filter(Boolean)
                                        .map((venue, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-lg">📍</span>
                                                <p className="text-sm text-gray-700">{venue}</p>
                                            </div>
                                        ))
                                    }
                                    {club.accessibility_pmr && (
                                        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
                                            <span className="text-lg">♿️</span>
                                            <p className="text-sm font-medium text-gray-900">Accès PMR disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <section>
                            <h2 className="text-2xl font-bold mb-6">Événements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {clubEvents.length > 0 ? (
                                    clubEvents.map(event => {
                                        const minPrice = event.ticket_types?.length
                                            ? Math.min(...event.ticket_types.map((t: any) => t.price_cents))
                                            : 0;
                                        const isFree = minPrice === 0;
                                        const priceDisplay = isFree ? undefined : `${(minPrice / 100).toFixed(0)}€`;

                                        return (
                                            <EventCard
                                                key={event.id}
                                                id={event.id}
                                                title={event.title}
                                                date={format(new Date(event.starts_at), "d MMMM yyyy", { locale: fr })}
                                                location={event.city || event.venue || ''}
                                                image={event.images?.[0] || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80'}
                                                tag={event.sports?.name || 'Sport'}
                                                isFree={isFree}
                                                price={priceDisplay}
                                            />
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 col-span-2">Aucun événement prévu prochainement.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Contact Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 border border-gray-100">
                            <div className="p-6 space-y-6">
                                <h3 className="text-xl font-bold">Coordonnées du club</h3>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <span className="font-medium">{club.phone}</span>
                                    </div>
                                    {club.website && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Globe className="h-5 w-5 text-gray-400" />
                                            <a href={club.website.startsWith('http') ? club.website : `https://${club.website}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                                                {club.website.replace(/^https?:\/\//, '')}
                                            </a>
                                        </div>
                                    )}
                                    {club.billing_email && (
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                            <a href={`mailto:${club.billing_email}`} className="font-medium hover:underline">{club.billing_email}</a>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-3 text-gray-700">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                        <span className="font-medium max-w-[200px]">{club.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Club Logo Area */}
                            <div className="bg-primary p-8 flex justify-center items-center relative overflow-hidden h-48">
                                {/* Slanted divider */}
                                <div className="absolute top-0 left-0 w-full h-8 bg-white" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 0)" }}></div>

                                <div className="bg-white p-4 rounded-xl shadow-lg relative z-10 transform rotate-3">
                                    <img src={club.logo_url || "https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/Logo_FC_Lyon_2020.svg/1200px-Logo_FC_Lyon_2020.svg.png"} alt={club.name} className="h-24 w-24 object-contain" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ClubDetail;
