# Adega Manager - Sistema Enterprise de Gestão

> **Sistema completo de gerenciamento de adegas com CRM avançado, POS inteligente e analytics em tempo real.**

## 🚀 Status do Projeto

**✅ PRODUÇÃO ATIVA** - Sistema enterprise totalmente funcional com 925+ registros reais em operação diária.

## 📊 Visão Geral

O Adega Manager é uma aplicação web moderna construída para gerenciamento completo de adegas, oferecendo:

- **Sistema POS Completo** - Point of Sale com carrinho inteligente
- **CRM Enterprise** - Segmentação automática e insights de IA  
- **Estoque Inteligente** - Análise de giro e alertas automáticos
- **Delivery Tracking** - Rastreamento completo de entregas
- **Analytics Avançado** - Relatórios e dashboards em tempo real
- **Multi-Role Security** - Controle granular de permissões

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + **TypeScript** - Framework moderno com tipagem estática
- **Vite** - Build tool ultra-rápido (dev server porta 8080)
- **TailwindCSS** + **Aceternity UI** + **Shadcn/ui** - Design system moderno e consistente
- **React Query** - Gerenciamento de estado servidor com cache
- **React Hook Form** + **Zod** - Formulários performáticos com validação
- **Recharts** - Gráficos e visualizações

### Backend & Infraestrutura  
- **Supabase** - Plataforma BaaS enterprise-grade
- **PostgreSQL 15+** - 16 tabelas, 48 stored procedures, 57 políticas RLS
- **Row Level Security** - Segurança multi-camada robusta
- **Real-time Subscriptions** - Atualizações em tempo real
- **Automated Backups** - Sistema de backup automatizado

## 🏗️ Arquitetura Atual

### Base de Dados (925+ registros)
```
📊 Core Business (370+ registros)
├── products (125) - Catálogo com barcode e análise de giro
├── customers (91) - CRM com segmentação automática  
├── sales (52) - Vendas com delivery tracking
└── inventory_movements - Controle completo de estoque

📈 CRM Avançado (73+ registros)  
├── customer_insights (6) - IA insights automáticos
├── customer_interactions (4) - Timeline de interações
└── customer_events (63) - Eventos automatizados

🔐 Sistema & Auditoria (480+ registros)
├── audit_logs (920) - Auditoria completa com IP tracking
├── users/profiles (3 cada) - Multi-role: admin/employee/delivery  
└── accounts_receivable (6) - Gestão financeira
```

### Funcionalidades Enterprise

**🎯 Sistema POS:**
- Busca inteligente de produtos com filtros
- Carrinho com cálculos automáticos
- Múltiplos métodos de pagamento
- Validação de estoque em tempo real

**👥 CRM Avançado:**
- Segmentação automática (High Value, Regular, Occasional, New)
- Timeline completa de interações
- Insights de IA com confidence score
- Análise de padrões de compra

**📦 Estoque Inteligente:**
- Análise de giro automática (Fast/Medium/Slow)
- Suporte completo a códigos de barras
- Alertas de reposição inteligentes
- 12 campos completos por produto

**🚚 Delivery & Logistics:**
- Tracking completo de entregas
- Atribuição automática de entregadores
- Status em tempo real
- Histórico de entregas

## 🔧 Desenvolvimento Local

