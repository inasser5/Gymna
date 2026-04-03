export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      day_exercises: {
        Row: {
          created_at: string
          day_id: string
          display_name: string
          exercise_id: string
          id: string
          notes: string | null
          occurrence_index: number
          order_index: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day_id: string
          display_name: string
          exercise_id: string
          id?: string
          notes?: string | null
          occurrence_index?: number
          order_index?: number
          user_id: string
        }
        Update: {
          created_at?: string
          day_id?: string
          display_name?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          occurrence_index?: number
          order_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "training_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sets: {
        Row: {
          created_at: string
          day_exercise_id: string
          id: string
          is_completed: boolean
          reps: number | null
          rpe: number | null
          set_number: number
          user_id: string
          weight: number | null
          weight_unit: string
        }
        Insert: {
          created_at?: string
          day_exercise_id: string
          id?: string
          is_completed?: boolean
          reps?: number | null
          rpe?: number | null
          set_number: number
          user_id: string
          weight?: number | null
          weight_unit?: string
        }
        Update: {
          created_at?: string
          day_exercise_id?: string
          id?: string
          is_completed?: boolean
          reps?: number | null
          rpe?: number | null
          set_number?: number
          user_id?: string
          weight?: number | null
          weight_unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_day_exercise_id_fkey"
            columns: ["day_exercise_id"]
            isOneToOne: false
            referencedRelation: "day_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string
          id: string
          muscle_group: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          equipment?: string
          id?: string
          muscle_group?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          equipment?: string
          id?: string
          muscle_group?: string
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_days: {
        Row: {
          created_at: string
          day_number: number
          id: string
          is_completed: boolean
          is_rest_day: boolean
          name: string
          notes: string | null
          user_id: string
          week_id: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          is_completed?: boolean
          is_rest_day?: boolean
          name?: string
          notes?: string | null
          user_id: string
          week_id: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          is_completed?: boolean
          is_rest_day?: boolean
          name?: string
          notes?: string | null
          user_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_days_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "training_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      training_months: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          month: number
          name: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          month: number
          name: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          month?: number
          name?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_months_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_weeks: {
        Row: {
          created_at: string
          id: string
          is_completed: boolean
          month_id: string
          name: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_completed?: boolean
          month_id: string
          name?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          is_completed?: boolean
          month_id?: string
          name?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_weeks_month_id_fkey"
            columns: ["month_id"]
            isOneToOne: false
            referencedRelation: "training_months"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_weeks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_day_volume: { Args: { p_day_id: string }; Returns: number }
      clone_week_to_week: {
        Args: {
          p_source_week_id: string
          p_target_week_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      get_exercise_max_weight_history: {
        Args: { p_exercise_id: string; p_limit?: number; p_user_id: string }
        Returns: {
          day_id: string
          day_name: string
          logged_at: string
          max_weight: number
        }[]
      }
      get_next_occurrence_index: {
        Args: { p_day_id: string; p_exercise_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends { Update: infer U }
      ? U
      : never
    : never

export const Constants = {
  public: { Enums: {} },
} as const
