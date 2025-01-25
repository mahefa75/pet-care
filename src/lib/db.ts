import { DB } from '@vlcn.io/crsqlite-wasm';
import { Pet, MedicalRecord } from '../types';

let db: DB | null = null;

export const initDB = async () => {
  if (db) return db;
  
  db = await DB.open('petcare.db');
  
  // Initialisation de la base de données
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT,
      birth_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medical_records (
      id TEXT PRIMARY KEY,
      pet_id TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      next_due_date TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
    );
  `);

  return db;
};

export const getPets = async (): Promise<Pet[]> => {
  const db = await initDB();
  const result = await db.execO<Pet>('SELECT * FROM pets ORDER BY name');
  return result;
};

export const getPet = async (id: string): Promise<Pet | undefined> => {
  const db = await initDB();
  const result = await db.execO<Pet>('SELECT * FROM pets WHERE id = ?', [id]);
  return result[0];
};

export const createPet = async (pet: Omit<Pet, 'id' | 'created_at'>): Promise<Pet> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  await db.exec(
    'INSERT INTO pets (id, name, species, breed, birth_date) VALUES (?, ?, ?, ?, ?)',
    [id, pet.name, pet.species, pet.breed, pet.birth_date]
  );
  const result = await getPet(id);
  return result!;
};

export const updatePet = async (id: string, pet: Partial<Pet>): Promise<Pet> => {
  const db = await initDB();
  const sets: string[] = [];
  const values: any[] = [];
  
  Object.entries(pet).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at') {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (sets.length > 0) {
    await db.exec(
      `UPDATE pets SET ${sets.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  }
  
  const result = await getPet(id);
  return result!;
};

export const deletePet = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.exec('DELETE FROM pets WHERE id = ?', [id]);
};

export const getMedicalRecords = async (petId: string): Promise<MedicalRecord[]> => {
  const db = await initDB();
  const result = await db.execO<MedicalRecord>(
    'SELECT * FROM medical_records WHERE pet_id = ? ORDER BY date DESC',
    [petId]
  );
  return result;
};

export const createMedicalRecord = async (record: Omit<MedicalRecord, 'id' | 'created_at'>): Promise<MedicalRecord> => {
  const db = await initDB();
  const id = crypto.randomUUID();
  await db.exec(
    'INSERT INTO medical_records (id, pet_id, type, date, next_due_date, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [id, record.pet_id, record.type, record.date, record.next_due_date, record.notes]
  );
  const result = await db.execO<MedicalRecord>(
    'SELECT * FROM medical_records WHERE id = ?',
    [id]
  );
  return result[0];
};

export const updateMedicalRecord = async (id: string, record: Partial<MedicalRecord>): Promise<MedicalRecord> => {
  const db = await initDB();
  const sets: string[] = [];
  const values: any[] = [];
  
  Object.entries(record).forEach(([key, value]) => {
    if (key !== 'id' && key !== 'created_at') {
      sets.push(`${key} = ?`);
      values.push(value);
    }
  });
  
  if (sets.length > 0) {
    await db.exec(
      `UPDATE medical_records SET ${sets.join(', ')} WHERE id = ?`,
      [...values, id]
    );
  }
  
  const result = await db.execO<MedicalRecord>(
    'SELECT * FROM medical_records WHERE id = ?',
    [id]
  );
  return result[0];
};

export const deleteMedicalRecord = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.exec('DELETE FROM medical_records WHERE id = ?', [id]);
};