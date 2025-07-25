# Operações e Manutenção - Adega Manager

## Visão Geral

Este documento consolidada todas as informações operacionais do sistema, incluindo backup, deploy, manutenção e troubleshooting.

---

## 1. Sistema de Backup

### Visão Geral

O Adega Manager implementa um sistema de backup completo baseado na API do Supabase, que não depende do `pg_dump` e pode ser executado em qualquer ambiente.

### Características do Sistema

- **Backup completo** de todas as tabelas do banco de dados
- **Armazenamento em JSON** para portabilidade
- **Backup de configurações** do projeto
- **Rotação automática** (mantém os 7 mais recentes)
- **Documentação detalhada** para restauração

### Configuração Inicial

#### 1. Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_KEY=sua-chave-de-servico-aqui
```

> **IMPORTANTE**: A chave de serviço tem permissões administrativas. Nunca a exponha publicamente ou inclua no controle de versão.

#### 2. Obtenção das Chaves

Para obter as chaves necessárias:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para "Project Settings" > "API"
4. Copie a URL do projeto e a chave anônima
5. Para a chave de serviço, vá para "Service Role Secret"

#### 3. Instalação de Dependências

```bash
npm install @supabase/supabase-js dotenv
```

#### 4. Scripts no package.json

```json
{
  "scripts": {
    "backup:full": "node full-backup.cjs",
    "restore": "node restore-backup.cjs",
    "setup:env": "node setup-env.cjs"
  }
}
```

### Uso do Sistema de Backup

#### Criando um Backup Manual

```bash
# Usando npm
npm run backup:full

# Ou diretamente
node full-backup.cjs
```

O backup será salvo em:
```
backups/backup_2025-06-12T23-59-05-919Z/
├── database.json          # Dados de todas as tabelas
├── project-config.json    # Configurações do projeto
├── README.md             # Instruções de restauração
├── migrations/           # Arquivos de migração (se existirem)
└── functions/            # Funções Edge (se existirem)
```

#### Verificando Backups Existentes

```bash
# Windows
dir backups

# Linux/macOS
ls -la backups
```

#### Restaurando um Backup

```bash
# Usando npm
npm run restore -- --path ./backups/backup_2025-06-12T23-59-05-919Z

# Ou diretamente
node restore-backup.cjs --path ./backups/backup_2025-06-12T23-59-05-919Z
```

### Backup Automático

#### No Windows (Task Scheduler)

1. Abra o Agendador de Tarefas (`taskschd.msc`)
2. Clique em "Criar Tarefa Básica"
3. Configure:
   - **Nome**: "Backup Adega Manager"
   - **Descrição**: "Backup automático do banco de dados Supabase"
   - **Trigger**: Frequência desejada (diária, semanal, etc.)
   - **Ação**: "Iniciar um programa"
   - **Programa/script**: `node`
   - **Argumentos**: `full-backup.cjs`
   - **Iniciar em**: Caminho completo do projeto

#### No Linux/macOS (cron)

1. Edite o crontab:
   ```bash
   crontab -e
   ```

2. Adicione linha para backup diário às 2h:
   ```bash
   0 2 * * * cd /caminho/para/projeto && /usr/bin/node full-backup.cjs >> backup.log 2>&1
   ```

### Gerenciamento de Backups

#### Rotação Automática

O sistema mantém automaticamente os 7 backups mais recentes. Para alterar:

```javascript
// Em full-backup.cjs
const MAX_BACKUPS = 7; // Altere este valor
```

#### Backup Externo

Recomendamos copiar backups para local externo:

1. **Armazenamento em nuvem**: Google Drive, Dropbox, OneDrive
2. **Dispositivo externo**: Disco rígido externo
3. **Servidor remoto**: SFTP, SCP ou rsync

Exemplo de script para Windows:

```batch
@echo off
xcopy /E /I /Y "caminho\para\backups" "E:\Backups\adega-manager"
```

### Troubleshooting de Backup

#### Erro: Falha na autenticação

**Sintoma**: "Authentication failed"

**Solução**:
1. Verifique variáveis de ambiente no `.env`
2. Confirme se a chave de serviço não expirou
3. Verifique se o projeto Supabase está ativo

#### Erro: Tabela não existe

**Sintoma**: "relation does not exist"

**Solução**:
1. Comportamento normal para tabelas inexistentes
2. Sistema faz backup apenas das tabelas existentes
3. Use SQL Editor no Supabase para criar tabelas se necessário

#### Erro: Falha na restauração

**Sintoma**: Erros durante restauração

**Solução**:
1. Verifique se o banco de destino tem mesmo esquema
2. Confirme permissões da chave de serviço
3. Sistema usa upsert para resolver conflitos de chave primária

---

## 2. Desenvolvimento e Deploy

### Comandos Essenciais

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 8080)
npm run build        # Build para produção
npm run build:dev    # Build para desenvolvimento
npm run preview      # Preview do build local
npm run lint         # Verifica qualidade do código

# Banco de dados e backup
npm run backup       # Backup do banco
npm run restore      # Restaura backup
npm run backup:full  # Backup completo
npm run setup:env    # Configura variáveis de ambiente
```

### Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_KEY=sua-chave-service

# Configurações opcionais
REPORTS_TOP_LIMIT=10
NODE_ENV=development
```

### Processo de Build

```bash
# 1. Lint do código
npm run lint

# 2. Build TypeScript + Vite
npm run build

# 3. Test do build
npm run preview
```

### Deploy

#### Ambientes

- **Development**: Desenvolvimento local
- **Staging**: Testes de homologação
- **Production**: Ambiente de produção

#### Pipeline de Deploy

1. **Validação**:
   ```bash
   npm run lint
   npm run build
   ```

2. **Testes** (quando implementados):
   ```bash
   npm run test
   npm run test:e2e
   ```

3. **Deploy**:
   - Build assets
   - Upload para CDN/servidor
   - Atualizar configurações

### Configuração de .gitignore

```gitignore
# Dependências
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Builds
dist/
build/
.vite/

# Ambiente
.env
.env.local
.env.production

# Backups
backups/
*.sql
*.dump

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log
```

---

## 3. Monitoramento e Manutenção

### Métricas de Sistema

#### Performance
- Tempo de resposta das páginas
- Tempo de carregamento inicial
- Tamanho do bundle
- Uso de memória

#### Banco de Dados
- Tempo de resposta das queries
- Uso de conexões
- Tamanho do banco
- Queries lentas

#### Usuários
- Número de usuários ativos
- Tempo de sessão
- Funcionalidades mais utilizadas
- Erros reportados

### Logs e Auditoria

#### Logs de Aplicação

```typescript
// Exemplo de log estruturado
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      data
    }));
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      error: error?.message,
      stack: error?.stack
    }));
  }
};
```

#### Auditoria de Banco de Dados

```sql
-- Tabela de auditoria
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger de auditoria
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id, action, table_name, record_id, 
    old_data, new_data, created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::TEXT,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

### Manutenção Preventiva

#### Checklist Diário

- [ ] Verificar backups automáticos
- [ ] Monitorar logs de erro
- [ ] Verificar performance das queries
- [ ] Confirmar funcionamento das notificações
- [ ] Validar integridade dos dados críticos

#### Checklist Semanal

- [ ] Analisar métricas de performance
- [ ] Revisar logs de auditoria
- [ ] Verificar espaço em disco
- [ ] Testar processo de restauração
- [ ] Atualizar dependências (se necessário)

#### Checklist Mensal

- [ ] Backup completo para armazenamento externo
- [ ] Análise de segurança
- [ ] Revisão de políticas RLS
- [ ] Limpeza de dados antigos
- [ ] Otimização de queries lentas

### Troubleshooting Comum

#### Problemas de Performance

**Sintoma**: Aplicação lenta

**Diagnóstico**:
1. Verificar React DevTools
2. Analisar Network tab
3. Verificar queries do banco
4. Monitorar uso de memória

**Soluções**:
1. Otimizar componentes pesados
2. Implementar lazy loading
3. Melhorar queries SQL
4. Adicionar índices no banco

#### Problemas de Autenticação

**Sintoma**: Usuários não conseguem logar

**Diagnóstico**:
1. Verificar configuração Supabase
2. Validar tokens JWT
3. Confirmar políticas RLS
4. Verificar logs de erro

**Soluções**:
1. Renovar tokens expirados
2. Corrigir políticas RLS
3. Resetar senha se necessário
4. Verificar configurações de CORS

#### Problemas de Estoque

**Sintoma**: Estoque inconsistente

**Diagnóstico**:
1. Verificar triggers de estoque
2. Analisar `inventory_movements`
3. Conferir vendas sem baixa
4. Validar imports de produtos

