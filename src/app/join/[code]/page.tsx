"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, Check, Heart, User, Users, Accessibility, DollarSign, Clock, Sparkles } from "lucide-react";

export default function JoinJourneyPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const roomCode = params.code || "ROOM-WING01";

  const [name, setName] = useState("Meera");
  const [role, setRole] = useState("Grandmother");
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([
    "Accessibility",
    "Stay with my group",
    "Cannot travel alone",
  ]);
  const [authority, setAuthority] = useState<number>(5000);
  const [submitting, setSubmitting] = useState(false);

  const constraintOptions = [
    { id: "ARRIVE ON TIME", label: "ARRIVE ON TIME", desc: "Never miss the event deadline" },
    { id: "STAY WITH MY GROUP", label: "STAY WITH MY GROUP", desc: "Never split on separate itineraries" },
    { id: "ACCESSIBILITY", label: "ACCESSIBILITY", desc: "Wheelchair assistance & ramp vans required" },
    { id: "CANNOT TRAVEL ALONE", label: "CANNOT TRAVEL ALONE", desc: "Must remain accompanied at all times" },
    { id: "KEEP COST LOW", label: "KEEP COST LOW", desc: "Prioritize budget alternatives" },
    { id: "COMFORT", label: "COMFORT", desc: "Prefer spacious seating & direct legs" },
    { id: "AVOID LONG WALKS", label: "AVOID LONG WALKS", desc: "Direct terminal gate escorts" },
  ];

  const toggleConstraint = (label: string) => {
    if (selectedConstraints.includes(label)) {
      setSelectedConstraints(selectedConstraints.filter((c) => c !== label));
    } else {
      setSelectedConstraints([...selectedConstraints, label]);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`/api/journey/${roomCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          constraints: selectedConstraints,
          individualAuthority: authority,
        }),
      });

      router.push(`/journey/${roomCode}`);
    } catch (err) {
      console.error(err);
      router.push(`/journey/${roomCode}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white p-6">
      {/* Top Bar */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between pb-6 border-b border-zinc-800">
        <Link href="/" className="flex items-center space-x-2 text-zinc-400 hover:text-white text-xs font-mono transition">
          <Shield className="w-4 h-4 text-indigo-400" />
          <span>WINGMAN</span>
        </Link>
        <span className="text-xs font-mono text-zinc-400">ROOM: {roomCode}</span>
      </header>

      {/* Main Join & Constraint Choice Form */}
      <main className="max-w-xl mx-auto w-full py-8 space-y-8 my-auto">
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-indigo-950 text-indigo-300 border border-indigo-800">
            <Users className="w-3.5 h-3.5" />
            <span>Invitation Acceptance</span>
          </div>
          <h1 className="text-3xl font-extrabold">You&apos;re joining Rahul&apos;s Goa Wedding journey.</h1>
          <p className="text-xs text-zinc-400">
            Tell Wingman who you are and what non-negotiable constraints you need protected.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Meera"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase">Your Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Grandmother"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Constraint Onboarding: Choice Cards (Section 9) */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-zinc-300 uppercase block font-semibold">
              What should Wingman never compromise for you?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {constraintOptions.map((opt) => {
                const isSelected = selectedConstraints.some(
                  (c) => c.toLowerCase() === opt.label.toLowerCase()
                );

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleConstraint(opt.label)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-950"
                        : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">{opt.label}</div>
                      <div className="text-[11px] text-zinc-400">{opt.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "bg-indigo-600 text-white" : "border border-zinc-700"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Autonomous Spending Authority */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-mono text-zinc-300 uppercase block font-semibold">
              What can Wingman do without asking you?
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1000, 3000, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAuthority(amt)}
                  className={`p-3 rounded-xl border text-center transition ${
                    authority === amt
                      ? "border-indigo-500 bg-indigo-950/40 text-white font-bold"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-sm">₹{amt.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">Limit</div>
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-900/40 transition flex items-center justify-center gap-2 group"
          >
            <span>{submitting ? "JOINING ROOM..." : "JOIN JOURNEY ROOM"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </form>
      </main>

      <footer className="text-center text-[11px] font-mono text-zinc-600 pt-6">
        Wingman Agent Protection • Individual Persona Engine
      </footer>
    </div>
  );
}
