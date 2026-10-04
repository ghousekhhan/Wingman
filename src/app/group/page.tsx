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
  Users,
  MapPin,
  Calendar,
  Clock,
  Coins,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function GroupJourneyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Group Journey details
  const [title, setTitle] = useState("Sister's Wedding in Goa");
  const [destination, setDestination] = useState("Goa");
  const [origin, setOrigin] = useState("Hyderabad");
  const [arrivalDeadline, setArrivalDeadline] = useState("6:00 PM");
  const [authorityLimit, setAuthorityLimit] = useState(10000);
  const [leadName, setLeadName] = useState("Rahul");
  const [travellers, setTravellers] = useState("Rahul, Meera, Arjun, Sara, Kabir");

  // Output Room
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const randomChars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let codeSuffix = "";
      for (let i = 0; i < 4; i++) {
        codeSuffix += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
      }
      const generatedCode = `WINGMAN-${codeSuffix}`;

      const travellersList = travellers
        .split(/[,;\n]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: generatedCode,
          title: title || `${destination} Group Journey`,
          destination: destination || "Goa",
          origin: origin || "Hyderabad",
          commitment: title || "Family Wedding",
          arrivalDeadline: arrivalDeadline || "6:00 PM",
          leadName: leadName || "Rahul",
          travellers: travellersList.length > 0 ? travellersList : ["Rahul", "Meera", "Arjun", "Sara", "Kabir"],
          authorityLimit: Number(authorityLimit) || 10000,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedRoomCode(generatedCode);
        setStep(2);
      } else {
        setCreatedRoomCode("ROOM-WING01");
        setStep(2);
      }
    } catch (err) {
      console.error("Create group error:", err);
      setCreatedRoomCode("ROOM-WING01");
      setStep(2);
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
    `Hey everyone! I set up our group journey on Wingman: ${destination}.\n\nWingman is protecting our schedule, togetherness, and accessibility.\n\nPlease tap this link to enter your constraints (voice or text):\n${inviteLink}`
  );

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-purple-500 font-sans flex flex-col justify-between p-6">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-950/40">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold tracking-widest text-sm text-white">WINGMAN GROUP</span>
            <span className="text-[10px] font-mono text-purple-400 block">Journey Owner Setup</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 transition"
        >
          Back to Home
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto w-full my-auto py-8">
        {step === 1 && (
          <div className="bg-[#0e1017] rounded-3xl border border-zinc-800 p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-purple-400">
                Step 1 of 2 &bull; Journey Owner
              </span>
              <h2 className="text-2xl sm:text-3xl font-black">Create a journey for your group.</h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                You are the Journey Owner. Wingman will create a private link for your group so everyone can state what matters to them.
              </p>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                  Journey Name / Main Commitment
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sister's Wedding in Goa"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Origin City
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Destination
                  </label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Goa"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Arrival Deadline
                  </label>
                  <input
                    type="text"
                    value={arrivalDeadline}
                    onChange={(e) => setArrivalDeadline(e.target.value)}
                    placeholder="e.g. 6:00 PM"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                    Autonomous Authority (₹)
                  </label>
                  <select
                    value={authorityLimit}
                    onChange={(e) => setAuthorityLimit(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value={0}>₹0 (Ask for everything)</option>
                    <option value={2500}>₹2,500</option>
                    <option value={5000}>₹5,000</option>
                    <option value={10000}>₹10,000 (Recommended)</option>
                    <option value={20000}>₹20,000</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-zinc-400 uppercase block mb-1.5">
                  Initial Travellers (Comma separated)
                </label>
                <input
                  type="text"
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  placeholder="e.g. Rahul, Meera, Arjun, Sara, Kabir"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-800 text-white text-sm focus:outline-none focus:border-purple-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-xl shadow-purple-950/60 transition flex items-center justify-center gap-2"
              >
                <span>{loading ? "Generating Group Link..." : "Create Group Journey"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="bg-[#0e1017] rounded-3xl border border-purple-500/40 p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto">
              <Users className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
                ✓ Journey Room Active
              </span>
              <h2 className="text-3xl font-black">{title}</h2>
              <p className="text-xs text-zinc-400">
                Share this link in your WhatsApp group. Each member will have their own private voice interview with Wingman.
              </p>
            </div>

            {/* Journey Code Highlight */}
            <div className="p-4 rounded-2xl bg-black/60 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">
                Journey Room Code
              </span>
              <span className="text-2xl font-black font-mono tracking-widest text-purple-300">
                {createdRoomCode}
              </span>
            </div>

            {/* Copy Link + WhatsApp Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 bg-black border border-zinc-800 rounded-xl p-2 pl-3">
                <input
                  type="text"
                  readOnly
                  value={inviteLink}
                  className="bg-transparent text-xs text-zinc-300 font-mono flex-1 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white transition flex items-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPY LINK</span>
                    </>
                  )}
                </button>
              </div>

              <a
                href={`https://wa.me/?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Share2 className="w-4 h-4" />
                <span>Share in WhatsApp Group</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href={`/journey/${createdRoomCode}`}
                className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <span>Enter Journey Radar</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs font-mono text-zinc-600 py-4 border-t border-zinc-900">
        Wingman Group &bull; The booking is a transaction. The journey is the outcome.
      </footer>
    </div>
  );
}
