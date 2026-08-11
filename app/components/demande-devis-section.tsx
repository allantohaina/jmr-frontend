"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useCallback, useEffect } from "react";
import { authAPI, draftsAPI, type QuoteDraft, type QuoteRecord, getToken } from "@/app/lib";
import { getErrorMessage } from "@/app/lib/errors";
import { CsvPreview } from "@/app/components/document-preview";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Check, ChevronDown, FileImage, Loader2, ShieldCheck, UploadCloud, AlertTriangle } from "lucide-react";


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

  const {
    control,
    handleSubmit,
    getValues,
    reset,
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

  const onCategoryChange = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const [draft, setDraft] = useState<QuoteDraft | null>(null);

  const loadDraft = useCallback(async (id: string) => {
    try {
      const res = await draftsAPI.list();
      const all = (Array.isArray(res.data) ? res.data : (res.data as { data?: unknown })?.data ?? []) as QuoteDraft[];
      const found = all.find((d) => String(d.id) === id);
      if (found) {
        setDraft(found);
        const payload = (found.payload ?? {}) as Record<string, string>;
        reset({
          category: (payload.category as string) || categoryParam || "",
          name: (payload.name as string) || "",
          email: (payload.email as string) || "",
          phone: (payload.phone as string) || "",
          tissu: (payload.tissu as string) || "",
          coupe: (payload.coupe as string) || "",
          gabarit: (payload.gabarit as string) || "",
          style: (payload.style as string) || "",
          grammage: (payload.grammage as string) || "",
          tailles: (payload.tailles as string) || "",
          quantite: (payload.quantite as string) || "",
          finitions: (payload.finitions as string) || "",
          delai_souhaite: (payload.delai_souhaite as string) || "",
          request_type: ((payload.request_type as string) || "new") as QuoteRequestFormData["request_type"],
          message: (payload.message as string) || "",
          modify_code: (payload.modify_code as string) || modifyCode || "",
        });
        return;
      }
    } catch {
      // Drafts API failed, try quotes API
    }
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
    setIsSavingDraft(true);
    try {
      const values = getValues();
      const payload: Record<string, unknown> = {};
      (Object.keys(values) as (keyof QuoteRequestFormData)[]).forEach((key) => {
        if (key !== "technical_files") payload[key] = values[key] ?? "";
      });
      await draftsAPI.save({ id: draft?.id, payload });
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
      if (files.length > 5) throw new Error("Ajoutez au maximum 5 fichiers de référence.");
      if (files.some((file) => file.size > 10 * 1024 * 1024)) throw new Error("Chaque fichier doit faire moins de 10 Mo.");
const payload = buildQuoteRequestPayload(data);
      await authAPI.post("/quotes", payload);
      if (draft?.id) {
        try { await draftsAPI.remove(draft.id); } catch { /* best effort */ }
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

  return (
    <div className="min-h-screen bg-[#1e2a38] pb-16 pt-24 md:pb-24 md:pt-32">
      <section className="mx-auto max-w-7xl px-4 sm:px-6" id="demande-devis-form" aria-labelledby="demande-devis-form-title">
        <header className="mb-10 text-center md:mb-16">
          <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">Demande de devis</span>
          <h2 className="mb-6 font-headline text-4xl font-bold text-[#e5ad46] sm:text-5xl md:text-6xl" id="demande-devis-form-title">
            {modifyCode ? `Modification du devis ${modifyCode}` : "Parlons de votre prochain projet textile"}
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-[#eccc90]/60 md:text-lg">
            {modifyCode
              ? "Precisez ici les modifications souhaitees. Choisissez edit pour une retouche ou add pour un ajout. La version precedente reste verrouillee et nous creerons une nouvelle demande signee."
              : "Remplissez le formulaire pour nous faire part de votre projet. Nous revenons vers vous avec une estimation claire et un suivi adapte a votre besoin."}
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-[#e5ad46]/10 bg-[#25303a] p-6 text-[#eccc90] shadow-xl md:rounded-[2.5rem] md:p-10">
              {/* Decorative background logo */}
              <div className="absolute right-[-20%] bottom-[-20%] opacity-[0.03] pointer-events-none">
                <img src="/navbar/logo.svg" alt="" className="w-64 h-64 invert" />
              </div>

              <span className="text-[#e5ad46] text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block">Preparation rapide</span>
              <h3 className="font-headline text-3xl font-bold mb-6 text-[#e5ad46]">Ce qu&apos;il nous faut</h3>
              <p className="text-[#eccc90]/70 mb-8 text-sm leading-relaxed">Quelques informations suffisent pour etablir un devis precis et vous repondre rapidement.</p>

              <ul className="space-y-6 mb-8 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#e5ad46]/10 flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#e5ad46]" />
                  </div>
                  <span className="text-sm font-medium">Type de produit, style et finitions souhaitees.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#e5ad46]/10 flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#e5ad46]" />
                  </div>
                  <span className="text-sm font-medium">Quantites estimees, tailles et informations techniques utiles.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-[#e5ad46]/10 flex items-center justify-center mt-0.5">
                    <Check className="h-3.5 w-3.5 text-[#e5ad46]" />
                  </div>
                  <span className="text-sm font-medium">Delai souhaite, contraintes de production et niveau de finition attendu.</span>
                </li>
              </ul>

              <div className="h-px bg-[#e5ad46]/10 my-8"></div>

              <p className="text-[10px] font-bold uppercase tracking-widest text-[#e5ad46]/40 italic">
                Plus les informations sont precises, plus le devis sera fiable.
              </p>
            </div>

            <div className="bg-[#e5ad46]/5 border border-[#e5ad46]/10 rounded-[2rem] p-8">
              <div className="flex items-center gap-4 mb-4 text-[#e5ad46]">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Confidentialité garantie</span>
              </div>
              <p className="text-[#eccc90]/50 text-xs leading-relaxed">
                Vos documents techniques et vos idées sont protégés. JMR Textile s&apos;engage à ne jamais partager vos concepts sans votre accord.
              </p>
            </div>
          </div>

          <form className="rounded-[2rem] border border-[#e5ad46]/5 bg-[#25303a] p-5 shadow-2xl sm:p-6 md:rounded-[2.5rem] md:p-12 lg:col-span-2" onSubmit={handleSubmit(onSubmit)}>
            {showDuplicateWarning && (
              <div className="mb-8 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-400/20">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-sm font-bold text-amber-400">
                      Devis en cours de traitement
                    </h3>
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
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-100 mb-8" role="alert">
                {submitError}
              </div>
            ) : null}
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              <div className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Type de produit (Categorie)</span>
                <div className="relative">
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => { field.onChange(e); onCategoryChange(e.target.value); }}
                        className={`w-full h-14 rounded-2xl border bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all appearance-none cursor-pointer ${
                          errors.category ? "border-red-400/50" : "border-[#e5ad46]/10"
                        }`}
                      >
                        <option value="">Selectionnez une categorie</option>
                        <option value="pantalon">Pantalon</option>
                        <option value="jupe">Jupe</option>
                        <option value="shirt">T-shirt / Debardeur</option>
                        <option value="polo">Polo</option>
                        <option value="chemise">Chemise / Chemisier</option>
                        <option value="veste">Veste / Blazer</option>
                        <option value="manteau">Manteau / Parka</option>
                        <option value="robe">Robe</option>
                        <option value="sweat">Sweat-shirt / Hoodie</option>
                        <option value="short">Short / Bermuda</option>
                        <option value="pull">Pull / Cardigan</option>
                        <option value="sous-vetement">Sous-vetements / Lingerie</option>
                        <option value="accessoire">Accessoires (Echarpes, Bonnets, etc.)</option>
                        <option value="uniforme">Uniforme / Workwear</option>
                        <option value="sport">Sportswear</option>
                        <option value="enfant">Enfant / Bebe</option>
                        <option value="autre">Autre projet sur-mesure</option>
                      </select>
                    )}
                  />
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e5ad46]" />
                </div>
                {errors.category && (
                  <p className="text-red-300 text-xs mt-2">{errors.category.message}</p>
                )}
              </div>

              <div className="md:col-span-2 rounded-2xl border border-dashed border-[#e5ad46]/25 bg-[#1e2a38]/60 p-5">
                <Controller
                  name="technical_files"
                  control={control}
                  render={({ field: { onChange, ref } }) => (
                    <label className="block cursor-pointer" htmlFor="quote-technical-files">
                      <span className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/55">
                        <FileImage className="h-4 w-4 text-[#e5ad46]" /> Images et documents de référence
                      </span>
                      <span className="mb-4 block text-xs leading-relaxed text-[#eccc90]/50">
                        Ajoutez vos croquis, photos d’inspiration ou documents techniques. JPG, PNG, WEBP, PDF et CSV — 5 fichiers maximum, 10 Mo par fichier.
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-xl bg-[#e5ad46]/10 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46] transition-colors hover:bg-[#e5ad46]/20">
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
                          onChange(event.target.files);
                          setAttachments(Array.from(event.target.files ?? []));
                        }}
                      />
                    </label>
                  )}
                />
                {attachments.length > 0 ? (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-[#eccc90]/60">{attachments.length} fichier{attachments.length > 1 ? "s" : ""} sélectionné{attachments.length > 1 ? "s" : ""}</p>
                    {attachments.filter((file) => file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")).map((file) => <CsvPreview key={`${file.name}-${file.lastModified}`} file={file} />)}
                  </div>
                ) : null}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Nom complet</span>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Votre nom et prenom"
                      className={`w-full h-14 rounded-2xl border bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20 ${
                        errors.name ? "border-red-400/50" : "border-[#e5ad46]/10"
                      }`}
                    />
                  )}
                />
                {errors.name && (
                  <p className="text-red-300 text-xs mt-2">{errors.name.message}</p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Email</span>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="email"
                      placeholder="contact@entreprise.com"
                      className={`w-full h-14 rounded-2xl border bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20 ${
                        errors.email ? "border-red-400/50" : "border-[#e5ad46]/10"
                      }`}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-red-300 text-xs mt-2">{errors.email.message}</p>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Telephone</span>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="tel"
                      placeholder="+261 34 00 000 00"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Tissu</span>
                <Controller
                  name="tissu"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: coton, jersey, denim"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Coupe</span>
                <Controller
                  name="coupe"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: droite, ajuste, oversize"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Gabarit</span>
                <Controller
                  name="gabarit"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: standard, sur-mesure"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Style</span>
                <Controller
                  name="style"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: casual, workwear, premium"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Grammage</span>
                <Controller
                  name="grammage"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: 180 g/m2"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Tailles</span>
                <Controller
                  name="tailles"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: XS-XL, 36-44"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Quantité</span>
                <Controller
                  name="quantite"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: 50 pièces"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Finitions</span>
                <Controller
                  name="finitions"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="text"
                      placeholder="Ex: broderie, impression, etiquette"
                      className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20"
                    />
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Delai souhaite</span>
                <Controller
                  name="delai_souhaite"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full h-14 rounded-2xl border bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all ${
                        errors.delai_souhaite ? "border-red-400/50" : "border-[#e5ad46]/10"
                      }`}
                    />
                  )}
                />
                {errors.delai_souhaite && (
                  <p className="text-red-300 text-xs mt-2">{errors.delai_souhaite.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">Genre de demande</span>
                <div className="relative">
                  <Controller
                    name="request_type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full h-14 rounded-2xl border border-[#e5ad46]/10 bg-[#1e2a38] px-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="new">Nouveau projet</option>
                        <option value="edit">Edit / modification</option>
                        <option value="add">Ajout a un dossier</option>
                      </select>
                    )}
                  />
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#e5ad46]" />
                </div>
                {modifyCode ? (
                  <p className="text-[10px] text-[#eccc90]/40 mt-2 uppercase tracking-widest">
                    Edit = ce qu&apos;il faut modifier. Add = ce qu&apos;il faut ajouter.
                  </p>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40 mb-3 block">
                  {modifyCode ? "Quoi modifier ou ajouter ?" : "Message / Détails du projet"}
                </span>
                <Controller
                  name="message"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder={
                        modifyCode
                          ? "Decrivez precisement ce qu'il faut changer, ajouter ou reprendre."
                          : "Décrivez votre projet en quelques lignes..."
                      }
                      className={`w-full h-40 rounded-2xl border bg-[#1e2a38] p-6 text-[#eccc90] font-medium focus:border-[#e5ad46] outline-none transition-all placeholder:text-[#eccc90]/20 resize-none ${
                        errors.message ? "border-red-400/50" : "border-[#e5ad46]/10"
                      }`}
                      rows={7}
                    />
                  )}
                />
                {errors.message && (
                  <p className="text-red-300 text-xs mt-2">{errors.message.message}</p>
                )}
              </div>

              
            </div>

<div className="mt-12 gap-4 grid grid-cols-1 sm:grid-cols-2">
              <button
                type="button"
                onClick={(event) => void saveDraft(event)}
                disabled={isSavingDraft || isSubmitting}
                className="w-full py-5 border border-[#e5ad46]/25 text-[#e5ad46] text-xs font-bold uppercase tracking-[0.3em] rounded-2xl hover:bg-[#e5ad46]/10 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="w-full py-5 bg-[#e5ad46] text-[#1e2a38] text-xs font-bold uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-[#e5ad46]/10 hover:bg-[#eccc90] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        </div>
      </section>
    </div>
  );
}

export function DemandeDevisSection() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <QuoteFormContent />
    </Suspense>
  );
}
