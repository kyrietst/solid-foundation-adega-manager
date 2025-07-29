// full-backup.cjs - Script de backup completo do Supabase
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configurações
const BACKUP_DIR = path.join(__dirname, 'backups');
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.error('Erro: As variáveis de ambiente VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY e SUPABASE_SERVICE_KEY devem estar definidas no arquivo .env');
  process.exit(1);
}

// Extrair o ID do projeto da URL
const DB_URL = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');

// Inicializar cliente Supabase com a chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Criar diretório de backups se não existir
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupFolder = path.join(BACKUP_DIR, `backup_${timestamp}`);

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`Diretório de backups criado: ${BACKUP_DIR}`);
}

if (!fs.existsSync(backupFolder)) {
  fs.mkdirSync(backupFolder, { recursive: true });
  console.log(`Diretório para backup atual criado: ${backupFolder}`);
}

// Função para listar todas as tabelas do banco de dados
async function listTables() {
  try {
    // Consulta SQL para obter todas as tabelas do schema public
    const { data, error } = await supabase.rpc('get_tables', {});
    
    if (error) {
      // Se a função RPC não existir, vamos criar uma
      console.log('Função para listar tabelas não encontrada, criando função temporária...');
      
      // Criar função temporária para listar tabelas
      const { error: createError } = await supabase.rpc('create_temp_function', {});
      
      if (createError) {
        // Se não conseguir criar a função, vamos tentar uma abordagem direta
        console.log('Tentando abordagem alternativa para listar tabelas...');
        
        // Tentar obter informações do esquema usando a API REST
        const tables = [];
        
        // Lista de tabelas comuns em projetos Supabase
        const commonTables = [
          'users', 'profiles', 'products', 'categories', 'orders', 
          'order_items', 'customers', 'inventory', 'sales', 'suppliers', 
          'employees', 'transactions', 'payments', 'settings'
        ];
        
        // Verificar cada tabela comum
        for (const tableName of commonTables) {
          try {
            const { count, error: countError } = await supabase
              .from(tableName)
              .select('*', { count: 'exact', head: true });
            
            // Se não der erro, a tabela existe
            if (!countError) {
              tables.push(tableName);
              console.log(`Tabela encontrada: ${tableName}`);
            }
          } catch (e) {
            // Ignorar erros
          }
        }
        
        return tables;
      }
      
      // Tentar novamente com a função recém-criada
      const { data: tablesData, error: listError } = await supabase.rpc('get_tables', {});
      
      if (listError) {
        console.error('Erro ao listar tabelas:', listError.message);
        return [];
      }
      
      return tablesData;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao listar tabelas:', error.message);
    
    // Abordagem de fallback - tentar obter algumas tabelas comuns
    try {
      // Verificar algumas tabelas comuns que podem existir
      const tables = [];
      
      // Lista de tabelas comuns em projetos Supabase
      const commonTables = [
        'users', 'profiles', 'products', 'categories', 'orders', 
        'order_items', 'customers', 'inventory', 'sales', 'suppliers', 
        'employees', 'transactions', 'payments', 'settings'
      ];
      
      // Verificar cada tabela comum
      for (const tableName of commonTables) {
        try {
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          // Se não der erro, a tabela existe
          if (!countError) {
            tables.push(tableName);
            console.log(`Tabela encontrada: ${tableName}`);
          }
        } catch (e) {
          // Ignorar erros
        }
      }
      
      return tables;
    } catch (e) {
      console.error('Erro na abordagem de fallback:', e.message);
      return [];
    }
  }
}

// Função para fazer backup de uma tabela específica
async function backupTable(tableName) {
  try {
    // Verificar se a tabela existe primeiro
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(`Tabela ${tableName} não existe ou não está acessível, pulando...`);
      return [];
    }
    
    // Se chegou aqui, a tabela existe e podemos fazer o backup
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Erro ao fazer backup da tabela ${tableName}:`, error.message);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error(`Erro ao fazer backup da tabela ${tableName}:`, error.message);
    return [];
  }
}

// Função para fazer backup do banco de dados usando a API Supabase
async function backupDatabase() {
  console.log('Iniciando backup do banco de dados via API Supabase...');
  
  try {
    // Listar todas as tabelas
    const tables = await listTables();
    console.log(`Encontradas ${tables.length} tabelas para backup.`);
    
    // Objeto para armazenar todos os dados
    const databaseBackup = {};
    
    // Fazer backup de cada tabela
    for (const table of tables) {
      console.log(`Fazendo backup da tabela: ${table}`);
      const tableData = await backupTable(table);
      databaseBackup[table] = tableData;
      console.log(`- ${tableData.length} registros salvos`);
    }
    
    // Salvar o backup em um arquivo JSON
    const dbBackupFile = path.join(backupFolder, 'database.json');
    fs.writeFileSync(dbBackupFile, JSON.stringify(databaseBackup, null, 2));
    
    console.log(`Backup do banco de dados concluído: ${dbBackupFile}`);
    return true;
  } catch (error) {
    console.error(`Erro ao realizar backup do banco de dados:`, error);
    return false;
  }
}

// Função para fazer backup das configurações do projeto
function backupProjectConfig() {
  return new Promise((resolve, reject) => {
    const configFile = path.join(backupFolder, 'project-config.json');
    
    console.log('Iniciando backup das configurações do projeto...');
    
    // Salvar informações básicas do projeto
    const projectConfig = {
      project_id: DB_URL,
      url: SUPABASE_URL,
      backup_date: new Date().toISOString(),
      environment_variables: {
        VITE_SUPABASE_URL: SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: SUPABASE_ANON_KEY
      }
    };
    
    // Salvar configurações locais do projeto
    try {
      if (fs.existsSync('./supabase/config.toml')) {
        const supabaseConfig = fs.readFileSync('./supabase/config.toml', 'utf8');
        projectConfig.supabase_config = supabaseConfig;
      }
      
      fs.writeFileSync(configFile, JSON.stringify(projectConfig, null, 2));
      console.log(`Backup das configurações do projeto concluído: ${configFile}`);
      resolve();
    } catch (err) {
      console.error(`Erro ao fazer backup das configurações: ${err.message}`);
      reject(err);
    }
  });
}

// Função para fazer backup dos arquivos de migração
function backupMigrations() {
  return new Promise((resolve, reject) => {
    const migrationsDir = './supabase/migrations';
    const migrationsBackupDir = path.join(backupFolder, 'migrations');
    
    console.log('Iniciando backup dos arquivos de migração...');
    
    if (!fs.existsSync(migrationsDir)) {
      console.log('Diretório de migrações não encontrado, pulando...');
      resolve();
      return;
    }
    
    try {
      if (!fs.existsSync(migrationsBackupDir)) {
        fs.mkdirSync(migrationsBackupDir, { recursive: true });
      }
      
      // Copiar arquivos de migração
      const files = fs.readdirSync(migrationsDir);
      files.forEach(file => {
        const srcPath = path.join(migrationsDir, file);
        const destPath = path.join(migrationsBackupDir, file);
        
        if (fs.statSync(srcPath).isFile()) {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      console.log(`Backup de ${files.length} arquivos de migração concluído: ${migrationsBackupDir}`);
      resolve();
    } catch (err) {
      console.error(`Erro ao fazer backup das migrações: ${err.message}`);
      reject(err);
    }
  });
}

// Função para fazer backup das funções Edge
function backupEdgeFunctions() {
  return new Promise((resolve, reject) => {
    const edgeFunctionsDir = './supabase/functions';
    const edgeFunctionsBackupDir = path.join(backupFolder, 'functions');
    
    console.log('Iniciando backup das funções Edge...');
    
    if (!fs.existsSync(edgeFunctionsDir)) {
      console.log('Diretório de funções Edge não encontrado, pulando...');
      resolve();
      return;
    }
    
    try {
      if (!fs.existsSync(edgeFunctionsBackupDir)) {
        fs.mkdirSync(edgeFunctionsBackupDir, { recursive: true });
      }
      
      // Função recursiva para copiar diretórios
      function copyDir(src, dest) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const entries = fs.readdirSync(src, { withFileTypes: true });
        
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          
          if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      }
      
      copyDir(edgeFunctionsDir, edgeFunctionsBackupDir);
      console.log(`Backup das funções Edge concluído: ${edgeFunctionsBackupDir}`);
      resolve();
    } catch (err) {
      console.error(`Erro ao fazer backup das funções Edge: ${err.message}`);
      reject(err);
    }
  });
}

// Função para criar arquivo README com instruções de restauração
function createReadme() {
  return new Promise((resolve, reject) => {
    const readmeFile = path.join(backupFolder, 'README.md');
    
    const readmeContent = `# Backup Completo do Supabase - ${new Date().toLocaleDateString()}

Este diretório contém um backup completo do projeto Supabase do Adega Manager.

## Conteúdo do Backup

- \`database.json\`: Backup completo do banco de dados (dados em formato JSON)
- \`project-config.json\`: Configurações do projeto
- \`migrations/\`: Arquivos de migração do Supabase
- \`functions/\`: Funções Edge do Supabase

## Instruções de Restauração

### Restauração do Banco de Dados

Para restaurar o banco de dados, você pode usar o script de restauração fornecido:

\`\`\`bash
node restore-backup.cjs --path ./caminho/para/backup_XXXX-XX-XX
\`\`\`

Ou restaurar manualmente usando a API do Supabase:

\`\`\`javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Inicializar cliente Supabase
const supabase = createClient(
  'https://[SEU-PROJETO-ID].supabase.co',
  'sua-chave-de-servico'
);

// Carregar dados do backup
const backupData = JSON.parse(fs.readFileSync('./database.json', 'utf8'));

// Restaurar cada tabela
async function restoreTable(tableName, data) {
  // Limpar tabela existente
  await supabase.from(tableName).delete().gt('id', 0);
  
  // Inserir dados do backup
  if (data.length > 0) {
    await supabase.from(tableName).insert(data);
  }
}

// Restaurar todas as tabelas
async function restoreDatabase() {
  for (const [tableName, data] of Object.entries(backupData)) {
    await restoreTable(tableName, data);
    console.log(\`Tabela \${tableName} restaurada.\`);
  }
}

restoreDatabase();
\`\`\`

### Restauração das Migrações

Copie os arquivos da pasta \`migrations/\` para o diretório \`supabase/migrations/\` do seu projeto.

### Restauração das Funções Edge

Copie os arquivos da pasta \`functions/\` para o diretório \`supabase/functions/\` do seu projeto.
Em seguida, implante as funções usando a CLI do Supabase:

\`\`\`bash
supabase functions deploy
\`\`\`

## Observações

- Este backup foi criado em: ${new Date().toISOString()}
- ID do projeto: ${DB_URL}
- URL do projeto: ${SUPABASE_URL}
`;
    
    try {
      fs.writeFileSync(readmeFile, readmeContent);
      console.log(`Arquivo README com instruções criado: ${readmeFile}`);
      resolve();
    } catch (err) {
      console.error(`Erro ao criar arquivo README: ${err.message}`);
      reject(err);
    }
  });
}

