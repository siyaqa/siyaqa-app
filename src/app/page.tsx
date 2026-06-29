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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Siyaqi</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
            >
              Essai gratuit
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-primary text-sm font-medium rounded-full mb-6">
              <Star className="w-4 h-4" />
              منصة مغربية 100%
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-gray-900">
              Fini le cahier.
              <br />
              <span className="text-primary">Gérez votre auto-école</span>
              <br />
              depuis votre téléphone.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Candidats, paiements, planning, heures de conduite — tout dans une seule app.
              Plus aucun paiement oublié. Plus aucun candidat perdu.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors shadow-lg shadow-primary/25"
              >
                Essai gratuit 14 jours
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-sm text-gray-400">Sans carte bancaire. Sans engagement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEME ==================== */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
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
                className="bg-white rounded-2xl p-6 border border-gray-200 text-center"
              >
                <span className="text-4xl">{item.emoji}</span>
                <p className="mt-4 text-gray-600 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SOLUTION / FEATURES ==================== */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
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
                color: "text-blue-600 bg-blue-50",
              },
              {
                icon: CreditCard,
                title: "Paiements sans oublis",
                desc: "Qui a payé, combien, quand. Vous voyez le solde restant en un coup d'oeil. Plus rien n'est oublié.",
                color: "text-green-600 bg-green-50",
              },
              {
                icon: Calendar,
                title: "Planning visuel",
                desc: "Calendrier mensuel et hebdomadaire. Séances de code et conduite. Filtres par moniteur.",
                color: "text-purple-600 bg-purple-50",
              },
              {
                icon: Clock,
                title: "Heures de conduite",
                desc: "Enregistrez chaque leçon. Suivez la progression. Sachez qui est prêt pour l'examen.",
                color: "text-orange-600 bg-orange-50",
              },
              {
                icon: ExternalLink,
                title: "Portail candidat",
                desc: "Un lien unique pour chaque candidat. Il voit ses paiements et ses séances lui-même. Fini les appels.",
                color: "text-indigo-600 bg-indigo-50",
              },
              {
                icon: Smartphone,
                title: "100% mobile",
                desc: "Conçu pour le téléphone. Utilisez-le au bureau, en voiture, ou chez vous.",
                color: "text-pink-600 bg-pink-50",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
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
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Prêt en 2 minutes
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {[
              { step: "1", title: "Créez votre compte", desc: "Nom de l'auto-école, votre nom, un mot de passe. C'est tout." },
              { step: "2", title: "Ajoutez vos candidats", desc: "Nom, téléphone, type de permis, frais. 30 secondes par candidat." },
              { step: "3", title: "Gérez tout", desc: "Paiements, planning, conduite. Tout est automatique." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto">
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
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Un seul prix. Tout inclus.
            </h2>
            <p className="mt-3 text-gray-500">
              Pas de surprise. Pas de frais cachés.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-primary p-8 shadow-xl shadow-primary/10">
            <div className="text-center">
              <p className="text-sm font-medium text-primary mb-2">OFFRE DE LANCEMENT</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold">149</span>
                <span className="text-xl text-gray-500">MAD/mois</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">≈ 5 MAD par jour</p>
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
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-8 w-full inline-flex items-center justify-center gap-2 px-6 py-4 text-lg font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors"
            >
              Essai gratuit 14 jours
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-center text-xs text-gray-400 mt-3">
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
              <p className="text-sm text-gray-500">Un problème ? Contactez-nous sur WhatsApp. Réponse en moins d&apos;une heure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CTA FINAL ==================== */}
      <section className="py-16 sm:py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Arrêtez de perdre de l&apos;argent.
            <br />
            Commencez à gérer.
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Rejoignez les auto-écoles qui ont choisi Siyaqi.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-primary bg-white hover:bg-gray-50 rounded-xl transition-colors"
          >
            Créer mon compte gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="py-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="font-semibold">Siyaqi</span>
          </div>
          <p className="text-sm text-gray-400">
            © 2026 Siyaqi — Tous droits réservés
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/login" className="hover:text-gray-600">Connexion</Link>
            <Link href="/register" className="hover:text-gray-600">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
