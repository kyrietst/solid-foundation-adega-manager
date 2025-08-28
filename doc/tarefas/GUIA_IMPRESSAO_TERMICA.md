# 🖨️ Guia de Correção - Sistema de Impressão Térmica

**Data de Implementação**: 28/08/2025  
**Status**: Aguardando teste com impressora térmica (20h)  
**Empresa**: Adega Anita's

---

## 📋 Resumo da Implementação

Sistema de impressão de cupom fiscal implementado para impressoras térmicas de 80mm. O cupom é gerado automaticamente após finalização de vendas no sistema.

### Arquivos Implementados:

```
src/features/sales/
├── components/
│   ├── ReceiptPrint.tsx        # Componente principal do cupom
│   ├── ReceiptModal.tsx        # Modal de visualização/impressão
│   └── ReceiptTestDemo.tsx     # Componente para testes
├── hooks/
│   └── useReceiptData.ts       # Hook para buscar dados da venda
└── styles/
    └── thermal-print.css       # CSS específico para impressão térmica
```

---

## 🔍 Como Testar o Sistema

### 1. Teste Manual no Navegador
```bash
# Navegar para a página de vendas
http://localhost:8080/sales

# Finalizar uma venda qualquer
# Modal de impressão deve abrir automaticamente
```

### 2. Teste com Componente de Demonstração
- Usar `ReceiptTestDemo.tsx` com ID de venda real
- ID padrão: `50e9bdf9-4a59-424a-9f95-57c2f825c84c`

### 3. Visualização de Impressão
- Pressionar `Ctrl+P` ou `Cmd+P` no modal
- Verificar preview de impressão
- Layout deve aparecer formatado para 80mm

---

## ⚠️ Problemas Potenciais e Correções

### Problema 1: CSS não carregando na impressão
**Sintomas**: Cupom aparece sem formatação quando impresso
**Solução**:
```tsx
// ReceiptPrint.tsx - linha 70
// Verificar se o CSS está sendo carregado corretamente
<link rel="stylesheet" href="/src/features/sales/styles/thermal-print.css" media="print" />

// Alternativa: Importar diretamente no componente
import './styles/thermal-print.css';
```

### Problema 2: Largura incorreta na impressora
**Sintomas**: Texto cortado ou mal distribuído
**Solução**: Ajustar no `thermal-print.css`
```css
/* Linha 37-38 - Ajustar largura se necessário */
.receipt-print {
  width: 80mm !important;        /* Padrão */
  width: 72mm !important;        /* Se estiver cortando */
  width: 76mm !important;        /* Meio termo */
}
```

### Problema 3: Fonte não monospace
**Sintomas**: Alinhamento irregular do texto
**Solução**: Forçar fonte no CSS
```css
/* thermal-print.css - linha 15 */
body {
  font-family: 'Courier New', 'Consolas', monospace !important;
}
```

### Problema 4: Modal não abre após venda
**Sintomas**: Venda finaliza mas cupom não aparece
**Verificar em**: `SalesPage.tsx - linha 47-51`
```tsx
const handleSaleComplete = (saleId: string) => {
  console.log('Sale completed:', saleId); // Debug
  setCompletedSaleId(saleId);
  setReceiptModalOpen(true);
};
```

### Problema 5: Dados não carregam no cupom
**Sintomas**: Cupom aparece em branco ou com erro
**Verificar**: Hook `useReceiptData.ts`
```tsx
// Verificar se a query está funcionando
const { data: receiptData, isLoading, error } = useReceiptData(saleId);

// Debug no console
console.log('Receipt data:', receiptData);
console.log('Loading:', isLoading);
console.log('Error:', error);
```

---

## 🛠️ Correções Rápidas

### Correção 1: CSS Inline como Fallback
Se o CSS externo falhar, adicionar estilos críticos inline:

```tsx
// No ReceiptPrint.tsx
const thermalStyles = {
  width: '80mm',
  fontFamily: 'Courier New, monospace',
  fontSize: '12px',
  margin: 0,
  padding: '4mm'
};

<div className="receipt-print" style={thermalStyles}>
```

### Correção 2: Ajuste de Margens
```css
/* thermal-print.css */
@page {
  size: 80mm auto !important;
  margin: 2mm !important;  /* Adicionar margem se estiver cortando */
}
```

