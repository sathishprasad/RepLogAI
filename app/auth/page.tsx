"use client";

import { SignIn1 } from "@/components/ui/modern-stunning-sign-in";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();
  const [authError, setAuthError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    setDebugInfo(`Supabase client: ${supabase ? "initialized" : "NULL (bypass mode)"}`);
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

  const handleEmailSignIn = async (email: string, password: string) => {
    setAuthError(null);
    if (!supabase) {
      setAuthError("Supabase client is NULL");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(`Email auth error: ${error.message}`);
      console.error("Auth error:", error.message);
    }
  };

  const handleDevBypass = () => {
    router.push("/dashboard");
  };

  return (
    <div>
      <SignIn1
        onGithubSignIn={handleGithubSignIn}
        onEmailSignIn={handleEmailSignIn}
        authError={authError}
        debugInfo={debugInfo}
        onDevBypass={handleDevBypass}
      />
    </div>
  );
}
