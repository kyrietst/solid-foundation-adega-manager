# 🧹 Plano de Refatoração DRY - Adega Manager

> **Objetivo**: Eliminar duplicação de código seguindo o princípio "Don't Repeat Yourself" (DRY) sem quebrar a aplicação.

## 📊 Análise de Duplicações Encontradas

### 🎯 **Resumo Executivo**
- **31+ Modais** com estruturas similares
- **189 ocorrências** de formatCurrency em 46 arquivos
- **115+ padrões** de formulários com react-hook-form + Zod
- **123+ arquivos** com Props interfaces repetitivas

## 🏗️ **FASE 1: COMPONENTES REUTILIZÁVEIS DE ALTO IMPACTO**

### 1.1 Modal Base Component (ALTA PRIORIDADE)

**Problema**: 31+ arquivos com Dialog/DialogContent/DialogHeader repetitivos
**Impacto**: 🔥 Muito Alto - Redução estimada de 500+ linhas

#### ✅ Tarefas:
- [x] **1.1.1** Criar `BaseModal` component em `src/shared/ui/composite/`
- [x] **1.1.2** Incluir props: `title`, `description`, `children`, `isOpen`, `onClose`, `size`, `className`
- [x] **1.1.3** Migrar `NewProductModal` para usar `BaseModal`
- [x] **1.1.4** Migrar `NewCustomerModal` para usar `BaseModal`
- [ ] **1.1.5** Migrar `EditProductModal` para usar `BaseModal`
- [ ] **1.1.6** Migrar `EditCustomerModal` para usar `BaseModal`
- [ ] **1.1.7** Migrar restantes 27 modais (batch de 5 por iteração)

**Arquivos afetados**:
```
src/features/inventory/components/NewProductModal.tsx
src/features/customers/components/NewCustomerModal.tsx
src/features/inventory/components/EditProductModal.tsx
src/features/customers/components/EditCustomerModal.tsx
src/features/sales/components/ProductSelectionModal.tsx
src/features/sales/components/ReceiptModal.tsx
src/features/delivery/components/DeliveryAssignmentModal.tsx
... [+24 modais]
```

---

### 1.2 Form Hook Pattern (ALTA PRIORIDADE)

**Problema**: 115+ ocorrências de useForm + zodResolver + useToast
**Impacto**: 🔥 Muito Alto - Padronização de 43 arquivos

#### ✅ Tarefas:
- [ ] **1.2.1** Criar `useStandardForm` hook em `src/shared/hooks/common/`
- [ ] **1.2.2** Incluir: validação automática, toast de sucesso/erro, loading state
- [ ] **1.2.3** Criar variações: `useModalForm`, `useEntityForm`
- [ ] **1.2.4** Migrar formulários de produtos para novo hook
- [ ] **1.2.5** Migrar formulários de clientes para novo hook
- [ ] **1.2.6** Migrar formulários de fornecedores para novo hook
- [ ] **1.2.7** Migrar formulários de vendas para novo hook

**Exemplo de uso futuro**:
```typescript
const { form, isLoading, handleSubmit } = useStandardForm({
  schema: productSchema,
  onSuccess: 'Produto criado com sucesso!',
  onSubmit: async (data) => await createProduct(data)
});
```

---

### 1.3 Currency Formatter Utilities (MÉDIA PRIORIDADE)

**Problema**: 189 ocorrências de formatCurrency em 46 arquivos
**Impacto**: 🟡 Médio - Consolidação de formatting

#### ✅ Tarefas:
- [ ] **1.3.1** Criar `useFormatting` hook em `src/shared/hooks/common/`
- [ ] **1.3.2** Incluir: formatCurrency, formatDate, formatPhone, formatCPF
- [ ] **1.3.3** Criar `FormatDisplay` component para valores formatados
- [ ] **1.3.4** Migrar components de dashboard para novo sistema
- [ ] **1.3.5** Migrar components de relatórios para novo sistema
- [ ] **1.3.6** Migrar components de produtos para novo sistema

---

## 🏗️ **FASE 2: PADRÕES DE COMPONENTES ESPECÍFICOS**

### 2.1 Data Table Pattern (MÉDIA PRIORIDADE)

**Problema**: Padrões similares em tabelas de dados
**Impacto**: 🟡 Médio - Melhoria de manutenibilidade

#### ✅ Tarefas:
- [ ] **2.1.1** Analisar padrões em CustomerTable, ProductTable, MovementsTable
- [ ] **2.1.2** Criar `useTableData` hook genérico
- [ ] **2.1.3** Criar `TableActions` component reutilizável
- [ ] **2.1.4** Migrar tabela de clientes
- [ ] **2.1.5** Migrar tabela de produtos  
- [ ] **2.1.6** Migrar tabela de movimentações

---

### 2.2 Card Layouts Pattern (MÉDIA PRIORIDADE)

**Problema**: Cards similares para produtos, clientes, fornecedores
**Impacto**: 🟡 Médio - Consistência visual

#### ✅ Tarefas:
- [ ] **2.2.1** Criar `EntityCard` base component
- [ ] **2.2.2** Incluir variações: product, customer, supplier
- [ ] **2.2.3** Migrar ProductCard para EntityCard
- [ ] **2.2.4** Migrar CustomerCard para EntityCard
- [ ] **2.2.5** Migrar SupplierCard para EntityCard

---

### 2.3 Filter Components Pattern (BAIXA PRIORIDADE)

**Problema**: Filtros similares em várias telas
**Impacto**: 🟢 Baixo - Organização de código

