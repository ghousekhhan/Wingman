import { NextRequest, NextResponse } from "next/server";
import { geminiAgent, JourneyStateData } from "@/lib/agent/gemini-agent";
import { generalWingmanAgent } from "@/lib/agent/general-agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "process",
      journeyCode = "ROOM-WING01",
      message,
      speaker = "Rahul",
      userApprovalGranted = false,
      approvedAmount,
      currentState,
      history,
    } = body;

    // 1. Voice/Text Interview action
    if (action === "interview") {
      if (!message) {
        return NextResponse.json(
          { success: false, error: "A message is required for interview." },
          { status: 400 }
        );
      }
      const interviewResult = await geminiAgent.interview({
        currentState: currentState || {},
        message,
        history,
      });
      return NextResponse.json({
        success: true,
        interviewResult,
      });
    }

    // 2. Conversational Plan Edit action
    if (action === "edit_plan") {
      if (!message) {
        return NextResponse.json(
          { success: false, error: "An instruction is required to edit the plan." },
          { status: 400 }
        );
      }
      const editResult = await geminiAgent.editPlan(currentState || {}, message);
      return NextResponse.json({
        success: true,
        interviewResult: editResult,
      });
    }

    // 3. Standard Disruption & Instruction Execution
    if (!message && !userApprovalGranted) {
      return NextResponse.json(
        { success: false, error: "A message or instruction is required." },
        { status: 400 }
      );
    }

    // Process through central Gemini Agent brain
    const { agentResult, journeyState } = await generalWingmanAgent.process({
      journeyCode,
      message: message || "I approve the elevated authority option",
      speaker,
      userApprovalGranted,
      approvedAmount,
    });

    return NextResponse.json({
      success: true,
      agentResult: {
        ...agentResult,
        spokenResponse:
          agentResult.spokenResponse ||
          (agentResult.decision?.type === "ASK_APPROVAL"
            ? `Replacement option requires ₹${agentResult.decision.cost?.toLocaleString("en-IN")}, which exceeds your spending limit. Please confirm if you approve.`
            : `I have updated your journey plan to protect your commitments.`),
      },
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
