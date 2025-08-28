# 📋 TODO LIST - Gestão de Despesas Operacionais

## 🎯 **Objetivo**
Criar sistema completo de gestão de despesas operacionais para cálculo preciso de KPIs financeiras e controle total de gastos da adega.

---

## 📅 **FASE 2 - Gestão de Despesas (Implementar após correções KPIs)**

### **1. 🗂️ Estrutura de Dados**

#### **1.1 Criar Tabela `operational_expenses`**
- [ ] **Schema SQL**
  - [ ] `id` (UUID, primary key)
  - [ ] `category_id` (VARCHAR, categoria da despesa)
  - [ ] `subcategory` (VARCHAR, opcional)
  - [ ] `description` (TEXT, descrição da despesa)
  - [ ] `amount` (DECIMAL, valor da despesa)
  - [ ] `expense_date` (DATE, data da despesa)
  - [ ] `payment_method` (VARCHAR, forma de pagamento)
  - [ ] `supplier_vendor` (VARCHAR, fornecedor)
  - [ ] `receipt_url` (VARCHAR, link para comprovante)
  - [ ] `is_recurring` (BOOLEAN, despesa recorrente)
  - [ ] `recurring_frequency` (VARCHAR, mensal/trimestral/anual)
  - [ ] `budget_category` (VARCHAR, categoria orçamentária)
  - [ ] `created_by` (UUID, usuário que criou)
  - [ ] `created_at` (TIMESTAMP)
  - [ ] `updated_at` (TIMESTAMP)

#### **1.2 Criar Tabela `expense_categories`**
- [ ] **Categorias Pré-definidas**
  - [ ] `rent` - Aluguel e Condomínio
  - [ ] `utilities` - Energia, Água, Internet
  - [ ] `salaries` - Salários e Encargos
  - [ ] `taxes` - Impostos e Licenças
  - [ ] `marketing` - Marketing e Publicidade
  - [ ] `maintenance` - Manutenção e Limpeza
  - [ ] `delivery` - Combustível e Entrega
  - [ ] `insurance` - Seguros
  - [ ] `accounting` - Contabilidade
  - [ ] `supplies` - Material de Escritório
  - [ ] `other` - Outras Despesas

#### **1.3 Criar Tabela `expense_budgets`**
- [ ] **Orçamento por Categoria**
  - [ ] `category_id` (VARCHAR)
  - [ ] `month_year` (DATE, primeiro dia do mês)
  - [ ] `budgeted_amount` (DECIMAL, valor orçado)
  - [ ] `actual_amount` (DECIMAL, calculado automaticamente)
  - [ ] `variance` (DECIMAL, diferença orçado vs real)
  - [ ] `created_by` (UUID)
  - [ ] `created_at`, `updated_at`

### **2. 🔐 Políticas de Segurança (RLS)**

#### **2.1 RLS para `operational_expenses`**
- [ ] **Admin**: Full access
- [ ] **Employee**: Read only (visualizar relatórios)
- [ ] **Delivery**: No access

#### **2.2 RLS para `expense_categories` e `expense_budgets`**
- [ ] **Admin**: Full access
- [ ] **Employee**: Read only
- [ ] **Delivery**: No access

### **3. 🎨 Interface Frontend**

#### **3.1 Página Principal: "Gestão de Despesas"**
- [ ] **Layout Responsivo**
  - [ ] Header com KPIs resumo do mês
  - [ ] Tabs: Despesas | Orçamento | Relatórios
  - [ ] Filtros por período e categoria

#### **3.2 Tab "Despesas"**
- [ ] **Lista de Despesas**
  - [ ] Tabela com paginação
  - [ ] Filtros: categoria, período, valor
  - [ ] Busca por descrição/fornecedor
  - [ ] Ações: editar, excluir, ver comprovante
- [ ] **Modal "Nova Despesa"**
  - [ ] Form com todos os campos
  - [ ] Upload de comprovante
  - [ ] Validação de dados
  - [ ] Preview de impacto no orçamento
- [ ] **Modal "Editar Despesa"**
  - [ ] Pre-populado com dados existentes
  - [ ] Histórico de alterações

#### **3.3 Tab "Orçamento"**
- [ ] **Configuração Orçamentária**
  - [ ] Orçamento por categoria/mês
  - [ ] Comparativo: Orçado vs Realizado
  - [ ] Gráfico de barras por categoria
  - [ ] Alertas de estouro de orçamento
- [ ] **Projeções**
  - [ ] Tendência de gastos
  - [ ] Previsão para fim do mês
  - [ ] Sugestões de economia

#### **3.4 Tab "Relatórios"**
- [ ] **Relatórios Financeiros**
  - [ ] DRE (Demonstrativo de Resultado)
  - [ ] Gastos por categoria (gráfico pizza)
  - [ ] Evolução temporal (gráfico linha)
  - [ ] Comparativo período anterior
- [ ] **Exportações**
  - [ ] PDF para contabilidade
  - [ ] CSV para análise
  - [ ] Excel com gráficos

### **4. 🔧 Funcionalidades Backend**

#### **4.1 CRUD de Despesas**
- [ ] **Create**: Nova despesa com validações
- [ ] **Read**: Lista com filtros e paginação
- [ ] **Update**: Edição com log de alterações
- [ ] **Delete**: Soft delete com auditoria

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

#### **4.3 Cálculos Automáticos**
- [ ] **Stored Procedures**
  - [ ] `get_monthly_expenses(month, year, category?)`
  - [ ] `get_expense_summary(start_date, end_date)`
  - [ ] `calculate_budget_variance(month, year)`
  - [ ] `get_expense_trends(months)`

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