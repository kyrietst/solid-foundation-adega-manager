# Sistema de Exclusão de Vendas - Guia Completo

**Módulo**: Sales
**Versão**: v3.2.2
**Data**: 18/10/2025
**Autor**: Claude Code + Luccas

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Fluxo de Dados](#fluxo-de-dados)
5. [Segurança e Permissões](#segurança-e-permissões)
6. [Integração com Cliente](#integração-com-cliente)
7. [Casos de Uso](#casos-de-uso)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O Sistema de Exclusão de Vendas permite que administradores e funcionários excluam vendas do sistema através de dois pontos de acesso:

1. **Aba "Vendas Recentes"** (`/sales`) - Exclusão direta na página de vendas
2. **Perfil do Cliente** (`/customer/:id`) - Exclusão através do histórico de compras

### Características Principais

- ✅ **Confirmação de Segurança** - Usuário deve digitar o número da venda
- ✅ **Restauração de Estoque** - Produtos voltam ao inventário automaticamente
- ✅ **Atualização System-Wide** - Reflexo em todas as views via React Query
- ✅ **Auditoria Completa** - Logs automáticos de todas as exclusões
- ✅ **Single Source of Truth** - Reutilização de hook e RPC existentes

---

## Arquitetura

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    PONTOS DE ACESSO                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │  RecentSales     │         │ CustomerPurchaseHistory │  │
│  │  (/sales)        │         │ (/customer/:id)         │  │
│  └────────┬─────────┘         └───────────┬─────────────┘  │
│           │                               │                │
│           └───────────┬───────────────────┘                │
│                       │                                    │
└───────────────────────┼────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │    DeleteSaleModal            │
        │    (Confirmação + Validação)  │
        └───────────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │    useDeleteSale Hook         │
        │    (SSoT Business Logic)      │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌───────────────┐              ┌──────────────────┐
│  Auth Check   │              │  Permission Check│
│  (Supabase)   │              │  (admin/employee)│
└───────┬───────┘              └────────┬─────────┘
        │                               │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  delete_sale_with_items RPC   │
        │  (PostgreSQL Transaction)     │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┴────────────────┐
        │                                │
        ▼                                ▼
┌───────────────┐              ┌──────────────────┐
│  Delete Items │              │  Restore Stock   │
│  (sale_items) │              │  (products)      │
└───────┬───────┘              └────────┬─────────┘
        │                               │
        └───────────┬───────────────────┘
                    │
                    ▼
        ┌───────────────────────────────┐
        │  React Query Invalidation     │
        │  (System-Wide Update)         │
        └───────────────────────────────┘
```

---

## Componentes

### 1. DeleteSaleModal

**Arquivo**: `src/features/sales/components/DeleteSaleModal.tsx`

**Responsabilidades:**
- Exibir modal de confirmação
- Validar input do número da venda
- Controlar estados de loading
- Feedback visual de erros

**Props:**
```typescript
interface DeleteSaleModalProps {
  isOpen: boolean;           // Controle de visibilidade
  onClose: () => void;       // Callback de fechamento
  onConfirm: () => void;     // Callback de confirmação
  saleOrderNumber: number;   // Número da venda para validação
  isDeleting: boolean;       // Estado de loading
}
```

**Exemplo de Uso:**
```tsx
const [saleToDelete, setSaleToDelete] = useState<{ id: string; orderNumber: number } | null>(null);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();

const handleConfirmDelete = () => {
  if (!saleToDelete) return;

  deleteSale(saleToDelete.id, {
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSaleToDelete(null);
    }
  });
};

return (
  <DeleteSaleModal
    isOpen={isDeleteDialogOpen}
    onClose={() => setIsDeleteDialogOpen(false)}
    onConfirm={handleConfirmDelete}
    saleOrderNumber={saleToDelete?.orderNumber || 0}
    isDeleting={isDeleting}
  />
);
```

---

### 2. useDeleteSale Hook

**Arquivo**: `src/features/sales/hooks/use-sales.ts`

**Tipo**: React Query Mutation Hook

**Responsabilidades:**
1. Autenticar usuário via Supabase Auth
2. Verificar permissões (admin ou employee)
3. Executar RPC `delete_sale_with_items`
4. Invalidar caches do React Query
5. Exibir toast de sucesso/erro

**Assinatura:**
```typescript
export const useDeleteSale = () => {
  return useMutation<DeleteSaleResult, Error, string>({
    mutationFn: async (saleId: string) => {
      // 1. Autenticação
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      // 2. Verificação de permissões
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const allowedRoles: AllowedRole[] = ['admin', 'employee'];
      if (!allowedRoles.includes(profile.role as AllowedRole)) {
        throw new Error("Apenas administradores e funcionários podem excluir vendas");
      }

      // 3. Execução do RPC
      const { data: result, error: deleteError } = await supabase.rpc('delete_sale_with_items', {
        p_sale_id: saleId
      });

      return result || { success: true };
    },
    onSuccess: (data) => {
      // 4. Invalidação de caches
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["customer-table-data"] });
      queryClient.invalidateQueries({ queryKey: ["customer-purchase-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // 5. Toast de sucesso
      toast({
        title: "Venda excluída com sucesso!",
        description: data.message
      });
    }
  });
};
```

**Query Invalidation Map:**

| Query Key | Efeito | Componentes Afetados |
|-----------|--------|---------------------|
| `sales` | Lista de vendas atualizada | RecentSales, SalesTableUnified |
| `products` | Estoque restaurado | InventoryManagement, ProductsGrid |
| `customer-table-data` | Total de compras recalculado | CustomersTable |
| `customer-purchase-history` | Histórico atualizado | CustomerPurchaseHistoryTab |
| `dashboard` | KPIs recalculados | Dashboard |

---

### 3. delete_sale_with_items RPC

**Arquivo**: Stored Procedure PostgreSQL

**Assinatura:**
```sql
CREATE OR REPLACE FUNCTION public.delete_sale_with_items(p_sale_id uuid)
RETURNS jsonb
```

**Lógica:**
```sql
BEGIN
  -- 1. Buscar itens da venda para restaurar estoque
  FOR item IN
    SELECT product_id, quantity, variant_type
    FROM sale_items
    WHERE sale_id = p_sale_id
  LOOP
    -- 2. Restaurar estoque
    IF item.variant_type = 'package' THEN
      UPDATE products SET package_stock = package_stock + item.quantity
      WHERE id = item.product_id;
    ELSE
      UPDATE products SET stock_quantity = stock_quantity + item.quantity
      WHERE id = item.product_id;
    END IF;

    -- 3. Criar movimento de inventário
    INSERT INTO inventory_movements (product_id, quantity, movement_type, reason)
    VALUES (item.product_id, item.quantity, 'in', 'Devolução por exclusão de venda');
  END LOOP;

  -- 4. Deletar itens
  DELETE FROM sale_items WHERE sale_id = p_sale_id;

  -- 5. Deletar venda
  DELETE FROM sales WHERE id = p_sale_id;

  -- 6. Retornar resultado
  RETURN jsonb_build_object(
    'success', true,
    'sale_id', p_sale_id,
    'items_deleted', v_items_count,
    'products_restored', v_items_count,
    'message', 'Venda excluída com sucesso. ' || v_items_count || ' itens removidos, ' || v_items_count || ' produtos restaurados.'
  );
END;
```

**Garantias:**
- ✅ **Transação atômica** - Rollback automático em caso de erro
- ✅ **Integridade referencial** - Respeita constraints do banco
- ✅ **Auditoria** - Movimentos de inventário registrados
- ✅ **Performance** - Operação em lote otimizada

---

## Fluxo de Dados

### 1. Inicialização

```typescript
// Usuário clica no botão de lixeira
<Button onClick={() => handleDeleteClick(purchase.id, purchase.order_number)}>
  <Trash2 />
</Button>

// Handler armazena dados e abre modal
const handleDeleteClick = (saleId: string, orderNumber: number) => {
  setSaleToDelete({ id: saleId, orderNumber });
  setIsDeleteDialogOpen(true);
};
```

### 2. Validação no Modal

```typescript
// Input controlado
<Input
  value={confirmationInput}
  onChange={(e) => setConfirmationInput(e.target.value)}
  placeholder={`Digite ${saleOrderNumber} para confirmar`}
/>

// Validação em tempo real
const isConfirmDisabled =
  confirmationInput !== saleOrderNumber.toString() ||
  isDeleting;

// Feedback visual
{confirmationInput && confirmationInput !== saleOrderNumber.toString() && (
  <p className="text-xs text-red-400">
    O número digitado não corresponde ao número da venda
  </p>
)}
```

### 3. Execução

```typescript
// Usuário confirma
const handleConfirmDelete = () => {
  deleteSale(saleToDelete.id, {
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSaleToDelete(null);
      refetch(); // Opcional: refetch explícito
    }
  });
};
```

### 4. Backend (RPC)

```
1. Autenticação (Supabase Auth)
2. Verificação de permissões (admin/employee)
3. Início da transação PostgreSQL
4. Loop pelos itens da venda:
   - Restaurar estoque (package_stock ou stock_quantity)
   - Criar movimento de inventário
5. Deletar sale_items
6. Deletar sales
7. Commit da transação
8. Retornar resultado JSON
```

### 5. Atualização UI

```typescript
// React Query invalida caches
queryClient.invalidateQueries({ queryKey: ["sales"] });
// ... outras invalidações

// Componentes refetcham automaticamente
useCustomerPurchaseHistory() // Refetch no perfil
useSales() // Refetch em vendas recentes
useDashboardData() // Refetch no dashboard
```

---

## Segurança e Permissões

### Níveis de Segurança

#### 1. Frontend - Controle de Visibilidade

```typescript
// Botão só aparece para admin/employee
{hasPermission(['admin', 'employee']) && (
  <Button onClick={handleDeleteClick}>
    <Trash2 />
  </Button>
)}
```

#### 2. Hook - Verificação de Permissões

```typescript
// useDeleteSale verifica role antes de executar
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

const allowedRoles: AllowedRole[] = ['admin', 'employee'];
if (!allowedRoles.includes(profile.role as AllowedRole)) {
  throw new Error("Apenas administradores e funcionários podem excluir vendas");
}
```

#### 3. Backend - RLS Policies

```sql
-- Policy em sales table
CREATE POLICY sales_delete_admin_employee ON sales FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'employee')
  )
);
```

#### 4. Auditoria - Logs Automáticos

```sql
-- Trigger automático em sales
CREATE TRIGGER audit_sale_deletion
AFTER DELETE ON sales
FOR EACH ROW
EXECUTE FUNCTION log_sale_deletion();
```

### Roles e Permissões

| Role | Pode Excluir? | Via Perfil Cliente? | Via Vendas Recentes? |
|------|---------------|---------------------|---------------------|
| **admin** | ✅ Sim | ✅ Sim | ✅ Sim |
| **employee** | ✅ Sim | ✅ Sim | ✅ Sim |
| **delivery** | ❌ Não | ❌ Não tem acesso | ❌ Não tem acesso |

---

## Integração com Cliente

### CustomerPurchaseHistoryTab

**Arquivo**: `src/features/customers/components/CustomerPurchaseHistoryTab.tsx`

**Integração:**

1. **Importações**:
```typescript
import { useDeleteSale } from '@/features/sales/hooks/use-sales';
import { DeleteSaleModal } from '@/features/sales/components/DeleteSaleModal';
import { Trash2 } from 'lucide-react';
```

2. **Estado Local**:
```typescript
const [saleToDelete, setSaleToDelete] = useState<{ id: string; orderNumber: number } | null>(null);
const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
const { mutate: deleteSale, isPending: isDeleting } = useDeleteSale();
```

3. **Handlers**:
```typescript
const handleDeleteClick = useCallback((saleId: string, orderNumber: number) => {
  setSaleToDelete({ id: saleId, orderNumber });
  setIsDeleteDialogOpen(true);
}, []);

