"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
    });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isPending}
      className="w-full flex items-center gap-3 px-5 py-4 text-rose-400 hover:bg-rose-500/10 transition-all disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">Sign Out</span>
    </button>
  );
}
