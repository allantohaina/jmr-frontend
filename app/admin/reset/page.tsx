"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOutClient } from "@/app/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.jmrtextile.com/api";

type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: string;
  created_at: string;
};

export default function AdminResetPage() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();

      if (data.status === "success") {
        setIsAuthenticated(true);
        setUsers(data.data);
      } else {
        setMessage("Clé secrète invalide.");
      }
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/admin/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify({ email: selectedEmail, password: newPassword }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setMessage(`✓ ${data.message}`);
        setNewPassword("");
      } else {
        setMessage(`✗ ${data.message}`);
      }
    } catch {
      setMessage("Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <h1 className="text-xl font-bold text-white text-center mb-6">Admin Reset Tool</h1>
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Clé secrète"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#e5ad46]/50 placeholder:text-white/20"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#e5ad46] py-3 text-xs font-bold uppercase tracking-widest text-[#1a2332] disabled:opacity-60"
            >
              {isLoading ? "Vérification..." : "Accéder"}
            </button>
          </form>
          {message && <p className="mt-4 text-center text-sm text-red-400">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Réinitialiser un mot de passe</h1>
          <button type="button" onClick={handleSignOut} disabled={isSigningOut} className="inline-flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/20 disabled:opacity-60"><LogOut className="h-4 w-4" />{isSigningOut ? "Déconnexion…" : "Déconnexion"}</button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">Utilisateurs</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setSelectedEmail(u.email)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                  selectedEmail === u.email
                    ? "bg-[#e5ad46]/20 border border-[#e5ad46]/40 text-[#e5ad46]"
                    : "bg-white/5 border border-white/5 text-white/70 hover:bg-white/10"
                }`}
              >
                <span className="font-medium">{u.first_name} {u.last_name}</span>
                <span className="ml-2 text-xs opacity-50">{u.email}</span>
                <span className={`ml-2 text-[10px] uppercase px-2 py-0.5 rounded-full ${
                  u.role === "admin" ? "bg-red-500/20 text-red-400" :
                  u.role === "worker" ? "bg-blue-500/20 text-blue-400" :
                  "bg-green-500/20 text-green-400"
                }`}>
                  {u.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        {selectedEmail && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
              Nouveau mot de passe pour {selectedEmail}
            </h2>
            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe (min 8 car.)"
                minLength={8}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#e5ad46]/50 placeholder:text-white/20"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-[#e5ad46] py-3 text-xs font-bold uppercase tracking-widest text-[#1a2332] disabled:opacity-60"
              >
                {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
              </button>
            </form>
          </div>
        )}

        {message && (
          <p className={`mt-4 text-sm text-center ${message.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
