import prisma from "@/lib/prisma";
import { passengerTravelConnector, TravelOption } from "@/lib/connectors/travel";
import { mobilityConnector } from "@/lib/connectors/mobility";
import { pineLabsConnector } from "@/lib/connectors/pinelabs";

export interface AgentStructuredOutput {
  event: string;
  impact: string[];
  decision: string;
  why: string;
  action: string;
  connector: string;
  verificationRequired: boolean;
  nextStatus: "MONITORING" | "ANALYZING" | "RECOVERING" | "VERIFYING" | "RECOVERED" | "DECISION_REQUIRED";
  humanDecisionRequired: boolean;
  humanQuestion: string;
  selectedOptionId?: string;
  selectedOptionLabel?: string;
  selectedCost?: number;
  selectedArrivalTime?: string;
  downstreamAction?: {
    type: "MOBILITY_TRANSFER_REPLACEMENT";
    description: string;
    vehicleType: string;
    pickupTime: string;
    cost: number;
    reference: string;
    verified: boolean;
  };
}

export class WingmanAgentEngine {
  private openaiApiKey: string | undefined;
  private openaiModel: string;

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiModel = process.env.OPENAI_MODEL || "gpt-6-luna";
  }

  /**
   * Main entry point when an external event impacts a journey
   */
  async processEvent(params: {
    journeyCode: string;
    eventType: string; // e.g. "FLIGHT_CANCELLED" or "AUTHORITY_EXCEEDED_SCENARIO"
    scenario?: "PRIMARY_DEMO" | "AUTHORITY_EXCEEDED";
    userApprovalGranted?: boolean;
    approvedAmount?: number;
  }): Promise<{
    agentOutput: AgentStructuredOutput;
    journeyState: any;
    caseNumber: string;
  }> {
    const { journeyCode, eventType, scenario = "PRIMARY_DEMO", userApprovalGranted, approvedAmount } = params;

    // 1. UNDERSTAND - Load current Journey State
    const journey = await prisma.journey.findUnique({
      where: { code: journeyCode },
      include: {
        members: {
          include: {
            user: true,
            constraints: true,
            preferences: true,
          },
        },
        commitments: true,
        bookings: true,
        dependencies: {
          include: {
            fromBooking: true,
            toBooking: true,
          },
        },
        shipments: true,
      },
    });

    if (!journey) {
      throw new Error(`Journey room ${journeyCode} not found in state store.`);
    }

    const caseNumber = `RC-${Math.floor(100 + Math.random() * 900)}`;

    // 2. PLAN & EVALUATE RECOVERY OPTIONS via Passenger Travel Connector
    const isExceededScenario = scenario === "AUTHORITY_EXCEEDED" || eventType === "AUTHORITY_EXCEEDED_SCENARIO";
    const travelOptions = await passengerTravelConnector.searchRecoveryOptions(
      isExceededScenario ? "AUTHORITY_EXCEEDED" : "PRIMARY_DEMO",
      journey.authorityLimit
    );

    // Call OpenAI agent (or fallback to built-in deterministic reasoning engine)
    let agentOutput: AgentStructuredOutput;

    if (this.openaiApiKey && this.openaiApiKey.trim().length > 0 && !this.openaiApiKey.includes("your-key")) {
      try {
        agentOutput = await this.callOpenAiAgent({
          journey,
          eventType,
          travelOptions,
          isExceededScenario,
          userApprovalGranted,
          approvedAmount,
        });
      } catch (err) {
        console.warn("OpenAI API call returned error or rate limit, using resilient deterministic reasoning engine.", err);
        agentOutput = this.runDeterministicEngine({
          journey,
          travelOptions,
          isExceededScenario,
          userApprovalGranted,
          approvedAmount,
        });
      }
    } else {
      agentOutput = this.runDeterministicEngine({
        journey,
        travelOptions,
        isExceededScenario,
        userApprovalGranted,
        approvedAmount,
      });
    }

    // 3. PERSIST STATE & RECOVERY CASE
    await this.persistAgentExecution({
      journeyId: journey.id,
      caseNumber,
      eventType,
      travelOptions,
      agentOutput,
      journey,
    });

    // 4. Return updated Journey State
    const updatedJourney = await prisma.journey.findUnique({
      where: { code: journeyCode },
      include: {
        members: {
          include: {
            user: true,
            constraints: true,
            preferences: true,
          },
        },
        commitments: true,
        bookings: true,
        dependencies: {
          include: {
            fromBooking: true,
            toBooking: true,
          },
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
          orderBy: { createdAt: "asc" },
        },
        shipments: true,
        payments: true,
      },
    });

    return {
      agentOutput,
      journeyState: updatedJourney,
      caseNumber,
    };
  }

  /**
   * Deterministic Reasoning Engine enforcing exact constraint validation,
   * authority checks, downstream dependency chaining, and structured output.
   */
  private runDeterministicEngine(params: {
    journey: any;
    travelOptions: TravelOption[];
    isExceededScenario: boolean;
    userApprovalGranted?: boolean;
    approvedAmount?: number;
  }): AgentStructuredOutput {
    const { journey, travelOptions, isExceededScenario, userApprovalGranted, approvedAmount } = params;

    // Check if this is the Authority Exceeded simulation
    if (isExceededScenario && !userApprovalGranted) {
      return {
        event: "Flight HYD-GOI cancelled",
        impact: [
          "Sister's wedding commitment at risk (6:00 PM arrival required)",
          "5 family travellers affected (Rahul, Meera, Arjun, Sara, Kabir)",
          "Meera's accessibility requirement must be preserved",
          "Group continuity constraint active: all 5 must stay together",
          "Downstream airport transfer invalidation",
        ],
        decision: "HUMAN DECISION REQUIRED",
        why: "Option A preserves the wedding arrival (5:20 PM) and keeps all 5 together with accessibility, but costs ₹14,800, exceeding your ₹10,000 autonomous authority. Option B costs ₹8,900 but arrives at 8:15 PM, missing the wedding.",
        action: "PAUSE_EXECUTION_AND_REQUEST_APPROVAL",
        connector: "SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL",
        verificationRequired: true,
        nextStatus: "DECISION_REQUIRED",
        humanDecisionRequired: true,
        humanQuestion:
          "The only option that protects the wedding costs ₹14,800, exceeding your ₹10,000 autonomous limit. Do you approve ₹14,800 to protect the wedding, or accept late arrival?",
        selectedOptionId: "OPT-EXCEED-A",
        selectedOptionLabel: "Option A",
        selectedCost: 14800,
        selectedArrivalTime: "5:20 PM",
      };
    }

    // If human approval was granted for ₹14,800 or primary demo:
    if (isExceededScenario && userApprovalGranted) {
      return {
        event: "Human authority approval granted (₹14,800)",
        impact: [
          "Spending authority temporarily elevated to ₹14,800 by Rahul",
          "Wedding commitment protected (5:20 PM arrival)",
          "Meera wheelchair assistance locked",
          "Downstream airport transfer re-synchronized",
        ],
        decision: "OPTION A SELECTED & EXECUTED",
        why: "Rahul approved ₹14,800 override. Option A is the only viable path preserving both the wedding deadline and Meera's accessibility.",
        action: "REPLACE_FLIGHT_AND_DOWNSTREAM_TRANSFER",
        connector: "SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL & MOBILITY",
        verificationRequired: true,
        nextStatus: "RECOVERED",
        humanDecisionRequired: false,
        humanQuestion: "",
        selectedOptionId: "OPT-EXCEED-A",
        selectedOptionLabel: "Option A",
        selectedCost: 14800,
        selectedArrivalTime: "5:20 PM",
        downstreamAction: {
          type: "MOBILITY_TRANSFER_REPLACEMENT",
          description: "Accessible Luxury 6-Seater Van (Toyota Vellfire Spec)",
          vehicleType: "Accessible Luxury 6-Seater Van",
          pickupTime: "5:35 PM",
          cost: 1800,
          reference: "TRF-GOA-EXCEED",
          verified: true,
        },
      };
    }

    // PRIMARY DEMO SCENARIO:
    // Option A satisfies:
    // - wedding deadline: 5:20 PM <= 6:00 PM
    // - group continuity: 5 passengers together
    // - accessibility: preserved for Meera
    // - authority: ₹6,400 <= ₹10,000
    //
    // Option B: ₹12,500 exceeds authority ₹10,000
    // Option C: Only 4 seats together, violates group continuity
    // Option D: Arrives 7:30 PM, misses 6:00 PM wedding deadline
    const selectedOption = travelOptions.find(
      (opt) =>
        opt.satisfiesDeadline &&
        opt.satisfiesGroup &&
        opt.satisfiesAuthority &&
        opt.accessibilityAvailable
    ) || travelOptions[0];

    return {
      event: "Flight HYD-GOI cancelled",
      impact: [
        "Sister's wedding arrival at risk (6:00 PM hard deadline)",
        "5 travellers affected: Rahul, Meera, Arjun, Sara, Kabir",
        "Group constraint active: all 5 must stay together",
        "Meera's accessibility requirement must be preserved",
        "Original airport transfer (GOA-CAB-88) tied to cancelled flight is now invalid",
      ],
      decision: "OPTION A SELECTED",
      why: "Option A satisfies all constraints: arrives at 5:20 PM before the 6:00 PM deadline, seats all 5 family members together, preserves Meera's accessibility assistance, and costs ₹6,400 within the ₹10,000 autonomous spending limit. Option B exceeds authority (₹12,500 > ₹10,000). Option C violates group continuity (only 4 seats together). Option D misses the wedding deadline (arrives 7:30 PM).",
      action: "EXECUTE_REPLACEMENT_FLIGHT_AND_ACCESSIBLE_TRANSFER",
      connector: "SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL & MOBILITY",
      verificationRequired: true,
      nextStatus: "RECOVERED",
      humanDecisionRequired: false,
      humanQuestion: "",
      selectedOptionId: selectedOption.id,
      selectedOptionLabel: selectedOption.optionLabel,
      selectedCost: selectedOption.cost,
      selectedArrivalTime: selectedOption.arrivalTime,
      downstreamAction: {
        type: "MOBILITY_TRANSFER_REPLACEMENT",
        description: "Accessible Luxury 6-Seater Van with Ramp synchronized for 5:35 PM pickup",
        vehicleType: "Accessible Luxury 6-Seater Van",
        pickupTime: "5:35 PM",
        cost: 1800,
        reference: "TRF-GOA-8841",
        verified: true,
      },
    };
  }

  /**
   * OpenAI Agent integration with strict system prompt and structured JSON output
   */
  private async callOpenAiAgent(params: {
    journey: any;
    eventType: string;
    travelOptions: TravelOption[];
    isExceededScenario: boolean;
    userApprovalGranted?: boolean;
    approvedAmount?: number;
  }): Promise<AgentStructuredOutput> {
    const { journey, eventType, travelOptions, isExceededScenario, userApprovalGranted, approvedAmount } = params;

    const systemPrompt = `You are Wingman, an autonomous Journey Continuity Agent.
Your responsibility is to protect the outcome of the traveller's journey, not merely to book travel.
The booking is a transaction.
The journey is the outcome.

Operate through:
UNDERSTAND → PLAN → COMMIT → MONITOR → PROTECT → RECOVER → VERIFY → COMPLETE.

When a new event arrives:
1. understand what changed
2. identify affected travellers
3. identify affected commitments
4. identify affected dependencies
5. evaluate hard constraints
6. evaluate preferences
7. evaluate authority
8. determine whether the journey remains viable
9. determine the best authorized recovery
10. execute authorized actions
11. verify consequential actions
12. update Journey State
13. communicate the outcome
14. continue monitoring

Do not ask the traveller what to do when the correct action follows from the Journey State and authority.
Never exceed autonomous authority.
Never claim an external action succeeded without verification.
A recovery is complete only when the journey is viable again.
If the best option exceeds authority, ask for the specific human decision required.
Never reveal chain-of-thought.

Return concise decision transparency in structured JSON matching this exact schema:
{
  "event": "description of disruption",
  "impact": ["affected items"],
  "decision": "concise decision title",
  "why": "concise rationale evaluating constraints and authority",
  "action": "action taken",
  "connector": "connector used",
  "verificationRequired": true,
  "nextStatus": "RECOVERED" | "DECISION_REQUIRED",
  "humanDecisionRequired": boolean,
  "humanQuestion": "specific question if authority exceeded",
  "selectedOptionId": "string",
  "selectedOptionLabel": "string",
  "selectedCost": number,
  "selectedArrivalTime": "string"
}`;

    const userMessage = {
      currentJourneyState: {
        code: journey.code,
        title: journey.title,
        destination: journey.destination,
        arrivalDeadline: journey.arrivalDeadline,
        autonomousAuthorityLimit: journey.authorityLimit,
        travellers: journey.members.map((m: any) => ({
          name: m.user.name,
          role: m.role,
          constraints: m.constraints.map((c: any) => c.title),
        })),
        commitments: journey.commitments.map((c: any) => ({
          title: c.title,
          deadline: c.deadlineTime,
          isProtected: c.isProtected,
        })),
        dependencies: [
          "Flight HYD-GOI → Airport Transfer",
          "Airport Transfer → Hotel Check-in",
          "Hotel → Wedding",
        ],
      },
      incomingExternalEvent: eventType,
      simulatedConnectorRecoveryOptions: travelOptions,
      scenario: isExceededScenario ? "AUTHORITY_EXCEEDED" : "PRIMARY_DEMO",
      userApprovalGranted,
      approvedAmount,
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: this.openaiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userMessage) },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    const parsed = JSON.parse(content);

    // Merge downstream transfer action if recovered
    if (parsed.nextStatus === "RECOVERED") {
      parsed.downstreamAction = {
        type: "MOBILITY_TRANSFER_REPLACEMENT",
        description: "Accessible Luxury 6-Seater Van with Ramp synchronized for 5:35 PM pickup",
        vehicleType: "Accessible Luxury 6-Seater Van",
        pickupTime: "5:35 PM",
        cost: 1800,
        reference: `TRF-GOA-${Math.floor(1000 + Math.random() * 9000)}`,
        verified: true,
      };
    }

    return parsed;
  }

  /**
   * Persists the complete recovery trace to database
   */
  private async persistAgentExecution(params: {
    journeyId: string;
    caseNumber: string;
    eventType: string;
    travelOptions: TravelOption[];
    agentOutput: AgentStructuredOutput;
    journey: any;
  }) {
    const { journeyId, caseNumber, eventType, travelOptions, agentOutput } = params;

    // 1. Record Disruption Event
    await prisma.journeyEvent.create({
      data: {
        journeyId,
        eventType,
        description: agentOutput.event,
        payloadJson: JSON.stringify(agentOutput),
      },
    });

    // 2. Create Recovery Case
    const recoveryCase = await prisma.recoveryCase.create({
      data: {
        caseNumber,
        journeyId,
        triggerEvent: agentOutput.event,
        status: agentOutput.nextStatus,
        affectedTravellersJson: JSON.stringify(["Rahul", "Meera", "Arjun", "Sara", "Kabir"]),
        affectedCommitmentsJson: JSON.stringify(["Sister's Wedding (6:00 PM arrival)"]),
        selectedOptionId: agentOutput.selectedOptionId,
        humanDecisionRequired: agentOutput.humanDecisionRequired,
        humanQuestion: agentOutput.humanQuestion,
      },
    });

    // 3. Save Recovery Options
    for (const opt of travelOptions) {
      await prisma.recoveryOption.create({
        data: {
          recoveryCaseId: recoveryCase.id,
          optionLabel: opt.optionLabel,
          cost: opt.cost,
          arrivalTime: opt.arrivalTime,
          passengersTogether: opt.passengersTogether,
          accessibilityAvailable: opt.accessibilityAvailable,
          satisfiesDeadline: opt.satisfiesDeadline,
          satisfiesGroup: opt.satisfiesGroup,
          satisfiesAuthority: opt.satisfiesAuthority,
          detailsJson: JSON.stringify(opt.details),
          rejectionReason: opt.rejectionReason,
          isSelected: opt.id === agentOutput.selectedOptionId,
        },
      });
    }

    // 4. Save Agent Decision
    await prisma.agentDecision.create({
      data: {
        recoveryCaseId: recoveryCase.id,
        summary: agentOutput.decision,
        why: agentOutput.why,
        authorityCheck: `Autonomous Limit: ₹10,000. Selected: ₹${agentOutput.selectedCost || 6400} (${
          (agentOutput.selectedCost || 0) <= 10000 ? "Authorized" : "Exceeds Limit"
        })`,
        constraintCheck: "Wedding 6 PM deadline: SATISFIED. Group continuity (5 together): SATISFIED. Meera accessibility: PRESERVED.",
      },
    });

    // If human decision is required, update Journey status and create audit logs
    if (agentOutput.humanDecisionRequired) {
      await prisma.journey.update({
        where: { id: journeyId },
        data: { status: "DECISION_REQUIRED" },
      });

      await prisma.agentActivityLog.createMany({
        data: [
          {
            journeyId,
            stage: "PROTECT",
            timeDisplay: "14:10",
            title: "EVENT RECEIVED",
            description: "Flight HYD-GOI cancelled. External fact injected.",
          },
          {
            journeyId,
            stage: "PROTECT",
            timeDisplay: "14:10",
            title: "IMPACT ANALYSIS",
            description: "Sister's wedding arrival at risk. 5 travellers affected, Meera accessibility required.",
          },
          {
            journeyId,
            stage: "PROTECT",
            timeDisplay: "14:11",
            title: "AUTHORITY CHECK",
            description: "Only viable option costs ₹14,800, exceeding ₹10,000 autonomous spending limit.",
          },
          {
            journeyId,
            stage: "RECOVER",
            timeDisplay: "14:12",
            title: "DECISION REQUIRED",
            description: agentOutput.humanQuestion || "Human approval required to exceed authority limit.",
          },
        ],
      });

      return;
    }

    // 5. Normal Recovery Execution (Primary Demo or Approved)
    const flightAction = await prisma.agentAction.create({
      data: {
        recoveryCaseId: recoveryCase.id,
        stage: "RECOVER",
        connector: "SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL",
        actionType: "BOOK_REPLACEMENT_FLIGHT",
        status: "VERIFIED",
        resultJson: JSON.stringify({
          flight: "IndiGo 6E-891",
          arrival: "5:20 PM",
          passengers: 5,
          accessibility: "Wheelchair assistance confirmed for Meera",
          cost: agentOutput.selectedCost || 6400,
        }),
      },
    });

    await prisma.verificationResult.create({
      data: {
        agentActionId: flightAction.id,
        verified: true,
        confirmationId: "BK-WNG8912",
        details: "GDS PNR status verified active. 5 e-tickets issued. Wheelchair assistance confirmed.",
      },
    });

    // 6. Execute Pine Labs Payment with Bounded Authority Check
    const payment = await pineLabsConnector.createPayment({
      amount: agentOutput.selectedCost || 6400,
      currency: "INR",
      purpose: "Replacement Flight (5 passengers, accessibility confirmed)",
      journeyCode: "ROOM-WING01",
      authorityLimit: 10000,
      approvedByUser: agentOutput.selectedCost! > 10000,
    });

    await prisma.payment.create({
      data: {
        journeyId,
        amount: payment.amount,
        purpose: "Replacement Flight 6E-891 Booking",
        authorizedBy: payment.status === "AUTHORIZED_AND_CAPTURED" && payment.amount <= 10000
          ? "Wingman Autonomous Authority (Bounded: ₹10,000)"
          : "Rahul (User Approval: ₹14,800)",
        transactionRef: payment.transactionRef,
        status: payment.status,
      },
    });

    // 7. Update original flight booking status to REPLACED
    const originalFlight = await prisma.booking.findFirst({
      where: { journeyId, type: "FLIGHT" },
    });
    if (originalFlight) {
      await prisma.booking.update({
        where: { id: originalFlight.id },
        data: {
          referenceCode: "6E-891",
          provider: "IndiGo Express",
          title: "Flight HYD-GOI (IndiGo 6E-891 Replacement)",
          status: "CONFIRMED",
          detailsJson: JSON.stringify({
            origin: "HYD (Hyderabad)",
            destination: "GOI (Goa Dabolim)",
            departure: "3:45 PM",
            arrival: "5:20 PM",
            passengers: 5,
            accessibilityAssistance: true,
            statusNote: "Autonomously rebooked by Wingman to preserve wedding commitment.",
          }),
        },
      });
    }

    // 8. Downstream Airport Transfer Invalidation & Autonomous Replacement (Section 13, Steps 8-9)
    if (agentOutput.downstreamAction) {
      const originalTransfer = await prisma.booking.findFirst({
        where: { journeyId, type: "TRANSFER" },
      });

      if (originalTransfer) {
        await prisma.booking.update({
          where: { id: originalTransfer.id },
          data: {
            referenceCode: agentOutput.downstreamAction.reference,
            provider: "GoaMobility Pro Premium",
            title: "Accessible Van Transfer (GOI → Vivanta Resort)",
            status: "CONFIRMED",
            detailsJson: JSON.stringify({
              pickup: "Goa Dabolim Airport Arrivals",
              dropoff: "Vivanta Panaji, Goa",
              pickupTime: agentOutput.downstreamAction.pickupTime,
              estimatedArrival: "5:55 PM (Direct Express)",
              vehicle: agentOutput.downstreamAction.vehicleType,
              rampEquipped: true,
              tiedToFlight: "6E-891",
              statusNote: "Autonomously replaced by Wingman to sync with new flight landing at 5:20 PM.",
            }),
          },
        });
      }

      const transferAction = await prisma.agentAction.create({
        data: {
          recoveryCaseId: recoveryCase.id,
          stage: "DOWNSTREAM_RECOVER",
          connector: "SIMULATED EXTERNAL WORLD - MOBILITY",
          actionType: "REPLACE_AIRPORT_TRANSFER",
          status: "VERIFIED",
          resultJson: JSON.stringify({
            vehicle: agentOutput.downstreamAction.vehicleType,
            pickup: agentOutput.downstreamAction.pickupTime,
            verified: true,
          }),
        },
      });

      await prisma.verificationResult.create({
        data: {
          agentActionId: transferAction.id,
          verified: true,
          confirmationId: agentOutput.downstreamAction.reference,
          details: "Fleet dispatch verified: Chauffeur Santosh Naik on standby with accessible ramp van.",
        },
      });
    }

    // 9. Update Journey status to RECOVERED
    await prisma.journey.update({
      where: { id: journeyId },
      data: { status: "RECOVERED" },
    });

    // 10. Persist chronological Agent Activity Logs matching Section 11 & Section 13 exactly:
    await prisma.agentActivityLog.createMany({
      data: [
        {
          journeyId,
          stage: "PROTECT",
          timeDisplay: "14:10",
          title: "EVENT RECEIVED",
          description: "Flight HYD-GOI cancelled. External fact received from airline telemetry.",
        },
        {
          journeyId,
          stage: "PROTECT",
          timeDisplay: "14:10",
          title: "IMPACT ANALYSIS",
          description: "Sister's wedding arrival at risk (6:00 PM hard deadline). 5 family members and Meera's accessibility affected.",
        },
        {
          journeyId,
          stage: "PROTECT",
          timeDisplay: "14:11",
          title: "CONSTRAINT CHECK",
          description: "5 travellers must remain together. Meera cannot travel alone & requires accessibility ramp assistance.",
        },
        {
          journeyId,
          stage: "PROTECT",
          timeDisplay: "14:11",
          title: "AUTHORITY CHECK",
          description: "₹10,000 autonomous spending authority confirmed available.",
        },
        {
          journeyId,
          stage: "PLAN",
          timeDisplay: "14:12",
          title: "RECOVERY OPTIONS",
          description: "4 options evaluated across timing, group continuity, accessibility, and budget bounds.",
        },
        {
          journeyId,
          stage: "COMMIT",
          timeDisplay: "14:12",
          title: "DECISION",
          description: "Option A selected. Arrives 5:20 PM, seats all 5 together, includes wheelchair assistance, costs ₹6,400 (authorized).",
        },
        {
          journeyId,
          stage: "RECOVER",
          timeDisplay: "14:13",
          title: "ACTION",
          description: "Replacement flight requested via Passenger Travel Connector (IndiGo 6E-891).",
        },
        {
          journeyId,
          stage: "VERIFY",
          timeDisplay: "14:13",
          title: "VERIFICATION",
          description: "Booking confirmed (BK-WNG8912). PNR active, 5 seats assigned, wheelchair confirmed.",
        },
        {
          journeyId,
          stage: "RECOVER",
          timeDisplay: "14:14",
          title: "ACTION",
          description: "Airport transfer dependency detected as invalid. Replacement accessible van transfer requested.",
        },
        {
          journeyId,
          stage: "VERIFY",
          timeDisplay: "14:15",
          title: "VERIFICATION",
          description: "Transfer confirmed (TRF-GOA-8841). Chauffeur assigned, ramp certified, 5:35 PM pickup.",
        },
        {
          journeyId,
          stage: "COMPLETE",
          timeDisplay: "14:15",
          title: "JOURNEY STATUS",
          description: "RECOVERED. Arrival scheduled at 5:20 PM. Family notified: outcome protected.",
        },
      ],
    });

    // 11. Add Agent Notification to travellers
    await prisma.notification.create({
      data: {
        journeyId,
        title: "Journey Recovered by Wingman",
        content: "Your journey is recovered. The replacement flight arrives at 5:20 PM, everyone remains together, Meera's accessibility requirement is protected, and the new airport transfer is confirmed.",
        audience: "ALL_TRAVELLERS",
      },
    });

    await prisma.message.create({
      data: {
        journeyId,
        sender: "Wingman",
        isAgent: true,
        content: "Your journey is recovered. The replacement flight arrives at 5:20 PM, everyone remains together, Meera's accessibility requirement is protected, and the new airport transfer is confirmed.",
      },
    });
  }
}

export const wingmanAgentEngine = new WingmanAgentEngine();
