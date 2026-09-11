"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/app/components/locale-provider";
import { authenticateWithForm } from "@/app/lib";
import { loginRateLimiter } from "@/app/lib/rate-limit";
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
  company: z
    .string()
    .max(255, "Société / marque trop longue (maximum 255 caractères)")
    .optional(),
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
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Hook Form pour l'inscription
  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      company: "",
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

    const rateLimitKey = typeof window !== "undefined" ? "global" : "server";
    const rateLimit = loginRateLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
      setErrorMessage("Trop de tentatives de connexion. Veuillez patienter 15 minutes.");
      return;
    }

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
          <div className="mb-10 text-center">
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

          <div className="auth-card">
            <div className="auth-tabs" role="tablist" aria-label="Se connecter / Créer un compte">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "login"}
                className={`auth-tab${activeTab === "login" ? " is-active" : ""}`}
                onClick={() => setActiveTab("login")}
              >
                {messages.auth.loginTitle}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "signup"}
                className={`auth-tab${activeTab === "signup" ? " is-active" : ""}`}
                onClick={() => setActiveTab("signup")}
              >
                {messages.auth.signupButton}
              </button>
            </div>

            {/* Formulaire de connexion */}
            <form
              className={`auth-panel${activeTab === "login" ? " is-active" : ""}`}
              onSubmit={handleLoginSubmit}
              noValidate={false}
            >
              <input name="next" type="hidden" value={nextPath} />
              <input name="intent" type="hidden" value="login" />
              <p className="auth-title">{messages.auth.loginSubtitle}</p>
              <p className="auth-subtitle">{messages.auth.subtitle}</p>

              <label className="auth-label" htmlFor="login-email">{messages.auth.email}</label>
              <input
                className="auth-input"
                type="email"
                id="login-email"
                name="email"
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />

              <label className="auth-label" htmlFor="login-password">{messages.auth.password}</label>
              <input
                className="auth-input"
                type="password"
                id="login-password"
                name="password"
                required
                autoComplete="current-password"
              />

              <div className="auth-row">
                <label className="auth-checkbox">
                  <input type="checkbox" name="remember" />
                  {messages.auth.rememberMe}
                </label>
                <button type="button" className="auth-link">{messages.auth.forgotPassword}</button>
              </div>

              <button className="auth-submit" type="submit" disabled={pendingIntent !== null}>
                {pendingIntent === "login" ? messages.auth.loginLoading : messages.auth.loginButton}
              </button>
            </form>

            {/* Formulaire d'inscription — tous les champs requis par la validation */}
            <form
              className={`auth-panel${activeTab === "signup" ? " is-active" : ""}`}
              onSubmit={handleSignupSubmit(onSignupSubmit, onSignupInvalid)}
              noValidate={false}
            >
              <p className="auth-title">{messages.auth.signupEyebrow}</p>
              <p className="auth-subtitle">{messages.auth.subtitle}</p>

              {signupFeedback ? (
                <div
                  id="signup-feedback"
                  className={`auth-feedback auth-feedback--${signupFeedback.type}`}
                  role={signupFeedback.type === "error" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {signupFeedback.message}
                </div>
              ) : null}

              <div className="auth-grid">
                <div>
                  <label className="auth-label" htmlFor="signup-firstname">{messages.auth.firstName}</label>
                  <Controller
                    name="first_name"
                    control={signupControl}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`auth-input${signupErrors.first_name ? " has-error" : ""}`}
                        type="text"
                        id="signup-firstname"
                        autoComplete="given-name"
                        required
                      />
                    )}
                  />
                  {signupErrors.first_name && (
                    <p className="auth-error">{signupErrors.first_name.message}</p>
                  )}
                </div>
                <div>
                  <label className="auth-label" htmlFor="signup-lastname">{messages.auth.lastName}</label>
                  <Controller
                    name="last_name"
                    control={signupControl}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`auth-input${signupErrors.last_name ? " has-error" : ""}`}
                        type="text"
                        id="signup-lastname"
                        autoComplete="family-name"
                        required
                      />
                    )}
                  />
                  {signupErrors.last_name && (
                    <p className="auth-error">{signupErrors.last_name.message}</p>
                  )}
                </div>
              </div>

              <label className="auth-label" htmlFor="signup-email">{messages.auth.email}</label>
              <Controller
                name="email"
                control={signupControl}
                render={({ field }) => (
                  <input
                    {...field}
                    className={`auth-input${signupErrors.email ? " has-error" : ""}`}
                    type="email"
                    id="signup-email"
                    autoComplete="email"
                    required
                  />
                )}
              />
              {signupErrors.email && (
                <p className="auth-error">{signupErrors.email.message}</p>
              )}

              <div className="auth-grid">
                <div>
                  <label className="auth-label" htmlFor="signup-company">{messages.auth.company}</label>
                  <Controller
                    name="company"
                    control={signupControl}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`auth-input${signupErrors.company ? " has-error" : ""}`}
                        type="text"
                        id="signup-company"
                        placeholder="Ex : JMR Textile"
                        autoComplete="organization"
                      />
                    )}
                  />
                  {signupErrors.company && (
                    <p className="auth-error">{signupErrors.company.message}</p>
                  )}
                </div>
                <div>
                  <label className="auth-label" htmlFor="signup-country">Pays</label>
                  <Controller
                    name="country"
                    control={signupControl}
                    render={({ field }) => (
                      <select
                        {...field}
                        id="signup-country"
                        className={`auth-input${signupErrors.country ? " has-error" : ""}`}
                        required
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
                    <p className="auth-error">{signupErrors.country.message}</p>
                  )}
                </div>
              </div>

              <label className="auth-label" htmlFor="signup-phone">{messages.auth.phone}</label>
              <div className="auth-phone">
                <span className="auth-phone-prefix" suppressHydrationWarning>
                  {getSelectedDialCode()}
                </span>
                <Controller
                  name="phone"
                  control={signupControl}
                  render={({ field }) => (
                    <input
                      {...field}
                      className={`auth-input auth-input--phone${signupErrors.phone ? " has-error" : ""}`}
                      type="tel"
                      id="signup-phone"
                      placeholder="Numéro de téléphone"
                      autoComplete="tel"
                      required
                    />
                  )}
                />
              </div>
              {signupErrors.phone && (
                <p className="auth-error">{signupErrors.phone.message}</p>
              )}

              <label className="auth-label" htmlFor="signup-address">{messages.auth.address}</label>
              <Controller
                name="address"
                control={signupControl}
                render={({ field }) => (
                  <input
                    {...field}
                    className={`auth-input${signupErrors.address ? " has-error" : ""}`}
                    type="text"
                    id="signup-address"
                    placeholder="Adresse complète"
                    autoComplete="street-address"
                    required
                  />
                )}
              />
              {signupErrors.address && (
                <p className="auth-error">{signupErrors.address.message}</p>
              )}

              <div className="auth-grid">
                <div>
                  <label className="auth-label" htmlFor="signup-password">{messages.auth.password}</label>
                  <Controller
                    name="password"
                    control={signupControl}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`auth-input${signupErrors.password ? " has-error" : ""}`}
                        type="password"
                        id="signup-password"
                        autoComplete="new-password"
                        required
                      />
                    )}
                  />
                  {signupErrors.password && (
                    <p className="auth-error">{signupErrors.password.message}</p>
                  )}
                </div>
                <div>
                  <label className="auth-label" htmlFor="signup-confirm">{messages.auth.confirmPassword}</label>
                  <Controller
                    name="confirm_password"
                    control={signupControl}
                    render={({ field }) => (
                      <input
                        {...field}
                        className={`auth-input${signupErrors.confirm_password ? " has-error" : ""}`}
                        type="password"
                        id="signup-confirm"
                        autoComplete="new-password"
                        required
                      />
                    )}
                  />
                  {signupErrors.confirm_password && (
                    <p className="auth-error">{signupErrors.confirm_password.message}</p>
                  )}
                </div>
              </div>

              <button className="auth-submit" type="submit" disabled={pendingIntent !== null}>
                {pendingIntent === "signup" ? messages.auth.signupLoading : messages.auth.signupButton}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
