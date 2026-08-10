"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/app/components/locale-provider";
import { authenticateWithForm } from "@/app/lib";
import { useForm, Controller, useWatch, type FieldErrors } from "react-hook-form";
import { getErrorMessage } from "@/app/lib/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

// Liste des pays avec code ISO et indicatif téléphonique
const countries = [
  { code: "MG", name: "Madagascar", dialCode: "+261" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "US", name: "États-Unis", dialCode: "+1" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "GB", name: "Royaume-Uni", dialCode: "+44" },
  { code: "DE", name: "Allemagne", dialCode: "+49" },
  { code: "ES", name: "Espagne", dialCode: "+34" },
  { code: "IT", name: "Italie", dialCode: "+39" },
  { code: "BE", name: "Belgique", dialCode: "+32" },
  { code: "CH", name: "Suisse", dialCode: "+41" },
  { code: "LU", name: "Luxembourg", dialCode: "+352" },
];

// Schéma Zod de validation pour l'inscription
const signupSchema = z.object({
  first_name: z
    .string()
    .min(2, "Prénom trop court (minimum 2 caractères)")
    .max(50, "Prénom trop long (maximum 50 caractères)"), // Le prénom le plus long enregistré est environ 50 caractères
  last_name: z
    .string()
    .min(2, "Nom trop court (minimum 2 caractères)")
    .max(100, "Nom trop long (maximum 100 caractères)"), // Le nom de famille peut être plus long
  email: z.string().email("Adresse email invalide"),
  birth_date: z.string().refine(
    (dateStr) => {
      const date = new Date(dateStr);
      const today = new Date();
      return date < today;
    },
    { message: "Date de naissance invalide (ne peut pas être dans le futur)" }
  ),
  phone: z.string(),
  country: z.string().min(1, "Veuillez sélectionner un pays"),
  address: z.string().min(5, "Adresse trop courte (minimum 5 caractères)").max(255, "Adresse trop longue"),
  password: z
    .string()
    .min(8, "Mot de passe trop court (minimum 8 caractères)")
    .max(128, "Mot de passe trop long"),
  confirm_password: z.string(),
})
  .refine((data) => {
    if (!data.country) return true;
    try {
      return isValidPhoneNumber(data.phone, data.country as Parameters<typeof isValidPhoneNumber>[1]);
    } catch {
      return false;
    }
  }, {
    message: "Numéro de téléphone invalide pour ce pays",
    path: ["phone"]
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirm_password"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

type AuthAccessSectionProps = {
  nextPath?: string;
  error?: string | null;
};

type SignupFeedback = {
  type: "error" | "info" | "success";
  message: string;
};

function resolveAuthErrorMessage(error?: string | null) {
  if (!error) return "";
  return getErrorMessage(error);
}

export function AuthAccessSection({ nextPath = "/", error }: AuthAccessSectionProps) {
  const { messages } = useLocale();
  const [errorMessage, setErrorMessage] = useState(resolveAuthErrorMessage(error));
  const [signupFeedback, setSignupFeedback] = useState<SignupFeedback | null>(null);
  const [pendingIntent, setPendingIntent] = useState<"login" | "signup" | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Hook Form pour l'inscription
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      birth_date: "",
      phone: "",
      country: "",
      address: "",
      password: "",
      confirm_password: "",
    },
  });
  const {
    control: signupControl,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
  } = signupForm;

  const selectedCountryCode = useWatch({
    control: signupControl,
    name: "country",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const intent = "login" as const;

    setPendingIntent(intent);
    setErrorMessage("");

    try {
      const { redirectTo } = await authenticateWithForm(formData);
      window.location.assign(redirectTo);
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "Connexion impossible. Verifiez vos identifiants ou reessayez.";
      setErrorMessage(resolveAuthErrorMessage(message));
      setPendingIntent(null);
    }
  }

  async function onSignupSubmit(data: SignupFormData) {
    setPendingIntent("signup");
    setErrorMessage("");
    setSignupFeedback({ type: "info", message: "Inscription en cours…" });

    const formData = new FormData();
    formData.append("intent", "signup");
    formData.append("next", nextPath);
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value as string);
    });

    try {
      const { redirectTo } = await authenticateWithForm(formData);
      setSignupFeedback({ type: "success", message: "Inscription réussie. Redirection vers votre espace client…" });
      window.setTimeout(() => window.location.assign(redirectTo), 700);
    } catch (submitError) {
      const message =
        submitError instanceof Error && submitError.message
          ? submitError.message
          : "Inscription impossible. Veuillez réessayer.";
      setErrorMessage(resolveAuthErrorMessage(message));
      setSignupFeedback({ type: "error", message: resolveAuthErrorMessage(message) });
      setPendingIntent(null);
    }
  }

  function onSignupInvalid(errors: FieldErrors<SignupFormData>) {
    const firstError = Object.values(errors).find((fieldError) => fieldError?.message);
    const message = firstError?.message || "Veuillez vérifier les champs obligatoires du formulaire.";

    setSignupFeedback({ type: "error", message: `Inscription non envoyée : ${message}` });
    document.getElementById("signup-feedback")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Get selected country dial code for display
  const getSelectedDialCode = () => {
    if (!isMounted) return "+...";
    const country = countries.find(c => c.code === selectedCountryCode);
    return country?.dialCode || "+...";
  };

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-fixed-dim selection:text-on-primary-fixed">
      <main className="min-h-screen px-4 pb-20 pt-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h1 className="mb-4 font-headline text-5xl font-bold tracking-tight text-primary md:text-6xl">
              {messages.auth.title}
            </h1>
            <p className="mx-auto max-w-xl text-sm font-body text-lg uppercase tracking-[0.1em] text-secondary">
              {messages.auth.subtitle}
            </p>
            {errorMessage && (
              <div className="mt-8 inline-block rounded-xl bg-red-500/10 p-4 text-red-400 border border-red-500/20" role="alert">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-outline-variant/20 shadow-[0_48px_64px_rgba(27,28,25,0.06)] lg:grid-cols-2">
            <section className="flex flex-col justify-center bg-surface p-8 md:p-12 lg:p-16">
              <div className="mx-auto w-full max-w-md">
                <div className="mb-10">
                  <h2 className="mb-2 font-headline text-4xl font-bold text-primary">{messages.auth.loginTitle}</h2>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{messages.auth.loginSubtitle}</p>
                </div>
                <form className="space-y-6" onSubmit={handleLoginSubmit}>
                  <input name="next" type="hidden" value={nextPath} />
                  <input name="intent" type="hidden" value="login" />

                  <div className="space-y-6">
                    <div className="relative">
                      <label htmlFor="login-email" className="mb-2 block font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline/80">
                        {messages.auth.usernameOrEmail}
                      </label>
                      <input
                        id="login-email"
                        name="email"
                        className="w-full border border-outline-variant/50 bg-white px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        placeholder="votre@email.com"
                        type="email"
                        required
                      />
                    </div>
                    <div className="relative">
                      <label htmlFor="login-password" className="mb-2 block font-label text-[10px] font-bold uppercase tracking-[0.2em] text-outline/80">
                        {messages.auth.password}
                      </label>
                      <input
                        id="login-password"
                        name="password"
                        className="w-full border border-outline-variant/50 bg-white px-4 py-4 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0"
                        placeholder="********"
                        type="password"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <label className="group flex cursor-pointer items-center gap-3">
                      <div className="relative flex h-5 w-5 items-center justify-center rounded-sm border border-outline-variant/50 bg-white transition-colors group-hover:border-primary">
                        <input className="peer absolute h-full w-full cursor-pointer opacity-0" type="checkbox" name="remember" />
                        <span className="material-symbols-outlined text-sm text-primary opacity-0 transition-opacity peer-checked:opacity-100">
                          check
                        </span>
                      </div>
                      <span className="font-label text-[11px] uppercase tracking-wide text-secondary">
                        {messages.auth.rememberMe}
                      </span>
                    </label>
                    <button
                      type="button"
                      className="font-label text-[11px] font-bold uppercase tracking-widest text-primary transition-opacity hover:opacity-70"
                    >
                      {messages.auth.forgotPassword}
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low p-5">
                    <div className="flex items-center gap-4">
                      <div className="h-5 w-5 rounded-full border-2 border-outline-variant/30" />
                      <span className="font-label text-[11px] uppercase tracking-widest text-secondary">
                        {messages.auth.securityCheck}
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-xl text-outline/60">shield</span>
                  </div>

                  <button
                    className="w-full rounded-lg bg-primary py-5 font-label text-xs font-bold uppercase tracking-[0.3em] text-on-primary shadow-lg shadow-primary/20 transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={pendingIntent !== null}
                  >
                    {pendingIntent === "login" ? messages.auth.loginLoading : messages.auth.loginButton}
                  </button>
                </form>

                <div className="relative mt-12">
                  <div aria-hidden="true" className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/20" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.3em]">
                    <span className="bg-surface px-6 text-outline/40">{messages.auth.exclusiveExperience}</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden bg-surface-container-low p-8 md:p-12 lg:p-16">
              <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary-fixed-dim/10 blur-3xl" />
              <div className="relative z-10 mx-auto w-full max-w-md">
                <div className="mb-10 text-center">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">
                    {messages.auth.signupEyebrow}
                  </p>
                  <div className="mx-auto h-[1px] w-12 bg-outline-variant/30" />
                </div>
                <form className="space-y-5" onSubmit={handleSignupSubmit(onSignupSubmit, onSignupInvalid)}>
                  <input name="next" type="hidden" value={nextPath} />

                  {signupFeedback ? (
                    <div
                      id="signup-feedback"
                      className={`rounded-xl border p-4 text-sm font-medium ${
                        signupFeedback.type === "success"
                          ? "border-green-300 bg-green-50 text-green-800"
                          : signupFeedback.type === "error"
                            ? "border-red-300 bg-red-50 text-red-800"
                            : "border-blue-300 bg-blue-50 text-blue-800"
                      }`}
                      role={signupFeedback.type === "error" ? "alert" : "status"}
                      aria-live="polite"
                    >
                      {signupFeedback.message}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.firstName}
                      </label>
                      <Controller
                        name="first_name"
                        control={signupControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.first_name
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                            type="text"
                          />
                        )}
                      />
                      {signupErrors.first_name && (
                        <p className="text-xs text-red-600 mt-1">{signupErrors.first_name.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.lastName}
                      </label>
                      <Controller
                        name="last_name"
                        control={signupControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.last_name
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                            type="text"
                          />
                        )}
                      />
                      {signupErrors.last_name && (
                        <p className="text-xs text-red-600 mt-1">{signupErrors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                      {messages.auth.email}
                    </label>
                    <Controller
                      name="email"
                      control={signupControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                            signupErrors.email
                              ? "border-red-400/50 bg-red-50"
                              : "border-outline-variant/40 bg-white/50"
                          }`}
                          type="email"
                        />
                      )}
                    />
                    {signupErrors.email && (
                      <p className="text-xs text-red-600 mt-1">{signupErrors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.birthDate}
                      </label>
                      <Controller
                        name="birth_date"
                        control={signupControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.birth_date
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                            type="date"
                          />
                        )}
                      />
                      {signupErrors.birth_date && (
                        <p className="text-xs text-red-600 mt-1">{signupErrors.birth_date.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        Pays
                      </label>
                      <Controller
                        name="country"
                        control={signupControl}
                        render={({ field }) => (
                          <select
                            {...field}
                            className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.country
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                          >
                            <option value="">Sélectionner un pays</option>
                            {countries.map((country) => (
                              <option key={country.code} value={country.code}>
                                {country.name} ({country.dialCode})
                              </option>
                            ))}
                          </select>
                        )}
                      />
                      {signupErrors.country && (
                        <p className="text-xs text-red-600 mt-1">{signupErrors.country.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                      {messages.auth.phone}
                    </label>
                    <div className="flex">
                      <div suppressHydrationWarning className="flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-outline-variant/40 rounded-l text-sm text-outline/70">
                        {getSelectedDialCode() || "+..."}
                      </div>
                      <Controller
                        name="phone"
                        control={signupControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`flex-1 rounded-r border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.phone
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                            type="tel"
                            placeholder="Numéro de téléphone"
                          />
                        )}
                      />
                    </div>
                    {signupErrors.phone && (
                      <p className="text-xs text-red-600 mt-1">{signupErrors.phone.message}</p>
                    )}
                  </div>

                  <div className="relative mt-4">
                    <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                      {messages.auth.address}
                    </label>
                    <Controller
                      name="address"
                      control={signupControl}
                      render={({ field }) => (
                        <input
                          {...field}
                          className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                            signupErrors.address
                              ? "border-red-400/50 bg-red-50"
                              : "border-outline-variant/40 bg-white/50"
                          }`}
                          type="text"
                          placeholder="Adresse complète"
                        />
                      )}
                    />
                    {signupErrors.address && (
                      <p className="text-xs text-red-600 mt-1">{signupErrors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.password}
                      </label>
                      <Controller
                        name="password"
                        control={signupControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.password
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                            type="password"
                          />
                        )}
                      />
                      {signupErrors.password && (
                        <p className="text-xs text-red-600 mt-1">{signupErrors.password.message}</p>
                      )}
                    </div>
                    <div className="relative">
                      <label className="mb-1 block font-label text-[10px] font-bold uppercase tracking-[0.1em] text-outline/80">
                        {messages.auth.confirmPassword}
                      </label>
                      <Controller
                        name="confirm_password"
                        control={signupControl}
                        render={({ field }) => (
                          <input
                            {...field}
                            className={`w-full rounded border px-3 py-3 font-body text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-0 ${
                              signupErrors.confirm_password
                                ? "border-red-400/50 bg-red-50"
                                : "border-outline-variant/40 bg-white/50"
                            }`}
                            type="password"
                          />
                        )}
                      />
                      {signupErrors.confirm_password && (
                        <p className="text-xs text-red-600 mt-1">{signupErrors.confirm_password.message}</p>
                      )}
                    </div>
                  </div>

                  <button
                    className="mt-4 w-full rounded-lg border-2 border-primary py-5 font-label text-xs font-bold uppercase tracking-[0.3em] text-primary transition-all duration-300 hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-60"
                    type="submit"
                    disabled={pendingIntent !== null}
                  >
                    {pendingIntent === "signup" ? messages.auth.signupLoading : messages.auth.signupButton}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
