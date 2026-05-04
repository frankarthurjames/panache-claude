# Panache — CLAUDE.md

Plateforme de découverte et billetterie d'événements sportifs.
Site : panache.ws · Stack : React + Supabase + Vercel · Solo founder: Frank

---

## Contexte produit

- Beta live : +1 000 événements, +40 clubs inscrits
- Modèle : 0€ pour publier, 2% de commission sur les billets vendus
- Objectif immédiat : premier billet vendu en mai 2026
- Fundraising en cours : cible 5M€

---

## Stack technique

| Couche | Techno |
|---|---|
| Frontend | React (Lovable) |
| Backend / BDD | Supabase (Postgres + Auth + Storage + Edge Functions) |
| Paiement | Stripe Connect (mode live) |
| Emailing | Brevo |
| Déploiement | Vercel |
| Langue | TypeScript partout |

**Supabase project ID** : `wlxbydzshqijlfejqafp`
**Webhook Stripe** : `https://wlxbydzshqijlfejqafp.supabase.co/functions/v1/stripe-webhook`

---

## Design system

### Variables CSS — toujours utiliser les variables, jamais de valeurs hardcodées

```css
:root {
  --color-primary: #F97316;        /* CTA, boutons primaires, accents */
  --color-primary-hover: #EA6C0A;  /* Hover boutons orange */
  --color-primary-light: #FFF7ED;  /* Backgrounds bannières, badges */
  --color-black: #0A0A0A;          /* Header, footer, hero */
  --color-text: #1A1A1A;           /* Corps de texte, titres sur fond blanc */
  --color-text-muted: #6B6B6B;     /* Sous-titres, descriptions, labels */
  --color-bg: #F5F4F2;             /* Fond de page, cartes secondaires */
  --color-border: #E5E5E5;         /* Séparateurs, bordures */
  --color-success: #22C55E;        /* Billets gratuits, confirmations */
  --color-error: #EF4444;          /* Erreurs, urgence places */
}
```

### Typographie

| Élément | Police | Taille | Poids |
|---|---|---|---|
| H1 · Hero | Syne | 28–48px | 800 |
| H2 · Sections | Syne | 22–32px | 700 |
| H3 · Titres cartes | Syne | 17–20px | 700 |
| H4 · Labels | DM Sans | 14–16px | 600 |
| Body | DM Sans | 16px min | 400 |
| Small · Méta | DM Sans | 13px | 400 |
| Badge | DM Sans | 11px | 700 + uppercase |

**Règles globales :**
- Body minimum 16px sur mobile
- `line-height: 1.6` minimum
- `letter-spacing: -0.02em` sur H1/H2
- `-webkit-line-clamp: 2` + `text-overflow: ellipsis` sur toutes les cartes — jamais de tiret coupant un mot

### Boutons

- **Primaire** : fond `#F97316`, texte blanc, hauteur min 48px mobile
- **Secondaire** : outline `border: 1px solid #E5E5E5`, texte `#1A1A1A`
- **Succès** : fond `#22C55E`, texte blanc (billets gratuits)
- **Désactivé** : fond gris, texte gris (ex: "Contacter l'organisateur")
- **Interdit** : aucun bouton noir — remplacer systématiquement par orange ou outline

---

## Règles UI non négociables

1. **Jamais afficher** "Prix non disponible", "Aucun billet configuré", "Lieu non précisé" — toujours un fallback défini
2. **Images manquantes** → image générique par sport (1200x630px stockées dans Supabase Storage)
3. **Sections vides** → masquer la section, ne jamais laisser un bloc vide visible
4. **CTA mobile** → barre fixe `position: fixed; bottom: 0` sur les fiches événement (max-width 768px)
5. **Chiffres dynamiques** → toujours lire depuis Supabase, jamais hardcodés
6. **Connexion** → Google + email uniquement, pas de GitHub

---

## Architecture Supabase — patterns à respecter

### Edge Functions
- Dossier : `supabase/functions/<nom>/index.ts`
- Variables d'environnement via Supabase Secrets (jamais dans le code)
- Secrets requis : `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`

### Sécurité RLS
- Toujours vérifier les policies RLS avant d'écrire une query
- Le statut Stripe d'une organisation n'est pas une donnée sensible → lecture publique OK
- Ne jamais vérifier le membership pour des données publiques (bug check-connect-status)

### Webhooks
- Supabase → Brevo : déclenché sur INSERT dans `auth.users`
- Propriété Brevo à synchroniser : `nb_evenements` (integer, défaut 0)
- Stripe webhook : écouter uniquement `checkout.session.completed`

---

## Onboarding clubs — logique métier

