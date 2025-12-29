import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useInventoryCalculations } from '@/features/inventory/hooks/useInventoryCalculations';
import { Product } from '@/core/types/inventory.types';

// Schema Unificado (Simplificado conforme os modais originais)
// Nota: Em um mundo ideal, importariamos isso de um arquivo de schemas
export const productFormSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(200),
  category: z.string().min(1, 'Categoria obrigatória'),
  price: z.number().min(0.01, 'Preço deve ser maior que zero'),
  cost_price: z.number().min(0).optional().default(0),
  barcode: z.string().optional().or(z.literal('')),
  supplier: z.string().optional().or(z.literal('')),
  has_package_tracking: z.boolean().default(false),
  package_barcode: z.string().optional().or(z.literal('')),
  package_units: z.number().min(1).optional().default(1),
  package_price: z.number().min(0.01).optional().or(z.literal(0)).or(z.literal(undefined)),

  // Fiscal / Opcionais (Relaxados para evitar conflitos)
  ncm: z.string().optional(),
  cest: z.string().optional(),
  cfop: z.string().optional(),
  origin: z.union([z.string(), z.number()]).optional(),

  // Campos extras permitidos
  volume_ml: z.any().optional(),
  margin_percent: z.number().optional(),
}).passthrough(); // Permite outros campos se necessário (legacy)

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface UseProductFormLogicProps {
  initialData?: Partial<Product> | null;
  mode: 'create' | 'edit';
  onSubmit: (data: ProductFormValues) => Promise<void> | void;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const useProductFormLogic = ({
  initialData,
  mode,
  onSubmit,
  onSuccess,
  onClose
}: UseProductFormLogicProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializa o formulário
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      category: '',
      price: 0,
      cost_price: 0,
      barcode: '',
      supplier: '',
      has_package_tracking: false,
      package_barcode: '',
      package_units: 1,
      package_price: undefined,
      margin_percent: 0,
      volume_ml: 0,
    }
  });

  const formValues = form.watch();
  const calculations = useInventoryCalculations(formValues as any);

  // Reset form quando initialData muda (modo edit)
  useEffect(() => {
    if (initialData && mode === 'edit') {
      form.reset({
        ...initialData,
        // Garantir conversões de tipos
        price: Number(initialData.price || 0),
        cost_price: initialData.cost_price ? Number(initialData.cost_price) : 0,
        package_units: initialData.package_units || 1,
        package_price: initialData.package_price ? Number(initialData.package_price) : undefined,
        // Campos de texto opcionais
        barcode: initialData.barcode || '',
        supplier: initialData.supplier || '', // Tratamento específico para supplier null
        package_barcode: initialData.package_barcode || '',
        // Fiscal e outros
        ncm: initialData.ncm || '',
        cest: initialData.cest || '',
        cfop: initialData.cfop || '',
        origin: initialData.origin || '',
        has_package_tracking: initialData.has_package_tracking || false,
      } as any); // Cast necessário devido à complexidade do form vs modelo
    } else if (mode === 'create') {
      form.reset({
        name: '',
        category: '',
        price: 0,
        cost_price: 0,
        margin_percent: 0,
        has_package_tracking: false,
        package_units: 1,
        supplier: '', // Default para create
      });
    }
  }, [initialData, mode, form]);

  // Handler de submissão
  const handleSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);

      toast({
        title: mode === 'create' ? "Produto criado!" : "Produto atualizado!",
        description: `O produto ${data.name} foi ${mode === 'create' ? 'salvo' : 'atualizado'} com sucesso.`,
        variant: "default",
      });

      onSuccess?.();
      onClose?.();

      if (mode === 'create') {
        form.reset();
      }
    } catch (error: any) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao processar o produto.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers para input manual e recálculo
  const handlePriceChange = (value: number) => {
    form.setValue('price', value);
    // Recalcular margem
    const cost = form.getValues('cost_price') || 0;
    if (cost > 0 && value > 0) {
      const margin = calculations.calculateRequiredMargin(cost, value);
      form.setValue('margin_percent', margin);
    }
  };

  const handleCostPriceChange = (value: number) => {
    form.setValue('cost_price', value);
    // Recalcular preço baseado na margem atual (opcional) ou recalcular margem baseado no preço atual
    // Geralmente, ao mudar custo, mantemos a margem e sugerimos novo preço, OU mantemos preço e recalculamos margem.
    // Aqui vamos recalcular a margem para não alterar o preço de venda sem querer.
    const price = form.getValues('price') || 0;
    if (value > 0 && price > 0) {
      const margin = calculations.calculateRequiredMargin(value, price);
      form.setValue('margin_percent', margin);
    }
  };

  const handleMarginChange = (value: number) => {
    form.setValue('margin_percent', value);
    // Recalcular preço de venda
    const cost = form.getValues('cost_price') || 0;
    if (cost > 0) {
      const newPrice = calculations.calculatePriceWithMargin(cost, value);
      form.setValue('price', newPrice);
    }
  };

  // Handlers de Cálculo
  return {
    form,
    isSubmitting,
    handleSubmit: form.handleSubmit(handleSubmit),
    calculations: {
      ...calculations.calculations, // Expose raw calculated values like margins
      ...calculations, // Expose helper functions like calculatePriceWithMargin
      handlePriceChange,
      handleCostPriceChange,
      handleMarginChange
    }
  };
};