import { useEffect, useRef, useCallback } from 'react';

interface UseGlobalBarcodeScannerOptions {
    onScan: (barcode: string) => void;
    enabled?: boolean;
    minLength?: number;
    maxLength?: number;
    timeout?: number; // Timeout para limpar buffer (ms)
}

/**
 * Hook global para detectar entrada de leitor de código de barras
 * 
 * Detecta quando um código de barras é lido baseado em:
 * - Sequência rápida de números (< 100ms entre caracteres)
 * - Finalizado com tecla Enter
 * - Não interfere com digitação em campos de input
 * 
 * @param onScan - Callback chamado quando código é detectado
 * @param enabled - Se o scanner está ativo (padrão: true)
 * @param minLength - Tamanho mínimo do código (padrão: 8 para EAN-8)
 * @param maxLength - Tamanho máximo do código (padrão: 14 para EAN-14)
 * @param timeout - Timeout para limpar buffer em ms (padrão: 500ms)
 */
export function useGlobalBarcodeScanner({
    onScan,
    enabled = true,
    minLength = 8,
    maxLength = 14,
    timeout = 500,
}: UseGlobalBarcodeScannerOptions) {
    const bufferRef = useRef<string>('');
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastKeyTimeRef = useRef<number>(0);

    const clearBuffer = useCallback(() => {
        bufferRef.current = '';
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const processBarcode = useCallback((code: string) => {
        if (code.length >= minLength && code.length <= maxLength) {
            onScan(code);
        }
        clearBuffer();
    }, [onScan, minLength, maxLength, clearBuffer]);

    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            const tagName = target.tagName.toLowerCase();

            // Ignora eventos de inputs/textareas para não interferir com digitação normal
            const isInputField = tagName === 'input' || tagName === 'textarea';

            if (isInputField) {
                return;
            }

            const currentTime = Date.now();
            const timeSinceLastKey = currentTime - lastKeyTimeRef.current;

            // Se demorou muito desde a última tecla, limpa o buffer
            if (timeSinceLastKey > timeout) {
                clearBuffer();
            }

            lastKeyTimeRef.current = currentTime;

            // Detecta Enter - processa o código
            if (event.key === 'Enter') {
                event.preventDefault();
                if (bufferRef.current) {
                    processBarcode(bufferRef.current);
                }
                return;
            }

            // Detecta números (0-9)
            if (/^\d$/.test(event.key)) {
                // Previne ações padrão apenas se não estiver em um input
                if (!isInputField) {
                    event.preventDefault();
                }

                bufferRef.current += event.key;

                // Reseta o timeout
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
                timeoutRef.current = setTimeout(clearBuffer, timeout);

                return;
            }

            // Qualquer outra tecla limpa o buffer (não é um scan válido)
            if (!event.ctrlKey && !event.altKey && !event.metaKey) {
                clearBuffer();
            }
        };

        // Adiciona listener global
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            clearBuffer();
        };
    }, [enabled, timeout, clearBuffer, processBarcode]);

    return { clearBuffer };
}
