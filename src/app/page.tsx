"use client";

import Link from "next/link";
import { Shield, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Play, Users, Lock, Compass } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-600/15 via-indigo-900/5 to-transparent blur-3xl pointer-events-none"></div>

      {/* Top Minimal Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-widest text-sm text-white">WINGMAN</span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/journey/ROOM-WING01"
            className="text-xs font-mono text-zinc-400 hover:text-indigo-300 transition flex items-center gap-1.5"
          >
            <span>Open Demo Room (ROOM-WING01)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section (Section 4 exact prompt requirements) */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12 text-center space-y-10 my-auto">
        {/* Core Agent Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono tracking-wider uppercase bg-indigo-950/80 border border-indigo-800 text-indigo-300 shadow-sm animate-pulse-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          Autonomous Journey Continuity Agent
        </div>

        {/* Title & Tagline */}
        <div className="space-y-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white">
            WINGMAN
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-zinc-300 tracking-wide">
            Your journey has your back.
          </p>
        </div>

        {/* Core Philosophy Statement */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
          &ldquo;An autonomous agent that protects the outcome of your journey when reality changes.&rdquo;
        </p>

        {/* Principle Highlight Card */}
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-center gap-2 font-mono">
          <span className="text-zinc-500">PHILOSOPHY:</span>
          <span className="text-zinc-200">The booking is a transaction. The journey is the outcome.</span>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {/* Primary CTA */}
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-900/40 hover:shadow-indigo-900/60 transition flex items-center justify-center gap-2 group"
          >
            <span>CREATE A JOURNEY</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>

          {/* Secondary CTA */}
          <Link
            href="/join/ROOM-WING01"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-center gap-2"
          >
            <span>JOIN A JOURNEY</span>
          </Link>
        </div>

        {/* Quick Demo Story Launcher */}
        <div className="pt-6">
          <Link
            href="/journey/ROOM-WING01"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-indigo-900/40 text-xs text-indigo-300 font-mono transition"
          >
            <Play className="w-3.5 h-3.5 fill-current text-indigo-400" />
            <span>Launch Primary Demo: Rahul&apos;s Goa Wedding (5 Travellers • Sister&apos;s Wedding)</span>
          </Link>
        </div>
      </main>

      {/* 8-Stage Agent Loop Bar */}
      <footer className="relative z-10 w-full border-t border-zinc-800/80 bg-[#090a0f]/80 backdrop-blur-sm py-4">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-mono text-zinc-500 tracking-wider">
          <span className="text-indigo-400 font-semibold">UNDERSTAND</span>
          <span>→</span>
          <span className="text-zinc-400">PLAN</span>
          <span>→</span>
          <span className="text-zinc-400">COMMIT</span>
          <span>→</span>
          <span className="text-emerald-400 font-semibold">MONITOR</span>
          <span>→</span>
          <span className="text-zinc-400">PROTECT</span>
          <span>→</span>
          <span className="text-zinc-400">RECOVER</span>
          <span>→</span>
          <span className="text-zinc-400">VERIFY</span>
          <span>→</span>
          <span className="text-emerald-400 font-semibold">COMPLETE</span>
        </div>
      </footer>
    </div>
  );
}
