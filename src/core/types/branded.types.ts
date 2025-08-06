/**
 * Branded Types para números com constraints específicos
 * Previne uso incorreto de valores numéricos através de type safety
 */

// Branded types base
export type PositiveNumber = number & { readonly __brand: 'positive' };
export type Percentage = number & { readonly __brand: 'percentage' }; // 0-100
export type Confidence = number & { readonly __brand: 'confidence' }; // 0-1
export type Year = number & { readonly __brand: 'year' }; // 1900-current
export type NonNegativeInteger = number & { readonly __brand: 'nonNegativeInteger' };
export type Price = number & { readonly __brand: 'price' }; // Preços sempre positivos
export type StockQuantity = number & { readonly __brand: 'stockQuantity' }; // Estoque sempre >= 0
export type Volume = number & { readonly __brand: 'volume' }; // Volume em ml

// Helper functions para criar branded types com validação
export const asPositiveNumber = (n: number): PositiveNumber | null => 
  n > 0 ? (n as PositiveNumber) : null;

export const asPercentage = (n: number): Percentage | null => 
  n >= 0 && n <= 100 ? (n as Percentage) : null;

export const asConfidence = (n: number): Confidence | null => 
  n >= 0 && n <= 1 ? (n as Confidence) : null;

export const asYear = (n: number): Year | null => {
  const currentYear = new Date().getFullYear();
  return n >= 1900 && n <= currentYear + 10 ? (n as Year) : null;
};

export const asNonNegativeInteger = (n: number): NonNegativeInteger | null => 
  Number.isInteger(n) && n >= 0 ? (n as NonNegativeInteger) : null;

export const asPrice = (n: number): Price | null => 
  n >= 0 ? (n as Price) : null;

export const asStockQuantity = (n: number): StockQuantity | null => 
  Number.isInteger(n) && n >= 0 ? (n as StockQuantity) : null;

export const asVolume = (n: number): Volume | null => 
  n > 0 ? (n as Volume) : null;

// Type guards para verificação em runtime
export const isPositiveNumber = (n: number): n is PositiveNumber => n > 0;
export const isPercentage = (n: number): n is Percentage => n >= 0 && n <= 100;
export const isConfidence = (n: number): n is Confidence => n >= 0 && n <= 1;
export const isYear = (n: number): n is Year => {
  const currentYear = new Date().getFullYear();
  return n >= 1900 && n <= currentYear + 10;
};
export const isNonNegativeInteger = (n: number): n is NonNegativeInteger => 
  Number.isInteger(n) && n >= 0;
export const isPrice = (n: number): n is Price => n >= 0;
export const isStockQuantity = (n: number): n is StockQuantity => 
  Number.isInteger(n) && n >= 0;
export const isVolume = (n: number): n is Volume => n > 0;

// Utilitários para conversão segura
export const safeParsePositive = (value: string | number): PositiveNumber | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : asPositiveNumber(num);
};

export const safeParsePercentage = (value: string | number): Percentage | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : asPercentage(num);
};

export const safeParsePrice = (value: string | number): Price | null => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? null : asPrice(num);
};

export const safeParseStockQuantity = (value: string | number): StockQuantity | null => {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return isNaN(num) ? null : asStockQuantity(num);
};