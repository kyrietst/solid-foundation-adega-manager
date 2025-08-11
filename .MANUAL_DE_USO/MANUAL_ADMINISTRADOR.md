# 📖 Manual do Administrador - Adega Manager

**Versão 2.1.0 | Sistema de Gestão de Adega Wine Cellar**
**📅 Última atualização:** 10 de agosto de 2025
**🆕 Novidades:** Analytics de Clientes Implementados

---

## 🎯 Introdução

Bem-vindo ao **Adega Manager**, seu sistema completo de gestão de adega de vinhos. Este manual foi criado especialmente para você, administrador do sistema, explicando de forma simples e prática como usar todas as funcionalidades disponíveis.

### 📋 **Status das Funcionalidades:**
- **✅ FUNCIONAL:** Recurso completamente implementado e pronto para uso
- **🚧 EM MANUTENÇÃO:** Interface pronta, aguardando integração externa (Google Maps/N8N)
- **⏳ PLANEJADO:** Funcionalidade futura em desenvolvimento

### 🔐 Acesso ao Sistema

**URL:** `http://localhost:8080` (desenvolvimento)

**Credenciais de Administrador:**
- **Email:** adm@adega.com
- **Senha:** [definida durante a instalação]

---

## 🚀 **NOVIDADES DA VERSÃO 2.1.0** ⭐

### **🆕 Principais Implementações (10 de agosto de 2025):**

#### **📊 Analytics Avançados de Clientes**
**Onde encontrar:** Clientes → Clique no nome de qualquer cliente → Aba "Analytics"

**O que foi implementado:**
- ✅ **4 gráficos profissionais** com dados reais de cada cliente
- ✅ **Gráfico de vendas mensais** mostrando evolução ao longo do tempo
- ✅ **Ranking dos 10 produtos favoritos** de cada cliente
- ✅ **Análise de padrão de compras** com intervalos entre visitas
- ✅ **Resumo estatístico completo** (total gasto, ticket médio, itens, frequência)

**Por que isso é importante para você:**
1. **Conheça melhor cada cliente:** Veja exatamente o que cada um gosta de comprar
2. **Identifique oportunidades:** Saiba quando oferecer promoções para cada cliente
3. **Planeje estoque:** Mantenha em estoque os produtos favoritos dos seus melhores clientes
4. **Melhore vendas:** Use os dados para fazer ofertas mais certeiras

#### **💼 Quick Actions Aprimorados**
**Onde encontrar:** Na página individual de cada cliente (clique no nome na lista)

**O que melhorou:**
- ✅ **WhatsApp integrado:** Mensagem personalizada abre automaticamente
- ✅ **Email pré-formatado:** Assunto e template profissional
- ✅ **Nova venda direta:** Vai para o PDV com cliente já selecionado

#### **📈 Sistema de Abas Profissional**
**8 abas organizadas** na página de cada cliente:
- ✅ **Overview:** Resumo completo (4 cards ricos + 3 métricas)
- ✅ **Compras:** Histórico completo com filtros
- ✅ **Analytics:** Gráficos profissionais (**NOVO!**)
- 🚧 **Comunicação:** Em preparação (N8N integration)
- 🚧 **Insights IA:** Em preparação (Machine Learning)
- 🚧 **Documentos:** Em preparação
- 🚧 **Configurações:** Em preparação
- 🚧 **IA & Mapas:** Em preparação (Google Maps)

### **🎯 Como Aproveitar as Novidades:**

**Para Aumentar Vendas:**
1. Vá na página individual de um cliente fiel
2. Clique na aba "Analytics"
3. Veja quais produtos ele mais compra
4. Ofereça promoções desses produtos via WhatsApp
5. Use o padrão de compras para saber quando oferecer

**Para Melhorar Atendimento:**
1. Antes de atender um cliente, abra a página dele
2. Veja no "Overview" quando foi a última compra
3. Confira na aba "Analytics" os produtos favoritos
4. Sugira produtos baseado nos dados reais

---

## 🧭 Navegação Principal - Menu Lateral

O sistema possui um **menu lateral inteligente** que se expande ao passar o mouse. Cada ícone representa uma área diferente:

### 📊 **Dashboard** (Ícone: Gráfico)
**O que é:** Visão geral de toda sua operação
**Para que serve:** Acompanhar performance em tempo real

### 🛒 **Vendas** (Ícone: Carrinho)
**O que é:** Sistema de ponto de venda (PDV)
**Para que serve:** Realizar vendas diárias

### 📦 **Estoque** (Ícone: Caixa)
**O que é:** Controle completo do inventário
**Para que serve:** Gerenciar produtos e estoque

### 👥 **Clientes** (Ícone: Pessoas)
**O que é:** Base de dados de clientes
**Para que serve:** Cadastrar e acompanhar clientes

### 📈 **CRM Dashboard** (Ícone: Pizza)
**O que é:** Análises avançadas de clientes
**Para que serve:** Entender comportamento dos clientes

### 🚚 **Delivery** (Ícone: Caminhão)
**O que é:** Gestão de entregas
**Para que serve:** Controlar entregas e entregadores

### 🔄 **Movimentações** (Ícone: Setas)
**O que é:** Histórico de movimentações de estoque
**Para que serve:** Auditoria e controle

