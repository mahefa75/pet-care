export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Appointment {
  id: number;
  petId: number;
  serviceId: number;
  veterinarianId: number;
  date: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentFilters {
  status?: AppointmentStatus;
  startDate?: Date;
  endDate?: Date;
  petId?: number;
  veterinarianId?: number;
} 