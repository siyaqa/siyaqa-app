import Link from "next/link";
import {
  Car,
  CreditCard,
  Calendar,
  Users,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Clock,
  Shield,
  ExternalLink,
  Star,
  MessageCircle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-600/25">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Siyaqi</span>
          </div>
          <nav className="hidden sm:flex gap-6 text-sm text-gray-600">
            <a href="#fonctionnalites" className="hover:text-gray-900 transition-colors">
              Fonctionnalités
            </a>
            <a href="#comment" className="hover:text-gray-900 transition-colors">
              Comment ça marche
            </a>
            <a href="#tarif" className="hover:text-gray-900 transition-colors">
              Tarif
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[.98] transition"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50" />
        <ZelligePattern id="zellige-hero" className="text-indigo-600/10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-light text-primary text-sm font-medium rounded-full mb-6">
                <Star className="w-4 h-4" />
                <span dir="rtl" lang="ar">منصة مغربية 100%</span>
              </div>
              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight leading-tight text-gray-900">
                Fini le cahier.
                <span className="block bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Gérez votre auto-école
                </span>
                <span className="block">depuis votre téléphone.</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Candidats, paiements, planning, heures de conduite — tout dans une seule app.
                Plus aucun paiement oublié. Plus aucun candidat perdu.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[.98] transition"
                >
                  Essai gratuit 30 jours
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#tarif"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 bg-white/70 border border-gray-300 hover:bg-white rounded-xl transition-colors"
                >
                  Voir le prix
                </a>
              </div>
              <p className="mt-4 text-sm text-gray-500">Sans carte bancaire. Sans engagement.</p>
            </div>
            <HeroPhone />
          </div>

          {/* Bande de confiance honnête */}
          <div className="mt-14 sm:mt-16 pt-6 border-t border-indigo-100 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-gray-500">
            <span className="inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              30 jours gratuits
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span className="tabular-nums">≈ 5 MAD/jour</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-green-500" />
              Support WhatsApp
            </span>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEME ==================== */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Le problème
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Vous vous reconnaissez ?
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                emoji: "😤",
                text: "Des candidats qui oublient de payer, et vous ne savez plus qui doit combien",
              },
              {
                emoji: "📓",
                text: "Un cahier ou Excel pour tout gérer — impossible de retrouver une info rapidement",
              },
              {
                emoji: "📱",
                text: "Des candidats qui vous appellent sans arrêt : \"Bchhal bqat 3liya?\"",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] p-6 text-center"
              >
                <span className="text-4xl">{item.emoji}</span>
                <p className="mt-4 text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SOLUTION / FEATURES ==================== */}
      <section id="fonctionnalites" className="scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              La solution
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Siyaqi règle tout ça
            </h2>
            <p className="mt-3 text-gray-500 text-lg">
              Simple. Sur téléphone. Fait pour les auto-écoles marocaines.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Users,
                title: "Suivi des candidats",
                desc: "Chaque candidat a sa fiche : statut, permis, CIN, téléphone. Recherche instantanée.",
                color: "text-primary bg-primary-light",
              },
              {
                icon: CreditCard,
                title: "Paiements sans oublis",
                desc: "Qui a payé, combien, quand. Vous voyez le solde restant en un coup d'oeil. Plus rien n'est oublié.",
                color: "text-success bg-success-light",
              },
              {
                icon: Calendar,
                title: "Planning visuel",
                desc: "Calendrier mensuel et hebdomadaire. Séances de code et conduite. Filtres par moniteur.",
                color: "text-primary bg-primary-light",
              },
              {
                icon: Clock,
                title: "Heures de conduite",
                desc: "Enregistrez chaque leçon. Suivez la progression. Sachez qui est prêt pour l'examen.",
                color: "text-warning bg-warning-light",
              },
              {
                icon: ExternalLink,
                title: "Portail candidat",
                desc: "Un lien unique pour chaque candidat. Il voit ses paiements et ses séances lui-même. Fini les appels.",
                color: "text-primary bg-primary-light",
              },
              {
                icon: Smartphone,
                title: "100% mobile",
                desc: "Conçu pour le téléphone. Utilisez-le au bureau, en voiture, ou chez vous.",
                color: "text-primary bg-primary-light",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-card rounded-2xl p-6 border border-border shadow-[0_1px_2px_rgb(15_23_42/0.04)] hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== COMMENT CA MARCHE ==================== */}
      <section id="comment" className="scroll-mt-20 py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Comment ça marche
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Prêt en 2 minutes
            </h2>
          </div>
          <div className="relative grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div
              aria-hidden="true"
              className="hidden sm:block absolute top-6 left-[16.67%] right-[16.67%] border-t-2 border-dashed border-indigo-200"
            />
            {[
              { step: "1", title: "Créez votre compte", desc: "Nom de l'auto-école, votre nom, un mot de passe. C'est tout." },
              { step: "2", title: "Ajoutez vos candidats", desc: "Nom, téléphone, type de permis, frais. 30 secondes par candidat." },
              { step: "3", title: "Gérez tout", desc: "Paiements, planning, conduite. Tout est automatique." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto shadow-sm shadow-primary/25">
                  {item.step}
                </div>
                <h3 className="font-semibold mt-4 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <section id="tarif" className="scroll-mt-20 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
              Tarif
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Un seul prix. Tout inclus.
            </h2>
            <p className="mt-3 text-gray-500">
              Pas de surprise. Pas de frais cachés.
            </p>
          </div>

          <div className="relative max-w-md mx-auto bg-white rounded-2xl border-2 border-primary p-8 shadow-xl shadow-primary/10">
            <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap">
              OFFRE DE LANCEMENT
            </p>
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold tracking-tight tabular-nums">149</span>
                <span className="text-xl text-gray-500">MAD/mois</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 tabular-nums">≈ 5 MAD par jour</p>
            </div>

            <div className="mt-8 space-y-3">
              {[
                "Candidats illimités",
                "Moniteurs illimités",
                "Suivi des paiements",
                "Planning calendrier",
                "Heures de conduite",
                "Portail candidat (lien public)",
                "Accès mobile",
                "Support WhatsApp",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 rounded-xl shadow-lg shadow-indigo-600/30 active:scale-[.98] transition"
            >
              Essai gratuit 30 jours
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-xs text-gray-500 mt-3">
              Sans carte bancaire. Annulez quand vous voulez.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== TRUST ==================== */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Données sécurisées</h3>
              <p className="text-sm text-gray-500">Serveurs en Europe. Chiffrement SSL. Vos données vous appartiennent.</p>
            </div>
            <div>
              <Smartphone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Fait pour le Maroc</h3>
              <p className="text-sm text-gray-500">Conçu pour les auto-écoles marocaines. Interface simple en français.</p>
            </div>
            <div>
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Support rapide</h3>
              <p className="text-sm text-gray-500">
                Un problème ? Contactez-nous sur{" "}
                <a
                  href="https://wa.me/212681177394"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-success font-medium hover:underline"
                >
                  WhatsApp
                </a>
                . Réponse en moins d&apos;une heure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-indigo-600 to-blue-600">
        <ZelligePattern id="zellige-cta" className="text-white/10" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Arrêtez de perdre de l&apos;argent.
            <span className="block">Commencez à gérer.</span>
          </h2>
          <p className="mt-4 text-indigo-100 text-lg">
            Rejoignez les auto-écoles qui ont choisi Siyaqi.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-primary bg-white hover:bg-indigo-50 rounded-xl shadow-lg shadow-indigo-900/20 active:scale-[.98] transition"
          >
            Créer mon compte gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-8 border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="font-semibold">Siyaqi</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 Siyaqi — Tous droits réservés
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 text-sm text-gray-500">
            <Link href="/login" className="py-2.5 hover:text-gray-900 transition-colors">Connexion</Link>
            <Link href="/register" className="py-2.5 hover:text-gray-900 transition-colors">Inscription</Link>
            <a
              href="https://wa.me/212681177394"
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 hover:text-gray-900 transition-colors"
            >
              WhatsApp
            </a>
            <span className="py-2.5">Programme de parrainage</span>
          </div>
        </div>
      </footer>

      {/* Bouton WhatsApp flottant */}
      <a
        href="https://wa.me/212681177394"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Nous contacter sur WhatsApp"
        className="fixed bottom-5 right-5 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-3.5 shadow-lg shadow-green-600/30 active:scale-[.98] transition"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}

/* Mockup téléphone du héros — JSX statique pur, aucune logique */
function HeroPhone() {
  return (
    <div className="relative mx-auto mt-4 lg:mt-0">
      <div className="relative mx-auto w-[270px] rounded-[2.5rem] border-[10px] border-slate-900 bg-white shadow-2xl shadow-indigo-600/20 rotate-2">
        {/* Encoche */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-24 h-5 bg-slate-900 rounded-b-2xl" />
        {/* Écran */}
        <div className="overflow-hidden rounded-[1.85rem] bg-slate-50">
          {/* Bandeau école */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-4 pt-9 pb-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight truncate">Auto-école Atlas</p>
                <p className="text-[10px] text-indigo-200">Casablanca</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/10 px-2.5 py-1.5">
                <p className="text-sm font-bold leading-none tabular-nums">24</p>
                <p className="text-[9px] text-indigo-200 mt-0.5">candidats actifs</p>
              </div>
              <div className="rounded-xl bg-white/10 px-2.5 py-1.5">
                <p className="text-sm font-bold leading-none tabular-nums">6</p>
                <p className="text-[9px] text-indigo-200 mt-0.5">séances aujourd&apos;hui</p>
              </div>
            </div>
          </div>
          {/* Rangées candidats */}
          <div className="p-3 space-y-2">
            <p className="px-1 text-[9px] font-semibold uppercase tracking-widest text-slate-400">
              Candidats
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                YA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-900 truncate">Yassine Alami</p>
                <p className="text-[9px] text-slate-400">Permis B</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-medium text-amber-700 ring-1 ring-inset ring-amber-200">
                Conduite
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-primary-light text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                SB
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-slate-900 truncate">Salma Berrada</p>
                <p className="text-[9px] text-slate-400">Permis B</p>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-1.5 py-0.5 text-[8px] font-medium text-blue-700 ring-1 ring-inset ring-blue-200">
                Code
              </span>
            </div>
            {/* Carte paiement */}
            <div className="rounded-xl border border-slate-100 bg-white p-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold text-slate-900">Paiement — Yassine A.</p>
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-3/5 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-600 tabular-nums whitespace-nowrap">
                  1 500 / 2 500 MAD
                </span>
                <span className="text-[9px] text-slate-400 tabular-nums whitespace-nowrap">
                  reste 1 000
                </span>
              </div>
            </div>
          </div>
        </div>
        {/* Toast flottant */}
        <div className="absolute -left-6 top-[46%] -rotate-2 flex items-center gap-2 bg-white rounded-xl shadow-lg ring-1 ring-slate-900/5 px-3 py-2">
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-slate-900 tabular-nums whitespace-nowrap">
              +500 MAD
            </p>
            <p className="text-[9px] text-slate-400 whitespace-nowrap">Yassine A.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Motif zellige (étoile 8 branches) — couche décorative pure */
function ZelligePattern({ id, className }: { id: string; className: string }) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="34" y="34" width="12" height="12" />
              <rect x="34" y="34" width="12" height="12" transform="rotate(45 40 40)" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
