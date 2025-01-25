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