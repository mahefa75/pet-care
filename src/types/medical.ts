export enum TreatmentType {
  VACCINATION = 'VACCINATION',
  DEWORMING = 'DEWORMING',
  MEDICATION = 'MEDICATION',
  CHECKUP = 'CHECKUP',
  SURGERY = 'SURGERY',
  OTHER = 'OTHER'
}

export enum TreatmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Treatment {
  id: number;
  petId: number;
  type: TreatmentType;
  name: string;
  date: Date;
  nextDueDate?: Date;
  notes?: string;
  veterinarianId: number;
  status: TreatmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vaccine extends Treatment {
  type: TreatmentType.VACCINATION;
  disease: string;
  batch?: string;
  manufacturer?: string;
}

export interface Deworming extends Treatment {
  type: TreatmentType.DEWORMING;
  product: string;
  weight: number;
  dosage: string;
}

export interface Medication extends Treatment {
  type: TreatmentType.MEDICATION;
  product: string;
  dosage: string;
  frequency: string;
  duration: number; // en jours
  startDate: Date;
  endDate: Date;
}

export interface Checkup extends Treatment {
  type: TreatmentType.CHECKUP;
  reason: string;
  diagnosis?: string;
  prescription?: string;
  weight: number;
  temperature?: number;
}

export interface Surgery extends Treatment {
  type: TreatmentType.SURGERY;
  procedure: string;
  anesthesia?: string;
  recovery?: string;
}

export interface Reminder {
  id: number;
  petId: number;
  treatmentId: number;
  type: TreatmentType;
  dueDate: Date;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TreatmentFilters {
  petId?: number;
  type?: TreatmentType;
  status?: TreatmentStatus;
  startDate?: Date;
  endDate?: Date;
  sortBy?: keyof Treatment;
  sortOrder?: 'asc' | 'desc';
  page: number;
  limit: number;
  offset?: number;
} 