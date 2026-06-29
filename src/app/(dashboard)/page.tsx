"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, Calendar, AlertCircle } from "lucide-react";
import { formatMoney } from "@/lib/utils";

interface DashboardStats {
  totalCandidates: number;
  activeCandidates: number;
  totalRevenue: number;
  pendingPayments: number;
  todaySessions: number;
  recentPayments: {
    id: string;
    amount: number;
    paidAt: string;
    candidate: { firstName: string; lastName: string };
  }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Erreur serveur");
        return r.json();
      })
      .then(setStats)
      .catch(() => setError("Impossible de charger les données."));
  }, []);

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-muted">Chargement...</div>
      </div>
    );
  }

  const cards = [
    {
      label: "Candidats actifs",
      value: stats.activeCandidates,
      total: stats.totalCandidates,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Revenus totaux",
      value: formatMoney(stats.totalRevenue),
      icon: CreditCard,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Impayés",
      value: formatMoney(stats.pendingPayments),
      icon: AlertCircle,
      color: stats.pendingPayments > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50",
    },
    {
      label: "Séances aujourd'hui",
      value: stats.todaySessions,
      icon: Calendar,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-card rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold">{card.value}</p>
                <p className="text-xs text-muted">{card.label}</p>
                {"total" in card && card.total !== undefined && (
                  <p className="text-xs text-muted">/ {card.total} total</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent payments */}
      <div>
        <h2 className="text-sm font-semibold text-muted mb-3">Derniers paiements</h2>
        <div className="bg-card rounded-2xl border border-border divide-y divide-border">
          {stats.recentPayments.length === 0 ? (
            <p className="p-4 text-sm text-muted text-center">Aucun paiement encore</p>
          ) : (
            stats.recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium text-sm">
                    {p.candidate.firstName} {p.candidate.lastName}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(p.paidAt).toLocaleDateString("fr-MA")}
                  </p>
                </div>
                <span className="font-semibold text-green-600">
                  +{formatMoney(p.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
