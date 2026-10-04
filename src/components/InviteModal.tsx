"use client";

import { useState } from "react";
import { X, Copy, Check, QrCode, Share2, Users, ExternalLink } from "lucide-react";
import Link from "next/link";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export default function InviteModal({ isOpen, onClose, roomCode }: InviteModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== "undefined" ? window.location.origin : "https://wingman.demo";
  const inviteUrl = `${origin}/join/${roomCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Goa Wedding Journey on Wingman",
        text: `You're invited to join Rahul's Goa Wedding journey (Room ${roomCode}). Configure your constraints so Wingman can protect you.`,
        url: inviteUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-zinc-700 bg-[#12141c] p-6 shadow-2xl space-y-6 text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold">Invite Travellers</h3>
          </div>
          <p className="text-xs text-zinc-400">
            Every traveller onboards their personal constraints, mobility needs, and authority limit.
          </p>
        </div>

        {/* Room Code Badge */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-center space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
            Journey Room Code
          </div>
          <div className="text-2xl font-mono font-bold tracking-wider text-indigo-300">
            {roomCode}
          </div>
        </div>

        {/* Shareable URL input */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-zinc-400 uppercase">Shareable Invite Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl}
              className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition flex items-center gap-1.5 flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: COPY, SHARE, SHOW QR */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleCopy}
            className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 flex flex-col items-center gap-1 transition"
          >
            <Copy className="w-4 h-4 text-indigo-400" />
            <span>Copy Link</span>
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 flex flex-col items-center gap-1 transition"
          >
            <Share2 className="w-4 h-4 text-indigo-400" />
            <span>Share</span>
          </button>
          <button
            onClick={() => setShowQr(!showQr)}
            className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 flex flex-col items-center gap-1 transition"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>{showQr ? "Hide QR" : "Show QR"}</span>
          </button>
        </div>

        {/* QR Code view */}
        {showQr && (
          <div className="p-4 rounded-xl bg-white text-black flex flex-col items-center justify-center space-y-2 animate-in zoom-in-95 duration-200">
            {/* SVG QR Code pattern mockup */}
            <div className="w-36 h-36 bg-zinc-100 border border-zinc-300 rounded p-2 flex items-center justify-center">
              <QrCode className="w-28 h-28 text-zinc-900" />
            </div>
            <div className="text-[10px] font-mono text-zinc-600 font-semibold">
              Scan to Join {roomCode}
            </div>
          </div>
        )}

        {/* Test Join Directly Link */}
        <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Test joining experience:</span>
          <Link
            href={`/join/${roomCode}`}
            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
          >
            <span>Open Join Flow</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
