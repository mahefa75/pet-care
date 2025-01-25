export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  created_at: string;
}

export interface MedicalRecord {
  id: string;
  pet_id: string;
  type: string;
  date: string;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
}

export type MedicalRecordType = 'vaccination' | 'deworming' | 'checkup' | 'other';