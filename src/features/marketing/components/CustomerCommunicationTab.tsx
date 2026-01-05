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
        <Card className="bg-black/70 backdrop-blur-xl border-white/20">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="text-gray-200 font-medium">Cliente não encontrado</div>
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
      {/* Header com informações do cliente - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-orange/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-accent-orange" />
              Centro de Comunicação & Documentos
              <Badge variant="outline" className="ml-2 border-2 border-accent-orange/60 text-accent-orange bg-accent-orange/20 font-semibold">
                {customer?.name || 'Cliente'}
              </Badge>
            </CardTitle>

            <div className="flex items-center gap-2">
              {hasContactInfo ? (
                <Badge variant="outline" className="border-2 border-accent-green/60 text-accent-green bg-accent-green/20 font-semibold">
                  ✅ Dados de contato
                </Badge>
              ) : (
                <Badge variant="outline" className="border-2 border-accent-red/60 text-accent-red bg-accent-red/20 font-semibold">
                  ❌ Sem contato
                </Badge>
              )}

              {hasInteractions && (
                <Badge variant="outline" className="border-2 border-accent-blue/60 text-accent-blue bg-accent-blue/20 font-semibold">
                  {interactions.length} interações
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ações de Comunicação - Redesign UX/UI v3.2.0 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WhatsApp */}
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-green/60 hover:shadow-xl hover:shadow-accent-green/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-accent-green" />
              WhatsApp
              {preferredChannel === 'phone' && (
                <Badge variant="outline" className="ml-2 border-2 border-accent-green/60 text-accent-green bg-accent-green/20 font-semibold text-xs">
                  Preferido
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                {hasPhoneNumber ? (
                  <>
                    <p className="text-accent-green font-semibold mb-2">✅ Telefone cadastrado: {customer?.phone}</p>
                    <p className="text-gray-200 font-medium">Envie mensagens diretamente via WhatsApp</p>
                    <p className="text-xs text-gray-300 font-medium mt-2">
                      💡 Interações são registradas automaticamente
                    </p>
                  </>
                ) : (
                  <p className="text-accent-red font-semibold">❌ Telefone não cadastrado</p>
                )}
              </div>
              <Button
                className="w-full bg-accent-green hover:bg-accent-green/80 font-semibold"
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
        <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-blue/60 hover:shadow-xl hover:shadow-accent-blue/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-accent-blue" />
              Email
              {preferredChannel === 'email' && (
                <Badge variant="outline" className="ml-2 border-2 border-accent-blue/60 text-accent-blue bg-accent-blue/20 font-semibold text-xs">
                  Preferido
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                {hasEmailAddress ? (
                  <>
                    <p className="text-accent-green font-semibold mb-2">✅ Email cadastrado: {customer?.email}</p>
                    <p className="text-gray-200 font-medium">Envie emails promocionais e informativos</p>
                    <p className="text-xs text-gray-300 font-medium mt-2">
                      💡 Interações são registradas automaticamente
                    </p>
                  </>
                ) : (
                  <p className="text-accent-red font-semibold">❌ Email não cadastrado</p>
                )}
              </div>
              <Button
                className="w-full bg-accent-blue hover:bg-accent-blue/80 font-semibold"
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

      {/* Histórico de Interações - Real do Banco - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-accent-purple/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent-purple" />
            Histórico de Interações
            <Badge variant="outline" className="ml-2 border-2 border-accent-purple/60 text-accent-purple bg-accent-purple/20 font-semibold">
              {interactions.length} registros
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasInteractions ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2 text-gray-200 font-medium">📱 Nenhuma interação registrada</p>
              <p className="text-sm text-gray-300 font-medium">Envie um WhatsApp ou email para começar o histórico</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {interactions.map((interaction) => (
                <Card key={interaction.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {interaction.interaction_type === 'whatsapp' ? (
                            <Phone className="h-4 w-4 text-accent-green" />
                          ) : interaction.interaction_type === 'email' ? (
                            <Mail className="h-4 w-4 text-accent-blue" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-accent-orange" />
                          )}
                          <span className="text-sm font-semibold text-white capitalize">
                            {interaction.interaction_type}
                          </span>
                          <Badge variant="outline" className="text-xs border-2 border-white/30 text-gray-200 bg-white/10 font-semibold">
                            {new Date(interaction.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-200 mb-1 font-medium">
                          {interaction.description}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-300 font-medium">
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

      {/* Documentos e Anexos - Placeholder - Redesign UX/UI v3.2.0 */}
      <Card className="bg-black/70 backdrop-blur-xl border-white/20 hover:border-yellow-400/60 hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-white font-semibold text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-yellow-400" />
            Documentos & Anexos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2 text-gray-200 font-medium">📄 Sistema de documentos</p>
            <p className="text-sm text-gray-300 font-medium">Será implementado em fase futura</p>
            <div className="mt-4 text-xs text-gray-300 font-medium">
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
