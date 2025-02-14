import { db } from '../lib/db';

export interface Veterinarian {
  id: number;
  name: string;
  speciality?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class VeterinarianService {
  async getVeterinarians(): Promise<Veterinarian[]> {
    return db.veterinarians.toArray();
  }

  async getVeterinarianById(id: number): Promise<Veterinarian> {
    const veterinarian = await db.veterinarians.get(id);
    if (!veterinarian) throw new Error('Veterinarian not found');
    return veterinarian;
  }

  async createVeterinarian(data: Omit<Veterinarian, 'id' | 'createdAt' | 'updatedAt'>): Promise<Veterinarian> {
    const now = new Date();
    const id = await db.veterinarians.add({
      ...data,
      createdAt: now,
      updatedAt: now
    } as any);
    return this.getVeterinarianById(id);
  }

  async updateVeterinarian(id: number, data: Partial<Veterinarian>): Promise<Veterinarian> {
    const exists = await db.veterinarians.get(id);
    if (!exists) throw new Error('Veterinarian not found');

    await db.veterinarians.update(id, {
      ...data,
      updatedAt: new Date()
    });

    return this.getVeterinarianById(id);
  }

  async deleteVeterinarian(id: number): Promise<void> {
    const exists = await db.veterinarians.get(id);
    if (!exists) throw new Error('Veterinarian not found');

    await db.veterinarians.delete(id);
  }
} 