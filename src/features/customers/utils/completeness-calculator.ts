/**
 * Utilitário para calcular completude de perfis de clientes
 * Sistema de pesos baseado na importância dos campos para relatórios
 */

export interface CustomerData {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: any; // JSONB field
  birthday?: string | null;
  first_purchase_date?: string | null;
  last_purchase_date?: string | null;
  purchase_frequency?: string | null;
  favorite_category?: string | null;
  favorite_product?: string | null;
  notes?: string | null;
  contact_permission?: boolean;
  created_at: string;
}

export interface FieldInfo {
  key: keyof CustomerData;
  label: string;
  weight: number;
  priority: 'critical' | 'important' | 'optional';
  description: string;
  icon: string; // Lucide icon name
}

// Configuração de campos com pesos e prioridades
export const CUSTOMER_FIELDS: FieldInfo[] = [
  {
    key: 'email',
    label: 'Email',
    weight: 20,
    priority: 'critical',
    description: 'Essencial para campanhas de marketing e comunicação',
    icon: 'Mail'
  },
  {
    key: 'phone',
    label: 'Telefone',
    weight: 20,
    priority: 'critical', 
    description: 'Essencial para contato direto e suporte',
    icon: 'Phone'
  },
  {
    key: 'birthday',
    label: 'Data de Nascimento',
    weight: 15,
    priority: 'important',
    description: 'Importante para campanhas sazonais e personalização',
    icon: 'Calendar'
  },
  {
    key: 'address',
    label: 'Endereço',
    weight: 15,
    priority: 'important',
    description: 'Importante para delivery e análises geográficas',
    icon: 'MapPin'
  },
  {
    key: 'purchase_frequency',
    label: 'Frequência de Compra',
    weight: 15,
    priority: 'important',
    description: 'Chave para segmentação e predição de vendas',
    icon: 'BarChart3'
  },
  {
    key: 'favorite_category',
    label: 'Categoria Favorita',
    weight: 8,
    priority: 'optional',
    description: 'Útil para recomendações personalizadas',
    icon: 'Heart'
  },
  {
    key: 'favorite_product',
    label: 'Produto Favorito',
    weight: 7,
    priority: 'optional',
    description: 'Útil para cross-selling e upselling',
    icon: 'Star'
  }
];

export interface CompletenessResult {
  percentage: number;
  score: number;
  maxScore: number;
  missingFields: FieldInfo[];
  presentFields: FieldInfo[];
  criticalMissing: FieldInfo[];
  importantMissing: FieldInfo[];
  level: 'poor' | 'fair' | 'good' | 'excellent';
  recommendations: string[];
}

/**
 * Verifica se um campo está preenchido
 */
const isFieldPresent = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
};

/**
 * Calcula a completude de um perfil de cliente
 */
export const calculateCompleteness = (customer: CustomerData): CompletenessResult => {
  const presentFields: FieldInfo[] = [];
  const missingFields: FieldInfo[] = [];
  let score = 0;
  const maxScore = CUSTOMER_FIELDS.reduce((sum, field) => sum + field.weight, 0);

  // Verificar cada campo
  CUSTOMER_FIELDS.forEach(field => {
    const value = customer[field.key];
    
    if (isFieldPresent(value)) {
      presentFields.push(field);
      score += field.weight;
    } else {
      missingFields.push(field);
    }
  });

  // Calcular porcentagem
  const percentage = Math.round((score / maxScore) * 100);

  // Separar campos ausentes por prioridade
  const criticalMissing = missingFields.filter(f => f.priority === 'critical');
  const importantMissing = missingFields.filter(f => f.priority === 'important');

  // Determinar nível
  let level: CompletenessResult['level'];
  if (percentage >= 90) level = 'excellent';
  else if (percentage >= 70) level = 'good';
  else if (percentage >= 50) level = 'fair';
  else level = 'poor';

  // Gerar recomendações
  const recommendations: string[] = [];
  
  if (criticalMissing.length > 0) {
    recommendations.push(`Complete os campos críticos: ${criticalMissing.map(f => f.label).join(', ')}`);
  }
  
  if (importantMissing.length > 0 && criticalMissing.length === 0) {
    recommendations.push(`Adicione informações importantes: ${importantMissing.map(f => f.label).join(', ')}`);
  }
  
  if (percentage >= 80) {
    recommendations.push('Perfil quase completo! Adicione os campos restantes para maximizar a efetividade dos relatórios.');
  }
  
  if (percentage === 100) {
    recommendations.push('🎉 Perfil completo! Dados otimizados para relatórios precisos.');
  }

  return {
    percentage,
    score,
    maxScore,
    missingFields,
    presentFields,
    criticalMissing,
    importantMissing,
    level,
    recommendations
  };
};

