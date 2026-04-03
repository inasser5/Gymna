"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart2, User, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/",          label: "Home",     Icon: Home     },
  { href: "/exercises", label: "Exercises", Icon: Dumbbell },
  { href: "/analytics", label: "Analytics", Icon: BarChart2 },
  { href: "/profile",   label: "Profile",  Icon: User     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-header fixed bottom-0 left-0 right-0 z-40 safe-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all active:scale-95",
                isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-xl transition-all",
                  isActive && "bg-indigo-500/15"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
