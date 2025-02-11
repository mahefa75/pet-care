export const compressImage = async (dataUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Définir les dimensions maximales
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;

      // Calculer les nouvelles dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      // Créer un canvas pour le redimensionnement
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      // Dessiner l'image redimensionnée
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Impossible de créer le contexte 2D'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir en JPEG avec compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Erreur lors du chargement de l\'image'));
    };

    img.src = dataUrl;
  });
}; 