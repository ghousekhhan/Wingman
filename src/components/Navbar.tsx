"use client";

import Link from "next/link";
import { Shield, Sparkles, Mic, SlidersHorizontal, RefreshCw } from "lucide-react";

interface NavbarProps {
  roomCode?: string;
  journeyStatus?: string;
  onOpenVoice?: () => void;
  onOpenSimulation?: () => void;
  demoMode?: boolean;
  onToggleDemoMode?: () => void;
  onResetDemo?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export default function Navbar({
  roomCode = "ROOM-WING01",
  journeyStatus = "MONITORING",
  onOpenVoice,
  onOpenSimulation,
  demoMode = true,
  onToggleDemoMode,
  onResetDemo,
  activeTab,
  onTabChange,
}: NavbarProps) {
  const getStatusBadge = () => {
    switch (journeyStatus) {
      case "RECOVERED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 animate-pulse-subtle">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            RECOVERED
          </span>
        );
      case "DECISION_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            DECISION REQUIRED
          </span>
        );
      case "RECOVERING":
      case "ANALYZING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-800/80 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            ACTING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-900 text-zinc-300 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            MONITORING
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-900/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-wider text-white">WINGMAN</span>
                {getStatusBadge()}
              </div>
              <p className="text-[10px] text-zinc-400 hidden sm:block tracking-wide">
                Autonomous Journey Continuity Agent
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs (if in room) */}
        {activeTab && onTabChange && (
          <nav className="hidden md:flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 text-xs">
            {["overview", "people", "recovery", "activity", "state", "logistics"].map((tab) => (
              <button
                key={tab}
                onClick={() => onTabChange(tab)}
                className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                }`}
              >
                {tab === "state" ? "Journey State" : tab}
              </button>
            ))}
          </nav>
        )}

        {/* Right Action Tools */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Talk to Wingman voice button */}
          {onOpenVoice && (
            <button
              onClick={onOpenVoice}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-indigo-300 border border-indigo-900/50 hover:border-indigo-700 transition shadow-sm"
              title="Talk to Wingman (Gnani Voice Intelligence)"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Talk to Wingman</span>
            </button>
          )}

          {/* Reset Demo button */}
          {onResetDemo && (
            <button
              onClick={onResetDemo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition"
              title="Reset Demo Journey to Initial State"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset State</span>
            </button>
          )}

          {/* Simulation Control Trigger */}
          {onOpenSimulation && (
            <button
              onClick={onOpenSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-md shadow-indigo-900/30 transition hover:scale-102"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulation Control</span>
            </button>
          )}

          {/* Demo Mode Toggle */}
          {onToggleDemoMode && (
            <button
              onClick={onToggleDemoMode}
              className={`px-2.5 py-1 rounded text-[11px] font-mono tracking-wider uppercase border transition ${
                demoMode
                  ? "bg-zinc-900 text-indigo-400 border-indigo-800/80"
                  : "bg-zinc-950 text-zinc-600 border-zinc-900"
              }`}
            >
              Demo Mode
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
