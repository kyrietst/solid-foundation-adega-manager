import React, { useEffect, useState } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useCustomer, useUpsertCustomer } from '@/features/customers/hooks/use-crm';
import { Loader2, Save, X, Camera, Lock } from 'lucide-react';
import { useStandardForm } from '@/shared/hooks/common/useStandardForm';
import { CustomerFormValues, customerSchema } from '../schemas/customerSchema';
import { Form } from '@/shared/ui/primitives/form';
import { Button } from '@/shared/ui/primitives/button';
import { cn } from '@/core/config/utils';
import { DialogOverlay, DialogPortal } from '@/shared/ui/primitives/dialog';

// Sub-components
import { CustomerGeneralTab } from './edit/CustomerGeneralTab';
import { CustomerAddressTab } from './edit/CustomerAddressTab';
import { CustomerPreferencesTab } from './edit/CustomerPreferencesTab';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: { id: string; name: string } | null;
}

// Custom "Stitch" Styled Content - Pixel Perfect Implementation
// UPDATED: Fixed height sm:h-[720px] to prevent jitter when switching tabs
const StitchContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
        "max-w-4xl h-[85vh] sm:h-[720px] flex flex-col", // FIXED HEIGHT for stability
        "bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-2xl outline-none rounded-3xl", // User requested styles
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
StitchContent.displayName = "StitchContent";

export const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const customerId = customer?.id;
  const { data: customerData, isLoading: isLoadingData } = useCustomer(customerId || '');
  const upsertCustomer = useUpsertCustomer();
  const [activeTab, setActiveTab] = useState('general');

  // Form Setup
  const { form, isLoading, handleSubmit } = useStandardForm<CustomerFormValues>({
    schema: customerSchema,
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: {
        cep: '',
        logradouro: '',
        numero: '',
        bairro: '',
        nome_municipio: '',
        uf: '',
        complemento: '',
        codigo_municipio: '',
        pais: 'Brasil',
        codigo_pais: '1058'
      },
      birthday: '',
      contact_preference: undefined,
      contact_permission: true,
      notes: '',
      tags: [],
      cpf_cnpj: '',
      ie: '',
      indicador_ie: 9,
    },
    onSuccess: `Cliente atualizado com sucesso!`,
    onError: 'Erro ao atualizar cliente',
    onSubmit: async (data: CustomerFormValues) => {
      const payload = {
        ...data,
        id: customerId,
        // Sanitize
        birthday: data.birthday === '' ? null : data.birthday,
        email: data.email === '' ? null : data.email,
        phone: data.phone === '' ? null : data.phone,
        notes: data.notes === '' ? null : data.notes,
        cpf_cnpj: data.cpf_cnpj === '' ? null : data.cpf_cnpj,
        ie: data.ie === '' ? null : data.ie,
        contact_preference: (data.contact_preference as any) || null,
        // Address sanitization to FiscalAddress (Strict)
        address: data.address && data.address.cep ? {
          cep: data.address.cep,
          logradouro: data.address.logradouro || '',
          numero: data.address.numero || '',
          bairro: data.address.bairro || '',
          nome_municipio: data.address.nome_municipio || '',
          uf: data.address.uf || '',
          complemento: data.address.complemento || '',
          codigo_municipio: data.address.codigo_municipio || '',
          pais: data.address.pais || 'Brasil',
          codigo_pais: data.address.codigo_pais || '1058'
        } : null,
      };
      await upsertCustomer.mutateAsync(payload);
    },
    onSuccessCallback: onClose,
  });

  // Populate data
  useEffect(() => {
    if (customerData) {
      const addressData = customerData.address as any;
      form.reset({
        name: customerData.name,
        email: customerData.email || '',
        phone: customerData.phone || '',
        birthday: customerData.birthday || '',
        contact_preference: (customerData.contact_preference as any) || '',
        contact_permission: customerData.contact_permission ?? true,
        notes: customerData.notes || '',
        cpf_cnpj: customerData.cpf_cnpj || '',
        ie: customerData.ie || '',
        indicador_ie: customerData.indicador_ie || 9,
        tags: (customerData.tags as any) || [],
        address: addressData ? {
          cep: addressData.cep || '',
          logradouro: addressData.logradouro || '',
          numero: addressData.numero || '',
          bairro: addressData.bairro || '',
          nome_municipio: addressData.nome_municipio || '',
          uf: addressData.uf || '',
          complemento: addressData.complemento || '',
          codigo_municipio: addressData.codigo_municipio || '',
          pais: addressData.pais || 'Brasil',
          codigo_pais: addressData.codigo_pais || '1058'
        } : undefined
      });
    }
  }, [customerData, form]);

  if (!customer) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <StitchContent>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="flex flex-col h-full">

            {/* Header & Nav */}
            <div className="flex flex-col border-b border-white/5 bg-zinc-900/30 shrink-0">
              <div className="flex items-center justify-between px-8 py-5">
                <div className="flex flex-col">
                  <h3 className="text-white text-2xl font-bold tracking-tight">Editar Cliente</h3>
                  <p className="text-zinc-500 text-sm mt-1">Gerencie as informações fiscais e de contato.</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="group p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-500 hover:text-white focus:outline-none"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>

              {/* Navigation Tabs (Custom Implementation matching HTML) */}
              <div className="px-8 flex gap-8 overflow-x-auto no-scrollbar">
                {['general', 'address', 'preferences'].map((tab) => {
                  const isActive = activeTab === tab;
                  const label = tab === 'general' ? 'Geral' : tab === 'address' ? 'Endereço & Fiscal' : 'Preferências';
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "relative pb-4 text-sm font-bold tracking-wide whitespace-nowrap transition-colors",
                        isActive ? "text-white" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-amber-500 rounded-t-full shadow-[0_-2px_8px_rgba(245,158,11,0.8)]"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
              {/* Render Tab Data */}
              {isLoadingData ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Static Profile Header */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-10">
                    {/* Avatar */}
                    <div className="relative group cursor-pointer shrink-0">
                      <div className="w-24 h-24 rounded-full bg-zinc-800 border-[3px] border-zinc-900/50 outline outline-1 outline-white/10 overflow-hidden shadow-2xl relative flex items-center justify-center">
                        <span className="text-3xl font-bold text-zinc-600 group-hover:text-zinc-400 transition-colors">
                          {customer.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute inset-0 rounded-full bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[1px]">
                        <Camera className="w-6 h-6 text-white mb-1" />
                        <span className="text-[8px] uppercase font-bold text-white tracking-widest">Alterar</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left pt-2">
                      <h2 className="text-3xl font-bold text-white leading-tight mb-1">{customer.name}</h2>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                          VIP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tab Configuration */}
                  {activeTab === 'general' && <CustomerGeneralTab />}
                  {activeTab === 'address' && <CustomerAddressTab />}
                  {activeTab === 'preferences' && <CustomerPreferencesTab />}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-8 py-6 border-t border-white/5 bg-zinc-900/80 backdrop-blur-xl relative z-20 shrink-0">
              <div className="hidden sm:flex items-center gap-2 text-zinc-500 text-[11px] font-medium tracking-wide">
                <Lock className="w-3 h-3" />
                End-to-end encrypted
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="ghost"
                  className="px-6 py-3 rounded-full text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all h-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="relative group px-8 py-3 rounded-full text-sm font-bold bg-amber-500 text-zinc-950 overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-[1.02] border-0 h-auto"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Salvar Alterações
                  </span>
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </StitchContent>
    </DialogPrimitive.Root>
  );
};

export default EditCustomerModal;