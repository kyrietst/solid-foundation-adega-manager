# ⚙️ Módulos - Adega Manager

> Documentação completa dos módulos funcionais do sistema

## 📋 Visão Geral

O Adega Manager utiliza uma **arquitetura feature-based** com 10 módulos independentes e coesos. Cada módulo é responsável por uma área específica do negócio e possui sua própria estrutura de componentes, hooks, tipos e testes.

## 🏭 Módulos de Produção

### 🛒 [Sales (POS)](./sales/)
**Sistema de Ponto de Venda**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Vendas presenciais, carrinho inteligente, descontos
- **Funcionalidades**:
  - POS completo com scanner de código de barras
  - Carrinho com variantes (unidade/pacote)
  - Sistema de desconto integrado
  - Multi-métodos de pagamento
  - Cálculo automático de troco

### 📦 [Inventory](./inventory/)
**Gestão de Estoque**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Controle de inventário, movimentações, alertas
- **Funcionalidades**:
  - Cadastro de produtos com códigos de barras
  - Sistema dual (unidades/pacotes)
  - Alertas de estoque baixo
  - Histórico de movimentações
  - Análise de turnover (Fast/Medium/Slow)

### 👥 [Customers (CRM)](./customers/)
**Sistema de Relacionamento com Clientes**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Gestão de clientes, segmentação, insights
- **Funcionalidades**:
  - Cadastro completo de clientes
  - Segmentação automática (High Value, Regular, Occasional, New)
  - Insights AI com confidence scores
  - Timeline de interações
  - Histórico de compras

### 🚚 [Delivery](./delivery/)
**Gestão de Entregas**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Logística, tracking, atribuição de entregadores
- **Funcionalidades**:
  - Tracking em tempo real
  - Atribuição automática de entregadores
  - Status workflow (pending → preparing → out_for_delivery → delivered)
  - Gestão de zonas de entrega
  - Cálculo de taxas

### 📊 [Reports](./reports/)
**Analytics e Relatórios**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Dashboards, KPIs, análises de vendas
- **Funcionalidades**:
  - Top produtos com fallback manual
  - Análise de categorias (produtos, não pagamentos)
  - Relatórios financeiros
  - Métricas de performance
  - DSO e aging analysis

### 🎯 [Dashboard](./dashboard/)
**Visão Executiva**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Overview executivo, KPIs principais
- **Funcionalidades**:
  - KPIs em tempo real
  - Charts interativos
  - Alertas importantes
  - Métricas de performance
  - Quick actions

### 👤 [Users](./users/)
**Gestão de Usuários**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Autenticação, permissões, profiles
- **Funcionalidades**:
  - Sistema multi-role (admin/employee/delivery)
  - Gestão de perfis
  - Controle de permissões
  - Audit logs por usuário

### 🏪 [Suppliers](./suppliers/)
**Gestão de Fornecedores**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Relacionamento com fornecedores, pedidos
- **Funcionalidades**:
  - Cadastro completo de fornecedores
  - Histórico de pedidos
  - Avaliação de performance
  - Gestão de contratos

### 💰 [Expenses](./expenses/)
**Controle de Despesas**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Gestão financeira, controle de custos
- **Funcionalidades**:
  - Categorização de despesas
  - Aprovação de gastos
  - Relatórios financeiros
  - Controle orçamentário

### ⚙️ [Admin](./admin/)
**Administração do Sistema**
- **Status**: ✅ 100% Funcional
- **Responsabilidade**: Configurações, manutenção, backups
- **Funcionalidades**:
  - Configurações globais
  - Gestão de métodos de pagamento
  - Backup e restore
  - Logs de auditoria

## 📁 Estrutura Padrão de Módulo

Cada módulo segue a mesma estrutura organizacional:

```
features/[module]/
├── components/            # Componentes específicos do módulo
│   ├── [Module]Page.tsx  # Página principal
│   ├── [Module]Form.tsx  # Formulários
│   ├── [Module]List.tsx  # Listagens
│   └── [Module]Modal.tsx # Modais
├── hooks/                # Hooks específicos do módulo
│   ├── use-[module].ts   # Hook principal
│   ├── use-[module]-crud.ts # Operações CRUD
│   └── use-[module]-validation.ts # Validações
├── types/                # Tipos TypeScript
│   └── [module].types.ts
├── utils/                # Utilitários específicos
└── __tests__/            # Testes do módulo
    ├── components/
    ├── hooks/
    └── integration/
```

