/**
 * Utilitários para conversão e validação segura de números
 * Previne valores NaN em cálculos de KPIs e métricas
 */

/**
 * Converte um valor para número de forma segura, evitando NaN
 * @param value - Valor a ser convertido (qualquer tipo)
 * @param defaultValue - Valor padrão se a conversão falhar (padrão: 0)
 * @returns Número válido ou valor padrão
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  // Se é null, undefined ou string vazia, retorna default
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  // Converte para número
  const converted = Number(value);
  
  // Se é NaN ou infinito, retorna default
  if (isNaN(converted) || !isFinite(converted)) {
    if (value !== 0 && value !== '0') { // Só loga se não for zero válido
      console.warn(`⚠️ safeNumber: Valor inválido "${value}" convertido para ${defaultValue}`);
    }
    return defaultValue;
  }
  
  return converted;
}

/**
 * Calcula percentual de forma segura, evitando divisão por zero
 * @param value - Valor atual
 * @param base - Valor base para o cálculo
 * @param defaultValue - Valor padrão se base for zero (padrão: 0)
 * @returns Percentual calculado ou valor padrão
 */
export function safePercentage(value: any, base: any, defaultValue: number = 0): number {
  const safeValue = safeNumber(value);
  const safeBase = safeNumber(base);
  
  // Se base é zero, retorna default
  if (safeBase === 0) {
    return defaultValue;
  }
  
  const result = (safeValue / safeBase) * 100;
  
  // Verifica se o resultado é válido
  if (isNaN(result) || !isFinite(result)) {
    console.warn(`⚠️ safePercentage: Cálculo inválido (${safeValue}/${safeBase}) retornando ${defaultValue}`);
    return defaultValue;
  }
  
  return result;
}

/**
 * Calcula variação percentual (delta) de forma segura
 * @param current - Valor atual
 * @param previous - Valor anterior
 * @param defaultValue - Valor padrão se previous for zero (padrão: 0)
 * @returns Variação percentual ou valor padrão
 */
export function safeDelta(current: any, previous: any, defaultValue: number = 0): number {
  const safeCurrent = safeNumber(current);
  const safePrevious = safeNumber(previous);
  
  // Se valor anterior é zero, não há como calcular delta
  if (safePrevious === 0) {
    return defaultValue;
  }
  
  return safePercentage(safeCurrent - safePrevious, safePrevious, defaultValue);
}

/**
 * Arredonda um número de forma segura para N casas decimais
 * @param value - Valor a ser arredondado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns Número arredondado
 */
export function safeRound(value: any, decimals: number = 2): number {
  const safeValue = safeNumber(value);
  const multiplier = Math.pow(10, decimals);
  
  return Math.round(safeValue * multiplier) / multiplier;
}

/**
 * Valida se um valor é um número válido (não NaN, não infinito)
 * @param value - Valor a ser validado
 * @returns true se é um número válido
 */
export function isValidNumber(value: any): boolean {
  const converted = Number(value);
  return !isNaN(converted) && isFinite(converted);
}

/**
 * Debug helper: loga valores NaN encontrados
 * @param value - Valor a ser verificado
 * @param context - Contexto onde foi encontrado (para debug)
 * @returns O valor original
 */
export function debugNaN<T>(value: T, context: string): T {
  if (typeof value === 'number' && isNaN(value)) {
    console.error(`🐛 NaN detectado em: ${context}`, { value, context });
  }
  return value;
}