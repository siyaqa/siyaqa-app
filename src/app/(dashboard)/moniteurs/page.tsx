"use client";

import { useEffect, useState } from "react";
import { Plus, UserCog, Pencil, Trash2, X, AlertCircle } from "lucide-react";

interface Moniteur {
  id: string;
  fullName: string;
  phone: string | null;
  isActive: boolean;
}

export default function MoniteursPage() {
  const [moniteurs, setMoniteurs] = useState<Moniteur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "" });

  useEffect(() => { fetchMoniteurs(); }, []);

  async function fetchMoniteurs() {
    try {
      const res = await fetch("/api/moniteurs");
      if (!res.ok) throw new Error();
      setMoniteurs(await res.json());
    } catch {
      setError("Impossible de charger les moniteurs.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setForm({ fullName: "", phone: "" });
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(m: Moniteur) {
    setForm({ fullName: m.fullName, phone: m.phone || "" });
    setEditingId(m.id);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await fetch(editingId ? `/api/moniteurs/${editingId}` : "/api/moniteurs", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setShowForm(false);
      setEditingId(null);
      fetchMoniteurs();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleDelete(m: Moniteur) {
    if (!confirm(`Supprimer le moniteur ${m.fullName} ?\nSes heures de conduite sont conservées (sans moniteur).`)) return;
    const res = await fetch(`/api/moniteurs/${m.id}`, { method: "DELETE" });
    if (res.ok) fetchMoniteurs();
    else setError("Erreur lors de la suppression.");
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-base sm:text-sm placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Moniteurs</h1>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
          <Plus className="w-4 h-4" />
          Ajouter moniteur
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
        </div>
      ) : moniteurs.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl py-12 px-6 text-center">
          <UserCog className="w-10 h-10 mx-auto text-muted/40 mb-3" />
          <p className="text-sm text-muted">Aucun moniteur. Ajoutez votre premier moniteur.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {moniteurs.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-3.5 sm:p-4 flex items-center gap-3">
              <div className="size-9 rounded-xl grid place-items-center shrink-0 bg-primary-light text-primary">
                <UserCog className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{m.fullName}</p>
                {m.phone && <p className="text-xs text-muted truncate">{m.phone}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(m)} aria-label="Modifier" title="Modifier" className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                  <Pencil className="w-6 h-6" />
                </button>
                <button onClick={() => handleDelete(m)} aria-label="Supprimer" title="Supprimer" className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-0 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[85dvh] overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6 animate-[pop_.18s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editingId ? "Modifier le moniteur" : "Nouveau moniteur"}</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Fermer" className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
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
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Nom complet</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} required placeholder="Ahmed Benali" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Téléphone (optionnel)</label>
                <input inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0600000000" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 hover:bg-surface-2 transition">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? "..." : editingId ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
