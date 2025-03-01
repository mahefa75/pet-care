# Services API Documentation

## 📡 Vue d'ensemble des Services

Cette documentation détaille les services disponibles pour interagir avec l'API du projet PetCare.

## 📚 Services Disponibles

### PetService

```typescript
import { Pet, PetFilters, PaginatedResponse } from '../types';

class PetService {
  // Récupérer tous les animaux avec pagination et filtres
  async getPets(filters: PetFilters): Promise<PaginatedResponse<Pet>>

  // Récupérer un animal par son ID
  async getPetById(id: number): Promise<Pet>

  // Ajouter un nouvel animal
  async createPet(pet: Omit<Pet, 'id'>): Promise<Pet>

  // Mettre à jour un animal
  async updatePet(id: number, pet: Partial<Pet>): Promise<Pet>

  // Supprimer un animal
  async deletePet(id: number): Promise<void>

  // Récupérer l'historique médical
  async getMedicalHistory(petId: number): Promise<MedicalRecord[]>
}
```

### AppointmentService

```typescript
import { Appointment, AppointmentStatus } from '../types';

class AppointmentService {
  // Récupérer tous les rendez-vous
  async getAppointments(date?: Date): Promise<Appointment[]>

  // Créer un nouveau rendez-vous
  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment>

  // Mettre à jour le statut d'un rendez-vous
  async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment>

  // Annuler un rendez-vous
  async cancelAppointment(id: number, reason?: string): Promise<void>

  // Vérifier la disponibilité
  async checkAvailability(date: Date, serviceId: number): Promise<boolean>
}
```

### ServiceService

```typescript
import { Service, ServiceCategory } from '../types';

class ServiceService {
  // Récupérer tous les services
  async getServices(): Promise<Service[]>

  // Récupérer les services par catégorie
  async getServicesByCategory(category: ServiceCategory): Promise<Service[]>

  // Ajouter un nouveau service
  async createService(service: Omit<Service, 'id'>): Promise<Service>

  // Mettre à jour un service
  async updateService(id: number, service: Partial<Service>): Promise<Service>

  // Supprimer un service
  async deleteService(id: number): Promise<void>
}
```

### StaffService

```typescript
import { Staff, WorkSchedule } from '../types';

class StaffService {
  // Récupérer tout le personnel
  async getAllStaff(): Promise<Staff[]>

  // Récupérer le planning du personnel
  async getStaffSchedule(staffId: number): Promise<WorkSchedule[]>

  // Mettre à jour le planning
  async updateSchedule(staffId: number, schedule: WorkSchedule[]): Promise<void>

  // Vérifier la disponibilité
  async checkAvailability(staffId: number, date: Date): Promise<boolean>
}
```

### PhotoService

```typescript
class PhotoService {
  // Uploader une photo et obtenir son URL en base64
  async uploadPhoto(file: File): Promise<string>

  // Supprimer une photo (à implémenter avec le backend)
  async deletePhoto(url: string): Promise<void>
}
```

### WeightService

```typescript
import { WeightMeasurement } from '../types';

class WeightService {
  // Récupérer l'historique des poids d'un animal
  async getWeightHistory(petId: number): Promise<WeightMeasurement[]>

  // Ajouter une nouvelle mesure de poids
  async addWeightMeasurement(measurement: Omit<WeightMeasurement, 'id'>): Promise<number>

  // Récupérer le dernier poids enregistré
  async getLatestWeight(petId: number): Promise<WeightMeasurement | undefined>
}
```

### TreatmentService

```typescript
import { Treatment, Surgery, Reminder } from '../types';

class TreatmentService {
  // Créer une nouvelle chirurgie
  async createSurgery(surgery: Omit<Surgery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Surgery>

  // Mettre à jour un traitement
  async updateTreatment(id: number, treatment: Partial<Treatment>): Promise<Treatment>

  // Supprimer un traitement et ses rappels associés
  async deleteTreatment(id: number): Promise<void>

  // Gestion des rappels (méthode privée)
  private async createReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder>
}
```

