/**
 * Componente formulário de usuário
 * Extraído do UserManagement.tsx para reutilização
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { UserFormProps, NewUserData } from './types';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}) => {
  const [formData, setFormData] = useState<NewUserData>({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });

  const { getRoleDescription } = useRoleUtilities();

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const updateField = (field: keyof NewUserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.name && formData.email && formData.password;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-adega-platinum mb-4">Dados do Usuário</legend>
        {/* Nome */}
        <div>
          <Label htmlFor="user-name" className="text-adega-platinum">
            Nome *
          </Label>
          <Input
            id="user-name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Nome completo"
            className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!formData.name && formData.name !== ''}
            aria-describedby="user-name-error"
          />
          {!formData.name && formData.name !== '' && (
            <p id="user-name-error" className="text-sm text-red-400 mt-1" role="alert">
              Nome é obrigatório
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="user-email" className="text-adega-platinum">
            Email *
          </Label>
          <Input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="email@exemplo.com"
            className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!formData.email && formData.email !== ''}
            aria-describedby="user-email-error"
          />
          {!formData.email && formData.email !== '' && (
            <p id="user-email-error" className="text-sm text-red-400 mt-1" role="alert">
              Email é obrigatório
            </p>
          )}
        </div>

        {/* Senha */}
        <div>
          <Label htmlFor="user-password" className="text-adega-platinum">
            Senha *
          </Label>
          <Input
            id="user-password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Senha segura"
            className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!formData.password && formData.password !== ''}
            aria-describedby="user-password-error user-password-help"
          />
          <p id="user-password-help" className="text-xs text-adega-silver mt-1">
            Mínimo 6 caracteres
          </p>
          {!formData.password && formData.password !== '' && (
            <p id="user-password-error" className="text-sm text-red-400 mt-1" role="alert">
              Senha é obrigatória
            </p>
          )}
        </div>

      </fieldset>
      
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-adega-platinum mb-4">Permissões e Acesso</legend>
        
        {/* Função */}
        <div>
          <Label htmlFor="user-role" className="text-adega-platinum">
            Função *
          </Label>
          <Select 
            value={formData.role} 
            onValueChange={(value: 'admin' | 'employee' | 'delivery') => updateField('role', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
              aria-required="true"
              aria-describedby="user-role-help"
            >
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent className="bg-adega-charcoal border-white/10">
              <SelectItem value="employee">Funcionário da Adega</SelectItem>
              <SelectItem value="delivery">Entregador/Motoboy</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Descrição dos Níveis de Acesso */}
        <div 
          id="user-role-help" 
          className="bg-adega-charcoal/30 border border-white/10 p-3 rounded-lg text-sm"
          role="region"
          aria-labelledby="role-levels-title"
        >
          <p id="role-levels-title" className="font-medium text-adega-gold mb-2">Níveis de Acesso:</p>
          <ul className="text-adega-silver text-xs space-y-1">
            <li><strong>Administrador:</strong> {getRoleDescription('admin')}</li>
            <li><strong>Funcionário:</strong> {getRoleDescription('employee')}</li>
            <li><strong>Entregador:</strong> {getRoleDescription('delivery')}</li>
          </ul>
        </div>
      </fieldset>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 border-white/10 hover:bg-white/10"
          aria-label="Cancelar criação do usuário"
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-adega-gold hover:bg-adega-gold/80 text-black"
          aria-label={isSubmitting ? 'Criando usuário...' : 'Criar novo usuário'}
        >
          {isSubmitting ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
};