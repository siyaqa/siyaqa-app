"use client";

import { useEffect } from "react";

// Signale la présence (users.lastSeenAt) toutes les 60 s tant que l'onglet est visible
export function PresencePing() {
  useEffect(() => {
    const ping = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/heartbeat", { method: "POST" }).catch(() => {});
      }
    };
    ping();
    const interval = setInterval(ping, 60_000);
    document.addEventListener("visibilitychange", ping);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", ping);
    };
  }, []);

  return null;
}
