import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-24 md:py-32">
      <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-orange-500 transition-colors mb-12 font-bold uppercase tracking-widest text-xs">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Retour à l&apos;accueil
      </Link>
      
      <h1 className="font-headline text-5xl md:text-6xl text-primary mb-12 leading-tight">
        Mentions <br /><span className="italic text-orange-500 font-normal">Légales.</span>
      </h1>

      <div className="space-y-12 text-on-surface-variant leading-relaxed">
        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Éditeur du site</h2>
          <p>
            Le site <strong>JMR Textile</strong> est édité par la société JMR Textile SARL, dont le siège social est situé à Antananarivo, Madagascar.
          </p>
          <p className="mt-2">
            Immatriculée au Registre du Commerce et des Sociétés (RCS) de Madagascar.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Directeur de la publication</h2>
          <p>[Nom du responsable], en sa qualité de Gérant.</p>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Hébergement</h2>
          <p>
            Le site est hébergé par [Nom de l&apos;hébergeur], situé à [Adresse de l&apos;hébergeur].
          </p>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble de ce site relève de la législation malagasy et internationale sur le droit d&apos;auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
        </section>

        <section>
          <h2 className="font-headline text-2xl text-primary mb-4">Contact</h2>
          <p>
            Pour toute question, vous pouvez nous contacter par e-mail à l&apos;adresse suivante : <a href="mailto:contact@jmrtextile.com" className="text-orange-500 hover:underline">contact@jmrtextile.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}
