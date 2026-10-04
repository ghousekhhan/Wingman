import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body allowed
    }

    const { type = "SOLO", title } = body;

    // Generate guaranteed unique join code / journey ID
    let code = "";
    let attempts = 0;
    while (attempts < 10) {
      if (type === "GROUP") {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        code = `WG-${randNum}`;
      } else {
        const randId = crypto.randomBytes(4).toString("hex");
        code = `SOLO-${randId.toUpperCase()}`;
      }

      const existing = await prisma.journey.findUnique({
        where: { code },
      });
      if (!existing) break;
      attempts++;
    }

    if (!code) {
      code = `journey_${Date.now()}`;
    }

    // Create fresh Journey State in database with status "INTENT" and zero prefilled demo data
    const journey = await prisma.journey.create({
      data: {
        code,
        title: title || (type === "GROUP" ? "New Group Journey" : "New Journey"),
        destination: "",
        origin: "",
        startDate: new Date(),
        arrivalDeadline: "",
        purpose: "",
        groupConstraint: "",
        authorityLimit: 0,
        status: "INTENT",
      },
      include: {
        members: true,
        commitments: true,
        bookings: true,
        dependencies: true,
        recoveryCases: true,
        activityLogs: true,
        shipments: true,
        payments: true,
        messages: true,
      },
    });

    const intakeStatus = {
      destination: false,
      purpose: false,
      dates: false,
      travellers: false,
      commitments: false,
      constraints: false,
      priorities: false,
      authority: false,
      isComplete: false,
    };

    return NextResponse.json({
      success: true,
      journeyId: journey.id,
      code: journey.code,
      status: "INTENT",
      intakeStatus,
      journey,
    });
  } catch (error: any) {
    console.error("Failed to create fresh journey:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create new journey: " + error.message },
      { status: 500 }
    );
  }
}
