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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      application_match_considerations: {
        Row: {
          application_match_id: string
          consideration: string
          id: string
        }
        Insert: {
          application_match_id: string
          consideration: string
          id?: string
        }
        Update: {
          application_match_id?: string
          consideration?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_match_considerations_application_match_id_fkey"
            columns: ["application_match_id"]
            isOneToOne: false
            referencedRelation: "application_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      application_match_strengths: {
        Row: {
          application_match_id: string
          id: string
          strength: string
        }
        Insert: {
          application_match_id: string
          id?: string
          strength: string
        }
        Update: {
          application_match_id?: string
          id?: string
          strength?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_match_strengths_application_match_id_fkey"
            columns: ["application_match_id"]
            isOneToOne: false
            referencedRelation: "application_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      application_matches: {
        Row: {
          cost_category: string | null
          created_at: string
          id: string
          match_score: number
          material_name: string
        }
        Insert: {
          cost_category?: string | null
          created_at?: string
          id?: string
          match_score: number
          material_name: string
        }
        Update: {
          cost_category?: string | null
          created_at?: string
          id?: string
          match_score?: number
          material_name?: string
        }
        Relationships: []
      }
      lab_recipe_materials: {
        Row: {
          id: string
          lab_recipe_id: string
          material: string
          order_index: number
        }
        Insert: {
          id?: string
          lab_recipe_id: string
          material: string
          order_index: number
        }
        Update: {
          id?: string
          lab_recipe_id?: string
          material?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_recipe_materials_lab_recipe_id_fkey"
            columns: ["lab_recipe_id"]
            isOneToOne: false
            referencedRelation: "lab_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_recipe_steps: {
        Row: {
          description: string
          id: string
          lab_recipe_id: string
          step_number: number
        }
        Insert: {
          description: string
          id?: string
          lab_recipe_id: string
          step_number: number
        }
        Update: {
          description?: string
          id?: string
          lab_recipe_id?: string
          step_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "lab_recipe_steps_lab_recipe_id_fkey"
            columns: ["lab_recipe_id"]
            isOneToOne: false
            referencedRelation: "lab_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_recipes: {
        Row: {
          authors: string | null
          created_at: string
          doi: string | null
          highlighted_section: string | null
          id: string
          key_findings: string | null
          source: string
          title: string
        }
        Insert: {
          authors?: string | null
          created_at?: string
          doi?: string | null
          highlighted_section?: string | null
          id?: string
          key_findings?: string | null
          source: string
          title: string
        }
        Update: {
          authors?: string | null
          created_at?: string
          doi?: string | null
          highlighted_section?: string | null
          id?: string
          key_findings?: string | null
          source?: string
          title?: string
        }
        Relationships: []
      }
      material_applications: {
        Row: {
          application: string
          id: string
          material_id: string
        }
        Insert: {
          application: string
          id?: string
          material_id: string
        }
        Update: {
          application?: string
          id?: string
          material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_applications_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_properties: {
        Row: {
          id: string
          material_id: string
          property_category: string | null
          property_name: string
          property_value: string
        }
        Insert: {
          id?: string
          material_id: string
          property_category?: string | null
          property_name: string
          property_value: string
        }
        Update: {
          id?: string
          material_id?: string
          property_category?: string | null
          property_name?: string
          property_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_properties_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_properties_database: {
        Row: {
          chemical_structure: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          chemical_structure?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          chemical_structure?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      material_property_sources: {
        Row: {
          id: string
          material_properties_database_id: string
          source: string
        }
        Insert: {
          id?: string
          material_properties_database_id: string
          source: string
        }
        Update: {
          id?: string
          material_properties_database_id?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_property_sources_material_properties_database_id_fkey"
            columns: ["material_properties_database_id"]
            isOneToOne: false
            referencedRelation: "material_properties_database"
            referencedColumns: ["id"]
          },
        ]
      }
      material_property_values: {
        Row: {
          id: string
          material_properties_database_id: string
          property_name: string
          property_value: string
        }
        Insert: {
          id?: string
          material_properties_database_id: string
          property_name: string
          property_value: string
        }
        Update: {
          id?: string
          material_properties_database_id?: string
          property_name?: string
          property_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_property_values_material_properties_database_id_fkey"
            columns: ["material_properties_database_id"]
            isOneToOne: false
            referencedRelation: "material_properties_database"
            referencedColumns: ["id"]
          },
        ]
      }
      material_regulations: {
        Row: {
          id: string
          material_id: string
          regulation: string
        }
        Insert: {
          id?: string
          material_id: string
          regulation: string
        }
        Update: {
          id?: string
          material_id?: string
          regulation?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_regulations_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      material_sustainability: {
        Row: {
          biodegradability_score: number
          calculation_method: string | null
          carbon_footprint_score: number
          id: string
          material_id: string
          overall_score: number
          renewable_score: number
          toxicity_score: number
        }
        Insert: {
          biodegradability_score: number
          calculation_method?: string | null
          carbon_footprint_score: number
          id?: string
          material_id: string
          overall_score: number
          renewable_score: number
          toxicity_score: number
        }
        Update: {
          biodegradability_score?: number
          calculation_method?: string | null
          carbon_footprint_score?: number
          id?: string
          material_id?: string
          overall_score?: number
          renewable_score?: number
          toxicity_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "material_sustainability_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: true
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          category: string
          chemical_formula: string | null
          chemical_structure: string | null
          created_at: string
          id: string
          image_url: string | null
          innovation: string | null
          name: string
          scale: string | null
          uniqueness: string | null
          updated_at: string
        }
        Insert: {
          category: string
          chemical_formula?: string | null
          chemical_structure?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          innovation?: string | null
          name: string
          scale?: string | null
          uniqueness?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          chemical_formula?: string | null
          chemical_structure?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          innovation?: string | null
          name?: string
          scale?: string | null
          uniqueness?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      optimization_runs: {
        Row: {
          agitation: number
          baseline_energy: number
          baseline_time: number
          baseline_yield: number
          created_at: string
          energy_improvement: number
          id: string
          notes: string | null
          opt_agitation: number
          opt_oxygen_level: number | null
          opt_ph: number
          opt_retention_time: number | null
          opt_substrate_concentration: number | null
          opt_temperature: number
          optimized_energy: number
          optimized_time: number
          optimized_yield: number
          oxygen_level: number | null
          ph: number
          ph_max: number | null
          ph_min: number | null
          process_name: string
          process_type: string
          retention_time: number | null
          substrate_concentration: number | null
          temp_max: number | null
          temp_min: number | null
          temperature: number
          time_improvement: number
          user_id: string | null
          yield_improvement: number
        }
        Insert: {
          agitation: number
          baseline_energy: number
          baseline_time: number
          baseline_yield: number
          created_at?: string
          energy_improvement: number
          id?: string
          notes?: string | null
          opt_agitation: number
          opt_oxygen_level?: number | null
          opt_ph: number
          opt_retention_time?: number | null
          opt_substrate_concentration?: number | null
          opt_temperature: number
          optimized_energy: number
          optimized_time: number
          optimized_yield: number
          oxygen_level?: number | null
          ph: number
          ph_max?: number | null
          ph_min?: number | null
          process_name: string
          process_type: string
          retention_time?: number | null
          substrate_concentration?: number | null
          temp_max?: number | null
          temp_min?: number | null
          temperature: number
          time_improvement: number
          user_id?: string | null
          yield_improvement: number
        }
        Update: {
          agitation?: number
          baseline_energy?: number
          baseline_time?: number
          baseline_yield?: number
          created_at?: string
          energy_improvement?: number
          id?: string
          notes?: string | null
          opt_agitation?: number
          opt_oxygen_level?: number | null
          opt_ph?: number
          opt_retention_time?: number | null
          opt_substrate_concentration?: number | null
          opt_temperature?: number
          optimized_energy?: number
          optimized_time?: number
          optimized_yield?: number
          oxygen_level?: number | null
          ph?: number
          ph_max?: number | null
          ph_min?: number | null
          process_name?: string
          process_type?: string
          retention_time?: number | null
          substrate_concentration?: number | null
          temp_max?: number | null
          temp_min?: number | null
          temperature?: number
          time_improvement?: number
          user_id?: string | null
          yield_improvement?: number
        }
        Relationships: []
      }
      research_material_applications: {
        Row: {
          application: string
          id: string
          research_material_id: string
        }
        Insert: {
          application: string
          id?: string
          research_material_id: string
        }
        Update: {
          application?: string
          id?: string
          research_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_material_applications_research_material_id_fkey"
            columns: ["research_material_id"]
            isOneToOne: false
            referencedRelation: "research_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      research_material_properties: {
        Row: {
          id: string
          property_name: string
          property_value: string
          research_material_id: string
        }
        Insert: {
          id?: string
          property_name: string
          property_value: string
          research_material_id: string
        }
        Update: {
          id?: string
          property_name?: string
          property_value?: string
          research_material_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "research_material_properties_research_material_id_fkey"
            columns: ["research_material_id"]
            isOneToOne: false
            referencedRelation: "research_materials"
            referencedColumns: ["id"]
          },
        ]
      }
      research_materials: {
        Row: {
          contact_email: string | null
          created_at: string
          funding_stage: string | null
          id: string
          institution: string
          name: string
          status: string
          year: number
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          funding_stage?: string | null
          id?: string
          institution: string
          name: string
          status: string
          year: number
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          funding_stage?: string | null
          id?: string
          institution?: string
          name?: string
          status?: string
          year?: number
        }
        Relationships: []
      }
      supplier_certifications: {
        Row: {
          certification: string
          id: string
          supplier_id: string
        }
        Insert: {
          certification: string
          id?: string
          supplier_id: string
        }
        Update: {
          certification?: string
          id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_certifications_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_detailed_properties: {
        Row: {
          category: string
          id: string
          property_name: string
          property_value: string
          supplier_id: string
        }
        Insert: {
          category: string
          id?: string
          property_name: string
          property_value: string
          supplier_id: string
        }
        Update: {
          category?: string
          id?: string
          property_name?: string
          property_value?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_detailed_properties_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_properties: {
        Row: {
          id: string
          property_name: string
          property_value: string
          supplier_id: string
        }
        Insert: {
          id?: string
          property_name: string
          property_value: string
          supplier_id: string
        }
        Update: {
          id?: string
          property_name?: string
          property_value?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_properties_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          company_name: string
          country: string
          created_at: string
          id: string
          lead_time: string | null
          logo_url: string | null
          material_id: string
          min_order: string | null
          pricing: string | null
          product_image_url: string | null
          uniqueness: string | null
        }
        Insert: {
          company_name: string
          country: string
          created_at?: string
          id?: string
          lead_time?: string | null
          logo_url?: string | null
          material_id: string
          min_order?: string | null
          pricing?: string | null
          product_image_url?: string | null
          uniqueness?: string | null
        }
        Update: {
          company_name?: string
          country?: string
          created_at?: string
          id?: string
          lead_time?: string | null
          logo_url?: string | null
          material_id?: string
          min_order?: string | null
          pricing?: string | null
          product_image_url?: string | null
          uniqueness?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          company_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          interest_area: string | null
          phone: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          interest_area?: string | null
          phone?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          interest_area?: string | null
          phone?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
