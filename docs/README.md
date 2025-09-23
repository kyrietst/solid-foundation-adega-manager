# 📚 Documentação do Adega Manager

> Sistema de gestão para adega e loja de vinhos - **Versão 2.0**

## 🎯 Visão Geral

O **Adega Manager** é um sistema empresarial completo para gestão de adega, atualmente em **produção** com 925+ registros reais e operações diárias. Construído com tecnologias modernas (React 19, TypeScript, Supabase) e arquitetura feature-based escalável.

### 🚀 Funcionalidades Principais
- **Sistema POS Completo** - Ponto de venda com carrinho inteligente e multi-pagamento
- **CRM Avançado** - Segmentação de clientes, insights IA, timeline de interações
- **Gestão Inteligente de Estoque** - Análise de turnover, código de barras, alertas automatizados
- **Rastreamento de Delivery** - Gestão logística completa com atualizações em tempo real
- **Segurança Empresarial** - Multi-roles RLS com 57 políticas ativas
- **Analytics em Tempo Real** - Dashboards e relatórios com dados ao vivo

## 📖 Navegação da Documentação

### 🏁 [01. Getting Started](./01-getting-started/)
**Para começar rapidamente**
- [Visão Geral do Sistema](./01-getting-started/README.md)
- [Instalação e Setup](./01-getting-started/installation.md)
- [Ambiente de Desenvolvimento](./01-getting-started/development.md)
- [Deploy e Produção](./01-getting-started/deployment.md)

### 🏗️ [02. Arquitetura](./02-architecture/)
**Para entender o sistema**
- [Overview da Arquitetura](./02-architecture/README.md)
- [Stack Tecnológico](./02-architecture/technology-stack.md)
- [Schema do Banco de Dados](./02-architecture/database-schema.md)
- [Modelo de Segurança](./02-architecture/security-model.md)
- [Padrões de API](./02-architecture/api-patterns.md)
- [Estrutura de Pastas](./02-architecture/folder-structure.md)

### ⚙️ [03. Módulos](./03-modules/)
**Para trabalhar em funcionalidades específicas**
- [Vendas (POS)](./03-modules/sales/) - Sistema de ponto de venda
- [Estoque](./03-modules/inventory/) - Gestão de inventário
- [Clientes (CRM)](./03-modules/customers/) - Sistema de relacionamento
- [Delivery](./03-modules/delivery/) - Gestão de entregas
- [Relatórios](./03-modules/reports/) - Analytics e dashboards
- [Dashboard](./03-modules/dashboard/) - Visão executiva
- [Usuários](./03-modules/users/) - Gestão de permissões
- [Fornecedores](./03-modules/suppliers/) - Relacionamento com fornecedores
- [Despesas](./03-modules/expenses/) - Controle financeiro
- [Administração](./03-modules/admin/) - Configurações do sistema

### 🎨 [04. Design System](./04-design-system/)
**Para UI/UX e componentes**
- [Visão Geral](./04-design-system/README.md) - Design System v2.0.0 completo
- [Componentes](./04-design-system/components.md) - Referência de todos os componentes
- [Governança](./04-design-system/governance.md) - Diretrizes e padrões obrigatórios
- [Guias de Componentes](./04-design-system/component-guides/) - Documentação específica

### 📊 [05. Negócio](./05-business/)
**Para stakeholders e product managers**
- [Visão do Negócio](./05-business/README.md)
- [Fluxos de Usuário](./05-business/user-flows.md)
- [Regras de Negócio](./05-business/business-rules.md)
- [Sistema de Preços e Descontos](./05-business/pricing-discounts.md)
- [Gestão de Estoque](./05-business/inventory-management.md)
- [Segmentação de Clientes](./05-business/customer-segmentation.md)

### 🔧 [06. Operações](./06-operations/)
**Para usuários e suporte**
- [Guia Operacional](./06-operations/README.md)
- [Manual do Usuário](./06-operations/user-manual/)
- [Manutenção](./06-operations/maintenance/)
- [Solução de Problemas](./06-operations/troubleshooting/)

### 📝 [07. Changelog](./07-changelog/)
**Para histórico e versionamento**
- [Histórico de Versões](./07-changelog/README.md)
- [✅ Conquistas Realizadas](./07-changelog/accomplishments-tracking.md) - Melhorias já implementadas
- [🚀 Milestones & Issues](./07-changelog/milestones-and-issues.md) - Sistema de acompanhamento GitHub
- [Versão 2.0](./07-changelog/v2.0/) - Ultra-simplificação e correções
- [Versão 1.0](./07-changelog/v1.0/) - Versão inicial
- [Guias de Migração](./07-changelog/migration-guides/)

