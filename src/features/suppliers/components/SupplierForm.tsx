/* eslint-disable react-hooks/exhaustive-deps */
/**
 * SupplierForm.tsx - TACTICAL STITCH REDESIGN
 * Layout: 2-Col Side Sheet (Glass/Dark Mode)
 * Based on NewProductModal v2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Building2, 
  Phone, 
  MessageCircle, 
  Truck, 
  DollarSign, 
  CreditCard, 
  X,
  Save,
  Lock,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent } from '@/shared/ui/primitives/sheet';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import { Label } from '@/shared/ui/primitives/label';
import { Form } from '@/shared/ui/primitives/form';
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
      toast.error("Erro ao salvar fornecedor. Tente novamente.");
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    formData.reset();
    setCustomProducts(['']);
    onClose();
  };

  const inputClasses = cn(getGlassInputClasses('form'), 'h-10 text-sm bg-black/40 border-white/10 focus:border-primary/50');

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent 
        side="right" 
        className="w-full max-w-[1000px] sm:max-w-[1000px] bg-zinc-950 border-l border-white/5 p-0 shadow-[0_0_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
      >
        <div className="h-full flex flex-col relative w-full">
          
          {/* HEADER TÁTICO */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-50">
             <div className="flex flex-col">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                   <Building2 className="h-6 w-6 text-primary" /> 
                   {mode === 'create' ? 'NOVO FORNECEDOR' : 'EDITAR FORNECEDOR'}
                </h2>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1 ml-8">
                   Gestão de Parceiros v2.0
                </span>
             </div>
             
             <button 
                onClick={handleClose} 
                disabled={isSubmitting}
                className="group p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none disabled:opacity-50"
             >
                <X className="h-6 w-6 text-zinc-500 group-hover:text-white transition-colors" />
             </button>
          </div>

          {/* BACKGROUND AMBIENT LIGHTING */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />
          </div>

          {/* FORM GRID (SCROLLABLE) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
             <Form {...form}>
                <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="h-full">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                      
                      {/* COLUNA 1: IDENTIDADE E CONTATO */}
                      <div className="space-y-8 lg:pr-8">
                        
                        {/* Identidade */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <User className="h-4 w-4" /> Identidade
                            </h3>
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-zinc-400">Nome da Empresa *</label>
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
                        </div>

                        {/* Contatos */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Phone className="h-4 w-4" /> Contatos
                            </h3>
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5 text-zinc-400">Telefone</label>
                                        <Input
                                            {...form.register('contact_info.phone')}
                                            placeholder="(11) 99999-9999"
                                            className={inputClasses}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5 text-zinc-400">WhatsApp</label>
                                        <Input
                                            {...form.register('contact_info.whatsapp')}
                                            placeholder="(11) 99999-9999"
                                            className={inputClasses}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-zinc-400">Email</label>
                                    <Input
                                        type="email"
                                        {...form.register('contact_info.email')}
                                        placeholder="contato@empresa.com"
                                        className={inputClasses}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Mix de Produtos */}
                         <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Truck className="h-4 w-4" /> Mix de Produtos
                            </h3>
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                                    {customProducts.map((product, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={product}
                                            onChange={(e) => handleProductChange(index, e.target.value)}
                                            placeholder="Ex: Cerveja, Vinho..."
                                            className={cn(inputClasses, 'flex-1')}
                                        />
                                        {customProducts.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveProduct(index)} className="h-10 w-10 p-0 hover:bg-red-500/20 hover:text-red-400 rounded-lg">
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {index === customProducts.length - 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={handleAddProduct} className="h-10 w-10 p-0 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg">
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
                        </div>

                      </div>

                      {/* COLUNA 2: COMERCIAL E PAGAMENTO */}
                      <div className="space-y-8 lg:border-l lg:border-white/5 lg:pl-8">
                         
                         {/* Condições Comerciais */}
                         <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <DollarSign className="h-4 w-4" /> Condições Comerciais
                            </h3>
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium mb-1.5 text-zinc-400">Prazo de Entrega</label>
                                        <Select value={form.watch('delivery_time') || ''} onValueChange={(value) => formData.setValue('delivery_time', value)}>
                                            <SelectTrigger className={inputClasses}>
                                                <SelectValue placeholder="Selecione..." />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900/95 border-white/10 text-white backdrop-blur-xl">
                                                {DELIVERY_TIME_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value} className="focus:bg-white/10 hover:bg-white/10 cursor-pointer">
                                                    {option.label}
                                                </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium mb-1.5 text-zinc-400">Pedido Mínimo (R$)</label>
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

                                <div>
                                    <label className="block text-xs font-medium mb-1.5 text-zinc-400">Notas de Negociação</label>
                                    <Textarea
                                        {...form.register('notes')}
                                        placeholder="Detalhes sobre prazos, contatos específicos, ou observações..."
                                        rows={4}
                                        className={cn(inputClasses, 'min-h-[100px] h-auto resize-none')}
                                    />
                                </div>
                            </div>
                         </div>

                         {/* Pagamento */}
                         <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                                <CreditCard className="h-4 w-4" /> Pagamento
                            </h3>
                            <div className="p-5 rounded-xl bg-white/5 border border-white/5 space-y-4">
                                <div className="grid grid-cols-1 gap-2">
                                    {PAYMENT_METHODS_OPTIONS.map((method) => (
                                        <div key={method.value} 
                                            className={cn(
                                                "flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                                form.watch('payment_methods')?.includes(method.value)
                                                  ? "bg-primary/10 border-primary/30"
                                                  : "bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10"
                                            )}
                                            onClick={() => handlePaymentMethodToggle(method.value, !form.watch('payment_methods')?.includes(method.value))}
                                        >
                                            <Checkbox
                                                id={method.value}
                                                checked={form.watch('payment_methods')?.includes(method.value) || false}
                                                onCheckedChange={(checked) => handlePaymentMethodToggle(method.value, checked as boolean)}
                                                className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-black"
                                            />
                                            <Label htmlFor={method.value} className="text-sm text-zinc-300 cursor-pointer select-none font-medium flex-1">
                                                {method.label}
                                            </Label>
                                            {form.watch('payment_methods')?.includes(method.value) && (
                                                <DollarSign className="h-3.5 w-3.5 text-primary" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {form.formState.errors.payment_methods && (
                                    <p className="text-xs text-red-400">{form.formState.errors.payment_methods.message}</p>
                                )}
                            </div>
                         </div>

                      </div>

                   </div>
                </form>
             </Form>
          </div>

          {/* FOOTER (FIXO) */}
          <div className="border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl px-8 py-6 sticky bottom-0 z-50 flex items-center justify-between mt-auto">
             <div className="hidden sm:flex items-center gap-2 text-zinc-600 text-[10px] font-bold tracking-widest uppercase">
                <Lock className="h-3 w-3" />
                Dados Seguros & Criptografados
             </div>

             <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <Button 
                   type="button"
                   variant="ghost"
                   onClick={handleClose}
                   disabled={isSubmitting}
                   className="rounded-full px-6 text-zinc-400 hover:text-white hover:bg-white/5"
                >
                   Cancelar
                </Button>

                <Button 
                   onClick={handleFormSubmit}
                   disabled={isSubmitting}
                   className="relative group rounded-full px-8 py-6 bg-primary hover:bg-primary/90 text-black font-bold tracking-wide shadow-[0_0_20px_rgba(244,202,37,0.3)] hover:shadow-[0_0_35px_rgba(244,202,37,0.5)] hover:scale-[1.02] transition-all overflow-hidden"
                >
                   {/* Shine Effect */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                   
                   <span className="relative flex items-center gap-2">
                      {isSubmitting ? (
                         <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                            Processando...
                         </>
                      ) : (
                         <>
                           <Save className="h-4 w-4" /> 
                           {mode === 'create' ? 'CADASTRAR' : 'SALVAR'}
                         </>
                      )}
                   </span>
                </Button>
             </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};