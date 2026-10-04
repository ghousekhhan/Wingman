"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowRight,
  Mic,
  Clock,
  HeartHandshake,
  Users,
  Coins,
  Accessibility,
  GitFork,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Radio,
  X,
  Compass,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isTryModalOpen, setIsTryModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCodeInput.trim() || "ROOM-WING01";
    router.push(`/journey/${code}`);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-indigo-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[400px] bg-cyan-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[400px] bg-purple-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-800/60 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-950/60 border border-indigo-400/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold tracking-widest text-sm text-white block">WINGMAN</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Journey Continuity Agent</span>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          <a
            href="#how-it-works"
            className="text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition px-3 py-1.5"
          >
            How it works
          </a>
          <a
            href="#what-we-protect"
            className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-zinc-400 hover:text-white transition px-3 py-1.5"
          >
            What it protects
          </a>
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="text-xs font-mono px-3.5 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white transition"
          >
            Enter Code
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-medium backdrop-blur-sm">
          <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span>The booking is a transaction. The journey is the outcome.</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-white">
            WINGMAN
          </h1>
          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 tracking-wide">
            Your journey has your back.
          </p>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed">
          &ldquo;Tell Wingman where you&apos;re going, what matters, and what you&apos;re unwilling to compromise on. It builds and protects your journey as things change.&rdquo;
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            onClick={() => setIsTryModalOpen(true)}
            className="w-full sm:w-auto px-9 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-base font-bold text-white shadow-xl shadow-indigo-950/80 transition flex items-center justify-center gap-3 group border border-indigo-400/30"
          >
            <Mic className="w-5 h-5 text-indigo-200 group-hover:scale-110 transition" />
            <span>TRY WINGMAN</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-sm font-semibold text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-center"
          >
            <span>HOW IT WORKS</span>
          </a>
        </div>

        {/* Quick Demo Access Pill */}
        <div className="pt-4">
          <Link
            href="/journey/ROOM-WING01"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-indigo-300 transition bg-zinc-900/60 px-4 py-2 rounded-full border border-zinc-800/80"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Explore Active Demo: Goa Wedding (ROOM-WING01)</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
          </Link>
        </div>
      </section>

      {/* Section: HOW IT WORKS (4 simple steps, minimal text, no jargon) */}
      <section id="how-it-works" className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-zinc-800/60">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Agent Architecture</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">How It Works</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto">
            Wingman is not a static planner or a generic chatbot. It is a living agent that owns your journey&apos;s continuity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-[#0e1017]/80 border border-zinc-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="text-4xl font-black text-zinc-800 group-hover:text-indigo-500/20 transition mb-4">01</div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">1. Tell Wingman</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Talk naturally about your journey. Speak your dates, destinations, people, and commitments in plain words.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-[#0e1017]/80 border border-zinc-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="text-4xl font-black text-zinc-800 group-hover:text-indigo-500/20 transition mb-4">02</div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">2. Wingman Understands</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              It identifies your commitments, constraints, people, and priorities. It asks only what is missing.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-[#0e1017]/80 border border-zinc-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="text-4xl font-black text-zinc-800 group-hover:text-indigo-500/20 transition mb-4">03</div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">3. Wingman Builds</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              It creates a living journey plan around what matters to you. Edit it conversationally at any time.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl bg-[#0e1017]/80 border border-zinc-800/80 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div className="text-4xl font-black text-zinc-800 group-hover:text-indigo-500/20 transition mb-4">04</div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 uppercase tracking-wide">4. Wingman Protects</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              When reality changes, it reassesses the journey, fixes broken dependencies, and helps recover the outcome.
            </p>
          </div>
        </div>
      </section>

      {/* Section: WHAT WINGMAN PROTECTS */}
      <section id="what-we-protect" className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t border-zinc-800/60">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Continuous Assurance</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">What Wingman Protects</h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto">
            Wingman doesn&apos;t merely protect airline or hotel bookings. It protects the outcome of the entire journey.
          </p>
        </div>

        {/* Featured Story Callout Card */}
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-zinc-900/90 border border-indigo-500/30 text-center space-y-4 mb-14 shadow-2xl">
          <p className="text-lg sm:text-xl font-medium text-zinc-200 italic leading-relaxed">
            &ldquo;You don&apos;t just need to reach Goa.<br />
            You need your grandmother with you.<br />
            You need to arrive before your sister&apos;s wedding.<br />
            You need to stay within your budget.<br />
            <span className="text-indigo-300 font-semibold not-italic">Those are the things Wingman protects.</span>&rdquo;
          </p>
        </div>

        {/* 7 Protection Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">TIME</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Monitors connection buffers, flight delays, traffic conditions, and hard arrival deadlines to preserve schedules.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">COMMITMENTS</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The wedding ceremony, the job interview, the client meeting. The ultimate reason you are travelling is protected first.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">PEOPLE</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Ensures families and travelling parties remain together. Prevents accidental separations during rebooking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">BUDGET & AUTHORITY</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Acts autonomously strictly within your pre-approved limit. Never spends excess funds without explicit permission.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Accessibility className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">ACCESSIBILITY</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enforces wheelchair lift vans, ramp assistance, and step-free transfers for elder or mobility-restricted travellers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <GitFork className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-base">DEPENDENCIES</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              When a flight cancels, the airport transfer invalidates too. Wingman automatically repairs the full chain.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-6xl mx-auto px-6 py-10 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div className="flex items-center space-x-2 font-mono">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span className="text-zinc-400 font-semibold">WINGMAN</span>
          <span>&mdash; The booking is a transaction. The journey is the outcome.</span>
        </div>
        <div className="text-zinc-500 font-mono text-[11px]">
          Powered by Gemini Agent &bull; Gnani Voice &bull; Pine Labs POS
        </div>
      </footer>

      {/* Modal: "TRY WINGMAN" -> "How are you travelling?" (SOLO vs GROUP) */}
      {isTryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-[#0e1017] p-8 shadow-2xl space-y-6 text-white relative">
            <button
              onClick={() => setIsTryModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2 text-center pt-2">
              <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">Start Your Journey</span>
              <h3 className="text-2xl sm:text-3xl font-black">How are you travelling?</h3>
              <p className="text-xs sm:text-sm text-zinc-400">
                Choose how you want to experience Wingman. No login required.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Option 1: SOLO */}
              <button
                onClick={() => {
                  setIsTryModalOpen(false);
                  router.push("/solo");
                }}
                className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-indigo-500 hover:bg-indigo-950/20 text-left transition group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
                  <Mic className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">SOLO</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Voice-first 1-on-1 interview with Wingman. Tell it what you&apos;re trying to do in natural speech.
                  </p>
                </div>
                <div className="text-xs font-semibold text-indigo-400 flex items-center gap-1 pt-1">
                  <span>Start voice interview</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </button>

              {/* Option 2: GROUP */}
              <button
                onClick={() => {
                  setIsTryModalOpen(false);
                  router.push("/group");
                }}
                className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500 hover:bg-purple-950/20 text-left transition group space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition">GROUP</h4>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Create a group journey, share a WhatsApp link, and invite members to enter their individual constraints.
                  </p>
                </div>
                <div className="text-xs font-semibold text-purple-400 flex items-center gap-1 pt-1">
                  <span>Create group link</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Join Code Prompt */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0e1017] p-6 shadow-2xl space-y-5 text-white relative">
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-bold">Join a Journey</h3>
              <p className="text-xs text-zinc-400">Enter your Journey Room Code from WhatsApp</p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. ROOM-WING01 or WINGMAN-7X42"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 uppercase text-center tracking-widest text-sm"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition"
                >
                  Join Journey Radar
                </button>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/journey/ROOM-WING01"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="text-xs font-mono text-zinc-500 hover:text-indigo-400 transition"
                >
                  Or view seeded demo: ROOM-WING01 &rarr;
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
