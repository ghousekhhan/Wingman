import { NextResponse } from "next/server";
import { seedJourney } from "../../../../../prisma/seed";

export async function POST() {
  try {
    await seedJourney();
    return NextResponse.json({
      success: true,
      message: "Journey ROOM-WING01 reset to initial MONITORING state successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset demo state: " + error.message,
      },
      { status: 500 }
    );
  }
}
