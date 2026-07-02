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
    return <p className="text-sm text-green-600">Email renvoyé ✓ Vérifiez votre boîte.</p>;
  }

  return (
    <button
      onClick={resend}
      disabled={state === "sending"}
      className="text-sm text-[#2563eb] font-medium hover:underline disabled:opacity-50"
    >
      {state === "sending" ? "Envoi..." : "Renvoyer l'email de confirmation"}
    </button>
  );
}
