/**
 * table-types.ts - Tipos TypeScript para componentes de tabela
 * Context7 Pattern: Type safety para componentes reutilizáveis
 * Centralizando definições de tipos para consistência
 */

export interface TableColumn {
  key: string;
  label: string;
  description?: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface CustomerTableRow {
  id: string;
  cliente: string;
  email?: string;
  telefone?: string;
  segmento: string;
  status: string;
  ultimaCompra?: Date;
  cidade?: string;
  insightsCount: number;
  diasParaAniversario?: number;
  profileCompleteness: number;
  diasSemContato?: number;
  valorEmAberto?: number;
  categoriaFavorita?: string;
  metodoPagamentoFavorito?: string;
  valorTotalCompras?: number;
  quantidadeCompras?: number;
}

export type SortField =
  | 'cliente'
  | 'ultimaCompra'
  | 'insightsCount'
  | 'status'
  | 'cidade'
  | 'diasParaAniversario'
  | 'profileCompleteness'
  | 'diasSemContato'
  | 'valorEmAberto'
  | null;

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface FilterConfig {
  searchTerm: string;
  segmentFilter: string;
  statusFilter: string;
  lastPurchaseFilter: string;
  birthdayFilter: string;
}

// Colunas disponíveis na tabela
export const TABLE_COLUMNS: TableColumn[] = [
  {
    key: 'cliente',
    label: 'Cliente',
    description: 'Nome do cliente',
    sortable: true,
    width: 'minmax(200px, 1fr)',
    align: 'left',
  },
  {
    key: 'ultimaCompra',
    label: 'Última Compra',
    description: 'Data da última compra realizada',
    sortable: true,
    width: '140px',
    align: 'center',
  },
  {
    key: 'insightsCount',
    label: 'Insights',
    description: 'Número de insights de IA disponíveis',
    sortable: true,
    width: '100px',
    align: 'center',
  },
  {
    key: 'status',
    label: 'Status',
    description: 'Status atual do cliente',
    sortable: true,
    width: '100px',
    align: 'center',
  },
  {
    key: 'cidade',
    label: 'Cidade',
    description: 'Localização do cliente',
    sortable: true,
    width: '120px',
    align: 'left',
  },
  {
    key: 'diasParaAniversario',
    label: 'Aniversário',
    description: 'Dias para o próximo aniversário',
    sortable: true,
    width: '110px',
    align: 'center',
  },
  {
    key: 'profileCompleteness',
    label: 'Perfil',
    description: 'Completude do perfil (%)',
    sortable: true,
    width: '100px',
    align: 'center',
  },
  {
    key: 'diasSemContato',
    label: 'Último Contato',
    description: 'Dias desde o último contato',
    sortable: true,
    width: '120px',
    align: 'center',
  },
  {
    key: 'valorEmAberto',
    label: 'Valor em Aberto',
    description: 'Valor pendente de pagamento',
    sortable: true,
    width: '130px',
    align: 'right',
  },
];

// Função para obter configuração da coluna
export const getColumnConfig = (key: string): TableColumn | undefined => {
  return TABLE_COLUMNS.find(col => col.key === key);
};

// Função para validar se uma coluna é essencial
export const isEssentialColumn = (key: string): boolean => {
  return ['cliente', 'ultimaCompra', 'status'].includes(key);
};

export default {
  TABLE_COLUMNS,
  getColumnConfig,
  isEssentialColumn,
};