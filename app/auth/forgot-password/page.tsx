"use client";

import { ForgotPassword1 } from "@/components/ui/modern-stunning-forgot-password";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const handleResetPassword = async (email: string) => {
    if (!supabase) {
      alert("Password reset email sent! (Demo mode)");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/settings`,
    });
    if (error) {
      console.error("Reset error:", error.message);
    } else {
      alert("Check your email for a password reset link.");
    }
  };

  return <ForgotPassword1 onResetPassword={handleResetPassword} />;
}
