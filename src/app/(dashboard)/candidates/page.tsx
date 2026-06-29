"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Eye, CreditCard, ExternalLink } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  cin: string | null;
  permitType: string;
  status: string;
  totalFee: number;
  publicToken: string;
  createdAt: string;
  _count?: { payments: number };
  paymentsSum?: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  CODE_EN_COURS: { label: "Code en cours", color: "bg-blue-100 text-blue-700" },
  CODE_REUSSI: { label: "Code réussi", color: "bg-indigo-100 text-indigo-700" },
  CONDUITE_EN_COURS: { label: "Conduite en cours", color: "bg-yellow-100 text-yellow-700" },
  EXAMEN_PLANIFIE: { label: "Examen planifié", color: "bg-purple-100 text-purple-700" },
  PERMIS_OBTENU: { label: "Permis obtenu", color: "bg-green-100 text-green-700" },
  ABANDONNE: { label: "Abandonné", color: "bg-red-100 text-red-700" },
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    cin: "",
    gender: "MALE",
    permitType: "B",
    totalFee: "3500",
  });

  useEffect(() => {
    fetchCandidates();
  }, []);

  async function fetchCandidates() {
    try {
      const res = await fetch("/api/candidates");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCandidates(data);
    } catch {
      setError("Impossible de charger les candidats.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, totalFee: parseFloat(form.totalFee) }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ firstName: "", lastName: "", phone: "", cin: "", gender: "MALE", permitType: "B", totalFee: "3500" });
      fetchCandidates();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'ajout du candidat.");
    }
  }

  const filtered = candidates.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Candidats</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau candidat
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-10 text-muted">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-muted">
          {candidates.length === 0 ? "Aucun candidat. Ajoutez votre premier candidat." : "Aucun résultat."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => {
            const paid = c.paymentsSum || 0;
            const remaining = c.totalFee - paid;
            const status = STATUS_LABELS[c.status] || { label: c.status, color: "bg-gray-100 text-gray-700" };

            return (
              <div key={c.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {c.firstName} {c.lastName}
                    </h3>
                    <p className="text-sm text-muted">{c.phone} · Permis {c.permitType}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      <CreditCard className="w-3.5 h-3.5 text-muted" />
                      <span className="text-green-600 font-medium">{formatMoney(paid)}</span>
                      <span className="text-muted">/ {formatMoney(c.totalFee)}</span>
                    </div>
                    {remaining > 0 && (
                      <p className="text-xs text-red-500 mt-1">Reste: {formatMoney(remaining)}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/c/${c.publicToken}`)}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Copier lien candidat
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Nouveau candidat</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Prénom</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nom</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Téléphone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CIN</label>
                <input
                  value={form.cin}
                  onChange={(e) => setForm({ ...form, cin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Sexe</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="MALE">Homme</option>
                    <option value="FEMALE">Femme</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type permis</label>
                  <select
                    value={form.permitType}
                    onChange={(e) => setForm({ ...form, permitType: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="A">A — Moto</option>
                    <option value="B">B — Voiture</option>
                    <option value="C">C — Poids lourd</option>
                    <option value="D">D — Transport</option>
                    <option value="EC">EC — Remorque</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frais total (MAD)</label>
                <input
                  type="number"
                  value={form.totalFee}
                  onChange={(e) => setForm({ ...form, totalFee: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
