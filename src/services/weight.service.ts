import { db } from '../lib/db';
import { WeightMeasurement } from '../types/pet';

export class WeightService {
  async getWeightHistory(petId: number): Promise<WeightMeasurement[]> {
    const measurements = await db.weightMeasurements
      .where('petId')
      .equals(petId)
      .toArray();

    // Trier par date et s'assurer que les poids ont 3 décimales
    return measurements
      .map(m => ({
        ...m,
        weight: Math.round(m.weight * 1000) / 1000,
        date: new Date(m.date)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async addWeightMeasurement(measurement: Omit<WeightMeasurement, 'id'>): Promise<number> {
    // S'assurer que le poids est arrondi à 3 décimales
    const roundedWeight = Math.round(measurement.weight * 1000) / 1000;
    
    return await db.weightMeasurements.add({
      ...measurement,
      weight: roundedWeight,
      date: new Date(measurement.date)
    } as WeightMeasurement);
  }

  async getLatestWeight(petId: number): Promise<WeightMeasurement | undefined> {
    const measurements = await db.weightMeasurements
      .where('petId')
      .equals(petId)
      .toArray();

    if (measurements.length === 0) return undefined;

    // Trouver la mesure la plus récente
    const latest = measurements
      .map(m => ({
        ...m,
        weight: Math.round(m.weight * 1000) / 1000,
        date: new Date(m.date)
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    return latest;
  }

  async getPreviousWeight(petId: number, currentDate: Date): Promise<WeightMeasurement | undefined> {
    const measurements = await db.weightMeasurements
      .where('petId')
      .equals(petId)
      .toArray();

    // Convertir la date courante en timestamp pour la comparaison
    const currentTimestamp = new Date(currentDate).getTime();

    // Filtrer et trier les mesures antérieures
    const previousMeasurements = measurements
      .map(m => ({
        ...m,
        weight: Math.round(m.weight * 1000) / 1000,
        date: new Date(m.date)
      }))
      .filter(m => m.date.getTime() < currentTimestamp)
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    return previousMeasurements[0];
  }

  async updateWeight(measurement: WeightMeasurement): Promise<void> {
    const roundedWeight = Math.round(measurement.weight * 1000) / 1000;
    await db.weightMeasurements.update(measurement.id, {
      ...measurement,
      weight: roundedWeight,
      date: new Date(measurement.date)
    });
  }

  async deleteWeight(id: number): Promise<void> {
    await db.weightMeasurements.delete(id);
  }
} 