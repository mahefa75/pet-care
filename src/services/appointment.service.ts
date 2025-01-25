import { Appointment, AppointmentStatus, AppointmentFilters } from '../types/appointment';
import { db } from '../lib/db';

export class AppointmentService {
  async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    let query = db.appointments.orderBy('date');

    if (filters) {
      if (filters.status) {
        query = query.filter(apt => apt.status === filters.status);
      }

      if (filters.startDate) {
        query = query.filter(apt => new Date(apt.date) >= filters.startDate!);
      }

      if (filters.endDate) {
        query = query.filter(apt => new Date(apt.date) <= filters.endDate!);
      }

      if (filters.petId) {
        query = query.filter(apt => apt.petId === filters.petId);
      }

      if (filters.veterinarianId) {
        query = query.filter(apt => apt.veterinarianId === filters.veterinarianId);
      }
    }

    return query.toArray();
  }

  async getAppointmentById(id: number): Promise<Appointment> {
    const appointment = await db.appointments.get(id);
    if (!appointment) throw new Error('Appointment not found');
    return appointment;
  }

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const now = new Date();
    const id = await db.appointments.add({
      ...appointment,
      status: appointment.status || AppointmentStatus.SCHEDULED,
      createdAt: now,
      updatedAt: now
    } as unknown as Appointment);
    return this.getAppointmentById(id);
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<Appointment>): Promise<Appointment> {
    const exists = await db.appointments.get(id);
    if (!exists) throw new Error('Appointment not found');

    const now = new Date();
    await db.appointments.update(id, {
      ...appointmentUpdate,
      updatedAt: now
    });

    return this.getAppointmentById(id);
  }

  async deleteAppointment(id: number): Promise<void> {
    const exists = await db.appointments.get(id);
    if (!exists) throw new Error('Appointment not found');

    await db.appointments.delete(id);
  }

  async checkAvailability(date: Date, veterinarianId: number): Promise<boolean> {
    const appointments = await db.appointments
      .where('veterinarianId')
      .equals(veterinarianId)
      .filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getTime() === date.getTime() && apt.status !== AppointmentStatus.CANCELLED;
      })
      .count();

    return appointments === 0;
  }
} 