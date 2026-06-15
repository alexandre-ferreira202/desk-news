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
      avisos: {
        Row: {
          assunto: string
          autor_id: string
          created_at: string
          data: string
          id: string
        }
        Insert: {
          assunto: string
          autor_id: string
          created_at?: string
          data?: string
          id?: string
        }
        Update: {
          assunto?: string
          autor_id?: string
          created_at?: string
          data?: string
          id?: string
        }
        Relationships: []
      }
      espelho_blocos: {
        Row: {
          apresentador: string | null
          created_at: string
          data_edicao: string
          id: string
          nome: string
          ordem: number
          programa: string
        }
        Insert: {
          apresentador?: string | null
          created_at?: string
          data_edicao: string
          id?: string
          nome: string
          ordem?: number
          programa?: string
        }
        Update: {
          apresentador?: string | null
          created_at?: string
          data_edicao?: string
          id?: string
          nome?: string
          ordem?: number
          programa?: string
        }
        Relationships: []
      }
      espelho_itens: {
        Row: {
          assunto: string
          bloco_id: string
          cabeca: string | null
          created_at: string
          editor_imagem_id: string | null
          editor_texto_id: string | null
          formato: string | null
          id: string
          materia_id: string | null
          ordem: number
          status: Database["public"]["Enums"]["item_status"]
          tempo: string | null
          tempo_cab: string | null
          tempo_total: string | null
        }
        Insert: {
          assunto: string
          bloco_id: string
          cabeca?: string | null
          created_at?: string
          editor_imagem_id?: string | null
          editor_texto_id?: string | null
          formato?: string | null
          id?: string
          materia_id?: string | null
          ordem?: number
          status?: Database["public"]["Enums"]["item_status"]
          tempo?: string | null
          tempo_cab?: string | null
          tempo_total?: string | null
        }
        Update: {
          assunto?: string
          bloco_id?: string
          cabeca?: string | null
          created_at?: string
          editor_imagem_id?: string | null
          editor_texto_id?: string | null
          formato?: string | null
          id?: string
          materia_id?: string | null
          ordem?: number
          status?: Database["public"]["Enums"]["item_status"]
          tempo?: string | null
          tempo_cab?: string | null
          tempo_total?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "espelho_itens_bloco_id_fkey"
            columns: ["bloco_id"]
            isOneToOne: false
            referencedRelation: "espelho_blocos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "espelho_itens_editor_imagem_id_fkey"
            columns: ["editor_imagem_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "espelho_itens_editor_texto_id_fkey"
            columns: ["editor_texto_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "espelho_itens_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      materias: {
        Row: {
          autor_id: string
          cabeca: string | null
          corpo: string | null
          created_at: string
          credito_reporter: string | null
          deixa: string | null
          editor_imagem: string | null
          editor_texto: string | null
          entrevistado_funcao: string | null
          entrevistado_nome: string | null
          estrutura: string | null
          id: string
          lide: string | null
          pauta_id: string | null
          publicado_em: string | null
          status: Database["public"]["Enums"]["materia_status"]
          tempo_cab: string | null
          tempo_vt: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          autor_id: string
          cabeca?: string | null
          corpo?: string | null
          created_at?: string
          credito_reporter?: string | null
          deixa?: string | null
          editor_imagem?: string | null
          editor_texto?: string | null
          entrevistado_funcao?: string | null
          entrevistado_nome?: string | null
          estrutura?: string | null
          id?: string
          lide?: string | null
          pauta_id?: string | null
          publicado_em?: string | null
          status?: Database["public"]["Enums"]["materia_status"]
          tempo_cab?: string | null
          tempo_vt?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          autor_id?: string
          cabeca?: string | null
          corpo?: string | null
          created_at?: string
          credito_reporter?: string | null
          deixa?: string | null
          editor_imagem?: string | null
          editor_texto?: string | null
          entrevistado_funcao?: string | null
          entrevistado_nome?: string | null
          estrutura?: string | null
          id?: string
          lide?: string | null
          pauta_id?: string | null
          publicado_em?: string | null
          status?: Database["public"]["Enums"]["materia_status"]
          tempo_cab?: string | null
          tempo_vt?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_pauta_id_fkey"
            columns: ["pauta_id"]
            isOneToOne: false
            referencedRelation: "pautas"
            referencedColumns: ["id"]
          },
        ]
      }
      metricas: {
        Row: {
          cliques: number
          data: string
          fonte: string
          id: string
          materia_id: string | null
          tempo_medio_seg: number
        }
        Insert: {
          cliques?: number
          data?: string
          fonte?: string
          id?: string
          materia_id?: string | null
          tempo_medio_seg?: number
        }
        Update: {
          cliques?: number
          data?: string
          fonte?: string
          id?: string
          materia_id?: string | null
          tempo_medio_seg?: number
        }
        Relationships: [
          {
            foreignKeyName: "metricas_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
        ]
      }
      pautas: {
        Row: {
          angulo: string | null
          contato: string | null
          created_at: string
          criado_por: string
          data_pauta: string | null
          editoria: string | null
          encaminhamento: string | null
          fontes: string | null
          horario: string | null
          id: string
          imagens: string | null
          local: string | null
          observacoes: string | null
          prazo: string | null
          produtor: string | null
          proposta: string | null
          reporter: string | null
          responsavel_id: string | null
          retranca: string | null
          sonora: string | null
          status: Database["public"]["Enums"]["pauta_status"]
          tipo: string | null
          titulo: string
          turno: string | null
          updated_at: string
        }
        Insert: {
          angulo?: string | null
          contato?: string | null
          created_at?: string
          criado_por: string
          data_pauta?: string | null
          editoria?: string | null
          encaminhamento?: string | null
          fontes?: string | null
          horario?: string | null
          id?: string
          imagens?: string | null
          local?: string | null
          observacoes?: string | null
          prazo?: string | null
          produtor?: string | null
          proposta?: string | null
          reporter?: string | null
          responsavel_id?: string | null
          retranca?: string | null
          sonora?: string | null
          status?: Database["public"]["Enums"]["pauta_status"]
          tipo?: string | null
          titulo: string
          turno?: string | null
          updated_at?: string
        }
        Update: {
          angulo?: string | null
          contato?: string | null
          created_at?: string
          criado_por?: string
          data_pauta?: string | null
          editoria?: string | null
          encaminhamento?: string | null
          fontes?: string | null
          horario?: string | null
          id?: string
          imagens?: string | null
          local?: string | null
          observacoes?: string | null
          prazo?: string | null
          produtor?: string | null
          proposta?: string | null
          reporter?: string | null
          responsavel_id?: string | null
          retranca?: string | null
          sonora?: string | null
          status?: Database["public"]["Enums"]["pauta_status"]
          tipo?: string | null
          titulo?: string
          turno?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      quadro_cards: {
        Row: {
          autor_id: string
          criado_em: string
          dia_semana: number
          horario: string | null
          id: string
          ordem: number
          reporter: string | null
          retranca: string
          semana_inicio: string
          turno: string
        }
        Insert: {
          autor_id: string
          criado_em?: string
          dia_semana: number
          horario?: string | null
          id?: string
          ordem?: number
          reporter?: string | null
          retranca: string
          semana_inicio: string
          turno: string
        }
        Update: {
          autor_id?: string
          criado_em?: string
          dia_semana?: number
          horario?: string | null
          id?: string
          ordem?: number
          reporter?: string | null
          retranca?: string
          semana_inicio?: string
          turno?: string
        }
        Relationships: []
      }
      relatorios: {
        Row: {
          autor_id: string
          criado_em: string
          data: string
          evento: string
          id: string
          programa: string
          retranca: string
          texto: string
        }
        Insert: {
          autor_id: string
          criado_em?: string
          data?: string
          evento: string
          id?: string
          programa: string
          retranca: string
          texto: string
        }
        Update: {
          autor_id?: string
          criado_em?: string
          data?: string
          evento?: string
          id?: string
          programa?: string
          retranca?: string
          texto?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vts_gaveta: {
        Row: {
          autor_id: string
          created_at: string
          data_pronto: string
          id: string
          observacao: string | null
          programa: string
          retranca: string
        }
        Insert: {
          autor_id: string
          created_at?: string
          data_pronto?: string
          id?: string
          observacao?: string | null
          programa: string
          retranca: string
        }
        Update: {
          autor_id?: string
          created_at?: string
          data_pronto?: string
          id?: string
          observacao?: string | null
          programa?: string
          retranca?: string
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
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "chefe_redacao" | "editor" | "reporter"
      item_status: "pendente" | "pronto" | "no_ar" | "cortado"
      materia_status: "rascunho" | "revisao" | "publicado"
      pauta_status:
        | "sugestao"
        | "apuracao"
        | "redacao"
        | "revisao"
        | "publicado"
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
      app_role: ["chefe_redacao", "editor", "reporter"],
      item_status: ["pendente", "pronto", "no_ar", "cortado"],
      materia_status: ["rascunho", "revisao", "publicado"],
      pauta_status: ["sugestao", "apuracao", "redacao", "revisao", "publicado"],
    },
  },
} as const
