"use client";

import { useState } from "react";
import { Package, Truck, AlertTriangle, CheckCircle2, Clock, MapPin, Zap } from "lucide-react";

interface ShipmentViewProps {
  shipments: any[];
  journeyCode: string;
  onExpediteSuccess?: () => void;
}

export default function ShipmentView({ shipments = [], journeyCode, onExpediteSuccess }: ShipmentViewProps) {
  const [isExpediting, setIsExpediting] = useState(false);
  const [expedited, setExpedited] = useState(false);

  const shipment = shipments[0] || {
    trackingNumber: "DELH-9823471",
    title: "Wedding Outfits & Traditional Sherwanis",
    carrier: "Delhivery Express",
    origin: "Hyderabad Hub",
    destination: "Vivanta Panaji, Goa",
    status: "In Transit",
    expectedDelivery: "21 Dec 2026, 4:00 PM",
    riskLevel: "NORMAL",
  };

  const handleExpedite = async () => {
    setIsExpediting(true);
    try {
      const res = await fetch("/api/shipments/expedite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ journeyCode, trackingNumber: shipment.trackingNumber }),
      });
      if (res.ok) {
        setExpedited(true);
        if (onExpediteSuccess) onExpediteSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExpediting(false);
    }
  };

  const isAtRisk = shipment.riskLevel === "AT_RISK" || shipment.status === "DELAYED_RISK";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-zinc-800 bg-[#0e1017] p-6 shadow-xl space-y-2">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Logistics & Cargo Dependencies</h3>
              <p className="text-xs text-zinc-400">
                Delhivery logistics radar linking critical physical gear to protected events
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
            Delhivery API Synced
          </span>
        </div>
      </div>

      {/* Shipment Card */}
      <div className={`p-6 rounded-xl border bg-[#10121a] shadow-xl space-y-4 ${
        isAtRisk ? "border-amber-700/80" : "border-zinc-800"
      }`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{shipment.title}</h4>
              <p className="text-xs text-zinc-400 font-mono">
                Tracking: {shipment.trackingNumber} • Carrier: {shipment.carrier}
              </p>
            </div>
          </div>

          <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded uppercase ${
            isAtRisk
              ? "bg-amber-950 text-amber-400 border border-amber-800"
              : expedited || shipment.status === "EXPEDITED_RECOVERED"
              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
          }`}>
            {expedited ? "EXPEDITED & ON TRACK" : shipment.status}
          </span>
        </div>

        {/* Route Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Routing</span>
            <div className="font-semibold text-white">{shipment.origin} → {shipment.destination}</div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Estimated Delivery</span>
            <div className={`font-semibold ${isAtRisk ? "text-rose-400" : "text-emerald-400"}`}>
              {expedited ? "21 Dec 2026, 4:15 PM" : shipment.expectedDelivery}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Commitment Link</span>
            <div className="font-semibold text-amber-400">Sister&apos;s Wedding (6:00 PM Deadline)</div>
          </div>
        </div>

        {/* Warning & Expedite Button */}
        {isAtRisk && !expedited && (
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>COMMITMENT AT RISK: Delivery expected after wedding ceremony start.</span>
            </div>
            <p className="text-xs text-zinc-300">
              Ground delay detected near Belgaum hub. Wingman can autonomously re-route this package via Delhivery Air Flash Courier to arrive by 4:15 PM.
            </p>
            <button
              onClick={handleExpedite}
              disabled={isExpediting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-lg transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isExpediting ? "Re-routing..." : "Autonomously Expedite via Air (₹1,450)"}</span>
            </button>
          </div>
        )}

        {expedited && (
          <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Package upgraded to Delhivery Air Direct. Guaranteed delivery at Vivanta Panaji at 4:15 PM, 1.75 hours before the ceremony.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
