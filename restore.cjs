// restore.cjs - Script para restaurar backups do banco de dados
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

// Configurações
const BACKUP_DIR = path.join(__dirname, 'backups');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Erro: As variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidas no arquivo .env');
  process.exit(1);
}

// Extrair o ID do projeto da URL
const DB_URL = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const CONNECTION_STRING = `postgres://postgres:${SUPABASE_SERVICE_KEY}@db.${DB_URL}.supabase.co:5432/postgres`;

// Verificar se o diretório de backups existe
if (!fs.existsSync(BACKUP_DIR)) {
  console.error(`Erro: Diretório de backups não encontrado: ${BACKUP_DIR}`);
  process.exit(1);
}

// Listar arquivos de backup disponíveis
const backupFiles = fs.readdirSync(BACKUP_DIR)
  .filter(file => file.startsWith('backup_') && file.endsWith('.sql'))
  .sort((a, b) => {
    // Ordenar por data (mais recente primeiro)
    const statA = fs.statSync(path.join(BACKUP_DIR, a));
    const statB = fs.statSync(path.join(BACKUP_DIR, b));
    return statB.mtime.getTime() - statA.mtime.getTime();
  });

if (backupFiles.length === 0) {
  console.error('Nenhum arquivo de backup encontrado.');
  process.exit(1);
}

// Interface para interação com o usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Exibir lista de backups disponíveis
console.log('\nBackups disponíveis:');
backupFiles.forEach((file, index) => {
  const stats = fs.statSync(path.join(BACKUP_DIR, file));
  const fileDate = stats.mtime.toLocaleString();
  console.log(`[${index + 1}] ${file} (${fileDate})`);
});

// Solicitar ao usuário que escolha um backup
rl.question('\nDigite o número do backup que deseja restaurar: ', (answer) => {
  const index = parseInt(answer) - 1;
  
  if (isNaN(index) || index < 0 || index >= backupFiles.length) {
    console.error('Opção inválida.');
    rl.close();
    process.exit(1);
  }
  
  const selectedFile = backupFiles[index];
  const backupPath = path.join(BACKUP_DIR, selectedFile);
  
  // Confirmar restauração
  rl.question(`\nATENÇÃO: Você está prestes a restaurar o banco de dados a partir do backup: ${selectedFile}\nTodos os dados atuais serão substituídos. Continuar? (s/N): `, (confirm) => {
    if (confirm.toLowerCase() !== 's') {
      console.log('Operação cancelada pelo usuário.');
      rl.close();
      return;
    }
    
    console.log(`\nIniciando restauração do backup: ${selectedFile}`);
    console.log('Este processo pode levar alguns minutos...');
    
    // Comando para restaurar o backup
    const restoreCmd = `psql "${CONNECTION_STRING}" < "${backupPath}"`;
    
    exec(restoreCmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao restaurar backup: ${error.message}`);
        rl.close();
        return;
      }
      
      if (stderr) {
        console.error(`Avisos durante a restauração: ${stderr}`);
      }
      
      console.log('\nRestauração concluída com sucesso!');
      console.log('Seu banco de dados foi restaurado para o estado do backup selecionado.');
      rl.close();
    });
  });
}); 