import { CandidateTravelOption } from "@/lib/tools/registry";

export interface EvaluatedOption {
  option: CandidateTravelOption;
  isViable: boolean;
  satisfiesDeadline: boolean;
  satisfiesGroup: boolean;
  satisfiesAccessibility: boolean;
  withinAuthority: boolean;
  rejectionReasons: string[];
  score: number;
}

export interface DecisionEvaluationResult {
  actionType: "ACT" | "ASK_APPROVAL" | "SALVAGE" | "MONITOR" | "NO_ACTION";
  selectedOption?: CandidateTravelOption;
  evaluatedOptions: EvaluatedOption[];
  requiresHumanApproval: boolean;
  humanQuestion?: string;
  rationale: string;
  brokenDependencies: string[];
}

export class DecisionEngine {
  /**
   * Parse deadline string (e.g. "6:00 PM" or "18:00") into minutes from midnight
   */
  parseTimeToMinutes(timeStr: string): number {
    if (!timeStr) return 18 * 60; // default 18:00 (6:00 PM)

    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes("PM");
    const isAM = clean.includes("AM");
    const parts = clean.replace(/(AM|PM)/g, "").trim().split(":");
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  /**
   * Strictly evaluates candidates against journey invariants
   */
  evaluateOptions(params: {
    options: CandidateTravelOption[];
    deadlineMinutes: number; // e.g. 18 * 60 = 1080 (6:00 PM)
    passengerCount: number;
    requiresAccessibility: boolean;
    requiresGroupStay: boolean;
    authorityLimit: number;
    userApprovedAmount?: number;
  }): DecisionEvaluationResult {
    const {
      options,
      deadlineMinutes,
      passengerCount,
      requiresAccessibility,
      requiresGroupStay,
      authorityLimit,
      userApprovedAmount,
    } = params;

    const effectiveAuthority = Math.max(authorityLimit, userApprovedAmount || 0);

    const evaluated: EvaluatedOption[] = options.map((opt) => {
      const satisfiesDeadline = opt.arrivalMinutes <= deadlineMinutes;
      const satisfiesGroup = !requiresGroupStay || opt.seatsAvailableTogether >= passengerCount;
      const satisfiesAccessibility = !requiresAccessibility || opt.accessibilityEquipped;
      const withinAuthority = opt.cost <= effectiveAuthority;

      const rejectionReasons: string[] = [];
      if (!satisfiesDeadline) {
        rejectionReasons.push(`Arrives at ${opt.arrivalTime}, missing hard deadline.`);
      }
      if (!satisfiesGroup) {
        rejectionReasons.push(`Only ${opt.seatsAvailableTogether} seats together; violates group continuity constraint.`);
      }
      if (!satisfiesAccessibility) {
        rejectionReasons.push(`Lacks required wheelchair/accessibility equipment.`);
      }
      if (!withinAuthority) {
        rejectionReasons.push(`Cost ₹${opt.cost.toLocaleString("en-IN")} exceeds autonomous authority limit of ₹${effectiveAuthority.toLocaleString("en-IN")}.`);
      }

      const isViable = satisfiesDeadline && satisfiesGroup && satisfiesAccessibility && withinAuthority;

      // Score options prioritizing journey outcome, timing buffer, and cost
      let score = 0;
      if (satisfiesDeadline) score += 1000;
      if (satisfiesGroup) score += 500;
      if (satisfiesAccessibility) score += 500;
      if (withinAuthority) score += 300;
      // Earlier arrival before deadline gets higher buffer score
      score += Math.max(0, deadlineMinutes - opt.arrivalMinutes);
      // Cost penalty (small factor)
      score -= Math.floor(opt.cost / 100);

      return {
        option: opt,
        isViable,
        satisfiesDeadline,
        satisfiesGroup,
        satisfiesAccessibility,
        withinAuthority,
        rejectionReasons,
        score,
      };
    });

    // Sort by score descending
    evaluated.sort((a, b) => b.score - a.score);

    // 1. Check if an option is viable within authority
    const viableOptions = evaluated.filter((e) => e.isViable);
    if (viableOptions.length > 0) {
      const best = viableOptions[0];
      return {
        actionType: "ACT",
        selectedOption: best.option,
        evaluatedOptions: evaluated,
        requiresHumanApproval: false,
        rationale: `Selected ${best.option.provider} (${best.option.referenceCode}) at ₹${best.option.cost.toLocaleString("en-IN")} arriving at ${best.option.arrivalTime}. It protects the deadline, keeps all ${passengerCount} travellers together, preserves accessibility, and is authorized within ₹${effectiveAuthority.toLocaleString("en-IN")}.`,
        brokenDependencies: ["Airport Transfer"],
      };
    }

    // 2. Check if there are options that satisfy constraints BUT exceed autonomous authority
    const constraintSatisfiedOptions = evaluated.filter(
      (e) => e.satisfiesDeadline && e.satisfiesGroup && e.satisfiesAccessibility
    );

    if (constraintSatisfiedOptions.length > 0) {
      const bestHighCost = constraintSatisfiedOptions[0];
      return {
        actionType: "ASK_APPROVAL",
        selectedOption: bestHighCost.option,
        evaluatedOptions: evaluated,
        requiresHumanApproval: true,
        humanQuestion: `The only option that protects your arrival deadline costs ₹${bestHighCost.option.cost.toLocaleString("en-IN")}, exceeding your ₹${authorityLimit.toLocaleString("en-IN")} autonomous limit.`,
        rationale: `Autonomous spending limit is ₹${authorityLimit.toLocaleString("en-IN")}. The only option preserving the arrival deadline costs ₹${bestHighCost.option.cost.toLocaleString("en-IN")}. Stopping for human decision.`,
        brokenDependencies: ["Airport Transfer"],
      };
    }

    // 3. Salvage mode if no candidates protect the deadline
    return {
      actionType: "SALVAGE",
      evaluatedOptions: evaluated,
      requiresHumanApproval: true,
      humanQuestion: "No available options can satisfy the original arrival deadline. Would you like Wingman to activate Salvage Mode and arrange the earliest alternative?",
      rationale: "All available transport options miss the required deadline. Entering Salvage Mode to protect safety and arrange next best outcome.",
      brokenDependencies: ["Airport Transfer", "Hotel Check-in"],
    };
  }
}

export const decisionEngine = new DecisionEngine();
