"use client";

import { X, Shield, User, Heart, Lock, AlertCircle, CheckCircle2, Clock } from "lucide-react";

interface PersonProfileModalProps {
  member: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function PersonProfileModal({
  member,
  isOpen,
  onClose,
}: PersonProfileModalProps) {
  if (!isOpen || !member) return null;

  const isMeera = member.user?.name === "Meera" || member.role === "Grandmother";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-700 bg-[#12141c] p-6 shadow-2xl space-y-6 text-white relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Member Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-zinc-800">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-xl font-bold text-white shadow-lg">
            {member.user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">{member.user?.name}</h3>
              {member.isLead && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700">
                  LEAD TRAVELLER
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 font-medium">{member.role}</p>
            <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
              Personalized Journey Persona • Active
            </p>
          </div>
        </div>

        {/* Section 1: MY CONSTRAINTS (Section 8 highlight!) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              My Constraints (Non-Negotiable)
            </span>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
              Enforced by Wingman
            </span>
          </div>

          <div className="space-y-2">
            {isMeera ? (
              <>
                <div className="p-3 rounded-xl border border-indigo-900/80 bg-zinc-900/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-indigo-950 border border-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Cannot Travel Alone</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Must remain accompanied by group at all times; cannot be routed on solo recovery itineraries.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-indigo-900/80 bg-zinc-900/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-indigo-950 border border-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-0.5">
                    <Heart className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Must Stay With Group</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Group continuity requirement: all 5 family members must travel and be seated together.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-indigo-900/80 bg-zinc-900/80 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-indigo-950 border border-indigo-800 flex items-center justify-center flex-shrink-0 text-indigo-400 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Accessibility Assistance Required</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Wheelchair ramp assistance required at airport gate, boarding, and ground van transfers.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              member.constraints?.map((c: any) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/80 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-300 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{c.title}</h5>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{c.description || "Active constraint"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2: MY COMMITMENTS */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            My Commitments
          </span>
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-indigo-400" />
              <div>
                <h5 className="text-xs font-bold text-white">Sister&apos;s Wedding</h5>
                <p className="text-[11px] text-zinc-400">Ceremony 7:00 PM • Hard Arrival: 6:00 PM</p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
              PROTECTED
            </span>
          </div>
        </div>

        {/* Section 3: MY PREFERENCES */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            My Preferences
          </span>
          <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-mono text-[11px]">Seating Preference</span>
              <span className="font-medium text-white">{isMeera ? "Aisle seat near front" : "Window / Aisle"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 font-mono text-[11px]">Transit Comfort</span>
              <span className="font-medium text-white">{isMeera ? "Avoid long walking transfers" : "Direct routes"}</span>
            </div>
          </div>
        </div>

        {/* Section 4: MY AUTHORITY */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase">My Autonomous Spending Limit</div>
            <div className="text-base font-bold text-white mt-0.5">
              ₹{member.individualAuthority?.toLocaleString("en-IN") || "5,000"}
            </div>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">Autonomous Budget Granted</span>
        </div>
      </div>
    </div>
  );
}
