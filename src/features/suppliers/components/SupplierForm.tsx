/* eslint-disable react-hooks/exhaustive-deps */
/**
 * SupplierForm.tsx - Modal para criar/editar fornecedores
 * Estilo padronizado: FormDialog + emojis + layout compacto
 */

import React, { useState } from 'react';
import { Plus, Minus, Building2, Phone, MessageCircle, Mail } from 'lucide-react';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import { Label } from '@/shared/ui/primitives/label';
import { useCreateSupplierForm, useEditSupplierForm } from '../hooks/useSupplierForm';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import type { Supplier } from '../types';
import { PAYMENT_METHODS_OPTIONS, DELIVERY_TIME_OPTIONS } from '../types';

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  supplier?: Supplier;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({ isOpen, onClose, mode, supplier }) => {
  const [customProducts, setCustomProducts] = useState<string[]>(['']);

  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const createForm = useCreateSupplierForm();
  const editForm = useEditSupplierForm(supplier || {} as Supplier);

  const formData = mode === 'create' ? createForm : editForm;
  const form = formData.form;
  const isSubmitting = formData.isLoading || (mode === 'create' ? createSupplier.isPending : updateSupplier.isPending);

  // Reset form when closing
  React.useEffect(() => {
    if (!isOpen) {
      formData.reset();
      setCustomProducts(['']);
    }
  }, [isOpen]);

  // Initialize custom products for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && supplier?.products_supplied) {
      setCustomProducts([...supplier.products_supplied, '']);
    }
  }, [mode, supplier?.id]);

  const handleAddProduct = () => setCustomProducts([...customProducts, '']);

  const handleRemoveProduct = (index: number) => {
    if (customProducts.length > 1) {
      const newProducts = customProducts.filter((_, i) => i !== index);
      setCustomProducts(newProducts);
      formData.setValue('products_supplied', newProducts.filter(p => p.trim()));
    }
  };

  const handleProductChange = (index: number, value: string) => {
    const newProducts = [...customProducts];
    newProducts[index] = value;
    setCustomProducts(newProducts);
    formData.setValue('products_supplied', newProducts.filter(p => p.trim()));
  };

  const handlePaymentMethodToggle = (method: string, checked: boolean) => {
    const currentMethods = form.getValues('payment_methods') || [];
    const newMethods = checked ? [...currentMethods, method] : currentMethods.filter(m => m !== method);
    formData.setValue('payment_methods', newMethods);
  };

  const handleFormSubmit = async () => {
    try {
      await formData.handleSubmit();
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    formData.reset();
    setCustomProducts(['']);
    onClose();
  };

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title={mode === 'create' ? 'NOVO FORNECEDOR' : 'EDITAR FORNECEDOR'}
      description="Cadastre os dados do fornecedor"
      onSubmit={handleFormSubmit}
      submitLabel={isSubmitting ? 'Salvando...' : mode === 'create' ? 'Criar Fornecedor' : 'Salvar'}
      cancelLabel="Cancelar"
      loading={isSubmitting}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-6xl"
    >
      {/* Layout em 3 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ========================================== */}
        {/* COLUNA 1 - Empresa + Contatos */}
        {/* ========================================== */}
        <div className="space-y-4">
          {/* Empresa */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <Building2 className="h-4 w-4 text-primary-yellow" />
              🏢 Empresa
            </h3>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📝 Nome da Empresa *</label>
              <Input
                {...form.register('company_name')}
                placeholder="Ex: Distribuidora ABC Ltda"
                className={inputClasses}
              />
              {form.formState.errors.company_name && (
                <p className="text-xs text-red-400 mt-1">{form.formState.errors.company_name.message}</p>
              )}
            </div>
          </div>

          {/* Contatos */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              <Phone className="h-4 w-4 text-primary-yellow" />
              📱 Contatos
            </h3>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📞 Telefone</label>
              <Input
                {...form.register('contact_info.phone')}
                placeholder="(11) 99999-9999"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">💬 WhatsApp</label>
              <Input
                {...form.register('contact_info.whatsapp')}
                placeholder="(11) 99999-9999"
                className={inputClasses}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-gray-400">📧 Email</label>
              <Input
                type="email"
                {...form.register('contact_info.email')}
                placeholder="contato@empresa.com"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 2 - Produtos + Comercial */}
        {/* ========================================== */}
        <div className="space-y-4">
          {/* Produtos */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              📦 Produtos Fornecidos *
            </h3>

            <div className="space-y-2 max-h-32 overflow-y-auto">
              {customProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={product}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    placeholder="Ex: Cerveja, Vinho..."
                    className={cn(inputClasses, 'flex-1')}
                  />
                  {customProducts.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProduct(index)} className="h-9 w-9 p-0 hover:bg-red-500/20 hover:text-red-400">
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {index === customProducts.length - 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddProduct} className="h-9 w-9 p-0 hover:bg-green-500/20 hover:text-green-400">
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {form.formState.errors.products_supplied && (
              <p className="text-xs text-red-400">{form.formState.errors.products_supplied.message}</p>
            )}
          </div>

          {/* Comercial */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
              💼 Condições Comerciais
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🚚 Prazo Entrega</label>
                <Select value={form.watch('delivery_time') || ''} onValueChange={(value) => formData.setValue('delivery_time', value)}>
                  <SelectTrigger className={inputClasses}>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20">
                    {DELIVERY_TIME_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-white/10">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">💰 Pedido Mín (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('minimum_order_value', { valueAsNumber: true })}
                  placeholder="0.00"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-3">
            <label className="block text-xs font-medium mb-1 text-gray-400">📋 Observações</label>
            <Textarea
              {...form.register('notes')}
              placeholder="Informações adicionais..."
              rows={2}
              className={cn(inputClasses, 'min-h-[50px] h-auto')}
            />
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 3 - Formas de Pagamento */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            💳 Formas de Pagamento *
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS_OPTIONS.map((method) => (
              <div key={method.value} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                <Checkbox
                  id={method.value}
                  checked={form.watch('payment_methods')?.includes(method.value) || false}
                  onCheckedChange={(checked) => handlePaymentMethodToggle(method.value, checked as boolean)}
                  className="border-white/30 data-[state=checked]:bg-primary-yellow data-[state=checked]:border-primary-yellow"
                />
                <Label htmlFor={method.value} className="text-xs text-gray-300 cursor-pointer">
                  {method.label}
                </Label>
              </div>
            ))}
          </div>
          {form.formState.errors.payment_methods && (
            <p className="text-xs text-red-400">{form.formState.errors.payment_methods.message}</p>
          )}
        </div>
      </div>
    </FormDialog>
  );
};