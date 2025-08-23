/**
 * Utilitários para conversão de dados CSV para formato do banco
 * Converte formatos brasileiros para valores numéricos
 */

export interface PackageInfo {
  isPackage: boolean;
  packageSize: number;
  unitsPerPackage: number;
  sellsIndividually: boolean;
  sellsByPackage: boolean;
}

export interface StockInfo {
  totalUnits: number;
  packagesCount: number;
  looseUnits: number;
}

/**
 * Converte volume para mililitros
 * @param volume - "350ml", "1L", "1,5L", "Indisponivel", ""
 * @returns number | null
 */
export const parseVolumeToMl = (volume: string): number | null => {
  if (!volume || volume.toLowerCase().includes('indisponivel') || volume.trim() === '') {
    return null;
  }

  const cleanVolume = volume.trim().toLowerCase();
  
  // Padrão ml: "350ml", "269ml"
  if (cleanVolume.includes('ml')) {
    const mlMatch = cleanVolume.match(/(\d+)ml/);
    return mlMatch ? parseInt(mlMatch[1]) : null;
  }
  
  // Padrão litros: "1L", "1,5L"
  if (cleanVolume.includes('l')) {
    const literMatch = cleanVolume.match(/(\d+(?:,\d+)?)l/);
    if (literMatch) {
      const liters = parseFloat(literMatch[1].replace(',', '.'));
      return Math.round(liters * 1000);
    }
  }
  
  // Formato especial: "1,25kg" (mel)
  if (cleanVolume.includes('kg')) {
    // Para produtos em kg, retornamos null pois não é volume líquido
    return null;
  }
  
  return null;
};

/**
 * Converte valor monetário brasileiro para número
 * @param value - "R$ 5,99", "R$ 15,00", "-", ""
 * @returns number | null
 */
export const parseMonetaryValue = (value: string): number | null => {
  if (!value || value === '-' || value.trim() === '') {
    return null;
  }
  
  // Remove "R$", espaços e converte vírgula para ponto
  const cleanValue = value
    .replace(/R\$\s?/g, '')
    .replace(',', '.')
    .trim();
    
  const numericValue = parseFloat(cleanValue);
  return isNaN(numericValue) ? null : numericValue;
};

/**
 * Converte percentual brasileiro para número
 * @param percentage - "33,56%", "", "-"
 * @returns number | null
 */
export const parsePercentage = (percentage: string): number | null => {
  if (!percentage || percentage === '-' || percentage.trim() === '') {
    return null;
  }
  
  // Remove % e converte vírgula para ponto
  const cleanPercentage = percentage
    .replace('%', '')
    .replace(',', '.')
    .trim();
    
  const numericValue = parseFloat(cleanPercentage);
  return isNaN(numericValue) ? null : numericValue;
};

/**
 * Extrai informações de embalagem da coluna "Venda em"
 * @param sellInfo - "unidade, pacote (12un.)", "pacote (15un.), unidade"
 * @returns PackageInfo
 */
