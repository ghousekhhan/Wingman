"use client";

import { ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Plane, Car, Cpu, DollarSign, Clock, Users } from "lucide-react";

interface RecoveryViewProps {
  recoveryCase: any;
  status: string;
}

export default function RecoveryView({ recoveryCase, status }: RecoveryViewProps) {
  if (!recoveryCase) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-[#10121a] p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-base font-bold text-white">No Active Disruptions</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            The journey is currently healthy and operating nominally under continuous radar. If an external disruption occurs, the full causal recovery case will appear here.
          </p>
        </div>
      </div>
    );
  }

  const options = recoveryCase.options || [];
  const selectedOption = options.find((o: any) => o.isSelected) || options[0];

  return (
    <div className="space-y-6">
      {/* Top Recovery Header */}
      <div className="rounded-xl border border-zinc-800 bg-[#10121a] p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              CASE: {recoveryCase.caseNumber || "RC-001"}
            </span>
            <h3 className="text-lg font-bold text-white">Active Journey Recovery</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-400">Current Phase:</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
              {recoveryCase.status || status}
            </span>
          </div>
        </div>

        {/* Causal Analysis Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Trigger Event</div>
            <div className="font-semibold text-rose-400">{recoveryCase.triggerEvent || "Flight HYD-GOI Cancelled"}</div>
            <div className="text-[11px] text-zinc-400">Telemetry: External Fact</div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Affected Travellers</div>
            <div className="font-semibold text-white">5 Family Members</div>
            <div className="text-[11px] text-zinc-400">Rahul, Meera, Arjun, Sara, Kabir</div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Protected Commitment</div>
            <div className="font-semibold text-amber-400">Sister&apos;s Wedding</div>
            <div className="text-[11px] text-zinc-400">Hard Deadline: 6:00 PM</div>
          </div>

          <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 space-y-1">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Critical Constraint</div>
            <div className="font-semibold text-indigo-400">Meera Accessibility</div>
            <div className="text-[11px] text-zinc-400">Wheelchair ramp & group continuity</div>
          </div>
        </div>
      </div>

      {/* Evaluated Recovery Options Comparison Matrix (Section 13 Step 4-5) */}
      <div className="rounded-xl border border-zinc-800 bg-[#10121a] p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div>
            <h4 className="text-sm font-bold text-white">Recovery Options Evaluated by Wingman</h4>
            <p className="text-xs text-zinc-400">
              The agent evaluates all candidates against timing, group continuity, accessibility, and spending authority.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">{options.length} Candidates Evaluated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {options.map((opt: any) => {
            const isChosen = opt.isSelected || opt.optionLabel === "Option A";

            return (
              <div
                key={opt.id}
                className={`p-4 rounded-xl border transition-all space-y-3 relative ${
                  isChosen
                    ? "border-emerald-600 bg-emerald-950/20 shadow-lg shadow-emerald-950/40"
                    : "border-zinc-800 bg-zinc-900/50 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">
                    {opt.optionLabel}
                  </span>
                  {isChosen ? (
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      SELECTED
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-900">
                      REJECTED
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-xl font-bold text-white">
                    ₹{opt.cost?.toLocaleString("en-IN")}
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    Arrival: <span className="font-semibold text-zinc-200">{opt.arrivalTime}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Group Seats</span>
                    <span className={opt.satisfiesGroup ? "text-emerald-400" : "text-rose-400 font-semibold"}>
                      {opt.passengersTogether}/5 seats together
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Deadline (6 PM)</span>
                    <span className={opt.satisfiesDeadline ? "text-emerald-400" : "text-rose-400 font-semibold"}>
                      {opt.satisfiesDeadline ? "Satisfied" : "Misses Wedding"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Budget Limit</span>
                    <span className={opt.satisfiesAuthority ? "text-emerald-400" : "text-rose-400 font-semibold"}>
                      {opt.satisfiesAuthority ? "Authorized" : "Exceeds ₹10k"}
                    </span>
                  </div>
                </div>

                {opt.rejectionReason && (
                  <div className="p-2 rounded bg-rose-950/40 border border-rose-900/60 text-[10px] text-rose-300">
                    {opt.rejectionReason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Action & Connector Execution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flight Connector Execution */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-400 uppercase font-bold flex items-center gap-1.5">
              <Plane className="w-4 h-4" />
              Connector: Passenger Travel
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              VERIFIED ACTIVE
            </span>
          </div>

          <div className="space-y-1">
            <h5 className="text-sm font-bold text-white">IndiGo 6E-891 (Replacement)</h5>
            <p className="text-xs text-zinc-400">
              HYD (3:45 PM) → GOI (5:20 PM) • 5 Confirmed E-Tickets Issued
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 text-xs font-mono space-y-1 text-zinc-300">
            <div>PNR: WNG8912 • Settlement: ₹6,400</div>
            <div className="text-emerald-400">Special Service: Wheelchair Assistance (Meera) LOCKED</div>
          </div>
        </div>

        {/* Mobility Transfer Connector Execution */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-[#10121a] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-indigo-400 uppercase font-bold flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              Connector: Mobility / Ground Transfer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              VERIFIED ACTIVE
            </span>
          </div>

          <div className="space-y-1">
            <h5 className="text-sm font-bold text-white">Accessible Luxury 6-Seater Van</h5>
            <p className="text-xs text-zinc-400">
              GoaMobility Pro • Dabolim Arrivals (5:35 PM Pickup) → Vivanta Panaji
            </p>
          </div>

          <div className="p-3 rounded-lg bg-black/40 border border-zinc-800/80 text-xs font-mono space-y-1 text-zinc-300">
            <div>Ref: TRF-GOA-8841 • Chauffeur: Santosh Naik</div>
            <div className="text-emerald-400">Equipment: Hydraulic Wheelchair Ramp Certified</div>
          </div>
        </div>
      </div>
    </div>
  );
}
