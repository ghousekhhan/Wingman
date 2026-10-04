import prisma from "../src/lib/prisma";

export async function seedJourney() {
  console.log("Seeding WINGMAN Goa Wedding Journey (ROOM-WING01)...");

  // Clean existing demo data safely
  await prisma.journey.deleteMany({
    where: { code: "ROOM-WING01" },
  });

  // 1. Create Travellers
  const rahul = await prisma.user.upsert({
    where: { email: "rahul@demo.wingman.ai" },
    update: {},
    create: {
      name: "Rahul",
      role: "Lead Traveller",
      email: "rahul@demo.wingman.ai",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const meera = await prisma.user.upsert({
    where: { email: "meera@demo.wingman.ai" },
    update: {},
    create: {
      name: "Meera",
      role: "Grandmother",
      email: "meera@demo.wingman.ai",
      avatarUrl: "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=150&auto=format&fit=crop&q=80",
    },
  });

  const arjun = await prisma.user.upsert({
    where: { email: "arjun@demo.wingman.ai" },
    update: {},
    create: {
      name: "Arjun",
      role: "Family member",
      email: "arjun@demo.wingman.ai",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  const sara = await prisma.user.upsert({
    where: { email: "sara@demo.wingman.ai" },
    update: {},
    create: {
      name: "Sara",
      role: "Family member",
      email: "sara@demo.wingman.ai",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    },
  });

  const kabir = await prisma.user.upsert({
    where: { email: "kabir@demo.wingman.ai" },
    update: {},
    create: {
      name: "Kabir",
      role: "Family member",
      email: "kabir@demo.wingman.ai",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Create Journey
  const journey = await prisma.journey.create({
    data: {
      code: "ROOM-WING01",
      title: "Goa Wedding",
      destination: "Goa",
      origin: "Hyderabad",
      startDate: new Date("2026-12-21T07:00:00Z"),
      arrivalDeadline: "6:00 PM",
      status: "MONITORING",
      purpose: "Sister's Wedding",
      groupConstraint: "Everyone stays together",
      authorityLimit: 10000,
    },
  });

  // 3. Journey Members & Constraints
  // Rahul (Lead)
  const rahulMember = await prisma.journeyMember.create({
    data: {
      journeyId: journey.id,
      userId: rahul.id,
      role: "Lead Traveller",
      isLead: true,
      individualAuthority: 10000,
      constraints: {
        create: [
          {
            type: "ARRIVE_ON_TIME",
            title: "Arrive on time",
            description: "Must reach the venue before 6:00 PM without fail.",
            isHard: true,
          },
          {
            type: "STAY_WITH_GROUP",
            title: "Keep family together",
            description: "No traveller separated during journey.",
            isHard: true,
          },
        ],
      },
    },
  });

  // Meera (Grandmother)
  const meeraMember = await prisma.journeyMember.create({
    data: {
      journeyId: journey.id,
      userId: meera.id,
      role: "Grandmother",
      isLead: false,
      individualAuthority: 5000,
      constraints: {
        create: [
          {
            type: "CANNOT_TRAVEL_ALONE",
            title: "Cannot travel alone",
            description: "Must remain accompanied by group at all times.",
            isHard: true,
          },
          {
            type: "MUST_STAY_WITH_GROUP",
            title: "Must stay with group",
            description: "Cannot be placed on an alternative split itinerary.",
            isHard: true,
          },
          {
            type: "ACCESSIBILITY_REQUIRED",
            title: "Accessibility assistance required",
            description: "Wheelchair assistance and low-step transfer needed.",
            isHard: true,
          },
        ],
      },
      preferences: {
        create: [
          { category: "SEATING", value: "Aisle seat near front" },
          { category: "COMFORT", value: "Avoid long walking transfers" },
        ],
      },
    },
  });

  // Arjun
  await prisma.journeyMember.create({
    data: {
      journeyId: journey.id,
      userId: arjun.id,
      role: "Family member",
      isLead: false,
      individualAuthority: 3000,
      constraints: {
        create: [
          {
            type: "STAY_WITH_GROUP",
            title: "Stay with group",
            description: "Travel together with the family.",
            isHard: true,
          },
        ],
      },
    },
  });

  // Sara
  await prisma.journeyMember.create({
    data: {
      journeyId: journey.id,
      userId: sara.id,
      role: "Family member",
      isLead: false,
      individualAuthority: 3000,
      constraints: {
        create: [
          {
            type: "STAY_WITH_GROUP",
            title: "Stay with group",
            description: "Travel together with the family.",
            isHard: true,
          },
        ],
      },
    },
  });

  // Kabir
  await prisma.journeyMember.create({
    data: {
      journeyId: journey.id,
      userId: kabir.id,
      role: "Family member",
      isLead: false,
      individualAuthority: 3000,
      constraints: {
        create: [
          {
            type: "STAY_WITH_GROUP",
            title: "Stay with group",
            description: "Travel together with the family.",
            isHard: true,
          },
        ],
      },
    },
  });

  // 4. Commitments
  await prisma.commitment.create({
    data: {
      journeyId: journey.id,
      title: "Sister's Wedding",
      scheduledAt: new Date("2026-12-21T19:00:00Z"),
      deadlineTime: "6:00 PM",
      isProtected: true,
      status: "CONFIRMED",
      description: "Hard requirement: Everyone must reach the wedding venue before 6:00 PM.",
    },
  });

  // 5. Bookings
  const flightBooking = await prisma.booking.create({
    data: {
      journeyId: journey.id,
      type: "FLIGHT",
      referenceCode: "6E-542",
      provider: "IndiGo",
      title: "Flight HYD-GOI (Hyderabad → Goa)",
      detailsJson: JSON.stringify({
        origin: "HYD (Hyderabad)",
        destination: "GOI (Goa Dabolim)",
        departure: "1:15 PM",
        arrival: "2:40 PM",
        passengers: 5,
        seats: ["12A", "12B", "12C", "12D", "12E"],
        accessibilityAssistance: true,
      }),
      status: "CONFIRMED",
    },
  });

  const transferBooking = await prisma.booking.create({
    data: {
      journeyId: journey.id,
      type: "TRANSFER",
      referenceCode: "GOA-CAB-88",
      provider: "GoaMobility Pro",
      title: "Airport Transfer (GOI → Vivanta Panaji)",
      detailsJson: JSON.stringify({
        pickup: "Goa Dabolim Airport (GOI)",
        dropoff: "Vivanta Panaji, Goa",
        pickupTime: "3:00 PM",
        estimatedArrival: "3:45 PM",
        vehicle: "Accessible 6-Seater Van with Ramp",
        tiedToFlight: "6E-542",
      }),
      status: "CONFIRMED",
    },
  });

  const hotelBooking = await prisma.booking.create({
    data: {
      journeyId: journey.id,
      type: "HOTEL",
      referenceCode: "HTL-MAR-902",
      provider: "Vivanta Goa Panaji",
      title: "Hotel Stay (Vivanta Panaji)",
      detailsJson: JSON.stringify({
        checkIn: "21 Dec 2026, 4:00 PM",
        rooms: 3,
        guests: 5,
        specialRequest: "Ground floor accessible suite assigned for Meera",
      }),
      status: "CONFIRMED",
    },
  });

  // 6. Dependencies
  await prisma.journeyDependency.create({
    data: {
      journeyId: journey.id,
      fromBookingId: flightBooking.id,
      toBookingId: transferBooking.id,
      description: "Airport transfer pickup depends on Flight 6E-542 arrival at 2:40 PM",
      order: 1,
    },
  });

  await prisma.journeyDependency.create({
    data: {
      journeyId: journey.id,
      fromBookingId: transferBooking.id,
      toBookingId: hotelBooking.id,
      description: "Hotel check-in depends on Airport Transfer arrival at Vivanta Panaji",
      order: 2,
    },
  });

  // 7. Initial Delhivery Shipment
  await prisma.shipment.create({
    data: {
      journeyId: journey.id,
      trackingNumber: "DELH-9823471",
      title: "Wedding Outfits & Sherwanis",
      carrier: "Delhivery Express",
      origin: "Hyderabad Hub",
      destination: "Vivanta Panaji, Goa",
      status: "In Transit",
      expectedDelivery: "21 Dec 2026, 4:00 PM",
      riskLevel: "NORMAL",
      notes: "On track for delivery 2 hours prior to 6:00 PM deadline.",
    },
  });

  // 8. Initial Activity Logs
  await prisma.agentActivityLog.createMany({
    data: [
      {
        journeyId: journey.id,
        stage: "UNDERSTAND",
        timeDisplay: "13:00",
        title: "JOURNEY REGISTERED",
        description: "Wingman initialized for Rahul's family Goa Wedding journey. 5 travellers, wedding deadline 6:00 PM, spending authority ₹10,000.",
      },
      {
        journeyId: journey.id,
        stage: "COMMIT",
        timeDisplay: "13:05",
        title: "DEPENDENCIES MAPPED",
        description: "Mapped Flight HYD-GOI → Airport Transfer → Hotel → Wedding (Protected Commitment).",
      },
      {
        journeyId: journey.id,
        stage: "MONITOR",
        timeDisplay: "13:10",
        title: "AUTONOMOUS RADAR ACTIVE",
        description: "Continuous telemetry on Flight 6E-542, Goa weather, vehicle dispatch, and venue access.",
      },
    ],
  });

  console.log("Successfully seeded ROOM-WING01 with full demo story!");
}

if (process.argv[1]?.includes("seed.ts") || process.argv[1]?.includes("prisma")) {
  seedJourney()
    .catch((e) => {
      console.error("Seeding error:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
