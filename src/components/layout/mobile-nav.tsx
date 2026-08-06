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
  {
    label: "Moniteurs",
    href: "/moniteurs",
    icon: UserCog,
    roles: ["GERANT"],
  },
];

export function MobileNav({ role }: { role: string }) {
  const pathname = usePathname();

  const visibleItems = mobileItems.filter((item) => item.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-2px_10px_rgb(15_23_42/0.06)] md:hidden">
      <div className="flex items-center pt-1.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[11px] transition-colors"
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full px-4 py-1 transition-colors",
                  isActive ? "bg-primary-light text-primary" : "text-muted"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
              </span>
              <span
                className={cn(
                  isActive ? "font-semibold text-primary" : "text-muted"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
