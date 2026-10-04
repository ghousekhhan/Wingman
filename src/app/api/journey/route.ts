import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const journeys = await prisma.journey.findMany({
      include: {
        members: {
          include: {
            user: true,
            constraints: true,
          },
        },
        commitments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, journeys });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch journeys: " + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      destination,
      origin = "Hyderabad",
      date,
      commitment,
      arrivalDeadline = "6:00 PM",
      authorityLimit = 10000,
      leadName = "Rahul",
      leadRole = "Lead Traveller",
      travellers = [],
      groupConstraint = "Everyone stays together",
    } = body;

    // Generate room code
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    const code = body.code || `ROOM-WING${randomSuffix}`;

    // Create lead user
    const leadUser = await prisma.user.create({
      data: {
        name: leadName,
        role: leadRole,
        email: `${leadName.toLowerCase()}-${Date.now()}@wingman.demo`,
      },
    });

    const journey = await prisma.journey.create({
      data: {
        code,
        title: `${destination} ${commitment || "Journey"}`,
        destination,
        origin,
        startDate: date ? new Date(date) : new Date("2026-12-21T07:00:00Z"),
        arrivalDeadline,
        purpose: commitment || "Sister's Wedding",
        groupConstraint,
        authorityLimit: Number(authorityLimit) || 10000,
        status: "MONITORING",
        members: {
          create: [
            {
              userId: leadUser.id,
              role: leadRole,
              isLead: true,
              individualAuthority: Number(authorityLimit) || 10000,
              constraints: {
                create: [
                  {
                    type: "ARRIVE_ON_TIME",
                    title: `Arrive before ${arrivalDeadline}`,
                    isHard: true,
                  },
                  {
                    type: "STAY_WITH_GROUP",
                    title: groupConstraint,
                    isHard: true,
                  },
                ],
              },
            },
          ],
        },
        commitments: {
          create: [
            {
              title: commitment || "Sister's Wedding",
              scheduledAt: date ? new Date(date) : new Date("2026-12-21T19:00:00Z"),
              deadlineTime: arrivalDeadline,
              isProtected: true,
              description: `Hard requirement: Everyone must reach the venue before ${arrivalDeadline}.`,
            },
          ],
        },
        bookings: {
          create: [
            {
              type: "FLIGHT",
              referenceCode: "6E-542",
              provider: "IndiGo",
              title: `Flight ${origin.substring(0, 3).toUpperCase()}-${destination.substring(0, 3).toUpperCase()}`,
              status: "CONFIRMED",
              detailsJson: JSON.stringify({
                origin,
                destination,
                departure: "1:15 PM",
                arrival: "2:40 PM",
                passengers: 1 + travellers.length,
              }),
            },
            {
              type: "TRANSFER",
              referenceCode: "GOA-CAB-88",
              provider: "GoaMobility Pro",
              title: "Airport Transfer (Airport → Venue)",
              status: "CONFIRMED",
              detailsJson: JSON.stringify({
                pickupTime: "3:00 PM",
                vehicle: "6-Seater Accessible Van",
              }),
            },
            {
              type: "HOTEL",
              referenceCode: "HTL-MAR-902",
              provider: "Grand Resort",
              title: "Hotel Stay",
              status: "CONFIRMED",
              detailsJson: JSON.stringify({
                checkIn: "4:00 PM",
              }),
            },
          ],
        },
        activityLogs: {
          create: [
            {
              stage: "UNDERSTAND",
              timeDisplay: "12:00",
              title: "JOURNEY CREATED",
              description: `Created journey to ${destination} with protected commitment "${commitment}". Autonomous limit set to ₹${authorityLimit}.`,
            },
            {
              stage: "MONITOR",
              timeDisplay: "12:01",
              title: "MONITORING ACTIVE",
              description: "Autonomous radar monitoring transport routes, commitments, and constraints.",
            },
          ],
        },
      },
      include: {
        members: {
          include: {
            user: true,
            constraints: true,
          },
        },
        commitments: true,
        bookings: true,
      },
    });

    return NextResponse.json({ success: true, journey });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to create journey: " + error.message },
      { status: 500 }
    );
  }
}
