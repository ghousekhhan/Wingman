/**
 * SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL CONNECTOR
 * 
 * Provides deterministic simulation of airline distribution and reservation APIs.
 * Connects to airline GDS / NDC endpoints in production.
 */

export interface TravelOption {
  id: string;
  optionLabel: string;
  airline: string;
  flightNumber: string;
  departure: string;
  departureTime: string;
  arrival: string;
  arrivalTime: string;
  cost: number;
  passengersTogether: number;
  totalPassengers: number;
  accessibilityAvailable: boolean;
  satisfiesDeadline: boolean;
  satisfiesGroup: boolean;
  satisfiesAuthority: boolean;
  rejectionReason?: string;
  details: {
    aircraft: string;
    cabin: string;
    stops: number;
    arrivalMinutesPastMidnight: number; // for exact deadline math
    wheelchairAssistanceConfirmed: boolean;
  };
}

export interface BookingResult {
  bookingReference: string;
  pnr: string;
  status: "CONFIRMED" | "FAILED" | "PENDING";
  flightNumber: string;
  airline: string;
  totalCost: number;
  seatAssignments: string[];
  passengers: string[];
  accessibilityNote: string;
  timestamp: string;
  connector: "SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL";
}

export interface BookingVerification {
  verified: boolean;
  pnr: string;
  status: "TICKETED_AND_ACTIVE";
  airlineTimestamp: string;
  auditTrailId: string;
  remarks: string;
}

export class PassengerTravelConnector {
  private connectorLabel = "SIMULATED EXTERNAL WORLD (Airline GDS / NDC)";