## 🔗 Integração Entre Módulos

### Fluxo Principal de Dados
```
Sales → Inventory (atualiza estoque)
Sales → Customers (registra evento)
Sales → Delivery (cria entrega se necessário)
Delivery → Reports (métricas de entrega)
```

### Shared Dependencies
- **Shared UI** - Componentes reutilizáveis
- **Shared Hooks** - Hooks comuns (pagination, forms)
- **Core Types** - Tipos compartilhados
- **Core Utils** - Utilitários globais

## 🎯 Como Trabalhar com Módulos

### Para Desenvolvedores

1. **Escolha o Módulo**: Identifique qual módulo você vai trabalhar
2. **Leia a Documentação**: Cada módulo tem sua própria documentação
3. **Entenda as Dependências**: Verifique integrações com outros módulos
4. **Siga os Padrões**: Use a estrutura padrão de cada módulo

### Para Product Managers

1. **Funcionalidades por Módulo**: Entenda o que cada módulo faz
2. **Regras de Negócio**: Consulte a documentação específica
3. **Métricas**: Cada módulo tem suas próprias métricas
4. **Roadmap**: Planeje features por módulo

## 📊 Status e Métricas

| Módulo | Status | Componentes | Hooks | Testes | Prioridade |
|--------|--------|-------------|-------|--------|-----------|
| Sales | ✅ 100% | 15+ | 8+ | ✅ | Alta |
| Inventory | ✅ 100% | 12+ | 6+ | ✅ | Alta |
| Customers | ✅ 100% | 10+ | 5+ | ✅ | Alta |
| Delivery | ✅ 100% | 8+ | 4+ | ✅ | Média |
| Reports | ✅ 100% | 6+ | 3+ | ✅ | Média |
| Dashboard | ✅ 100% | 8+ | 4+ | ✅ | Alta |
| Users | ✅ 100% | 5+ | 3+ | ✅ | Baixa |
| Suppliers | ✅ 100% | 6+ | 4+ | ✅ | Baixa |
| Expenses | ✅ 100% | 5+ | 3+ | ✅ | Baixa |
| Admin | ✅ 100% | 4+ | 2+ | ✅ | Baixa |

## 🔧 Guias de Desenvolvimento

### Adicionando um Novo Módulo

1. **Criar Estrutura**: Use o template padrão
2. **Definir Types**: Tipos específicos do módulo
3. **Implementar Hooks**: Lógica de negócio
4. **Criar Componentes**: Interface do usuário
5. **Adicionar Testes**: Cobertura completa
6. **Documentar**: README específico

### Modificando Módulo Existente

1. **Leia a Documentação**: Entenda o módulo primeiro
2. **Identifique Dependências**: Verifique impactos
3. **Mantenha Padrões**: Siga a estrutura existente
4. **Teste Completamente**: Não quebre funcionalidades
5. **Atualize Documentação**: Mantenha atualizada

## 📋 Templates Disponíveis

Cada módulo inclui templates para:

- **README.md** - Documentação específica do módulo
- **components.md** - Lista de componentes principais
- **business-logic.md** - Regras de negócio específicas
- **api.md** - Endpoints e hooks do módulo
- **troubleshooting.md** - Problemas comuns

## 🆘 Troubleshooting

### Problemas Comuns
- **Build Errors**: Verifique dependências circulares
- **Type Errors**: Confirme tipos compartilhados
- **Integration Issues**: Verifique comunicação entre módulos

### Onde Buscar Ajuda
- **[Documentação Específica](./[module]/README.md)** - Cada módulo
- **[Arquitetura](../02-architecture/)** - Visão geral técnica
- **[Troubleshooting Geral](../06-operations/troubleshooting/)** - Problemas gerais

---

**📝 Nota**: Todos os módulos estão **em produção ativa** com 925+ registros reais. Sempre teste localmente antes de fazer mudanças.