"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/app/components/locale-provider";
import { scrollToSection } from "@/app/lib/scroll";
import { useContent } from "@/app/lib/use-content";
import { EditableText } from "@/app/components/editable-text";
import { getUser } from "@/app/lib/auth";

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
  const { content, save, loaded } = useContent();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const u = getUser() as { role?: string } | null;
    setIsAdmin(u?.role === "admin");
    const onStorage = () => {
      const uu = getUser() as { role?: string } | null;
      setIsAdmin(uu?.role === "admin");
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const val = (key: string, fallback: string) => loaded && content[key] ? content[key] : fallback;
  const handleSave = (key: string) => (newVal: string) => save(key, newVal);

  const footerLinks: Array<{ key: string; sectionId: string; fallback: string }> = [
    { key: "footer_link_home_label", sectionId: "accueil", fallback: messages.footer.home },
    { key: "footer_link_services_label", sectionId: "nos-services", fallback: messages.footer.services },
    { key: "footer_link_about_label", sectionId: "a-propos", fallback: messages.footer.about },
    { key: "footer_link_client_label", sectionId: "acces-client", fallback: messages.footer.clientSpace },
  ];

  const legalLinks: Array<{ labelKey: string; urlKey: string; fallbackLabel: string; fallbackUrl: string }> = [
    { labelKey: "footer_legal_notice_label", urlKey: "footer_legal_notice_url", fallbackLabel: messages.footer.legalNotice, fallbackUrl: "/mentions-legales" },
    { labelKey: "footer_terms_label", urlKey: "footer_terms_url", fallbackLabel: messages.footer.terms, fallbackUrl: "/conditions-utilisation" },
    { labelKey: "footer_privacy_label", urlKey: "footer_privacy_url", fallbackLabel: messages.footer.privacy, fallbackUrl: "/confidentialite" },
    { labelKey: "footer_contact_label", urlKey: "footer_contact_url", fallbackLabel: messages.footer.directContact, fallbackUrl: "mailto:contact@jmrtextile.com" },
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
                src={val("footer_logo", "/navbar/logo-dark.svg")}
                alt="JMR Textile"
              />
            </Link>
            <div className="font-body text-sm text-[#eccc90]/70 leading-relaxed max-w-sm">
              <EditableText isAdmin={isAdmin} content={val("footer_description", messages.footer.description)} onSave={handleSave("footer_description")} tag="p" />
            </div>
            {isAdmin && (
              <div className="mt-3">
                <span className="text-[10px] uppercase tracking-widest text-[#e5ad46]/50">Logo URL (éditable dans /backoffice/site-content)</span>
              </div>
            )}
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <EditableText isAdmin={isAdmin} content={val("footer_navigation_title", messages.footer.navigation)} onSave={handleSave("footer_navigation_title")} tag="span" />
            </div>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.sectionId);
                    }}
                    className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70 hover:text-[#e5ad46] hover:translate-x-1 transition-all inline-block"
                  >
                    {isAdmin ? (
                      <EditableText isAdmin={isAdmin} content={val(link.key, link.fallback)} onSave={handleSave(link.key)} tag="span" />
                    ) : (
                      val(link.key, link.fallback)
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-2">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <EditableText isAdmin={isAdmin} content={val("footer_legal_title", messages.footer.legal)} onSave={handleSave("footer_legal_title")} tag="span" />
            </div>
            <ul className="space-y-4">
              {legalLinks.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={val(link.urlKey, link.fallbackUrl)}
                    className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70 hover:text-[#e5ad46] hover:translate-x-1 transition-all inline-block"
                  >
                    {isAdmin ? (
                      <EditableText isAdmin={isAdmin} content={val(link.labelKey, link.fallbackLabel)} onSave={handleSave(link.labelKey)} tag="span" />
                    ) : (
                      val(link.labelKey, link.fallbackLabel)
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div className="lg:col-span-4">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <EditableText isAdmin={isAdmin} content={val("footer_social_title", messages.footer.social)} onSave={handleSave("footer_social_title")} tag="span" />
            </div>
            <div className="flex gap-4 mb-12">
              {SOCIAL_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href={val(`footer_social_${item.key}_url`, "#")}
                  className="w-14 h-14 rounded-2xl border border-[#e5ad46]/30 flex items-center justify-center hover:border-[#e5ad46] hover:bg-[#e5ad46]/10 transition-all group"
                  aria-label={item.label}
                  target={val(`footer_social_${item.key}_url`, "#").startsWith("http") ? "_blank" : undefined}
                  rel={val(`footer_social_${item.key}_url`, "#").startsWith("http") ? "noopener noreferrer" : undefined}
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
            {isAdmin && (
              <p className="text-[10px] leading-relaxed text-[#eccc90]/30">Liens sociaux éditables dans <Link href="/backoffice/site-content" className="underline hover:text-[#e5ad46]">/backoffice/site-content</Link></p>
            )}
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-20 pt-10 border-t border-[#e5ad46]/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em] text-center md:text-left">
            <EditableText isAdmin={isAdmin} content={val("footer_copyright", messages.footer.copyright)} onSave={handleSave("footer_copyright")} tag="span" />
          </div>
          <div className="flex items-center gap-8">
            <span className="w-12 h-[1px] bg-[#e5ad46]/10 hidden md:block"></span>
            <div className="font-body text-[10px] text-[#eccc90]/40 uppercase tracking-[0.3em] text-center">
              <EditableText isAdmin={isAdmin} content={val("footer_values", messages.footer.values)} onSave={handleSave("footer_values")} tag="span" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
