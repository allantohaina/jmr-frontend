"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authAPI, fetchWithAuth } from "@/app/lib/api";
import { Ban, Plus, Trash2 } from "lucide-react";

interface BlacklistEntry {
  id: string;
  email: string | null;
  ip_address: string | null;
  reason: string | null;
  created_at: string;
}

export default function AdminBlacklistPage() {
  const [entries, setEntries] = useState<BlacklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newIp, setNewIp] = useState("");
  const [newReason, setNewReason] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authAPI.get<{ data: BlacklistEntry[] }>("/admin/blacklist");
      setEntries(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (e) {
      console.error("Failed to fetch blacklist", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAdd = async () => {
    if (!newEmail && !newIp) return;
    try {
      const res = await authAPI.post("/admin/blacklist", {
        email: newEmail || null,
        ip_address: newIp || null,
        reason: newReason || null,
      });
      if (res.data) {
        setShowAdd(false);
        setNewEmail("");
        setNewIp("");
        setNewReason("");
        fetchData();
      }
    } catch {
      alert("Erreur lors de l'ajout à la blacklist");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette entrée de la blacklist ?")) return;
    try {
      await fetchWithAuth(`/admin/blacklist/${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center px-6 py-20 md:px-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5A623] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-10 md:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl text-[#F5A623]">Blacklist</h2>
          <p className="mt-1 text-sm text-[#F5A623]/60">
            Emails et IPs bloqués à l&apos;inscription
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-xl bg-[#F5A623]/10 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#F5A623] transition-colors hover:bg-[#F5A623]/20"
        >
          <Plus className="h-4 w-4" /> Ajouter
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#F5A623]/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#F5A623]/10 bg-[#25303a]/80 text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/60">
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">IP</th>
              <th className="px-6 py-4">Motif</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F5A623]/5">
            {entries.map(entry => (
              <tr key={entry.id} className="transition-colors hover:bg-[#F5A623]/5">
                <td className="px-6 py-4 font-medium text-[#F5A623]">{entry.email || "—"}</td>
                <td className="px-6 py-4 text-[#F5A623]/70">{entry.ip_address || "—"}</td>
                <td className="px-6 py-4 text-[#F5A623]/60">{entry.reason || "—"}</td>
                <td className="px-6 py-4 text-[#F5A623]/40 text-[10px]">
                  {new Date(entry.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="h-3 w-3" /> Retirer
                  </button>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#F5A623]/40">
                  Aucune entrée dans la blacklist
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#F5A623]/20 bg-[#1e2a38] p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <Ban className="h-6 w-6 text-[#F5A623]" />
              <h3 className="font-headline text-lg text-[#F5A623]">Ajouter à la blacklist</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/60">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="w-full rounded-xl border border-[#F5A623]/20 bg-[#25303a] px-4 py-3 text-sm text-[#F5A623] placeholder-[#F5A623]/30 outline-none transition-colors focus:border-[#F5A623]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/60">Adresse IP</label>
                <input
                  type="text"
                  value={newIp}
                  onChange={e => setNewIp(e.target.value)}
                  placeholder="192.168.1.1"
                  className="w-full rounded-xl border border-[#F5A623]/20 bg-[#25303a] px-4 py-3 text-sm text-[#F5A623] placeholder-[#F5A623]/30 outline-none transition-colors focus:border-[#F5A623]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/60">Motif (optionnel)</label>
                <input
                  type="text"
                  value={newReason}
                  onChange={e => setNewReason(e.target.value)}
                  placeholder="Raison du blocage..."
                  className="w-full rounded-xl border border-[#F5A623]/20 bg-[#25303a] px-4 py-3 text-sm text-[#F5A623] placeholder-[#F5A623]/30 outline-none transition-colors focus:border-[#F5A623]"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => { setShowAdd(false); setNewEmail(""); setNewIp(""); setNewReason(""); }}
                className="rounded-xl border border-[#F5A623]/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#F5A623]/60 transition-colors hover:bg-[#F5A623]/5"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={!newEmail && !newIp}
                className="rounded-xl bg-[#F5A623]/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#F5A623] transition-colors hover:bg-[#F5A623]/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
