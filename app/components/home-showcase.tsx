"use client";

import { useState } from "react";
import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { EditableImage } from "@/app/components/editable-image";
import { EditableText } from "@/app/components/editable-text";
import { useLocale } from "@/app/components/locale-provider";
import { AnimeReveal, AnimeStagger } from "@/app/components/anime-reveal";

function ImageSlot({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-[#EAA100]/25 bg-white/[0.02] p-4 text-center">
      <ImageIcon className="h-8 w-8 text-[#EAA100]/40" strokeWidth={1.5} aria-hidden="true" />
      <span className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-[#EAA100]/50">{label}</span>
    </div>
  );
}

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
    </header>
  );
}

const EXPERTISES = [
  { key: "1", alt: "Confection textile" },
  { key: "2", alt: "Prototype et échantillonnage" },
  { key: "3", alt: "Production en série" },
  { key: "4", alt: "Contrôle qualité" },
  { key: "5", alt: "Sourcing matières" },
  { key: "6", alt: "Accompagnement technique" },
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
      <AnimeStagger as="div" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10" itemSelector=".expertise-card" staggerMs={90}>
        {EXPERTISES.map((item, i) => (
          <article key={item.key} className="expertise-card group overflow-hidden rounded-2xl border border-white/10 bg-brand-card">
            <div className="h-56 md:h-64 overflow-hidden">
              <EditableImage
                contentKey={`showcase.expertise${item.key}.image`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src=""
                alt={item.alt}
                placeholder={<ImageSlot label="Image à mettre" />}
              />
            </div>
            <div className="p-7 md:p-8">
              <h3 className="font-headline text-2xl text-[#FFF8EC] mb-3">
                <EditableText contentKey={`showcase.expertise${item.key}.title`} fallback={titles[i]} />
              </h3>
              <p className="font-body text-[15px] leading-relaxed text-[#B9C3D0]">
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
      <AnimeStagger as="ol" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-4 list-none" itemSelector=".process-step" staggerMs={100} ariaLabel="Etapes du processus">
        {steps.map((step, i) => (
          <li key={step.n} className="process-step relative rounded-2xl border border-white/10 bg-brand-card p-5 md:p-6">
            <p className="font-mono text-2xl font-bold text-[#EAA100]">{step.n}</p>
            <h3 className="mt-3 font-headline text-lg text-[#FFF8EC]">
              <EditableText contentKey={`showcase.step${i + 1}.title`} fallback={step.title} />
            </h3>
            <p className="mt-2 font-body text-[13px] leading-relaxed text-[#B9C3D0]">
              <EditableText contentKey={`showcase.step${i + 1}.desc`} fallback={step.desc} as="span" multiline />
            </p>
          </li>
        ))}
      </AnimeStagger>
    </section>
  );
}

const REALISATIONS = [
  { key: "1", image: "/human_images/01_patronage_terrasse.webp", alt: "Patronage en atelier", span: "md:col-span-7", height: "h-[26rem] md:h-[34rem]" },
  { key: "2", image: "/human_images/09_decoupe_pieces_denim.webp", alt: "Decoupe de pieces en denim", span: "md:col-span-5", height: "h-[26rem] md:h-[34rem]" },
  { key: "3", image: "/human_images/03_placement_patron_table.webp", alt: "Placement de patron sur table", span: "md:col-span-4", height: "h-96 md:h-[30rem]" },
  { key: "4", image: "/human_images/05_equipe_tracage_patron.webp", alt: "Equipe autour du tracage", span: "md:col-span-4", height: "h-96 md:h-[30rem]" },
  { key: "5", image: "/human_images/07_coupe_machine_denim.webp", alt: "Coupe machine sur denim", span: "md:col-span-4", height: "h-96 md:h-[30rem]" },
] as const;

export function HomeRealisations() {
  const { messages } = useLocale();
  const t = messages.showcase;
  const labels = [t.realisation1, t.realisation2, t.realisation3, t.realisation4, t.realisation5];
  return (
    <section className="mx-auto max-w-[1440px] px-6 md:px-12 py-20 md:py-32" aria-labelledby="showcase-realisations-title">
      <SectionHeader
        id="showcase-realisations-title"
        eyebrowKey="showcase.realisationsEyebrow" eyebrowFallback={t.realisationsEyebrow}
        titleKey="showcase.realisationsTitle" titleFallback={t.realisationsTitle}
      />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
        {REALISATIONS.map((item, i) => (
          <figure key={item.key} className={`group relative overflow-hidden rounded-3xl border border-white/10 ${item.span}`} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
            <EditableImage
              contentKey={`showcase.realisation${item.key}.image`}
              className={`w-full ${item.height} object-cover transition-transform duration-700 group-hover:scale-105`}
              src={item.image}
              alt={item.alt}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-8 pt-20">
              <span className="inline-block rounded-full border border-[#EAA100]/50 bg-black/40 px-4 py-1.5 font-body text-xs font-bold uppercase tracking-widest text-[#EAA100]">
                <EditableText contentKey={`showcase.realisation${item.key}.label`} fallback={labels[i]} />
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-14 text-center">
        <Link href="/nos-services" className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-[#EAA100] px-10 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#1B2436] shadow-xl transition-all hover:brightness-110">
          <EditableText contentKey="showcase.realisationsCta" fallback={t.realisationsCta} />&nbsp;&rarr;</Link>
      </div>
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
      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className="rounded-xl bg-brand-card">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`showcase-faq-panel-${i}`}
                id={`showcase-faq-button-${i}`}
                className="flex w-full items-center justify-between gap-4 border-0 bg-transparent px-6 py-5 text-left font-body text-[15px] md:text-base font-semibold text-[#FFF8EC] transition-colors hover:text-[#EAA100]"
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
            <EditableText contentKey="showcase.devisCtaButton" fallback={t.devisCtaButton} />&nbsp;&rarr;</Link>
          <a href="mailto:contact@jmrtextile.com" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-white/20 px-8 font-body text-xs font-bold uppercase tracking-[0.2em] text-[#FFF8EC] transition-all hover:border-[#EAA100] hover:text-[#EAA100]">
            contact@jmrtextile.com
          </a>
        </div>
        <p className="mt-6 font-body text-xs uppercase tracking-[0.2em] text-[#8B94A3]">
          <EditableText contentKey="showcase.devisCtaContact" fallback={t.devisCtaContact} />&mdash; Antananarivo, Madagascar
        </p>
      </AnimeReveal>
    </section>
  );
}

export function HomeShowcase({ showDevisCta = true }: { showDevisCta?: boolean }) {
  return (
    <>
      <HomeExpertises />
      <HomeProcessus />
      <HomeRealisations />
      <HomeFaq />
      {showDevisCta ? <HomeDevisCta /> : null}
    </>
  );
}
