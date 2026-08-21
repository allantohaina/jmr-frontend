"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/app/components/locale-provider";
import { scrollToSection } from "@/app/lib/scroll";
import { useContent } from "@/app/lib/use-content";

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

export function Footer() {
  const pathname = usePathname();
  const { messages } = useLocale();
  const { content, loaded } = useContent();
  const val = (key: string, fallback: string) => loaded && content[key] ? content[key] : fallback;

  const footerLinks = [
    { label: val("footer_link_home_label", messages.footer.home), sectionId: "accueil" },
    { label: val("footer_link_services_label", messages.footer.services), sectionId: "nos-services" },
    { label: val("footer_link_about_label", messages.footer.about), sectionId: "a-propos" },
    { label: val("footer_link_client_label", messages.footer.clientSpace), sectionId: "acces-client" },
  ];

  const legalLinks = [
    { label: val("footer_legal_notice_label", messages.footer.legalNotice), href: val("footer_legal_notice_url", "/mentions-legales") },
    { label: val("footer_terms_label", messages.footer.terms), href: val("footer_terms_url", "/conditions-utilisation") },
    { label: val("footer_privacy_label", messages.footer.privacy), href: val("footer_privacy_url", "/confidentialite") },
    { label: val("footer_contact_label", messages.footer.directContact), href: val("footer_contact_url", "mailto:contact@jmrtextile.com") },
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
              <img
                className="w-full max-w-[280px] h-auto block"
                src={val("footer_logo", "/navbar/logo-dark.svg")}
                alt="JMR Textile"
              />
            </Link>
            <p className="font-body text-sm text-[#eccc90]/70 leading-relaxed max-w-sm">
              {val("footer_description", messages.footer.description)}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">{val("footer_navigation_title", messages.footer.navigation)}</h3>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.sectionId);
                    }}
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
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">{val("footer_legal_title", messages.footer.legal)}</h3>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
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
            <h3 className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">{val("footer_social_title", messages.footer.social)}</h3>
            <div className="flex gap-4 mb-12">
              {SOCIAL_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href={val(`footer_social_${item.key}_url`, "#")}
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
            {val("footer_copyright", messages.footer.copyright)}
          </p>
          <div className="flex items-center gap-8">
            <span className="w-12 h-[1px] bg-[#e5ad46]/10"></span>
            <p className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em]">
              {val("footer_values", messages.footer.values)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
