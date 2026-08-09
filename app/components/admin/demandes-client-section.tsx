"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, Pencil, XCircle } from "lucide-react";
import { authAPI } from "@/app/lib";

type DemandeClient = {
  id: string;
  nom_client: string;
  entreprise: string | null;
  email: string | null;
  telephone: string | null;
  description: string;
  statut: string;
  cotation_id: string | null;
  date_reception: string;
  created_at: string;
};

type Notice = { tone: "success" | "danger"; message: string } | null;

const STATUS_OPTIONS = [
  { value: "Nouvelle", label: "Nouvelle" },
  { value: "En cours d'étude", label: "En cours d'étude" },
  { value: "Convertie en cotation", label: "Convertie en cotation" },
  { value: "Refusée", label: "Refusée" },
];

export function DemandesClientSection() {
  const [demandes, setDemandes] = useState<DemandeClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom_client: "",
    entreprise: "",
    email: "",
    telephone: "",
    description: "",
    statut: "Nouvelle",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchDemandes = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authAPI.get<{ data: DemandeClient[]; counts: Record<string, number> }>("/demandes-client");
      setDemandes((res.data?.data) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDemandes(); }, []);

  const resetForm = () => {
    setFormData({
      nom_client: "",
      entreprise: "",
      email: "",
      telephone: "",
      description: "",
      statut: "Nouvelle",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (d: DemandeClient) => {
    setFormData({
      nom_client: d.nom_client,
      entreprise: d.entreprise || "",
      email: d.email || "",
      telephone: d.telephone || "",
      description: d.description,
      statut: d.statut,
    });
    setEditingId(d.id);
    setShowForm(true);
  };

  const handleRefuse = async (id: string) => {
    if (!confirm("Marquer cette demande comme refusée ?")) return;
    try {
      await authAPI.put(`/demandes-client/${id}/refuse`, {});
      setNotice({ tone: "success", message: "Demande marquée refusée" });
      fetchDemandes();
    } catch {
      setNotice({ tone: "danger", message: "Erreur lors du refus" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    const payload = {
      ...formData,
      email: formData.email || null,
      telephone: formData.telephone || null,
      entreprise: formData.entreprise || null,
    };

    try {
      if (editingId) {
        await authAPI.put(`/demandes-client/${editingId}`, payload);
        setNotice({ tone: "success", message: "Demande mise à jour" });
      } else {
        await authAPI.post("/demandes-client", payload);
        setNotice({ tone: "success", message: "Demande créée" });
      }
      resetForm();
      fetchDemandes();
    } catch {
      setNotice({ tone: "danger", message: "Erreur lors de l'enregistrement" });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Nouvelle": return "bg-blue-50 text-blue-700 border-blue-100";
      case "En cours d'étude": return "bg-orange-50 text-orange-700 border-orange-100";
      case "Convertie en cotation": return "bg-green-50 text-green-700 border-green-100";
      case "Refusée": return "bg-red-50 text-red-700 border-red-100";
      default: return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="px-4 md:px-12 py-8 md:py-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl text-[#163526]">Demandes Client</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b1c19]/40 mt-1">Gestion des demandes initiales</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/90 transition-all"
        >
          <Plus className="h-4 w-4" /> Nouvelle demande
        </button>
      </div>

      {notice && (
        <div className={`p-4 rounded-xl border text-xs font-bold uppercase tracking-widest flex items-center gap-3 ${
          notice.tone === "success" ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
        }`}>
          <span className="material-symbols-outlined text-sm">{notice.tone === "success" ? "check_circle" : "error"}</span>
          {notice.message}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm">
          <h3 className="font-headline text-xl text-[#163526] mb-6">{editingId ? "Modifier" : "Créer"} une demande</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Nom du client *</label>
              <input
                required
                value={formData.nom_client}
                onChange={(e) => setFormData({ ...formData, nom_client: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Nom du client"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Entreprise</label>
              <input
                value={formData.entreprise}
                onChange={(e) => setFormData({ ...formData, entreprise: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Nom de l'entreprise"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="email@exemple.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Téléphone</label>
              <input
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="+261 XX XXX XX"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Description du besoin *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10 h-24"
                placeholder="Description détaillée du besoin..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/90 transition-all disabled:opacity-50"
              >
                {isSaving ? "Enregistrement..." : editingId ? "Mettre à jour" : "Créer"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-[#163526]/10 text-[#163526] font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/5 transition-all"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center justify-center rounded-2xl border border-[#163526]/5 bg-white py-16">
          <Loader2 className="mr-3 h-5 w-5 animate-spin text-[#163526]/50" />
          Chargement...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#163526]/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[#163526]/5 bg-[#163526]/5">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Client</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Contact</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Description</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Statut</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Date réception</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#163526]/5">
                {demandes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm italic text-[#1b1c19]/40">
                      Aucune demande pour le moment.
                    </td>
                  </tr>
                ) : (
                  demandes.map((d) => (
                    <tr key={d.id} className="hover:bg-[#163526]/[0.02]">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#163526]">{d.nom_client}</p>
                        {d.entreprise && <p className="text-xs text-[#163526]/60">{d.entreprise}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#163526]">{d.email || "—"}</p>
                        <p className="text-[10px] text-[#1b1c19]/40">{d.telephone || "—"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-[#163526]/60 line-clamp-2 max-w-xs">{d.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(d.statut)}`}>
                          {d.statut}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-[#163526]">{new Date(d.date_reception).toLocaleDateString('fr-FR')}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(d)}
                            className="p-2 rounded-lg border border-[#163526]/10 text-[#163526] hover:border-orange-500 hover:text-orange-500 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          {d.statut !== "Refusée" && (
                            <button
                              onClick={() => handleRefuse(d.id)}
                              className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                              title="Refuser"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
