"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Eye, History, ImagePlus, Loader2, LogOut, RefreshCcw, RotateCcw, Send, TriangleAlert, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { authAPI, getBackendApiUrls } from "@/app/lib/api";
import { signOutClient } from "@/app/lib/auth-client";
import { fetchSiteContent, SITE_CONTENT_PREVIEW_KEY, type SiteContent } from "@/app/lib/use-content";
import { useLocale } from "@/app/components/locale-provider";

type Field = { key: string; label: string; fallback: string; multiline?: boolean; image?: boolean; hint?: string };
type Section = { title: string; description: string; fields: Field[] };

const imageUrl = (storedName: string) => `${getBackendApiUrls()[0].replace(/\/api$/, "")}/uploads/${storedName}`;

async function compressIfNeeded(file: File): Promise<File> {
  const MAX_BYTES = 1.8 * 1024 * 1024;
  const MAX_DIM = 1920;
  const isSupported = ["image/jpeg", "image/png", "image/webp"].includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
  if (!isSupported) return file;
  if (file.size <= MAX_BYTES) {
    try {
      const bmp = await createImageBitmap(file).catch(() => null);
      if (bmp && bmp.width <= MAX_DIM && bmp.height <= MAX_DIM) { bmp.close?.(); return file; }
      bmp?.close?.();
    } catch {}
  }
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new window.Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = dataUrl;
    });
    let { width, height } = img;
    const scale = Math.min(1, MAX_DIM / Math.max(width, height));
    width = Math.round(width * scale);
    height = Math.round(height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/webp", 0.80));
    if (!blob) return file;
    if (blob.size >= file.size && file.size <= MAX_BYTES) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".webp";
    return new File([blob], name, { type: "image/webp" });
  } catch { return file; }
}

