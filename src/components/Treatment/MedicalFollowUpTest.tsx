import React from 'react';
import { MedicalFollowUp } from './MedicalFollowUp';
import { TreatmentType, TreatmentStatus } from '../../types/medical';

export const MedicalFollowUpTest: React.FC = () => {
  const testTreatments = [
    {
      id: 1,
      petId: 1,
      type: TreatmentType.VACCINATION,
      name: "PrimoVaccin",
      date: new Date(),
      nextDueDate: new Date("2025-02-15"),
      notes: "Première vaccination",
      veterinarianId: 1,
      disease: "Rage",
      batch: "LOT123",
      manufacturer: "VetoPharma",
      status: TreatmentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 2,
      petId: 1,
      type: TreatmentType.DEWORMING,
      name: "Ody kankana",
      date: new Date(),
      nextDueDate: new Date("2025-02-13"),
      notes: "Vermifuge trimestriel",
      veterinarianId: 1,
      product: "Milbemax",
      weight: 4.5,
      dosage: "1 comprimé",
      status: TreatmentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 3,
      petId: 1,
      type: TreatmentType.CHECKUP,
      name: "Visite de contrôle",
      date: new Date(),
      nextDueDate: new Date("2024-03-15"),
      notes: "Contrôle annuel",
      veterinarianId: 1,
      reason: "Contrôle annuel",
      diagnosis: "RAS",
      prescription: "Aucune",
      weight: 4.5,
      temperature: 38.5,
      status: TreatmentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 4,
      petId: 1,
      type: TreatmentType.MEDICATION,
      name: "Antibiotiques",
      date: new Date(),
      nextDueDate: new Date("2024-02-20"),
      notes: "Traitement infection",
      veterinarianId: 1,
      product: "Amoxicilline",
      dosage: "1cp 2x/jour",
      frequency: "12h",
      duration: 10,
      startDate: new Date(),
      endDate: new Date("2024-02-20"),
      status: TreatmentStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Test du suivi médical</h2>
      {testTreatments.map(treatment => (
        <MedicalFollowUp key={treatment.id} treatment={treatment} />
      ))}
    </div>
  );
}; 