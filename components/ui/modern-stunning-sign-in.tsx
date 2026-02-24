"use client";

import * as React from "react";
import Link from "next/link";
import { Mic } from "lucide-react";

interface SignInProps {
  onGithubSignIn?: () => void;
  onEmailSignIn?: (email: string, password: string) => void;
  loading?: boolean;
  authError?: string | null;
  debugInfo?: string;
  onDevBypass?: () => void;
}

const SignIn1 = ({ onGithubSignIn, onEmailSignIn, loading, authError, debugInfo, onDevBypass }: SignInProps) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onEmailSignIn?.(email, password);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignIn();
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

        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Sign in to your RepLog AI account
        </p>

        {/* Debug Info */}
        {debugInfo && (
          <div className="w-full mb-4 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-mono">
            🔍 {debugInfo}
          </div>
        )}

        {/* Auth Error */}
        {authError && (
          <div className="w-full mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
            ⚠️ {authError}
          </div>
        )}

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.07] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 border border-white/[0.08] transition-all"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.07] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 border border-white/[0.08] transition-all"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-gray-400 hover:text-[#4F7CFF] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <hr className="border-white/[0.06]" />

          <div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full bg-[#4F7CFF] hover:bg-[#3B66E0] text-white font-medium px-5 py-3 rounded-full shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)] transition-all mb-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* GitHub Sign In */}
            <button
              onClick={onGithubSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] rounded-full px-5 py-3 font-medium text-white shadow transition-all mb-2 text-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Continue with GitHub
            </button>

            {/* Dev Bypass Button */}
            {onDevBypass && (
              <button
                onClick={onDevBypass}
                className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-full px-5 py-2.5 font-medium text-amber-400 transition-all mb-2 text-xs"
              >
                🛠️ Dev Bypass — Skip to Dashboard
              </button>
            )}

            <div className="w-full text-center mt-3">
              <span className="text-xs text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="underline text-white/80 hover:text-[#4F7CFF] transition-colors"
                >
                  Sign up, it&apos;s free!
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Social proof */}
      <div className="relative z-10 mt-12 flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm mb-3">
          Join <span className="font-medium text-white">thousands</span> of
          sales reps already using RepLog AI.
        </p>
        <div className="flex -space-x-2">
          <img
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=80&h=80&fit=crop&crop=face"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#0B0F17] object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#0B0F17] object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#0B0F17] object-cover"
          />
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face"
            alt="user"
            className="w-8 h-8 rounded-full border-2 border-[#0B0F17] object-cover"
          />
          <div className="w-8 h-8 rounded-full border-2 border-[#0B0F17] bg-[#4F7CFF]/20 flex items-center justify-center text-[10px] text-[#4F7CFF] font-bold">
            +2k
          </div>
        </div>
      </div>
    </div>
  );
};

export { SignIn1 };
