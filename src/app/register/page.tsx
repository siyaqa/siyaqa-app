"use client";

import { useState, useEffect } from "react";
import { Car, MailCheck } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    city: "",
    fullName: "",
    username: "",
    email: "",
    password: "",
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2563eb] mb-4">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Vérifiez votre email</h1>
            <p className="text-sm text-gray-500 mb-4">
              Un email de confirmation a été envoyé à <b>{form.email}</b>.
              Ouvrez-le et cliquez sur le lien pour activer votre compte.
            </p>
            <p className="text-xs text-gray-400">
              Pensez à vérifier vos dossiers Spam / Promotions.
            </p>
          </div>
          <p className="text-center text-sm text-[#64748b] mt-4">
            <Link href="/login" className="text-[#2563eb] font-medium hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2563eb] mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Siyaqi</h1>
          <p className="text-[#64748b] mt-1">Créez votre compte auto-école</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

          <Field label="Nom de l'auto-école" name="name" value={form.name} onChange={handleChange} placeholder="Auto-école Excellence" required />
          <Field label="Ville" name="city" value={form.city} onChange={handleChange} placeholder="Casablanca" required />
          <Field label="Votre nom complet" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Ahmed Benali" required />
          <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" required />
          <Field label="Nom d'utilisateur" name="username" value={form.username} onChange={handleChange} placeholder="ahmed.benali" required />
          <Field label="Mot de passe (min. 8 caractères)" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
          <Field label="Téléphone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="0600000000" />

          <button type="submit" disabled={loading}
            className="w-full bg-[#2563eb] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>

          <p className="text-center text-sm text-[#64748b]">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-[#2563eb] font-medium hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
      />
    </div>
  );
}
