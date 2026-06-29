"use client";

import { useEffect, useState } from "react";
import { Plus, CreditCard } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  method: string;
  note: string | null;
  paidAt: string;
  candidate: { id: string; firstName: string; lastName: string };
}

interface CandidateOption {
  id: string;
  firstName: string;
  lastName: string;
  totalFee: number;
  paymentsSum: number;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ candidateId: "", amount: "", method: "CASH", note: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/payments").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/candidates").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([p, c]) => {
      setPayments(p);
      setCandidates(c);
    }).catch(() => {
      setError("Impossible de charger les données.");
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = parseFloat(form.amount);
    if (amount <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return;
    }
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ candidateId: "", amount: "", method: "CASH", note: "" });
      const updated = await fetch("/api/payments").then((r) => r.json());
      setPayments(updated);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement.");
    }
  }

  if (loading) {
    return <div className="text-center py-10 text-muted">Chargement...</div>;
  }

  if (error && payments.length === 0) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouveau paiement
        </button>
      </div>

      {/* Payments list */}
      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {payments.length === 0 ? (
          <p className="p-6 text-center text-muted">Aucun paiement enregistré</p>
        ) : (
          payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {p.candidate.firstName} {p.candidate.lastName}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(p.paidAt).toLocaleDateString("fr-MA")} ·{" "}
                    {p.method === "CASH" ? "Espèces" : p.method === "VIREMENT" ? "Virement" : "Chèque"}
                    {p.note && ` · ${p.note}`}
                  </p>
                </div>
              </div>
              <span className="font-semibold text-green-600">+{formatMoney(p.amount)}</span>
            </div>
          ))
        )}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nouveau paiement</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Candidat</label>
                <select
                  value={form.candidateId}
                  onChange={(e) => setForm({ ...form, candidateId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Choisir un candidat</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} — reste{" "}
                      {formatMoney(c.totalFee - (c.paymentsSum || 0))}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Montant (MAD)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Méthode</label>
                <select
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="CASH">Espèces</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Note (optionnel)</label>
                <input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
