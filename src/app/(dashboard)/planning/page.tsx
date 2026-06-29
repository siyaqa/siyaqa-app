"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, Filter, X, Calendar, Clock } from "lucide-react";

interface Session {
  id: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  candidate: { firstName: string; lastName: string };
  moniteur: { fullName: string } | null;
}

interface CandidateOption { id: string; firstName: string; lastName: string }
interface MoniteurOption { id: string; fullName: string }

type ViewMode = "month" | "week";

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function toDateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  const result = new Date(d);
  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Fill from Monday of first week
  const start = startOfWeek(firstDay);
  const current = new Date(start);

  // Always fill 6 weeks (42 days) for consistent grid
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return { days, firstDay, lastDay };
}

function getWeekDays(baseDate: Date): Date[] {
  const monday = startOfWeek(baseDate);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function PlanningPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [candidates, setCandidates] = useState<CandidateOption[]>([]);
  const [moniteurs, setMoniteurs] = useState<MoniteurOption[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Calendar state
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterMoniteur, setFilterMoniteur] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const [form, setForm] = useState({
    type: "CONDUITE",
    date: toDateStr(new Date()),
    startTime: "08:00",
    endTime: "09:00",
    candidateId: "",
    moniteurId: "",
  });

  // Calculate date range for API
  const dateRange = useMemo(() => {
    if (viewMode === "month") {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const { days } = getMonthDays(year, month);
      return { from: toDateStr(days[0]), to: toDateStr(new Date(days[days.length - 1].getTime() + 86400000)) };
    } else {
      const weekDays = getWeekDays(currentDate);
      return { from: toDateStr(weekDays[0]), to: toDateStr(new Date(weekDays[6].getTime() + 86400000)) };
    }
  }, [currentDate, viewMode]);

  const fetchSessions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ from: dateRange.from, to: dateRange.to });
    if (filterType) params.set("type", filterType);
    if (filterMoniteur) params.set("moniteurId", filterMoniteur);

    Promise.all([
      fetch(`/api/sessions?${params}`).then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/candidates").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch("/api/moniteurs").then((r) => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([s, c, m]) => {
      setSessions(s);
      setCandidates(c);
      setMoniteurs(m);
    }).catch(() => {
      setError("Impossible de charger les données.");
    }).finally(() => {
      setLoading(false);
    });
  }, [dateRange, filterType, filterMoniteur]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map: Record<string, Session[]> = {};
    for (const s of sessions) {
      const key = s.date.split("T")[0];
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    // Sort each day's sessions by startTime
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [sessions]);

  // Apply client-side status filter
  const filteredSessionsByDate = useMemo(() => {
    if (!filterStatus) return sessionsByDate;
    const map: Record<string, Session[]> = {};
    for (const [key, daysSessions] of Object.entries(sessionsByDate)) {
      const filtered = daysSessions.filter((s) => {
        if (filterStatus === "completed") return s.completed;
        if (filterStatus === "pending") return !s.completed;
        return true;
      });
      if (filtered.length > 0) map[key] = filtered;
    }
    return map;
  }, [sessionsByDate, filterStatus]);

  const activeFilterCount = [filterType, filterMoniteur, filterStatus].filter(Boolean).length;

  // Navigation
  function navigate(direction: number) {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + direction);
    } else {
      d.setDate(d.getDate() + direction * 7);
    }
    setCurrentDate(d);
  }

  function goToday() {
    setCurrentDate(new Date());
    setSelectedDay(toDateStr(new Date()));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.endTime <= form.startTime) {
      setError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ ...form, candidateId: "", moniteurId: "" });
      fetchSessions();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erreur lors de la création.");
    }
  }

  function openFormForDate(dateStr: string) {
    setForm((prev) => ({ ...prev, date: dateStr }));
    setShowForm(true);
  }

  const todayStr = toDateStr(new Date());

  // Selected day sessions
  const selectedDaySessions = selectedDay ? (filteredSessionsByDate[selectedDay] || []) : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Planning</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nouvelle séance</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Controls: navigation + view toggle + filters */}
      <div className="bg-card rounded-2xl border border-border p-3 space-y-3">
        {/* Top row: nav + view */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
              Aujourd&apos;hui
            </button>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-sm font-semibold">
            {viewMode === "month"
              ? `${MONTHS_FR[currentDate.getMonth()]} ${currentDate.getFullYear()}`
              : (() => {
                  const week = getWeekDays(currentDate);
                  const f = week[0];
                  const l = week[6];
                  if (f.getMonth() === l.getMonth()) {
                    return `${f.getDate()} — ${l.getDate()} ${MONTHS_FR[f.getMonth()]}`;
                  }
                  return `${f.getDate()} ${MONTHS_FR[f.getMonth()].slice(0, 3)} — ${l.getDate()} ${MONTHS_FR[l.getMonth()].slice(0, 3)}`;
                })()
            }
          </h2>

          <div className="flex items-center gap-2">
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`relative p-2 rounded-lg transition-colors ${showFilters ? "bg-primary/10 text-primary" : "hover:bg-gray-100"}`}
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "month" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
              >
                Mois
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === "week" ? "bg-primary text-white" : "hover:bg-gray-100"}`}
              >
                Semaine
              </button>
            </div>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les types</option>
              <option value="CODE">Code</option>
              <option value="CONDUITE">Conduite</option>
            </select>
            <select
              value={filterMoniteur}
              onChange={(e) => setFilterMoniteur(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les moniteurs</option>
              {moniteurs.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">À venir</option>
              <option value="completed">Terminée</option>
            </select>
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setFilterType(""); setFilterMoniteur(""); setFilterStatus(""); }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Réinitialiser
              </button>
            )}
          </div>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">{error}</div>}

      {loading ? (
        <div className="text-center py-10 text-muted">Chargement...</div>
      ) : viewMode === "month" ? (
        /* ==================== MONTH VIEW ==================== */
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {DAYS_FR.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium text-muted">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {getMonthDays(currentDate.getFullYear(), currentDate.getMonth()).days.map((day, i) => {
              const dateStr = toDateStr(day);
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDay;
              const daySessions = filteredSessionsByDate[dateStr] || [];
              const codeCount = daySessions.filter((s) => s.type === "CODE").length;
              const conduiteCount = daySessions.filter((s) => s.type === "CONDUITE").length;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                  className={`relative min-h-[72px] md:min-h-[90px] p-1.5 border-b border-r border-border text-left transition-colors
                    ${!isCurrentMonth ? "bg-gray-50/50" : "hover:bg-gray-50"}
                    ${isSelected ? "bg-primary/5 ring-2 ring-inset ring-primary" : ""}
                  `}
                >
                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full
                    ${isToday ? "bg-primary text-white font-bold" : ""}
                    ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                  `}>
                    {day.getDate()}
                  </span>

                  {/* Session dots / counts */}
                  {daySessions.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {/* On mobile: dots only */}
                      <div className="flex gap-0.5 md:hidden">
                        {codeCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        {conduiteCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                      </div>
                      {/* On desktop: mini labels */}
                      <div className="hidden md:block space-y-0.5">
                        {codeCount > 0 && (
                          <div className="text-[10px] leading-tight px-1 py-0.5 rounded bg-blue-50 text-blue-700 truncate">
                            {codeCount} Code
                          </div>
                        )}
                        {conduiteCount > 0 && (
                          <div className="text-[10px] leading-tight px-1 py-0.5 rounded bg-orange-50 text-orange-700 truncate">
                            {conduiteCount} Conduite
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* ==================== WEEK VIEW ==================== */
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {getWeekDays(currentDate).map((day, i) => {
            const dateStr = toDateStr(day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDay;
            const daySessions = filteredSessionsByDate[dateStr] || [];

            return (
              <button
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : dateStr)}
                className={`w-full flex items-start gap-3 p-3 border-b border-border last:border-b-0 text-left transition-colors
                  ${isSelected ? "bg-primary/5" : "hover:bg-gray-50"}
                `}
              >
                {/* Day column */}
                <div className="flex flex-col items-center min-w-[44px]">
                  <span className="text-[10px] font-medium text-muted uppercase">{DAYS_FR[i]}</span>
                  <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold
                    ${isToday ? "bg-primary text-white" : "text-gray-700"}
                  `}>
                    {day.getDate()}
                  </span>
                </div>

                {/* Sessions */}
                <div className="flex-1 min-w-0">
                  {daySessions.length === 0 ? (
                    <p className="text-xs text-gray-300 py-2">—</p>
                  ) : (
                    <div className="space-y-1.5">
                      {daySessions.map((s) => (
                        <div
                          key={s.id}
                          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs
                            ${s.type === "CODE" ? "bg-blue-50 text-blue-800" : "bg-orange-50 text-orange-800"}
                            ${s.completed ? "opacity-50" : ""}
                          `}
                        >
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="font-medium">{s.startTime}–{s.endTime}</span>
                          <span className="truncate">{s.candidate.firstName} {s.candidate.lastName}</span>
                          {s.moniteur && <span className="text-[10px] opacity-70 hidden sm:inline">· {s.moniteur.fullName}</span>}
                          {s.completed && <span className="ml-auto text-green-600 font-medium">✓</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Count badge */}
                {daySessions.length > 0 && (
                  <span className="text-xs font-medium text-muted bg-gray-100 rounded-full px-2 py-0.5 flex-shrink-0">
                    {daySessions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected day detail panel */}
      {selectedDay && (
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("fr-MA", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openFormForDate(selectedDay)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Ajouter
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-3.5 h-3.5 text-muted" />
              </button>
            </div>
          </div>

          {selectedDaySessions.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">Aucune séance ce jour</p>
          ) : (
            <div className="space-y-2">
              {selectedDaySessions.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-xl border
                    ${s.type === "CODE"
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-orange-200 bg-orange-50/50"
                    }
                    ${s.completed ? "opacity-60" : ""}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${s.type === "CODE" ? "bg-blue-100" : "bg-orange-100"}`}>
                      <Calendar className={`w-4 h-4 ${s.type === "CODE" ? "text-blue-600" : "text-orange-600"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {s.candidate.firstName} {s.candidate.lastName}
                      </p>
                      <p className="text-xs text-muted">
                        {s.type === "CODE" ? "Code" : "Conduite"} · {s.startTime} — {s.endTime}
                        {s.moniteur && ` · ${s.moniteur.fullName}`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${s.completed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                  `}>
                    {s.completed ? "Terminée" : "À venir"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center justify-center gap-6 py-2">
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          Code: {sessions.filter((s) => s.type === "CODE").length}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          Conduite: {sessions.filter((s) => s.type === "CONDUITE").length}
        </div>
        <div className="text-xs text-muted font-medium">
          Total: {sessions.length}
        </div>
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nouvelle séance</h2>
            {error && <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-3">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="CODE">Code</option>
                  <option value="CONDUITE">Conduite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Début</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fin</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Candidat</label>
                <select value={form.candidateId} onChange={(e) => setForm({ ...form, candidateId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary" required>
                  <option value="">Choisir</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Moniteur</label>
                <select value={form.moniteurId} onChange={(e) => setForm({ ...form, moniteurId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Aucun</option>
                  {moniteurs.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-gray-50">Annuler</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
