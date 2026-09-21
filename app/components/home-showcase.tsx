"use client";

import { useState } from "react";
import Link from "next/link";
import { EditableImage } from "@/app/components/editable-image";
import { EditableText } from "@/app/components/editable-text";
import { useLocale } from "@/app/components/locale-provider";
import { AnimeReveal, AnimeStagger } from "@/app/components/anime-reveal";

function SectionHeader({ eyebrowKey, eyebrowFallback, titleKey, titleFallback, id }: {
  eyebrowKey: string;
  eyebrowFallback: string;
  titleKey: string;
  titleFallback: string;
  id: string;
}) {
  return (
    <header className="mx-auto mb-10 md:mb-14 max-w-3xl text-center" id={id}>
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#EAA100]">
        <EditableText contentKey={eyebrowKey} fallback={eyebrowFallback} />
      </p>
      <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-[#FFF8EC] leading-tight">
        <EditableText contentKey={titleKey} fallback={titleFallback} as="span" multiline />
      </h2>
      <span className="ui-section-underline" aria-hidden="true" />
    </header>
  );
}

const EXPERTISES = [
  { key: "1", image: "/human_images/04_decoupe_machine_electrique.jpg", alt: "Découpe textile en atelier" },
  { key: "2", image: "/human_images/03_placement_patron_table.jpg", alt: "Placement de patron sur table" },
  { key: "3", image: "/human_images/07_coupe_machine_denim.jpg", alt: "Coupe machine sur denim" },
  { key: "4", image: "/human_images/09_decoupe_pieces_denim.jpg", alt: "Découpe de pièces en denim" },
  { key: "5", image: "/human_images/05_equipe_tracage_patron.jpg", alt: "Équipe autour du traçage de patron" },
  { key: "6", image: "/human_images/01_patronage_terrasse.jpg", alt: "Patronage en atelier" },
] as const;

export function HomeExpertises() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const titles = [t.expertise1Title, t.expertise2Title, t.expertise3Title, t.expertise4Title, t.expertise5Title, t.expertise6Title];
  const descs = [t.expertise1Desc, t.expertise2Desc, t.expertise3Desc, t.expertise4Desc, t.expertise5Desc, t.expertise6Desc];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-expertises-title">
      <SectionHeader
        id="showcase-expertises-title"
        eyebrowKey="showcase.expertisesEyebrow" eyebrowFallback={t.expertisesEyebrow}
        titleKey="showcase.expertisesTitle" titleFallback={t.expertisesTitle}
      />
      <AnimeStagger as="div" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" itemSelector=".expertise-card" staggerMs={90}>
        {EXPERTISES.map((item, i) => (
          <article key={item.key} className="expertise-card group overflow-hidden rounded-2xl border border-white/10 bg-brand-card">
            <div className="h-44 md:h-52 overflow-hidden">
              <EditableImage
                contentKey={`showcase.expertise${item.key}.image`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src={item.image}
                alt={item.alt}
              />
            </div>
            <div className="p-6">
              <h3 className="font-headline text-xl text-[#FFF8EC] mb-2">
                <EditableText contentKey={`showcase.expertise${item.key}.title`} fallback={titles[i]} />
              </h3>
              <p className="font-body text-sm leading-relaxed text-[#B9C3D0]">
                <EditableText contentKey={`showcase.expertise${item.key}.desc`} fallback={descs[i]} as="span" multiline />
              </p>
            </div>
          </article>
        ))}
      </AnimeStagger>
    </section>
  );
}

export function HomeProcessus() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const steps = [
    { n: "01", title: t.step1Title, desc: t.step1Desc },
    { n: "02", title: t.step2Title, desc: t.step2Desc },
    { n: "03", title: t.step3Title, desc: t.step3Desc },
    { n: "04", title: t.step4Title, desc: t.step4Desc },
    { n: "05", title: t.step5Title, desc: t.step5Desc },
    { n: "06", title: t.step6Title, desc: t.step6Desc },
  ];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-processus-title">
      <SectionHeader
        id="showcase-processus-title"
        eyebrowKey="showcase.processEyebrow" eyebrowFallback={t.processEyebrow}
        titleKey="showcase.processTitle" titleFallback={t.processTitle}
      />
      <AnimeStagger as="ol" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4" itemSelector=".process-step" staggerMs={100} ariaLabel="Étapes du processus">
        {steps.map((step, i) => (
          <li key={step.n} className="process-step relative rounded-2xl border border-white/10 bg-brand-card p-5 md:p-6">
            <p className="font-mono text-2xl font-bold text-[#EAA100]">{step.n}</p>
            <h3 className="mt-3 font-headline text-lg text-[#FFF8EC]">
              <EditableText contentKey={`showcase.step${i + 1}.title`} fallback={step.title} />
            </h3>
            <p className="mt-2 font-body text-[13px] leading-relaxed text-[#B9C3D0]">
              <EditableText contentKey={`showcase.step${i + 1}.desc`} fallback={step.desc} as="span" multiline />
            </p>
            {i < steps.length - 1 && (
              <span aria-hidden="true" className="absolute top-10 -right-4 z-10 hidden lg:block text-2xl text-[#EAA100]">&#8660;</span>
            )}
          </li>
        ))}
      </AnimeStagger>
    </section>
  );
}

