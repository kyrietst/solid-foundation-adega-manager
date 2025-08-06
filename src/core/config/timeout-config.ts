/**
 * Configurações globais de timeout para operações
 * Centraliza todos os timeouts da aplicação
 */

export interface TimeoutConfig {
  duration: number; // em milissegundos
  retryAttempts: number;
  retryDelay: number; // em milissegundos
  showWarningAt?: number; // em milissegundos - quando mostrar aviso
  description: string;
}

export const TIMEOUT_CONFIGS: Record<string, TimeoutConfig> = {
  // Operações de autenticação
  auth_login: {
    duration: 10000, // 10 segundos
    retryAttempts: 2,
    retryDelay: 1000,
    showWarningAt: 7000,
    description: 'Login do usuário'
  },
  auth_logout: {
    duration: 5000, // 5 segundos
    retryAttempts: 1,
    retryDelay: 1000,
    description: 'Logout do usuário'
  },
  auth_fetch_role: {
    duration: 8000, // 8 segundos
    retryAttempts: 2,
    retryDelay: 1000,
    description: 'Busca de role do usuário'
  },

  // Operações de banco de dados
  database_query: {
    duration: 15000, // 15 segundos
    retryAttempts: 2,
    retryDelay: 2000,
    showWarningAt: 10000,
    description: 'Consulta ao banco de dados'
  },
  database_mutation: {
    duration: 20000, // 20 segundos
    retryAttempts: 1,
    retryDelay: 1000,
    showWarningAt: 15000,
    description: 'Operação de escrita no banco'
  },

  // Operações de vendas
  sales_create: {
    duration: 30000, // 30 segundos
    retryAttempts: 2,
    retryDelay: 2000,
    showWarningAt: 20000,
    description: 'Criação de venda'
  },
  sales_payment: {
    duration: 45000, // 45 segundos
    retryAttempts: 1,
    retryDelay: 3000,
    showWarningAt: 30000,
    description: 'Processamento de pagamento'
  },

  // Operações de estoque
  inventory_movement: {
    duration: 15000, // 15 segundos
    retryAttempts: 2,
    retryDelay: 1500,
    showWarningAt: 10000,
    description: 'Movimentação de estoque'
  },
  inventory_validation: {
    duration: 25000, // 25 segundos
    retryAttempts: 1,
    retryDelay: 2000,
    showWarningAt: 20000,
    description: 'Validação de integridade de estoque'
  },

  // Operações de formulários
  form_submit: {
    duration: 20000, // 20 segundos
    retryAttempts: 2,
    retryDelay: 2000,
    showWarningAt: 15000,
    description: 'Submissão de formulário'
  },
  form_upload: {
    duration: 60000, // 60 segundos (uploads podem ser mais lentos)
    retryAttempts: 2,
    retryDelay: 3000,
    showWarningAt: 30000,
    description: 'Upload de arquivo'
  },

  // Operações do dashboard
  dashboard_load: {
    duration: 20000, // 20 segundos
    retryAttempts: 3,
    retryDelay: 2000,
    showWarningAt: 15000,
    description: 'Carregamento do dashboard'
  },

  // Operações genéricas
  api_request: {
    duration: 12000, // 12 segundos
    retryAttempts: 2,
    retryDelay: 1500,
    showWarningAt: 8000,
    description: 'Requisição à API'
  },
  file_operation: {
    duration: 30000, // 30 segundos
    retryAttempts: 1,
    retryDelay: 2000,
    showWarningAt: 20000,
    description: 'Operação de arquivo'
  }
};

// Configuração padrão
export const DEFAULT_TIMEOUT_CONFIG: TimeoutConfig = {
  duration: 10000, // 10 segundos
  retryAttempts: 2,
  retryDelay: 1000,
  showWarningAt: 7000,
  description: 'Operação genérica'
};

// Função para obter configuração de timeout
export const getTimeoutConfig = (operation: string): TimeoutConfig => {
  return TIMEOUT_CONFIGS[operation] || DEFAULT_TIMEOUT_CONFIG;
};

// Função para criar timeout personalizado
export const createTimeoutConfig = (
  baseDuration: number,
  options?: Partial<TimeoutConfig>
): TimeoutConfig => {
  return {
    duration: baseDuration,
    retryAttempts: options?.retryAttempts ?? 2,
    retryDelay: options?.retryDelay ?? Math.max(baseDuration * 0.1, 1000),
    showWarningAt: options?.showWarningAt ?? baseDuration * 0.7,
    description: options?.description ?? 'Operação personalizada'
  };
};

// Timeouts para diferentes tipos de rede
export const NETWORK_TIMEOUT_MULTIPLIERS = {
  fast: 1.0,     // Rede rápida
  normal: 1.5,   // Rede normal
  slow: 2.0,     // Rede lenta
  very_slow: 3.0 // Rede muito lenta
};

// Função para ajustar timeout baseado na velocidade da rede
export const adjustTimeoutForNetwork = (
  config: TimeoutConfig,
  networkSpeed: keyof typeof NETWORK_TIMEOUT_MULTIPLIERS = 'normal'
): TimeoutConfig => {
  const multiplier = NETWORK_TIMEOUT_MULTIPLIERS[networkSpeed];
  
  return {
    ...config,
    duration: Math.round(config.duration * multiplier),
    retryDelay: Math.round(config.retryDelay * multiplier),
    showWarningAt: config.showWarningAt 
      ? Math.round(config.showWarningAt * multiplier)
      : undefined
  };
};

// Função para detectar velocidade da rede (simplificada)
export const detectNetworkSpeed = (): keyof typeof NETWORK_TIMEOUT_MULTIPLIERS => {
  // @ts-ignore - navigator.connection pode não estar disponível
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return 'normal';
  
  const effectiveType = connection.effectiveType;
  
  switch (effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'very_slow';
    case '3g':
      return 'slow';
    case '4g':
      return 'fast';
    default:
      return 'normal';
  }
};