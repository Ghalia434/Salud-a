export type ProgramType =
  | "perte_de_poids"
  | "equilibre"
  | "prise_de_masse"
  | "transformation_corporelle"
  | "athlete";

export type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "en_preparation"
  | "en_livraison"
  | "livree"
  | "annulee";

export type UserRole = "client" | "admin";

export type ExtraCategory = "gourmandise" | "detox";

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
          protein_label: string | null;
          starch_label: string | null;
          veg_label: string | null;
          sauce_label: string | null;
          protein_default_grams: number | null;
          starch_default_grams: number | null;
          veg_default_grams: number | null;
          extra_label: string | null;
          extra_price_per_100g: number | null;
          extra_default_grams: number | null;
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
          program: ProgramType;
          pack_plates: number;
          pack_price: number;
          delivery_fee: number;
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
          program: ProgramType;
          pack_plates: number;
          pack_price: number;
          delivery_fee: number;
          full_name: string;
          phone: string;
          address: string;
          quartier: string;
          city: string;
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
          protein_grams: number | null;
          starch_grams: number | null;
          veg_grams: number | null;
          extra_grams: number | null;
          sauce: boolean;
          unit_price: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          meal_id: string;
          quantity: number;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      extras: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          ingredients: string | null;
          portion: string | null;
          price: number;
          category: ExtraCategory;
          photo_url: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["extras"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["extras"]["Row"]>;
        Relationships: [];
      };
      order_extras: {
        Row: {
          id: string;
          order_id: string;
          extra_id: string;
          quantity: number;
          is_gift: boolean;
        };
        Insert: Partial<Database["public"]["Tables"]["order_extras"]["Row"]> & {
          order_id: string;
          extra_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_extras"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_order: {
        Args: {
          p_program: ProgramType;
          p_pack_plates: number;
          p_pack_price: number;
          p_delivery_fee: number;
          p_full_name: string;
          p_phone: string;
          p_address: string;
          p_quartier: string;
          p_city: string;
          p_gift_detox: boolean;
          p_gift_gourmandise: boolean;
          p_free_delivery: boolean;
          p_items: {
            meal_id: string;
            quantity: number;
            protein_grams?: number;
            starch_grams?: number;
            veg_grams?: number;
            extra_grams?: number;
            sauce?: boolean;
            unit_price?: number;
          }[];
          p_extras: { extra_id: string; quantity: number; is_gift: boolean }[];
        };
        Returns: { order_id: string; order_number: string }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
