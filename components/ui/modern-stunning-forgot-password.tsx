"use client";

import * as React from "react";
import Link from "next/link";
import { Mic, ArrowLeft, CheckCircle2 } from "lucide-react";

interface ForgotPasswordProps {
  onResetPassword?: (email: string) => void;
  loading?: boolean;
}

const ForgotPassword1 = ({ onResetPassword, loading }: ForgotPasswordProps) => {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [sent, setSent] = React.useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleReset = () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSent(true);
    onResetPassword?.(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleReset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F17] relative overflow-hidden w-full">
      {/* Grid BG */}
      <div
        className="absolute inset-0 opacity-20 h-full w-full
        bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]
        bg-[size:6rem_5rem]
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      {/* Radial Accent */}
      <div
        className="absolute left-1/2 bottom-0 h-[500px] w-[700px] md:w-[1000px]
        -translate-x-1/2 rounded-[100%] border-t border-[#4F7CFF]/30 bg-[#0B0F17]
        bg-[radial-gradient(closest-side,#0B0F17_82%,#4F7CFF_150%)]
        shadow-[0_-20px_50px_rgba(79,124,255,0.12)]"
      />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/[0.07] to-[#0B0F17]/80 backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center border border-white/[0.08]">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#4F7CFF]/20 mb-4 shadow-[0_0_25px_rgba(79,124,255,0.3)]">
          <Mic className="w-6 h-6 text-[#4F7CFF]" />
        </div>

        {sent ? (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
              Check your email
            </h2>
            <p className="text-sm text-gray-400 mb-6 text-center leading-relaxed">
              We sent a password reset link to<br />
              <span className="text-white font-medium">{email}</span>
            </p>
            <button
              onClick={() => setSent(false)}
              className="w-full bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-white font-medium px-5 py-3 rounded-full transition-all mb-3 text-sm"
            >
              Try a different email
            </button>
            <Link
              href="/auth"
              className="text-sm text-gray-400 hover:text-[#4F7CFF] transition-colors inline-flex items-center gap-2 mt-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
              Forgot password?
            </h2>
            <p className="text-sm text-gray-400 mb-6 text-center">
              No worries, we&apos;ll send you reset instructions
            </p>

            <div className="flex flex-col w-full gap-4">
              <div className="w-full flex flex-col gap-3">
                <input
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  className="w-full px-5 py-3 rounded-xl bg-white/[0.07] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 border border-white/[0.08] transition-all"
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {error && (
                  <div className="text-sm text-red-400 text-left">{error}</div>
                )}
              </div>

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-[#4F7CFF] hover:bg-[#3B66E0] text-white font-medium px-5 py-3 rounded-full shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Reset password"}
              </button>

              <Link
                href="/auth"
                className="text-sm text-gray-400 hover:text-[#4F7CFF] transition-colors inline-flex items-center gap-2 justify-center mt-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { ForgotPassword1 };
