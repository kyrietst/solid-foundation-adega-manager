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

### Solução Definitiva (Não Alterar!)

Foram aplicadas duas camadas de proteção. **Se refatorar, mantenha estas
lógicas:**

#### A. Camada de Arquitetura (RecentSales.tsx)

O Modal de Impressão foi movido para fora do bloco condicional de loading.

```tsx
// ✅ Correto
return (
  <>
    {isLoading ? <Skeleton /> : <List />}
    <ReceiptModal /> {/* Sempre montado */}
  </>
);
```

#### B. Camada de Lógica (ReceiptModal.tsx)

Implementada verificação de **Idempotência por ID**.

```typescript
// ✅ Correto
const currentId = data.external_id;
// Se este ID já foi impresso nesta sessão do modal, aborta.
if (lastPrintedId.current === currentId) return;

lastPrintedId.current = currentId;
window.print();
```

---