**Soluções**:
1. Executar função de recálculo
2. Corrigir triggers quebrados
3. Ajustar estoque manualmente
4. Implementar validações adicionais

### Scripts de Manutenção

#### Limpeza de Dados

```sql
-- Limpar logs antigos (90 dias)
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '90 days';

-- Limpar notificações antigas (30 dias)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days' 
AND read = true;

-- Limpar sessões expiradas
DELETE FROM auth.sessions 
WHERE expires_at < NOW();
```

#### Recálculo de Métricas

```sql
-- Recalcular lifetime value dos clientes
UPDATE customers 
SET lifetime_value = (
  SELECT COALESCE(SUM(final_amount), 0)
  FROM sales 
  WHERE customer_id = customers.id 
  AND status = 'completed'
);

-- Recalcular segmentos de clientes
UPDATE customers 
SET segment = CASE 
  WHEN lifetime_value > 1000 THEN 'VIP'
  WHEN lifetime_value > 500 THEN 'Regular'
  WHEN first_purchase_date > NOW() - INTERVAL '30 days' THEN 'Novo'
  WHEN last_purchase_date < NOW() - INTERVAL '90 days' THEN 'Inativo'
  ELSE 'Regular'
END;
```

#### Otimização de Performance

```sql
-- Analisar queries lentas
SELECT 
  query,
  mean_exec_time,
  calls,
  total_exec_time
FROM pg_stat_statements
WHERE mean_exec_time > 1000
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Verificar índices não utilizados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY relname;

-- Estatísticas de tabelas
SELECT 
  schemaname,
  tablename,
  n_tup_ins,
  n_tup_upd,
  n_tup_del,
  n_live_tup,
  n_dead_tup
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;
```

---

## 4. Segurança e Conformidade

### Políticas de Segurança

#### Controle de Acesso

```sql
-- Política para vendas (vendedores veem apenas suas vendas)
CREATE POLICY "sales_access_policy" ON sales
FOR ALL USING (
  CASE 
    WHEN auth.jwt() ->> 'role' = 'admin' THEN true
    WHEN auth.jwt() ->> 'role' = 'employee' THEN seller_id = auth.uid()
    ELSE false
  END
);

-- Política para produtos (funcionários podem gerenciar)
CREATE POLICY "products_access_policy" ON products
FOR ALL USING (
  auth.jwt() ->> 'role' IN ('admin', 'employee')
);
```

#### Validação de Dados

```typescript
// Validação com Zod
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email().optional(),
  phone: z.string().regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone inválido'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido')
  }).optional()
});
```

### Backup de Segurança

#### Criptografia de Backups

```javascript
// Exemplo de criptografia de backup
const crypto = require('crypto');

const encryptBackup = (data, password) => {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('backup-data'));
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};
```

### Monitoramento de Segurança

#### Detecção de Anomalias

