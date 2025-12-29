/**
 * Hook Centralizado de Dados de Estoque (SSoT)
 * 
 * Fonte Única de Verdade (Single Source of Truth) para disponibilidade e dados de produtos.
 * Substitui o antigo useProductsSSoT e centraliza a lógica de "Posso vender?".
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { calculatePackageDisplay } from '@/shared/utils/stockCalculations';
import type { Product } from '@/core/types/inventory.types';
import { Tables } from '@/core/types/supabase';

// Types
type SupabaseProduct = Tables<'products'>;

export interface ProductStockData extends Product {
    // Dados calculados de apresentação
    stockDisplay: {
        packages: number;
        units: number;
        formatted: string;
    };

    // Preços normalizados
    unitPrice: number;
    packagePrice: number;
    unitsPerPackage: number;

    // Status
    stockStatus: 'out_of_stock' | 'low_stock' | 'adequate';
    stockStatusLabel: string;
    stockStatusColor: string;

    // Permissions
    canSellUnits: boolean;
    canSellPackages: boolean;
}

// Interface para seleção de produtos (compatibilidade com carrinho)
export interface ProductSelectionSSoT {
    product_id: string;
    quantity: number;
    type: 'unit' | 'package';
    unit_price: number;
    total_price: number;
    units_sold: number; // Total de unidades individuais vendidas
}

/**
 * Função helper para criar seleção de produto para o carrinho
 */
export function createProductSelection(
    product: ProductStockData,
    quantity: number,
    type: 'unit' | 'package'
): ProductSelectionSSoT {
    const unitPrice = type === 'unit' ? product.unitPrice : product.packagePrice;
    const unitsPerItem = type === 'unit' ? 1 : product.unitsPerPackage;

    return {
        product_id: product.id,
        quantity,
        type,
        unit_price: unitPrice,
        total_price: unitPrice * quantity,
        units_sold: quantity * unitsPerItem,
    };
}

export interface StockAvailability {
    available: boolean;
    maxUnits: number;
    maxPackages: number;
    reason?: 'out_of_stock' | 'insufficient_quantity' | 'invalid_quantity';
}

/**
 * Helper: Transforma DB Row -> Frontend Product com metadados de estoque
 */
export const transformToStockData = (dbProduct: any): ProductStockData => {
    // 1. Cast básico seguro
    const product: Product = {
        id: dbProduct.id,
        name: dbProduct.name,
        category: dbProduct.category,
        price: Number(dbProduct.price) as any,
        // Estoque Real (SSoT)
        stock_packages: Number(dbProduct.stock_packages || 0) as any,
        stock_units_loose: Number(dbProduct.stock_units_loose || 0) as any,
        stock_quantity: 0 as any, // Deprecated
        // Embeds
        unit_type: (dbProduct.unit_type as any) || 'un',
        turnover_rate: (dbProduct.turnover_rate as any) || 'medium',
        package_size: Number(dbProduct.package_size || 0) as any,
        // Pacotes
        is_package: dbProduct.is_package || false,
        units_per_package: Number(dbProduct.units_per_package || 1) as any,
        package_price: dbProduct.package_price ? Number(dbProduct.package_price) as any : undefined,
        package_barcode: dbProduct.package_barcode || undefined,
        // Outros
        barcode: dbProduct.barcode || undefined,
        cost_price: dbProduct.cost_price ? Number(dbProduct.cost_price) as any : undefined,
        volume_ml: dbProduct.volume_ml ? Number(dbProduct.volume_ml) as any : undefined,
        created_at: dbProduct.created_at,
        updated_at: dbProduct.updated_at,
        // Fiscais
        ncm: dbProduct.ncm || undefined,
        cest: dbProduct.cest || undefined,
        cfop: dbProduct.cfop || undefined,
        origin: dbProduct.origin ? String(dbProduct.origin) : undefined,
        deleted_at: dbProduct.deleted_at || null
    };

    // 2. Cálculos de Apresentação (Direto da Prateleira)
    const display = {
        packages: product.stock_packages,
        units: product.stock_units_loose,
        formatted: `${product.stock_packages} pacotes + ${product.stock_units_loose} unidades`
    };

    // 3. Status de Estoque
    const totalUnits = (product.stock_packages * product.units_per_package) + product.stock_units_loose;
    let status: ProductStockData['stockStatus'] = 'adequate';
    let label = 'Em Estoque';
    let color = 'text-green-500';

    if (totalUnits <= 0) {
        status = 'out_of_stock';
        label = 'Esgotado';
        color = 'text-gray-500';
    } else if (totalUnits < (dbProduct.minimum_stock || 10)) {
        status = 'low_stock';
        label = 'Estoque Baixo';
        color = 'text-yellow-500';
    }

    // 4. Preços Normalizados
    const unitPrice = product.price;
    const packagePrice = product.package_price && product.package_price > 0
        ? product.package_price
        : unitPrice * product.units_per_package;

    return {
        ...product,
        stockDisplay: {
            packages: display.packages,
            units: display.units,
            formatted: display.formatted
        },
        unitPrice,
        packagePrice,
        unitsPerPackage: product.units_per_package || 1,
        stockStatus: status,
        stockStatusLabel: label,
        stockStatusColor: color,
        canSellUnits: product.stock_units_loose > 0,
        canSellPackages: product.stock_packages > 0
    };
}

/**
 * HOOK PRINCIPAL
 */
export const useStockData = () => {
    const query = useQuery({
        queryKey: ['products', 'ssot-all'], // ✅ Chave hierárquica padronizada
        queryFn: async () => {
            // Usa o RPC otimizado se disponível, ou fallback para query simples
            // Por segurança e simplicidade na v1, vamos usar query direta na tabela
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            return (data || []).map(transformToStockData);
        },
        staleTime: 1000 * 60 * 5, // 5 minutos (mas invalidado via Realtime)
    });

    /**
     * Verifica se é possível realizar uma venda
     */
    const checkAvailability = (productId: string, quantity: number, isPackage: boolean): StockAvailability => {
        if (!query.data) return { available: false, maxUnits: 0, maxPackages: 0 };

        const product = query.data.find(p => p.id === productId);
        if (!product) return { available: false, maxUnits: 0, maxPackages: 0 };

        // Total de unidades físicas disponíveis no estoque (SSoT)
        const totalPhysicalUnits =
            (product.stock_packages * product.units_per_package) + product.stock_units_loose;

        // Quantidade solicitada convertida para unidades
        const requestedUnits = isPackage
            ? quantity * product.units_per_package
            : quantity;

        if (totalPhysicalUnits <= 0) {
            return {
                available: false,
                maxUnits: 0,
                maxPackages: 0,
                reason: 'out_of_stock'
            };
        }

        if (requestedUnits > totalPhysicalUnits) {
            return {
                available: false,
                maxUnits: totalPhysicalUnits,
                maxPackages: Math.floor(totalPhysicalUnits / product.units_per_package),
                reason: 'insufficient_quantity'
            };
        }

        return {
            available: true,
            maxUnits: totalPhysicalUnits,
            maxPackages: Math.floor(totalPhysicalUnits / product.units_per_package)
        };
    };

    /**
     * Helper para encontrar produto rapidamente (ex: scan de barcode)
     */
    const findProductByTerm = (term: string): ProductStockData | undefined => {
        if (!query.data) return undefined;
        const lowerTerm = term.toLowerCase().trim();

        return query.data.find(p =>
            p.barcode === term ||
            p.package_barcode === term ||
            p.name.toLowerCase().includes(lowerTerm)
        );
    };

    return {
        ...query,
        products: query.data || [],
        checkAvailability,
        findProductByTerm
    };
};
