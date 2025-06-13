// setup-env.cjs - Script para configurar o arquivo .env para backup
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Verificar se o arquivo .env existe
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Arquivo .env encontrado. Verificando variáveis...');
} else {
  console.log('Arquivo .env não encontrado. Será criado um novo arquivo.');
}

// Extrair variáveis existentes
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

// Função para perguntar e atualizar variável
function askForVariable(varName, description, defaultValue = '') {
  return new Promise((resolve) => {
    const currentValue = envVars[varName] || defaultValue;
    rl.question(`${description} [${currentValue || 'não definido'}]: `, (answer) => {
      const value = answer.trim() || currentValue;
      envVars[varName] = value;
      resolve();
    });
  });
}

// Função principal
async function setupEnv() {
  console.log('\n=== Configuração do Ambiente para Backup do Supabase ===\n');
  
  console.log('Estas informações são necessárias para realizar backups do banco de dados Supabase.');
  console.log('Você pode encontrar estas informações no dashboard do Supabase em "Project Settings" > "API".\n');
  
  await askForVariable('VITE_SUPABASE_URL', 'URL do projeto Supabase (ex: https://abcdefghijklm.supabase.co)');
  await askForVariable('VITE_SUPABASE_ANON_KEY', 'Chave anônima do Supabase (anon key)');
  await askForVariable('SUPABASE_SERVICE_KEY', 'Chave de serviço do Supabase (service_role key)');
  
  // Gerar conteúdo do arquivo .env
  let newEnvContent = '# Variáveis de ambiente para o Adega Manager\n\n';
  newEnvContent += '# Supabase - Conexão\n';
  newEnvContent += `VITE_SUPABASE_URL=${envVars.VITE_SUPABASE_URL}\n`;
  newEnvContent += `VITE_SUPABASE_ANON_KEY=${envVars.VITE_SUPABASE_ANON_KEY}\n\n`;
  newEnvContent += '# Supabase - Chave de serviço (usada para backups)\n';
  newEnvContent += '# IMPORTANTE: Nunca exponha esta chave no frontend\n';
  newEnvContent += `SUPABASE_SERVICE_KEY=${envVars.SUPABASE_SERVICE_KEY}\n`;
  
  // Preservar outras variáveis existentes
  Object.keys(envVars).forEach(key => {
    if (!['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'].includes(key)) {
      newEnvContent += `\n# Outras variáveis\n${key}=${envVars[key]}\n`;
    }
  });
  
  // Salvar arquivo
  fs.writeFileSync(envPath, newEnvContent);
  
  console.log('\nArquivo .env atualizado com sucesso!');
  console.log(`Caminho do arquivo: ${envPath}`);
  console.log('\nAgora você pode executar o backup com o comando:');
  console.log('npm run backup:full');
  
  rl.close();
}

// Executar configuração
setupEnv(); 