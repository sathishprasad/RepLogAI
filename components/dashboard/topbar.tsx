"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export function Topbar() {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }
  }, [supabase]);

  const initial = user?.user_metadata?.full_name?.[0] || user?.email?.[0] || "U";
  const name = user?.user_metadata?.full_name || user?.email || "User";
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
          <input
            type="text"
            placeholder="Search entries..."
            className="pl-10 pr-4 py-2 w-64 bg-bg-light rounded-xl text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-bg-light rounded-xl transition-colors">
          <Bell className="w-5 h-5 text-muted-text" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
              {initial.toUpperCase()}
            </div>
          )}
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary leading-none">{name}</p>
            <p className="text-xs text-muted-text mt-0.5">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
