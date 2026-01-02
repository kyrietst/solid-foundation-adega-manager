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
- 🕐 [**Arquitetura de Timezone**](./02-architecture/TIMEZONE_ARCHITECTURE.md) - **NOVO** - Fonte única da verdade para timezone

### ⚙️ [03. Módulos](./03-modules/)
**Para trabalhar em funcionalidades específicas**
- [Vendas (POS)](./03-modules/sales/) - Sistema de ponto de venda
  - 📱 [Fluxo Completo de Vendas com Códigos de Barras](./03-modules/sales/BARCODE_SALES_FLOW.md) - **NOVO**
- [Estoque](./03-modules/inventory/) - Gestão de inventário
  - 🔧 [Sistema de Códigos de Barras - Guia Completo](./03-modules/inventory/BARCODE_SYSTEM_GUIDE.md)
  - 🗑️ [**Sistema de Soft Delete de Produtos**](./03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md) - **✨ NOVO v3.3.4** - Exclusão segura com auditoria
- [Clientes (CRM)](./03-modules/customers/) - Sistema de relacionamento
  - 🔧 [**Correções Críticas v2.0.2**](./07-changelog/CUSTOMER_PROFILE_FIXES_v2.0.2.md) - **NOVO** - Fixes de produção React Error #31
  - 🩺 [**Guia de Troubleshooting**](./06-operations/troubleshooting/CUSTOMER_PROFILE_TROUBLESHOOTING.md) - **NOVO** - Resolução de problemas
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
  - 🚨 [Troubleshooting: Problemas de Preços em Códigos de Barras](./06-operations/troubleshooting/BARCODE_PRICING_TROUBLESHOOTING.md)
  - 🩺 [**Troubleshooting: Customer Profile System**](./06-operations/troubleshooting/CUSTOMER_PROFILE_TROUBLESHOOTING.md) - Resolução React Error #31
- [Guias Operacionais](./06-operations/guides/)
  - 🗑️ [**Guia de Exclusão de Produtos**](./06-operations/guides/PRODUCT_DELETION_GUIDE.md) - **✨ NOVO v3.3.4** - Como deletar e restaurar produtos
  - 🎯 [**Guia de Qualidade de Código**](./06-operations/guides/CODE_QUALITY_GUIDE.md) - **✨ NOVO v3.3.3** - Zero warnings policy
  - 🔐 [**Guia de Segurança do Repositório**](./06-operations/guides/REPOSITORY_SECURITY_GUIDE.md) - Security hardening completo
  - 🧪 [**Guia de Validação de Timezone**](./06-operations/guides/TIMEZONE_VALIDATION_GUIDE.md) - Procedimentos de teste

### 📝 [07. Changelog](./07-changelog/)
**Para histórico e versionamento**
- [Histórico de Versões](./07-changelog/README.md)
- [✅ Conquistas Realizadas](./07-changelog/accomplishments-tracking.md) - Melhorias já implementadas
- [🚀 Milestones & Issues](./07-changelog/milestones-and-issues.md) - Sistema de acompanhamento GitHub
- [🗑️ **Product Delete Modal Fixes v3.3.4**](./07-changelog/PRODUCT_DELETE_MODAL_FIXES_v3.3.4.md) - **✨ NOVO** - Soft delete + correções de modais
- [🧹 **Code Quality Cleanup v3.3.3**](./07-changelog/CODE_QUALITY_ESLINT_CLEANUP_v3.3.3.md) - Zero problemas ESLint
- [🔧 **Customer Profile Fixes v2.0.2**](./07-changelog/CUSTOMER_PROFILE_FIXES_v2.0.2.md) - Correções críticas de produção
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
- 🔧 [Correções de Stored Procedures - Documentação Técnica](./09-api/STORED_PROCEDURES_FIXES.md) - **NOVO**
- 🗄️ **[Database Operations & Synchronization](./09-api/database-operations/)** - **✅ COMPLETED** - Hub central para operações de banco
  - ✅ [**Sincronização Estrutural Completa v2.0.3**](./09-api/database-operations/DATABASE_SYNCHRONIZATION_ANALYSIS_v2.0.3.md) - **SUCCESSO TOTAL**
  - 🛠️ [Guia de Migrações](./09-api/database-operations/MIGRATIONS_GUIDE.md)
  - 📊 [Conformidade de Schema v2.0.2](./09-api/database-operations/DATABASE_SCHEMA_COMPLIANCE_v2.0.2.md)

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
3. 🔐 [**Security Hardening**](./06-operations/guides/REPOSITORY_SECURITY_GUIDE.md) - Guia completo de segurança
4. 🔧 [Manutenção](./06-operations/maintenance/)
5. ✅ **[Sincronização de Banco](./09-api/database-operations/)** - **COMPLETED** - DEV/PROD em paridade total

### Para Gestão de Projetos
1. ✅ [Conquistas Realizadas](./07-changelog/accomplishments-tracking.md) - Marcar melhorias já feitas
2. 📋 [Milestones & Issues](./07-changelog/milestones-and-issues.md) - Próximas implementações
3. 📊 [Roadmap e Versões](./07-changelog/README.md) - Visão estratégica
4. 📈 [Histórico de Mudanças](./07-changelog/) - Timeline completa

## 📊 Estatísticas do Sistema

