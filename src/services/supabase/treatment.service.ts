import { supabase } from '../../lib/supabase';
import {
  Treatment,
  TreatmentType,
  TreatmentFilters,
  Vaccine,
  Deworming,
  Medication,
  Checkup,
  Surgery,
  Reminder
} from '../../types/medical';

export class SupabaseTreatmentService {
  async getTreatments(filters: TreatmentFilters): Promise<Treatment[]> {
    let query = supabase
      .from('treatments')
      .select('*')
      .order('date', { ascending: false });

    if (filters.petId) {
      query = query.eq('pet_id', filters.petId);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.startDate) {
      query = query.gte('date', new Date(filters.startDate).toISOString().split('T')[0]);
    }

    if (filters.endDate) {
      query = query.lte('date', new Date(filters.endDate).toISOString().split('T')[0]);
    }

    // Pagination
    const from = (filters.page - 1) * filters.limit;
    const to = from + filters.limit - 1;
    
    const { data, error } = await query.range(from, to);

    if (error) {
      console.error('Erreur lors de la récupération des traitements:', error);
      throw new Error(`Erreur lors de la récupération des traitements: ${error.message}`);
    }

    // Convertir les données Supabase en objets Treatment
    return data.map(item => this.mapToTreatment(item));
  }

  async getTreatmentById(id: number): Promise<Treatment> {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du traitement ${id}:`, error);
      throw new Error(`Traitement non trouvé: ${error.message}`);
    }

    return this.mapToTreatment(data);
  }

  async createVaccination(vaccine: Omit<Vaccine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vaccine> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('treatments')
      .insert({
        pet_id: vaccine.petId,
        type: TreatmentType.VACCINATION,
        name: vaccine.name,
        date: new Date(vaccine.date).toISOString().split('T')[0],
        next_due_date: vaccine.nextDueDate ? new Date(vaccine.nextDueDate).toISOString().split('T')[0] : null,
        administered_by: null,
        notes: vaccine.notes || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la vaccination:', error);
      throw new Error(`Erreur lors de la création de la vaccination: ${error.message}`);
    }

    if (vaccine.nextDueDate) {
      await this.createReminder({
        petId: vaccine.petId,
        treatmentId: data.id,
        type: TreatmentType.VACCINATION,
        dueDate: vaccine.nextDueDate,
        status: 'PENDING',
        notified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    }

    return this.mapToTreatment(data) as Vaccine;
  }

  async createDeworming(deworming: Omit<Deworming, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deworming> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('treatments')
      .insert({
        pet_id: deworming.petId,
        type: TreatmentType.DEWORMING,
        name: deworming.name,
        date: new Date(deworming.date).toISOString().split('T')[0],
        next_due_date: deworming.nextDueDate ? new Date(deworming.nextDueDate).toISOString().split('T')[0] : null,
        administered_by: null,
        notes: deworming.notes || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du déparasitage:', error);
      throw new Error(`Erreur lors de la création du déparasitage: ${error.message}`);
    }

    if (deworming.nextDueDate) {
      await this.createReminder({
        petId: deworming.petId,
        treatmentId: data.id,
        type: TreatmentType.DEWORMING,
        dueDate: deworming.nextDueDate,
        status: 'PENDING',
        notified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      } as any);
    }

    return this.mapToTreatment(data) as Deworming;
  }

  async createMedication(medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('treatments')
      .insert({
        pet_id: medication.petId,
        type: TreatmentType.MEDICATION,
        name: medication.name,
        date: new Date(medication.date).toISOString().split('T')[0],
        next_due_date: null,
        administered_by: null,
        notes: medication.notes || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du médicament:', error);
      throw new Error(`Erreur lors de la création du médicament: ${error.message}`);
    }

    return this.mapToTreatment(data) as Medication;
  }

  async createCheckup(checkup: Omit<Checkup, 'id' | 'createdAt' | 'updatedAt'>): Promise<Checkup> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('treatments')
      .insert({
        pet_id: checkup.petId,
        type: TreatmentType.CHECKUP,
        name: checkup.name,
        date: new Date(checkup.date).toISOString().split('T')[0],
        next_due_date: null,
        administered_by: null,
        notes: checkup.notes || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du bilan de santé:', error);
      throw new Error(`Erreur lors de la création du bilan de santé: ${error.message}`);
    }

    return this.mapToTreatment(data) as Checkup;
  }

  async createSurgery(surgery: Omit<Surgery, 'id' | 'createdAt' | 'updatedAt'>): Promise<Surgery> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('treatments')
      .insert({
        pet_id: surgery.petId,
        type: TreatmentType.SURGERY,
        name: surgery.name,
        date: new Date(surgery.date).toISOString().split('T')[0],
        next_due_date: null,
        administered_by: null,
        notes: surgery.notes || null,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la chirurgie:', error);
      throw new Error(`Erreur lors de la création de la chirurgie: ${error.message}`);
    }

    return this.mapToTreatment(data) as Surgery;
  }

  async updateTreatment(id: number, treatment: Partial<Treatment>): Promise<Treatment> {
    const now = new Date().toISOString();
    
    // Préparer les données pour Supabase (conversion des noms de propriétés)
    const updateData: any = {
      updated_at: now
    };
    
    if (treatment.name !== undefined) updateData.name = treatment.name;
    if (treatment.date !== undefined) updateData.date = new Date(treatment.date).toISOString().split('T')[0];
    if (treatment.nextDueDate !== undefined) {
      updateData.next_due_date = treatment.nextDueDate 
        ? new Date(treatment.nextDueDate).toISOString().split('T')[0] 
        : null;
    }
    if (treatment.notes !== undefined) updateData.notes = treatment.notes;

    const { data, error } = await supabase
      .from('treatments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du traitement ${id}:`, error);
      throw new Error(`Erreur lors de la mise à jour du traitement: ${error.message}`);
    }

    return this.mapToTreatment(data);
  }

  async deleteTreatment(id: number): Promise<void> {
    // Supprimer d'abord les rappels associés
    await this.deleteRemindersForTreatment(id);
    
    // Puis supprimer le traitement
    const { error } = await supabase
      .from('treatments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du traitement ${id}:`, error);
      throw new Error(`Erreur lors de la suppression du traitement: ${error.message}`);
    }
  }

  // Gestion des rappels
  private async createReminder(reminder: Omit<Reminder, 'id'>): Promise<Reminder> {
    const { data, error } = await supabase
      .from('reminders')
      .insert({
        pet_id: reminder.petId,
        treatment_id: reminder.treatmentId,
        type: reminder.type,
        due_date: new Date(reminder.dueDate).toISOString().split('T')[0],
        status: reminder.status,
        notified: reminder.notified,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du rappel:', error);
      throw new Error(`Erreur lors de la création du rappel: ${error.message}`);
    }

    return this.mapToReminder(data);
  }

  async getReminders(petId: number, status?: 'PENDING' | 'COMPLETED' | 'CANCELLED'): Promise<Reminder[]> {
    let query = supabase
      .from('reminders')
      .select('*')
      .eq('pet_id', petId)
      .order('due_date');
    
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error(`Erreur lors de la récupération des rappels pour l'animal ${petId}:`, error);
      throw new Error(`Erreur lors de la récupération des rappels: ${error.message}`);
    }

    return data.map(item => this.mapToReminder(item));
  }

  async updateReminderStatus(id: number, status: 'COMPLETED' | 'CANCELLED'): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la mise à jour du statut du rappel ${id}:`, error);
      throw new Error(`Erreur lors de la mise à jour du statut du rappel: ${error.message}`);
    }
  }

  async getUpcomingReminders(days: number = 30): Promise<Reminder[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const todayStr = today.toISOString().split('T')[0];
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('status', 'PENDING')
      .gte('due_date', todayStr)
      .lte('due_date', futureDateStr)
      .order('due_date');

    if (error) {
      console.error('Erreur lors de la récupération des rappels à venir:', error);
      throw new Error(`Erreur lors de la récupération des rappels à venir: ${error.message}`);
    }

    return data.map(item => this.mapToReminder(item));
  }

  private async deleteRemindersForTreatment(treatmentId: number): Promise<void> {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('treatment_id', treatmentId);

    if (error) {
      console.error(`Erreur lors de la suppression des rappels pour le traitement ${treatmentId}:`, error);
      throw new Error(`Erreur lors de la suppression des rappels: ${error.message}`);
    }
  }

  /**
   * Convertit un enregistrement Supabase en objet Treatment
   */
  private mapToTreatment(data: any): Treatment {
    const base = {
      id: data.id,
      petId: data.pet_id,
      type: data.type as TreatmentType,
      name: data.name,
      date: new Date(data.date),
      nextDueDate: data.next_due_date ? new Date(data.next_due_date) : undefined,
      notes: data.notes || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      veterinarianId: data.veterinarian_id || null,
      status: data.status || 'COMPLETED'
    };

    // Retourner le type spécifique en fonction du type de traitement
    switch (data.type) {
      case TreatmentType.VACCINATION:
        return {
          ...base,
          type: TreatmentType.VACCINATION,
          disease: data.disease || data.name
        } as Vaccine;
      case TreatmentType.DEWORMING:
        return {
          ...base,
          type: TreatmentType.DEWORMING,
          product: data.product || data.name,
          weight: data.weight || 0,
          dosage: data.dosage || ''
        } as Deworming;
      case TreatmentType.MEDICATION:
        return {
          ...base,
          type: TreatmentType.MEDICATION,
          product: data.product || data.name,
          dosage: data.dosage || '',
          frequency: data.frequency || 'daily',
          duration: data.duration || 1,
          startDate: new Date(data.date),
          endDate: data.end_date ? new Date(data.end_date) : new Date(data.date)
        } as Medication;
      case TreatmentType.CHECKUP:
        return {
          ...base,
          type: TreatmentType.CHECKUP,
          reason: data.reason || 'Routine checkup',
          weight: data.weight || 0
        } as Checkup;
      case TreatmentType.SURGERY:
        return {
          ...base,
          type: TreatmentType.SURGERY,
          procedure: data.procedure || data.name
        } as Surgery;
      default:
        return base as Treatment;
    }
  }

  /**
   * Convertit un enregistrement Supabase en objet Reminder
   */
  private mapToReminder(data: any): Reminder {
    return {
      id: data.id,
      petId: data.pet_id,
      treatmentId: data.treatment_id,
      type: data.type as TreatmentType,
      dueDate: new Date(data.due_date),
      status: data.status as 'PENDING' | 'COMPLETED' | 'CANCELLED',
      notified: data.notified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
} 