/**
 * @file fiscal.types.ts
 * @description Definições de tipos fiscais estritos para conformidade com SEFAZ/Nuvem Fiscal (NFe 4.0/NFC-e).
 * @standard NFe 4.0 / Manual de Integração Nuvem Fiscal
 */

export interface FiscalAddress {
    /**
     * Logradouro (xLgr)
     * Ex: Rua das Flores, Avenida Paulista
     */
    logradouro: string;

    /**
     * Número (nro)
     * Ex: 123, S/N
     */
    numero: string;

    /**
     * Complemento (xCpl)
     * Ex: Apto 101, Bloco B, Fundos
     */
    complemento?: string;

    /**
     * Bairro (xBairro)
     * Ex: Centro, Vila Madalena
     */
    bairro: string;

    /**
     * Código do Município (cMun)
     * Código IBGE de 7 dígitos. CRUCIAL para validação fiscal.
     * Ex: 3550308 (São Paulo/SP)
     */
    codigo_municipio: string;

    /**
     * Nome do Município (xMun)
     * Ex: São Paulo
     */
    nome_municipio: string;

    /**
     * Sigla da UF (UF)
     * Ex: SP, RJ, MG
     */
    uf: string;

    /**
     * CEP (CEP)
     * Apenas números, 8 dígitos.
     * Ex: 01001000
     */
    cep: string;

    /**
     * Nome do País (xPais)
     * Default: 'Brasil'
     */
    pais?: string;

    /**
     * Código do País (cPais)
     * Default: 1058 (Brasil - BACEN)
     */
    codigo_pais?: string;
}

/**
 * Interface auxiliar para validação de erros de endereço
 */
export interface AddressValidationError {
    field: keyof FiscalAddress;
    message: string;
}
