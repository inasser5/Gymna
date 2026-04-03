import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginButton from "./LoginButton";
import { Dumbbell } from "lucide-react";

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/");

  return (
    <div className="relative min-h-dvh bg-slate-950 flex flex-col items-center justify-center px-6 overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-violet-700/10 blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-indigo-500/8 blur-[80px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
        aria-hidden
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center mb-5 glow-accent shadow-2xl">
            <Dumbbell className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">
            Gymna
          </h1>
          <p className="text-slate-400 text-sm text-center leading-relaxed">
            Your intelligent gym tracker.<br />
            Log sets, track progress, dominate every session.
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-strong rounded-3xl p-6 flex flex-col gap-4">
          <div className="text-center mb-2">
            <h2 className="text-lg font-semibold text-white mb-1">
              Get started
            </h2>
            <p className="text-xs text-slate-500">
              Sign in with your Google account to continue
            </p>
          </div>

          <LoginButton />

          <p className="text-center text-xs text-slate-600 mt-2 leading-relaxed">
            By signing in you agree to our{" "}
            <span className="text-slate-500">Terms of Service</span>{" "}
            and{" "}
            <span className="text-slate-500">Privacy Policy</span>.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["Track Sets & Reps", "Clone Weeks", "Progress Charts", "Rest Timer"].map(
            (feat) => (
              <span
                key={feat}
                className="px-3 py-1 rounded-full glass text-[11px] text-slate-400 font-medium"
              >
                {feat}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
