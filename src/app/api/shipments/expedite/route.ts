import { NextRequest, NextResponse } from "next/server";
import { delhiveryConnector } from "@/lib/connectors/delhivery";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { journeyCode = "ROOM-WING01", trackingNumber = "DELH-9823471" } = body;

    const expediteResult = await delhiveryConnector.expediteShipment(trackingNumber);

    const journey = await prisma.journey.findUnique({
      where: { code: journeyCode },
    });

    if (journey) {
      await prisma.shipment.updateMany({
        where: { journeyId: journey.id, trackingNumber },
        data: {
          status: "EXPEDITED_RECOVERED",
          riskLevel: "RECOVERED",
          expectedDelivery: expediteResult.newEstimatedDelivery,
          notes: "Autonomously upgraded to Delhivery Air Flash Courier. Arrival guaranteed before 6:00 PM wedding ceremony.",
        },
      });

      await prisma.agentActivityLog.create({
        data: {
          journeyId: journey.id,
          stage: "RECOVER",
          timeDisplay: "14:25",
          title: "LOGISTICS RECOVERED",
          description: `Shipment ${trackingNumber} expedited via Delhivery Air Courier. New arrival: 4:15 PM. Wedding outfit commitment protected.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      expediteResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Expedite failed: " + error.message },
      { status: 500 }
    );
  }
}
