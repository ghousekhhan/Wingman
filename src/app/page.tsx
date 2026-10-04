"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, X } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [roomCodeInput, setRoomCodeInput] = useState("");

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = roomCodeInput.trim() || "ROOM-WING01";
    router.push(`/join/${code}`);
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white p-6 font-sans">
      {/* Top Brand */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-widest text-sm text-white">WINGMAN</span>
        </div>
      </header>

      {/* Main Centered Hero */}
      <main className="max-w-2xl mx-auto text-center space-y-9 my-auto py-12">
        {/* Huge Typography */}
        <div className="space-y-4">
          <h1 className="text-6xl sm:text-8xl font-black tracking-tight text-white">
            WINGMAN
          </h1>
          <p className="text-2xl sm:text-3xl font-medium text-zinc-200 tracking-wide">
            Your journey has your back.
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto font-normal leading-relaxed">
          &ldquo;Tell Wingman what matters. It protects the journey when plans change.&rdquo;
        </p>

        {/* Two Primary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/create"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-950 transition flex items-center justify-center gap-2 group"
          >
            <span>CREATE A JOURNEY</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>

          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-semibold text-zinc-200 border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-center"
          >
            <span>JOIN A JOURNEY</span>
          </button>
        </div>

        {/* Demo Fast Link */}
        <div className="pt-2">
          <Link
            href="/journey/ROOM-WING01"
            className="text-xs font-mono text-zinc-500 hover:text-indigo-400 transition"
          >
            Open Active Demo Journey (Goa Wedding) →
          </Link>
        </div>
      </main>

      {/* Ultra Minimal Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs font-mono text-zinc-600 py-4 border-t border-zinc-900">
        The booking is a transaction. The journey is the outcome.
      </footer>

      {/* Join Code Prompt Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#10121a] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold">Join a Journey</h3>
                <p className="text-xs text-zinc-400">Enter your Journey Room Code</p>
              </div>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-mono text-zinc-400 uppercase">Room Code</label>
                <input
                  type="text"
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value)}
                  placeholder="e.g. ROOM-WING01 or WINGMAN-7X42"
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none uppercase font-mono"
                  autoFocus
                />
                <p className="text-[11px] text-zinc-500">
                  Leave blank to join the seeded demo room (ROOM-WING01).
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2"
              >
                <span>CONTINUE TO JOIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
