# Guia de Troubleshooting & Post-Mortems

Este documento armazena o histórico de problemas complexos resolvidos e suas
soluções definitivas.

---

## 1. Impressão Fiscal Duplicada (Double Print)

**Data da Resolução:** 17/01/2026 **Componentes Afetados:** `ReceiptModal.tsx`,
`RecentSales.tsx`

### Sintoma

Ao emitir uma NFC-e, o navegador abria a janela de impressão duas vezes
consecutivas. No modo Kiosk (impressão silenciosa), isso resultava na impressão
de dois cupons físicos.

### Causa Raiz

1. **Condição de Corrida (Race Condition):** A emissão da nota dispara
   `invalidateQueries` (atualiza a lista de vendas).
2. **Desmontagem de UI:** O `ReceiptModal` estava renderizado condicionalmente
   ao `isLoading` da lista. Ao atualizar a lista, o modal desmontava e
   remontava.
3. **Perda de Estado:** Ao remontar, o `ref` de controle (`hasPrinted`)
   resetava.
4. **Strict Mode:** Em desenvolvimento, efeitos rodam duas vezes.

### Solução Definitiva (Global Cache Pattern)

A solução anterior (Ref local) falhou pois o React pode desmontar/remontar o modal durante atualizações de lista (`invalidateQueries`), resetando o `useRef`.

**Nova Estratégia: Cache Singleton**

Implementamos um `Set` global no nível do módulo (fora do componente) para rastrear IDs impressos durante toda a sessão do navegador.

```typescript
// ✅ Padrão Correto em ReceiptModal.tsx

// 1. Definido FORA do componente (Singleton)
const printedFiscalIds = new Set<string>();

export const ReceiptModal = (...) => {
  // ...
  useEffect(() => {
    // 2. Verificação Robusta
    // Prioriza ID Externo > Chave > Sale ID
    const uniqueId = fiscalData.external_id || ...;

    // 3. Check no Cache Global
    if (printedFiscalIds.has(uniqueId)) return;

    // 4. Marca como impresso ANTES de chamar window.print
    printedFiscalIds.add(uniqueId);
    
    window.print();
  }, [...]);
}
```

> **Nota:** O botão "Imprimir Manual" ignora este cache deliberadamente para permitir reimpressões.

---
