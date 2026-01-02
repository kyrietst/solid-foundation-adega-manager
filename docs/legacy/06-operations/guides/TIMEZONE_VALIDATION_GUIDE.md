# 🧪 **GUIA DE VALIDAÇÃO DE TIMEZONE**

## 📋 **OBJETIVO**

Este guia fornece procedimentos padronizados para validar se o sistema Adega Manager está funcionando corretamente com o timezone `America/Sao_Paulo` (Brasil - UTC-3).

---

## ⚡ **VALIDAÇÃO RÁPIDA (30 segundos)**

### **Passo 1: Teste JavaScript**
```bash
cd /caminho/do/projeto
node -e "
const getSaoPauloTimestamp = () => {
  const now = new Date();
  const spTime = new Date(now.toLocaleString('en-US', {timeZone: 'America/Sao_Paulo'}));
  return spTime.toISOString();
};

const formatBrazilian = (timestamp) => {
  const date = new Date(timestamp);
  const spDate = new Date(date.toLocaleString('en-US', {timeZone: 'America/Sao_Paulo'}));
  return spDate.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

const timestamp = getSaoPauloTimestamp();
console.log('🇧🇷 Horário atual do sistema:', formatBrazilian(timestamp));
console.log('⏰ Compare com seu relógio - deve estar correto!');
"
```

### **Passo 2: Teste Banco de Dados**
```sql
-- No Supabase ou cliente PostgreSQL
SELECT
  now() AT TIME ZONE 'America/Sao_Paulo' as sao_paulo_time,
  to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS') as formatado_brasileiro;
```

### **Passo 3: Comparação**
- ✅ **JavaScript** e **PostgreSQL** devem mostrar o **mesmo horário**
- ✅ Horário deve **bater com seu relógio** (São Paulo/Brasil)
- ✅ Diferença máxima aceitável: **5 segundos**

---

## 🔬 **VALIDAÇÃO COMPLETA**

### **Teste 1: Criação de Registro**

```sql
-- Criar produto de teste
INSERT INTO products (
  name,
  category,
  price,
  stock_packages,
  stock_units_loose,
  created_at
) VALUES (
  'TESTE TIMEZONE - ' || to_char(now() AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI:SS'),
  'Cerveja', -- ou categoria válida
  10.00,
  0,
  1,
  (now() AT TIME ZONE 'America/Sao_Paulo' AT TIME ZONE 'UTC')
) RETURNING
  id,
  name,
  created_at,
  created_at AT TIME ZONE 'America/Sao_Paulo' as created_at_sao_paulo;
```

**Resultado Esperado:**
- Nome deve conter horário atual de São Paulo
- `created_at_sao_paulo` deve bater com horário do nome
- Diferença máxima: poucos segundos

### **Teste 2: Filtros de Dashboard**

```javascript
// Testar range de datas
const getSaoPauloDateRange = (windowDays) => {
  const nowSP = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const endDate = new Date(nowSP);
  const startDate = new Date(nowSP);
  startDate.setDate(endDate.getDate() - windowDays);

  return {
    current: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  };
};

const range = getSaoPauloDateRange(30);
console.log('📊 Range para dashboard (30 dias):', range);
```

### **Teste 3: Delivery Estimates**

```javascript
// Testar estimativa de entrega
const calculateDeliveryTime = (minutesToAdd) => {
  const nowSP = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  const estimatedTime = new Date(nowSP.getTime() + minutesToAdd * 60 * 1000);
  return estimatedTime.toISOString();
};

const delivery = calculateDeliveryTime(120); // 2 horas
console.log('🚚 Entrega estimada em 2h:', delivery);
```

---

## 🚨 **IDENTIFICAÇÃO DE PROBLEMAS**

### **Sintomas de Timezone Incorreto**

| Problema | Sintoma | Causa Provável |
|----------|---------|----------------|
| **Horário 3h adiantado** | Registros mostram horário UTC | `new Date().toISOString()` sem conversão |
| **Horário inconsistente** | JS ≠ PostgreSQL | Conversões diferentes entre sistemas |
| **Delivery errado** | Estimativas incorretas | Cálculo sem timezone SP |
| **Filtros errados** | Dashboard vazio/errado | Range de datas em UTC |

