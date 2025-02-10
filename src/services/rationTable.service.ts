import { FoodPortion } from '../types/food';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialiser Gemini AI
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface OCRResult {
  portions: FoodPortion[];
  type: 'puppy' | 'adult' | 'both';
  rawData?: string;
  error?: OCRError;
}

interface OCRError {
  code: string;
  message: string;
  details?: any;
}

interface RationTableRow {
  ageMin?: number;
  ageMax?: number;
  weightMin: number;
  weightMax: number;
  allowanceMin: number;
  allowanceMax: number;
}

// Données de test pour simuler l'OCR
const SAMPLE_DATA: RationTableRow[] = [
  // Données pour chiots
  { ageMin: 2, ageMax: 2, weightMin: 1, weightMax: 2, allowanceMin: 60, allowanceMax: 80 },
  { ageMin: 3, ageMax: 3, weightMin: 1, weightMax: 2, allowanceMin: 40, allowanceMax: 60 },
  { ageMin: 4, ageMax: 4, weightMin: 1, weightMax: 2, allowanceMin: 40, allowanceMax: 60 },
  { ageMin: 5, ageMax: 6, weightMin: 1, weightMax: 2, allowanceMin: 40, allowanceMax: 60 },
  { ageMin: 7, ageMax: 8, weightMin: 1, weightMax: 2, allowanceMin: 40, allowanceMax: 55 },
  
  { ageMin: 2, ageMax: 2, weightMin: 2, weightMax: 3, allowanceMin: 90, allowanceMax: 110 },
  { ageMin: 3, ageMax: 3, weightMin: 2, weightMax: 3, allowanceMin: 70, allowanceMax: 90 },
  { ageMin: 4, ageMax: 4, weightMin: 2, weightMax: 3, allowanceMin: 70, allowanceMax: 90 },
  
  // Données pour adultes (sans âge)
  { weightMin: 5, weightMax: 10, allowanceMin: 90, allowanceMax: 100 },
  { weightMin: 10, weightMax: 15, allowanceMin: 150, allowanceMax: 170 },
  { weightMin: 15, weightMax: 20, allowanceMin: 200, allowanceMax: 230 },
  { weightMin: 20, weightMax: 25, allowanceMin: 250, allowanceMax: 290 },
  { weightMin: 25, weightMax: 30, allowanceMin: 300, allowanceMax: 350 },
];

