# Documentation Technique - Projet PetCare

## 🚀 Vue d'ensemble
PetCare est une application web développée en React avec TypeScript, conçue pour la gestion d'animaux de compagnie. Cette documentation technique fournit toutes les informations nécessaires pour comprendre, installer et maintenir le projet.

## 📋 Table des matières
1. [Architecture Technique](#architecture-technique)
2. [Installation](#installation)
3. [Structure du Projet](#structure-du-projet)
4. [Technologies Utilisées](#technologies-utilisées)
5. [API et Endpoints](#api-et-endpoints)
6. [Gestion d'État](#gestion-détat)
7. [Tests](#tests)
8. [Déploiement](#déploiement)
9. [UX/UI Design](#ux-ui-design)

## 🏗 Architecture Technique

### Frontend
- React 18 avec TypeScript
- Tailwind CSS pour le styling
- React Router pour la navigation
- React Query pour la gestion des données
- Axios pour les requêtes HTTP

### Backend
- Node.js avec Express
- Base de données PostgreSQL
- API RESTful

## 💻 Installation

```bash
# Cloner le projet
git clone [url-du-repo]

# Installer les dépendances
npm install

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
│   ├── Layout/         # Composants de mise en page
│   └── UI/             # Composants d'interface utilisateur
├── pages/              # Pages de l'application
├── hooks/              # Custom hooks React
├── services/           # Services API et utilitaires
├── types/              # Types TypeScript
├── utils/              # Fonctions utilitaires
└── context/            # Contextes React
```

## 🛠 Technologies Utilisées

### Frontend
- React 18.x
- TypeScript 5.x
- Tailwind CSS 3.x
- React Router 6.x
- React Query 4.x
- Axios

### Outils de développement
- ESLint
- Prettier
- Vite
- Jest
- React Testing Library

## 🔌 API et Endpoints

### Animaux
- `GET /api/pets` - Récupérer tous les animaux
- `GET /api/pets/:id` - Récupérer un animal spécifique
- `POST /api/pets` - Ajouter un nouvel animal
- `PUT /api/pets/:id` - Mettre à jour un animal
- `DELETE /api/pets/:id` - Supprimer un animal

### Rendez-vous
- `GET /api/appointments` - Récupérer tous les rendez-vous
- `POST /api/appointments` - Créer un nouveau rendez-vous
- `PUT /api/appointments/:id` - Modifier un rendez-vous
- `DELETE /api/appointments/:id` - Annuler un rendez-vous

### Services
- `GET /api/services` - Liste des services disponibles
- `POST /api/services` - Ajouter un nouveau service
- `PUT /api/services/:id` - Modifier un service
- `DELETE /api/services/:id` - Supprimer un service

## 📊 Gestion d'État

L'application utilise plusieurs approches pour la gestion d'état :
- React Query pour la gestion des données serveur
- Context API pour l'état global de l'application
- useState pour l'état local des composants

### Exemple d'utilisation de React Query :
```typescript
const { data: pets, isLoading } = useQuery('pets', fetchPets);
```

## 🧪 Tests

Le projet utilise Jest et React Testing Library pour les tests.

```bash
# Lancer les tests
npm test

# Lancer les tests avec couverture
npm test -- --coverage
```

## 🚀 Déploiement

Le déploiement peut être effectué sur diverses plateformes :
- Vercel (recommandé)
- Netlify
- AWS
- Heroku

### Étapes de déploiement
1. Build du projet : `npm run build`
2. Test des fichiers de build : `npm run preview`
3. Déploiement selon la plateforme choisie

## 🔐 Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:3000
VITE_API_KEY=votre_clé_api
```

## 📝 Conventions de Code

- Utilisation de ESLint et Prettier
- Nommage des composants en PascalCase
- Nommage des fonctions en camelCase
- Types TypeScript pour toutes les props
- Documentation JSDoc pour les fonctions importantes

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📫 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Ouvrir une issue sur GitHub
3. Contacter l'équipe de développement

## 📅 Maintenance

- Mises à jour régulières des dépendances
- Revue de code systématique
- Tests automatisés
- Monitoring des performances 

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

# Configuration de Google Cloud Vertex AI

Pour utiliser la fonctionnalité d'extraction de tableaux de rations à partir d'images, vous devez configurer Google Cloud Vertex AI :

1. Créer un projet Google Cloud :
   - Allez sur [Google Cloud Console](https://console.cloud.google.com)
   - Créez un nouveau projet ou sélectionnez un projet existant
   - Notez l'ID du projet

2. Activer l'API Vertex AI :
   - Dans la console Google Cloud, accédez à "APIs & Services > Library"
   - Recherchez "Vertex AI API"
   - Cliquez sur "Enable"

3. Créer une clé d'API :
   - Dans la console Google Cloud, accédez à "APIs & Services > Credentials"
   - Cliquez sur "Create Credentials" et sélectionnez "API key"
   - Copiez la clé générée

4. Configuration locale :
   - Copiez le fichier `.env.example` en `.env`
   - Remplacez `your-project-id` par l'ID de votre projet Google Cloud
   - Remplacez `your-api-key` par la clé API générée

5. Sécurité :
   - Dans la console Google Cloud, restreignez la clé API aux seules APIs nécessaires (Vertex AI)
   - Ajoutez des restrictions de domaine si nécessaire
   - N'incluez JAMAIS la clé API dans le contrôle de version

## Fonctionnalités

### Extraction de tableaux de rations

Le service utilise Google Cloud Vertex AI pour extraire automatiquement les données des tableaux de rations à partir d'images. Il peut gérer :

- Tableaux de rations pour chiots (avec âge)
- Tableaux de rations pour adultes
- Formats mixtes

Les données extraites sont automatiquement structurées selon le format :
```typescript
interface RationTableRow {
  ageMin?: number;    // Optionnel, pour les chiots
  ageMax?: number;    // Optionnel, pour les chiots
  weightMin: number;  // Poids minimum
  weightMax: number;  // Poids maximum
  allowanceMin: number; // Ration minimale
  allowanceMax: number; // Ration maximale
}
```

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 