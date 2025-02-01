export class PhotoService {
  private baseUrl = import.meta.env.VITE_API_URL;

  async uploadPhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        // Le résultat est déjà en base64
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur lors de la conversion de l\'image'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erreur lors de la lecture du fichier'));
      };

      reader.readAsDataURL(file);
    });
  }

  async deletePhoto(url: string): Promise<void> {
    // Pour l'instant, on ne fait rien car les photos sont en base64
    return Promise.resolve();
  }
} 