### 🤖 **Automações** (Ícone: Robô)
**O que é:** Centro de automações futuras
**Para que serve:** Preparação para integrações

### 📊 **Relatórios** (Ícone: Gráfico de barras)
**O que é:** Relatórios detalhados
**Para que serve:** Análises profundas do negócio

### ⚙️ **Usuários** (Ícone: Configurações)
**O que é:** Gerenciamento de usuários
**Para que serve:** Controlar acessos e permissões

---

## 📊 DASHBOARD - Seu Centro de Comando

### 🎯 **O que você vê no Dashboard:**

#### **KPIs Principais (Cards Coloridos)**

**1. 💰 Vendas do Mês**
- **O que mostra:** Total vendido no mês atual
- **Como interpretar:** Valor em reais das vendas
- **Ação:** Se baixo, focar em promoções e vendas

**2. 📦 Total de Produtos**
- **O que mostra:** Quantidade de produtos cadastrados
- **Como interpretar:** Tamanho do seu catálogo
- **Ação:** Avaliar se precisa de mais variedade

**3. 👥 Clientes Ativos**
- **O que mostra:** Clientes que compraram recentemente
- **Como interpretar:** Base de clientes engajados
- **Ação:** Trabalhar retenção se número for baixo

**4. 🚚 Entregas Pendentes**
- **O que mostra:** Quantas entregas estão em andamento
- **Como interpretar:** Eficiência da logística
- **Ação:** Se alto, verificar gargalos na entrega

**5. ⚠️ Estoque Baixo**
- **O que mostra:** Produtos com estoque crítico
- **Como interpretar:** Risco de ruptura
- **Ação:** Reabastecer produtos urgentemente

**6. ⭐ NPS Score**
- **O que mostra:** Satisfação dos clientes (0-100)
- **Como interpretar:** 
  - 0-30: Ruim (clientes insatisfeitos)
  - 31-50: Regular (neutros)
  - 51-100: Excelente (promotores)
- **Ação:** Se baixo, melhorar atendimento

#### **📈 Gráficos de Análise**

**Gráfico de Vendas (Linha):**
- Mostra tendência de vendas nos últimos dias
- **Verde subindo:** Vendas crescendo ✅
- **Vermelho descendo:** Vendas caindo ⚠️

**Mix de Categorias (Pizza):**
- Proporção de vendas por tipo de produto
- Identifica quais categorias vendem mais
- Ajuda a definir estratégia de compras

**Produtos Mais Vendidos (Barras):**
- Top 5 produtos campeões
- Use para promoções e destaque
- Mantenha sempre em estoque

**Atividades Recentes:**
- Últimas ações no sistema
- Acompanha movimentação da equipe
- Detecta problemas rapidamente

---

## 🛒 VENDAS - Sistema PDV Completo

### 🎯 **Como Fazer uma Venda:**

#### **Passo 1: Selecionar Cliente**
1. Clique no campo "Buscar Cliente"
2. Digite nome ou telefone
3. Se não existir, clique "Novo Cliente"

#### **Passo 2: Adicionar Produtos**
1. Use a barra de pesquisa ou navegue por categorias
2. Clique no produto desejado
3. Escolha a quantidade no popup
4. Produto vai para o carrinho

#### **Passo 3: Revisar Carrinho**
- **Quantidade:** Ajuste se necessário
- **Descontos:** Aplique se autorizado
- **Subtotal:** Conferir valores
- **Total Geral:** Valor final

#### **Passo 4: Finalizar Venda**
1. Clique "Finalizar Venda"
2. Escolha forma de pagamento:
   - 💳 **Cartão Débito**
   - 💳 **Cartão Crédito** 
   - 💰 **Dinheiro**
   - 📱 **PIX**
   - 🏦 **Fiado** (clientes confiáveis)
3. Confirme a operação

### 🔍 **Funcionalidades Avançadas:**

**Scanner de Código de Barras:** 🚧 **EM MANUTENÇÃO**
- 🔧 Conecte um leitor USB
- 🔧 Escaneie o produto
- 🔧 Sistema encontra automaticamente

**Vendas Recentes:**
- Lista das últimas vendas
- 🚧 Reimpressão de cupons **EM MANUTENÇÃO**
- 🚧 Cancelamento (se necessário) **EM MANUTENÇÃO**

---

## 📦 ESTOQUE - Controle Total do Inventário

### 🎯 **Visão Geral da Tela:**

#### **Estatísticas Principais (Cards superiores):**

**💎 Valor Total do Estoque**
- **O que é:** Soma de todos produtos × preço
- **Para que serve:** Conhecer patrimônio em mercadorias
- **Ação:** Acompanhar crescimento ou redução

**📊 Total de Produtos**
- **O que é:** Quantidade de SKUs diferentes
- **Para que serve:** Medir variedade do catálogo
- **Ação:** Balancear variedade vs. giro

**⚠️ Produtos em Falta**
- **O que é:** Itens com estoque zerado
- **Para que serve:** Evitar perda de vendas
- **Ação:** Priorizar reposição urgente

**🔄 Giro Alto/Médio/Baixo**
- **Alto:** Produtos que vendem rápido (bom!)
- **Médio:** Vendas regulares (OK)
- **Baixo:** Produtos parados (atenção!)

