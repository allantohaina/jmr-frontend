"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, FileText, ShoppingCart, DollarSign, Award } from "lucide-react";
import { authAPI } from "@/app/lib";

type Client = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  is_privileged?: boolean;
};

type Demande = {
  id: string;
  nom_client: string;
  email?: string;
  description: string;
  statut: string;
  date_reception: string;
};

type Quote = {
  id: string;
  name?: string;
  status: string;
  amount?: number;
  created_at: string;
};

type Commande = {
  id: string;
  client_id?: string;
  numero: string;
  designation?: string;
  statut_production: string;
  total: number;
  date_commande: string;
};

type Notice = { tone: "success" | "danger"; message: string } | null;

const PRIVILEGE_REVENUE_THRESHOLD = 500000;

export function ClientHistorySection({ clientId }: { clientId: string }) {
  const [client, setClient] = useState<Client | null>(null);
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [caCumule, setCaCumule] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [togglingPrivilege, setTogglingPrivilege] = useState(false);

  const fetchClientData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const clientRes = await authAPI.get<Client>(`/users/${clientId}`);
      const clientData = clientRes.data || null;
      setClient(clientData);

      const clientEmail = (clientData?.email || "").toLowerCase().trim();
      const clientFirstName = (clientData?.first_name || "").toLowerCase().trim();
      const clientLastName = (clientData?.last_name || "").toLowerCase().trim();
      const clientFullName = `${clientFirstName} ${clientLastName}`.trim();

      const [demandesRes, quotesRes, commandesRes] = await Promise.all([
        authAPI.get<Demande[] | { data: Demande[] }>("/demandes-client"),
        authAPI.get<Quote[] | { data: Quote[] }>("/quotes"),
        authAPI.get<Commande[] | { data: Commande[] }>("/commandes"),
      ]);

      const allDemandes = Array.isArray(demandesRes.data)
        ? demandesRes.data
        : ((demandesRes.data as { data?: Demande[] }).data || []);
      const clientDemandes = allDemandes.filter((d: Demande) => {
        const dEmail = (d.email || "").toLowerCase().trim();
        const dNom = (d.nom_client || "").toLowerCase().trim();
        if (clientEmail && dEmail && dEmail === clientEmail) return true;
        if (clientFullName && dNom && dNom.includes(clientFirstName) && dNom.includes(clientLastName)) return true;
        if (clientFullName && dNom && dNom === clientFullName) return true;
        return false;
      });
      setDemandes(clientDemandes);

      const allQuotes = Array.isArray(quotesRes.data)
        ? quotesRes.data
        : ((quotesRes.data as { data?: Quote[] }).data || []);
      const clientQuotes = allQuotes.filter((q: any) => {
        const qClientId = (q.client_id || "") as string;
        const qEmail = ((q.email || "") as string).toLowerCase().trim();
        if (qClientId && qClientId === clientId) return true;
        if (clientEmail && qEmail && qEmail === clientEmail) return true;
        return false;
      });
      setQuotes(clientQuotes as Quote[]);

      const allCommandes = Array.isArray(commandesRes.data)
        ? commandesRes.data
        : ((commandesRes.data as { data?: Commande[] }).data || []);
      const clientCommandes = allCommandes.filter((c: Commande) =>
        c.client_id === clientId
      );
      setCommandes(clientCommandes);

      const ca = clientCommandes
        .filter((c) => c.statut_production === "Livrée")
        .reduce((sum, c) => sum + (c.total || 0), 0);
      setCaCumule(ca);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchClientData(); }, [clientId]);

  const handleCreateDemande = () => {
    if (!client) return;
    const params = new URLSearchParams({
      nom_client: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
      email: client.email || "",
      telephone: client.phone || "",
    });
    window.location.href = `/backoffice/demandes?${params.toString()}`;
  };

  const handleCreateQuote = () => {
    if (!client) return;
    const params = new URLSearchParams({
      client_id: clientId,
      name: `${client.first_name || ""} ${client.last_name || ""}`.trim(),
      email: client.email || "",
      phone: client.phone || "",
    });
    window.location.href = `/backoffice/devis/nouvelle?${params.toString()}`;
  };

  const isAutoPrivileged = caCumule >= PRIVILEGE_REVENUE_THRESHOLD;
  const isPrivileged = client?.is_privileged || isAutoPrivileged;

  const handleTogglePrivilege = async () => {
    if (!client) return;
    setTogglingPrivilege(true);
    try {
      await authAPI.put(`/users/${clientId}/privilege`, {});
      setClient({ ...client, is_privileged: !client.is_privileged });
      setNotice({ tone: "success", message: client.is_privileged ? "Client retiré des privilégiés" : "Client marqué comme privilégié" });
    } catch {
      setNotice({ tone: "danger", message: "Erreur lors de la mise à jour" });
    } finally {
      setTogglingPrivilege(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 md:px-12 py-8 md:py-10">
        <div className="flex items-center justify-center rounded-2xl border border-[#163526]/5 bg-white py-16">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#163526]/50" />
          Chargement...
        </div>
      </div>
    );
  }

  if (error && !client) {
    return (
      <div className="px-4 md:px-12 py-8 md:py-10">
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-12 py-8 md:py-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl text-[#163526]">Historique Client</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b1c19]/40 mt-1">
            {client?.first_name} {client?.last_name}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCreateDemande}
            className="px-4 py-2 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/90 transition-all"
          >
            + Demande
          </button>
          <button
            onClick={handleCreateQuote}
            className="px-4 py-2 border border-[#163526]/10 text-[#163526] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/5 transition-all"
          >
            + Cotation
          </button>
        </div>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${
          notice.tone === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          <span className="material-symbols-outlined text-sm">{notice.tone === "success" ? "check_circle" : "error"}</span>
          {notice.message}
        </div>
      )}

      {/* Info Client */}
      {client && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-xl text-[#163526]">Informations</h3>
            <div className="flex items-center gap-3">
              {isPrivileged && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold uppercase tracking-widest rounded-full">
                  <Award className="h-3 w-3" />
                  Client privilégié
                </span>
              )}
              <button
                onClick={handleTogglePrivilege}
                disabled={togglingPrivilege}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${
                  client.is_privileged
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-[#163526]/5 text-[#163526]/60 border-[#163526]/10 hover:bg-[#163526]/10"
                } ${togglingPrivilege ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                {togglingPrivilege ? "..." : client.is_privileged ? "Retirer privilège" : "Marquer privilégié"}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Email</p>
              <p className="text-sm font-bold text-[#163526]">{client.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Téléphone</p>
              <p className="text-sm font-bold text-[#163526]">{client.phone || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40 mb-1">Chiffre d&apos;affaires cumulé</p>
              <p className={`text-sm font-bold ${isAutoPrivileged ? "text-amber-600" : "text-[#163526]"}`}>
                {caCumule.toLocaleString()} Ar
                {isAutoPrivileged && <span className="ml-2 text-[9px] font-bold uppercase text-amber-500">auto</span>}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demandes */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-orange-500" />
          Demandes ({demandes.length})
        </h3>
        {demandes.length === 0 ? (
          <p className="text-sm italic text-[#1b1c19]/40">Aucune demande</p>
        ) : (
          <div className="space-y-3">
            {demandes.map(d => (
              <div key={d.id} className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#163526]">{d.description}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 mt-1">{new Date(d.date_reception).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[9px] font-bold uppercase rounded-full">{d.statut}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cotations */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-orange-500" />
          Cotations ({quotes.length})
        </h3>
        {quotes.length === 0 ? (
          <p className="text-sm italic text-[#1b1c19]/40">Aucune cotation</p>
        ) : (
          <div className="space-y-3">
            {quotes.map(q => (
              <div key={q.id} className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#163526]">{q.name || "Sans nom"}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 mt-1">{new Date(q.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-orange-50 text-orange-700 text-[9px] font-bold uppercase rounded-full">{q.status}</span>
                    {q.amount && <p className="text-sm font-bold text-[#163526] mt-1">{q.amount.toLocaleString()} Ar</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Commandes */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
        <h3 className="font-headline text-xl text-[#163526] mb-4 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-orange-500" />
          Commandes ({commandes.length})
        </h3>
        {commandes.length === 0 ? (
          <p className="text-sm italic text-[#1b1c19]/40">Aucune commande</p>
        ) : (
          <div className="space-y-3">
            {commandes.map(c => (
              <div key={c.id} className="p-4 bg-[#faf9f4] rounded-xl border border-[#163526]/5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[#163526]">{c.numero}</p>
                    <p className="text-[10px] text-[#1b1c19]/40">{c.designation || "Sans désignation"}</p>
                    <p className="text-[10px] text-[#1b1c19]/40 mt-1">{new Date(c.date_commande).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-green-50 text-green-700 text-[9px] font-bold uppercase rounded-full">{c.statut_production}</span>
                    <p className="text-sm font-bold text-[#163526] mt-1">{c.total.toLocaleString()} Ar</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
