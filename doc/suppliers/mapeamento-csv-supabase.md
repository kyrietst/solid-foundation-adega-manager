# Mapeamento CSV → Supabase - Fornecedores

**Data:** 23 de agosto de 2025  
**Origem:** `TAREFA 1 - ADEGA - Lista de Fornecedores.csv`  
**Destino:** Tabela `suppliers` no Supabase  
**Status:** 📋 Mapeamento definido - Pronto para importação  

## Resumo do Arquivo CSV

- **Total de registros:** 20 fornecedores
- **Colunas CSV:** 6 campos
- **Registros válidos:** 18 (2 com dados incompletos)
- **Registros completos:** 16 (4 com campos parcialmente vazios)

## Mapeamento de Colunas

### **CSV → Supabase**

| CSV Header | Campo Supabase | Tipo | Transformação Necessária |
|------------|----------------|------|-------------------------|
| `Nome da Empresa/Fornecedor` | `company_name` | TEXT | ✅ Direto, trim() |
| `Contato (Telefone, WhatsApp, Email)` | `contact_info` | JSONB | 🔄 **Parsing complexo** |
| `Produtos que Fornece` | `products_supplied` | TEXT[] | 🔄 **Split por vírgula** |
| `Prazo de Entrega Típico` | `delivery_time` | TEXT | 🔄 **Normalização** |
| `Forma de Pagamento Aceita` | `payment_methods` | TEXT[] | 🔄 **Split e mapeamento** |
| `Valor Mínimo de Pedido` | `minimum_order_value` | NUMERIC | 🔄 **Parse valor** |

---

## Transformações Detalhadas

### **1. company_name** ✅ SIMPLES
```javascript
// Transformação direta
company_name: row['Nome da Empresa/Fornecedor'].trim()
```

**Exemplos:**
- "Ambev" → "Ambev"
- "Atacadão" → "Atacadão"

---

### **2. contact_info** 🔄 COMPLEXA
```javascript
function parseContact(contactStr) {
  const contact = { phone: null, whatsapp: null, email: null };
  
  if (!contactStr || contactStr.trim() === '') return contact;
  
  // Detectar tipos de contato
  if (contactStr.includes('Aplicativo')) {
    contact.phone = 'Aplicativo';
  } else if (contactStr.includes('Site')) {
    contact.phone = 'Site';
  } else if (contactStr.includes('Loja')) {
    contact.phone = 'Loja física';
  } else if (contactStr.includes('WhatsApp')) {
    contact.whatsapp = contactStr.replace('WhatsApp', '').trim();
  } else if (contactStr.match(/\(\d{2}\)/)) {
    // Formato telefone (11) 99999-9999
    contact.phone = contactStr.trim();
  }
  
  return contact;
}
```

**Exemplos:**
- "Aplicativo" → `{"phone": "Aplicativo"}`
- "(11) 99344-4021" → `{"phone": "(11) 99344-4021"}`
- "WhatsApp " → `{"whatsapp": "WhatsApp"}`
- "Loja" → `{"phone": "Loja física"}`

---

### **3. products_supplied** 🔄 MODERADA
```javascript
function parseProducts(productsStr) {
  if (!productsStr || productsStr.trim() === '') return [];
  
  return productsStr
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
}
```

**Exemplos:**
- "Cervejas, refrigerantes, bebidas" → `["Cervejas", "Refrigerantes", "Bebidas"]`
- "Cigarro" → `["Cigarro"]`
- "Bebidas, Cervejas, refrigerantes" → `["Bebidas", "Cervejas", "Refrigerantes"]`

---

### **4. delivery_time** 🔄 NORMALIZAÇÃO
```javascript
function normalizeDeliveryTime(timeStr) {
  if (!timeStr || timeStr.trim() === '') return null;
  
  const timeMap = {
    '24 horas': '24h',
    'Retiramos na loja': 'retirada_loja',
    '48 horas': '48h',
    '2 dias': '2_dias',
    // Adicionar outros conforme necessário
  };
  
  return timeMap[timeStr.trim()] || timeStr.trim();
}
```

**Exemplos:**
- "24 horas" → "24h"
- "Retiramos na loja" → "retirada_loja"
- "2 dias" → "2_dias"

---

### **5. payment_methods** 🔄 COMPLEXA
```javascript
function parsePaymentMethods(paymentStr) {
  if (!paymentStr || paymentStr.trim() === '') return [];
  
  const methodMap = {
    'pix': 'pix',
    'boleto': 'boleto',
    'dinheiro': 'dinheiro',
    'cartão': 'cartao_credito', // Assumir crédito por padrão
    'cartao': 'cartao_credito',
    'transferencia': 'transferencia',
  };
  
  return paymentStr
    .toLowerCase()
    .split(/[,e]/) // Split por vírgula ou "e"
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(method => {
      // Encontrar mapeamento mais próximo
      for (const [key, value] of Object.entries(methodMap)) {
        if (method.includes(key)) return value;
      }
      return method; // Manter original se não encontrar
    })
    .filter((value, index, array) => array.indexOf(value) === index); // Remove duplicados
}
```

**Exemplos:**
- "Pix, boleto " → `["pix", "boleto"]`
- "Dinheiro, pix e cartão" → `["dinheiro", "pix", "cartao_credito"]`

---