### 📝 **Cadastrar Novo Produto:**

#### **Informações Básicas:**
1. **Nome:** Título claro (ex: "Vinho Tinto Casa Silva Reserva 750ml")
2. **Categoria:** Escolha adequada (Tintos, Brancos, Espumantes, etc.)
3. **Código de Barras:** Escaneie ou digite manualmente
4. **Descrição:** Detalhes que ajudam na venda

#### **Precificação:**
- **Preço de Custo:** Quanto você pagou (confidencial)
- **Preço de Venda:** Valor para o cliente
- **Margem:** Sistema calcula automaticamente
- **Promoção:** Preço especial temporário

#### **Controle de Estoque:**
- **Quantidade Atual:** Unidades em estoque
- **Estoque Mínimo:** Quando system avisar para repor
- **Localização:** Onde está guardado fisicamente

#### **Informações Técnicas:**
- **Volume:** Em ml (750ml, 1000ml, etc.)
- **Teor Alcoólico:** Percentual (12%, 13,5%, etc.)
- **Safra:** Ano de produção (se aplicável)
- **Região:** Origem geográfica

### 🔍 **Análise de Giro de Produtos:**

O sistema classifica automaticamente os produtos:

**🟢 Giro Alto (Verde):**
- Vendem rapidamente
- Mantenha sempre em estoque
- Considere aumentar quantidade

**🟡 Giro Médio (Amarelo):**
- Vendas regulares
- Estoque normal
- Monitore tendências

**🔴 Giro Baixo (Vermelho):**
- Vendem pouco
- Considere promoções
- Analise se vale manter

### 📊 **Filtros e Pesquisa:**

**Por Categoria:** Visualize apenas um tipo
**Por Giro:** Foque nos produtos problemáticos
**Por Estoque:** Veja apenas produtos em falta
**Busca:** Digite nome, código ou marca

---

## 👥 CLIENTES - CRM Empresarial Completo

### 🎯 **Tela Principal de Clientes:**

#### **Estatísticas de Clientes (Cards):**

**👥 Total de Clientes**
- **O que mostra:** Quantidade total cadastrada (91 clientes ativos)
- **Meta:** Crescimento constante

**⭐ Clientes Fiéis**
- **O que mostra:** Compradores frequentes
- **Como identificar:** Compram regularmente
- **Valor:** Foco na retenção

**💰 Valor Médio por Compra**
- **O que mostra:** Ticket médio dos clientes
- **Estratégia:** Aumentar através de sugestões

**📈 Novos Este Mês**
- **O que mostra:** Captação de novos clientes
- **Meta:** Crescimento constante da base

### 📝 **Cadastrar Novo Cliente:**

#### **Informações Essenciais:**
1. **Nome Completo:** Para personalização
2. **Telefone/WhatsApp:** Contato direto
3. **Email:** Para comunicações (opcional)
4. **Data de Nascimento:** Para campanhas de aniversário
5. **Endereço:** Para entregas

#### **Preferências:**
- **Tipos de Vinho Favoritos:** Tintos, brancos, espumantes
- **Faixa de Preço:** Para recomendações
- **Ocasiões:** Consumo próprio, presentes, eventos

#### **Segmentação Automática:**
O sistema classifica automaticamente:

**🥇 VIP/Fiel:** 
- Compras frequentes e altos valores
- Atendimento premium

**⭐ Regular:**
- Compras esporádicas
- Potencial de crescimento

**👶 Novo:**
- Primeiras compras
- Foco em fidelização

**😴 Inativo:**
- Não compra há muito tempo
- Campanhas de reativação

---

### 🆕 **NOVA FUNCIONALIDADE: Páginas Individuais de Cliente**

#### **🔗 Como Acessar:**
1. Vá para **Clientes** no menu lateral
2. Na tabela de clientes, **clique no nome** de qualquer cliente
3. Abrirá uma página completa dedicada àquele cliente

#### **💼 Quick Actions (Ações Rápidas):**
No topo da página individual, você encontra botões funcionais:

**📱 WhatsApp**
- **O que faz:** Abre WhatsApp Web com mensagem personalizada
- **Quando usar:** Para contato rápido e direto
- **Requisito:** Cliente deve ter telefone cadastrado

**📧 Email**
- **O que faz:** Abre seu cliente de email com assunto pré-formatado
- **Quando usar:** Para comunicações mais formais
- **Requisito:** Cliente deve ter email cadastrado

**🛒 Nova Venda**
- **O que faz:** Leva direto ao PDV com cliente já selecionado
- **Quando usar:** Para vendas imediatas ou telefônicas
- **Benefício:** Economiza tempo na identificação

**✏️ Editar** 🚧 **EM MANUTENÇÃO**
- **Status:** 🔧 Interface preparada, funcionalidade em desenvolvimento
- **Função:** Editar dados do cliente

### 📑 **Sistema de 8 Abas Profissionais:**

#### **📊 ABA OVERVIEW (Visão Geral)**
**Totalmente Funcional ✅**

**4 Cards Informativos Ricos:**

**💰 Card Resumo Financeiro (Verde)**
- **Valor Total (LTV):** Quanto o cliente já gastou na vida toda
- **Ticket Médio:** Valor médio por compra
- **Total de Compras:** Quantas vezes comprou
- **Cliente desde:** Data do primeiro cadastro

