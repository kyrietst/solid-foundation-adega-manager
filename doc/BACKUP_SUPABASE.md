# Guia de Backup do Banco de Dados Supabase

Este documento descreve as estratégias para realizar backup e restauração do banco de dados Supabase no projeto Adega Manager.

## Sistema de Backup Implementado

O Adega Manager implementa um sistema de backup completo baseado na API do Supabase, que não depende do `pg_dump` e pode ser executado em qualquer ambiente.

### Características do Sistema de Backup

- Backup completo de todas as tabelas do banco de dados
- Armazenamento dos dados em formato JSON
- Backup das configurações do projeto
- Backup de arquivos de migração (quando disponíveis)
- Backup de funções Edge (quando disponíveis)
- Rotação automática de backups (mantém os 7 mais recentes)
- Documentação detalhada para restauração

### Como Executar um Backup

Para criar um novo backup do banco de dados:

```bash
# Usando o script npm
npm run backup:full

# Ou diretamente com Node.js
node full-backup.cjs
```

O backup será salvo na pasta `backups/` com um timestamp no nome do diretório, por exemplo:
```
backups/backup_2025-06-12T23-59-05-919Z/
```

Cada diretório de backup contém:
- `database.json`: Dados de todas as tabelas
- `project-config.json`: Configurações do projeto
- `README.md`: Instruções de restauração
- `migrations/`: Arquivos de migração (se existirem)
- `functions/`: Funções Edge (se existirem)

### Quando Criar um Novo Backup

Recomendamos criar um novo backup:

1. **Antes de fazer alterações significativas** no esquema do banco de dados
2. **Após implementar novas funcionalidades** e confirmar que estão funcionando corretamente
3. **Periodicamente** (diariamente ou semanalmente) como parte da rotina de manutenção
4. **Antes de atualizar** o aplicativo para uma nova versão
5. **Após importação de dados** importantes

## Restauração de Backup

O sistema inclui um script de restauração completo que pode recuperar o banco de dados para um estado anterior.

### Como Restaurar um Backup

Para restaurar um backup:

```bash
# Usando o script npm
npm run restore -- --path ./backups/backup_2025-06-12T23-59-05-919Z

# Ou diretamente com Node.js
node restore-backup.cjs --path ./backups/backup_2025-06-12T23-59-05-919Z
```

O processo de restauração:
1. Carrega os dados do arquivo `database.json`
2. Para cada tabela:
   - Verifica se a tabela existe
   - Remove os dados existentes
   - Insere os dados do backup
3. Restaura arquivos de migração (se presentes no backup)
4. Restaura funções Edge (se presentes no backup)

### Quando Restaurar um Backup

Você deve restaurar um backup quando:

1. **Dados foram perdidos** acidentalmente
2. **Tabelas foram corrompidas** ou excluídas
3. **Uma migração falhou** e causou problemas no banco de dados
4. **Precisa reverter** para uma versão anterior conhecida e estável
5. **Está configurando** um novo ambiente de desenvolvimento/teste

## Configuração do Sistema de Backup

O sistema de backup utiliza variáveis de ambiente para acessar o Supabase:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do Supabase (para acesso público)
- `SUPABASE_SERVICE_KEY`: Chave de serviço do Supabase (para acesso administrativo)

Estas variáveis devem estar definidas no arquivo `.env` na raiz do projeto:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_KEY=sua-chave-de-servico-aqui
```

> **IMPORTANTE**: Nunca comite o arquivo `.env` no controle de versão. Certifique-se de que ele está incluído no `.gitignore`.

## Agendamento de Backups Automáticos

### No Windows (usando Task Scheduler)

1. Abra o Agendador de Tarefas do Windows (`taskschd.msc`)
2. Clique em "Criar Tarefa Básica"
3. Dê um nome como "Backup Adega Manager"
4. Escolha a frequência (diária, semanal, etc.)
5. Em "Ação", escolha "Iniciar um programa"
6. No campo "Programa/script", insira: `node`
7. No campo "Argumentos", insira: `full-backup.cjs`
8. No campo "Iniciar em", insira o caminho completo para o diretório do projeto: `D:\1. LUCCAS\aplicativos ai\adega\solid-foundation-adega-manager`
9. Conclua o assistente

### No Linux/macOS (usando cron)

1. Abra o crontab: `crontab -e`
2. Adicione uma linha para backup diário às 2h da manhã:
   ```
   0 2 * * * cd /caminho/para/seu/projeto && npm run backup:full
   ```

## Boas Práticas

1. **Realize backups regularmente** (pelo menos semanalmente)
2. **Teste seus backups** periodicamente para garantir que podem ser restaurados
3. **Copie os backups** para um local externo (nuvem, disco externo, etc.)
4. **Mantenha versões** de backups de diferentes estágios do desenvolvimento
5. **Documente as alterações** feitas no banco de dados entre os backups

## Solução de Problemas

### Erros no Backup

- **Erro de autenticação**: Verifique se as variáveis de ambiente estão configuradas corretamente
- **Tabelas não encontradas**: O sistema tentará fazer backup apenas das tabelas que existem
- **Erro de permissão**: Certifique-se de que está usando a chave de serviço com permissões adequadas

### Erros na Restauração

- **Conflitos de chave primária**: O sistema tenta resolver automaticamente usando upsert
- **Tabelas não existem**: Certifique-se de que as tabelas foram criadas antes da restauração
- **Erro de permissão**: Verifique se a chave de serviço tem permissões para inserir/atualizar dados

## Exemplo de Fluxo de Trabalho

1. **Início do desenvolvimento**:
   - Criar estrutura inicial do banco de dados
   - Realizar backup inicial (`npm run backup:full`)

2. **Durante o desenvolvimento**:
   - Implementar novas funcionalidades
   - Testar e confirmar que tudo funciona
   - Criar novo backup (`npm run backup:full`)

3. **Em caso de problemas**:
   - Identificar o último backup estável
   - Restaurar para esse backup (`npm run restore -- --path ./backups/backup_XXX`)
   - Continuar o desenvolvimento a partir desse ponto

## Arquivos do Sistema de Backup

- `full-backup.cjs`: Script principal de backup
- `restore-backup.cjs`: Script de restauração
- `backups/`: Diretório onde os backups são armazenados

## Conclusão

O sistema de backup implementado fornece uma solução robusta para proteger os dados do Adega Manager. Seguindo as práticas recomendadas neste documento, você pode garantir que seus dados estarão seguros e poderão ser recuperados em caso de problemas. 