/**
 * SIMULATED EXTERNAL WORLD - MOBILITY ORCHESTRATION CONNECTOR
 * 
 * Manages airport ground transfers, synchronized pickup calculation based on airport exit,
 * accessibility validation, driver assignment lifecycle, and live tracking/modifications.
 */

export interface RideWindow {
  start: string;
  target: string;
  end: string;
}

export interface RideDriver {
  name: string;
  phone: string;
  vehiclePlate: string;
  rating: number;
  assignedAt: string;
}

export interface RideLifecycle {
  flightLanded?: string;
  expectedExit?: string;
  travellerExited?: string;
  driverNotified?: string;
  passengerPickedUp?: string;
  etaToDestination?: string;
}

export interface Ride {
  rideId: string;
  status: "CONFIRMED" | "DISPATCHED" | "PICKED_UP" | "IN_TRANSIT" | "COMPLETED" | "CANCELLED" | "MODIFIED";
  pickupLocation: string;
  destination: string;
  pickupWindow: RideWindow;
  vehicle: string;
  capacity: number;
  accessibility: boolean;
  driverAssigned: boolean;
  cost: number;
  driver?: RideDriver;
  lifecycle?: RideLifecycle;
  connector: "SIMULATED EXTERNAL WORLD - MOBILITY";
  timestamp: string;
}

export interface TransferRequest {
  pickupLocation: string;
  dropoffLocation: string;
  flightArrival: string; // e.g. "18:00" or "5:20 PM"
  passengerCount: number;
  accessibilityRequired: boolean;
  leadPassengerName?: string;
}

export interface TransferBookingResult {
  transferId: string;
  provider: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  pickupTime: string;
  estimatedArrival: string;
  status: "CONFIRMED" | "DISPATCHED" | "CANCELLED";
  cost: number;
  accessibilityFeatures: string[];
  connector: "SIMULATED EXTERNAL WORLD - MOBILITY";
  timestamp: string;
}

export interface TransferVerification {
  verified: boolean;
  transferId: string;
  fleetStatus: "VEHICLE_ASSIGNED_AND_DISPATCHED";
  rampCertified: boolean;
  remarks: string;
}

export class MobilityConnector {
  private connectorLabel = "SIMULATED EXTERNAL WORLD (Goa Mobility Fleet Dispatch)";

  // Persistent in-memory ride registry
  private activeRides: Map<string, Ride> = new Map();

