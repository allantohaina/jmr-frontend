"use client";

import React, { useState, useEffect, useCallback } from "react";
import { authAPI, fetchWithAuth } from "@/app/lib/api";
import { Shield, ShieldOff, AlertTriangle, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

interface Ban {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  expires_at: string | null;
  created_at: string;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  banned_by_email?: string;
}

export default function AdminBansPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [bans, setBans] = useState<Ban[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [banModal, setBanModal] = useState<{ user: User } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, bansRes] = await Promise.all([
        authAPI.get<{ data: User[] }>("/users"),
        authAPI.get<{ data: Ban[] }>("/admin/bans"),
      ]);
      setUsers(Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data ?? []));
      setBans(Array.isArray(bansRes.data) ? bansRes.data : (bansRes.data?.data ?? []));
    } catch (e) {
      console.error("Failed to fetch data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeBanUserIds = new Set(bans.filter(b => !b.expires_at || new Date(b.expires_at) > new Date()).map(b => b.user_id));

  const handleBan = async () => {
    if (!banModal || !banReason.trim()) return;
    try {
      const expiresAt = banDuration
        ? new Date(Date.now() + parseInt(banDuration) * 60000).toISOString()
        : null;
      const res = await authAPI.post("/admin/bans", {
        user_id: banModal.user.id,
        reason: banReason.trim(),
        expires_at: expiresAt,
      });
      if (res.data) {
        setBanModal(null);
        setBanReason("");
        setBanDuration("");
        fetchData();
      }
    } catch {
      alert("Erreur lors du bannissement");
    }
  };

  const handleUnban = async (banId: string) => {
    if (!confirm("Confirmer la levée du ban ?")) return;
    try {
      await fetchWithAuth(`/admin/bans/${banId}`, { method: "DELETE" });
      fetchData();
    } catch {
      alert("Erreur lors de la levée du ban");
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center px-6 py-20 md:px-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#e5ad46] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 px-6 py-10 md:px-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline text-2xl text-[#e5ad46]">Gestion des Bannissements</h2>
          <p className="mt-1 text-sm text-[#eccc90]/60">Bannir ou réhabiliter des utilisateurs</p>
        </div>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#eccc90]/40" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un utilisateur..."
          className="w-full rounded-xl border border-[#e5ad46]/20 bg-[#25303a] py-3 pl-10 pr-4 text-sm text-[#eccc90] placeholder-[#eccc90]/30 outline-none transition-colors focus:border-[#e5ad46]"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#e5ad46]/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#e5ad46]/10 bg-[#25303a]/80 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">
              <th className="px-6 py-4">Utilisateur</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Rôle</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5ad46]/5">
            {filteredUsers.map(user => {
              const isBanned = activeBanUserIds.has(user.id);
              const userBan = bans.find(b => b.user_id === user.id && (!b.expires_at || new Date(b.expires_at) > new Date()));
              return (
                <tr key={user.id} className="transition-colors hover:bg-[#e5ad46]/5">
                  <td className="px-6 py-4 font-medium text-[#eccc90]">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-[#eccc90]/70">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-[#e5ad46]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#e5ad46]">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isBanned ? (
                      <span className="flex items-center gap-2 text-red-400">
                        <ShieldOff className="h-4 w-4" /> Banni
                        {userBan?.expires_at && (
                          <span className="text-[10px] text-[#eccc90]/40">
                            jusqu&apos;au {new Date(userBan.expires_at).toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-green-400">
                        <Shield className="h-4 w-4" /> Actif
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isBanned ? (
                      <button
                        onClick={() => userBan && handleUnban(userBan.id)}
                        className="rounded-lg border border-green-500/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-green-400 transition-colors hover:bg-green-500/10"
                      >
                        Réhabiliter
                      </button>
                    ) : user.role !== "admin" ? (
                      <button
                        onClick={() => setBanModal({ user })}
                        className="rounded-lg border border-red-500/30 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        Bannir
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#eccc90]/30">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#eccc90]/40">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-[#e5ad46]/20 bg-[#1e2a38] p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h3 className="font-headline text-lg text-[#e5ad46]">Bannir un utilisateur</h3>
            </div>
            <p className="mb-6 text-sm text-[#eccc90]/70">
              Êtes-vous sûr de vouloir bannir <strong className="text-[#eccc90]">{banModal.user.first_name} {banModal.user.last_name}</strong> ({banModal.user.email}) ?
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">Motif du ban</label>
                <textarea
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  rows={3}
                  placeholder="Raison du bannissement..."
                  className="w-full rounded-xl border border-[#e5ad46]/20 bg-[#25303a] px-4 py-3 text-sm text-[#eccc90] placeholder-[#eccc90]/30 outline-none transition-colors focus:border-[#e5ad46]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60">
                  Durée (minutes, laisser vide pour permanent)
                </label>
                <input
                  type="number"
                  value={banDuration}
                  onChange={e => setBanDuration(e.target.value)}
                  min="1"
                  placeholder="Ex: 1440 pour 24h"
                  className="w-full rounded-xl border border-[#e5ad46]/20 bg-[#25303a] px-4 py-3 text-sm text-[#eccc90] placeholder-[#eccc90]/30 outline-none transition-colors focus:border-[#e5ad46]"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => { setBanModal(null); setBanReason(""); setBanDuration(""); }}
                className="rounded-xl border border-[#e5ad46]/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#eccc90]/60 transition-colors hover:bg-[#e5ad46]/5"
              >
                Annuler
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim()}
                className="rounded-xl bg-red-500/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-400 transition-colors hover:bg-red-500/30 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Confirmer le ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
