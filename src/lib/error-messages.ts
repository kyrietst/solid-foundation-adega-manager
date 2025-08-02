/**
 * Sistema centralizado de mensagens de erro
 * Padroniza todas as mensagens da aplicação em português
 */

export type ErrorCategory = 
  | 'auth'
  | 'database'
  | 'network'
  | 'validation'
  | 'business'
  | 'system'
  | 'timeout'
  | 'permission';

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SupabaseErrorCode {
  code: string;
  message: ErrorMessage;
}

// Mensagens de erro categorizadas
export const ERROR_MESSAGES: Record<ErrorCategory, Record<string, ErrorMessage>> = {
  // Erros de Autenticação
  auth: {
    invalid_credentials: {
      title: 'Credenciais Inválidas',
      description: 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.',
      action: 'Verificar email e senha',
      severity: 'medium'
    },
    email_not_confirmed: {
      title: 'Email Não Confirmado',
      description: 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.',
      action: 'Confirmar email',
      severity: 'medium'
    },
    session_expired: {
      title: 'Sessão Expirada',
      description: 'Sua sessão expirou por motivos de segurança. Faça login novamente.',
      action: 'Fazer login novamente',
      severity: 'high'
    },
    too_many_requests: {
      title: 'Muitas Tentativas',
      description: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
      action: 'Aguardar e tentar novamente',
      severity: 'medium'
    },
    unauthorized: {
      title: 'Acesso Negado',
      description: 'Você não tem permissão para acessar este recurso.',
      action: 'Entrar em contato com administrador',
      severity: 'high'
    },
    token_expired: {
      title: 'Token Expirado',
      description: 'Seu token de acesso expirou. Fazendo logout automático.',
      action: 'Fazer login novamente',
      severity: 'high'
    }
  },

  // Erros de Banco de Dados
  database: {
    connection_failed: {
      title: 'Erro de Conexão',
      description: 'Não foi possível conectar ao banco de dados. Tente novamente.',
      action: 'Verificar conexão e tentar novamente',
      severity: 'high'
    },
    constraint_violation: {
      title: 'Erro de Integridade',
      description: 'A operação violou uma regra de integridade dos dados.',
      action: 'Verificar dados e tentar novamente',
      severity: 'medium'
    },
    duplicate_key: {
      title: 'Registro Duplicado',
      description: 'Um registro com estas informações já existe no sistema.',
      action: 'Verificar dados únicos',
      severity: 'medium'
    },
    foreign_key_violation: {
      title: 'Referência Inválida',
      description: 'Esta operação afetaria registros relacionados.',
      action: 'Verificar dependências',
      severity: 'medium'
    },
    not_found: {
      title: 'Registro Não Encontrado',
      description: 'O registro solicitado não foi encontrado no sistema.',
      action: 'Verificar se o registro existe',
      severity: 'low'
    },
    query_timeout: {
      title: 'Consulta Demorada',
      description: 'A consulta ao banco de dados demorou mais que o esperado.',
      action: 'Tentar novamente',
      severity: 'medium'
    }
  },

  // Erros de Rede
  network: {
    offline: {
      title: 'Sem Conexão',
      description: 'Você está offline. Verifique sua conexão com a internet.',
      action: 'Verificar conexão',
      severity: 'high'
    },
    timeout: {
      title: 'Timeout de Rede',
      description: 'A solicitação demorou mais que o esperado. Tente novamente.',
      action: 'Tentar novamente',
      severity: 'medium'
    },
    server_error: {
      title: 'Erro do Servidor',
      description: 'O servidor está temporariamente indisponível.',
      action: 'Tentar novamente em alguns minutos',
      severity: 'high'
    },
    bad_gateway: {
      title: 'Gateway Inválido',
      description: 'Erro de comunicação com o servidor.',
      action: 'Tentar novamente',
      severity: 'medium'
    }
  },

  // Erros de Validação
  validation: {
    required_field: {
      title: 'Campo Obrigatório',
      description: 'Este campo é obrigatório e deve ser preenchido.',
      action: 'Preencher campo obrigatório',
      severity: 'low'
    },
    invalid_email: {
      title: 'Email Inválido',
      description: 'O formato do email informado é inválido.',
      action: 'Verificar formato do email',
      severity: 'low'
    },
    invalid_phone: {
      title: 'Telefone Inválido',
      description: 'O formato do telefone informado é inválido.',
      action: 'Verificar formato do telefone',
      severity: 'low'
    },
    invalid_cpf: {
      title: 'CPF Inválido',
      description: 'O CPF informado é inválido.',
      action: 'Verificar CPF',
      severity: 'low'
    },
    min_length: {
      title: 'Texto Muito Curto',
      description: 'O texto deve ter pelo menos o número mínimo de caracteres.',
      action: 'Adicionar mais caracteres',
      severity: 'low'
    },
    max_length: {
      title: 'Texto Muito Longo',
      description: 'O texto excede o número máximo de caracteres permitidos.',
      action: 'Reduzir número de caracteres',
      severity: 'low'
    }
  },

  // Erros de Negócio
  business: {
    insufficient_stock: {
      title: 'Estoque Insuficiente',
      description: 'Não há estoque suficiente para completar esta operação.',
      action: 'Verificar disponibilidade',
      severity: 'medium'
    },
    invalid_price: {
      title: 'Preço Inválido',
      description: 'O preço informado é inválido ou fora dos limites permitidos.',
      action: 'Verificar preço',
      severity: 'medium'
    },
    sale_in_progress: {
      title: 'Venda em Andamento',
      description: 'Uma venda já está sendo processada. Aguarde a conclusão.',
      action: 'Aguardar conclusão',
      severity: 'medium'
    },
    payment_failed: {
      title: 'Falha no Pagamento',
      description: 'Não foi possível processar o pagamento.',
      action: 'Verificar forma de pagamento',
      severity: 'high'
    },
    customer_blocked: {
      title: 'Cliente Bloqueado',
      description: 'Este cliente está bloqueado para novas operações.',
      action: 'Entrar em contato com administrador',
      severity: 'high'
    }
  },

  // Erros de Sistema
  system: {
    unexpected_error: {
      title: 'Erro Inesperado',
      description: 'Ocorreu um erro inesperado no sistema. Nossa equipe foi notificada.',
      action: 'Tentar novamente ou entrar em contato com suporte',
      severity: 'high'
    },
    maintenance: {
      title: 'Sistema em Manutenção',
      description: 'O sistema está temporariamente em manutenção.',
      action: 'Tentar novamente mais tarde',
      severity: 'high'
    },
    feature_disabled: {
      title: 'Funcionalidade Desabilitada',
      description: 'Esta funcionalidade está temporariamente desabilitada.',
      action: 'Tentar novamente mais tarde',
      severity: 'medium'
    }
  },

  // Erros de Timeout
  timeout: {
    operation_timeout: {
      title: 'Operação Demorada',
      description: 'A operação está demorando mais que o esperado.',
      action: 'Tentar novamente',
      severity: 'medium'
    },
    form_timeout: {
      title: 'Formulário Expirado',
      description: 'O formulário ficou muito tempo aberto e expirou.',
      action: 'Recarregar página e tentar novamente',
      severity: 'medium'
    }
  },

  // Erros de Permissão
  permission: {
    insufficient_permissions: {
      title: 'Permissões Insuficientes',
      description: 'Você não tem permissão para executar esta ação.',
      action: 'Entrar em contato com administrador',
      severity: 'high'
    },
    admin_required: {
      title: 'Acesso Administrativo Necessário',
      description: 'Esta operação requer permissões de administrador.',
      action: 'Entrar em contato com administrador',
      severity: 'high'
    }
  }
};