**📅 Card Atividade & Engajamento (Azul)**
- **Última Compra:** Data e quantos dias atrás
- **Status Inteligente:** Ativo (compra recente), Dormindo (sem comprar), Novo (primeira compra)
- **Primeira Compra:** Histórico do relacionamento

**🎯 Card Preferências & Perfil (Roxo)**
- **Categoria Favorita:** Tipo de vinho preferido
- **Produto Favorito:** Item mais comprado
- **Segmento:** Classificação automática (Fiel/Regular/Novo)

**📞 Card Contato & Comunicação (Laranja)**
- **Status do Telefone:** Se tem WhatsApp disponível
- **Status do Email:** Se pode receber emails
- **Localização:** Cidade e estado do cliente
- **Botões diretos:** WhatsApp e Email integrados

**📈 Métricas Avançadas (3 Cards):**
- **Itens por Compra:** Média de produtos que compra
- **Dias Entre Compras:** Frequência de retorno
- **Valor Mensal Projetado:** Estimativa baseada no histórico

#### **🛒 ABA COMPRAS (Histórico Completo)**
**Totalmente Funcional ✅**

**Recursos Avançados:**
- **Filtros por Período:** 30, 90, 180, 365 dias
- **Busca por Produto:** Digite nome do produto
- **Resumo Dinâmico:** Total gasto, itens comprados, ticket médio dos filtros aplicados
- **Lista Detalhada:** Cada compra com data completa, valor e lista de todos os itens

**Como usar:**
1. Escolha o período no filtro superior
2. Digite produto na busca se quiser algo específico
3. Veja o resumo calculado automaticamente
4. Analise cada compra individualmente

#### **📊 ABA ANALYTICS (Análises Avançadas)**
**Totalmente Funcional ✅ - Implementado em 10 de agosto de 2025**

**O que você encontra nesta aba:**
Esta é sua central de inteligência sobre o comportamento de compra de cada cliente individual, com **4 gráficos profissionais** alimentados pelos dados reais.

**📈 Gráfico 1: Vendas por Mês (Linha Verde)**
- **O que mostra:** Evolução das compras do cliente ao longo dos meses
- **Como interpretar:**
  - 📈 **Linha subindo:** Cliente comprando cada vez mais (ótimo sinal!)
  - 📉 **Linha descendo:** Cliente reduzindo compras (atenção!)
  - 🔄 **Linha estável:** Cliente fiel com padrão consistente
- **Dica prática:** Use para identificar sazonalidades ou mudanças no comportamento

**📊 Gráfico 2: Top 10 Produtos Mais Comprados (Barras Azuis)**
- **O que mostra:** Ranking dos produtos favoritos deste cliente específico
- **Como interpretar:**
  - **Barras maiores:** Produtos que ele ama e compra sempre
  - **Barras menores:** Produtos experimentais ou ocasionais
- **Estratégia:** Foque em ofertas nos produtos favoritos dele para garantir a venda

**📅 Gráfico 3: Padrão de Compras - Intervalos (Barras Roxas)**
- **O que mostra:** Quantos dias o cliente demora entre uma compra e outra
- **Como interpretar:**
  - **Barras baixas (poucos dias):** Cliente compra com frequência
  - **Barras altas (muitos dias):** Cliente espaça mais as compras
  - **Padrão regular:** Cliente tem rotina previsível
- **Uso prático:** Saiba quando ele provavelmente voltará para uma nova oferta

**📋 Resumo Estatístico (4 Números Importantes)**
- **Total Gasto:** Toda a receita que este cliente já gerou
- **Ticket Médio:** Valor médio que ele gasta por visita
- **Itens Comprados:** Total de produtos que já levou
- **Frequência:** Número médio de compras por período

**🎯 Como usar essas informações na prática:**
1. **Cliente com gráfico crescente:** Ofereça produtos premium, ele está engajado
2. **Cliente com padrão regular:** Crie ofertas nos intervalos habituais dele
3. **Cliente experimental (muitos produtos diferentes):** Sugira novidades
4. **Cliente fidelizado (poucos produtos repetidos):** Mantenha sempre em estoque os favoritos dele

#### **📱 ABA COMUNICAÇÃO** 🚧 **EM MANUTENÇÃO**
- **Status:** 🔧 Interface preparada, aguardando integração N8N
- **Futuro:** WhatsApp Business API, Email templates, SMS

#### **💳 ABA FINANCEIRO** 🚧 **EM MANUTENÇÃO**
- **Status:** 🔧 Interface preparada, aguardando desenvolvimento
- **Futuro:** Credit scoring, contas a receber, análises financeiras

#### **🤖 ABA INSIGHTS IA** 🚧 **EM MANUTENÇÃO**
- **Status:** 🔧 Interface preparada, aguardando integração N8N
- **Futuro:** Machine Learning, recomendações automáticas, automações N8N

#### **📄 ABA DOCUMENTOS** ⏳ **PLANEJADO**
- **Status:** ⏳ Funcionalidade futura
- **Futuro:** Contratos, anexos, arquivos do cliente

