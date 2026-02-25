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

  return (
    <SignUp1
      onGithubSignUp={handleGithubSignUp}
    />
  );
}
