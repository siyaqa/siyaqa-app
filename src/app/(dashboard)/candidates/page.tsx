"use client";

import { useEffect, useState } from "react";
import { Plus, Search, CreditCard, Pencil, Trash2, Users, X, AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  cin: string | null;
  gender: string;
  permitType: string;
  status: string;
  totalFee: number;
  publicToken: string;
  createdAt: string;
  _count?: { payments: number };
  paymentsSum?: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CODE_EN_COURS: { label: "Code en cours", color: "bg-primary-light text-primary ring-indigo-200" },
  CODE_REUSSI: { label: "Code réussi", color: "bg-amber-50 text-amber-800 ring-amber-200" },
  CONDUITE_EN_COURS: { label: "Conduite en cours", color: "bg-primary-light text-primary ring-indigo-200" },
  EXAMEN_PLANIFIE: { label: "Examen planifié", color: "bg-amber-50 text-amber-800 ring-amber-200" },
  PERMIS_OBTENU: { label: "Permis obtenu", color: "bg-success-light text-emerald-700 ring-emerald-200" },
  ABANDONNE: { label: "Abandonné", color: "bg-danger-light text-danger ring-red-200" },
};

const EMPTY = { firstName: "", lastName: "", phone: "", cin: "", gender: "MALE", permitType: "B", status: "CODE_EN_COURS", totalFee: "3500" };

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);

  useEffect(() => { fetchCandidates(); }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error();
      setCandidates(await res.json());
    } catch {
      setError("Impossible de charger les candidats.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(c: Candidate) {
    setForm({
      firstName: c.firstName, lastName: c.lastName, phone: c.phone,
      cin: c.cin || "", gender: c.gender || "MALE", permitType: c.permitType,
      status: c.status, totalFee: String(c.totalFee),
    });
    setEditingId(c.id);
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch(editingId ? `/api/candidates/${editingId}` : "/api/candidates", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, totalFee: parseFloat(form.totalFee) }),
    });
    if (res.ok) {
      closeForm();
      fetchCandidates();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleDelete(c: Candidate) {
    if (!confirm(`Supprimer ${c.firstName} ${c.lastName} ?\nCela supprime aussi ses paiements, séances et heures de conduite.`)) return;
    const res = await fetch(`/api/candidates/${c.id}`, { method: "DELETE" });
    if (res.ok) fetchCandidates();
    else setError("Erreur lors de la suppression.");
  }

  const filtered = candidates.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-base sm:text-sm placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Candidats</h1>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
          <Plus className="w-4 h-4" />
          Nouveau candidat
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="search"
          placeholder="Rechercher par nom ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-base sm:text-sm placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl py-12 px-6 text-center">
          <Users className="w-10 h-10 mx-auto text-muted/40 mb-3" />
          <p className="text-sm text-muted">
            {candidates.length === 0 ? "Aucun candidat. Ajoutez votre premier candidat." : "Aucun résultat."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const paid = c.paymentsSum || 0;
            const remaining = c.totalFee - paid;
            const status = STATUS_LABELS[c.status] || { label: c.status, color: "bg-surface-2 text-muted ring-slate-200" };

            return (
              <div key={c.id} className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-3.5 sm:p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{c.firstName} {c.lastName}</h3>
                  <p className="text-xs text-muted truncate">{c.phone} · Permis {c.permitType}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset ${status.color}`}>{status.label}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-success font-medium">{formatMoney(paid)}</span>
                      <span>/ {formatMoney(c.totalFee)}</span>
                    </span>
                    {remaining > 0 && <span className="text-xs text-danger tabular-nums">Reste: {formatMoney(remaining)}</span>}
                  </div>
                  <div className="mt-2.5 h-1 rounded-full bg-surface-2">
                    <div className="h-1 rounded-full bg-success" style={{ width: `${c.totalFee > 0 ? Math.min(100, (paid / c.totalFee) * 100) : 0}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(c)} aria-label="Modifier" title="Modifier" className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                    <Pencil className="w-6 h-6" />
                  </button>
                  <button onClick={() => handleDelete(c)} aria-label="Supprimer" title="Supprimer" className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors">
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-0 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[85dvh] overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6 animate-[pop_.18s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Modifier le candidat" : "Nouveau candidat"}</h2>
              <button type="button" onClick={closeForm} aria-label="Fermer" className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            {error && (
              <div role="alert" className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3 mb-3">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Prénom</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Nom</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Téléphone</label>
                <input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">CIN</label>
                <input value={form.cin} onChange={(e) => setForm({ ...form, cin: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Sexe</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls}>
                    <option value="MALE">Homme</option>
                    <option value="FEMALE">Femme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Type permis</label>
                  <select value={form.permitType} onChange={(e) => setForm({ ...form, permitType: e.target.value })} className={inputCls}>
                    <option value="A">A — Moto</option>
                    <option value="B">B — Voiture</option>
                    <option value="C">C — Poids lourd</option>
                    <option value="D">D — Transport</option>
                    <option value="EC">EC — Remorque</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Statut</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Frais total (MAD)</label>
                  <input type="number" value={form.totalFee} onChange={(e) => setForm({ ...form, totalFee: e.target.value })} className={inputCls} required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 hover:bg-surface-2 transition">Annuler</button>
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingId ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
