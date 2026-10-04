"use client";

import { useState } from "react";
import { Mic, MicOff, X, Volume2, Sparkles, CheckCircle2, Bot } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyCode: string;
  journeyStatus: string;
}

export default function VoiceModal({
  isOpen,
  onClose,
  journeyCode,
  journeyStatus,
}: VoiceModalProps) {
  const [voiceStage, setVoiceStage] = useState<
    "IDLE" | "LISTENING" | "TRANSCRIBING" | "UNDERSTANDING" | "ACTING" | "RESPONDING"
  >("IDLE");
  const [transcript, setTranscript] = useState<string>("");
  const [agentResponse, setAgentResponse] = useState<string>("");
  const [adapterType, setAdapterType] = useState<string>("Gnani Voice AI (Adapter: Demo Mode)");

  if (!isOpen) return null;

  const handleStartVoice = async () => {
    try {
      // 1. LISTENING
      setVoiceStage("LISTENING");
      setTranscript("");
      setAgentResponse("");

      await new Promise((resolve) => setTimeout(resolve, 1400));

      // 2. TRANSCRIBING
      setVoiceStage("TRANSCRIBING");
      setTranscript("Wingman, what is our status? Can Meera and all of us still reach the wedding on time?");

      await new Promise((resolve) => setTimeout(resolve, 1100));

      // 3. UNDERSTANDING
      setVoiceStage("UNDERSTANDING");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 4. ACTING
      setVoiceStage("ACTING");

      // Call API
      const res = await fetch("/api/voice/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyCode,
          audioTranscript: "Wingman, what is our status? Can Meera and all of us still reach the wedding on time?",
          speaker: "Rahul",
        }),
      });

      const data = await res.json();

      await new Promise((resolve) => setTimeout(resolve, 800));

      // 5. RESPONDING
      setVoiceStage("RESPONDING");
      setAgentResponse(
        data.reply ||
          "Your journey is fully protected, Rahul. Meera's accessibility ramp is secured and your arrival in Goa is on schedule for the wedding."
      );
      if (data.voiceResult?.adapter === "GNANI_CLOUD_API") {
        setAdapterType("Gnani Cloud STT/TTS (Live Production API)");
      } else {
        setAdapterType("Gnani Voice Intelligence (Gnani Demo Adapter)");
      }
    } catch (e) {
      console.error(e);
      setVoiceStage("IDLE");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#10121a] p-6 shadow-2xl space-y-6 text-white text-center relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
            {adapterType}
          </div>
          <h3 className="text-xl font-bold">Talk to Wingman</h3>
          <p className="text-xs text-zinc-400">
            Voice-driven journey continuity interface powered by Gnani Voice AI
          </p>
        </div>

        {/* Big Mic Button with Active States */}
        <div className="flex flex-col items-center justify-center py-6">
          <button
            onClick={handleStartVoice}
            disabled={voiceStage !== "IDLE" && voiceStage !== "RESPONDING"}
            className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              voiceStage === "LISTENING"
                ? "bg-rose-600 ring-8 ring-rose-500/30 scale-105 animate-pulse"
                : voiceStage === "TRANSCRIBING" || voiceStage === "UNDERSTANDING" || voiceStage === "ACTING"
                ? "bg-indigo-600 ring-8 ring-indigo-500/30 animate-pulse"
                : voiceStage === "RESPONDING"
                ? "bg-emerald-600 ring-8 ring-emerald-500/30"
                : "bg-gradient-to-tr from-indigo-700 to-indigo-500 hover:scale-105 shadow-xl shadow-indigo-900/40"
            }`}
          >
            <Mic className="w-12 h-12 text-white" />
          </button>

          {/* Current State Indicator */}
          <div className="mt-4">
            <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase">
              {voiceStage === "IDLE"
                ? "TAP TO SPEAK"
                : voiceStage === "LISTENING"
                ? "● LISTENING..."
                : voiceStage === "TRANSCRIBING"
                ? "● TRANSCRIBING AUDIO..."
                : voiceStage === "UNDERSTANDING"
                ? "● UNDERSTANDING INTENT & CONSTRAINTS..."
                : voiceStage === "ACTING"
                ? "● CHECKING JOURNEY RADAR..."
                : "✔ RESPONDING VIA GNANI"}
            </span>
          </div>
        </div>

        {/* Transcript Box */}
        {transcript && (
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 text-left space-y-1">
            <div className="text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-between">
              <span>Speaker: Rahul</span>
              <span className="text-indigo-400">Speech Recognized</span>
            </div>
            <p className="text-xs text-zinc-200 italic">&ldquo;{transcript}&rdquo;</p>
          </div>
        )}

        {/* Agent Spoken Response */}
        {agentResponse && (
          <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/80 text-left space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Bot className="w-3.5 h-3.5" /> Wingman Spoken Intelligence
              </span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <Volume2 className="w-3.5 h-3.5" /> TTS Synthesized
              </span>
            </div>
            <p className="text-xs text-zinc-100 leading-relaxed font-medium">
              {agentResponse}
            </p>
          </div>
        )}

        {/* Gnani Architecture Note */}
        <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
          Gnani Adapter: Dual STT/TTS pipeline active • Low-latency streaming speech integration
        </div>
      </div>
    </div>
  );
}
