import React from 'react';
import { MedicalFollowUp } from './MedicalFollowUp';
import { TreatmentType } from '../../types/medical';

export const MedicalFollowUpTest: React.FC = () => {
  const testTreatments = [
    {
      id: 1,
      petId: 1,
      type: TreatmentType.VACCINATION,
      name: "Vaccination contre la rage",
      date: new Date(),
      nextDueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      notes: "Première vaccination",
      veterinarianId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      disease: "Rage",
      batch: "LOT123456",
      manufacturer: "VetoPharma"
    },
    {
      id: 2,
      petId: 1,
      type: TreatmentType.CHECKUP,
      name: "Consultation de routine",
      date: new Date(),
      notes: "Bilan annuel",
      veterinarianId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      reason: "Bilan annuel",
      diagnosis: "RAS",
      prescription: "Continuer les vermifuges",
      weight: 12.5,
      temperature: 38.5
    },
    {
      id: 3,
      petId: 1,
      type: TreatmentType.MEDICATION,
      name: "Antibiotiques",
      date: new Date(),
      notes: "Traitement infection",
      veterinarianId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      product: "Amoxicilline",
      dosage: "1 comprimé matin et soir",
      frequency: "2 fois par jour",
      duration: 7,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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