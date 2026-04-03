import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { User, Mail, LogOut } from "lucide-react";
import SignOutButton from "./SignOutButton";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name ?? user.email?.split("@")[0] ?? "Athlete";
  const email = profile?.email ?? user.email ?? "";
  const avatar = profile?.avatar_url;

  return (
    <div className="flex flex-col pb-24">
      <div className="px-4 pt-6 pb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-1">Account</p>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Avatar + name */}
        <div className="glass rounded-3xl p-6 flex flex-col items-center gap-3">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <User className="w-9 h-9 text-indigo-400" />
            </div>
          )}
          <div className="text-center">
            <p className="text-lg font-bold text-white">{name}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1 justify-center mt-0.5">
              <Mail className="w-3.5 h-3.5" /> {email}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <div className="glass rounded-2xl overflow-hidden">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
