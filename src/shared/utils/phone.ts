/**
 * phone.ts - Utilities para validação e formatação de telefones brasileiros
 *
 * @description
 * Fornece funções para validar, formatar e normalizar números de telefone
 * brasileiros, aceitando múltiplos formatos de entrada e padronizando
 * para o formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX.
 *
 * @author Adega Manager Team
 * @version 1.0.0
 * @date 2025-10-23
 */

/**
 * Regex permissiva para validação de telefones brasileiros
 *
 * Aceita os seguintes formatos:
 * - (11) 99999-9999 (celular com parênteses e hífen)
 * - (11) 9999-9999 (fixo com parênteses e hífen)
 * - 11 99999-9999 (sem parênteses, com hífen)
 * - 11 9999-9999 (fixo sem parênteses, com hífen)
 * - (11)99999-9999 (sem espaço após parênteses)
 * - (11) 999999999 (sem hífen)
 * - 11999999999 (só números - celular)
 * - 1199999999 (só números - fixo)
 * - "" (vazio)
 */
export const phoneRegex = /^(\(\d{2}\)\s?|\d{2}\s?)?\d{4,5}-?\d{4}$|^$/;

/**
 * Remove toda formatação de um número de telefone, deixando apenas dígitos
 *
 * @param phone - Número de telefone com qualquer formatação
 * @returns String contendo apenas dígitos
 *
 * @example
 * normalizePhone("(11) 99999-9999") // "11999999999"
 * normalizePhone("11 9999-9999") // "1199999999"
 * normalizePhone("11999999999") // "11999999999"
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Valida se um telefone brasileiro é válido
 *
 * Regras de validação:
 * - Deve ter 10 dígitos (fixo) ou 11 dígitos (celular)
 * - DDD válido (10-99)
 * - Celular: deve começar com 9
 * - Fixo: deve começar com 2-5
 * - String vazia é considerada válida (campo opcional)
 *
 * @param phone - Número de telefone com ou sem formatação
 * @returns true se válido, false caso contrário
 *
 * @example
 * isValidBrazilianPhone("(11) 99999-9999") // true
 * isValidBrazilianPhone("11 9999-9999") // true
 * isValidBrazilianPhone("11999999999") // true
 * isValidBrazilianPhone("1199999999") // true
 * isValidBrazilianPhone("119999999") // false (9 dígitos)
 * isValidBrazilianPhone("") // true (vazio é válido para campos opcionais)
 */
export function isValidBrazilianPhone(phone: string): boolean {
  if (!phone || phone.trim() === '') return true; // Vazio é válido

  const digits = normalizePhone(phone);

  // Deve ter exatamente 10 (fixo) ou 11 (celular) dígitos
  if (digits.length !== 10 && digits.length !== 11) return false;

  // Extrair DDD e primeiro dígito do número
  const ddd = parseInt(digits.substring(0, 2));
  const firstDigit = parseInt(digits.substring(2, 3));

  // DDD válido: 11-99 (não existe DDD 00-10)
  if (ddd < 11 || ddd > 99) return false;

  // Validar primeiro dígito do número
  if (digits.length === 11) {
    // Celular: deve começar com 9
    return firstDigit === 9;
  } else {
    // Fixo: deve começar com 2, 3, 4 ou 5
    return firstDigit >= 2 && firstDigit <= 5;
  }
}

/**
 * Formata um número de telefone brasileiro para o padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 *
 * Comportamento:
 * - Aceita entrada com ou sem formatação
 * - Remove toda formatação e reaplica de forma consistente
 * - Celular (11 dígitos): (XX) 9XXXX-XXXX
 * - Fixo (10 dígitos): (XX) XXXX-XXXX
 * - Se inválido, retorna string vazia ou entrada original (dependendo do parâmetro)
 *
 * @param phone - Número de telefone com ou sem formatação
 * @param returnOriginalIfInvalid - Se true, retorna original se inválido; se false, retorna vazio
 * @returns Telefone formatado ou string vazia/original
 *
 * @example
 * formatPhone("11999999999") // "(11) 99999-9999"
 * formatPhone("1199999999") // "(11) 9999-9999"
 * formatPhone("(11) 99999-9999") // "(11) 99999-9999"
 * formatPhone("11 9999-9999") // "(11) 9999-9999"
 * formatPhone("119999999", false) // "" (inválido)
 * formatPhone("119999999", true) // "119999999" (retorna original se inválido)
 */
