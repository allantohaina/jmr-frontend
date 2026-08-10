"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Calculator, Save } from "lucide-react";
import { authAPI } from "@/app/lib";

type Produit = {
  id: string;
  nom: string;
  categorie: string;
  conso_tissu_unitaire: number;
  niveau_difficulte_defaut: number;
  moq: number;
  cout_matiere_defaut: number;
  cout_mo_par_piece: number;
  frais_generaux_pct: number;
};

type CotationData = {
  id?: string;
  client_id?: string;
  produit_id?: string;
  matiere_fournie_par: "atelier" | "client";
  conso_tissu_unitaire: number;
  taux_chute_pct: number;
  niveau_difficulte: number;
  prix_matiere_par_metre: number;
  cout_mo_par_piece: number;
  frais_generaux_pct: number;
  quantite_commandee: number;
  statut: string;
};

type QuoteRecord = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  client_id?: string;
  produit_id?: string;
  matiere_fournie_par?: "atelier" | "client";
  conso_tissu_unitaire?: number;
  taux_chute_pct?: number;
  niveau_difficulte?: number;
  prix_matiere_par_metre?: number;
  cout_mo_par_piece?: number;
  frais_generaux_pct?: number;
  quantite_commandee?: number;
  status?: string;
};

type CalculResult = {
  tissu_avec_chute_par_piece: number;
  cout_matiere: number;
  cout_main_oeuvre: number;
  cout_frais_generaux: number;
  cout_de_revient: number;
  prix_unitaire_calcule: number;
  prix_total_calcule: number;
};

type Notice = { tone: "success" | "danger"; message: string } | null;

const STATUS_OPTIONS = [
  { value: "draft", label: "Brouillon" },
  { value: "needs_info", label: "À préciser" },
  { value: "sent", label: "Envoyée" },
  { value: "accepted", label: "Acceptée" },
  { value: "rejected", label: "Refusée" },
  { value: "expired", label: "Expirée" },
];

const STATUS_ALIASES: Record<string, string> = {
  "Brouillon": "draft",
  "Envoyée": "sent",
  "Envoyé": "sent",
  "Acceptée": "accepted",
  "Accepté": "accepted",
  "Refusée": "rejected",
  "Refusé": "rejected",
  "Expirée": "expired",
  "Expiré": "expired",
};

