import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const CtaBand = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#0A0A0A]">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white font-poppins">
          Ton prochain événement commence ici
        </h2>
        <p className="text-lg mb-10 text-white/60 max-w-2xl mx-auto leading-relaxed">
          Rejoins les 40+ clubs qui ont choisi Panache pour créer des événements sportifs exceptionnels.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="text-lg px-10 py-4 h-auto bg-[#F97316] text-white hover:bg-[#EA6C0A] font-bold rounded-xl"
          >
            <Link to="/auth?tab=signup">
              Créer votre événement sur Panache
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-white/40 text-sm">
            Aucune carte bancaire requise · Gratuit pour publier
          </p>
        </div>
      </div>
    </section>
  );
};
