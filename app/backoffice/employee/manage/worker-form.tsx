"use client";

import { useState } from "react";
import { usersAPI, type WorkerCreatePayload } from "@/app/lib/api";
import { UserPlus, Loader2 } from "lucide-react";

type Props = {
  onCreated: () => void;
};

export function WorkerForm({ onCreated }: Props) {
  const [form, setForm] = useState<WorkerCreatePayload>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
    role: "worker",
    department: "",
    position: "",
    hire_date: "",
    cin: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function update<K extends keyof WorkerCreatePayload>(key: K, value: WorkerCreatePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      await usersAPI.createWorker(form);
      setSuccess("Employé créé avec succès !");
      setForm({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        phone: "",
        role: "worker",
        department: "",
        position: "",
        hire_date: "",
        cin: "",
      });
      setTimeout(() => onCreated(), 1200);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la création.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="rounded-xl border border-[#e5ad46]/10 bg-white/5 p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e5ad46]/10">
            <UserPlus className="h-5 w-5 text-[#e5ad46]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#eccc90]">Créer un employé</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#eccc90]/40">Remplissez les informations ci-dessous</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Prénom *</label>
              <input
                type="text"
                required
                value={form.first_name}
                onChange={(e) => update("first_name", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Nom *</label>
              <input
                type="text"
                required
                value={form.last_name}
                onChange={(e) => update("last_name", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Email *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              placeholder="employe@jmrtextile.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Mot de passe *</label>
            <input
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              placeholder="Minimum 8 caractères"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Rôle</label>
              <select
                value={form.role}
                onChange={(e) => update("role", e.target.value as "admin" | "worker")}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              >
                <option value="worker">Worker</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Téléphone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Département</label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => update("department", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
                placeholder="Ex: Production, Coupe..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Poste</label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => update("position", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
                placeholder="Ex: Couteau, Surcheuse..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Date d&apos;embauche</label>
              <input
                type="date"
                value={form.hire_date}
                onChange={(e) => update("hire_date", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">CIN</label>
              <input
                type="text"
                value={form.cin}
                onChange={(e) => update("cin", e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 px-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e5ad46] py-3 text-xs font-bold uppercase tracking-[0.3em] text-[#1e2a38] transition-all hover:bg-[#d4a03f] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Créer l&apos;employé
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
