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

          <div className="flex items-center gap-6 pt-6">
            <div className="h-px flex-1 bg-[#e5ad46]/20"></div>
            <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em]">Conditions Générales de Vente</span>
            <div className="h-px flex-1 bg-[#e5ad46]/20"></div>
          </div>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">1. Objet des CGV</h2>
            <p className="text-lg">
              Les présentes Conditions Générales de Vente (CGV) définissent les droits et obligations de la société JMR TEXTILE et de ses clients dans le cadre de prestations de sourcing, développement, confection et sous-traitance textile, réalisées exclusivement en B2B.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">2. Champ d&apos;application</h2>
            <div className="space-y-4 text-lg">
              <p>Les présentes CGV s&apos;appliquent à toute commande passée auprès de JMR TEXTILE, sauf conditions particulières écrites et acceptées par les deux parties.</p>
              <p>Toute commande implique l&apos;acceptation pleine et entière des présentes CGV par le client.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">3. Devis et commande</h2>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Toute prestation fait l&apos;objet d&apos;un devis écrit précisant le périmètre, les quantités, les délais estimatifs et les conditions financières.</span></li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Le devis est valable 30 jours sauf mention contraire.</span></li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>La commande est considérée comme ferme uniquement après validation écrite du devis et paiement de l&apos;acompte.</span></li>
            </ul>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">4. Prix</h2>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Les prix sont exprimés hors taxes, en EUR ou USD, selon le devis.</span></li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Les prix ne comprennent pas, sauf mention contraire : transport, douanes, assurances, taxes locales ou internationales.</span></li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Toute modification demandée par le client après validation du devis pourra faire l&apos;objet d&apos;un avenant tarifaire.</span></li>
            </ul>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">5. Conditions de paiement</h2>
            <ul className="space-y-4 text-lg">
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Un acompte est exigé avant le démarrage de toute production (généralement entre 30 % et 70 % selon le projet).</span></li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Le solde est exigible avant expédition ou selon les modalités prévues au devis.</span></li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div><span>Tout retard de paiement pourra entraîner la suspension de la production ou de la livraison, sans préjudice des sommes dues.</span></li>
            </ul>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">6. Délais de production et livraison</h2>
            <div className="space-y-4 text-lg">
              <p>Les délais communiqués sont des estimations basées sur les informations fournies par le client. JMR TEXTILE ne saurait être tenue responsable des retards dus à :</p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Modifications tardives du client</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Retards de validation</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Force majeure</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Problèmes d&apos;approvisionnement indépendants de sa volonté</span></li>
              </ul>
              <p>Aucun retard ne peut donner lieu à pénalité automatique sans accord écrit préalable.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">7. Obligations du client</h2>
            <p className="text-lg">
              Le client s&apos;engage à fournir des informations techniques complètes et exactes, valider les échantillons, prototypes ou BAT avant production, respecter les délais de validation et s&apos;assurer de la conformité légale et réglementaire des produits commandés sur son marché.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">8. Obligations de JMR TEXTILE</h2>
            <div className="space-y-4 text-lg">
              <p>JMR TEXTILE s&apos;engage à exécuter les prestations conformément au devis validé, respecter les standards de qualité convenus et informer le client de toute difficulté pouvant impacter le projet.</p>
              <p>JMR TEXTILE est tenue à une obligation de moyens, et non de résultat.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">9. Échantillons et prototypes</h2>
            <p className="text-lg">
              Les échantillons et prototypes sont réalisés à des fins de validation. De légères variations de couleur, matière ou finition peuvent exister entre l&apos;échantillon et la production finale, dans les tolérances standards de l&apos;industrie textile.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">10. Propriété intellectuelle</h2>
            <div className="space-y-4 text-lg">
              <p>Sauf accord contraire écrit :</p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Les designs, patrons, prototypes ou documents fournis par le client restent sa propriété</span></li>
                <li className="flex items-center gap-4"><div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div><span>Les méthodes, savoir-faire, process et outils développés par JMR TEXTILE demeurent sa propriété exclusive</span></li>
              </ul>
              <p>Toute reproduction ou utilisation non autorisée est interdite.</p>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">11. Confidentialité</h2>
            <p className="text-lg">
              Les parties s&apos;engagent à conserver confidentielles toutes les informations techniques, commerciales ou stratégiques échangées dans le cadre de la collaboration.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">12. Responsabilité</h2>
            <p className="text-lg">
              La responsabilité de JMR TEXTILE est strictement limitée au montant de la commande concernée. En aucun cas, JMR TEXTILE ne pourra être tenue responsable des pertes indirectes, commerciales ou financières subies par le client.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">13. Force majeure</h2>
            <p className="text-lg">
              Aucune des parties ne pourra être tenue responsable d&apos;un manquement dû à un événement de force majeure (catastrophe naturelle, grève, panne majeure, instabilité logistique, etc.).
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">14. Droit applicable et juridiction compétente</h2>
            <p className="text-lg">
              Les présentes CGV sont régies par le droit en vigueur à Madagascar. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux compétents.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">15. Acceptation</h2>
            <p className="text-lg">
              Les présentes Conditions Générales de Vente sont réputées lues, comprises et acceptées par le client dès validation de toute commande.
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