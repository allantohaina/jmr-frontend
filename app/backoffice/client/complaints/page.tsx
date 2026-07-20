"use client";

import { useState, useEffect } from "react";
import { authAPI, type UserProfile } from "@/app/lib/api";
import { MessageSquare, Search, Loader } from "lucide-react";

export default function ComplaintsPage() {
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    authAPI.get<UserProfile[]>("/users").then((res) => {
      setClients(res.data.filter((u) => u.role === "user"));
    }).catch(() => setClients([])).finally(() => setLoading(false));
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return c.first_name?.toLowerCase().includes(q) || c.last_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  return (
    <div className="p-6 md:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-[#e5ad46]" />
        <h1 className="font-headline text-2xl text-[#e5ad46]">Clients</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#eccc90]/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par nom, email..." className="w-full rounded-xl bg-[#25303a] pl-11 pr-4 py-3 text-sm text-[#eccc90] placeholder:text-[#eccc90]/30 outline-none border border-[#e5ad46]/10 focus:border-[#e5ad46]/30" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader className="h-5 w-5 animate-spin text-[#e5ad46]" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-[#eccc90]/50">{search ? "Aucun client trouvé." : "Aucun client inscrit."}</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl bg-[#25303a] p-4 border border-[#e5ad46]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5ad46]/20 text-[#e5ad46] text-xs font-bold">
                    {c.first_name?.[0]}{c.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#eccc90]">{c.first_name} {c.last_name}</p>
                    <p className="text-xs text-[#eccc90]/50">ID: {c.id?.toString().slice(0, 8)}…</p>
                  </div>
                </div>
                <span className="text-[10px] text-[#eccc90]/50">{c.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
