# 🔄 Refatoração DRY - Eliminação de Código Duplicado

## 📋 Visão Geral
Identificação e refatoração de padrões duplicados no projeto Adega Manager para seguir o princípio DRY (Don't Repeat Yourself).

---

## 🎯 **TAREFA 1: Componentes de Loading Padronizados**

### ❌ **Problema Identificado**
Loading states duplicados em múltiplos componentes:
- `src/pages/Auth.tsx` (linha 26-34)
- `src/pages/Index.tsx` (linha 31-37)

### ✅ **Solução Proposta**
Criar componente reutilizável de loading.

### 📝 **Subtarefas**

#### 1.1 - Criar componente base de Loading
- **Arquivo**: `src/components/ui/loading-spinner.tsx`
- **Funcionalidade**: Componente reutilizável para estados de loading
- **Variantes**: `page` (tela cheia), `inline` (inline), `overlay` (sobre conteúdo)

#### 1.2 - Refatorar componentes existentes
- **Arquivos para atualizar**:
  - `src/pages/Auth.tsx`
  - `src/pages/Index.tsx`
  - `src/components/UserManagement.tsx`
- **Ação**: Substituir loading states duplicados pelo componente reutilizável

---

## 🎯 **TAREFA 2: Sistema de Roles e Permissões Centralizado**

### ❌ **Problema Identificado**
Lógica de mapeamento de roles duplicada:
- `src/components/UserManagement.tsx` (getRoleDisplay - linha 244, getRoleColor - linha 253)
- `src/components/Sidebar.tsx` (getRoleDisplay - linha 112)

### ✅ **Solução Proposta**
Centralizar lógica de roles em um utilitário compartilhado.

### 📝 **Subtarefas**

#### 2.1 - Criar utilitário de roles
- **Arquivo**: `src/lib/role-utils.ts`
- **Funcionalidades**:
  - `getRoleDisplay(role: UserRole): string`
  - `getRoleColor(role: UserRole): string`
  - `getRoleIcon(role: UserRole): LucideIcon`
  - `getRoleHierarchy(): Record<UserRole, number>`

#### 2.2 - Refatorar componentes
- **Arquivos para atualizar**:
  - `src/components/UserManagement.tsx`
  - `src/components/Sidebar.tsx`
  - `src/contexts/AuthContext.tsx`
- **Ação**: Importar e usar utilitário centralizado

---

## 🎯 **TAREFA 3: Componente de Acesso Negado Padronizado**

### ❌ **Problema Identificado**
Mensagens de "Acesso negado" duplicadas:
- `src/pages/Index.tsx` (múltiplas ocorrências - linhas 52, 59, 61, 63, 65, 67, 69, 71, 73, 75)

### ✅ **Solução Proposta**
Criar componente reutilizável para acesso negado.

### 📝 **Subtarefas**

#### 3.1 - Criar componente AccessDenied
- **Arquivo**: `src/components/ui/access-denied.tsx`
- **Funcionalidade**: Componente padronizado para acesso negado
- **Props**: `message?`, `variant?`, `showIcon?`

#### 3.2 - Refatorar Index.tsx
- **Arquivo**: `src/pages/Index.tsx`
- **Ação**: Substituir todas as div's de acesso negado pelo componente

---

## 🎯 **TAREFA 4: Componente de Branding Reutilizável**

### ❌ **Problema Identificado**
Branding da aplicação duplicado:
- `src/components/Sidebar.tsx` (linhas 126-132)
- `src/pages/Auth.tsx` (linhas 61-69)

### ✅ **Solução Proposta**
Criar componente de branding reutilizável.

### 📝 **Subtarefas**

#### 4.1 - Criar componente AppBranding
- **Arquivo**: `src/components/ui/app-branding.tsx`
- **Funcionalidade**: Logo + título + subtítulo reutilizável
- **Variantes**: `sidebar`, `auth`, `minimal`

#### 4.2 - Refatorar componentes
- **Arquivos para atualizar**:
  - `src/components/Sidebar.tsx`
  - `src/pages/Auth.tsx`
- **Ação**: Substituir branding duplicado

---

## 🎯 **TAREFA 5: Hook de Toast Personalizado**

### ❌ **Problema Identificado**
Padrões de toast duplicados com estruturas similares:
- `src/contexts/AuthContext.tsx` (múltiplas ocorrências)
- `src/components/UserManagement.tsx` (múltiplas ocorrências)

### ✅ **Solução Proposta**
Criar hook personalizado para toast patterns comuns.

### 📝 **Subtarefas**

#### 5.1 - Criar hook useAppToast
- **Arquivo**: `src/hooks/use-app-toast.ts`
- **Funcionalidades**:
  - `success(title, description?)`
  - `error(title, description?)`
  - `warning(title, description?)`
  - `info(title, description?)`
  - `authSuccess()`
  - `authError(error)`
  - `createSuccess(entityName)`
  - `deleteSuccess(entityName)`

#### 5.2 - Refatorar componentes
- **Arquivos para atualizar**:
  - `src/contexts/AuthContext.tsx`
  - `src/components/UserManagement.tsx`
  - `src/hooks/use-sales.ts`
- **Ação**: Substituir toast patterns pelo hook

---

## 🎯 **TAREFA 6: Componente de Formulário Padronizado**

### ❌ **Problema Identificado**
Estruturas de formulário duplicadas:
- `src/pages/Auth.tsx` (form de login)
- `src/components/UserManagement.tsx` (form de criação de usuário)

### ✅ **Solução Proposta**
Criar componentes base para formulários.

### 📝 **Subtarefas**

#### 6.1 - Criar componentes base de formulário
- **Arquivo**: `src/components/ui/form-field.tsx`
- **Componentes**:
  - `FormField` (Label + Input + Error)
  - `FormSelect` (Label + Select + Error)
  - `FormTextarea` (Label + Textarea + Error)

#### 6.2 - Refatorar formulários
- **Arquivos para atualizar**:
  - `src/pages/Auth.tsx`
  - `src/components/UserManagement.tsx`
- **Ação**: Usar componentes base

---

## 🎯 **TAREFA 7: Componente de Card com Header Padronizado**

### ❌ **Problema Identificado**
Estrutura Card + CardHeader + CardTitle + Botão duplicada:
- `src/components/UserManagement.tsx` (linhas 298-306)
- Padrão similar em outros componentes

### ✅ **Solução Proposta**
Criar componente CardWithHeader reutilizável.

### 📝 **Subtarefas**

#### 7.1 - Criar componente CardWithHeader
- **Arquivo**: `src/components/ui/card-with-header.tsx`
- **Props**: `title`, `children`, `headerAction?`, `description?`

#### 7.2 - Refatorar componentes
- **Arquivos para atualizar**:
  - `src/components/UserManagement.tsx`
  - Outros componentes com padrão similar
- **Ação**: Substituir estrutura duplicada

---

## 🎯 **TAREFA 8: Utilitário de Formatação de Datas**

### ❌ **Problema Identificado**
Formatação de datas duplicada:
- `src/components/UserManagement.tsx` (linha 399)
- Padrão similar em outros componentes

### ✅ **Solução Proposta**
Criar utilitário de formatação.

### 📝 **Subtarefas**

#### 8.1 - Criar utilitário de datas
- **Arquivo**: `src/lib/date-utils.ts`
- **Funcionalidades**:
  - `formatDate(date: string | Date, format?: string): string`
  - `formatDateTime(date: string | Date): string`
  - `formatRelativeTime(date: string | Date): string`

#### 8.2 - Refatorar componentes
- **Arquivos para atualizar**:
  - `src/components/UserManagement.tsx`
  - Outros componentes com formatação de data
- **Ação**: Usar utilitário centralizado

---

## 🎯 **TAREFA 9: Componente de Tabela Padronizada**

### ❌ **Problema Identificado**
Estruturas de tabela similares:
- `src/components/UserManagement.tsx` (linhas 374-404)
- Padrão similar em outros componentes

### ✅ **Solução Proposta**
Criar componente de tabela reutilizável.

### 📝 **Subtarefas**

#### 9.1 - Criar componente DataTable
- **Arquivo**: `src/components/ui/data-table.tsx`
- **Funcionalidades**:
  - Tabela com headers configuráveis
  - Sorting, filtering, pagination
  - Actions por linha
  - Loading states

#### 9.2 - Refatorar componentes
- **Arquivos para atualizar**:
  - `src/components/UserManagement.tsx`
  - Outros componentes com tabelas
- **Ação**: Substituir tabelas customizadas

---

## 🎯 **TAREFA 10: Hook de Validação de Formulários**

### ❌ **Problema Identificado**
Lógica de validação duplicada:
- `src/components/UserManagement.tsx` (linha 145)
- Padrão similar em outros formulários

### ✅ **Solução Proposta**
Criar hook de validação reutilizável.

### 📝 **Subtarefas**

#### 10.1 - Criar hook useFormValidation
- **Arquivo**: `src/hooks/use-form-validation.ts`
- **Funcionalidades**:
  - Validação de campos obrigatórios
  - Validação de email
  - Validação de senha
  - Validação customizada

#### 10.2 - Refatorar formulários
- **Arquivos para atualizar**:
  - `src/components/UserManagement.tsx`
  - `src/pages/Auth.tsx`
  - Outros formulários
- **Ação**: Usar hook de validação

---

## 📊 **Resumo de Impacto**

### **Antes da Refatoração**
- ❌ **15+ padrões duplicados** identificados
- ❌ **Código espalhado** em múltiplos componentes
- ❌ **Manutenção complexa** para mudanças globais
- ❌ **Inconsistências** de UI/UX

### **Após a Refatoração**
- ✅ **Componentes reutilizáveis** centralizados
- ✅ **Código DRY** seguindo boas práticas
- ✅ **Manutenção simplificada** com mudanças centralizadas
- ✅ **Consistência** de UI/UX garantida
- ✅ **Performance melhorada** com menos código duplicado

---

## 🔧 **Ordem de Execução Recomendada**

1. **TAREFA 1** - Loading Spinner (base para outras)
2. **TAREFA 2** - Sistema de Roles (fundamental)
3. **TAREFA 5** - Hook de Toast (usado em várias tarefas)
4. **TAREFA 8** - Utilitário de Datas (simples e útil)
5. **TAREFA 4** - Componente de Branding (visual)
6. **TAREFA 3** - Componente AccessDenied (específico)
7. **TAREFA 6** - Componentes de Formulário (base)
8. **TAREFA 10** - Hook de Validação (complementa formulários)
9. **TAREFA 7** - Card com Header (estrutural)
10. **TAREFA 9** - DataTable (mais complexa)

---

## 📁 **Estrutura Final Esperada**

```
src/
├── components/
│   └── ui/
│       ├── loading-spinner.tsx       # TAREFA 1
│       ├── access-denied.tsx         # TAREFA 3
│       ├── app-branding.tsx          # TAREFA 4
│       ├── form-field.tsx            # TAREFA 6
│       ├── card-with-header.tsx      # TAREFA 7
│       └── data-table.tsx            # TAREFA 9
├── hooks/
│   ├── use-app-toast.ts              # TAREFA 5
│   └── use-form-validation.ts        # TAREFA 10
└── lib/
    ├── role-utils.ts                 # TAREFA 2
    └── date-utils.ts                 # TAREFA 8
```

---

## 🎯 **Métricas de Sucesso**

- **Redução de ~40% no código duplicado**
- **Melhoria na consistência visual**
- **Facilidade de manutenção aumentada**
- **Tempo de desenvolvimento reduzido para novas features**
- **Padronização completa da aplicação**