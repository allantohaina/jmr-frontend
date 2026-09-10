"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/app/components/locale-provider";
import { EditableText } from "@/app/components/editable-text";
import { scrollToSection } from "@/app/lib/scroll";

type SocialItem = {
  key: string;
  label: string;
  icon: string;
};

const SOCIAL_ITEMS: SocialItem[] = [
  { key: "facebook", label: "Facebook", icon: "/footer/facebook.svg" },
  { key: "whatsapp", label: "WhatsApp", icon: "/footer/whatsapp.svg" },
  { key: "instagram", label: "Instagram", icon: "/footer/instagram.svg" },
];

export function Footer() {
  const pathname = usePathname();
  const { messages } = useLocale();

  const footerLinks: Array<{ key: string; sectionId: string; fallback: string }> = [
    { key: "footer_link_home_label", sectionId: "accueil", fallback: messages.footer.home },
    { key: "footer_link_services_label", sectionId: "nos-services", fallback: messages.footer.services },
    { key: "footer_link_about_label", sectionId: "a-propos", fallback: messages.footer.about },
    { key: "footer_link_client_label", sectionId: "acces-client", fallback: messages.footer.clientSpace },
  ];

  const legalLinks: Array<{ labelKey: string; fallbackLabel: string; fallbackUrl: string }> = [
    { labelKey: "footer_legal_notice_label", fallbackLabel: messages.footer.legalNotice, fallbackUrl: "/mentions-legales" },
    { labelKey: "footer_terms_label", fallbackLabel: messages.footer.terms, fallbackUrl: "/conditions-utilisation" },
    { labelKey: "footer_privacy_label", fallbackLabel: messages.footer.privacy, fallbackUrl: "/confidentialite" },
    { labelKey: "footer_contact_label", fallbackLabel: messages.footer.directContact, fallbackUrl: "mailto:contact@jmrtextile.com" },
  ];

  if (pathname?.startsWith("/backoffice")) {
    return null;
  }

  return (
    <footer className="site-footer-modern w-full mt-12 md:mt-20 bg-[#1e2a38] text-[#e5ad46] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-start">

          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link
              className="inline-flex flex-col gap-4 p-8 bg-[#1e2a38] rounded-2xl shadow-2xl mb-8 group transition-transform hover:-translate-y-1 border border-[#e5ad46]/20"
              href="/"
              aria-label="Accueil JMR Textile"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="w-full max-w-[280px] h-auto block"
                src="/navbar/logo-dark.svg"
                alt="JMR Textile"
              />
            </Link>
            <div className="font-body text-sm text-[#eccc90]/70 leading-relaxed max-w-sm">
              <p><EditableText contentKey="footer.description" fallback={messages.footer.description} as="span" multiline /></p>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <span><EditableText contentKey="footer.navigation" fallback={messages.footer.navigation} /></span>
            </div>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.key} className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70">
                  <Link
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.sectionId);
                    }}
                    className="hover:text-[#e5ad46] hover:translate-x-1 transition-all inline-block"
                  >
                    <EditableText contentKey={`footer.link.${link.sectionId}`} fallback={link.fallback} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <span><EditableText contentKey="footer.legal" fallback={messages.footer.legal} /></span>
            </div>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.labelKey} className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70">
                  <Link
                    href={link.fallbackUrl}
                    className="hover:text-[#e5ad46] hover:translate-x-1 transition-all inline-block"
                  >
                    <EditableText contentKey={`footer.legal.${link.labelKey}`} fallback={link.fallbackLabel} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div className="lg:col-span-4">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <span><EditableText contentKey="footer.social" fallback={messages.footer.social} /></span>
            </div>
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
          <div className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em] text-center md:text-left">
            <span><EditableText contentKey="footer.copyright" fallback={messages.footer.copyright} /></span>
          </div>
          <div className="flex items-center gap-8">
            <span className="w-12 h-[1px] bg-[#e5ad46]/10 hidden md:block"></span>
            <div className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em] text-center">
              <span><EditableText contentKey="footer.values" fallback={messages.footer.values} /></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
