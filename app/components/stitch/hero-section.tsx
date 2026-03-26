import Image from "next/image";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative px-6 md:px-12 py-20 lg:py-32 max-w-[1440px] mx-auto overflow-hidden bg-surface-container-low rounded-b-[3rem] shadow-sm" data-nav-section="accueil" id="accueil">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,_#e9c176_0%,_transparent_50%)] opacity-20 pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="grid lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="w-12 h-[1px] bg-orange-500"></span>
            <span className="font-label text-[11px] uppercase tracking-[0.2em] text-orange-500 font-bold">Atelier Moderne pour Professionnels</span>
          </div>
          <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl font-light tracking-tight text-primary leading-[1.1] mb-8">
            Votre Partenaire <br />
            <span className="italic text-orange-500">de Confiance.</span>
          </h1>
          <p className="font-body text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
            Nous accompagnons les marques et les créateurs avec une approche collaborative. Notre priorité : un travail bien fait et une transparence totale, du prototype à la petite série.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#nos-services" className="bg-primary text-on-primary px-10 py-5 rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:bg-orange-600 transition-colors shadow-xl shadow-primary/20 text-center">
              Découvrir nos solutions
            </Link>
            <Link href="#acces-client" className="border border-outline-variant text-primary px-10 py-5 rounded-xl font-body font-bold uppercase tracking-widest text-xs hover:border-orange-500 hover:text-orange-500 transition-all text-center">
              Demander un devis
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-0 border-8 border-white">
            <Image
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              src="/human_images/08_salle_machines_coudre.jpg"
              alt="Environnement d'atelier moderne avec stockage pratique des tissus et équipement professionnel"
              fill
              priority
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-64 aspect-square rounded-2xl overflow-hidden border-[12px] border-white shadow-2xl hidden md:block z-30">
            <Image
              className="w-full h-full object-cover"
              src="/human_images/07_coupe_machine_denim.jpg"
              alt="Vue détaillée de la couture professionnelle sur un tissu durable"
              fill
            />
          </div>
        </div>
      </div>
    </section>
  );
}