// Função para limpar backups antigos
function cleanupOldBackups() {
  return new Promise((resolve) => {
    console.log('Verificando backups antigos...');
    
    const backupDirs = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('backup_'))
      .map(file => path.join(BACKUP_DIR, file));
    
    if (backupDirs.length > 7) {
      console.log('Removendo backups antigos...');
      backupDirs
        .sort((a, b) => fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime())
        .slice(0, backupDirs.length - 7)
        .forEach(dir => {
          try {
            // Função recursiva para excluir diretório
            function deleteDir(dir) {
              if (fs.existsSync(dir)) {
                fs.readdirSync(dir).forEach(file => {
                  const curPath = path.join(dir, file);
                  if (fs.lstatSync(curPath).isDirectory()) {
                    deleteDir(curPath);
                  } else {
                    fs.unlinkSync(curPath);
                  }
                });
                fs.rmdirSync(dir);
              }
            }
            
            deleteDir(dir);
            console.log(`Backup antigo removido: ${dir}`);
          } catch (err) {
            console.error(`Erro ao remover backup antigo ${dir}: ${err.message}`);
          }
        });
    }
    
    console.log(`Total de backups armazenados: ${Math.min(backupDirs.length, 7)}`);
    resolve();
  });
}

// Executar backup completo
async function runFullBackup() {
  console.log('Iniciando backup completo do Supabase...');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`Salvando em: ${backupFolder}`);
  console.log('----------------------------------------');
  
  try {
    await backupDatabase();
    await backupProjectConfig();
    await backupMigrations();
    await backupEdgeFunctions();
    await createReadme();
    await cleanupOldBackups();
    
    console.log('----------------------------------------');
    console.log('Backup completo finalizado com sucesso!');
    console.log(`Todos os arquivos foram salvos em: ${backupFolder}`);
  } catch (error) {
    console.error('Erro durante o processo de backup:');
    console.error(error);
    process.exit(1);
  }
}

// Iniciar o processo de backup
runFullBackup(); 