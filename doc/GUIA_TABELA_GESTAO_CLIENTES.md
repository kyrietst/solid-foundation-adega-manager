# 📊 Guia de Interpretação: Tabela de Gestão de Clientes

## 📋 Visão Geral

A **Tabela de Gestão de Clientes** é o coração do sistema CRM da Adega Manager, apresentando uma visão consolidada e inteligente de todos os clientes cadastrados. Esta tabela combina dados básicos inseridos no cadastro com informações calculadas automaticamente pelo sistema através de algoritmos avançados de análise de comportamento.

---

## 🔍 Anatomia da Tabela

### 📊 **13 Colunas Principais**

| Coluna | Tipo | Origem | Descrição |
|--------|------|--------|-----------|
| **Cliente** | Input Manual | Cadastro direto | Nome do cliente e avatar gerado |
| **Categoria Favorita** | Calculado | Sistema inteligente | Categoria mais comprada automaticamente |
| **Segmento** | Calculado | Algoritmo CRM | Classificação baseada em comportamento de compra |
| **Método Preferido** | Calculado | Análise de vendas | Forma de pagamento mais utilizada |
| **Última Compra** | Calculado | Sistema de vendas | Data da última transação |
| **Insights de IA** | Calculado | Machine Learning | Análises preditivas sobre o cliente |
| **Status** | Calculado | Algoritmo de engajamento | Classificação do nível de atividade |
| **Cidade** | Input Manual | Cadastro de endereço | Localização extraída do endereço |
| **Próximo Aniversário** | Calculado | Data de nascimento | Contagem automática para datas especiais |
| **LGPD** | Input Manual | Consentimento explícito | Status de autorização para contato |
| **Completude** | Calculado | Análise de dados | Percentual de preenchimento do perfil |
| **Último Contato** | Calculado | Interações + Vendas | Última interação registrada |
| **Valor em Aberto** | Calculado | Sistema financeiro | Saldo devedor do cliente |

---

## 🎯 Detalhamento das Colunas

### 1. **Cliente** 👤
- **Origem**: Campo "nome" no formulário de cadastro
- **Apresentação**: Avatar colorido + nome completo + indicadores visuais
- **Recursos**:
  - Avatar com inicial do nome em gradiente dourado
  - Link clicável para perfil completo
  - Indicadores de campos críticos para relatórios

### 2. **Categoria Favorita** 🏷️
- **Como é calculado**: 
  - Sistema analisa todas as compras do cliente
  - Identifica a categoria mais frequente em suas transações
  - Atualizada automaticamente a cada nova compra
- **Valores**: Categorias de produtos da adega (Vinhos, Espumantes, Bebidas, etc.)
- **Exibição**: Texto centralizado, "Não definida" se sem compras

### 3. **Segmento** 🎖️
- **Algoritmo**: Baseado em LTV (Lifetime Value), frequência e recência
- **Segmentos disponíveis**:
  - **Fiel - Ouro**: Alto valor, alta frequência (LTV > R$ 1.000)
  - **Fiel - Prata**: Valor médio, frequência regular (LTV > R$ 500)
  - **Regular**: Compras esporádicas mas constantes
  - **Primeira Compra**: Cliente recém-adquirido
  - **Em Risco**: Sem compras há mais de 90 dias
  - **Inativo**: Sem atividade há mais de 6 meses
  - **Novo**: Cadastrado mas sem compras

### 4. **Método Preferido** 💳
- **Cálculo**: Método mais utilizado nas últimas 10 transações
- **Mapeamento**:
  - `PIX` → PIX
  - `card` → Cartão
  - `cash` → Dinheiro
  - `credit` → Crédito
  - `debit` → Débito
  - `bank_transfer` → Transferência

### 5. **Última Compra** 📅
- **Formato inteligente**:
  - "Hoje", "Ontem" para compras recentes
  - "X dias atrás" para período curto
  - "X semanas/meses atrás" para período médio
  - Data completa para compras antigas
- **Ordenação**: Padrão decrescente (mais recentes primeiro)

### 6. **Insights de IA** 🧠
- **Sistema de Machine Learning**:
  - **Verde (Alto)**: Confiança > 90% - Insights altamente precisos
  - **Amarelo (Médio)**: Confiança 70-90% - Insights confiáveis
  - **Vermelho (Baixo)**: Confiança < 70% - Insights preliminares
