import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import { Label } from '@/shared/ui/primitives/label';
import { useBarcode } from '@/features/inventory/hooks/use-barcode';
import { Scan, Loader2 } from 'lucide-react';
import { cn } from '@/core/config/utils';
import type { BarcodeComponentProps } from '@/types/inventory.types';

interface BarcodeInputProps extends BarcodeComponentProps {
  placeholder?: string;
  className?: string;
}

export const BarcodeInput: React.FC<BarcodeInputProps> = ({
  onScan,
  disabled = false,
  placeholder = "Escaneie ou digite o código de barras",
  autoFocus = true,
  className = ""
}) => {
  const [barcode, setBarcode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { validateBarcode } = useBarcode();

  // Foco automático no input (útil após processar um código)
  useEffect(() => {
    if (autoFocus && inputRef.current && !isProcessing) {
      inputRef.current.focus();
    }
  }, [autoFocus, isProcessing]);

  // Detecta entrada automática do leitor (código seguido de Enter rapidamente)
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode.trim()) {
      e.preventDefault();
      await processBarcode(barcode.trim());
    }
  };

  // Processa o código escaneado ou digitado - memoizado para evitar re-criação
  const processBarcode = useCallback(async (code: string) => {
    if (isProcessing || disabled) return;

    // Validação básica
    const validation = validateBarcode(code);
    if (!validation.isValid) {
      setBarcode('');
      return;
    }

    setIsProcessing(true);
    
    try {
      await onScan(code);
      setBarcode(''); // Limpa o input após processar
    } catch (error) {
      console.error('Erro ao processar código de barras:', error);
    } finally {
      setIsProcessing(false);
      // Retorna foco ao input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isProcessing, disabled, validateBarcode, onScan]);

  const handleManualScan = useCallback(() => {
    if (barcode.trim()) {
      processBarcode(barcode.trim());
    }
  }, [barcode, processBarcode]);

  const validation = barcode ? validateBarcode(barcode) : { isValid: true };

  return (
    <div className={cn(className)}>
      <div className="flex gap-2 items-center">
        <Input
          id="barcode-input"
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))} // Apenas números
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isProcessing}
          maxLength={14}
          className={cn(
            "font-mono text-lg h-12 text-white placeholder:text-gray-200", // Font monospace para códigos + altura fixa + contraste melhorado
            !validation.isValid && "border-red-500 focus-visible:ring-red-500"
          )}
          autoComplete="off"
        />
        <Button
          type="button"
          onClick={handleManualScan}
          disabled={disabled || isProcessing || !barcode.trim() || !validation.isValid}
          className="h-12 px-3" // Altura fixa igual ao input
          variant="outline"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scan className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {barcode && !validation.isValid && (
        <p className="text-sm text-red-600">
          {validation.error || "Código inválido. Use formato EAN-8, EAN-13 ou UPC."}
        </p>
      )}
      
      {barcode && validation.isValid && validation.format && (
        <p className="text-sm text-green-600">
          Formato detectado: {validation.format}
        </p>
      )}
    </div>
  );
};

export default BarcodeInput;