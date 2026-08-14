import Link from "next/link";

export default function Confidentialite() {
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
          <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Confidentialité</span>
          <h1 className="font-headline text-6xl md:text-7xl text-[#e5ad46] leading-none mb-8">
            Politique de <br /><span className="italic text-[#eccc90] font-normal">Confidentialité.</span>
          </h1>
          <div className="w-20 h-1 bg-[#e5ad46]"></div>
        </header>

        <div className="space-y-12 text-[#eccc90]/80 leading-relaxed font-body">
          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">1. Introduction</h2>
            <p className="text-lg">
              La présente Politique de Confidentialité décrit la manière dont <strong className="text-[#e5ad46]">JMR TEXTILE</strong> collecte, utilise et protège les données personnelles des utilisateurs de son site internet et de ses clients professionnels, dans le cadre de ses activités de confection et sous-traitance textile B2B.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">2. Données collectées</h2>
            <div className="space-y-4 text-lg">
              <p>JMR TEXTILE peut collecter les données suivantes :</p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Nom, prénom</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Nom de l&apos;entreprise</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Adresse e-mail professionnelle</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Numéro de téléphone</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Informations liées aux demandes de devis ou projets textiles</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Données techniques de navigation (cookies, adresse IP, type de navigateur)</span></li>
              </ul>
              <p>Aucune donnée sensible n&apos;est collectée volontairement.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">3. Finalité de la collecte</h2>
            <div className="space-y-4 text-lg">
              <p>Les données collectées sont utilisées exclusivement pour :</p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Répondre aux demandes de contact ou de devis</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Gérer la relation commerciale B2B</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Assurer le suivi des projets et commandes</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Améliorer le fonctionnement et la sécurité du site</span></li>
              </ul>
              <p>Les données ne sont ni vendues, ni louées, ni cédées à des tiers.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">4. Base légale du traitement</h2>
            <p className="text-lg">
              Les traitements de données sont fondés sur l&apos;intérêt légitime de JMR TEXTILE à développer son activité, l&apos;exécution de mesures précontractuelles ou contractuelles à la demande du client, ainsi que sur le consentement de l&apos;utilisateur lorsque requis (cookies).
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">5. Durée de conservation</h2>
            <div className="space-y-4 text-lg">
              <p>Les données sont conservées pendant la durée nécessaire au traitement de la demande ou du contrat, puis archivées pour une durée maximale conforme aux obligations légales et commerciales.</p>
              <p>Les données de prospection non contractualisées peuvent être supprimées sur demande.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">6. Partage des données</h2>
            <p className="text-lg">
              Les données peuvent être partagées uniquement avec les membres internes de JMR TEXTILE et les prestataires techniques nécessaires au fonctionnement du site (hébergement, messagerie). Aucun transfert commercial de données à des tiers n&apos;est effectué.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">7. Sécurité des données</h2>
            <p className="text-lg">
              JMR TEXTILE met en œuvre des mesures techniques et organisationnelles raisonnables afin de protéger les données contre l&apos;accès non autorisé, la perte, l&apos;altération ou la divulgation.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">8. Droits des utilisateurs</h2>
            <div className="space-y-4 text-lg">
              <p>Conformément à la réglementation applicable, les utilisateurs disposent des droits suivants :</p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Droit d&apos;accès</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Droit de rectification</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Droit de suppression</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Droit d&apos;opposition au traitement</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Droit à la limitation du traitement</span></li>
              </ul>
              <p>Toute demande peut être adressée par e-mail à l&apos;adresse de contact indiquée ci-dessous.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">9. Cookies</h2>
            <p className="text-lg">
              Le site peut utiliser des cookies à des fins de fonctionnement, de mesure d&apos;audience et d&apos;amélioration de l&apos;expérience utilisateur. L&apos;utilisateur peut configurer ou refuser les cookies via la bannière de consentement ou les paramètres de son navigateur.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">10. Modification de la politique</h2>
            <p className="text-lg">
              JMR TEXTILE se réserve le droit de modifier la présente Politique de Confidentialité à tout moment afin de rester conforme aux évolutions légales ou techniques. La version applicable est celle publiée sur le site à la date de consultation.
            </p>
          </section>

          <section className="bg-[#e5ad46]/5 p-10 rounded-[2.5rem] border border-[#e5ad46]/10 text-center">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Contact</h2>
            <p className="text-lg mb-8">
              Pour toute question relative à la protection des données personnelles, contactez-nous :
            </p>
            <a href="mailto:privacy@jmrtextile.com" className="inline-block px-8 py-4 bg-[#e5ad46] text-[#1e2a38] text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#eccc90] transition-all shadow-lg shadow-[#e5ad46]/20">
              privacy@jmrtextile.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}