const handleConfirmDelete = useCallback(() => {
  if (!saleToDelete) return;

  deleteSale(saleToDelete.id, {
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSaleToDelete(null);
      refetch(); // Atualiza lista
    }
  });
}, [saleToDelete, deleteSale, refetch]);

const handleCloseDeleteDialog = useCallback(() => {
  setIsDeleteDialogOpen(false);
  setSaleToDelete(null);
}, []);
```

4. **UI Modificada**:
```tsx
<Card>
  <CardContent>
    <div className="flex items-start gap-3">
      <div className="flex-1">
        <div className="text-white font-semibold">
          Compra #{purchase.order_number}
        </div>
      </div>
      <div className="text-right">
        {formatCurrency(purchase.total)}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDeleteClick(purchase.id, purchase.order_number)}
        className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-900/20"
        title="Excluir venda"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  </CardContent>
</Card>
```

5. **Modal Renderizado**:
```tsx
<DeleteSaleModal
  isOpen={isDeleteDialogOpen}
  onClose={handleCloseDeleteDialog}
  onConfirm={handleConfirmDelete}
  saleOrderNumber={saleToDelete?.orderNumber || 0}
  isDeleting={isDeleting}
/>
```

---

## Casos de Uso

### Caso 1: Venda Registrada Incorretamente

**Situação**: Cliente comprou 5 itens mas foram registrados 15 por erro.

**Solução**:
1. Acesse perfil do cliente
2. Localize a venda incorreta no histórico
3. Clique no botão de lixeira
4. Digite o número da venda
5. Confirme exclusão
6. Registre nova venda correta

**Resultado**:
- ✅ Venda incorreta removida
- ✅ Estoque de 15 itens restaurado
- ✅ Nova venda pode ser criada com quantidade correta

---

### Caso 2: Cliente Solicitou Cancelamento

**Situação**: Cliente comprou produto mas desistiu da compra.

**Solução**:
1. Acesse aba "Vendas Recentes" ou perfil do cliente
2. Localize a venda
3. Exclua através do botão de lixeira
4. Estoque restaurado automaticamente

**Resultado**:
- ✅ Venda cancelada
- ✅ Produtos voltam para venda
- ✅ Histórico do cliente atualizado

---

### Caso 3: Venda de Teste

**Situação**: Vendas de teste criadas durante treinamento.

**Solução**:
1. Identifique vendas de teste (geralmente por cliente ou data)
2. Exclua uma por uma através do perfil do cliente
3. Sistema restaura estoque automaticamente

**Resultado**:
- ✅ Dados de teste removidos
- ✅ Sistema limpo para operação real

---

## Troubleshooting

### Problema 1: Botão de Exclusão Não Aparece

**Sintomas**:
- Botão de lixeira não visível no histórico

**Causas Possíveis**:
1. **Usuário sem permissão** - Role delivery não tem acesso
2. **Hook de permissões não carregado** - AuthContext ainda inicializando

**Soluções**:
```typescript
// Verificar permissões no console
console.log('User role:', userRole);
console.log('Has permission:', hasPermission(['admin', 'employee']));

