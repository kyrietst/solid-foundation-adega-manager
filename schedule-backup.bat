@echo off
echo Configurando backup diário automático para o Adega Manager (Sistema Enterprise)...

:: Obter o caminho completo do diretório do projeto
set PROJECT_DIR=%~dp0
set PROJECT_DIR=%PROJECT_DIR:~0,-1%

:: Verificar se está executando como administrador
net session >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERRO: Este script deve ser executado como Administrador.
    echo Clique com o botão direito e selecione "Executar como administrador".
    echo.
    pause
    exit /b 1
)

:: Criar a tarefa agendada para produção
echo Criando tarefa agendada para backup diário às 2:00 AM...
echo Sistema Enterprise - 925+ registros em produção ativa

:: Comando para criar a tarefa agendada
schtasks /create /tn "AdegaManagerBackup" /tr "cmd.exe /c \"cd /d %PROJECT_DIR% && npm run backup:full\"" /sc DAILY /st 02:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Backup automático configurado com sucesso!
    echo.
    echo 📋 Detalhes da configuração:
    echo    • Tarefa: AdegaManagerBackup
    echo    • Horário: Diariamente às 2:00 AM
    echo    • Comando: npm run backup:full
    echo    • Diretório: %PROJECT_DIR%
    echo.
    echo 🔧 Comandos úteis:
    echo    • Verificar tarefa: schtasks /query /tn "AdegaManagerBackup"
    echo    • Executar manualmente: schtasks /run /tn "AdegaManagerBackup"
    echo    • Remover tarefa: schtasks /delete /tn "AdegaManagerBackup" /f
    echo.
    echo ⚠️  IMPORTANTE: Sistema em produção ativa - backups críticos para integridade dos dados
) else (
    echo.
    echo ❌ Erro ao criar a tarefa agendada.
    echo    Verifique se:
    echo    • Está executando como administrador
    echo    • O npm está instalado e disponível no PATH
    echo    • O projeto possui o script backup:full
)

echo.
pause 