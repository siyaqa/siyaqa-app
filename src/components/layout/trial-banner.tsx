"use client";

import { useState } from "react";
import { Clock, MessageCircle, X } from "lucide-react";

export function TrialBanner({ daysLeft }: { daysLeft: number }) {
  const [dismissed, setDismissed] = useState(false);

  // Don't show if more than 30 days left (paid subscriber)
  if (daysLeft > 30 || dismissed) return null;

  let bg: string;
  let text: string;
  let message: string;
  let showActivate = false;

  if (daysLeft > 7) {
    bg = "bg-blue-50 border-blue-200";
    text = "text-blue-700";
    message = `Essai gratuit : ${daysLeft} jours restants`;
  } else if (daysLeft > 3) {
    bg = "bg-yellow-50 border-yellow-200";
    text = "text-yellow-700";
    message = `Votre essai expire dans ${daysLeft} jours`;
    showActivate = true;
  } else if (daysLeft > 0) {
    bg = "bg-red-50 border-red-200";
    text = "text-red-700";
    message = daysLeft === 1
      ? "Dernier jour de votre essai gratuit !"
      : `Votre essai expire dans ${daysLeft} jours !`;
    showActivate = true;
  } else {
    bg = "bg-red-50 border-red-200";
    text = "text-red-700";
    message = "Votre essai est terminé";
    showActivate = true;
  }

  return (
    <div className={`mx-4 mt-4 md:mx-6 md:mt-6 rounded-lg border px-4 py-3 flex items-center justify-between gap-3 ${bg}`}>
      <div className={`flex items-center gap-2 text-sm font-medium ${text}`}>
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span>{message}</span>
      </div>
      <div className="flex items-center gap-2">
        {showActivate && (
          <a
            href="https://wa.me/212681177394?text=Bonjour%2C%20je%20souhaite%20activer%20mon%20abonnement%20Siyaqi."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Activer
          </a>
        )}
        {daysLeft > 3 && (
          <button
            onClick={() => setDismissed(true)}
            className={`p-1 rounded hover:bg-black/5 ${text}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
