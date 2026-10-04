import { NextRequest, NextResponse } from "next/server";
import { generalWingmanAgent } from "@/lib/agent/general-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      journeyCode = "ROOM-WING01",
      message,
      speaker = "Rahul",
      userApprovalGranted = false,
      approvedAmount,
    } = body;

    if (!message && !userApprovalGranted) {
      return NextResponse.json(
        { success: false, error: "A message or instruction is required." },
        { status: 400 }
      );
    }

    const { agentResult, journeyState } = await generalWingmanAgent.process({
      journeyCode,
      message: message || "I approve the elevated authority option",
      speaker,
      userApprovalGranted,
      approvedAmount,
    });

    return NextResponse.json({
      success: true,
      agentResult,
      journeyState,
    });
  } catch (error: any) {
    console.error("Agent execution error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Wingman was unable to process your instruction: " + error.message,
      },
      { status: 500 }
    );
  }
}
