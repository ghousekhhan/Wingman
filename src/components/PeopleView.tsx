"use client";

import { User, Shield, Check, Heart, Accessibility, ChevronRight } from "lucide-react";

interface PeopleViewProps {
  members: any[];
  onSelectPerson: (member: any) => void;
  onOpenInvite: () => void;
}

export default function PeopleView({
  members = [],
  onSelectPerson,
  onOpenInvite,
}: PeopleViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Travellers in this Journey</h3>
          <p className="text-xs text-zinc-400">
            Wingman holds distinct constraints and outcome expectations for each individual.
          </p>
        </div>
        <button
          onClick={onOpenInvite}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-900/30 transition"
        >
          + Invite Traveller
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => {
          const isMeera = member.user?.name === "Meera" || member.role === "Grandmother";
          const isLead = member.isLead;

          return (
            <div
              key={member.id}
              onClick={() => onSelectPerson(member)}
              className="cursor-pointer group p-5 rounded-xl border border-zinc-800 bg-[#10121a] hover:border-indigo-600/60 hover:bg-zinc-900/80 transition-all space-y-4 shadow-lg hover:shadow-indigo-950/40 relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-700 group-hover:from-indigo-600 group-hover:to-indigo-800 flex items-center justify-center font-bold text-white transition-colors">
                    {member.user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                      {member.user?.name?.toUpperCase()}
                    </h4>
                    <p className="text-xs text-zinc-400">{member.role}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
              </div>

              {/* Constraint Badges */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60 text-xs">
                {isMeera ? (
                  <>
                    <div className="flex items-center gap-1.5 text-indigo-300 font-medium text-[11px]">
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>Accessibility Assistance</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-300 font-medium text-[11px]">
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>Must Stay With Group</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-indigo-300 font-medium text-[11px]">
                      <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                      <span>Cannot Travel Alone</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{isLead ? "Lead Traveller • Arrive on Time" : "Confirmed • Group Stay"}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span>Autonomous Authority: ₹{member.individualAuthority?.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                <span>View Personal Profile</span>
                <span className="text-indigo-400">Click to Open</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