// Garantir que botão só renderiza após loading
{!loading && hasPermission(['admin', 'employee']) && (
  <Button onClick={handleDeleteClick}>
    <Trash2 />
  </Button>
)}
```

---

### Problema 2: Modal Não Abre

**Sintomas**:
- Clicar no botão não abre o modal

**Causas Possíveis**:
1. **Estado não atualizado** - setSaleToDelete ou setIsDeleteDialogOpen falhando
2. **Modal não renderizado** - Componente DeleteSaleModal não incluído no JSX

**Soluções**:
```typescript
// Adicionar logs
const handleDeleteClick = (saleId: string, orderNumber: number) => {
  console.log('Delete clicked:', { saleId, orderNumber });
  setSaleToDelete({ id: saleId, orderNumber });
  setIsDeleteDialogOpen(true);
  console.log('State updated');
};

// Verificar renderização do modal
return (
  <>
    {/* Seu conteúdo */}

    {/* Modal DEVE estar aqui */}
    <DeleteSaleModal
      isOpen={isDeleteDialogOpen}
      onClose={handleCloseDeleteDialog}
      onConfirm={handleConfirmDelete}
      saleOrderNumber={saleToDelete?.orderNumber || 0}
      isDeleting={isDeleting}
    />
  </>
);
```

---

### Problema 3: Validação Não Funciona

**Sintomas**:
- Botão "Confirmar Exclusão" não habilita mesmo digitando número correto

**Causas Possíveis**:
1. **Tipo incompatível** - String vs Number
2. **Espaços extras** - Input com whitespace

**Soluções**:
```typescript
// Verificar comparação
console.log('Input:', confirmationInput);
console.log('Expected:', saleOrderNumber);
console.log('Match:', confirmationInput === saleOrderNumber.toString());