### 🧪 [08. Testes](./08-testing/)
**Para QA e desenvolvedores**
- [Estratégia de Testes](./08-testing/README.md)
- [Testes Unitários](./08-testing/unit-testing.md)
- [Testes de Integração](./08-testing/integration-testing.md)
- [Testes End-to-End](./08-testing/e2e-testing.md)
- [Dados de Teste](./08-testing/test-data.md)

### 🔌 [09. API](./09-api/)
**Para integrações e desenvolvimento**
- [Visão Geral da API](./09-api/README.md)
- [Autenticação](./09-api/authentication.md)
- [Endpoints](./09-api/endpoints/)
- [Procedimentos Armazenados](./09-api/stored-procedures.md)
- [Funções do Banco](./09-api/database-functions.md)

### 📦 [10. Legacy](./10-legacy/)
**Para preservar histórico e referências**
- [Relatórios do Sistema v2.0](./10-legacy/system-reports/) - Ultra-simplificação e transformações
- [Correções de Bugs](./10-legacy/bug-fixes/) - Histórico de correções implementadas
- [Análises Técnicas](./10-legacy/system-analysis/) - Validações e análises do sistema
- [Relatórios do Design System](./10-legacy/design-system-reports/) - Histórico de certificações e auditorias

## 🎯 Guias Rápidos

### Para Novos Desenvolvedores
1. 📖 [Leia a Visão Geral](./01-getting-started/README.md)
2. ⚡ [Configure o Ambiente](./01-getting-started/development.md)
3. 🏗️ [Entenda a Arquitetura](./02-architecture/README.md)
4. ⚙️ [Escolha um Módulo](./03-modules/README.md)

### Para Product Managers
1. 📊 [Visão do Negócio](./05-business/README.md)
2. 👥 [Fluxos de Usuário](./05-business/user-flows.md)
3. 📋 [Regras de Negócio](./05-business/business-rules.md)

### Para Usuários Finais
1. 🔧 [Guia Operacional](./06-operations/README.md)
2. 📖 [Manual do Usuário](./06-operations/user-manual/)
3. 🆘 [Solução de Problemas](./06-operations/troubleshooting/)

### Para DevOps/Infraestrutura
1. 🚀 [Deploy](./01-getting-started/deployment.md)
2. 🔒 [Segurança](./02-architecture/security-model.md)
3. 🔧 [Manutenção](./06-operations/maintenance/)

### Para Gestão de Projetos
1. ✅ [Conquistas Realizadas](./07-changelog/accomplishments-tracking.md) - Marcar melhorias já feitas
2. 📋 [Milestones & Issues](./07-changelog/milestones-and-issues.md) - Próximas implementações
3. 📊 [Roadmap e Versões](./07-changelog/README.md) - Visão estratégica
4. 📈 [Histórico de Mudanças](./07-changelog/) - Timeline completa

## 📊 Estatísticas do Sistema

- **🏭 Status**: Em produção
- **📈 Registros**: 925+ registros reais
- **👥 Usuários**: 3 ativos (admin/employee/delivery)
- **🗃️ Tabelas**: 16 tabelas de produção
- **⚡ Procedures**: 48 procedimentos armazenados
- **🔒 Segurança**: 57 políticas RLS ativas
- **📦 Módulos**: 10 módulos funcionais
- **🎨 Componentes**: 25+ componentes UI

## 🤝 Como Contribuir

1. 📖 Leia o [Guia de Contribuição](./CONTRIBUTING.md)
2. 🔍 Encontre a seção apropriada acima
3. ✍️ Siga os templates de documentação
4. 📝 Mantenha a consistência com a estrutura existente

## 📞 Suporte

- **🐛 Bugs**: Consulte [Troubleshooting](./06-operations/troubleshooting/)
- **❓ Dúvidas**: Verifique a documentação do módulo específico
- **💡 Sugestões**: Contribua com melhorias na documentação

---

**Última Atualização**: 21 de setembro de 2025
**Versão da Documentação**: 2.0
**Sistema**: Adega Manager v2.0 - Ultra-Simplificação