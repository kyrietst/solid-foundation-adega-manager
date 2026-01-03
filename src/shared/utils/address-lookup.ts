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
 * Interface de resposta do ViaCEP
 */
interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

/**
 * Busca endereço usando ViaCEP (Prioridade 1)
 * Mais estável em produção (CORS friendly) e garante IBGE.
 */
async function fetchViaCEP(cleanCep: string): Promise<FiscalAddress | null> {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        if (!response.ok) throw new Error(`ViaCEP http status: ${response.status}`);
        
        const data: ViaCepResponse = await response.json();
        
        if (data.erro) return null;

        return {
            cep: data.cep,
            logradouro: data.logradouro,
            numero: '',
            complemento: data.complemento,
            bairro: data.bairro,
            codigo_municipio: data.ibge, // ViaCEP sempre retorna IBGE se sucesso
            nome_municipio: data.localidade,
            uf: data.uf,
            pais: 'Brasil',
            codigo_pais: '1058'
        };
    } catch (error) {
        console.warn('[AddressLookup] ViaCEP failed:', error);
        throw error; // Propagate to trigger fallback
    }
}

/**
 * Busca endereço usando BrasilAPI (Fallback)
 * Rica em dados, mas pode sofrer com CORS/Rate Limit.
 */
async function fetchBrasilAPI(cleanCep: string): Promise<FiscalAddress | null> {
    try {
        const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${cleanCep}`);

        if (!response.ok) {
            throw new Error(`BrasilAPI failed with status ${response.status}`);
        }

        const data: BrasilApiResponse = await response.json();

        return {
            cep: data.cep,
            logradouro: data.street,
            numero: '',
            complemento: '',
            bairro: data.neighborhood,
            // @ts-ignore
            codigo_municipio: (data as any).ibge || '', 
            nome_municipio: data.city,
            uf: data.state,
            pais: 'Brasil',
            codigo_pais: '1058'
        };
    } catch (error) {
         console.warn('[AddressLookup] BrasilAPI Fallback failed:', error);
         return null;
    }
}

/**
 * Busca endereço pelo CEP com Redundância (ViaCEP -> BrasilAPI)
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
        // 3. Tentativa Primária: ViaCEP
        // Motivo: Mais estável em produção, sem bloqueio de CORS.
        return await fetchViaCEP(cleanCep);

    } catch (error) {
        console.warn(`[AddressLookup] Primary API (ViaCEP) failed for ${cleanCep}. Switching to Fallback (BrasilAPI)...`);
        
        // 4. Fallback: BrasilAPI
        return await fetchBrasilAPI(cleanCep);
    }
}
