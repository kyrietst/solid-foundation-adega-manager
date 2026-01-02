# 🏗️ Análise Arquitetural Profunda: Solid Foundation Adega Manager

Esta análise técnica detalhada foi realizada para fundamentar a configuração rigorosa das 'System Rules' (Regras de Sistema), garantindo que o agente de IA e desenvolvedores operem com 100% de precisão em relação à stack tecnológica e à integridade do banco de dados.

---

## 1. Core Stack & UI Ecosystem

O projeto é construído sobre uma base moderna que prioriza **Type Safety** e **Performance**.

*   **Core Framework:** [React 19](https://react.dev/) com suporte nativo a features assíncronas e [Vite](https://vitejs.dev/) como motor de build ultrarrápido.
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/) em modo estrito, garantindo que "null safety" e contratos de tipos sejam respeitados em todo o fluxo.
*   **Styling & Design System:**
    *   **CSS Engine:** [Tailwind CSS](https://tailwindcss.com/) com tokens de design customizados em `tailwind.config.ts`.
    *   **UI Components:** [Shadcn UI](https://ui.shadcn.com/) (Radix UI) para componentes acessíveis e altamente customizáveis.
    *   **Theming:** Suporte completo a Dark Mode via `next-themes`.
*   **Gestão de Estado & Data Flow:**
    *   **Server State:** [TanStack Query v5](https://tanstack.com/query/latest) (React Query) para cache inteligente, revalidação e atualizações otimistas.
    *   **Client State:** [Zustand](https://zustand-demo.pmnd.rs/) para estados globais leves (ex: filtros de busca, estado do sidebar).
*   **Formulários & Validação:** [React Hook Form](https://react-hook-form.com/) integrado ao [Zod](https://zod.dev/) para validação de esquemas tanto no formulário quanto na entrada de APIs.

---

## 2. Infraestrutura Supabase & Conectividade

A integração com o backend é "SPA-first", utilizando o Supabase Client diretamente no navegador com camadas de compatibilidade.

*   **Tipagem do Banco:** 
    *   Documento Base: [database.types.ts](file:///src/core/types/database.types.ts) (Gerado automaticamente).
    *   Alias de Conveniência: [supabase.ts](file:///src/core/types/supabase.ts).
*   **Cliente Supabase:** Centralizado em [client.ts](file:///src/core/api/supabase/client.ts).
    *   **Recurso Crítico:** Contém correções específicas para persistência de sessão no **Google Chrome** e diagnósticos de rede.
    *   **Instanciação:** `export const supabase = createClient<Database>(...)`.
*   **Data Fetching Pattern:** 
    *   NUNCA utilize `supabase.from()` diretamente em componentes.
    *   SEMPRE crie/utilize hooks em `features/[nome_feature]/hooks/` (ex: `useSalesQueries.ts`).
    *   Utilize o wrapper `useSupabaseQuery` em [shared/hooks/common/useSupabaseQuery.ts](file:///src/shared/hooks/common/useSupabaseQuery.ts).

---

## 3. Especificações Técnicas de Banco de Dados (DBA Insight)

Para evitar erros de sintaxe ou alucinações de campos, utilize as definições exatas abaixo:

### 3.1. Tabela `products` (Catálogo e Inventário)
| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key (Gerada via `uuid_generate_v4()`) |
| `name` | `text` | **Obrigatório** |
| `price` | `numeric` | **Obrigatório** |
| `cost_price` | `numeric` | Opcional (Preço de custo para cálculo de lucro) |
| `stock_packages` | `integer` | Estoque em volumes (Caixas/Packs) |
| `stock_units_loose` | `integer` | Estoque em unidades avulsas |
| `units_per_package`| `integer` | Fator de conversão entre pacote e unidade |
| `minimum_stock` | `integer` | Gatilho para alertas de reposição |
| `deleted_at` | `timestamptz`| Soft Delete (NUNCA delete fisicamente se houver estoque) |

> [!CAUTION]
> **Estoque Negativo:** A tabela não possui flag `allow_negative`. A integridade é garantida pela trigger `validate_stock_update` no Postgres que bloqueia transações que resultariam em estoque insuficiente.

### 3.2. Tabela `sales` (Transações)
| Coluna | Tipo | Notas |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key |
| `total_amount` | `numeric` | **Obrigatório** (Valor bruto) |
| `final_amount` | `numeric` | Valor líquido após descontos e taxas |
| `discount_amount` | `numeric` | Default: 0 |
| `customer_id` | `uuid` | Nullable (Garante "Consumidor Final / Balcão") |
| `payment_method_enum`| `enum`| Vinculado ao enum `payment_method_enum` |
| `status_enum` | `enum` | Vinculado ao enum `sales_status_enum` |

---

## 4. Assinaturas exatas de RPC (Functions)

Estas funções são o "Cérebro" do sistema. Operações complexas DEVEM usar estas chamadas via `.rpc()`.

### 4.1. `process_sale` (Processamento Atômico)
Responsável por criar a venda, registrar itens e dar baixa no estoque em uma única transação ACID.
```typescript
interface ProcessSaleArgs {
  p_customer_id: string | null;      // uuid
  p_user_id: string;               // uuid (Id do operador/vendedor)
  p_items: jsonb[];                // Itens: [{id, quantity, unit_price}]
  p_total_amount: number;          // Valor Total Bruto
  p_final_amount: number;          // Valor Total com descontos/taxas
  p_payment_method_id: string;     // uuid (Id do método de pagamento)
  p_discount_amount?: number;      // Default: 0
  p_notes?: string;                // Default: ''
  p_is_delivery?: boolean;         // Default: false
}
```

### 4.2. `create_inventory_movement` (Gestão de Estoque)
Sempre que o estoque for alterado manualmente, utilize esta função.
*   **Argumentos:** `p_product_id (uuid)`, `p_quantity_change (int)`, `p_type (movement_type)`, `p_reason (text)`, `p_metadata (jsonb)`, `p_movement_type (text)`.

### 4.3. `sell_from_batch_fifo` (Baixa de Lotes)
Utilizada para produtos com data de validade ativa.

---

## 5. Dicionário de ENUMs (Valores Exatos)

NUNCA utilize strings literais diferentes destas:

*   **`movement_type`:** `sale`, `initial_stock`, `inventory_adjustment`, `return`, `stock_transfer_out`, `stock_transfer_in`, `personal_consumption`.
*   **`payment_method_enum`:** `cash`, `credit`, `debit`, `pix`, `bank_transfer`, `check`, `other`.
*   **`sales_status_enum`:** `pending`, `processing`, `completed`, `cancelled`, `refunded`.
*   **`user_role`:** `admin`, `employee`, `delivery`.
*   **`report_period_type`:** `day`, `week`, `month`, `year`.

---

## 6. Lógica de Negócio e "Regras de Ouro"

1.  **Imutabilidade de Vendas:** Vendas `completed` não devem ser editadas diretamente para alterar valores. Se necessário, cancelar a venda (status `cancelled`) e criar uma nova para manter o rastro de auditoria.
2.  **Cálculo de Lucro:** Deve sempre considerar o `cost_price` mapeado no momento da venda (via itens de venda) e não o preço de custo atual do produto.
3.  **Timezone:** Todas as operações que salvam ou filtram datas devem usar o helper `convertToSaoPaulo` para UTC-3, evitando divergências em fechamentos de caixa.
4.  **Auditoria:** As triggers `audit_trigger` em `products` e `sales` registram toda alteração. Evite desabilitar triggers em produção.

---
*Análise gerada em 28/12/2025 - Sujeita a atualizações para novas migrações.*
