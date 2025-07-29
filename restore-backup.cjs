// restore-backup.cjs - Script para restaurar backup do Supabase
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Processar argumentos da linha de comando
const args = process.argv.slice(2);
let backupPath = null;

// Verificar se o caminho do backup foi fornecido
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--path' && i + 1 < args.length) {
    backupPath = args[i + 1];
    break;
  }
}

if (!backupPath) {
  console.error('Erro: Caminho do backup não especificado. Use --path para especificar o diretório de backup.');
  console.error('Exemplo: node restore-backup.cjs --path ./backups/backup_2025-06-12T23-59-05-919Z');
  process.exit(1);
}

// Verificar se o diretório de backup existe
if (!fs.existsSync(backupPath)) {
  console.error(`Erro: Diretório de backup não encontrado: ${backupPath}`);
  process.exit(1);
}

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Verificar se as variáveis de ambiente estão definidas
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Erro: As variáveis de ambiente VITE_SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidas no arquivo .env');
  process.exit(1);
}

// Inicializar cliente Supabase com a chave de serviço
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Função para restaurar uma tabela específica
async function restoreTable(tableName, data) {
  console.log(`Restaurando tabela: ${tableName} (${data.length} registros)`);
  
  try {
    // Verificar se a tabela existe
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(`Tabela ${tableName} não existe, pulando...`);
      return false;
    }
    
    // Se não houver dados para restaurar, pular
    if (data.length === 0) {
      console.log(`Nenhum dado para restaurar na tabela ${tableName}, pulando...`);
      return true;
    }
    
    // Limpar tabela existente (apenas se houver dados para restaurar)
    console.log(`Limpando dados existentes da tabela ${tableName}...`);
    
    try {
      // Abordagem mais segura: excluir todos os registros sem condições
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', 'impossível-uuid-que-não-existe');
      
      if (deleteError) {
        console.error(`Erro ao limpar tabela ${tableName}:`, deleteError.message);
        console.log('Tentando abordagem alternativa para limpar a tabela...');
        
        // Tentar outra abordagem: excluir registros um a um
        const { data: existingData, error: fetchError } = await supabase
          .from(tableName)
          .select('id');
        
        if (!fetchError && existingData && existingData.length > 0) {
          console.log(`Excluindo ${existingData.length} registros existentes...`);
          
          // Excluir em lotes para evitar sobrecarga
          const batchSize = 50;
          for (let i = 0; i < existingData.length; i += batchSize) {
            const batch = existingData.slice(i, i + batchSize);
            const ids = batch.map(item => item.id);
            
            await supabase
              .from(tableName)
              .delete()
              .in('id', ids);
          }
        }
      }
    } catch (e) {
      console.error(`Erro ao limpar tabela ${tableName}:`, e.message);
      console.log('Continuando com a inserção de dados...');
    }
    
    // Inserir dados do backup em lotes de 50 registros
    const batchSize = 50;
    let successCount = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      try {
        // Tentar inserir com a opção de upsert (atualizar se existir)
        const { error: insertError } = await supabase
          .from(tableName)
          .upsert(batch, { onConflict: 'id' });
        
        if (insertError) {
          console.error(`Erro ao inserir lote de dados na tabela ${tableName}:`, insertError.message);
          
          // Se falhar, tentar inserir registro por registro
          for (const record of batch) {
            try {
              const { error: singleInsertError } = await supabase
                .from(tableName)
                .upsert(record, { onConflict: 'id' });
              
              if (!singleInsertError) {
                successCount++;
              }
            } catch (e) {
              console.error(`Erro ao inserir registro individual:`, e.message);
            }
          }
        } else {
          successCount += batch.length;
        }
      } catch (e) {
        console.error(`Erro ao processar lote:`, e.message);
      }
    }
    
    console.log(`Tabela ${tableName} restaurada com sucesso: ${successCount}/${data.length} registros.`);
    return true;
  } catch (error) {
    console.error(`Erro ao restaurar tabela ${tableName}:`, error.message);
    return false;
  }
}

