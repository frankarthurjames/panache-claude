import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ClaimEvent = () => {
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", organization: "" });

  useEffect(() => {
    if (!id) return;
    supabase
      .from("events")
      .select("id, title, city, starts_at")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.organization) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setSubmitting(true);
    try {
      const htmlContent = `
        <h2>Nouvelle demande de revendication d'événement</h2>
        <p><strong>Événement :</strong> ${event?.title} (ID: ${id})</p>
        <hr />
        <p><strong>Nom :</strong> ${form.name}</p>
        <p><strong>Email :</strong> ${form.email}</p>
        <p><strong>Organisation :</strong> ${form.organization}</p>
      `;
      const { error } = await supabase.functions.invoke("send-brevo-email", {
        body: {
          to: "bonjour@panachesport.fr",
          templateKey: "raw",
          params: {
            subject: `Revendication d'événement — ${event?.title}`,
            htmlContent,
          },
        },
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Une erreur est survenue. Réessayez ou contactez-nous directement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-semibold">Événement introuvable.</p>
        <Link to="/events" className="text-orange-500 hover:underline">Retour aux événements</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar variant="transparent" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 max-w-lg">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Revendiquer cet événement</h1>
          <p className="text-gray-500 text-sm">
            Événement concerné :{" "}
            <span className="font-semibold text-gray-800">{event.title}</span>
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-semibold text-lg mb-2">Demande envoyée !</p>
            <p className="text-green-600 text-sm">
              Votre demande sera examinée par l'équipe Panache sous 48h.
            </p>
            <Link
              to={`/events/${id}`}
              className="mt-4 inline-block text-orange-500 hover:underline text-sm font-medium"
            >
              Retour à l'événement →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jean Dupont"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="jean@monclub.fr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Nom de l'organisation</Label>
              <Input
                id="organization"
                value={form.organization}
                onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                placeholder="Club Sportif de Lyon"
              />
            </div>

            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
              Votre demande sera examinée par l'équipe Panache sous 48h.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ClaimEvent;
