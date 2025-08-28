# 📋 TODO LIST - Gestão de Despesas Operacionais

## 🎯 **Objetivo**
Criar sistema completo de gestão de despesas operacionais para cálculo preciso de KPIs financeiras e controle total de gastos da adega.

---

## 📅 **FASE 2 - Gestão de Despesas (Implementar após correções KPIs)**

### **1. 🗂️ Estrutura de Dados**

#### **1.1 Criar Tabela `operational_expenses`** ✅
- [x] **Schema SQL**
  - [x] `id` (UUID, primary key)
  - [x] `category_id` (VARCHAR, categoria da despesa)
  - [x] `subcategory` (VARCHAR, opcional)
  - [x] `description` (TEXT, descrição da despesa)
  - [x] `amount` (DECIMAL, valor da despesa)
  - [x] `expense_date` (DATE, data da despesa)
  - [x] `payment_method` (VARCHAR, forma de pagamento)
  - [x] `supplier_vendor` (VARCHAR, fornecedor)
  - [x] `receipt_url` (VARCHAR, link para comprovante)
  - [x] `is_recurring` (BOOLEAN, despesa recorrente)
  - [x] `recurring_frequency` (VARCHAR, mensal/trimestral/anual)
  - [x] `budget_category` (VARCHAR, categoria orçamentária)
  - [x] `created_by` (UUID, usuário que criou)
  - [x] `created_at` (TIMESTAMP)
  - [x] `updated_at` (TIMESTAMP)

#### **1.2 Criar Tabela `expense_categories`** ✅
- [x] **Categorias Pré-definidas**
  - [x] `rent` - Aluguel e Condomínio
  - [x] `utilities` - Energia, Água, Internet
  - [x] `salaries` - Salários e Encargos
  - [x] `taxes` - Impostos e Licenças
  - [x] `marketing` - Marketing e Publicidade
  - [x] `maintenance` - Manutenção e Limpeza
  - [x] `delivery` - Combustível e Entrega
  - [x] `insurance` - Seguros
  - [x] `accounting` - Contabilidade
  - [x] `supplies` - Material de Escritório
  - [x] `other` - Outras Despesas

#### **1.3 Criar Tabela `expense_budgets`** ✅
- [x] **Orçamento por Categoria**
  - [x] `category_id` (VARCHAR)
  - [x] `month_year` (DATE, primeiro dia do mês)
  - [x] `budgeted_amount` (DECIMAL, valor orçado)
  - [x] `actual_amount` (DECIMAL, calculado automaticamente)
  - [x] `variance` (DECIMAL, diferença orçado vs real)
  - [x] `created_by` (UUID)
  - [x] `created_at`, `updated_at`

### **2. 🔐 Políticas de Segurança (RLS)** ✅

#### **2.1 RLS para `operational_expenses`** ✅
- [x] **Admin**: Full access
- [x] **Employee**: Read only (visualizar relatórios)
- [x] **Delivery**: No access

#### **2.2 RLS para `expense_categories` e `expense_budgets`** ✅
- [x] **Admin**: Full access
- [x] **Employee**: Read only
- [x] **Delivery**: No access

### **3. 🎨 Interface Frontend**

#### **3.1 Página Principal: "Gestão de Despesas"** ✅
- [x] **Layout Responsivo**
  - [x] Header com KPIs resumo do mês
  - [x] Tabs: Despesas | Orçamento | Relatórios
  - [x] Filtros por período e categoria

#### **3.2 Tab "Despesas"** ✅
- [x] **Lista de Despesas**
  - [x] Tabela com paginação
  - [x] Filtros: categoria, período, valor
  - [x] Busca por descrição/fornecedor
  - [x] Ações: editar, excluir, ver comprovante
- [x] **Modal "Nova Despesa"**
  - [x] Form com todos os campos
  - [ ] Upload de comprovante - Pendente
  - [x] Validação de dados
  - [ ] Preview de impacto no orçamento - Pendente
- [x] **Modal "Editar Despesa"**
  - [x] Pre-populado com dados existentes
  - [ ] Histórico de alterações - Pendente

#### **3.3 Tab "Orçamento"** ✅
- [x] **Configuração Orçamentária**
  - [x] Orçamento por categoria/mês
  - [x] Comparativo: Orçado vs Realizado
  - [x] Gráfico de barras por categoria
  - [x] Alertas de estouro de orçamento
- [x] **Projeções**
  - [x] Tendência de gastos
  - [x] Previsão para fim do mês
  - [ ] Sugestões de economia - Pendente

#### **3.4 Tab "Relatórios"** ✅
- [x] **Relatórios Financeiros**
  - [ ] DRE (Demonstrativo de Resultado) - Pendente
  - [x] Gastos por categoria (gráfico pizza)
  - [x] Evolução temporal (gráfico linha)
  - [x] Comparativo período anterior
- [x] **Exportações**
  - [ ] PDF para contabilidade - Pendente
  - [ ] CSV para análise - Pendente
  - [ ] Excel com gráficos - Pendente

### **4. 🔧 Funcionalidades Backend**