### Correção 3: Quebra de Linha Longa
```css
/* Para nomes de produtos muito longos */
.receipt-item-name {
  word-break: break-word !important;
  overflow-wrap: break-word !important;
}
```

---

## 📏 Especificações Técnicas da Impressora

### Configurações Padrão (80mm)
- **Largura**: 80mm (302px)
- **Margem**: 2-4mm cada lado
- **Área útil**: ~72mm (272px)
- **Fonte recomendada**: Courier New, 12px
- **Resolução**: 203 DPI

### Comandos ESC/POS Comuns
Se precisar de controle direto da impressora:
```javascript
// Centralizar texto
const centerText = '\x1B\x61\x01';

// Texto em negrito
const boldText = '\x1B\x45\x01';

// Cortar papel
const cutPaper = '\x1D\x56\x00';
```

---

## 🧪 Dados para Teste

### Venda Real Disponível
```javascript
// ID de venda real no sistema
const testSaleId = '50e9bdf9-4a59-424a-9f95-57c2f825c84c';

// Dados esperados:
{
  id: "50e9bdf9-4a59-424a-9f95-57c2f825c84c",
  final_amount: 45.50,
  customer_name: "João Silva",
  payment_method: "pix",
  items: [...] // Lista de produtos
}
```

### Criar Venda de Teste
```sql
-- SQL para criar venda de teste se necessário
INSERT INTO sales (customer_id, final_amount, payment_method) 
VALUES (1, 25.50, 'cash');
```

---

## 📝 Checklist de Verificação

### ✅ Antes do Teste
- [ ] Sistema rodando em `npm run dev`
- [ ] Impressora térmica conectada
- [ ] Driver da impressora instalado
- [ ] Papel na impressora
- [ ] Navegador com JavaScript habilitado

### ✅ Durante o Teste
- [ ] Finalizar venda real no sistema
- [ ] Modal abre automaticamente
- [ ] Dados aparecem corretamente
- [ ] Preview de impressão funciona (`Ctrl+P`)
- [ ] Layout está formatado para 80mm
- [ ] Imprimir cupom teste

### ✅ Verificar no Cupom Impresso
- [ ] **Cabeçalho**: "ADEGA ANITA'S" aparece
- [ ] **Dados da venda**: Data, ID, vendedor
- [ ] **Cliente**: Nome e telefone (se houver)
- [ ] **Itens**: Quantidade, nome, preços
- [ ] **Totais**: Subtotal, desconto, total
- [ ] **Pagamento**: Método correto em português
- [ ] **Rodapé**: "Obrigado!" e mensagem
- [ ] **Formatação**: Texto alinhado e legível

---

## 🚨 Problemas Críticos - Correção Imediata

### Se cupom não imprimir:
1. Verificar se impressora está definida como padrão
2. Testar impressão de página web simples
3. Verificar se CSS @media print está funcionando

### Se dados não aparecem:
1. Verificar conexão Supabase
2. Conferir RLS policies para tabela `sales`
3. Testar query SQL diretamente no dashboard

### Se layout está quebrado:
1. Ajustar largura no CSS (72mm-80mm)
2. Reduzir tamanho da fonte se necessário
3. Simplificar estrutura do HTML

---

## 📞 Informações de Debug

### Console Logs Importantes
```javascript
// Verificar se venda foi finalizada
console.log('Sale completed:', saleId);

// Verificar dados do cupom
console.log('Receipt data loaded:', receiptData);

// Verificar erro na query
console.log('Receipt query error:', error);
```

### URLs de Teste
- **Vendas**: http://localhost:8080/sales
- **Dashboard**: http://localhost:8080/dashboard (para verificar venda criada)

### Banco de Dados
- **Tabela principal**: `sales`
- **Colunas importantes**: `id`, `final_amount`, `customer_id`, `payment_method`
- **Join necessário**: `customers` para nome do cliente

---

## 📋 Notas Finais

- Sistema implementado seguindo padrões da empresa
- Compatível com impressoras térmicas ESC/POS
- Integrado ao fluxo de vendas existente
- CSS otimizado para papel de 80mm
- Fallbacks implementados para robustez

**Próximo teste**: 20 horas com impressora térmica real  
**Desenvolvedor**: Claude Code  
**Projeto**: Adega Manager v2.0.0