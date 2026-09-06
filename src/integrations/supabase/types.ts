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
      ethan_activities: {
        Row: {
          contact_id: string | null
          content: string
          created_at: string
          deal_id: string | null
          id: string
          kind: string
          occurred_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          content: string
          created_at?: string
          deal_id?: string | null
          id?: string
          kind?: string
          occurred_at?: string
          user_id?: string
        }
        Update: {
          contact_id?: string | null
          content?: string
          created_at?: string
          deal_id?: string | null
          id?: string
          kind?: string
          occurred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ethan_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethan_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "ethan_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_appointments: {
        Row: {
          contact_id: string | null
          created_at: string
          deal_id: string | null
          duration_min: number
          id: string
          kind: string
          location: string | null
          notes: string | null
          starts_at: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          duration_min?: number
          id?: string
          kind?: string
          location?: string | null
          notes?: string | null
          starts_at: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          duration_min?: number
          id?: string
          kind?: string
          location?: string | null
          notes?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ethan_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethan_appointments_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "ethan_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_archetype_scores: {
        Row: {
          created_at: string
          id: string
          note: string | null
          score: number
          trait: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          score?: number
          trait: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          score?: number
          trait?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_contacts: {
        Row: {
          company: string | null
          contact_type: string
          created_at: string
          email: string | null
          first_name: string
          follow_up_on: string | null
          id: string
          last_contact_at: string | null
          last_name: string
          linkedin: string | null
          next_action: string | null
          notes: string | null
          phone: string | null
          priority: string
          role_title: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          first_name?: string
          follow_up_on?: string | null
          id?: string
          last_contact_at?: string | null
          last_name?: string
          linkedin?: string | null
          next_action?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string
          role_title?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          company?: string | null
          contact_type?: string
          created_at?: string
          email?: string | null
          first_name?: string
          follow_up_on?: string | null
          id?: string
          last_contact_at?: string | null
          last_name?: string
          linkedin?: string | null
          next_action?: string | null
          notes?: string | null
          phone?: string | null
          priority?: string
          role_title?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_deals: {
        Row: {
          budget_eur: number | null
          client_name: string | null
          commission_eur: number | null
          contact_id: string | null
          created_at: string
          developer: string | null
          due_on: string | null
          id: string
          last_action: string | null
          location: string | null
          need: string | null
          next_action: string | null
          notes: string | null
          operation_type: string | null
          probability: number
          program: string | null
          stage: string
          stakeholders: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_eur?: number | null
          client_name?: string | null
          commission_eur?: number | null
          contact_id?: string | null
          created_at?: string
          developer?: string | null
          due_on?: string | null
          id?: string
          last_action?: string | null
          location?: string | null
          need?: string | null
          next_action?: string | null
          notes?: string | null
          operation_type?: string | null
          probability?: number
          program?: string | null
          stage?: string
          stakeholders?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          budget_eur?: number | null
          client_name?: string | null
          commission_eur?: number | null
          contact_id?: string | null
          created_at?: string
          developer?: string | null
          due_on?: string | null
          id?: string
          last_action?: string | null
          location?: string | null
          need?: string | null
          next_action?: string | null
          notes?: string | null
          operation_type?: string | null
          probability?: number
          program?: string | null
          stage?: string
          stakeholders?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ethan_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_goals: {
        Row: {
          created_at: string
          current_value: number | null
          description: string | null
          horizon: string
          id: string
          parent_id: string | null
          priority: string
          progress: number
          status: string
          target_date: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          horizon?: string
          id?: string
          parent_id?: string | null
          priority?: string
          progress?: number
          status?: string
          target_date?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          current_value?: number | null
          description?: string | null
          horizon?: string
          id?: string
          parent_id?: string | null
          priority?: string
          progress?: number
          status?: string
          target_date?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_goals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ethan_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_habit_logs: {
        Row: {
          created_at: string
          done_on: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          done_on?: string
          habit_id: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          done_on?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "ethan_habits"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_habits: {
        Row: {
          active: boolean
          created_at: string
          detail: string | null
          domain: string
          frequency: string
          id: string
          time_of_day: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          detail?: string | null
          domain?: string
          frequency?: string
          id?: string
          time_of_day?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          detail?: string | null
          domain?: string
          frequency?: string
          id?: string
          time_of_day?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_identity_entries: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          lesson: string | null
          occurred_on: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          lesson?: string | null
          occurred_on?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          lesson?: string | null
          occurred_on?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_item_events: {
        Row: {
          content: string
          created_at: string
          id: string
          item_id: string
          kind: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          item_id: string
          kind?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          item_id?: string
          kind?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_item_events_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "ethan_tracked_items"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_notes: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          pinned: boolean
          tags: string[]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          tags?: string[]
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          pinned?: boolean
          tags?: string[]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          last_seen_at: string
          p256dh: string
          timezone: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          last_seen_at?: string
          p256dh: string
          timezone?: string
          user_agent?: string | null
          user_id?: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_seen_at?: string
          p256dh?: string
          timezone?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ethan_scheduled_push: {
        Row: {
          body: string
          created_at: string
          id: string
          key: string
          priority: string
          send_at: string
          sent_at: string | null
          title: string
          url: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          key: string
          priority?: string
          send_at: string
          sent_at?: string | null
          title: string
          url?: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          key?: string
          priority?: string
          send_at?: string
          sent_at?: string | null
          title?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      ethan_tasks: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          created_at: string
          deal_id: string | null
          detail: string | null
          domain: string
          due_on: string | null
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          detail?: string | null
          domain?: string
          due_on?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string
          deal_id?: string | null
          detail?: string | null
          domain?: string
          due_on?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ethan_tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "ethan_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ethan_tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "ethan_deals"
            referencedColumns: ["id"]
          },
        ]
      }
      ethan_tracked_items: {
        Row: {
          attention: string
          context: string | null
          created_at: string
          due_at: string | null
          id: string
          kind: string
          last_activity_at: string
          missing: string | null
          next_action: string | null
          snooze_until: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          value_eur: number | null
          why: string | null
        }
        Insert: {
          attention?: string
          context?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          kind?: string
          last_activity_at?: string
          missing?: string | null
          next_action?: string | null
          snooze_until?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id?: string
          value_eur?: number | null
          why?: string | null
        }
        Update: {
          attention?: string
          context?: string | null
          created_at?: string
          due_at?: string | null
          id?: string
          kind?: string
          last_activity_at?: string
          missing?: string | null
          next_action?: string | null
          snooze_until?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          value_eur?: number | null
          why?: string | null
        }
        Relationships: []
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
