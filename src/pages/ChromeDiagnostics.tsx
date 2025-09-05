import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/primitives/card';
import { runChromeDiagnostics } from '@/core/utils/chrome-diagnostics';
import { clearChromeAuthData } from '@/core/api/supabase/client';

const ChromeDiagnostics = () => {
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const [isChrome, setIsChrome] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const chromeDetected = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
    setIsChrome(chromeDetected);
  }, []);

  const handleRunDiagnostics = () => {
    console.log('🔍 Executando diagnósticos completos...');
    const results = runChromeDiagnostics();
    setDiagnosticResults(results);
  };

  const handleClearAuthData = () => {
    const cleared = clearChromeAuthData();
    console.log(`🧹 Limpou ${cleared} chaves de autenticação`);
    alert(`Limpou ${cleared} chaves de autenticação do Chrome. Verifique o console para detalhes.`);
  };

  const handleTestLogin = () => {
    window.location.href = '/auth';
  };

  if (!isChrome) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Diagnósticos Chrome</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Esta página é específica para diagnósticos do Chrome. Você não está usando Chrome no momento.</p>
              <p className="mt-2">Browser atual: {navigator.userAgent}</p>
              <Button onClick={() => window.location.href = '/'} className="mt-4">
                Voltar ao Sistema
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Diagnósticos Chrome - Adega Manager</CardTitle>
            <p className="text-muted-foreground">
              Ferramentas para diagnosticar e resolver problemas específicos do Chrome
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Browser Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Informações do Browser</h3>
                <p className="text-sm">Chrome detectado: ✅</p>
                <p className="text-sm">Version: {navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Desconhecida'}</p>
                <p className="text-sm">Cookies: {navigator.cookieEnabled ? '✅ Habilitados' : '❌ Desabilitados'}</p>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Storage Status</h3>
                <p className="text-sm">localStorage: {typeof localStorage !== 'undefined' ? '✅ Disponível' : '❌ Indisponível'}</p>
                <p className="text-sm">sessionStorage: {typeof sessionStorage !== 'undefined' ? '✅ Disponível' : '❌ Indisponível'}</p>
                <p className="text-sm">Chaves Supabase: {Object.keys(localStorage).filter(k => k.includes('supabase')).length}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={handleRunDiagnostics} variant="outline">
                🔍 Executar Diagnóstico
              </Button>
              
              <Button onClick={handleClearAuthData} variant="outline">
                🧹 Limpar Auth Data
              </Button>
              
              <Button onClick={handleTestLogin} variant="outline">
                🚪 Testar Login
              </Button>
              
              <Button onClick={() => window.location.reload()} variant="outline">
                🔄 Reload Página
              </Button>
            </div>

            {/* Quick Fixes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🛠️ Soluções Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Limpar Dados do Chrome</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Chrome Settings → Privacy → Clear browsing data</li>
                      <li>• Selecionar "Cookies and other site data"</li>
                      <li>• Selecionar "Cached images and files"</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">2. Desabilitar Extensões</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Chrome Extensions → Desabilitar todas</li>
                      <li>• Testar o sistema novamente</li>
                      <li>• Reabilitar uma por vez para identificar conflitos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">3. Verificar Cookies</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Chrome Settings → Privacy → Site Settings</li>
                      <li>• Verificar se third-party cookies estão permitidos</li>
                      <li>• Adicionar *.supabase.co às exceções</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">4. Modo Incógnito</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Tentar acessar em janela incógnita</li>
                      <li>• Isso elimina extensões e cache</li>
                      <li>• Se funcionar, o problema está no perfil</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Diagnostic Results */}
            {diagnosticResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📊 Resultados do Diagnóstico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm">
                    <pre>
                      Browser: {diagnosticResults.browser.substring(0, 100)}...{'\n'}
                      Storage Working: {diagnosticResults.storageWorking ? 'YES' : 'NO'}{'\n'}
                      Supabase Keys: {diagnosticResults.supabaseKeys.length}{'\n'}
                      {'\n'}
                      Recomendações:{'\n'}
                      {diagnosticResults.recommendations.map((rec: string, i: number) => 
                        `${i + 1}. ${rec}\n`
                      ).join('')}
                    </pre>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Verifique o console do Chrome (F12) para informações detalhadas
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Back to App */}
            <div className="text-center">
              <Button onClick={() => window.location.href = '/'} className="w-full md:w-auto">
                🏠 Voltar ao Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChromeDiagnostics;