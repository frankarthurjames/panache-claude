import { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { ChevronDown, ChevronUp } from "lucide-react";

const CLUBS = [
  "Triathlon Club Paris", "AS Running Lyon", "Vélo Club Bordeaux",
  "Judo Club Marseille", "Tennis Club Nice", "Handball Nantes",
  "Natation Toulouse", "Escalade Montpellier", "CrossFit Strasbourg",
  "Athlétisme Rennes", "Badminton Lille", "Cyclisme Grenoble",
];

const FEATURES = [
  {
    icon: "🔍",
    title: "Visibilité locale",
    desc: "Votre événement apparaît dans les résultats de recherche par sport et par ville, touchez des participants qui ne vous connaissent pas encore.",
  },
  {
    icon: "🎟️",
    title: "Billetterie intégrée",
    desc: "Vendez vos billets directement sur Panache. Paiements sécurisés, commissions reversées sous 48h.",
  },
  {
    icon: "📱",
    title: "Scanner QR",
    desc: "Validez les entrées en temps réel depuis votre téléphone. Fini les listes papier.",
  },
  {
    icon: "📊",
    title: "Dashboard analytics",
    desc: "Suivez vos inscriptions, revenus et taux de remplissage en temps réel depuis un seul tableau de bord.",
  },
  {
    icon: "🏆",
    title: "Fiche club publique",
    desc: "Une page dédiée à votre organisation avec vos événements, vos contacts et votre identité visuelle.",
  },
  {
    icon: "🔗",
    title: "Intégrations",
    desc: "Connectez votre compte Stripe pour recevoir les paiements directement. D'autres intégrations arrivent.",
  },
];

const STEPS = [
  { num: "01", title: "Créez votre compte", desc: "Inscription gratuite, aucune carte bancaire requise.", time: "2 min" },
  { num: "02", title: "Créez votre organisation", desc: "Ajoutez votre logo, description et contacts.", time: "5 min" },
  { num: "03", title: "Publiez votre événement", desc: "Renseignez les infos, ajoutez des billets si besoin.", time: "5 min" },
  { num: "04", title: "Activez la billetterie", desc: "Connectez Stripe pour recevoir les paiements directement.", time: "3 min" },
];

const FAQS = [
  {
    q: "Combien coûte Panache pour les organisateurs ?",
    a: "La création de compte et la publication d'événements sont totalement gratuites. Panache prend uniquement une commission de 2% sur les billets vendus — rien d'autre.",
  },
  {
    q: "Comment sont reversés les paiements ?",
    a: "Les paiements sont reversés directement sur votre compte Stripe sous 48h après chaque vente. Vous gardez le contrôle total de votre trésorerie.",
  },
  {
    q: "Puis-je publier des événements gratuits ?",
    a: "Oui, absolument. Les événements sans billetterie ou avec billetterie à 0€ sont publiés sans aucun frais.",
  },
  {
    q: "Faut-il être une association officielle ?",
    a: "Non. Tout organisateur d'événements sportifs peut créer un compte : association loi 1901, club affilié, collectif amateur ou organisateur indépendant.",
  },
  {
    q: "Comment fonctionne le scanner QR ?",
    a: "Depuis votre dashboard, accédez à la page Scanner pour valider les billets à l'entrée via la caméra de votre téléphone. Temps réel, sans connexion requise.",
  },
  {
    q: "Que se passe-t-il si je vends des billets et annule l'événement ?",
    a: "Contactez-nous dès que possible via frank@panache.ws. Nous gérons les remboursements avec vous et facilitons la communication avec vos participants.",
  },
];

export const Organisateurs = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Pour les organisateurs — Panache"
        description="Publiez vos événements sportifs, vendez vos billets et touchez un public local. Gratuit pour publier, 2% de commission sur les billets vendus."
      />

      {/* Hero */}
      <section className="relative bg-black text-white pt-32 pb-24 px-4">
        <Navbar variant="orange" />
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Votre événement mérite d'être vu.<br />
            <span className="text-orange-500">On s'occupe du reste.</span>
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            Publiez vos événements, vendez vos billets, touchez un public qui ne vous connaît pas encore — depuis un seul endroit, sans abonnement.
          </p>
          <p className="text-base text-orange-400 font-semibold mb-10">
            Gratuit pour publier. Commission uniquement sur les billets vendus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              to="/auth?tab=signup"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-colors"
            >
              Créer mon compte gratuitement →
            </Link>
            <Link
              to="/events"
              className="border-2 border-white/30 hover:border-white text-white font-medium px-8 py-4 rounded-full text-lg transition-colors"
            >
              Voir les événements
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {[
              { val: "40+", label: "clubs partenaires" },
              { val: "1 000+", label: "événements publiés" },
              { val: "0€", label: "pour publier" },
              { val: "2%", label: "de commission" },
            ].map((stat) => (
              <div key={stat.val} className="text-center">
                <div className="text-3xl font-black text-orange-500">{stat.val}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logos clubs */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Ils nous font confiance
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {CLUBS.map((club) => (
              <span key={club} className="bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
                {club}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6 fonctionnalités */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-center text-gray-500 mb-16 max-w-xl mx-auto">
            Des outils pensés pour les organisateurs sportifs, pas pour les grandes entreprises.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-black text-lg mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm mb-2">{step.desc}</p>
                <span className="text-orange-500 font-semibold text-xs">⏱ {step.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Tarifs transparents</h2>
          <p className="text-center text-gray-500 mb-16">Pas de surprise. Pas d'abonnement caché.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-black mb-2">Gratuit</h3>
              <div className="text-4xl font-black mb-6">0€<span className="text-base font-normal text-gray-500">/mois</span></div>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Publication d'événements illimitée",
                  "Fiche organisation publique",
                  "Billetterie avec 2% de commission",
                  "Scanner QR",
                  "Dashboard analytics",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-green-500 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth?tab=signup"
                className="mt-8 block text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-full transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>

            <div className="border-2 border-orange-500 rounded-2xl p-8 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                Bientôt disponible
              </span>
              <h3 className="text-xl font-black mb-2">Pro</h3>
              <div className="text-4xl font-black mb-6">49€<span className="text-base font-normal text-gray-500">/mois</span></div>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  "Tout le plan Gratuit",
                  "0% de commission sur les billets",
                  "Page événement personnalisée",
                  "Export participants CSV",
                  "Support prioritaire",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className="mt-8 w-full text-center bg-gray-100 text-gray-400 font-bold py-3 rounded-full cursor-not-allowed"
              >
                En cours de développement
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-24 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-black text-center mb-16">Questions fréquentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-orange-500 shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-orange-500 py-24 px-4 text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6">
            Prêt à lancer votre prochain événement ?
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Rejoignez les clubs qui font confiance à Panache. Gratuit pour commencer.
          </p>
          <Link
            to="/auth?tab=signup"
            className="bg-white text-orange-500 hover:bg-orange-50 font-black px-10 py-5 rounded-full text-xl inline-block transition-colors shadow-lg"
          >
            Créer mon compte gratuitement →
          </Link>
          <p className="text-white/60 text-sm mt-6">
            Une question ? Écrivez à frank@panache.ws — je réponds personnellement.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Organisateurs;
