export interface AvailabilityTemplate {
  availabilities: Availability[];
  bufferDuration: number;
  providesRecurringBooking: boolean;
  workingHoursPerDay: number;
}

export interface Availability {
  id: string;
  day: string;
  available: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}
