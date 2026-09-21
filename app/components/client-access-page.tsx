"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/app/components/locale-provider";
import { authenticateWithForm, writeBrowserCookie } from "@/app/lib";
import { LOCALE_COOKIE_NAME, type Locale } from "@/app/lib/locale";
import { loginRateLimiter } from "@/app/lib/rate-limit";
import { AnimeReveal } from "@/app/components/anime-reveal";
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
    .max(50, "Prénom trop long (maximum 50 caractères)"),
  last_name: z
    .string()
    .min(2, "Nom trop court (minimum 2 caractères)")
    .max(100, "Nom trop long (maximum 100 caractères)"),
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

type ClientAccessPageProps = {
  nextPath?: string;
  error?: string | null;
  initialTab?: "login" | "signup";
};

type SignupFeedback = {
  type: "error" | "info" | "success";
  message: string;
};

const LOGIN_STRINGS = {
  fr: {
    back: "Retour au site",
    emailLabel: "Adresse e-mail",
    emailPh: "nom@atelier.com",
    pwdLabel: "Mot de passe",
    pwdPh: "••••••••",
    forgot: "Mot de passe oublié ?",
    remember: "Mémoriser mon appareil",
    showPwd: "Afficher le mot de passe",
    hidePwd: "Masquer le mot de passe",
    proLink: "Créer un compte professionnel",
    support: "Support technique",
    privacy: "Confidentialité",
  },
  en: {
    back: "Back to site",
    emailLabel: "Email address",
    emailPh: "name@atelier.com",
    pwdLabel: "Password",
    pwdPh: "••••••••",
    forgot: "Forgot password?",
    remember: "Remember this device",
    showPwd: "Show password",
    hidePwd: "Hide password",
    proLink: "Create a business account",
    support: "Technical support",
    privacy: "Privacy",
  },
} as const;

function resolveAuthErrorMessage(error?: string | null) {
  if (!error) return "";
  return getErrorMessage(error);
}