#### **📅 ABA TIMELINE** ⏳ **PLANEJADO**
- **Status:** ⏳ Funcionalidade futura
- **Futuro:** Histórico completo de todas as atividades

---

## 📈 CRM DASHBOARD - Centro de Inteligência Empresarial

### 🎯 **Centro de Comando do Relacionamento com Clientes:**

**Como Acessar:** Menu Lateral → **CRM Dashboard** (ícone gráfico de pizza)

#### **4 Métricas Principais no Topo:**

**👥 Total de Clientes (91 Ativos)**
- **O que mostra:** Base total de clientes cadastrados
- **Meta:** Crescimento consistente mensal

**💰 LTV Total**
- **O que mostra:** Soma do valor que todos os clientes já gastaram
- **Indicador:** Patrimônio em relacionamento

**🎂 Aniversários do Mês**
- **O que mostra:** Quantos fazem aniversário este mês
- **Ação:** Oportunidade de campanhas personalizadas

**⚠️ Clientes em Risco**
- **O que mostra:** Clientes há 60+ dias sem comprar
- **Ação:** Campanhas de reativação urgente

### 📊 **Sistema de 4 Abas Profissionais:**

#### **📈 ABA OVERVIEW (Visão Geral)**
**Totalmente Funcional ✅**

**Gráfico de Tendências:**
- **Verde subindo:** Crescimento de clientes ativos ✅
- **Linha de novos:** Captação mensal
- **Análise temporal:** Últimos 6 meses de dados

**Lista de Clientes em Risco:**
- **Algoritmo inteligente:** Classifica por dias sem comprar
- **Código de cores:** Vermelho (crítico), Amarelo (atenção)
- **Ação direta:** Clique no cliente para ver perfil completo

#### **📊 ABA SEGMENTAÇÃO**
**Totalmente Funcional ✅**

**Gráfico de Pizza Automático:**
- **Fiel:** Clientes de alto valor (Verde)
- **Regular:** Compradores ocasionais (Azul)  
- **Novo:** Primeiras compras (Roxo)
- **Em Risco:** Sem comprar há tempo (Vermelho)
- **Inativo:** Dormentes há muito tempo (Cinza)

**Tabela de ROI por Segmento:**
- **Revenue total** de cada grupo
- **Média por cliente** em cada segmento
- **Identifica** quais grupos geram mais receita

#### **📅 ABA CALENDÁRIO**
**Totalmente Funcional ✅**

**Calendário de Aniversários:**
- **Lista dos próximos 30 dias**
- **Countdown visual:** Quantos dias faltam
- **Informações completas:** Nome, telefone, segmento
- **Ação direta:** Links para WhatsApp e perfil

**Como usar para vendas:**
1. Veja quem faz aniversário nos próximos dias
2. Entre em contato via WhatsApp (link direto)
3. Ofereça promoção especial de aniversário
4. Acompanhe conversões

#### **🗺️ ABA MAPAS & IA** 🚧 **EM MANUTENÇÃO**
**Status:** 🔧 Interface preparada, aguardando integrações externas

**🗺️ Google Maps Integration** 🚧 **EM MANUTENÇÃO:**
- **Heatmap de clientes:** 🔧 Concentração geográfica  
- **Rotas de entrega:** 🔧 Otimização de delivery
- **Análise por região:** 🔧 Performance por bairro/cidade

**🤖 IA Automation** 🚧 **EM MANUTENÇÃO:**
- **Previsões de churn:** 🔧 Algoritmo prevê quem pode deixar de comprar (N8N)
- **Recomendações:** 🔧 Produtos sugeridos por IA (N8N)
- **Campanhas automáticas:** 🔧 WhatsApp e Email triggered (N8N)

### 📈 **Insights Automáticos Disponíveis:**

**Análise de Retenção:**
- **Taxa de retorno:** % de clientes que voltam
- **Tempo médio:** Entre primeira e segunda compra  
- **Identificação:** Clientes com potencial de fidelização

**Segmentação Inteligente:**
- **Automática:** Sistema classifica clientes sozinho
- **Baseada em dados:** LTV, frequência, recência
- **Dinâmica:** Reclassifica automaticamente

**Oportunidades de Negócio:**
- **Clientes dormentes:** Lista para reativação
- **Up-sell potential:** Clientes que podem gastar mais
- **Cross-sell opportunities:** Diferentes categorias de produto

### 💡 **Como Usar o CRM Dashboard no Dia-a-Dia:**

**Rotina da Manhã (5 minutos):**
1. Veja quantos clientes estão em risco
2. Confira aniversariantes dos próximos 3 dias
3. Analise tendência de novos clientes

**Ações Semanais:**
1. Entre em contato com todos os aniversariantes
2. Faça campanha para clientes em risco
3. Analise performance por segmento

**Estratégias Mensais:**
1. Avalie crescimento da base de clientes
2. Compare revenue entre segmentos
3. Planeje campanhas baseadas nos insights


---

## 🚚 DELIVERY - Gestão de Entregas

### 🎯 **Fluxo de Entrega:**

#### **Status das Entregas:**
- **🟡 Pendente:** Precisa sair para entrega
- **🔵 Em Rota:** Entregador a caminho
- **🟢 Entregue:** Concluída com sucesso
- **🔴 Problema:** Não entregue (endereço, cliente ausente)

