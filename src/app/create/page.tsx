"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowRight, ArrowLeft, Check, Sparkles, MapPin, Calendar, Heart, Users, Clock, DollarSign } from "lucide-react";

export default function CreateJourneyPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State initialized to demo defaults
  const [destination, setDestination] = useState("Goa");
  const [date, setDate] = useState("2026-12-21");
  const [purpose, setPurpose] = useState("Sister's Wedding");
  const [travellers, setTravellers] = useState(["Rahul (Lead)", "Meera (Grandmother)", "Arjun", "Sara", "Kabir"]);
  const [deadline, setDeadline] = useState("6:00 PM");
  const [authority, setAuthority] = useState(10000);

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
      const res = await fetch("/api/journey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: "ROOM-WING01",
          destination,
          date,
          commitment: purpose,
          arrivalDeadline: deadline,
          authorityLimit: authority,
          leadName: "Rahul",
          leadRole: "Lead Traveller",
          travellers,
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(`/journey/ROOM-WING01`);
      } else {
        router.push(`/journey/ROOM-WING01`);
      }
    } catch (e) {
      console.error(e);
      router.push(`/journey/ROOM-WING01`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-zinc-400 hover:text-white text-xs font-mono transition">
          <ArrowLeft className="w-4 h-4" />
          <span>BACK</span>
        </Link>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider">WINGMAN ONBOARDING</span>
        </div>
        <div className="text-xs font-mono text-zinc-500">
          STEP {step} OF 6
        </div>
      </header>

      {/* Main Interactive Wizard */}
      <main className="max-w-2xl mx-auto px-6 py-8 w-full my-auto space-y-8">
        {/* Step Indicator dots */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? "w-8 bg-indigo-500" : i < step ? "w-4 bg-indigo-900" : "w-2 bg-zinc-800"
              }`}
            />
          ))}
        </div>

        {/* Question 1: Where are you going? */}
        {step === 1 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
              <MapPin className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold">Where are you going?</h2>
              <p className="text-xs text-zinc-400">Wingman maps the multi-leg route and regional transport contingencies.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2">
              {["Goa", "Mumbai", "Delhi", "Bengaluru", "Jaipur", "Kerala"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setDestination(city)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition ${
                    destination === city
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <div className="text-base">{city}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">India Route</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 2: When? */}
        {step === 2 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold">When are you travelling?</h2>
              <p className="text-xs text-zinc-400">Sets the timeline radar for weather, carrier schedules, and traffic patterns.</p>
            </div>

            <div className="max-w-md mx-auto p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4 text-left">
              <label className="text-xs font-mono text-zinc-400 uppercase">Departure Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black border border-zinc-700 text-white text-sm font-mono focus:border-indigo-500 focus:outline-none"
              />
              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-300">
                Demo default locked: <strong>21 December 2026</strong> (Goa peak wedding season)
              </div>
            </div>
          </div>
        )}

        {/* Question 3: What are you travelling for? */}
        {step === 3 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
              <Heart className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold">What are you travelling for?</h2>
              <p className="text-xs text-zinc-400">The commitment is the outcome. Wingman protects the outcome, not just the ticket.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2">
              {[
                { title: "Sister's Wedding", desc: "Ceremony at 7:00 PM", defaultVal: true },
                { title: "Executive Summit", desc: "Keynote presentation", defaultVal: false },
                { title: "Family Vacation", desc: "Relaxation & leisure", defaultVal: false },
              ].map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setPurpose(item.title)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition ${
                    purpose === item.title
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 4: Who are you travelling with? */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold">Who are you travelling with?</h2>
              <p className="text-xs text-zinc-400">Wingman coordinates each person as an individual with distinct constraints.</p>
            </div>

            <div className="max-w-lg mx-auto space-y-2 text-left">
              <div className="p-3.5 rounded-xl border border-indigo-600/60 bg-zinc-900/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Rahul (You)</span>
                  <div className="text-[11px] text-zinc-400">Lead Traveller • Coordinates Family</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  LEAD
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-indigo-600/60 bg-zinc-900/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white">Meera</span>
                  <div className="text-[11px] text-indigo-300">Grandmother • Wheelchair Assistance & Group Stay</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  ACCESSIBLE
                </span>
              </div>

              {["Arjun", "Sara", "Kabir"].map((name) => (
                <div key={name} className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-300">{name} (Family Member)</span>
                  <span className="text-[10px] font-mono text-zinc-500">GROUP STAY</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question 5: What absolutely cannot go wrong? */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold">What absolutely cannot go wrong?</h2>
              <p className="text-xs text-zinc-400">Hard non-negotiable arrival boundary. Missing this means total journey failure.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-left pt-2">
              {[
                { time: "6:00 PM", label: "Arrive before 6:00 PM", desc: "1 hour buffer prior to wedding ceremony" },
                { time: "5:00 PM", label: "Arrive before 5:00 PM", desc: "2 hour buffer for dress change" },
                { time: "7:00 PM", label: "Arrive before 7:00 PM", desc: "Direct ceremony start" },
              ].map((item) => (
                <button
                  key={item.time}
                  type="button"
                  onClick={() => setDeadline(item.time)}
                  className={`p-4 rounded-xl border text-sm font-semibold transition ${
                    deadline === item.time
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <div className="text-lg font-bold text-white">{item.time}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">{item.label}</div>
                  <div className="text-[10px] text-zinc-500 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question 6: How much can Wingman spend without asking you? */}
        {step === 6 && (
          <div className="space-y-6 text-center animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mx-auto text-indigo-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold">Autonomous Spending Limit</h2>
              <p className="text-xs text-zinc-400">
                How much can Wingman autonomously authorize with Pine Labs to protect your wedding outcome without waking you?
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto text-left pt-2">
              {[3000, 5000, 10000, 20000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAuthority(amt)}
                  className={`p-4 rounded-xl border text-center transition ${
                    authority === amt
                      ? "border-indigo-500 bg-indigo-950/40 text-white shadow-lg shadow-indigo-950/50"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700 hover:text-white"
                  }`}
                >
                  <div className="text-lg font-bold">₹{amt.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">Autonomous</div>
                </button>
              ))}
            </div>

            <div className="max-w-md mx-auto p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400 text-left font-mono">
              <span className="text-indigo-400 font-bold">Bounded Autonomy Rule:</span> If an airline disruption requires spending more than ₹{authority.toLocaleString("en-IN")}, Wingman will stop and present the exact decision for human approval.
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-800/80">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 border border-zinc-800 transition"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}

          <button
            type="button"
            disabled={loading}
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-900/40 transition flex items-center gap-2 group"
          >
            <span>{loading ? "INITIALIZING ROOM..." : step === 6 ? "CREATE ROOM-WING01" : "CONTINUE"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </main>

      <footer className="w-full text-center py-4 text-[11px] font-mono text-zinc-600">
        Wingman Core Engine • Autonomous Journey Continuity
      </footer>
    </div>
  );
}
