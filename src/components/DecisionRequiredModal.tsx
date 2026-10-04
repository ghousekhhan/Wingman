"use client";

import { AlertTriangle, CheckCircle2, XCircle, ShieldAlert, ArrowRight } from "lucide-react";

interface DecisionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onReject: () => void;
  isLoading: boolean;
}

export default function DecisionRequiredModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  isLoading,
}: DecisionRequiredModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border-2 border-amber-600/70 bg-[#16120c] p-6 shadow-2xl space-y-6 text-white relative">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-amber-900/50">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-600 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold tracking-wider text-amber-400 uppercase">
              Bounded Autonomy Gate
            </div>
            <h3 className="text-lg font-bold text-white">Decision Required from Rahul</h3>
          </div>
        </div>

        {/* Core Prompt Statement */}
        <div className="space-y-3">
          <p className="text-sm text-zinc-200 leading-relaxed">
            &ldquo;The only option that protects the wedding costs <strong>₹14,800</strong>, exceeding your <strong>₹10,000</strong> autonomous limit.&rdquo;
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-amber-900/40 text-xs text-zinc-300 space-y-2">
            <div className="font-semibold text-amber-300">Why Wingman halted execution:</div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Option A (₹14,800):</strong> Arrives at 5:20 PM (protects 6 PM wedding), seats all 5 together with Meera&apos;s wheelchair ramp, but exceeds authority limit by ₹4,800.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-amber-400 font-bold">•</span>
              <span><strong>Option B (₹8,900):</strong> Stays within authority (₹8,900 &lt; ₹10,000), but arrives at 8:15 PM, missing the sister&apos;s wedding ceremony entirely.</span>
            </div>
          </div>
        </div>

        {/* Buttons (Section 14 exact buttons) */}
        <div className="space-y-2 pt-2">
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs tracking-wider uppercase shadow-xl shadow-emerald-950/60 transition active:scale-98 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>{isLoading ? "Executing Elevated Recovery..." : "APPROVE ₹14,800"}</span>
          </button>

          <button
            onClick={onReject}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 font-semibold text-zinc-300 text-xs transition"
          >
            ACCEPT LATE ARRIVAL
          </button>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 text-center">
          Wingman Autonomous Safety Guarantee: Never spends unauthorized funds
        </div>
      </div>
    </div>
  );
}
