/**
 * Hook coordenador para lógica de formulário de produto
 * Combina todos os hooks especializados em uma interface única
 */

import { ProductFormData } from '@/core/types/inventory.types';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { useProductForm } from './useProductForm';
import { useProductCalculations } from './useProductCalculations';
import { useProductValidation } from './useProductValidation';

export const CATEGORIES = [
  'Vinho Tinto',
  'Vinho Branco',
  'Vinho Rosé',
  'Espumante',
  'Champagne',
  'Whisky',
  'Vodka',
  'Gin',
  'Rum',
  'Cachaça',
  'Cerveja',
  'Outros'
];

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
  // Estado do formulário
  const { formData, handleInputChange, resetForm, updateFormData } = useProductForm(initialData);

  // Cálculos automáticos
  const { calculations, validation, handleMarginChange } = useProductCalculations(formData, updateFormData);

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
    categories: CATEGORIES,

    // Handlers
    handleInputChange,
    handleSubmit,
    handleCancel,
    handleBarcodeScanned,
    handleMarginChange,
    updateFormData,

    // Utilities
    resetForm
  };
};