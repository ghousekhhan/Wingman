"use client";

import { useState } from "react";
import { X, Play, SlidersHorizontal, RefreshCw, AlertTriangle, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

interface SimulationControlProps {
  isOpen: boolean;
  onClose: () => void;
  onInjectEvent: (eventType: string, scenario?: "PRIMARY_DEMO" | "AUTHORITY_EXCEEDED") => Promise<void>;
  onReset: () => Promise<void>;
  isLoading: boolean;
  journeyCode: string;
}

export default function SimulationControl({
  isOpen,
  onClose,
  onInjectEvent,
  onReset,
  isLoading,
  journeyCode,
}: SimulationControlProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("PRIMARY");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-700 bg-[#12141c] p-6 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Simulation Control</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-indigo-300 border border-zinc-700">
                  Wizard of Oz Protocol
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Inject external facts only. The agent autonomously evaluates constraints & decides.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Competition Sequences */}
        <div className="space-y-3">
          <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
            Primary Competition Demonstrations
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Primary Demo */}
            <button
              disabled={isLoading}
              onClick={() => onInjectEvent("FLIGHT_CANCELLED", "PRIMARY_DEMO")}
              className="p-4 rounded-xl border border-indigo-700/80 bg-gradient-to-br from-indigo-950/60 to-zinc-900 hover:border-indigo-500 text-left transition space-y-2 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Primary Simulation
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-200">
                  Demo Story
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                Inject: Flight HYD-GOI Cancelled
              </div>
              <p className="text-xs text-zinc-400">
                Agent evaluates 4 options → picks Option A (₹6,400) → rebooks IndiGo 6E-891 → notices invalid airport transfer → autonomously rebooks accessible van → transitions to RECOVERED.
              </p>
            </button>

            {/* 2. Authority Exceeded Simulation */}
            <button
              disabled={isLoading}
              onClick={() => onInjectEvent("AUTHORITY_EXCEEDED_SCENARIO", "AUTHORITY_EXCEEDED")}
              className="p-4 rounded-xl border border-amber-700/80 bg-gradient-to-br from-amber-950/50 to-zinc-900 hover:border-amber-500 text-left transition space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Authority Exceeded
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-900/80 text-amber-200">
                  Bounded Autonomy
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-amber-300 transition">
                Inject: High-Cost Surge Cancellation
              </div>
              <p className="text-xs text-zinc-400">
                Option A costs ₹14,800 (exceeds ₹10,000 limit) vs Option B (₹8,900, misses wedding). Agent halts at DECISION REQUIRED and requests human approval.
              </p>
            </button>
          </div>
        </div>

        {/* Individual External Fact Injections (Section 15 exact list) */}
        <div className="space-y-3 pt-2 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Inject External Facts (Wizard Mode)
            </span>
            <span className="text-[11px] text-zinc-500 font-mono">
              Never forces agent decisions
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { label: "Flight Cancelled", type: "FLIGHT_CANCELLED" },
              { label: "Flight Delayed 45m", type: "FLIGHT_DELAYED" },
              { label: "Hotel Unavailable", type: "HOTEL_UNAVAILABLE" },
              { label: "Cab Delayed", type: "CAB_DELAYED" },
              { label: "Shipment Delayed (Delhivery)", type: "SHIPMENT_DELAYED" },
              { label: "Payment Required", type: "PAYMENT_REQUIRED" },
              { label: "Person Constraint Changed", type: "PERSON_CONSTRAINT_CHANGED" },
            ].map((fact) => (
              <button
                key={fact.type}
                disabled={isLoading}
                onClick={() => onInjectEvent(fact.type)}
                className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 hover:border-zinc-600 text-xs font-medium text-zinc-300 text-left transition flex items-center justify-between"
              >
                <span>{fact.label}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-600"></span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Action */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Current Room: <span className="font-mono text-white font-semibold">{journeyCode}</span>
          </div>
          <button
            disabled={isLoading}
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Reset Demo Journey State</span>
          </button>
        </div>
      </div>
    </div>
  );
}
