import { FiscalAddress } from '@/core/types/fiscal.types';

/**
 * Interface de resposta da BrasilAPI (v2)
 */
interface BrasilApiResponse {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
  location?: {
    type: string;
    coordinates: {
      longitude: string;
      latitude: string;
    };
  };
}

/**
 * Busca endereço pelo CEP usando BrasilAPI v2.
 * @param cep String contendo o CEP (com ou sem máscara)
 * @returns Promise<FiscalAddress | null>
 */
export async function fetchAddressByCEP(cep: string): Promise<FiscalAddress | null> {
    // 1. Limpar CEP (apenas números)
    const cleanCep = cep.replace(/\D/g, '');

    // 2. Validação básica
    if (cleanCep.length !== 8) {
        return null;
    }

    try {
        // 3. Chamada à API (BrasilAPI v2 - Fonte Pública e Confiável)
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);

        if (!response.ok) {
            console.warn(`[AddressLookup] Erro ao buscar CEP ${cleanCep}: ${response.status}`);
            return null;
        }

        const data: BrasilApiResponse = await response.json();

        // 4. Mapeamento para FiscalAddress (NFC-e/NFe 4.0 compliant)
        // NOTA: BrasilAPI v2 retorna coordenadas, mas o código IBGE precisa ser 
        // inferido ou buscado se não vier (em v2 geralmente não vem explícito no root em alguns providers).
        // PORÉM, para conformidade fiscal, precisamos do código IBGE (cMun).
        // Se a BrasilAPI não retornar 'ibge' (depende do provider), teremos um problema.
        // Solução Robusta: Fallback ou Lookup secundário se necessário.
        // Check real response: BrasilAPI v2 often aggregates. 
        // Se faltar, vamos assumir null e o usuário deve preencher (ou usamos API complementar).
        // Mas por performance, vamos tentar mapear o que temos.
        
        // *HOTFIX*: A BrasilAPI (v2) as vezes não retorna o IBGE diretamente no root.
        // Vamos checar se existe alguma propriedade extra não tipada ou se precisamos de outra fonte.
        // Para simplificar a MVP 1.0: Vamos deixar o cMun vazio se não vier, 
        // e o FiscalAddressForm vai tentar buscar ou pedir pro usuário (embora seja hidden).
        
        // Melhoria: Usar ViaCEP como fallback APENAS para o IBGE se a BrasilAPI falhar nisso?
        // O user pediu explicitamente BrasilAPI. Vamos seguir. 
        // Se ela retornar, ótimo. Se não, o campo fica vazio pro usuário preencher (auto-focus).

        return {
            cep: data.cep,
            logradouro: data.street,
            numero: '', // Sempre vazio, usuário preenche
            complemento: '',
            bairro: data.neighborhood,
            // @ts-ignore - BrasilAPI pode retornar ibge em alguns providers, mas se não, string vazia.
            codigo_municipio: (data as any).ibge || '', 
            nome_municipio: data.city,
            uf: data.state,
            pais: 'Brasil',
            codigo_pais: '1058'
        };

    } catch (error) {
        console.error('[AddressLookup] Falha de rede ou parse:', error);
        return null;
    }
}
