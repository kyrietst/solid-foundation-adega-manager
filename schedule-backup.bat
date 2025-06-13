@echo off
echo Configurando backup diário para o banco de dados Supabase do Adega Manager...

:: Obter o caminho completo do diretório do projeto
set PROJECT_DIR=%~dp0
set PROJECT_DIR=%PROJECT_DIR:~0,-1%

:: Criar a tarefa agendada
echo Criando tarefa agendada para backup diário às 2:00 AM...

:: Comando para criar a tarefa agendada (adaptado para Windows em português)
schtasks /create /tn "AdegaManagerBackup" /tr "cmd.exe /c \"cd /d %PROJECT_DIR% && npm run backup:full\"" /sc DAILY /st 02:00 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Backup diário configurado com sucesso!
    echo A tarefa "AdegaManagerBackup" foi criada e será executada diariamente às 2:00 AM.
    echo.
    echo Para verificar a tarefa, execute: schtasks /query /tn "AdegaManagerBackup"
    echo Para remover a tarefa, execute: schtasks /delete /tn "AdegaManagerBackup" /f
) else (
    echo.
    echo Erro ao criar a tarefa agendada. Verifique se você está executando como administrador.
)

pause 