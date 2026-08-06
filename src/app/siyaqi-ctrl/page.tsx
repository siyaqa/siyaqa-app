"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Car, CheckCircle, XCircle, RefreshCw, LogIn, Users,
  CalendarClock, Search, Filter, TrendingUp, Clock, AlertTriangle, Ban,
  Phone, UserX, Wifi, MessageCircle, X,
} from "lucide-react";

interface AutoEcole {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  isActive: boolean;
  trialEndsAt: string;
  createdAt: string;
  users: {
    fullName: string;
    username: string;
    phone: string | null;
    role: "GERANT" | "MONITEUR";
    lastLoginAt: string | null;
    loginCount: number;
    lastSeenAt: string | null;
  }[];
  _count: { candidates: number };
}

type StatusType = "all" | "active" | "expiring" | "expired" | "disabled" | "never" | "online";

// « En ligne » = ping de présence reçu il y a moins de 2 min (l'app ping toutes les 60 s)
const ONLINE_WINDOW_MS = 2 * 60 * 1000;

function isOnline(u: { lastSeenAt: string | null }) {
  return !!u.lastSeenAt && Date.now() - new Date(u.lastSeenAt).getTime() < ONLINE_WINDOW_MS;
}

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} j`;
  return `le ${new Date(dateStr).toLocaleDateString("fr-FR")}`;
}

// Dernière connexion tous utilisateurs confondus (gérant + moniteurs)
function getLastLogin(ecole: AutoEcole): string | null {
  let last: string | null = null;
  for (const u of ecole.users) {
    if (u.lastLoginAt && (!last || u.lastLoginAt > last)) last = u.lastLoginAt;
  }
  return last;
}

function getStatusInfo(ecole: AutoEcole) {
  // borderClass = bordure gauche de statut, purement présentationnel
  if (!ecole.isActive) return { key: "disabled" as const, label: "Désactivé", color: "text-red-400 bg-red-500/10", barColor: "bg-red-400", percent: 0, borderClass: "border-l-red-500" };
  const now = new Date();
  const trial = new Date(ecole.trialEndsAt);
  if (trial < now) return { key: "expired" as const, label: "Expiré", color: "text-orange-400 bg-orange-500/10", barColor: "bg-orange-400", percent: 0, borderClass: "border-l-orange-500" };
  const daysLeft = Math.ceil((trial.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const percent = Math.min(Math.round((daysLeft / 30) * 100), 100);
  if (daysLeft <= 7) return { key: "expiring" as const, label: `Expire · ${daysLeft}j`, color: "text-amber-400 bg-amber-500/10", barColor: "bg-amber-400", percent, borderClass: "border-l-amber-500" };
  return { key: "active" as const, label: `Actif · ${daysLeft}j`, color: "text-emerald-400 bg-emerald-500/10", barColor: "bg-emerald-500", percent, borderClass: "border-l-emerald-500" };
}

function ExtendPanel({ ecoleId, secret, onDone }: { ecoleId: string; secret: string; onDone: () => void }) {
  const [days, setDays] = useState("");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExtendDays = async () => {
    if (!days || Number(days) <= 0) return;
    setSaving(true);
    await fetch("/api/siyaqi-ctrl", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id: ecoleId, days: Number(days) }),
    });
    setSaving(false);
    setDays("");
    onDone();
  };

  const handleSetDate = async () => {
    if (!date) return;
    setSaving(true);
    await fetch("/api/siyaqi-ctrl", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id: ecoleId, expiresAt: date }),
    });
    setSaving(false);
    setDate("");
    onDone();
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs text-slate-500 hover:text-slate-300 mt-2">
        Personnaliser la durée...
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 mt-3 pt-3 border-t border-slate-800">
      <div className="flex items-center gap-2">
        <input type="number" min="1" value={days} onChange={(e) => setDays(e.target.value)} placeholder="Nb jours"
          className="w-24 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
        <button onClick={handleExtendDays} disabled={!days || saving}
          className="px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50">
          + Ajouter
        </button>
      </div>
      <div className="text-xs text-slate-600">ou</div>
      <div className="flex items-center gap-2">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 [color-scheme:dark] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25" />
        <button onClick={handleSetDate} disabled={!date || saving}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors disabled:opacity-50">
          <CalendarClock className="w-3.5 h-3.5" />
          Définir
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [ecoles, setEcoles] = useState<AutoEcole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusType>("all");

  const fetchEcoles = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
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
      sessionStorage.setItem("admin_secret", secret);
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

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await fetch("/api/siyaqi-ctrl", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchEcoles();
  };

  const handleActivateMonth = async (id: string) => {
    await fetch("/api/siyaqi-ctrl", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${secret}` },
      body: JSON.stringify({ id, days: 30 }),
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

  // Rafraîchit silencieusement toutes les 60 s pour garder le statut « en ligne » à jour
  useEffect(() => {
    if (!authenticated) return;
    const t = setInterval(() => fetchEcoles(true), 60_000);
    return () => clearInterval(t);
  }, [authenticated, fetchEcoles]);

  const stats = useMemo(() => {
    const total = ecoles.length;
    const neverLoggedIn = ecoles.filter(e => !getLastLogin(e)).length;
    const online = ecoles.filter(e => e.users.some(isOnline)).length;
    let active = 0, expiring = 0, expired = 0, disabled = 0, totalCandidates = 0;
    const cities = new Set<string>();
    const newToday = ecoles.filter(e => {
      const created = new Date(e.createdAt);
      const today = new Date();
      return created.toDateString() === today.toDateString();
    }).length;

    ecoles.forEach(e => {
      const s = getStatusInfo(e);
      if (s.key === "active") active++;
      else if (s.key === "expiring") expiring++;
      else if (s.key === "expired") expired++;
      else if (s.key === "disabled") disabled++;
      totalCandidates += e._count.candidates;
      cities.add(e.city);
    });

    return { total, active, expiring, expired, disabled, totalCandidates, cities: cities.size, newToday, neverLoggedIn, online };
  }, [ecoles]);

  const filtered = useMemo(() => {
    return ecoles.filter(e => {
      const s = getStatusInfo(e);
      if (filter === "never") {
        if (getLastLogin(e)) return false;
      } else if (filter === "online") {
        if (!e.users.some(isOnline)) return false;
      } else if (filter !== "all" && s.key !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const gerant = e.users.find(u => u.role === "GERANT") ?? e.users[0];
        const matchName = e.name.toLowerCase().includes(q);
        const matchCity = e.city.toLowerCase().includes(q);
        const matchGerant = gerant?.fullName.toLowerCase().includes(q);
        const matchPhone = gerant?.phone?.includes(q) || e.phone?.includes(q);
        if (!matchName && !matchCity && !matchGerant && !matchPhone) return false;
      }
      return true;
    });
  }, [ecoles, filter, search]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary mb-3">
              <Car className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-100">Siyaqi Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-4">
            {error && <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl p-3">{error}</div>}
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)}
              placeholder="Mot de passe admin" required
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-base sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow" />
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <LogIn className="w-4 h-4 inline mr-2" />
              {loading ? "Chargement..." : "Accéder"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 sm:px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-6 h-6 text-indigo-400" />
            <h1 className="text-lg font-bold text-slate-100">Siyaqi Admin</h1>
          </div>
          <button onClick={() => fetchEcoles()} disabled={loading} aria-label="Rafraîchir"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Erreur globale (state existant, rendu ajouté) */}
        {error && (
          <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-3 py-2">
            {error}
          </div>
        )}
        {/* Stats (tuiles-boutons : setters de filtre existants) */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          <button type="button" onClick={() => setFilter("all")}
            className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-3 sm:p-4 text-left transition-colors ${filter === "all" ? "ring-2 ring-indigo-500/50" : ""}`}>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">Total</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-slate-100">{stats.total}</p>
            <p className="text-xs text-slate-500 hidden sm:block">{stats.newToday > 0 ? `+${stats.newToday} aujourd'hui` : `${stats.cities} ville(s)`}</p>
          </button>
          <button type="button" onClick={() => setFilter("active")}
            className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-3 sm:p-4 text-left transition-colors ${filter === "active" ? "ring-2 ring-indigo-500/50" : ""}`}>
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">Actifs</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-emerald-400">{stats.active}</p>
            <p className="text-xs text-slate-500 hidden sm:block">{stats.totalCandidates} candidat(s) total</p>
          </button>
          <button type="button" onClick={() => setFilter("expiring")}
            className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-3 sm:p-4 text-left transition-colors ${filter === "expiring" ? "ring-2 ring-indigo-500/50" : ""}`}>
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">Expirent bientôt</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-amber-400">{stats.expiring}</p>
            <p className="text-xs text-slate-500 hidden sm:block">{"< 7 jours"}</p>
          </button>
          <button type="button" onClick={() => setFilter("expired")}
            className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-3 sm:p-4 text-left transition-colors ${filter === "expired" ? "ring-2 ring-indigo-500/50" : ""}`}>
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <Ban className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">Expirés / Off</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-red-400">{stats.expired + stats.disabled}</p>
            <p className="text-xs text-slate-500 hidden sm:block">{stats.expired} exp · {stats.disabled} off</p>
          </button>
          <button type="button" onClick={() => setFilter("never")}
            className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-3 sm:p-4 text-left transition-colors ${filter === "never" ? "ring-2 ring-indigo-500/50" : ""}`}>
            <div className="flex items-center gap-2 text-orange-400 mb-1">
              <UserX className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">Jamais connectés</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-orange-400">{stats.neverLoggedIn}</p>
            <p className="text-xs text-slate-500 hidden sm:block">Inscrits sans login</p>
          </button>
          <button type="button" onClick={() => setFilter("online")}
            className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 p-3 sm:p-4 text-left transition-colors ${filter === "online" ? "ring-2 ring-indigo-500/50" : ""}`}>
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Wifi className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium truncate">En ligne</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums text-emerald-400">{stats.online}</p>
            <p className="text-xs text-slate-500 hidden sm:block">En ce moment</p>
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, ville, gérant ou téléphone..."
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-base sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25 transition-shadow" />
            {search && (
              <button type="button" onClick={() => setSearch("")} aria-label="Effacer la recherche"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 bg-slate-900 rounded-xl border border-slate-800 p-1 overflow-x-auto [scrollbar-width:none]">
            <Filter className="w-4 h-4 text-slate-500 ml-2 shrink-0" />
            {([
              ["all", "Tous"],
              ["active", `Actifs · ${stats.active}`],
              ["expiring", `Bientôt · ${stats.expiring}`],
              ["expired", `Expirés · ${stats.expired}`],
              ["disabled", `Off · ${stats.disabled}`],
              ["never", `Jamais · ${stats.neverLoggedIn}`],
              ["online", `En ligne · ${stats.online}`],
            ] as [StatusType, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`shrink-0 whitespace-nowrap px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  filter === key ? "bg-primary text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className={`space-y-3 transition-opacity ${loading ? "opacity-60 pointer-events-none" : ""}`}>
          {filtered.map((ecole) => {
            const status = getStatusInfo(ecole);
            const gerant = ecole.users.find(u => u.role === "GERANT") ?? ecole.users[0];
            const moniteurs = ecole.users.filter(u => u.role === "MONITEUR");
            const lastLogin = getLastLogin(ecole);
            const online = ecole.users.some(isOnline);
            const daysLeft = Math.max(0, Math.ceil((new Date(ecole.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

            return (
              <div key={ecole.id} className={`bg-slate-900 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors border-l-4 ${status.borderClass} p-4 sm:p-5`}>
                {/* Top row */}
                <div className="mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-slate-100">{ecole.name}</h2>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    {new Date(ecole.createdAt).toDateString() === new Date().toDateString() && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full text-blue-400 bg-blue-500/10">Nouveau</span>
                    )}
                    {online ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
                        <span className="relative flex w-2 h-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500" />
                        </span>
                        En ligne
                      </span>
                    ) : lastLogin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-slate-400 bg-slate-500/10">
                        <LogIn className="w-3 h-3" /> {timeAgo(lastLogin)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full text-orange-400 bg-orange-500/10">
                        <UserX className="w-3 h-3" /> Jamais connecté
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {ecole.city} — Inscrit le {new Date(ecole.createdAt).toLocaleDateString("fr-FR")}
                    <span className="inline-flex items-center gap-1 ml-2 text-slate-500">
                      · <Users className="w-3.5 h-3.5" /> <span className="tabular-nums">{ecole._count.candidates}</span>
                    </span>
                  </p>
                </div>

                {/* Gérant info */}
                {gerant && (
                  <div className="mb-3 bg-slate-800/50 rounded-xl px-3 py-2 space-y-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                      <span title={gerant.username}><span className="font-medium text-slate-300">Gérant:</span> <span className="text-slate-200">{gerant.fullName}</span></span>
                      {(gerant.phone || ecole.phone) && (
                        <a href={`tel:${gerant.phone || ecole.phone}`} className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                          <Phone className="w-3.5 h-3.5" />
                          {gerant.phone || ecole.phone}
                        </a>
                      )}
                      <span className="text-slate-500 tabular-nums">{gerant.loginCount}×</span>
                      <span className={isOnline(gerant) ? "text-emerald-400 font-medium" : gerant.lastLoginAt ? "text-slate-500" : "text-orange-400 font-medium"}>
                        {isOnline(gerant)
                          ? "En ligne maintenant"
                          : gerant.lastLoginAt
                          ? `Vu ${timeAgo(gerant.lastLoginAt)}`
                          : "Ne s'est jamais connecté"}
                      </span>
                    </div>
                    {moniteurs.length > 0 && (
                      <div className="text-xs text-slate-500 line-clamp-1"
                        title={moniteurs.map(m => `${m.fullName} (${isOnline(m) ? "en ligne" : m.lastLoginAt ? timeAgo(m.lastLoginAt) : "jamais connecté"})`).join(" · ")}>
                        Moniteurs : {moniteurs.map(m => `${m.fullName} (${isOnline(m) ? "en ligne" : m.lastLoginAt ? timeAgo(m.lastLoginAt) : "jamais connecté"})`).join(" · ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center text-xs text-slate-500 mb-1">
                    <span className="flex items-center gap-1" title={`${daysLeft}j restant`}>
                      <Clock className="w-3 h-3" />
                      Expire le {new Date(ecole.trialEndsAt).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className={`w-full rounded-full h-2 ${status.key === "expired" || status.key === "disabled" ? "bg-red-500/20" : "bg-slate-800"}`}>
                    <div className={`h-2 rounded-full transition-all ${status.barColor} ${status.percent > 0 ? "min-w-[3px]" : ""}`}
                      style={{ width: `${status.percent}%` }} />
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-800 pt-3 mt-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleActivateMonth(ecole.id)} disabled={loading}
                      className="inline-flex items-center gap-1 px-3 py-2 sm:py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Activer 1 mois
                    </button>
                    <button onClick={() => handleToggleActive(ecole.id, ecole.isActive)} disabled={loading}
                      className={`inline-flex items-center gap-1 px-3 py-2 sm:py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                        ecole.isActive
                          ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                          : "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                      }`}>
                      {ecole.isActive ? (
                        <><XCircle className="w-3.5 h-3.5" /> Désactiver</>
                      ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Réactiver</>
                      )}
                    </button>
                    {(gerant?.phone || ecole.phone) && (
                      <a href={`https://wa.me/212${(gerant?.phone || ecole.phone || "").replace(/^0/, "")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-2 sm:py-1.5 text-xs font-medium text-slate-300 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors">
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                        WhatsApp
                      </a>
                    )}
                  </div>

                  <ExtendPanel ecoleId={ecole.id} secret={secret} onDone={fetchEcoles} />
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && !loading && (
            <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl py-12 px-6 text-center">
              <Search className="w-10 h-10 mx-auto text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">
                {search || filter !== "all" ? "Aucun résultat." : "Aucune auto-école inscrite."}
              </p>
              {(search || filter !== "all") && (
                <button type="button" onClick={() => { setSearch(""); setFilter("all"); }}
                  className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors">
                  Réinitialiser
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