## 🔐 Gestion des Erreurs

Tous les services utilisent un gestionnaire d'erreurs standardisé :

```typescript
class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}
```

## 📝 Exemples d'Utilisation

### Utilisation de PetService

```typescript
// Récupérer les animaux avec filtres
const filters: PetFilters = {
  species: PetSpecies.DOG,
  status: PetStatus.HEALTHY,
  page: 1,
  limit: 10
};

const pets = await petService.getPets(filters);

// Ajouter un nouvel animal
const newPet = await petService.createPet({
  name: "Max",
  species: PetSpecies.DOG,
  breed: "Labrador",
  age: 3,
  weight: 25,
  owner: existingOwner,
  // ... autres propriétés
});
```

### Utilisation de AppointmentService

```typescript
// Créer un rendez-vous
const appointment = await appointmentService.createAppointment({
  pet: existingPet,
  service: selectedService,
  date: new Date('2024-03-20T10:00:00'),
  veterinarian: selectedVet
});

// Vérifier la disponibilité
const isAvailable = await appointmentService.checkAvailability(
  new Date('2024-03-20T10:00:00'),
  serviceId
);
```

### Utilisation de PhotoService

```typescript
// Upload d'une photo
const file = event.target.files[0];
const photoUrl = await photoService.uploadPhoto(file);

// Utilisation avec un composant
const PetPhotoUpload: React.FC<PetPhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange
}) => {
  // ... voir le composant pour l'implémentation
};
```

## 🔄 Intercepteurs

Les services utilisent des intercepteurs Axios pour :
- Ajouter automatiquement le token d'authentification
- Gérer le rafraîchissement des tokens
- Logger les erreurs
- Formater les réponses

## 🏗 Configuration

Les services sont configurés via des variables d'environnement :

```env
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=5000
VITE_API_VERSION=v1
```

## 📦 Dépendances

- axios: ^1.6.0
- @tanstack/react-query: ^4.0.0
- date-fns: ^2.30.0 

# Documentation des Composants React

## 📦 Vue d'ensemble des Composants

Cette documentation détaille les composants React disponibles dans le projet PetCare.

## 🏗 Structure des Composants Mise à Jour

```
components/
├── Pet/
│   ├── PetCard.tsx
│   ├── PetList.tsx
│   ├── PetForm.tsx
│   ├── PetDetails.tsx
│   ├── PetFilters.tsx
│   ├── PetPhotoUpload.tsx
│   ├── PetMedicalDetails.tsx
│   ├── AddWeightForm.tsx
│   └── WeightChart.tsx
├── Weight/
│   └── WeightList.tsx
├── Treatment/
│   ├── TreatmentHistory.tsx
│   ├── UpcomingReminders.tsx
│   ├── MedicalFollowUp.tsx
│   ├── MedicalFollowUpTest.tsx
│   └── AddTreatmentForm.tsx
├── Appointment/
│   ├── AppointmentCard.tsx
│   ├── AppointmentList.tsx
│   ├── AppointmentForm.tsx
│   └── Calendar.tsx
├── Service/
│   ├── ServiceCard.tsx
│   ├── ServiceList.tsx
│   └── ServicePricing.tsx
├── Staff/
│   ├── StaffCard.tsx
│   ├── StaffList.tsx
│   └── Schedule.tsx
├── Layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── MainLayout.tsx
└── UI/
    ├── Button.tsx
    ├── Input.tsx
    ├── Select.tsx
    ├── Modal.tsx
    └── Loading.tsx
```

## 📚 Nouveaux Composants

### PetPhotoUpload

```typescript
interface PetPhotoUploadProps {
  currentPhotoUrl?: string;
  onPhotoChange: (photoUrl: string) => void;
  onError?: (error: Error) => void;
}

const PetPhotoUpload: React.FC<PetPhotoUploadProps> = ({
  currentPhotoUrl,
  onPhotoChange,
  onError
}) => {
  // Composant pour l'upload et la gestion des photos d'animaux
}
```

