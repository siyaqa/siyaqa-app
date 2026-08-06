"use client";

import { signOut } from "next-auth/react";
import { Car, LogOut } from "lucide-react";

export function Header({
  userName,
  autoEcoleName,
}: {
  userName: string;
  autoEcoleName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-white/85 px-4 backdrop-blur-md md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Car className="h-5 w-5 text-primary md:hidden shrink-0" />
        <h1 className="truncate text-base font-semibold text-slate-900 md:text-lg">
          {autoEcoleName}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary"
          >
            {userName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase() || "U"}
          </span>
          <span className="hidden max-w-[160px] truncate text-sm text-muted md:inline">
            {userName}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
