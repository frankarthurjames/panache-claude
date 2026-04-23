import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Fiche = () => {
  const { orgId } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sports, setSports] = useState<{ id: string; name: string }[]>([]);

  const [formData, setFormData] = useState({
    logo_url: "",
    name: "",
    sport_id: "",
    founded_year: "" as string | number,
    members_count: "" as string | number,
    federation: "",
    description: "",
    practice_type: "",
    public_type: "",
    bon_a_savoir: "",
    venue_1: "",
    venue_2: "",
    venue_3: "",
    accessibility_pmr: false,
  });

  useEffect(() => {
    supabase
      .from('sports' as any)
      .select('id, name')
      .order('name')
      .then(({ data }) => { if (data) setSports(data as any); });
  }, []);

  useEffect(() => {
    if (!orgId) return;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('*, sports:sport_id(id, name)')
          .eq('id', orgId)
          .single();
        if (error) throw error;
        setFormData({
          logo_url: data.logo_url || "",
          name: data.name || "",
          sport_id: data.sport_id || "",
          founded_year: data.founded_year || "",
          members_count: data.members_count || "",
          federation: data.federation || "",
          description: data.description || "",
          practice_type: data.practice_type || "",
          public_type: data.public_type || "",
          bon_a_savoir: data.bon_a_savoir || "",
          venue_1: data.venue_1 || "",
          venue_2: data.venue_2 || "",
          venue_3: data.venue_3 || "",
          accessibility_pmr: data.accessibility_pmr || false,
        });
      } catch (err) {
        toast.error("Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orgId]);

  const handleSave = async () => {
    if (!orgId || !user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          logo_url: formData.logo_url || null,
          name: formData.name,
          sport_id: formData.sport_id || null,
          founded_year: formData.founded_year ? Number(formData.founded_year) : null,
          members_count: formData.members_count ? Number(formData.members_count) : null,
          federation: formData.federation || null,
          description: formData.description || null,
          practice_type: formData.practice_type || null,
          public_type: formData.public_type || null,
          bon_a_savoir: formData.bon_a_savoir || null,
          venue_1: formData.venue_1 || null,
          venue_2: formData.venue_2 || null,
          venue_3: formData.venue_3 || null,
          accessibility_pmr: formData.accessibility_pmr,
        })
        .eq('id', orgId);
      if (error) throw error;
      toast.success("Fiche sauvegardée !");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ma fiche</h1>
          <p className="text-muted-foreground text-sm">Informations affichées sur votre page publique</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </div>

      {/* Identité */}
      <Card>
        <CardHeader>
          <CardTitle>Identité du club</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <ImageUpload
            value={formData.logo_url ? [formData.logo_url] : []}
            onChange={(imgs) => setFormData(p => ({ ...p, logo_url: imgs[0] || "" }))}
            maxImages={1}
            label="Logo"
          />
          <div className="space-y-2">
            <Label>Nom du club</Label>
            <Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Sport principal</Label>
            <Select value={formData.sport_id} onValueChange={(v) => setFormData(p => ({ ...p, sport_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un sport" /></SelectTrigger>
              <SelectContent>
                {sports.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Année de création</Label>
              <Input
                type="number" placeholder="Ex: 1998" min="1800" max="2030"
                value={formData.founded_year}
                onChange={(e) => setFormData(p => ({ ...p, founded_year: e.target.value ? parseInt(e.target.value) : "" }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Nombre de licenciés</Label>
              <Input
                type="number" placeholder="Ex: 250"
                value={formData.members_count}
                onChange={(e) => setFormData(p => ({ ...p, members_count: e.target.value ? parseInt(e.target.value) : "" }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fédération</Label>
            <Input
              placeholder="Ex: Fédération Française de Triathlon"
              value={formData.federation}
              onChange={(e) => setFormData(p => ({ ...p, federation: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={4} value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pratique */}
      <Card>
        <CardHeader>
          <CardTitle>Pratique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de pratique</Label>
              <Select value={formData.practice_type} onValueChange={(v) => setFormData(p => ({ ...p, practice_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Loisir, compétition..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Loisir">Loisir</SelectItem>
                  <SelectItem value="Compétition">Compétition</SelectItem>
                  <SelectItem value="Loisir et Compétition">Loisir et Compétition</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Public accueilli</Label>
              <Select value={formData.public_type} onValueChange={(v) => setFormData(p => ({ ...p, public_type: v }))}>
                <SelectTrigger><SelectValue placeholder="Enfants, adultes..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Enfants">Enfants</SelectItem>
                  <SelectItem value="Adultes">Adultes</SelectItem>
                  <SelectItem value="Tout public">Tout public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Bon à savoir</Label>
            <Textarea
              placeholder="Une info courte et marquante sur votre club..." maxLength={200} rows={3}
              value={formData.bon_a_savoir}
              onChange={(e) => setFormData(p => ({ ...p, bon_a_savoir: e.target.value }))}
            />
            <p className="text-xs text-gray-400 text-right">{formData.bon_a_savoir.length}/200</p>
          </div>
        </CardContent>
      </Card>

      {/* Lieux */}
      <Card>
        <CardHeader>
          <CardTitle>Lieux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: "venue_1", label: "Lieu 1" },
            { key: "venue_2", label: "Lieu 2 (optionnel)" },
            { key: "venue_3", label: "Lieu 3 (optionnel)" },
          ] as const).map(({ key, label }) => (
            <div key={key} className="space-y-2">
              <Label>{label}</Label>
              <Input
                placeholder="Ex: Gymnase des Tilleuls, 12 rue de la Paix, Lyon"
                value={formData[key]}
                onChange={(e) => setFormData(p => ({ ...p, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="pmr"
              checked={formData.accessibility_pmr}
              onCheckedChange={(v) => setFormData(p => ({ ...p, accessibility_pmr: !!v }))}
            />
            <label htmlFor="pmr" className="text-sm cursor-pointer">♿️ Accès PMR disponible</label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Fiche;
