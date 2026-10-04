"use client";

import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Clock, Users, Accessibility, Check } from "lucide-react";

interface ActionCardProps {
  status: string; // "MONITORING" | "RECOVERING" | "RECOVERED" | "DECISION_REQUIRED"
  recoveryCase?: any;
  agentOutput?: any;
  onApproveDecision?: () => void;
  onRequestLateArrival?: () => void;
}

export default function ActionCard({
  status,
  recoveryCase,
  agentOutput,
  onApproveDecision,
  onRequestLateArrival,
}: ActionCardProps) {
  // If still in peaceful MONITORING and no recovery case yet
  if (status === "MONITORING" && !recoveryCase && !agentOutput) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-b from-[#12141c] to-[#0c0d12] p-5 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-semibold tracking-wider text-emerald-400 uppercase">
                Continuous Autonomous Radar
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">Active Journey Protection</h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Wingman is continuously monitoring your flight (IndiGo 6E-542), Goa ground transfer, hotel reservations, and the 6:00 PM wedding arrival deadline.
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Protection Level</span>
            <div className="text-sm font-semibold text-zinc-300">Level 4 Autonomous</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> 5 Travellers Tracked
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Accessibility className="w-3.5 h-3.5 text-indigo-400" /> Meera Accessibility Active
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Hard Deadline: 6:00 PM
            </span>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Telemetry: All Nominal</span>
        </div>
      </div>
    );
  }

  // If in DECISION_REQUIRED state (Authority exceeded simulation)
  if (status === "DECISION_REQUIRED") {
    return (
      <div className="relative overflow-hidden rounded-xl border border-amber-600/60 bg-gradient-to-b from-[#1f160b] to-[#120e07] p-6 shadow-2xl animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-amber-800/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
              Bounded Autonomy - Human Decision Required
            </span>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
            Case RC-002
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xl font-bold text-white">
              Autonomous Spending Authority Exceeded
            </h3>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Wingman evaluated all available alternatives. The only recovery flight that protects the sister&apos;s 6:00 PM wedding arrival and accommodates all 5 travellers with Meera&apos;s wheelchair ramp costs <span className="font-semibold text-white">₹14,800</span>.
            </p>
            <div className="p-3.5 rounded-lg bg-black/40 border border-amber-900/50 text-xs text-amber-200/90 space-y-1">
              <div className="font-semibold text-amber-400">Wingman Policy Rule:</div>
              <div>Autonomous limit is ₹10,000. Under Wingman Core Rules, the agent will never exceed spending bounds without explicit traveller authorization.</div>
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-3 rounded-xl bg-zinc-900/90 p-4 border border-zinc-800">
            <div className="text-xs font-mono text-zinc-400 uppercase">Your Decision</div>
            {onApproveDecision && (
              <button
                onClick={onApproveDecision}
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs tracking-wide shadow-lg shadow-emerald-900/40 transition active:scale-98"
              >
                Approve ₹14,800 & Protect Wedding
              </button>
            )}
            {onRequestLateArrival && (
              <button
                onClick={onRequestLateArrival}
                className="w-full py-2 px-4 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-xs border border-zinc-700 transition"
              >
                Accept Late Arrival (Option B - ₹8,900)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RECOVERED or ACTIVE RECOVERY (Section 12 exact representation)
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#0e1017] p-6 shadow-2xl transition-all">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
            {status === "RECOVERED" ? "Journey Continuity Recovered" : "Wingman Is Acting"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500">Authority: ₹10,000</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            Case {recoveryCase?.caseNumber || "RC-001"}
          </span>
        </div>
      </div>

      {/* Main Grid: Disruption vs Autonomous Recovery */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Disruption Event */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-rose-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-rose-400 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Flight Disruption Injected
            </span>
            <span className="text-[11px] font-mono text-zinc-500">14:10 IST</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Flight HYD-GOI Cancelled</h4>
            <p className="text-xs text-zinc-400 mt-1">
              Your Hyderabad → Goa flight (6E-542) was cancelled by the carrier due to technical inspection.
            </p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-zinc-800/60 text-xs">
            <div className="text-[11px] font-mono text-zinc-400 uppercase">Impact Analysis:</div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-rose-400 font-bold">•</span>
              <span>Sister&apos;s wedding arrival at risk (6:00 PM deadline)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-rose-400 font-bold">•</span>
              <span>5 travellers affected (Rahul, Meera, Arjun, Sara, Kabir)</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-rose-400 font-bold">•</span>
              <span>Meera&apos;s accessibility requirement must be preserved</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="text-rose-400 font-bold">•</span>
              <span>Airport transfer GOA-CAB-88 invalidated</span>
            </div>
          </div>
        </div>

        {/* Right: Autonomous Action & Verification */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-zinc-900/80 to-emerald-950/40 border border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold text-emerald-400 uppercase flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Autonomous Action Selected & Executed
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Option A
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-bold text-white">₹6,400</span>
                <span className="text-xs text-zinc-400 ml-2">Total settlement</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-zinc-400">Goa Arrival</span>
                <div className="text-base font-bold text-emerald-400">5:20 PM</div>
              </div>
            </div>

            {/* Satisfaction Badges */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-black/40 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>5 Travellers Together</span>
              </div>
              <div className="p-2 rounded bg-black/40 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Accessibility Preserved</span>
              </div>
            </div>

            {/* Downstream Transfer Chaining */}
            <div className="p-2.5 rounded bg-zinc-900/90 border border-zinc-800 text-xs space-y-1">
              <div className="flex items-center justify-between text-zinc-400 font-mono text-[11px]">
                <span>DOWNSTREAM MOBILITY</span>
                <span className="text-emerald-400">CONFIRMED & SYNCED</span>
              </div>
              <p className="text-zinc-200">
                New Accessible Van (TRF-GOA-8841) dispatched for 5:35 PM airport pickup.
              </p>
            </div>
          </div>

          {/* Verification Bar */}
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400">AUTONOMOUS LIMIT: ₹10,000</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              VERIFIED ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Outcome Statement */}
      <div className="mt-4 p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Outcome Protected:</strong> Your family reaches the wedding before 6:00 PM. Meera&apos;s wheelchair ramp is confirmed on flight and van.
          </span>
        </div>
        <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider hidden sm:block">
          STATUS: RECOVERED
        </span>
      </div>
    </div>
  );
}