- **🏭 Status**: Em produção (v3.3.4)
- **📈 Registros**: 925+ registros reais
- **👥 Usuários**: 3 ativos (admin/employee/delivery)
- **🗃️ Tabelas**: 34 tabelas (paridade DEV/PROD ✅)
- **⚡ Functions**: 162 funções (sincronizadas ✅)
- **🔒 Segurança**: 111 políticas RLS ativas (+2 soft delete policies)
- **🌐 Edge Functions**: 2 ativas (create-user v8, delete-user v4)
- **📦 Módulos**: 10 módulos funcionais
- **🎨 Componentes**: 25+ componentes UI
- **🗑️ Features Empresariais**: Soft delete com auditoria completa
- **🔄 Ambientes**: DEV/PROD sincronizados (LGPD compliant ✅)

## 🤝 Como Contribuir

1. 📖 Leia o [Guia de Contribuição](./CONTRIBUTING.md)
2. 🔍 Encontre a seção apropriada acima
3. ✍️ Siga os templates de documentação
4. 📝 Mantenha a consistência com a estrutura existente

## 📞 Suporte

- **🐛 Bugs**: Consulte [Troubleshooting](./06-operations/troubleshooting/)
- **❓ Dúvidas**: Verifique a documentação do módulo específico
- **💡 Sugestões**: Contribua com melhorias na documentação

## 🆕 **Atualizações Recentes**

### **v3.3.4** (Outubro 2025) - Sistema de Soft Delete

#### 🗑️ **Soft Delete de Produtos**
1. **Sistema completo de exclusão segura** com auditoria e restauração
   - Soft delete com `deleted_at` e `deleted_by`
   - Interface admin-only para gerenciar produtos deletados
   - Restauração com um clique
   - Histórico completo de auditoria

2. **🔧 Correções Críticas de Modais**
   - **AuthContext Bug Fix**: Corrigido uso incorreto de `profile` → `userRole`
   - **FormDialog Size Bug**: Aplicado `dialogClasses` ao `DialogContent`
   - **Modal Standardization**: Dimensões padronizadas (5xl inventory, xl forms)
   - **Button Contrast Fix**: WCAG AAA compliance no botão "Criar Usuário"
   - **Production Database Fix**: Migração aplicada corrigindo erro 400

3. **📚 Documentação Completa**
   - [Sistema de Soft Delete - Documentação Técnica](./03-modules/inventory/PRODUCT_SOFT_DELETE_SYSTEM.md)
   - [Changelog v3.3.4](./07-changelog/PRODUCT_DELETE_MODAL_FIXES_v3.3.4.md)
   - Guias de arquitetura, workflows e troubleshooting

---

### **v2.0.1** (Setembro 2025) - Correções Críticas

### 📚 **Nova Documentação Adicionada**
1. **🔧 [Sistema de Códigos de Barras - Guia Completo](./03-modules/inventory/BARCODE_SYSTEM_GUIDE.md)**
   - Documentação técnica completa do sistema de códigos de barras
   - Suporte para unidades e pacotes com códigos separados
   - Validação e formatação de códigos EAN-13, UPC-A, etc.

2. **📱 [Fluxo Completo de Vendas com Códigos de Barras](./03-modules/sales/BARCODE_SALES_FLOW.md)**
   - Processo detalhado do escaneamento à finalização
   - Cenários de uso para produtos simples e complexos
   - Cálculos e restauração de estoque

3. **🚨 [Troubleshooting: Problemas de Preços em Códigos de Barras](./06-operations/troubleshooting/BARCODE_PRICING_TROUBLESHOOTING.md)**
   - Guia específico para resolver problemas de preços incorretos
   - Debugging e validação de configurações de produtos
   - Casos reais de problemas resolvidos

4. **🔧 [Correções de Stored Procedures - Documentação Técnica](./09-api/STORED_PROCEDURES_FIXES.md)**
   - Análise técnica das correções críticas aplicadas
   - Correção do bug de restauração de estoque
   - Migrations e validações de integridade

5. **🕐 [Arquitetura de Timezone - Fonte Única da Verdade](./02-architecture/TIMEZONE_ARCHITECTURE.md)**
   - Implementação completa do sistema de timezone São Paulo
   - Validação e testes de consistência
   - Padronização de todas as operações de data/hora

6. **🧪 [Guia de Validação de Timezone](./06-operations/guides/TIMEZONE_VALIDATION_GUIDE.md)**
   - Procedimentos de teste e validação
   - Debugging e correções de problemas
   - Templates de relatório e monitoramento

7. **🔐 [Guia de Segurança do Repositório](./06-operations/guides/REPOSITORY_SECURITY_GUIDE.md)** - **NOVO**
   - Documentação completa do security hardening em 3 fases
   - Remoção de 34,448 linhas de código sensível
   - Diretrizes para desenvolvedores e AI assistants
   - Proteção completa contra exposição de credenciais

### 🔄 **Documentação Atualizada**
- **📝 [Changelog](./07-changelog/README.md)**: Adicionadas correções críticas v2.0.1
- **🔧 [Guia de Migrações](./06-operations/guides/MIGRATIONS_GUIDE.md)**: Exemplos reais aplicados

### 🚨 **Correções Críticas Documentadas**
1. **Bug de Preços em Códigos de Barras**: Código de pacote usando preço de unidade
2. **Bug de Cancelamento de Vendas**: Restauração incorreta de estoque (pacotes → unidades)
3. **Stored Procedure Fix**: Parâmetro `p_movement_type` faltando em `delete_sale_with_items`
4. **🕐 Timezone Padronização**: Sistema 100% padronizado para São Paulo/Brasil (UTC-3)
   - Eliminação de timestamps UTC incorretos
   - Implementação de fonte única da verdade
   - Validação completa JavaScript ↔ PostgreSQL

---

**Última Atualização**: 25 de outubro de 2025
**Versão da Documentação**: 3.3.4
**Sistema**: Adega Manager v3.3.4 - Sistema de Soft Delete + Correções de Modais