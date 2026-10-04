import { NextRequest, NextResponse } from "next/server";
import { gnaniVoiceConnector } from "@/lib/connectors/gnani";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { journeyCode = "ROOM-WING01", audioTranscript, speaker = "Rahul" } = body;

    const journey = await prisma.journey.findUnique({
      where: { code: journeyCode },
      include: {
        commitments: true,
        recoveryCases: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!journey) {
      return NextResponse.json(
        { success: false, error: "Journey not found" },
        { status: 404 }
      );
    }

    // Determine query
    const userQuery = audioTranscript || "Wingman, what is our status? Can Meera and all of us still reach the wedding on time?";

    // Generate intelligent speech response based on journey status
    let responseText = "";
    if (journey.status === "RECOVERED") {
      responseText = "Your journey is fully recovered, Rahul. We rebooked IndiGo 6E-891 arriving in Goa at 5:20 PM. All 5 family members are seated together, Meera's wheelchair assistance is confirmed, and your accessible airport van is waiting at Dabolim.";
    } else if (journey.status === "DECISION_REQUIRED") {
      responseText = "Rahul, your attention is needed. Flight HYD-GOI was cancelled. The only flight that reaches before 6 PM costs ₹14,800, which exceeds your ₹10,000 autonomous limit. Please approve ₹14,800 to proceed.";
    } else {
      responseText = "All systems are green, Rahul. Your flight 6E-542 to Goa, accessible airport transfer, Vivanta hotel rooms, and the 6:00 PM wedding arrival deadline are actively monitored and on schedule.";
    }

    const voiceResult = await gnaniVoiceConnector.speak(responseText);

    // Save voice event
    await prisma.voiceEvent.create({
      data: {
        journeyId: journey.id,
        speaker,
        transcript: userQuery,
        actionJson: JSON.stringify(voiceResult),
        adapter: voiceResult.adapter,
      },
    });

    return NextResponse.json({
      success: true,
      query: userQuery,
      reply: responseText,
      voiceResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Voice processing failed: " + error.message },
      { status: 500 }
    );
  }
}
