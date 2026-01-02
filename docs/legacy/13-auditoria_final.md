
# 🚨 Relatório de Auditoria Forense
**Data:** 2025-12-28
**Escopo:** `src/` (Recursivo)
**Status:** 🔴 CRÍTICO

---

## 🔴 Tipagem Comprometida (`as any` / `as unknown` / `@ts-ignore`)

### 1. Hooks Genéricos & Utilitários
Estas instâncias sugerem que a arquitetura genérica de hooks não está conseguindo inferir tipos corretamente, forçando o cast.

| Arquivo | Linha | Trecho | Motivo Provável |
| :--- | :--- | :--- | :--- |
| `src/shared/hooks/common/use-entity-advanced.ts` | 312 | `.insert(input as any)` | Hook genérico com tipo de input complexo |
| `src/shared/hooks/common/use-entity-advanced.ts` | 412 | `.insert(input as any)` | Hook genérico com tipo de input complexo |
| `src/shared/hooks/common/use-entity-advanced.ts` | 428 | `.update({ ...input, ... } as any)` | Hook genérico com tipo de input complexo |
| `src/shared/hooks/ui/useGlassmorphismEffect.tsx` | 79 | `... as unknown as EventListener` | Manipulação de eventos DOM |
| `src/shared/hooks/ui/useGlassmorphismEffect.tsx` | 85 | `... as unknown as EventListener` | Manipulação de eventos DOM |
| `src/shared/hooks/common/useConfirmation.ts` | 55, 56, 62, 63, 89, 90, 95, 107, 108 | `(window as any).__confirmation...` | Extensão global de `window` sem type definition |
| `src/shared/hooks/useNetworkStatusSimple.ts` | 25, 71, 91 | `// @ts-expect-error` | API `navigator.connection` não padrão |

### 2. Componentes UI & Layout
Casts usados para contornar tipos de props ou eventos.

| Arquivo | Linha | Trecho | Motivo Provável |
| :--- | :--- | :--- | :--- |
| `src/shared/ui/layout/sidebar.tsx` | 79 | `...props as any` | Props spreading inseguro |
| `src/shared/ui/layout/sidebar.tsx` | 207 | `e as unknown as React.MouseEvent` | Evento DOM genérico vs React |
| `src/shared/ui/layout/sidebar.tsx` | 235, 238 | `(link.icon as ...).props as any` | Acesso inseguro a props de ícones dinâmicos |
| `src/app/layout/Sidebar.tsx` | 165 | `link.icon as any` | Clonagem de elemento React dinâmico |
| `src/pages/DesignSystemPage.tsx` | 666 | `item.variant as any` | Variante de componente dinâmica |

### 3. Lógica de Negócio (Providers & Hooks)
Locais críticos onde a lógica de negócio está "cega" para os tipos.

| Arquivo | Linha | Trecho | Motivo Provável |
| :--- | :--- | :--- | :--- |
| `src/app/providers/AuthContext.tsx` | 188 | `.select(...) as any` | Retorno complexo do Supabase |
| `src/app/providers/AuthContext.tsx` | 200 | `profilePromiseWithTimeout as any` | Tratamento de Promise customizada |
| `src/app/providers/AuthContext.tsx` | 229 | `.select('role') as any` | Retorno complexo do Supabase |
| `src/app/providers/AuthContext.tsx` | 248 | `(userData as any)?.role` | Acesso inseguro a dados de usuário |
| `src/shared/components/ActivityLogsPage.tsx` | 140, 141 | `.eq(..., ... as any)` | Filtro dinâmico do Supabase (Enum vs String) |
| `src/shared/hooks/products/useProductsGridLogic.ts` | 69 | `(product as any).deleted_at` | Propriedade talvez não existente no tipo base |
| `src/shared/hooks/products/useProductsGridLogic.ts` | 247 | `{ ... } as any` | Adaptação de objeto para função de variante |

### 4. Testes (`src/__tests__`)
Uso extensivo de `as any` para mockar respostas de API. (Menor prioridade, mas listado conforme solicitado).

| Arquivo | Trecho | Observação |
| :--- | :--- | :--- |
| `src/__tests__/integration/inventory-movement.integration.test.tsx` | `await request.json() as any` | Mock de Request/Response |
| `src/__tests__/mocks/server.ts` | `await request.json() as any` | Múltiplas ocorrências (linhas 104, 129, 147, 160) |
| `src/__tests__/integration/rpc-backend.integration.test.ts` | `type as any` | Mocks de parâmetros RPC |
| `src/features/users/hooks/__tests__/useUserManagement.test.ts` | `} as any);` | Mocking de objetos complexos (Muitas ocorrências) |

---

## 💀 Código Morto (Dead Code) / Comentado

| Arquivo | Linha | Conteúdo | Tipo |
| :--- | :--- | :--- | :--- |
| `src/shared/templates/PresentationTemplate.tsx` | 8 | `// import { YourSubComponent }...` | Import Exemplo/Template não removido |
| `src/shared/templates/PresentationTemplate.tsx` | 51, 52 | `// const isEmpty...`, `// const hasErrors...` | Lógica comentada |
| `src/shared/templates/ContainerTemplate.tsx` | 7, 8 | `// import ...` | Imports de Template |
| `src/shared/templates/ContainerTemplate.tsx` | 21 | `// const {` | Lógica de Template |
| `src/shared/ui/composite/index.ts` | 47 | `// export { PageTitle ...` | Export comentado |
| `src/shared/components/ActivityLogsPage.tsx` | 4 | `// import { Table ...` | Import comentado (possível refatoração incompleta) |
| `src/pages/DesignSystemPage.tsx` | 99, 100 | `// import { SparklesText ...` | Componentes não disponíveis comentados |
| `src/core/api/supabase/client.ts` | 136 | `// import { supabase } ...` | Import circular comentado? |
| `src/features/customers/components/CustomerPurchaseHistoryTab.tsx` | 159 | `// const handleSearchChange ...` | Handler não usado comentado |
| `src/app/router/index.ts` | 3, 4 | `// export * from ...` | Exports de módulo comentados |

---

## 🔍 Conclusão da Análise
O projeto apresenta "bolsões" de tipagem fraca, especificamente em:
1.  **Hooks Genéricos:** Onde o TypeScript tem dificuldade de inferência (`use-entity-advanced`).
2.  **AuthContext:** Onde tipos do Supabase parecen não estar alinhados com o uso prático.
3.  **Extensões Globais:** Uso de `window` para flags de confirmação sem interface estendida.
4.  **UI Dinâmica:** Clonagem de elementos e manipulação de eventos genéricos no Sidebar.

A quantidade de código morto é baixa, concentrada principalmente em arquivos de "Template" ou resquícios de refatorações recentes.
