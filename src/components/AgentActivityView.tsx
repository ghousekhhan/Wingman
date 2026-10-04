"use client";

import { Activity, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight, Zap, RefreshCw } from "lucide-react";

interface AgentActivityViewProps {
  logs: any[];
}

export default function AgentActivityView({ logs = [] }: AgentActivityViewProps) {
  // Sort chronologically ascending for story flow
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0e1017] p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Agent Activity Log</h3>
            <p className="text-xs text-zinc-400">
              Chronological cryptographic execution and reasoning audit trail
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-zinc-500">{logs.length} Logged Stages</span>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
        {sortedLogs.map((log, index) => {
          const isRecovery =
            log.title?.includes("RECOVERED") ||
            log.title?.includes("VERIFICATION") ||
            log.stage === "COMPLETE" ||
            log.stage === "VERIFY";

          const isDisruption =
            log.title?.includes("CANCEL") ||
            log.title?.includes("RISK") ||
            log.title?.includes("IMPACT");

          const isAction =
            log.stage === "RECOVER" || log.title?.includes("ACTION");

          return (
            <div key={log.id || index} className="relative group">
              {/* Dot */}
              <div
                className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 transition-all ${
                  isRecovery
                    ? "bg-emerald-500 border-[#0e1017] ring-2 ring-emerald-500/20"
                    : isDisruption
                    ? "bg-rose-500 border-[#0e1017] ring-2 ring-rose-500/20"
                    : isAction
                    ? "bg-indigo-500 border-[#0e1017] ring-2 ring-indigo-500/20"
                    : "bg-zinc-600 border-[#0e1017]"
                }`}
              ></div>

              <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/70 hover:border-zinc-700 transition space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      {log.timeDisplay || "14:10"}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded tracking-wider uppercase ${
                        isRecovery
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : isDisruption
                          ? "bg-rose-950 text-rose-300 border border-rose-900"
                          : isAction
                          ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {log.title}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">
                    Stage: {log.stage}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed font-normal pt-1">
                  {log.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
