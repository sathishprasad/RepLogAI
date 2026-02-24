"use client";

import * as React from "react";
import Link from "next/link";
import { Mic } from "lucide-react";

interface SignUpProps {
  onGoogleSignUp?: () => void;
  onEmailSignUp?: (name: string, email: string, password: string) => void;
  loading?: boolean;
}

const SignUp1 = ({ onGoogleSignUp, onEmailSignUp, loading }: SignUpProps) => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    onEmailSignUp?.(name, email, password);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSignUp();
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
          Create account
        </h2>
        <p className="text-sm text-gray-400 mb-6 text-center">
          Start turning voice notes into CRM entries
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <input
              placeholder="Full name"
              type="text"
              value={name}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.07] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 border border-white/[0.08] transition-all"
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
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
            <input
              placeholder="Confirm password"
              type="password"
              value={confirmPassword}
              className="w-full px-5 py-3 rounded-xl bg-white/[0.07] text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F7CFF]/50 border border-white/[0.08] transition-all"
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
          </div>

          <hr className="border-white/[0.06]" />

          <div>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-[#4F7CFF] hover:bg-[#3B66E0] text-white font-medium px-5 py-3 rounded-full shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)] transition-all mb-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            {/* Google Sign Up */}
            <button
              onClick={onGoogleSignUp}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] rounded-full px-5 py-3 font-medium text-white shadow transition-all mb-2 text-sm disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="w-full text-center mt-3">
              <span className="text-xs text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/auth"
                  className="underline text-white/80 hover:text-[#4F7CFF] transition-colors"
                >
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="relative z-10 mt-8 text-center">
        <p className="text-xs text-gray-500 max-w-xs">
          By creating an account, you agree to our{" "}
          <a href="#" className="underline hover:text-gray-300 transition-colors">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-gray-300 transition-colors">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export { SignUp1 };
