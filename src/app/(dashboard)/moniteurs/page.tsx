"use client";

import { useEffect, useState } from "react";
import { Plus, UserCog } from "lucide-react";

interface Moniteur {
  id: string;
  fullName: string;
  username: string;
  phone: string | null;
  isActive: boolean;
}

export default function MoniteursPage() {
  const [moniteurs, setMoniteurs] = useState<Moniteur[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", username: "", password: "", phone: "" });

  useEffect(() => {
    fetch("/api/moniteurs")
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => { setMoniteurs(data); })
      .catch(() => { setError("Impossible de charger les moniteurs."); })
      .finally(() => { setLoading(false); });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/moniteurs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ fullName: "", username: "", password: "", phone: "" });
      const updated = await fetch("/api/moniteurs").then((r) => r.json());
      setMoniteurs(updated);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'ajout.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moniteurs</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter moniteur
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted">Chargement...</div>
      ) : moniteurs.length === 0 ? (
        <div className="text-center py-10 text-muted">Aucun moniteur. Ajoutez votre premier moniteur.</div>
      ) : (
        <div className="space-y-2">
          {moniteurs.map((m) => (
            <div key={m.id} className="bg-card rounded-2xl p-4 border border-border flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-50">
                <UserCog className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold">{m.fullName}</p>
                <p className="text-sm text-muted">@{m.username} {m.phone && `· ${m.phone}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nouveau moniteur</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom d&apos;utilisateur</label>
                <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mot de passe</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
