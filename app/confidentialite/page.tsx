import Link from "next/link";

export default function Confidentialite() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
      <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-orange-500 transition-colors mb-12 font-bold uppercase tracking-widest text-xs">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Retour à l&apos;accueil
      </Link>
      
      <h1 className="font-headline text-5xl md:text-6xl text-primary mb-12 leading-tight">
        Politique de <br /><span className="italic text-orange-500 font-normal">Confidentialité.</span>
      </h1>

      <div className="space-y-12 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Protection de vos données</h2>
          <p>
            Chez <strong>JMR Textile</strong>, nous accordons une importance capitale à la protection de vos données personnelles. Cette politique détaille comment nous collectons, utilisons et protégeons vos informations conformément à la législation en vigueur à Madagascar.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Collecte des données</h2>
          <p>
            Nous collectons les données que vous nous fournissez volontairement lors de la création de votre compte ou de l&apos;utilisation de nos services :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Nom, prénom, nom d&apos;utilisateur</li>
            <li>Adresse e-mail</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison ou de facturation</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Utilisation des données</h2>
          <p>
            Vos données sont uniquement utilisées pour :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>Gérer votre compte et vos projets</li>
            <li>Communiquer avec vous concernant vos demandes de devis</li>
            <li>Améliorer la qualité de nos services et de notre interface</li>
            <li>Répondre à nos obligations légales et réglementaires à Madagascar</li>
          </ul>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Sécurité</h2>
          <p>
            Nous mettons en œuvre toutes les mesures de sécurité nécessaires pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction. Vos mots de passe sont hachés et sécurisés.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Vos droits</h2>
          <p>
            Conformément aux dispositions relatives à la protection des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification, de suppression et d&apos;opposition au traitement de vos données personnelles. Pour exercer ces droits, contactez-nous à : <a href="mailto:privacy@jmrtextile.com" className="text-orange-500 hover:underline">privacy@jmrtextile.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
