import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/user";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import RestTimerBar from "@/components/ui/RestTimerBar";
import type { Profile } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex flex-col min-h-dvh bg-slate-950">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-violet-600/8 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 w-72 h-72 rounded-full bg-indigo-500/6 blur-[80px]" />
      </div>

      <Header profile={profile as Profile | null} />

      <main className="flex-1 relative z-10 pb-24 page-enter">
        {children}
      </main>

      <RestTimerBar />
      <BottomNav />
    </div>
  );
}