/**
 * Calcula métricas de qualidade para um conjunto de clientes
 */
export interface DataQualityMetrics {
  totalCustomers: number;
  averageCompleteness: number;
  completeProfiles: number; // >= 90%
  incompleteProfiles: number; // < 90%
  poorQualityProfiles: number; // < 50%
  topMissingFields: Array<{
    field: FieldInfo;
    missingCount: number;
    missingPercentage: number;
  }>;
  qualityDistribution: {
    excellent: number; // >= 90%
    good: number;      // 70-89%
    fair: number;      // 50-69%
    poor: number;      // < 50%
  };
}

export const calculateDataQualityMetrics = (customers: CustomerData[]): DataQualityMetrics => {
  if (customers.length === 0) {
    return {
      totalCustomers: 0,
      averageCompleteness: 0,
      completeProfiles: 0,
      incompleteProfiles: 0,
      poorQualityProfiles: 0,
      topMissingFields: [],
      qualityDistribution: { excellent: 0, good: 0, fair: 0, poor: 0 }
    };
  }

  const completenessResults = customers.map(calculateCompleteness);
  
  // Calcular completude média
  const averageCompleteness = Math.round(
    completenessResults.reduce((sum, result) => sum + result.percentage, 0) / customers.length
  );

  // Contar perfis por qualidade
  const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
  completenessResults.forEach(result => {
    distribution[result.level]++;
  });

  // Contar perfis completos/incompletos
  const completeProfiles = completenessResults.filter(r => r.percentage >= 90).length;
  const incompleteProfiles = customers.length - completeProfiles;
  const poorQualityProfiles = distribution.poor;

  // Calcular campos mais ausentes
  const fieldMissingCount: { [key: string]: number } = {};
  
  CUSTOMER_FIELDS.forEach(field => {
    fieldMissingCount[field.key] = 0;
  });

  completenessResults.forEach(result => {
    result.missingFields.forEach(field => {
      fieldMissingCount[field.key]++;
    });
  });

  const topMissingFields = CUSTOMER_FIELDS
    .map(field => ({
      field,
      missingCount: fieldMissingCount[field.key],
      missingPercentage: Math.round((fieldMissingCount[field.key] / customers.length) * 100)
    }))
    .filter(item => item.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 5);

  return {
    totalCustomers: customers.length,
    averageCompleteness,
    completeProfiles,
    incompleteProfiles,
    poorQualityProfiles,
    topMissingFields,
    qualityDistribution: distribution
  };
};

/**
 * Gera sugestões personalizadas baseadas no perfil do cliente
 */
export const generatePersonalizedSuggestions = (customer: CustomerData): string[] => {
  const result = calculateCompleteness(customer);
  const suggestions: string[] = [];

  // Sugestões baseadas em campos críticos ausentes
  if (result.criticalMissing.some(f => f.key === 'email')) {
    suggestions.push('📧 Adicione o email para habilitar campanhas de marketing personalizadas');
  }

  if (result.criticalMissing.some(f => f.key === 'phone')) {
    suggestions.push('📱 Complete o telefone para melhorar o atendimento e suporte');
  }

  // Sugestões baseadas em padrões
  if (customer.last_purchase_date && !customer.birthday) {
    suggestions.push('🎂 Adicione a data de nascimento para campanhas de aniversário');
  }

  if (customer.last_purchase_date && !customer.purchase_frequency) {
    suggestions.push('📊 Defina a frequência de compra para segmentação automática');
  }

  // Sugestões baseadas no histórico
  if (result.percentage >= 70 && result.percentage < 90) {
    suggestions.push('🎯 Você está quase lá! Complete mais alguns campos para maximizar os insights');
  }

  return suggestions;
};