### WeightChart

```typescript
interface WeightChartProps {
  petId: number;
  measurements: WeightMeasurement[];
  period?: 'week' | 'month' | 'year';
  onPeriodChange?: (period: string) => void;
}

const WeightChart: React.FC<WeightChartProps> = ({
  petId,
  measurements,
  period = 'month',
  onPeriodChange
}) => {
  // Graphique d'évolution du poids
}
```

### MedicalFollowUp

```typescript
interface MedicalFollowUpProps {
  petId: number;
  treatments: Treatment[];
  onTreatmentComplete: (treatmentId: number) => void;
}

const MedicalFollowUp: React.FC<MedicalFollowUpProps> = ({
  petId,
  treatments,
  onTreatmentComplete
}) => {
  // Suivi médical complet
}
```

### UpcomingReminders

```typescript
interface UpcomingRemindersProps {
  reminders: Reminder[];
  onReminderComplete: (reminderId: number) => void;
  onReminderDismiss: (reminderId: number) => void;
}

const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({
  reminders,
  onReminderComplete,
  onReminderDismiss
}) => {
  // Liste des rappels à venir
}
```

## 📱 Pages Principales

### DashboardPage

```typescript
const DashboardPage: React.FC = () => {
  // Page principale avec vue d'ensemble
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <UpcomingReminders />
        <TreatmentHistory />
      </div>
      <div className="col-span-4">
        <PetList />
        <WeightChart />
      </div>
    </div>
  );
};
```

### PetDetailsPage

```typescript
interface PetDetailsPageProps {
  petId: number;
}

const PetDetailsPage: React.FC<PetDetailsPageProps> = ({ petId }) => {
  // Page de détails d'un animal
  return (
    <div className="space-y-6">
      <PetPhotoUpload />
      <PetMedicalDetails />
      <WeightChart />
      <MedicalFollowUp />
      <TreatmentHistory />
    </div>
  );
};
```

## 🎨 Composants UI

### Button

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', isLoading, children, ...props }) => {
  // Bouton réutilisable avec différents styles
}
```

### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, size = 'md', children }) => {
  // Modal réutilisable
}
```

## 🎯 Bonnes Pratiques

1. **Performance**
   - Utilisation de `React.memo()` pour les composants purement présentationnels
   - Optimisation des re-rendus avec `useMemo` et `useCallback`
   - Lazy loading des composants lourds

2. **Accessibilité**
   - Utilisation appropriée des attributs ARIA
   - Support du clavier
   - Contraste des couleurs conforme aux normes WCAG

3. **Tests**
   - Tests unitaires avec Jest et React Testing Library
   - Tests d'intégration pour les workflows complexes
   - Tests de snapshot pour les composants UI

## 🔧 Configuration des Tests

```typescript
// Exemple de test pour PetCard
import { render, screen, fireEvent } from '@testing-library/react';
import { PetCard } from './PetCard';

describe('PetCard', () => {
  it('renders pet information correctly', () => {
    const pet = {
      id: 1,
      name: 'Max',
      species: PetSpecies.DOG,
      breed: 'Labrador',
      // ... autres propriétés
    };

    render(<PetCard pet={pet} />);
    
    expect(screen.getByText(pet.name)).toBeInTheDocument();
    expect(screen.getByText(pet.breed)).toBeInTheDocument();
  });
});
```

## 📦 Dépendances des Composants

- @headlessui/react: ^1.7.0 (pour les composants accessibles)
- @heroicons/react: ^2.0.0 (pour les icônes)
- react-hook-form: ^7.0.0 (pour les formulaires)
- tailwindcss: ^3.0.0 (pour le styling)
- framer-motion: ^10.0.0 (pour les animations)
- @fullcalendar/react: ^6.0.0 (pour le calendrier) 

## 📦 Types Principaux

```typescript
// Types pour les mesures de poids
interface WeightMeasurement {
  id: number;
  petId: number;
  weight: number; // Arrondi à 3 décimales
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