```sql
-- Detectar tentativas de login suspeitas
SELECT 
  email,
  ip_address,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt
FROM auth.audit_log_entries
WHERE event_type = 'login_failed'
  AND created_at > NOW() - INTERVAL '1 hour'
GROUP BY email, ip_address
HAVING COUNT(*) > 5
ORDER BY failed_attempts DESC;

-- Detectar operações administrativas
SELECT 
  user_id,
  action,
  table_name,
  created_at
FROM audit_logs
WHERE action IN ('DELETE', 'TRUNCATE')
  AND table_name IN ('users', 'products', 'sales')
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Conformidade LGPD

#### Anonização de Dados

```sql
-- Função para anonizar dados de cliente
CREATE OR REPLACE FUNCTION anonymize_customer(customer_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE customers 
  SET 
    name = 'Cliente Anônimo',
    email = NULL,
    phone = NULL,
    address = NULL,
    notes = 'Dados anonimizados'
  WHERE id = customer_id;
  
  -- Manter apenas dados essenciais para relatórios
  UPDATE sales 
  SET notes = 'Cliente anonimizado'
  WHERE customer_id = customer_id;
END;
$$ LANGUAGE plpgsql;
```

#### Política de Retenção

```sql
-- Limpar dados antigos conforme política
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '7 years';

DELETE FROM customer_interactions 
WHERE created_at < NOW() - INTERVAL '5 years';

-- Anonizar clientes inativos há mais de 3 anos
SELECT anonymize_customer(id)
FROM customers 
WHERE last_purchase_date < NOW() - INTERVAL '3 years'
  AND name != 'Cliente Anônimo';
```

---

## 5. Disaster Recovery

### Plano de Recuperação

#### Cenário 1: Falha de Aplicação

**Tempo de Recuperação**: 15 minutos

**Procedimento**:
1. Verificar logs de erro
2. Rollback para versão anterior
3. Reiniciar serviços
4. Validar funcionamento

#### Cenário 2: Corrupção de Dados

**Tempo de Recuperação**: 2 horas

**Procedimento**:
1. Identificar escopo da corrupção
2. Restaurar backup mais recente
3. Reprocessar transações perdidas
4. Validar integridade dos dados

#### Cenário 3: Perda Completa do Banco

**Tempo de Recuperação**: 4 horas

**Procedimento**:
1. Provisionar nova instância
2. Restaurar backup completo
3. Reconfigurar aplicação
4. Testar todas as funcionalidades

### Testes de Recuperação

#### Checklist Mensal

- [ ] Testar restauração de backup
- [ ] Validar integridade dos dados
- [ ] Verificar tempo de recuperação
- [ ] Documentar problemas encontrados
- [ ] Atualizar procedimentos

#### Simulação de Desastre

```bash
# Script de teste de recuperação
#!/bin/bash

echo "Iniciando teste de recuperação..."

# 1. Criar backup atual
npm run backup:full

# 2. Simular perda de dados
echo "Simulando perda de dados..."

# 3. Restaurar backup
BACKUP_PATH=$(ls -t backups/ | head -1)
npm run restore -- --path "backups/$BACKUP_PATH"

# 4. Validar restauração
echo "Validando restauração..."
npm run validate:data

echo "Teste de recuperação concluído!"
```

### Contatos de Emergência

#### Equipe Técnica

- **Desenvolvedor Principal**: [contato]
- **Administrador de Banco**: [contato]
- **Suporte Supabase**: [contato]

#### Processo de Escalação

1. **Nível 1**: Desenvolvedor Principal
2. **Nível 2**: Administrador de Banco
3. **Nível 3**: Suporte Supabase

### Documentação de Incidentes

#### Template de Incident Report

```markdown
# Incident Report - [Data]

## Resumo
- **Severidade**: [Alta/Média/Baixa]
- **Impacto**: [Descrição]
- **Duração**: [Tempo de inatividade]

## Timeline
- **00:00** - Incident detectado
- **00:05** - Equipe notificada
- **00:15** - Diagnóstico inicial
- **00:30** - Solução implementada
- **00:45** - Serviço restaurado

## Causa Raiz
[Descrição da causa]

## Solução Aplicada
[Descrição da solução]

## Lições Aprendidas
[O que foi aprendido]

## Ações Preventivas
[Medidas para prevenir recorrência]
```

---

## 6. Atualizações e Manutenção

### Processo de Atualização

#### Dependências

```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências menores
npm update

# Atualizar dependências maiores (com cuidado)
npm install package@latest
```

#### Banco de Dados

```sql
-- Migrations devem ser versionadas
-- Exemplo: migration_001_add_customer_segment.sql

ALTER TABLE customers 
ADD COLUMN segment TEXT 
CHECK (segment IN ('VIP', 'Regular', 'Novo', 'Inativo', 'Em risco'));

-- Atualizar dados existentes
UPDATE customers 
SET segment = 'Regular' 
WHERE segment IS NULL;
```

### Changelog

#### Formato

```markdown
# Changelog

## [1.2.0] - 2025-06-20

### Added
- Sistema de segmentação de clientes
- Indicador de completude de perfil
- Relatórios com filtros avançados

### Changed
- Melhorada performance das queries de relatórios
- Refatorados hooks do CRM

### Fixed
- Corrigido bug de cálculo de estoque
- Ajustado problema de sincronização

### Security
- Implementadas novas políticas RLS
- Melhorada validação de entrada
```

### Planejamento de Manutenção

#### Janela de Manutenção

- **Horário**: Domingos, 2h às 4h
- **Duração Máxima**: 2 horas
- **Notificação**: 48h de antecedência

#### Checklist de Manutenção

- [ ] Backup completo antes da manutenção
- [ ] Testar em ambiente de staging
- [ ] Documentar alterações
- [ ] Validar funcionamento pós-manutenção
- [ ] Notificar usuários sobre conclusão

Esta documentação operacional deve ser revista e atualizada regularmente para garantir que todos os processos permaneçam eficazes e atualizados.