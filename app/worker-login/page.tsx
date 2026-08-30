"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authenticateWithForm, getToken, getSafeRedirectPath } from "@/app/lib";
import { loginRateLimiter } from "@/app/lib/rate-limit";
import { AuthBar } from "@/app/components/auth-bar";

export default function WorkerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  function getNextPath(): string | null {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return getSafeRedirectPath(params.get("next")) ?? null;
  }

  useEffect(() => {
    setIsMounted(true);
    const token = getToken();
    if (token) {
      window.location.href = getNextPath() || "/atelier";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const rateLimit = loginRateLimiter.check("worker-login");
    if (!rateLimit.allowed) {
      setError("Trop de tentatives. Veuillez réessayer plus tard.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("intent", "login");
      formData.append("email", email);
      formData.append("password", password);

      const nextPath = getNextPath();
      if (nextPath) formData.append("next", nextPath);
      const result = await authenticateWithForm(formData);

      if (result?.user?.role === "worker") {
        window.location.href = nextPath || "/atelier";
      } else if (result?.user?.role === "admin") {
        // admin peut aussi accéder à l'atelier
        window.location.href = nextPath || "/atelier";
      } else {
        setError("Accès non autorisé. Vous devez être opérateur.");
      }
    } catch (err) {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div style={{ minHeight: "100vh", background: "#1e2a38", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #e5ad46", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Inter:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg-deep: #1e2a38;
          --bg-panel: #141e2e;
          --gold: #e5ad46;
          --gold-light: #eccc90;
          --text-cream: #f3efe4;
          --text-muted: #8b93a7;
        }

        .worker-login-root {
          min-height: 100vh;
          background: var(--bg-deep);
          font-family: 'Inter', sans-serif;
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .panel {
          position: relative;
          background: var(--bg-panel);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          overflow: hidden;
        }

        .thread-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.15;
        }

        .brand-mark {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .copy-section {
          position: relative;
          z-index: 1;
          margin-top: auto;
        }

        .copy-section .eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: var(--gold);
          margin-bottom: 16px;
        }

        .copy-section h2 {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 300;
          line-height: 1.35;
          color: var(--text-cream);
          margin-bottom: 20px;
        }

        .copy-section p {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-muted);
          max-width: 420px;
        }

        .panel-footer {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 24px;
          margin-top: 48px;
        }

        .panel-footer span {
          font-size: 11px;
          letter-spacing: 1px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .form-side {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          background: var(--bg-deep);
        }

        .form-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(59, 155, 143, 0.1);
          border: 1px solid rgba(59, 155, 143, 0.2);
          border-radius: 24px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 500;
          color: var(--gold);
          margin-bottom: 24px;
          width: fit-content;
          letter-spacing: 1px;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          margin-bottom: 32px;
          transition: color 0.2s;
        }

        .back-link:hover {
          color: var(--text-cream);
        }

        .form-side h3 {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 600;
          color: var(--text-cream);
          margin-bottom: 6px;
        }

        .form-side .subtitle {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 3px;
          color: var(--text-muted);
          margin-bottom: 40px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .form-group input {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: var(--text-cream);
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-group input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(229, 173, 70, 0.12);
          animation: stitchPulse 0.6s ease;
        }

        .form-group input::placeholder {
          color: rgba(139, 147, 167, 0.5);
        }

        @keyframes stitchPulse {
          0% { box-shadow: 0 0 0 0 rgba(229, 173, 70, 0.3); }
          50% { box-shadow: 0 0 0 6px rgba(229, 173, 70, 0.08); }
          100% { box-shadow: 0 0 0 3px rgba(229, 173, 70, 0.12); }
        }

        .error-box {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.25);
          border-radius: 10px;
          padding: 12px 16px;
          margin-bottom: 20px;
          color: #f87171;
          font-size: 13px;
          line-height: 1.5;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: var(--gold);
          border: none;
          border-radius: 10px;
          color: #1e2a38;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          margin-top: 8px;
        }

        .submit-btn:hover {
          background: var(--gold-light);
        }

        .submit-btn:active {
          transform: scale(0.98);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .form-footer-note {
          text-align: center;
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 28px;
        }

        @media (max-width: 900px) {
          .worker-login-root {
            grid-template-columns: 1fr;
          }
          .panel {
            display: none;
          }
          .form-side {
            padding: 32px 24px;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="worker-login-root">
        <AuthBar initialTheme="dark" />

        {/* LEFT PANEL */}
        <div className="panel">
          <svg className="thread-bg" viewBox="0 0 600 900" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 100 Q200 200 150 400 Q100 600 250 800" stroke="#e5ad46" strokeWidth="1.5" strokeDasharray="8 6" fill="none" />
            <path d="M120 50 Q300 180 220 450 Q140 720 300 850" stroke="#e5ad46" strokeWidth="1" strokeDasharray="6 8" fill="none" />
            <path d="M400 30 Q320 250 380 480 Q440 700 350 880" stroke="#eccc90" strokeWidth="1" strokeDasharray="10 5" fill="none" />
            <path d="M500 120 Q420 300 480 520 Q540 740 430 870" stroke="#e5ad46" strokeWidth="1.2" strokeDasharray="5 9" fill="none" />
            <path d="M80 200 Q250 320 180 560 Q110 800 280 900" stroke="#eccc90" strokeWidth="0.8" strokeDasharray="4 10" fill="none" />
          </svg>

          <div className="brand-mark">
            <img src="/navbar/logo-dark.svg" alt="JMR Textile" style={{ height: 40, width: "auto" }} />
          </div>

          <div className="copy-section">
            <div className="eyebrow">ESPACE ATELIER</div>
            <h2>La précision d&apos;un atelier, au service de chaque opérateur.</h2>
            <p>
              Commandes, tissage et finition : accédez à votre espace de production avec la même exigence que celle transmise à chaque pièce cousue à Madagascar.
            </p>
          </div>

          <div className="panel-footer">
            <span>Sécurisé</span>
            <span>Production</span>
            <span>© 2026</span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="form-side">
          <div className="form-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            Atelier
          </div>

          <Link href="/" className="back-link">
            ← Retour au site
          </Link>

          <h3>Espace atelier</h3>
          <div className="subtitle">CONNEXION SÉCURISÉE</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <div className="form-footer-note">
            Accès réservé aux opérateurs de production
          </div>
        </div>
      </div>
    </>
  );
}
