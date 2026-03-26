"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

const HOME_BENEFITS = [
  "Coordination de production de A a Z",
  "Suivi client centralise et lisible",
  "Un seul contact pour avancer rapidement",
];

const EASE_OUT_QUINT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const HomeHeroVideo = dynamic(
  () => import("./home-hero-video").then((module) => module.HomeHeroVideo),
  { ssr: false }
);

export function HomeHero() {
  const reduceMotion = useReducedMotion();
  const shouldReduceMotion = reduceMotion === true;

  const container = {
    hidden: {},
    show: {
      transition: shouldReduceMotion
        ? { staggerChildren: 0 }
        : { staggerChildren: 0.05, delayChildren: 0.04 },
    },
  };

  const item = {
    hidden: shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: EASE_OUT_QUINT },
    },
  };

  const background = shouldReduceMotion
    ? { opacity: 1 }
    : {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.95, ease: EASE_OUT_QUINT },
      };

  return (
    <section className="home-page__hero" data-nav-section="accueil" id="accueil">
      <motion.div
        className="home-page__hero-background"
        aria-hidden="true"
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
        animate={background}
      >
        <Image
          className="home-page__hero-background-image"
          src="/sunset.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        {!shouldReduceMotion ? (
          <HomeHeroVideo poster="/sunset.jpg" src="/video/machine.mp4" />
        ) : null}
        <div className="home-page__hero-overlay" aria-hidden="true" />
      </motion.div>

      <div className="home-page__hero-grid">
        <motion.div
          className="home-page__hero-copy"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p className="home-page__eyebrow" variants={item}>
            Fabrication textile structuree a Madagascar
          </motion.p>

          <motion.h1 className="home-page__title" variants={item}>
            Nous coordonnons vos projets textiles, du devis a la livraison.
          </motion.h1>

          <motion.p className="home-page__description" variants={item}>
            JMR Textile vous aide a lancer, suivre et faire avancer la production avec un cadre
            clair, un interlocuteur unique et une lecture simple de chaque etape.
          </motion.p>

          <motion.ul className="home-page__benefits" aria-label="Points forts" variants={container}>
            {HOME_BENEFITS.map((benefit) => (
              <motion.li className="home-page__benefit" key={benefit} variants={item}>
                {benefit}
              </motion.li>
            ))}
          </motion.ul>

          <motion.div className="home-page__cta-group" variants={container}>
            <motion.div variants={item}>
              <Link className="home-page__action home-page__action--primary" href="/#suivi-projet">
                Suivre un projet
              </Link>
            </motion.div>
            <motion.div variants={item}>
              <Link
                className="home-page__action home-page__action--secondary"
                href="/mon-profil?next=%2Fsuivi-projet%3Fview%3Dtracking%26step%3D2"
              >
                Faites votre demande.
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
