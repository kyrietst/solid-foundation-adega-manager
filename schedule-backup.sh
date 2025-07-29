#!/bin/bash

echo "Configurando backup diário automático para o Adega Manager (Sistema Enterprise)..."
echo "Sistema em produção ativa - 925+ registros reais"

# Obter o caminho completo do diretório do projeto
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Cores para output melhorado
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar dependências
echo -e "${BLUE}🔍 Verificando dependências...${NC}"

if ! command -v crontab &> /dev/null; then
    echo -e "${RED}❌ Erro: crontab não encontrado.${NC}"
    echo "Instale o cron para continuar:"
    echo "  Ubuntu/Debian: sudo apt-get install cron"
    echo "  CentOS/RHEL: sudo yum install cronie"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Erro: npm não encontrado.${NC}"
    echo "Instale o Node.js e npm para continuar."
    exit 1
fi

# Verificar se o script de backup existe
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado no diretório do projeto.${NC}"
    exit 1
fi

# Criar diretório de backups se não existir
mkdir -p "$PROJECT_DIR/backups"

echo -e "${BLUE}📋 Configurando backup automático...${NC}"

# Backup às 2 AM diariamente com logs detalhados
CRON_JOB="0 2 * * * cd $PROJECT_DIR && npm run backup:full >> $PROJECT_DIR/backups/backup.log 2>&1"

# Adicionar ao crontab (sem duplicar)
(crontab -l 2>/dev/null | grep -v "npm run backup" ; echo "$CRON_JOB") | crontab -

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Backup automático configurado com sucesso!${NC}"
    echo ""
    echo -e "${BLUE}📋 Detalhes da configuração:${NC}"
    echo "   • Horário: Diariamente às 2:00 AM"
    echo "   • Comando: npm run backup:full"
    echo "   • Diretório: $PROJECT_DIR"
    echo "   • Logs: $PROJECT_DIR/backups/backup.log"
    echo ""
    echo -e "${BLUE}🔧 Comandos úteis:${NC}"
    echo "   • Verificar tarefas: crontab -l"
    echo "   • Editar crontab: crontab -e"
    echo "   • Visualizar logs: tail -f $PROJECT_DIR/backups/backup.log"
    echo "   • Backup manual: cd $PROJECT_DIR && npm run backup:full"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE: Sistema em produção ativa - backups críticos para integridade dos dados${NC}"
else
    echo ""
    echo -e "${RED}❌ Erro ao configurar o backup diário.${NC}"
    echo "Verifique as permissões e tente novamente."
fi

# Garantir permissões corretas nos scripts
chmod +x "$PROJECT_DIR"/*.cjs 2>/dev/null
chmod +x "$PROJECT_DIR"/*.sh 2>/dev/null

echo ""
echo -e "${GREEN}✅ Configuração concluída.${NC}" 