// Função para restaurar o banco de dados
async function restoreDatabase() {
  const databaseFile = path.join(backupPath, 'database.json');
  
  // Verificar se o arquivo de backup existe
  if (!fs.existsSync(databaseFile)) {
    console.error(`Erro: Arquivo de backup do banco de dados não encontrado: ${databaseFile}`);
    return false;
  }
  
  try {
    // Carregar dados do backup
    console.log(`Carregando dados do arquivo: ${databaseFile}`);
    const backupData = JSON.parse(fs.readFileSync(databaseFile, 'utf8'));
    
    // Restaurar cada tabela
    const tables = Object.keys(backupData);
    console.log(`Encontradas ${tables.length} tabelas para restaurar.`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const tableName of tables) {
      const success = await restoreTable(tableName, backupData[tableName]);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
    }
    
    console.log('----------------------------------------');
    console.log(`Restauração concluída: ${successCount} tabelas restauradas com sucesso, ${failCount} falhas.`);
    return true;
  } catch (error) {
    console.error('Erro ao restaurar banco de dados:', error.message);
    return false;
  }
}

// Função para restaurar arquivos de migração
function restoreMigrations() {
  const sourceMigrationsDir = path.join(backupPath, 'migrations');
  const targetMigrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  // Verificar se o diretório de migrações existe no backup
  if (!fs.existsSync(sourceMigrationsDir)) {
    console.log('Diretório de migrações não encontrado no backup, pulando...');
    return true;
  }
  
  try {
    // Criar diretório de destino se não existir
    if (!fs.existsSync(targetMigrationsDir)) {
      fs.mkdirSync(targetMigrationsDir, { recursive: true });
      console.log(`Diretório de migrações criado: ${targetMigrationsDir}`);
    }
    
    // Copiar arquivos de migração
    const files = fs.readdirSync(sourceMigrationsDir);
    
    for (const file of files) {
      const sourcePath = path.join(sourceMigrationsDir, file);
      const targetPath = path.join(targetMigrationsDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
    
    console.log(`${files.length} arquivos de migração restaurados para: ${targetMigrationsDir}`);
    return true;
  } catch (error) {
    console.error('Erro ao restaurar arquivos de migração:', error.message);
    return false;
  }
}

// Função para restaurar funções Edge
function restoreEdgeFunctions() {
  const sourceFunctionsDir = path.join(backupPath, 'functions');
  const targetFunctionsDir = path.join(process.cwd(), 'supabase', 'functions');
  
  // Verificar se o diretório de funções existe no backup
  if (!fs.existsSync(sourceFunctionsDir)) {
    console.log('Diretório de funções Edge não encontrado no backup, pulando...');
    return true;
  }
  
  try {
    // Criar diretório de destino se não existir
    if (!fs.existsSync(targetFunctionsDir)) {
      fs.mkdirSync(targetFunctionsDir, { recursive: true });
      console.log(`Diretório de funções Edge criado: ${targetFunctionsDir}`);
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
    
    // Copiar funções Edge
    copyDir(sourceFunctionsDir, targetFunctionsDir);
    console.log(`Funções Edge restauradas para: ${targetFunctionsDir}`);
    return true;
  } catch (error) {
    console.error('Erro ao restaurar funções Edge:', error.message);
    return false;
  }
}

// Função principal para restaurar o backup
async function runRestore() {
  console.log('Iniciando restauração do backup do Supabase...');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`Restaurando a partir de: ${backupPath}`);
  console.log('----------------------------------------');
  
  try {
    // Restaurar banco de dados
    await restoreDatabase();
    
    // Restaurar arquivos de migração
    restoreMigrations();
    
    // Restaurar funções Edge
    restoreEdgeFunctions();
    
    console.log('----------------------------------------');
    console.log('Restauração concluída com sucesso!');
  } catch (error) {
    console.error('Erro durante o processo de restauração:');
    console.error(error);
    process.exit(1);
  }
}

// Iniciar o processo de restauração
runRestore(); 