### Pré-requisitos
- **Node.js 18+** - [Instalar com nvm](https://github.com/nvm-sh/nvm)
- **npm** ou **yarn**
- **Git**

### Configuração Rápida

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd solid-foundation-adega-manager

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais Supabase

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

### Comandos Principais

```bash
# Desenvolvimento
npm run dev          # Server desenvolvimento (porta 8080)
npm run build        # Build para produção
npm run lint         # Verificação de código
npm run preview      # Preview do build

# Backup & Restore
npm run backup       # Backup automático Supabase
npm run restore      # Restore do backup
npm run setup:env    # Configurar variáveis de ambiente
```

### Variáveis de Ambiente

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uujkzvbgnfzuzlztrzln.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui

# Development (opcional)
NODE_ENV=development
```

## 📱 Interfaces Principais

### Dashboard
- **KPIs em tempo real** - Vendas, estoque, clientes
- **Gráficos interativos** - Tendências e análises
- **Alertas inteligentes** - Estoque baixo, vendas importantes

### Vendas (POS)
- **Busca de produtos** - Por nome, categoria, código de barras
- **Carrinho inteligente** - Cálculos automáticos, descontos
- **Checkout rápido** - Múltiplos métodos de pagamento

### Estoque
- **Gestão completa** - Entrada, saída, transferências
- **Análise de giro** - Produtos fast/medium/slow
- **Códigos de barras** - Scanner integrado

### Clientes (CRM)
- **Perfis completos** - Dados, preferências, histórico
- **Segmentação automática** - Based on LTV e comportamento
- **Timeline de interações** - Histórico completo

### Entregas
- **Painel de controle** - Status, rotas, entregadores
- **Tracking em tempo real** - Atualizações automáticas
- **Histórico completo** - Todas as entregas realizadas

## 🔐 Segurança Enterprise

### Controle de Acesso Multi-Role

**👑 Admin (Super usuário):**
- Gestão completa de usuários e permissões
- Acesso total a relatórios financeiros
- Configuração do sistema
- Visualização de preços de custo

**👤 Employee (Funcionário):**
- Vendas e atendimento
- Gestão de produtos (exceto preços)
- CRM e interações
- Relatórios operacionais

**🚚 Delivery (Entregador):**
- Apenas entregas designadas
- Atualização de status
- Acesso read-only a dados necessários

### Row Level Security (RLS)
- **57 políticas ativas** em todas as tabelas
- **Controle granular** por role e contexto
- **Auditoria completa** com IP tracking
- **920+ logs** de auditoria registrados

## 📊 Monitoramento e Analytics

### Métricas em Tempo Real
- **Performance de vendas** - Por período, categoria, vendedor
- **Análise de estoque** - Giro, níveis, reposição
- **Comportamento de clientes** - Segmentação, LTV, frequência
- **Operações** - Entregas, movimentações, usuários

### Sistema de Notificações
- **Estoque baixo** - Alertas automáticos
- **Vendas importantes** - Notificações em tempo real
- **Status de entregas** - Updates automáticos
- **Eventos do sistema** - Logs e alertas

## 🔧 Manutenção e Operações

### Backup Automático
- **Backup diário** - Dados e configurações
- **Restore rápido** - Recuperação em minutos
- **Versionamento** - Histórico de backups
- **Scripts automatizados** - npm run backup/restore

### Troubleshooting Comum

**🔴 Problemas de Conexão:**
```bash
# Verificar variáveis de ambiente
npm run setup:env

# Testar conexão Supabase
npm run dev
```

**🔴 Problemas de Performance:**
```bash
# Limpar cache
rm -rf node_modules/.cache
npm run dev

# Build otimizado
npm run build
```

**🔴 Problemas de Dados:**
```bash
# Backup antes de qualquer operação
npm run backup

# Restore se necessário
npm run restore
```

## 🚀 Implantação e Produção

### Build para Produção
```bash
# Build otimizado
npm run build

# Testar build localmente
npm run preview

# Verificar código
npm run lint
```

### Ambientes
- **Desenvolvimento** - Desenvolvimento local (porta 8080)
- **Produção** - Deploy via Lovable ou manual

### Monitoramento de Produção
- **Painel Supabase** - Métricas de banco e API
- **Rastreamento de erros** - Logs de erros automáticos
- **Métricas de performance** - Performance de queries, uso

## 🤝 Contribuição e Desenvolvimento

### Para Novos Desenvolvedores

**📚 Integração:**
1. Ler documentação completa em `/doc/`
2. Configurar ambiente seguindo este README
3. Explorar banco via painel Supabase
4. Executar `npm run dev` e testar fluxos principais

**✅ Melhores Práticas:**
- Sempre usar TypeScript strict
- Implementar RLS antes de criar tabelas
- Validar com Zod em formulários
- Usar React Query para estado do servidor
- Escrever testes para lógica de negócio

**🔍 Lista de Verificação de Revisão de Código:**
- [ ] Políticas RLS implementadas
- [ ] TypeScript sem any/unknown  
- [ ] Validação de entrada adequada
- [ ] Tratamento de erros apropriado
- [ ] Considerações de performance
- [ ] Revisão de segurança

### Estrutura de Arquivos
```
src/
├── components/          # Componentes React por feature
│   ├── ui/             # Componentes Aceternity UI + Shadcn/ui
│   ├── inventory/      # Gestão de estoque
│   ├── sales/          # Sistema POS
│   └── clients/        # CRM
├── hooks/              # 15+ hooks customizados
├── integrations/       # Supabase client e tipos
├── lib/                # Utilitários e validações
└── types/              # Definições TypeScript
```

## 📈 Roadmap & Futuro

### T1 2025
- **Aplicativo Mobile** - React Native para vendedores
- **PWA** - Suporte offline para operações críticas
- **Performance** - Otimizações avançadas

### T2 2025  
- **Análise com IA** - Machine learning para previsões
- **Integração ERP** - Conexão com sistemas externos
- **Multi-inquilino** - Suporte a múltiplas lojas

### T3 2025
- **Recomendações** - IA para sugestões de produtos
- **Previsão** - Previsão de demanda avançada
- **Internacional** - Expansão para outros mercados

## 🆘 Suporte e Documentação

### Documentação Completa
- **`/doc/ARCHITECTURE.md`** - Arquitetura detalhada do sistema
- **`/doc/DEVELOPMENT.md`** - Guias de desenvolvimento
- **`/doc/OPERATIONS.md`** - Manuais operacionais
- **`/CLAUDE.md`** - Instruções para AI assistants

### Links Importantes
- **Painel Supabase:** [https://uujkzvbgnfzuzlztrzln.supabase.co](https://uujkzvbgnfzuzlztrzln.supabase.co)
- **Projeto Lovable:** [https://lovable.dev/projects/6c6aa749-d816-4d71-8687-a8f6e93f05f4](https://lovable.dev/projects/6c6aa749-d816-4d71-8687-a8f6e93f05f4)

### Contato
Para questões técnicas, consulte a documentação em `/doc/` ou revise os logs de auditoria no painel Supabase.

---

## 🏆 Status Enterprise

**O Adega Manager é uma aplicação enterprise-ready com:**
- ✅ Arquitetura escalável e moderna
- ✅ Segurança robusta multi-camada
- ✅ Performance otimizada
- ✅ Funcionalidades avançadas de negócio
- ✅ Infraestrutura cloud-native
- ✅ Documentação completa

**Status Atual: PRODUÇÃO ATIVA** 🚀
Sistema totalmente funcional com 925+ registros reais e operações diárias.