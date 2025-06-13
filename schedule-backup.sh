#!/bin/bash

echo "Configurando backup diário para o banco de dados Supabase do Adega Manager..."

# Obter o caminho completo do diretório do projeto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Verificar se o crontab está disponível
if ! command -v crontab &> /dev/null; then
    echo "Erro: crontab não encontrado. Instale o cron para continuar."
    exit 1
fi

# Criar entrada no crontab
echo "Adicionando tarefa de backup ao crontab..."

# Backup às 2 AM diariamente
CRON_JOB="0 2 * * * cd $PROJECT_DIR && npm run backup:full >> $PROJECT_DIR/backups/backup.log 2>&1"

# Adicionar ao crontab (sem duplicar)
(crontab -l 2>/dev/null | grep -v "npm run backup" ; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo "Backup diário configurado com sucesso!"
    echo "O backup será executado diariamente às 2:00 AM."
    echo ""
    echo "Para verificar a tarefa, execute: crontab -l"
    echo "Para remover a tarefa, edite o crontab: crontab -e"
    echo "Os logs de backup serão salvos em: $PROJECT_DIR/backups/backup.log"
else
    echo ""
    echo "Erro ao configurar o backup diário."
fi

# Garantir que o script de backup tenha permissão de execução
chmod +x "$PROJECT_DIR/full-backup.cjs" 