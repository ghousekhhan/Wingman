import { NextRequest, NextResponse } from "next/server";
import { wingmanAgentEngine } from "@/lib/agent/engine";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { journeyCode = "ROOM-WING01", eventType = "FLIGHT_CANCELLED", scenario = "PRIMARY_DEMO" } = body;

    // Handle Delhivery shipment delay event specifically if triggered
    if (eventType === "SHIPMENT_DELAYED") {
      const journey = await prisma.journey.findUnique({
        where: { code: journeyCode },
      });
      if (journey) {
        await prisma.shipment.updateMany({
          where: { journeyId: journey.id },
          data: {
            status: "DELAYED_RISK",
            riskLevel: "AT_RISK",
            expectedDelivery: "21 Dec 2026, 8:30 PM (Violates 6:00 PM Wedding Deadline)",
            notes: "Ground transit weather bottleneck at Belgaum hub. Wingman autonomous intervention recommended.",
          },
        });
        await prisma.agentActivityLog.create({
          data: {
            journeyId: journey.id,
            stage: "PROTECT",
            timeDisplay: "14:20",
            title: "LOGISTICS DEPENDENCY AT RISK",
            description: "Delhivery shipment DELH-9823471 delayed to 8:30 PM. Wedding Outfits will miss 6:00 PM ceremony without re-routing.",
          },
        });
        return NextResponse.json({
          success: true,
          message: "Shipment delay event injected into Journey State.",
          eventType,
        });
      }
    }

    // Handle generic flight delay event
    if (eventType === "FLIGHT_DELAYED") {
      const journey = await prisma.journey.findUnique({
        where: { code: journeyCode },
      });
      if (journey) {
        await prisma.agentActivityLog.create({
          data: {
            journeyId: journey.id,
            stage: "PROTECT",
            timeDisplay: "14:15",
            title: "EXTERNAL FACT: FLIGHT DELAY",
            description: "IndiGo 6E-542 departure delayed by 45 minutes due to air traffic control congestion.",
          },
        });
        return NextResponse.json({
          success: true,
          message: "Flight delay fact recorded. Telemetry monitoring updated buffer times.",
          eventType,
        });
      }
    }

    // Process through Wingman Autonomous Agent
    const result = await wingmanAgentEngine.processEvent({
      journeyCode,
      eventType: eventType === "AUTHORITY_EXCEEDED_SCENARIO" ? "Flight HYD-GOI cancelled (High-demand holiday surge)" : "Flight HYD-GOI cancelled",
      scenario: eventType === "AUTHORITY_EXCEEDED_SCENARIO" ? "AUTHORITY_EXCEEDED" : (scenario as any),
    });

    return NextResponse.json({
      success: true,
      agentOutput: result.agentOutput,
      caseNumber: result.caseNumber,
      journeyState: result.journeyState,
    });
  } catch (error: any) {
    console.error("Simulation injection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Simulation execution failed: " + error.message,
      },
      { status: 500 }
    );
  }
}
