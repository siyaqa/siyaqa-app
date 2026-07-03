"use client";

import { useEffect, useState } from "react";
import { Plus, UserCog, Pencil, Trash2 } from "lucide-react";

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

  const inputCls = "w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Moniteurs</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors">
          <Plus className="w-4 h-4" />
          Ajouter moniteur
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

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
              <div className="flex-1">
                <p className="font-semibold">{m.fullName}</p>
                {m.phone && <p className="text-sm text-muted">{m.phone}</p>}
              </div>
              <button onClick={() => openEdit(m)} title="Modifier" className="text-gray-400 hover:text-gray-700 p-1">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(m)} title="Supprimer" className="text-gray-400 hover:text-red-600 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editingId ? "Modifier le moniteur" : "Nouveau moniteur"}</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nom complet</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} required placeholder="Ahmed Benali" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone (optionnel)</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0600000000" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50">
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