export class RationTableService {
  private async extractTextFromImage(imageFile: File): Promise<string> {
    try {
      const imageBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          resolve(base64.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const prompt = `Extract data from this dog food portion table. For each row, create an entry with the weight and portions. Return ONLY a JSON array like this:
[
  {
    "ageMin": null,
    "ageMax": null,
    "weightMin": 5,
    "weightMax": 5,
    "allowanceMin": 90,
    "allowanceMax": 100
  }
]

Important rules:
1. Each weight value should be the same for min and max (if weight is 5, then weightMin = 5 and weightMax = 5)
2. For adult dogs, set ageMin and ageMax to null
3. Low activity portions go in allowanceMin
4. Moderate activity portions go in allowanceMax
5. All numbers must be numeric values (not strings)
6. Return ONLY the JSON array, no other text
7. Do not add any markdown formatting`;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: imageFile.type,
            data: imageBase64
          }
        }
      ]);

      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error);
      throw {
        code: 'EXTRACTION_ERROR',
        message: 'Erreur lors de l\'extraction du texte de l\'image',
        details: error
      };
    }
  }

  private parseGeminiResponse(text: string): RationTableRow[] {
    try {
      // Nettoyer la réponse de tout texte superflu et des backticks markdown
      const cleanText = text.replace(/```json\n|\n```|```/g, '').trim();
      console.log('Clean text after removing markdown:', cleanText);
      
      try {
        const jsonData = JSON.parse(cleanText);
        console.log('Parsed JSON data:', jsonData);

        if (!Array.isArray(jsonData)) {
          console.warn('Parsed data is not an array');
          return [];
        }

        const validRows = jsonData.filter(row => {
          console.log('Validating row:', row);
          const isValid = 
            typeof row.weightMin === 'number' &&
            typeof row.weightMax === 'number' &&
            typeof row.allowanceMin === 'number' &&
            typeof row.allowanceMax === 'number' &&
            row.weightMin > 0 &&
            row.weightMax > 0 &&
            row.allowanceMin > 0 &&
            row.allowanceMax > 0;

          console.log('Row validation result:', isValid);

          // Pour les chiens adultes, ageMin et ageMax doivent être null
          if (row.ageMin === null && row.ageMax === null) {
            return isValid;
          }

          // Pour les chiots, ageMin et ageMax doivent être des nombres positifs
          if (row.ageMin !== null && row.ageMax !== null) {
            const isValidWithAge = isValid &&
              typeof row.ageMin === 'number' &&
              typeof row.ageMax === 'number' &&
              row.ageMin > 0 &&
              row.ageMax > 0;
            console.log('Row validation with age result:', isValidWithAge);
            return isValidWithAge;
          }

          return false; // Invalide si un seul des champs d'âge est null
        });

        console.log('Valid rows:', validRows);
        return validRows;
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse de la réponse:', error);
      return [];
    }
  }

  async extractFromImage(imageFile: File): Promise<OCRResult> {
    if (!imageFile) {
      throw new Error('No image file provided');
    }

    try {
      // Forcer un nouveau traitement à chaque appel
      const timestamp = Date.now();
      console.log(`Starting OCR processing for image at ${timestamp}`);
      
      const extractedText = await this.extractTextFromImage(imageFile);
      console.log('Extracted text:', extractedText);
      
      const tableData = this.parseGeminiResponse(extractedText);
      console.log('Parsed table data:', tableData);

      // Si aucune donnée n'a été extraite, on lance une erreur
      if (tableData.length === 0) {
        throw new Error('NO_DATA_EXTRACTED');
      }

      // Déterminer le type en fonction des données
      const hasPuppyData = tableData.some(row => row.ageMin !== undefined && row.ageMax !== undefined);
      const hasAdultData = tableData.some(row => row.ageMin === undefined && row.ageMax === undefined);
      
      const type = hasPuppyData && hasAdultData ? 'both' : 
                   hasPuppyData ? 'puppy' : 'adult';

      return {
        type,
        portions: tableData.map(row => this.convertRowToPortion(row)),
        rawData: JSON.stringify({
          text: extractedText,
          tableData,
          processedAt: timestamp
        }, null, 2)
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'OCR:', error);
      
      // Si aucune donnée n'a été extraite, on retourne les données de test
      return {
        type: 'adult',
        portions: SAMPLE_DATA
          .filter(row => !row.ageMin)
          .map(row => this.convertRowToPortion(row)),
        rawData: JSON.stringify({
          error: error.message || 'OCR_ERROR',
          fallbackData: true,
          timestamp: Date.now()
        }, null, 2),
        error: {
          code: error.code || 'OCR_ERROR',
          message: error.message || 'Une erreur est survenue lors de la reconnaissance du tableau',
          details: error
        }
      };
    }
  }

  private convertRowToPortion(row: RationTableRow): FoodPortion {
    const portion: FoodPortion = {
      criteria: {
        weight: {
          min: row.weightMin,
          max: row.weightMax
        }
      },
      portions: {
        default: (row.allowanceMin + row.allowanceMax) / 2,
        byActivity: {
          low: row.allowanceMin,
          moderate: row.allowanceMax
        }
      }
    };

    if (row.ageMin !== undefined && row.ageMax !== undefined) {
      portion.criteria.age = {
        min: row.ageMin,
        max: row.ageMax
      };
    }

    return portion;
  }
}

export const rationTableService = new RationTableService(); 