export function formatPhone(phone: string, returnOriginalIfInvalid = false): string {
  if (!phone || phone.trim() === '') return '';

  const digits = normalizePhone(phone);

  // Validar antes de formatar
  if (!isValidBrazilianPhone(digits)) {
    return returnOriginalIfInvalid ? phone : '';
  }

  // Se já está vazio após normalização, retornar vazio
  if (digits === '') return '';

  // Extrair componentes
  const ddd = digits.substring(0, 2);

  if (digits.length === 11) {
    // Celular: (XX) 9XXXX-XXXX
    const firstPart = digits.substring(2, 7);
    const secondPart = digits.substring(7, 11);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  } else if (digits.length === 10) {
    // Fixo: (XX) XXXX-XXXX
    const firstPart = digits.substring(2, 6);
    const secondPart = digits.substring(6, 10);
    return `(${ddd}) ${firstPart}-${secondPart}`;
  }

  return returnOriginalIfInvalid ? phone : '';
}

/**
 * Formata telefone em tempo real conforme o usuário digita
 *
 * Ideal para uso em onChange handlers de inputs.
 * Aplica formatação progressiva conforme o usuário digita.
 *
 * @param phone - Valor atual do input
 * @returns Valor formatado parcialmente
 *
 * @example
 * formatPhoneInput("11") // "(11"
 * formatPhoneInput("119") // "(11) 9"
 * formatPhoneInput("1199999") // "(11) 99999"
 * formatPhoneInput("11999999999") // "(11) 99999-9999"
 */
export function formatPhoneInput(phone: string): string {
  if (!phone) return '';

  const digits = normalizePhone(phone);

  // Não ultrapassar 11 dígitos
  if (digits.length > 11) {
    return formatPhoneInput(digits.substring(0, 11));
  }

  // Aplicar formatação progressiva
  if (digits.length <= 2) {
    return `(${digits}`;
  } else if (digits.length <= 6) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
  } else if (digits.length <= 10) {
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
  } else {
    // 11 dígitos (celular)
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
  }
}

/**
 * Extrai informações de um telefone brasileiro válido
 *
 * @param phone - Número de telefone
 * @returns Objeto com informações do telefone ou null se inválido
 *
 * @example
 * getPhoneInfo("(11) 99999-9999")
 * // { ddd: "11", number: "999999999", type: "mobile", formatted: "(11) 99999-9999" }
 *
 * getPhoneInfo("(11) 9999-9999")
 * // { ddd: "11", number: "99999999", type: "landline", formatted: "(11) 9999-9999" }
 */
export function getPhoneInfo(phone: string): {
  ddd: string;
  number: string;
  type: 'mobile' | 'landline';
  formatted: string;
  digits: string;
} | null {
  if (!isValidBrazilianPhone(phone)) return null;

  const digits = normalizePhone(phone);
  if (!digits) return null;

  const ddd = digits.substring(0, 2);
  const number = digits.substring(2);
  const type = digits.length === 11 ? 'mobile' : 'landline';
  const formatted = formatPhone(digits);

  return {
    ddd,
    number,
    type,
    formatted,
    digits
  };
}

/**
 * Constantes úteis para telefonia brasileira
 */
export const PHONE_CONSTANTS = {
  MIN_LENGTH: 10, // Fixo: (XX) XXXX-XXXX
  MAX_LENGTH: 11, // Celular: (XX) 9XXXX-XXXX
  DDD_MIN: 11,
  DDD_MAX: 99,
  MOBILE_PREFIX: 9,
  LANDLINE_FIRST_DIGITS: [2, 3, 4, 5]
} as const;

/**
 * Placeholder sugerido para inputs de telefone
 */
export const PHONE_PLACEHOLDER = '(11) 99999-9999';

/**
 * Mensagem de erro padrão para validação
 */
export const PHONE_ERROR_MESSAGE = 'Telefone inválido. Digite apenas números com DDD (11 dígitos para celular, 10 para fixo)';

/**
 * Exemplo de uso em componente React:
 *
 * ```tsx
 * import { formatPhoneInput, isValidBrazilianPhone, PHONE_PLACEHOLDER } from '@/shared/utils/phone';
 *
 * function MyComponent() {
 *   const [phone, setPhone] = useState('');
 *
 *   const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const formatted = formatPhoneInput(e.target.value);
 *     setPhone(formatted);
 *   };
 *
 *   return (
 *     <Input
 *       value={phone}
 *       onChange={handlePhoneChange}
 *       placeholder={PHONE_PLACEHOLDER}
 *     />
 *   );
 * }
 * ```
 */
