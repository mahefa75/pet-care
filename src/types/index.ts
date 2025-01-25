// Types pour les animaux
export interface Pet {
  id: number;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  weight: number;
  owner: Owner;
  medicalHistory: MedicalRecord[];
  status: PetStatus;
  appointments: Appointment[];
}

// Énumération des espèces d'animaux
export enum PetSpecies {
  DOG = 'DOG',
  CAT = 'CAT',
  BIRD = 'BIRD',
  RABBIT = 'RABBIT',
  HAMSTER = 'HAMSTER',
  FISH = 'FISH',
  OTHER = 'OTHER'
}

// Énumération des statuts d'animal
export enum PetStatus {
  HEALTHY = 'HEALTHY',
  SICK = 'SICK',
  TREATMENT = 'TREATMENT',
  RECOVERY = 'RECOVERY'
}

// Type pour le propriétaire
export interface Owner {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  pets: Pet[];
}

// Type pour l'adresse
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Type pour les rendez-vous
export interface Appointment {
  id: number;
  pet: Pet;
  service: Service;
  date: Date;
  status: AppointmentStatus;
  notes?: string;
  veterinarian: Staff;
}

// Énumération des statuts de rendez-vous
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Type pour les services
export interface Service {
  id: number;
  name: string;
  description: string;
  duration: number; // en minutes
  price: number;
  category: ServiceCategory;
}

// Énumération des catégories de services
export enum ServiceCategory {
  CHECKUP = 'CHECKUP',
  VACCINATION = 'VACCINATION',
  SURGERY = 'SURGERY',
  GROOMING = 'GROOMING',
  DENTAL = 'DENTAL',
  EMERGENCY = 'EMERGENCY'
}

// Type pour le personnel
export interface Staff {
  id: number;
  firstName: string;
  lastName: string;
  role: StaffRole;
  specialization?: string;
  schedule: WorkSchedule[];
  email: string;
  phone: string;
}

// Énumération des rôles du personnel
export enum StaffRole {
  VETERINARIAN = 'VETERINARIAN',
  ASSISTANT = 'ASSISTANT',
  GROOMER = 'GROOMER',
  RECEPTIONIST = 'RECEPTIONIST',
  ADMIN = 'ADMIN'
}

// Type pour l'emploi du temps
export interface WorkSchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Type pour les dossiers médicaux
export interface MedicalRecord {
  id: number;
  pet: Pet;
  date: Date;
  diagnosis: string;
  treatment: string;
  prescription?: Prescription[];
  notes: string;
  veterinarian: Staff;
}

// Type pour les prescriptions
export interface Prescription {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate: Date;
  notes?: string;
}

// Type pour les réponses d'API
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// Type pour les erreurs d'API
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Type pour les filtres de recherche
export interface PetFilters {
  species?: PetSpecies;
  status?: PetStatus;
  searchQuery?: string;
  sortBy?: 'name' | 'age' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Type pour la pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Type pour les statistiques
export interface PetStatistics {
  totalPets: number;
  bySpecies: Record<PetSpecies, number>;
  byStatus: Record<PetStatus, number>;
  appointmentsToday: number;
  activePatients: number;
} 