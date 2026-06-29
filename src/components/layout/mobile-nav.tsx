"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  Calendar,
  CreditCard,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mobileItems = [
  {
    label: "Dashboard",
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
];

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();

  const visibleItems = mobileItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e2e8f0] bg-white md:hidden">
      <div className="flex items-center justify-around py-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                isActive ? "text-[#2563eb]" : "text-[#64748b]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
