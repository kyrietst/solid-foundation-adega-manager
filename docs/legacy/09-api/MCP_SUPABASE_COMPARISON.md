# Comparação dos MCPs Supabase

**Última atualização**: Outubro 16, 2025
**Status**: 3 servidores MCP Supabase configurados

---

## Visão Geral

Este projeto utiliza **3 servidores MCP Supabase diferentes**, cada um com propósitos e conjuntos de ferramentas específicos:

1. **supabase-dev** - Ambiente de desenvolvimento local
2. **supabase-prod** - Ambiente de produção local
3. **supabase-smithery** - Servidor remoto com ferramentas avançadas

---

## 📊 Comparação Detalhada

| Característica | supabase-dev | supabase-prod | supabase-smithery |
|----------------|--------------|---------------|-------------------|
| **Transport** | stdio (local) | stdio (local) | HTTP (remoto) |
| **Package** | mcp-supabase (npm) | mcp-supabase (npm) | Smithery hosted |
| **Número de Tools** | ~20 básicas | ~20 básicas | 29 avançadas |
| **Autenticação** | Service Role Key | Service Role Key | API Key (URL) |
| **Latência** | Muito baixa | Muito baixa | Média (remoto) |
| **Uso Recomendado** | Dev rápido | Análise prod | Features avançadas |

---

## 🔧 Configuração Atual (.mcp.json)

### supabase-dev
```json
{
  "command": "npx",
  "args": ["-y", "mcp-supabase"],
  "env": {
    "SUPABASE_URL": "https://goppneqeowgeehpqkcxe.supabase.co",
    "SUPABASE_KEY": "[SERVICE_ROLE_KEY]",
    "SUPABASE_ACCESS_TOKEN": "[ACCESS_TOKEN]"
  }
}
```

**Propósito**: Desenvolvimento local seguro
**Projeto**: goppneqeowgeehpqkcxe (Production-ready)

### supabase-prod
```json
{
  "command": "npx",
  "args": ["-y", "mcp-supabase"],
  "env": {
    "SUPABASE_URL": "https://uujkzvbgnfzuzlztrzln.supabase.co",
    "SUPABASE_KEY": "[SERVICE_ROLE_KEY]",
    "SUPABASE_ACCESS_TOKEN": "[ACCESS_TOKEN]"
  }
}
```

**Propósito**: Análise de produção (read-only recomendado)
**Projeto**: uujkzvbgnfzuzlztrzln (Production - 925+ records)

### supabase-smithery
```json
{
  "type": "http",
  "url": "https://server.smithery.ai/supabase/mcp?api_key=[KEY]&profile=[PROFILE]"
}
```

**Propósito**: Ferramentas avançadas (migrations, edge functions, docs)
**Provider**: Smithery.ai (remote server)

---

## 🛠️ Ferramentas Disponíveis

### Tools Comuns (supabase-dev & supabase-prod)
20 ferramentas básicas incluindo:
- `create_record` - Criar registros em tabelas
- `read_records` - Ler registros com filtros
- `update_record` - Atualizar registros
- `delete_record` - Deletar registros
- `upload_file` - Upload para Storage
- `download_file` - Download do Storage
- `invoke_function` - Invocar Edge Functions
- `list_projects` - Listar projetos
- `get_project` - Detalhes do projeto
- `create_user` - Criar usuários
- `update_user` - Atualizar usuários
- `delete_user` - Deletar usuários
- `assign_user_role` - Atribuir roles
- `remove_user_role` - Remover roles
- E mais...

### Tools Exclusivas (supabase-smithery)
**+9 ferramentas avançadas**:
- `execute_sql` - Executar SQL direto (com segurança)
- `list_migrations` - Listar migrações do banco
- `create_migration` - Criar nova migração
- `apply_migration` - Aplicar migrações
- `list_edge_functions` - Listar Edge Functions
- `deploy_edge_function` - Deploy de functions
- `create_branch` - Criar branch de desenvolvimento
- `search_documentation` - Busca GraphQL na documentação
- `get_advisor_recommendations` - Recomendações do Supabase Advisor

**Total**: 29 ferramentas únicas

---

## 🎯 Quando Usar Cada MCP

### Use `supabase-dev` quando:
✅ Desenvolvimento rápido com baixa latência
✅ Testes de funcionalidades básicas
✅ Operações CRUD em ambiente seguro
✅ Prototipagem de features

### Use `supabase-prod` quando:
⚠️ Análise de dados de produção (read-only)
⚠️ Validação de funcionalidades em prod
⚠️ Troubleshooting de issues produtivas
⚠️ **NUNCA para modificações diretas** (usar migration workflow)

