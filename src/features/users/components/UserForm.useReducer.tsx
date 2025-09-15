/**
 * UserForm.tsx - Formulário de usuário com useReducer (REFATORADO)
 * Context7 Pattern: useState → useReducer para formulários complexos
 * Demonstra uso do useFormReducer para eliminar múltiplos useState
 *
 * REFATORAÇÃO APLICADA:
 * - useFormReducer para estado complexo de formulário
 * - Validação Zod integrada
 * - Estados derivados computados
 * - Performance otimizada com dispatch
 * - Eliminação de formData + updateField locais
 *
 * @version 2.0.0 - Migrado para useReducer (Context7)
 */

import React, { useEffect } from 'react';
import { z } from 'zod';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { UserFormProps, NewUserData } from './types';
import { useRoleUtilities } from '@/features/users/hooks/useUserPermissions';
import { useFormReducer } from '@/shared/hooks/common/useFormReducer';
import { Shield, User, Truck, Crown, AlertCircle, CheckCircle } from 'lucide-react';

// Schema de validação para o formulário
const userFormSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['admin', 'employee', 'delivery'], {
    errorMap: () => ({ message: 'Papel inválido' })
  })
});

export const UserForm: React.FC<UserFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
  initialData,
}) => {
  const { getRoleDescription } = useRoleUtilities();

  // Hook useReducer para formulário complexo
  const {
    state,
    actions,
    computed,
    helpers
  } = useFormReducer<NewUserData>({
    initialData: {
      name: '',
      email: '',
      password: '',
      role: 'employee'
    },
    schema: userFormSchema,
    validateOnChange: true,
    validateOnBlur: true,
  });

  const { data, errors, touched, isDirty } = state;
  const { setField, touchField, validateForm } = actions;
  const { hasErrors, touchedFieldsCount } = computed;
  const { shouldShowError } = helpers;

  // Inicializar dados do formulário
  useEffect(() => {
    if (initialData) {
      actions.setMultipleFields(initialData);
    }
  }, [initialData, actions]);

  // Handler para submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(data);
    }
  };

  // Verificar se formulário é válido
  const isFormValid = !hasErrors && data.name && data.email && data.password;

  // Helper para classes de erro
  const getFieldClasses = (field: keyof NewUserData) => {
    const baseClasses = "bg-gray-900/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-blue-400/60";

    if (shouldShowError(field)) {
      return `${baseClasses} border-red-400/60 focus:border-red-400/60`;
    }

    if (touched[field as string] && !errors[field as string]) {
      return `${baseClasses} border-green-400/60 focus:border-green-400/60`;
    }

    return baseClasses;
  };

  // Ícones para papéis
  const roleIcons = {
    admin: Crown,
    employee: User,
    delivery: Truck,
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <fieldset className="space-y-5">
        <legend className="text-lg font-semibold text-white mb-4">
          Dados do Usuário
          {isDirty && (
            <span className="ml-2 text-xs text-yellow-400">(modificado)</span>
          )}
        </legend>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-gray-300 font-medium">
            Nome Completo *
          </Label>
          <div className="relative">
            <Input
              id="name"
              type="text"
              value={data.name}
              onChange={(e) => setField('name', e.target.value)}
              onBlur={() => touchField('name')}
              placeholder="Digite o nome completo"
              className={getFieldClasses('name')}
              required
            />
            {touched.name && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.name ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : data.name ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : null}
              </div>
            )}
          </div>
          {shouldShowError('name') && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300 font-medium">
            Email *
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setField('email', e.target.value)}
              onBlur={() => touchField('email')}
              placeholder="usuario@exemplo.com"
              className={getFieldClasses('email')}
              required
            />
            {touched.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.email ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : data.email ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : null}
              </div>
            )}
          </div>
          {shouldShowError('email') && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300 font-medium">
            Senha *
          </Label>
          <div className="relative">
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setField('password', e.target.value)}
              onBlur={() => touchField('password')}
              placeholder="Mínimo 6 caracteres"
              className={getFieldClasses('password')}
              required
            />
            {touched.password && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {errors.password ? (
                  <AlertCircle className="h-4 w-4 text-red-400" />
                ) : data.password ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : null}
              </div>
            )}
          </div>
          {shouldShowError('password') && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.password}
            </p>
          )}
        </div>

        {/* Papel */}
        <div className="space-y-2">
          <Label htmlFor="role" className="text-gray-300 font-medium">
            Papel no Sistema *
          </Label>
          <Select
            value={data.role}
            onValueChange={(value) => {
              setField('role', value);
              touchField('role');
            }}
          >
            <SelectTrigger className={getFieldClasses('role')}>
              <SelectValue placeholder="Selecione o papel do usuário" />
            </SelectTrigger>
            <SelectContent>
              {(['admin', 'employee', 'delivery'] as const).map((role) => {
                const Icon = roleIcons[role];
                return (
                  <SelectItem key={role} value={role}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium capitalize">{role}</div>
                        <div className="text-xs text-gray-500">
                          {getRoleDescription(role)}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {shouldShowError('role') && (
            <p className="text-red-400 text-sm flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.role}
            </p>
          )}
        </div>
      </fieldset>

      {/* Informações de validação */}
      {touchedFieldsCount > 0 && (
        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-600/30">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Campos preenchidos: {touchedFieldsCount}/4
            </span>
            <span className={`flex items-center gap-1 ${hasErrors ? 'text-red-400' : 'text-green-400'}`}>
              {hasErrors ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Há erros no formulário
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Formulário válido
                </>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-600">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Criando...
            </>
          ) : (
            <>
              <Shield className="h-4 w-4 mr-2" />
              Criar Usuário
            </>
          )}
        </Button>
      </div>

      {/* Debug info (desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30">
          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-white">Debug: Estado do Formulário (useReducer)</summary>
            <pre className="mt-2 overflow-x-auto">
              {JSON.stringify({
                data,
                errors,
                touched,
                computed,
                isFormValid,
              }, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </form>
  );
};