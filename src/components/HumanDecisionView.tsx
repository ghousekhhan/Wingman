"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Car,
  Plane,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  DollarSign,
} from "lucide-react";

export interface DecisionOption {
  id: string;
  name: string;
  provider: string;
  referenceCode: string;
  cost: number;
  arrivalTime: string;
  departureTime: string;
  groupTogether: boolean;
  groupSeats: string;
  accessibility: boolean;
  tag: string;
  tagColor: "indigo" | "emerald" | "amber" | "rose";
  sacrificeText: string;
  recommended?: boolean;
}

interface HumanDecisionViewProps {
  disruptionTitle?: string;
  onOptionSelected: (option: DecisionOption) => Promise<void>;
  onClose?: () => void;
  authorityLimit?: number;
  isAuthorityExceeded?: boolean;
  exceededAmount?: number;
  onApproveExceeded?: () => Promise<void>;
}

export default function HumanDecisionView({
  disruptionTitle = "Flight HYD-GOI Cancelled",
  onOptionSelected,
  onClose,
  authorityLimit = 10000,
  isAuthorityExceeded = false,
  exceededAmount = 14800,
  onApproveExceeded,
}: HumanDecisionViewProps) {
  // Execution lifecycle states for Section 14:
  // "IDLE" | "BOOKING" | "BOOKED" | "VERIFYING" | "VERIFIED" | "TRANSFER_REPAIR_PROMPT" | "TRANSFER_REPAIRING" | "COMPLETED"
  const [executionStage, setExecutionStage] = useState<string>("IDLE");
  const [selectedOption, setSelectedOption] = useState<DecisionOption | null>(null);

  const options: DecisionOption[] = [
    {
      id: "OPT-1",
      name: "OPTION 1",
      provider: "IndiGo Express",
      referenceCode: "6E-891",
      cost: 6400,
      departureTime: "3:45 PM",
      arrivalTime: "5:20 PM",
      groupTogether: true,
      groupSeats: "5/5 together",
      accessibility: true,
      tag: "Best balance",
      tagColor: "indigo",
      sacrificeText: "Protects deadline, all 5 together, accessibility included, within ₹10,000 budget.",
      recommended: true,
    },
    {
      id: "OPT-2",
      name: "OPTION 2",
      provider: "Vistara Prime",
      referenceCode: "UK-704",
      cost: 7800,
      departureTime: "3:10 PM",
      arrivalTime: "5:05 PM",
      groupTogether: true,
      groupSeats: "5/5 together",
      accessibility: true,
      tag: "Earliest arrival",
      tagColor: "emerald",
      sacrificeText: "Extra buffer before 6 PM wedding. Premium seats all together. ₹1,400 higher cost.",
    },
    {
      id: "OPT-3",
      name: "OPTION 3",
      provider: "Akasa Air",
      referenceCode: "QP-1192",
      cost: 5900,
      departureTime: "3:30 PM",
      arrivalTime: "5:40 PM",
      groupTogether: false,
      groupSeats: "4/5 together (1 split)",
      accessibility: true,
      tag: "Group split across seats",
      tagColor: "amber",
      sacrificeText: "Lower price, but violates group continuity constraint (separates 1 family member).",
    },
    {
      id: "OPT-4",
      name: "OPTION 4",
      provider: "Air India",
      referenceCode: "AI-514",
      cost: 4200,
      departureTime: "5:45 PM",
      arrivalTime: "7:30 PM",
      groupTogether: true,
      groupSeats: "5/5 together",
      accessibility: true,
      tag: "Misses wedding arrival deadline",
      tagColor: "rose",
      sacrificeText: "Cheapest fare, but lands at 7:30 PM, missing the 6:00 PM wedding arrival deadline.",
    },
  ];

  const handleSelect = async (opt: DecisionOption) => {
    setSelectedOption(opt);
    setExecutionStage("BOOKING");

    // Multi-step Section 14 execution animation:
    // 1. BOOKING
    await new Promise((r) => setTimeout(r, 650));
    setExecutionStage("BOOKED");

    // 2. VERIFYING
    await new Promise((r) => setTimeout(r, 600));
    setExecutionStage("VERIFYING");

    await new Promise((r) => setTimeout(r, 600));
    setExecutionStage("VERIFIED");

    // 3. TRANSFER INSPECTION & REPAIR
    await new Promise((r) => setTimeout(r, 700));
    setExecutionStage("TRANSFER_REPAIR_PROMPT");
  };

  const handleRepairTransfer = async () => {
    setExecutionStage("TRANSFER_REPAIRING");
    await new Promise((r) => setTimeout(r, 800));

    // Call external completion handler
    if (selectedOption) {
      await onOptionSelected(selectedOption);
    }
    setExecutionStage("COMPLETED");
  };

  // Authority Exceeded View (Section 11)
  if (isAuthorityExceeded) {
    return (
      <div className="rounded-2xl border-2 border-amber-600/80 bg-[#14100a] p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-in fade-in duration-300">
        <div className="flex items-center gap-3 pb-4 border-b border-amber-900/60">
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-600 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-widest">
              Bounded Autonomy Gate
            </div>
            <h3 className="text-xl font-bold text-white">APPROVAL REQUIRED</h3>
          </div>
        </div>

        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p className="text-base text-white font-medium">
            The only option that protects your 6 PM wedding arrival costs{" "}
            <strong className="text-amber-300 font-bold">₹{exceededAmount.toLocaleString("en-IN")}</strong>.
          </p>
          <p className="text-xs text-zinc-400">
            Your autonomous limit is <strong>₹{authorityLimit.toLocaleString("en-IN")}</strong>. Wingman will not spend unauthorized funds without your explicit approval.
          </p>
          <div className="p-3.5 rounded-xl bg-black/50 border border-amber-900/40 text-xs">
            <strong>Alternative:</strong> ₹8,900 (Air India Express, arrives 8:15 PM, misses wedding deadline).
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={onApproveExceeded}
            className="w-full sm:w-2/3 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase text-white tracking-wider shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>APPROVE ₹{exceededAmount.toLocaleString("en-IN")}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full sm:w-1/3 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 transition"
          >
            CHOOSE ANOTHER OPTION
          </button>
        </div>
      </div>
    );
  }

  // Execution Progress View (Section 14: After Human Chooses)
  if (executionStage !== "IDLE") {
    return (
      <div className="rounded-2xl border-2 border-indigo-600/80 bg-[#0e1017] p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-in fade-in duration-300">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                Executing Selection
              </span>
              <h3 className="text-lg font-bold text-white">
                {selectedOption?.name}: {selectedOption?.provider} ({selectedOption?.referenceCode})
              </h3>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            ₹{selectedOption?.cost.toLocaleString("en-IN")}
          </span>
        </div>

        {/* Step Progression (Section 14) */}
        <div className="space-y-3.5 text-xs font-mono">
          {/* Step 1: Booking */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
            <span className="flex items-center gap-2 text-zinc-300">
              {executionStage === "BOOKING" ? (
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>BOOKING REPLACEMENT TRAVEL</span>
            </span>
            <span className={executionStage === "BOOKING" ? "text-indigo-400 animate-pulse" : "text-emerald-400 font-bold"}>
              {executionStage === "BOOKING" ? "Processing..." : "✓ BOOKED"}
            </span>
          </div>

          {/* Step 2: Verifying */}
          {(executionStage === "VERIFYING" || executionStage === "VERIFIED" || executionStage === "TRANSFER_REPAIR_PROMPT" || executionStage === "TRANSFER_REPAIRING" || executionStage === "COMPLETED") && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 animate-in fade-in duration-200">
              <span className="flex items-center gap-2 text-zinc-300">
                {executionStage === "VERIFYING" ? (
                  <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span>VERIFYING INVARIANTS (SEATS & WHEELCHAIR RAMP)</span>
              </span>
              <span className={executionStage === "VERIFYING" ? "text-indigo-400 animate-pulse" : "text-emerald-400 font-bold"}>
                {executionStage === "VERIFYING" ? "Verifying..." : "✓ VERIFIED"}
              </span>
            </div>
          )}

          {/* Step 3: Inspect Downstream Dependencies (Transfer) */}
          {(executionStage === "TRANSFER_REPAIR_PROMPT" || executionStage === "TRANSFER_REPAIRING" || executionStage === "COMPLETED") && (
            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="font-bold">DEPENDENCY INSPECTION: TRANSFER NEEDS REPAIR</span>
              </div>
              <p className="text-zinc-300 text-xs font-sans leading-relaxed">
                &ldquo;Your original airport transfer was linked to the cancelled flight.&rdquo;
              </p>
              <div className="p-3 rounded-lg bg-black/60 border border-zinc-800 text-[11px] text-zinc-300 space-y-1">
                <div className="flex justify-between">
                  <span>New Transfer: <strong>GoaMobility Accessible Van</strong></span>
                  <span className="text-white font-bold">₹1,200</span>
                </div>
                <div className="text-zinc-400">
                  5 Passengers • Wheelchair Ramp • Pickup: 5:35 PM (Matches {selectedOption?.arrivalTime} landing)
                </div>
              </div>

              {executionStage === "TRANSFER_REPAIR_PROMPT" && (
                <button
                  onClick={handleRepairTransfer}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Car className="w-4 h-4" />
                  <span>REPAIR TRANSFER</span>
                </button>
              )}

              {executionStage === "TRANSFER_REPAIRING" && (
                <div className="p-3 text-center text-xs font-mono text-indigo-400 animate-pulse">
                  ● Dispatching accessible vehicle to Goa Airport...
                </div>
              )}

              {executionStage === "COMPLETED" && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 text-emerald-300 text-xs font-bold flex items-center justify-between">
                  <span>✓ TRANSFER CONFIRMED</span>
                  <span className="font-mono text-[10px]">VAN-8841</span>
                </div>
              )}
            </div>
          )}

          {/* Final: Journey Recovered */}
          {executionStage === "COMPLETED" && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-600 text-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <div className="text-sm font-bold text-white uppercase tracking-wider">
                JOURNEY RECOVERED
              </div>
              <p className="text-xs text-emerald-200">
                &ldquo;Your journey is viable again.&rdquo; All 5 travellers on track for the 6 PM wedding deadline.
              </p>
              {onClose && (
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs font-semibold text-white transition"
                >
                  Return to Journey Radar
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Primary Human Decision UI (Section 13)
  return (
    <div className="rounded-2xl border-2 border-indigo-700/80 bg-[#0e1017] p-6 sm:p-8 shadow-2xl space-y-6 text-white animate-in fade-in duration-300">
      {/* 1. Header (Section 13) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-zinc-800 gap-2">
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
            Human Decision Required
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            YOUR JOURNEY NEEDS A DECISION
          </h2>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 self-start sm:self-auto font-bold">
          ● DISRUPTION DETECTED
        </span>
      </div>

      {/* 2. WHAT HAPPENED & WHAT MATTERS (Section 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Left: What Happened */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-bold">
            WHAT HAPPENED
          </div>
          <p className="text-sm font-bold text-white">{disruptionTitle}</p>
          <div className="text-zinc-400 text-[11px] leading-relaxed">
            Original IndiGo flight 6E-542 (2:40 PM arrival) cancelled due to regional carrier disruption.
          </div>
        </div>

        {/* Right: What Matters */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-900/60 space-y-2">
          <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
            WHAT MATTERS
          </div>
          <div className="space-y-1.5 text-zinc-200">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span><strong>Wedding:</strong> Arrive in Goa before 6:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span><strong>Group:</strong> All 5 travellers stay together</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              <span><strong>Accessibility:</strong> Meera wheelchair assistance & ramp</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. YOUR OPTIONS (Section 13: 4 Large Option Cards) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="uppercase font-bold text-white tracking-wider">YOUR OPTIONS</span>
          <span>Wingman evaluated 4 candidate recovery options</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {options.map((opt) => (
            <div
              key={opt.id}
              className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                opt.recommended
                  ? "border-indigo-500 bg-indigo-950/30 shadow-lg shadow-indigo-950/40 ring-1 ring-indigo-500/50"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
              }`}
            >
              {/* Card Top: Price, Tag, Arrival */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-white font-mono">
                    ₹{opt.cost.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                      opt.tagColor === "indigo"
                        ? "bg-indigo-950 text-indigo-300 border-indigo-700"
                        : opt.tagColor === "emerald"
                        ? "bg-emerald-950 text-emerald-300 border-emerald-700"
                        : opt.tagColor === "amber"
                        ? "bg-amber-950 text-amber-300 border-amber-700"
                        : "bg-rose-950 text-rose-300 border-rose-700"
                    }`}
                  >
                    {opt.tag}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">
                    {opt.provider} ({opt.referenceCode})
                  </div>
                  <div className="text-xs text-zinc-300 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Arrives <strong>{opt.arrivalTime}</strong>
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span>Dep {opt.departureTime}</span>
                  </div>
                </div>

                {/* Constraints status */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-1 text-[11px] text-zinc-300">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3 h-3 text-zinc-400" />
                    <span>{opt.groupSeats}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Accessibility ✓ Wheelchair ramp included</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 pt-1 leading-relaxed italic">
                  {opt.sacrificeText}
                </p>
              </div>

              {/* Action Button: CHOOSE THIS */}
              <button
                onClick={() => handleSelect(opt)}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                  opt.recommended
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-950"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                }`}
              >
                <span>CHOOSE THIS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