export default function SiteContentPage() {
  const { messages } = useLocale();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutClient();
      router.replace("/admin-login");
    } finally {
      setIsSigningOut(false);
    }
  }
  const sections = useMemo<Section[]>(() => [
    { title: "Hero", description: "Première impression et appels à l’action de l’accueil.", fields: [
      { key: "hero_eyebrow", label: "Badge", fallback: messages.hero.eyebrow },
      { key: "hero_title", label: "Titre", fallback: messages.hero.title, multiline: true },
      { key: "hero_description", label: "Texte", fallback: messages.hero.description, multiline: true },
      { key: "hero_primary_cta_label", label: "Libellé bouton principal", fallback: messages.hero.primaryCta },
      { key: "hero_primary_cta_url", label: "Lien bouton principal", fallback: "/#nos-services", hint: "URL interne ou externe" },
      { key: "hero_secondary_cta_label", label: "Libellé bouton secondaire", fallback: messages.hero.secondaryCta },
      { key: "hero_secondary_cta_url", label: "Lien bouton secondaire", fallback: "/#acces-client", hint: "URL interne ou externe" },
      { key: "hero_image", label: "Image principale", fallback: "/human_images/08_salle_machines_coudre.jpg", image: true },
      { key: "hero_secondary_image", label: "Image secondaire", fallback: "/human_images/07_coupe_machine_denim.jpg", image: true },
    ] },
    { title: "Services", description: "Titres, descriptions, points forts et visuels de vos services.", fields: [
      { key: "services_title", label: "Titre de section", fallback: messages.services.title },
      { key: "services_description", label: "Introduction", fallback: messages.services.description, multiline: true },
      { key: "services_s1_eyebrow", label: "Service 1 — surtitre", fallback: messages.services.service1Eyebrow },
      { key: "services_s1_title", label: "Service 1 — titre", fallback: messages.services.service1Title },
      { key: "services_s1_desc", label: "Service 1 — texte", fallback: messages.services.service1Desc, multiline: true },
      { key: "services_image_1", label: "Service 1 — image", fallback: "/human_images/04_decoupe_machine_electrique.jpg", image: true },
      { key: "services_s2_title", label: "Service 2 — titre", fallback: messages.services.service2Title },
      { key: "services_s2_desc", label: "Service 2 — texte", fallback: messages.services.service2Desc, multiline: true },
      { key: "services_bullet_1", label: "Point fort 1", fallback: messages.services.bullet1 }, { key: "services_bullet_2", label: "Point fort 2", fallback: messages.services.bullet2 }, { key: "services_bullet_3", label: "Point fort 3", fallback: messages.services.bullet3 },
      { key: "services_s3_title", label: "Service 3 — titre", fallback: messages.services.service3Title }, { key: "services_s3_eyebrow", label: "Service 3 — surtitre", fallback: messages.services.service3Eyebrow }, { key: "services_image_3", label: "Service 3 — image", fallback: "/human_images/09_decoupe_pieces_denim.jpg", image: true },
      { key: "services_s4_title", label: "Service 4 — titre", fallback: messages.services.service4Title }, { key: "services_s4_desc", label: "Service 4 — texte", fallback: messages.services.service4Desc, multiline: true }, { key: "services_s4_cta_label", label: "Service 4 — bouton", fallback: messages.services.service4Cta }, { key: "services_image_4", label: "Service 4 — image", fallback: "/human_images/01_patronage_terrasse.jpg", image: true },
    ] },
    { title: "À propos & chiffres", description: "Présentation de l’atelier et statistiques affichées sur la page d’accueil.", fields: [
      { key: "about_eyebrow", label: "Surtitre", fallback: messages.about.eyebrow }, { key: "about_title", label: "Titre", fallback: messages.about.title }, { key: "about_p1", label: "Paragraphe 1", fallback: messages.about.p1, multiline: true }, { key: "about_p2", label: "Paragraphe 2", fallback: messages.about.p2, multiline: true }, { key: "about_image", label: "Image", fallback: "/human_images/05_equipe_tracage_patron.jpg", image: true },
      ...[1, 2, 3].flatMap((number) => [{ key: `about_stat_${number}`, label: `Chiffre ${number}`, fallback: messages.about[`stat${number}` as "stat1" | "stat2" | "stat3"] }, { key: `about_stat_${number}_label`, label: `Libellé chiffre ${number}`, fallback: messages.about[`stat${number}Label` as "stat1Label" | "stat2Label" | "stat3Label"] }]),
    ] },
    { title: "Pied de page", description: "Marque, navigation, liens légaux et réseaux sociaux.", fields: [
      { key: "footer_logo", label: "Logo", fallback: "/navbar/logo-dark.svg", image: true }, { key: "footer_description", label: "Description", fallback: messages.footer.description, multiline: true }, { key: "footer_copyright", label: "Copyright", fallback: messages.footer.copyright }, { key: "footer_values", label: "Valeurs", fallback: messages.footer.values },
      { key: "footer_navigation_title", label: "Titre navigation", fallback: messages.footer.navigation }, { key: "footer_legal_title", label: "Titre liens légaux", fallback: messages.footer.legal }, { key: "footer_social_title", label: "Titre réseaux sociaux", fallback: messages.footer.social },
      { key: "footer_link_home_label", label: "Navigation — accueil", fallback: messages.footer.home }, { key: "footer_link_services_label", label: "Navigation — services", fallback: messages.footer.services }, { key: "footer_link_about_label", label: "Navigation — à propos", fallback: messages.footer.about }, { key: "footer_link_client_label", label: "Navigation — espace client", fallback: messages.footer.clientSpace },
      { key: "footer_legal_notice_label", label: "Lien légal — libellé", fallback: messages.footer.legalNotice }, { key: "footer_legal_notice_url", label: "Lien légal — URL", fallback: "/mentions-legales" }, { key: "footer_terms_label", label: "Conditions — libellé", fallback: messages.footer.terms }, { key: "footer_terms_url", label: "Conditions — URL", fallback: "/conditions-utilisation" }, { key: "footer_privacy_label", label: "Confidentialité — libellé", fallback: messages.footer.privacy }, { key: "footer_privacy_url", label: "Confidentialité — URL", fallback: "/confidentialite" }, { key: "footer_contact_label", label: "Contact — libellé", fallback: messages.footer.directContact }, { key: "footer_contact_url", label: "Contact — URL", fallback: "mailto:contact@jmrtextile.com" },
      { key: "footer_social_facebook_url", label: "Facebook — URL", fallback: "#" }, { key: "footer_social_whatsapp_url", label: "WhatsApp — URL", fallback: "#" }, { key: "footer_social_instagram_url", label: "Instagram — URL", fallback: "#" },
    ] },
  ], [messages]);
  const [saved, setSaved] = useState<SiteContent>({});
  const [draft, setDraft] = useState<SiteContent>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [resetKeys, setResetKeys] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<Array<{ id: number; author_name?: string; created_at: string }>>([]);

  useEffect(() => { fetchSiteContent().then((content) => { setSaved(content); setDraft(content); }).catch(() => setNotice({ tone: "error", message: "Impossible de charger le contenu enregistré." })).finally(() => setLoading(false)); }, []);
  const value = (field: Field) => draft[field.key] ?? saved[field.key] ?? field.fallback;
  const setValue = (key: string, value: string) => {
    setResetKeys((current) => current.filter((resetKey) => resetKey !== key));
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const hasChanges = Object.entries(draft).some(([key, value]) => saved[key] !== value) || resetKeys.length > 0;
  const previewContent = useMemo(() => {
    const next = { ...draft };
    resetKeys.forEach((key) => delete next[key]);
    return next;
  }, [draft, resetKeys]);
  function openPreview() {
    window.localStorage.setItem(SITE_CONTENT_PREVIEW_KEY, JSON.stringify(previewContent));
    setPreviewOpen(true);
  }
  async function openHistory() {
    try {
      const response = await authAPI.get<Array<{ id: number; author_name?: string; created_at: string }>>("/content/history");
      setVersions(response.data ?? []); setHistoryOpen(true);
    } catch { setNotice({ tone: "error", message: "Impossible de charger l’historique." }); }
  }
  async function restore(versionId: number) {
    if (!window.confirm("Restaurer cette version et la publier immédiatement ?")) return;
    setSaving(true);
    try {
      const response = await authAPI.post<{ content: SiteContent }>(`/content/history/${versionId}/restore`, {});
      const next = response.data?.content ?? {};
      setSaved(next); setDraft(next); setResetKeys([]); setHistoryOpen(false);
      setNotice({ tone: "success", message: "La version a été restaurée et publiée." });
    } catch (error) { setNotice({ tone: "error", message: error instanceof Error ? error.message : "Restauration impossible." }); }
    finally { setSaving(false); }
  }

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setNotice(null);
    try {
      const changed = Object.fromEntries(Object.entries(draft).filter(([key, value]) => saved[key] !== value && !resetKeys.includes(key)));
      const response = await authAPI.post<{ content: SiteContent }>("/content/publish", { content: changed, reset_keys: resetKeys });
      const nextSaved = response.data?.content ?? previewContent;
      setSaved(nextSaved); setDraft(nextSaved); setResetKeys([]);
      window.localStorage.removeItem(SITE_CONTENT_PREVIEW_KEY);
      setNotice({ tone: "success", message: "Publication effectuée : les modifications sont maintenant visibles sur le site." });
    } catch (error) { setDraft(saved); setNotice({ tone: "error", message: error instanceof Error ? error.message : "La sauvegarde a échoué. Vos valeurs enregistrées ont été restaurées." }); }
    finally { setSaving(false); }
  }

  async function upload(field: Field, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setNotice({ tone: "error", message: "Format non supporté : utilisez JPG, PNG ou WEBP." });
      event.target.value = "";
      return;
    }
    setUploading(field.key); setNotice(null);
    try {
      const toUpload = await compressIfNeeded(file);
      if (toUpload.size > 5 * 1024 * 1024) {
        setNotice({ tone: "error", message: "Image encore trop volumineuse après compression (5 Mo max)." });
        return;
      }
      const form = new FormData(); form.append("file", toUpload);
      const response = await authAPI.post<{ file: { stored_name: string } }>("/uploads/image", form);
      const storedName = response.data?.file?.stored_name;
      if (!storedName) throw new Error("L’API n’a pas retourné le fichier importé.");
      setValue(field.key, imageUrl(storedName));
      setNotice({ tone: "success", message: "Image importée. Cliquez sur « Enregistrer » pour la publier." });
    } catch (error) { setNotice({ tone: "error", message: error instanceof Error ? error.message : "Import impossible." }); }
    finally { setUploading(null); event.target.value = ""; }
  }

  function resetImage(field: Field) {
    setDraft((current) => { const next = { ...current }; delete next[field.key]; return next; });
    setResetKeys((current) => current.includes(field.key) ? current : [...current, field.key]);
  }

  return <form onSubmit={save} className="mx-auto max-w-6xl px-6 py-8 md:px-12 md:py-12">
    <div className="mb-8 flex flex-col gap-5 border-b border-[#e5ad46]/15 pb-8 md:flex-row md:items-end md:justify-between">
      <div><p className="text-[10px] font-bold uppercase tracking-[.28em] text-[#e5ad46]">Site vitrine</p><h2 className="mt-2 font-headline text-3xl text-[#eccc90]">Édition du site</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#eccc90]/60">Les valeurs enregistrées remplacent les textes et images locales jusqu’à leur prochaine modification. Les champs vides gardent leur valeur par défaut.</p></div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={openPreview} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e5ad46]/35 px-4 text-xs font-bold uppercase tracking-widest text-[#e5ad46] transition hover:bg-[#e5ad46]/10 disabled:opacity-60"><Eye className="h-4 w-4" />Aperçu</button><button type="button" onClick={openHistory} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#e5ad46]/20 px-4 text-xs font-bold uppercase tracking-widest text-[#eccc90] transition hover:bg-white/5"><History className="h-4 w-4" />Historique</button><button type="button" onClick={handleSignOut} disabled={isSigningOut} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 text-xs font-bold uppercase tracking-widest text-red-400 transition hover:bg-red-500/20 disabled:opacity-60"><LogOut className="h-4 w-4" />{isSigningOut ? "Déconnexion…" : "Déconnexion"}</button><button disabled={loading || saving || !hasChanges} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e5ad46] px-5 text-xs font-bold uppercase tracking-widest text-[#1e2a38] transition hover:bg-[#f3c465] disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" />{saving ? "Publication…" : "Publier"}</button></div>
    </div>
    {notice && <div role="status" className={`mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm ${notice.tone === "success" ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-red-400/30 bg-red-400/10 text-red-100"}`}>{notice.tone === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <TriangleAlert className="h-5 w-5 shrink-0" />}{notice.message}</div>}
    {loading ? <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-[#eccc90]/60"><Loader2 className="h-5 w-5 animate-spin" />Chargement du contenu…</div> : <div className="space-y-4">{sections.map((section, index) => <details key={section.title} open={index === 0} className="group overflow-hidden rounded-2xl border border-[#e5ad46]/15 bg-[#25303a] shadow-lg"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden md:px-7"><div><h3 className="font-headline text-xl text-[#eccc90]">{section.title}</h3><p className="mt-1 text-xs text-[#eccc90]/55">{section.description}</p></div><ChevronDown className="h-5 w-5 text-[#e5ad46] transition group-open:rotate-180" /></summary><div className="grid gap-5 border-t border-[#e5ad46]/10 p-5 md:grid-cols-2 md:p-7">{section.fields.map((field) => <label key={field.key} className={`block ${field.multiline || field.image ? "md:col-span-2" : ""}`}><span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/75">{field.label}</span>{field.image ? <div className="grid gap-4 sm:grid-cols-[12rem_1fr]"><div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[#e5ad46]/15 bg-[#1e2a38]"><img src={value(field)} alt={`Aperçu : ${field.label}`} className="h-full w-full object-cover" /><span className="absolute bottom-0 left-0 right-0 bg-black/55 px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-[#eccc90]">Aperçu</span></div><div className="flex flex-col justify-center gap-3"><input value={value(field)} onChange={(event) => setValue(field.key, event.target.value)} className="w-full rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-3 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]" aria-label={`URL de ${field.label}`} /><div className="flex flex-wrap gap-2"><label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-[#e5ad46]/30 px-3 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] hover:bg-[#e5ad46]/10"><ImagePlus className="h-4 w-4" />{uploading === field.key ? "Import…" : "Importer"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(field, event)} className="sr-only" disabled={uploading !== null} /></label><button type="button" onClick={() => resetImage(field)} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60 hover:bg-white/5 hover:text-[#eccc90]"><RefreshCcw className="h-3.5 w-3.5" />Image par défaut</button></div><p className="text-xs text-[#eccc90]/45">L’image importée est conservée sur le serveur; seul son lien est publié.</p></div></div> : field.multiline ? <textarea value={value(field)} onChange={(event) => setValue(field.key, event.target.value)} rows={4} className="w-full resize-y rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-3 py-2.5 text-sm leading-relaxed text-[#eccc90] outline-none focus:border-[#e5ad46]" /> : <><input value={value(field)} onChange={(event) => setValue(field.key, event.target.value)} className="w-full rounded-xl border border-[#e5ad46]/20 bg-[#1e2a38] px-3 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]" />{field.hint && <small className="mt-1 block text-xs text-[#eccc90]/45">{field.hint}</small>}</>}</label>)}</div></details>)}</div>}
    {historyOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"><section className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#e5ad46]/20 bg-[#25303a] p-6"><div className="flex items-center justify-between"><h3 className="flex items-center gap-2 font-headline text-2xl text-[#eccc90]"><History className="h-5 w-5 text-[#e5ad46]" />Historique des publications</h3><button type="button" onClick={() => setHistoryOpen(false)} className="text-[#eccc90]"><X className="h-5 w-5" /></button></div><p className="mt-2 text-sm text-[#eccc90]/60">Restaurer crée à son tour une nouvelle version, afin que le retour arrière reste réversible.</p><div className="mt-5 space-y-3">{versions.length ? versions.map((version) => <div key={version.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5ad46]/10 p-4 text-sm text-[#eccc90]"><span>Version #{version.id} · {new Date(version.created_at).toLocaleString("fr-FR")}{version.author_name ? ` · ${version.author_name}` : ""}</span><button type="button" disabled={saving} onClick={() => restore(version.id)} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#e5ad46]"><RotateCcw className="h-3.5 w-3.5" />Restaurer</button></div>) : <p className="py-8 text-center text-sm text-[#eccc90]/60">Aucune publication archivée pour le moment.</p>}</div></section></div>}
    {previewOpen && <div className="fixed inset-0 z-[100] bg-[#1e2a38] p-3 md:p-6"><div className="mx-auto flex h-full max-w-[1600px] flex-col overflow-hidden rounded-2xl border border-[#e5ad46]/20 bg-[#25303a]"><div className="flex items-center justify-between border-b border-[#e5ad46]/15 px-4 py-3"><div><strong className="text-[#eccc90]">Aperçu du brouillon</strong><span className="ml-3 text-xs text-[#eccc90]/55">Non publié — visible uniquement ici</span></div><button type="button" onClick={() => { window.localStorage.removeItem(SITE_CONTENT_PREVIEW_KEY); setPreviewOpen(false); }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-[#eccc90] hover:bg-white/5"><X className="h-4 w-4" />Fermer</button></div><iframe title="Aperçu en direct du site" src="/?contentPreview=1" className="min-h-0 flex-1 bg-white" /></div></div>}
  </form>;
}
