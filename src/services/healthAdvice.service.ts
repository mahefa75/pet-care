import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pet } from '../types/pet';
import { HealthEvent } from './healthEvent.service';
import { WeightService } from './weight.service';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const weightService = new WeightService();

interface GosbiRecommendation {
  productName: string;
  productLine: string;
  imageUrl: string;
  dailyPortion: string;
  reasonForRecommendation: string;
}

export interface HealthAdvice {
  generalAdvice: string;
  specificRecommendations: string[];
  warningSignsToWatch: string[];
  lifestyleAdjustments: string[];
  whenToConsultVet: string;
  foodRecommendation: GosbiRecommendation;
}

interface CacheEntry {
  advice: HealthAdvice;
  timestamp: number;
  hash: string;
}

export class HealthAdviceService {
  private model;
  private cache: Map<string, CacheEntry> = new Map();

  private gosbiProducts = {
    puppy: {
      small: {
        name: "Gosbi Exclusive Puppy Mini",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-puppy-mini.png"
      },
      medium: {
        name: "Gosbi Exclusive Puppy Medium",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-puppy-medium.png"
      },
      large: {
        name: "Gosbi Exclusive Puppy Maxi",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-puppy-maxi.png"
      }
    },
    adult: {
      small: {
        name: "Gosbi Exclusive Adult Mini",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-adult-mini.png"
      },
      medium: {
        name: "Gosbi Exclusive Adult Medium",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-adult-medium.png"
      },
      large: {
        name: "Gosbi Exclusive Adult Maxi",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-adult-maxi.png"
      }
    },
    senior: {
      small: {
        name: "Gosbi Exclusive Senior Mini",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-senior-mini.png"
      },
      medium: {
        name: "Gosbi Exclusive Senior Medium",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-senior-medium.png"
      },
      large: {
        name: "Gosbi Exclusive Senior Maxi",
        line: "Exclusive",
        imageUrl: "https://gosbi.com/wp-content/uploads/2021/03/exclusive-senior-maxi.png"
      }
    }
  };

