"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useBreadcrumbStore } from "@/store/breadcrumb.store";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const getBreadcrumbs = useBreadcrumbStore((s) => s.getBreadcrumbs);
  const crumbs = getBreadcrumbs();

  // Don't render on login or single-level pages
  if (pathname === "/login" || crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-4 py-2 overflow-x-auto no-scrollbar"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const isFirst = index === 0;

        return (
          <div key={crumb.href + index} className="flex items-center gap-1 shrink-0">
            {/* Separator */}
            {!isFirst && (
              <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            )}

            {isLast ? (
              /* Active crumb — not a link */
              <span className="flex items-center gap-1 text-xs font-medium text-white">
                {isFirst && <Home className="w-3 h-3" />}
                <span className="truncate max-w-[120px]">{crumb.label}</span>
              </span>
            ) : (
              /* Ancestor crumb — clickable */
              <Link
                href={crumb.href}
                className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                {isFirst && <Home className="w-3 h-3" />}
                <span className="truncate max-w-[100px]">{crumb.label}</span>
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
