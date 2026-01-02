# 🏁 Getting Started - Adega Manager

> Guia completo para começar a trabalhar com o Adega Manager

## 📋 Pré-requisitos

### Sistema
- **Node.js**: 18.x ou superior
- **npm**: 9.x ou superior
- **Git**: Para controle de versão

### Conta Supabase
- Acesso ao projeto Supabase de produção
- Chaves de API configuradas
- Permissões adequadas no banco de dados

## 🚀 Início Rápido (5 minutos)

```bash
# 1. Clone o repositório
git clone <repository-url>
cd solid-foundation-adega-manager

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente (SEGURANÇA CRÍTICA)
cp .env.example .env
# Configure com suas credenciais reais - NUNCA commite o arquivo .env

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Acesse http://localhost:8080
```

## 📚 Guias Disponíveis

### Para Desenvolvedores
- **[Instalação Completa](./installation.md)** - Setup detalhado do ambiente
- **[Desenvolvimento](./development.md)** - Workflow e boas práticas
- **[Deploy](./deployment.md)** - Como fazer deploy em produção

### Para Product Managers
- **[Visão Geral](../05-business/README.md)** - Entendimento do negócio
- **[Fluxos de Usuário](../05-business/user-flows.md)** - Como os usuários interagem

### Para Usuários Finais
- **[Manual do Usuário](../06-operations/user-manual/)** - Como usar o sistema
- **[Troubleshooting](../06-operations/troubleshooting/)** - Solução de problemas

## 🎯 O que é o Adega Manager?

O **Adega Manager** é um sistema completo de gestão para adega/loja de vinhos, atualmente **em produção** com:

- **925+ registros reais** em operação diária
- **Sistema POS completo** com carrinho inteligente
- **CRM avançado** com segmentação automática
- **Gestão de estoque** com códigos de barras
- **Tracking de delivery** em tempo real
- **Analytics e relatórios** executivos

## 🏗️ Arquitetura em 30 segundos

```
Frontend (React 19 + TypeScript)
    ↓
API Layer (React Query + Zustand)
    ↓
Backend (Supabase PostgreSQL)
    ↓
Features (10 módulos independentes)
```

### Módulos Principais
- **Sales (POS)** - Ponto de venda
- **Inventory** - Gestão de estoque
- **Customers (CRM)** - Relacionamento com clientes
- **Delivery** - Logística de entregas
- **Reports** - Analytics e dashboards

## ⚡ Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Servidor de desenvolvimento (porta 8080)
npm run build        # Build para produção
npm run preview      # Preview do build

# Qualidade de Código
npm run lint         # ESLint (SEMPRE antes de commit)
npm run test         # Testes com Vitest
npm run test:ui      # Interface de testes

# Banco de Dados
npm run backup       # Backup automático do Supabase
npm run restore      # Restaurar backup
```

## 🔐 Segurança e Permissões

### Segurança do Repositório (CRÍTICO)
⚠️ **Este repositório passou por security hardening completo**

- ✅ **Nunca exponha** credenciais reais em commits
- ✅ **Sempre use** `.env.example` como template
- ✅ **Arquivo `.env`** é automaticamente protegido pelo `.gitignore`
- ✅ **Documentação sensível** (como `docs/`) permanece apenas local

📖 **Guia Completo**: [Repository Security Guide](../06-operations/guides/REPOSITORY_SECURITY_GUIDE.md)

### Permissões de Sistema (RLS)
O sistema utiliza **Row Level Security (RLS)** com 3 níveis:

- **Admin** - Acesso total ao sistema
- **Employee** - Operações de vendas e estoque
- **Delivery** - Apenas entregas atribuídas

## 📊 Status de Produção

| Métrica | Valor |
|---------|--------|
| Registros | 925+ |
| Usuários Ativos | 3 |
| Tabelas | 16 |
| Stored Procedures | 48 |
| Políticas RLS | 57 |
| Uptime | 99.9% |

## 🆘 Precisa de Ajuda?

### Problemas Comuns
- **[Troubleshooting Técnico](../06-operations/troubleshooting/)**
- **[Problemas de Desenvolvimento](./development.md#troubleshooting)**

### Documentação Específica
- **[Arquitetura Detalhada](../02-architecture/README.md)**
- **[Módulos Específicos](../03-modules/README.md)**
- **[API Reference](../09-api/README.md)**

### Contato
- **Bugs**: Consulte troubleshooting primeiro
- **Melhorias**: Contribua com a documentação
- **Dúvidas**: Consulte a documentação específica do módulo

## 🎯 Próximos Passos

1. **Ambiente Local**: [Configure seu ambiente](./installation.md)
2. **Entenda a Arquitetura**: [Visão técnica](../02-architecture/README.md)
3. **Escolha um Módulo**: [Explore as funcionalidades](../03-modules/README.md)
4. **Contribua**: Leia o workflow de desenvolvimento

---

**💡 Dica**: Este sistema está em **produção ativa**. Sempre teste localmente antes de fazer mudanças e mantenha backups atualizados.