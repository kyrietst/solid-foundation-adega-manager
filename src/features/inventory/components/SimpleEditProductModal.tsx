
/**
 * SimpleEditProductModal.tsx - Modal para edição de produtos
 * Refatorado para usar lógica e UI fragmentadas
 */

import React, { useState, useEffect } from 'react';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { Form } from '@/shared/ui/primitives/form';
import { supabase } from '@/core/api/supabase/client';
import type { Product } from '@/core/types/inventory.types';
import { DeleteProductModal } from './DeleteProductModal';

// Components
import { ProductIdentityForm } from '@/features/inventory/components/product-form/ProductIdentityForm';
import { ProductPackageForm } from '@/features/inventory/components/product-form/ProductPackageForm';
import { ProductPricingCard } from '@/features/inventory/components/product-form/ProductPricingCard';

import { useProductFormLogic, ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';
import { getGlassInputClasses } from '@/core/config/theme-utils'; // Added import for styling
import { useToast } from '@/shared/hooks/common/use-toast'; // Added import

// ---------------------------------------------------------------------------
// Component Implementation
// ---------------------------------------------------------------------------

interface SimpleEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSubmit: (data: any) => Promise<void> | void; // Keeping any to match existing signature for now, but ideally ProductFormValues
  isLoading?: boolean;
  onSuccess?: () => void;
}

export const SimpleEditProductModal: React.FC<SimpleEditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading: isParentLoading,
  onSuccess
}) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeScanner, setActiveScanner] = useState<'main' | 'package' | null>(null);

  const { form, handleSubmit, isSubmitting, calculations } = useProductFormLogic({
    initialData: product,
    mode: 'edit',
    onSubmit: async (data: ProductFormValues) => {
      await onSubmit(data); // Delegate to parent
    },
    onSuccess,
    onClose
  });

  // Fetch Data (simpler version)
  useEffect(() => {
    supabase.from('categories').select('name').eq('is_active', true as any).order('name')
      .then(({ data }) => data && setCategories((data as any[]).map(i => i.name)));
    supabase.from('products').select('supplier').not('supplier', 'is', null).neq('supplier', '' as any)
      .then(({ data }) => data && setSuppliers([...new Set((data as any[]).map(i => i.supplier))].sort()));
  }, []);

  const handleBarcodeScanned = (code: string) => {
    form.setValue('barcode', code);
    setActiveScanner(null);
    toast({ title: "Código Escaneado", description: code });
  }

  // Close handler
  const handleClose = () => {
    if (isSubmitting || isParentLoading) return;
    onClose();
  };

  if (!product) return null;

  return (
    <>
      <FormDialog
        open={isOpen}
        onOpenChange={(open) => !open && handleClose()}
        title={`EDITAR: ${product.name}`}
        description="Atualize as informações do produto"
        onSubmit={handleSubmit}
        submitLabel={isSubmitting || isParentLoading ? 'Salvando...' : 'Salvar Alterações'}
        cancelLabel="Cancelar"
        loading={isSubmitting || isParentLoading}
        size="full"
        glassEffect={true}
        variant="default"
        className="max-w-7xl"
        footerWidgets={
          <div className="mr-auto">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors px-2 py-1 hover:bg-red-500/10 rounded-md"
            >
              Excluir Produto
            </button>
          </div>
        }
      >
        <Form {...form}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-4">

            {/* COLUNA 1: IDENTIFICAÇÃO */}
            <div className="space-y-4">
              <ProductIdentityForm
                form={form}
                categories={categories}
                suppliers={suppliers}
                inputClasses={getGlassInputClasses('form')}
                activeScanner={activeScanner}
                onActivateScanner={(type) => setActiveScanner(type)}
                onScan={handleBarcodeScanned}
              />
            </div>

            {/* COLUNA 2: EMPACOTAMENTO */}
            <div className="space-y-4">
              <ProductPackageForm
                form={form}
                inputClasses={getGlassInputClasses('form')}
              />
            </div>

            {/* COLUNA 3: PRECIFICAÇÃO */}
            <div className="space-y-4">
              <ProductPricingCard
                formData={form.watch()}
                calculations={calculations}
                fieldErrors={form.formState.errors}
                onInputChange={(field, value) => form.setValue(field as any, value)}
                onMarginChange={calculations.handleMarginChange}
                onCostPriceChange={calculations.handleCostPriceChange}
                onPriceChange={calculations.handlePriceChange}
                variant="subtle"
                glassEffect={false}
              />
            </div>

          </div>
        </Form>
      </FormDialog>

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        product={product}
        onSuccess={() => {
          setIsDeleteModalOpen(false);
          onClose(); // Close edit modal too
          onSuccess?.();
        }}
      />
    </>
  );
};

export default SimpleEditProductModal;