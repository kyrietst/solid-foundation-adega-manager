/**
 * Utilitários para categorias de produtos
 * Implementa lógica de negócio para campos dinâmicos baseados em categoria
 */

import { WineCategory } from '@/core/types/enums.types';

/**
 * Categorias consideradas como "Bebidas" que devem mostrar campo Volume
 * Baseado nos critérios de aceite da História 1.2
 */
export const BEVERAGE_CATEGORIES: readonly WineCategory[] = [
  'Vinho Tinto',
  'Vinho Branco', 
  'Vinho Rosé',
  'Espumante',
  'Champagne',
  'Whisky',
  'Vodka',
  'Gin',
  'Rum',
  'Cachaça',
  'Cerveja',
  'Licor',
  'Conhaque',
  'Aperitivo'
] as const;

/**
 * Verifica se a categoria selecionada é uma bebida
 * @param category - Categoria do produto
 * @returns true se é bebida (deve mostrar campo Volume), false caso contrário (deve mostrar campo Unidade)
 */
export const isBeverageCategory = (category: WineCategory | string | undefined): boolean => {
  if (!category) return false;
  return BEVERAGE_CATEGORIES.includes(category as WineCategory);
};

/**
 * Obtém o tipo de medição baseado na categoria
 * @param category - Categoria do produto
 * @returns 'Volume' para bebidas, 'Unidade' para outros
 */
export const getMeasurementTypeForCategory = (category: WineCategory | string | undefined): string => {
  return isBeverageCategory(category) ? 'Volume' : 'Unidade';
};

/**
 * Obtém o placeholder do campo de medição baseado na categoria
 * @param category - Categoria do produto
 * @returns placeholder apropriado
 */
export const getMeasurementPlaceholder = (category: WineCategory | string | undefined): string => {
  return isBeverageCategory(category) ? 'Ex: 750' : 'Ex: 1, 12, 24';
};

/**
 * Obtém a unidade de medida baseada na categoria
 * @param category - Categoria do produto
 * @returns unidade apropriada
 */
export const getMeasurementUnit = (category: WineCategory | string | undefined): string => {
  return isBeverageCategory(category) ? 'ml' : 'unidades';
};

/**
 * Obtém o label do campo de medição baseado na categoria
 * @param category - Categoria do produto
 * @returns label apropriado
 */
export const getMeasurementLabel = (category: WineCategory | string | undefined): string => {
  return isBeverageCategory(category) ? 'Volume (ml)' : 'Unidade de Medida';
};