// Códigos de erro específicos do Supabase
export const SUPABASE_ERROR_CODES: SupabaseErrorCode[] = [
  {
    code: 'PGRST116', // Não encontrado
    message: ERROR_MESSAGES.database.not_found
  },
  {
    code: 'PGRST301', // Não encontrado
    message: ERROR_MESSAGES.database.not_found
  },
  {
    code: '23505', // Unique violation
    message: ERROR_MESSAGES.database.duplicate_key
  },
  {
    code: '23503', // Foreign key violation
    message: ERROR_MESSAGES.database.foreign_key_violation
  },
  {
    code: '23502', // Not null violation
    message: ERROR_MESSAGES.validation.required_field
  },
  {
    code: '42P01', // Undefined table
    message: ERROR_MESSAGES.database.connection_failed
  },
  {
    code: 'invalid_grant', // Auth error
    message: ERROR_MESSAGES.auth.invalid_credentials
  },
  {
    code: 'signup_not_allowed', // Auth error
    message: ERROR_MESSAGES.auth.unauthorized
  }
];

// Função para obter mensagem de erro padronizada
export const getErrorMessage = (
  category: ErrorCategory,
  errorKey: string,
  fallbackMessage?: string
): ErrorMessage => {
  const categoryMessages = ERROR_MESSAGES[category];
  if (categoryMessages && categoryMessages[errorKey]) {
    return categoryMessages[errorKey];
  }

  // Fallback para erro genérico
  return {
    title: 'Erro',
    description: fallbackMessage || 'Ocorreu um erro inesperado.',
    action: 'Tentar novamente',
    severity: 'medium'
  };
};

