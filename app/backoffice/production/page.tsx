"use client";

import { useEffect, useState } from "react";
import { ProductionWorkflowBoard } from "@/app/components/production-workflow-board";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { Users, Clock, CheckCircle, AlertTriangle, Loader } from "lucide-react";

const statusIcon: Record<string, React.ReactNode> = {
  present: <CheckCircle className="h-4 w-4 text-green-400" />,
  absent: <AlertTriangle className="h-4 w-4 text-red-400" />,
  pause: <Clock className="h-4 w-4 text-yellow-400" />,
};

export default function BackofficeProductionPage() {
  const [showEmployees, setShowEmployees] = useState(false);
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!showEmployees) return;

    async function fetchUsers() {
      setLoading(true);
      setError("");
      try {
        const res = await authAPI.get<UserProfile[]>("/users");
        setEmployees(res.data.filter((u) => u.role === "worker"));
      } catch {
        setError("Impossible de charger les employés.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [showEmployees]);

  return (
    <div className="space-y-8">
      <ProductionWorkflowBoard />

      <section className="rounded-2xl border border-[#e5ad46]/10 bg-[#25303a] p-6">
        <button
          onClick={() => setShowEmployees(!showEmployees)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-[#e5ad46]" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#e5ad46]">
              Suivi Employés
            </h2>
          </div>
          <span className={`text-[#eccc90]/60 transition-transform ${showEmployees ? "rotate-180" : ""}`}>
            ▼
          </span>
        </button>

        {showEmployees && (
          <div className="mt-4 space-y-2">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-5 w-5 animate-spin text-[#e5ad46]" />
              </div>
            )}
            {error && (
              <p className="py-4 text-center text-sm text-red-400">{error}</p>
            )}
            {!loading && !error && employees.length === 0 && (
              <p className="py-4 text-center text-sm text-[#eccc90]/50">Aucun employé inscrit.</p>
            )}
            {!loading &&
              employees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between rounded-xl bg-[#1e2a38] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-[#eccc90]">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-[10px] text-[#eccc90]/50">{emp.email}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
