import { useState } from "react";
import { Link } from "react-router-dom";

interface OnboardingBannerProps {
  userName: string;
  hasOrganization: boolean;
  nbEvents: number;
  accountCreatedAt: Date;
}

export function OnboardingBanner({ userName, hasOrganization, nbEvents, accountCreatedAt }: OnboardingBannerProps) {
  const [dismissed, setDismissed] = useState(() => {
    const dismissedUntil = localStorage.getItem('onboarding_dismissed_until');
    return dismissedUntil ? new Date(dismissedUntil) > new Date() : false;
  });

  const isRecent = (new Date().getTime() - accountCreatedAt.getTime()) < 30 * 24 * 60 * 60 * 1000;

  if (nbEvents >= 1 || !isRecent || dismissed) return null;

  const handleDismiss = () => {
    const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000);
    localStorage.setItem('onboarding_dismissed_until', in48h.toISOString());
    setDismissed(true);
  };

  const ctaHref = hasOrganization ? '/dashboard/organizations/new' : '/dashboard/organizations/new';
  const ctaLabel = hasOrganization ? 'Créer mon premier événement →' : 'Commencer →';

  return (
    <div className="border-l-4 border-orange-500 bg-orange-50 border border-orange-200 rounded-lg p-5 mb-6 flex items-start justify-between gap-4">
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 mb-1">
          Bienvenue sur Panache, {userName} !
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          Publiez votre premier événement en 3 étapes pour être visible dès aujourd'hui.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="text-green-600 font-medium">✓ Compte créé</span>
          <span className={hasOrganization ? "text-green-600 font-medium" : "text-orange-500 font-medium"}>
            {hasOrganization ? '✓' : '○'} Créer mon organisation
          </span>
          <span className="text-gray-400">○ Publier un événement</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 items-end shrink-0">
        <Link
          to={ctaHref}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
        >
          {ctaLabel}
        </Link>
        <button onClick={handleDismiss} className="text-xs text-gray-400 underline hover:text-gray-600">
          Me le rappeler plus tard
        </button>
      </div>
    </div>
  );
}