  constructor() {
    if (!GEMINI_API_KEY) {
      console.error('Clé API Gemini non configurée. Veuillez ajouter VITE_GEMINI_API_KEY dans le fichier .env');
    } else {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        console.log('Service Gemini initialisé avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du service Gemini:', error);
      }
    }
  }

  private generateEventHash(pet: Pet, event: HealthEvent, latestWeight: number | null): string {
    // Créer une chaîne unique qui représente l'état actuel de l'événement et du pet
    const eventData = `${event.id || 'new'}-${event.type}-${event.description}-${event.severity}-${event.resolved}-${event.notes || ''}-${event.date}`;
    const petData = `${pet.id}-${pet.name}-${pet.species}-${pet.breed}-${pet.birthDate}-${latestWeight || pet.weight}-${pet.status}`;
    return `${eventData}-${petData}`;
  }

  private getCacheKey(event: HealthEvent): string {
    return event.id ? event.id.toString() : 'new';
  }

  private calculateDailyPortion(ageInMonths: number, weight: number): string {
    // Pour les chiots de 2 mois et plus
    if (ageInMonths >= 2 && weight >= 2) {
      return "90-110g par jour, à diviser en 3-4 repas";
    }

    // Pour les autres cas, calculer en fonction du poids
    const basePortion = weight * 20; // 20g par kg de poids
    let adjustedPortion: number;

    if (ageInMonths < 12) { // Chiot
      if (weight < 2) {
        adjustedPortion = basePortion * 1.8; // Plus de nourriture pour très jeunes chiots
      } else {
        adjustedPortion = basePortion * 1.5;
      }
    } else if (ageInMonths > 84) { // Senior (7 ans et plus)
      adjustedPortion = basePortion * 0.8;
    } else { // Adulte
      adjustedPortion = basePortion;
    }

    return `${Math.round(adjustedPortion)}g par jour, à diviser en ${ageInMonths < 12 ? "3-4" : "2"} repas`;
  }

  private getGosbiRecommendation(pet: Pet, weight: number): GosbiRecommendation {
    // Calculer l'âge en mois
    const birthDate = new Date(pet.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());

    // Déterminer la catégorie d'âge
    let ageCategory: 'puppy' | 'adult' | 'senior';
    if (ageInMonths < 12) {
      ageCategory = 'puppy';
    } else if (ageInMonths > 84) {
      ageCategory = 'senior';
    } else {
      ageCategory = 'adult';
    }

    // Déterminer la taille
    let sizeCategory: 'small' | 'medium' | 'large';
    if (weight < 10) {
      sizeCategory = 'small';
    } else if (weight < 25) {
      sizeCategory = 'medium';
    } else {
      sizeCategory = 'large';
    }

    const product = this.gosbiProducts[ageCategory][sizeCategory];
    const dailyPortion = this.calculateDailyPortion(ageInMonths, weight);
    
    return {
      productName: product.name,
      productLine: product.line,
      imageUrl: product.imageUrl,
      dailyPortion: dailyPortion,
      reasonForRecommendation: `Recommandé pour les ${sizeCategory === 'small' ? 'petites' : sizeCategory === 'medium' ? 'moyennes' : 'grandes'} races en phase ${ageCategory === 'puppy' ? 'de croissance' : ageCategory === 'senior' ? 'senior' : 'adulte'}`
    };
  }

  async getAdviceForHealthEvent(pet: Pet, event: HealthEvent): Promise<HealthAdvice> {
    try {
      // Récupérer le dernier poids enregistré
      const latestWeightRecord = await weightService.getLatestWeight(pet.id);
      const latestWeight = latestWeightRecord ? latestWeightRecord.weight : pet.weight;
      console.log('Dernier poids enregistré:', latestWeight);

      const cacheKey = this.getCacheKey(event);
      // Vérifier si nous avons des conseils en cache pour cet événement
      const cachedEntry = this.cache.get(cacheKey);
      const currentHash = this.generateEventHash(pet, event, latestWeight);

      // Si nous avons des conseils en cache et que les données n'ont pas changé
      if (cachedEntry && cachedEntry.hash === currentHash) {
        console.log('Utilisation des conseils en cache pour l\'événement:', cacheKey);
        return cachedEntry.advice;
      }

      // Si le modèle n'est pas initialisé
      if (!this.model) {
        throw new Error('Le service Gemini n\'est pas configuré correctement');
      }

      // S'assurer que la date de naissance est un objet Date
      const birthDate = new Date(pet.birthDate);
      const age = this.calculateAge(birthDate);

      // Obtenir la recommandation Gosbi
      const gosbiRecommendation = this.getGosbiRecommendation(pet, latestWeight);

      const prompt = `En tant que vétérinaire expérimenté, analyse la situation de santé suivante et fournis des conseils détaillés et personnalisés. Réponds UNIQUEMENT avec un objet JSON structuré comme dans l'exemple, sans texte supplémentaire.

Informations sur l'animal :
- Nom: ${pet.name}
- Espèce: ${pet.species}
- Race: ${pet.breed}
- Âge: ${age}
- Poids actuel: ${latestWeight} kg${latestWeightRecord ? ' (dernière pesée)' : ''}
- État de santé général: ${pet.status}

Événement de santé actuel :
- Type: ${event.type}
- Description: ${event.description}
- Sévérité: ${event.severity}
- Date de début: ${new Date(event.date).toLocaleDateString('fr-FR')}
- Notes supplémentaires: ${event.notes || 'Aucune'}

Alimentation recommandée :
- Produit: ${gosbiRecommendation.productName}
- Ration: ${gosbiRecommendation.dailyPortion}

Format de réponse attendu:
{
  "generalAdvice": "Conseil général principal",
  "specificRecommendations": [
    "Recommandation 1",
    "Recommandation 2",
    "Recommandation 3"
  ],
  "warningSignsToWatch": [
    "Signe d'alerte 1",
    "Signe d'alerte 2"
  ],
  "lifestyleAdjustments": [
    "Ajustement 1",
    "Ajustement 2"
  ],
  "whenToConsultVet": "Critères précis pour consulter un vétérinaire"
}

Important:
1. Adapte les conseils à l'espèce, l'âge et la condition spécifique de l'animal
2. Sois précis et pratique dans les recommandations
3. Inclus des signes d'alerte pertinents pour la condition
4. Propose des ajustements réalistes du mode de vie
5. Donne des critères clairs pour consulter un vétérinaire
6. Prends en compte le poids actuel de l'animal dans tes recommandations
7. Intègre des conseils sur l'alimentation en tenant compte des croquettes Gosbi recommandées
8. RETOURNE UNIQUEMENT L'OBJET JSON, PAS DE TEXTE AVANT OU APRÈS`;

      // Ajouter un timeout de 30 secondes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Délai d\'attente dépassé')), 30000);
      });

      const result = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise
      ]) as any;

      if (!result || !result.response) {
        throw new Error('Réponse invalide du service Gemini');
      }

      const text = result.response.text();
      console.log('Réponse brute de Gemini:', text);

      try {
        // Nettoyer la réponse des délimiteurs Markdown et autres caractères non-JSON
        const cleanedText = text
          .replace(/```json\n/g, '')
          .replace(/\n```/g, '')
          .replace(/```/g, '')
          .trim();

        console.log('Texte nettoyé avant parsing:', cleanedText);
        
        const advice = JSON.parse(cleanedText);
        
        // Valider la structure de la réponse
        if (!this.validateAdviceStructure(advice)) {
          throw new Error('Structure de réponse invalide');
        }

        // Ajouter la recommandation Gosbi à l'avis
        const completeAdvice = {
          ...advice,
          foodRecommendation: gosbiRecommendation
        };

        // Mettre en cache les nouveaux conseils
        this.cache.set(cacheKey, {
          advice: completeAdvice,
          timestamp: Date.now(),
          hash: currentHash
        });

        return completeAdvice;
      } catch (error) {
        console.error('Erreur lors du parsing de la réponse:', error);
        console.error('Texte qui a causé l\'erreur:', text);
        throw new Error('Format de réponse invalide');
      }
    } catch (error: any) {
      console.error('Erreur lors de la génération des conseils:', error);
      
      // Retourner une réponse par défaut en cas d'erreur
      const defaultAdvice = this.getDefaultAdvice(pet, event);
      const cacheKey = this.getCacheKey(event);
      
      // Mettre en cache la réponse par défaut également
      this.cache.set(cacheKey, {
        advice: defaultAdvice,
        timestamp: Date.now(),
        hash: this.generateEventHash(pet, event, null)
      });
      
      return defaultAdvice;
    }
  }

  private validateAdviceStructure(advice: any): boolean {
    return (
      typeof advice.generalAdvice === 'string' &&
      Array.isArray(advice.specificRecommendations) &&
      Array.isArray(advice.warningSignsToWatch) &&
      Array.isArray(advice.lifestyleAdjustments) &&
      typeof advice.whenToConsultVet === 'string'
    );
  }

  private getDefaultAdvice(pet: Pet, event: HealthEvent): HealthAdvice {
    const latestWeight = pet.weight;
    const gosbiRecommendation = this.getGosbiRecommendation(pet, latestWeight);

    return {
      generalAdvice: `Surveillez attentivement l'évolution de l'état de santé de ${pet.name}.`,
      specificRecommendations: [
        "Maintenir une observation régulière des symptômes",
        "Noter tout changement de comportement",
        "Assurer un environnement calme et confortable"
      ],
      warningSignsToWatch: [
        "Aggravation des symptômes",
        "Changement important dans l'appétit ou le comportement",
        "Signes de douleur ou d'inconfort"
      ],
      lifestyleAdjustments: [
        "Adapter l'activité physique si nécessaire",
        "Maintenir une routine stable"
      ],
      whenToConsultVet: "Consultez un vétérinaire si les symptômes s'aggravent ou persistent, ou si vous observez des changements inquiétants dans l'état de santé de votre animal.",
      foodRecommendation: gosbiRecommendation
    };
  }

  private calculateAge(birthDate: Date | string): string {
    const today = new Date();
    const birth = new Date(birthDate);
    
    // Vérifier si la date est valide
    if (isNaN(birth.getTime())) {
      console.error('Date de naissance invalide:', birthDate);
      return 'Âge inconnu';
    }

    let age = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    
    // Ajuster les années si nous n'avons pas encore atteint le mois d'anniversaire
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age.toString();
  }
}

export const healthAdviceService = new HealthAdviceService(); 