  /**
   * Helper: Parse time string into minutes from midnight
   */
  private parseTimeToMinutes(timeStr: string): number {
    const clean = timeStr.trim().toLowerCase();
    const isPm = clean.includes("pm");
    const isAm = clean.includes("am");
    const parts = clean.replace(/[apm\s]/g, "").split(":");
    let hours = parseInt(parts[0], 10) || 0;
    const mins = parseInt(parts[1], 10) || 0;
    if (isPm && hours < 12) hours += 12;
    if (isAm && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  /**
   * Helper: Format minutes into 24-hr or 12-hr time string
   */
  private formatMinutesToTime(totalMinutes: number, format24 = false): string {
    const norm = (totalMinutes + 1440) % 1440;
    const hours24 = Math.floor(norm / 60);
    const mins = norm % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (format24) {
      return `${pad(hours24)}:${pad(mins)}`;
    }

    const isPm = hours24 >= 12;
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${pad(mins)} ${isPm ? "PM" : "AM"}`;
  }

  /**
   * SECTION 22: Calculate synchronized pickup target based on airport exit, NOT flight landing
   * Flight arrival -> disembarkation/baggage/exit (e.g. +25 min) -> buffer (+10 min) -> pickup target
   */
  calculatePickupWindow(
    flightArrivalStr: string,
    exitBufferMinutes = 25,
    pickupBufferMinutes = 10
  ): { flightArrival: string; expectedExit: string; pickupTarget: string; window: RideWindow } {
    const arrivalMins = this.parseTimeToMinutes(flightArrivalStr);
    const exitMins = arrivalMins + exitBufferMinutes;
    const targetMins = exitMins + pickupBufferMinutes;

    const startMins = targetMins - 5;
    const endMins = targetMins + 15;

    const is24 = flightArrivalStr.includes(":") && !flightArrivalStr.toLowerCase().includes("m");

    return {
      flightArrival: flightArrivalStr,
      expectedExit: this.formatMinutesToTime(exitMins, is24),
      pickupTarget: this.formatMinutesToTime(targetMins, is24),
      window: {
        start: this.formatMinutesToTime(startMins, is24),
        target: this.formatMinutesToTime(targetMins, is24),
        end: this.formatMinutesToTime(endMins, is24),
      },
    };
  }

  /**
   * SECTION 21: Find available rides from Mobility Provider
   */
  async findRide(params: {
    pickupLocation: string;
    destination: string;
    flightArrival: string;
    passengerCount: number;
    accessibility: boolean;
  }): Promise<Ride[]> {
    const { pickupTarget, window } = this.calculatePickupWindow(params.flightArrival);

    // Provide options including valid and invalid (e.g., small capacity or non-accessible)
    // so deterministic constraint validation can filter them properly
    const options: Ride[] = [
      {
        rideId: `MOB-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "CONFIRMED",
        pickupLocation: params.pickupLocation || "Goa Dabolim Airport (GOI)",
        destination: params.destination || "Wedding Venue (Vivanta)",
        pickupWindow: window,
        vehicle: "Accessible Luxury 6-Seater Van (Toyota Vellfire Spec)",
        capacity: 6,
        accessibility: true,
        driverAssigned: false,
        cost: 1600,
        connector: "SIMULATED EXTERNAL WORLD - MOBILITY",
        timestamp: new Date().toISOString(),
      },
      {
        rideId: `MOB-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "CONFIRMED",
        pickupLocation: params.pickupLocation || "Goa Dabolim Airport (GOI)",
        destination: params.destination || "Wedding Venue (Vivanta)",
        pickupWindow: {
          start: window.start,
          target: this.formatMinutesToTime(this.parseTimeToMinutes(window.target) - 5),
          end: window.end,
        },
        vehicle: "Standard Sedan (4-seater)",
        capacity: 4, // Invalid for group of 5
        accessibility: false, // Invalid for Meera
        driverAssigned: false,
        cost: 850,
        connector: "SIMULATED EXTERNAL WORLD - MOBILITY",
        timestamp: new Date().toISOString(),
      },
      {
        rideId: `MOB-${Math.floor(10000 + Math.random() * 90000)}`,
        status: "CONFIRMED",
        pickupLocation: params.pickupLocation || "Goa Dabolim Airport (GOI)",
        destination: params.destination || "Wedding Venue (Vivanta)",
        pickupWindow: window,
        vehicle: "Executive 7-Seater Accessible SUV",
        capacity: 7,
        accessibility: true,
        driverAssigned: false,
        cost: 2100,
        connector: "SIMULATED EXTERNAL WORLD - MOBILITY",
        timestamp: new Date().toISOString(),
      },
    ];

    options.forEach((r) => this.activeRides.set(r.rideId, r));
    return options;
  }

  /**
   * Quote specific ride
   */
  async quoteRide(rideId: string): Promise<Ride | null> {
    return this.activeRides.get(rideId) || null;
  }

  /**
   * Reserve ride
   */
  async reserveRide(rideId: string): Promise<Ride> {
    let ride = this.activeRides.get(rideId);
    if (!ride) {
      ride = {
        rideId,
        status: "CONFIRMED",
        pickupLocation: "Goa Airport",
        destination: "Wedding Venue",
        pickupWindow: { start: "17:45", target: "17:55", end: "18:10" },
        vehicle: "6-seater",
        capacity: 6,
        accessibility: true,
        driverAssigned: false,
        cost: 1600,
        connector: "SIMULATED EXTERNAL WORLD - MOBILITY",
        timestamp: new Date().toISOString(),
      };
      this.activeRides.set(rideId, ride);
    }
    return ride;
  }

  /**
   * Confirm ride and initiate driver assignment lifecycle
   */
  async confirmRide(rideId: string): Promise<Ride> {
    const ride = await this.reserveRide(rideId);
    ride.status = "CONFIRMED";
    ride.driverAssigned = true;
    ride.driver = {
      name: "Santosh Naik",
      phone: "+91 98221 44510",
      vehiclePlate: "GA-01-AX-9941",
      rating: 4.95,
      assignedAt: new Date().toISOString(),
    };
    ride.lifecycle = {
      flightLanded: "17:22",
      expectedExit: "17:45",
      travellerExited: "17:48",
      driverNotified: "17:49",
      passengerPickedUp: "17:52",
      etaToDestination: "18:35",
    };
    this.activeRides.set(rideId, ride);
    return ride;
  }

  /**
   * SECTION 32: Get assigned driver
   */
  async getDriver(rideId: string): Promise<RideDriver | null> {
    const ride = this.activeRides.get(rideId);
    return ride?.driver || null;
  }

  /**
   * SECTION 32 & 33: Track ride and passenger progression
   */
  async trackRide(rideId: string): Promise<Ride | null> {
    return this.activeRides.get(rideId) || null;
  }

  /**
   * SECTION 33: Modify ride when flight or airport exit changes
   */
  async modifyRide(rideId: string, newPickupTime: string, reason?: string): Promise<Ride> {
    const ride = await this.reserveRide(rideId);
    const { window } = this.calculatePickupWindow(newPickupTime, 0, 0); // target already adjusted
    ride.pickupWindow = {
      start: window.start,
      target: newPickupTime,
      end: window.end,
    };
    ride.status = "MODIFIED";
    ride.timestamp = new Date().toISOString();
    this.activeRides.set(rideId, ride);
    return ride;
  }

  /**
   * Cancel ride when upstream flight change invalidates it
   */
  async cancelRide(rideId: string, reason?: string): Promise<boolean> {
    const ride = this.activeRides.get(rideId);
    if (ride) {
      ride.status = "CANCELLED";
      return true;
    }
    return false;
  }

  // --- Backward Compatibility for existing simulation scripts ---

  async findTransfer(request: TransferRequest) {
    const { expectedExit, pickupTarget } = this.calculatePickupWindow(request.flightArrival);
    return {
      provider: "GoaMobility Pro Premium",
      vehicleType: "Accessible Luxury 6-Seater Van (Toyota Vellfire Spec)",
      capacity: 6,
      rampEquipped: true,
      pickupLocation: request.pickupLocation,
      dropoffLocation: request.dropoffLocation,
      flightArrival: request.flightArrival,
      expectedExit,
      pickupTime: pickupTarget,
      estimatedArrival: "6:00 PM (Direct Express Route to Vivanta)",
      cost: 1800,
    };
  }

  async bookTransfer(
    request: TransferRequest,
    vehicleDetails: { vehicleType: string; pickupTime: string; cost: number }
  ): Promise<TransferBookingResult> {
    const id = `TRF-GOA-${Math.floor(1000 + Math.random() * 9000)}`;
    const ride = await this.confirmRide(id);

    return {
      transferId: id,
      provider: "GoaMobility Pro Premium",
      vehicleType: vehicleDetails.vehicleType,
      driverName: ride.driver?.name || "Santosh Naik",
      driverPhone: ride.driver?.phone || "+91 98221 44510",
      pickupTime: vehicleDetails.pickupTime,
      estimatedArrival: "5:55 PM (Reaching venue comfortably)",
      status: "CONFIRMED",
      cost: vehicleDetails.cost,
      accessibilityFeatures: [
        "Hydraulic Wheelchair Ramp",
        "Low-entry threshold step",
        "Meera priority seating",
        "Spacious 5-passenger cabin",
      ],
      connector: "SIMULATED EXTERNAL WORLD - MOBILITY",
      timestamp: new Date().toISOString(),
    };
  }

  async verifyTransfer(transferId: string): Promise<TransferVerification> {
    return {
      verified: true,
      transferId,
      fleetStatus: "VEHICLE_ASSIGNED_AND_DISPATCHED",
      rampCertified: true,
      remarks: "Chauffeur Santosh Naik confirmed on standby at Goa Dabolim Arrivals with wheelchair assistance placard.",
    };
  }
}

export const mobilityConnector = new MobilityConnector();
