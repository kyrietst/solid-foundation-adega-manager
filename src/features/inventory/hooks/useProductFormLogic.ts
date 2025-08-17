/**
 * Hook coordenador para lógica de formulário de produto
 * Combina todos os hooks especializados em uma interface única
 */

import { ProductFormData } from '@/core/types/inventory.types';
import { useCategories, categoriesToOptions } from '@/shared/hooks/common/use-categories';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { useProductForm } from './useProductForm';
import { useProductCalculations } from './useProductCalculations';
import { useProductValidation } from './useProductValidation';

interface UseProductFormLogicProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onCancel: () => void;
}

export const useProductFormLogic = ({
  initialData = {},
  onSubmit,
  onCancel
}: UseProductFormLogicProps) => {
  // Buscar categorias do banco de dados
  const { data: dbCategories = [] } = useCategories();
  
  // Estado do formulário
  const { formData, handleInputChange, resetForm, updateFormData } = useProductForm(initialData);

  // Cálculos automáticos - História 1.4
  const { 
    calculations, 
    validation, 
    handleMarginChange, 
    handleCostPriceChange, 
    handlePriceChange 
  } = useProductCalculations(formData, updateFormData);

  // Validações
  const { validateProduct } = useProductValidation();

  // Barcode
  const { validateBarcode } = useBarcode();

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const currentValidation = validateProduct(formData);
    if (currentValidation.isValid) {
      onSubmit(formData as ProductFormData);
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    const barcodeValidation = validateBarcode(barcode);
    if (barcodeValidation.isValid) {
      updateFormData({ barcode });
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  // Validation atualizada
  const currentValidation = validateProduct(formData);

  return {
    // Dados
    formData,
    calculations,
    validation: currentValidation,
    categories: dbCategories.map(cat => cat.name), // Nomes das categorias do banco
    categoriesWithOptions: categoriesToOptions(dbCategories), // Com cores e ícones

    // Handlers
    handleInputChange,
    handleSubmit,
    handleCancel,
    handleBarcodeScanned,
    handleMarginChange,
    // História 1.4: Novos handlers para cálculos em tempo real
    handleCostPriceChange,
    handlePriceChange,
    updateFormData,

    // Utilities
    resetForm
  };
};