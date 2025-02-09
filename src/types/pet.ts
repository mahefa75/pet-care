export enum PetSpecies {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  OTHER = 'OTHER'
}

export enum PetStatus {
  HEALTHY = 'HEALTHY',
  SICK = 'SICK',
  TREATMENT = 'TREATMENT'
}

export interface WeightMeasurement {
  id: number;
  petId: number;
  weight: number;
  date: Date;
  notes?: string;
  foods?: number[]; // IDs of associated foods
}

export interface Pet {
  id: number;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: Date;
  weight: number;
  status: PetStatus;
  ownerId: number;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  weightHistory?: WeightMeasurement[];
}

export interface PetFilters {
  species?: PetSpecies;
  status?: PetStatus;
  page: number;
  limit: number;
}

export interface MedicalRecord {
  id: number;
  petId: number;
  date: Date;
  diagnosis: string;
  treatment: string;
  notes?: string;
  veterinarianId: number;
} 