"use client";

import { useState } from "react";

export function ResendButton() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const resend = async () => {
    setState("sending");
    try {
      await fetch("/api/resend-verification", { method: "POST" });
      setState("sent");
    } catch {
      setState("idle");
    }
  };

  if (state === "sent") {
    return <p className="text-sm font-medium text-success">Email renvoyé ✓ Vérifiez votre boîte.</p>;
  }

  return (
    <button
      onClick={resend}
      disabled={state === "sending"}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground/80 hover:bg-surface-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {state === "sending" ? "Envoi..." : "Renvoyer l'email de confirmation"}
    </button>
  );
}
