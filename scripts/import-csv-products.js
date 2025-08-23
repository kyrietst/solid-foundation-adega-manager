/**
 * Script para importar produtos do CSV diretamente para o banco Supabase
 * Executa: node scripts/import-csv-products.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabaseUrl = 'https://uujkzvbgnfzuzlztrzln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1amt6dmJnbmZ6dXpsenRyemxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ2OTkzNSwiZXhwIjoyMDY0MDQ1OTM1fQ.Bz2Fd284THGPmZ02zv54JMWg8-Wr6rEqt60Ag__D5ww';

const supabase = createClient(supabaseUrl, supabaseKey);

// Funções de conversão (copiadas dos utilitários)
const parseVolumeToMl = (volume) => {
  if (!volume || volume.toLowerCase().includes('indisponivel') || volume.trim() === '') {
    return null;
  }

  const cleanVolume = volume.trim().toLowerCase();
  
  if (cleanVolume.includes('ml')) {
    const mlMatch = cleanVolume.match(/(\d+)ml/);
    return mlMatch ? parseInt(mlMatch[1]) : null;
  }
  
  if (cleanVolume.includes('l')) {
    const literMatch = cleanVolume.match(/(\d+(?:,\d+)?)l/);
    if (literMatch) {
      const liters = parseFloat(literMatch[1].replace(',', '.'));
      return Math.round(liters * 1000);
    }
  }
  
  if (cleanVolume.includes('kg')) {
    return null;
  }
  
  return null;
};

const parseMonetaryValue = (value) => {
  if (!value || value === '-' || value.trim() === '') {
    return null;
  }
  
  const cleanValue = value
    .replace(/R\$\s?/g, '')
    .replace(',', '.')
    .trim();
    
  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? null : numericValue;
};

const parsePercentage = (percentage) => {
  if (!percentage || percentage === '-' || percentage.trim() === '') {
    return null;
  }
  
  const cleanPercentage = percentage
    .replace('%', '')
    .replace(',', '.')
    .trim();
    
  const numericValue = parseFloat(cleanPercentage);
  return isNaN(numericValue) ? null : numericValue;
};

const parsePackageInfo = (sellInfo) => {
  const defaultInfo = {
    isPackage: false,
    packageSize: 1,
    unitsPerPackage: 1,
    sellsIndividually: true,
    sellsByPackage: false
  };
  
  if (!sellInfo || sellInfo.trim() === '') {
    return defaultInfo;
  }
  
  const cleanInfo = sellInfo.toLowerCase().trim();
  const sellsIndividually = cleanInfo.includes('unidade');
  const packageMatch = cleanInfo.match(/pacote\s*\((\d+)un\.?\)|caixa\s*\((\d+)un\.?\)/);
  const sellsByPackage = !!packageMatch;
  const packageSize = packageMatch ? parseInt(packageMatch[1] || packageMatch[2]) : 1;
  
  return {
    isPackage: sellsByPackage,
    packageSize,
    unitsPerPackage: packageSize,
    sellsIndividually,
    sellsByPackage
  };
};

const calculateStockQuantity = (stockText, packageSize = 1) => {
  const defaultStock = {
    totalUnits: 0,
    packagesCount: 0,
    looseUnits: 0
  };
  
  if (!stockText || stockText.trim() === '') {
    return defaultStock;
  }
  
  const cleanStock = stockText.toLowerCase().trim();
  
  // Formato: "8pc + 9un"
  const mixedMatch = cleanStock.match(/(\d+)pc\s*\+\s*(\d+)un/);
  if (mixedMatch) {
    const packages = parseInt(mixedMatch[1]);
    const loose = parseInt(mixedMatch[2]);
    return {
      totalUnits: (packages * packageSize) + loose,
      packagesCount: packages,
      looseUnits: loose
    };
  }
  
  // Formato: "27pc"
  const packagesMatch = cleanStock.match(/(\d+)pc/);
  if (packagesMatch) {
    const packages = parseInt(packagesMatch[1]);
    return {
      totalUnits: packages * packageSize,
      packagesCount: packages,
      looseUnits: 0
    };
  }
  
  // Formato: "24un"
  const unitsMatch = cleanStock.match(/(\d+)un/);
  if (unitsMatch) {
    const units = parseInt(unitsMatch[1]);
    return {
      totalUnits: units,
      packagesCount: 0,
      looseUnits: units
    };
  }
  
  // Formato: "1cx"
  const boxMatch = cleanStock.match(/(\d+)cx/);
  if (boxMatch) {
    const boxes = parseInt(boxMatch[1]);
    const unitsPerBox = packageSize > 1 ? packageSize * 2 : 24;
    return {
      totalUnits: boxes * unitsPerBox,
      packagesCount: boxes,
      looseUnits: 0
    };
  }
  
  return defaultStock;
};

const parseTurnoverRate = (turnover) => {
  if (!turnover || turnover.trim() === '') {
    return 'medium';
  }
  
  const cleanTurnover = turnover.toLowerCase().trim();
  
  if (cleanTurnover.includes('rapido') || cleanTurnover.includes('rápido')) {
    return 'fast';
  }
  
  if (cleanTurnover.includes('devagar') || cleanTurnover.includes('lento')) {
    return 'slow';
  }
  
  return 'medium';
};

const cleanCategoryName = (category) => {
  if (!category || category.trim() === '') {
    return null;
  }
  
  const cleanCategory = category.trim();
  
  if (cleanCategory.toLowerCase().includes('indisponivel') || 
      cleanCategory.toLowerCase().includes('indisponível')) {
    return null;
  }
  
  return cleanCategory;
};

const cleanSupplierName = (supplier) => {
  if (!supplier || supplier.trim() === '') {
    return null;
  }
  
  return supplier.trim();
};

// Parse CSV line
const parseCsvLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 2;
        continue;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    
    i++;
  }
  
  result.push(current.trim());
  return result;
};

// Converter linha CSV para produto
const convertCsvRowToProduct = (row) => {
  const packageInfo = parsePackageInfo(row['Venda em (un/pct)']);
  const stockInfo = calculateStockQuantity(row['Estoque Atual'], packageInfo.packageSize);
  
  const product = {
    name: row['Nome do Produto']?.trim(),
    price: parseMonetaryValue(row['Preço de Venda Atual (un.)']),
    stock_quantity: stockInfo.totalUnits,
    category: cleanCategoryName(row['Categoria']),
    minimum_stock: 5,
    
    volume_ml: parseVolumeToMl(row['Volume']),
    supplier: cleanSupplierName(row['Fornecedor']),
    cost_price: parseMonetaryValue(row['Preço de Custo']),
    margin_percent: parsePercentage(row['Margem de Lucro (un.)']),
    
    unit_type: 'un',
    package_size: packageInfo.packageSize,
    package_price: parseMonetaryValue(row['Preço de Venda Atual (pct)']),
    package_margin: parsePercentage(row['Margem de Lucro (pct)']),
    is_package: packageInfo.isPackage,
    units_per_package: packageInfo.unitsPerPackage,
    packaging_type: 'fardo',
    
    turnover_rate: parseTurnoverRate(row['Giro (Vende Rápido/Devagar)']),
    has_package_tracking: false,
    has_unit_tracking: false,
    
    description: null,
    vintage: null,
    producer: null,
    country: null,
    region: null,
    alcohol_content: null,
    image_url: null,
    barcode: null,
    package_barcode: null,
    unit_barcode: null,
    measurement_type: null,
    measurement_value: null,
    package_units: null,
    last_sale_date: null
  };
  
  // Filtrar valores nulos nos campos obrigatórios
  if (!product.name || !product.category || !product.price) {
    return null;
  }
  
  return product;
};

async function main() {
  console.log('🚀 Iniciando importação dos produtos...');
  
  try {
    // Ler arquivo CSV
    const csvPath = path.join(__dirname, '../doc/prod/TAREFA 1 - ADEGA - Base de Produtos.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('📄 Arquivo CSV carregado');
    
    // Parse CSV
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = parseCsvLine(lines[0]);
    
    console.log('📋 Headers encontrados:', headers);
    
    const products = [];
    const errors = [];
    
    // Processar cada linha
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCsvLine(lines[i]);
        if (values.length !== headers.length) continue;
        
        const rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        const product = convertCsvRowToProduct(rowData);
        if (product) {
          products.push(product);
        } else {
          errors.push(`Linha ${i + 1}: Dados insuficientes`);
        }
      } catch (error) {
        errors.push(`Linha ${i + 1}: ${error.message}`);
      }
    }
    
    console.log(`✅ Processados ${products.length} produtos válidos`);
    console.log(`⚠️ ${errors.length} erros encontrados`);
    
    if (errors.length > 0) {
      console.log('Erros:', errors.slice(0, 5));
    }
    
    // Verificar categorias existentes
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    console.log('📂 Categorias encontradas:', categories);
    
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('name')
      .in('name', categories);
    
    const existingCategoryNames = existingCategories?.map(c => c.name) || [];
    const missingCategories = categories.filter(cat => !existingCategoryNames.includes(cat));
    
    console.log('📂 Categorias existentes:', existingCategoryNames);
    console.log('🆕 Categorias a criar:', missingCategories);
    
    // Criar categorias faltantes
    if (missingCategories.length > 0) {
      const newCategories = missingCategories.map(name => ({
        name,
        description: `Categoria criada automaticamente durante importação CSV`,
        color: '#6B7280',
        icon: 'Package',
        is_active: true
      }));
      
      const { error: categoryError } = await supabase
        .from('categories')
        .insert(newCategories);
      
      if (categoryError) {
        console.error('❌ Erro ao criar categorias:', categoryError);
        return;
      }
      
      console.log(`✅ ${missingCategories.length} categorias criadas`);
    }
    
    // Inserir produtos em lotes
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);
      
      console.log(`📦 Processando lote ${Math.floor(i / batchSize) + 1} (${batch.length} produtos)...`);
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select('id, name');
      
      if (error) {
        console.error(`❌ Erro no lote ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        console.log(`✅ Lote ${Math.floor(i / batchSize) + 1} inserido com sucesso (${data?.length || 0} produtos)`);
        successCount += data?.length || 0;
      }
    }
    
    console.log('\n🎉 IMPORTAÇÃO CONCLUÍDA!');
    console.log(`✅ Sucessos: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`📊 Total processado: ${successCount + errorCount}`);
    
    // Verificar total no banco
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    console.log(`🗄️ Total de produtos no banco: ${count}`);
    
  } catch (error) {
    console.error('💥 Erro durante a importação:', error);
  }
}

main();