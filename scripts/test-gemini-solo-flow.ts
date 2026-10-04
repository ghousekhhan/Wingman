import { geminiAgent } from "../src/lib/agent/gemini-agent";

async function testGeminiSoloFlow() {
  console.log("==================================================");
  console.log("TESTING GEMINI AGENT CONVERSATIONAL INTERVIEW & LIVING PLAN");
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

  // 1. Incomplete first answer
  console.log("--- Turn 1: Incomplete input ('I am going to Goa') ---");
  const turn1 = await geminiAgent.interview({
    currentState: {},
    message: "I am going to Goa.",
  });
  assert(turn1.updatedState.destination === "Goa", "Extracted destination Goa");
  assert(!turn1.isReady, "Not marked ready with incomplete info");
  assert(turn1.spokenResponse.length < 120, "Spoken response is concise and natural");
  console.log(`Agent Spoke: "${turn1.spokenResponse}"`);

  // 2. Giant one-shot voice message
  console.log("\n--- Turn 2: Giant one-shot voice message ---");
  const giantPrompt =
    "I'm flying from Hyderabad to Goa on the 21st with my parents and sister. My sister's wedding starts at 7. My grandmother can't travel alone and needs wheelchair assistance. We all need to stay together. I'd rather spend less than 10,000 extra if something goes wrong. Need to reach before 6 PM.";
  const turn2 = await geminiAgent.interview({
    currentState: turn1.updatedState,
    message: giantPrompt,
  });

  assert(turn2.updatedState.origin === "Hyderabad", "Extracted origin Hyderabad");
  assert(turn2.updatedState.destination === "Goa", "Preserved destination Goa");
  assert(turn2.updatedState.objective?.toLowerCase().includes("wedding") === true, "Extracted wedding objective");
  assert(turn2.updatedState.deadlines?.includes("6 PM") === true, "Extracted 6 PM deadline");
  assert(turn2.updatedState.accessibilityRequirements?.some(a => a.toLowerCase().includes("wheelchair")) === true, "Extracted wheelchair requirement");
  assert(turn2.updatedState.hardConstraints?.some(c => c.toLowerCase().includes("together")) === true, "Extracted together constraint");
  assert(turn2.updatedState.autonomousAuthority === 10000, "Extracted ₹10,000 authority");
  assert(turn2.isReady === true, "Marked ready after capturing all essentials");
  assert(turn2.plan !== undefined && turn2.plan.length > 0, "Generated living journey plan");
  console.log(`Agent Spoke: "${turn2.spokenResponse}"`);

  // 3. Conversational Plan Editing
  console.log("\n--- Turn 3: Conversational edit ('Change the budget to 15,000') ---");
  const edit1 = await geminiAgent.editPlan(turn2.updatedState, "Change the budget to 15,000");
  assert(edit1.updatedState.autonomousAuthority === 15000, "Budget updated to 15000");
  assert(edit1.spokenResponse.length < 80, "Spoken response is short");
  console.log(`Agent Spoke: "${edit1.spokenResponse}"`);

  console.log("\n--- Turn 4: Conversational edit ('I would rather take a train') ---");
  const edit2 = await geminiAgent.editPlan(edit1.updatedState, "I would rather take a train");
  assert(edit2.updatedState.softPreferences?.some(p => p.toLowerCase().includes("rail")) === true, "Registered train preference");
  console.log(`Agent Spoke: "${edit2.spokenResponse}"`);

  console.log("\n==================================================");
  console.log(`ALL ${total} OF ${total} GEMINI AGENT TESTS PASSED!`);
  console.log("==================================================");
}

testGeminiSoloFlow().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
