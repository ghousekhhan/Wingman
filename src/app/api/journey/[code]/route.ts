import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    const journey = await prisma.journey.findUnique({
      where: { code },
      include: {
        members: {
          include: {
            user: true,
            constraints: true,
            preferences: true,
          },
        },
        commitments: true,
        bookings: {
          orderBy: { createdAt: "asc" },
        },
        dependencies: {
          include: {
            fromBooking: true,
            toBooking: true,
          },
          orderBy: { order: "asc" },
        },
        recoveryCases: {
          include: {
            options: true,
            decisions: true,
            actions: {
              include: {
                verificationResults: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
        },
        shipments: true,
        payments: {
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!journey) {
      return NextResponse.json(
        { success: false, error: `Journey Room ${code} not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, journey });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch journey room: " + error.message },
      { status: 500 }
    );
  }
}
