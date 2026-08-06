"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, Calendar, AlertCircle, Gift, Copy, Check } from "lucide-react";
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
  referralCode: string | null;
  referralRewardsGiven: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [copiedSlot, setCopiedSlot] = useState<number | null>(null);

  const referralLink =
    stats?.referralCode && typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${stats.referralCode}`
      : "";

  const copySlot = (i: number) => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedSlot(i);
    setTimeout(() => setCopiedSlot(null), 2000);
  };

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
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <div
          role="alert"
          className="flex items-start gap-2 bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[110px] rounded-2xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
        <div>
          <div className="h-4 w-32 rounded bg-surface-2 animate-pulse mb-3" />
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[72px] rounded-2xl bg-card border border-border animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Candidats actifs",
      value: stats.activeCandidates,
      total: stats.totalCandidates,
      icon: Users,
      color: "bg-primary-light text-primary",
      valueClass: "",
    },
    {
      label: "Revenus totaux",
      value: formatMoney(stats.totalRevenue),
      icon: CreditCard,
      color: "bg-success-light text-success",
      valueClass: "",
    },
    {
      label: "Impayés",
      value: formatMoney(stats.pendingPayments),
      icon: AlertCircle,
      color: stats.pendingPayments > 0 ? "bg-danger-light text-danger" : "bg-success-light text-success",
      valueClass: stats.pendingPayments > 0 ? "text-danger" : "",
    },
    {
      label: "Séances aujourd'hui",
      value: stats.todaySessions,
      icon: Calendar,
      color: "bg-primary-light text-primary",
      valueClass: "",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:shadow-md hover:border-slate-300 transition-shadow p-4"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-muted">{card.label}</p>
              <div className={`size-9 rounded-xl grid place-items-center shrink-0 ${card.color}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight whitespace-nowrap ${card.valueClass}`}>
              {card.value}
            </p>
            <p className="text-xs text-muted tabular-nums">
              {"total" in card && card.total !== undefined ? (
                <>/ {card.total} total</>
              ) : (
                "\u00A0"
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Recent payments */}
      <div>
        <h2 className="text-sm font-semibold text-muted mb-3">Derniers paiements</h2>
        {stats.recentPayments.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl py-12 px-6 text-center">
            <CreditCard className="w-10 h-10 mx-auto text-muted/40 mb-3" />
            <p className="text-sm text-muted">Aucun paiement encore</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] divide-y divide-border">
            {stats.recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">
                    {p.candidate.firstName} {p.candidate.lastName}
                  </p>
                  <p className="text-xs text-muted tabular-nums">
                    {new Date(p.paidAt).toLocaleDateString("fr-MA")}
                  </p>
                </div>
                <span className="font-semibold text-success tabular-nums shrink-0">
                  +{formatMoney(p.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parrainage — 2 invitations ; disparaît quand les 2 sont utilisées */}
      {stats.referralCode && stats.referralRewardsGiven < 2 && (
        <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="size-9 rounded-xl grid place-items-center shrink-0 bg-primary-light text-primary">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Parrainez, gagnez des jours gratuits</h2>
              <p className="text-xs text-muted tabular-nums">
                +7 jours par auto-école parrainée · il vous reste{" "}
                {2 - stats.referralRewardsGiven} invitation
                {2 - stats.referralRewardsGiven > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {[0, 1].map((i) =>
              i < stats.referralRewardsGiven ? (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-success-light px-3 py-2 text-xs text-emerald-700 opacity-70"
                >
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>Invitation {i + 1} — réussie (+7 jours) 🎉</span>
                </div>
              ) : (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-16 flex-shrink-0">Lien {i + 1}</span>
                  <input
                    readOnly
                    value={referralLink}
                    className="flex-1 min-w-0 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs text-muted truncate"
                  />
                  <button
                    onClick={() => copySlot(i)}
                    className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors flex-shrink-0 whitespace-nowrap"
                  >
                    {copiedSlot === i ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copié
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copier
                      </>
                    )}
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