#### **Informações por Entrega:**
- **Cliente:** Nome e telefone
- **Endereço:** Local completo
- **Produtos:** Lista do que entregar
- **Valor:** Total da entrega
- **Entregador:** Quem está responsável
- **Observações:** Instruções especiais

### 👨‍🚚 **Gerenciar Entregadores:**

**Atribuir Entregas:**
1. Selecione entregas pendentes
2. Escolha o entregador disponível
3. Confirme atribuição

**Acompanhar Progresso:**
- Visualize entregas por entregador
- Monitore tempo médio
- Identifique problemas recorrentes

### 📊 **Métricas de Delivery:**

**Taxa de Sucesso:** % de entregas bem-sucedidas
**Tempo Médio:** Quanto demora cada entrega
**Problemas Frequentes:** Endereços, ausência, etc.
**Performance:** Ranking dos entregadores

---

## 🔄 MOVIMENTAÇÕES - Auditoria de Estoque

### 🎯 **Tipos de Movimentação:**

#### **📈 ENTRADA (IN):**
- **Quando:** Recebimento de mercadorias
- **Exemplo:** Compra de 50 garrafas de vinho
- **Efeito:** Aumenta estoque

#### **📉 SAÍDA (OUT):**
- **Quando:** Venda realizada
- **Exemplo:** Cliente comprou 2 garrafas
- **Efeito:** Diminui estoque

#### **📋 FIADO:**
- **Quando:** Venda no crediário
- **Exemplo:** Cliente levou mas pagará depois
- **Efeito:** Saída com controle financeiro

#### **🔄 DEVOLUÇÃO:**
- **Quando:** Cliente devolveu produto
- **Exemplo:** Vinho com defeito
- **Efeito:** Retorna ao estoque

### 📊 **Relatórios de Movimentação:**

**Por Período:** Filtrar por data específica
**Por Produto:** Ver movimentação de item específico
**Por Usuário:** Quem fez cada operação
**Por Tipo:** Apenas entradas ou saídas

### 🔍 **Auditoria e Controle:**

Cada movimentação registra:
- **Data/Hora:** Quando aconteceu
- **Usuário:** Quem executou
- **Motivo:** Razão da movimentação
- **Quantidade:** Quanto foi movimentado
- **Observações:** Detalhes extras

---

## 🤖 AUTOMAÇÕES - Centro de Integração 🚧 **EM MANUTENÇÃO**

### 🎯 **Preparação para Integrações Futuras:**

Esta seção prepara o sistema para integrações externas:

#### **🗺️ Google Maps** 🚧 **EM MANUTENÇÃO:**
- **Objetivo:** 🔧 Otimizar rotas de entrega
- **Benefício:** 🔧 Entregas mais rápidas e econômicas
- **Status:** 🔧 Interface preparada, aguardando API

#### **⚡ N8N Automations** 🚧 **EM MANUTENÇÃO:**
- **Objetivo:** 🔧 Automatizar tarefas repetitivas
- **Exemplos:**
  - 🔧 WhatsApp automático após vendas
  - 🔧 Email de aniversário
  - 🔧 Alertas de estoque baixo
- **Status:** 🔧 Estrutura implementada, aguardando N8N

### 🔧 **Configurações Futuras:** ⏳ **PLANEJADO**

Quando as integrações estiverem ativas:
- ⏳ **Tokens de API:** Conectar serviços externos
- ⏳ **Workflows:** Definir automações
- ⏳ **Triggers:** Eventos que disparam ações

---

## 📊 RELATÓRIOS - Análises Profundas

### 🎯 **Tipos de Relatório:**

#### **💰 Relatórios Financeiros:**
- **Vendas por Período:** Faturamento mensal, semanal
- **Margem de Lucro:** Rentabilidade por produto
- **Formas de Pagamento:** Preferências dos clientes
- **Contas a Receber:** Valores em aberto (fiado)

#### **📦 Relatórios de Estoque:**
- **Giro de Produtos:** Velocidade de vendas
- **Produtos em Falta:** Lista para reposição
- **Análise ABC:** Classificação por importância
- **Previsão de Compras:** Sugestões baseadas em histórico

#### **👥 Relatórios de CRM:**
- **Clientes Mais Valiosos:** Ranking por LTV
- **Segmentação:** Distribuição dos grupos
- **Retenção:** Taxa de retorno dos clientes
- **Novos Clientes:** Captação mensal

#### **🚚 Relatórios de Delivery:**
- **Performance de Entregadores:** Tempo, sucesso
- **Mapa de Entregas:** Regiões mais atendidas
- **Custos de Entrega:** Análise de eficiência

### 📈 **Como Exportar:**

1. Escolha o tipo de relatório
2. Defina período (data inicial/final)
3. Selecione filtros desejados
4. Clique "Exportar"
5. Escolha formato: PDF ou Excel

### 📊 **Interpretação dos Dados:**

**Tendências de Crescimento:**
- Linhas subindo: negócio crescendo ✅
- Linhas descendo: precisa atenção ⚠️
- Linhas estáveis: mercado maduro 📊

**Sazonalidade:**
- Picos de vendas: épocas especiais
- Vale: períodos fracos
- Planejar promoções nos vales

---

