"use client";

import * as React from "react";
import Link from "next/link";
import { Mic } from "lucide-react";

interface SignUpProps {
  onGithubSignUp?: () => void;
  loading?: boolean;
}

const SignUp1 = ({ onGithubSignUp, loading }: SignUpProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B0F17] relative overflow-hidden w-full">
      <div
        className="absolute inset-0 opacity-20 h-full w-full
        bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)]
        bg-[size:6rem_5rem]
        [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
      />

      <div
        className="absolute left-1/2 bottom-0 h-[500px] w-[700px] md:w-[1000px]
        -translate-x-1/2 rounded-[100%] border-t border-[#4F7CFF]/30 bg-[#0B0F17]
        bg-[radial-gradient(closest-side,#0B0F17_82%,#4F7CFF_150%)]
        shadow-[0_-20px_50px_rgba(79,124,255,0.12)]"
      />

      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-br from-white/[0.07] to-[#0B0F17]/80 backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center border border-white/[0.08]">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#4F7CFF]/20 mb-4 shadow-[0_0_25px_rgba(79,124,255,0.3)]">
          <Mic className="w-6 h-6 text-[#4F7CFF]" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 text-center tracking-tight">
          Create your account
        </h2>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Sign up with GitHub to start turning voice notes into CRM entries
        </p>

        <button
          onClick={onGithubSignUp}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-[#4F7CFF] hover:bg-[#3B66E0] text-white font-medium px-5 py-3.5 rounded-full shadow-[0_4px_14px_0_rgba(79,124,255,0.39)] hover:shadow-[0_6px_20px_rgba(79,124,255,0.23)] transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          {loading ? "Creating account..." : "Continue with GitHub"}
        </button>

        <div className="w-full text-center mt-5">
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
