# Adega Manager - Documentação Completa

## Visão Geral

O Adega Manager é uma aplicação web moderna desenvolvida para gerenciamento completo de adegas, oferecendo funcionalidades como controle de estoque, vendas, clientes (CRM), delivery e relatórios. A aplicação foi construída utilizando tecnologias modernas e seguindo as melhores práticas de desenvolvimento.

> **Última Atualização**: 16/07/2025 - Documentação consolidada e refatorada

---

## 📋 Índice da Documentação

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
Documentação técnica completa da arquitetura do sistema:
- **Stack Tecnológica**: React 18, TypeScript, Supabase, Tailwind CSS
- **Estrutura do Projeto**: Organização de pastas e arquivos
- **Banco de Dados**: 28 tabelas organizadas, RLS, triggers
- **Componentes**: Padrões de desenvolvimento e reutilização
- **Segurança**: Controle de acesso, validação, sanitização
- **Performance**: Otimizações e boas práticas
- **Monitoramento**: Logs, métricas, debugging

### 🧩 [MODULES.md](./MODULES.md)
Detalhamento completo dos módulos do sistema:
- **CRM** (✅ 100%): Segmentação, insights, interações
- **Vendas** (🟡 80%): Checkout, pagamentos, carrinho
- **Estoque** (🟡 70%): Controle FIFO, alertas, previsão
- **Relatórios** (❌ Removido): Migrado para n8n
- **Dashboard** (🟡 30%): Personalização, tempo real
- **Delivery** (⏳ 20%): Rastreamento, rotas, avaliação

### 🔧 [OPERATIONS.md](./OPERATIONS.md)
Guia completo de operações e manutenção:
- **Sistema de Backup**: Automático, rotação, restauração
- **Deploy**: Ambientes, CI/CD, variáveis
- **Monitoramento**: Métricas, logs, auditoria
- **Manutenção**: Preventiva, troubleshooting, scripts
- **Segurança**: Políticas, criptografia, conformidade LGPD
- **Disaster Recovery**: Planos, testes, contatos

### 👨‍💻 [DEVELOPMENT.md](./DEVELOPMENT.md)
Guia completo para desenvolvedores:
- **Configuração**: Ambiente, VS Code, Git
- **Padrões**: Código, nomenclatura, estrutura
- **Integração**: Supabase, hooks, real-time
- **Testes**: Unitários, integração, E2E
- **Boas Práticas**: Performance, segurança, acessibilidade
- **Contribuição**: Fluxo, commits, code review

### 🤖 [N8N_AUTOMATIONS.md](./N8N_AUTOMATIONS.md)
Guia completo de automações com n8n:
- **Estoque**: Alertas, pedidos automáticos, controle de validade
- **CRM**: Campanhas, reativação, segmentação dinâmica
- **Relatórios**: Geração automática, dashboards, análise preditiva
- **Financeiro**: Cobrança, conciliação, fluxo de caixa
- **Delivery**: Otimização de rotas, tracking, notificações
- **Integrações**: WhatsApp, email, SMS, Slack

---

## 🚀 Quick Start

### Requisitos
- Node.js 18+
- npm 9+
- Git

### Instalação Rápida

```bash
# 1. Clonar repositório
git clone [url-do-repositorio]
cd solid-foundation-adega-manager

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais Supabase

# 4. Executar aplicação
npm run dev
```

### Comandos Principais

```bash
# Desenvolvimento
npm run dev          # Servidor desenvolvimento (porta 8080)
npm run build        # Build produção
npm run lint         # Verificar código
npm run preview      # Preview build

# Banco de dados
npm run backup       # Backup banco
npm run restore      # Restaurar backup
npm run setup:env    # Configurar ambiente
```

---

## 📊 Status do Projeto

### Módulos Implementados

| Módulo | Status | Completude | Próximos Passos |
|--------|--------|------------|-----------------|
| **CRM** | ✅ Concluído | 100% | Manutenção |
| **Vendas** | 🟡 Desenvolvimento | 80% | Pagamentos |
| **Estoque** | 🟡 Desenvolvimento | 70% | Previsão |
| **Relatórios** | ❌ Removido | 0% | Migrado para n8n |
| **Dashboard** | 🟡 Planejado | 30% | Personalização |
| **Delivery** | ⏳ Pendente | 20% | Rastreamento |

### Tecnologias Utilizadas

#### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS** + Shadcn/ui
- **React Query** (estado servidor)
- **React Hook Form** + Zod
- **Recharts** (gráficos)