export function CotationTextileSection({ quoteId, clientId, initialName, initialEmail, initialPhone }: { quoteId?: string; clientId?: string; initialName?: string; initialEmail?: string; initialPhone?: string }) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [isLoadingProduits, setIsLoadingProduits] = useState(true);
  const [formData, setFormData] = useState<CotationData>({
    client_id: clientId,
    matiere_fournie_par: "atelier",
    conso_tissu_unitaire: 0,
    taux_chute_pct: 10,
    niveau_difficulte: 1,
    prix_matiere_par_metre: 0,
    cout_mo_par_piece: 0,
    frais_generaux_pct: 20,
    quantite_commandee: 0,
    statut: "draft",
  });
  const [clientName, setClientName] = useState(initialName || "");
  const [clientEmail, setClientEmail] = useState(initialEmail || "");
  const [clientPhone, setClientPhone] = useState(initialPhone || "");
  const [clientMessage, setClientMessage] = useState("");
  const [calculs, setCalculs] = useState<CalculResult>({
    tissu_avec_chute_par_piece: 0,
    cout_matiere: 0,
    cout_main_oeuvre: 0,
    cout_frais_generaux: 0,
    cout_de_revient: 0,
    prix_unitaire_calcule: 0,
    prix_total_calcule: 0,
  });
  const [notice, setNotice] = useState<Notice>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

  const fetchProduits = async () => {
    setIsLoadingProduits(true);
    try {
      const res = await authAPI.get<{ data: Produit[] }>("/produits");
      setProduits(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch {
      setProduits([]);
    } finally {
      setIsLoadingProduits(false);
    }
  };

  useEffect(() => { fetchProduits(); }, []);

  useEffect(() => {
    if (!quoteId) return;
    let active = true;
    (async () => {
      try {
        const res = await authAPI.get<QuoteRecord>(`/quotes/${quoteId}`);
        const q = res.data;
        if (!active || !q) return;
        const rawStatus = String(q.status || "");
        const mappedStatus = STATUS_ALIASES[rawStatus] || (STATUS_OPTIONS.some(o => o.value === rawStatus) ? rawStatus : "draft");
        setFormData((prev) => ({
          ...prev,
          client_id: q.client_id || prev.client_id,
          produit_id: q.produit_id || prev.produit_id,
          matiere_fournie_par: q.matiere_fournie_par || prev.matiere_fournie_par,
          conso_tissu_unitaire: Number(q.conso_tissu_unitaire) || prev.conso_tissu_unitaire,
          taux_chute_pct: Number(q.taux_chute_pct) || prev.taux_chute_pct,
          niveau_difficulte: Number(q.niveau_difficulte) || prev.niveau_difficulte,
          prix_matiere_par_metre: Number(q.prix_matiere_par_metre) || prev.prix_matiere_par_metre,
          cout_mo_par_piece: Number(q.cout_mo_par_piece) || prev.cout_mo_par_piece,
          frais_generaux_pct: Number(q.frais_generaux_pct) || prev.frais_generaux_pct,
          quantite_commandee: Number(q.quantite_commandee) || prev.quantite_commandee,
          statut: mappedStatus,
        }));
        const p = produits.find(p => p.id === q.produit_id);
        if (p) setSelectedProduit(p);
        if (q.name) setClientName(q.name);
        if (q.email) setClientEmail(q.email);
        if (q.phone) setClientPhone(q.phone);
        if (q.message) setClientMessage(q.message);
      } catch {}
    })();
    return () => { active = false; };
  }, [quoteId, produits]);

  const calculerPrix = (data: CotationData): CalculResult => {
    const tissuAvecChute = data.conso_tissu_unitaire * (1 + data.taux_chute_pct / 100);
    const coutMatiere = data.matiere_fournie_par === "client" ? 0 : tissuAvecChute * data.prix_matiere_par_metre;
    const coutMO = data.cout_mo_par_piece * Math.max(1, data.niveau_difficulte);
    const coutDirect = coutMatiere + coutMO;
    const coutFG = coutDirect * (data.frais_generaux_pct / 100);
    const coutRevient = coutDirect + coutFG;
    const marge = 0.25;
    const prixUnitaire = coutRevient * (1 + marge);
    const prixTotal = prixUnitaire * data.quantite_commandee;

    return {
      tissu_avec_chute_par_piece: tissuAvecChute,
      cout_matiere: coutMatiere,
      cout_main_oeuvre: coutMO,
      cout_frais_generaux: coutFG,
      cout_de_revient: coutRevient,
      prix_unitaire_calcule: prixUnitaire,
      prix_total_calcule: prixTotal,
    };
  };

  useEffect(() => {
    setCalculs(calculerPrix(formData));
  }, [formData]);

  const handleProduitChange = (produitId: string) => {
    const produit = produits.find(p => p.id === produitId);
    if (produit) {
      setSelectedProduit(produit);
      setFormData(prev => ({
        ...prev,
        produit_id: produit.id,
        conso_tissu_unitaire: produit.conso_tissu_unitaire,
        niveau_difficulte: produit.niveau_difficulte_defaut,
        prix_matiere_par_metre: produit.cout_matiere_defaut,
        cout_mo_par_piece: produit.cout_mo_par_piece,
        frais_generaux_pct: produit.frais_generaux_pct,
      }));
    }
  };

  const handleChange = (field: keyof CotationData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value as CotationData[keyof CotationData] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice(null);

    const errors: string[] = [];
    if (!clientName.trim() || clientName.trim().length < 2) errors.push("Le nom du client est requis (min. 2 caractères).");
    if (!clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) errors.push("L'email du client est requis et doit être valide.");
    if (formData.quantite_commandee < 1) errors.push("La quantité commandée doit être au moins de 1.");
    if (formData.conso_tissu_unitaire < 0) errors.push("La consommation tissu ne peut pas être négative.");
    if (formData.prix_matiere_par_metre < 0) errors.push("Le prix matière par mètre ne peut pas être négatif.");
    if (formData.cout_mo_par_piece < 0) errors.push("Le coût main d'oeuvre ne peut pas être négatif.");
    if (formData.frais_generaux_pct < 0 || formData.frais_generaux_pct > 100) errors.push("Le pourcentage de frais généraux doit être entre 0 et 100.");

    if (errors.length > 0) {
      setNotice({ tone: "danger", message: errors.join(" ") });
      setIsSaving(false);
      return;
    }

    const payload = {
      ...formData,
      ...calculs,
      client_id: formData.client_id || null,
      name: clientName.trim(),
      email: clientEmail.trim(),
      phone: clientPhone.trim() || null,
      message: clientMessage.trim() || "Demande de cotation textile",
    };

    try {
      if (quoteId) {
        await authAPI.put(`/quotes/${quoteId}`, payload);
        setNotice({ tone: "success", message: "Cotation mise à jour" });
      } else {
        const res = await authAPI.post<{ id?: string }>("/quotes", payload);
        const newId = res.data?.id;
        setNotice({ tone: "success", message: "Cotation créée" });
        if (newId) {
          setTimeout(() => {
            window.location.href = `/backoffice/devis/edit?id=${newId}`;
          }, 800);
        }
      }
    } catch {
      setNotice({ tone: "danger", message: "Erreur lors de l'enregistrement" });
    } finally {
      setIsSaving(false);
    }
  };

  const moqAlert = selectedProduit && formData.quantite_commandee > 0 && formData.quantite_commandee < selectedProduit.moq;

  return (
    <div className="px-4 md:px-12 py-8 md:py-10 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline text-2xl md:text-3xl text-[#163526]">Cotation Textile</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-[#1b1c19]/40 mt-1">Calcul automatique des prix</p>
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne gauche : Paramètres */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#163526]/5 shadow-sm space-y-6">
              <h3 className="font-headline text-xl text-[#163526] flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-500" />
                Paramètres de calcul
              </h3>

              <div className="rounded-2xl border border-[#163526]/10 bg-[#faf9f4] p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Client</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Nom *</label>
                    <input
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-white border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                      placeholder="Nom du client"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Email *</label>
                    <input
                      required
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full bg-white border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                      placeholder="email@exemple.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Téléphone</label>
                    <input
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full bg-white border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                      placeholder="+261 XX XXX XX"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Description du besoin</label>
                  <textarea
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    className="w-full bg-white border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10 h-16"
                    placeholder="Description du projet..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Fiche produit</label>
                  <select
                    value={formData.produit_id || ""}
                    onChange={(e) => handleProduitChange(e.target.value)}
                    disabled={isLoadingProduits}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  >
                    <option value="">Sélectionner un produit...</option>
                    {produits.map(p => (
                      <option key={p.id} value={p.id}>{p.nom} ({p.categorie || "Sans catégorie"})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Matière fournie par</label>
                  <select
                    value={formData.matiere_fournie_par}
                    onChange={(e) => handleChange("matiere_fournie_par", e.target.value)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  >
                    <option value="atelier">Atelier</option>
                    <option value="client">Client (CMT)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Conso tissu unitaire (m)</label>
                  <input
                    type="number"
                    step="0.001"
                    value={formData.conso_tissu_unitaire || ""}
                    onChange={(e) => handleChange("conso_tissu_unitaire", parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Taux de chute (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.taux_chute_pct}
                    onChange={(e) => handleChange("taux_chute_pct", parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Niveau difficulté</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.niveau_difficulte}
                    onChange={(e) => handleChange("niveau_difficulte", parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Prix matière par mètre (Ar)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.prix_matiere_par_metre}
                    onChange={(e) => handleChange("prix_matiere_par_metre", parseFloat(e.target.value) || 0)}
                    disabled={formData.matiere_fournie_par === "client"}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Coût MO par pièce (Ar)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cout_mo_par_piece}
                    onChange={(e) => handleChange("cout_mo_par_piece", parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Frais généraux (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.frais_generaux_pct}
                    onChange={(e) => handleChange("frais_generaux_pct", parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Quantité commandée</label>
                  <input
                    type="number"
                    value={formData.quantite_commandee}
                    onChange={(e) => handleChange("quantite_commandee", parseInt(e.target.value) || 0)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  />
                  {moqAlert && (
                    <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest mt-1">
                      ⚠ MOQ: {selectedProduit.moq} pièces minimum
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-[#1b1c19]/40">Statut</label>
                  <select
                    value={formData.statut}
                    onChange={(e) => handleChange("statut", e.target.value)}
                    className="w-full bg-[#faf9f4] border-none p-3 rounded-xl text-xs font-bold text-[#163526] outline-none focus:ring-2 focus:ring-[#163526]/10"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Résultats calculés */}
          <div className="space-y-6">
            <div className="bg-[#163526] rounded-2xl p-6 md:p-8 text-white shadow-xl space-y-6">
              <h3 className="font-headline text-xl flex items-center gap-2">
                <span className="material-symbols-outlined text-orange-400">analytics</span>
                Résultat calculé
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-white/60 uppercase tracking-widest">Tissu avec chute/pièce</span>
                  <span className="font-mono text-sm font-bold">{calculs.tissu_avec_chute_par_piece.toFixed(3)} m</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-white/60 uppercase tracking-widest">Coût matière</span>
                  <span className="font-mono text-sm font-bold">{calculs.cout_matiere.toLocaleString()} Ar</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-white/60 uppercase tracking-widest">Coût main d&apos;œuvre</span>
                  <span className="font-mono text-sm font-bold">{calculs.cout_main_oeuvre.toLocaleString()} Ar</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-white/60 uppercase tracking-widest">Frais généraux</span>
                  <span className="font-mono text-sm font-bold">{calculs.cout_frais_generaux.toLocaleString()} Ar</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-xs text-white/60 uppercase tracking-widest">Coût de revient</span>
                  <span className="font-mono text-sm font-bold">{calculs.cout_de_revient.toLocaleString()} Ar</span>
                </div>

                <div className="pt-4 space-y-3">
                  <div className="bg-white/10 rounded-xl p-4">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Prix unitaire calculé</p>
                    <p className="font-headline text-2xl font-bold text-orange-400">{calculs.prix_unitaire_calcule.toLocaleString()} Ar</p>
                  </div>

                  <div className="bg-orange-500/20 rounded-xl p-4 border border-orange-400/30">
                    <p className="text-[10px] text-orange-200 uppercase tracking-widest mb-1">Prix total</p>
                    <p className="font-headline text-3xl font-bold text-orange-400">{calculs.prix_total_calcule.toLocaleString()} Ar</p>
                    <p className="text-[10px] text-orange-200/60 mt-1">pour {formData.quantite_commandee} pièces</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-[#163526] text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Enregistrement..." : "Enregistrer la cotation"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
