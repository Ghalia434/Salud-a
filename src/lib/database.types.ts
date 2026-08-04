export type ProgramType = "perte_de_poids" | "equilibre" | "prise_de_masse";

export type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "en_livraison"
  | "livree";

export type UserRole = "client" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          address: string | null;
          quartier: string | null;
          city: string;
          role: UserRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      meals: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          photo_url: string | null;
          calories: number;
          protein_g: number;
          program: ProgramType;
          active: boolean;
          available: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["meals"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["meals"]["Row"]>;
        Relationships: [];
      };
      program_packs: {
        Row: {
          id: string;
          program: ProgramType;
          plates: number;
          price: number;
          label: string | null;
          gift_detox: boolean;
          gift_gourmandise: boolean;
          free_delivery: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["program_packs"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["program_packs"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string;
          program: ProgramType;
          pack_plates: number;
          pack_price: number;
          full_name: string;
          phone: string;
          address: string;
          quartier: string;
          city: string;
          gift_detox: boolean;
          gift_gourmandise: boolean;
          free_delivery: boolean;
          status: OrderStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          user_id: string;
          program: ProgramType;
          pack_plates: number;
          pack_price: number;
          full_name: string;
          phone: string;
          address: string;
          quartier: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          meal_id: string;
          quantity: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          meal_id: string;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
