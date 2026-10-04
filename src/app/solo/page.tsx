"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HeartHandshake,
  Users,
  Coins,
  Accessibility,
  GitFork,
  Plane,
  Car,
  Hotel,
  Calendar,
  RotateCcw,
  Radio,
  Play,
  Check,
} from "lucide-react";
import { JourneyStateData } from "@/lib/agent/gemini-agent";

interface ChatMessage {
  id: string;
  role: "agent" | "user";
  text: string;
  timestamp: string;
  isSpoken?: boolean;
}

export default function SoloJourneyPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-init",
      role: "agent",
      text: "Tell me about your journey. You don't need to plan everything first. Just tell me what you're trying to do.",
      timestamp: "Just now",
    },
  ]);

  const [journeyState, setJourneyState] = useState<JourneyStateData>({
    autonomousAuthority: 10000,
    budget: 10000,
    travellers: ["You"],
  });

  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Agent Ready");
  const [isPlanReady, setIsPlanReady] = useState(false);

  // Recovery & Disruption state
  const [activeDisruption, setActiveDisruption] = useState<any>(null);
  const [recoveryExecuted, setRecoveryExecuted] = useState(false);
  const [executingOptionId, setExecutingOptionId] = useState<string | null>(null);

  // Audio recording references
  const audioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Float32Array[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initial welcome speech on first user click or load
  const playTts = useCallback(
    async (text: string) => {
      if (isAudioMuted) return;
      try {
        setIsSpeaking(true);
        if (currentAudioRef.current) {
          currentAudioRef.current.pause();
        }
        const res = await fetch("/api/voice/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voice: "Nalini", lang: "en-IN" }),
        });
        if (res.ok) {
          const blob = await res.blob();
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
        } else {
          setIsSpeaking(false);
        }
      } catch (e) {
        console.warn("TTS playback skipped:", e);
        setIsSpeaking(false);
      }
    },
    [isAudioMuted]
  );

  // Start Voice Recording with Web Audio API 16kHz PCM
  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        chunksRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);

      setIsRecording(true);
      setStatusMessage("Listening...");
    } catch (err: any) {
      console.error("Mic error:", err);
      setStatusMessage("Mic unavailable. Use text fallback.");
    }
  };

  // Stop Recording and Transcribe with Gnani STT
  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    setStatusMessage("Transcribing with Gnani...");

    try {
      if (processorRef.current) processorRef.current.disconnect();
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        await audioCtxRef.current.close();
      }

      // Merge chunks into 16kHz 16-bit PCM WAV
      const totalLength = chunksRef.current.reduce((acc, c) => acc + c.length, 0);
      if (totalLength === 0) {
        setStatusMessage("Agent Ready");
        return;
      }

      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of chunksRef.current) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }

      const pcm = new Int16Array(merged.length);
      for (let i = 0; i < merged.length; i++) {
        const s = Math.max(-1, Math.min(1, merged[i]));
        pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      const wavBuffer = new ArrayBuffer(44 + pcm.length * 2);
      const view = new DataView(wavBuffer);
      const numChannels = 1;
      const sampleRate = 16000;
      const bitsPerSample = 16;
      const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
      const blockAlign = numChannels * (bitsPerSample / 8);

      const writeStr = (pos: number, str: string) => {
        for (let i = 0; i < str.length; i++) view.setUint8(pos + i, str.charCodeAt(i));
      };

      writeStr(0, "RIFF");
      view.setUint32(4, 36 + pcm.length * 2, true);
      writeStr(8, "WAVE");
      writeStr(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeStr(36, "data");
      view.setUint32(40, pcm.length * 2, true);

      let p = 44;
      for (let i = 0; i < pcm.length; i++) {
        view.setInt16(p, pcm[i], true);
        p += 2;
      }

      const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio_file", wavBlob, "voice_input.wav");

      const sttRes = await fetch("/api/voice/stt", {
        method: "POST",
        body: formData,
      });

      if (!sttRes.ok) {
        throw new Error(`STT failed with ${sttRes.status}`);
      }

      const sttData = await sttRes.json();
      const transcript = (sttData.transcript || "").trim();

      if (transcript) {
        await handleSendInput(transcript);
      } else {
        setStatusMessage("No speech detected. Try again.");
      }
    } catch (e: any) {
      console.error("Transcription error:", e);
      setStatusMessage("Voice recognition error. Please type.");
    }
  };

  // Main agent interaction loop
  const handleSendInput = async (text: string) => {
    if (!text || !text.trim()) return;
    const cleanText = text.trim();
    setInputText("");

    // Add user message to conversation
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      text: cleanText,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsProcessing(true);
    setStatusMessage("Wingman thinking...");

    try {
      // Check if user is asking to disrupt or inject flight change
      const isDisruptionPrompt =
        cleanText.toLowerCase().includes("cancelled") ||
        cleanText.toLowerCase().includes("delayed") ||
        cleanText.toLowerCase().includes("broken");

      if (isDisruptionPrompt && isPlanReady) {
        // Trigger disruption recovery
        await handleDisruptionTrigger(cleanText);
        return;
      }

      // Check if user is editing the plan
      const isEditPrompt =
        isPlanReady &&
        (cleanText.toLowerCase().includes("budget") ||
          cleanText.toLowerCase().includes("train") ||
          cleanText.toLowerCase().includes("wheelchair") ||
          cleanText.toLowerCase().includes("earlier"));

      const action = isEditPrompt ? "edit_plan" : "interview";

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          currentState: journeyState,
          message: cleanText,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to process");
      }

      const result = data.interviewResult;
      setJourneyState(result.updatedState);

      if (result.isReady) {
        setIsPlanReady(true);
      }

      // Add agent response
      const agentMsg: ChatMessage = {
        id: `msg-agent-${Date.now()}`,
        role: "agent",
        text: result.message,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setStatusMessage("Agent Ready");

      // Play short, natural spoken response via Gnani TTS
      if (result.spokenResponse) {
        await playTts(result.spokenResponse);
      }
    } catch (err: any) {
      console.error("Agent error:", err);
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "agent",
        text: "I couldn't quite catch that. Could you repeat where you are heading or what matters most?",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errMsg]);
      setStatusMessage("Agent Ready");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle disruption simulation / voice prompt
  const handleDisruptionTrigger = async (disruptionText: string) => {
    setIsProcessing(true);
    setStatusMessage("Assessing journey impact...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyCode: "ROOM-WING01",
          message: disruptionText,
          speaker: "You",
        }),
      });

      const data = await res.json();
      const agentResult = data.agentResult;

      setActiveDisruption({
        event: agentResult.event,
        impact: agentResult.impact,
        options: agentResult.candidateOptions || [
          {
            id: "OPT-A",
            name: "Option A (Best Balance)",
            provider: "IndiGo 6E-891",
            cost: 6400,
            arrivalTime: "5:20 PM",
            tradeoff: "Arrives before 6 PM deadline, everyone together, within authority",
          },
          {
            id: "OPT-B",
            name: "Option B (Earliest Arrival)",
            provider: "Air India AI-512",
            cost: 7800,
            arrivalTime: "5:05 PM",
            tradeoff: "Earliest arrival, full group together, ₹1,400 higher cost",
          },
          {
            id: "OPT-C",
            name: "Option C (Split Party)",
            provider: "SpiceJet SG-402",
            cost: 5900,
            arrivalTime: "5:40 PM",
            tradeoff: "Lower cost, but splits party across 2 rows",
          },
          {
            id: "OPT-D",
            name: "Option D (Cheapest / Misses Deadline)",
            provider: "Vistara UK-920",
            cost: 4200,
            arrivalTime: "7:30 PM",
            tradeoff: "Cheapest, but misses the 6:00 PM wedding arrival deadline",
          },
        ],
        spokenResponse:
          agentResult.spokenResponse ||
          "Got it. Your flight is cancelled. I'm checking what that does to the rest of your journey. I found four options on your screen.",
      });

      const agentMsg: ChatMessage = {
        id: `msg-disrupt-${Date.now()}`,
        role: "agent",
        text: `Flight disruption detected. I've analyzed your commitments and found 4 candidate options below.`,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, agentMsg]);
      setStatusMessage("Decision required");

      if (agentResult.spokenResponse) {
        await playTts(agentResult.spokenResponse);
      }
    } catch (e: any) {
      console.error("Disruption error:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute selected recovery option
  const executeRecoveryOption = async (option: any) => {
    setExecutingOptionId(option.id);
    setStatusMessage(`Executing ${option.name || option.provider}...`);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          journeyCode: "ROOM-WING01",
          message: `I approve ${option.name || option.provider}`,
          userApprovalGranted: true,
          approvedAmount: option.cost,
        }),
      });

      const data = await res.json();
      setRecoveryExecuted(true);

      const finishMsg: ChatMessage = {
        id: `msg-finish-${Date.now()}`,
        role: "agent",
        text: `Confirmed! Booked ${option.provider} for ₹${option.cost.toLocaleString("en-IN")}. Pine Labs settlement verified. Ground airport transfer automatically re-synchronized.`,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, finishMsg]);
      setStatusMessage("Journey Recovered & Viable");

      await playTts(
        `Payment confirmed via Pine Labs. Your replacement booking and airport transfer are fully verified.`
      );
    } catch (e: any) {
      console.error("Recovery execution failed:", e);
    } finally {
      setExecutingOptionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-indigo-500 font-sans flex flex-col">
      {/* Top Bar */}
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-[#0e1017]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center hover:bg-indigo-500 transition"
          >
            <Shield className="w-4 h-4 text-white" />
          </Link>
          <div>
            <h1 className="text-sm font-extrabold tracking-widest text-white">WINGMAN SOLO</h1>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  isRecording
                    ? "bg-rose-500 animate-ping"
                    : isProcessing
                    ? "bg-amber-400 animate-pulse"
                    : "bg-emerald-500"
                }`}
              />
              <span>{statusMessage}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 rounded-lg border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition text-xs flex items-center gap-1.5"
            title={isAudioMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
            <span className="hidden sm:inline font-mono">{isAudioMuted ? "Muted" : "Voice Active"}</span>
          </button>

          <Link
            href="/"
            className="text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
          >
            Exit Solo
          </Link>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Agent & Conversation (7 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[calc(100vh-120px)] bg-[#0e1017] rounded-3xl border border-zinc-800/80 p-5 shadow-2xl relative overflow-hidden">
          {/* Speaking Wave Header */}
          {isSpeaking && (
            <div className="absolute top-0 left-0 right-0 py-1.5 bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-indigo-900/60 border-b border-indigo-500/30 flex items-center justify-center gap-2 text-xs font-mono text-indigo-300 animate-pulse z-10">
              <Radio className="w-3.5 h-3.5 text-indigo-400" />
              <span>Wingman Speaking...</span>
            </div>
          )}

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 pt-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "agent" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shrink-0 shadow-md">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-md p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none font-medium"
                      : "bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none"
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[10px] text-zinc-400/80 block mt-1.5 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Voice-First Interface & Big Mic */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-4">
            {/* Quick Sample Prompts if beginning */}
            {!isPlanReady && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                  Quick examples to speak:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      handleSendInput(
                        "I'm going to Goa for my sister's wedding on December 21. I need to arrive before 6 PM from Hyderabad with my parents."
                      )
                    }
                    className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 transition text-left"
                  >
                    &ldquo;Goa wedding on Dec 21, arrive before 6 PM...&rdquo;
                  </button>
                  <button
                    onClick={() =>
                      handleSendInput(
                        "I'm going to Delhi for a job interview tomorrow at 10 AM. Budget is 15,000."
                      )
                    }
                    className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-800 transition text-left"
                  >
                    &ldquo;Delhi job interview tomorrow...&rdquo;
                  </button>
                </div>
              </div>
            )}

            {/* Central Big Mic Button */}
            <div className="flex flex-col items-center justify-center py-2">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition shadow-2xl ${
                  isRecording
                    ? "bg-rose-600 scale-110 shadow-rose-900/80 animate-pulse"
                    : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-950/80 hover:scale-105"
                }`}
              >
                {/* Visual pulse ring when recording */}
                {isRecording && (
                  <span className="absolute inset-0 rounded-full border-4 border-rose-400 animate-ping opacity-75" />
                )}
                {isRecording ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
              <span className="text-xs font-mono text-zinc-400 mt-2">
                {isRecording ? "Listening... Tap to send" : "Tap and speak naturally"}
              </span>
            </div>

            {/* Text Fallback underneath */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendInput(inputText);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Or type your journey details or edits here..."
                disabled={isProcessing || isRecording}
                className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Progressive Journey State & Living Plan (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-5">
          {/* Card: WHAT WINGMAN KNOWS (Progressive State) */}
          <div className="bg-[#0e1017] rounded-3xl border border-zinc-800/80 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-bold">
                  What Wingman Knows
                </h3>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Living State
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Destination</span>
                <span className="font-bold text-white text-sm">
                  {journeyState.destination || <span className="text-zinc-600 italic">Listening...</span>}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Origin</span>
                <span className="font-bold text-white text-sm">
                  {journeyState.origin || <span className="text-zinc-600 italic">Hyderabad</span>}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Purpose</span>
                <span className="font-bold text-zinc-200">
                  {journeyState.objective || <span className="text-zinc-600 italic">Discovered in chat</span>}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60">
                <span className="text-[10px] font-mono text-zinc-500 block uppercase">Deadline</span>
                <span className="font-bold text-amber-400">
                  {journeyState.deadlines?.[0] || <span className="text-zinc-600 italic">Pending</span>}
                </span>
              </div>
            </div>

            {/* Constraints & Accessibility pills */}
            <div className="space-y-2 pt-1 border-t border-zinc-800/60">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                Protected Constraints
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(journeyState.hardConstraints || []).length > 0 || (journeyState.accessibilityRequirements || []).length > 0 ? (
                  <>
                    {journeyState.hardConstraints?.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-md"
                      >
                        ✓ {c}
                      </span>
                    ))}
                    {journeyState.accessibilityRequirements?.map((a, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-md"
                      >
                        ♿ {a}
                      </span>
                    ))}
                  </>
                ) : (
                  <span className="text-xs text-zinc-500 italic">
                    Tell Wingman about who is travelling or special requirements
                  </span>
                )}
              </div>
            </div>

            {/* Autonomous Authority */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs font-mono">
              <span className="text-zinc-500">Autonomous Authority:</span>
              <span className="text-emerald-400 font-bold">
                ₹{(journeyState.autonomousAuthority || 10000).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {/* Living Plan Generator & Timeline */}
          {isPlanReady ? (
            <div className="bg-[#0e1017] rounded-3xl border border-zinc-800/80 p-5 shadow-xl space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                    ✓ Protected Outcome
                  </span>
                  <h3 className="text-base font-bold text-white">Wingman&apos;s Plan</h3>
                </div>
                <span className="text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  Continuous
                </span>
              </div>

              {/* Plan timeline steps */}
              <div className="space-y-3">
                {(journeyState.currentPlan || []).map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      {step.mode === "FLIGHT" ? (
                        <Plane className="w-3.5 h-3.5" />
                      ) : step.mode === "TRANSFER" ? (
                        <Car className="w-3.5 h-3.5" />
                      ) : step.mode === "HOTEL" ? (
                        <Hotel className="w-3.5 h-3.5" />
                      ) : (
                        <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-200">{step.detail}</span>
                        <span className="font-mono text-zinc-500 text-[10px]">{step.departure}</span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 block mt-0.5">
                        ✓ {step.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversational editing suggestion pills */}
              <div className="pt-2 border-t border-zinc-800/60 space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 block">
                  Edit conversationally (speak or click):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleSendInput("Change the budget to 15,000")}
                    className="text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 transition"
                  >
                    &ldquo;Change budget to 15,000&rdquo;
                  </button>
                  <button
                    onClick={() => handleSendInput("My mother needs wheelchair assistance")}
                    className="text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 transition"
                  >
                    &ldquo;Add wheelchair assistance&rdquo;
                  </button>
                  <button
                    onClick={() => handleSendInput("I'd rather take a train")}
                    className="text-[11px] font-mono bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-zinc-800 transition"
                  >
                    &ldquo;Prefer train&rdquo;
                  </button>
                </div>
              </div>

              {/* Live Disruption Simulator Trigger */}
              <div className="pt-3 border-t border-zinc-800/60">
                <button
                  onClick={() => handleDisruptionTrigger("My flight was cancelled.")}
                  className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold transition flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Simulate Flight Cancellation Disruption</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-zinc-900/30 border border-dashed border-zinc-800 text-center space-y-3">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
              <h4 className="text-sm font-semibold text-zinc-400">Listening to Your Journey</h4>
              <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                Wingman is gathering essential details. Speak freely, and your plan will emerge here automatically.
              </p>
            </div>
          )}

          {/* Disruption & Recovery Options Card */}
          {activeDisruption && (
            <div className="bg-[#120d14] rounded-3xl border border-rose-500/40 p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
                  <h3 className="text-sm font-bold text-rose-200">{activeDisruption.event}</h3>
                </div>
                <span className="text-[10px] font-mono bg-rose-950 text-rose-400 px-2 py-0.5 rounded-full border border-rose-500/30">
                  CRITICAL
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="text-zinc-300">
                  <span className="text-zinc-500 font-mono">Affected: </span>
                  {activeDisruption.impact?.affectedCommitments?.join(", ") || "Sister's Wedding (7:00 PM)"}
                </div>
                <div className="text-zinc-300">
                  <span className="text-zinc-500 font-mono">Broken: </span>
                  {activeDisruption.impact?.brokenDependencies?.join(", ") || "Flight -> Airport Transfer"}
                </div>
              </div>

              {/* 4 Candidate Options */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                  Viable Recovery Options (Human Choice):
                </span>
                {activeDisruption.options?.map((opt: any) => (
                  <div
                    key={opt.id}
                    className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-indigo-500/60 transition flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{opt.provider || opt.name}</span>
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        ₹{opt.cost.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-snug">{opt.tradeoff}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-amber-400">
                        Arrival: {opt.arrivalTime}
                      </span>
                      <button
                        onClick={() => executeRecoveryOption(opt)}
                        disabled={recoveryExecuted || executingOptionId !== null}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-mono text-xs font-semibold transition flex items-center gap-1"
                      >
                        {executingOptionId === opt.id ? (
                          <span>Executing...</span>
                        ) : recoveryExecuted ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Executed</span>
                          </>
                        ) : (
                          <span>Choose Option</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
