"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authenticateWithForm } from "@/app/lib";
import { getToken } from "@/app/lib";
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
      window.location.assign("/atelier");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const rateLimit = loginRateLimiter.check("global");
    if (!rateLimit.allowed) {
      setError("Trop de tentatives de connexion. Veuillez patienter 15 minutes.");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("intent", "login");
      formData.append("email", email);
      formData.append("password", password);

      const { redirectTo, user } = await authenticateWithForm(formData);

      if (user?.role !== "worker") {
        setError("Accès refusé. Compte atelier requis.");
        setIsLoading(false);
        return;
      }

      window.location.assign(redirectTo);
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Connexion impossible. Vérifiez vos identifiants.";
      setError(message);
      setIsLoading(false);
    }
  }

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1a2332]">
        <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#e5ad46]">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2332] to-[#25303a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Image
            src="/navbar/logo-dark.svg"
            alt="JMR Textile"
            width={180}
            height={40}
            className="mx-auto mb-6"
            priority
            unoptimized
          />
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 mb-4">
            <Image src="/icone-production.svg" alt="" width={18} height={18} unoptimized className="opacity-80" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
              Atelier
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Espace production JMR Textile</h1>
          <p className="text-xs text-white/40 uppercase tracking-[0.15em]">
            Connexion sécurisée
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          {error && (
            <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="worker-email" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Email
              </label>
              <input
                id="worker-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-[#e5ad46]/50 placeholder:text-white/20"
                placeholder="votre@email.com"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="worker-password" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                Mot de passe
              </label>
              <input
                id="worker-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-[#e5ad46]/50 placeholder:text-white/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#e5ad46] py-4 text-xs font-bold uppercase tracking-[0.3em] text-[#1a2332] shadow-lg shadow-[#e5ad46]/20 transition-all duration-200 hover:bg-[#d4a03f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-[11px] text-white/30 hover:text-white/50 transition-colors">
              ← Retour au site
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-white/20 uppercase tracking-[0.15em]">
          JMR Textile &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
