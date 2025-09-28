# 🕐 **GUIA OBRIGATÓRIO: Timezone São Paulo**

## 🚨 **REGRA CRÍTICA**

**TODO o sistema deve usar EXCLUSIVAMENTE horário de São Paulo - Brasil (UTC-3).**

---

## 🔧 **Funções Obrigatórias**

### **📝 Para Timestamps de Criação**
```typescript
// ❌ NUNCA FAZER
created_at: new Date().toISOString()

// ✅ SEMPRE FAZER
import { getSaoPauloTimestamp } from '@/shared/utils/timezone-saopaulo';
created_at: getSaoPauloTimestamp()
```

### **📊 Para Filtros de Relatórios**
```typescript
// ❌ NUNCA FAZER
const startDate = new Date();
startDate.setDate(endDate.getDate() - 30);

// ✅ SEMPRE FAZER
import { getSaoPauloDateRange } from '@/shared/utils/timezone-saopaulo';
const { current, previous } = getSaoPauloDateRange(30);
```

### **🚚 Para Delivery Estimates**
```typescript
// ❌ NUNCA FAZER
estimated_delivery_time: new Date(Date.now() + minutes * 60 * 1000).toISOString()

// ✅ SEMPRE FAZER
import { calculateDeliveryTime } from '@/shared/utils/timezone-saopaulo';
estimated_delivery_time: calculateDeliveryTime(estimatedMinutes)
```

### **📋 Para Logs**
```typescript
// ❌ NUNCA FAZER
console.log('Debug:', { timestamp: new Date().toISOString() })

// ✅ SEMPRE FAZER
import { getLogTimestamp } from '@/shared/utils/timezone-saopaulo';
console.log('Debug:', { timestamp: getLogTimestamp() })
```

---

## 📚 **Funções Disponíveis**

| Função | Uso | Exemplo |
|--------|-----|---------|
| `getSaoPauloTimestamp()` | Timestamps de criação | `created_at: getSaoPauloTimestamp()` |
| `getSaoPauloDateRange(days)` | Filtros de relatórios | `const range = getSaoPauloDateRange(30)` |
| `convertToSaoPaulo(date)` | Converter UTC → SP | `const spDate = convertToSaoPaulo(utcDate)` |
| `formatBrazilian(date)` | Formatação brasileira | `const str = formatBrazilian(date)` |
| `calculateDeliveryTime(min)` | Estimativas delivery | `const eta = calculateDeliveryTime(120)` |
| `getTodayStartSaoPaulo()` | Início do dia | `gte('created_at', getTodayStartSaoPaulo())` |
| `getTodayEndSaoPaulo()` | Fim do dia | `lte('created_at', getTodayEndSaoPaulo())` |
| `getLogTimestamp()` | Logs formatados | `console.log('Time:', getLogTimestamp())` |

---

## ⚠️ **Padrões PROIBIDOS**

| ❌ Proibido | ✅ Correto |
|-------------|------------|
| `new Date().toISOString()` | `getSaoPauloTimestamp()` |
| `new Date()` em filtros | `getSaoPauloDateRange()` |
| `Date.now()` | `getSaoPauloTimestamp()` |
| `date.toISOString()` sem conversão | `convertToSaoPaulo(date).toISOString()` |

---

## 🎯 **Casos de Uso Críticos**

### **1. Criação de Produtos**
```typescript
// NewProductModal.tsx
const productData = {
  name: 'Produto Teste',
  created_at: getSaoPauloTimestamp() // ✅ Horário correto
};
```

### **2. Ajustes de Estoque**
```typescript
// StockAdjustmentModal.tsx
console.log('Ajuste realizado:', {
  productId,
  timestamp: getLogTimestamp() // ✅ Log em horário SP
});
```

### **3. Relatórios de Vendas**
```typescript
// useDashboardKpis.ts
const range = getSaoPauloDateRange(30); // ✅ Período correto
const { data } = await supabase
  .from('sales')
  .gte('created_at', range.current.start)
  .lte('created_at', range.current.end);
```

### **4. Estimativas de Entrega**
```typescript
// use-sales.ts
const saleData = {
  estimated_delivery_time: calculateDeliveryTime(120) // ✅ 2h em SP
};
```

---

## 🛡️ **Prevenção de Erros**

### **Code Review Checklist**
- [ ] Nenhum `new Date().toISOString()` no código
- [ ] Nenhum `Date.now()` para timestamps
- [ ] Todas as datas usam funções do timezone-saopaulo
- [ ] Filtros de relatório usam `getSaoPauloDateRange()`
- [ ] Logs usam `getLogTimestamp()`

### **ESLint Rules (Recomendado)**
```javascript
// .eslintrc.js
rules: {
  'no-new-date-toiso': 'error', // Bloquear new Date().toISOString()
  'prefer-saopaulo-timezone': 'error' // Preferir funções do timezone
}
```

---

## ⚡ **Impacto da Correção**

### **Antes (Incorreto)**
- Vendas registradas 3h adiantadas
- Relatórios com dados de período errado
- Delivery estimates incorretos
- Logs confusos para debug

### **Depois (Correto)**
- Horários precisos no fuso brasileiro
- Relatórios com períodos exatos
- Estimativas de entrega confiáveis
- Logs com horário local correto

---

## 📞 **Suporte**

Em caso de dúvidas sobre timezone, consulte:
- `src/shared/utils/timezone-saopaulo.ts` - Implementação
- `src/shared/hooks/common/use-brasil-timezone.ts` - Hook para componentes
- Este guia para referência rápida

**Lembre-se: SEMPRE use horário de São Paulo no sistema!** 🇧🇷