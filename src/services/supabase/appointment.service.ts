import { supabase } from '../../lib/supabase';
import { Appointment, AppointmentStatus, AppointmentFilters } from '../../types/appointment';

export class SupabaseAppointmentService {
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    let query = supabase
      .from('appointments')
      .select('*')
      .order('date');

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.startDate) {
        query = query.gte('date', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('date', filters.endDate.toISOString());
      }

      if (filters.petId) {
        query = query.eq('pet_id', filters.petId);
      }

      if (filters.veterinarianId) {
        query = query.eq('veterinarian_id', filters.veterinarianId);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des rendez-vous:', error);
      throw new Error(`Erreur lors de la récupération des rendez-vous: ${error.message}`);
    }

    return data.map(item => this.mapToAppointment(item));
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Erreur lors de la récupération du rendez-vous avec l'ID ${id}:`, error);
      throw new Error(`Rendez-vous non trouvé: ${error.message}`);
    }

    return this.mapToAppointment(data);
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        pet_id: appointment.petId,
        service_id: appointment.serviceId,
        veterinarian_id: appointment.veterinarianId,
        date: new Date(appointment.date).toISOString(),
        notes: appointment.notes || null,
        status: appointment.status || AppointmentStatus.SCHEDULED,
        created_at: now,
        updated_at: now
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du rendez-vous:', error);
      throw new Error(`Erreur lors de la création du rendez-vous: ${error.message}`);
    }

    return this.mapToAppointment(data);
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (appointmentUpdate.petId !== undefined) updateData.pet_id = appointmentUpdate.petId;
    if (appointmentUpdate.serviceId !== undefined) updateData.service_id = appointmentUpdate.serviceId;
    if (appointmentUpdate.veterinarianId !== undefined) updateData.veterinarian_id = appointmentUpdate.veterinarianId;
    if (appointmentUpdate.date !== undefined) updateData.date = new Date(appointmentUpdate.date).toISOString();
    if (appointmentUpdate.notes !== undefined) updateData.notes = appointmentUpdate.notes;
    if (appointmentUpdate.status !== undefined) updateData.status = appointmentUpdate.status;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Erreur lors de la mise à jour du rendez-vous avec l'ID ${id}:`, error);
      throw new Error(`Erreur lors de la mise à jour du rendez-vous: ${error.message}`);
    }

    return this.mapToAppointment(data);
  }

  async deleteAppointment(id: number): Promise<void> {
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Erreur lors de la suppression du rendez-vous avec l'ID ${id}:`, error);
      throw new Error(`Erreur lors de la suppression du rendez-vous: ${error.message}`);
    }
  }

  async checkAvailability(date: Date, veterinarianId: number): Promise<boolean> {
    const dateStr = new Date(date).toISOString();
    
    const { data, error } = await supabase
      .from('appointments')
      .select('count')
      .eq('veterinarian_id', veterinarianId)
      .eq('date', dateStr)
      .neq('status', AppointmentStatus.CANCELLED);

    if (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error);
      throw new Error(`Erreur lors de la vérification de disponibilité: ${error.message}`);
    }

    // Si count est 0, le créneau est disponible
    return data[0]?.count === 0;
  }

  /**
   * Convertit un enregistrement Supabase en objet Appointment
   */
  private mapToAppointment(data: any): Appointment {
    // Fonction utilitaire pour créer une date sécurisée
    const createSafeDate = (dateStr: string | null): Date => {
      if (!dateStr) return new Date();
      
      try {
        const date = new Date(dateStr);
        // Vérifier si la date est valide
        if (isNaN(date.getTime())) {
          console.warn(`Date invalide détectée: ${dateStr}, utilisation de la date actuelle`);
          return new Date();
        }
        return date;
      } catch (error) {
        console.warn(`Erreur lors de la conversion de la date: ${dateStr}`, error);
        return new Date();
      }
    };

    return {
      id: data.id,
      petId: data.pet_id,
      serviceId: data.service_id,
      veterinarianId: data.veterinarian_id,
      date: createSafeDate(data.date),
      notes: data.notes || undefined,
      status: data.status,
      createdAt: createSafeDate(data.created_at),
      updatedAt: createSafeDate(data.updated_at)
    };
  }
} 