"use client";

import { useState, useEffect, useCallback } from "react";
import { Car, CheckCircle, XCircle, RefreshCw, LogIn, Users } from "lucide-react";

interface AutoEcole {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  isActive: boolean;
  trialEndsAt: string;
  createdAt: string;
  users: { fullName: string; username: string; phone: string | null }[];
  _count: { candidates: number };
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [ecoles, setEcoles] = useState<AutoEcole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEcoles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/siyaqi-ctrl", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthenticated(false);
          setError("Mot de passe incorrect.");
          return;
        }
        throw new Error("Erreur serveur");
      }
      const data = await res.json();
      setEcoles(data);
      setAuthenticated(true);
    } catch {
      setError("Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  }, [secret]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEcoles();
  };

  const handleExtend = async (id: string, days: number) => {
    await fetch("/api/siyaqi-ctrl", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ id, days }),
    });
    fetchEcoles();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/siyaqi-ctrl", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchEcoles();
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("admin_secret");
    if (saved) {
      setSecret(saved);
    }
  }, []);

  useEffect(() => {
    if (secret && !authenticated) {
      const saved = sessionStorage.getItem("admin_secret");
      if (saved === secret) {
        fetchEcoles();
      }
    }
  }, [secret, authenticated, fetchEcoles]);

  const getStatus = (ecole: AutoEcole) => {
    if (!ecole.isActive) return { label: "Désactivé", color: "text-red-600 bg-red-50" };
    const now = new Date();
    const trial = new Date(ecole.trialEndsAt);
    if (trial < now) return { label: "Expiré", color: "text-orange-600 bg-orange-50" };
    const daysLeft = Math.ceil((trial.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 3) return { label: `${daysLeft}j restant`, color: "text-yellow-600 bg-yellow-50" };
    return { label: `${daysLeft}j restant`, color: "text-green-600 bg-green-50" };
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#2563eb] mb-3">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Siyaqi Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Mot de passe admin"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2563eb] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              {loading ? "Chargement..." : "Accéder"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-[#2563eb]" />
            <h1 className="text-lg font-bold">Siyaqi Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{ecoles.length} auto-école(s)</span>
            <button
              onClick={fetchEcoles}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {ecoles.map((ecole) => {
          const status = getStatus(ecole);
          const gerant = ecole.users[0];
          return (
            <div key={ecole.id} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-900">{ecole.name}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {ecole.city} • Inscrit le {new Date(ecole.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {ecole._count.candidates} candidat(s)
                </div>
              </div>

              {gerant && (
                <div className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-3">
                  <span className="font-medium">Gérant:</span> {gerant.fullName} ({gerant.username})
                  {gerant.phone && <span> • {gerant.phone}</span>}
                </div>
              )}

              <div className="text-xs text-gray-400 mb-3">
                Expire le: {new Date(ecole.trialEndsAt).toLocaleDateString("fr-FR")} à {new Date(ecole.trialEndsAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExtend(ecole.id, 30)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-[#2563eb] hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  +30 jours
                </button>
                <button
                  onClick={() => handleExtend(ecole.id, 90)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2563eb] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  +90 jours
                </button>
                <button
                  onClick={() => handleExtend(ecole.id, 365)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2563eb] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  +1 an
                </button>
                <button
                  onClick={() => handleToggleActive(ecole.id, ecole.isActive)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    ecole.isActive
                      ? "text-red-600 bg-red-50 hover:bg-red-100"
                      : "text-green-600 bg-green-50 hover:bg-green-100"
                  }`}
                >
                  {ecole.isActive ? (
                    <>
                      <XCircle className="w-3.5 h-3.5" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Réactiver
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {ecoles.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            Aucune auto-école inscrite.
          </div>
        )}
      </main>
    </div>
  );
}
