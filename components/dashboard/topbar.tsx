"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState, useRef } from "react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

export function Topbar() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }: any) => setUser(data.user));
    }
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    if (supabase) await supabase.auth.signOut();
    router.push("/");
  };

  const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U";
  const name = user?.user_metadata?.full_name || user?.email || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-end px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-bg-light transition-colors"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {initial.toUpperCase()}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-text-primary leading-none">{name}</p>
              <p className="text-xs text-muted-text mt-0.5">{user?.email}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-muted-text hidden md:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-border shadow-lg py-1.5 z-50">
              <div className="px-4 py-2.5 border-b border-border md:hidden">
                <p className="text-sm font-medium text-text-primary">{name}</p>
                <p className="text-xs text-muted-text">{user?.email}</p>
              </div>
              <button
                onClick={() => { setMenuOpen(false); router.push("/dashboard/settings"); }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-primary hover:bg-bg-light transition-colors"
              >
                <Settings className="w-4 h-4 text-muted-text" />
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
