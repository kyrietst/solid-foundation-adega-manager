/**
 * Componente de demonstração do sistema de cupom fiscal
 * Para testar a impressão com dados reais
 */

import React, { useState } from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { ReceiptModal } from './ReceiptModal';
import { Receipt, Printer, Search } from 'lucide-react';

export const ReceiptTestDemo: React.FC = () => {
  const [saleId, setSaleId] = useState('50e9bdf9-4a59-424a-9f95-57c2f825c84c'); // Venda real de teste
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800/30 rounded-xl border border-gray-700/40">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2 justify-center">
          <Receipt className="h-6 w-6 text-blue-400" />
          Teste de Cupom Fiscal
        </h3>
        <p className="text-gray-400 text-sm">
          Sistema de impressão - Adega Anita's
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            ID da Venda:
          </label>
          <Input
            type="text"
            value={saleId}
            onChange={(e) => setSaleId(e.target.value)}
            placeholder="Cole aqui o ID de uma venda..."
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          disabled={!saleId.trim()}
        >
          <Printer className="h-4 w-4" />
          Visualizar Cupom
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>💡 Use este componente para testar o sistema</p>
          <p>antes de finalizar uma venda real</p>
        </div>
      </div>

      <ReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        saleId={saleId}
        autoClose={false}
      />
    </div>
  );
};

export default ReceiptTestDemo;