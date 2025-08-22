/**
 * Componente de formulário para criar/editar fornecedores
 */

import React, { useState } from 'react';
import { X, Save, Building2, Phone, Mail, MessageCircle, Plus, Minus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/primitives/dialog';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { useCreateSupplierForm, useEditSupplierForm } from '../hooks/useSupplierForm';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers';
import { cn } from '@/core/config/utils';
import { getSFProTextClasses } from '@/core/config/theme-utils';
import type { Supplier } from '../types';
import { PAYMENT_METHODS_OPTIONS, DELIVERY_TIME_OPTIONS } from '../types';

interface SupplierFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  supplier?: Supplier;
}

export const SupplierForm: React.FC<SupplierFormProps> = ({
  isOpen,
  onClose,
  mode,
  supplier,
}) => {
  const [customProducts, setCustomProducts] = useState<string[]>(['']);
  
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  
  const createForm = useCreateSupplierForm();
  const editForm = useEditSupplierForm(supplier || {} as Supplier);
  
  const form = mode === 'create' ? createForm : editForm;
  const isSubmitting = mode === 'create' ? createSupplier.isPending : updateSupplier.isPending;
  
  // Reset form when closing
  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      setCustomProducts(['']);
    }
  }, [isOpen]); // Removido 'form' da dependência
  
  // Initialize custom products for edit mode
  React.useEffect(() => {
    if (mode === 'edit' && supplier?.products_supplied) {
      setCustomProducts([...supplier.products_supplied, '']);
    }
  }, [mode, supplier?.id]); // Usar supplier.id ao invés do objeto completo
  
  const handleAddProduct = () => {
    setCustomProducts([...customProducts, '']);
  };
  
  const handleRemoveProduct = (index: number) => {
    if (customProducts.length > 1) {
      const newProducts = customProducts.filter((_, i) => i !== index);
      setCustomProducts(newProducts);
      
      // Update form value
      const validProducts = newProducts.filter(p => p.trim());
      form.setValue('products_supplied', validProducts);
    }
  };
  
  const handleProductChange = (index: number, value: string) => {
    const newProducts = [...customProducts];
    newProducts[index] = value;
    setCustomProducts(newProducts);
    
    // Update form value with valid products
    const validProducts = newProducts.filter(p => p.trim());
    form.setValue('products_supplied', validProducts);
  };
  
  const handlePaymentMethodToggle = (method: string, checked: boolean) => {
    const currentMethods = form.getValues('payment_methods') || [];
    const newMethods = checked
      ? [...currentMethods, method]
      : currentMethods.filter(m => m !== method);
    
    form.setValue('payment_methods', newMethods);
  };
  
  const handleFormSubmit = form.handleSubmitWithCallback(async (data: any) => {
    // Clean up products_supplied to remove empty strings
    const cleanedData = {
      ...data,
      products_supplied: data.products_supplied.filter((p: string) => p.trim()),
    };
    
    // Call the mutation directly
    if (mode === 'create') {
      await createSupplier.mutateAsync(cleanedData);
    } else if (supplier) {
      await updateSupplier.mutateAsync({ id: supplier.id, data: cleanedData });
    }
    
    onClose();
  });
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-purple-500/30 shadow-2xl">
        <DialogHeader>
          <DialogTitle className={cn(
            "flex items-center gap-2 text-xl font-bold text-white",
            getSFProTextClasses('heading', 'lg')
          )}>
            <Building2 className="h-6 w-6 text-purple-400" />
            {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Informações básicas */}
          <Card className="bg-black/70 backdrop-blur-xl border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-400" />
                Informações da Empresa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name" className="text-gray-300">
                  Nome da Empresa *
                </Label>
                <Input
                  id="company_name"
                  {...form.register('company_name')}
                  placeholder="Ex: Distribuidora ABC Ltda"
                  className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                />
                {form.formState.errors.company_name && (
                  <p className="text-sm text-red-400 mt-1">
                    {form.formState.errors.company_name.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Informações de contato */}
          <Card className="bg-black/70 border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-400" />
                Contatos
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  {...form.register('contact_info.phone')}
                  placeholder="(11) 99999-9999"
                  className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp" className="text-gray-300 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  {...form.register('contact_info.whatsapp')}
                  placeholder="(11) 99999-9999"
                  className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('contact_info.email')}
                  placeholder="contato@empresa.com"
                  className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                />
              </div>
              
              {form.formState.errors.contact_info && (
                <div className="md:col-span-3">
                  <p className="text-sm text-red-400">
                    {form.formState.errors.contact_info.message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Produtos fornecidos */}
          <Card className="bg-black/70 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Produtos Fornecidos *</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {customProducts.map((product, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={product}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    placeholder="Ex: Cerveja, Vinho, Refrigerante..."
                    className="flex-1 bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                  />
                  {customProducts.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(index)}
                      className="h-10 w-10 p-0 hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                  {index === customProducts.length - 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddProduct}
                      className="h-10 w-10 p-0 hover:bg-green-500/20 hover:text-green-400"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {form.formState.errors.products_supplied && (
                <p className="text-sm text-red-400">
                  {form.formState.errors.products_supplied.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Informações comerciais */}
          <Card className="bg-black/70 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Condições Comerciais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_time" className="text-gray-300">
                  Prazo de Entrega
                </Label>
                <Select
                  value={form.watch('delivery_time') || ''}
                  onValueChange={(value) => form.setValue('delivery_time', value)}
                >
                  <SelectTrigger className="bg-black/70 border-white/30 text-white">
                    <SelectValue placeholder="Selecione o prazo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900/95 border-white/20 backdrop-blur-xl">
                    {DELIVERY_TIME_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-white/10"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="minimum_order_value" className="text-gray-300">
                  Valor Mínimo de Pedido (R$)
                </Label>
                <Input
                  id="minimum_order_value"
                  type="number"
                  step="0.01"
                  min="0"
                  {...form.register('minimum_order_value', { valueAsNumber: true })}
                  placeholder="0.00"
                  className="bg-black/70 border-white/30 text-white placeholder:text-gray-400"
                />
                {form.formState.errors.minimum_order_value && (
                  <p className="text-sm text-red-400 mt-1">
                    {form.formState.errors.minimum_order_value.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Formas de pagamento */}
          <Card className="bg-black/70 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Formas de Pagamento Aceitas *</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {PAYMENT_METHODS_OPTIONS.map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={method.value}
                      checked={form.watch('payment_methods')?.includes(method.value) || false}
                      onCheckedChange={(checked) => 
                        handlePaymentMethodToggle(method.value, checked as boolean)
                      }
                      className="border-white/30 data-[state=checked]:bg-primary-yellow data-[state=checked]:border-primary-yellow"
                    />
                    <Label 
                      htmlFor={method.value} 
                      className="text-sm text-gray-300 cursor-pointer"
                    >
                      {method.label}
                    </Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.payment_methods && (
                <p className="text-sm text-red-400 mt-2">
                  {form.formState.errors.payment_methods.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Observações */}
          <Card className="bg-black/70 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...form.register('notes')}
                placeholder="Informações adicionais sobre o fornecedor..."
                rows={3}
                className="bg-black/70 border-white/30 text-white placeholder:text-gray-400 resize-none"
              />
              {form.formState.errors.notes && (
                <p className="text-sm text-red-400 mt-1">
                  {form.formState.errors.notes.message}
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-transparent border-white/30 text-white hover:bg-white/10"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-yellow text-black hover:bg-primary-yellow/90 font-medium"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Criar Fornecedor' : 'Salvar Alterações'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};