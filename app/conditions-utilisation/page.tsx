import Link from "next/link";

export default function ConditionsUtilisation() {
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
          <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Règles & Accès</span>
          <h1 className="font-headline text-6xl md:text-7xl text-[#e5ad46] leading-none mb-8">
            Conditions <br /><span className="italic text-[#eccc90] font-normal">d&apos;utilisation.</span>
          </h1>
          <div className="w-20 h-1 bg-[#e5ad46]"></div>
        </header>

        <div className="space-y-12 text-[#eccc90]/80 leading-relaxed font-body">
          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Objet</h2>
            <p className="text-lg">
              Les présentes conditions définissent les règles d&apos;accès et d&apos;utilisation du site <strong className="text-[#e5ad46]">JMR Textile</strong>, de ses formulaires, de son espace client et des services de suivi proposés en ligne.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Acceptation des conditions</h2>
            <p className="text-lg">
              En utilisant ce site, vous acceptez les présentes conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, nous vous invitons à ne pas utiliser les services proposés sur le site.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Accès aux services</h2>
            <div className="space-y-4 text-lg">
              <p>
                L&apos;accès à certaines fonctionnalités peut nécessiter la création d&apos;un compte client. Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription ou de toute demande de devis.
              </p>
              <p>
                JMR Textile se réserve le droit de suspendre ou de limiter l&apos;accès à un compte en cas d&apos;usage abusif, frauduleux ou contraire aux présentes conditions.
              </p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Demandes de devis et projets</h2>
            <p className="text-lg">
              Les informations transmises dans le cadre d&apos;une demande de devis servent à étudier votre projet textile et à vous proposer un accompagnement adapté. Un devis ne devient contractuel qu&apos;après validation explicite des parties concernées.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Responsabilités de l&apos;utilisateur</h2>
            <p className="text-lg">
              Vous vous engagez à utiliser le site de manière loyale, à ne pas perturber son fonctionnement et à ne pas tenter d&apos;accéder à des données, comptes ou espaces qui ne vous sont pas destinés.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Propriété intellectuelle</h2>
            <p className="text-lg">
              Les contenus du site, notamment les textes, visuels, logos, interfaces et éléments graphiques, sont protégés par les règles applicables en matière de propriété intellectuelle. Toute reproduction ou réutilisation non autorisée est interdite.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Disponibilité du site</h2>
            <p className="text-lg">
              Nous faisons nos meilleurs efforts pour assurer l&apos;accessibilité du site, mais ne pouvons garantir une disponibilité continue. Des interruptions peuvent survenir pour maintenance, mise à jour ou incident technique.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Modification des conditions</h2>
            <p className="text-lg">
              JMR Textile peut modifier ces conditions d&apos;utilisation afin de tenir compte de l&apos;évolution du site, des services ou des obligations légales. La version publiée en ligne est celle applicable au moment de votre utilisation.
            </p>
          </section>

          <section className="bg-[#e5ad46]/5 p-10 rounded-[2.5rem] border border-[#e5ad46]/10 text-center">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Contact</h2>
            <p className="text-lg mb-8">
              Pour toute question concernant ces conditions, vous pouvez nous contacter à l&apos;adresse suivante :
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
