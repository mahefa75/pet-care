import { db } from '../lib/db';
import { db as firestore } from '../firebase/config';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { compressImage } from '../utils/imageCompressor';

export class SyncService {
  private collections = [
    { name: 'pets', dbTable: db.pets },
    { name: 'appointments', dbTable: db.appointments },
    { name: 'treatments', dbTable: db.treatments },
    { name: 'reminders', dbTable: db.reminders },
    { name: 'weightMeasurements', dbTable: db.weightMeasurements },
    { name: 'grooming', dbTable: db.grooming },
    { name: 'healthEvents', dbTable: db.healthEvents },
    { name: 'foods', dbTable: db.foods }
  ];

  async syncToFirebase() {
    try {
      // Créer d'abord toutes les collections avec un document temporaire
      for (const { name } of this.collections) {
        console.log(`Création de la collection ${name}...`);
        const collectionRef = collection(firestore, name);
        // Créer un document temporaire pour s'assurer que la collection existe
        const tempDoc = doc(collectionRef, 'temp');
        await setDoc(tempDoc, { temp: true });
        // Supprimer immédiatement le document temporaire
        await deleteDoc(tempDoc);
      }

      // Ensuite, synchroniser les données
      for (const { name, dbTable } of this.collections) {
        console.log(`Synchronisation de la collection ${name}...`);
        
        // 1. Récupérer toutes les données de IndexedDB
        const data = await dbTable.toArray();

        if (data.length > 0) {
          // 2. Supprimer toutes les données existantes dans Firebase
          const collectionRef = collection(firestore, name);
          const snapshot = await getDocs(collectionRef);
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);

          // 3. Ajouter les nouvelles données
          const addPromises = data.map(async item => {
            // Traiter les photos si nécessaire
            const processedItem = await this.processItemForFirebase(item);
            // Nettoyer l'objet pour Firestore
            const cleanedItem = this.cleanItemForFirestore(processedItem);
            // Utiliser l'ID existant comme ID du document
            await setDoc(doc(firestore, name, cleanedItem.id.toString()), cleanedItem);
          });

          await Promise.all(addPromises);
        }
        console.log(`Collection ${name} synchronisée avec succès`);
      }

      return { success: true, message: 'Synchronisation terminée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      return { 
        success: false, 
        message: 'Erreur lors de la synchronisation', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  private cleanItemForFirestore(item: any): any {
    const cleaned: any = {};

    for (const [key, value] of Object.entries(item)) {
      // Ignorer les propriétés undefined
      if (value === undefined) {
        cleaned[key] = null;
        continue;
      }

      // Traiter les objets imbriqués
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        cleaned[key] = this.cleanItemForFirestore(value);
        continue;
      }

      // Traiter les tableaux
      if (Array.isArray(value)) {
        cleaned[key] = value.map(item => {
          if (item === undefined) return null;
          if (item !== null && typeof item === 'object') {
            return this.cleanItemForFirestore(item);
          }
          return item;
        });
        continue;
      }

      // Valeur simple
      cleaned[key] = value;
    }

    return cleaned;
  }

  private async processItemForFirebase(item: any) {
    const processed = { ...item };
    
    // Gérer les URLs de photos
    if (processed.photoUrl && processed.photoUrl.length > 0) {
      try {
        // Si c'est une URL data:image
        if (processed.photoUrl.startsWith('data:image')) {
          // Compresser l'image
          processed.photoUrl = await compressImage(processed.photoUrl);
        }
        // Si ce n'est pas une URL data:image, on la supprime
        else {
          delete processed.photoUrl;
        }
      } catch (error) {
        console.error('Erreur lors du traitement de la photo:', error);
        delete processed.photoUrl;
      }
    }
    
    // Convertir les dates en timestamps
    for (const [key, value] of Object.entries(processed)) {
      if (value instanceof Date) {
        processed[key] = value.toISOString();
      }
    }

    return processed;
  }
} 