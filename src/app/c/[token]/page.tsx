import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Car, CreditCard, Calendar, Clock, CheckCircle } from "lucide-react";

export default async function CandidatePortal({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { publicToken: token },
    include: {
      autoEcole: { select: { name: true, city: true } },
      payments: { orderBy: { paidAt: "desc" } },
      sessions: {
        orderBy: { date: "desc" },
        take: 10,
        include: { moniteur: { select: { fullName: true } } },
      },
      drivingHours: {
        orderBy: { date: "desc" },
        include: { moniteur: { select: { fullName: true } } },
      },
    },
  });

  if (!candidate) notFound();

  const totalPaid = candidate.payments.reduce((s, p) => s + p.amount, 0);
  const remaining = candidate.totalFee - totalPaid;
  const totalHours = candidate.drivingHours.reduce((s, h) => s + h.duration, 0);

  // Rendu pur : garde NaN + formatage minutes
  const pct = candidate.totalFee > 0 ? Math.min(100, (totalPaid / candidate.totalFee) * 100) : 0;
  const formatDuration = (min: number) =>
    min >= 60 ? `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}` : `${min} min`;

  const statusLabels: Record<string, { label: string; color: string }> = {
    CODE_EN_COURS: { label: "Code en cours", color: "bg-blue-100 text-blue-700" },
    CODE_REUSSI: { label: "Code réussi", color: "bg-indigo-100 text-indigo-700" },
    CONDUITE_EN_COURS: { label: "Conduite en cours", color: "bg-yellow-100 text-yellow-700" },
    EXAMEN_PLANIFIE: { label: "Examen planifié", color: "bg-purple-100 text-purple-700" },
    PERMIS_OBTENU: { label: "Permis obtenu !", color: "bg-green-100 text-green-700" },
    ABANDONNE: { label: "Abandonné", color: "bg-red-100 text-red-700" },
  };

  const status = statusLabels[candidate.status] || { label: candidate.status, color: "bg-gray-100" };

  return (
    <div className="min-h-screen bg-background">
      {/* Header — bande de marque + école mise en valeur */}
      <header className="bg-card border-t-4 border-t-primary border-b border-b-border px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base truncate">{candidate.autoEcole.name}</p>
            <p className="text-xs text-muted">{candidate.autoEcole.city}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Candidate info */}
        <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-4">
          <h1 className="text-2xl font-bold tracking-tight">{candidate.firstName} {candidate.lastName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
              {status.label}
            </span>
            <span className="text-xs text-muted">Permis {candidate.permitType}</span>
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-muted" />
            <h2 className="font-semibold text-sm">Paiements</h2>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-surface-2 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-success rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-success font-medium tabular-nums">{totalPaid.toLocaleString()} MAD payé</span>
            {remaining > 0 ? (
              <span className="text-danger tabular-nums">{remaining.toLocaleString()} MAD restant</span>
            ) : (
              <span className="text-success flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Soldé
              </span>
            )}
          </div>

          {/* Payment history */}
          {candidate.payments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              {candidate.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted truncate">
                    {new Date(p.paidAt).toLocaleDateString("fr-MA")}
                    {p.note && ` · ${p.note}`}
                  </span>
                  <span className="font-medium text-success tabular-nums shrink-0">+{p.amount.toLocaleString()} MAD</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Driving hours */}
        <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted" />
              <h2 className="font-semibold text-sm">Heures de conduite</h2>
            </div>
            <span className="text-sm font-bold text-warning tabular-nums">{formatDuration(totalHours)}</span>
          </div>
          {candidate.drivingHours.length === 0 ? (
            <p className="text-sm text-muted">Pas encore d&apos;heures de conduite</p>
          ) : (
            <div className="space-y-2">
              {candidate.drivingHours.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted truncate">
                    {new Date(h.date).toLocaleDateString("fr-MA")}
                    {h.moniteur && ` · ${h.moniteur.fullName}`}
                  </span>
                  <span className="font-medium tabular-nums shrink-0">{formatDuration(h.duration)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted" />
            <h2 className="font-semibold text-sm">Prochaines séances</h2>
          </div>
          {candidate.sessions.filter((s) => !s.completed).length === 0 ? (
            <p className="text-sm text-muted">Aucune séance planifiée</p>
          ) : (
            <div className="space-y-2">
              {candidate.sessions
                .filter((s) => !s.completed)
                .map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted truncate">
                      {new Date(s.date).toLocaleDateString("fr-MA")} · {s.startTime}–{s.endTime}
                      {s.moniteur && ` · ${s.moniteur.fullName}`}
                    </span>
                    <span className={`font-medium shrink-0 ${s.type === "CODE" ? "text-blue-600" : "text-orange-600"}`}>
                      {s.type === "CODE" ? "Code" : "Conduite"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <p className="text-center pt-4">
          <a
            href="https://siyaqi.com"
            className="text-xs text-muted hover:text-primary transition-colors"
          >
            ⚡ {candidate.autoEcole.name} utilise Siyaqi — essai gratuit 30 jours
          </a>
        </p>
      </div>
    </div>
  );
}