### **Checklist de Debugging**

```bash
# 1. Verificar imports corretos
grep -r "new Date().toISOString()" src/ --include="*.ts" --include="*.tsx"
# ❌ Se encontrar resultados = PROBLEMA

# 2. Verificar uso das funções corretas
grep -r "getSaoPauloTimestamp" src/ --include="*.ts" --include="*.tsx"
# ✅ Deve ter muitos resultados

# 3. Verificar timezone do banco
# No Supabase: SELECT current_setting('timezone');
# Deve retornar: UTC (correto)
```

---

## 🛠️ **CORREÇÕES COMUNS**

### **Correção 1: Timestamp de Criação**
```typescript
// ❌ Errado
created_at: new Date().toISOString()

// ✅ Correto
import { getSaoPauloTimestamp } from '@/shared/utils/timezone-saopaulo';
created_at: getSaoPauloTimestamp()
```

### **Correção 2: Filtros de Dashboard**
```typescript
// ❌ Errado
const startDate = new Date();
startDate.setDate(endDate.getDate() - 30);

// ✅ Correto
import { getSaoPauloDateRange } from '@/shared/utils/timezone-saopaulo';
const { current } = getSaoPauloDateRange(30);
```

### **Correção 3: Logs com Timestamp**
```typescript
// ❌ Errado
console.log('Operação realizada:', { timestamp: new Date().toISOString() });

// ✅ Correto
import { getLogTimestamp } from '@/shared/utils/timezone-saopaulo';
console.log('Operação realizada:', { timestamp: getLogTimestamp() });
```

---

## 📊 **TEMPLATE DE RELATÓRIO**

### **Resultado da Validação - [DATA]**

**Testado por:** [NOME]
**Ambiente:** [DEV/PROD]
**Horário local:** [SEU_RELÓGIO]

| Teste | Status | Resultado | Observações |
|-------|--------|-----------|-------------|
| JavaScript Function | ✅/❌ | [HORÁRIO] | [COMENTÁRIOS] |
| PostgreSQL Database | ✅/❌ | [HORÁRIO] | [COMENTÁRIOS] |
| Criação de Registro | ✅/❌ | [HORÁRIO] | [COMENTÁRIOS] |
| Filtros Dashboard | ✅/❌ | [RANGE] | [COMENTÁRIOS] |
| Delivery Estimates | ✅/❌ | [ESTIMATIVA] | [COMENTÁRIOS] |

**Conclusão:** [SISTEMA_OK / NECESSITA_CORREÇÃO]

**Ações Necessárias:**
- [ ] [AÇÃO_1]
- [ ] [AÇÃO_2]

---

## ⚙️ **AUTOMATIZAÇÃO FUTURA**

### **Teste Automatizado (Implementar)**
```javascript
// test/timezone.test.js
describe('Timezone Validation', () => {
  it('should use São Paulo timezone consistently', () => {
    const jsTimestamp = getSaoPauloTimestamp();
    const dbTimestamp = queryDatabase();

    expect(timeDifference(jsTimestamp, dbTimestamp)).toBeLessThan(5000); // 5 segundos
  });
});
```

### **Monitor de Produção (Implementar)**
```javascript
// Verificação periódica
setInterval(() => {
  const timezoneCheck = validateTimezone();
  if (!timezoneCheck.valid) {
    alert('❌ TIMEZONE INCONSISTENCY DETECTED!');
  }
}, 60000); // A cada minuto
```

---

## 📞 **SUPORTE**

**Em caso de problemas:**
1. Execute a **Validação Rápida** primeiro
2. Se falhar, execute a **Validação Completa**
3. Use o **Template de Relatório** para documentar
4. Consulte [TIMEZONE_ARCHITECTURE.md](../../02-architecture/TIMEZONE_ARCHITECTURE.md)

**Contatos:**
- Documentação Técnica: `docs/02-architecture/TIMEZONE_ARCHITECTURE.md`
- Código Fonte: `src/shared/utils/timezone-saopaulo.ts`
- Guia de Uso: `src/shared/utils/TIMEZONE_USAGE_GUIDE.md`

---

**⚡ LEMBRE-SE: TODO O SISTEMA DEVE USAR HORÁRIO DE SÃO PAULO! 🇧🇷**