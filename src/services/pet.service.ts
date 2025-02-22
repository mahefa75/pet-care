import { Pet, PetFilters } from '../types/pet';
import { MedicalRecord } from '../types';
import { db } from '../lib/db';

export class PetService {
  async getPets(filters: PetFilters): Promise<Pet[]> {
    let query = db.pets.orderBy('name');

    if (filters.species) {
      query = query.filter(pet => pet.species === filters.species);
    }

    if (filters.status) {
      query = query.filter(pet => pet.status === filters.status);
    }

    const offset = (filters.page - 1) * filters.limit;
    return query.offset(offset).limit(filters.limit).toArray();
  }

  async getPetById(id: number): Promise<Pet> {
    const pet = await db.pets.get(id);
    if (!pet) throw new Error('Pet not found');
    return pet;
  }

  async createPet(pet: Omit<Pet, 'id' | 'createdAt' | 'updatedAt'>): Promise<Pet> {
    const now = new Date();
    const id = await db.pets.add({
      ...pet,
      createdAt: now,
      updatedAt: now
    } as unknown as Pet);
    return this.getPetById(id);
  }

  async updatePet(id: number, petUpdate: Partial<Pet>): Promise<Pet> {
    const exists = await db.pets.get(id);
    if (!exists) throw new Error('Pet not found');

    const now = new Date();
    await db.pets.update(id, {
      ...petUpdate,
      updatedAt: now
    });

    return this.getPetById(id);
  }

  async deletePet(id: number): Promise<void> {
    const exists = await db.pets.get(id);
    if (!exists) throw new Error('Pet not found');

    await db.pets.delete(id);
  }

  async getMedicalHistory(petId: number): Promise<MedicalRecord[]> {
    const treatments = await db.treatments
      .where('petId')
      .equals(petId)
      .toArray();

    return treatments.map(t => ({
      id: t.id.toString(),
      pet_id: t.petId.toString(),
      type: t.type.toLowerCase(),
      date: t.date.toISOString(),
      next_due_date: t.nextDueDate?.toISOString() || null,
      notes: t.notes || null,
      created_at: t.createdAt.toISOString()
    }));
  }
} 