// Função para mapear erro do Supabase
export const mapSupabaseError = (error: any): ErrorMessage => {
  if (!error) {
    return getErrorMessage('system', 'unexpected_error');
  }

  const errorMessage = error.message || '';
  const errorCode = error.code || '';

  // Verificar códigos específicos do Supabase
  const supabaseError = SUPABASE_ERROR_CODES.find(se => 
    errorCode === se.code || errorMessage.includes(se.code)
  );
  
  if (supabaseError) {
    return supabaseError.message;
  }

  // Verificar padrões na mensagem de erro
  const lowerMessage = errorMessage.toLowerCase();

  // Erros de autenticação
  if (lowerMessage.includes('invalid login credentials')) {
    return ERROR_MESSAGES.auth.invalid_credentials;
  }
  if (lowerMessage.includes('email not confirmed')) {
    return ERROR_MESSAGES.auth.email_not_confirmed;
  }
  if (lowerMessage.includes('too many requests')) {
    return ERROR_MESSAGES.auth.too_many_requests;
  }
  if (lowerMessage.includes('jwt') || lowerMessage.includes('token')) {
    return ERROR_MESSAGES.auth.token_expired;
  }

  // Erros de rede
  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return ERROR_MESSAGES.network.timeout;
  }
  if (lowerMessage.includes('timeout')) {
    return ERROR_MESSAGES.timeout.operation_timeout;
  }

  // Erros de validação
  if (lowerMessage.includes('required') || lowerMessage.includes('not null')) {
    return ERROR_MESSAGES.validation.required_field;
  }

  // Fallback
  return {
    title: 'Erro',
    description: errorMessage || 'Ocorreu um erro inesperado.',
    action: 'Tentar novamente',
    severity: 'medium'
  };
};

// Função para obter mensagem contextual
export const getContextualErrorMessage = (
  error: any,
  context: string
): ErrorMessage => {
  const baseMessage = mapSupabaseError(error);
  
  // Personalizar mensagem baseada no contexto
  const contextualDescriptions: Record<string, string> = {
    'login': 'Não foi possível fazer login.',
    'create_product': 'Não foi possível criar o produto.',
    'update_product': 'Não foi possível atualizar o produto.',
    'delete_product': 'Não foi possível excluir o produto.',
    'create_sale': 'Não foi possível processar a venda.',
    'create_customer': 'Não foi possível cadastrar o cliente.',
    'stock_movement': 'Não foi possível movimentar o estoque.',
    'load_dashboard': 'Não foi possível carregar os dados do dashboard.'
  };

  return {
    ...baseMessage,
    description: contextualDescriptions[context] 
      ? `${contextualDescriptions[context]} ${baseMessage.description}`
      : baseMessage.description
  };
};

// Função para obter cor do tema baseada na severidade
export const getErrorColor = (severity: ErrorMessage['severity']): string => {
  const colors = {
    low: 'yellow',
    medium: 'orange',
    high: 'red',
    critical: 'red'
  };
  return colors[severity];
};

// Função para determinar se deve mostrar detalhes técnicos
export const shouldShowTechnicalDetails = (severity: ErrorMessage['severity']): boolean => {
  return process.env.NODE_ENV === 'development' || severity === 'critical';
};