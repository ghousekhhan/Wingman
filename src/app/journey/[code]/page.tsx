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
import SiriVoiceOverlay from "@/components/SiriVoiceOverlay";
import HumanDecisionView, { DecisionOption } from "@/components/HumanDecisionView";

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
  const [isSiriOpen, setIsSiriOpen] = useState(false);

  // Human Decision UI state (Sections 10, 11, 13, 14)
  const [activeDisruptionForDecision, setActiveDisruptionForDecision] = useState<string | null>(null);
  const [isSurgeExceeded, setIsSurgeExceeded] = useState(false);

  // Group intake completion & gate state (Sections 15, 16, 18, 19)
  const [completedIntakeCount, setCompletedIntakeCount] = useState(5);
  const [groupPlanBuilt, setGroupPlanBuilt] = useState(true);

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
        return data.agentResult;
      } else {
        alert(data.error || "Wingman could not process your instruction.");
      }
    } catch (e: any) {
      console.error("Agent execution error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset demo
  const handleReset = async () => {
    setIsProcessing(true);
    try {
      await fetch("/api/simulations/reset", { method: "POST" });
      await loadState();
      setLastAgentResult(null);
      setActiveDisruptionForDecision(null);
      setIsSurgeExceeded(false);
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

          {/* Controls: Voice Agent & Simulation */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsSiriOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/60 hover:bg-indigo-900/80 text-xs font-medium text-indigo-300 flex items-center gap-1.5 transition shadow"
              title="Open Siri Voice Agent (Gnani STT/TTS)"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="hidden sm:inline">Voice Agent</span>
            </button>

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
            {/* Journey Title Banner (Section 15) */}
            <div className="text-center space-y-2 pt-2">
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                {journey?.title?.toUpperCase() || "GOA FAMILY WEDDING"}
              </h1>
              <div className="flex items-center justify-center gap-3 text-xs font-mono text-zinc-400">
                <span className="font-bold text-white uppercase">{journey?.members?.length || 5} TRAVELLERS</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold uppercase">5 COMMITMENTS PROTECTED</span>
                <span>•</span>
                <span>Autonomous Authority: ₹{journey?.authorityLimit?.toLocaleString("en-IN") || "10,000"}</span>
              </div>
            </div>

            {/* Section 15 & 16: EVERY TRAVELLER MUST COMPLETE INTAKE */}
            {completedIntakeCount < 5 && (
              <div className="p-6 rounded-3xl bg-amber-950/30 border-2 border-amber-600/70 text-center space-y-3 shadow-xl">
                <div className="flex items-center justify-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-sm">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span>WAITING FOR EVERYONE</span>
                </div>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  Hard Rule: Wingman will NOT generate a group plan or execute group recoveries until all 5 travellers complete their private intake.
                </p>
                <div className="flex items-center justify-center gap-2 font-mono text-xs text-zinc-400">
                  <span className="font-bold text-white">{completedIntakeCount} / 5 COMPLETE</span>
                  <span>•</span>
                  <span className="text-amber-300">Waiting for Sara and Kabir</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setCompletedIntakeCount(5);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-xs uppercase text-black tracking-wider transition shadow-lg"
                  >
                    Simulate Sara &amp; Kabir Intake Complete (5/5)
                  </button>
                </div>
              </div>
            )}

            {/* Section 18 & 19: Derived Group Constraints & What Wingman is Protecting */}
            {completedIntakeCount === 5 && !groupPlanBuilt && (
              <div className="p-6 rounded-3xl bg-[#0e1017] border border-indigo-500/40 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-bold block">
                      Section 18 &amp; 19: All 5 Travellers Complete
                    </span>
                    <h3 className="text-base font-bold text-white">Derived Group Constraints</h3>
                  </div>
                  <span className="text-xs font-mono bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    5 / 5 Complete
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-300">
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-indigo-400 font-bold">Meera (Cannot travel alone) + Sara (Stay with group):</span>
                    <div className="text-white font-bold mt-0.5">Derived: ALL TRAVELLERS SHOULD REMAIN TOGETHER</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-purple-400 font-bold">Meera (Accessibility assistance):</span>
                    <div className="text-white font-bold mt-0.5">Derived: ANY VALID RECOVERY MUST PRESERVE ACCESSIBILITY</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/40 space-y-2 text-xs">
                  <div className="font-bold text-white uppercase text-[11px] font-mono">What Wingman is Protecting:</div>
                  <div className="space-y-1 font-mono text-[11px] text-zinc-300">
                    <div>✓ Wedding at 7 PM</div>
                    <div>✓ Arrival before 6 PM</div>
                    <div>✓ Everyone stays together</div>
                    <div>✓ Meera accessibility</div>
                    <div>✓ ₹10,000 authority</div>
                  </div>
                  <button
                    onClick={() => setGroupPlanBuilt(true)}
                    className="w-full mt-3 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-xs uppercase text-white tracking-wider shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>BUILD JOURNEY</span>
                  </button>
                </div>
              </div>
            )}

            {/* Simple Journey Timeline: HYDERABAD ↓ FLIGHT ↓ GOA ↓ TRANSFER ↓ HOTEL ↓ WEDDING */}
            <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#0e1017] space-y-4">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>DEPENDENCY SEQUENCE</span>
                <span className={status === "RECOVERED" ? "text-emerald-400" : "text-zinc-400"}>
                  {status === "RECOVERED" ? "RE-SYNCHRONIZED" : "MONITORED"}
                </span>
              </div>

              {(() => {
                const isUpstreamShifted = !!lastAgentResult?.mobilityDependency;
                const flightArr = isUpstreamShifted
                  ? lastAgentResult.mobilityDependency.newFlightArrival
                  : status === "RECOVERED"
                  ? "5:20 PM"
                  : "2:40 PM";
                const cabPick = isUpstreamShifted
                  ? lastAgentResult.mobilityDependency.newPickupTarget
                  : status === "RECOVERED"
                  ? "5:35 PM"
                  : "3:00 PM";

                return (
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
                        {flightArr} Arr
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
                        {cabPick} Pickup
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
                );
              })()}

              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {status === "RECOVERED" ? "Journey outcome fully recovered and on schedule." : "Everything is currently protected."}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">5 Travellers Synchronized</span>
              </div>
            </div>

            {/* SECTION 22: SYNCHRONIZED GROUND TRANSFER CALCULATION */}
            {(() => {
              const isUpstreamShifted = !!lastAgentResult?.mobilityDependency;
              const curArrival = isUpstreamShifted
                ? lastAgentResult.mobilityDependency.newFlightArrival
                : status === "RECOVERED"
                ? "17:20"
                : "18:00";
              const curExit = isUpstreamShifted
                ? lastAgentResult.mobilityDependency.expectedAirportExit
                : status === "RECOVERED"
                ? "17:45"
                : "18:25";
              const curTarget = isUpstreamShifted
                ? lastAgentResult.mobilityDependency.newPickupTarget
                : status === "RECOVERED"
                ? "17:55"
                : "18:35";

              return (
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="uppercase text-indigo-400 font-bold">
                      Section 22: Synchronized Ground Transfer Calculation
                    </span>
                    <span className="text-zinc-500">Buffer: 25m Exit + 10m Mobility</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">FLIGHT ARRIVAL</div>
                      <div className="text-sm font-bold text-white">{curArrival}</div>
                      <div className="text-[10px] text-zinc-400">Landing Target</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">AIRPORT EXIT</div>
                      <div className="text-sm font-bold text-amber-300">{curExit}</div>
                      <div className="text-[10px] text-zinc-400">+25m Baggage/Disembark</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-950/60 border border-indigo-700/60">
                      <div className="text-[10px] text-indigo-400 font-bold">CAB PICKUP TARGET</div>
                      <div className="text-sm font-bold text-emerald-400">{curTarget}</div>
                      <div className="text-[10px] text-zinc-300">+10m Mobility Buffer</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/50 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500">DESTINATION</div>
                      <div className="text-sm font-bold text-white">Wedding Venue</div>
                      <div className="text-[10px] text-emerald-400">Protected: 19:00</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SECTION 31: GROUP MOBILITY REQUIREMENTS */}
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-white uppercase text-[11px]">Group Mobility Requirements</span>
                <span className="text-indigo-400 text-[10px]">Deterministic Validation</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 5 travellers ✓
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stay together ✓
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accessibility ✓
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 6+ seats ✓
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Airport pickup ✓
                </div>
                <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Wedding destination ✓
                </div>
              </div>
            </div>

            {/* SECTION 32 & 33: DRIVER ASSIGNMENT & LIFECYCLE MONITORING */}
            <div className="p-4 rounded-2xl bg-[#0e1017] border border-zinc-800 space-y-3 text-xs">
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="font-bold text-zinc-300 uppercase">Driver Lifecycle &amp; Telemetry</span>
                <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Dispatch
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                  <div className="text-[10px] text-zinc-500 font-mono">ASSIGNED CHAUFFEUR</div>
                  <div className="font-bold text-white text-sm">Santosh Naik</div>
                  <div className="text-[11px] text-zinc-400 font-mono">Vehicle: Toyota Vellfire 6-Seater (GA-01-AX-9941)</div>
                  <div className="text-[10px] text-emerald-400 font-mono">Rating: 4.95 ★ • Hydraulic Ramp Certified</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1 font-mono text-[11px]">
                  <div className="text-[10px] text-zinc-500">LIFECYCLE TELEMETRY</div>
                  <div className="text-zinc-300">Flight Landed: <strong className="text-white">17:22</strong></div>
                  <div className="text-zinc-300">Expected Exit: <strong className="text-white">17:45</strong></div>
                  <div className="text-zinc-300">Traveller Exited: <strong className="text-white">17:48</strong></div>
                  <div className="text-zinc-300">Driver Notified: <strong className="text-white">17:49</strong></div>
                  <div className="text-emerald-400 font-bold">Passenger Picked Up: 17:52 &rarr; ETA Venue: 18:35</div>
                </div>
              </div>
            </div>

            {/* HUMAN DECISION UI (Sections 10, 11, 13, 14) */}
            {activeDisruptionForDecision && (
              <HumanDecisionView
                disruptionTitle={activeDisruptionForDecision}
                authorityLimit={journey?.authorityLimit || 10000}
                isAuthorityExceeded={isSurgeExceeded}
                exceededAmount={14800}
                onOptionSelected={async (opt) => {
                  await handleSendMessage(`I choose ${opt.name}: ${opt.provider} at ₹${opt.cost}`);
                  setActiveDisruptionForDecision(null);
                }}
                onApproveExceeded={async () => {
                  await handleSendMessage("I approve the ₹14,800 option to protect the wedding", true);
                  setActiveDisruptionForDecision(null);
                  setIsSurgeExceeded(false);
                }}
                onClose={() => {
                  setActiveDisruptionForDecision(null);
                  setIsSurgeExceeded(false);
                }}
              />
            )}

            {/* 3. HERO ACTION / RECOVERY CARD (Part 13 Hero Moment) */}
            {lastAgentResult && !activeDisruptionForDecision && (
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

                {/* Option inspection toggle (Section 13) */}
                <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
                  <button
                    onClick={() => {
                      setActiveDisruptionForDecision("Flight HYD-GOI Cancelled");
                      setIsSurgeExceeded(false);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1.5 transition font-semibold"
                  >
                    <span>View all 4 evaluated recovery options & trade-offs →</span>
                  </button>
                  <span className="text-[11px] text-zinc-500">Human Choice Permitted</span>
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
                  {/* Mic Button (Gnani Voice Siri Agent) */}
                  <button
                    onClick={() => setIsSiriOpen(true)}
                    disabled={isProcessing}
                    className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition shadow-md group relative"
                    title="Speak to Wingman (Gnani Voice Siri Agent)"
                  >
                    <Mic className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition" />
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

              {/* Quick Prompt Chips (including Section 52 Upstream Delay) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  onClick={() => handleSendMessage("Flight HYD-GOI was cancelled")}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-[11px] font-mono text-rose-300 transition"
                >
                  ⚡ &ldquo;Flight HYD-GOI was cancelled&rdquo;
                </button>
                <button
                  onClick={() => handleSendMessage("Flight arrival is now 18:40")}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-500/30 text-[11px] font-mono text-amber-300 transition"
                >
                  ⚡ &ldquo;Flight arrival is now 18:40 (Section 52 Test)&rdquo;
                </button>
                <button
                  onClick={() => handleSendMessage("My train is delayed by 3 hours")}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 transition"
                >
                  &ldquo;Train delayed by 3 hours&rdquo;
                </button>
                <button
                  onClick={() => handleSendMessage("I can spend up to 5000")}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-mono text-zinc-300 transition"
                >
                  &ldquo;Update authority to ₹5,000&rdquo;
                </button>
              </div>
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
                    setActiveDisruptionForDecision("Flight HYD-GOI Cancelled");
                    setIsSurgeExceeded(false);
                  }}
                  className="p-3 rounded-xl border border-indigo-700 bg-indigo-950/40 hover:bg-indigo-900/60 text-left text-xs space-y-1 transition"
                >
                  <div className="font-bold text-white">Primary: Flight Cancelled</div>
                  <div className="text-[11px] text-zinc-400">Wingman presents 4 options; human selects & recovers.</div>
                </button>

                <button
                  onClick={() => {
                    setIsSimulationOpen(false);
                    setActiveDisruptionForDecision("Flight HYD-GOI Cancelled (High-Demand Surge Pricing)");
                    setIsSurgeExceeded(true);
                  }}
                  className="p-3 rounded-xl border border-amber-700 bg-amber-950/40 hover:bg-amber-900/60 text-left text-xs space-y-1 transition"
                >
                  <div className="font-bold text-white">Authority Exceeded</div>
                  <div className="text-[11px] text-zinc-400">Option costs ₹14,800. Agent pauses for approval.</div>
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

      {/* 8. SIRI VOICE OVERLAY (GNANI STT / TTS) */}
      <SiriVoiceOverlay
        isOpen={isSiriOpen}
        onClose={() => setIsSiriOpen(false)}
        onTranscriptReceived={async (text) => {
          const result = await handleSendMessage(text);
          return result?.spokenResponse || result?.communication;
        }}
      />
    </div>
  );
}
