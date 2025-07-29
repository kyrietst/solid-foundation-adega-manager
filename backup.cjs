// backup.cjs - Versão CommonJS do script de backup
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurações
const BACKUP_DIR = path.join(__dirname, 'backups');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Chave de serviço, não a anon key

// Verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Erro: As variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidas no arquivo .env');
  process.exit(1);
}

// Extrair o ID do projeto da URL
const DB_URL = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
const CONNECTION_STRING = `postgres://postgres:${SUPABASE_SERVICE_KEY}@db.${DB_URL}.supabase.co:5432/postgres`;

// Criar diretório de backups se não existir
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Diretório de backups criado: ${BACKUP_DIR}`);
}

// Nome do arquivo de backup com timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `backup_${timestamp}.sql`);

// Comando pg_dump
const pgDumpCmd = `pg_dump "${CONNECTION_STRING}" --clean --if-exists > "${backupFile}"`;

// Executar backup
console.log('Iniciando backup do banco de dados...');
console.log(`Salvando em: ${backupFile}`);

exec(pgDumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao realizar backup: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Stderr: ${stderr}`);
    return;
  }
  
  console.log(`Backup concluído com sucesso: ${backupFile}`);
  
  // Limpar backups antigos (manter últimos 7)
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup_'))
    .map(file => path.join(BACKUP_DIR, file));
  
  if (files.length > 7) {
    console.log('Removendo backups antigos...');
    files
      .sort((a, b) => fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime())
      .slice(0, files.length - 7)
      .forEach(file => {
        fs.unlinkSync(file);
        console.log(`Backup antigo removido: ${file}`);
      });
  }
  
  console.log(`Total de backups armazenados: ${Math.min(files.length, 7)}`);
}); 