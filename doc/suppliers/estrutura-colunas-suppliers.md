# Estrutura das Colunas - Sistema de Fornecedores

**Data:** 23 de agosto de 2025  
**Status:** ✅ Implementado e ativo  
**Tabela:** `suppliers` no Supabase  

## Resumo Executivo

A tabela `suppliers` foi projetada para gerenciar informações completas sobre fornecedores da adega, incluindo dados de contato, produtos fornecidos, condições comerciais e logísticas. O sistema está totalmente implementado com interface moderna e funcional.

## Estrutura da Tabela `suppliers`

### Campos Principais

#### **1. Identificação e Dados Básicos**
```sql
id                  UUID        PRIMARY KEY (auto-gerado)
company_name        TEXT        NOT NULL (Nome da empresa/fornecedor)
created_at          TIMESTAMP   NOT NULL (Data de criação)
updated_at          TIMESTAMP   NOT NULL (Data de última atualização)
created_by          UUID        NULLABLE (ID do usuário que criou)
is_active           BOOLEAN     DEFAULT true (Status ativo/inativo)
```

#### **2. Informações de Contato**
```sql
contact_info        JSONB       DEFAULT '{}' (Estrutura flexível para contatos)
```

**Estrutura do JSONB `contact_info`:**
```json
{
  "phone": "string (opcional)",
  "whatsapp": "string (opcional)",
  "email": "string (opcional)"
}
```

#### **3. Dados Comerciais e Logísticos**
```sql
products_supplied     TEXT[]      DEFAULT '{}' (Array de produtos fornecidos)
payment_methods       TEXT[]      DEFAULT '{}' (Array de formas de pagamento)
delivery_time         TEXT        NULLABLE (Prazo de entrega típico)
minimum_order_value   NUMERIC     DEFAULT 0 (Valor mínimo de pedido)
notes                 TEXT        NULLABLE (Observações gerais)
```

## Análise dos Dados do CSV

### **Total de Fornecedores:** 20 registros

#### **Distribuição por Tipo de Contato:**
- **Aplicativo:** 7 fornecedores (35%) - Ambev, Philips, Sousa Cruz, Heineken, Itaipava, Calaça, Coca Cola, Comercial Grande Mix
- **Loja Física:** 6 fornecedores (30%) - Atento, Atacadão, Melo Bebidas, Castelo Bebidas, Mesquita
- **Telefone/WhatsApp:** 3 fornecedores (15%) - General, Mondelez, Alberto Belesso
- **Site:** 2 fornecedores (10%) - Philips, Sousa Cruz
- **Sem Informação:** 2 fornecedores (10%) - Comercial Bolsão, Casa Di Conti

#### **Principais Categorias de Produtos:**
1. **Cervejas e Refrigerantes:** 12 fornecedores (60%)
2. **Tabacaria/Cigarros:** 6 fornecedores (30%)
3. **Bebidas Diversas:** 5 fornecedores (25%)
4. **Doces:** 1 fornecedor (5%)
5. **Carvão:** 1 fornecedor (5%)
6. **Vinhos:** 1 fornecedor (5%)

#### **Prazos de Entrega Típicos:**
- **24 horas:** 8 fornecedores (40%)
- **Retirada na loja:** 5 fornecedores (25%)
- **2-3 dias:** 4 fornecedores (20%)
- **48 horas:** 1 fornecedor (5%)
- **Não informado:** 2 fornecedores (10%)

#### **Formas de Pagamento Mais Aceitas:**
1. **PIX:** 14 fornecedores (70%)
2. **Dinheiro:** 9 fornecedores (45%)
3. **Boleto:** 8 fornecedores (40%)
4. **Cartão:** 7 fornecedores (35%)

#### **Valores Mínimos de Pedido:**
- **R$ 100:** 7 fornecedores (35%)
- **R$ 200:** 3 fornecedores (15%)
- **Sem valor mínimo:** 5 fornecedores (25%)
- **Não informado:** 5 fornecedores (25%)

## Padrões e Opções do Sistema

### **Formas de Pagamento Padronizadas:**
```typescript
export const PAYMENT_METHODS_OPTIONS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de Débito' },
  { value: 'cartao_credito', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cheque', label: 'Cheque' },
];
```

### **Opções de Prazo de Entrega:**
```typescript
export const DELIVERY_TIME_OPTIONS = [
  { value: '24h', label: '24 horas' },
  { value: '2-3_dias', label: '2-3 dias' },
  { value: '1_semana', label: '1 semana' },
  { value: '2_semanas', label: '2 semanas' },
  { value: '1_mes', label: '1 mês' },
  { value: 'sob_consulta', label: 'Sob consulta' },
];
```

## Características Especiais da Implementação

### **1. Flexibilidade de Contato:**
- O campo `contact_info` em JSONB permite armazenar múltiplos tipos de contato
- Suporte a telefone, WhatsApp e email em uma única estrutura

### **2. Arrays para Múltiplos Valores:**
- `products_supplied`: Array permite múltiplas categorias de produtos por fornecedor
- `payment_methods`: Array permite múltiplas formas de pagamento aceitas

### **3. Sistema de Auditoria:**
- Timestamps automáticos para created_at e updated_at
- Campo created_by para rastreabilidade

### **4. Status de Ativação:**
- Campo `is_active` permite desativar fornecedores sem excluir dados históricos

## Observações sobre Qualidade dos Dados

### **Problemas Identificados no CSV:**
1. **Dados Incompletos:** 2 fornecedores sem informações completas
2. **Formatos Inconsistentes:** Valores mínimos misturados ("R$ 100", "Sem valor minimo")
3. **Contatos Diversos:** Tipos de contato muito variados (aplicativo, site, loja, telefone)

### **Recomendações de Limpeza:**
1. **Padronizar valores mínimos:** Converter "Sem valor minimo" para 0
2. **Estruturar contatos:** Separar informações de contato em campos específicos
3. **Normalizar produtos:** Criar categorias consistentes
4. **Validar dados obrigatórios:** Garantir company_name sempre preenchido

## Status do Sistema

### **✅ Implementado:**
- Estrutura da tabela completa
- Types TypeScript definidos
- Hooks para operações CRUD
- Interface visual com componentes v2.0.0
- Sistema de filtros e busca
- Cards visuais para exibição
- Formulário de cadastro/edição

### **📋 Funcionalidades Disponíveis:**
- Cadastro de novos fornecedores
- Edição de fornecedores existentes
- Listagem com paginação
- Filtros por produtos, forma de pagamento, valor mínimo
- Busca por nome da empresa
- Estatísticas de fornecedores
- Sistema de status ativo/inativo

## Conclusão

O sistema de fornecedores está completamente implementado e pronto para receber os dados do CSV após a limpeza e padronização necessárias. A estrutura da tabela é flexível e robusta, permitindo expansões futuras mantendo a compatibilidade com os dados existentes.