#### **4.1 CRUD de Despesas** ✅
- [x] **Create**: Nova despesa com validações
- [x] **Read**: Lista com filtros e paginação
- [x] **Update**: Edição com log de alterações
- [x] **Delete**: Soft delete com auditoria

#### **4.2 Upload de Comprovantes**
- [ ] **Storage Supabase**
  - [ ] Upload de imagens (JPG, PNG)
  - [ ] Upload de PDFs
  - [ ] Compressão automática
  - [ ] URL segura de acesso
- [ ] **Validações**
  - [ ] Tamanho máximo (5MB)
  - [ ] Tipos permitidos
  - [ ] Scan de vírus (se necessário)

#### **4.3 Cálculos Automáticos** ✅
- [x] **Stored Procedures**
  - [x] `get_monthly_expenses(month, year, category?)`
  - [x] `get_expense_summary(start_date, end_date)`
  - [x] `calculate_budget_variance(month, year)`
  - [ ] `get_expense_trends(months)` - Pendente

#### **4.4 Sistema de Alertas**
- [ ] **Alertas Automáticos**
  - [ ] Orçamento 80% utilizado
  - [ ] Orçamento estourado
  - [ ] Despesa incomum (> 2x média)
  - [ ] Despesa recorrente não lançada

### **5. 🔄 Integração com KPIs Existentes**

#### **5.1 Atualizar `useDashboardData.ts`**
- [ ] **Nova função `getOperationalExpenses()`**
- [ ] **Integrar despesas reais no cálculo**
- [ ] **Separar COGS de OpEx claramente**
- [ ] **Calcular margens corretas**

#### **5.2 Atualizar Componentes Dashboard**
- [ ] **Novos cards de KPIs**
  - [ ] Total OpEx do mês
  - [ ] Maior categoria de gasto
  - [ ] Variação vs orçamento
  - [ ] Margem líquida real
- [ ] **Gráficos aprimorados**
  - [ ] OpEx vs Revenue
  - [ ] Breakdown de custos
  - [ ] Tendência de gastos

#### **5.3 Novos Relatórios Financeiros**
- [ ] **DRE Completa**
  - [ ] Receita Bruta
  - [ ] (-) COGS
  - [ ] (=) Lucro Bruto
  - [ ] (-) Despesas Operacionais (detalhadas)
  - [ ] (=) Lucro Líquido
- [ ] **Análise de Margens**
  - [ ] Margem bruta vs líquida
  - [ ] Evolution temporal
  - [ ] Benchmarks do setor

### **6. 🧪 Testes e Validação**

#### **6.1 Testes de Funcionalidade**
- [ ] **CRUD completo** de despesas
- [ ] **Upload e visualização** de comprovantes
- [ ] **Cálculos automáticos** de orçamento
- [ ] **Relatórios e exportações**

#### **6.2 Testes de Integração**
- [ ] **KPIs atualizadas** com despesas reais
- [ ] **Dashboard responsivo** com novos dados
- [ ] **Permissões RLS** funcionando
- [ ] **Performance** com muitos registros

#### **6.3 Testes com Dados Reais**
- [ ] **Importar despesas históricas** (se disponível)
- [ ] **Validar cálculos** com contabilidade
- [ ] **Comparar** com método atual
- [ ] **Treinar usuário** admin

### **7. 📚 Documentação**

#### **7.1 Documentação Técnica**
- [ ] **Schema do banco** de dados
- [ ] **APIs endpoints** disponíveis
- [ ] **Componentes** React criados
- [ ] **Stored procedures** SQL

#### **7.2 Manual do Usuário**
- [ ] **Guia de uso** da página
- [ ] **Como cadastrar** despesas
- [ ] **Como configurar** orçamento
- [ ] **Como interpretar** relatórios

#### **7.3 Guia de Migração**
- [ ] **Como migrar** de planilhas
- [ ] **Categorização** recomendada
- [ ] **Melhores práticas** de uso

---

## 🎯 **Cronograma Sugerido**

### **Semana 1-2: Estrutura**
- Database schema e RLS
- CRUD básico backend
- Tela principal frontend

### **Semana 3-4: Funcionalidades**
- Upload de comprovantes
- Sistema de orçamento
- Integração com KPIs

### **Semana 5: Relatórios e Testes**
- Relatórios avançados
- Testes completos
- Documentação

### **Semana 6: Deploy e Treinamento**
- Deploy em produção
- Migração de dados
- Treinamento do usuário

---

## ✅ **Critérios de Sucesso**

1. ✅ **Funcionalidade**: Todos os CRUDs funcionando
2. ✅ **Integração**: KPIs calculadas com dados reais
3. ✅ **Usabilidade**: Interface intuitiva para admin
4. ✅ **Performance**: Carregamento < 2s
5. ✅ **Segurança**: RLS implementada corretamente
6. ✅ **Precisão**: Cálculos financeiros 100% corretos

---

*TODO List criada em: 27/08/2025*  
*Para implementação após correção das KPIs críticas*  
*Estimativa total: 6 semanas de desenvolvimento*