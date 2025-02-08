import { FoodPortion } from '../types/food';

interface OCRResult {
  portions: FoodPortion[];
  type: 'puppy' | 'adult' | 'both';
  rawData?: string;
}

interface RationTableRow {
  ageMin?: number;
  ageMax?: number;
  weightMin: number;
  weightMax: number;
  allowanceMin: number;
  allowanceMax: number;
}

interface VertexAIResponse {
  text: string;
  layout: {
    textAnchor: {
      content: string;
    };
    boundingPoly: {
      vertices: Array<{
        x: number;
        y: number;
      }>;
    };
    confidence: number;
  }[];
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
  private readonly VERTEX_API_ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us-central1/publishers/google/models/imagetext:predict`;
  private readonly API_KEY = process.env.GOOGLE_CLOUD_API_KEY;

  constructor() {
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_API_KEY) {
      console.warn('Google Cloud credentials not found in environment variables. OCR functionality will be limited to sample data.');
    }
  }

  private async callVertexAI(imageBase64: string): Promise<VertexAIResponse> {
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || !process.env.GOOGLE_CLOUD_API_KEY) {
      // Retourner des données de test si les credentials ne sont pas configurés
      return this.getMockResponse();
    }

    const response = await fetch(this.VERTEX_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.API_KEY}`
      },
      body: JSON.stringify({
        instances: [{
          image: {
            bytesBase64Encoded: imageBase64.split(',')[1]
          }
        }],
        parameters: {
          confidenceThreshold: 0.5,
          maxPredictions: 1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Vertex AI API error: ${response.statusText}`);
    }

    return response.json();
  }

  private parseTableData(vertexResponse: VertexAIResponse): RationTableRow[] {
    // Analyser la disposition des éléments pour détecter la structure du tableau
    const elements = vertexResponse.layout
      .sort((a, b) => {
        const aY = a.boundingPoly.vertices[0].y;
        const bY = b.boundingPoly.vertices[0].y;
        if (Math.abs(aY - bY) < 10) { // même ligne
          return a.boundingPoly.vertices[0].x - b.boundingPoly.vertices[0].x;
        }
        return aY - bY;
      });

    // Regrouper les éléments par ligne
    const rows: RationTableRow[] = [];
    let currentRow: string[] = [];
    let lastY = 0;

    elements.forEach(element => {
      const y = element.boundingPoly.vertices[0].y;
      if (Math.abs(y - lastY) > 10 && currentRow.length > 0) {
        // Nouvelle ligne détectée
        this.processRow(currentRow, rows);
        currentRow = [];
      }
      currentRow.push(element.textAnchor.content);
      lastY = y;
    });

    // Traiter la dernière ligne
    if (currentRow.length > 0) {
      this.processRow(currentRow, rows);
    }

    return rows;
  }

  private processRow(cells: string[], rows: RationTableRow[]) {
    // Détecter si c'est une ligne d'en-tête
    if (cells.some(cell => cell.toLowerCase().includes('age') || 
                         cell.toLowerCase().includes('poids') || 
                         cell.toLowerCase().includes('ration'))) {
      return;
    }

    // Extraire les valeurs numériques
    const numbers = cells.map(cell => {
      const matches = cell.match(/\d+(?:\.\d+)?/g);
      return matches ? matches.map(Number) : null;
    });

    // Détecter si c'est une ligne pour chiot (avec âge) ou adulte
    const hasAge = numbers[0]?.length === 1 || numbers[0]?.length === 2;

    const row: RationTableRow = {
      weightMin: 0,
      weightMax: 0,
      allowanceMin: 0,
      allowanceMax: 0
    };

    if (hasAge) {
      row.ageMin = numbers[0]?.[0] || 0;
      row.ageMax = numbers[0]?.[1] || row.ageMin;
      row.weightMin = numbers[1]?.[0] || 0;
      row.weightMax = numbers[1]?.[1] || 0;
      row.allowanceMin = numbers[2]?.[0] || 0;
      row.allowanceMax = numbers[2]?.[1] || row.allowanceMin;
    } else {
      row.weightMin = numbers[0]?.[0] || 0;
      row.weightMax = numbers[0]?.[1] || 0;
      row.allowanceMin = numbers[1]?.[0] || 0;
      row.allowanceMax = numbers[1]?.[1] || row.allowanceMin;
    }

    if (row.weightMin > 0 && row.allowanceMin > 0) {
      rows.push(row);
    }
  }

  private getMockResponse(): VertexAIResponse {
    // Simuler une réponse Vertex AI avec les données de test
    return {
      text: "Tableau de rations",
      layout: SAMPLE_DATA.map((row, index) => ({
        textAnchor: {
          content: Object.values(row).join(" ")
        },
        boundingPoly: {
          vertices: [
            { x: 0, y: index * 20 },
            { x: 100, y: index * 20 },
            { x: 100, y: (index + 1) * 20 },
            { x: 0, y: (index + 1) * 20 }
          ]
        },
        confidence: 0.95
      }))
    };
  }

  async extractFromImage(imageFile: File): Promise<OCRResult> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const imageBase64 = reader.result as string;
          const vertexResponse = await this.callVertexAI(imageBase64);
          const tableData = this.parseTableData(vertexResponse);

          const portions: FoodPortion[] = tableData.map(row => ({
            criteria: {
              weight: {
                min: row.weightMin,
                max: row.weightMax
              },
              ...(row.ageMin !== undefined && {
                age: {
                  min: row.ageMin,
                  max: row.ageMax || row.ageMin
                }
              })
            },
            portions: {
              default: (row.allowanceMin + row.allowanceMax) / 2,
              byActivity: row.ageMin === undefined ? {
                low: row.allowanceMin,
                moderate: row.allowanceMax
              } : undefined
            }
          }));

          const type = portions.some(p => p.criteria.age) ? 
            (portions.some(p => !p.criteria.age) ? 'both' : 'puppy') : 
            'adult';

          resolve({
            type,
            portions,
            rawData: JSON.stringify(tableData, null, 2)
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsDataURL(imageFile);
    });
  }
}

export const rationTableService = new RationTableService(); 