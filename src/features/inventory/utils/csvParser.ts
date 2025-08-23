/**
 * Parser CSV com validações robustas
 * Processa arquivos CSV e valida estrutura e dados
 */

import { validateCsvRow, convertCsvRowToProduct } from './csvUtils';

export interface CsvParseResult {
  isValid: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
  statistics: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    emptyRows: number;
  };
}

export interface CsvValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

export interface CsvImportPreview {
  headers: string[];
  sampleData: any[];
  totalRows: number;
  validationSummary: {
    validRows: number;
    invalidRows: number;
    warnings: number;
  };
}

/**
 * Colunas esperadas no CSV (ordem exata)
 */
export const EXPECTED_CSV_HEADERS = [
  'Nome do Produto',
  'Volume',
  'Categoria',
  'Venda em (un/pct)',
  'Estoque Atual',
  'Fornecedor',
  'Preço de Custo',
  'Preço de Venda Atual (un.)',
  'Margem de Lucro (un.)',
  'Preço de Venda Atual (pct)',
  'Margem de Lucro (pct)',
  'Giro (Vende Rápido/Devagar)'
];

/**
 * Colunas obrigatórias que devem ter dados
 */
export const REQUIRED_COLUMNS = [
  'Nome do Produto',
  'Categoria',
  'Preço de Venda Atual (un.)'
];

/**
 * Parse CSV text para array de objetos
 * @param csvText - Conteúdo do arquivo CSV
 * @returns Promise<CsvParseResult>
 */
export const parseCsvText = async (csvText: string): Promise<CsvParseResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const data: any[] = [];
  
  try {
    // Dividir em linhas e remover linhas vazias
    const lines = csvText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 2) {
      errors.push('Arquivo deve conter pelo menos cabeçalho e uma linha de dados');
      return {
        isValid: false,
        data: [],
        errors,
        warnings,
        statistics: { totalRows: 0, validRows: 0, invalidRows: 0, emptyRows: 0 }
      };
    }
    
    // Processar cabeçalho
    const headerLine = lines[0];
    const headers = parseCsvLine(headerLine);
    
    // Validar estrutura do cabeçalho
    const headerValidation = validateHeaders(headers);
    if (!headerValidation.isValid) {
      errors.push(...headerValidation.errors);
      return {
        isValid: false,
        data: [],
        errors,
        warnings,
        statistics: { totalRows: 0, validRows: 0, invalidRows: 0, emptyRows: 0 }
      };
    }
    
    warnings.push(...headerValidation.warnings);
    
    // Processar linhas de dados
    let validRows = 0;
    let invalidRows = 0;
    let emptyRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;
      
      // Pular linhas vazias
      if (!line || line.trim() === '') {
        emptyRows++;
        continue;
      }
      
      try {
        const values = parseCsvLine(line);
        
        // Verificar se o número de colunas está correto
        if (values.length !== headers.length) {
          errors.push(`Linha ${lineNumber}: Número de colunas incorreto (esperado: ${headers.length}, encontrado: ${values.length})`);
          invalidRows++;
          continue;
        }
        
        // Criar objeto com os dados
        const rowData: any = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        
        // Validar dados da linha
        const validation = validateCsvRow(rowData);
        if (!validation.isValid) {
          errors.push(`Linha ${lineNumber}: ${validation.errors.join(', ')}`);
          invalidRows++;
          continue;
        }
        
        // Adicionar dados válidos
        data.push(rowData);
        validRows++;
        
      } catch (error) {
        errors.push(`Linha ${lineNumber}: Erro ao processar - ${error}`);
        invalidRows++;
      }
    }
    
    return {
      isValid: errors.length === 0 && validRows > 0,
      data,
      errors,
      warnings,
      statistics: {
        totalRows: lines.length - 1,
        validRows,
        invalidRows,
        emptyRows
      }
    };
    
  } catch (error) {
    errors.push(`Erro geral ao processar CSV: ${error}`);
    return {
      isValid: false,
      data: [],
      errors,
      warnings,
      statistics: { totalRows: 0, validRows: 0, invalidRows: 0, emptyRows: 0 }
    };
  }
};

