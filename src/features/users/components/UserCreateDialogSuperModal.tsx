/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * UserCreateDialogSuperModal.tsx - Exemplo de migração para SuperModal
 *
 * @description
 * Demonstração de como um modal de 73 linhas (+ UserForm separado) pode ser
 * simplificado usando o novo sistema SuperModal com formulários integrados.
 *
 * @reduction 73 + UserForm linhas → ~90 linhas (unificação completa)
 * @features
 * - Formulário integrado sem componente separado
 * - Validação Zod integrada
 * - Estados de loading, success, error automatizados
 * - Submit handling com rollback automático
 * - Reset automático após criação bem-sucedida
 * - Debug panel para desenvolvimento
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SuperModal Migration Example
 */

import React from 'react';
import { z } from 'zod';
import { SuperModal, FormFieldProps } from '@/shared/ui/composite';
import { Input } from '@/shared/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { useUserCreation } from '@/features/users/hooks/useUserCreation';
import { useToast } from '@/shared/hooks/common/use-toast';
import { User, Mail, Lock, Shield } from 'lucide-react';

// ============================================================================
// SCHEMA DE VALIDAÇÃO
// ============================================================================

const userCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),

  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),

  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(50, 'Senha deve ter no máximo 50 caracteres'),

  role: z.enum(['admin', 'employee', 'delivery'], {
    required_error: 'Função é obrigatória',
  }),
});

type UserCreateFormData = z.infer<typeof userCreateSchema>;

// ============================================================================
// TYPES
// ============================================================================

interface UserCreateDialogSuperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const UserCreateDialogSuperModal: React.FC<UserCreateDialogSuperModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const { toast } = useToast();
  const { createUser } = useUserCreation();

  // Dados iniciais do formulário
  const initialFormData: Partial<UserCreateFormData> = {
    name: '',
    email: '',
    password: '',
    role: 'employee',
  };

  // Função de submit
  const handleSubmit = async (data: UserCreateFormData) => {
    await createUser(data);
    return data;
  };

  const handleSuccess = () => {
    toast({
      title: "Usuário criado!",
      description: "O usuário foi criado com sucesso no sistema.",
      variant: "default",
    });
    onUserCreated();
  };

  // Renderização dos campos do formulário
  const renderFormFields = ({ data, updateField, errors, hasFieldError, getFieldError }: FormFieldProps<UserCreateFormData>) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-accent-gold" />
          <h3 className="text-lg font-medium text-gray-100">Informações do Usuário</h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Nome Completo *
          </label>
          <Input
            value={data.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Ex: João Silva Santos"
            className={hasFieldError('name') ? 'border-red-500' : ''}
          />
          {hasFieldError('name') && (
            <p className="text-sm text-red-400 mt-1">{getFieldError('name')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Mail className="h-4 w-4 inline mr-1" />
            Email *
          </label>
          <Input
            type="email"
            value={data.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="usuario@empresa.com"
            className={hasFieldError('email') ? 'border-red-500' : ''}
          />
          {hasFieldError('email') && (
            <p className="text-sm text-red-400 mt-1">{getFieldError('email')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Lock className="h-4 w-4 inline mr-1" />
            Senha *
          </label>
          <Input
            type="password"
            value={data.password || ''}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className={hasFieldError('password') ? 'border-red-500' : ''}
          />
          {hasFieldError('password') && (
            <p className="text-sm text-red-400 mt-1">{getFieldError('password')}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Shield className="h-4 w-4 inline mr-1" />
            Função no Sistema *
          </label>
          <Select
            value={data.role || ''}
            onValueChange={(value: 'admin' | 'employee' | 'delivery') => updateField('role', value)}
          >
            <SelectTrigger className={hasFieldError('role') ? 'border-red-500' : ''}>
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Funcionário</span>
                </div>
              </SelectItem>
              <SelectItem value="admin">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Administrador</span>
                </div>
              </SelectItem>
              <SelectItem value="delivery">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Entregador</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {hasFieldError('role') && (
            <p className="text-sm text-red-400 mt-1">{getFieldError('role')}</p>
          )}
        </div>

        <div className="bg-blue-950/20 border border-blue-500/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-blue-400 font-medium">Sobre as Funções</div>
              <div className="text-blue-300 text-sm mt-1">
                <p><strong>Administrador:</strong> Acesso completo ao sistema</p>
                <p><strong>Funcionário:</strong> Operações de vendas e estoque</p>
                <p><strong>Entregador:</strong> Apenas entregas atribuídas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <SuperModal<UserCreateFormData>
      modalType="create"
      title="Criar Novo Usuário"
      subtitle="Preencha as informações abaixo para criar um novo usuário no sistema"
      isOpen={isOpen}
      onClose={onClose}
      formData={initialFormData}
      onSubmit={handleSubmit}
      onSuccess={handleSuccess}
      validationSchema={userCreateSchema}
      submitButtonText="Criar Usuário"
      cancelButtonText="Cancelar"
      showResetButton={false} // Usually don't reset password forms
      confirmOnClose={true}
      closeOnSuccess={true}
      resetOnSuccess={true} // Reset form for next user
      autoFocusFirstField={true}
      debug={false} // Set to true for development
      size="md"
    >
      {renderFormFields}
    </SuperModal>
  );
};

export default UserCreateDialogSuperModal;