```
nb_evenements == 0 ET compte < 30 jours → afficher bannière in-app
nb_evenements >= 1 → masquer bannière définitivement

Bannière style :
  border-left: 4px solid #F97316
  background: #FFF7ED
  border: 1px solid rgba(249,115,22,0.3)

Bouton "Me le rappeler plus tard" → masque 48h via localStorage, réapparaît ensuite
```

**Séquence Brevo :**
- J+0 : email bienvenue (expéditeur : Frank de Panache `<frank@panache.ws>`, texte brut, sans footer Brevo)
- J+7 : relance si `nb_evenements == 0`
- J+14 : dernière relance si `nb_evenements == 0`
- Arrêter la séquence dès `nb_evenements >= 1`

---

## Comportement frontend attendu par page

### Page d'accueil (`/`)
- H1 : "Le sport près de chez vous — enfin visible."
- Sous-titre : "Découvrez et réservez vos billets pour tous les événements sportifs en France."
- Moteur de recherche : 3 champs — Lieu, Sport, Date (`input type="date"`, placeholder "Quand ?")
- Mobile : champs empilés verticalement, bouton recherche pleine largeur
- Preuves sociales dynamiques : 40+ clubs, 1 000+ événements, 0€ pour publier, 2% de commission

### Fiche événement (`/events/:id`)
- Barre CTA fixe en bas sur mobile : prix à gauche + bouton orange à droite, hauteur min 64px
- États du CTA : Gratuit (vert) / Payant (orange) / Sans billet (gris "Contacter l'organisateur")
- Urgence : si capacité renseignée et < 20% restants → "⚡ Plus que X places" en rouge
- Partage : WhatsApp, Instagram, Facebook, Copier le lien

### Dashboard organisateur (`/dashboard`)
- Bannière onboarding en haut si `nb_evenements == 0`
- Métriques : événements / participants / revenus (depuis Supabase, jamais hardcodé)

### Page organisateurs (`/organisateurs`)
- Hero fond noir
- Titre : "Votre événement mérite d'être vu. On s'occupe du reste."
- CTA primaire : "Créer mon événement gratuitement →" (orange)
- CTA secondaire : "Voir comment ça marche" (outline blanc)

---

## Stripe — règles

- Toujours mode **live** (pas test)
- Vérifier KYB Stripe avant tout test de paiement réel
- Flux : checkout Stripe → webhook `checkout.session.completed` → Edge Function → écriture Supabase
- Commission : 2% prélevée via Stripe Connect

---

## Ce qu'il ne faut jamais faire

- Hardcoder des chiffres (clubs, événements, revenus) → toujours Supabase
- Laisser des états vides visibles → toujours un fallback
- Utiliser des couleurs orange en dur (`#C2410C`, `#EA580C`) → toujours `var(--color-primary)`
- Afficher des boutons noirs → orange ou outline
- Mettre des secrets dans le code → Supabase Secrets uniquement
- Vérifier le membership pour des données publiques → bug bloquant pour les acheteurs

---

## Images génériques par sport (Supabase Storage)

Format : 1200×630px
Sports couverts : triathlon, cyclisme, running, football, tennis, judo, badminton, natation, athlétisme, handball, escalade, yoga

Logique : si `event.image_url == null` → afficher `sport_images[event.sport]`

---

## Frontend design — guidelines esthétiques

Avant de coder un composant ou une page :
1. Identifier le contexte et l'audience (acheteur, club, investisseur)
2. Respecter le design system Panache (couleurs, typo ci-dessus)
3. Priorité mobile-first — tester à 375px de large
4. Motion : préférer CSS animations légères, pas de lib lourde
5. Composition : générosité dans les whitespaces, jamais de layout étouffé

**À éviter absolument** : layouts trop centrés, gradients génériques, coins arrondis uniformes sur tout, Inter/Roboto/Arial comme police principale.

---

## Webapp testing — Playwright

Pour tester le flux d'achat ou l'onboarding :

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('https://panache.ws')
    page.wait_for_load_state('networkidle')  # CRITIQUE : attendre le JS
    # ... actions
    browser.close()
```

Pattern obligatoire : **reconnaissance → sélecteurs → actions** (jamais agir sans avoir inspecté le DOM rendu)

---

## Notes techniques internes

- Supabase client : `@/integrations/supabase/client`
- Types DB : `@/integrations/supabase/types`
- `.eq("sports.slug", x)` sur joined relation → ne fonctionne pas server-side → filtrer côté client
- `optimizeImage(url?)` dans `@/lib/utils` → cible les URLs Supabase Storage
- Navbar height : 64px · sticky filters bar : `top: 64px`
- PANACHE_ORG_ID : `6f8c37be-e1f5-4a19-98c3-98946ea7d034`
- Git workflow : branch `sprint-corrections` → ff-merge → push `main`

---

*Dernière mise à jour : mai 2026*