// Garantir conversão correta
const isConfirmDisabled =
  confirmationInput.trim() !== saleOrderNumber.toString() ||
  isDeleting;
```

---

### Problema 4: Exclusão Não Atualiza UI

**Sintomas**:
- Venda excluída mas ainda aparece na lista

**Causas Possíveis**:
1. **Query invalidation não funcionando** - queryClient não configurado
2. **Refetch não acionado** - useCustomerPurchaseHistory não refetchando

**Soluções**:
```typescript
// Garantir invalidação
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["customer-purchase-history"] });
  queryClient.invalidateQueries({ queryKey: ["sales"] });

  // Refetch explícito se necessário
  refetch();

  // Fechar modal
  setIsDeleteDialogOpen(false);
}
```

---

### Problema 5: Erro "Auth session missing"

**Sintomas**:
- Erro ao tentar excluir: "Auth session missing!"

**Causas Possíveis**:
1. **Sessão expirada** - JWT token expirado
2. **Logout não detectado** - AuthContext desatualizado

**Soluções**:
```typescript
// Verificar sessão antes de deletar
const handleConfirmDelete = async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    toast({
      title: "Sessão expirada",
      description: "Por favor, faça login novamente",
      variant: "destructive"
    });
    return;
  }

  deleteSale(saleToDelete.id, { onSuccess: ... });
};
```

---

## 📚 Referências

- [Changelog v3.2.2](../../07-changelog/SALE_DELETE_FEATURE_v3.2.2.md)
- [Customer Purchase History](../customers/CUSTOMER_PURCHASE_HISTORY_TAB.md)
- [SSoT System Architecture](../../02-architecture/SSOT_SYSTEM_ARCHITECTURE.md)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)

---

**Última Atualização**: 18/10/2025
**Versão**: v3.2.2
**Status**: ✅ Em Produção
