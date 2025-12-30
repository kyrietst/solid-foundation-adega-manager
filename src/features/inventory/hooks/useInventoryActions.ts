
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/core/api/supabase/client';
import { useToast } from '@/shared/hooks/common/use-toast';
import useProductDelete from './useProductDelete';
import { safeCalculateMargin, safeCalculatePackageMargin } from '../utils/inventory-math';
import type { Product } from '@/core/types/inventory.types';
import type { Database } from '@/core/types/supabase';

// Interface simplificada para edição de produtos (v2.0)
// Copiada do componente original para manter compatibilidade
export interface SimpleEditProductFormData {
    name: string;
    category: string;
    price: number;
    barcode?: string;
    supplier?: string;
    has_package_tracking?: boolean;
    package_barcode?: string;
    package_units?: number;
    package_price?: number;
    cost_price?: number;
    volume_ml?: number;
    // Fiscal and Description
    ncm?: string;
    cest?: string;
    cfop?: string;
    origin?: string | number;
    description?: string;
    image_url?: string;
    unit_barcode?: string;
    has_unit_tracking?: boolean;
    packaging_type?: string;
}

interface UseInventoryActionsProps {
    onSuccess?: () => void;
}

// Utility type for product updates
type ProductUpdate = Database['public']['Tables']['products']['Update'];

// Helper to cast update data to ensure compatibility with Supabase's strict types
const asProductUpdate = (data: any): ProductUpdate => data;

export const useInventoryActions = ({ onSuccess }: UseInventoryActionsProps = {}) => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { restore } = useProductDelete();
    const [restoringProductId, setRestoringProductId] = useState<string | null>(null);

    // Mutation simplificada para editar produto (v2.0)
    const editProductMutation = useMutation({
        mutationFn: async ({ productData, selectedProduct }: { productData: SimpleEditProductFormData; selectedProduct: Product }) => {
            if (!selectedProduct) throw new Error('Nenhum produto selecionado');

            // Validar códigos de barras se fornecidos
            if (productData.barcode && productData.barcode.trim()) {
                const barcodePattern = /^[0-9]{8,14}$/;
                if (!barcodePattern.test(productData.barcode.trim())) {
                    throw new Error('Código de barras deve conter apenas números e ter entre 8 e 14 dígitos');
                }
            }
            if (productData.package_barcode && productData.package_barcode.trim()) {
                const barcodePattern = /^[0-9]{8,14}$/;
                if (!barcodePattern.test(productData.package_barcode.trim())) {
                    throw new Error('Código de barras do pacote deve conter apenas números e ter entre 8 e 14 dígitos');
                }
            }

            // Preparar dados simplificados para atualização com tipagem estrita
            const updateData: ProductUpdate = {
                name: productData.name,
                price: productData.price,
                // stock_quantity: REMOVIDO - só pode ser alterado via create_inventory_movement()
                category: productData.category,
                volume_ml: productData.volume_ml ?? null,
                supplier: productData.supplier ?? null,
                // minimum_stock removido - coluna não existe na tabela products
                // ✅ CORREÇÃO: Só incluir cost_price se foi fornecido (evita trigger com NULL)
                ...(productData.cost_price !== undefined && { cost_price: productData.cost_price }),
                // Sistema de códigos simplificado
                barcode: productData.barcode || null,
                package_barcode: productData.package_barcode || null,
                package_units: productData.package_units || null,
                units_per_package: productData.package_units || 1,
                has_package_tracking: productData.has_package_tracking || false,
                has_unit_tracking: true, // Sempre ativado no sistema simplificado
                // ✅ CORREÇÃO: Só incluir package_price se foi fornecido
                ...(productData.package_price !== undefined && { package_price: productData.package_price }),
                // Auto-calcular margens de forma segura (evita overflow numérico)
                margin_percent: safeCalculateMargin(productData.price, productData.cost_price),
                package_margin: safeCalculatePackageMargin(
                    productData.package_price,
                    productData.cost_price,
                    productData.package_units
                ),
                // Campos Fiscais e Extras
                ncm: productData.ncm || null,
                cest: productData.cest || null,
                cfop: productData.cfop || null,
                origin: productData.origin ? String(productData.origin) : null,
                description: productData.description || null,
                image_url: productData.image_url || null,
                unit_barcode: productData.unit_barcode || null,
                // Garantir packaging_type
                packaging_type: productData.packaging_type || 'fardo',
                turnover_rate: 'medium',
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('products')
                .update(updateData as any)
                .eq('id' as any, selectedProduct.id as any)
                .select()
                .single();

            if (error) throw error;
            return data as unknown as Product;
        },
        onSuccess: (data) => {
            // Invalidar cache para recarregar dados
            queryClient.invalidateQueries({ queryKey: ['products'] });

            toast({
                title: 'Produto atualizado',
                description: `"${data.name}" atualizado com sucesso!`,
                variant: 'default',
            });

            if (onSuccess) onSuccess();
        },
        onError: (error: Error) => {
            console.error('Erro ao editar produto:', error);
            toast({
                title: 'Erro ao editar produto',
                description: error.message || 'Tente novamente.',
                variant: 'destructive',
            });
        },
    });

    const handleRestoreProduct = async (product: Pick<Product, 'id' | 'name'>) => {
        setRestoringProductId(product.id);
        try {
            // ✅ Passar objeto completo para nova arquitetura (nunca fetch após restaurar)
            await restore({ productId: product.id, productName: product.name });
            // Invalidar queries para atualizar listas
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', 'deleted'] });
        } catch (error) {
            console.error('Erro ao restaurar produto:', error);
        } finally {
            setRestoringProductId(null);
        }
    };

    // Funções helper para carregar dados frescos antes de editar/visualizar
    const fetchFreshProduct = async (productId: string): Promise<Product | null> => {
        try {
            const { data: updatedProduct, error } = await supabase
                .from('products')
                .select('*')
                .eq('id' as any, productId as any)
                .is('deleted_at', null)
                .single();

            if (error) {
                console.error('Erro ao buscar produto atualizado:', error);
                if (error.code === 'PGRST116') {
                    toast({
                        title: 'Produto não disponível',
                        description: 'Este produto foi deletado ou não está mais disponível.',
                        variant: 'destructive',
                    });
                    return null;
                }
                toast({
                    title: 'Erro ao carregar produto',
                    description: 'Não foi possível carregar os dados do produto.',
                    variant: 'destructive',
                });
                return null;
            }
            return updatedProduct as unknown as Product;
        } catch (error) {
            console.error('Erro na busca do produto:', error);
            toast({
                title: 'Erro ao carregar produto',
                description: 'Ocorreu um erro inesperado ao carregar o produto.',
                variant: 'destructive',
            });
            return null;
        }
    };

    return {
        editProductMutation,
        handleRestoreProduct,
        restoringProductId,
        fetchFreshProduct
    };
};
