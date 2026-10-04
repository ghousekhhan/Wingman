"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, ArrowLeft, Check, Sparkles, MapPin, Calendar, Heart, Users, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export default function CreateJourneyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [destination, setDestination] = useState("Goa");
  const [purpose, setPurpose] = useState("My sister's wedding");
  const [deadline, setDeadline] = useState("Before 6:00 PM");
  const [travellers, setTravellers] = useState(["Rahul", "Meera", "Arjun", "Sara", "Kabir"]);
  const [protectedItems, setProtectedItems] = useState<string[]>([
    "ARRIVAL DEADLINES",
    "KEEP GROUP TOGETHER",
    "ACCESSIBILITY",
    "IMPORTANT EVENTS",
  ]);
  const [authority, setAuthority] = useState(10000);

  const protectionOptions = [
    "ARRIVAL DEADLINES",
    "KEEP GROUP TOGETHER",
    "ACCESSIBILITY",
    "BUDGET",
    "IMPORTANT EVENTS",
    "OTHER",
  ];

  const toggleProtection = (opt: string) => {
    if (protectedItems.includes(opt)) {
      setProtectedItems(protectedItems.filter((i) => i !== opt));
    } else {
      setProtectedItems([...protectedItems, opt]);
    }
  };

  const handleNext = () => {
    if (step < 6) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "ROOM-WING01",
          destination,
          commitment: purpose,
          arrivalDeadline: deadline.replace(/before\s+/i, ""),
          authorityLimit: authority,
          leadName: "Rahul",
          travellers,
        }),
      });

      router.push(`/journey/ROOM-WING01`);
    } catch (e) {
      console.error(e);
      router.push(`/journey/ROOM-WING01`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white p-6 font-sans">
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-2">
        <Link href="/" className="flex items-center space-x-2 text-zinc-500 hover:text-white text-xs font-mono transition">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK</span>
        </Link>
        <span className="text-xs font-mono text-zinc-500">STEP {step} OF 6</span>
      </header>

      <main className="max-w-xl mx-auto w-full my-auto py-8 space-y-8">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? "w-6 bg-indigo-500" : i < step ? "w-3 bg-zinc-600" : "w-1.5 bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Where are you going? */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Where are you going?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
              {["Goa", "Mumbai", "Delhi", "Bengaluru", "Jaipur", "Kerala"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setDestination(c)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition ${
                    destination === c
                      ? "border-indigo-500 bg-indigo-950/40 text-white"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: What's taking you there? */}
        {step === 2 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What&apos;s taking you there?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {["My sister's wedding", "Executive summit", "Family vacation"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPurpose(p)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition ${
                    purpose === p
                      ? "border-indigo-500 bg-indigo-950/40 text-white"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: When do you need to arrive? */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">When do you need to arrive?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              {["Before 6:00 PM", "Before 5:00 PM", "Before 7:00 PM"].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeadline(d)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition ${
                    deadline === d
                      ? "border-indigo-500 bg-indigo-950/40 text-white"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Who's travelling? */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Who&apos;s travelling?</h2>
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 text-left space-y-2">
              <div className="text-xs font-mono text-zinc-400">5 Travellers in Family Group:</div>
              <div className="flex flex-wrap gap-2 pt-1">
                {travellers.map((t) => (
                  <span key={t} className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-medium text-zinc-200">
                    {t} {t === "Rahul" ? "(Lead)" : t === "Meera" ? "(Grandmother)" : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: What should Wingman protect? */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">What should Wingman protect?</h2>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {protectionOptions.map((opt) => {
                const isSelected = protectedItems.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleProtection(opt)}
                    className={`p-4 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-950/40 text-white"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 6: How much can Wingman spend without asking you? */}
        {step === 6 && (
          <div className="space-y-6 text-center animate-in fade-in duration-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Autonomous Spending Limit</h2>
            <p className="text-xs text-zinc-400">How much can Wingman spend without asking you?</p>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {[3000, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAuthority(amt)}
                  className={`p-3.5 rounded-xl border text-sm font-bold transition ${
                    authority === amt
                      ? "border-indigo-500 bg-indigo-950/40 text-white"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white"
                  }`}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition flex items-center gap-2"
          >
            <span>{loading ? "INITIALIZING..." : step === 6 ? "YOUR WINGMAN IS READY" : "CONTINUE"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      <footer className="text-center text-[11px] font-mono text-zinc-600 py-2">
        Wingman Progressive Onboarding
      </footer>
    </div>
  );
}