#### ✅ Tarefas:
- [ ] **2.3.1** Criar `FilterPanel` base component
- [ ] **2.3.2** Criar `useFilters` hook genérico
- [ ] **2.3.3** Migrar ProductFilters
- [ ] **2.3.4** Migrar CustomerFilters
- [ ] **2.3.5** Migrar SupplierFilters

---

## 🏗️ **FASE 3: HOOKS E UTILITÁRIOS ESPECÍFICOS**

### 3.1 Supabase Query Patterns (MÉDIA PRIORIDADE)

**Problema**: Padrões repetitivos de queries Supabase
**Impacto**: 🟡 Médio - Padronização de API calls

#### ✅ Tarefas:
- [ ] **3.1.1** Criar `useSupabaseQuery` hook base
- [ ] **3.1.2** Criar `useSupabaseMutation` hook base
- [ ] **3.1.3** Incluir: loading, error, cache invalidation automáticos
- [ ] **3.1.4** Migrar hooks de produtos
- [ ] **3.1.5** Migrar hooks de clientes
- [ ] **3.1.6** Migrar hooks de vendas

---

### 3.2 Error Handling Patterns (BAIXA PRIORIDADE)

**Problema**: Tratamento de erros inconsistente
**Impacto**: 🟢 Baixo - Melhoria de UX

#### ✅ Tarefas:
- [ ] **3.2.1** Criar `useErrorHandler` hook
- [ ] **3.2.2** Criar `ErrorBoundary` components específicos
- [ ] **3.2.3** Migrar error handling de formulários
- [ ] **3.2.4** Migrar error handling de API calls

---

## 🏗️ **FASE 4: OTIMIZAÇÕES E LIMPEZA**

### 4.1 Import Cleanup (BAIXA PRIORIDADE)

**Problema**: Imports repetitivos em muitos arquivos
**Impacto**: 🟢 Baixo - Bundle size e organização

#### ✅ Tarefas:
- [ ] **4.1.1** Criar barrel exports em `src/shared/ui/index.ts`
- [ ] **4.1.2** Criar barrel exports em `src/shared/hooks/index.ts`
- [ ] **4.1.3** Refatorar imports para usar barrel exports
- [ ] **4.1.4** Remover imports não utilizados (tree-shaking)

---

### 4.2 Type Definitions Consolidation (BAIXA PRIORIDADE)

**Problema**: Props interfaces similares espalhadas
**Impacto**: 🟢 Baixo - Type safety e reutilização

#### ✅ Tarefas:
- [ ] **4.2.1** Criar `BaseProps` interfaces em `src/shared/types/`
- [ ] **4.2.2** Criar `ModalProps`, `FormProps`, `TableProps` genéricos
- [ ] **4.2.3** Migrar componentes para usar tipos base
- [ ] **4.2.4** Remover interfaces duplicadas

---

## 📈 **MÉTRICAS DE SUCESSO**

### Objetivos Quantitativos:
- [ ] **Redução de 30%** no número total de linhas de código
- [ ] **Eliminação de 70%** da duplicação em modais
- [ ] **Padronização de 90%** dos formulários
- [ ] **Redução de 50%** nos imports repetitivos

### Objetivos Qualitativos:
- [ ] **Manutenibilidade**: Mudanças em um local refletem em todos os usos
- [ ] **Consistência**: UI/UX padronizada em todo o sistema
- [ ] **Performance**: Bundle size otimizado
- [ ] **Developer Experience**: Menos código boilerplate

---

## ⚠️ **PROTOCOLO DE SEGURANÇA**

### Antes de cada refatoração:
1. [x] **Backup**: Commit atual antes de iniciar
2. [x] **Testes**: Executar `npm run dev` e verificar funcionamento
3. [x] **Lint**: Executar `npm run lint` sem warnings

### Durante a refatoração:
1. [ ] **Incremental**: Uma tarefa por vez
2. [ ] **Testes**: Verificar funcionalidade após cada mudança  
3. [ ] **Rollback**: Reverter se algo quebrar

### Após cada fase:
1. [ ] **Commit**: Fazer commit das alterações
2. [ ] **Testing**: Teste manual completo das funcionalidades afetadas
3. [ ] **Documentation**: Atualizar documentação se necessário

---

## 🚀 **ORDEM DE EXECUÇÃO RECOMENDADA**

### Sprint 1 (Alta Prioridade - Semana 1):
1. [ ] BaseModal component (1.1)
2. [ ] useStandardForm hook (1.2)

### Sprint 2 (Média Prioridade - Semana 2):
1. [ ] Currency formatting (1.3)
2. [ ] Data Table patterns (2.1)

### Sprint 3 (Finalização - Semana 3):
1. [ ] Card layouts (2.2)
2. [ ] Supabase patterns (3.1)
3. [ ] Import cleanup (4.1)

---

## 📝 **NOTAS IMPORTANTES**

- **⚡ Performance**: Cada refatoração deve manter ou melhorar a performance
- **🔄 Compatibilidade**: Manter APIs existentes funcionando durante transição
- **📚 Documentação**: Documentar novos patterns para a equipe
- **🧪 Testes**: Criar testes para novos components reutilizáveis

---

**📅 Última atualização**: 2025-01-09  
**👨‍💻 Criado por**: Claude Code Assistant  
**🎯 Status**: EM EXECUÇÃO - FASE 1.1 CONCLUÍDA  
**✅ Progresso**: BaseModal criado, 2 modais migrados (NewProduct, NewCustomer)