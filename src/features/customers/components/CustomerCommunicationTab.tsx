/**
 * CustomerCommunicationTab.tsx - Tab de comunicação e documentos
 *
 * @description
 * Componente SSoT v3.0.0 que centraliza comunicação, contatos e documentos
 * do cliente. Preparado para futuras funcionalidades.
 *
 * @features
 * - Centro de comunicação unificado
 * - Histórico de interações (futuro)
 * - Documentos e anexos (futuro)
 * - Integração com WhatsApp/Email
 * - DataTable para histórico
 * - Glassmorphism effects
 *
 * @author Adega Manager Team
 * @version 3.0.0 - SSoT Implementation
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { useGlassmorphismEffect } from '@/shared/hooks/ui/useGlassmorphismEffect';
import {
  MessageSquare,
  Mail,
  Phone,
  FileText,
  Calendar,
  Send,
  Settings
} from 'lucide-react';
import { type CustomerData } from '@/shared/hooks/business/useCustomerOperations';

// ============================================================================
// TYPES
// ============================================================================

export interface CustomerCommunicationTabProps {
  customer: CustomerData;
  onWhatsApp?: () => void;
  onEmail?: () => void;
  className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const CustomerCommunicationTab: React.FC<CustomerCommunicationTabProps> = ({
  customer,
  onWhatsApp,
  onEmail,
  className = ''
}) => {
  // ============================================================================
  // BUSINESS LOGIC COM SSoT
  // ============================================================================

  const { handleMouseMove } = useGlassmorphismEffect();

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleWhatsAppDefault = () => {
    if (!customer?.telefone) {
      alert('Cliente não possui telefone cadastrado');
      return;
    }
    const phone = customer.telefone.replace(/\D/g, '');
    const message = `Olá ${customer.cliente}, tudo bem? Aqui é da Adega! 🍷`;
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleEmailDefault = () => {
    if (!customer?.email) {
      alert('Cliente não possui email cadastrado');
      return;
    }
    const subject = `Contato - Adega Wine Store`;
    const body = `Prezado(a) ${customer.cliente},\n\nEsperamos que esteja bem!\n\nAtenciosamente,\nEquipe Adega`;
    const url = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <section
      className={`bg-black/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:shadow-purple-500/10 hover:border-purple-400/30 transition-all duration-300 space-y-6 ${className}`}
      onMouseMove={handleMouseMove}
    >
      {/* Header */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-400" />
            Centro de Comunicação & Documentos
          </CardTitle>
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                {customer.telefone ? (
                  <>
                    <p className="text-green-400 mb-2">✅ Telefone cadastrado: {customer.telefone}</p>
                    <p className="text-gray-400">Envie mensagens diretamente via WhatsApp</p>
                  </>
                ) : (
                  <p className="text-red-400">❌ Telefone não cadastrado</p>
                )}
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!customer.telefone}
                onClick={onWhatsApp || handleWhatsAppDefault}
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                {customer.email ? (
                  <>
                    <p className="text-green-400 mb-2">✅ Email cadastrado: {customer.email}</p>
                    <p className="text-gray-400">Envie emails promocionais e informativos</p>
                  </>
                ) : (
                  <p className="text-red-400">❌ Email não cadastrado</p>
                )}
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!customer.email}
                onClick={onEmail || handleEmailDefault}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Interações - Placeholder */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-400" />
            Histórico de Interações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">📱 Histórico de comunicação</p>
            <p className="text-sm">Será implementado na próxima versão com DataTable</p>
            <div className="mt-4 text-xs text-gray-500">
              • Histórico de WhatsApp<br />
              • Histórico de emails enviados<br />
              • Timeline de interações<br />
              • Templates de mensagens
            </div>
          </div>
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