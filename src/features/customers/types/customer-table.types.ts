export interface CustomerTableRow {
  id: string;
  cliente: string;
  email: string | null;
  phone: string | null;
  categoriaFavorita: string | null;
  segmento: string;
  metodoPreferido: string | null;
  ultimaCompra: Date | null;
  insightsCount: number;
  insightsConfidence: number;
  status: CustomerStatus;
  statusColor: CustomerStatusColor;
  createdAt: Date;
  updatedAt: Date;
  // Novos campos adicionados
  cidade: string | null;
  proximoAniversario: Date | null;
  diasParaAniversario: number | null;
  contactPermission: boolean;
  profileCompleteness: number;
  // Campos adicionais para última interação e valor em aberto
  ultimoContato: Date | null;
  diasSemContato: number | null;
  valorEmAberto: number;
}

export type CustomerStatus = 
  | 'VIP' 
  | 'Ativo' 
  | 'Regular' 
  | 'Em Risco' 
  | 'Inativo' 
  | 'Reativar';

export type CustomerStatusColor = 
  | 'gold' 
  | 'green' 
  | 'yellow' 
  | 'red' 
  | 'gray' 
  | 'orange';

export interface CustomerTableFilters {
  segmento: string;
  status: string;
  metodoPreferido: string;
  searchTerm: string;
}

export interface CustomerInsightBadge {
  count: number;
  confidence: number;
  level: 'high' | 'medium' | 'low';
  color: 'green' | 'yellow' | 'red';
}

export const CUSTOMER_SEGMENTS = [
  'Fiel - Ouro',
  'Fiel - Prata', 
  'Regular',
  'Primeira Compra',
  'Em Risco',
  'Inativo',
  'Novo'
] as const;

export const CUSTOMER_STATUSES = [
  'VIP',
  'Ativo',
  'Regular', 
  'Em Risco',
  'Inativo',
  'Reativar'
] as const;

export const PAYMENT_METHODS = [
  'PIX',
  'card',
  'cash',
  'credit',
  'debit',
  'bank_transfer'
] as const;

export const TABLE_COLUMNS = [
  'Cliente',
  'Categoria Favorita',
  'Segmento',
  'Método Preferido',
  'Última Compra',
  'Insights de IA',
  'Status',
  'Cidade',
  'PRÓXIMO\nANIVERSÁRIO',
  'LGPD',
  'Completude',
  'Último Contato',
  'Valor em Aberto'
] as const;

export type TableColumn = typeof TABLE_COLUMNS[number];

// Utility functions for the table
export const getInsightLevel = (confidence: number): CustomerInsightBadge['level'] => {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
};

export const getInsightColor = (level: CustomerInsightBadge['level']): CustomerInsightBadge['color'] => {
  const colors = { high: 'green', medium: 'yellow', low: 'red' } as const;
  return colors[level];
};

export const formatPaymentMethod = (method: string | null): string => {
  if (!method) return 'Sem histórico';
  
  const methodMap: Record<string, string> = {
    'PIX': 'PIX',
    'pix': 'PIX',
    'card': 'Cartão',
    'cash': 'Dinheiro',
    'credit': 'Crédito',
    'debit': 'Débito',
    'bank_transfer': 'Transferência'
  };
  
  return methodMap[method] || method;
};

export const formatLastPurchase = (date: Date | null): string => {
  if (!date) return 'Nunca';

  // Normalize both dates to start of day in local timezone to avoid timezone issues
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const purchaseDate = new Date(date);
  const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());

  // Calculate difference in days using normalized dates
  const diffInDays = Math.floor((today.getTime() - purchaseDateOnly.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoje';
  if (diffInDays === 1) return 'Ontem';
  if (diffInDays < 7) return `${diffInDays} dias atrás`;
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`;
  if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} meses atrás`;

  return date.toLocaleDateString('pt-BR');
};

export const formatNextBirthday = (date: Date | null, daysUntil: number | null): string => {
  if (!date || daysUntil === null) return 'Não informado';
  
  if (daysUntil === 0) return 'Hoje! 🎉';
  if (daysUntil === 1) return 'Amanhã 🎂';
  if (daysUntil <= 7) return `${daysUntil} dias 🎈`;
  if (daysUntil <= 30) return `${daysUntil} dias`;
  
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const getProfileCompletenessColor = (percentage: number): string => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

export const getProfileCompletenessBarColor = (percentage: number): string => {
  if (percentage >= 80) return 'bg-green-500';
  if (percentage >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const formatLastContact = (date: Date | null, daysAgo: number | null): string => {
  if (!date || daysAgo === null) return 'Nunca';
  
  if (daysAgo === 0) return 'Hoje';
  if (daysAgo === 1) return 'Ontem';
  if (daysAgo <= 7) return `${daysAgo} dias atrás`;
  if (daysAgo <= 30) return `${daysAgo} dias atrás`;
  
  return date.toLocaleDateString('pt-BR');
};

export const getLastContactColor = (daysAgo: number | null): string => {
  if (daysAgo === null) return 'text-gray-400';
  if (daysAgo <= 7) return 'text-green-600';
  if (daysAgo <= 30) return 'text-yellow-600';
  return 'text-red-600';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

export const getOutstandingAmountColor = (amount: number): string => {
  if (amount === 0) return 'text-gray-400';
  if (amount <= 100) return 'text-yellow-600';
  return 'text-red-600';
};