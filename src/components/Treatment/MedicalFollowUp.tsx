import React from 'react';
import { Treatment, TreatmentType, Medication, Checkup, Surgery, Deworming, Vaccine } from '../../types/medical';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MedicalFollowUpProps {
  treatment: Treatment;
}

export const MedicalFollowUp: React.FC<MedicalFollowUpProps> = ({ treatment }) => {
  const renderFollowUpDetails = () => {
    switch (treatment.type) {
      case TreatmentType.MEDICATION:
        const medication = treatment as Medication;
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Fréquence :</span> {medication.frequency}
            </p>
            <p>
              <span className="font-medium">Durée :</span> {medication.duration} jours
            </p>
            <p>
              <span className="font-medium">Début :</span>{' '}
              {format(new Date(medication.startDate), 'dd MMMM yyyy', { locale: fr })}
            </p>
            <p>
              <span className="font-medium">Fin :</span>{' '}
              {format(new Date(medication.endDate), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        );

      case TreatmentType.CHECKUP:
        const checkup = treatment as Checkup;
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Poids :</span> {checkup.weight} kg
            </p>
            {checkup.temperature && (
              <p>
                <span className="font-medium">Température :</span> {checkup.temperature}°C
              </p>
            )}
            {checkup.diagnosis && (
              <p>
                <span className="font-medium">Diagnostic :</span> {checkup.diagnosis}
              </p>
            )}
            {checkup.prescription && (
              <p>
                <span className="font-medium">Prescription :</span> {checkup.prescription}
              </p>
            )}
          </div>
        );

      case TreatmentType.SURGERY:
        const surgery = treatment as Surgery;
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Procédure :</span> {surgery.procedure}
            </p>
            {surgery.anesthesia && (
              <p>
                <span className="font-medium">Anesthésie :</span> {surgery.anesthesia}
              </p>
            )}
            {surgery.recovery && (
              <p>
                <span className="font-medium">Suivi post-opératoire :</span> {surgery.recovery}
              </p>
            )}
          </div>
        );

      case TreatmentType.DEWORMING:
        const deworming = treatment as Deworming;
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Produit :</span> {deworming.product}
            </p>
            <p>
              <span className="font-medium">Poids :</span> {deworming.weight} kg
            </p>
            <p>
              <span className="font-medium">Dosage :</span> {deworming.dosage}
            </p>
          </div>
        );

      case TreatmentType.VACCINATION:
        const vaccine = treatment as Vaccine;
        return (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Maladie :</span> {vaccine.disease}
            </p>
            {vaccine.batch && (
              <p>
                <span className="font-medium">N° de lot :</span> {vaccine.batch}
              </p>
            )}
            {vaccine.manufacturer && (
              <p>
                <span className="font-medium">Fabricant :</span> {vaccine.manufacturer}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{treatment.name}</h3>
            <p className="text-sm text-gray-500">
              {format(new Date(treatment.date), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {treatment.type}
          </span>
        </div>

        {renderFollowUpDetails()}

        {treatment.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notes :</span> {treatment.notes}
            </p>
          </div>
        )}

        {treatment.nextDueDate && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-blue-600">
              Prochain rendez-vous : {format(new Date(treatment.nextDueDate), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 