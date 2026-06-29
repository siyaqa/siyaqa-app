"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function Header({
  userName,
  autoEcoleName,
}: {
  userName: string;
  autoEcoleName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e2e8f0] bg-white px-4 md:px-6">
      <h1 className="text-lg font-semibold text-gray-900">{autoEcoleName}</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-[#64748b]">{userName}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#64748b] transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
