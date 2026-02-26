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
        PostgrestVersion: "14.1"
    }
    graphql_public: {
        Tables: {
            [_ in never]: never
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            graphql: {
                Args: {
                    extensions?: Json
                    operationName?: string
                    query?: string
                    variables?: Json
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
    public: {
        Tables: {
            automation_logs: {
                Row: {
                    executed_at: string
                    id: string
                    result_message: string | null
                    rule_id: string
                }
                Insert: {
                    executed_at?: string
                    id?: string
                    result_message?: string | null
                    rule_id: string
                }
                Update: {
                    executed_at?: string
                    id?: string
                    result_message?: string | null
                    rule_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "automation_logs_rule_id_fkey"
                        columns: ["rule_id"]
                        isOneToOne: false
                        referencedRelation: "automation_rules"
                        referencedColumns: ["id"]
                    },
                ]
            }
            automation_rules: {
                Row: {
                    action_type: string
                    created_at: string
                    id: string
                    is_active: boolean | null
                    name: string
                    store_id: string
                    trigger_type: string
                    trigger_value: Json | null
                    updated_at: string
                }
                Insert: {
                    action_type: string
                    created_at?: string
                    id?: string
                    is_active?: boolean | null
                    name: string
                    store_id: string
                    trigger_type: string
                    trigger_value?: Json | null
                    updated_at?: string
                }
                Update: {
                    action_type?: string
                    created_at?: string
                    id?: string
                    is_active?: boolean | null
                    name?: string
                    store_id?: string
                    trigger_type?: string
                    trigger_value?: Json | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "automation_rules_store_id_fkey"
                        columns: ["store_id"]
                        isOneToOne: false
                        referencedRelation: "stores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            customers: {
                Row: {
                    created_at: string
                    email: string | null
                    full_name: string
                    id: string
                    phone: string | null
                    store_id: string
                    total_spent: number | null
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    email?: string | null
                    full_name: string
                    id?: string
                    phone?: string | null
                    store_id: string
                    total_spent?: number | null
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    email?: string | null
                    full_name?: string
                    id?: string
                    phone?: string | null
                    store_id?: string
                    total_spent?: number | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "customers_store_id_fkey"
                        columns: ["store_id"]
                        isOneToOne: false
                        referencedRelation: "stores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            integrations: {
                Row: {
                    api_credentials: Json
                    created_at: string
                    id: string
                    is_active: boolean | null
                    platform_name: string
                    store_id: string
                    updated_at: string
                }
                Insert: {
                    api_credentials?: Json
                    created_at?: string
                    id?: string
                    is_active?: boolean | null
                    platform_name: string
                    store_id: string
                    updated_at?: string
                }
                Update: {
                    api_credentials?: Json
                    created_at?: string
                    id?: string
                    is_active?: boolean | null
                    platform_name?: string
                    store_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "integrations_store_id_fkey"
                        columns: ["store_id"]
                        isOneToOne: false
                        referencedRelation: "stores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            inventory: {
                Row: {
                    created_at: string
                    id: string
                    quantity: number
                    updated_at: string
                    variant_id: string
                    warehouse_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    quantity?: number
                    updated_at?: string
                    variant_id: string
                    warehouse_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    quantity?: number
                    updated_at?: string
                    variant_id?: string
                    warehouse_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "inventory_variant_id_fkey"
                        columns: ["variant_id"]
                        isOneToOne: false
                        referencedRelation: "variants"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "inventory_warehouse_id_fkey"
                        columns: ["warehouse_id"]
                        isOneToOne: false
                        referencedRelation: "warehouses"
                        referencedColumns: ["id"]
                    },
                ]
            }
            order_items: {
                Row: {
                    created_at: string
                    id: string
                    order_id: string
                    quantity: number
                    unit_price: number
                    updated_at: string
                    variant_id: string | null
                }
                Insert: {
                    created_at?: string
                    id?: string
                    order_id: string
                    quantity?: number
                    unit_price: number
                    updated_at?: string
                    variant_id?: string | null
                }
                Update: {
                    created_at?: string
                    id?: string
                    order_id?: string
                    quantity?: number
                    unit_price?: number
                    updated_at?: string
                    variant_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_variant_id_fkey"
                        columns: ["variant_id"]
                        isOneToOne: false
                        referencedRelation: "variants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    created_at: string
                    customer_id: string | null
                    id: string
                    integration_id: string | null
                    original_order_number: string | null
                    status: string
                    store_id: string
                    total_amount: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    customer_id?: string | null
                    id?: string
                    integration_id?: string | null
                    original_order_number?: string | null
                    status?: string
                    store_id: string
                    total_amount?: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    customer_id?: string | null
                    id?: string
                    integration_id?: string | null
                    original_order_number?: string | null
                    status?: string
                    store_id?: string
                    total_amount?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_customer_id_fkey"
                        columns: ["customer_id"]
                        isOneToOne: false
                        referencedRelation: "customers"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_integration_id_fkey"
                        columns: ["integration_id"]
                        isOneToOne: false
                        referencedRelation: "integrations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "orders_store_id_fkey"
                        columns: ["store_id"]
                        isOneToOne: false
                        referencedRelation: "stores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            product_listings: {
                Row: {
                    created_at: string
                    id: string
                    integration_id: string
                    overridden_price: number | null
                    remote_product_id: string | null
                    remote_sku: string | null
                    sync_status: string | null
                    updated_at: string
                    variant_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    integration_id: string
                    overridden_price?: number | null
                    remote_product_id?: string | null
                    remote_sku?: string | null
                    sync_status?: string | null
                    updated_at?: string
                    variant_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    integration_id?: string
                    overridden_price?: number | null
                    remote_product_id?: string | null
                    remote_sku?: string | null
                    sync_status?: string | null
                    updated_at?: string
                    variant_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "product_listings_integration_id_fkey"
                        columns: ["integration_id"]
                        isOneToOne: false
                        referencedRelation: "integrations"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "product_listings_variant_id_fkey"
                        columns: ["variant_id"]
                        isOneToOne: false
                        referencedRelation: "variants"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    attributes: Json | null
                    brand: string | null
                    created_at: string
                    description: string | null
                    id: string
                    name: string
                    store_id: string
                    updated_at: string
                }
                Insert: {
                    attributes?: Json | null
                    brand?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    name: string
                    store_id: string
                    updated_at?: string
                }
                Update: {
                    attributes?: Json | null
                    brand?: string | null
                    created_at?: string
                    description?: string | null
                    id?: string
                    name?: string
                    store_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "products_store_id_fkey"
                        columns: ["store_id"]
                        isOneToOne: false
                        referencedRelation: "stores"
                        referencedColumns: ["id"]
                    },
                ]
            }
            stores: {
                Row: {
                    created_at: string
                    id: string
                    name: string
                    owner_id: string
                    subscription_plan: string | null
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    name: string
                    owner_id: string
                    subscription_plan?: string | null
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    name?: string
                    owner_id?: string
                    subscription_plan?: string | null
                    updated_at?: string
                }
                Relationships: []
            }
            variants: {
                Row: {
                    barcode: string | null
                    created_at: string
                    id: string
                    price: number
                    product_id: string
                    sku: string
                    stock_code: string | null
                    updated_at: string
                }
                Insert: {
                    barcode?: string | null
                    created_at?: string
                    id?: string
                    price?: number
                    product_id: string
                    sku: string
                    stock_code?: string | null
                    updated_at?: string
                }
                Update: {
                    barcode?: string | null
                    created_at?: string
                    id?: string
                    price?: number
                    product_id?: string
                    sku?: string
                    stock_code?: string | null
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "variants_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            warehouses: {
                Row: {
                    address: string | null
                    created_at: string
                    id: string
                    name: string
                    store_id: string
                    updated_at: string
                }
                Insert: {
                    address?: string | null
                    created_at?: string
                    id?: string
                    name: string
                    store_id: string
                    updated_at?: string
                }
                Update: {
                    address?: string | null
                    created_at?: string
                    id?: string
                    name?: string
                    store_id?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "warehouses_store_id_fkey"
                        columns: ["store_id"]
                        isOneToOne: false
                        referencedRelation: "stores"
                        referencedColumns: ["id"]
                    },
                ]
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
    graphql_public: {
        Enums: {},
    },
    public: {
        Enums: {},
    },
} as const
