"use client";

import { useEffect, useState } from "react";
import { Plus, CreditCard, Pencil, Trash2, X, AlertCircle } from "lucide-react";
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

const EMPTY = { candidateId: "", amount: "", method: "CASH", note: "" };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/payments").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/candidates").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([p, c]) => { setPayments(p); setCandidates(c); })
      .catch(() => { setError("Impossible de charger les données."); })
      .finally(() => { setLoading(false); });
  }, []);

  async function refetchPayments() {
    const updated = await fetch("/api/payments").then((r) => r.json());
    setPayments(updated);
  }

  function openCreate() { setForm(EMPTY); setEditing(null); setError(""); setShowForm(true); }
  function openEdit(p: Payment) {
    setForm({ candidateId: p.candidate.id, amount: String(p.amount), method: p.method, note: p.note || "" });
    setEditing(p);
    setError("");
    setShowForm(true);
  }
  function closeForm() { setShowForm(false); setEditing(null); setForm(EMPTY); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = parseFloat(form.amount);
    if (amount <= 0) { setError("Le montant doit être supérieur à 0."); return; }
    const res = editing
      ? await fetch(`/api/payments/${editing.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, method: form.method, note: form.note }),
        })
      : await fetch("/api/payments", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, amount }),
        });
    if (res.ok) {
      closeForm();
      refetchPayments();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de l'enregistrement.");
    }
  }

  async function handleDelete(p: Payment) {
    if (!confirm(`Supprimer ce paiement de ${formatMoney(p.amount)} (${p.candidate.firstName} ${p.candidate.lastName}) ?`)) return;
    const res = await fetch(`/api/payments/${p.id}`, { method: "DELETE" });
    if (res.ok) refetchPayments();
    else setError("Erreur lors de la suppression.");
  }

  const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-base sm:text-sm placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Paiements</h1>
        <button onClick={openCreate} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
          <Plus className="w-4 h-4" />
          Nouveau paiement
        </button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Payments list */}
      {loading ? (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
          <div className="h-[72px] rounded-2xl bg-card border border-border animate-pulse" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-2xl py-12 px-6 text-center">
          <CreditCard className="w-10 h-10 mx-auto text-muted/40 mb-3" />
          <p className="text-sm text-muted">Aucun paiement enregistré</p>
        </div>
      ) : (
        <div className="space-y-2">
          {payments.map((p) => (
            <div key={p.id} className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-3.5 sm:p-4 flex items-center gap-3">
              <div className="size-9 rounded-xl grid place-items-center shrink-0 bg-success-light text-success">
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.candidate.firstName} {p.candidate.lastName}</p>
                <p className="text-xs text-muted truncate">
                  {new Date(p.paidAt).toLocaleDateString("fr-MA")}
                  {p.note && ` · ${p.note}`}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ring-1 ring-inset bg-surface-2 text-muted ring-slate-200">
                  {p.method === "CASH" ? "Espèces" : p.method === "VIREMENT" ? "Virement" : "Chèque"}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-semibold text-success tabular-nums">+{formatMoney(p.amount)}</span>
                <button onClick={() => openEdit(p)} aria-label="Modifier" title="Modifier" className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors">
                  <Pencil className="w-6 h-6" />
                </button>
                <button onClick={() => handleDelete(p)} aria-label="Supprimer" title="Supprimer" className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors">
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
              <h2 className="text-lg font-bold">{editing ? "Modifier le paiement" : "Nouveau paiement"}</h2>
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
                    <option value="">Choisir un candidat</option>
                    {candidates.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} — reste {formatMoney(c.totalFee - (c.paymentsSum || 0))}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Montant (MAD)</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputCls} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Méthode</label>
                <select value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} className={inputCls}>
                  <option value="CASH">Espèces</option>
                  <option value="VIREMENT">Virement</option>
                  <option value="CHEQUE">Chèque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-1">Note (optionnel)</label>
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 hover:bg-surface-2 transition">Annuler</button>
                <button type="submit" className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
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
