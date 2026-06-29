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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Car className="w-6 h-6 text-blue-600" />
          <div>
            <p className="font-bold text-sm">{candidate.autoEcole.name}</p>
            <p className="text-xs text-gray-500">{candidate.autoEcole.city}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Candidate info */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <h1 className="text-lg font-bold">{candidate.firstName} {candidate.lastName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
              {status.label}
            </span>
            <span className="text-xs text-gray-500">Permis {candidate.permitType}</span>
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-sm">Paiements</h2>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalPaid / candidate.totalFee) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-medium">{totalPaid.toLocaleString()} MAD payé</span>
            {remaining > 0 ? (
              <span className="text-red-500">{remaining.toLocaleString()} MAD restant</span>
            ) : (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Soldé
              </span>
            )}
          </div>

          {/* Payment history */}
          {candidate.payments.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              {candidate.payments.map((p) => (
                <div key={p.id} className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {new Date(p.paidAt).toLocaleDateString("fr-MA")}
                    {p.note && ` · ${p.note}`}
                  </span>
                  <span className="font-medium text-green-600">+{p.amount.toLocaleString()} MAD</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Driving hours */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-sm">Heures de conduite</h2>
            </div>
            <span className="text-sm font-bold text-orange-600">{totalHours} min</span>
          </div>
          {candidate.drivingHours.length === 0 ? (
            <p className="text-xs text-gray-400">Pas encore d&apos;heures de conduite</p>
          ) : (
            <div className="space-y-2">
              {candidate.drivingHours.map((h) => (
                <div key={h.id} className="flex justify-between text-xs">
                  <span className="text-gray-500">
                    {new Date(h.date).toLocaleDateString("fr-MA")} · {h.moniteur.fullName}
                  </span>
                  <span className="font-medium">{h.duration} min</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming sessions */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-sm">Prochaines séances</h2>
          </div>
          {candidate.sessions.filter((s) => !s.completed).length === 0 ? (
            <p className="text-xs text-gray-400">Aucune séance planifiée</p>
          ) : (
            <div className="space-y-2">
              {candidate.sessions
                .filter((s) => !s.completed)
                .map((s) => (
                  <div key={s.id} className="flex justify-between text-xs">
                    <span className="text-gray-500">
                      {new Date(s.date).toLocaleDateString("fr-MA")} · {s.startTime}–{s.endTime}
                      {s.moniteur && ` · ${s.moniteur.fullName}`}
                    </span>
                    <span className={`font-medium ${s.type === "CODE" ? "text-blue-600" : "text-orange-600"}`}>
                      {s.type === "CODE" ? "Code" : "Conduite"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">
          Siyaqi — Plateforme de gestion d&apos;auto-école
        </p>
      </div>
    </div>
  );
}
