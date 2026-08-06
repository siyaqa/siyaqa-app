"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Calendar,
  CreditCard,
  LayoutDashboard,
  UserCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["GERANT", "MONITEUR"],
  },
  {
    label: "Candidats",
    href: "/candidates",
    icon: Users,
    roles: ["GERANT", "MONITEUR"],
  },
  {
    label: "Paiements",
    href: "/payments",
    icon: CreditCard,
    roles: ["GERANT"],
  },
  {
    label: "Planning",
    href: "/planning",
    icon: Calendar,
    roles: ["GERANT", "MONITEUR"],
  },
  {
    label: "Conduite",
    href: "/driving",
    icon: Car,
    roles: ["GERANT", "MONITEUR"],
  },
  {
    label: "Moniteurs",
    href: "/moniteurs",
    icon: UserCog,
    roles: ["GERANT"],
  },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-white md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-border px-6">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-white">
          <Car className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-slate-900">Siyaqi</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary-light font-semibold text-primary before:absolute before:left-0 before:top-1/2 before:h-5 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-primary"
                    : "font-medium text-slate-600 hover:bg-surface-2 hover:text-slate-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Car className="h-4 w-4" />
          <span>Siyaqi</span>
        </div>
      </div>
    </aside>
  );
}
