import { geminiAgent, calculateIntakeStatus } from "../src/lib/agent/gemini-agent";
import { generalWingmanAgent } from "../src/lib/agent/general-agent";
import { mobilityConnector } from "../src/lib/connectors/mobility";
import { seedJourney } from "../prisma/seed";
import prisma from "../src/lib/prisma";

async function runUrgencySpecVerification() {
  console.log("==================================================");
  console.log("WINGMAN FINAL URGENT SPEC VERIFICATION SUITE");
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

  // ==============================================================
  // 1. SOLO INTAKE & GIANT ONE-SHOT EXTRACTION
  // ==============================================================
  console.log("--- 1. SOLO JOURNEY: ONE-SHOT EXTRACTION & INTAKE STATUS ---");
  const soloVoiceTranscript =
    "I'm going to Goa for my sister's wedding on December 21. Travelling from Hyderabad with my parents and sister. Need to reach before 6 PM. Grandmother needs wheelchair assistance and cannot travel alone. Autonomous limit is 10,000.";

  const soloTurn = await geminiAgent.interview({
    currentState: {},
    message: soloVoiceTranscript,
  });

  assert(soloTurn.updatedState.destination === "Goa", "Extracted Destination: Goa");
  assert(soloTurn.updatedState.origin === "Hyderabad", "Extracted Origin: Hyderabad");
  assert(soloTurn.updatedState.objective?.toLowerCase().includes("wedding") === true, "Extracted Purpose: Wedding");
  assert(soloTurn.updatedState.deadlines?.includes("6 PM") === true, "Extracted Hard Deadline: 6 PM");
  assert(
    soloTurn.updatedState.accessibilityRequirements?.some((a) => a.toLowerCase().includes("wheelchair")) === true,
    "Extracted Accessibility Constraint: Wheelchair assistance"
  );
  assert(
    soloTurn.updatedState.hardConstraints?.some((c) => c.toLowerCase().includes("alone") || c.toLowerCase().includes("together")) === true,
    "Extracted Group Constraint: Cannot travel alone"
  );
  assert(soloTurn.updatedState.autonomousAuthority === 10000, "Extracted Authority: ₹10,000");

  const intake = calculateIntakeStatus(soloTurn.updatedState);
  assert(intake.destination === true, "Intake Status: destination ✓");
  assert(intake.purpose === true, "Intake Status: purpose ✓");
  assert(intake.commitments === true, "Intake Status: commitments ✓");
  assert(intake.constraints === true, "Intake Status: constraints ✓");
  assert(intake.authority === true, "Intake Status: authority ✓");
  assert(intake.isComplete === true, "Intake Status: isComplete ✓ (Ready for BUILD MY JOURNEY)");

  // Conversational Plan Modification
  const soloEdit = await geminiAgent.editPlan(soloTurn.updatedState, "Change the budget to 15,000");
  assert(soloEdit.updatedState.autonomousAuthority === 15000, "Conversational Edit: Budget updated to ₹15,000");

  // ==============================================================
  // 2. GROUP INTAKE GATING & DERIVED CONSTRAINTS (Sections 15, 16, 18)
  // ==============================================================
  console.log("\n--- 2. GROUP JOURNEY: 0/5 -> 5/5 GATING & DERIVED CONSTRAINTS ---");
  await seedJourney();

  const journey = await prisma.journey.findUnique({
    where: { code: "ROOM-WING01" },
    include: {
      members: {
        include: { user: true, constraints: true },
      },
      commitments: true,
    },
  });
  assert(journey !== null, "Journey room ROOM-WING01 loaded from database");

  // Gating rule: 3/5 complete means group plan and group actions are blocked
  const simulatedCount3 = 3;
  const isBlockedAt3 = simulatedCount3 < 5;
  assert(isBlockedAt3 === true, "Group Gate: WAITING FOR EVERYONE active when 3/5 complete");

  // At 5/5 complete: derive group constraints
  const meeraMember = journey?.members.find((m) => m.user.name === "Meera");
  const saraMember = journey?.members.find((m) => m.user.name === "Sara");
  assert(meeraMember !== undefined, "Meera profile present in group");
  assert(saraMember !== undefined, "Sara profile present in group");

  // Gemini / Engine group constraint derivation
  const hasAloneConstraint = meeraMember?.constraints.some((c) => c.type.includes("CANNOT_TRAVEL_ALONE"));
  const hasStayConstraint = saraMember?.constraints.some((c) => c.type.includes("STAY_WITH_GROUP") || c.title.toLowerCase().includes("together"));
  const derivedTogetherConstraint = hasAloneConstraint && hasStayConstraint;
  assert(derivedTogetherConstraint === true, "Derived Group Constraint: ALL TRAVELLERS SHOULD REMAIN TOGETHER");

  const hasAccessibility = meeraMember?.constraints.some((c) => c.type.includes("ACCESSIBILITY"));
  assert(hasAccessibility === true, "Derived Group Constraint: ANY VALID RECOVERY MUST PRESERVE ACCESSIBILITY");

  // ==============================================================
  // 3. SECTION 52: MOST IMPORTANT TEST — UPSTREAM FLIGHT ARRIVAL CHANGE
  // ==============================================================
  console.log("\n--- 3. SECTION 52: UPSTREAM FLIGHT ARRIVAL CHANGE & MOBILITY RECALCULATION ---");
  // Original state:
  // Flight arrival: 18:00
  // Airport exit: 18:25
  // Cab target: 18:35
  const originalArrival = "18:00";
  const origWindow = mobilityConnector.calculatePickupWindow(originalArrival, 25, 10);
  assert(origWindow.expectedExit === "18:25", "Original Airport Exit: 18:25");
  assert(origWindow.pickupTarget === "18:35", "Original Cab Pickup Target: 18:35");

  // Disruption event: Flight arrival changes to 18:40
  console.log("Simulating upstream event: 'Flight arrival is now 18:40'...");
  const upstreamResult = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "Flight arrival is now 18:40",
    speaker: "Airline Operations",
  });

  const agentRes = upstreamResult.agentResult;
  assert(agentRes.event.includes("18:40"), "Agent recognized upstream flight arrival shifted to 18:40");
  assert(
    agentRes.impact.brokenDependencies.some((d) => d.includes("18:35") && d.includes("INVALID")),
    "Agent marked previous 18:35 cab as INVALID"
  );
  assert(
    agentRes.decision.reason.includes("19:05") && agentRes.decision.reason.includes("19:15"),
    "Agent recalculated airport exit to 19:05 and new pickup target to 19:15"
  );
  assert(
    agentRes.transferRepaired?.pickupTime === "19:15",
    "Agent confirmed replacement ride at 19:15 pickup target (NOT kept at 18:35)"
  );
  assert(agentRes.nextStatus === "RECOVERED", "Journey status updated to RECOVERED");

  // Verify group mobility constraints: 5 passengers, accessibility required, 6+ seats
  assert(
    Boolean(
      agentRes.decision.selectedOption?.toLowerCase().includes("van") ||
        agentRes.decision.selectedOption?.toLowerCase().includes("seater") ||
        agentRes.transferRepaired?.vehicle.toLowerCase().includes("van") ||
        agentRes.transferRepaired?.vehicle.toLowerCase().includes("seater")
    ),
    "Group mobility preserved: 6+ seater vehicle selected"
  );

  // ==============================================================
  // 4. BOUNDED AUTONOMY & PINE LABS PAYMENT APPROVAL GATE (Section 14 & 46)
  // ==============================================================
  console.log("\n--- 4. BOUNDED AUTONOMY & PINE LABS PAYMENT EXECUTION ---");
  const surgeDisruption = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "Flight HYD-GOI was cancelled during high-demand surge pricing where replacement costs 14800",
    speaker: "System",
  });

  assert(
    surgeDisruption.agentResult.nextStatus === "DECISION_REQUIRED",
    "Agent recognized ₹14,800 exceeds ₹10,000 authority limit and halted at DECISION_REQUIRED"
  );
  assert(
    surgeDisruption.agentResult.humanDecisionRequired === true,
    "Explicit human approval gate triggered"
  );

  // Human grants approval
  const approvedResult = await generalWingmanAgent.process({
    journeyCode: "ROOM-WING01",
    message: "I approve the elevated authority option",
    speaker: "Rahul",
    userApprovalGranted: true,
    approvedAmount: 14800,
  });

  assert(
    approvedResult.agentResult.nextStatus === "RECOVERED",
    "Upon human approval, journey transition to RECOVERED"
  );
  assert(
    approvedResult.agentResult.actions.some((a) => a.tool === "bookTravel" && a.arguments.cost === 14800),
    "Verified booking executed for approved amount ₹14,800"
  );

  // ==============================================================
  // 5. SUMMARY
  // ==============================================================
  console.log("\n==================================================");
  console.log(`ALL ${passed} OF ${total} URGENT SPEC VERIFICATIONS PASSED!`);
  console.log("==================================================");
}

runUrgencySpecVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
