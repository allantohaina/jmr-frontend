"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authenticateWithForm, getToken } from "@/app/lib";
import { loginRateLimiter } from "@/app/lib/rate-limit";

export default function WorkerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const token = getToken();
    if (token) {
      window.location.href = "/atelier";
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

      const result = await authenticateWithForm(formData);

      if (result?.user?.role === "worker") {
        window.location.href = "/atelier";
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
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#1e2a38"
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: "3px solid #2a3a4a",
          borderTop: "3px solid #e5ad46",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }} />
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0 }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap');
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes stitch { 0% { background-position: 0 0; } 100% { background-position: 20px 0; } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        .worker-login-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          background: #1e2a38;
          color: #f3efe4;
        }
        .panel {
          position: relative;
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #141e2e;
          border-right: 1px solid #2a3a4a;
          overflow: hidden;
        }
        .thread-decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.15;
          pointer-events: none;
        }
        .brand-mark {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 80px;
        }
        .brand-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #e5ad46, #cb8b3c);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .brand-text {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #f3efe4;
        }
        .copy-section {
          position: relative;
          z-index: 2;
          max-width: 480px;
        }
        .eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #e5ad46;
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .copy-section h1 {
          font-family: 'Fraunces', serif;
          font-size: 36px;
          font-weight: 500;
          line-height: 1.3;
          color: #f3efe4;
          margin-bottom: 24px;
        }
        .copy-section p {
          font-size: 15px;
          line-height: 1.7;
          color: #8b93a7;
        }
        .panel-footer {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 32px;
          padding-top: 40px;
          border-top: 1px solid #2a3a4a;
        }
        .panel-footer span {
          font-size: 12px;
          color: #5c6478;
        }
        .form-side {
          padding: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #1e2a38;
        }
        .form-header {
          margin-bottom: 40px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 20px;
          background: rgba(59, 155, 143, 0.1);
          border: 1px solid rgba(59, 155, 143, 0.2);
          font-size: 12px;
          font-weight: 600;
          color: #e5ad46;
          margin-bottom: 24px;
          letter-spacing: 1px;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 32px;
          font-size: 13px;
          color: #8b93a7;
          text-decoration: none;
          transition: color 0.2s;
        }
        .back-link:hover {
          color: #e5ad46;
        }
        .form-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 500;
          color: #f3efe4;
          margin-bottom: 8px;
        }
        .form-header .subtitle {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 3px;
          color: #5c6478;
          text-transform: uppercase;
        }
        .form-group {
          margin-bottom: 24px;
        }
        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #8b93a7;
          margin-bottom: 8px;
        }
        .input-wrapper {
          position: relative;
        }
        .input-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: repeating-linear-gradient(
            90deg,
            #e5ad46,
            #e5ad46 4px,
            transparent 4px,
            transparent 8px
          );
          transition: width 0.4s ease;
        }
        .input-wrapper:focus-within::after {
          width: 100%;
          animation: stitch 0.8s linear infinite;
        }
        .form-group input {
          width: 100%;
          padding: 16px;
          background: #141e2e;
          border: 1px solid #2a3a4a;
          border-radius: 8px;
          color: #f3efe4;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          transition: border-color 0.2s;
          outline: none;
        }
        .form-group input::placeholder {
          color: #5c6478;
        }
        .form-group input:focus {
          border-color: #e5ad46;
        }
        .error-box {
          padding: 16px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          border-radius: 8px;
          color: #dc3545;
          font-size: 13px;
          margin-bottom: 24px;
        }
        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #e5ad46, #cb8b3c);
          border: none;
          border-radius: 8px;
          color: #f3efe4;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: transform 0.2s, opacity 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .form-footer {
          margin-top: 32px;
          font-size: 12px;
          color: #5c6478;
          text-align: center;
        }
        @media (max-width: 900px) {
          .worker-login-container {
            grid-template-columns: 1fr;
          }
          .panel {
            display: none;
          }
        }
      ` }} />

      <div className="worker-login-container">
        {/* Left Panel */}
        <div className="panel">
          <svg className="thread-decoration" viewBox="0 0 600 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50 200 Q150 150 250 250 T550 350" stroke="#e5ad46" strokeWidth="1" strokeDasharray="8 12" fill="none"/>
            <path d="M-50 300 Q200 250 300 350 T600 400" stroke="#cb8b3c" strokeWidth="1" strokeDasharray="6 10" fill="none"/>
            <path d="M-50 400 Q100 350 200 450 T500 500" stroke="#e5ad46" strokeWidth="1.5" strokeDasharray="10 14" fill="none"/>
            <path d="M-50 500 Q250 450 350 550 T650 600" stroke="#cb8b3c" strokeWidth="1" strokeDasharray="4 8" fill="none"/>
            <path d="M-50 150 Q300 100 400 200 T700 300" stroke="#eccc90" strokeWidth="0.8" strokeDasharray="6 10" fill="none"/>
            <path d="M-50 600 Q150 550 250 650 T550 750" stroke="#e5ad46" strokeWidth="1" strokeDasharray="8 12" fill="none"/>
          </svg>

          <div className="brand-mark">
            <img src="/navbar/logo-dark.svg" alt="JMR Textile" style={{ height: 40, width: "auto" }} />
          </div>

          <div className="copy-section">
            <p className="eyebrow">ESPACE ATELIER</p>
            <h1>La précision d&apos;un atelier, au service de chaque opérateur.</h1>
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

        {/* Right Panel */}
        <div className="form-side">
          <div className="form-header">
            <div className="badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Atelier
            </div>
            <Link href="/" className="back-link">← Retour au site</Link>
            <h2>Espace atelier</h2>
            <p className="subtitle">CONNEXION SÉCURISÉE</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? "Connexion en cours..." : "Se connecter"}
            </button>
          </form>

          <p className="form-footer">
            Accès réservé aux opérateurs de production
          </p>
        </div>
      </div>
    </div>
  );
}