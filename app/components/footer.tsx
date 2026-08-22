"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/app/components/locale-provider";
import { scrollToSection } from "@/app/lib/scroll";
import { useContent } from "@/app/lib/use-content";
import { EditableText } from "@/app/components/editable-text";
import { EditableImage } from "@/app/components/editable-image";
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
            <div className="inline-flex flex-col gap-4 p-8 bg-[#1e2a38] rounded-2xl shadow-2xl mb-8 border border-[#e5ad46]/20 relative overflow-hidden min-w-[280px]">
              <Link href="/" aria-label="Accueil JMR Textile" className="block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="w-full max-w-[280px] h-auto block" src={val("footer_logo", "/navbar/logo-dark.svg")} alt="JMR Textile" />
              </Link>
              {isAdmin && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 pointer-events-auto">
                    {/* Overlay éditable pour le logo */}
                    <div className="absolute inset-0">
                      <EditableImage
                        src={val("footer_logo", "/navbar/logo-dark.svg")}
                        alt="JMR Textile"
                        contentKey="footer_logo"
                        isAdmin={isAdmin}
                        onSave={handleSave("footer_logo")}
                        className="w-full h-full object-contain opacity-0"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="font-body text-sm text-[#eccc90]/70 leading-relaxed max-w-sm">
              <EditableText isAdmin={isAdmin} content={val("footer_description", messages.footer.description)} onSave={handleSave("footer_description")} tag="p" />
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-2">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <EditableText isAdmin={isAdmin} content={val("footer_navigation_title", messages.footer.navigation)} onSave={handleSave("footer_navigation_title")} tag="span" />
            </div>
            <ul className="space-y-4">
              {footerLinks.map((link) => (
                <li key={link.key} className="font-body text-xs uppercase tracking-widest text-[#eccc90]/70 hover:text-[#e5ad46] transition-all">
                  {isAdmin ? (
                    <EditableText isAdmin={isAdmin} content={val(link.key, link.fallback)} onSave={handleSave(link.key)} tag="span" className="inline-block" />
                  ) : (
                    <Link
                      href="/"
                      onClick={(e) => { e.preventDefault(); scrollToSection(link.sectionId); }}
                      className="inline-block hover:translate-x-1 transition-transform"
                    >
                      {val(link.key, link.fallback)}
                    </Link>
                  )}
                  {isAdmin && <span className="ml-2 text-[9px] opacity-50">→ {link.sectionId}</span>}
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
                <li key={link.labelKey} className="font-body text-xs uppercase tracking-widest">
                  <div className="flex flex-col gap-1">
                    <EditableText isAdmin={isAdmin} content={val(link.labelKey, link.fallbackLabel)} onSave={handleSave(link.labelKey)} tag="span" className="text-[#eccc90]/70" />
                    {isAdmin && (
                      <EditableText isAdmin={isAdmin} content={val(link.urlKey, link.fallbackUrl)} onSave={handleSave(link.urlKey)} tag="span" className="text-[10px] normal-case tracking-normal text-[#e5ad46]/60 break-all" />
                    )}
                    {!isAdmin && (
                      <Link href={val(link.urlKey, link.fallbackUrl)} className="text-[#eccc90]/70 hover:text-[#e5ad46] transition-colors">
                        {val(link.labelKey, link.fallbackLabel)}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Column */}
          <div className="lg:col-span-4">
            <div className="font-label text-[10px] uppercase tracking-[0.3em] text-[#e5ad46] font-bold mb-8">
              <EditableText isAdmin={isAdmin} content={val("footer_social_title", messages.footer.social)} onSave={handleSave("footer_social_title")} tag="span" />
            </div>
            <div className="flex gap-4 mb-6 flex-wrap">
              {SOCIAL_ITEMS.map((item) => (
                <a
                  key={item.key}
                  href={isAdmin ? undefined : val(`footer_social_${item.key}_url`, "#")}
                  onClick={isAdmin ? (e) => e.preventDefault() : undefined}
                  className="w-14 h-14 rounded-2xl border border-[#e5ad46]/30 flex items-center justify-center hover:border-[#e5ad46] hover:bg-[#e5ad46]/10 transition-all group relative"
                  aria-label={item.label}
                >
                  <Image src={item.icon} alt={item.label} width={28} height={28} className="social-icon-gold drop-shadow-[0_0_8px_rgba(229,173,70,0.3)]" />
                </a>
              ))}
            </div>
            {isAdmin && (
              <div className="space-y-2 mt-4 p-3 rounded-xl bg-white/5 border border-[#e5ad46]/10">
                <p className="text-[10px] uppercase tracking-widest text-[#e5ad46]/70 font-bold">Liens réseaux (éditable)</p>
                {SOCIAL_ITEMS.map((item) => (
                  <div key={item.key} className="flex flex-col gap-1">
                    <span className="text-xs text-[#eccc90]/70">{item.label}</span>
                    <EditableText isAdmin={isAdmin} content={val(`footer_social_${item.key}_url`, "#")} onSave={handleSave(`footer_social_${item.key}_url`)} tag="span" className="text-xs break-all text-[#e5ad46]" />
                  </div>
                ))}
              </div>
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