#### Backend
- **Supabase** (PostgreSQL)
- **Row Level Security** (RLS)
- **Real-time subscriptions**
- **Edge Functions**
- **Storage** para arquivos

---

## 🏢 Funcionalidades Principais

### ✅ Sistema CRM Completo
- Perfis detalhados de clientes
- Segmentação automática (VIP, Regular, Novo, Inativo, Em risco)
- Indicador de completude de perfil
- Registro de interações
- Insights automáticos baseados em IA
- Timeline de atividades
- Oportunidades de negócio

### 🛒 Módulo de Vendas
- Ponto de venda (PDV) completo
- Busca avançada de clientes
- Carrinho de compras inteligente
- Múltiplos métodos de pagamento
- Cálculo automático de descontos
- Integração com estoque em tempo real
- Histórico completo de transações

### 📦 Controle de Estoque
- Movimentações automáticas
- Controle FIFO (primeiro que entra, primeiro que sai)
- Alertas de reposição
- Previsão de demanda (MVP)
- Integração com vendas
- Relatórios de movimentação

### 📊 Sistema de Relatórios (Migrado para n8n)
- Geração automática de relatórios
- Envio por email/WhatsApp
- Dashboards externos integrados
- Alertas proativos
- Análise preditiva
- Integrações com ferramentas de BI

---

## 🔐 Segurança

### Controle de Acesso
- **Admin**: Acesso total ao sistema
- **Employee**: Operações diárias
- **Delivery**: Apenas entregas

### Políticas de Segurança
- Row Level Security (RLS) no banco
- Validação em múltiplas camadas
- Sanitização de dados
- Auditoria completa
- Backup automático criptografado

---

## 🗃️ Banco de Dados

### Estrutura
- **28 tabelas** organizadas por módulos
- **PostgreSQL** no Supabase
- **Triggers** para automação
- **Funções RPC** para operações complexas
- **Índices** otimizados para performance

### Principais Tabelas
- `users`, `profiles` - Autenticação
- `customers` - CRM completo
- `products` - Catálogo de produtos
- `sales`, `sale_items` - Vendas
- `inventory_movements` - Estoque
- `audit_logs` - Auditoria

---

## 🔧 Manutenção

### Backup Automático
- Backup diário automático
- Rotação de 7 backups
- Restauração em um clique
- Armazenamento em JSON
- Documentação completa

### Monitoramento
- Logs estruturados
- Métricas de performance
- Alertas de sistema
- Auditoria de ações
- Dashboard de saúde

---

## 📝 Changelog Recente

### v1.3.0 (16/07/2025)
- ✅ **Documentação consolidada** em 4 arquivos principais
- ✅ **Refatoração completa** da estrutura de docs
- ✅ **Guias especializados** por área (arquitetura, módulos, operações, desenvolvimento)
- ✅ **Índice centralizado** para navegação
- ✅ **Remoção de duplicações** e arquivos desnecessários

### v1.2.0 (18/06/2025)
- ✅ **Sistema CRM completo** implementado
- ✅ **Hooks refatorados** para melhor performance
- ✅ **Notificações em tempo real** integradas
- ✅ **Indicador de completude** de perfil
- ✅ **Segmentação automática** de clientes

---

## 🤝 Contribuição

### Como Contribuir
1. Leia o [DEVELOPMENT.md](./DEVELOPMENT.md) para configuração
2. Siga os padrões de código estabelecidos
3. Adicione testes para novas funcionalidades
4. Faça commit seguindo convenções
5. Abra Pull Request com descrição clara

### Estrutura de Commits
```bash
feat(module): description    # Nova funcionalidade
fix(module): description     # Correção de bug
docs(module): description    # Documentação
refactor(module): description # Refatoração
test(module): description    # Testes
```

---

## 📞 Suporte

### Recursos
- **Documentação Técnica**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Guia de Módulos**: [MODULES.md](./MODULES.md)
- **Operações**: [OPERATIONS.md](./OPERATIONS.md)
- **Desenvolvimento**: [DEVELOPMENT.md](./DEVELOPMENT.md)

### Troubleshooting
- Consulte a seção de troubleshooting em cada documento
- Verifique logs de erro na aplicação
- Consulte documentação do Supabase
- Abra issue no repositório se necessário

---

## 📜 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

---

**Adega Manager** - Sistema completo de gestão para adegas
*Desenvolvido com React, TypeScript e Supabase*