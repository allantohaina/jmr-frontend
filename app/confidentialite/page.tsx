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

        <div className="space-y-16 text-[#eccc90]/80 leading-relaxed font-body">
          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Protection de vos données</h2>
            <p className="text-lg">
              Chez <strong className="text-[#e5ad46]">JMR Textile</strong>, nous accordons une importance capitale à la protection de vos données personnelles. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations conformément à la législation en vigueur à Madagascar.
            </p>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Collecte des données</h2>
            <div className="space-y-4 text-lg">
              <p>
                Nous collectons les données que vous nous fournissez volontairement lors de la création de votre compte ou de l&apos;utilisation de nos services :
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div>
                  <span>Nom, prénom, nom d&apos;utilisateur</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div>
                  <span>Adresse e-mail</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div>
                  <span>Numéro de téléphone</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#e5ad46]"></div>
                  <span>Adresse de livraison ou de facturation</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Utilisation des données</h2>
            <div className="space-y-4 text-lg">
              <p>
                Vos données sont uniquement utilisées pour :
              </p>
              <ul className="space-y-4 mt-6">
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div>
                  <span>Gérer votre compte et vos projets</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div>
                  <span>Communiquer avec vous concernant vos demandes de devis</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div>
                  <span>Améliorer la qualité de nos services et de notre interface</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#eccc90]/40"></div>
                  <span>Répondre à nos obligations légales et réglementaires à Madagascar</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="bg-[#25303a] p-10 rounded-[2.5rem] border border-[#e5ad46]/5 shadow-xl">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Sécurité</h2>
            <p className="text-lg">
              Nous mettons en œuvre toutes les mesures de sécurité nécessaires pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction. Vos mots de passe sont hachés et sécurisés.
            </p>
          </section>

          <section className="bg-[#e5ad46]/5 p-10 rounded-[2.5rem] border border-[#e5ad46]/10 text-center">
            <h2 className="font-headline text-3xl text-[#e5ad46] mb-6">Vos droits</h2>
            <p className="text-lg mb-8">
              Conformément aux dispositions relatives à la protection des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition au traitement de vos données personnelles. Pour exercer ces droits, contactez-nous à :
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
