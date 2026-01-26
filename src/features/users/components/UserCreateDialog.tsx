/* eslint-disable react-hooks/exhaustive-deps */
/**
 * UserCreateDialog.tsx - Side Sheet para criar novo usuário
 * Estilo padronizado: Sheet + emojis + layout vertical
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/ui/primitives/sheet';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import { useUserCreation } from '../hooks/useUserCreation';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';

// Schema de validação
const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  full_name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  role: z.enum(['admin', 'manager', 'employee', 'seller', 'stock_manager'] as const, {
    required_error: 'Selecione uma função',
  }),
  permissions: z.array(z.string()).optional(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface UserCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: () => void;
}

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({ isOpen, onClose, onUserCreated }) => {
  const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
  const { createUser, isCreating } = useUserCreation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      permissions: [],
      role: 'seller' as any
    },
  });

  // Carregar permissões disponíveis (simulado ou do banco)
  useEffect(() => {
    const fetchPermissions = async () => {
      const defaultPermissions = [
        { id: 'sales.create', name: 'Realizar Vendas' },
        { id: 'sales.view', name: 'Ver Histórico de Vendas' },
        { id: 'products.manage', name: 'Gerenciar Produtos' },
        { id: 'stock.manage', name: 'Gerenciar Estoque' },
        { id: 'financial.view', name: 'Ver Financeiro' },
        { id: 'users.manage', name: 'Gerenciar Usuários' },
      ];
      setAvailablePermissions(defaultPermissions);
    };
    
    if (isOpen) {
      fetchPermissions();
    }
  }, [isOpen]);

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser({
        email: data.email,
        password: data.password,
        name: data.full_name,
        role: data.role,
        // Metadata permissions would handle in backend if supported
        // metadata: { permissions: data.permissions }
      });
      
      reset();
      if (onUserCreated) onUserCreated();
      onClose();
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    reset();
    onClose();
  };

  const selectedPermissions = watch('permissions') || [];

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const current = selectedPermissions;
    if (checked) {
      setValue('permissions', [...current, permissionId]);
    } else {
      setValue('permissions', current.filter(id => id !== permissionId));
    }
  };

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] overflow-y-auto bg-black/95 backdrop-blur-md border-l border-white/10 p-0">
        <div className="h-full flex flex-col">
          {/* Header Fixo */}
          <SheetHeader className="px-6 py-4 border-b border-white/10 bg-black/50 sticky top-0 z-50 backdrop-blur-md">
            <SheetTitle className="text-2xl font-bold text-accent-gold-100 flex items-center gap-2 uppercase tracking-wide">
              <User className="h-6 w-6" /> Novo Colaborador
            </SheetTitle>
            <div className="text-zinc-400 text-sm">Cadastre um novo usuário para acesso ao sistema</div>
          </SheetHeader>

          {/* Form Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

              {/* ========================================== */}
              {/* SEÇÃO 1 - Credenciais */}
              {/* ========================================== */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <User className="h-4 w-4 text-accent-gold-100" />
                  Dados de Acesso
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1.5 ml-1">Nome Completo</label>
                  <Input
                    {...register('full_name')}
                    placeholder="Ex: João da Silva"
                    className={inputClasses}
                  />
                  {errors.full_name && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.full_name.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1.5 ml-1">Email Corporativo</label>
                  <Input
                    type="email"
                    {...register('email')}
                    placeholder="joao@adega.com"
                    className={inputClasses}
                  />
                  {errors.email && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1.5 ml-1">Senha Inicial</label>
                  <Input
                    type="password"
                    {...register('password')}
                    placeholder="******"
                    className={inputClasses}
                  />
                  {errors.password && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
                </div>
              </div>

              {/* ========================================== */}
              {/* SEÇÃO 2 - Função e Permissões */}
              {/* ========================================== */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-2">
                  <Shield className="h-4 w-4 text-accent-gold-100" />
                  Função e Permissões
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-1.5 ml-1">Cargo / Função</label>
                  <Select onValueChange={(val: any) => setValue('role', val)} defaultValue="seller">
                    <SelectTrigger className={inputClasses}>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900/95 border-white/20 backdrop-blur-xl">
                      <SelectItem value="admin" className="text-white focus:bg-white/10 focus:text-accent-gold-100 cursor-pointer">Administrador</SelectItem>
                      <SelectItem value="manager" className="text-white focus:bg-white/10 focus:text-accent-gold-100 cursor-pointer">Gerente</SelectItem>
                      <SelectItem value="stock_manager" className="text-white focus:bg-white/10 focus:text-accent-gold-100 cursor-pointer">Gerente de Estoque</SelectItem>
                      <SelectItem value="seller" className="text-white focus:bg-white/10 focus:text-accent-gold-100 cursor-pointer">Vendedor</SelectItem>
                      <SelectItem value="employee" className="text-white focus:bg-white/10 focus:text-accent-gold-100 cursor-pointer">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && <p className="text-rose-500 text-xs mt-1 ml-1">{errors.role.message}</p>}
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase text-zinc-500 mb-2 ml-1">Permissões Específicas</label>
                  <div className="grid grid-cols-1 gap-2 bg-zinc-900/40 p-3 rounded-lg border border-white/5">
                    {availablePermissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => handlePermissionToggle(permission.id, !selectedPermissions.includes(permission.id))}>
                        <Checkbox
                          id={permission.id}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={(checked) => handlePermissionToggle(permission.id, checked as boolean)}
                          className="border-white/20 data-[state=checked]:bg-accent-gold-100 data-[state=checked]:border-accent-gold-100 data-[state=checked]:text-black"
                        />
                        <div className="flex flex-col cursor-pointer select-none">
                          <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{permission.name}</span>
                          <span className="text-[10px] text-zinc-600 font-mono group-hover:text-zinc-500">{permission.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 bg-black/50 backdrop-blur-md sticky bottom-0 z-50 flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              disabled={isCreating}
              className="hover:bg-white/5 text-zinc-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isCreating}
              className="bg-white text-black hover:bg-zinc-200 shadow-xl font-bold min-w-[150px] transition-all rounded-xl"
            >
              {isCreating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>CRIANDO...</span>
                </div>
              ) : (
                'CRIAR COLABORADOR'
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};