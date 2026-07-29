"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { ClipboardList, CheckCircle, XCircle, Loader } from "lucide-react";

export default function TasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [employees, setEmployees] = useState<(UserProfile & { present: boolean })[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredEmployees = statusFilter === "present" ? employees.filter((e) => e.present) : statusFilter === "absent" ? employees.filter((e) => !e.present) : employees;

  const setFilter = useCallback((status: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    authAPI.get<UserProfile[]>("/users").then((res) => {
      setEmployees(res.data.filter((u) => u.role === "worker").map((u) => ({ ...u, present: false })));
    }).catch(() => setEmployees([])).finally(() => setLoading(false));
  }, []);

  const togglePresent = (id: string | number | undefined) => {
    setEmployees(employees.map((e) => e.id === id ? { ...e, present: !e.present } : e));
  };

  const presentCount = employees.filter((e) => e.present).length;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-[#e5ad46]" />
        <h1 className="font-headline text-2xl text-[#e5ad46]">Suivi Employés</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#25303a] p-4 border border-green-500/20">
          <p className="text-xs text-green-400 uppercase tracking-widest font-bold">Présents</p>
          <p className="text-3xl font-bold text-green-400 mt-1">{presentCount}</p>
        </div>
        <div className="rounded-xl bg-[#25303a] p-4 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-widest font-bold">Absents</p>
          <p className="text-3xl font-bold text-red-400 mt-1">{employees.length - presentCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[null, "present", "absent"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${statusFilter === s || (!statusFilter && !s) ? "bg-[#e5ad46] text-[#1e2a38]" : "bg-[#25303a] text-[#eccc90]/60 hover:bg-[#e5ad46]/10"}`}>
            {s === "present" ? "Présents" : s === "absent" ? "Absents" : "Tous"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#e5ad46]" /></div>
      ) : employees.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucun employé inscrit.</p>
      ) : filteredEmployees.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">Aucun employé avec ce statut.</p>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((e) => (
            <div key={e.id} className="rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${e.present ? "bg-green-400" : "bg-red-400"}`} />
                <div>
                  <p className="font-semibold text-[#eccc90]">{e.first_name} {e.last_name}</p>
                  <p className="text-xs text-[#eccc90]/50">{e.email}</p>
                </div>
              </div>
              <button
                onClick={() => togglePresent(e.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-colors ${e.present ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"}`}
              >
                {e.present ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                {e.present ? "Absent" : "Présent"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