## ⚙️ USUÁRIOS - Controle de Acesso

### 🎯 **Tipos de Usuário:**

#### **👑 Administrador (Você):**
- **Acesso Total:** Todas as funcionalidades
- **Permissões:** Criar, editar, deletar tudo
- **Responsabilidade:** Supervisão geral

#### **👨‍💼 Funcionário:**
- **Acesso:** Vendas, estoque, clientes
- **Restrições:** Não vê preços de custo
- **Função:** Operação do dia-a-dia

#### **🚚 Entregador:**
- **Acesso:** Apenas área de delivery
- **Função:** Visualizar suas entregas
- **Segurança:** Dados protegidos

### 👥 **Gerenciar Equipe:**

#### **Adicionar Usuário:**
1. Clique "Novo Usuário"
2. Preencha dados pessoais
3. Escolha o tipo (Admin/Funcionário/Entregador)
4. Defina email e senha temporária
5. Salve e comunique ao funcionário

#### **Editar Permissões:**
- **Ativar/Desativar:** Controlar acesso
- **Alterar Tipo:** Promover ou rebaixar
- **Trocar Senha:** Reset por segurança

#### **Monitorar Atividade:**
- **Último Login:** Quando acessou
- **Ações Recentes:** O que fez no sistema
- **Vendas Realizadas:** Performance individual

---

## 🚀 Dicas para Maximizar Resultados

### 📈 **Estratégias de Vendas:**

**1. Use o Dashboard Diariamente:**
- Verifique KPIs todas as manhãs
- Identifique tendências rapidamente
- Tome decisões baseadas em dados

**2. Mantenha Estoque Inteligente:**
- Foque nos produtos de giro alto
- Faça promoções dos giro baixo
- Nunca deixe faltar os campeões

**3. Cultive Relacionamento com CRM Avançado:**
- **Use páginas individuais:** Clique no nome do cliente para ver perfil completo
- **Aproveite aniversários:** CRM Dashboard → Calendário → contate aniversariantes
- **Actions diretas:** Use WhatsApp e Email dos perfis individuais
- **Analise histórico:** Aba Compras mostra padrões de compra

**4. **Nova Funcionalidade** - Automation de Relacionamento:**
- **Clientes em Risco:** CRM Dashboard identifica automaticamente
- **Quick Actions:** WhatsApp direto das páginas de cliente
- **Segmentação:** Use dados automáticos para campanhas direcionadas

### 📊 **Análises Importantes:**

**Semanalmente:**
- Vendas vs. meta
- Produtos em falta  
- Entregas pendentes
- **🆕 Clientes em risco** (CRM Dashboard)
- **🆕 Aniversariantes da semana** (CRM Dashboard)

**Mensalmente:**
- **🆕 Novos clientes** (CRM Dashboard - métricas)
- **🆕 LTV por segmento** (CRM Dashboard - segmentação)
- Giro de estoque
- **🆕 Performance dos Quick Actions** (WhatsApp/Email enviados)

**Trimestralmente:**
- Análise de rentabilidade
- Performance de funcionários
- Planejamento de compras
- **🆕 Análise de retenção por segmento** (CRM insights)

### 🎯 **Metas Sugeridas:**

**Financeiras:**
- Crescimento de 10% nas vendas mensais
- Margem mínima de 30% por produto
- 95% das entregas no prazo
- **🆕 LTV médio crescendo 15% ao ano**

**Operacionais:**
- Máximo 5% de produtos em falta
- 100% dos clientes cadastrados
- **🆕 Máximo 10% de clientes em risco**

**Relacionamento (CRM Avançado):**
- **🆕 80% de clientes no segmento Fiel ou Regular**
- **🆕 20 novos clientes por mês** (trackable no CRM)
- **🆕 100% dos aniversariantes contatados** (via CRM Calendar)
- **🆕 90% de quick actions bem-sucedidas** (WhatsApp/Email)

---

## ❓ Dúvidas Frequentes (FAQ)

### 🔐 **Segurança e Acesso:**

**P: Esqueci minha senha, o que fazer?**
R: Como administrador, você pode resetar pelo menu Usuários ou contatar o suporte técnico.

**P: Posso ter mais de um administrador?**
R: Sim, mas crie com cuidado. Administradores têm acesso total ao sistema.

### 📊 **Dados e Relatórios:**

**P: Como fazer backup dos dados?**
R: O sistema faz backup automático, mas você pode exportar relatórios regularmente como segurança adicional.

**P: Os dados são seguros?**
R: Sim, usamos Supabase com criptografia e políticas de segurança avançadas (RLS).

### 💰 **Financeiro:**

**P: Como controlar vendas fiado?**
R: Use a forma de pagamento "Fiado" nas vendas. Acompanhe no relatório financeiro.

**P: Posso alterar preços em lote?**
R: No momento não, mas você pode alterar produto por produto na tela de estoque.

### 📦 **Estoque:**

**P: Como ajustar estoque manualmente?**
R: Use a tela de Movimentações, tipo "Entrada" ou "Saída" com motivo "Ajuste de Estoque".

**P: O sistema avisa quando acabar produto?**
R: Sim, defina o "Estoque Mínimo" de cada produto. O Dashboard mostrará alertas.

### 📊 **Novas Funcionalidades (Analytics):**

