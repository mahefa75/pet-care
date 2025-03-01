export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      pets: {
        Row: {
          id: number
          name: string
          species: string
          breed: string | null
          birthdate: string | null
          gender: string | null
          color: string | null
          weight: number | null
          microchip: string | null
          status: string
          notes: string | null
          image_url: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          species: string
          breed?: string | null
          birthdate?: string | null
          gender?: string | null
          color?: string | null
          weight?: number | null
          microchip?: string | null
          status: string
          notes?: string | null
          image_url?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          species?: string
          breed?: string | null
          birthdate?: string | null
          gender?: string | null
          color?: string | null
          weight?: number | null
          microchip?: string | null
          status?: string
          notes?: string | null
          image_url?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: number
          pet_id: number
          date: string
          time: string | null
          type: string
          location: string | null
          notes: string | null
          status: string
          reminder_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          pet_id: number
          date: string
          time?: string | null
          type: string
          location?: string | null
          notes?: string | null
          status: string
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          pet_id?: number
          date?: string
          time?: string | null
          type?: string
          location?: string | null
          notes?: string | null
          status?: string
          reminder_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      treatments: {
        Row: {
          id: number
          pet_id: number
          type: string
          name: string
          date: string
          next_due_date: string | null
          administered_by: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          pet_id: number
          type: string
          name: string
          date: string
          next_due_date?: string | null
          administered_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          pet_id?: number
          type?: string
          name?: string
          date?: string
          next_due_date?: string | null
          administered_by?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      weight_measurements: {
        Row: {
          id: number
          pet_id: number
          date: string
          weight: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          pet_id: number
          date: string
          weight: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          pet_id?: number
          date?: string
          weight?: number
          notes?: string | null
          created_at?: string
        }
      }
      grooming: {
        Row: {
          id: number
          pet_id: number
          date: string
          type: string
          performed_by: string | null
          notes: string | null
          next_appointment: string | null
          created_at: string
        }
        Insert: {
          id?: number
          pet_id: number
          date: string
          type: string
          performed_by?: string | null
          notes?: string | null
          next_appointment?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          pet_id?: number
          date?: string
          type?: string
          performed_by?: string | null
          notes?: string | null
          next_appointment?: string | null
          created_at?: string
        }
      }
      health_events: {
        Row: {
          id: number
          pet_id: number
          date: string
          type: string
          description: string | null
          severity: string
          resolved: boolean
          resolution_date: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: number
          pet_id: number
          date: string
          type: string
          description?: string | null
          severity: string
          resolved: boolean
          resolution_date?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          pet_id?: number
          date?: string
          type?: string
          description?: string | null
          severity?: string
          resolved?: boolean
          resolution_date?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      foods: {
        Row: {
          id: number
          name: string
          type: string
          brand: string | null
          ingredients: string | null
          nutritional_info: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          type: string
          brand?: string | null
          ingredients?: string | null
          nutritional_info?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          type?: string
          brand?: string | null
          ingredients?: string | null
          nutritional_info?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      veterinarians: {
        Row: {
          id: number
          name: string
          speciality: string | null
          clinic: string | null
          phone: string | null
          email: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          speciality?: string | null
          clinic?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          speciality?: string | null
          clinic?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 