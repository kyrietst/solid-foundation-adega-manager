# Estrutura das Colunas - Sistema de Clientes

## Análise da Base de Dados Atual

### **Estrutura da Tabela `customers` (Principal)**

| Coluna | Tipo | Nulável | Padrão | Descrição |
|--------|------|---------|--------|-----------|
| `id` | uuid | NÃO | `uuid_generate_v4()` | Identificador único do cliente |
| `name` | text | NÃO | - | Nome completo do cliente |
| `email` | text | SIM | - | Email do cliente |
| `phone` | text | SIM | - | Telefone de contato |
| `address` | jsonb | SIM | - | Endereço estruturado em JSON |
| `notes` | text | SIM | - | Observações sobre o cliente |
| `created_at` | timestamptz | NÃO | `now()` | Data de criação do registro |
| `updated_at` | timestamptz | NÃO | `now()` | Data da última atualização |
| `birthday` | date | SIM | - | Data de nascimento |
| `contact_preference` | text | SIM | - | Preferência de contato |
| `contact_permission` | boolean | SIM | `false` | Permissão para contato |
| `first_purchase_date` | timestamp | SIM | - | Data da primeira compra |
| `last_purchase_date` | timestamp | SIM | - | Data da última compra |
| `purchase_frequency` | text | SIM | - | Frequência de compra |
| `lifetime_value` | numeric | SIM | `0` | Valor total gasto pelo cliente |
| `favorite_category` | text | SIM | - | Categoria preferida de produtos |
| `favorite_product` | uuid | SIM | - | ID do produto favorito |
| `segment` | text | SIM | - | Segmentação do cliente |
| `tags` | jsonb | SIM | `[]` | Tags do cliente em JSON |

### **Tabelas Relacionadas (Sistema CRM)**

#### **`customer_events`** - Eventos Automatizados
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador do evento |
| `customer_id` | uuid | Referência ao cliente |
| `source` | text | Fonte do evento (sale, interaction, etc.) |
| `source_id` | uuid | ID da fonte |
| `payload` | jsonb | Dados do evento |
| `created_at` | timestamptz | Timestamp do evento |

#### **`customer_history`** - Histórico Detalhado
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador do histórico |
| `customer_id` | uuid | Referência ao cliente |
| `type` | text | Tipo do registro (purchase, contact, etc.) |
| `origin_id` | uuid | ID de origem |
| `value` | numeric | Valor monetário associado |
| `description` | text | Descrição do evento |
| `created_at` | timestamptz | Data do registro |

#### **`customer_insights`** - IA e Análises
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador do insight |
| `customer_id` | uuid | Referência ao cliente |
| `insight_type` | text | Tipo do insight |
| `insight_value` | text | Valor/descrição do insight |
| `confidence` | numeric | Nível de confiança (0-1) |
| `is_active` | boolean | Se o insight está ativo |
| `created_at` | timestamp | Data de geração |

#### **`customer_interactions`** - Interações Manuais
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | uuid | Identificador da interação |
| `customer_id` | uuid | Referência ao cliente |
| `interaction_type` | text | Tipo de interação |
| `description` | text | Descrição da interação |
| `associated_sale_id` | uuid | Venda associada (se houver) |
| `created_by` | uuid | Usuário que criou |
| `created_at` | timestamp | Data da interação |

---

## Análise dos Dados CSV de Clientes

### **Estrutura do Arquivo CSV**
- **Arquivo:** `TAREFA 1 - ADEGA - Base de Clientes.csv`
- **Encoding:** UTF-8
- **Separador:** Vírgula (,)
- **Total de Registros:** 95 clientes (header + 94 registros de dados)

### **Colunas do CSV**
| Coluna CSV | Tipo de Dados | Exemplo | Observações |
|------------|---------------|---------|-------------|
| `Nome do Cliente` | Text | "Alessandro", "Ana" | Obrigatório |
| `Telefone` | Text | "11 94819-1219" | Formato brasileiro, alguns vazios |
| `Endereço` | Text | "Rua José Cardoso sigueira 205" | Endereço completo |
| `Última Compra` | Date | "03/05/2025" | Formato DD/MM/YYYY |
| `Frequência` | Text | "Semanal", "Quinzenal" | Campo livre, muitos vazios |

### **Análise Estatística dos Dados CSV**

#### **1. Distribuição de Nomes**
- **Total:** 94 clientes únicos
- **Nomes duplicados identificados:**
  - Andressa (2 registros - linhas 4 e 5)
  - Fernanda (2 registros - linhas 37 e 38)  
  - Guilherme (2 registros - linhas 42 e 43)
  - Larissa (2 registros - linhas 55 e 56)
  - Rafaela (2 registros - linhas 76 e 77)
  - Viviane (2 registros - linhas 89 e 90)

#### **2. Análise de Telefones**
- **Com telefone:** 92 registros (97.9%)
- **Sem telefone:** 2 registros (Jacaré e Léo)
- **Formato padrão:** "11 XXXXX-XXXX" (São Paulo)
- **DDD diferentes:** 11 (maioria), 71, 88 (alguns casos)
- **Caracteres especiais:** Alguns números com caracteres não-ASCII

#### **3. Análise de Endereços**
- **Com endereço:** 93 registros (98.9%)
- **Sem endereço:** 1 registro (Léo)
- **Padrão:** Rua/Avenida + Número
- **Quebras de linha:** Alguns endereços com quebras (ex: linha 14-15, 17-18, 25-26, 93-94)

#### **4. Análise de Datas (Última Compra)**
- **Com data:** 93 registros (98.9%)
- **Sem data:** 1 registro (Léo)
- **Formato:** DD/MM/YYYY
- **Range temporal:** 02/03/2025 a 26/07/2025
- **Data mais antiga:** 01/06/2024 (Marcos)

#### **5. Análise de Frequência**
- **Com frequência especificada:** 6 registros (6.4%)
- **Frequências identificadas:**
  - "Primeira compra" (2 registros)
  - "Semanal" (3 registros)
  - "Quinzenal" (1 registro)
- **Campo em branco:** 88 registros (93.6%)

### **Problemas Identificados no CSV**

#### **🔴 Críticos**
1. **Dados incompletos:** Léo (linha 57) com todos os campos vazios exceto nome
2. **Quebras de linha indevidas:** 4 registros com endereços quebrados
3. **Nomes duplicados:** 6 pares de nomes iguais com dados diferentes

#### **🟡 Atenção**
1. **Telefones ausentes:** 2 registros sem telefone
2. **Caracteres especiais:** Alguns números com formatação inconsistente
3. **Frequência não padronizada:** Campo livre sem padrão definido
4. **Inconsistência temporal:** Uma data de 2024 entre dados de 2025

### **Estatísticas Finais**
- **Total de Clientes:** 94 registros válidos
- **Registros completos:** 88 (93.6%)
- **Registros com problemas:** 6 (6.4%)
- **Taxa de preenchimento por campo:**
  - Nome: 100%
  - Telefone: 97.9%
  - Endereço: 98.9%
  - Última Compra: 98.9%
  - Frequência: 6.4%

### **Recomendações para Importação**
1. **Tratar registros duplicados** com merge inteligente
2. **Normalizar telefones** para formato padrão brasileiro  
3. **Corrigir endereços com quebras** de linha
4. **Validar e ajustar datas** inconsistentes
5. **Padronizar campo frequência** ou criar sistema de classificação automática
6. **Verificar registro de Léo** (dados incompletos)