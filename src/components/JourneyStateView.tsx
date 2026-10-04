"use client";

import { Shield, Users, Calendar, Clock, DollarSign, AlertCircle, CheckCircle2, Link2, Key, Target } from "lucide-react";

interface JourneyStateViewProps {
  journey: any;
}

export default function JourneyStateView({ journey }: JourneyStateViewProps) {
  if (!journey) return null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-zinc-800 bg-[#0e1017] p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Journey Digital Twin</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                STATE ID: {journey.code}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Live synchronized mathematical state holding commitments, constraints, and authority bounds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">State Vector</span>
            <div className="text-xs font-mono text-emerald-400 font-semibold">SYNCHRONIZED</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 font-mono text-xs text-zinc-300">
            v2.4-ACTIVE
          </div>
        </div>
      </div>

      {/* Grid of 8 Sections (Section 10 Requirements) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. OBJECTIVE */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              1. Objective
            </span>
            <Target className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">{journey.title}</h4>
            <p className="text-xs text-zinc-400">{journey.destination} • {journey.purpose}</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            Origin: <span className="text-zinc-200">{journey.origin}</span>
          </div>
        </div>

        {/* 2. PEOPLE */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              2. People
            </span>
            <Users className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">{journey.members?.length || 5}</div>
            <p className="text-xs text-zinc-400">Coordinated Travellers</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-300 flex flex-wrap gap-1">
            {journey.members?.map((m: any) => (
              <span key={m.id} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px]">
                {m.user?.name}
              </span>
            ))}
          </div>
        </div>

        {/* 3. COMMITMENTS */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              3. Commitments
            </span>
            <Clock className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Sister&apos;s Wedding (7:00 PM)</h4>
            <p className="text-xs text-amber-400 font-semibold">
              Hard Deadline: {journey.arrivalDeadline}
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            PROTECTED OUTCOME
          </div>
        </div>

        {/* 4. DEPENDENCIES */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              4. Dependencies
            </span>
            <Link2 className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-mono text-zinc-300">
              Flight → Van → Hotel → Ceremony
            </div>
            <p className="text-xs text-zinc-400">Strict causal link graph</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            Auto-invalidation & resync active
          </div>
        </div>

        {/* 5. CONSTRAINTS */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              5. Constraints
            </span>
            <Shield className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-indigo-300 font-semibold">• Keep group together (5)</div>
            <div className="text-indigo-300 font-semibold">• Meera: Wheelchair ramp</div>
            <div className="text-indigo-300 font-semibold">• Meera: Never travel alone</div>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-mono">
            Non-negotiable invariants
          </div>
        </div>

        {/* 6. AUTHORITY */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              6. Authority
            </span>
            <Key className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-white">
              ₹{journey.authorityLimit?.toLocaleString("en-IN") || "10,000"}
            </div>
            <p className="text-xs text-zinc-400">Autonomous Spending Cap</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            Hard boundary: halts at excess
          </div>
        </div>

        {/* 7. RISKS */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              7. Risks
            </span>
            <AlertCircle className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="space-y-1 text-xs">
            <div className="text-zinc-300">Weather delay buffer: 40 min</div>
            <div className="text-zinc-300">Ground traffic index: Moderate</div>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Telemetry Nominal
          </div>
        </div>

        {/* 8. CURRENT STATUS */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
              8. Status
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <div className="space-y-1">
            <div className="text-xl font-bold text-white font-mono">{journey.status}</div>
            <p className="text-xs text-zinc-400">Continuous Agent Radar</p>
          </div>
          <div className="pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            Last agent tick: seconds ago
          </div>
        </div>
      </div>
    </div>
  );
}
