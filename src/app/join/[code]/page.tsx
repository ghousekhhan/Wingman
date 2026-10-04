"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Users,
  Clock,
  Heart,
  DollarSign,
  AlertTriangle,
  Send,
} from "lucide-react";

export default function JoinJourneyPage({ params }: { params: { code: string } }) {
  const router = useRouter();
  const roomCode = params.code || "ROOM-WING01";

  // Flow State
  // 0: Invitation Screen ("You've been invited...")
  // 1: Ask their name
  // 2: Q1 - What matters most (multi-select choice cards)
  // 3: Q2 - Non-negotiable compromise (free text with examples)
  // 4: Q3 - Important commitments (choice cards / text)
  // 5: Q4 - Protect first (single-select choice cards)
  // 6: Q5 - Autonomous spend authority (₹0, ₹2,500, ₹5,000, ₹10,000, custom)
  // 7: Q6 - Anything else (free text)
  // 8: Summary ("Got it. I know what matters to you.")
  const [step, setStep] = useState(0);
  const [journeyTitle, setJourneyTitle] = useState("Goa Family Wedding");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Individual Persona State
  const [name, setName] = useState("Meera");
  const [role, setRole] = useState("Grandmother");

  // Q1 Answers (Multi-select)
  const [priorities, setPriorities] = useState<string[]>([
    "ARRIVE ON TIME",
    "STAY WITH THE GROUP",
    "ACCESSIBILITY",
  ]);

  // Q2 Answers (Free text)
  const [nonNegotiables, setNonNegotiables] = useState(
    "I cannot travel alone. I need wheelchair assistance at the airport."
  );

  // Q3 Answers (Commitments)
  const [commitment, setCommitment] = useState("Wedding");

  // Q4 Answers (Protect first)
  const [protectFirst, setProtectFirst] = useState("ACCESSIBILITY");

  // Q5 Answers (Spend authority)
  const [authority, setAuthority] = useState<number>(10000);
  const [customAuthority, setCustomAuthority] = useState("");

  // Q6 Answers (Additional context)
  const [additionalNotes, setAdditionalNotes] = useState(
    "Travelling with my family (Rahul, Arjun, Sara, Kabir). Please ensure I remain with the group."
  );

  // Load journey details if available
  useEffect(() => {
    async function fetchJourney() {
      try {
        const res = await fetch(`/api/journey/${roomCode}`);
        const data = await res.json();
        if (data.success && data.journey) {
          setJourneyTitle(data.journey.title || "Goa Family Wedding");
        }
      } catch (e) {
        // Fallback title
      }
    }
    fetchJourney();
  }, [roomCode]);

  const togglePriority = (item: string) => {
    if (priorities.includes(item)) {
      setPriorities(priorities.filter((p) => p !== item));
    } else {
      setPriorities([...priorities, item]);
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const constraintsList = [
        ...priorities,
        nonNegotiables ? `Non-negotiable: ${nonNegotiables}` : "",
        protectFirst ? `Top Priority: ${protectFirst}` : "",
      ].filter(Boolean);

      await fetch(`/api/journey/${roomCode}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || "Meera",
          role: role.trim() || "Family member",
          constraints: constraintsList,
          individualAuthority: authority,
          preferences: [commitment, additionalNotes].filter(Boolean),
        }),
      });

      router.push(`/journey/${roomCode}`);
    } catch (e) {
      console.error(e);
      router.push(`/journey/${roomCode}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white p-6 font-sans">
      {/* Top Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-zinc-900">
        <Link
          href="/"
          className="flex items-center space-x-2 text-zinc-400 hover:text-white text-xs font-mono transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>HOME</span>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold tracking-widest text-xs text-white">WINGMAN PERSONA</span>
        </div>
        <span className="text-xs font-mono text-zinc-500">ROOM: {roomCode}</span>
      </header>

      {/* Main Body */}
      <main className="max-w-xl mx-auto w-full my-auto py-8 space-y-8">
        {/* ============================================================== */}
        {/* STEP 0: INVITATION ACCEPTANCE SCREEN */}
        {/* ============================================================== */}
        {step === 0 && (
          <div className="p-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center mx-auto text-indigo-400">
              <Users className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                Journey Invitation
              </span>
              <h1 className="text-3xl font-extrabold text-white">
                You&apos;ve been invited to join the {journeyTitle} journey.
              </h1>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Wingman coordinates each traveller as an individual. Have a quick 2-minute conversation to protect what matters to you.
              </p>
            </div>

            <button
              onClick={() => setStep(1)}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-950 transition flex items-center justify-center gap-2 group"
            >
              <span>JOIN JOURNEY</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: ASK THEIR NAME */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Welcome to Wingman
              </span>
              <h2 className="text-2xl font-extrabold text-white">What is your name?</h2>
              <p className="text-xs text-zinc-400">
                Wingman will build your individual profile and maintain your personal constraints.
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && name.trim() && setStep(2)}
                  placeholder="e.g. Meera"
                  className="w-full px-5 py-3.5 rounded-xl bg-black/50 border border-zinc-700 text-white text-base focus:border-indigo-500 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-zinc-400 uppercase">Your Role (Optional)</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Grandmother / Family member"
                  className="w-full px-5 py-3.5 rounded-xl bg-black/50 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { n: "Meera", r: "Grandmother" },
                  { n: "Arjun", r: "Brother" },
                  { n: "Sara", r: "Sister" },
                  { n: "Kabir", r: "Cousin" },
                  { n: "Rahul", r: "Lead" },
                ].map((item) => (
                  <button
                    key={item.n}
                    type="button"
                    onClick={() => {
                      setName(item.n);
                      setRole(item.r);
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                  >
                    {item.n} ({item.r})
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => name.trim() && setStep(2)}
              disabled={!name.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
            >
              <span>CONTINUE WITH WINGMAN</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: QUESTION 1 - What matters most to you? */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 1 of 6 • For {name}
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                What matters most to you on this journey?
              </h2>
              <p className="text-xs text-zinc-400">Select all that apply to your personal preferences.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "ARRIVE ON TIME", label: "ARRIVE ON TIME", desc: "Never miss the 6 PM wedding" },
                { id: "STAY WITH THE GROUP", label: "STAY WITH THE GROUP", desc: "Never split onto separate flights" },
                { id: "KEEP COST LOW", label: "KEEP COST LOW", desc: "Prioritize budget options" },
                { id: "COMFORT", label: "COMFORT", desc: "Extra legroom & smooth routes" },
                { id: "ACCESSIBILITY", label: "ACCESSIBILITY", desc: "Wheelchair assistance & ramp van" },
                { id: "OTHER", label: "OTHER", desc: "Custom preferences" },
              ].map((card) => {
                const selected = priorities.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => togglePriority(card.id)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between ${
                      selected
                        ? "border-indigo-500 bg-indigo-950/40 shadow-sm shadow-indigo-950"
                        : "border-zinc-800 bg-black/40 hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">{card.label}</div>
                      <div className="text-[10px] text-zinc-400">{card.desc}</div>
                    </div>
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-white ${
                        selected ? "bg-indigo-600" : "border border-zinc-700"
                      }`}
                    >
                      {selected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 3: QUESTION 2 - Is there anything you cannot compromise on? */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 2 of 6 • Invariants
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                Is there anything you absolutely cannot compromise on?
              </h2>
              <p className="text-xs text-zinc-400">
                Wingman treats these as hard constraints. It will never select a recovery that violates them.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={nonNegotiables}
                onChange={(e) => setNonNegotiables(e.target.value)}
                placeholder="e.g. I cannot travel alone. I need wheelchair assistance."
                rows={3}
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none font-medium"
                autoFocus
              />

              {/* Clickable Example Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-zinc-500 uppercase">Click examples to add:</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "I cannot travel alone.",
                    "I need wheelchair assistance.",
                    "I need to stay with my children.",
                    "I cannot take a flight.",
                    "I cannot arrive after 6 PM.",
                  ].map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() =>
                        setNonNegotiables((prev) => (prev ? `${prev} ${ex}` : ex))
                      }
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition"
                    >
                      + &ldquo;{ex}&rdquo;
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: QUESTION 3 - Important commitments */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 3 of 6 • Purpose
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                Do you have any important commitments during the journey?
              </h2>
              <p className="text-xs text-zinc-400">What specific event or milestone must be preserved?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                "Wedding",
                "Meeting",
                "Exam",
                "Business event",
                "Flight connection",
                "Medical appointment",
                "Family Gathering",
                "Other",
              ].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCommitment(c)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    commitment === c
                      ? "border-indigo-500 bg-indigo-950/50 text-white font-bold"
                      : "border-zinc-800 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: QUESTION 4 - What should Wingman protect first? */}
        {/* ============================================================== */}
        {step === 5 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 4 of 6 • Priority Hierarchy
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                If something goes wrong, what should Wingman protect first?
              </h2>
              <p className="text-xs text-zinc-400">Choose your #1 non-negotiable priority.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: "TIME", label: "TIME", desc: "Arrival buffer and deadlines" },
                { id: "GROUP", label: "GROUP", desc: "Keep all 5 travellers together" },
                { id: "ACCESSIBILITY", label: "ACCESSIBILITY", desc: "Wheelchair assistance & ramp" },
                { id: "BUDGET", label: "BUDGET", desc: "Strictly minimize replacement cost" },
                { id: "COMFORT", label: "COMFORT", desc: "Spacious direct travel" },
                { id: "IMPORTANT EVENT", label: "IMPORTANT EVENT", desc: "The sister's wedding event" },
              ].map((card) => {
                const selected = protectFirst === card.id;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => setProtectFirst(card.id)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between ${
                      selected
                        ? "border-indigo-500 bg-indigo-950/50 shadow-sm shadow-indigo-950"
                        : "border-zinc-800 bg-black/40 hover:border-zinc-700 opacity-80"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-white">{card.label}</div>
                      <div className="text-[10px] text-zinc-400">{card.desc}</div>
                    </div>
                    {selected && <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(6)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 6: QUESTION 5 - Autonomous Spending Authority */}
        {/* ============================================================== */}
        {step === 6 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 5 of 6 • Bounded Autonomy
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                How much additional money are you comfortable allowing Wingman to spend without asking you?
              </h2>
              <p className="text-xs text-zinc-400">
                Wingman will never spend above this threshold without pausing for your explicit approval.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[0, 2500, 5000, 10000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAuthority(amt)}
                  className={`p-4 rounded-xl border text-center transition ${
                    authority === amt
                      ? "border-indigo-500 bg-indigo-950/50 text-white font-bold shadow-md shadow-indigo-950"
                      : "border-zinc-800 bg-black/40 text-zinc-400 hover:text-white"
                  }`}
                >
                  <div className="text-base font-extrabold">₹{amt.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {amt === 0 ? "Ask for everything" : amt === 10000 ? "Autonomous Limit" : "Standard"}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(5)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(7)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 7: QUESTION 6 - Is there anything else? */}
        {/* ============================================================== */}
        {step === 7 && (
          <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 6 of 6 • Context
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                Is there anything else Wingman should know?
              </h2>
              <p className="text-xs text-zinc-400">Any extra detail regarding your family, bags, or schedule.</p>
            </div>

            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. Travelling with Rahul, Sara, Arjun, Kabir. Please make sure we stay together."
              rows={3}
              className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none resize-none font-medium"
              autoFocus
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep(6)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(8)}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>SEE YOUR PERSONA</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 8: WINGMAN SUMMARY & PERSON STATE */}
        {/* ============================================================== */}
        {step === 8 && (
          <div className="p-7 rounded-2xl bg-zinc-900/90 border-2 border-indigo-600/70 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Check className="w-3.5 h-3.5" />
                <span>Persona Initialized</span>
              </div>
              <h2 className="text-2xl font-black text-white">
                &ldquo;Got it. I know what matters to you.&rdquo;
              </h2>
              <p className="text-xs text-zinc-400">
                Wingman has recorded {name}&apos;s personal constraints into the Journey State.
              </p>
            </div>

            {/* Structured Summary Card */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2.5">
                <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                  YOUR COMMITMENTS
                </div>
                <div className="space-y-1.5 text-xs text-zinc-200">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Arrive before 6 PM for the wedding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Stay with the group (5 travellers together)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Accessibility assistance required: {nonNegotiables || "Wheelchair assistance"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold flex items-center justify-between">
                  <span>YOUR AUTHORITY</span>
                  <span className="text-emerald-400">CONFIRMED</span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  ₹{authority.toLocaleString("en-IN")} autonomous spend
                </div>
                <p className="text-[11px] text-zinc-500">
                  Wingman can execute recoveries up to this limit without pausing for approval.
                </p>
              </div>
            </div>

            <button
              onClick={handleFinishOnboarding}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold text-white shadow-xl shadow-indigo-950 transition flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? "ENTERING JOURNEY..." : "ENTER GROUP JOURNEY"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full text-center text-[11px] font-mono text-zinc-600 py-3">
        Wingman • Individual Traveller Persona Engine
      </footer>
    </div>
  );
}
