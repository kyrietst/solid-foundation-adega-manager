# 00. Padrões de Desenvolvimento (Development Standards)

> [!IMPORTANT]
> Este documento define as **Regras de Engajamento** para desenvolvimento no
> **AdegaManager ERP v2.0**. A violação destas regras resultará em dívida
> técnica crítica. Siga-as rigorosamente para manter a estabilidade de um ERP de
> nível Enterprise.

## 1. Integridade & Banco de Dados (Database Integrity)

### A. Paridade Dev/Prod (Strict Parity)

- **Regra:** Os ambientes `adega-dev` e `adega` (Prod) devem ter schemas
  **IDÊNTICOS**.
- **Ferramenta:** Use `mcp_supabase-**_execute_sql` para auditar
  `information_schema` antes de validar qualquer PR.
- **Workflow:** Deploys de banco exigem migrações SQL versionadas
  (`supabase/migrations/`). Edições manuais no Dashboard são proibidas.

### B. Single Source of Truth (SSOT)

- **Lógica Crítica:** Cálculos financeiros, movimentação de estoque e criação de
  clientes devem ocorrer via **RPCs (Remote Procedure Calls)**.
- **Frontend Burro:** O cliente React apenas exibe dados e solicita ações. Nunca
  calcule saldo de estoque ou totais de venda complexos no Frontend. Use
  `get_monthly_expenses`, `process_sale`, `create_inventory_movement`.

---

## 2. Type Safety & TypeScript Protocol

### A. The "Deep Instantiation" Fix (Type Isolation)

Devido à complexidade do schema gerado automaticamente pelo Supabase (relações
recursivas profundas), o TypeScript pode falhar com erros de "Excessively deep
instantiation".

**Protocolo de Solução:**

1. **Manual Interfaces:** Para entidades complexas (ex: `Expenses` com
   categorias), **NÃO** dependa puramente de `Database['public']['Tables']`.
   Crie interfaces manuais limpas:
   ```typescript
   interface OperationalExpense {
     id: string;
     amount: number;
     // ... apenas campos necessários
   }
   ```
2. **Client Isolation:** Blindar o cliente Supabase em hooks críticos para
   cortar o ciclo de inferência:
   ```typescript
   const { data } = await (supabase as any) // <- Cast para 'any' isola a inferência
     .from('table')
     .select(...)
     .single()
     .then(res => ({
        data: res.data as unknown as ManualType, // <- Cast seguro no retorno
        error: res.error
     }));
   ```
   _Isso garante que o build passe sem sacrificar a segurança de tipos no
   consumo dos dados._

### B. No "any" in UI

- Componentes UI (`.tsx`) **NUNCA** devem manipular tipos `any`. O dado deve
  chegar blindado e tipado pelos Custom Hooks.

---

## 3. Arquitetura de Módulos (Feature-Based)

### Estrutura Obrigatória

```
src/features/[module_name]/
├── components/         # UI Components (Presentational)
│   ├── [Module]Tab.tsx # Entry Point da Aba
│   └── ...Modals.tsx   # Modais de Ação
├── hooks/              # Business Logic & Data Fetching
│   ├── use[Module].ts  # Queries & Mutations (TanStack Query)
│   └── use[Action].ts  # Lógica específica
├── types/              # (Opcional) Tipos locais se não houver globais
└── index.ts            # Public API do módulo
```

### Regras de Ouro

1. **Zero Supabase in Components:** Componentes nunca importam `supabase`. Eles
   usam Hooks.
2. **Zero Logic in JSX:** Cálculos (ex: soma de totais) devem ser feitos em
   Hooks ou Utils, nunca inline no JSX.
3. **Dead Code Zero Tolerance:** Se uma funcionalidade foi removida (ex: coluna
   "Payment Method" em Expense Table), todo o código associado (funções helpers,
   imports, interfaces) deve ser removido.

---

## 4. UI/UX Premium Standards

### A. Terminologia Enterprise

- **Evite:** "Lucro", "Motoqueiro", "Criar Conta".
- **Use:** "Margem de Contribuição", "Logística/Expedição", "Cadastrar
  Colaborador".
- Consulte `FULL_UI_CONSISTENCY_MATRIX.md` para o vocabulário oficial.

### B. Feedback Loop

- **Ações:** Toda mutação (Create/Update/Delete) deve ter feedback visual
  imediato via `sonner` (`toast.success` ou `toast.error`).
- **Loading:** Use `Skeleton` para carregamento inicial e `Loader2` (spinners)
  para ações de botão.
- **Empty States:** Nunca deixe uma tabela vazia em branco. Use componentes
  `EmptyState` ilustrativos com CTAs claros.

---

## 5. Fiscal & Compliance

### A. NFe/NFCe First

- O sistema é um emissor fiscal. Todo fluxo de venda deve preparar o payload
  para o `fiscal-handler` (Edge Function).
- **Validação de Endereço:** Use `FiscalAddressForm` para garantir integridade
  de dados de entrega (IBGE/UF).

### B. Regimes Tributários

- O sistema opera dinamicamente entre Sandbox (Homologação) e Produção.
- Respeite as regras de CST/CSOSN baseadas no perfil da empresa (Simples
  Nacional vs Regime Normal).