  /**
   * Search available recovery options for the disrupted journey
   * @param scenario "PRIMARY_DEMO" | "AUTHORITY_EXCEEDED"
   */
  async searchRecoveryOptions(
    scenario: "PRIMARY_DEMO" | "AUTHORITY_EXCEEDED" = "PRIMARY_DEMO",
    authorityLimit: number = 10000,
    deadlineMinutes: number = 18 * 60 // 6:00 PM = 1080 minutes
  ): Promise<TravelOption[]> {
    if (scenario === "AUTHORITY_EXCEEDED") {
      return [
        {
          id: "OPT-EXCEED-A",
          optionLabel: "Option A",
          airline: "Vistara Prime",
          flightNumber: "UK-872",
          departure: "HYD (Hyderabad)",
          departureTime: "3:40 PM",
          arrival: "GOI (Goa Dabolim)",
          arrivalTime: "5:20 PM",
          cost: 14800,
          passengersTogether: 5,
          totalPassengers: 5,
          accessibilityAvailable: true,
          satisfiesDeadline: true, // 5:20 PM <= 6:00 PM
          satisfiesGroup: true,
          satisfiesAuthority: 14800 <= authorityLimit, // FALSE (₹14,800 > ₹10,000)
          rejectionReason: "Exceeds autonomous spending authority (₹14,800 > ₹10,000)",
          details: {
            aircraft: "Airbus A321neo",
            cabin: "Economy Priority Bundle",
            stops: 0,
            arrivalMinutesPastMidnight: 17 * 60 + 20, // 17:20
            wheelchairAssistanceConfirmed: true,
          },
        },
        {
          id: "OPT-EXCEED-B",
          optionLabel: "Option B",
          airline: "Air India Express",
          flightNumber: "IX-412",
          departure: "HYD (Hyderabad)",
          departureTime: "6:30 PM",
          arrival: "GOI (Goa Dabolim)",
          arrivalTime: "8:15 PM",
          cost: 8900,
          passengersTogether: 5,
          totalPassengers: 5,
          accessibilityAvailable: true,
          satisfiesDeadline: false, // 8:15 PM > 6:00 PM (misses wedding deadline!)
          satisfiesGroup: true,
          satisfiesAuthority: true, // ₹8,900 <= ₹10,000
          rejectionReason: "Violates wedding arrival deadline (Arrives 8:15 PM > 6:00 PM deadline)",
          details: {
            aircraft: "Boeing 737 MAX",
            cabin: "Economy",
            stops: 0,
            arrivalMinutesPastMidnight: 20 * 60 + 15, // 20:15
            wheelchairAssistanceConfirmed: true,
          },
        },
      ];
    }

    // PRIMARY DEMO SCENARIO
    return [
      {
        id: "OPT-PRIMARY-A",
        optionLabel: "Option A",
        airline: "IndiGo Express",
        flightNumber: "6E-891",
        departure: "HYD (Hyderabad)",
        departureTime: "3:45 PM",
        arrival: "GOI (Goa Dabolim)",
        arrivalTime: "5:20 PM",
        cost: 6400,
        passengersTogether: 5,
        totalPassengers: 5,
        accessibilityAvailable: true,
        satisfiesDeadline: true, // 5:20 PM is before 6:00 PM deadline
        satisfiesGroup: true, // all 5 together
        satisfiesAuthority: true, // ₹6,400 <= ₹10,000
        details: {
          aircraft: "Airbus A321",
          cabin: "Standard Economy",
          stops: 0,
          arrivalMinutesPastMidnight: 17 * 60 + 20, // 17:20
          wheelchairAssistanceConfirmed: true,
        },
      },
      {
        id: "OPT-PRIMARY-B",
        optionLabel: "Option B",
        airline: "Vistara Premium",
        flightNumber: "UK-704",
        departure: "HYD (Hyderabad)",
        departureTime: "3:10 PM",
        arrival: "GOI (Goa Dabolim)",
        arrivalTime: "4:50 PM",
        cost: 12500,
        passengersTogether: 5,
        totalPassengers: 5,
        accessibilityAvailable: true,
        satisfiesDeadline: true,
        satisfiesGroup: true,
        satisfiesAuthority: false, // ₹12,500 > ₹10,000
        rejectionReason: "Exceeds autonomous spending authority (₹12,500 > ₹10,000 limit)",
        details: {
          aircraft: "Airbus A320neo",
          cabin: "Premium Economy",
          stops: 0,
          arrivalMinutesPastMidnight: 16 * 60 + 50,
          wheelchairAssistanceConfirmed: true,
        },
      },
      {
        id: "OPT-PRIMARY-C",
        optionLabel: "Option C",
        airline: "Akasa Air",
        flightNumber: "QP-1192",
        departure: "HYD (Hyderabad)",
        departureTime: "3:30 PM",
        arrival: "GOI (Goa Dabolim)",
        arrivalTime: "5:10 PM",
        cost: 5900,
        passengersTogether: 4,
        totalPassengers: 5,
        accessibilityAvailable: true,
        satisfiesDeadline: true,
        satisfiesGroup: false, // Only 4 seats together, violates group continuity!
        satisfiesAuthority: true,
        rejectionReason: "Violates group continuity constraint (Only 4 seats together, 1 separated)",
        details: {
          aircraft: "Boeing 737",
          cabin: "Economy",
          stops: 0,
          arrivalMinutesPastMidnight: 17 * 60 + 10,
          wheelchairAssistanceConfirmed: true,
        },
      },
      {
        id: "OPT-PRIMARY-D",
        optionLabel: "Option D",
        airline: "Air India",
        flightNumber: "AI-514",
        departure: "HYD (Hyderabad)",
        departureTime: "5:45 PM",
        arrival: "GOI (Goa Dabolim)",
        arrivalTime: "7:30 PM",
        cost: 4200,
        passengersTogether: 5,
        totalPassengers: 5,
        accessibilityAvailable: true,
        satisfiesDeadline: false, // 7:30 PM misses 6:00 PM deadline!
        satisfiesGroup: true,
        satisfiesAuthority: true,
        rejectionReason: "Misses hard arrival deadline (Arrives at 7:30 PM; deadline is 6:00 PM)",
        details: {
          aircraft: "Airbus A320",
          cabin: "Economy",
          stops: 0,
          arrivalMinutesPastMidnight: 19 * 60 + 30,
          wheelchairAssistanceConfirmed: true,
        },
      },
    ];
  }

  /**
   * Execute simulated flight booking
   */
  async bookReplacement(
    option: TravelOption,
    passengers: string[]
  ): Promise<BookingResult> {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const pnr = `WNG${randomSuffix}`;

    return {
      bookingReference: `BK-${pnr}`,
      pnr,
      status: "CONFIRMED",
      flightNumber: option.flightNumber,
      airline: option.airline,
      totalCost: option.cost,
      seatAssignments: ["14A", "14B", "14C", "14D", "14E"],
      passengers,
      accessibilityNote: "Wheelchair assistance confirmed at HYD boarding and GOI deplaning for Meera.",
      timestamp: new Date().toISOString(),
      connector: "SIMULATED EXTERNAL WORLD - PASSENGER TRAVEL",
    };
  }

  /**
   * Verify booking against simulated GDS
   */
  async verifyBooking(pnr: string): Promise<BookingVerification> {
    return {
      verified: true,
      pnr,
      status: "TICKETED_AND_ACTIVE",
      airlineTimestamp: new Date().toISOString(),
      auditTrailId: `GDS-VERIFY-${Date.now()}`,
      remarks: "GDS PNR status verified active. 5 e-tickets issued. Special service request (WCHR) confirmed.",
    };
  }
}

export const passengerTravelConnector = new PassengerTravelConnector();
