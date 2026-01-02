# Guia de Troubleshooting - Adega Manager

> Soluções completas para problemas comuns e erros críticos do sistema

---

## 🚨 **Acesso Rápido por Categoria**

### **🔴 Problemas Críticos (P0 - Bloqueio de Vendas)**
- 🆕 **[Campos Legacy vs Multi-Store](./LEGACY_FIELDS_TROUBLESHOOTING_GUIDE.md)** ← **HOTFIXES NOV/2025**
  - Produto com estoque não adiciona ao carrinho
  - Limitação de quantidade após edição de estoque
  - Modal de seleção não abre
- [Modal não salva/botão salvar não funciona](#modal-não-salvabotão-salvar-não-funciona)
- [Página não carrega/erro de JavaScript](#página-não-carregaerro-de-javascript)
- [Dados não aparecem/cache incorreto](#dados-não-aparecemcache-incorreto)
- [Erro de overflow numérico](#erro-de-overflow-numérico)

### **🟡 Problemas de Interface**
- [Modal fantasma/modais sobrepostos](#modal-fantasmamodais-sobrepostos)
- [Layout quebrado/responsividade](#layout-quebradoresponsividade)
- [Campos em falta/validação](#campos-em-faltavalidação)

### **🟢 Problemas de Performance**
- [Carregamento lento](#carregamento-lento)
- [Build falha](#build-falha)
- [Cache problems](#cache-problems)

---

## 🔴 **Problemas Críticos**

### **Modal não salva/botão salvar não funciona**

#### **🔍 Sintomas**
- Clicar em "Salvar" não faz nada
- Modal não fecha após salvar
- Dados não são persistidos no banco
- Console sem erros aparentes

#### **🕵️ Diagnóstico**
1. **Verificar validação Zod no console**:
   ```javascript
   // Abra DevTools (F12) → Console
   // Procure por erros de validação Zod
   ```

2. **Testar com dados mínimos**:
   ```typescript
   // Teste apenas com campos obrigatórios
   {
     name: "Teste",
     price: 10.99
   }
   ```

3. **Verificar event handlers**:
   ```typescript
   // Procure por este padrão INCORRETO
   onClick: () => form.handleSubmit(handler)()

   // Deve ser
   onClick: form.handleSubmit(handler)
   ```

#### **✅ Soluções**

##### **Solução #1: Corrigir Schema Zod**
```typescript
// ❌ Problemático
cost_price: z.number().min(0.01)

// ✅ Correto
cost_price: z
  .number({ invalid_type_error: 'Deve ser um número' })
  .min(0, 'Deve ser maior ou igual a 0')
  .optional()
  .or(z.literal(0))
  .or(z.literal(undefined))
```

##### **Solução #2: Corrigir Valores Padrão**
```typescript
// ❌ Problemático
defaultValues: {
  cost_price: 0,      // Pode conflitar com validação
  volume_ml: 0        // Pode conflitar com validação
}

// ✅ Correto
defaultValues: {
  price: 0.01,               // Valor mínimo válido
  cost_price: undefined,     // Aceito pelo schema
  volume_ml: undefined       // Aceito pelo schema
}
```

##### **Solução #3: Corrigir Event Handler**
```typescript
// ❌ Problemático
<Button onClick={() => form.handleSubmit(handleSave)()}>
  Salvar
</Button>

// ✅ Correto
<Button onClick={form.handleSubmit(handleSave)}>
  Salvar
</Button>
```

#### **📊 Resultado Esperado**
- ✅ Modal salva corretamente
- ✅ Dados persistem no banco
- ✅ Modal fecha após salvar
- ✅ Zero erros no console

---

### **Página não carrega/erro de JavaScript**

#### **🔍 Sintomas**
- Tela branca ou erro na página
- Console mostra "ReferenceError: Cannot access 'X' before initialization"
- Funcionalidade específica não funciona

#### **🕵️ Diagnóstico**
1. **Verificar ordem de declaração de funções**:
   ```typescript
   // Procure por funções const usadas antes da declaração
   useEffect(() => {
     fetchData(); // Erro se fetchData está declarada depois
   }, []);

   const fetchData = () => { /* ... */ };
   ```

2. **Verificar imports**:
   ```typescript
   // Confirme que todos os imports existem
   import { NonExistentComponent } from './path';
   ```

#### **✅ Soluções**

##### **Solução #1: Corrigir Hoisting**
```typescript
// ❌ Problemático
export const Component = () => {
  useEffect(() => {
    fetchData(); // Erro: função não existe ainda
  }, []);

  const fetchData = async () => {
    // implementação
  };
};

// ✅ Correto
export const Component = () => {
  const fetchData = useCallback(async () => {
    // implementação
  }, []);

  useEffect(() => {
    fetchData(); // Funciona perfeitamente
  }, [fetchData]);
};
```

##### **Solução #2: Limpar Cache**
```bash
# Terminal
rm -rf node_modules/.vite .vite dist
npm run dev

# Browser: Hard refresh
# Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
```

#### **📊 Resultado Esperado**
- ✅ Página carrega normalmente
- ✅ Zero erros no console
- ✅ Todas as funcionalidades funcionam

---

### **Dados não aparecem/cache incorreto**

#### **🔍 Sintomas**
- Preço de custo mostra "em falta" mas está cadastrado
- Dados antigos aparecem no modal
- Mudanças no banco não refletem na interface

#### **🕵️ Diagnóstico**
1. **Verificar dados no Supabase Dashboard**:
   - Confirme que os dados estão realmente salvos
   - Verifique se o campo não é null/empty

2. **Verificar se modal busca dados frescos**:
   ```typescript
   // Procure por uso de dados cacheados
   setSelectedProduct(product); // Pode estar usando cache
   ```

#### **✅ Soluções**

##### **Solução #1: Buscar Dados Frescos**
```typescript
// ❌ Problemático (dados cacheados)
const handleViewDetails = (product: Product) => {
  setSelectedProduct(product);
  setModalOpen(true);
};

// ✅ Correto (dados frescos)
const handleViewDetails = async (product: Product) => {
  const { data: updatedProduct, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', product.id)
    .single();

  setSelectedProduct(error ? product : updatedProduct);
  setModalOpen(true);
};
```

##### **Solução #2: Invalidar Cache React Query**
```typescript
const queryClient = useQueryClient();

// Após salvar/editar
await queryClient.invalidateQueries(['products']);
```

##### **Solução #3: Verificar Validação de Dados**
```typescript
// ❌ Problemático (não lida com strings)
const isValid = product.cost_price && product.cost_price > 0;

// ✅ Correto (conversão segura)
const isValid = product.cost_price && Number(product.cost_price) > 0;
```

#### **📊 Resultado Esperado**
- ✅ Dados sempre atualizados
- ✅ Modal mostra informações corretas
- ✅ Mudanças refletem imediatamente

---

### **Erro de overflow numérico**

#### **🔍 Sintomas**
- Erro: "PostgreSQL Error 22003: numeric field overflow"
- Modal não salva produtos com margens altas
- Cálculos retornam NaN ou Infinity

#### **🕵️ Diagnóstico**
1. **Verificar precisão dos campos no banco**:
   ```sql
   -- Campos NUMERIC(5,2) limitam a 999.99
   -- Valores acima causam overflow
   ```

2. **Verificar cálculos de margem**:
   ```typescript
   // Procure por cálculos sem bounds checking
   const margin = (salePrice - costPrice) / costPrice * 100;
   ```

#### **✅ Soluções**

##### **Solução #1: Aumentar Precisão do Banco**
```sql
-- Migração necessária
ALTER TABLE products
ALTER COLUMN package_margin TYPE NUMERIC(8,2);
```

##### **Solução #2: Implementar Cálculos Seguros**
```typescript
const safeCalculateMargin = (
  salePrice: number | undefined | null,
  costPrice: number | undefined | null,
  maxMargin: number = 999
): number | null => {
  const validSalePrice = typeof salePrice === 'number' && salePrice > 0 ? salePrice : null;
  const validCostPrice = typeof costPrice === 'number' && costPrice > 0 ? costPrice : null;

  if (!validSalePrice || !validCostPrice) return null;

  const margin = ((validSalePrice - validCostPrice) / validCostPrice) * 100;

  // Previne overflow e valores inválidos
  return Number.isFinite(margin) ? Math.min(Math.max(margin, 0), maxMargin) : null;
};
```

##### **Solução #3: Validação Frontend**
```typescript
const packageMargin = React.useMemo(() => {
  if (watchedValues.package_price && watchedValues.cost_price) {
    return safeCalculateMargin(watchedValues.package_price, watchedValues.cost_price);
  }
  return null;
}, [watchedValues.package_price, watchedValues.cost_price]);
```

#### **📊 Resultado Esperado**
- ✅ Zero erros de overflow
- ✅ Margens calculadas corretamente
- ✅ Produtos salvam normalmente

---

## 🟡 **Problemas de Interface**

### **Modal fantasma/modais sobrepostos**

#### **🔍 Sintomas**
- Modal aparece depois de fechar outro modal
- Modais ficam sobrepostos
- Estado confuso entre modais

#### **✅ Soluções**

##### **Centralizar Gerenciamento de Estado**
```typescript
// ❌ Problemático (cada modal controla selectedProduct)
const StockHistoryModal = ({ onClose }) => {
  const handleClose = () => {
    setSelectedProduct(null); // Interfere no parent
    onClose();
  };
};

// ✅ Correto (parent controla estado)
const StockHistoryModal = ({ onClose }) => {
  const handleClose = () => {
    onClose(); // Não interfere no parent
  };
};
```

---

### **Layout quebrado/responsividade**

#### **🔍 Sintomas**
- Modal quebra fora da tela em 1200px
- Elementos sobrepostos
- Scroll inadequado

#### **✅ Soluções**

##### **Otimizar Layout para 1200px**
```tsx
<EnhancedBaseModal
  size="5xl"                    // 1200px de largura
  className="max-h-[90vh]"      // Previne overflow vertical
>
  <div className="max-h-[75vh] overflow-y-auto">
    {/* Conteúdo com scroll se necessário */}
  </div>
</EnhancedBaseModal>
```

---

## 🟢 **Problemas de Performance**

### **Carregamento lento**

#### **✅ Soluções**

##### **React Query Cache Inteligente**
```typescript
const { data: products } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts,
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
});
```

### **Build falha**

#### **✅ Soluções**

##### **Limpeza e Reinstalação**
```bash
rm -rf node_modules .vite dist
npm install
npm run build
```

### **Cache problems**

#### **✅ Soluções**

##### **Limpeza Completa de Cache**
```bash
# Matar processos Vite
pkill -f "vite"

# Limpar cache completamente
rm -rf node_modules/.vite .vite dist

# Restart desenvolvimento
npm run dev
```

---

## 🛠️ **Toolkit de Debug**

### **🔧 Ferramentas Essenciais**
1. **React DevTools** - Análise de estado e props
2. **Chrome DevTools** - Network, Console, Performance
3. **Supabase Dashboard** - Verificação de dados
4. **VS Code** - Breakpoints e debugging

### **📋 Checklist de Debug Sistemático**
1. [ ] Verificar console do navegador para erros JavaScript
2. [ ] Confirmar dados no Supabase Dashboard
3. [ ] Testar com dados mínimos obrigatórios
4. [ ] Verificar validação Zod com console logs
5. [ ] Confirmar event handlers não duplicados
6. [ ] Validar estado de componentes no React DevTools
7. [ ] Testar em ambiente isolado/limpo

### **⚡ Comandos de Diagnóstico Rápido**
```bash
# Verificar logs do sistema
npm run dev                    # Console de desenvolvimento
npm run lint                   # Verificar qualidade do código
npm run build                  # Testar compilação

# Limpeza geral
rm -rf node_modules/.vite .vite dist && npm install
```

---

## 📞 **Protocolo de Suporte**

### **🚨 Para Bugs Críticos**
1. **Isolamento**: Reproduzir o problema em ambiente controlado
2. **Documentação**: Capturar erro completo (console + screenshot)
3. **Análise**: Seguir checklist de debug sistemático
4. **Implementação**: Aplicar solução testada
5. **Validação**: Confirmar resolução em produção
6. **Documentação**: Atualizar este guia com nova solução

### **📋 Template de Report de Bug**
```
## Descrição do Problema
[Descrição clara do que está acontecendo]

## Passos para Reproduzir
1. [Primeiro passo]
2. [Segundo passo]
3. [Terceiro passo]

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que realmente acontece]

## Erros no Console
[Cole os erros do DevTools aqui]

## Ambiente
- Browser: [Chrome/Firefox/etc]
- Versão do Sistema: [v2.0.x]
- Data/Hora: [quando ocorreu]
```

---

## 📈 **Histórico de Soluções**

### **Bugs Resolvidos em Setembro 2025**
- ✅ [Modal não salva] - Conflitos Zod schema resolvidos
- ✅ [Modal fantasma] - Gerenciamento de estado corrigido
- ✅ [Overflow numérico] - Migração NUMERIC(8,2) + funções seguras
- ✅ [Hoisting error] - useCallback implementado
- ✅ [Cache incorreto] - Busca de dados frescos implementada

**📖 Documentação Completa**: [Correções Críticas](../../10-legacy/bug-fixes/MODAL_SYSTEM_CRITICAL_FIXES.md)

---

**🏆 Sistema 100% estável em produção com 925+ registros reais!**

---

**📅 Última Atualização:** 26 de setembro de 2025
**🎯 Status:** Guia completo com todas as soluções testadas