**P: Como interpretar os gráficos de clientes?**
R: Na aba "Analytics" de cada cliente:
- **Linha crescente:** Cliente comprando mais (ótimo!)
- **Barras altas:** Produtos que ele ama
- **Intervalos regulares:** Cliente tem rotina (aproveite!)

**P: Para que serve o gráfico de produtos favoritos?**
R: Mostra exatamente o que cada cliente mais compra. Use para:
- Manter em estoque os favoritos dos melhores clientes
- Fazer ofertas certeiras
- Planejar compras baseado nos top clientes

**P: O que significa "padrão de compras"?**
R: É o tempo que cada cliente demora entre uma compra e outra:
- **Poucos dias:** Cliente frequente, ofereça novidades
- **Muitos dias:** Cliente espaça compras, foque em qualidade
- **Padrão regular:** Cliente previsível, programe ofertas

**P: Como usar as métricas para vender mais?**
R: 
1. **Cliente com LTV alto:** Ofereça produtos premium
2. **Ticket médio baixo:** Sugira combos e up-sell
3. **Frequência alta:** Mantenha sempre produtos favoritos
4. **Padrão regular:** Mande ofertas nos intervalos dele

---

## 📞 Suporte e Contato

### 🆘 **Quando Precisar de Ajuda:**

**Problemas Técnicos:**
- Email: suporte@adegamanager.com
- Telefone: (11) 9999-9999
- WhatsApp: Chat direto

**Treinamento da Equipe:**
- Solicite treinamento presencial
- Videoconferência para dúvidas
- Manual simplificado para funcionários

**Novas Funcionalidades:**
- Sugira melhorias
- Participe do roadmap
- Beta tester de novidades

### 🔄 **Atualizações do Sistema:**

O sistema é atualizado automaticamente com:
- **Correções de bugs**
- **Novas funcionalidades**
- **Melhorias de performance**
- **Recursos de segurança**

**Fique tranquilo:** Suas configurações e dados são preservados em todas as atualizações.

---

## ✅ Conclusão

Parabéns! Você agora domina o **Adega Manager** completamente, incluindo as **novas funcionalidades CRM empresariais**. 

### 🎯 **Lembre-se sempre:**

1. **Dashboard é seu amigo:** Consulte diariamente
2. **🆕 CRM Dashboard é poderoso:** Use para aniversários e clientes em risco
3. **🆕 Páginas individuais são o futuro:** Clique nos nomes para ver perfis completos
4. **🆕 Quick Actions economizam tempo:** WhatsApp e Email diretos
5. **🆕 Analytics são sua vantagem competitiva:** Use os gráficos para vender mais
6. **Estoque sob controle:** Nunca deixe faltar os produtos favoritos dos top clientes
7. **Dados guiam decisões:** Confie nos relatórios e CRM insights detalhados

### 🚀 **Próximos Passos:**

1. **🆕 Explore as páginas individuais:** Clique em vários clientes para se familiarizar
2. **🆕 Analise os gráficos:** Vá na aba "Analytics" dos seus melhores clientes
3. **🆕 Teste os Quick Actions:** Envie WhatsApp e Email de teste  
4. **🆕 Use dados para vender:** Baseie ofertas nos produtos favoritos de cada cliente
5. **🆕 Use o CRM Dashboard diariamente:** Verifique aniversários e clientes em risco
6. **Treine sua equipe:** Compartilhe conhecimento das novas funcionalidades
7. **Estabeleça rotinas:** Use o sistema CRM consistentemente
8. **Solicite suporte:** Não hesite em pedir ajuda
9. **Sugira melhorias:** Sua opinião é valiosa

### 💡 **DICA OURO - Como Usar os Analytics para Triplicar Vendas:**

**Rotina Semanal Recomendada:**
1. **Segunda:** Abra a página dos 5 clientes que mais gastam
2. **Terça:** Veja na aba "Analytics" os produtos favoritos de cada um
3. **Quarta:** Verifique no estoque se esses produtos estão disponíveis
4. **Quinta:** Use o WhatsApp para ofertar os produtos favoritos com desconto
5. **Sexta:** Acompanhe as vendas e ajuste para próxima semana

**Resultado esperado:** Clientes recebem ofertas dos produtos que realmente gostam = mais vendas garantidas!

### 🔮 **Funcionalidades Futuras Preparadas:**

O sistema já está preparado para as próximas integrações:
- **🗺️ Google Maps** 🚧 **EM MANUTENÇÃO:** Para otimização de rotas e análise geográfica de clientes
- **🤖 N8N Automações** 🚧 **EM MANUTENÇÃO:** Para WhatsApp Business automático e campanhas inteligentes  
- **📊 Analytics Avançados** ✅ **IMPLEMENTADO:** Gráficos de comportamento e tendências (**CONCLUÍDO!**)
- **🤖 Insights IA** 🚧 **EM PREPARAÇÃO:** Machine Learning para recomendações de produtos
- **📱 Centro de Comunicação** 🚧 **EM PREPARAÇÃO:** Templates de email e campanhas SMS

**Sucesso com seu Adega Manager CRM! 🍷**

---

*Manual criado em Agosto 2025 | Versão 2.0.0 | Adega Manager - Sistema Completo de Gestão*