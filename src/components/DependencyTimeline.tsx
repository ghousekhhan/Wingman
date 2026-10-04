"use client";

import { Plane, Car, Hotel, PartyPopper, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";

interface DependencyTimelineProps {
  bookings: any[];
  commitments: any[];
  status: string;
}

export default function DependencyTimeline({
  bookings = [],
  commitments = [],
  status,
}: DependencyTimelineProps) {
  const flight = bookings.find((b) => b.type === "FLIGHT");
  const transfer = bookings.find((b) => b.type === "TRANSFER");
  const hotel = bookings.find((b) => b.type === "HOTEL");
  const wedding = commitments[0];

  return (
    <div className="rounded-xl border border-zinc-800 bg-[#0e1017] p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">
            Journey Dependency Graph
          </h3>
          <p className="text-xs text-zinc-400">
            Real-time causal graph connecting bookings to protected outcomes
          </p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 uppercase">
          4 Nodes Synchronized
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Node 1: Flight */}
        <div className="relative group p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Plane className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
              status === "RECOVERED"
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                : "bg-zinc-800 text-zinc-300"
            }`}>
              {status === "RECOVERED" ? "REPLACED & CONFIRMED" : "CONFIRMED"}
            </span>
          </div>

          <div>
            <div className="text-xs font-mono text-zinc-500">Node 01 • Flight</div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {flight ? flight.referenceCode : "IndiGo 6E-542"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              HYD → GOI • {status === "RECOVERED" ? "Arr 5:20 PM" : "Arr 2:40 PM"}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>5 Passengers</span>
            <span className="text-indigo-400">Ramp Assistance</span>
          </div>
        </div>

        {/* Node 2: Airport Transfer */}
        <div className="relative group p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Car className="w-4 h-4" />
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
              status === "RECOVERED"
                ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                : "bg-zinc-800 text-zinc-300"
            }`}>
              {status === "RECOVERED" ? "RESYNCHRONIZED" : "CONFIRMED"}
            </span>
          </div>

          <div>
            <div className="text-xs font-mono text-zinc-500">Node 02 • Mobility</div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {transfer ? transfer.referenceCode : "GOA-CAB-88"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Accessible Van • {status === "RECOVERED" ? "Pickup 5:35 PM" : "Pickup 3:00 PM"}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Fleet: GoaMobility</span>
            <span className="text-indigo-400">Hydraulic Ramp</span>
          </div>
        </div>

        {/* Node 3: Hotel */}
        <div className="relative group p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Hotel className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              CONFIRMED
            </span>
          </div>

          <div>
            <div className="text-xs font-mono text-zinc-500">Node 03 • Stay</div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Vivanta Goa Panaji
            </h4>
            <p className="text-xs text-zinc-400 mt-1">
              Grand Suites • 3 Rooms
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Check-in 4:00 PM</span>
            <span className="text-zinc-300">Ground Floor</span>
          </div>
        </div>

        {/* Node 4: Wedding Commitment */}
        <div className="relative group p-4 rounded-xl border-2 border-indigo-600/70 bg-gradient-to-b from-indigo-950/40 to-zinc-900/80 shadow-lg shadow-indigo-950/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
              <PartyPopper className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-indigo-900 text-indigo-200 border border-indigo-700">
              PROTECTED COMMITMENT
            </span>
          </div>

          <div>
            <div className="text-xs font-mono text-indigo-400">Outcome • Sister&apos;s Wedding</div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              Ceremony 7:00 PM
            </h4>
            <p className="text-xs text-amber-300 font-semibold mt-1">
              Hard Arrival Deadline: 6:00 PM
            </p>
          </div>

          <div className="pt-2 border-t border-indigo-900/60 text-[11px] text-zinc-300 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">Outcome Viable</span>
            <span className="text-indigo-300 font-mono">Non-Negotiable</span>
          </div>
        </div>
      </div>
    </div>
  );
}
