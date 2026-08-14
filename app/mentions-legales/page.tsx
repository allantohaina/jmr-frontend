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

        <div className="space-y-12 text-[#eccc90]/80 leading-relaxed font-body">
          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">1. Éditeur du site</h2>
            <div className="space-y-3 text-lg">
              <p>Le présent site est édité par <strong className="text-[#e5ad46]">JMR TEXTILE</strong>.</p>
              <ul className="space-y-3 mt-6">
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Activité : conception, confection et commercialisation textile, sous-traitance et production B2B, marchés nationaux et internationaux</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Pays d&apos;enregistrement : République de Madagascar</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Numéro Statistique : 14103 11 2025 0 11392</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Numéro d&apos;Identification Fiscale (NIF) : 5019469178</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Numéro RCS : 2025801369</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Carte fiscale valide jusqu&apos;au : 31/03/2026</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Siège social : Lot 59 C II Behitsy, Ambohimangakely, Madagascar</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Unité opérationnelle fiscale : EDBM</span></li>
              </ul>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">2. Responsable légal</h2>
            <p className="text-lg">
              Responsable : <strong className="text-[#e5ad46]">JMR TEXTILE</strong> (entreprise individuelle — informations conformes aux registres fiscaux malgaches).
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">3. Activité</h2>
            <p className="text-lg">
              JMR TEXTILE exerce une activité de conception, confection et commercialisation textile, incluant la sous-traitance et la production orientée marchés nationaux et internationaux, exclusivement en B2B.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">4. Hébergement</h2>
            <p className="text-lg">
              Le site est hébergé par <strong className="text-[#e5ad46]">Tranokala</strong>, une solution d&apos;hébergement basée sur cPanel, disponible sur{" "}
              <a href="https://tranokala.pro" target="_blank" rel="noopener noreferrer" className="text-[#e5ad46] hover:text-[#eccc90] underline underline-offset-4">tranokala.pro</a>.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">5. Propriété intellectuelle</h2>
            <p className="text-lg">
              L&apos;ensemble des contenus présents sur ce site (textes, visuels, logos, documents, structure) est la propriété exclusive de JMR TEXTILE, sauf mention contraire. Toute reproduction, diffusion ou exploitation sans autorisation écrite préalable est strictement interdite.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">6. Responsabilité</h2>
            <p className="text-lg">
              Les informations présentées sur le site sont fournies à titre informatif. JMR TEXTILE ne saurait être tenue responsable d&apos;erreurs ou omissions, d&apos;interruptions temporaires du site ou de l&apos;utilisation faite des informations publiées. Aucune information du site ne constitue une offre contractuelle sans validation écrite.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">7. Données personnelles</h2>
            <p className="text-lg">
              Le traitement des données personnelles est régi par la Politique de Confidentialité disponible sur le site. L&apos;utilisateur est invité à la consulter pour connaître ses droits :{" "}
              <Link href="/confidentialite" className="text-[#e5ad46] hover:text-[#eccc90] underline underline-offset-4">Politique de Confidentialité</Link>.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">8. Droit applicable</h2>
            <p className="text-lg">
              Le présent site est soumis au droit malgache. Tout litige relève de la compétence exclusive des juridictions malgaches.
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