"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { useBreadcrumbStore } from "@/store/breadcrumb.store";
import Breadcrumbs from "./Breadcrumbs";
import type { Profile } from "@/types/database";

interface HeaderProps {
  profile: Profile | null;
}

export default function Header({ profile }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const getBreadcrumbs = useBreadcrumbStore((s) => s.getBreadcrumbs);
  const crumbs = getBreadcrumbs();

  const isHome = pathname === "/";
  const canGoBack = crumbs.length > 1 && !isHome;

  const handleBack = () => {
    if (crumbs.length >= 2) {
      router.push(crumbs[crumbs.length - 2].href);
    } else {
      router.back();
    }
  };

  return (
    <header className="glass-header sticky top-0 z-40 safe-top w-full">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left — back button or logo */}
        <div className="flex items-center gap-3 min-w-0">
          {canGoBack ? (
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-xl glass hover:bg-white/10 transition-all active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-slate-300" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center glow-accent">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base gradient-text tracking-tight">
                Gymna
              </span>
            </div>
          )}
        </div>

        {/* Right — avatar */}
        {profile && (
          <div className="flex items-center gap-2 shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.full_name ?? "Profile"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full ring-2 ring-white/10 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white">
                {(profile.full_name ?? profile.email)[0].toUpperCase()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Breadcrumbs row */}
      <Breadcrumbs />
    </header>
  );
}
