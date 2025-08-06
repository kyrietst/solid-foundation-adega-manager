/**
 * Utilitário de teste para cenários de conectividade intermitente
 * Apenas para desenvolvimento - simula condições de rede
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { Button } from '@/shared/ui/primitives/button';
import { Badge } from '@/shared/ui/primitives/badge';
import { Alert, AlertDescription } from '@/shared/ui/primitives/alert';
import { Progress } from '@/shared/ui/primitives/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Timer,
  Database,
  Download,
  Upload
} from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { supabase } from '@/core/api/supabase/client';

interface TestScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // em segundos
  steps: Array<{
    action: 'online' | 'offline' | 'slow' | 'test_operation' | 'cache_test';
    delay: number;
    params?: any;
  }>;
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    id: 'intermittent',
    name: 'Conectividade Intermitente',
    description: 'Simula conexão instável com desconexões frequentes',
    duration: 30,
    steps: [
      { action: 'online', delay: 0 },
      { action: 'test_operation', delay: 2000, params: { type: 'fetch_products' } },
      { action: 'offline', delay: 5000 },
      { action: 'test_operation', delay: 2000, params: { type: 'fetch_products' } },
      { action: 'online', delay: 8000 },
      { action: 'test_operation', delay: 2000, params: { type: 'fetch_products' } },
      { action: 'offline', delay: 5000 },
      { action: 'online', delay: 8000 }
    ]
  },
  {
    id: 'cache_validation',
    name: 'Validação de Cache',
    description: 'Testa cache inteligente com dados críticos',
    duration: 20,
    steps: [
      { action: 'online', delay: 0 },
      { action: 'cache_test', delay: 2000, params: { populate: true } },
      { action: 'offline', delay: 5000 },
      { action: 'cache_test', delay: 2000, params: { validate: true } },
      { action: 'online', delay: 8000 },
      { action: 'cache_test', delay: 2000, params: { refresh: true } }
    ]
  },
  {
    id: 'offline_operations',
    name: 'Operações Offline',
    description: 'Testa queue de operações quando offline',
    duration: 25,
    steps: [
      { action: 'online', delay: 0 },
      { action: 'offline', delay: 3000 },
      { action: 'test_operation', delay: 2000, params: { type: 'create_customer' } },
      { action: 'test_operation', delay: 2000, params: { type: 'update_product' } },
      { action: 'test_operation', delay: 2000, params: { type: 'record_sale' } },
      { action: 'online', delay: 10000 }
    ]
  }
];

export const NetworkTestUtility: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const [isRunning, setIsRunning] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<TestScenario | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<Array<{ timestamp: string; message: string; type: 'info' | 'success' | 'warning' | 'error' }>>([]);
  const [testResults, setTestResults] = useState<Array<{ test: string; result: 'pass' | 'fail'; details: string }>>([]);

  // Adicionar log
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-9), { timestamp, message, type }]);
  };

  // Simular mudança de status da rede
  const simulateNetworkChange = (status: 'online' | 'offline') => {
    if (status === 'offline') {
      addLog('🔴 Simulando desconexão', 'warning');
      // Simular offline através de evento
      window.dispatchEvent(new Event('offline'));
    } else {
      addLog('🟢 Simulando reconexão', 'success');
      // Simular online através de evento
      window.dispatchEvent(new Event('online'));
    }
  };

  // Executar operação de teste
  const executeTestOperation = async (type: string) => {
    try {
      addLog(`⚙️ Executando operação: ${type}`, 'info');
      
      switch (type) {
        case 'fetch_products':
          const products = await networkStatus.cacheWithFallback(
            'test_products',
            async () => {
              const { data, error } = await supabase.from('products').select('id, name').limit(5);
              if (error) throw error;
              return data;
            },
            { priority: 'high', category: 'products' }
          );
          
          if (products) {
            addLog(`✅ Produtos obtidos: ${products.length} itens`, 'success');
            setTestResults(prev => [...prev, { test: 'fetch_products', result: 'pass', details: `${products.length} produtos` }]);
          } else {
            addLog('❌ Falha ao obter produtos', 'error');
            setTestResults(prev => [...prev, { test: 'fetch_products', result: 'fail', details: 'Dados não disponíveis' }]);
          }
          break;

        case 'create_customer':
          const result = await networkStatus.executeWithFallback(
            async () => {
              // Simular criação de cliente
              return { id: Date.now(), name: 'Cliente Teste' };
            },
            { name: 'Cliente Teste' },
            { context: 'test_customer_creation' }
          );
          
          if (result) {
            addLog('✅ Cliente criado com sucesso', 'success');
            setTestResults(prev => [...prev, { test: 'create_customer', result: 'pass', details: 'Cliente criado' }]);
          } else {
            addLog('⏳ Cliente adicionado à fila offline', 'info');
            setTestResults(prev => [...prev, { test: 'create_customer', result: 'pass', details: 'Adicionado à fila' }]);
          }
          break;

        default:
          addLog(`⚠️ Tipo de operação desconhecido: ${type}`, 'warning');
      }
    } catch (error) {
      addLog(`❌ Erro na operação ${type}: ${error}`, 'error');
      setTestResults(prev => [...prev, { test: type, result: 'fail', details: String(error) }]);
    }
  };

  // Testar funcionalidades de cache
  const executeCacheTest = async (params: any) => {
    try {
      if (params.populate) {
        addLog('📦 Populando cache com dados de teste', 'info');
        await networkStatus.precacheData([
          {
            key: 'test_products_cache',
            fetcher: async () => ({ products: ['produto1', 'produto2', 'produto3'] }),
            priority: 'critical',
            category: 'products'
          },
          {
            key: 'test_settings_cache',
            fetcher: async () => ({ theme: 'dark', notifications: true }),
            priority: 'high',
            category: 'settings'
          }
        ]);
        addLog('✅ Cache populado com sucesso', 'success');
      }

      if (params.validate) {
        addLog('🔍 Validando dados no cache (offline)', 'info');
        const products = networkStatus.getCacheStats();
        if (products.size > 0) {
          addLog(`✅ Cache validado: ${products.size} itens disponíveis`, 'success');
          setTestResults(prev => [...prev, { test: 'cache_validation', result: 'pass', details: `${products.size} itens` }]);
        } else {
          addLog('❌ Cache vazio', 'error');
          setTestResults(prev => [...prev, { test: 'cache_validation', result: 'fail', details: 'Cache vazio' }]);
        }
      }

      if (params.refresh) {
        addLog('🔄 Testando refresh do cache', 'info');
        const stats = networkStatus.getCacheStats();
        addLog(`📊 Estatísticas do cache: ${JSON.stringify(stats)}`, 'info');
      }
    } catch (error) {
      addLog(`❌ Erro no teste de cache: ${error}`, 'error');
    }
  };

  // Executar cenário de teste
  const runScenario = async (scenario: TestScenario) => {
    setIsRunning(true);
    setCurrentScenario(scenario);
    setProgress(0);
    setLogs([]);
    setTestResults([]);
    
    addLog(`🚀 Iniciando cenário: ${scenario.name}`, 'info');
    
    const totalDuration = scenario.duration * 1000;
    let elapsed = 0;

    for (const step of scenario.steps) {
      // Aguardar delay
      if (step.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        elapsed += step.delay;
        setProgress((elapsed / totalDuration) * 100);
      }

      // Executar ação
      switch (step.action) {
        case 'online':
          simulateNetworkChange('online');
          break;
        case 'offline':
          simulateNetworkChange('offline');
          break;
        case 'test_operation':
          await executeTestOperation(step.params.type);
          break;
        case 'cache_test':
          await executeCacheTest(step.params);
          break;
      }
    }

    // Aguardar conclusão
    await new Promise(resolve => setTimeout(resolve, totalDuration - elapsed));
    setProgress(100);
    
    addLog('✅ Cenário de teste concluído', 'success');
    setIsRunning(false);
  };

  // Mostrar apenas em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Utilitário de teste disponível apenas em modo de desenvolvimento.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Timer className="w-5 h-5" />
            <span>Network Test Utility</span>
          </CardTitle>
          <CardDescription>
            Simula cenários de conectividade intermitente para testar robustez da aplicação
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status atual */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              {networkStatus.isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={networkStatus.isOnline ? 'text-green-600' : 'text-red-600'}>
                {networkStatus.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            <Badge variant="outline">
              Queue: {networkStatus.queueSize}
            </Badge>
            
            <Badge variant="outline">
              Cache: {networkStatus.getCacheStats().size} itens
            </Badge>
          </div>

          {/* Progress bar se teste em execução */}
          {isRunning && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Executando: {currentScenario?.name}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Cenários de teste */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {TEST_SCENARIOS.map(scenario => (
              <Card key={scenario.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{scenario.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{scenario.duration}s</span>
                    <Button 
                      size="sm" 
                      disabled={isRunning}
                      onClick={() => runScenario(scenario)}
                    >
                      {isRunning && currentScenario?.id === scenario.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        'Executar'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Logs em tempo real */}
          {logs.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Logs de Execução</h4>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 max-h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono flex items-start space-x-2">
                    <span className="text-gray-500 text-xs">{log.timestamp}</span>
                    <span className={
                      log.type === 'error' ? 'text-red-600' :
                      log.type === 'warning' ? 'text-yellow-600' :
                      log.type === 'success' ? 'text-green-600' :
                      'text-gray-700'
                    }>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resultados dos testes */}
          {testResults.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Resultados dos Testes</h4>
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center space-x-3 text-sm">
                    {result.result === 'pass' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{result.test}</span>
                    <span className="text-gray-600">{result.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};