import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CtaBand = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A]">
      <div className="container mx-auto text-center">
        <h2 className="font-poppins font-extrabold text-white tracking-[-0.02em] mb-4"
            style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
          Ton prochain événement commence ici
        </h2>
        <p className="text-white/50 text-base mb-10 max-w-xl mx-auto leading-relaxed">
          Rejoins les 40+ clubs qui ont choisi Panache pour créer des événements sportifs exceptionnels.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/auth?tab=signup"
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold text-base px-8 py-4 rounded-xl transition-colors"
          >
            Créer votre événement sur Panache
            <ArrowRight className="h-5 w-5" />
          </Link>
          <p className="text-white/30 text-sm">
            Aucune carte bancaire requise · Gratuit pour publier
          </p>
        </div>
      </div>
    </section>
  );
};
