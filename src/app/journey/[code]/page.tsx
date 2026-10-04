"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Shield,
  Mic,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Car,
  Plane,
  Hotel,
  PartyPopper,
  SlidersHorizontal,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Volume2,
  X,
  Sparkles,
} from "lucide-react";

export default function JourneyHomePage({ params }: { params: { code: string } }) {
  const roomCode = params.code || "ROOM-WING01";

  // Journey state
  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"journey" | "activity" | "people">("journey");

  // Input & Agent state
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAgentResult, setLastAgentResult] = useState<any>(null);

  // Voice recording state
  const [voiceState, setVoiceState] = useState<"READY" | "LISTENING" | "THINKING" | "ACTING" | "SPEAKING">("READY");
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Simulation & Modal state
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  // Load Journey State
  const loadState = useCallback(async () => {
    try {
      const res = await fetch(`/api/journey/${roomCode}`);
      const data = await res.json();
      if (data.success && data.journey) {
        setJourney(data.journey);
        if (data.journey.status === "DECISION_REQUIRED") {
          setIsDecisionOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to load journey:", err);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Send message to Unified Agent API
  const handleSendMessage = async (customMessage?: string, approvalGranted?: boolean) => {
    const textToSend = customMessage || inputMessage;
    if (!textToSend.trim() && !approvalGranted) return;

    setIsProcessing(true);
    setVoiceNotice(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyCode: roomCode,
          message: textToSend,
          speaker: "Rahul",
          userApprovalGranted: approvalGranted || false,
          approvedAmount: 14800,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLastAgentResult(data.agentResult);
        setJourney(data.journeyState);
        setInputMessage("");

        if (data.agentResult?.humanDecisionRequired) {
          setIsDecisionOpen(true);
        } else {
          setIsDecisionOpen(false);
        }
      } else {
        alert(data.error || "Wingman could not process your instruction.");
      }
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsProcessing(false);
      setVoiceState("READY");
    }
  };

  // Voice Mic click handler
  const handleMicToggle = async () => {
    if (voiceState === "LISTENING") {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        stream.getTracks().forEach((track) => track.stop());

        // Send to Gnani STT endpoint
        setVoiceState("THINKING");
        const formData = new FormData();
        formData.append("audio_file", audioBlob, "recording.wav");

        try {
          const sttRes = await fetch("/api/voice/stt", {
            method: "POST",
            body: formData,
          });

          const sttData = await sttRes.json();
          if (sttData.success && sttData.transcript) {
            setVoiceState("ACTING");
            await handleSendMessage(sttData.transcript);
          } else {
            // Voice not configured notice
            setVoiceNotice(
              sttData.error || "Voice integration is not configured. Set GNANI_API_KEY in environment variables."
            );
            setVoiceState("READY");
          }
        } catch (sttErr: any) {
          setVoiceNotice("Voice integration is not configured. Set GNANI_API_KEY in environment variables.");
          setVoiceState("READY");
        }
      };

      mediaRecorder.start();
      setVoiceState("LISTENING");
    } catch (err: any) {
      // Mic access blocked or not available in environment
      setVoiceNotice("Microphone unavailable. You can continue by typing directly below.");
      setVoiceState("READY");
    }
  };

  // Reset demo
  const handleReset = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/simulations/reset", { method: "POST" });
      await loadState();
      setLastAgentResult(null);
      setIsDecisionOpen(false);
      setIsSimulationOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-white space-y-3 font-sans">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 animate-pulse flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">WINGMAN RADAR ACTIVE</p>
      </div>
    );
  }

  const status = journey?.status || "MONITORING";

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white font-sans antialiased">
      {/* 1. MINIMAL TOP HEADER */}
      <header className="border-b border-zinc-900 bg-[#090a0f]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Status */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center shadow group-hover:scale-105 transition">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold tracking-wider text-sm">WINGMAN</span>
            </Link>

            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                status === "RECOVERED"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : status === "DECISION_REQUIRED"
                  ? "bg-amber-950 text-amber-400 border-amber-800 animate-pulse"
                  : "bg-zinc-900 text-emerald-400 border-zinc-800"
              }`}
            >
              ● {status}
            </span>
          </div>

          {/* 3 Primary Navigation Items */}
          <nav className="flex items-center space-x-1 text-xs">
            {(["journey", "activity", "people"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                  activeTab === tab
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Discreet Simulation Trigger */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSimulationOpen(true)}
              className="text-xs text-zinc-500 hover:text-indigo-400 flex items-center gap-1 font-mono transition"
              title="Simulation Control (Inject external facts)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN VIEW AREA */}
      <main className="max-w-4xl mx-auto px-6 py-8 w-full flex-1 space-y-8">
        {/* TAB 1: JOURNEY (THE HERO EXPERIENCE) */}
        {activeTab === "journey" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Journey Title Banner */}
            <div className="text-center space-y-2 pt-2">
              <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
                ACTIVE JOURNEY • {journey?.code || "ROOM-WING01"}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {journey?.title?.toUpperCase() || "GOA FAMILY WEDDING"}
              </h1>
              <p className="text-xs text-zinc-400">
                21 December 2026 • 5 Travellers • Sister&apos;s Wedding (Deadline: 6:00 PM) • Authority: ₹{journey?.authorityLimit?.toLocaleString("en-IN") || "10,000"}
              </p>
            </div>

            {/* Simple Journey Timeline: HYDERABAD ↓ FLIGHT ↓ GOA ↓ TRANSFER ↓ HOTEL ↓ WEDDING */}
            <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#0e1017] space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>DEPENDENCY SEQUENCE</span>
                <span className={status === "RECOVERED" ? "text-emerald-400" : "text-zinc-400"}>
                  {status === "RECOVERED" ? "RE-SYNCHRONIZED" : "MONITORED"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs font-mono">
                {/* Node 1: Origin */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="text-zinc-500 text-[10px]">ORIGIN</div>
                  <div className="font-bold text-white">HYDERABAD</div>
                  <div className="text-[10px] text-zinc-400">Depart 3:45 PM</div>
                </div>

                {/* Node 2: Flight */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="text-zinc-500 text-[10px] flex items-center justify-center gap-1">
                    <Plane className="w-3 h-3 text-indigo-400" /> FLIGHT
                  </div>
                  <div className="font-bold text-white">
                    {status === "RECOVERED" ? "6E-891" : "6E-542"}
                  </div>
                  <div className={`text-[10px] font-semibold ${status === "RECOVERED" ? "text-emerald-400" : "text-zinc-400"}`}>
                    {status === "RECOVERED" ? "5:20 PM Arr" : "2:40 PM Arr"}
                  </div>
                </div>

                {/* Node 3: Goa Airport */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="text-zinc-500 text-[10px]">AIRPORT</div>
                  <div className="font-bold text-white">GOA (GOI)</div>
                  <div className="text-[10px] text-zinc-400">Dabolim Hub</div>
                </div>

                {/* Node 4: Transfer */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="text-zinc-500 text-[10px] flex items-center justify-center gap-1">
                    <Car className="w-3 h-3 text-indigo-400" /> TRANSFER
                  </div>
                  <div className="font-bold text-white">
                    {status === "RECOVERED" ? "VAN-8841" : "CAB-88"}
                  </div>
                  <div className={`text-[10px] font-semibold ${status === "RECOVERED" ? "text-emerald-400" : "text-zinc-400"}`}>
                    {status === "RECOVERED" ? "5:35 PM Pickup" : "3:00 PM Pickup"}
                  </div>
                </div>

                {/* Node 5: Hotel */}
                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                  <div className="text-zinc-500 text-[10px] flex items-center justify-center gap-1">
                    <Hotel className="w-3 h-3 text-indigo-400" /> HOTEL
                  </div>
                  <div className="font-bold text-white">VIVANTA</div>
                  <div className="text-[10px] text-emerald-400">Accessible Ground</div>
                </div>

                {/* Node 6: Protected Outcome */}
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-700/60 space-y-1">
                  <div className="text-indigo-400 text-[10px] flex items-center justify-center gap-1 font-bold">
                    <PartyPopper className="w-3 h-3" /> WEDDING
                  </div>
                  <div className="font-bold text-white">7:00 PM</div>
                  <div className="text-[10px] text-amber-300 font-bold">Arrive &lt; 6 PM</div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {status === "RECOVERED" ? "Journey outcome fully recovered and on schedule." : "Everything is currently protected."}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">5 Travellers Synchronized</span>
              </div>
            </div>

            {/* 3. HERO ACTION / RECOVERY CARD (Part 13 Hero Moment) */}
            {lastAgentResult && (
              <div className="rounded-2xl border border-zinc-800 bg-[#0e1017] p-6 shadow-2xl space-y-5 animate-in fade-in duration-300">
                {/* Header: At Risk or Recovered */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    {lastAgentResult.nextStatus === "RECOVERED" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : lastAgentResult.humanDecisionRequired ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400" />
                    )}
                    <span className="text-xs font-mono font-bold tracking-wider uppercase text-white">
                      {lastAgentResult.nextStatus === "RECOVERED"
                        ? "JOURNEY RECOVERED"
                        : lastAgentResult.humanDecisionRequired
                        ? "DECISION REQUIRED"
                        : "JOURNEY AT RISK"}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">{lastAgentResult.event}</span>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* Left: Disruption Impact */}
                  <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                    <div className="text-[10px] font-mono text-zinc-400 uppercase">Impact Assessment</div>
                    <div className="space-y-1 text-zinc-300">
                      <div><strong>Commitment at risk:</strong> Sister&apos;s Wedding (7:00 PM)</div>
                      <div><strong>Hard deadline:</strong> Arrive before 6:00 PM</div>
                      <div><strong>People affected:</strong> 5 (Rahul, Meera, Arjun, Sara, Kabir)</div>
                      <div><strong>Meera requirement:</strong> Wheelchair assistance & group stay locked</div>
                    </div>
                  </div>

                  {/* Right: Wingman Decision */}
                  <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/60 space-y-2">
                    <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold">Wingman Decided</div>
                    <div className="space-y-1 text-zinc-200">
                      <div className="text-base font-bold text-white">
                        {lastAgentResult.decision?.selectedOption || "Autonomous Action Selected"}
                      </div>
                      {lastAgentResult.decision?.cost && (
                        <div>Cost: <strong className="text-white">₹{lastAgentResult.decision.cost.toLocaleString("en-IN")}</strong> (Within ₹10,000 Authority)</div>
                      )}
                      {lastAgentResult.decision?.arrivalTime && (
                        <div>Goa Arrival: <strong className="text-emerald-400">{lastAgentResult.decision.arrivalTime}</strong></div>
                      )}
                      <div className="text-zinc-400 pt-1 border-t border-indigo-900/40">{lastAgentResult.decision?.reason}</div>
                    </div>
                  </div>
                </div>

                {/* Downstream Transfer Repaired Bar */}
                {lastAgentResult.transferRepaired && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/60 text-xs flex items-center justify-between text-emerald-200">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>
                        <strong>Transfer Repaired:</strong> Original airport transfer depended on the cancelled flight. New accessible van ({lastAgentResult.transferRepaired.reference}) confirmed for 5:35 PM pickup.
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">VERIFIED</span>
                  </div>
                )}

                {/* Communication outcome message */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-zinc-800 text-xs text-zinc-300">
                  <span className="text-indigo-400 font-bold">Wingman to Travellers: </span>
                  {lastAgentResult.communication}
                </div>
              </div>
            )}

            {/* 4. LARGE PRIMARY INPUT (Part 13: Tell Wingman anything...) */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Tell Wingman anything... (e.g. 'My flight was cancelled', 'My train is delayed 3 hours', 'I can spend up to ₹5000')"
                  className="w-full px-5 py-4 pr-24 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition shadow-xl"
                  disabled={isProcessing}
                />

                <div className="absolute right-3 flex items-center space-x-1.5">
                  {/* Mic Button (Gnani Voice) */}
                  <button
                    onClick={handleMicToggle}
                    disabled={isProcessing}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-md ${
                      voiceState === "LISTENING"
                        ? "bg-rose-600 animate-pulse text-white"
                        : voiceState === "THINKING" || voiceState === "ACTING"
                        ? "bg-indigo-600 animate-pulse text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    }`}
                    title="Speak to Wingman (Gnani Voice STT)"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isProcessing || !inputMessage.trim()}
                    className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center transition shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Voice State / Notice Indicator */}
              {voiceState !== "READY" && (
                <div className="text-center text-xs font-mono text-indigo-400 animate-pulse">
                  {voiceState === "LISTENING" && "● LISTENING... Speak now (tap mic to finish)"}
                  {voiceState === "THINKING" && "● WINGMAN IS ASSESSING YOUR JOURNEY..."}
                  {voiceState === "ACTING" && "● RECOVERING YOUR JOURNEY..."}
                </div>
              )}

              {voiceNotice && (
                <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-amber-300 text-center font-mono">
                  {voiceNotice}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVITY (CLEAN CHRONOLOGICAL AUDIT TRAIL) */}
        {activeTab === "activity" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-bold text-white">Agent Activity Log</h2>
              <span className="text-xs font-mono text-zinc-500">
                {journey?.activityLogs?.length || 0} Events Recorded
              </span>
            </div>

            <div className="space-y-3">
              {[...(journey?.activityLogs || [])]
                .reverse()
                .map((log: any, idx: number) => (
                  <div
                    key={log.id || idx}
                    className="p-4 rounded-xl border border-zinc-800 bg-[#0e1017] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between text-zinc-400 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-500">{log.timeDisplay || "14:10"}</span>
                        <span className="font-bold text-white uppercase">{log.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {log.stage}
                      </span>
                    </div>
                    <p className="text-zinc-300 pt-1 leading-relaxed">{log.description}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: PEOPLE (INDIVIDUAL TRAVELLERS & CONSTRAINTS) */}
        {activeTab === "people" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h2 className="text-base font-bold text-white">Travellers & Individual Constraints</h2>
                <p className="text-xs text-zinc-400">Wingman coordinates each person as an individual.</p>
              </div>
              <Link
                href={`/join/${roomCode}`}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition"
              >
                + Join as New Person
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {journey?.members?.map((m: any) => {
                const isMeera = m.user.name === "Meera" || m.role === "Grandmother";
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedPerson(m)}
                    className="cursor-pointer p-4 rounded-xl border border-zinc-800 bg-[#0e1017] hover:border-zinc-700 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-xs text-white">
                          {m.user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{m.user.name}</div>
                          <div className="text-[11px] text-zinc-400">{m.role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">₹{m.individualAuthority?.toLocaleString("en-IN")}</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 space-y-1 text-[11px]">
                      {isMeera ? (
                        <>
                          <div className="text-indigo-400 font-medium">✓ Cannot travel alone</div>
                          <div className="text-indigo-400 font-medium">✓ Must stay with group</div>
                          <div className="text-indigo-400 font-medium">✓ Wheelchair accessibility required</div>
                        </>
                      ) : (
                        <div className="text-emerald-400 font-medium">✓ Confirmed • Group stay protected</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs font-mono text-zinc-600">
        Wingman • The booking is a transaction. The journey is the outcome.
      </footer>

      {/* 5. MODAL: DECISION REQUIRED (BOUNDED AUTONOMY OVERRIDE) */}
      {isDecisionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border-2 border-amber-600/70 bg-[#14100a] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-900/50">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] font-mono text-amber-400 uppercase font-bold">Bounded Autonomy Gate</div>
                <h3 className="text-base font-bold text-white">Decision Required from Rahul</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
              <p className="text-sm text-white font-medium">
                The only option that protects your wedding arrival costs <strong>₹14,800</strong>.
              </p>
              <p>
                Your autonomous limit is <strong>₹10,000</strong>. Wingman will not spend unauthorized funds without your explicit approval.
              </p>
              <div className="p-3 rounded-lg bg-black/40 border border-amber-900/40 text-[11px]">
                <strong>Alternative:</strong> ₹8,900 (Arrives 8:15 PM, misses the 6:00 PM wedding deadline).
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleSendMessage("I approve the ₹14,800 option to protect the wedding", true)}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs uppercase text-white tracking-wider shadow-lg transition"
              >
                APPROVE ₹14,800
              </button>
              <button
                onClick={() => setIsDecisionOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300 transition"
              >
                PROTECT BUDGET
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: SIMULATION CONTROL (EXTERNAL FACTS ONLY) */}
      {isSimulationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#10121a] p-6 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="text-base font-bold">Simulation Control</h3>
                <p className="text-xs text-zinc-400">Inject external facts only. The agent decides what to do.</p>
              </div>
              <button onClick={() => setIsSimulationOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-zinc-400 uppercase">Primary Competition Stories</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setIsSimulationOpen(false);
                    handleSendMessage("My flight HYD-GOI was cancelled.");
                  }}
                  className="p-3 rounded-xl border border-indigo-700 bg-indigo-950/40 hover:bg-indigo-900/60 text-left text-xs space-y-1 transition"
                >
                  <div className="font-bold text-white">Primary: Flight Cancelled</div>
                  <div className="text-[11px] text-zinc-400">Agent chooses Option A (₹6,400) & repairs transfer.</div>
                </button>

                <button
                  onClick={() => {
                    setIsSimulationOpen(false);
                    handleSendMessage("Flight cancelled. High-demand holiday surge. Option A costs 14800.");
                  }}
                  className="p-3 rounded-xl border border-amber-700 bg-amber-950/40 hover:bg-amber-900/60 text-left text-xs space-y-1 transition"
                >
                  <div className="font-bold text-white">Authority Exceeded</div>
                  <div className="text-[11px] text-zinc-400">Option A costs ₹14,800. Agent pauses for approval.</div>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="text-xs font-mono text-zinc-400 uppercase">Arbitrary Disruptions (Any Fact)</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: "Train Delayed 3 Hours", text: "My train is delayed by 3 hours." },
                  { label: "Cab Cancelled", text: "My airport cab was cancelled." },
                  { label: "Hotel Unavailable", text: "My hotel says my reservation is gone." },
                  { label: "Update Budget to ₹5,000", text: "I can spend up to ₹5000 without asking me." },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setIsSimulationOpen(false);
                      handleSendMessage(item.text);
                    }}
                    className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-left text-zinc-300 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
              <button
                onClick={() => setIsSimulationOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: PERSON PROFILE */}
      {selectedPerson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#10121a] p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  {selectedPerson.user?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{selectedPerson.user?.name}</h3>
                  <p className="text-[11px] text-zinc-400">{selectedPerson.role}</p>
                </div>
              </div>
              <button onClick={() => setSelectedPerson(null)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="text-zinc-400 font-mono text-[10px] uppercase">Registered Constraints</div>
              {selectedPerson.user?.name === "Meera" ? (
                <div className="space-y-1.5 text-zinc-200">
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">• Cannot travel alone</div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">• Must stay with group (5 seats)</div>
                  <div className="p-2 rounded bg-zinc-900 border border-zinc-800">• Wheelchair accessibility assistance required</div>
                </div>
              ) : (
                <div className="p-2 rounded bg-zinc-900 border border-zinc-800">• Group continuity enforced</div>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 flex justify-between">
              <span>Personal Authority</span>
              <span className="font-bold text-white">₹{selectedPerson.individualAuthority?.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
