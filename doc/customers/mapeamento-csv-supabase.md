# Mapeamento CSV → Supabase - Clientes

## Visão Geral da Importação

**Origem:** `TAREFA 1 - ADEGA - Base de Clientes.csv`  
**Destino:** Tabela `customers` no Supabase PostgreSQL  
**Total de Registros:** 94 clientes para importar

---

## Mapeamento de Colunas

### **CSV → Supabase**

| Campo CSV | Campo Supabase | Tipo | Transformação Necessária |
|-----------|----------------|------|--------------------------|
| `Nome do Cliente` | `name` | text | Trim + normalização |
| `Telefone` | `phone` | text | Normalização formato brasileiro |
| `Endereço` | `address` | jsonb | Conversão para estrutura JSON |
| `Última Compra` | `last_purchase_date` | timestamp | Parse DD/MM/YYYY → timestamp |
| `Frequência` | `purchase_frequency` | text | Normalização de valores |

### **Campos Automáticos Supabase**

| Campo | Tipo | Valor |
|-------|------|-------|
| `id` | uuid | `uuid_generate_v4()` |
| `created_at` | timestamptz | `now()` |
| `updated_at` | timestamptz | `now()` |
| `lifetime_value` | numeric | `0` |
| `tags` | jsonb | `[]` |
| `contact_permission` | boolean | `false` |

---

## Funções de Transformação

### **1. Normalização de Nome**
```typescript
function normalizeName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
```

### **2. Normalização de Telefone**
```typescript
function normalizePhone(phone: string): string | null {
  if (!phone || phone.trim() === '') return null;
  
  // Remove caracteres especiais e espaços
  const cleaned = phone.replace(/[^\d]/g, '');
  
  // Formato brasileiro: 11 dígitos para celular, 10 para fixo
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0,2)}) ${cleaned.slice(2,6)}-${cleaned.slice(6)}`;
  }
  
  return phone; // Retorna original se não conseguir normalizar
}
```

### **3. Conversão de Endereço para JSONB**
```typescript
function convertAddress(address: string): object | null {
  if (!address || address.trim() === '') return null;
  
  // Remove quebras de linha indevidas
  const cleanAddress = address.replace(/\n\s*/g, ' ').trim();
  
  return {
    street: cleanAddress,
    city: "São Paulo", // Assumindo pela análise dos dados
    state: "SP",
    country: "Brasil",
    raw: cleanAddress
  };
}
```

### **4. Conversão de Data**
```typescript
function parseDate(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === '') return null;
  
  // Formato esperado: DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // JavaScript months são 0-based
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  }
  
  return null;
}
```

### **5. Normalização de Frequência**
```typescript
function normalizeFrequency(frequency: string): string | null {
  if (!frequency || frequency.trim() === '') return null;
  
  const freq = frequency.toLowerCase().trim();
  
  switch (freq) {
    case 'semanal': return 'weekly';
    case 'quinzenal': return 'biweekly';
    case 'primeira compra': return 'first_time';
    default: return freq;
  }
}
```

---

## Tratamento de Dados Problemáticos

### **Registros Duplicados**
**Estratégia:** Merge inteligente baseado em nome + telefone

```sql
-- Identificar duplicatas
WITH duplicates AS (
  SELECT name, COUNT(*) as count 
  FROM temp_customers 
  GROUP BY name 
  HAVING COUNT(*) > 1
)
```

**Casos identificados:**
- Andressa (2 registros) → Manter ambos (telefones diferentes)
- Fernanda (2 registros) → Manter ambos (endereços diferentes)
- Guilherme (2 registros) → Manter ambos (endereços diferentes)
- Larissa (2 registros) → Manter ambos (endereços diferentes)
- Rafaela (2 registros) → Manter ambos (endereços diferentes)
- Viviane (2 registros) → Manter ambos (telefones diferentes)

### **Registros com Dados Ausentes**
1. **Léo** (linha 57): Todos campos vazios exceto nome → Criar com dados mínimos
2. **Jacaré** (linha 47): Sem telefone → Manter sem telefone
3. **Telefones ausentes:** Manter como NULL

### **Endereços com Quebras de Linha**
- Camila (linhas 14-15)
- Cida (linhas 17-18)  
- Dione (linhas 25-26)
- Yasmin (linhas 93-94)

**Solução:** Concatenar linhas e limpar espaços extras.

---

## Processo de Importação

### **Fase 1: Preparação dos Dados**
```typescript
const processedCustomers = csvData.map((row, index) => {
  try {
    return {
      name: normalizeName(row['Nome do Cliente']),
      phone: normalizePhone(row['Telefone']),
      address: convertAddress(row['Endereço']),
      last_purchase_date: parseDate(row['Última Compra']),
      purchase_frequency: normalizeFrequency(row['Frequência']),
      tags: ['imported_csv'], // Tag para identificar origem
      notes: `Importado do CSV em ${new Date().toISOString()}`
    };
  } catch (error) {
    console.error(`Erro processando linha ${index + 2}:`, error);
    return null;
  }
}).filter(customer => customer !== null);
```

### **Fase 2: Inserção no Banco**
```sql
INSERT INTO customers (
  name,
  phone,
  address,
  last_purchase_date,
  purchase_frequency,
  tags,
  notes,
  created_at,
  updated_at,
  lifetime_value,
  contact_permission
) VALUES
($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), 0, false);
```

### **Fase 3: Validação**
- Verificar total de registros inseridos
- Validar dados críticos (nome, telefone)
- Conferir conversão de datas
- Revisar estrutura JSONB dos endereços

---

## Scripts de Validação

### **Contagem Total**
```sql
SELECT COUNT(*) as total_customers FROM customers WHERE tags @> '["imported_csv"]';
```

### **Verificação de Telefones**
```sql
SELECT phone, COUNT(*) 
FROM customers 
WHERE tags @> '["imported_csv"]' 
GROUP BY phone 
HAVING COUNT(*) > 1;
```

### **Validação de Datas**
```sql
SELECT name, last_purchase_date 
FROM customers 
WHERE tags @> '["imported_csv"]' 
AND (last_purchase_date IS NULL OR last_purchase_date > NOW());
```

### **Estrutura de Endereços**
```sql
SELECT name, address 
FROM customers 
WHERE tags @> '["imported_csv"]' 
AND address IS NOT NULL 
LIMIT 10;
```

---

## Resultado Esperado

### **Estatísticas de Importação**
- **Total processado:** 94 registros
- **Com nome válido:** 94 (100%)
- **Com telefone:** 92 (97.9%)
- **Com endereço:** 93 (98.9%)
- **Com data de compra:** 93 (98.9%)
- **Com frequência:** 6 (6.4%)

### **Campos Populados Automaticamente**
- `id`: UUID único para cada cliente
- `created_at`/`updated_at`: Timestamp da importação
- `lifetime_value`: Inicializado como 0
- `contact_permission`: false (requer opt-in posterior)
- `tags`: ["imported_csv"] para rastreabilidade

### **Próximos Passos Recomendados**
1. **Executar importação via MCP Supabase**
2. **Validar dados importados**
3. **Configurar segmentação automática** baseada em purchase_frequency
4. **Implementar sistema de LTV** baseado em historical sales
5. **Criar fluxo de atualização** para contact_permission (LGPD)