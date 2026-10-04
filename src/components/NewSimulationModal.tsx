"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Sparkles, X, PlusCircle, AlertCircle } from "lucide-react";

interface NewSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (newJourney: { journeyId: string; code: string }) => void;
  defaultType?: "SOLO" | "GROUP";
}

export default function NewSimulationModal({
  isOpen,
  onClose,
  onConfirm,
  defaultType = "SOLO",
}: NewSimulationModalProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedType, setSelectedType] = useState<"SOLO" | "GROUP">(defaultType);

  if (!isOpen) return null;

  const handleStartNew = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/journey/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType }),
      });

      const data = await res.json();
      if (data.success) {
        // Save current journey code to session/local storage for persistence and refresh
        if (typeof window !== "undefined") {
          localStorage.setItem("wingman_active_journey_code", data.code);
          localStorage.setItem("wingman_active_journey_id", data.journeyId);
        }

        if (onConfirm) {
          onConfirm({ journeyId: data.journeyId, code: data.code });
        } else {
          if (selectedType === "GROUP") {
            router.push(`/journey/${data.code}`);
          } else {
            router.push(`/solo?code=${data.code}`);
          }
        }
        onClose();
      } else {
        alert("Failed to create new simulation: " + data.error);
      }
    } catch (err: any) {
      console.error("New simulation error:", err);
      alert("Error starting new simulation: " + err.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-[#0e1017] p-6 shadow-2xl space-y-6 text-white relative">
        <button
          onClick={onClose}
          disabled={isCreating}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white transition p-1 rounded-lg hover:bg-zinc-800/60"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">START A NEW SIMULATION?</h3>
            <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider block">
              Fresh Journey State
            </span>
          </div>
        </div>

        {/* Description & Preservation Notice */}
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2 text-xs leading-relaxed text-zinc-300">
          <p className="font-medium text-white">
            Your current simulation will remain saved, but this will start a completely fresh Journey State.
          </p>
          <p className="text-zinc-400">
            All travellers, commitments, constraints, and mobility state will begin empty. Previous conversations will not leak into the new Gemini context.
          </p>
        </div>

        {/* Journey Type Choice */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Choose Journey Mode:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedType("SOLO")}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                selectedType === "SOLO"
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950/40"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="font-bold">SOLO</span>
              <span className="text-[10px] text-zinc-400">1-on-1 Voice Agent</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType("GROUP")}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition ${
                selectedType === "GROUP"
                  ? "bg-purple-600/20 border-purple-500 text-white shadow-lg shadow-purple-950/40"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              <span className="font-bold">GROUP</span>
              <span className="text-[10px] text-zinc-400">Collaborative Radar</span>
            </button>
          </div>
        </div>

        {/* Actions: CANCEL / START NEW */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-zinc-300 transition"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleStartNew}
            disabled={isCreating}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-indigo-950/60 transition flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <span>CREATING...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-200" />
                <span>START NEW</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
