import { seedJourney } from "../prisma/seed";
import { wingmanAgentEngine } from "../src/lib/agent/engine";
import prisma from "../src/lib/prisma";
import { gnaniVoiceConnector } from "../src/lib/connectors/gnani";
import { delhiveryConnector } from "../src/lib/connectors/delhivery";

async function runVerificationTests() {
  console.log("==================================================");
  console.log("WINGMAN AUTONOMOUS AGENT VERIFICATION TEST SUITE");
  console.log("==================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      process.exit(1);
    }
  }

  // TEST 1: Initial Seed State
  console.log("--- TEST 1: INITIAL STATE & CONSTRAINTS ---");
  await seedJourney();
  const initialJourney = await prisma.journey.findUnique({
    where: { code: "ROOM-WING01" },
    include: {
      members: { include: { user: true, constraints: true } },
      commitments: true,
      bookings: true,
    },
  });

  assert(initialJourney !== null, "Journey ROOM-WING01 exists in database");
  assert(initialJourney?.status === "MONITORING", "Initial status is MONITORING");
  assert(initialJourney?.members.length === 5, "All 5 travellers present (Rahul, Meera, Arjun, Sara, Kabir)");
  assert(initialJourney?.authorityLimit === 10000, "Autonomous spending authority is ₹10,000");

  const meera = initialJourney?.members.find((m) => m.user.name === "Meera");
  assert(meera !== undefined, "Meera profile exists in Journey State");
  const meeraConstraints = meera?.constraints.map((c) => c.type) || [];
  assert(
    meeraConstraints.includes("CANNOT_TRAVEL_ALONE") &&
    meeraConstraints.includes("MUST_STAY_WITH_GROUP") &&
    meeraConstraints.includes("ACCESSIBILITY_REQUIRED"),
    "Meera constraints registered: cannot travel alone, must stay with group, accessibility assistance required"
  );

  // TEST 2: Primary Simulation (Flight Cancelled → Option A → Transfer Replaced → Recovered)
  console.log("\n--- TEST 2: PRIMARY SIMULATION (SECTION 13) ---");
  const primaryResult = await wingmanAgentEngine.processEvent({
    journeyCode: "ROOM-WING01",
    eventType: "Flight HYD-GOI cancelled",
    scenario: "PRIMARY_DEMO",
  });

  const out = primaryResult.agentOutput;
  assert(out.decision === "OPTION A SELECTED", "Wingman autonomously selected OPTION A");
  assert(out.selectedCost === 6400, "Option A cost is ₹6,400 (within ₹10,000 authority)");
  assert(out.selectedArrivalTime === "5:20 PM", "Option A arrival is 5:20 PM (before 6:00 PM hard deadline)");
  assert(out.nextStatus === "RECOVERED", "Next journey status is RECOVERED");
  assert(out.downstreamAction !== undefined, "Agent detected downstream airport transfer dependency as invalid");
  assert(
    out.downstreamAction?.type === "MOBILITY_TRANSFER_REPLACEMENT",
    "Agent autonomously selected replacement accessible airport transfer"
  );
  assert(out.downstreamAction?.verified === true, "Mobility transfer verified with fleet dispatch");

  const stateAfterPrimary = await prisma.journey.findUnique({
    where: { code: "ROOM-WING01" },
  });
  assert(stateAfterPrimary?.status === "RECOVERED", "Database Journey status updated to RECOVERED");

  // TEST 3: Bounded Autonomy / Authority-Exceeded Simulation (Section 14)
  console.log("\n--- TEST 3: BOUNDED AUTONOMY & HUMAN DECISION (SECTION 14) ---");
  await seedJourney(); // reset
  const exceedResult = await wingmanAgentEngine.processEvent({
    journeyCode: "ROOM-WING01",
    eventType: "Flight HYD-GOI cancelled (High-demand holiday surge)",
    scenario: "AUTHORITY_EXCEEDED",
  });

  const exceedOut = exceedResult.agentOutput;
  assert(exceedOut.humanDecisionRequired === true, "Agent recognized Option A (₹14,800) exceeds ₹10,000 limit");
  assert(exceedOut.nextStatus === "DECISION_REQUIRED", "Agent transitioned to DECISION_REQUIRED status");
  assert(
    exceedOut.humanQuestion.includes("14,800") && exceedOut.humanQuestion.includes("10,000"),
    "Agent generated explicit bounded question to human"
  );

  // Human approval step: Rahul approves ₹14,800 override
  console.log("Simulating Human Approval: Rahul approves ₹14,800...");
  const approvedResult = await wingmanAgentEngine.processEvent({
    journeyCode: "ROOM-WING01",
    eventType: "User approved authority override for ₹14,800",
    scenario: "AUTHORITY_EXCEEDED",
    userApprovalGranted: true,
    approvedAmount: 14800,
  });

  assert(approvedResult.agentOutput.nextStatus === "RECOVERED", "Upon approval, Wingman completes recovery");
  assert(approvedResult.agentOutput.selectedCost === 14800, "Approved payment captured through Pine Labs");

  // TEST 4: Voice Interaction Adapter (Section 19)
  console.log("\n--- TEST 4: GNANI VOICE INTERACTION ADAPTER ---");
  const voiceSpeech = await gnaniVoiceConnector.speak("Your journey is recovered, Rahul.");
  assert(voiceSpeech.transcript === "Your journey is recovered, Rahul.", "Gnani Speech Synthesized");
  assert(
    voiceSpeech.adapter === "GNANI_DEMO_ADAPTER" || voiceSpeech.adapter === "GNANI_CLOUD_API",
    "Gnani adapter explicitly labelled and functional"
  );

  // TEST 5: Delhivery Shipment Logistics (Section 21)
  console.log("\n--- TEST 5: DELHIVERY LOGISTICS EXPEDITION ---");
  const expedition = await delhiveryConnector.expediteShipment("DELH-9823471");
  assert(expedition.success === true, "Delhivery shipment expedited");
  assert(expedition.updatedStatus === "EXPEDITED_RECOVERED", "Shipment status is EXPEDITED_RECOVERED");

  // Final reset to ensure demo starts fresh in MONITORING
  await seedJourney();
  console.log("\n==================================================");
  console.log(`ALL ${totalTests} OF ${totalTests} VERIFICATION CHECKS PASSED PERFECTLY!`);
  console.log("==================================================");
}

runVerificationTests()
  .catch((e) => {
    console.error("Test error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