export function ClientAccessPage({ nextPath = "/mon-profil", error, initialTab = "login" }: ClientAccessPageProps) {
  const { locale, setLocale, messages } = useLocale();
  const [errorMessage, setErrorMessage] = useState(resolveAuthErrorMessage(error));
  const [signupFeedback, setSignupFeedback] = useState<SignupFeedback | null>(null);
  const [pendingIntent, setPendingIntent] = useState<"login" | "signup" | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const t = LOGIN_STRINGS[locale === "en" ? "en" : "fr"];

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

  function handleLocaleChange(nextLocale: Locale) {
    setLocale(nextLocale);
    writeBrowserCookie(LOCALE_COOKIE_NAME, nextLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "Lax",
    });
  }

  async function handleLoginSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const rateLimitKey = typeof window !== "undefined" ? "global" : "server";
    const rateLimit = loginRateLimiter.check(rateLimitKey);
    if (!rateLimit.allowed) {
      setErrorMessage("Trop de tentatives de connexion. Veuillez patienter 15 minutes.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    setPendingIntent("login");
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

  const getSelectedDialCode = () => {
    if (!isMounted) return "+...";
    const country = countries.find(c => c.code === selectedCountryCode);
    return country?.dialCode || "+...";
  };

  if (!isMounted) {
    return (
      <div style={{ minHeight: "100vh", background: "#0A0E19", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #F5C518", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="login-page">
      <style>{`
        .login-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: #0A0E19;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 20px 44px;
          color: #f2f2f0;
        }

        .login-top {
          width: 100%;
          max-width: 480px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
        }

        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #F5C518;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
        }

        .login-back:hover {
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .login-lang {
          display: flex;
          gap: 2px;
          background: #151B30;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          padding: 3px;
        }

        .login-lang button {
          border: none;
          background: transparent;
          color: #8b93a7;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 5px 12px;
          border-radius: 999px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.2s, color 0.2s;
        }

        .login-lang button.is-active {
          background: #F5C518;
          color: #1b2436;
        }

        .login-card {
          width: 100%;
          max-width: 480px;
          background: #151B30;
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }

        .login-card .auth-tabs {
          background: #0B1120;
          border-radius: 12px;
          margin-bottom: 24px;
        }

        .login-card .auth-tab {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          color: #8b93a7;
        }

        .login-card .auth-tab.is-active {
          background: #F5C518;
          color: #1b2436;
        }

        .login-card .auth-panel.is-active {
          background: transparent;
          border: none;
          border-radius: 0;
          padding: 0;
        }

        .login-card .auth-label {
          color: #f2f2f0;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .login-card .auth-label-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 8px;
        }

        .login-card .auth-label-row .auth-label {
          margin-bottom: 0;
        }

        .login-card .auth-forgot {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          color: #F5C518;
          white-space: nowrap;
        }

        .login-card .auth-forgot:hover {
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .login-card .auth-input {
          background: #ffffff;
          border: 1px solid #ffffff;
          color: #1b2436;
          border-radius: 10px;
        }

        .login-card .auth-input::placeholder {
          color: #9aa3b5;
        }

        .login-card .auth-input:focus {
          outline: none;
          border-color: #F5C518;
          box-shadow: 0 0 0 3px rgba(245, 197, 24, 0.25);
        }

        .login-card select.auth-input {
          padding-left: 14px;
        }

        .login-card select.auth-input option {
          color: #1b2436;
          background: #ffffff;
        }

        .login-card .field-wrap {
          position: relative;
          margin-bottom: 16px;
        }

        .login-card .field-wrap .auth-input {
          margin-bottom: 0;
          padding-left: 40px;
          padding-right: 14px;
        }

        .login-card .field-wrap .field-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #9aa3b5;
          pointer-events: none;
        }

        .login-card .field-wrap .field-eye {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          background: none;
          border: none;
          border-radius: 8px;
          color: #9aa3b5;
          cursor: pointer;
        }

        .login-card .field-wrap .field-eye:hover {
          color: #1b2436;
          background: rgba(27, 36, 54, 0.06);
        }

        .login-card .field-wrap .field-eye svg {
          width: 18px;
          height: 18px;
        }

        .login-card .field-wrap.has-eye .auth-input {
          padding-right: 44px;
        }

        .login-card .auth-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #b9c0cf;
          font-size: 13px;
          margin: 4px 0 20px;
          cursor: pointer;
        }

        .login-card .auth-remember input {
          width: 15px;
          height: 15px;
          accent-color: #F5C518;
          cursor: pointer;
        }

        .login-card .auth-submit {
          background: #F5C518;
          color: #1b2436;
          font-weight: 700;
          font-size: 14px;
          border-radius: 10px;
          padding: 13px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-card .auth-checkbox input {
          accent-color: #F5C518;
        }

        .login-card .auth-link {
          color: #F5C518;
        }

        .login-card .auth-phone-prefix {
          background: #EDF0F5;
          border-color: #ffffff;
          color: #5b6478;
          border-radius: 10px 0 0 10px;
        }

        .login-card .auth-input--phone {
          border-radius: 0 10px 10px 0;
        }

        .login-pro-link {
          display: block;
          margin: 18px auto 0;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          font-family: inherit;
          font-size: 12px;
          color: #8b93a7;
          text-decoration: underline;
          text-underline-offset: 4px;
        }

        .login-pro-link:hover {
          color: #f2f2f0;
        }

        .login-error {
          background: rgba(229, 72, 77, 0.12);
          border: 1px solid rgba(229, 72, 77, 0.35);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #f3a3a6;
          font-size: 13px;
          line-height: 1.5;
        }

        .login-foot {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: #5b6478;
        }

        .login-foot a {
          color: #5b6478;
          text-decoration: none;
        }

        .login-foot a:hover {
          color: #b9c0cf;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 20px 14px 36px;
          }
          .login-card {
            padding: 22px 18px;
          }
          .login-card .auth-panel.is-active {
            padding: 0;
          }
        }
      `}</style>

      <header className="login-top">
        <Link href="/" className="login-back">
          <span aria-hidden="true">←</span> {t.back}
        </Link>
        <div className="login-lang" role="group" aria-label="Langue / Language">
          <button
            type="button"
            className={locale === "fr" ? "is-active" : ""}
            onClick={() => handleLocaleChange("fr")}
            aria-pressed={locale === "fr"}
          >
            FR
          </button>
          <button
            type="button"
            className={locale === "en" ? "is-active" : ""}
            onClick={() => handleLocaleChange("en")}
            aria-pressed={locale === "en"}
          >
            EN
          </button>
        </div>
      </header>

      <AnimeReveal as="main" className="login-card" y={18} duration={650}>
        {errorMessage && (
          <div className="login-error" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="auth-card" style={{ margin: 0, maxWidth: "100%" }}>
          <div className="auth-tabs" role="tablist" aria-label="Se connecter / Créer un compte">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "login"}
              className={`auth-tab${activeTab === "login" ? " is-active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
              </svg>
              {messages.auth.loginTitle}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "signup"}
              className={`auth-tab${activeTab === "signup" ? " is-active" : ""}`}
              onClick={() => setActiveTab("signup")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {messages.auth.signupButton}
            </button>
          </div>

          {/* Connexion */}
          <form
            className={`auth-panel${activeTab === "login" ? " is-active" : ""}`}
            onSubmit={handleLoginSubmit}
          >
            <input name="next" type="hidden" value={nextPath} />
            <input name="intent" type="hidden" value="login" />

            <label className="auth-label" htmlFor="login-email">{t.emailLabel}</label>
            <div className="field-wrap">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
              </svg>
              <input
                className="auth-input"
                type="email"
                id="login-email"
                name="email"
                placeholder={t.emailPh}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-label-row">
              <label className="auth-label" htmlFor="login-password">{t.pwdLabel}</label>
              <button type="button" className="auth-forgot">{t.forgot}</button>
            </div>
            <div className="field-wrap has-eye">
              <svg className="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              <input
                className="auth-input"
                type={showLoginPassword ? "text" : "password"}
                id="login-password"
                name="password"
                placeholder={t.pwdPh}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="field-eye"
                onClick={() => setShowLoginPassword((v) => !v)}
                aria-label={showLoginPassword ? t.hidePwd : t.showPwd}
                aria-pressed={showLoginPassword}
              >
                {showLoginPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M17.94 17.94A10.6 10.6 0 0 1 12 19c-5 0-9.27-3-11-7 1.1-2.5 3.16-4.6 5.74-5.74M9.9 5.14A10.6 10.6 0 0 1 12 5c5 0 9.27 3 11 7a17.6 17.6 0 0 1-2.16 3.19" />
                    <path d="m2 2 20 20" />
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.27-7 10-7c2.6 0 4.79 1.05 6.52 2.58M22 12s-3.27 7-10 7c-2.6 0-4.79-1.05-6.52-2.58" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <label className="auth-remember">
              <input type="checkbox" name="remember" />
              {t.remember}
            </label>

            <button className="auth-submit" type="submit" disabled={pendingIntent !== null}>
              {pendingIntent === "login" ? messages.auth.loginLoading : (
                <>
                  {messages.auth.loginButton} <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            <button type="button" className="login-pro-link" onClick={() => setActiveTab("signup")}>
              {t.proLink}
            </button>
          </form>

          {/* Inscription — tous les champs requis par la validation */}
          <form
            className={`auth-panel${activeTab === "signup" ? " is-active" : ""}`}
            onSubmit={handleSignupSubmit(onSignupSubmit, onSignupInvalid)}
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
      </AnimeReveal>

      <footer className="login-foot">
        <a href="mailto:contact@jmrtextile.com">{t.support}</a>
        <span aria-hidden="true">•</span>
        <Link href="/confidentialite">{t.privacy}</Link>
      </footer>
    </div>
  );
}
