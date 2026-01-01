import { DeliveryAddress } from "@/core/types/sales.types";
import { SaleType } from "@/features/sales/components/SalesPage";
import { DeliveryData } from "@/features/sales/components/DeliveryOptionsModal";

// --- Types extracted from use-sales.ts ---

export type AllowedRole = 'admin' | 'employee';

export type PaymentMethod = {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    type?: string;
};

// Expanded Sale type that matches the one used in use-sales.ts (with joined checks)
export type Sale = {
    id: string;
    customer_id: string | null;
    user_id: string;
    seller_id: string | null;
    total_amount: number;
    discount_amount: number;
    final_amount: number;
    payment_method: string;
    payment_status: 'pending' | 'paid' | 'cancelled';
    order_number: number; // Added based on DB schema
    status: 'pending' | 'completed' | 'cancelled' | 'delivering' | 'delivered' | 'returned' | 'refunded';
    delivery: boolean | null;
    delivery_status?: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled' | null; // Added based on DB schema
    delivery_type: string; // Added based on DB schema
    delivery_address: DeliveryAddress | null;
    delivery_fee?: number; // Added based on DB schema
    delivery_user_id: string | null;
    delivery_person_id?: string | null; // Added based on DB schema
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Fiscal Data
    invoice?: {
        id: string;
        status: 'pending' | 'authorized' | 'rejected' | 'cancelled' | 'processing';
        external_id?: string | null;
        xml_url?: string | null;
        pdf_url?: string | null;
    } | null;
    customer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    } | null;
    seller?: {
        id: string;
        name: string;
        email?: string;
    } | null;
    delivery_person?: {
        id: string;
        name: string;
        email?: string;
    } | null;
    items?: Array<{
        id: string;
        sale_id: string;
        product_id: string;
        quantity: number;
        unit_price: number;
        subtotal: number;
        product?: {
            name: string;
            barcode?: string;
        };
    }>;
};

export type SaleItemInput = {
    product_id: string;
    quantity: number;
    unit_price: number;
};

export type UpsertSaleInput = {
    customer_id: string | null;
    payment_method_id: string;
    total_amount: number;
    discount_amount?: number;
    items: {
        product_id: string;
        variant_id: string;
        quantity: number;
        unit_price: number;
        units_sold: number;
        sale_type?: 'unit' | 'package';
        package_units?: number;
    }[];
    notes?: string;
    saleType: SaleType;
    deliveryData?: DeliveryData;
    delivery_address?: string | null;
    delivery_fee?: number;
    delivery_person_id?: string | null;
};
