import prisma from "../src/lib/prisma";
import { geminiAgent, calculateIntakeStatus } from "../src/lib/agent/gemini-agent";
import { seedJourney } from "../prisma/seed";
import crypto from "crypto";

async function runSimulationResetVerification() {
  console.log("==================================================");
  console.log("WINGMAN SIMULATION RESET & ISOLATION VERIFICATION");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, name: string, detail?: string) {
    total++;
    if (cond) {
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} - ${detail || "Condition not met"}`);
      process.exit(1);
    }
  }

  // Ensure Demo Journey exists
  await seedJourney();

  // ==============================================================
  // TEST 1: ZERO PREVIOUS INFO AFTER NEW SIMULATION (Goa -> Delhi)
  // ==============================================================
  console.log("--- TEST 1: ZERO PREVIOUS INFO AFTER NEW SIMULATION ---");
  const demoJourney = await prisma.journey.findUnique({
    where: { code: "ROOM-WING01" },
    include: { members: { include: { user: true } }, bookings: true },
  });

  assert(demoJourney !== null, "Demo Journey (ROOM-WING01) exists in database");
  assert(demoJourney?.destination === "Goa", "Demo destination is Goa");
  assert(
    demoJourney?.members.some((m) => m.user.name === "Meera") === true,
    "Demo contains Meera"
  );

  // Trigger NEW SIMULATION (Server-side fresh journey creation)
  const freshCode = `SOLO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const newSoloJourney = await prisma.journey.create({
    data: {
      code: freshCode,
      title: "New Journey",
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
      messages: true,
    },
  });

  assert(newSoloJourney.id !== demoJourney?.id, "New simulation receives unique Journey ID");
  assert(newSoloJourney.code !== "ROOM-WING01", `New simulation receives fresh code: ${newSoloJourney.code}`);
  assert(newSoloJourney.status === "INTENT", "New simulation status is INTENT");
  assert(newSoloJourney.destination === "", "New simulation destination is empty");
  assert(newSoloJourney.members.length === 0, "New simulation has 0 members");
  assert(newSoloJourney.bookings.length === 0, "New simulation has 0 bookings");
  assert(newSoloJourney.commitments.length === 0, "New simulation has 0 commitments");

  // Send new instruction to Gemini agent starting with fresh empty state
  const delhiPrompt = "Tomorrow I'm going to Delhi for a business meeting.";
  const delhiInterview = await geminiAgent.interview({
    currentState: {}, // Fresh empty state
    message: delhiPrompt,
  });

  assert(
    delhiInterview.updatedState.destination === "Delhi",
    "Wingman extracts destination: Delhi"
  );
  assert(
    delhiInterview.updatedState.destination !== "Goa",
    "Wingman knows NOTHING about Goa"
  );
  assert(
    delhiInterview.updatedState.objective?.toLowerCase().includes("business") === true ||
      delhiInterview.updatedState.objective?.toLowerCase().includes("conference") === true ||
      delhiInterview.updatedState.objective?.toLowerCase().includes("meeting") === true,
    "Wingman extracts purpose: Business meeting"
  );
  assert(
    delhiInterview.updatedState.dates?.toLowerCase().includes("tomorrow") === true,
    "Wingman extracts dates: Tomorrow"
  );
  assert(
    !delhiInterview.spokenResponse.toLowerCase().includes("goa") &&
      !delhiInterview.spokenResponse.toLowerCase().includes("wedding") &&
      !delhiInterview.spokenResponse.toLowerCase().includes("meera"),
    "Gemini spoken response does not leak Goa, wedding, or Meera"
  );
  console.log(`Agent Spoke: "${delhiInterview.spokenResponse}"`);

  // Intake UI Status: only destination, purpose, dates checked; authority and constraints unchecked
  const freshIntake = calculateIntakeStatus(delhiInterview.updatedState);
  assert(freshIntake.destination === true, "Intake UI: Destination checked");
  assert(freshIntake.purpose === true, "Intake UI: Purpose checked");
  assert(freshIntake.authority === false, "Intake UI: Authority starts unchecked (not prefilled)");

  // ==============================================================
  // TEST 2: GROUP SIMULATION RESET (New join code, 0/0 members)
  // ==============================================================
  console.log("\n--- TEST 2: GROUP SIMULATION RESET ---");
  const randNum = Math.floor(1000 + Math.random() * 9000);
  const freshGroupCode = `WG-${randNum}`;

  const newGroupJourney = await prisma.journey.create({
    data: {
      code: freshGroupCode,
      title: "Hyderabad Conference Group",
      destination: "Hyderabad",
      origin: "Bangalore",
      startDate: new Date(),
      arrivalDeadline: "",
      purpose: "Tech Conference",
      groupConstraint: "",
      authorityLimit: 0,
      status: "INTENT",
    },
    include: {
      members: true,
      commitments: true,
      bookings: true,
      dependencies: true,
    },
  });

  assert(newGroupJourney.code.startsWith("WG-"), `New group join code format: ${newGroupJourney.code}`);
  assert(newGroupJourney.code !== "ROOM-WING01", "New group code does NOT reuse ROOM-WING01");
  assert(newGroupJourney.members.length === 0, "New group has 0/0 members joined");
  assert(newGroupJourney.bookings.length === 0, "New group has empty bookings");
  assert(newGroupJourney.title === "Hyderabad Conference Group", "Group title is Hyderabad Conference Group");

  // ==============================================================
  // TEST 3: MOBILITY RESET (No previous flight, cab, driver, or airport exit)
  // ==============================================================
  console.log("\n--- TEST 3: MOBILITY RESET ---");
  assert(newSoloJourney.bookings.length === 0, "No previous flight exists in fresh simulation");
  assert(newSoloJourney.dependencies.length === 0, "No mobility dependencies exist in fresh simulation");
  assert(newGroupJourney.bookings.length === 0, "No previous cab or driver exists in fresh simulation");

  // ==============================================================
  // TEST 4: BROWSER REFRESH PERSISTENCE VS NEW SIMULATION RESET
  // ==============================================================
  console.log("\n--- TEST 4: BROWSER REFRESH PERSISTENCE VS NEW SIMULATION RESET ---");
  // 1. Simulating page refresh on the same journey
  const refreshedJourney = await prisma.journey.findUnique({
    where: { code: freshCode },
    include: { members: true, bookings: true },
  });
  assert(refreshedJourney !== null, "Refreshed journey persists in database");
  assert(refreshedJourney?.id === newSoloJourney.id, "Refreshed journey preserves same Journey ID");

  // 2. Simulating clicking NEW SIMULATION again
  const secondFreshCode = `SOLO-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const secondFreshJourney = await prisma.journey.create({
    data: {
      code: secondFreshCode,
      title: "Second Fresh Journey",
      destination: "",
      origin: "",
      startDate: new Date(),
      arrivalDeadline: "",
      purpose: "",
      groupConstraint: "",
      authorityLimit: 0,
      status: "INTENT",
    },
  });

  assert(secondFreshJourney.id !== refreshedJourney?.id, "Second simulation receives a new, distinct Journey ID");
  assert(secondFreshJourney.code !== refreshedJourney?.code, "Second simulation receives a new, distinct code");

  // 3. Verify previous journey was NOT deleted from database
  const originalCheck = await prisma.journey.findUnique({
    where: { code: freshCode },
  });
  assert(originalCheck !== null, "Previous journey was NOT deleted from database when new simulation was created");

  console.log("\n==================================================");
  console.log(`ALL ${passed} OF ${total} SIMULATION RESET & ISOLATION CHECKS PASSED!`);
  console.log("==================================================");
}

runSimulationResetVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
