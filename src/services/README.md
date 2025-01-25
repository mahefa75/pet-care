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