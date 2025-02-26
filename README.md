# Documentation Technique - Projet PetCare

## 🚀 Vue d'ensemble
PetCare est une application web développée en React avec TypeScript, conçue pour la gestion d'animaux de compagnie. Cette documentation technique fournit toutes les informations nécessaires pour comprendre, installer et maintenir le projet.

## 📋 Table des matières
1. [Architecture Technique](#architecture-technique)
2. [Installation](#installation)
3. [Structure du Projet](#structure-du-projet)
4. [Technologies Utilisées](#technologies-utilisées)
5. [Services](#services)
6. [Composants](#composants)
7. [API et Endpoints](#api-et-endpoints)
8. [Gestion d'État](#gestion-détat)
9. [Tests](#tests)
10. [Déploiement](#déploiement)
11. [UX/UI Design](#ux-ui-design)

## 🏗 Architecture Technique

### Frontend
- React 18 avec TypeScript
- Tailwind CSS pour le styling
- React Router pour la navigation
- React Query pour la gestion des données
- Axios pour les requêtes HTTP
- Supabase comme backend
- Firebase pour certaines fonctionnalités

### Backend
- Supabase
- PostgreSQL
- API RESTful

### Optimisation des Performances
- Splitting des chunks optimisé via Vite/Rollup
- Séparation des vendors en chunks distincts :
  - Material-UI (`vendor-mui`)
  - Chart.js et dépendances (`vendor-charts`)
  - Heroicons (`vendor-icons`)
- Limite de taille des chunks augmentée à 1000kB
- Lazy loading des composants lourds

## 💻 Installation

```bash
# Cloner le projet
git clone [url-du-repo]

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env

# Lancer en développement
npm run dev

# Build pour la production
npm run build
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants React réutilisables
│   ├── Pet/            # Composants liés aux animaux
│   ├── Weight/         # Composants de gestion du poids
│   ├── Treatment/      # Composants de traitements médicaux
│   ├── Appointment/    # Composants de rendez-vous
│   ├── Service/        # Composants de services
│   ├── Staff/          # Composants du personnel
│   ├── Layout/         # Composants de mise en page
│   └── UI/             # Composants d'interface utilisateur
├── pages/              # Pages de l'application
├── services/           # Services API et utilitaires
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
├── stores/             # Gestion d'état (Zustand)
├── lib/               # Bibliothèques/configurations
└── firebase/          # Configuration Firebase
```

## 🛠 Technologies Utilisées

### Frontend
- React 18.x
- TypeScript 5.x
- Tailwind CSS 3.x
- Material-UI (MUI) 6.x
- React Router 7.x
- Zustand 5.x pour la gestion d'état
- Chart.js et react-chartjs-2
- Tesseract.js pour l'OCR
- Firebase 11.x

### Outils de développement
- Vite 5.x
- ESLint 9.x
- TypeScript 5.x
- Jest
- React Testing Library

## 📚 Services

### PetService
- Gestion CRUD des animaux
- Historique médical
- Filtrage et pagination

### AppointmentService
- Gestion des rendez-vous
- Vérification des disponibilités
- Mise à jour des statuts

### ServiceService
- Gestion des services par catégorie
- CRUD des services

### StaffService
- Gestion du personnel
- Planning et disponibilités

### PhotoService
- Upload et gestion des photos
- Support base64

### WeightService
- Suivi du poids des animaux
- Historique des mesures

### TreatmentService
- Gestion des traitements et chirurgies
- Système de rappels

## 🎨 Composants

### Composants Pet
- `PetCard` - Affichage des informations d'un animal
- `PetList` - Liste des animaux avec filtres
- `PetForm` - Formulaire d'ajout/modification
- `PetDetails` - Détails complets d'un animal
- `PetPhotoUpload` - Gestion des photos
- `WeightChart` - Graphique d'évolution du poids

### Composants Treatment
- `TreatmentHistory` - Historique des traitements
- `UpcomingReminders` - Rappels à venir
- `MedicalFollowUp` - Suivi médical
- `AddTreatmentForm` - Ajout de traitement

### Composants UI
- Boutons personnalisés
- Inputs stylisés
- Modals accessibles
- Composants de loading

## 🔌 API et Endpoints

### Animaux (PetService)
- `GET /api/pets` - Récupérer tous les animaux avec filtres et pagination
- `GET /api/pets/:id` - Récupérer un animal spécifique
- `POST /api/pets` - Ajouter un nouvel animal
- `PUT /api/pets/:id` - Mettre à jour un animal
- `DELETE /api/pets/:id` - Supprimer un animal
- `GET /api/pets/:id/medical-history` - Historique médical

### Rendez-vous (AppointmentService)
- `GET /api/appointments` - Récupérer tous les rendez-vous
- `POST /api/appointments` - Créer un nouveau rendez-vous
- `PUT /api/appointments/:id/status` - Modifier le statut
- `DELETE /api/appointments/:id` - Annuler un rendez-vous
- `GET /api/appointments/availability` - Vérifier les disponibilités

### Traitements (TreatmentService)
- `GET /api/treatments` - Liste des traitements
- `POST /api/treatments` - Ajouter un traitement
- `POST /api/treatments/surgery` - Enregistrer une chirurgie
- `GET /api/treatments/reminders` - Obtenir les rappels

### Poids (WeightService)
- `GET /api/weights/:petId` - Historique des poids
- `POST /api/weights` - Ajouter une mesure
- `GET /api/weights/:petId/latest` - Dernier poids enregistré

## 📊 Gestion d'État

L'application utilise plusieurs approches pour la gestion d'état :
- Zustand pour l'état global de l'application
- React Query pour la gestion du cache et des requêtes
- useState pour l'état local des composants

### Exemple d'utilisation de Zustand :
```typescript
const useStore = create((set) => ({
  pets: [],
  setPets: (pets) => set({ pets }),
  addPet: (pet) => set((state) => ({ pets: [...state.pets, pet] }))
}));
```

## 🧪 Tests

Le projet utilise Jest et React Testing Library pour les tests.

```bash
# Lancer les tests
npm test

# Lancer les tests avec couverture
npm test -- --coverage
```

### Exemple de test de composant :
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PetCard } from './PetCard';

describe('PetCard', () => {
  it('renders pet information correctly', () => {
    const pet = {
      id: 1,
      name: 'Max',
      species: PetSpecies.DOG,
      breed: 'Labrador'
    };

    render(<PetCard pet={pet} />);
    expect(screen.getByText(pet.name)).toBeInTheDocument();
  });
});
```

## 🚀 Déploiement

Le déploiement peut être effectué sur diverses plateformes :
- Vercel (recommandé)
- Netlify
- AWS
- Heroku

### Configuration de Build
Le projet utilise Vite avec une configuration optimisée pour la production :
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-mui': ['@mui/material', '@mui/icons-material'],
          'vendor-charts': ['chart.js', 'react-chartjs-2', 'chartjs-adapter-date-fns'],
          'vendor-icons': ['@heroicons/react/24/outline']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
```

## 🔐 Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_anon_supabase
VITE_FIREBASE_CONFIG=votre_config_firebase
VITE_API_URL=http://localhost:3000
```

## 📝 Types Principaux

```typescript
// Types pour les mesures de poids
interface WeightMeasurement {
  id: number;
  petId: number;
  weight: number;
  date: Date;
}

// Types pour les traitements
interface Treatment {
  id: number;
  petId: number;
  type: TreatmentType;
  startDate: Date;
  endDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Surgery extends Treatment {
  procedure: string;
  surgeon: Staff;
  preOpNotes?: string;
  postOpNotes?: string;
}

interface Reminder {
  id: number;
  treatmentId: number;
  date: Date;
  message: string;
  isCompleted: boolean;
}
```

## 🎨 Directives UX/UI

### Principes de Design

1. **Moderne et Minimaliste**
   - Utilisation d'espaces blancs généreux
   - Design épuré et aéré
   - Typographie moderne et lisible (Inter pour le texte, Poppins pour les titres)
   - Animations subtiles et fluides

2. **Palette de Couleurs**
   ```css
   :root {
     /* Couleurs principales */
     --primary: #4F46E5;     /* Indigo vif pour les actions principales */
     --secondary: #10B981;   /* Vert émeraude pour les succès/validations */
     --accent: #F59E0B;      /* Orange chaleureux pour les accents */
     
     /* Tons neutres */
     --background: #F9FAFB;  /* Fond très clair */
     --surface: #FFFFFF;     /* Surface des cartes */
     --text: #111827;       /* Texte principal */
     --text-light: #6B7280; /* Texte secondaire */
     
     /* États */
     --error: #EF4444;      /* Rouge pour les erreurs */
     --warning: #F59E0B;    /* Orange pour les alertes */
     --success: #10B981;    /* Vert pour les succès */
   }
   ```

3. **Hiérarchie Visuelle**
   - Titres clairs et bien espacés
   - Information organisée par ordre d'importance
   - Utilisation de cartes pour grouper les informations connexes
   - Navigation intuitive avec fil d'Ariane

4. **Composants Interactifs**
   - Boutons avec états hover/focus/active clairement visibles
   - Feedback immédiat sur les actions utilisateur
   - Tooltips informatifs
   - Animations de transition douces

### Expérience Utilisateur

1. **Navigation Intuitive**
   - Menu principal toujours accessible
   - Recherche globale rapide
   - Filtres contextuels faciles à utiliser
   - Breadcrumbs pour la navigation

2. **Responsive Design**
   - Layout fluide s'adaptant à toutes les tailles d'écran
   - Navigation mobile optimisée
   - Touch-friendly sur appareils tactiles
   - Contenu réorganisé intelligemment selon l'espace disponible

3. **Feedback et États**
   ```typescript
   // Exemple de composant avec feedback
   const ActionButton: React.FC<ActionButtonProps> = ({ 
     onClick, 
     children,
     loading 
   }) => (
     <button
       className={`
         px-4 py-2 rounded-lg
         transition-all duration-200
         ${loading ? 'bg-gray-300' : 'bg-primary hover:bg-primary-dark'}
         transform hover:scale-105
         active:scale-95
       `}
       onClick={onClick}
       disabled={loading}
     >
       {loading ? <Spinner /> : children}
     </button>
   );
   ```

4. **Accessibilité**
   - Contraste des couleurs WCAG AA+
   - Support complet du clavier
   - Attributs ARIA appropriés
   - Messages d'erreur clairs et descriptifs

### Patterns d'Interface

1. **Formulaires**
   - Labels clairs et concis
   - Validation en temps réel
   - Messages d'erreur contextuels
   - Progression par étapes pour les formulaires longs
   ```typescript
   const FormField: React.FC<FormFieldProps> = ({
     label,
     error,
     children
   }) => (
     <div className="form-field">
       <label className="text-sm font-medium text-gray-700">{label}</label>
       {children}
       {error && (
         <p className="text-error text-sm mt-1">{error}</p>
       )}
     </div>
   );
   ```

2. **Listes et Grilles**
   - Pagination claire
   - Tri intuitif
   - Filtres faciles à utiliser
   - Vue liste/grille switchable

3. **Modales et Popovers**
   - Fermeture facile (click extérieur, touche ESC)
   - Animation d'entrée/sortie fluide
   - Focus trap pour l'accessibilité
   - Overlay avec flou d'arrière-plan

4. **États de Chargement**
   - Skeletons pour le chargement initial
   - Spinners pour les actions courtes
   - Indicateurs de progression pour les uploads
   - Messages de statut clairs

### Bonnes Pratiques

1. **Performance Visuelle**
   - Lazy loading des images
   - Optimisation des assets
   - Animations performantes
   - Debounce sur les actions fréquentes

2. **Cohérence**
   - Système de design unifié
   - Composants réutilisables
   - Patterns d'interaction cohérents
   - Terminologie consistante

3. **Mobile First**
   - Design pensé d'abord pour mobile
   - Adaptation progressive aux grands écrans
   - Touch targets appropriés
   - Gestes mobiles naturels

4. **Tests UX**
   - Tests utilisateurs réguliers
   - Heatmaps et analytics
   - A/B testing sur les nouvelles fonctionnalités
   - Feedback utilisateur intégré

## 📫 Support et Contribution

Pour toute question ou problème :
1. Consulter la documentation
2. Ouvrir une issue sur GitHub
3. Contacter l'équipe de développement

### Contribution
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📅 Maintenance

- Mises à jour régulières des dépendances
- Revue de code systématique
- Tests automatisés
- Monitoring des performances 