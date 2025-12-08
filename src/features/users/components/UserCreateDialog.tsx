/**
 * UserCreateDialog.tsx - Modal para criação de usuários
 * Estilo padronizado: FormDialog + emojis + layout horizontal compacto
 */

import React, { useState } from 'react';
import { FormDialog } from '@/shared/ui/layout/FormDialog';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { UserCreateDialogProps, NewUserData } from './types';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';
import { Shield, User, Truck, Crown } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';

export const UserCreateDialog: React.FC<UserCreateDialogProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  isSubmitting: externalIsSubmitting,
}) => {
  const [formData, setFormData] = useState<NewUserData>({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createUser } = useUserCreation();
  const { getRoleDescription } = useRoleUtilities();

  const updateField = (field: keyof NewUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) return;

    try {
      setIsSubmitting(true);
      await createUser(formData);
      setFormData({ name: '', email: '', password: '', role: 'employee' });
      onUserCreated();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setFormData({ name: '', email: '', password: '', role: 'employee' });
    onClose();
  };

  const inputClasses = cn(getGlassInputClasses('form'), 'h-9 text-sm');
  const isFormValid = formData.name && formData.email && formData.password;
  const loading = isSubmitting || externalIsSubmitting;

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleClose()}
      title="CRIAR USUÁRIO"
      description="Cadastre um novo usuário no sistema"
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Criando...' : 'Criar Usuário'}
      cancelLabel="Cancelar"
      loading={loading}
      size="full"
      variant="premium"
      glassEffect={true}
      className="max-w-4xl"
    >
      {/* Layout em 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">

        {/* ========================================== */}
        {/* COLUNA 1 - Dados do Usuário */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <User className="h-4 w-4 text-primary-yellow" />
            👤 Dados do Usuário
          </h3>

          {/* Nome */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📝 Nome Completo *</label>
            <Input
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Digite o nome completo"
              className={inputClasses}
              disabled={loading}
            />
            {!formData.name && formData.name !== '' && (
              <p className="text-xs text-red-400 mt-1">⚠️ Nome é obrigatório</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">📧 Email de Acesso *</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="usuario@empresa.com"
              className={inputClasses}
              disabled={loading}
            />
            {!formData.email && formData.email !== '' && (
              <p className="text-xs text-red-400 mt-1">⚠️ Email é obrigatório</p>
            )}
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🔐 Senha de Acesso *</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Digite uma senha segura"
              className={inputClasses}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">🔒 Mínimo 6 caracteres</p>
            {!formData.password && formData.password !== '' && (
              <p className="text-xs text-red-400 mt-1">⚠️ Senha é obrigatória</p>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* COLUNA 2 - Função e Permissões */}
        {/* ========================================== */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
            <Shield className="h-4 w-4 text-primary-yellow" />
            🛡️ Função e Permissões
          </h3>

          {/* Função selecionada - indicador visual */}
          <div className={cn(
            'p-3 rounded-lg border-2 transition-all duration-300',
            formData.role === 'admin' && 'bg-red-500/10 border-red-400/50',
            formData.role === 'employee' && 'bg-blue-500/10 border-blue-400/50',
            formData.role === 'delivery' && 'bg-green-500/10 border-green-400/50'
          )}>
            <div className="flex items-center gap-2 mb-1">
              {formData.role === 'admin' && <Crown className="h-5 w-5 text-red-400" />}
              {formData.role === 'employee' && <User className="h-5 w-5 text-blue-400" />}
              {formData.role === 'delivery' && <Truck className="h-5 w-5 text-green-400" />}
              <span className={cn(
                'font-bold text-sm',
                formData.role === 'admin' && 'text-red-300',
                formData.role === 'employee' && 'text-blue-300',
                formData.role === 'delivery' && 'text-green-300'
              )}>
                {formData.role === 'admin' ? '👑 Administrador' :
                  formData.role === 'employee' ? '👤 Funcionário' : '🛵 Entregador'}
              </span>
            </div>
            <p className="text-xs text-gray-400">{getRoleDescription(formData.role)}</p>
          </div>

          {/* Select de função */}
          <div>
            <label className="block text-xs font-medium mb-1 text-gray-400">🎭 Selecione a Função *</label>
            <Select value={formData.role} onValueChange={(value: 'admin' | 'employee' | 'delivery') => updateField('role', value)} disabled={loading}>
              <SelectTrigger className={inputClasses}>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-white/20">
                <SelectItem value="employee" className="text-white hover:bg-blue-500/20">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-400" />
                    <span>👤 Funcionário da Adega</span>
                  </div>
                </SelectItem>
                <SelectItem value="delivery" className="text-white hover:bg-green-500/20">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-green-400" />
                    <span>🛵 Entregador/Motoboy</span>
                  </div>
                </SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-red-500/20">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-red-400" />
                    <span>👑 Administrador</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Resumo de permissões */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-400">📋 Comparativo de Permissões:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 bg-red-500/5 border border-red-500/20 rounded">
                <Crown className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-red-300">Admin</span>
                  <span className="text-gray-500 ml-1">- Acesso total ao sistema</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                <User className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-blue-300">Funcionário</span>
                  <span className="text-gray-500 ml-1">- PDV, estoque, clientes</span>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-green-500/5 border border-green-500/20 rounded">
                <Truck className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-medium text-green-300">Entregador</span>
                  <span className="text-gray-500 ml-1">- Apenas entregas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormDialog>
  );
};