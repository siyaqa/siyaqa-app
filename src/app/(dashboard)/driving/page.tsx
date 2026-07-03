"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Car, Clock, User, Filter, X, Pencil, Trash2 } from "lucide-react";

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
  const inputCls = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Heures de conduite</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors flex-shrink-0 whitespace-nowrap">
          <Plus className="w-4 h-4 flex-shrink-0" />
          Ajouter heure
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-card rounded-2xl p-3 border border-border flex flex-wrap items-center gap-2">
        <Filter className="w-4 h-4 text-muted flex-shrink-0" />
        <select value={filters.candidateId} onChange={(e) => setFilters({ ...filters, candidateId: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
          <option value="">Tous les candidats</option>
          {candidates.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
        </select>
        {moniteurs.length > 0 && (
          <select value={filters.moniteurId} onChange={(e) => setFilters({ ...filters, moniteurId: e.target.value })} className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">Tous les moniteurs</option>
            {moniteurs.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
          </select>
        )}
        <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} title="Du" className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} title="Au" className="px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
        {filtersActive && (
          <button onClick={() => setFilters(EMPTY_FILTERS)} className="inline-flex items-center gap-1 text-xs text-muted hover:text-gray-700 px-2 py-2">
            <X className="w-3.5 h-3.5" /> Réinitialiser
          </button>
        )}
      </div>

      {!loading && hours.length > 0 && (
        <p className="text-xs text-muted px-1">
          {hours.length} séance(s) · Total : <b>{Math.floor(totalMin / 60)}h {totalMin % 60}min</b>
        </p>
      )}

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-muted">Chargement...</div>
      ) : hours.length === 0 ? (
        <div className="text-center py-10 text-muted">
          {filtersActive ? "Aucune heure pour ces filtres" : "Aucune heure de conduite enregistrée"}
        </div>
      ) : (
        <div className="space-y-2">
          {hours.map((h) => (
            <div key={h.id} className="bg-card rounded-2xl p-4 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Car className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">{h.candidate.firstName} {h.candidate.lastName}</p>
                  <p className="text-xs text-muted flex items-center gap-1.5 flex-wrap">
                    <span>{new Date(h.date).toLocaleDateString("fr-MA")}</span>
                    <span>·</span>
                    <span className={`inline-flex items-center gap-1 ${h.moniteur ? "text-gray-600" : "text-gray-400 italic"}`}>
                      <User className="w-3 h-3" />
                      {h.moniteur ? h.moniteur.fullName : "Sans moniteur"}
                    </span>
                    {h.note && (<><span>·</span><span>{h.note}</span></>)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted" />{h.duration} min
                </span>
                <button onClick={() => openEdit(h)} title="Modifier" className="text-gray-400 hover:text-gray-700">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(h)} title="Supprimer" className="text-gray-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editing ? "Modifier l'heure de conduite" : "Nouvelle heure de conduite"}</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              {editing ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Candidat</label>
                  <p className="px-3 py-2 rounded-lg bg-gray-50 border border-border text-sm text-gray-600">
                    {editing.candidate.firstName} {editing.candidate.lastName}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Candidat</label>
                  <select value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })} className={inputCls} required>
                    <option value="">Choisir</option>
                    {candidates.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Moniteur (optionnel)</label>
                <select value={form.moniteurId} onChange={(e) => setForm({ ...form, moniteurId: e.target.value })} className={inputCls}>
                  <option value="">Aucun</option>
                  {moniteurs.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Durée (min)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className={inputCls} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover">
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
