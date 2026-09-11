"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/app/components/locale-provider";
import { authenticateWithForm } from "@/app/lib";
import { loginRateLimiter } from "@/app/lib/rate-limit";
import { useForm, Controller, useWatch, type FieldErrors } from "react-hook-form";
import { getErrorMessage } from "@/app/lib/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";
import { AuthBar } from "@/app/components/auth-bar";

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

function resolveAuthErrorMessage(error?: string | null) {
  if (!error) return "";
  return getErrorMessage(error);
}

export function ClientAccessPage({ nextPath = "/mon-profil", error, initialTab = "login" }: ClientAccessPageProps) {
  const { messages } = useLocale();
  const [errorMessage, setErrorMessage] = useState(resolveAuthErrorMessage(error));
  const [signupFeedback, setSignupFeedback] = useState<SignupFeedback | null>(null);
  const [pendingIntent, setPendingIntent] = useState<"login" | "signup" | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

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
      <div style={{ minHeight: "100vh", background: "#1e2a38", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #FFB42D", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <AuthBar />
      <style>{`
        .client-login-root {
          min-height: 100vh;
          background: #1e2a38;
          font-family: 'Inter', sans-serif;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
        }

        .client-panel {
          position: relative;
          background: #141e2e;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
        }

        .client-thread-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.15;
        }

        .client-brand-mark {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .client-copy-section {
          position: relative;
          z-index: 1;
          margin-top: auto;
        }

        .client-copy-section .eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #FFB42D;
          margin-bottom: 16px;
        }

        .client-copy-section h2 {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 300;
          line-height: 1.35;
          color: #f3efe4;
          margin-bottom: 20px;
        }

        .client-copy-section p {
          font-size: 14px;
          line-height: 1.7;
          color: #8b93a7;
          max-width: 440px;
        }

        .client-points {
          list-style: none;
          margin: 24px 0 0;
          padding: 0;
          display: grid;
          gap: 12px;
        }

        .client-points li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #f3efe4;
        }

        .client-points .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #FFB42D;
          flex-shrink: 0;
        }

        .client-panel-footer {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 24px;
          margin-top: 48px;
        }

        .client-panel-footer span {
          font-size: 11px;
          letter-spacing: 1px;
          color: #8b93a7;
          text-transform: uppercase;
        }

        .client-form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 48px 60px;
          background: #1e2a38;
          max-width: 640px;
          width: 100%;
          margin: 0 auto;
        }

        .client-form-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 180, 45, 0.1);
          border: 1px solid rgba(255, 180, 45, 0.25);
          border-radius: 24px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          color: #FFB42D;
          margin-bottom: 24px;
          width: fit-content;
        }

        .client-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #8b93a7;
          text-decoration: none;
          font-size: 13px;
          margin-bottom: 32px;
          transition: color 0.2s;
        }

        .client-back-link:hover {
          color: #f3efe4;
        }

        .client-form-side h3 {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 600;
          color: #f3efe4;
          margin-bottom: 6px;
        }

        .client-form-side .subtitle {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          color: #8b93a7;
          margin-bottom: 32px;
        }

        .client-error-box {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #f87171;
          font-size: 13px;
          line-height: 1.5;
        }

        .client-form-footer-note {
          text-align: center;
          font-size: 12px;
          color: #8b93a7;
          margin-top: 28px;
        }

        @media (max-width: 900px) {
          .client-login-root {
            grid-template-columns: 1fr;
          }
          .client-panel {
            display: none;
          }
          .client-form-side {
            padding: 32px 24px;
          }
        }
      `}</style>

      <div className="client-login-root">
        {/* LEFT PANEL */}
        <div className="client-panel">
          <svg className="client-thread-bg" viewBox="0 0 600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 100 Q200 200 150 400 Q100 600 250 800" stroke="#FFB42D" strokeWidth="1.5" strokeDasharray="8 6" fill="none" />
            <path d="M120 50 Q300 180 220 450 Q140 720 300 850" stroke="#FFB42D" strokeWidth="1" strokeDasharray="6 8" fill="none" />
            <path d="M400 30 Q320 250 380 480 Q440 700 350 880" stroke="#FFB42D" strokeWidth="1" strokeDasharray="10 5" fill="none" />
            <path d="M500 120 Q420 300 480 520 Q540 740 430 870" stroke="#FFB42D" strokeWidth="1.2" strokeDasharray="5 9" fill="none" />
            <path d="M80 200 Q250 320 180 560 Q110 800 280 900" stroke="#FFB42D" strokeWidth="0.8" strokeDasharray="4 10" fill="none" />
          </svg>

          <div className="client-brand-mark">
            <img src="/navbar/logo-dark.svg" alt="JMR Textile" style={{ height: 40, width: "auto" }} />
          </div>

          <div className="client-copy-section">
            <div className="eyebrow">ESPACE CLIENT</div>
            <h2>Vos projets textiles, suivis en toute transparence.</h2>
            <p>
              Devis, commandes et production : retrouvez l&apos;ensemble de vos projets JMR Textile au même endroit, avec un interlocuteur unique à Madagascar.
            </p>
            <ul className="client-points">
              <li><span className="dot" />Devis et validations en ligne</li>
              <li><span className="dot" />Suivi de production en temps réel</li>
              <li><span className="dot" />Paiements par tranches sécurisées</li>
            </ul>
          </div>

          <div className="client-panel-footer">
            <span>Sur-mesure</span>
            <span>Suivi temps réel</span>
            <span>© 2026</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="client-form-side">
          <div className="client-form-badge">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="8" width="2.5" height="5" rx="0.5" fill="#FFB42D" />
              <rect x="4.5" y="5" width="2.5" height="8" rx="0.5" fill="#FFB42D" />
              <rect x="8" y="2.5" width="2.5" height="10.5" rx="0.5" fill="#FFB42D" />
              <rect x="11.5" y="0.5" width="2" height="12.5" rx="0.5" fill="#FFB42D" />
            </svg>
            Espace client
          </div>

          <Link href="/" className="client-back-link">
            ← Retour au site
          </Link>

          <h3>{messages.auth.title}</h3>
          <div className="subtitle">{messages.auth.subtitle}</div>

          {errorMessage && (
            <div className="client-error-box" role="alert">
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

            {/* Connexion */}
            <form
              className={`auth-panel${activeTab === "login" ? " is-active" : ""}`}
              onSubmit={handleLoginSubmit}
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

          <div className="client-form-footer-note">
            Vos données restent confidentielles et ne sont jamais partagées.
          </div>
        </div>
      </div>
    </>
  );
}
