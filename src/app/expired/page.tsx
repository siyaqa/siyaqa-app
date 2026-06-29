"use client";

import { signOut } from "next-auth/react";
import { Car, MessageCircle, LogOut } from "lucide-react";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 mb-6">
          <Car className="w-8 h-8 text-orange-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Votre essai gratuit est terminé
        </h1>
        <p className="text-gray-500 mb-8">
          Votre période d&apos;essai de 14 jours est arrivée à son terme.
          Pour continuer à utiliser Siyaqi, activez votre abonnement.
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-500 mb-1">Abonnement mensuel</p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-bold text-gray-900">149</span>
              <span className="text-lg text-gray-500">MAD/mois</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Candidats illimités. Toutes les fonctionnalités.
            </p>
          </div>

          <a
            href="https://wa.me/212620513156?text=Bonjour%2C%20je%20souhaite%20activer%20mon%20abonnement%20Siyaqi."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Activer via WhatsApp
          </a>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Vos données sont conservées. Dès l&apos;activation, vous retrouverez
          tout comme avant.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
