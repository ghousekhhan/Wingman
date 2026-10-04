"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  ArrowRight,
  ArrowLeft,
  Check,
  Copy,
  Share2,
  Sparkles,
  Users,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Send,
} from "lucide-react";

export default function CreateJourneyPage() {
  const router = useRouter();

  // Conversational Flow Steps: 1 to 5, then 6 is the Generated Invite Screen
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Conversational Answers - genuinely starts empty
  const [destination, setDestination] = useState("");
  const [purpose, setPurpose] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [travellersInput, setTravellersInput] = useState("");

  // Generated Room Result
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Submit and create Journey Room
  const handleFinalize = async () => {
    setLoading(true);
    try {
      // Generate clean room code e.g. WG-7391
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const generatedCode = `WG-${randNum}`;

      const res = await fetch("/api/journey/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "GROUP",
          title: purpose.trim() || `${destination.trim() || "Group"} Journey`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedRoomCode(data.code);
        if (typeof window !== "undefined") {
          localStorage.setItem("wingman_active_journey_code", data.code);
        }
        setStep(6); // Move to invite link display screen
      } else {
        setCreatedRoomCode(generatedCode);
        setStep(6);
      }
    } catch (e) {
      console.error("Create journey error:", e);
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setCreatedRoomCode(`WG-${randNum}`);
      setStep(6);
    } finally {
      setLoading(false);
    }
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = createdRoomCode
    ? `${currentOrigin}/join/${createdRoomCode}`
    : `${currentOrigin}/join/ROOM-WING01`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const whatsappMessage = encodeURIComponent(
    `Hey everyone! I've set up our journey on Wingman so plans and disruptions are monitored. Join our journey room here: ${inviteLink}`
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white p-6 font-sans">
      {/* Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4 border-b border-zinc-900">
        <Link
          href="/"
          className="flex items-center space-x-2 text-zinc-400 hover:text-white text-xs font-mono transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold tracking-widest text-xs text-white">WINGMAN BUILDER</span>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {step <= 5 ? `QUESTION ${step} OF 5` : "ROOM READY"}
        </span>
      </header>

      {/* Main Conversational Container */}
      <main className="max-w-xl mx-auto w-full my-auto py-8 space-y-8">
        {/* Progress indicator */}
        {step <= 5 && (
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-8 bg-indigo-500" : i < step ? "w-3 bg-zinc-600" : "w-2 bg-zinc-800"
                }`}
              />
            ))}
          </div>
        )}

        {/* Wingman Conversational Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-indigo-950/80 text-indigo-300 border border-indigo-800">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Wingman Journey Setup</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-200">
            {step <= 5 ? "Let's build your journey." : "Your Journey Room is Ready!"}
          </h2>
        </div>

        {/* ============================================================== */}
        {/* QUESTION 1: Where are you going? */}
        {/* ============================================================== */}
        {step === 1 && (
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 1
              </span>
              <h3 className="text-2xl font-extrabold text-white">Where are you going?</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && destination.trim() && setStep(2)}
                placeholder="e.g. Goa"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-base focus:border-indigo-500 focus:outline-none font-medium"
                autoFocus
              />

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-2 pt-1">
                {["Goa", "Mumbai", "Delhi", "Bengaluru", "Jaipur", "Kerala"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setDestination(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      destination === c
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => destination.trim() && setStep(2)}
              disabled={!destination.trim()}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
            >
              <span>NEXT QUESTION</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUESTION 2: What are you travelling for? */}
        {/* ============================================================== */}
        {step === 2 && (
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 2
              </span>
              <h3 className="text-2xl font-extrabold text-white">What are you travelling for?</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && purpose.trim() && setStep(3)}
                placeholder="e.g. My sister's wedding"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-base focus:border-indigo-500 focus:outline-none font-medium"
                autoFocus
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {["My sister's wedding", "Family vacation", "Executive summit", "Medical appointment"].map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPurpose(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        purpose === p
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => purpose.trim() && setStep(3)}
                disabled={!purpose.trim()}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUESTION 3: When is the important event? */}
        {/* ============================================================== */}
        {step === 3 && (
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 3
              </span>
              <h3 className="text-2xl font-extrabold text-white">When is the important event?</h3>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && eventTime.trim() && setStep(4)}
                placeholder="e.g. December 21 at 7 PM"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-base focus:border-indigo-500 focus:outline-none font-medium"
                autoFocus
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {["December 21 at 7 PM", "Tomorrow at 6 PM", "Friday at 5:30 PM"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setEventTime(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      eventTime === t
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
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
                onClick={() => eventTime.trim() && setStep(4)}
                disabled={!eventTime.trim()}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUESTION 4: When must you arrive? */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 4
              </span>
              <h3 className="text-2xl font-extrabold text-white">When must you arrive?</h3>
              <p className="text-xs text-zinc-400">Wingman treats this as a hard, non-negotiable deadline.</p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && arrivalTime.trim() && setStep(5)}
                placeholder="e.g. Before 6 PM"
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-base focus:border-indigo-500 focus:outline-none font-medium"
                autoFocus
              />

              <div className="flex flex-wrap gap-2 pt-1">
                {["Before 6 PM", "Before 5 PM", "Before 4 PM", "Before 6:30 PM"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setArrivalTime(d)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                      arrivalTime === d
                        ? "bg-indigo-600 border-indigo-500 text-white"
                        : "bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={() => arrivalTime.trim() && setStep(5)}
                disabled={!arrivalTime.trim()}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* QUESTION 5: Who's travelling with you? */}
        {/* ============================================================== */}
        {step === 5 && (
          <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-5 animate-in fade-in duration-200 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                Question 5
              </span>
              <h3 className="text-2xl font-extrabold text-white">Who&apos;s travelling with you?</h3>
              <p className="text-xs text-zinc-400">
                Enter the names of everyone in your group.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={travellersInput}
                onChange={(e) => setTravellersInput(e.target.value)}
                placeholder="Rahul, Meera, Arjun, Sara, Kabir"
                rows={3}
                className="w-full px-5 py-4 rounded-xl bg-black/50 border border-zinc-700 text-white text-sm focus:border-indigo-500 focus:outline-none font-medium resize-none"
                autoFocus
              />

              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/50 text-xs text-zinc-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <span>
                  Wingman will generate a unique shareable invite link for all group members.
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="w-1/3 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition"
              >
                Back
              </button>
              <button
                onClick={handleFinalize}
                disabled={loading || !travellersInput.trim()}
                className="w-2/3 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-sm font-bold text-white transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950"
              >
                <span>{loading ? "BUILDING JOURNEY..." : "CREATE JOURNEY ROOM"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 6: JOURNEY ROOM GENERATED & SHARE ON WHATSAPP */}
        {/* ============================================================== */}
        {step === 6 && (
          <div className="p-7 rounded-2xl bg-zinc-900/90 border-2 border-indigo-600/70 space-y-6 animate-in fade-in zoom-in-95 duration-300 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                Journey Room Generated
              </div>
              <h3 className="text-3xl font-black text-white font-mono tracking-wider">
                {createdRoomCode || "WINGMAN-7X42"}
              </h3>
              <p className="text-xs text-zinc-300 max-w-sm mx-auto">
                &ldquo;Share this link with everyone travelling with you.&rdquo;
              </p>
            </div>

            {/* Invite Link Card */}
            <div className="p-4 rounded-xl bg-black/60 border border-zinc-800 text-left space-y-2">
              <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest flex items-center justify-between">
                <span>Join Link</span>
                {copied && <span className="text-emerald-400 font-bold">✓ Copied to clipboard</span>}
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 select-all truncate">
                {inviteLink}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              {/* Copy Invite Link */}
              <button
                onClick={handleCopyLink}
                className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-bold text-white transition flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4 text-indigo-400" />
                <span>{copied ? "COPIED TO CLIPBOARD!" : "COPY INVITE LINK"}</span>
              </button>

              {/* Share on WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE LINK ON WHATSAPP</span>
              </a>

              {/* Go to Journey Radar */}
              <button
                onClick={() => router.push(`/journey/${createdRoomCode || "ROOM-WING01"}`)}
                className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xl shadow-indigo-950 transition flex items-center justify-center gap-2"
              >
                <span>ENTER JOURNEY RADAR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto w-full text-center text-[11px] font-mono text-zinc-600 py-3">
        Wingman • Conversational Journey Setup
      </footer>
    </div>
  );
}
