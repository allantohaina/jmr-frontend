"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { ClipboardList, CheckCircle, XCircle, Loader as LoaderIcon } from "lucide-react";

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

  const [togglingId, setTogglingId] = useState<string | number | null>(null);

  const togglePresent = (id: string | number | undefined, current: boolean) => {
    if (!id) return;
    const action = current ? "passer cet employé en Absent" : "passer cet employé en Présent";
    if (!confirm(`Confirmer le changement de statut — ${action} ?`)) return;
    setTogglingId(id);
    setTimeout(() => {
      setEmployees(employees.map((e) => e.id === id ? { ...e, present: !e.present } : e));
      setTogglingId(null);
    }, 200);
  };

  const presentCount = employees.filter((e) => e.present).length;

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-[#EAA100]" />
        <h1 className="font-headline text-2xl text-[#EAA100]">Suivi Employés</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-[#161D30] p-4 border border-[#1F8457]/20">
          <p className="text-xs text-[#5CB87D] uppercase tracking-widest font-bold">Présents</p>
          <p className="text-3xl font-bold text-[#5CB87D] mt-1">{presentCount}</p>
        </div>
        <div className="rounded-xl bg-[#161D30] p-4 border border-[#E05252]/20">
          <p className="text-xs text-[#F3A3A6] uppercase tracking-widest font-bold">Absents</p>
          <p className="text-3xl font-bold text-[#F3A3A6] mt-1">{employees.length - presentCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[null, "present", "absent"].map((s) => (
          <button key={s || "all"} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-caption font-bold uppercase tracking-widest transition-colors ${statusFilter === s || (!statusFilter && !s) ? "bg-[#EAA100] text-[#1e2a38]" : "bg-[#161D30] text-[#EAA100]/60 hover:bg-[#EAA100]/10"}`}>
            {s === "present" ? "Présents" : s === "absent" ? "Absents" : "Tous"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><LoaderIcon className="h-5 w-5 animate-spin text-[#EAA100]" /></div>
      ) : employees.length === 0 ? (
        <p className="text-sm text-[#EAA100]/50">Aucun employé inscrit.</p>
      ) : filteredEmployees.length === 0 ? (
        <p className="text-sm text-[#EAA100]/50">Aucun employé avec ce statut.</p>
      ) : (
        <div className="space-y-3">
          {filteredEmployees.map((e) => (
            <div key={e.id} className="rounded-xl bg-[#161D30] p-4 border border-[#EAA100]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${e.present ? "bg-[#1F8457]" : "bg-[#E05252]"}`} />
                <div>
                  <p className="font-semibold text-[#EAA100]">{e.first_name} {e.last_name}</p>
                  <p className="text-xs text-[#EAA100]/50">{e.email}</p>
                </div>
              </div>
              <button
                onClick={() => togglePresent(e.id, e.present)}
                disabled={togglingId === e.id}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-caption font-bold uppercase tracking-widest transition-colors disabled:opacity-50 ${e.present ? "bg-[#E05252]/20 text-[#F3A3A6] hover:bg-[#E05252]/30" : "bg-[#1F8457]/20 text-[#5CB87D] hover:bg-[#1F8457]/30"}`}
              >
                {togglingId === e.id ? <LoaderIcon className="h-3 w-3 animate-spin" /> : e.present ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                {e.present ? "Absent" : "Présent"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
