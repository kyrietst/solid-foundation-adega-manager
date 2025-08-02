/**
 * Componente formulário de usuário
 * Extraído do UserManagement.tsx para reutilização
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormProps, NewUserData } from './types';
import { useRoleUtilities } from '@/hooks/users/useUserPermissions';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nome */}
      <div>
        <Label htmlFor="user-name" className="text-adega-platinum">
          Nome
        </Label>
        <Input
          id="user-name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="Nome completo"
          className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
          disabled={isSubmitting}
        />
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="user-email" className="text-adega-platinum">
          Email
        </Label>
        <Input
          id="user-email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="email@exemplo.com"
          className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
          disabled={isSubmitting}
        />
      </div>

      {/* Senha */}
      <div>
        <Label htmlFor="user-password" className="text-adega-platinum">
          Senha
        </Label>
        <Input
          id="user-password"
          type="password"
          value={formData.password}
          onChange={(e) => updateField('password', e.target.value)}
          placeholder="Senha segura"
          className="bg-adega-charcoal/30 border-white/10 text-adega-platinum"
          disabled={isSubmitting}
        />
      </div>

      {/* Função */}
      <div>
        <Label htmlFor="user-role" className="text-adega-platinum">
          Função
        </Label>
        <Select 
          value={formData.role} 
          onValueChange={(value: 'admin' | 'employee' | 'delivery') => updateField('role', value)}
          disabled={isSubmitting}
        >
          <SelectTrigger className="bg-adega-charcoal/30 border-white/10 text-adega-platinum">
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
      <div className="bg-adega-charcoal/30 border border-white/10 p-3 rounded-lg text-sm">
        <p className="font-medium text-adega-gold mb-2">Níveis de Acesso:</p>
        <ul className="text-adega-platinum/80 text-xs space-y-1">
          <li><strong>Administrador:</strong> {getRoleDescription('admin')}</li>
          <li><strong>Funcionário:</strong> {getRoleDescription('employee')}</li>
          <li><strong>Entregador:</strong> {getRoleDescription('delivery')}</li>
        </ul>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-4">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 border-white/10 hover:bg-white/10"
        >
          Cancelar
        </Button>
        <Button 
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-adega-gold hover:bg-adega-gold/80 text-black"
        >
          {isSubmitting ? 'Criando...' : 'Criar Usuário'}
        </Button>
      </div>
    </form>
  );
};