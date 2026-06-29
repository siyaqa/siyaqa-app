"use client";

import { useEffect, useState } from "react";
import { Plus, Car, Clock } from "lucide-react";

interface DrivingHour {
  id: string;
  date: string;
  duration: number;
  note: string | null;
  candidate: { firstName: string; lastName: string };
  moniteur: { fullName: string };
}

interface CandidateOption { id: string; firstName: string; lastName: string }
interface MoniteurOption { id: string; fullName: string }

export default function DrivingPage() {
  const [hours, setHours] = useState<DrivingHour[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [moniteurs, setMoniteurs] = useState<MoniteurOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    candidateId: "",
    moniteurId: "",
    date: new Date().toISOString().split("T")[0],
    duration: "60",
    note: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/driving-hours").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/candidates").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/moniteurs").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([h, c, m]) => {
      setHours(h);
      setCandidates(c);
      setMoniteurs(m);
    }).catch(() => {
      setError("Impossible de charger les données.");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const duration = parseInt(form.duration);
    if (duration <= 0) {
      setError("La durée doit être supérieure à 0.");
      return;
    }
    const res = await fetch("/api/driving-hours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, duration }),
    });
    if (res.ok) {
      setShowForm(false);
      const updated = await fetch("/api/driving-hours").then((r) => r.json());
      setHours(updated);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'ajout.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Heures de conduite</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter heure
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Chargement...</div>
      ) : hours.length === 0 ? (
        <div className="text-center py-10 text-muted">Aucune heure de conduite enregistrée</div>
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
                  <p className="text-xs text-muted">
                    {new Date(h.date).toLocaleDateString("fr-MA")} · {h.moniteur.fullName}
                    {h.note && ` · ${h.note}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-muted" />
                {h.duration} min
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nouvelle heure de conduite</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Candidat</label>
                <select value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Choisir</option>
                  {candidates.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Moniteur</label>
                <select value={form.moniteurId} onChange={(e) => setForm({ ...form, moniteurId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Choisir</option>
                  {moniteurs.map((m) => <option key={m.id} value={m.id}>{m.fullName}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Durée (min)</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