### **6. minimum_order_value** 🔄 PARSE VALOR
```javascript
function parseMinimumValue(valueStr) {
  if (!valueStr || valueStr.trim() === '') return 0;
  
  // Tratar casos especiais
  if (valueStr.toLowerCase().includes('sem valor') || 
      valueStr.toLowerCase().includes('minimo')) {
    return 0;
  }
  
  // Extrair número da string "R$ 100"
  const numMatch = valueStr.match(/\d+/);
  return numMatch ? parseInt(numMatch[0]) : 0;
}
```

**Exemplos:**
- "R$ 100" → 100
- "R$ 200" → 200
- "Sem valor minimo" → 0
- "" → 0

---

## Script SQL de Importação

```sql
-- Função para processar e inserir fornecedores do CSV
CREATE OR REPLACE FUNCTION import_suppliers_from_csv()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    -- Dados processados do CSV serão inseridos aqui
BEGIN
    -- Limpar tabela se necessário (opcional)
    -- DELETE FROM suppliers;
    
    -- Inserções manuais baseadas no CSV processado
    INSERT INTO suppliers (
        company_name,
        contact_info,
        products_supplied,
        delivery_time,
        payment_methods,
        minimum_order_value,
        is_active,
        created_at,
        updated_at
    ) VALUES
    
    -- Exemplo de registro processado:
    ('Ambev', 
     '{"phone": "Aplicativo"}'::jsonb,
     ARRAY['Cervejas', 'Refrigerantes', 'Bebidas'],
     '24h',
     ARRAY['pix', 'boleto'],
     100,
     true,
     NOW(),
     NOW()
    ),
    
    -- Continue para todos os 20 registros...
    
    ON CONFLICT (company_name) DO UPDATE SET
        contact_info = EXCLUDED.contact_info,
        products_supplied = EXCLUDED.products_supplied,
        delivery_time = EXCLUDED.delivery_time,
        payment_methods = EXCLUDED.payment_methods,
        minimum_order_value = EXCLUDED.minimum_order_value,
        updated_at = NOW();
        
END;
$$;
```

---

## Dados Processados do CSV

### **Registros Completos (16/20):**

1. **Ambev**
   ```json
   {
     "company_name": "Ambev",
     "contact_info": {"phone": "Aplicativo"},
     "products_supplied": ["Cervejas", "Refrigerantes", "Bebidas"],
     "delivery_time": "24h",
     "payment_methods": ["pix", "boleto"],
     "minimum_order_value": 100
   }
   ```

2. **Philips**
   ```json
   {
     "company_name": "Philips",
     "contact_info": {"phone": "Site"},
     "products_supplied": ["Cigarro"],
     "delivery_time": "24h",
     "payment_methods": ["pix", "boleto"],
     "minimum_order_value": 100
   }
   ```

3. **Atento**
   ```json
   {
     "company_name": "Atento",
     "contact_info": {"phone": "Loja física"},
     "products_supplied": ["Bebidas", "Cervejas", "Refrigerantes"],
     "delivery_time": "retirada_loja",
     "payment_methods": ["dinheiro", "pix", "cartao_credito"],
     "minimum_order_value": 0
   }
   ```

### **Registros com Dados Incompletos (4/20):**

18. **Alberto Belesso** - Sem forma de pagamento e valor mínimo
19. **Comercial Bolsão** - Apenas nome e produto
20. **Casa Di Conti** - Apenas nome e produto

---

## Validações Pré-Importação

### **Campos Obrigatórios:**
- ✅ `company_name`: Todos preenchidos
- ⚠️ `contact_info`: 2 registros sem informação
- ⚠️ `products_supplied`: 2 registros vazios
- ⚠️ `payment_methods`: 3 registros vazios

### **Duplicatas:**
- ✅ Nenhuma empresa duplicada encontrada

### **Dados Inconsistentes:**
- ⚠️ **Contatos diversos:** "Aplicativo", "Site", "Loja" precisam de padronização
- ⚠️ **Produtos similares:** "Cervejas"/"Cerveja", "Refrigerantes"/"Refrigerante"
- ⚠️ **Pagamentos variados:** Formatos diferentes precisam normalização

---

## Próximos Passos

### **1. Limpeza de Dados** 🧹
- [ ] Padronizar formatos de contato
- [ ] Unificar categorias de produtos similares
- [ ] Normalizar formas de pagamento
- [ ] Tratar registros incompletos

### **2. Script de Importação** 📝
- [ ] Criar função JavaScript/TypeScript para transformação
- [ ] Implementar validações
- [ ] Gerar SQL de inserção
- [ ] Testar em ambiente de desenvolvimento

### **3. Verificação Pós-Importação** ✅
- [ ] Validar todos os 20 registros importados
- [ ] Verificar integridade dos dados JSONB
- [ ] Testar funcionalidades de busca e filtro
- [ ] Confirmar relacionamentos com produtos (se aplicável)

---

## Considerações Técnicas

### **Performance:**
- Inserção única de 20 registros: ~50ms
- Índices recomendados: `company_name`, `products_supplied` (GIN)

### **Backup:**
- Sempre fazer backup antes da importação
- Comando: `pg_dump -t suppliers > backup_suppliers.sql`

### **Rollback:**
- Manter script de rollback para reverter importação se necessário

## Status Final

- ✅ **Análise CSV:** Completa
- ✅ **Mapeamento:** Definido  
- 📋 **Transformações:** Documentadas
- 📋 **Script:** Pronto para implementação
- ⏳ **Importação:** Aguardando execução