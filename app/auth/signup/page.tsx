"use client";

import { SignUp1 } from "@/components/ui/modern-stunning-sign-up";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClient();

  const handleGithubSignUp = async () => {
    if (!supabase) {
      router.push("/dashboard");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailSignUp = async (name: string, email: string, password: string) => {
    if (!supabase) {
      router.push("/dashboard");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Signup error:", error.message);
    }
  };

  return (
    <SignUp1
      onGithubSignUp={handleGithubSignUp}
      onEmailSignUp={handleEmailSignUp}
    />
  );
}
