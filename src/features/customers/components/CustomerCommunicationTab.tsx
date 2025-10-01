/**
 * CustomerCommunicationTab.tsx - Tab SSoT v3.1.0 Server-Side
 *
 * @description
 * Componente SSoT completo que busca dados diretamente do banco para comunicação.
 * Elimina dependência de props e implementa performance otimizada.
 *
 * @features
 * - Busca direta do banco (sem props)
 * - Histórico real de interações server-side
 * - Handlers centralizados com registro automático
 * - Loading e error states internos
 * - DataTable para histórico de comunicação
 * - Cache inteligente e auto-refresh
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.1.0 - SSoT Server-Side Implementation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import { LoadingSpinner } from '@/shared/ui/composite/loading-spinner';
import {
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Calendar,
  Send,
  Settings,
  Users,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCustomerCommunicationSSoT } from '@/shared/hooks/business/useCustomerCommunicationSSoT';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerCommunicationTabProps {
  customerId: string;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerCommunicationTab: React.FC<CustomerCommunicationTabProps> = ({
  customerId,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT v3.1.0
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  const {
    customer,
    interactions,
    isLoading,
    error,
    sendWhatsApp,
    sendEmail,
    hasContactInfo,
    hasPhoneNumber,
    hasEmailAddress,
    preferredChannel,
    hasData,
    isEmpty,
    hasInteractions,
    refetch
  } = useCustomerCommunicationSSoT(customerId);

  // ============================================================================
  // GUARDS E VALIDAÇÕES
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner text="Carregando dados de comunicação..." />
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6 text-center">
            <div className="text-red-400 text-lg">❌ Erro ao carregar dados de comunicação</div>
            <p className="text-gray-400 mt-2">{error.message}</p>
            <Button onClick={() => refetch()} className="mt-4 bg-red-600 hover:bg-red-700">
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  // Empty state (cliente não encontrado)
  if (isEmpty) {
    return (
      <section className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 space-y-6 ${className}`}>
        <Card className="bg-gray-800/30 border-gray-700/40">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-500 opacity-50" />
            <div className="text-gray-400">Cliente não encontrado</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header com informações do cliente */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-orange-400" />
              Centro de Comunicação & Documentos
              <Badge variant="outline" className="ml-2 border-orange-500/30 text-orange-400">
                {customer?.name || 'Cliente'}
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {hasContactInfo ? (
                <Badge variant="outline" className="border-green-500/30 text-green-400">
                  ✅ Dados de contato
                </Badge>
              ) : (
                <Badge variant="outline" className="border-red-500/30 text-red-400">
                  ❌ Sem contato
                </Badge>
              )}

              {hasInteractions && (
                <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                  {interactions.length} interações
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ações de Comunicação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-700/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-400" />
              WhatsApp
              {preferredChannel === 'phone' && (
                <Badge variant="outline" className="ml-2 border-green-500/30 text-green-400 text-xs">
                  Preferido
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                {hasPhoneNumber ? (
                  <>
                    <p className="text-green-400 mb-2">✅ Telefone cadastrado: {customer?.phone}</p>
                    <p className="text-gray-400">Envie mensagens diretamente via WhatsApp</p>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Interações são registradas automaticamente
                    </p>
                  </>
                ) : (
                  <p className="text-red-400">❌ Telefone não cadastrado</p>
                )}
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!hasPhoneNumber}
                onClick={() => sendWhatsApp()}
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-700/40">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" />
              Email
              {preferredChannel === 'email' && (
                <Badge variant="outline" className="ml-2 border-blue-500/30 text-blue-400 text-xs">
                  Preferido
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                {hasEmailAddress ? (
                  <>
                    <p className="text-green-400 mb-2">✅ Email cadastrado: {customer?.email}</p>
                    <p className="text-gray-400">Envie emails promocionais e informativos</p>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Interações são registradas automaticamente
                    </p>
                  </>
                ) : (
                  <p className="text-red-400">❌ Email não cadastrado</p>
                )}
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!hasEmailAddress}
                onClick={() => sendEmail()}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Interações - Real do Banco */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Histórico de Interações
            <Badge variant="outline" className="ml-2 border-purple-500/30 text-purple-400">
              {interactions.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasInteractions ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">📱 Nenhuma interação registrada</p>
              <p className="text-sm">Envie um WhatsApp ou email para começar o histórico</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {interactions.map((interaction) => (
                <Card key={interaction.id} className="bg-gray-700/30 border-gray-600/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {interaction.interaction_type === 'whatsapp' ? (
                            <Phone className="h-4 w-4 text-green-400" />
                          ) : interaction.interaction_type === 'email' ? (
                            <Mail className="h-4 w-4 text-blue-400" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-orange-400" />
                          )}
                          <span className="text-sm font-medium text-white capitalize">
                            {interaction.interaction_type}
                          </span>
                          <Badge variant="outline" className="text-xs border-gray-500/30 text-gray-400">
                            {new Date(interaction.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-300 mb-1">
                          {interaction.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {new Date(interaction.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentos e Anexos - Placeholder */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-yellow-400" />
            Documentos & Anexos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">📄 Sistema de documentos</p>
            <p className="text-sm">Será implementado em fase futura</p>
            <div className="mt-4 text-xs text-gray-500">
              • Upload de documentos<br />
              • Contratos digitais<br />
              • Comprovantes de entrega<br />
              • Arquivos compartilhados
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CustomerCommunicationTab;