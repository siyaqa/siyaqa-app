"use client";

import { useState, useEffect } from "react";
import { Car, MailCheck, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    city: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [ref, setRef] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Récupère le code de parrainage depuis l'URL (?ref=...)
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("ref");
    if (r) setRef(r);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ref }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }
      setDone(true);
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-600/25 mb-4">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <div className="bg-card rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8 animate-[pop_.18s_ease-out]">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 mb-2">Vérifiez votre email</h1>
            <p className="text-sm text-muted mb-4">
              Un email de confirmation a été envoyé à <b>{form.email}</b>.
              Ouvrez-le et cliquez sur le lien pour activer votre compte.
            </p>
            <p className="text-xs text-muted">
              Pensez à vérifier vos dossiers Spam / Promotions.
            </p>
          </div>
          <p className="text-center text-sm text-muted mt-4">
            <Link href="/login" className="inline-flex py-2.5 text-primary font-medium hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg shadow-indigo-600/25 mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Siyaqi</h1>
          <p className="text-muted mt-1">Créez votre compte auto-école</p>
        </div>

        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-2 bg-success-light text-emerald-700 text-sm font-medium rounded-full px-4 py-1.5">
            <CheckCircle className="w-4 h-4" />
            Essai gratuit 30 jours · Sans carte bancaire
          </span>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8 space-y-4">
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {ref && (
            <div className="bg-primary-light text-primary rounded-xl p-3 text-sm font-medium">
              Code de parrainage appliqué ✓
            </div>
          )}

          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Votre auto-école</p>
          <Field label="Nom de l'auto-école" name="name" value={form.name} onChange={handleChange} placeholder="Auto-école Excellence" autoComplete="organization" required />
          <Field label="Ville" name="city" value={form.city} onChange={handleChange} placeholder="Casablanca" required />

          <p className="text-xs font-semibold uppercase tracking-wide text-muted pt-2">Vos accès</p>
          <Field label="Votre nom complet" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ahmed Benali" required />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" autoComplete="email" required />
          <Field label="Mot de passe (min. 8 caractères)" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" required />
          <Field label="Confirmer le mot de passe" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" required />
          <Field label="Téléphone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="0600000000" autoComplete="tel" />

          <button type="submit" disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-white text-base font-semibold hover:bg-primary-hover shadow-sm shadow-primary/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-muted">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground/80 mb-1">{label}</label>
      <input
        {...props}
        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-base sm:text-sm placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow"
      />
    </div>
  );
}
