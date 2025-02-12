import { PetCareDB } from '../lib/db';

export async function generateDataHash(db: PetCareDB): Promise<string> {
  // Récupérer toutes les données de toutes les tables (sauf les tables de sync)
  const tables = [
    'pets', 'appointments', 'treatments', 'reminders',
    'weightMeasurements', 'grooming', 'healthEvents', 'foods'
  ];

  const data: Record<string, any[]> = {};
  
  for (const table of tables) {
    data[table] = await db.table(table).toArray();
  }

  // Trier les données pour assurer la cohérence du hash
  for (const table in data) {
    data[table].sort((a, b) => {
      if (a.id === b.id) return 0;
      return a.id < b.id ? -1 : 1;
    });
  }

  // Créer une chaîne JSON triée
  const sortedJson = JSON.stringify(data, Object.keys(data).sort());

  // Utiliser SubtleCrypto pour générer un hash SHA-256
  const msgBuffer = new TextEncoder().encode(sortedJson);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
} 