"use client";

import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleGithubSignIn = async () => {
    setAuthError(null);
    if (!supabase) {
      setAuthError("Supabase client is NULL — env vars may not be loaded. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setAuthError(`OAuth error: ${error.message}`);
        console.error("GitHub OAuth error:", error);
      } else {
        console.log("OAuth response:", data);
      }
    } catch (err: any) {
      setAuthError(`Exception: ${err.message}`);
      console.error("GitHub OAuth exception:", err);
    }
  };

  return (
    <div>
      <SignIn1
        onGithubSignIn={handleGithubSignIn}
        authError={authError}
      />
    </div>
  );
}