- **Tooltip mostra**: Detalhes dos insights e recomendações
- **Badge especial**: "Sem insights" para clientes sem dados suficientes

### 7. **Status** 🚦
- **Algoritmo de Engajamento**:
  - **VIP** (Dourado): Clientes de alto valor com compras frequentes
  - **Ativo** (Verde): Compras regulares, engajamento alto
  - **Regular** (Amarelo): Padrão normal de compras
  - **Em Risco** (Laranja): Sinais de desengajamento
  - **Inativo** (Cinza): Sem atividade prolongada
  - **Reativar** (Vermelho): Candidatos a campanhas de reativação

### 8. **Cidade** 🌍
- **Origem**: Campo "endereço.cidade" do cadastro
- **Uso**: Análises geográficas, rotas de entrega, campanhas regionais
- **Formato**: Nome da cidade ou "Não informada"

### 9. **Próximo Aniversário** 🎂
- **Cálculo automático**: Baseado na data de nascimento do cadastro
- **Formatos especiais**:
  - "Hoje! 🎉" - Aniversário hoje
  - "Amanhã 🎂" - Aniversário amanhã
  - "X dias 🎈" - Próximos 7 dias
  - Data normal para períodos maiores
- **Uso**: Campanhas de aniversário, personalização

### 10. **LGPD** ⚖️
- **Origem**: Checkbox explícito no cadastro
- **Estados**:
  - **Verde "LGPD ✓"**: Cliente autorizou contato
  - **Vermelho "Pendente"**: Sem autorização (badge pulsante)
- **Importância**: Compliance legal para comunicações

### 11. **Completude** 📈
- **Algoritmo de Qualidade**:
  ```
  Campos Obrigatórios (peso alto):
  - Nome (15 pontos)
  - Telefone (15 pontos) 
  - LGPD (15 pontos)
  
  Campos Importantes (peso médio):
  - Email (10 pontos)
  - Endereço (10 pontos)
  - Aniversário (10 pontos)
  - Preferência de contato (10 pontos)
  
  Campos Extras (peso baixo):
  - Observações (5 pontos)
  ```
- **Visualização**: Barra de progresso + percentual
- **Tooltip**: Lista campos ausentes e sugestões

### 12. **Último Contato** 📞
- **Fontes de dados**:
  - Interações registradas (customer_interactions)
  - Vendas realizadas (sales)
  - Sistema pega a mais recente entre ambas
- **Indicadores visuais**:
  - **Verde**: Contato há menos de 7 dias
  - **Amarelo**: Entre 7-30 dias
  - **Vermelho**: Mais de 30 dias

### 13. **Valor em Aberto** 💰
- **Origem**: Sistema financeiro (accounts_receivable)
- **Cores**:
  - **Cinza**: R$ 0,00 (sem débitos)
  - **Amarelo**: Até R$ 100,00
  - **Vermelho**: Acima de R$ 100,00
- **Uso**: Cobrança, análise de inadimplência

---

## 🔄 **Processo de Transformação de Dados**

### **Durante o Cadastro, o usuário informa apenas:**
1. **Nome** (obrigatório)
2. **Telefone** (obrigatório)
3. **Email** (opcional)
4. **Endereço completo** (opcional)
5. **Data de nascimento** (opcional)
6. **Observações** (opcional)
7. **Autorização LGPD** (checkbox obrigatório)
8. **Preferência de contato** (opcional)

### **O Sistema Calcula Automaticamente:**
- **Categoria Favorita**: Análise das compras realizadas
- **Segmento**: Algoritmo baseado em LTV, RFM (Recência, Frequência, Valor Monetário)
- **Método Preferido**: Estatística dos pagamentos utilizados
- **Última Compra**: Consulta na tabela de vendas
- **Insights de IA**: Machine Learning baseado em padrões comportamentais
- **Status**: Algoritmo de engajamento considerando múltiplos fatores
- **Próximo Aniversário**: Cálculo temporal baseado na data de nascimento
- **Completude**: Análise de qualidade dos dados com pesos diferenciados
- **Último Contato**: Consulta cruzada em interações e vendas
- **Valor em Aberto**: Integração com sistema financeiro

---

## ⚡ **Funcionalidades Avançadas**

### **🔍 Sistema de Filtros**
- **Segmento**: Filtra por classificação CRM
- **Status**: Filtra por nível de engajamento  
- **Método de Pagamento**: Filtra por preferência de pagamento
- **Última Compra**: 7 dias, 30 dias, 90 dias, 180 dias, +180 dias
- **Aniversário**: Hoje, esta semana, este mês, próximos 3 meses
- **Busca Inteligente**: Nome do cliente ou categoria favorita

