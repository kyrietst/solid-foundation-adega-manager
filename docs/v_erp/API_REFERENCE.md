# API Reference & Architecture Map

> [!NOTE]
> Este documento serve como o **Mapa Central** para toda a comunicação de dados
> no Adega Manager. **Regra de Ouro:** Não reinvente a roda. Verifique se a
> função já existe antes de criar uma nova.
>
> 🚀 **Novo no projeto?** Comece por aqui: [`DEVELOPER_ONBOARDING_FISCAL.md`](./DEVELOPER_ONBOARDING_FISCAL.md)

---

## 1. Camadas de API

O sistema utiliza uma arquitetura híbrida de **RPCs (Banco de Dados)** e **Edge
Functions (Serverless)**.

### A. Database RPCs (Lógica de Negócio Core)

Para operações transacionais (Vendas, Estoque, Financeiro), utilizamos Stored
Procedures no PostgreSQL chamadas via supabase-js.

- **Arquivo de Referência:**
  [`docs/v_erp/standards/02_RPC_REFERENCE.md`](./standards/02_RPC_REFERENCE.md)
- **Protocolos de Integridade:**
  [`docs/v_erp/ZERO_TRUST_INTEGRITY_RULES.md`](./ZERO_TRUST_INTEGRITY_RULES.md)
- **Principais Funções:**
  - `process_sale(...)`: Venda atômica (Estoque + Financeiro + Delivery Bool).
  - `create_inventory_movement(...)`: Movimentação auditada de estoque.
  - `create_quick_customer(...)`: "Find or Create" por telefone (Anti-duplicidade).
  - `cancel_sale(...)`: Estorno seguro.

### B. Edge Functions (Integrações Externas)

Para comunicação com APIs de terceiros (SEFAZ, Nuvem Fiscal), utilizamos
Supabase Edge Functions.

- **Arquivo de Referência:**
  [`docs/v_erp/NUVEM_FISCAL_INTEGRATION.md`](./NUVEM_FISCAL_INTEGRATION.md)
- **Endpoint Principal:** `fiscal-handler`
  - Gerencia Emissão, Cancelamento e Consultas de NFC-e.
  - **Segurança:** Utiliza Secrets do Supabase (não expostos no front).

---

## 2. Regras de Consumo (Frontend)

### "The Hook Pattern"

**NUNCA** faça chamadas diretas ao `supabase.from()` ou `supabase.rpc()` dentro
de componentes `.tsx`.

- ✅ **Correto:** Componente chama `useSalesMutations.emitSale()`.
- ❌ **Errado:** Componente chama `supabase.rpc('process_sale')`.

### Isolamento de Ambiente

O frontend desconhece se está em Produção ou Homologação.

- Quem decide o ambiente fiscal é a tabela `store_settings` no banco.
- Quem decide a URL da API Fiscal é a Edge Function `fiscal-handler`.

---

## 3. Glossário de Entidades

| Entidade      | Responsabilidade                       | Fonte da Verdade      |
| :------------ | :------------------------------------- | :-------------------- |
| **Sales**     | Histórico de Vendas e Pedidos          | Tabela `sales`        |
| **Products**  | Catálogo e Inventário Físico           | Tabela `products`     |
| **Invoices**  | Metadados da Nota Fiscal (Status, URL) | Tabela `invoice_logs` |
| **Customers** | CRM e Crédito (Fiado)                  | Tabela `customers`    |

---

## 4. Dúvidas Comuns

- **Como adicionar uma nova feature?** Crie o RPC no banco primeiro, depois o
  Hook.
- **A nota fiscal duplicou?** Verifique `ReceiptModal.tsx` e suas travas de
  segurança (Ver
  [`NUVEM_FISCAL_INTEGRATION.md`](./NUVEM_FISCAL_INTEGRATION.md)).
