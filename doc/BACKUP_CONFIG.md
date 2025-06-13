# Configuração do Sistema de Backup do Supabase

Este documento fornece instruções detalhadas para configurar e usar o sistema de backup do Adega Manager para o banco de dados Supabase.

## Requisitos

- Node.js 14+ instalado
- Acesso ao projeto Supabase (URL e chaves de API)
- Permissões de administrador no banco de dados Supabase

## Configuração Inicial

### 1. Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# Configurações do Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_KEY=sua-chave-de-servico-aqui
```

> **IMPORTANTE**: A chave de serviço (`SUPABASE_SERVICE_KEY`) tem permissões administrativas. Nunca a exponha publicamente ou a inclua no controle de versão.

Para obter estas chaves:

1. Acesse o [Dashboard do Supabase](https://app.supabase.com)
2. Selecione seu projeto
3. Vá para "Project Settings" > "API"
4. Copie a URL do projeto e a chave anônima
5. Para a chave de serviço, vá para "Project Settings" > "API" > "Service Role Secret"

### 2. Instalação de Dependências

O sistema de backup requer a biblioteca `@supabase/supabase-js`. Instale-a com:

```bash
npm install @supabase/supabase-js dotenv
```

### 3. Estrutura de Arquivos

Verifique se os seguintes arquivos existem na raiz do projeto:

- `full-backup.cjs`: Script principal de backup
- `restore-backup.cjs`: Script de restauração

E se os seguintes scripts estão configurados no `package.json`:

```json
"scripts": {
  "backup:full": "node full-backup.cjs",
  "restore": "node restore-backup.cjs"
}
```

### 4. Diretório de Backups

O sistema criará automaticamente um diretório `backups/` na raiz do projeto para armazenar os backups. Certifique-se de que:

- O diretório `backups/` está incluído no `.gitignore`
- O usuário que executa o Node.js tem permissões de escrita neste diretório

## Uso do Sistema de Backup

### Criando um Backup Manual

Para criar um backup manualmente:

```bash
# Usando npm
npm run backup:full

# Ou diretamente
node full-backup.cjs
```

O backup será salvo em um novo diretório dentro de `backups/` com um timestamp no nome, por exemplo:
```
backups/backup_2025-06-12T23-59-05-919Z/
```

### Verificando Backups Existentes

Para listar os backups disponíveis:

```bash
# No Windows
dir backups

# No Linux/macOS
ls -la backups
```

Para ver o conteúdo de um backup específico:

```bash
# No Windows
dir backups\backup_2025-06-12T23-59-05-919Z

# No Linux/macOS
ls -la backups/backup_2025-06-12T23-59-05-919Z
```

### Restaurando um Backup

Para restaurar um backup:

```bash
# Usando npm (note o espaço entre restore e --)
npm run restore -- --path ./backups/backup_2025-06-12T23-59-05-919Z

# Ou diretamente
node restore-backup.cjs --path ./backups/backup_2025-06-12T23-59-05-919Z
```

## Configuração de Backup Automático

### No Windows

1. Abra o Agendador de Tarefas (Task Scheduler)
   - Pressione `Win + R`, digite `taskschd.msc` e pressione Enter

2. Clique em "Criar Tarefa Básica" no painel direito

3. Configure a tarefa:
   - **Nome**: "Backup Adega Manager"
   - **Descrição**: "Backup automático do banco de dados Supabase"
   - **Trigger**: Escolha a frequência desejada (diária, semanal, etc.)
   - **Ação**: Escolha "Iniciar um programa"
   - **Programa/script**: `node`
   - **Argumentos**: `full-backup.cjs`
   - **Iniciar em**: Caminho completo para o diretório do projeto
     (ex: `D:\1. LUCCAS\aplicativos ai\adega\solid-foundation-adega-manager`)

4. Opções adicionais:
   - Na guia "Condições", desmarque "Iniciar a tarefa somente se o computador estiver ocioso"
   - Na guia "Configurações", marque "Executar tarefa o mais rápido possível se uma execução agendada for perdida"

### No Linux/macOS

1. Abra o terminal e edite o crontab:
   ```bash
   crontab -e
   ```

2. Adicione uma linha para executar o backup diariamente às 2h da manhã:
   ```
   0 2 * * * cd /caminho/completo/para/seu/projeto && /usr/bin/node full-backup.cjs >> /caminho/completo/para/seu/projeto/backup.log 2>&1
   ```

## Gerenciamento de Backups

### Rotação Automática

O sistema mantém automaticamente os 7 backups mais recentes e remove os mais antigos. Para alterar este comportamento, edite a constante no arquivo `full-backup.cjs`:

```javascript
// Altere este valor para manter mais ou menos backups
const MAX_BACKUPS = 7;
```

### Backup Externo

Recomendamos copiar periodicamente os backups para um local externo:

1. **Armazenamento em nuvem**: Google Drive, Dropbox, OneDrive, etc.
2. **Dispositivo externo**: Disco rígido externo ou pen drive
3. **Servidor remoto**: Usando SFTP, SCP ou rsync

Exemplo de script para copiar backups para um disco externo no Windows:

```batch
@echo off
xcopy /E /I /Y "D:\1. LUCCAS\aplicativos ai\adega\solid-foundation-adega-manager\backups" "E:\Backups\adega-manager"
```

## Solução de Problemas

### Erro: Falha na autenticação

**Sintoma**: Mensagem de erro "Falha na autenticação" ou "Authentication failed"

**Solução**:
1. Verifique se as variáveis de ambiente estão configuradas corretamente no arquivo `.env`
2. Confirme se a chave de serviço não expirou no dashboard do Supabase
3. Verifique se o projeto Supabase ainda está ativo

### Erro: Tabela não existe

**Sintoma**: Mensagem de erro "relation does not exist"

**Solução**:
1. Este é um comportamento normal para tabelas que não existem no banco de dados
2. O sistema tentará fazer backup apenas das tabelas que existem
3. Se precisar criar uma tabela, use o SQL Editor no dashboard do Supabase

### Erro: Falha na restauração

**Sintoma**: Erros durante o processo de restauração

**Solução**:
1. Verifique se o banco de dados de destino tem o mesmo esquema que o backup
2. Certifique-se de que a chave de serviço tem permissões para inserir/atualizar dados
3. Se houver conflitos de chave primária, o sistema tentará usar upsert para resolver

## Verificação de Integridade dos Backups

Recomendamos verificar periodicamente a integridade dos backups:

1. Restaure um backup em um ambiente de teste
2. Verifique se todos os dados foram restaurados corretamente
3. Teste as funcionalidades principais do aplicativo

## Conclusão

Seguindo estas instruções de configuração, você terá um sistema de backup robusto e automatizado para o banco de dados Supabase do Adega Manager. Lembre-se de testar regularmente o processo de restauração para garantir que seus backups estão funcionando corretamente. 