### **📊 Ordenação Dinâmica**
Colunas ordenáveis com indicadores visuais:
- Cliente (A-Z / Z-A)
- Última Compra (mais recente / mais antigo)
- Insights (maior/menor confiança)
- Status (prioridade de engajamento)
- Cidade (alfabética)
- Dias para Aniversário (mais próximo)
- Completude (maior/menor percentual)
- Último Contato (mais recente)
- Valor em Aberto (maior/menor valor)

### **👁️ Visibilidade de Colunas**
- **13 colunas disponíveis** com controle individual
- **Dropdown de seleção** para personalizar visualização
- **Estado persistente** da configuração do usuário

### **🎨 Indicadores Visuais Inteligentes**
- **Avatars personalizados** com inicial em gradiente
- **Badges com contraste otimizado** para melhor legibilidade  
- **Cores semânticas** baseadas no sistema Adega Wine Cellar
- **Animações sutis** para hover e interações
- **Tooltips informativos** com detalhes completos

---

## 🎯 **Casos de Uso Principais**

### **Para Vendedores:**
- Identificar clientes VIP e ativos para priorização
- Verificar método de pagamento preferido
- Consultar última compra para timing de abordagem
- Analisar completude para solicitar dados em falta

### **Para Marketing:**
- Segmentar campanhas baseadas no status do cliente
- Planejar ações de aniversário usando a coluna respectiva
- Identificar clientes em risco para campanhas de reativação
- Usar insights de IA para personalização de ofertas

### **Para Gestores:**
- Monitorar saúde geral da base de clientes
- Analisar distribuição geográfica (coluna Cidade)
- Acompanhar inadimplência (Valor em Aberto)
- Verificar qualidade dos dados (Completude)

### **Para Compliance:**
- Monitorar status LGPD de todos os clientes
- Identificar clientes sem autorização de contato
- Gerar relatórios de conformidade legal

---

## 🔧 **Manutenção e Atualização**

### **Automática (Sistema):**
- Cálculos de segmentação atualizados a cada venda
- Status de clientes reavaliado diariamente
- Insights de IA processados semanalmente
- Completude recalculada em tempo real

### **Manual (Usuário):**
- Dados de cadastro podem ser editados a qualquer momento
- Alterações refletem imediatamente nos campos calculados
- LGPD deve ser atualizado conforme necessário
- Observações podem ser adicionadas/modificadas

---

## 📈 **Métricas de Qualidade**

### **Completude Ideal:**
- **80-100%**: Perfil excelente (verde)
- **60-79%**: Perfil bom (amarelo)
- **0-59%**: Perfil incompleto (vermelho)

### **Engajamento Saudável:**
- **30% VIP/Ativo**: Base engajada
- **40% Regular**: Comportamento normal
- **20% Em Risco**: Necessita atenção
- **10% Inativo**: Para reativação

### **Compliance LGPD:**
- **Meta**: 100% dos clientes com status definido
- **Crítico**: Nenhum cliente com "Pendente"

---

## 🎨 **Legenda Visual**

### **Cores dos Status:**
- 🟡 **Dourado**: VIP (alta prioridade)
- 🟢 **Verde**: Ativo (engajado)
- 🟨 **Amarelo**: Regular (normal)
- 🟠 **Laranja**: Em Risco (atenção)
- 🔴 **Vermelho**: Reativar (urgente)
- ⚫ **Cinza**: Inativo (baixa prioridade)

### **Badges de Insights:**
- 🟢 **Verde**: Alta confiança (>90%)
- 🟨 **Amarelo**: Média confiança (70-90%)
- 🔴 **Vermelho**: Baixa confiança (<70%)

### **Indicadores LGPD:**
- ✅ **"LGPD ✓"**: Autorizado para contato
- ❌ **"Pendente"**: Sem autorização (pulsante)

---

**💡 Dica**: Use a combinação de filtros e ordenação para criar visualizações específicas da sua base de clientes. Por exemplo: "Clientes VIP que não compram há mais de 30 dias" ou "Aniversariantes da semana com alta completude de perfil".

---

*Este guia é uma ferramenta viva e deve ser atualizado conforme evoluções do sistema. Última atualização: Agosto 2025.*