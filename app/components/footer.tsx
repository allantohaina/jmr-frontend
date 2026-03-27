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

  if (pathname?.startsWith("/jmr-atelier-management-v2")) {
    return null;
  }

  return (
    <footer className="w-full mt-20 bg-[#163526] text-[#faf9f4] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Brand Column */}
          <div className="lg:col-span-5">
            <Link
              className="inline-flex flex-col gap-4 p-8 bg-[#faf9f4] rounded-2xl shadow-2xl mb-8 group transition-transform hover:-translate-y-1"
              href="/#accueil"
              aria-label="Accueil JMR Textile"
            >
              <Image
                className="w-full max-w-[320px] h-auto block"
                src="/navbar/logo.svg"
                alt="JMR Textile"
                width={413}
                height={92}
                priority
                unoptimized
              />
            </Link>
            <p className="font-body text-sm text-[#faf9f4]/60 leading-relaxed max-w-sm">
              Atelier de confection textile haut de gamme à Madagascar. 
              Précision, fiabilité et transparence au service de vos collections.
            </p>
          </div>

          {/* Links Column */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold mb-8">Navigation</h3>
              <ul className="space-y-4">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-xs uppercase tracking-widest text-[#faf9f4]/70 hover:text-white hover:translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold mb-8">Légal</h3>
              <ul className="space-y-4">
                {LEGAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-xs uppercase tracking-widest text-[#faf9f4]/70 hover:text-white hover:translate-x-1 transition-all inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social & Bug Column */}
          <div className="lg:col-span-3">
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-orange-400 font-bold mb-8">Réseaux Sociaux</h3>
            <div className="flex gap-4 mb-12">
              {SOCIAL_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href="#"
                  className="w-12 h-12 rounded-full border border-[#faf9f4]/20 flex items-center justify-center hover:border-orange-400 hover:text-orange-400 transition-all group"
                  aria-label={item.label}
                >
                  <Image 
                    src={item.icon} 
                    alt={item.label} 
                    width={22} 
                    height={22} 
                    className="brightness-0 invert opacity-60 group-hover:opacity-100 transition-opacity" 
                  />
                </a>
              ))}
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-4 p-4 rounded-xl border border-[#faf9f4]/10 bg-[#faf9f4]/5 hover:bg-[#faf9f4]/10 transition-colors"
            >
              <span className="material-symbols-outlined text-orange-400">bug_report</span>
              <span className="font-body text-[10px] uppercase tracking-[0.2em] font-bold">Signaler un bug technique</span>
            </Link>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-20 pt-10 border-t border-[#faf9f4]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-body text-[10px] text-[#faf9f4]/30 uppercase tracking-[0.3em]">
            © 2026 JMR Textile Atelier • Fabrication Madagascar
          </p>
          <div className="flex items-center gap-8">
            <span className="w-12 h-[1px] bg-[#faf9f4]/10"></span>
            <p className="font-body text-[10px] text-[#faf9f4]/30 uppercase tracking-[0.3em]">
              Fiabilité • Transparence • Qualité
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
