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

## 🏗 Structure des Composants

```
components/
├── Pet/
│   ├── PetCard.tsx
│   ├── PetList.tsx
│   ├── PetForm.tsx
│   ├── PetDetails.tsx
│   └── PetFilters.tsx
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

## 📚 Composants Principaux

### PetCard

```typescript
interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
  variant?: 'compact' | 'detailed';
}

const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete, variant = 'detailed' }) => {
  // Affiche les informations d'un animal dans une carte
}
```

### AppointmentForm

```typescript
interface AppointmentFormProps {
  initialData?: Partial<Appointment>;
  onSubmit: (data: Omit<Appointment, 'id'>) => Promise<void>;
  onCancel?: () => void;
  availableServices: Service[];
  availableStaff: Staff[];
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({ initialData, onSubmit, onCancel, availableServices, availableStaff }) => {
  // Formulaire pour créer/éditer un rendez-vous
}
```

### Calendar

```typescript
interface CalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  view?: 'day' | 'week' | 'month';
}

const Calendar: React.FC<CalendarProps> = ({ appointments, onDateSelect, onAppointmentClick, view = 'week' }) => {
  // Affiche un calendrier avec les rendez-vous
}
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

## 📝 Exemples d'Utilisation

### Gestion des Rendez-vous

```typescript
const AppointmentPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <Calendar
          appointments={appointments}
          onDateSelect={setSelectedDate}
          onAppointmentClick={setSelectedAppointment}
          view="week"
        />
      </div>
      <div className="col-span-4">
        <AppointmentList
          date={selectedDate}
          onAppointmentSelect={setSelectedAppointment}
        />
      </div>
      {selectedAppointment && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedAppointment(null)}
          title="Détails du rendez-vous"
        >
          <AppointmentDetails appointment={selectedAppointment} />
        </Modal>
      )}
    </div>
  );
};
```

### Gestion des Animaux

```typescript
const PetManagement: React.FC = () => {
  const [filters, setFilters] = useState<PetFilters>({
    species: PetSpecies.DOG,
    status: PetStatus.HEALTHY,
    page: 1
  });

  const handleAddPet = async (data: Omit<Pet, 'id'>) => {
    try {
      await petService.createPet(data);
      // Rafraîchir la liste
    } catch (error) {
      // Gérer l'erreur
    }
  };

  return (
    <div>
      <PetFilters
        currentFilters={filters}
        onFilterChange={setFilters}
      />
      <PetList
        filters={filters}
        onFilterChange={setFilters}
      />
      <Button onClick={() => setShowAddForm(true)}>
        Ajouter un animal
      </Button>
      {showAddForm && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddForm(false)}
          title="Ajouter un animal"
        >
          <PetForm
            onSubmit={handleAddPet}
            onCancel={() => setShowAddForm(false)}
          />
        </Modal>
      )}
    </div>
  );
};
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
