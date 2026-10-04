"use client";

import { useEffect, useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ActionCard from "@/components/ActionCard";
import DependencyTimeline from "@/components/DependencyTimeline";
import PeopleView from "@/components/PeopleView";
import PersonProfileModal from "@/components/PersonProfileModal";
import RecoveryView from "@/components/RecoveryView";
import AgentActivityView from "@/components/AgentActivityView";
import JourneyStateView from "@/components/JourneyStateView";
import ShipmentView from "@/components/ShipmentView";
import SimulationControl from "@/components/SimulationControl";
import VoiceModal from "@/components/VoiceModal";
import InviteModal from "@/components/InviteModal";
import DecisionRequiredModal from "@/components/DecisionRequiredModal";
import { Users, Clock, Key, Shield, UserPlus, SlidersHorizontal, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

export default function JourneyRoomPage({ params }: { params: { code: string } }) {
  const roomCode = params.code || "ROOM-WING01";

  const [journey, setJourney] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [demoMode, setDemoMode] = useState<boolean>(true);

  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch full Journey State
  const fetchJourney = useCallback(async () => {
    try {
      const res = await fetch(`/api/journey/${roomCode}`);
      const data = await res.json();
      if (data.success && data.journey) {
        setJourney(data.journey);
        if (data.journey.status === "DECISION_REQUIRED") {
          setIsDecisionOpen(true);
        } else {
          setIsDecisionOpen(false);
        }
      }
    } catch (e) {
      console.error("Failed to load journey state:", e);
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    fetchJourney();
  }, [fetchJourney]);

  // Inject Simulation Event (Wizard of Oz)
  const handleInjectEvent = async (
    eventType: string,
    scenario: "PRIMARY_DEMO" | "AUTHORITY_EXCEEDED" = "PRIMARY_DEMO"
  ) => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulations/inject-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyCode: roomCode,
          eventType,
          scenario,
        }),
      });

      const data = await res.json();
      if (data.success) {
        await fetchJourney();
        setIsSimulationOpen(false);
        if (data.agentOutput?.humanDecisionRequired) {
          setIsDecisionOpen(true);
        }
      }
    } catch (e) {
      console.error("Simulation event error:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Human Authority Approval
  const handleApproveAuthority = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch("/api/simulations/approve-authority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyCode: roomCode,
          approvedAmount: 14800,
          approve: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsDecisionOpen(false);
        await fetchJourney();
      }
    } catch (e) {
      console.error("Authority approval failed:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset Demo to Initial State
  const handleResetDemo = async () => {
    setIsSimulating(true);
    try {
      await fetch("/api/simulations/reset", { method: "POST" });
      await fetchJourney();
      setIsDecisionOpen(false);
      setIsSimulationOpen(false);
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090a0f] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 animate-pulse flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <p className="text-xs font-mono text-zinc-400">CONNECTING TO WINGMAN DIGITAL TWIN...</p>
      </div>
    );
  }

  const latestRecoveryCase = journey?.recoveryCases?.[0];

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        roomCode={roomCode}
        journeyStatus={journey?.status || "MONITORING"}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        demoMode={demoMode}
        onToggleDemoMode={() => setDemoMode(!demoMode)}
        onResetDemo={handleResetDemo}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 flex-1">
        {/* Section 6: Journey Room Header Banner */}
        <div className="rounded-2xl border border-zinc-800 bg-[#0e1017] p-6 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider uppercase">
                  WINGMAN JOURNEY ROOM
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {roomCode}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {journey?.title || "Goa Wedding"}
              </h1>
              <p className="text-xs text-zinc-400 font-medium">
                21 December 2026 • Purpose: {journey?.purpose || "Sister's Wedding"}
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setIsInviteOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition"
              >
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Invite People</span>
              </button>

              <button
                onClick={() => setIsSimulationOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-950 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Simulate Disruption</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Bar (Section 6 Requirements) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-zinc-800/80">
            {/* Status */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">STATUS</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  journey?.status === "RECOVERED"
                    ? "bg-emerald-400"
                    : journey?.status === "DECISION_REQUIRED"
                    ? "bg-amber-400"
                    : "bg-emerald-500"
                }`}></span>
                <span className="font-mono">{journey?.status || "MONITORING"}</span>
              </div>
            </div>

            {/* Arrive By */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">ARRIVE BY</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>{journey?.arrivalDeadline || "6:00 PM"}</span>
              </div>
            </div>

            {/* People */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">PEOPLE</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>{journey?.members?.length || 5} Coordinated</span>
              </div>
            </div>

            {/* Autonomous Authority */}
            <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-0.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase">AUTONOMOUS AUTHORITY</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span>₹{journey?.authorityLimit?.toLocaleString("en-IN") || "10,000"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Views */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Action Card (Live Disruption & Recovery Visualizer) */}
            <ActionCard
              status={journey?.status || "MONITORING"}
              recoveryCase={latestRecoveryCase}
              onApproveDecision={handleApproveAuthority}
              onRequestLateArrival={() => setIsDecisionOpen(false)}
            />

            {/* Journey Dependency Graph */}
            <DependencyTimeline
              bookings={journey?.bookings || []}
              commitments={journey?.commitments || []}
              status={journey?.status || "MONITORING"}
            />
          </div>
        )}

        {activeTab === "people" && (
          <div className="animate-in fade-in duration-200">
            <PeopleView
              members={journey?.members || []}
              onSelectPerson={(m) => setSelectedPerson(m)}
              onOpenInvite={() => setIsInviteOpen(true)}
            />
          </div>
        )}

        {activeTab === "recovery" && (
          <div className="animate-in fade-in duration-200">
            <RecoveryView
              recoveryCase={latestRecoveryCase}
              status={journey?.status || "MONITORING"}
            />
          </div>
        )}

        {activeTab === "activity" && (
          <div className="animate-in fade-in duration-200">
            <AgentActivityView logs={journey?.activityLogs || []} />
          </div>
        )}

        {activeTab === "state" && (
          <div className="animate-in fade-in duration-200">
            <JourneyStateView journey={journey} />
          </div>
        )}

        {activeTab === "logistics" && (
          <div className="animate-in fade-in duration-200">
            <ShipmentView
              shipments={journey?.shipments || []}
              journeyCode={roomCode}
              onExpediteSuccess={fetchJourney}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800 bg-[#090a0f] py-6 text-center text-xs font-mono text-zinc-500">
        Wingman • The booking is a transaction. The journey is the outcome.
      </footer>

      {/* Modals */}
      <SimulationControl
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        onInjectEvent={handleInjectEvent}
        onReset={handleResetDemo}
        isLoading={isSimulating}
        journeyCode={roomCode}
      />

      <VoiceModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        journeyCode={roomCode}
        journeyStatus={journey?.status || "MONITORING"}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomCode={roomCode}
      />

      <PersonProfileModal
        member={selectedPerson}
        isOpen={!!selectedPerson}
        onClose={() => setSelectedPerson(null)}
      />

      <DecisionRequiredModal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
        onApprove={handleApproveAuthority}
        onReject={() => setIsDecisionOpen(false)}
        isLoading={isSimulating}
      />
    </div>
  );
}
