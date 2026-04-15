"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type SocialItem = {
  key: string;
  label: string;
  icon: string;
};

const SOCIAL_ITEMS: SocialItem[] = [
  {
    key: "facebook",
    label: "Facebook",
    icon: "/footer/facebook.svg",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "/footer/whatsapp.svg",
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: "/footer/instagram.svg",
  },
];

const FOOTER_LINKS = [
  { label: "Accueil", href: "/#accueil" },
  { label: "Nos Services", href: "/#nos-services" },
  { label: "À Propos", href: "/#a-propos" },
  { label: "Espace Client", href: "/#acces-client" },
];

const LEGAL_LINKS = [
  { label: "Mentions Légales", href: "/mentions-legales" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Contact Direct", href: "mailto:contact@jmrtextile.com" },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/backoffice")) {
    return null;
  }

  return (
    <footer className="w-full mt-20 bg-[#1e2a38] text-[#e5ad46] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link
              className="inline-flex flex-col gap-4 p-8 bg-[#1e2a38] rounded-2xl shadow-2xl mb-8 group transition-transform hover:-translate-y-1 border border-[#e5ad46]/20"
              href="/#accueil"
              aria-label="Accueil JMR Textile"
            >
              <Image
                className="w-full max-w-[280px] h-auto block"
                src="/navbar/logo-dark.svg"
                alt="JMR Textile"
                width={413}
                height={92}
                priority
                unoptimized
              />
            </Link>
            <p className="font-body text-sm text-[#eccc90]/70 leading-relaxed max-w-sm">
              Atelier de confection textile haut de gamme à Madagascar.
              Précision, fiabilité et transparence au service de vos collections.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">Navigation</h3>
            <ul className="space-y-4">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70 hover:text-[#e5ad46] hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">Légal</h3>
            <ul className="space-y-4">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70 hover:text-[#e5ad46] hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div className="lg:col-span-4">
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">Réseaux Sociaux</h3>
            <div className="flex gap-4 mb-12">
              {SOCIAL_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href="#"
                  className="w-14 h-14 rounded-2xl border border-[#e5ad46]/30 flex items-center justify-center hover:border-[#e5ad46] hover:bg-[#e5ad46]/10 transition-all group"
                  aria-label={item.label}
                >
                  <Image
                    src={item.icon}
                    alt={item.label}
                    width={28}
                    height={28}
                    className="social-icon-gold drop-shadow-[0_0_8px_rgba(229,173,70,0.3)]"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-20 pt-10 border-t border-[#e5ad46]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em]">
            © 2026 JMR Textile Atelier • Fabrication Madagascar
          </p>
          <div className="flex items-center gap-8">
            <span className="w-12 h-[1px] bg-[#e5ad46]/10"></span>
            <p className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em]">
              Fiabilité • Transparence • Qualité
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
