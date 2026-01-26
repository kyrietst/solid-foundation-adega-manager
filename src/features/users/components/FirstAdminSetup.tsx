/**
 * Componente de setup inicial do sistema
 * Extraído do UserManagement.tsx para separar responsabilidades
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Crown } from 'lucide-react';
import { FirstAdminSetupProps } from './types';

export const FirstAdminSetup: React.FC<FirstAdminSetupProps> = ({
  onSetupComplete,
  isLoading,
}) => {
  return (
    <div className="flex items-center justify-center min-h-content-md">
      <Card className="w-full max-w-md bg-adega-charcoal/20 border-white/10">
        <CardHeader className="text-center">
          <Crown className="h-16 w-16 text-adega-gold mx-auto mb-4" />
          <CardTitle className="text-2xl text-adega-platinum">
            Configuração Inicial
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-adega-platinum/80">
            Nenhum usuário encontrado no sistema. Crie o primeiro administrador para começar.
          </p>
          
          <div className="bg-adega-charcoal/30 border border-white/10 p-4 rounded-lg text-sm">
            <p className="text-adega-platinum">
              <strong>Email:</strong> adm@adm.com
            </p>
            <p className="text-adega-platinum">
              <strong>Senha:</strong> adm123
            </p>
            <p className="text-xs text-adega-platinum/60 mt-2">
              (Recomendamos alterar a senha após o primeiro login)
            </p>
          </div>
          
          <Button 
            onClick={onSetupComplete} 
            className="w-full bg-white hover:bg-zinc-200 text-black font-bold shadow-lg rounded-xl" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? 'Criando...' : 'Criar Administrador Supremo'}
          </Button>
          
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-400">
              <strong>Próximos passos:</strong>
            </p>
            <ul className="text-xs text-blue-300 mt-1 space-y-1 text-left">
              <li>• Faça login com as credenciais criadas</li>
              <li>• Altere a senha padrão por segurança</li>
              <li>• Crie outros usuários conforme necessário</li>
              <li>• Configure permissões específicas por função</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};