import { NextRequest, NextResponse } from "next/server";
import { wingmanAgentEngine } from "@/lib/agent/engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { journeyCode = "ROOM-WING01", approvedAmount = 14800, approve = true } = body;

    if (!approve) {
      return NextResponse.json({
        success: true,
        message: "User declined authority elevation. Journey remains in pending state.",
      });
    }

    // Process event with userApprovalGranted
    const result = await wingmanAgentEngine.processEvent({
      journeyCode,
      eventType: "User approved authority override for ₹14,800",
      scenario: "AUTHORITY_EXCEEDED",
      userApprovalGranted: true,
      approvedAmount,
    });

    return NextResponse.json({
      success: true,
      agentOutput: result.agentOutput,
      journeyState: result.journeyState,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process authority approval: " + error.message,
      },
      { status: 500 }
    );
  }
}
