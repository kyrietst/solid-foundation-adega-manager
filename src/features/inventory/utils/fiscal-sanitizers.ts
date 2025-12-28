/**
 * Utilitários para sanitização de códigos fiscais
 */

/**
 * Remove todos os caracteres não numéricos de uma string ou número.
 * @param value O valor a ser sanitizado
 * @returns A string contendo apenas dígitos
 */
export const sanitizeFiscalCode = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/\D/g, '');
};
