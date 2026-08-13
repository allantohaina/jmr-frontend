"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { authAPI, type QuoteDraft, type QuoteRecord, getToken } from "@/app/lib";
import { getErrorMessage } from "@/app/lib/errors";
import { CsvPreview } from "@/app/components/document-preview";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Check, ChevronDown, FileImage, Loader2, UploadCloud, AlertTriangle, X } from "lucide-react";

const MAX_ATTACHMENTS = 20;
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PROGRESS_STEPS = ["Type de projet", "Spécifications", "Coordonnées", "Documents"];

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${bytes} o`;
}

function isImageFile(file: File) {
  return IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|webp)$/i.test(file.name);
}

function isCsvFile(file: File) {
  return file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
}

// 1. DEFINIR LE SCHEMA DE VALIDATION ZOD
const quoteRequestSchema = z.object({
  category: z.string().min(1, "Veuillez sélectionner une catégorie"),
  name: z
    .string()
    .min(2, "Le nom doit comporter au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  email: z.string().email("Veuillez entrer une adresse email valide"),
  phone: z.string().optional(),
  tissu: z.string().optional(),
  coupe: z.string().optional(),
  gabarit: z.string().optional(),
  style: z.string().optional(),
  grammage: z.string().optional(),
  tailles: z.string().optional(),
  quantite: z.string().optional(),
  finitions: z.string().optional(),
  delai_souhaite: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === "") return true;
      const parsed = new Date(val);
      if (isNaN(parsed.getTime())) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return parsed >= today;
    },
    { message: "La date souhaitée ne peut pas être dans le passé" }
  ),
  request_type: z.enum(["new", "edit", "add"]),
  message: z
    .string()
    .min(20, "Veuillez fournir plus de détails (au moins 20 caractères)"),
  technical_files: z.any().optional(),
  modify_code: z.string().optional(),
});

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

function buildQuoteRequestPayload(data: QuoteRequestFormData) {
  const { technical_files, ...values } = data;
  const payload = new FormData();
  Object.entries(values).forEach(([key, value]) => payload.append(key, String(value ?? "")));

  if (technical_files instanceof FileList) {
    Array.from(technical_files).forEach((file) => payload.append("technical_files[]", file));
  }

  return payload;
}

function HelpDot({ tip }: { tip: string }) {
  return (
    <span className="relative inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-[#eccc90]/40 text-[8px] font-semibold not-italic tracking-normal text-[#eccc90]/60 group-hover:text-[#e5ad46]">
      ?
      <span className="pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 hidden w-52 -translate-x-1/2 rounded-md border border-[#e5ad46]/10 bg-[#25303a] px-3 py-2 text-[11px] font-normal leading-relaxed normal-case tracking-normal text-[#eccc90]/80 shadow-xl group-hover:block">
        {tip}
      </span>
    </span>
  );
}

function typeCardA11y(selected: boolean) {
  return selected ? "Carte sélectionnée" : "Carte non sélectionnée";
}

function QuoteFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modifyCode = searchParams.get("modify");
  const draftId = searchParams.get("draft");
  const categoryParam = searchParams.get("category");
  const requestTypeDefault = modifyCode ? "edit" : "new";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [pendingQuoteCount, setPendingQuoteCount] = useState(0);
  const [duplicateFormData, setDuplicateFormData] = useState<QuoteRequestFormData | null>(null);
  const [projectType, setProjectType] = useState<"serie" | "mesure">("serie");
  const [activeStep, setActiveStep] = useState(0);

  const typePickerRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const docsRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLDivElement>(null);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors },
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      category: categoryParam || "",
      name: "",
      email: "",
      phone: "",
      tissu: "",
      coupe: "",
      gabarit: "",
      style: "",
      grammage: "",
      tailles: "",
      quantite: "",
      finitions: "",
      delai_souhaite: "",
      request_type: requestTypeDefault,
      message: "",
      modify_code: modifyCode || "",
    },
  });

  useEffect(() => {
    const sections = [typePickerRef, specsRef, docsRef, coordsRef];
    const onScroll = () => {
      let current = 0;
      sections.forEach((ref, i) => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect();
          if (rect.top < 200) current = i;
        }
      });
      setActiveStep(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onCategoryChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  function removeAttachment(index: number) {
    const next = attachments.filter((_, i) => i !== index);
    setAttachments(next);
    const dt = new DataTransfer();
    next.forEach((file) => dt.items.add(file));
    setValue("technical_files", dt.files);
  }

  const [draft, setDraft] = useState<QuoteDraft | null>(null);

  const loadDraft = useCallback(async (id: string) => {
    try {
      const qRes = await authAPI.get<QuoteRecord>(`/quotes/${id}`);
      const q = (qRes as any).data ?? qRes;
      if (q && q.status === "draft") {
        setDraft({ id: String(q.id), payload: q as unknown as Record<string, unknown>, created_at: q.created_at, updated_at: q.updated_at } as QuoteDraft);
        reset({
          category: (q.category as string) || categoryParam || "",
          name: (q.name as string) || "",
          email: (q.email as string) || "",
          phone: (q.phone as string) || "",
          tissu: (q.tissu as string) || "",
          coupe: (q.coupe as string) || "",
          gabarit: (q.gabarit as string) || "",
          style: (q.style as string) || "",
          grammage: (q.grammage as string) || "",
          tailles: (q.tailles as string) || "",
          quantite: (q.quantite as string) || "",
          finitions: (q.finitions as string) || "",
          delai_souhaite: (q.delai_souhaite as string) || "",
          request_type: ((q.request_type as string) || "new") as QuoteRequestFormData["request_type"],
          message: (q.message as string) || "",
          modify_code: (q.modify_code as string) || modifyCode || "",
        });
        return;
      }
    } catch {
      // Not found
    }
  }, [categoryParam, modifyCode, reset]);

  useEffect(() => {
    if (draftId) void loadDraft(draftId);
  }, [draftId, loadDraft]);

  async function saveDraft(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError("");
    if (!getToken()) {
      router.push(`/mon-profil?next=${encodeURIComponent("/demande-devis")}`);
      return;
    }
    setIsSavingDraft(true);
    try {
      const values = getValues();
      const payload: Record<string, unknown> = {};
      (Object.keys(values) as (keyof QuoteRequestFormData)[]).forEach((key) => {
        if (key !== "technical_files") payload[key] = values[key] ?? "";
      });
      payload.status = "draft";
      let savedId: string | null = null;
      if (draft?.id) {
        await authAPI.put(`/quotes/${draft.id}`, payload);
        savedId = String(draft.id);
      } else {
        const res = await authAPI.post<{ id?: string | number }>("/quotes", payload);
        savedId = String(((res as any).data?.id ?? (res as any).id) ?? "");
      }
      if (savedId) {
        setDraft((prev) => ({ id: savedId, ...(prev ?? {}) }) as QuoteDraft);
      }
      router.push("/mon-profil");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function onSubmit(data: QuoteRequestFormData) {
    try {
      const token = getToken();
      if (token) {
        const quotesRes = await authAPI.get<{ data?: Array<{ statut?: string }> }>("/quotes", token);
        const quotes = (quotesRes.data?.data ?? quotesRes.data ?? []) as Array<{ statut?: string }>;
        const pendingQuotes = quotes.filter((q) => q.statut === "En attente" || q.statut === "En attente de signature");
        if (pendingQuotes.length > 0) {
          setPendingQuoteCount(pendingQuotes.length);
          setDuplicateFormData(data);
          setShowDuplicateWarning(true);
          return;
        }
      }
    } catch {
      // If we can't check, proceed with submission
    }

    await proceedSubmit(data);
  }

  async function proceedSubmit(data: QuoteRequestFormData) {
    setIsSubmitting(true);
    setSubmitError("");
    setShowDuplicateWarning(false);

    try {
      const files = data.technical_files instanceof FileList ? Array.from(data.technical_files) : [];
      if (files.length > MAX_ATTACHMENTS) throw new Error(`Ajoutez au maximum ${MAX_ATTACHMENTS} fichiers de référence.`);
      if (files.some((file) => file.size > MAX_ATTACHMENT_SIZE_BYTES)) throw new Error("Chaque fichier doit faire moins de 10 Mo.");
      const payload = buildQuoteRequestPayload(data);
      await authAPI.post("/quotes", payload);
      if (draft?.id) {
        try { await authAPI.delete(`/quotes/${draft.id}`); } catch { /* best effort */ }
      }
      router.push("/mon-profil");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleConfirmDuplicate() {
    if (duplicateFormData) {
      proceedSubmit(duplicateFormData);
    }
  }

  function handleCancelDuplicate() {
    setShowDuplicateWarning(false);
    setDuplicateFormData(null);
  }

  const inputClass = (hasError: boolean) =>
    `w-full rounded-md border bg-[#1e2a38] px-4 py-3 text-[13.5px] text-[#eccc90] placeholder:text-[#eccc90]/25 focus:border-[#e5ad46] focus:outline-none transition-all ${
      hasError ? "border-red-400/50" : "border-[#e5ad46]/10"
    }`;

  const fieldLabelClass = "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/50 mb-2";

  return (
    <div className="min-h-screen bg-[#1e2a38] pb-16 pt-20 md:pb-24 md:pt-24">
      <div className="mx-auto w-full max-w-[920px] px-5" id="demande-devis-form">
        {/* PROGRESS */}
        <div className="sticky top-[88px] z-20 -mx-5 border-b border-[#e5ad46]/10 bg-[#1e2a38]/95 px-5 py-3.5 backdrop-blur-sm">
          <div className="flex justify-center" aria-label="Progression du formulaire">
            {PROGRESS_STEPS.map((label, i) => (
              <div
                key={label}
                className={`relative flex items-center gap-2 px-3 text-[11px] sm:px-4 ${
                  i === activeStep ? "text-[#eccc90]" : i < activeStep ? "text-[#eccc90]/70" : "text-[#eccc90]/35"
                }`}
              >
                {i < PROGRESS_STEPS.length - 1 && (
                  <span aria-hidden="true" className="absolute right-0 top-1/2 h-px w-4 -translate-y-1/2 bg-[#e5ad46]/15 sm:w-6" />
                )}
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors ${
                    i === activeStep
                      ? "border-[#e5ad46] text-[#e5ad46]"
                      : i < activeStep
                        ? "border-[#e5ad46] bg-[#e5ad46] text-[#1e2a38]"
                        : "border-[#e5ad46]/15 text-[#eccc90]/35"
                  }`}
                >
                  {i + 1}
                </span>
                <span className="hidden md:inline">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* HERO */}
        <header className="mb-10 text-center md:mb-14">
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#e5ad46]">Demande de devis</span>
          <h2 className="mb-4 font-headline text-4xl font-semibold text-[#e5ad46] md:text-5xl">
            {modifyCode ? `Modification du devis ${modifyCode}` : "Parlons de votre prochain projet textile"}
          </h2>
          <p className="mx-auto max-w-[560px] text-[14.5px] leading-relaxed text-[#eccc90]/60">
            {modifyCode
              ? "Precisez ici les modifications souhaitees. Choisissez edit pour une retouche ou add pour un ajout. La version precedente reste verrouillee et nous creerons une nouvelle demande signee."
              : "Remplissez le formulaire pour nous faire part de votre projet. Nous revenons vers vous avec une estimation claire et un suivi adapté à votre besoin."}
          </p>
        </header>

        {showDuplicateWarning && (
          <div className="mb-8 rounded-lg border border-amber-400/30 bg-amber-400/10 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-sm font-bold text-amber-400">Devis en cours de traitement</h3>
                <p className="mb-4 text-sm text-[#eccc90]/70">
                  Vous avez déjà <strong>{pendingQuoteCount} devis en attente</strong>.
                  Souhaitez-vous tout de même envoyer une nouvelle demande ?
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleConfirmDuplicate}
                    disabled={isSubmitting}
                    className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1e2a38] transition-colors hover:bg-amber-300"
                  >
                    Oui, envoyer quand même
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelDuplicate}
                    className="rounded-lg border border-[#e5ad46]/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#eccc90]/60 transition-colors hover:bg-white/5"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {submitError ? (
          <div className="mb-8 rounded-lg border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100" role="alert">
            {submitError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 0 : TYPE DE PROJET */}
          <div ref={typePickerRef} className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2" role="radiogroup" aria-label="Type de projet">
            {([
              { type: "serie", icon: "▤", name: "Production en série", desc: "Fabrication en quantité pour une marque, une boutique ou un événement — du prototype à la série complète.", tags: ["B2B", "Dès 50 pièces", "Un seul modèle décliné"] },
              { type: "mesure", icon: "✂", name: "Pièce sur-mesure", desc: "Une pièce unique confectionnée à vos mesures — pour vous-même ou une occasion précise.", tags: ["Particulier", "1 pièce", "Prise de mesures"] },
            ] as const).map((card) => {
              const selected = projectType === card.type;
              return (
                <button
                  key={card.type}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={typeCardA11y(selected)}
                  onClick={() => setProjectType(card.type)}
                  className={`rounded-md border-[1.5px] p-6 text-left transition-colors cursor-pointer ${
                    selected ? "border-[#e5ad46] bg-[#25303a]" : "border-[#e5ad46]/10 bg-[#25303a] hover:border-[#e5ad46]/60"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-md border text-base ${selected ? "border-[#e5ad46] text-[#e5ad46]" : "border-[#e5ad46]/20 text-[#e5ad46]"}`}>
                      {card.icon}
                    </span>
                    <span className={`relative h-4 w-4 shrink-0 rounded-full border-[1.5px] ${selected ? "border-[#e5ad46]" : "border-[#e5ad46]/25"}`}>
                      {selected && <span className="absolute inset-[3px] rounded-full bg-[#e5ad46]" />}
                    </span>
                  </div>
                  <span className="mb-1.5 block font-headline text-[17px] font-semibold text-[#eccc90]">{card.name}</span>
                  <span className="mb-3 block text-[12.5px] leading-relaxed text-[#eccc90]/60">{card.desc}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {card.tags.map((tag) => (
                      <span key={tag} className="rounded-sm bg-[#1e2a38] px-2 py-1 text-[10px] text-[#eccc90]/45">{tag}</span>
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SECTION 01 : SPECIFICATIONS */}
          <section ref={specsRef} className="mb-5 overflow-hidden rounded-lg border border-[#e5ad46]/10 bg-[#25303a]">
            <div className="flex items-baseline gap-3 border-b border-[#e5ad46]/10 px-6 py-5 md:px-7">
              <span className="font-mono text-xs text-[#e5ad46]">01</span>
              <span className="font-headline text-lg font-semibold text-[#eccc90]">Spécifications du produit</span>
              <span className="ml-auto text-xs text-[#eccc90]/50">{projectType === "serie" ? "Production en série" : "Pièce sur-mesure"}</span>
            </div>
            <div className="p-6 md:p-7">
              <div className="mb-6">
                <label className={fieldLabelClass} htmlFor="quote-category">Type de produit (catégorie)</label>
                <div className="relative">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="quote-category"
                        onChange={(e) => { field.onChange(e); onCategoryChange(e.target.value); }}
                        className={`${inputClass(!!errors.category)} cursor-pointer appearance-none pr-10 ${errors.category ? "border-red-400/50" : ""}`}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        <option value="pantalon">Pantalon</option>
                        <option value="jupe">Jupe</option>
                        <option value="shirt">T-shirt / Débardeur</option>
                        <option value="polo">Polo</option>
                        <option value="chemise">Chemise / Chemisier</option>
                        <option value="veste">Veste / Blazer</option>
                        <option value="manteau">Manteau / Parka</option>
                        <option value="robe">Robe</option>
                        <option value="sweat">Sweat-shirt / Hoodie</option>
                        <option value="short">Short / Bermuda</option>
                        <option value="pull">Pull / Cardigan</option>
                        <option value="sous-vetement">Sous-vêtements / Lingerie</option>
                        <option value="accessoire">Accessoires (Écharpes, Bonnets, etc.)</option>
                        <option value="uniforme">Uniforme / Workwear</option>
                        <option value="sport">Sportswear</option>
                        <option value="enfant">Enfant / Bébé</option>
                        <option value="autre">Autre projet sur-mesure</option>
                      </select>
                    )}
                  />
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e5ad46]" />
                </div>
                {errors.category && <p className="mt-2 text-xs text-red-300">{errors.category.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <div>
                  <label className={`${fieldLabelClass} group`} htmlFor="quote-tissu">
                    Tissu <HelpDot tip="Matière principale souhaitée. Si vous hésitez, laissez-nous vous conseiller selon l'usage." />
                  </label>
                  <Controller name="tissu" control={control} render={({ field }) => (
                    <input {...field} id="quote-tissu" type="text" placeholder="Ex : coton, jersey, denim" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={`${fieldLabelClass} group`} htmlFor="quote-grammage">
                    Grammage <HelpDot tip="Poids du tissu au m², détermine son épaisseur. 140-180 g/m² pour un t-shirt léger, 280g/m² et + pour un sweat épais." />
                  </label>
                  <Controller name="grammage" control={control} render={({ field }) => (
                    <input {...field} id="quote-grammage" type="text" placeholder="Ex : 180 g/m²" className={inputClass(false)} />
                  )} />
                  <p className="mt-1.5 text-[11px] text-[#eccc90]/40">Repère : léger 120-160 · standard 180-220 · épais 280+</p>
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-coupe">Coupe</label>
                  <Controller name="coupe" control={control} render={({ field }) => (
                    <input {...field} id="quote-coupe" type="text" placeholder="Ex : droite, ajustée, oversize" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-gabarit">Gabarit</label>
                  <Controller name="gabarit" control={control} render={({ field }) => (
                    <input {...field} id="quote-gabarit" type="text" placeholder="Ex : standard, sur-mesure" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-style">Style</label>
                  <Controller name="style" control={control} render={({ field }) => (
                    <input {...field} id="quote-style" type="text" placeholder="Ex : casual, workwear, premium" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-tailles">Tailles</label>
                  <Controller name="tailles" control={control} render={({ field }) => (
                    <input {...field} id="quote-tailles" type="text" placeholder="Ex : XS-XL, 36-44" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-quantite">Quantité totale estimée</label>
                  <Controller name="quantite" control={control} render={({ field }) => (
                    <input {...field} id="quote-quantite" type="text" placeholder="Ex : 50 pièces" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-finitions">Finitions</label>
                  <Controller name="finitions" control={control} render={({ field }) => (
                    <input {...field} id="quote-finitions" type="text" placeholder="Ex : broderie, impression, étiquette" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-delai">Délai souhaité</label>
                  <Controller name="delai_souhaite" control={control} render={({ field }) => (
                    <input {...field} id="quote-delai" type="date" min={new Date().toISOString().split("T")[0]} className={`${inputClass(!!errors.delai_souhaite)} ${errors.delai_souhaite ? "border-red-400/50" : ""}`} />
                  )} />
                  {errors.delai_souhaite && <p className="mt-2 text-xs text-red-300">{errors.delai_souhaite.message}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 02 : DOCUMENTS */}
          <section ref={docsRef} className="mb-5 overflow-hidden rounded-lg border border-[#e5ad46]/10 bg-[#25303a]">
            <div className="flex items-baseline gap-3 border-b border-[#e5ad46]/10 px-6 py-5 md:px-7">
              <span className="font-mono text-xs text-[#e5ad46]">02</span>
              <span className="font-headline text-lg font-semibold text-[#eccc90]">Documents de référence</span>
              <span className="ml-auto text-xs text-[#eccc90]/50">Facultatif</span>
            </div>
            <div className="p-6 md:p-7">
              <Controller
                name="technical_files"
                control={control}
                render={({ field: { onChange, ref } }) => (
                  <label className="block cursor-pointer rounded-md border border-dashed border-[#e5ad46]/25 p-6 text-center transition-colors hover:border-[#e5ad46]" htmlFor="quote-technical-files">
                    <span className="mb-1 block text-[13px] font-medium text-[#eccc90]/80">Croquis, photos d&apos;inspiration ou fiche technique</span>
                    <span className="mb-4 block text-[11px] text-[#eccc90]/45">JPG, PNG, WEBP, PDF — {MAX_ATTACHMENTS} fichiers max, 10 Mo par fichier</span>
                    <span className="inline-flex items-center gap-2 rounded-md bg-[#e5ad46]/10 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] transition-colors hover:bg-[#e5ad46]/20">
                      <UploadCloud className="h-4 w-4" /> Choisir des fichiers
                    </span>
                    <input
                      id="quote-technical-files"
                      ref={ref}
                      className="sr-only"
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,application/pdf,text/csv,.csv"
                      onChange={(event) => {
                        const picked = Array.from(event.target.files ?? []);
                        const oversized = picked.filter((file) => file.size > MAX_ATTACHMENT_SIZE_BYTES);
                        if (oversized.length > 0) {
                          window.alert(`Chaque fichier doit faire moins de 10 Mo : ${oversized.map((file) => file.name).join(", ")}`);
                        }
                        const valid = picked.filter((file) => file.size <= MAX_ATTACHMENT_SIZE_BYTES).slice(0, MAX_ATTACHMENTS);
                        if (picked.length - valid.length > 0) {
                          window.alert(`Au maximum ${MAX_ATTACHMENTS} fichiers peuvent être sélectionnés. Les fichiers supplémentaires ont été ignorés.`);
                        }
                        const dt = new DataTransfer();
                        valid.forEach((file) => dt.items.add(file));
                        onChange(dt.files);
                        setAttachments(valid);
                        event.target.value = "";
                      }}
                    />
                  </label>
                )}
              />
              {attachments.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-[#eccc90]/60">
                    {attachments.length} fichier{attachments.length > 1 ? "s" : ""} sélectionné{attachments.length > 1 ? "s" : ""} sur {MAX_ATTACHMENTS} maximum
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {attachments.map((file, index) => (
                      <div key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center gap-3 rounded-md border border-[#e5ad46]/10 bg-[#1e2a38]/70 p-3">
                        {isImageFile(file) ? (
                          <img src={URL.createObjectURL(file)} alt={file.name} className="h-10 w-10 shrink-0 rounded object-cover" />
                        ) : (
                          <FileImage className="h-9 w-9 shrink-0 text-[#e5ad46]" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-[#eccc90]" title={file.name}>{file.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40">{formatBytes(file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#eccc90]/50 transition-colors hover:bg-white/5 hover:text-red-300"
                          title="Retirer ce fichier"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  {attachments.filter((file) => isCsvFile(file)).map((file) => <CsvPreview key={`csv-${file.name}-${file.lastModified}`} file={file} />)}
                </div>
              ) : null}
            </div>
          </section>

          {/* SECTION 03 : COORDONNEES */}
          <section ref={coordsRef} className="mb-5 overflow-hidden rounded-lg border border-[#e5ad46]/10 bg-[#25303a]">
            <div className="flex items-baseline gap-3 border-b border-[#e5ad46]/10 px-6 py-5 md:px-7">
              <span className="font-mono text-xs text-[#e5ad46]">03</span>
              <span className="font-headline text-lg font-semibold text-[#eccc90]">Vos coordonnées</span>
            </div>
            <div className="p-6 md:p-7">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-name">Nom complet</label>
                  <Controller name="name" control={control} render={({ field }) => (
                    <input {...field} id="quote-name" type="text" placeholder="Votre nom et prénom" className={inputClass(!!errors.name)} />
                  )} />
                  {errors.name && <p className="mt-2 text-xs text-red-300">{errors.name.message}</p>}
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-email">Email</label>
                  <Controller name="email" control={control} render={({ field }) => (
                    <input {...field} id="quote-email" type="email" placeholder="contact@entreprise.com" className={inputClass(!!errors.email)} />
                  )} />
                  {errors.email && <p className="mt-2 text-xs text-red-300">{errors.email.message}</p>}
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-phone">Téléphone</label>
                  <Controller name="phone" control={control} render={({ field }) => (
                    <input {...field} id="quote-phone" type="tel" placeholder="+261 34 00 000 00" className={inputClass(false)} />
                  )} />
                </div>
                <div>
                  <label className={fieldLabelClass} htmlFor="quote-request-type">Genre de demande</label>
                  <div className="relative">
                    <Controller
                      name="request_type"
                      control={control}
                      render={({ field }) => (
                        <select {...field} id="quote-request-type" className={`${inputClass(false)} cursor-pointer appearance-none pr-10`}>
                          <option value="new">Nouveau projet</option>
                          <option value="edit">Edit / modification</option>
                          <option value="add">Ajout à un dossier</option>
                        </select>
                      )}
                    />
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#e5ad46]" />
                  </div>
                  {modifyCode ? (
                    <p className="mt-1.5 text-[10px] uppercase tracking-widest text-[#eccc90]/40">
                      Edit = ce qu&apos;il faut modifier. Add = ce qu&apos;il faut ajouter.
                    </p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className={fieldLabelClass} htmlFor="quote-message">
                    {modifyCode ? "Quoi modifier ou ajouter ?" : "Message / détails du projet"}
                  </label>
                  <Controller name="message" control={control} render={({ field }) => (
                    <textarea
                      {...field}
                      id="quote-message"
                      placeholder={modifyCode ? "Decrivez precisement ce qu'il faut changer, ajouter ou reprendre." : "Décrivez votre projet en quelques lignes..."}
                      rows={5}
                      className={`${inputClass(!!errors.message)} min-h-[100px] resize-y ${errors.message ? "border-red-400/50" : ""}`}
                    />
                  )} />
                  {errors.message && <p className="mt-2 text-xs text-red-300">{errors.message.message}</p>}
                </div>
              </div>
            </div>
          </section>

          {/* ACTIONS */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={(event) => void saveDraft(event)}
              disabled={isSavingDraft || isSubmitting}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-[#e5ad46]/25 py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#e5ad46] transition-all hover:bg-[#e5ad46]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSavingDraft ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">save</span>
                  Enregistrer le brouillon
                </>
              )}
            </button>
            <button
              className="flex w-full items-center justify-center gap-3 rounded-md bg-[#e5ad46] py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#1e2a38] shadow-xl shadow-[#e5ad46]/10 transition-all hover:bg-[#eccc90] disabled:cursor-not-allowed disabled:opacity-50"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  Envoyer ma demande
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            {draft && (
              <p className="sm:col-span-2 text-center text-[10px] uppercase tracking-widest text-[#eccc90]/50">
                Vous modifiez un brouillon. Cliquez sur Envoyer pour l&apos;envoyer à notre équipe.
              </p>
            )}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-[#eccc90]/40">
            <Check className="h-4 w-4 text-[#e5ad46]" />
            <span className="text-[11px] uppercase tracking-widest">Confidentialité garantie — vos documents et idées ne sont jamais partagés sans votre accord.</span>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DemandeDevisSection() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[#eccc90]">Chargement...</div>}>
      <QuoteFormContent />
    </Suspense>
  );
}