export const parsePackageInfo = (sellInfo: string): PackageInfo => {
  const defaultInfo: PackageInfo = {
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
  
  // Verifica se vende individualmente
  const sellsIndividually = cleanInfo.includes('unidade');
  
  // Verifica se vende em pacotes e extrai o tamanho
  const packageMatch = cleanInfo.match(/pacote\s*\((\d+)un\.?\)/);
  const sellsByPackage = !!packageMatch;
  const packageSize = packageMatch ? parseInt(packageMatch[1]) : 1;
  
  return {
    isPackage: sellsByPackage,
    packageSize,
    unitsPerPackage: packageSize,
    sellsIndividually,
    sellsByPackage
  };
};

/**
 * Calcula quantidade total de estoque baseado no formato complexo
 * @param stockText - "8pc + 9un", "27pc", "24un", "134un", "1cx"
 * @param packageSize - Tamanho do pacote extraído de "Venda em"
 * @returns StockInfo
 */
export const calculateStockQuantity = (stockText: string, packageSize: number = 1): StockInfo => {
  const defaultStock: StockInfo = {
    totalUnits: 0,
    packagesCount: 0,
    looseUnits: 0
  };
  
  if (!stockText || stockText.trim() === '') {
    return defaultStock;
  }
  
  const cleanStock = stockText.toLowerCase().trim();
  
  // Formato: "8pc + 9un" (pacotes + unidades soltas)
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
  
  // Formato: "27pc" (apenas pacotes)
  const packagesMatch = cleanStock.match(/(\d+)pc/);
  if (packagesMatch) {
    const packages = parseInt(packagesMatch[1]);
    return {
      totalUnits: packages * packageSize,
      packagesCount: packages,
      looseUnits: 0
    };
  }
  
  // Formato: "24un" (apenas unidades)
  const unitsMatch = cleanStock.match(/(\d+)un/);
  if (unitsMatch) {
    const units = parseInt(unitsMatch[1]);
    return {
      totalUnits: units,
      packagesCount: 0,
      looseUnits: units
    };
  }
  
  // Formato: "1cx" (caixas - tratamos como pacotes grandes)
  const boxMatch = cleanStock.match(/(\d+)cx/);
  if (boxMatch) {
    const boxes = parseInt(boxMatch[1]);
    // Assumimos que caixa = pacote grande (usar packageSize ou default 24)
    const unitsPerBox = packageSize > 1 ? packageSize * 2 : 24;
    return {
      totalUnits: boxes * unitsPerBox,
      packagesCount: boxes,
      looseUnits: 0
    };
  }
  
  return defaultStock;
};

/**
 * Converte taxa de giro para formato padrão
 * @param turnover - "Rapido", "Devagar", ""
 * @returns "fast" | "slow" | "medium"
 */
export const parseTurnoverRate = (turnover: string): 'fast' | 'slow' | 'medium' => {
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

/**
 * Limpa e padroniza nome de categoria
 * @param category - "Cerveja", "Indisponível", "Bebidas Quentes"
 * @returns string | null
 */
export const cleanCategoryName = (category: string): string | null => {
  if (!category || category.trim() === '') {
    return null;
  }
  
  const cleanCategory = category.trim();
  
  // Mapear categorias inconsistentes
  if (cleanCategory.toLowerCase().includes('indisponivel') || 
      cleanCategory.toLowerCase().includes('indisponível')) {
    return null; // Categoria inválida
  }
  
  return cleanCategory;
};

/**
 * Limpa e padroniza nome de fornecedor
 * @param supplier - "Ambev", "Heineken", ""
 * @returns string | null
 */
export const cleanSupplierName = (supplier: string): string | null => {
  if (!supplier || supplier.trim() === '') {
    return null;
  }
  
  return supplier.trim();
};

/**
 * Valida se uma linha CSV tem dados mínimos necessários
 * @param row - Dados da linha CSV
 * @returns { isValid: boolean; errors: string[] }
 */
export const validateCsvRow = (row: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Nome do produto obrigatório
  if (!row['Nome do Produto'] || row['Nome do Produto'].trim() === '') {
    errors.push('Nome do produto é obrigatório');
  }
  
  // Categoria obrigatória e válida
  const category = cleanCategoryName(row['Categoria']);
  if (!category) {
    errors.push('Categoria é obrigatória e válida');
  }
  
  // Pelo menos um preço deve estar presente
  const unitPrice = parseMonetaryValue(row['Preço de Venda Atual (un.)']);
  const packagePrice = parseMonetaryValue(row['Preço de Venda Atual (pct)']);
  
  if (!unitPrice && !packagePrice) {
    errors.push('Pelo menos um preço (unitário ou pacote) é obrigatório');
  }
  
  // Validar se preços são positivos
  if (unitPrice !== null && unitPrice <= 0) {
    errors.push('Preço unitário deve ser maior que zero');
  }
  
  if (packagePrice !== null && packagePrice <= 0) {
    errors.push('Preço do pacote deve ser maior que zero');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Converte linha CSV para formato do banco de dados
 * @param row - Linha do CSV
 * @returns Dados formatados para inserção
 */
export const convertCsvRowToProduct = (row: any) => {
  const packageInfo = parsePackageInfo(row['Venda em (un/pct)']);
  const stockInfo = calculateStockQuantity(row['Estoque Atual'], packageInfo.packageSize);
  
  return {
    // Campos obrigatórios
    name: row['Nome do Produto']?.trim(),
    price: parseMonetaryValue(row['Preço de Venda Atual (un.)']),
    stock_quantity: stockInfo.totalUnits,
    category: cleanCategoryName(row['Categoria']),
    minimum_stock: 5, // Padrão do sistema
    
    // Campos opcionais - Informações básicas
    volume_ml: parseVolumeToMl(row['Volume']),
    supplier: cleanSupplierName(row['Fornecedor']),
    cost_price: parseMonetaryValue(row['Preço de Custo']),
    margin_percent: parsePercentage(row['Margem de Lucro (un.)']),
    
    // Campos de embalagem
    unit_type: 'un',
    package_size: packageInfo.packageSize,
    package_price: parseMonetaryValue(row['Preço de Venda Atual (pct)']),
    package_margin: parsePercentage(row['Margem de Lucro (pct)']),
    is_package: packageInfo.isPackage,
    units_per_package: packageInfo.unitsPerPackage,
    packaging_type: 'fardo',
    
    // Controle e rastreamento
    turnover_rate: parseTurnoverRate(row['Giro (Vende Rápido/Devagar)']),
    has_package_tracking: false,
    has_unit_tracking: false,
    
    // Campos que ficam NULL (conforme mapeamento)
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
};