"use client";

import { signOut } from "next-auth/react";
import { Car, MessageCircle, LogOut } from "lucide-react";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50/60 via-slate-50 to-slate-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-warning-light mb-6">
          <Car className="w-8 h-8 text-warning" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">
          Votre essai gratuit est terminé
        </h1>
        <p className="text-muted mb-8">
          Votre période d&apos;essai de 30 jours est arrivée à son terme.
          Pour continuer à utiliser Siyaqi, activez votre abonnement.
        </p>

        <div className="bg-card rounded-2xl shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-muted mb-1">Abonnement mensuel</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold tracking-tight tabular-nums text-gray-900">149</span>
              <span className="text-lg text-muted">MAD/mois</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Candidats illimités. Toutes les fonctionnalités.
            </p>
          </div>

          <a
            href="https://wa.me/212681177394?text=Bonjour%2C%20je%20souhaite%20activer%20mon%20abonnement%20Siyaqi."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-sm shadow-green-600/25 active:scale-[0.98] transition"
          >
            <MessageCircle className="w-5 h-5" />
            Activer via WhatsApp
          </a>
        </div>

        <div className="bg-primary-light rounded-xl p-3 text-sm text-primary mb-6">
          Vos données sont conservées. Dès l&apos;activation, vous retrouverez
          tout comme avant.
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex py-2.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-1 py-2.5 text-sm text-muted hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
