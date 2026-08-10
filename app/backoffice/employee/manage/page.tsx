"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { usersAPI, authAPI, type UserProfile } from "@/app/lib/api";
import { getToken } from "@/app/lib";
import { WorkerForm } from "./worker-form";
import { CSVImport } from "./csv-import";
import { UserPlus, Upload, Users, Search, X } from "lucide-react";

type Tab = "list" | "create" | "import";

export default function EmployeeManagePage() {
  const [tab, setTab] = useState<Tab>("list");
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadEmployees() {
    setIsLoading(true);
    setError("");
    try {
      const token = getToken();
      if (!token) return;
      const response = await authAPI.get<UserProfile[]>("/users", token);
      const data = (response.data ?? []) as UserProfile[];
      setEmployees(data.filter((u) => u.role === "worker" || u.role === "admin"));
    } catch (err) {
      setError("Erreur lors du chargement des employés.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    return (
      !q ||
      e.first_name?.toLowerCase().includes(q) ||
      e.last_name?.toLowerCase().includes(q) ||
      e.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 md:p-12">
      <div className="mb-8">
        <h1 className="font-headline text-2xl text-[#e5ad46]">Gestion des employés</h1>
        <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">
          Créer et gérer les comptes employés
        </p>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setTab("list")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            tab === "list" ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-white/5 text-[#eccc90]/60 hover:bg-white/10"
          }`}
        >
          <Users className="h-4 w-4" />
          Liste
        </button>
        <button
          onClick={() => setTab("create")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            tab === "create" ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-white/5 text-[#eccc90]/60 hover:bg-white/10"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Créer
        </button>
        <button
          onClick={() => setTab("import")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
            tab === "import" ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-white/5 text-[#eccc90]/60 hover:bg-white/10"
          }`}
        >
          <Upload className="h-4 w-4" />
          Import CSV
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {tab === "list" && (
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#eccc90]/40" />
              <input
                type="text"
                placeholder="Rechercher un employé..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#e5ad46]/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-[#eccc90] outline-none focus:border-[#e5ad46]/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#eccc90]/40 hover:text-[#e5ad46]">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/40">
              {filtered.length} employé(s)
            </span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-[#eccc90]/40">
              <span className="text-xs font-bold uppercase tracking-widest">Chargement...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-[#eccc90]/40">
              <Users className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p className="text-sm">Aucun employé trouvé.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#e5ad46]/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#e5ad46]/10 bg-white/5">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Nom</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Email</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Rôle</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Département</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Poste</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Téléphone</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="border-b border-[#e5ad46]/5 transition-colors hover:bg-white/5">
                      <td className="px-4 py-3 font-semibold text-[#eccc90]">
                        {emp.first_name} {emp.last_name}
                      </td>
                      <td className="px-4 py-3 text-[#eccc90]/70">{emp.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${
                          emp.role === "admin" ? "bg-[#e5ad46]/20 text-[#e5ad46]" : "bg-blue-500/20 text-blue-400"
                        }`}>
                          {emp.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#eccc90]/70">{emp.department || "—"}</td>
                      <td className="px-4 py-3 text-[#eccc90]/70">{emp.position || "—"}</td>
                      <td className="px-4 py-3 text-[#eccc90]/70">{emp.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "create" && (
        <WorkerForm
          onCreated={() => {
            setTab("list");
            loadEmployees();
          }}
        />
      )}

      {tab === "import" && (
        <CSVImport
          onImported={() => {
            setTab("list");
            loadEmployees();
          }}
        />
      )}
    </div>
  );
}
