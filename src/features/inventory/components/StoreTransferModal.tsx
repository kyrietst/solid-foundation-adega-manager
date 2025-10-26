/**
 * Modal para transferências de produtos entre lojas
 * v3.4.0 - Sistema Multi-Store
 */

import React, { useState, useEffect } from 'react';
import { EnhancedBaseModal } from '@/shared/ui/composite/EnhancedBaseModal';
import { Input } from '@/shared/ui/primitives/input';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Store, Package, Box, ArrowRight, AlertCircle } from 'lucide-react';
import { useStoreTransfer, validateTransferStock } from '../hooks/useStoreTransfer';
import { getStoreStock } from '../hooks/useStoreInventory';
import type { Product, StoreNumber, StoreLocation } from '@/core/types/inventory.types';

interface StoreTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  fromStore: StoreLocation;
}

export const StoreTransferModal: React.FC<StoreTransferModalProps> = ({
  isOpen,
  onClose,
  product,
  fromStore,
}) => {
  const [packages, setPackages] = useState<number>(0);
  const [unitsLoose, setUnitsLoose] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');

  const { executeTransfer, isTransferring } = useStoreTransfer();

  // Determinar loja de destino
  const toStore: StoreLocation = fromStore === 'store1' ? 'store2' : 'store1';
  const fromStoreNumber: StoreNumber = fromStore === 'store1' ? 1 : 2;
  const toStoreNumber: StoreNumber = toStore === 'store1' ? 1 : 2;

  const storeNames = { store1: 'Loja 1', store2: 'Loja 2' };

  // Resetar form ao abrir/fechar
  useEffect(() => {
    if (isOpen) {
      setPackages(0);
      setUnitsLoose(0);
      setNotes('');
      setValidationError('');
    }
  }, [isOpen, product]);

  if (!product) return null;

  // Obter estoque disponível na loja de origem
  const availableStock = getStoreStock(product, fromStore);

  const handleSubmit = async () => {
    if (!product) return;

    // Validar
    const validation = validateTransferStock(product, fromStoreNumber, packages, unitsLoose);
    if (!validation.valid) {
      setValidationError(validation.error || 'Erro de validação');
      return;
    }

    try {
      await executeTransfer({
        product_id: product.id,
        from_store: fromStoreNumber,
        to_store: toStoreNumber,
        packages,
        units_loose: unitsLoose,
        notes: notes || undefined,
      });

      // Fechar modal após sucesso
      onClose();
    } catch (error) {
      console.error('Erro ao transferir:', error);
    }
  };

  const isFormValid = packages > 0 || unitsLoose > 0;

  return (
    <EnhancedBaseModal
      isOpen={isOpen}
      onClose={onClose}
      modalType="action"
      title="Transferir Produto Entre Lojas"
      size="5xl"
      primaryAction={{
        label: 'Confirmar Transferência',
        onClick: handleSubmit,
        disabled: !isFormValid || isTransferring,
        loading: isTransferring,
      }}
      secondaryAction={{
        label: 'Cancelar',
        onClick: onClose,
        disabled: isTransferring,
      }}
    >
      <div className="space-y-4">
        {/* Header: Informações do Produto + Direção da Transferência */}
        <div className="grid grid-cols-2 gap-4">
          {/* Informações do Produto */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">{product.name}</h3>
            </div>
            <div className="text-xs text-gray-300">
              <span className="text-gray-400">Categoria:</span> {product.category}
            </div>
            {product.barcode && (
              <div className="text-xs text-gray-300">
                <span className="text-gray-400">Código:</span> {product.barcode}
              </div>
            )}
          </div>

          {/* Direção da Transferência */}
          <div className="flex items-center justify-center gap-3 bg-gray-800/30 rounded-lg p-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
              <Store className="h-4 w-4 text-blue-400" />
              <span className="text-white font-semibold text-sm">{storeNames[fromStore]}</span>
            </div>

            <ArrowRight className="h-5 w-5 text-gray-400 animate-pulse" />

            <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
              <Store className="h-4 w-4 text-purple-400" />
              <span className="text-white font-semibold text-sm">{storeNames[toStore]}</span>
            </div>
          </div>
        </div>

        {/* Grid: Estoque Disponível + Inputs de Quantidade */}
        <div className="grid grid-cols-2 gap-4">
          {/* Estoque Disponível */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-green-400 mb-2">
              Disponível em {storeNames[fromStore]}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">
                  <span className="font-bold">{availableStock.packages}</span> pacotes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-400" />
                <span className="text-white text-sm">
                  <span className="font-bold">{availableStock.units}</span> unidades soltas
                </span>
              </div>
            </div>
          </div>

          {/* Inputs de Quantidade */}
          <div className="space-y-3">
            <div>
              <label htmlFor="transfer-packages" className="block text-xs font-medium text-gray-300 mb-1.5">
                Quantidade de Pacotes
              </label>
              <Input
                id="transfer-packages"
                type="number"
                min="0"
                max={availableStock.packages}
                value={packages}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setPackages(Math.min(value, availableStock.packages));
                  setValidationError('');
                }}
                className="bg-white/5 border-white/10 text-white h-9"
              />
            </div>

            <div>
              <label htmlFor="transfer-units" className="block text-xs font-medium text-gray-300 mb-1.5">
                Quantidade de Unidades Soltas
              </label>
              <Input
                id="transfer-units"
                type="number"
                min="0"
                max={availableStock.units}
                value={unitsLoose}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setUnitsLoose(Math.min(value, availableStock.units));
                  setValidationError('');
                }}
                className="bg-white/5 border-white/10 text-white h-9"
              />
            </div>
          </div>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="transfer-notes" className="block text-sm font-medium text-gray-300 mb-2">
            Observações (opcional)
          </label>
          <Textarea
            id="transfer-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Reposição de estoque, Transferência para promoção..."
            className="bg-white/5 border-white/10 text-white min-h-[60px]"
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1">{notes.length}/500 caracteres</p>
        </div>

        {/* Erro de Validação */}
        {validationError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{validationError}</p>
          </div>
        )}

        {/* Resumo da Transferência - mais compacto */}
        {isFormValid && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-gray-300 mb-1.5">Resumo</h4>
            <div className="flex items-center gap-4 text-sm">
              {packages > 0 && (
                <div className="text-gray-300">
                  → <span className="font-semibold">{packages}</span> pacote(s)
                </div>
              )}
              {unitsLoose > 0 && (
                <div className="text-gray-300">
                  → <span className="font-semibold">{unitsLoose}</span> unidade(s) solta(s)
                </div>
              )}
              <div className="text-gray-400 text-xs ml-auto">
                <span className="text-blue-400">{storeNames[fromStore]}</span> → <span className="text-purple-400">{storeNames[toStore]}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </EnhancedBaseModal>
  );
};