### Use `supabase-smithery` quando:
🚀 Criar ou aplicar migrações de banco
🚀 Trabalhar com Edge Functions
🚀 Buscar documentação oficial do Supabase
🚀 Obter recomendações do Advisor
🚀 Gerenciar branches de desenvolvimento
🚀 Executar SQL complexo com segurança

---

## 🔒 Segurança e Boas Práticas

### Prioridade de Uso
1. **supabase-dev** (primeiro) - Testar tudo aqui
2. **supabase-smithery** (segundo) - Features avançadas
3. **supabase-prod** (último) - Somente leitura por padrão

### Regras Críticas
- ⚠️ **NUNCA modificar schema em prod diretamente** - Usar migration workflow
- ✅ **Sempre testar em dev primeiro** - Validar mudanças antes de prod
- 🔒 **Read-only em prod por padrão** - Write operations requerem confirmação explícita
- 📊 **Dev espelha prod** - Estrutura sincronizada (34 tables, 482 columns, 162 functions, 109 RLS)

### Migration Workflow
```
1. Criar migration: npm run migration:create nome
2. Testar em dev: supabase-dev
3. Validar com Smithery: supabase-smithery (apply_migration)
4. Aplicar em prod: npm run migration:apply (nunca direto via MCP)
```

---

## 🔄 Sincronização Dev/Prod

**Status**: ✅ COMPLETE (Oct 2, 2025)
- Zero production data copied
- Structure-only sync
- LGPD compliant
- 34 tables espelhadas
- 482 columns sincronizadas
- 162 stored procedures
- 109 RLS policies

**Como foi feito**: Ver `docs/06-operations/guides/MIGRATIONS_GUIDE.md`

---

## 📚 Recursos Relacionados

### Documentação
- **CLAUDE.md** - Visão geral do sistema e MCPs
- **docs/06-operations/guides/MIGRATIONS_GUIDE.md** - Migration workflow completo
- **docs/06-operations/troubleshooting/** - Guias de troubleshooting

### Links Externos
- [Smithery Supabase MCP](https://smithery.ai/server/supabase)
- [mcp-supabase GitHub](https://github.com/supabase-community/supabase-mcp)
- [Supabase MCP Docs](https://supabase.com/docs/guides/getting-started/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 🧪 Testando a Configuração

### 1. Reiniciar Claude Code
Para carregar os novos MCPs, reinicie o Claude Code.

### 2. Verificar Tools Disponíveis
Após reiniciar, você terá acesso a:
- `mcp__supabase-dev__*` - 20 tools
- `mcp__supabase-prod__*` - 20 tools
- `mcp__supabase-smithery__*` - 29 tools (novas!)

### 3. Testar Ferramentas Smithery
Experimente as novas ferramentas:
```
# Listar migrações
mcp__supabase-smithery__list_migrations

# Buscar documentação
mcp__supabase-smithery__search_documentation
topic: "Row Level Security"

# Obter recomendações
mcp__supabase-smithery__get_advisor_recommendations
```

---

## ❓ FAQ

### Por que 3 MCPs diferentes?
Cada um serve um propósito específico:
- **Local (dev/prod)**: Performance e operações básicas
- **Smithery**: Features avançadas que o mcp-supabase local não tem

### Posso criar meus próprios tools?
Não é possível adicionar tools aos MCPs existentes via configuração. Para custom tools, você precisaria:
1. Criar um servidor MCP próprio (TypeScript/Python)
2. Ou usar proxy como `mcp-remote` para adicionar funcionalidades

### O Smithery é seguro?
✅ Sim, usa API key para autenticação
✅ Mesma infraestrutura usada por 24,619 chamadas mensais
⚠️ Link contém credenciais - não compartilhar publicamente

### Qual a diferença entre o Smithery e o mcp.supabase.com/mcp oficial?
- **Smithery**: Hospedado por Smithery.ai, usa API key, 29 tools
- **Oficial**: Hospedado pelo Supabase, usa OAuth, mais recente
- Ambos são válidos, use o que funciona melhor para você

---

## 🔄 Próximas Melhorias

- [ ] Adicionar exemplo de uso de cada ferramenta exclusiva do Smithery
- [ ] Criar scripts de automação usando as ferramentas avançadas
- [ ] Documentar casos de uso específicos por MCP
- [ ] Avaliar adicionar o MCP oficial (mcp.supabase.com/mcp) com OAuth

---

**Autor**: Adega Manager Development Team
**Versão**: 1.0.0
**Licença**: Documentação interna do projeto
