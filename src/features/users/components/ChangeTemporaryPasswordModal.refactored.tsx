/**
 * ChangeTemporaryPasswordModal.tsx - Modal para alteração de senha temporária (REFATORADO)
 * Context7 Pattern: Loading States Optimization aplicado
 * Elimina useState(false) duplicado encontrado na análise
 *
 * REFATORAÇÃO APLICADA:
 * - Hook useSimpleLoading centralizado
 * - Eliminação de isSubmitting local
 * - Estado padronizado
 * - Melhor UX com loading states
 *
 * @version 2.0.0 - Refatorado com Context7
 */

import React, { useState } from 'react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { useToast } from '@/shared/hooks/common/use-toast';
import { useSimpleLoading } from '@/shared/hooks/common/useLoading';
import { supabase } from '@/core/api/supabase/client';
import { KeyRound, Eye, EyeOff, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface ChangeTemporaryPasswordModalProps {
  isOpen: boolean;
  onPasswordChanged: () => void;
  userEmail: string;
}

export const ChangeTemporaryPasswordModal: React.FC<ChangeTemporaryPasswordModalProps> = ({
  isOpen,
  onPasswordChanged,
  userEmail
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hook centralizado de loading (elimina useState(false) duplicado)
  const { isLoading, withLoading } = useSimpleLoading();
  const { toast } = useToast();

  const validatePassword = (password: string): { isValid: boolean; messages: string[] } => {
    const messages: string[] = [];

    if (password.length < 6) {
      messages.push('Mínimo 6 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      messages.push('Uma letra maiúscula');
    }
    if (!/[0-9]/.test(password)) {
      messages.push('Um número');
    }

    return {
      isValid: password.length >= 6,
      messages
    };
  };

  const passwordValidation = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Função de submit com loading automático
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!passwordValidation.isValid) {
      toast({
        title: "Senha inválida",
        description: "A nova senha não atende aos critérios de segurança.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação da senha deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase.rpc('change_temporary_password', {
      current_password: currentPassword,
      new_password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data && !data.success) {
      throw new Error(data.error || "Erro desconhecido");
    }

    toast({
      title: "Senha alterada com sucesso!",
      description: "Sua senha foi alterada. Agora você pode usar o sistema normalmente.",
      variant: "default",
    });

    // Reset form
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Callback para fechar modal e atualizar estado
    onPasswordChanged();
  };

  // Usar withLoading para encapsular a operação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await withLoading(changePassword)();
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {}} // Bloquear fechamento
      title="Alterar Senha Temporária"
      description="Por segurança, você deve alterar sua senha temporária antes de continuar usando o sistema."
      size="md"
      icon={Lock}
      iconColor="text-amber-400"
      className="backdrop-blur-sm"
      disableOutsideClick={true}
      disableEscapeKey={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Alerta informativo */}
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-300 font-medium">Senha Temporária Detectada</p>
              <p className="text-xs text-amber-200 mt-1">
                Você está logado com uma senha temporária fornecida pelo administrador.
                Por favor, altere para uma senha pessoal.
              </p>
            </div>
          </div>
        </div>

        {/* Senha Atual */}
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-amber-300 font-medium">
            Senha Temporária Atual
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite a senha fornecida pelo admin"
              required
              className="bg-gray-900/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-amber-400/60 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>
        </div>

        {/* Nova Senha */}
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-amber-300 font-medium">
            Nova Senha
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Crie uma senha forte"
              required
              className={cn(
                "bg-gray-900/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-amber-400/60 pr-10",
                newPassword && !passwordValidation.isValid && "border-red-400/60 focus:border-red-400/60"
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>

          {/* Validação da senha */}
          {newPassword && (
            <div className="space-y-1">
              {passwordValidation.messages.map((message, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-1 h-1 rounded-full bg-red-400"></div>
                  <span className="text-red-400">{message}</span>
                </div>
              ))}
              {passwordValidation.isValid && (
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Senha válida</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-amber-300 font-medium">
            Confirmar Nova Senha
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente a nova senha"
              required
              className={cn(
                "bg-gray-900/50 border-gray-600/50 text-white placeholder:text-gray-400 focus:border-amber-400/60 pr-10",
                confirmPassword && !passwordsMatch && "border-red-400/60 focus:border-red-400/60"
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          </div>

          {/* Validação da confirmação */}
          {confirmPassword && (
            <div className="flex items-center gap-1 text-xs">
              {passwordsMatch ? (
                <>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  <span className="text-green-400">Senhas coincidem</span>
                </>
              ) : (
                <>
                  <div className="w-1 h-1 rounded-full bg-red-400"></div>
                  <span className="text-red-400">Senhas não coincidem</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Botão de Submissão */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isLoading || !passwordValidation.isValid || !passwordsMatch || !currentPassword}
            className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-black font-semibold hover:from-amber-600 hover:via-amber-700 hover:to-yellow-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                Alterando Senha...
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4 mr-2" />
                Alterar Senha
              </>
            )}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
};