/**
 * Parse uma linha CSV respeitando aspas e vírgulas dentro de campos
 * @param line - Linha CSV
 * @returns string[] - Array de valores
 */
export const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Aspas duplas escapadas
        current += '"';
        i += 2;
        continue;
      } else {
        // Início ou fim de campo com aspas
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Separador de campo (fora de aspas)
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    
    i++;
  }
  
  // Adicionar último campo
  result.push(current.trim());
  
  return result;
};

/**
 * Valida estrutura do cabeçalho CSV
 * @param headers - Array de cabeçalhos encontrados
 * @returns Resultado da validação
 */
export const validateHeaders = (headers: string[]): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verificar se todas as colunas obrigatórias estão presentes
  const missingRequired = EXPECTED_CSV_HEADERS.filter(expected => 
    !headers.find(header => header.trim() === expected)
  );
  
  if (missingRequired.length > 0) {
    errors.push(`Colunas obrigatórias ausentes: ${missingRequired.join(', ')}`);
  }
  
  // Verificar colunas extras (não esperadas)
  const extraColumns = headers.filter(header => 
    !EXPECTED_CSV_HEADERS.includes(header.trim())
  );
  
  if (extraColumns.length > 0) {
    warnings.push(`Colunas não reconhecidas (serão ignoradas): ${extraColumns.join(', ')}`);
  }
  
  // Verificar ordem das colunas
  const expectedOrder = EXPECTED_CSV_HEADERS.slice(0, headers.length);
  const actualOrder = headers.slice(0, EXPECTED_CSV_HEADERS.length);
  
  const orderMismatch = expectedOrder.some((expected, index) => 
    actualOrder[index] && actualOrder[index].trim() !== expected
  );
  
  if (orderMismatch) {
    warnings.push('Ordem das colunas não corresponde ao padrão esperado. Verifique se os dados estão sendo mapeados corretamente.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Gera preview dos dados CSV para exibição
 * @param csvText - Conteúdo do CSV
 * @param maxRows - Máximo de linhas para preview (default: 10)
 * @returns Promise<CsvImportPreview>
 */
export const generateCsvPreview = async (csvText: string, maxRows: number = 10): Promise<CsvImportPreview> => {
  const parseResult = await parseCsvText(csvText);
  
  // Pegar apenas as primeiras linhas para preview
  const sampleData = parseResult.data.slice(0, maxRows);
  
  // Extrair headers dos dados (se existirem)
  const headers = parseResult.data.length > 0 ? Object.keys(parseResult.data[0]) : [];
  
  return {
    headers,
    sampleData,
    totalRows: parseResult.statistics.totalRows,
    validationSummary: {
      validRows: parseResult.statistics.validRows,
      invalidRows: parseResult.statistics.invalidRows,
      warnings: parseResult.warnings.length
    }
  };
};

/**
 * Converte dados CSV válidos para formato de inserção no banco
 * @param csvData - Dados processados do CSV
 * @returns Array de produtos formatados
 */
export const convertCsvDataToProducts = (csvData: any[]) => {
  return csvData.map(row => convertCsvRowToProduct(row));
};

/**
 * Valida arquivo CSV antes do processamento
 * @param file - Arquivo CSV
 * @returns { isValid: boolean; errors: string[] }
 */
export const validateCsvFile = (file: File): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Verificar extensão
  if (!file.name.toLowerCase().endsWith('.csv')) {
    errors.push('Arquivo deve ter extensão .csv');
  }
  
  // Verificar tamanho (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande. Tamanho máximo: 5MB');
  }
  
  // Verificar se não está vazio
  if (file.size === 0) {
    errors.push('Arquivo não pode estar vazio');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Lê arquivo CSV e retorna conteúdo como string
 * @param file - Arquivo CSV
 * @returns Promise<string>
 */
export const readCsvFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Erro ao ler arquivo'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    // Ler como texto UTF-8
    reader.readAsText(file, 'UTF-8');
  });
};