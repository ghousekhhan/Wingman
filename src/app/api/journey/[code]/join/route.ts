import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const body = await req.json();
    const {
      name,
      role = "Family member",
      email,
      constraints = [], // array of strings
      individualAuthority = 5000,
      preferences = [],
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Traveller name is required." },
        { status: 400 }
      );
    }

    const journey = await prisma.journey.findUnique({
      where: { code },
    });

    if (!journey) {
      return NextResponse.json(
        { success: false, error: `Journey Room ${code} not found.` },
        { status: 404 }
      );
    }

    // Upsert user
    const userEmail = email || `${name.toLowerCase().replace(/\s+/g, "")}-${Date.now()}@wingman.demo`;
    const user = await prisma.user.create({
      data: {
        name,
        role,
        email: userEmail,
      },
    });

    // Create Journey Member
    const member = await prisma.journeyMember.create({
      data: {
        journeyId: journey.id,
        userId: user.id,
        role,
        isLead: false,
        individualAuthority: Number(individualAuthority) || 5000,
        constraints: {
          create: constraints.map((c: string) => ({
            type: c.toUpperCase().replace(/\s+/g, "_"),
            title: c,
            description: `Configured during onboarding: ${c}`,
            isHard: true,
          })),
        },
        preferences: {
          create: preferences.map((p: string) => ({
            category: "PREFERENCE",
            value: p,
          })),
        },
      },
      include: {
        user: true,
        constraints: true,
        preferences: true,
      },
    });

    // Add agent activity log
    await prisma.agentActivityLog.create({
      data: {
        journeyId: journey.id,
        stage: "UNDERSTAND",
        timeDisplay: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        title: "NEW TRAVELLER ONBOARDED",
        description: `${name} (${role}) joined. ${constraints.length} non-negotiable constraints registered into Journey State.`,
      },
    });

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to join journey: " + error.message },
      { status: 500 }
    );
  }
}