export function HomeAtelier() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const facts = [t.atelierFact1, t.atelierFact2, t.atelierFact3, t.atelierFact4];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-atelier-title">
      <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
        <AnimeReveal className="grid grid-cols-2 gap-4 md:gap-6" y={28}>
          <div className="col-span-2 overflow-hidden rounded-2xl md:rounded-3xl border border-white/10">
            <EditableImage
              contentKey="showcase.atelier.image-main"
              className="w-full h-64 md:h-80 object-cover"
              src="/human_images/08_salle_machines_coudre.jpg"
              alt="Salle des machines à coudre de l'atelier"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <EditableImage
              contentKey="showcase.atelier.image-second1"
              className="w-full h-40 md:h-52 object-cover"
              src="/human_images/05_equipe_tracage_patron.jpg"
              alt="Équipe de l'atelier au travail"
            />
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <EditableImage
              contentKey="showcase.atelier.image-second2"
              className="w-full h-40 md:h-52 object-cover"
              src="/human_images/04_decoupe_machine_electrique.jpg"
              alt="Découpe textile à la machine"
            />
          </div>
        </AnimeReveal>
        <div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#EAA100]">
            <EditableText contentKey="showcase.atelierEyebrow" fallback={t.atelierEyebrow} />
          </p>
          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl text-[#FFF8EC] leading-tight mb-6" id="showcase-atelier-title">
            <EditableText contentKey="showcase.atelierTitle" fallback={t.atelierTitle} as="span" multiline />
          </h2>
          <p className="font-body text-base md:text-lg leading-relaxed text-[#B9C3D0] mb-8">
            <EditableText contentKey="showcase.atelierIntro" fallback={t.atelierIntro} as="span" multiline />
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {facts.map((fact, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl border border-white/10 bg-brand-card px-4 py-3">
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-[#EAA100]" />
                <span className="font-body text-sm font-semibold text-[#FFF8EC]">
                  <EditableText contentKey={`showcase.atelierFact${i + 1}`} fallback={fact} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function HomeCapacites() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const groups = [
    { title: t.capProdTitle, key: "Prod", items: [t.capProd1, t.capProd2, t.capProd3] },
    { title: t.capTechTitle, key: "Tech", items: [t.capTech1, t.capTech2, t.capTech3, t.capTech4] },
    { title: t.capAccompTitle, key: "Accomp", items: [t.capAccomp1, t.capAccomp2, t.capAccomp3] },
  ];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-capacites-title">
      <SectionHeader
        id="showcase-capacites-title"
        eyebrowKey="showcase.capacitesEyebrow" eyebrowFallback={t.capacitesEyebrow}
        titleKey="showcase.capacitesTitle" titleFallback={t.capacitesTitle}
      />
      <AnimeStagger as="div" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" itemSelector=".cap-card" staggerMs={110}>
        {groups.map((group) => (
          <div key={group.key} className="cap-card rounded-2xl border border-white/10 bg-brand-card p-6 md:p-8">
            <h3 className="font-headline text-2xl text-[#EAA100] mb-5">
              <EditableText contentKey={`showcase.cap${group.key}.title`} fallback={group.title} />
            </h3>
            <ul className="space-y-3">
              {group.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 font-body text-[15px] text-[#FFF8EC]">
                  <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#EAA100]/50 text-[11px] text-[#EAA100]">✓</span>
                  <EditableText contentKey={`showcase.cap${group.key}.item${i + 1}`} fallback={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </AnimeStagger>
    </section>
  );
}

const REALISATIONS = [
  { key: "1", image: "/human_images/01_patronage_terrasse.jpg", alt: "Patronage en atelier", span: "md:col-span-7", height: "h-72 md:h-96" },
  { key: "2", image: "/human_images/09_decoupe_pieces_denim.jpg", alt: "Découpe de pièces en denim", span: "md:col-span-5", height: "h-72 md:h-96" },
  { key: "3", image: "/human_images/03_placement_patron_table.jpg", alt: "Placement de patron sur table", span: "md:col-span-4", height: "h-64 md:h-80" },
  { key: "4", image: "/human_images/05_equipe_tracage_patron.jpg", alt: "Équipe autour du traçage", span: "md:col-span-4", height: "h-64 md:h-80" },
  { key: "5", image: "/human_images/07_coupe_machine_denim.jpg", alt: "Coupe machine sur denim", span: "md:col-span-4", height: "h-64 md:h-80" },
] as const;

export function HomeRealisations() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const labels = [t.realisation1, t.realisation2, t.realisation3, t.realisation4, t.realisation5];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-realisations-title">
      <SectionHeader
        id="showcase-realisations-title"
        eyebrowKey="showcase.realisationsEyebrow" eyebrowFallback={t.realisationsEyebrow}
        titleKey="showcase.realisationsTitle" titleFallback={t.realisationsTitle}
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {REALISATIONS.map((item, i) => (
          <figure key={item.key} className={`group relative overflow-hidden rounded-2xl border border-white/10 ${item.span}`} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
            <EditableImage
              contentKey={`showcase.realisation${item.key}.image`}
              className={`w-full ${item.height} object-cover transition-transform duration-700 group-hover:scale-105`}
              src={item.image}
              alt={item.alt}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12">
              <span className="inline-block rounded-full border border-[#EAA100]/50 bg-black/40 px-3 py-1 font-body text-xs font-bold uppercase tracking-widest text-[#EAA100]">
                <EditableText contentKey={`showcase.realisation${item.key}.label`} fallback={labels[i]} />
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Link href="/nos-services" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#EAA100] px-10 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1B2436] shadow-xl transition-all hover:brightness-110">
          <EditableText contentKey="showcase.realisationsCta" fallback={t.realisationsCta} />&nbsp;→
        </Link>
      </div>
    </section>
  );
}

export function HomePourquoi() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const points = [
    { n: "01", title: t.pourquoi1Title, desc: t.pourquoi1Desc },
    { n: "02", title: t.pourquoi2Title, desc: t.pourquoi2Desc },
    { n: "03", title: t.pourquoi3Title, desc: t.pourquoi3Desc },
    { n: "04", title: t.pourquoi4Title, desc: t.pourquoi4Desc },
  ];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-pourquoi-title">
      <SectionHeader
        id="showcase-pourquoi-title"
        eyebrowKey="showcase.pourquoiEyebrow" eyebrowFallback={t.pourquoiEyebrow}
        titleKey="showcase.pourquoiTitle" titleFallback={t.pourquoiTitle}
      />
      <AnimeStagger as="div" className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8" itemSelector=".pourquoi-card" staggerMs={100}>
        {points.map((point, i) => (
          <div key={point.n} className="pourquoi-card flex gap-5 rounded-2xl border border-white/10 bg-brand-card p-6 md:p-8">
            <span aria-hidden="true" className="font-mono text-2xl md:text-3xl font-bold text-[#EAA100]">{point.n}</span>
            <div>
              <h3 className="font-headline text-xl md:text-2xl text-[#FFF8EC] mb-2">
                <EditableText contentKey={`showcase.pourquoi${i + 1}.title`} fallback={point.title} />
              </h3>
              <p className="font-body text-sm md:text-[15px] leading-relaxed text-[#B9C3D0]">
                <EditableText contentKey={`showcase.pourquoi${i + 1}.desc`} fallback={point.desc} as="span" multiline />
              </p>
            </div>
          </div>
        ))}
      </AnimeStagger>
    </section>
  );
}

export function HomeTemoignages() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const items = [
    { role: t.temoignage1Role, text: t.temoignage1Text },
    { role: t.temoignage2Role, text: t.temoignage2Text },
    { role: t.temoignage3Role, text: t.temoignage3Text },
  ];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-temoignages-title">
      <SectionHeader
        id="showcase-temoignages-title"
        eyebrowKey="showcase.temoignagesEyebrow" eyebrowFallback={t.temoignagesEyebrow}
        titleKey="showcase.temoignagesTitle" titleFallback={t.temoignagesTitle}
      />
      <p className="mx-auto -mt-6 mb-10 max-w-3xl text-center font-body text-xs uppercase tracking-[0.2em] text-[#8B94A3]">
        <EditableText contentKey="showcase.temoignageNote" fallback={t.temoignageNote} />
      </p>
      <AnimeStagger as="div" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" itemSelector=".temoignage-card" staggerMs={110}>
        {items.map((item, i) => (
          <figure key={i} className="temoignage-card flex flex-col rounded-2xl border border-white/10 bg-brand-card p-6 md:p-8">
            <span aria-hidden="true" className="font-headline text-5xl leading-none text-[#EAA100]">“</span>
            <blockquote className="mt-2 flex-1 font-body text-[15px] italic leading-relaxed text-[#B9C3D0]">
              <EditableText contentKey={`showcase.temoignage${i + 1}.text`} fallback={item.text} as="span" multiline />
            </blockquote>
            <figcaption className="mt-6 border-t border-white/10 pt-4">
              <p className="font-body text-sm font-bold text-[#FFF8EC]">
                <EditableText contentKey={`showcase.temoignage${i + 1}.role`} fallback={item.role} />
              </p>
              <p className="mt-1 inline-block rounded-full bg-[#EAA100]/10 px-3 py-1 font-body text-[10px] font-bold uppercase tracking-widest text-[#EAA100]">
                Exemple
              </p>
            </figcaption>
          </figure>
        ))}
      </AnimeStagger>
    </section>
  );
}

export function HomeFaq() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { q: t.faq1Q, a: t.faq1A },
    { q: t.faq2Q, a: t.faq2A },
    { q: t.faq3Q, a: t.faq3A },
    { q: t.faq4Q, a: t.faq4A },
    { q: t.faq5Q, a: t.faq5A },
    { q: t.faq6Q, a: t.faq6A },
  ];
  return (
    <section className="mx-auto max-w-[900px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-faq-title">
      <SectionHeader
        id="showcase-faq-title"
        eyebrowKey="showcase.faqEyebrow" eyebrowFallback={t.faqEyebrow}
        titleKey="showcase.faqTitle" titleFallback={t.faqTitle}
      />
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-brand-card">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={i < items.length - 1 ? "border-b border-white/10" : undefined}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`showcase-faq-panel-${i}`}
                id={`showcase-faq-button-${i}`}
                className="flex w-full items-center justify-between gap-4 bg-transparent px-6 py-5 text-left font-body text-[15px] md:text-base font-semibold text-[#FFF8EC] transition-colors hover:text-[#EAA100]"
              >
                <EditableText contentKey={`showcase.faq${i + 1}.q`} fallback={item.q} as="span" />
                <span aria-hidden="true" className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? "rotate-45 border-[#EAA100] bg-[#EAA100] text-[#1B2436]" : "border-white/20 text-[#EAA100]"}`}>
                  <span className="text-lg leading-none">+</span>
                </span>
              </button>
              <div
                id={`showcase-faq-panel-${i}`}
                role="region"
                aria-labelledby={`showcase-faq-button-${i}`}
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr", opacity: isOpen ? 1 : 0 }}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 font-body text-sm md:text-[15px] leading-relaxed text-[#B9C3D0]">
                    <EditableText contentKey={`showcase.faq${i + 1}.a`} fallback={item.a} as="span" multiline />
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function HomeDevisCta() {
  const { messages } = useLocale();
  const t = messages.showcase;
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-16 md:py-24" aria-labelledby="showcase-devis-title">
      <AnimeReveal className="overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-[#EAA100]/25 bg-brand-card p-8 sm:p-12 md:p-16 text-center shadow-2xl" y={24}>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.3em] text-[#EAA100]">
          <EditableText contentKey="showcase.devisCtaEyebrow" fallback={t.devisCtaEyebrow} />
        </p>
        <h2 className="mx-auto max-w-2xl font-headline text-3xl md:text-4xl lg:text-5xl text-[#FFF8EC] leading-tight" id="showcase-devis-title">
          <EditableText contentKey="showcase.devisCtaTitle" fallback={t.devisCtaTitle} as="span" multiline />
        </h2>
        <p className="mx-auto mt-4 max-w-xl font-body text-sm md:text-base leading-relaxed text-[#B9C3D0]">
          <EditableText contentKey="showcase.devisCtaText" fallback={t.devisCtaText} as="span" multiline />
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/demande-devis" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#EAA100] px-10 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1B2436] shadow-xl transition-all hover:brightness-110">
            <EditableText contentKey="showcase.devisCtaButton" fallback={t.devisCtaButton} />&nbsp;→
          </Link>
          <a href="mailto:contact@jmrtextile.com" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-white/20 px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#FFF8EC] transition-all hover:border-[#EAA100] hover:text-[#EAA100]">
            contact@jmrtextile.com
          </a>
        </div>
        <p className="mt-6 font-body text-xs uppercase tracking-[0.2em] text-[#8B94A3]">
          <EditableText contentKey="showcase.devisCtaContact" fallback={t.devisCtaContact} /> — Antananarivo, Madagascar
        </p>
      </AnimeReveal>
    </section>
  );
}

export function HomeShowcase() {
  return (
    <>
      <HomeExpertises />
      <HomeProcessus />
      <HomeAtelier />
      <HomeCapacites />
      <HomeRealisations />
      <HomePourquoi />
      <HomeTemoignages />
      <HomeFaq />
      <HomeDevisCta />
    </>
  );
}
