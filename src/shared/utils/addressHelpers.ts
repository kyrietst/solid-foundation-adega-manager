/**
 * @fileoverview Helpers defensivos para lidar com formatos inconsistentes de endereços
 * Solução para 74% dos endereços em produção que estão em formatos nested/string
 *
 * @author Adega Manager Team
 * @version 1.0.0 - Opção B (Helper Defensivo)
 */

export interface AddressObject {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  full_address: string;
}

/**
 * Formata endereço de delivery para exibição, lidando com múltiplos formatos
 *
 * Formatos suportados:
 * 1. {address: "{\"raw\":\"Rua X 22\"}"} - Nested JSON string (70% dos casos)
 * 2. {address: "Rua Y 35"} - String simples (20% dos casos)
 * 3. {address: "{\"full_address\":\"Rua Z\"}"} - Alternative schema (10% dos casos)
 * 4. {street: "Rua", number: "123"} - Formato esperado (futuro)
 *
 * @param address - Objeto de endereço em qualquer formato
 * @returns String formatada do endereço ou mensagem de fallback
 */
export function formatDeliveryAddress(address: any): string {
  if (!address) return 'Endereço não informado';

  try {
    // Caso 1: address.address existe (formato nested - maioria dos casos em PROD)
    if (address.address) {
      // Se address.address é string, tentar fazer parse
      if (typeof address.address === 'string') {
        try {
          // Tentar parse recursivo (pode ser JSON stringified)
          const parsed = JSON.parse(address.address);

          // Verificar se parsed tem campos conhecidos
          if (parsed.full_address) {
            return parsed.full_address;
          }
          if (parsed.raw) {
            return parsed.raw;
          }
          // Se tem street, montar endereço
          if (parsed.street) {
            const parts = [parsed.street];
            if (parsed.number) parts.push(parsed.number);
            if (parsed.neighborhood) parts.push(parsed.neighborhood);
            if (parsed.city) parts.push(parsed.city);
            if (parsed.state) parts.push(parsed.state);
            return parts.join(', ');
          }

          // Se chegou aqui, retorna o JSON como string (fallback)
          return JSON.stringify(parsed);
        } catch (parseError) {
          // Se parse falhar, é string pura - retornar direto
          return address.address;
        }
      }

      // Se address.address é object, extrair campos
      if (typeof address.address === 'object') {
        if (address.address.full_address) return address.address.full_address;
        if (address.address.raw) return address.address.raw;

        // Montar de partes
        const parts = [];
        if (address.address.street) parts.push(address.address.street);
        if (address.address.number) parts.push(address.address.number);
        if (address.address.neighborhood) parts.push(address.address.neighborhood);
        if (address.address.city) parts.push(address.address.city);
        if (parts.length > 0) return parts.join(', ');

        return 'Endereço incompleto';
      }
    }

    // Caso 2: address.full_address existe direto (customers.address format)
    if (address.full_address) {
      return address.full_address;
    }

    // Caso 3: Formato esperado pelo código antigo (street, number, etc.)
    if (address.street) {
      const parts = [address.street];
      if (address.number) parts.push(address.number);
      if (address.complement) parts.push(address.complement);
      if (address.neighborhood) parts.push(address.neighborhood);
      if (address.city) parts.push(address.city);
      if (address.state) parts.push(address.state);
      return parts.join(', ');
    }

    // Caso 4: É uma string pura (fallback final)
    if (typeof address === 'string') {
      return address;
    }

    // Fallback: tentar converter para string legível
    return JSON.stringify(address).slice(0, 100) || 'Formato de endereço desconhecido';
  } catch (error) {
    console.error('Erro ao formatar endereço de delivery:', error, address);
    return 'Erro ao formatar endereço';
  }
}

/**
 * Parse endereço de delivery para objeto estruturado
 * Sempre retorna um objeto (nunca null), mesmo que com campos vazios
 *
 * @param address - Objeto de endereço em qualquer formato
 * @returns Objeto estruturado com campos de endereço
 */
export function parseDeliveryAddress(address: any): AddressObject {
  const defaultAddress: AddressObject = {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    full_address: formatDeliveryAddress(address)
  };

  if (!address) return defaultAddress;

  try {
    // Tentar extrair do formato nested (address.address)
    if (address.address) {
      let inner: any;

      // Se é string, fazer parse
      if (typeof address.address === 'string') {
        try {
          inner = JSON.parse(address.address);
        } catch {
          // Se parse falhar, é string pura
          return {
            ...defaultAddress,
            full_address: address.address
          };
        }
      } else {
        inner = address.address;
      }

      // Extrair campos do objeto interno
      return {
        street: inner.street || inner.raw || '',
        number: inner.number || '',
        complement: inner.complement || '',
        neighborhood: inner.neighborhood || '',
        city: inner.city || '',
        state: inner.state || '',
        full_address: inner.full_address || inner.raw || address.address || formatDeliveryAddress(address)
      };
    }

    // Usar direto se tem formato esperado
    if (address.street || address.full_address) {
      return {
        street: address.street || '',
        number: address.number || '',
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
        city: address.city || '',
        state: address.state || '',
        full_address: address.full_address || formatDeliveryAddress(address)
      };
    }

    return defaultAddress;
  } catch (error) {
    console.error('Erro ao fazer parse de endereço:', error, address);
    return defaultAddress;
  }
}

/**
 * Formata telefone para WhatsApp (adiciona código do país e remove formatação)
 *
 * Exemplos:
 * - "(11) 95138-8472" → "5511951388472"
 * - "11951388472" → "5511951388472"
 * - "(77) 99913-4250" → "5577999134250"
 *
 * @param phone - Telefone em formato brasileiro
 * @returns Telefone formatado para WhatsApp (com código do país)
 */
export function formatPhoneForWhatsApp(phone: string | null | undefined): string {
  if (!phone) return '';

  try {
    // Remover todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');

    // Se já tem código do país (começa com 55 e tem 12-13 dígitos)
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return cleaned;
    }

    // Adicionar código do país (55 = Brasil)
    return `55${cleaned}`;
  } catch (error) {
    console.error('Erro ao formatar telefone para WhatsApp:', error, phone);
    return '';
  }
}

/**
 * Formata telefone para exibição legível
 *
 * Exemplos:
 * - "5511951388472" → "(11) 95138-8472"
 * - "11951388472" → "(11) 95138-8472"
 *
 * @param phone - Telefone em formato numérico
 * @returns Telefone formatado para exibição
 */
export function formatPhoneDisplay(phone: string | null | undefined): string {
  if (!phone) return '';

  try {
    // Remover código do país se existir
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('55')) {
      cleaned = cleaned.substring(2);
    }

    // Formato: (DD) 9DDDD-DDDD ou (DD) DDDD-DDDD
    if (cleaned.length === 11) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
    }

    // Fallback: retornar original
    return phone;
  } catch (error) {
    console.error('Erro ao formatar telefone para exibição:', error, phone);
    return phone || '';
  }
}
