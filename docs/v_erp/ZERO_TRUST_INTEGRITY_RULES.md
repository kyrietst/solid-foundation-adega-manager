
# Zero Trust Integrity Rules (The Constitution)

> **Regras imutáveis do Adega Manager.**
> Quebrar estas regras causará inconsistência de dados, perda financeira ou falha fiscal.

---

## 1. Protocolo de Detecção de Delivery (Delivery Detection)

### Regra
Para determinar se uma venda é "Delivery" ou "Presencial", **NUNCA** confie apenas em strings ou Enums antigos (ex: `delivery_type`).

### Fonte da Verdade (Source of Truth)
Uma venda é **Delivery** se, e somente se:
1. A flag booleana `delivery` for `true` no banco de dados.
2. **OU** A taxa de entrega (`delivery_fee`) for maior que `0`.

### Implementação de Referência
```typescript
// ✅ CORRETO (Robust Check)
const isDelivery = sale.delivery === true || (sale.delivery_fee || 0) > 0;

// ❌ ERRADO (Legacy - Nunca usar)
// const isDelivery = sale.delivery_type === 'delivery';
```

### Por que?
Vendas complexas (Fiado Delivery, Vendas Híbridas) podem não ter o tipo preenchido corretamente por falha humana ou legado, mas a taxa monetária (`delivery_fee`) é sempre exata.

---

## 2. Protocolo de Integridade Fiscal (Fiscal First)

### Regra
Se uma venda possui Nota Fiscal Autorizada, ela **JAMAIS** pode ser excluída fisicamente ou estornada do estoque sem antes cancelar a nota na SEFAZ.

### Fluxo Obrigatório
1. Verificar `invoice_logs` para ver se existe NF autorizada.
2. Se existir:
   - Chamar API Fiscal para Cancelamento (`action: 'cancel'`).
   - SÓ após sucesso (200 OK), chamar `rpc/cancel_sale`.
3. Se falhar a API Fiscal: **Abortar tudo**. Não estornar estoque.

---

## 3. Protocolo de Escrita (RPC Only)

### Regra
Nenhuma regra de negócio complexa (Venda, Movimentação de Estoque, Fechamento de Caixa) deve ser escrita no Frontend.

- **Frontend:** Apenas exibe dados e captura inputs.
- **Backend (RPC):** Executa a transação atômica.

### Exemplo
- **Venda:** Use `rpc/process_sale`.
- **Movimentação:** Use `rpc/create_inventory_movement`.
- **Nunca:** Fazer `INSERT` direto nas tabelas `sales`, `sale_items` ou `inventory_movements` via cliente JS.

---

## 4. Higiene de Código (Zero Lixo)

### Regra
Código morto ou comentado deve ser removido, não escondido.
Se uma feature "Legada" (ex: `calculateRealCOGS` no front) foi substituída por uma View no banco (`v_sales_with_profit`), a função antiga DEVE ser deletada.
