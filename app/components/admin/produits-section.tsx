"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus, Pencil, Trash2, XCircle } from "lucide-react";
import { authAPI } from "@/app/lib";
import { AttachmentUploader } from "./attachment-uploader";

type Produit = {
  id: string;
  nom: string;
  categorie: string;
  conso_tissu_unitaire: number;
  conso_tissu_par_taille: Record<string, number> | null;
  niveau_difficulte_defaut: number;
  moq: number;
  cout_matiere_defaut: number;
  cout_mo_par_piece: number;
  frais_generaux_pct: number;
  description: string | null;
  photo_url: string | null;
  created_at: string;
};

type ProduitPayload = {
  nom: string;
  categorie: string | null;
  conso_tissu_unitaire: number;
  conso_tissu_par_taille?: Record<string, number> | null;
  niveau_difficulte_defaut: number;
  moq: number;
  cout_matiere_defaut: number;
  cout_mo_par_piece: number;
  frais_generaux_pct: number;
  description: string | null;
  photo_url: string | null;
};

type Notice = { tone: "success" | "danger"; message: string } | null;

export function ProduitsSection() {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProduitId, setSelectedProduitId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    categorie: "",
    conso_tissu_unitaire: "",
    conso_tissu_par_taille: "",
    niveau_difficulte_defaut: "1.0",
    moq: "1",
    cout_matiere_defaut: "0",
    cout_mo_par_piece: "0",
    frais_generaux_pct: "20",
    description: "",
    photo_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchProduits = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authAPI.get<{ data: Produit[] }>("/produits");
      setProduits((res.data?.data) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProduits(); }, []);

  const resetForm = () => {
    setFormData({
      nom: "",
      categorie: "",
      conso_tissu_unitaire: "",
      conso_tissu_par_taille: "",
      niveau_difficulte_defaut: "1.0",
      moq: "1",
      cout_matiere_defaut: "0",
      cout_mo_par_piece: "0",
      frais_generaux_pct: "20",
      description: "",
      photo_url: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (p: Produit) => {
    setFormData({
      nom: p.nom,
      categorie: p.categorie || "",
      conso_tissu_unitaire: String(p.conso_tissu_unitaire),
      conso_tissu_par_taille: p.conso_tissu_par_taille ? JSON.stringify(p.conso_tissu_par_taille) : "",
      niveau_difficulte_defaut: String(p.niveau_difficulte_defaut),
      moq: String(p.moq),
      cout_matiere_defaut: String(p.cout_matiere_defaut),
      cout_mo_par_piece: String(p.cout_mo_par_piece),
      frais_generaux_pct: String(p.frais_generaux_pct),
      description: p.description || "",
      photo_url: p.photo_url || "",
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await authAPI.delete(`/produits/${id}`);
      setNotice({ tone: "success", message: "Produit supprimé" });
      fetchProduits();
    } catch {
      setNotice({ tone: "danger", message: "Erreur de suppression" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    const payload: ProduitPayload = {
      nom: formData.nom,
      categorie: formData.categorie || null,
      conso_tissu_unitaire: parseFloat(formData.conso_tissu_unitaire) || 0,
      niveau_difficulte_defaut: parseFloat(formData.niveau_difficulte_defaut) || 1,
      moq: parseInt(formData.moq) || 1,
      cout_matiere_defaut: parseFloat(formData.cout_matiere_defaut) || 0,
      cout_mo_par_piece: parseFloat(formData.cout_mo_par_piece) || 0,
      frais_generaux_pct: parseFloat(formData.frais_generaux_pct) || 20,
      description: formData.description || null,
      photo_url: formData.photo_url || null,
    };

    if (formData.conso_tissu_par_taille) {
      try {
        payload.conso_tissu_par_taille = JSON.parse(formData.conso_tissu_par_taille);
      } catch {
        payload.conso_tissu_par_taille = null;
      }
    }

    try {
      if (editingId) {
        await authAPI.put(`/produits/${editingId}`, payload);
        setNotice({ tone: "success", message: "Produit mis à jour" });
      } else {
        await authAPI.post("/produits", payload);
        setNotice({ tone: "success", message: "Produit créé" });
      }
      resetForm();
      fetchProduits();
    } catch {
      setNotice({ tone: "danger", message: "Erreur lors de l'enregistrement" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 md:px-12 py-8 md:py-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl text-[#163526]">Fiches Produits</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b1c19]/40 mt-1">Référentiel des produits de l&apos;atelier</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#163526]/90 transition-all"
        >
          <Plus className="h-4 w-4" /> Nouveau produit
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
          <h3 className="font-headline text-xl text-[#163526] mb-6">{editingId ? "Modifier" : "Créer"} un produit</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Nom du produit *</label>
              <input
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: Chemise homme manches longues"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Catégorie</label>
              <input
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: Chemise / Pantalon / Robe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Conso tissu unitaire (m) *</label>
              <input
                required
                type="number"
                step="0.001"
                value={formData.conso_tissu_unitaire}
                onChange={(e) => setFormData({ ...formData, conso_tissu_unitaire: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: 1.5"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Conso par taille (JSON)</label>
              <input
                value={formData.conso_tissu_par_taille}
                onChange={(e) => setFormData({ ...formData, conso_tissu_par_taille: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder='Ex: {"S": 1.2, "M": 1.5, "L": 1.8}'
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Niveau difficulté défaut *</label>
              <input
                required
                type="number"
                step="0.1"
                value={formData.niveau_difficulte_defaut}
                onChange={(e) => setFormData({ ...formData, niveau_difficulte_defaut: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: 1.0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">MOQ *</label>
              <input
                required
                type="number"
                value={formData.moq}
                onChange={(e) => setFormData({ ...formData, moq: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: 10"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Coût matière défaut (Ar/m) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.cout_matiere_defaut}
                onChange={(e) => setFormData({ ...formData, cout_matiere_defaut: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: 5000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Coût MO par pièce (Ar) *</label>
              <input
                required
                type="number"
                step="0.01"
                value={formData.cout_mo_par_piece}
                onChange={(e) => setFormData({ ...formData, cout_mo_par_piece: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: 2000"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Frais généraux (%) *</label>
              <input
                required
                type="number"
                step="0.1"
                value={formData.frais_generaux_pct}
                onChange={(e) => setFormData({ ...formData, frais_generaux_pct: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="Ex: 20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Photo URL</label>
              <input
                value={formData.photo_url}
                onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                placeholder="URL de l'image"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10 h-24"
                placeholder="Description du produit..."
              />
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
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Nom</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Catégorie</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Conso tissu</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Difficulté</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">MOQ</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#163526]/5">
                {produits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm italic text-[#1b1c19]/40">
                      Aucun produit pour le moment.
                    </td>
                  </tr>
                ) : (
produits.map((p) => (
                      <tr
                        key={p.id}
                        className={`hover:bg-[#163526]/[0.02] transition-colors cursor-pointer ${
                          selectedProduitId === p.id ? "bg-[#faf9f4]" : ""
                        }`}
                        onClick={() =>
                          setSelectedProduitId(selectedProduitId === p.id ? null : p.id)
                        }
                      >
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#163526]">{p.nom}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#163526]/60">{p.categorie || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-[#163526]">{p.conso_tissu_unitaire} m</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-[#163526]">x{p.niveau_difficulte_defaut}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-[#163526]">{p.moq}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 rounded-lg border border-[#163526]/10 text-[#163526] hover:border-orange-500 hover:text-orange-500 transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-2 rounded-lg border border-red-100 text-red-600 hover:bg-red-50 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

       {selectedProduitId && (
         <div className="bg-white rounded-2xl border border-[#163526]/5 shadow-sm overflow-hidden mt-6">
           <div className="p-6 border-b border-[#163526]/5 flex justify-between items-center">
             <div>
               <h3 className="font-headline text-xl text-[#163526]">Détails du produit</h3>
               <p className="text-xs text-[#1b1c19]/40 uppercase tracking-widest mt-1">
                 {produits.find((p) => p.id === selectedProduitId)?.nom}
               </p>
             </div>
             <button
               onClick={() => setSelectedProduitId(null)}
               className="p-2 rounded-lg border border-[#163526]/10 text-[#163526] hover:border-orange-500 hover:text-orange-500 transition-colors"
             >
               <XCircle className="h-4 w-4" />
             </button>
           </div>
           <div className="p-6">
             <AttachmentUploader entityType="produit" entityId={selectedProduitId} />
           </div>
         </div>
       )}
     </div>
   );
 }
