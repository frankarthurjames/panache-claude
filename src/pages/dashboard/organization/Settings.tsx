import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, Shield, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Settings = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [stripeStatus, setStripeStatus] = useState({
    connected: false,
    details_submitted: false,
    charges_enabled: false,
    business_profile: null as any
  });

  const [orgData, setOrgData] = useState({
    siretNumber: "",
    billingCountry: "FR",
    email: "",
    phone: "",
    address: "",
    website: "",
    name: "",
    billingEmail: "",
  });

  useEffect(() => {
    if (!orgId) return;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', orgId)
          .single();
        if (error) throw error;
        setOrgData({
          siretNumber: data.siret_number || "",
          billingCountry: data.billing_country || "FR",
          email: data.billing_email || "",
          phone: data.phone || "",
          address: data.address || "",
          website: data.website || "",
          name: data.name || "",
          billingEmail: data.billing_email || "",
        });
        await checkStripeStatus();
      } catch {
        toast.error("Erreur lors du chargement");
      }
    };
    load();
  }, [orgId]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast.success("Configuration Stripe terminée avec succès !");
      setTimeout(() => checkStripeStatus(), 1000);
      navigate(`/dashboard/org/${orgId}/settings`, { replace: true });
    } else if (urlParams.get('refresh') === 'true') {
      checkStripeStatus();
      navigate(`/dashboard/org/${orgId}/settings`, { replace: true });
    }
  }, []);

  const checkStripeStatus = async () => {
    if (!user || !orgId) return;
    try {
      const { data, error } = await supabase.functions.invoke('check-connect-status', {
        body: { organizationId: orgId }
      });
      if (error) throw error;
      setStripeStatus(data);
    } catch {
      setStripeStatus({ connected: false, details_submitted: false, charges_enabled: false, business_profile: null });
    }
  };

  const handleSave = async () => {
    if (!orgId || !user) return;
    setIsLoading(true);
    try {
      const { error: memberError } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single();
      if (memberError) {
        toast.error("Vous n'avez pas les droits pour modifier cette organisation");
        return;
      }
      const { error } = await supabase
        .from('organizations')
        .update({
          siret_number: orgData.siretNumber || null,
          billing_country: orgData.billingCountry || null,
          billing_email: orgData.billingEmail || null,
          phone: orgData.phone || null,
          address: orgData.address || null,
          website: orgData.website || null,
        })
        .eq('id', orgId);
      if (error) throw error;
      toast.success("Paramètres sauvegardés !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!user || !orgId) return;
    setLoadingStripe(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        body: { organizationId: orgId, organizationName: orgData.name, organizationEmail: orgData.billingEmail || user.email }
      });
      if (error) throw error;
      window.location.href = data.onboardingUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la connexion à Stripe");
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleDisconnectStripe = async () => {
    if (!user || !orgId) return;
    setLoadingStripe(true);
    try {
      const { error } = await supabase.functions.invoke('disconnect-stripe', { body: { organizationId: orgId } });
      if (error) throw error;
      setStripeStatus({ connected: false, details_submitted: false, charges_enabled: false, business_profile: null });
      toast.success("Compte Stripe déconnecté");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres & facturation</h1>
          <p className="text-muted-foreground text-sm">Informations légales, contact et paiements</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
          {isLoading ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      {/* Informations légales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Informations légales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siretNumber">Numéro SIRET</Label>
            <Input
              id="siretNumber"
              value={orgData.siretNumber}
              onChange={(e) => setOrgData(p => ({ ...p, siretNumber: e.target.value }))}
              maxLength={14}
              placeholder="14 chiffres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCountry">Pays de facturation</Label>
            <Input
              id="billingCountry"
              value={orgData.billingCountry}
              onChange={(e) => setOrgData(p => ({ ...p, billingCountry: e.target.value }))}
              placeholder="FR"
            />
          </div>
        </CardContent>
      </Card>

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Informations de contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="billingEmail">Email de contact</Label>
            <Input
              id="billingEmail"
              type="email"
              value={orgData.billingEmail}
              onChange={(e) => setOrgData(p => ({ ...p, billingEmail: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              type="tel"
              value={orgData.phone}
              onChange={(e) => setOrgData(p => ({ ...p, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={orgData.address}
              onChange={(e) => setOrgData(p => ({ ...p, address: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Site web</Label>
            <Input
              id="website"
              type="url"
              value={orgData.website}
              onChange={(e) => setOrgData(p => ({ ...p, website: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stripe Connect */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Connect</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Statut</span>
            <Badge variant={stripeStatus.connected && stripeStatus.charges_enabled ? "default" : "secondary"}>
              {stripeStatus.connected && stripeStatus.charges_enabled
                ? "Actif"
                : stripeStatus.connected
                ? "En cours de configuration"
                : "Non connecté"}
            </Badge>
          </div>

          {stripeStatus.connected ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {stripeStatus.charges_enabled
                  ? "Votre compte Stripe est connecté et peut recevoir des paiements."
                  : "Configuration en cours. Veuillez finaliser votre onboarding Stripe."}
              </p>
              {stripeStatus.business_profile?.name && (
                <p className="text-sm font-medium">{stripeStatus.business_profile.name}</p>
              )}
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => window.open('https://dashboard.stripe.com/', '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Dashboard Stripe
                </Button>
                <Button variant="outline" size="sm" onClick={checkStripeStatus} disabled={loadingStripe}>
                  Actualiser le statut
                </Button>
                {!stripeStatus.charges_enabled && (
                  <Button variant="outline" size="sm" onClick={handleConnectStripe} disabled={loadingStripe}>
                    Finaliser la configuration
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDisconnectStripe} disabled={loadingStripe}>
                  {loadingStripe ? "Déconnexion..." : "Déconnecter"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connectez Stripe pour recevoir des paiements pour vos événements.
              </p>
              <Button size="sm" className="w-full" onClick={handleConnectStripe} disabled={loadingStripe || !orgData.name || !orgData.billingEmail}>
                {loadingStripe ? "Connexion..." : "Connecter Stripe"}
              </Button>
              {(!orgData.name || !orgData.billingEmail) && (
                <p className="text-xs text-muted-foreground">
                  Veuillez d'abord renseigner le nom et l'email de facturation
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
