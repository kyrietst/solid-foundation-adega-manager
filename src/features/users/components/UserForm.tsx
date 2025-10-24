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
import { Shield, User, Truck, Crown } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <fieldset className="space-y-5">
        <legend className="text-lg font-bold text-white mb-4 border-b border-white/20 pb-2">Dados do Usuário</legend>
        {/* Nome */}
        <div>
          <Label htmlFor="user-name" className="text-white font-medium mb-2 block">
            Nome Completo *
          </Label>
          <Input
            id="user-name"
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Digite o nome completo"
            className="bg-black/40 border-white/30 text-white placeholder:text-white/50 focus:border-accent-gold-100 focus:ring-accent-gold-100/20 transition-all duration-200"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!formData.name && formData.name !== ''}
            aria-describedby="user-name-error"
          />
          {!formData.name && formData.name !== '' && (
            <p id="user-name-error" className="text-sm text-red-400 mt-2" role="alert">
              ⚠️ Nome é obrigatório
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="user-email" className="text-white font-medium mb-2 block">
            Email de Acesso *
          </Label>
          <Input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="usuario@empresa.com"
            className="bg-black/40 border-white/30 text-white placeholder:text-white/50 focus:border-accent-gold-100 focus:ring-accent-gold-100/20 transition-all duration-200"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!formData.email && formData.email !== ''}
            aria-describedby="user-email-error"
          />
          {!formData.email && formData.email !== '' && (
            <p id="user-email-error" className="text-sm text-red-400 mt-2" role="alert">
              ⚠️ Email é obrigatório
            </p>
          )}
        </div>

        {/* Senha */}
        <div>
          <Label htmlFor="user-password" className="text-white font-medium mb-2 block">
            Senha de Acesso *
          </Label>
          <Input
            id="user-password"
            type="password"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder="Digite uma senha segura"
            className="bg-black/40 border-white/30 text-white placeholder:text-white/50 focus:border-accent-gold-100 focus:ring-accent-gold-100/20 transition-all duration-200"
            disabled={isSubmitting}
            aria-required="true"
            aria-invalid={!formData.password && formData.password !== ''}
            aria-describedby="user-password-error user-password-help"
          />
          <p id="user-password-help" className="text-xs text-white/70 mt-2 flex items-center gap-1">
            🔒 Mínimo 6 caracteres para segurança
          </p>
          {!formData.password && formData.password !== '' && (
            <p id="user-password-error" className="text-sm text-red-400 mt-2" role="alert">
              ⚠️ Senha é obrigatória
            </p>
          )}
        </div>

      </fieldset>
      
      <fieldset className="space-y-6">
        <legend className="text-lg font-bold text-white mb-4 border-b border-white/20 pb-2">Função e Permissões</legend>
        
        {/* Função com indicador visual */}
        <div className="space-y-3">
          <Label htmlFor="user-role" className="text-white font-medium mb-3 block">
            Selecione a Função *
          </Label>
          
          {/* Indicador Visual da Função Selecionada */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            formData.role === 'admin' 
              ? 'bg-red-500/10 border-red-400 shadow-lg shadow-red-500/20' 
              : formData.role === 'employee'
              ? 'bg-blue-500/10 border-blue-400 shadow-lg shadow-blue-500/20'
              : 'bg-green-500/10 border-green-400 shadow-lg shadow-green-500/20'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {formData.role === 'admin' && <Crown className="h-6 w-6 text-red-400" />}
              {formData.role === 'employee' && <User className="h-6 w-6 text-blue-400" />}
              {formData.role === 'delivery' && <Truck className="h-6 w-6 text-green-400" />}
              <span className={`font-bold text-lg ${
                formData.role === 'admin' ? 'text-red-300' : 
                formData.role === 'employee' ? 'text-blue-300' : 'text-green-300'
              }`}>
                {formData.role === 'admin' ? 'Administrador' : 
                 formData.role === 'employee' ? 'Funcionário da Adega' : 'Entregador/Motoboy'}
              </span>
            </div>
            <p className="text-white/80 text-sm">
              {getRoleDescription(formData.role)}
            </p>
          </div>

          <Select 
            value={formData.role} 
            onValueChange={(value: 'admin' | 'employee' | 'delivery') => updateField('role', value)}
            disabled={isSubmitting}
          >
            <SelectTrigger 
              className="bg-black/40 border-white/30 text-white focus:border-accent-gold-100 focus:ring-accent-gold-100/20 transition-all duration-200"
              aria-required="true"
              aria-describedby="user-role-help"
            >
              <SelectValue placeholder="Selecione a função do usuário" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20 backdrop-blur-xl">
              <SelectItem value="employee" className="text-white hover:bg-blue-500/20 focus:bg-blue-500/20">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <span>Funcionário da Adega</span>
                </div>
              </SelectItem>
              <SelectItem value="delivery" className="text-white hover:bg-green-500/20 focus:bg-green-500/20">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-green-400" />
                  <span>Entregador/Motoboy</span>
                </div>
              </SelectItem>
              <SelectItem value="admin" className="text-white hover:bg-red-500/20 focus:bg-red-500/20">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-red-400" />
                  <span>Administrador</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Descrição Detalhada dos Níveis de Acesso */}
        <div 
          id="user-role-help" 
          className="bg-black/40 border border-white/20 p-4 rounded-xl"
          role="region"
          aria-labelledby="role-levels-title"
        >
          <p id="role-levels-title" className="font-bold text-accent-gold-100 mb-3 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Comparativo de Permissões:
          </p>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
              <Crown className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <div className="font-medium text-red-300">Administrador</div>
                <div className="text-white/70 text-sm">{getRoleDescription('admin')}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <User className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <div className="font-medium text-blue-300">Funcionário</div>
                <div className="text-white/70 text-sm">{getRoleDescription('employee')}</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
              <Truck className="h-5 w-5 text-green-400 mt-0.5" />
              <div>
                <div className="font-medium text-green-300">Entregador</div>
                <div className="text-white/70 text-sm">{getRoleDescription('delivery')}</div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Botões */}
      <div className="flex gap-3 pt-6 border-t border-white/20">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 bg-black/40 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transition-all duration-200"
          aria-label="Cancelar criação do usuário"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold hover:from-yellow-400 hover:to-yellow-500 transition-all duration-200"
          aria-label={isSubmitting ? 'Criando usuário...' : 'Criar novo usuário'}
        >
          {isSubmitting ? '⏳ Criando...' : '✨ Criar Usuário'}
        </Button>
      </div>
    </form>
  );
};