"use client";

import Link from "next/link";
import { Shield, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white p-6 font-sans">
      {/* Top Brand */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/30">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-widest text-sm text-white">WINGMAN</span>
        </div>
      </header>

      {/* Main Centered Hero */}
      <main className="max-w-2xl mx-auto text-center space-y-8 my-auto py-12">
        {/* Huge Typography */}
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white">
            WINGMAN
          </h1>
          <p className="text-2xl sm:text-3xl font-medium text-zinc-300 tracking-wide">
            Your journey has your back.
          </p>
        </div>

        {/* Short Explanation */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
          &ldquo;An autonomous agent that protects your journey when plans change.&rdquo;
        </p>

        {/* Two Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-950 transition flex items-center justify-center gap-2 group"
          >
            <span>CREATE JOURNEY</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>

          <Link
            href="/join/ROOM-WING01"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold text-zinc-300 border border-zinc-800 transition flex items-center justify-center"
          >
            <span>JOIN JOURNEY</span>
          </Link>
        </div>

        {/* Small secondary link */}
        <div className="pt-4">
          <Link
            href="/journey/ROOM-WING01"
            className="text-xs font-mono text-zinc-500 hover:text-indigo-400 transition"
          >
            Try a disruption → Load Demo Journey (Goa Wedding)
          </Link>
        </div>
      </main>

      {/* Ultra Minimal Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-[11px] font-mono text-zinc-600 py-2">
        The booking is a transaction. The journey is the outcome.
      </footer>
    </div>
  );
}
