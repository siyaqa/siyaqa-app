"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Car, User, Filter, X, Pencil, Trash2, AlertCircle } from "lucide-react";

interface DrivingHour {
  id: string;
  date: string;
  duration: number;
  note: string | null;
  moniteurId: string | null;
  candidate: { firstName: string; lastName: string };
  moniteur: { fullName: string } | null;
}

interface CandidateOption { id: string; firstName: string; lastName: string }
interface MoniteurOption { id: string; fullName: string }

const EMPTY_FILTERS = { candidateId: "", moniteurId: "", from: "", to: "" };
const emptyForm = () => ({ candidateId: "", moniteurId: "", date: new Date().toISOString().split("T")[0], duration: "60", note: "" });

export default function DrivingPage() {
  const [hours, setHours] = useState<DrivingHour[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [moniteurs, setMoniteurs] = useState<MoniteurOption[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DrivingHour | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm());

  const fetchHours = useCallback(async () => {
    const p = new URLSearchParams();
    if (filters.candidateId) p.set("candidateId", filters.candidateId);
    if (filters.moniteurId) p.set("moniteurId", filters.moniteurId);
    if (filters.from) p.set("from", filters.from);
    if (filters.to) p.set("to", filters.to);
    const res = await fetch(`/api/driving-hours?${p.toString()}`);
    if (res.ok) setHours(await res.json());
    else setError("Impossible de charger les données.");
  }, [filters]);

  useEffect(() => {
    Promise.all([
      fetch("/api/candidates").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/moniteurs").then((r) => (r.ok ? r.json() : [])),
    ]).then(([c, m]) => { setCandidates(c); setMoniteurs(m); })
      .catch(() => setError("Impossible de charger les données."));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchHours().finally(() => setLoading(false));
  }, [fetchHours]);

  const filtersActive = !!(filters.candidateId || filters.moniteurId || filters.from || filters.to);
  const totalMin = hours.reduce((s, h) => s + h.duration, 0);
  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-base sm:text-sm placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow";

  function openCreate() { setForm(emptyForm()); setEditing(null); setError(""); setShowForm(true); }
  function openEdit(h: DrivingHour) {
    setForm({ candidateId: "", moniteurId: h.moniteurId || "", date: new Date(h.date).toISOString().split("T")[0], duration: String(h.duration), note: h.note || "" });
    setEditing(h);
    setError("");
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); setForm(emptyForm()); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const duration = parseInt(form.duration);
    if (duration <= 0) { setError("La durée doit être supérieure à 0."); return; }
    const res = editing
      ? await fetch(`/api/driving-hours/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ duration, date: form.date, moniteurId: form.moniteurId || null, note: form.note }),
        })
      : await fetch("/api/driving-hours", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, duration }),
        });
    if (res.ok) { closeForm(); fetchHours(); }
    else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleDelete(h: DrivingHour) {
    if (!confirm(`Supprimer cette heure de ${h.duration} min (${h.candidate.firstName} ${h.candidate.lastName}) ?`)) return;
    const res = await fetch(`/api/driving-hours/${h.id}`, { method: "DELETE" });
    if (res.ok) fetchHours();
    else setError("Erreur lors de la suppression.");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Heures de conduite</h1>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
          <Plus className="w-4 h-4" />
          Ajouter heure
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-3.5 sm:p-4">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          <Filter className="hidden sm:block w-4 h-4 text-muted shrink-0" />
          <select value={filters.candidateId} onChange={(e) => setFilters({ ...filters, candidateId: e.target.value })} className={`${inputCls} sm:w-auto min-w-0`}>
            <option value="">Tous les candidats</option>
            {candidates.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
          </select>
          {moniteurs.length > 0 && (
            <select value={filters.moniteurId} onChange={(e) => setFilters({ ...filters, moniteurId: e.target.value })} className={`${inputCls} sm:w-auto min-w-0`}>
              <option value="">Tous les moniteurs</option>
              {moniteurs.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
            </select>
          )}
          <label className="block min-w-0">
            <span className="block text-[11px] text-muted mb-0.5">Du</span>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} title="Du" className={`${inputCls} sm:w-auto min-w-0`} />
          </label>
          <label className="block min-w-0">
            <span className="block text-[11px] text-muted mb-0.5">Au</span>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} title="Au" className={`${inputCls} sm:w-auto min-w-0`} />
          </label>
          {filtersActive && (
            <button onClick={() => setFilters(EMPTY_FILTERS)} className="col-span-2 sm:col-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 hover:bg-surface-2 transition">
              <X className="w-4 h-4" /> Réinitialiser
            </button>
          )}
        </div>
      </div>

      {!loading && hours.length > 0 && (
        <p className="text-xs text-muted px-1 tabular-nums">
          {hours.length} séance(s) · Total : <b>{Math.floor(totalMin / 60)}h {totalMin % 60}min</b>
        </p>
      )}

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
      ) : hours.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl py-12 px-6 text-center">
          <Car className="w-10 h-10 mx-auto text-muted/40 mb-3" />
          <p className="text-sm text-muted">
            {filtersActive ? "Aucune heure pour ces filtres" : "Aucune heure de conduite enregistrée"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {hours.map((h) => (
            <div key={h.id} className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-3.5 sm:p-4 flex items-center gap-3">
              <div className="size-9 rounded-xl grid place-items-center shrink-0 bg-amber-50 text-amber-600">
                <Car className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{h.candidate.firstName} {h.candidate.lastName}</p>
                <p className="text-xs text-muted truncate">
                  <span>{new Date(h.date).toLocaleDateString("fr-MA")}</span>
                  <span> · </span>
                  <span className={`inline-flex items-center gap-1 ${h.moniteur ? "" : "text-muted/70 italic"}`}>
                    <User className="w-3 h-3" />
                    {h.moniteur ? h.moniteur.fullName : "Sans moniteur"}
                  </span>
                  {h.note && <span> · {h.note}</span>}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-2 tabular-nums">{h.duration} min</span>
                <button onClick={() => openEdit(h)} aria-label="Modifier" title="Modifier" className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                  <Pencil className="w-6 h-6" />
                </button>
                <button onClick={() => handleDelete(h)} aria-label="Supprimer" title="Supprimer" className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-[2px] p-0 sm:p-4">
          <div className="bg-card w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[85dvh] overflow-y-auto overscroll-contain pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:pb-6 animate-[pop_.18s_ease-out]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editing ? "Modifier l'heure de conduite" : "Nouvelle heure de conduite"}</h2>
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
              {editing ? (
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Candidat</label>
                  <p className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-2 text-base sm:text-sm text-muted">
                    {editing.candidate.firstName} {editing.candidate.lastName}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Candidat</label>
                  <select value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })} className={inputCls} required>
                    <option value="">Choisir</option>
                    {candidates.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Moniteur (optionnel)</label>
                <select value={form.moniteurId} onChange={(e) => setForm({ ...form, moniteurId: e.target.value })} className={inputCls}>
                  <option value="">Aucun</option>
                  {moniteurs.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">Durée (min)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Note</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 hover:bg-surface-2 transition">Annuler</button>
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
                  {editing ? "Enregistrer" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
