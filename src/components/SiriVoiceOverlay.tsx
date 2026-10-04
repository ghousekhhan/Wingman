"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { X, Mic, Volume2, Sparkles, CheckCircle2, Shield, AlertCircle, RefreshCw } from "lucide-react";

interface SiriVoiceOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReceived: (transcript: string) => Promise<string | undefined>;
}

/**
 * Universal browser PCM WAV recorder
 * Produces clean 16kHz 16-bit mono PCM WAV accepted by Gnani STT v3
 */
class PcmWavRecorder {
  private audioCtx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private chunks: Float32Array[] = [];
  private sampleRate = 16000;

  async start(): Promise<void> {
    this.chunks = [];
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass({ sampleRate: this.sampleRate });

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    this.source = this.audioCtx.createMediaStreamSource(this.stream);
    this.processor = this.audioCtx.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const input = e.inputBuffer.getChannelData(0);
      this.chunks.push(new Float32Array(input));
    };

    this.source.connect(this.processor);
    this.processor.connect(this.audioCtx.destination);
  }

  async stop(): Promise<Blob> {
    if (this.processor && this.source) {
      this.source.disconnect();
      this.processor.disconnect();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    const actualSampleRate = this.audioCtx?.sampleRate || this.sampleRate;
    if (this.audioCtx && this.audioCtx.state !== "closed") {
      await this.audioCtx.close();
    }

    // Merge chunks
    const totalLength = this.chunks.reduce((acc, c) => acc + c.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of this.chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    // Convert Float32 to 16-bit PCM
    const pcm = new Int16Array(merged.length);
    for (let i = 0; i < merged.length; i++) {
      const s = Math.max(-1, Math.min(1, merged[i]));
      pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    // RIFF 44-byte WAV header
    const wavBuffer = new ArrayBuffer(44 + pcm.length * 2);
    const view = new DataView(wavBuffer);
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = actualSampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);

    function writeStr(offset: number, str: string) {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    }

    writeStr(0, "RIFF");
    view.setUint32(4, 36 + pcm.length * 2, true);
    writeStr(8, "WAVE");
    writeStr(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, actualSampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeStr(36, "data");
    view.setUint32(40, pcm.length * 2, true);

    const int16View = new Int16Array(wavBuffer, 44);
    int16View.set(pcm);

    return new Blob([wavBuffer], { type: "audio/wav" });
  }
}

export default function SiriVoiceOverlay({
  isOpen,
  onClose,
  onTranscriptReceived,
}: SiriVoiceOverlayProps) {
  const [state, setState] = useState<"READY" | "LISTENING" | "THINKING" | "ACTING" | "SPEAKING">("READY");
  const [transcript, setTranscript] = useState<string>("");
  const [agentSpokenText, setAgentSpokenText] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recorderRef = useRef<PcmWavRecorder | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  }, []);

  // Cleanup on close or unmount
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
      if (recorderRef.current) {
        recorderRef.current.stop().catch(() => {});
        recorderRef.current = null;
      }
      setState("READY");
      setTranscript("");
      setAgentSpokenText("");
      setErrorMessage(null);
    } else {
      // Auto-start listening on open
      startRecording();
    }
    return () => {
      stopAudio();
    };
  }, [isOpen, stopAudio]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const startRecording = async () => {
    setErrorMessage(null);
    setTranscript("");
    setAgentSpokenText("");
    stopAudio();

    try {
      const rec = new PcmWavRecorder();
      recorderRef.current = rec;
      await rec.start();
      setState("LISTENING");
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      recorderRef.current = null;
      setErrorMessage(
        "Microphone access was denied or is unavailable. You can use the quick sample queries below or type in the journey radar."
      );
      setState("READY");
    }
  };

  const stopRecordingAndTranscribe = async () => {
    if (!recorderRef.current) return;
    setState("THINKING");

    try {
      const audioBlob = await recorderRef.current.stop();
      recorderRef.current = null;
      await processAudioWithGnani(audioBlob);
    } catch (err: any) {
      console.error("Recording stop error:", err);
      setErrorMessage("Could not capture audio: " + err.message);
      setState("READY");
    }
  };

  const processAudioWithGnani = async (blob: Blob) => {
    setState("THINKING");
    try {
      const formData = new FormData();
      formData.append("audio_file", blob, "speech.wav");

      // 1. Gnani STT
      const sttRes = await fetch("/api/voice/stt", {
        method: "POST",
        body: formData,
      });

      const sttData = await sttRes.json();
      if (!sttData.success || !sttData.transcript) {
        setErrorMessage(
          sttData.error || "Gnani STT did not detect speech. Tap the orb and try speaking again."
        );
        setState("READY");
        return;
      }

      await executeWithTranscript(sttData.transcript);
    } catch (err: any) {
      console.error("Gnani STT error:", err);
      setErrorMessage("Voice processing error: " + err.message);
      setState("READY");
    }
  };

  const executeWithTranscript = async (text: string) => {
    setTranscript(text);
    setState("ACTING");

    try {
      // 2. Send transcript to Unified Agent Brain
      const reply = await onTranscriptReceived(text);

      if (reply) {
        setAgentSpokenText(reply);
        // 3. Play agent speech with Gnani TTS
        await speakWithGnaniTTS(reply);
      } else {
        setState("READY");
      }
    } catch (err: any) {
      console.error("Agent execution error:", err);
      setErrorMessage("Agent execution error: " + err.message);
      setState("READY");
    }
  };

  const speakWithGnaniTTS = async (text: string) => {
    setState("SPEAKING");
    try {
      const ttsRes = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voice: "Nalini",
          lang: "en-IN",
        }),
      });

      if (!ttsRes.ok) {
        console.warn("TTS failed with status:", ttsRes.status);
        setState("READY");
        return;
      }

      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onended = () => {
        setState("READY");
      };

      audio.onerror = () => {
        setState("READY");
      };

      await audio.play();
    } catch (err) {
      console.warn("TTS playback error:", err);
      setState("READY");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300 select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-xl flex items-center justify-between pt-2 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center shadow">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wider">WINGMAN VOICE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700 text-indigo-300">
                Gnani Vachana AI
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-mono">
              STT v3 (Prisma) + Neural Timbre TTS (Nalini en-IN)
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Close voice assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Siri-Like Interactive Orb */}
      <div className="flex flex-col items-center justify-center space-y-7 my-auto max-w-lg w-full text-center">
        {/* Status Indicator */}
        <div className="space-y-1.5">
          <div className="text-xs font-mono font-bold tracking-widest uppercase">
            {state === "LISTENING" && (
              <span className="text-rose-400 animate-pulse flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                LISTENING TO YOUR VOICE...
              </span>
            )}
            {state === "THINKING" && (
              <span className="text-indigo-400 animate-pulse flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin" />
                TRANSCRIBING VIA GNANI STT...
              </span>
            )}
            {state === "ACTING" && (
              <span className="text-amber-400 animate-pulse flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3 animate-spin" />
                WINGMAN BRAIN RECOVERING JOURNEY...
              </span>
            )}
            {state === "SPEAKING" && (
              <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                WINGMAN SPOKEN RESPONSE
              </span>
            )}
            {state === "READY" && <span className="text-zinc-400">TAP THE ORB TO SPEAK</span>}
          </div>
          <p className="text-xs text-zinc-400">
            {state === "LISTENING"
              ? "Describe any disruption or question. Tap the orb when done."
              : state === "THINKING"
              ? "Converting speech with Gnani Vachana AI"
              : state === "ACTING"
              ? "Evaluating hard deadlines, Meera's accessibility, and budget limits"
              : state === "SPEAKING"
              ? "Streaming Nalini neural voice synthesis"
              : "Tap the orb to start speaking"}
          </p>
        </div>

        {/* Pulsating Iridescent Siri Orb */}
        <div className="relative flex items-center justify-center py-4">
          {/* Animated Ambient Blur Glow */}
          <div
            className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
              state === "LISTENING"
                ? "w-64 h-64 bg-gradient-to-r from-rose-500/40 via-purple-500/40 to-indigo-500/40 blur-3xl animate-pulse"
                : state === "THINKING" || state === "ACTING"
                ? "w-72 h-72 bg-gradient-to-r from-indigo-500/50 via-purple-500/50 to-pink-500/50 blur-3xl animate-spin"
                : state === "SPEAKING"
                ? "w-64 h-64 bg-gradient-to-r from-emerald-500/40 via-teal-500/40 to-indigo-500/40 blur-3xl animate-pulse"
                : "w-48 h-48 bg-indigo-600/25 blur-2xl"
            }`}
          />

          {/* Interactive Core Orb Button */}
          <button
            onClick={() => {
              if (state === "LISTENING") {
                stopRecordingAndTranscribe();
              } else if (state === "SPEAKING") {
                stopAudio();
                setState("READY");
              } else {
                startRecording();
              }
            }}
            className={`relative z-10 w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
              state === "LISTENING"
                ? "bg-gradient-to-tr from-rose-600 via-purple-600 to-indigo-600 scale-105 shadow-rose-900/60 ring-8 ring-rose-500/20"
                : state === "THINKING" || state === "ACTING"
                ? "bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 animate-pulse shadow-indigo-900/60"
                : state === "SPEAKING"
                ? "bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 scale-105 shadow-emerald-900/60 ring-8 ring-emerald-500/20"
                : "bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-700 hover:scale-105 shadow-indigo-900/40 ring-4 ring-indigo-500/10"
            }`}
          >
            {state === "SPEAKING" ? (
              <Volume2 className="w-14 h-14 text-white animate-pulse" />
            ) : (
              <Mic className="w-14 h-14 text-white" />
            )}
          </button>
        </div>

        {/* User Transcript Display */}
        {transcript && (
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-left w-full space-y-1 animate-in fade-in duration-200">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              You Said (Gnani Recognized)
            </span>
            <p className="text-sm text-zinc-100 font-medium italic leading-relaxed">
              &ldquo;{transcript}&rdquo;
            </p>
          </div>
        )}

        {/* Agent Spoken Reply */}
        {agentSpokenText && (
          <div className="p-4 rounded-2xl bg-indigo-950/50 border border-indigo-800/90 text-left w-full space-y-2 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
              <span>Wingman Autonomous Voice</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Volume2 className="w-3.5 h-3.5" /> Nalini Neural TTS
              </span>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">
              {agentSpokenText}
            </p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900 text-xs text-rose-300 font-mono text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Voice Demo Prompts (Useful for rapid testing & evaluation) */}
        <div className="w-full space-y-2 pt-2 border-t border-zinc-800/80">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest text-left">
            Or Test Instantly With One Tap
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { label: "Flight Cancelled", text: "My flight HYD-GOI was cancelled." },
              { label: "Train Delayed 3 Hours", text: "My train is delayed by 3 hours." },
              { label: "Cab Cancelled", text: "My airport cab was cancelled." },
              { label: "Check Journey Status", text: "What is our current status for the wedding?" },
            ].map((q) => (
              <button
                key={q.label}
                disabled={state === "THINKING" || state === "ACTING"}
                onClick={() => executeWithTranscript(q.text)}
                className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-left text-zinc-300 transition text-[11px] disabled:opacity-50"
              >
                <div className="font-semibold text-white">{q.label}</div>
                <div className="text-[10px] text-zinc-400 truncate">&ldquo;{q.text}&rdquo;</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="text-[11px] font-mono text-zinc-600 text-center pb-1">
        Wingman Autonomous Voice • End-to-end speech loop powered by Gnani Vachana AI
      </div>
    </div>
  );
}
