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
    href: "/",
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
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#e2e8f0] bg-white md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-[#e2e8f0] px-6">
        <Car className="h-6 w-6 text-[#2563eb]" />
        <span className="text-xl font-bold text-[#2563eb]">Siyaqi</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems
          .filter((item) => item.roles.includes(role))
          .map((item) => {
            const isActive = item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#2563eb]/10 text-[#2563eb]"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
      </nav>
    </aside>
  );
}
