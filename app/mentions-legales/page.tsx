import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="min-h-screen bg-[#1e2a38] pt-32 pb-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_100%_0%,_#e5ad46_0%,_transparent_50%)] opacity-10 pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#e5ad46]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-[#e5ad46] hover:text-[#eccc90] transition-colors mb-16 font-bold uppercase tracking-[0.2em] text-[10px] group">
          <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Retour à l&apos;accueil
        </Link>
        
        <header className="mb-20">
          <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Informations légales</span>
          <h1 className="font-headline text-6xl md:text-7xl text-[#e5ad46] leading-none mb-8">
            Mentions <br /><span className="italic text-[#eccc90] font-normal">Légales.</span>
          </h1>
          <div className="w-20 h-1 bg-[#e5ad46]"></div>
        </header>

        <div className="space-y-16 text-[#eccc90]/80 leading-relaxed font-body">
          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Éditeur du site</h2>
            <div className="space-y-4 text-lg">
              <p>
                Le site <strong className="text-[#e5ad46]">JMR Textile</strong> est édité par la société JMR Textile SARL, dont le siège social est situé à Antananarivo, Madagascar.
              </p>
              <p>
                Immatriculée au Registre du Commerce et des Sociétés (RCS) de Madagascar.
              </p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Directeur de la publication</h2>
            <p className="text-lg">[Nom du responsable], en sa qualité de Gérant.</p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Hébergement</h2>
            <p className="text-lg">
              Le site est hébergé par [Nom de l&apos;hébergeur], situé à [Adresse de l&apos;hébergeur].
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Propriété intellectuelle</h2>
            <p className="text-lg">
              L&apos;ensemble de ce site relève de la législation malagasy et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
            </p>
          </section>

          <section className="bg-[#e5ad46]/5 p-10 rounded-[2.5rem] border border-[#e5ad46]/10 text-center">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Contact</h2>
            <p className="text-lg mb-8">
              Pour toute question, vous pouvez nous contacter par e-mail à l&apos;adresse suivante :
            </p>
            <a href="mailto:contact@jmrtextile.com" className="inline-block px-8 py-4 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#eccc90] transition-all shadow-lg shadow-[#e5ad46]/20">
              contact@jmrtextile.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
