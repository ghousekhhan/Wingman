import { seedJourney } from "../prisma/seed";
import { generalWingmanAgent } from "../src/lib/agent/general-agent";
import prisma from "../src/lib/prisma";

async function runGeneralAgentTests() {
  console.log("==================================================");
  console.log("WINGMAN GENERAL AGENT DYNAMIC PROMPT TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail || "Assertion failed"}`);
      process.exit(1);
    }
  }

  // Seed clean state
  await seedJourney();

  // TEST 1: Flight cancelled
  console.log("\n--- TEST 1: Flight cancellation ---");
  const res1 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "My flight was cancelled.",
  });
  assert(res1.agentResult.nextStatus === "RECOVERED", "Flight cancellation triggers recovery");
  assert(res1.agentResult.decision.type === "ACT", "Agent takes autonomous action");
  assert(res1.agentResult.transferRepaired !== undefined, "Agent autonomously repairs downstream transfer dependency");

  // TEST 2: Train delayed by 3 hours
  console.log("\n--- TEST 2: Train delayed by 3 hours ---");
  const res2 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "My train is delayed by 3 hours.",
  });
  assert(res2.agentResult.event.toLowerCase().includes("train"), "Agent understands train disruption");
  assert(res2.agentResult.decision.type === "ACT", "Agent autonomously resolves train delay");

  // TEST 3: Grandmother cannot travel alone constraint
  console.log("\n--- TEST 3: Grandmother cannot travel alone ---");
  const res3 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "My grandmother cannot travel alone.",
  });
  assert(res3.agentResult.communication.toLowerCase().includes("alone") || res3.agentResult.communication.toLowerCase().includes("together"), "Agent locks accompanied group constraint");

  // TEST 4: Authority update: I can spend up to ₹5000
  console.log("\n--- TEST 4: Update authority to ₹5000 ---");
  const res4 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "I can spend up to ₹5000.",
  });
  const updatedJourney4 = await prisma.journey.findUnique({ where: { code: "ROOM-WING01" } });
  assert(updatedJourney4?.authorityLimit === 5000, "Spending limit updated to 5000 in database");
  assert(res4.agentResult.communication.includes("5,000"), "Agent confirms new 5000 authority limit");

  // Reset to 10000 limit for surge test
  await prisma.journey.update({ where: { code: "ROOM-WING01" }, data: { authorityLimit: 10000 } });

  // TEST 5: Authority exceeded scenario (costs ₹14800 > ₹10000)
  console.log("\n--- TEST 5: Disruption where replacement exceeds authority ---");
  const res5 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "Flight cancelled. High-demand holiday surge. Option A costs 14800.",
  });
  assert(res5.agentResult.humanDecisionRequired === true, "Agent recognizes cost exceeds authority");
  assert(res5.agentResult.nextStatus === "DECISION_REQUIRED", "Agent halts at DECISION_REQUIRED");
  assert(res5.agentResult.humanQuestion?.includes("14,800") === true, "Prompt specifies 14,800");

  // TEST 6: User approves the ₹14800 option
  console.log("\n--- TEST 6: User approval of elevated option ---");
  const res6 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "I approve the ₹14,800 option.",
    userApprovalGranted: true,
    approvedAmount: 14800,
  });
  assert(res6.agentResult.nextStatus === "RECOVERED", "Upon approval, journey is recovered");
  assert(res6.agentResult.decision.cost === 14800, "Approved ₹14,800 executed");

  // TEST 7: Hotel reservation lost / unavailable
  console.log("\n--- TEST 7: Hotel unavailable ---");
  const res7 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "My hotel is no longer available.",
  });
  assert(res7.agentResult.actions.some((a) => a.tool === "bookHotel"), "Agent calls bookHotel tool");
  assert(res7.agentResult.communication.toLowerCase().includes("hotel"), "Agent communicates hotel rebooking");

  // TEST 8: Cab was cancelled
  console.log("\n--- TEST 8: Cab was cancelled ---");
  const res8 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "My cab was cancelled.",
  });
  assert(res8.agentResult.actions.some((a) => a.tool === "bookTransfer"), "Agent calls bookTransfer tool");

  // TEST 9: Arrival deadline constraint
  console.log("\n--- TEST 9: Arrival deadline constraint ---");
  const res9 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "I need to arrive before 6 PM.",
  });
  assert(res9.agentResult.communication.toLowerCase().includes("6"), "Agent acknowledges 6 PM deadline");

  // TEST 10: Inquiry: Why did you choose this option?
  console.log("\n--- TEST 10: Decision explanation query ---");
  const res10 = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "Why did you choose this option?",
  });
  assert(res10.agentResult.communication.length > 20, "Agent provides transparent decision rationale");

  // Final reset to leave demo clean
  await seedJourney();

  console.log("\n==================================================");
  console.log(`ALL ${total} OF ${total} GENERAL AGENT DYNAMIC TESTS PASSED!`);
  console.log("==================================================");
}

runGeneralAgentTests()
  .catch((e) => {
    console.error("Test failure:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
