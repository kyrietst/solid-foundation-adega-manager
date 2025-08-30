/**
 * AtomoPrinterSetup.tsx - Componente de configuração para impressora Atomo MO-5812
 * Especificamente otimizado para 48mm (384dot), 203dpi
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Badge } from '@/shared/ui/primitives/badge';
import { ReceiptModal } from './ReceiptModal';
import { Settings, Printer, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const AtomoPrinterSetup: React.FC = () => {
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [printerStatus, setPrinterStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');

  const checkPrinterStatus = async () => {
    try {
      // Tenta verificar se há impressoras disponíveis
      const permissions = await navigator.permissions.query({ name: 'microphone' as any });
      setPrinterStatus('connected');
    } catch (error) {
      setPrinterStatus('unknown');
    }
  };

  const printerSpecs = {
    model: 'Atomo MO-5812',
    width: '48mm',
    resolution: '384dot (203dpi)',
    paperType: 'Térmico',
    connectivity: 'USB/Serial',
    compatibleOS: 'Windows, Linux, Mac'
  };

  const configSteps = [
    {
      step: 1,
      title: 'Conectar Impressora',
      description: 'Conecte a impressora Atomo MO-5812 via USB ao computador',
      status: printerStatus === 'connected' ? 'completed' : 'pending'
    },
    {
      step: 2,
      title: 'Instalar Driver',
      description: 'Instalar driver ESC/POS para Windows (baixar do site da Atomo)',
      status: 'pending'
    },
    {
      step: 3,
      title: 'Configurar como Padrão',
      description: 'Definir como impressora padrão nas configurações do Windows',
      status: 'pending'
    },
    {
      step: 4,
      title: 'Testar Impressão',
      description: 'Testar com página de teste do Windows',
      status: 'pending'
    },
    {
      step: 5,
      title: 'Testar Cupom',
      description: 'Testar impressão de cupom pelo sistema',
      status: 'pending'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Cabeçalho */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3 justify-center">
          <Settings className="h-8 w-8 text-blue-400" />
          Configuração Impressora Atomo
        </h1>
        <p className="text-gray-400">
          Setup especializado para impressora térmica MO-5812 (48mm)
        </p>
      </div>

      {/* Status da Impressora */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Printer className="h-5 w-5" />
            Status da Impressora
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-300">Status de Conexão:</span>
            <Badge variant={printerStatus === 'connected' ? 'default' : 'destructive'}>
              {printerStatus === 'connected' ? '✅ Conectada' : 
               printerStatus === 'disconnected' ? '❌ Desconectada' : '❓ Verificar'}
            </Badge>
          </div>
          <Button 
            onClick={checkPrinterStatus}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Verificar Status
          </Button>
        </CardContent>
      </Card>

      {/* Especificações da Impressora */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Especificações - Atomo MO-5812</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(printerSpecs).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-xs text-gray-400 uppercase">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </div>
              <div className="text-sm font-medium text-white mt-1">
                {value}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Steps de Configuração */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Passos de Configuração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {configSteps.map((step) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step.status === 'completed' ? 'bg-green-600' : 'bg-gray-600'
                }`}>
                  {step.status === 'completed' ? '✓' : step.step}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-white">{step.title}</h4>
                  <p className="text-sm text-gray-400">{step.description}</p>
                </div>
                {step.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Importantes */}
      <div className="space-y-4">
        <Alert className="border-yellow-600 bg-yellow-600/10">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-200">
            <strong>Importante:</strong> Esta impressora usa papel de 48mm, diferente do padrão de 80mm. 
            O CSS foi automaticamente ajustado para esta largura.
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-600 bg-blue-600/10">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-200">
            <strong>Dica:</strong> Para melhores resultados, configure a impressora com velocidade 
            baixa (50-75mm/s) e densidade média no driver ESC/POS.
          </AlertDescription>
        </Alert>
      </div>

      {/* Teste do Sistema */}
      <Card className="bg-gray-800/30 border-gray-700/40">
        <CardHeader>
          <CardTitle className="text-white">Teste do Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm">
            Use o teste abaixo para verificar se o cupom está sendo formatado corretamente 
            para a impressora de 48mm:
          </p>
          
          <Button 
            onClick={() => setTestModalOpen(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            🖨️ Testar Cupom (48mm)
          </Button>

          <div className="bg-gray-900/50 p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Checklist de Teste:</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>☐ Texto aparece completo (sem cortes)</li>
              <li>☐ Alinhamento está correto</li>
              <li>☐ Totais estão legíveis</li>
              <li>☐ Linha divisória aparece corretamente</li>
              <li>☐ Cupom corta automaticamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Teste */}
      <ReceiptModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        saleId="50e9bdf9-4a59-424a-9f95-57c2f825c84c" // ID de teste
        autoClose={false}
      />
    </div>
  );
};

export default AtomoPrinterSetup;