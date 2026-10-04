import { NextRequest, NextResponse } from "next/server";
import { geminiAgent, JourneyStateData } from "@/lib/agent/gemini-agent";
import { generalWingmanAgent } from "@/lib/agent/general-agent";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action = "process",
      journeyCode,
      journeyId,
      message,
      speaker = "Rahul",
      userApprovalGranted = false,
      approvedAmount,
      currentState,
      history,
    } = body;

    const targetCode = journeyCode || journeyId;

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

      // Persist to DB if a specific journey is being tracked
      if (targetCode) {
        try {
          const journey = await prisma.journey.findFirst({
            where: {
              OR: [{ code: targetCode }, { id: targetCode }],
            },
          });

          if (journey) {
            const updated = interviewResult.updatedState;
            await prisma.journey.update({
              where: { id: journey.id },
              data: {
                destination: updated.destination || journey.destination,
                origin: updated.origin || journey.origin,
                purpose: updated.objective || journey.purpose,
                arrivalDeadline: updated.deadlines?.[0] || journey.arrivalDeadline,
                authorityLimit:
                  updated.autonomousAuthority !== undefined
                    ? updated.autonomousAuthority
                    : journey.authorityLimit,
              },
            });

            // Persist message history
            await prisma.message.create({
              data: {
                journeyId: journey.id,
                sender: speaker || "Traveller",
                content: message,
                isAgent: false,
              },
            });

            const agentResponseText =
              interviewResult.displayText || interviewResult.spokenResponse || "Understood.";
            await prisma.message.create({
              data: {
                journeyId: journey.id,
                sender: "Wingman",
                content: agentResponseText,
                isAgent: true,
              },
            });
          }
        } catch (dbErr) {
          console.warn("Could not persist interview turn to DB:", dbErr);
        }
      }

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

      if (targetCode) {
        try {
          const journey = await prisma.journey.findFirst({
            where: {
              OR: [{ code: targetCode }, { id: targetCode }],
            },
          });
          if (journey) {
            const updated = editResult.updatedState;
            await prisma.journey.update({
              where: { id: journey.id },
              data: {
                destination: updated.destination || journey.destination,
                origin: updated.origin || journey.origin,
                purpose: updated.objective || journey.purpose,
                arrivalDeadline: updated.deadlines?.[0] || journey.arrivalDeadline,
                authorityLimit:
                  updated.autonomousAuthority !== undefined
                    ? updated.autonomousAuthority
                    : journey.authorityLimit,
              },
            });
          }
        } catch (dbErr) {
          console.warn("Could not persist edit_plan turn to DB:", dbErr);
        }
      }

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

    const effectiveCode = targetCode || "ROOM-WING01";

    // Process through central Gemini Agent brain
    const { agentResult, journeyState } = await generalWingmanAgent.process({
      journeyCode: effectiveCode,
      message: message || "I approve the elevated authority option",
      speaker,
      userApprovalGranted,
      approvedAmount,
    });

    const speechText =
      agentResult.speechText ||
      agentResult.spokenResponse ||
      (agentResult.decision?.type === "ASK_APPROVAL"
        ? `Replacement option requires ₹${agentResult.decision.cost?.toLocaleString("en-IN")}, which exceeds your spending limit. Please confirm if you approve.`
        : `I have updated your journey plan to protect your commitments.`);

    const displayText =
      agentResult.displayText ||
      agentResult.communication ||
      speechText;

    return NextResponse.json({
      success: true,
      agentResult: {
        ...agentResult,
        displayText,
        communication: displayText,
        speechText,
        spokenResponse: speechText,
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
