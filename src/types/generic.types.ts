/**
 * Generic Types com Constraints específicos
 * Melhora type safety para operações genéricas e abstrações
 */

import type { Price, StockQuantity } from './branded.types';
import type { UserRole, PaymentMethod } from './enums.types';

// ============================================================================
// BASE CONSTRAINTS
// ============================================================================

// Constraint para entidades que têm ID
export interface WithId {
  id: string;
}

// Constraint para entidades com timestamps
export interface WithTimestamps {
  created_at: string;
  updated_at: string;
}

// Constraint para entidades que têm usuário criador
export interface WithCreatedBy {
  created_by: string;
}

// Constraint para entidades soft delete
export interface WithSoftDelete {
  deleted_at: string | null;
}

// Constraint para entidades com nome
export interface WithName {
  name: string;
}

// Constraint para entidades com preço
export interface WithPrice {
  price: Price;
}

// Constraint para entidades com quantidade
export interface WithQuantity {
  quantity: StockQuantity;
}

// ============================================================================
// GENERIC UTILITY TYPES COM CONSTRAINTS
// ============================================================================

// Tipo genérico para entidades básicas do sistema
export type BaseEntity<T = {}> = WithId & WithTimestamps & T;

// Tipo genérico para entidades auditáveis
export type AuditableEntity<T = {}> = BaseEntity<T> & WithCreatedBy;

// Tipo genérico para entidades com soft delete
export type SoftDeletableEntity<T = {}> = AuditableEntity<T> & WithSoftDelete;

// Tipo genérico para dados de formulário (sem campos automáticos)
export type FormData<T extends WithId> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

// Tipo genérico para dados de atualização (campos opcionais)
export type UpdateData<T extends WithId> = Partial<Omit<T, 'id' | 'created_at'>> & {
  updated_at?: string;
};

// Tipo genérico para dados de listagem (com paginação)
export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// OPERAÇÕES CRUD GENÉRICAS COM CONSTRAINTS
// ============================================================================

// Tipo para operações de busca
export interface SearchableEntity {
  searchableFields: string[];
}

// Tipo para operações de filtro
export interface FilterableEntity<TFilters = Record<string, unknown>> {
  filters: TFilters;
}

// Tipo para operações de ordenação
export interface SortableEntity {
  sortableFields: string[];
}

// Interface genérica para service/repository patterns
export interface Repository<
  TEntity extends WithId,
  TCreateData = FormData<TEntity>,
  TUpdateData = UpdateData<TEntity>
> {
  findById(id: string): Promise<TEntity | null>;
  findMany(options?: {
    filters?: Record<string, unknown>;
    orderBy?: { field: keyof TEntity; direction: 'asc' | 'desc' };
    limit?: number;
    offset?: number;
  }): Promise<ListResponse<TEntity>>;
  create(data: TCreateData): Promise<TEntity>;
  update(id: string, data: TUpdateData): Promise<TEntity>;
  delete(id: string): Promise<void>;
}

// ============================================================================
// VALIDATION GENERICS
// ============================================================================

// Tipo genérico para validadores
export type Validator<T> = (value: unknown) => value is T;

// Tipo genérico para schemas de validação
export interface ValidationSchema<T> {
  validate(data: unknown): data is T;
  validateAsync(data: unknown): Promise<data is T>;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// Tipo genérico para regras de validação
export type ValidationRule<T> = (value: T) => boolean | string;

// ============================================================================
// API RESPONSE GENERICS
// ============================================================================

// Resposta de API genérica
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

// Resposta de erro de API
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// STATE MANAGEMENT GENERICS
// ============================================================================

// Estado de loading genérico
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Estado CRUD genérico
export interface CrudState<T extends WithId> extends LoadingState {
  items: T[];
  selectedItem: T | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// Ações CRUD genéricas
export type CrudAction<T extends WithId> =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: T[] }
  | { type: 'ADD_ITEM'; payload: T }
  | { type: 'UPDATE_ITEM'; payload: T }
  | { type: 'DELETE_ITEM'; payload: string }
  | { type: 'SELECT_ITEM'; payload: T | null };

// ============================================================================
// PERMISSION & AUTHORIZATION GENERICS
// ============================================================================

// Constraint para entidades com controle de acesso
export interface WithPermissions {
  permissions: string[];
  roles: UserRole[];
}

// Tipo genérico para verificação de permissões
export type PermissionCheck<T extends WithPermissions> = (
  entity: T,
  userRole: UserRole,
  requiredPermission: string
) => boolean;

// ============================================================================
// BUSINESS LOGIC GENERICS
// ============================================================================

// Constraint para entidades de produto
export interface ProductLike extends WithId, WithName, WithPrice {
  category: string;
  stock_quantity: StockQuantity;
}

// Constraint para entidades de cliente
export interface CustomerLike extends WithId, WithName {
  email?: string;
  phone?: string;
}

// Constraint para entidades de venda
export interface SaleLike extends WithId, WithTimestamps {
  customer_id: string | null;
  total_amount: Price;
  payment_method: PaymentMethod;
}

// ============================================================================
// EVENT SYSTEM GENERICS
// ============================================================================

// Evento genérico do sistema
export interface SystemEvent<TPayload = unknown> {
  id: string;
  type: string;
  payload: TPayload;
  timestamp: Date;
  userId?: string;
}

// Handler de evento genérico
export type EventHandler<TEvent extends SystemEvent> = (event: TEvent) => void | Promise<void>;

// ============================================================================
// UTILITY TYPES AVANÇADOS
// ============================================================================

// Extrai tipos de union
export type ExtractType<T, U> = T extends U ? T : never;

// Tipo condicional para campos obrigatórios
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Tipo condicional para campos opcionais
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Tipo para keys que são strings
export type StringKeys<T> = Extract<keyof T, string>;

// Tipo para keys que são números
export type NumberKeys<T> = Extract<keyof T, number>;

// Tipo para valores que são funções
export type FunctionValues<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never;
};

// Tipo para deep partial
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Tipo para deep readonly
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// ============================================================================
// TYPE GUARDS GENÉRICOS
// ============================================================================

// Type guard para verificar se tem ID
export const hasId = <T>(obj: T): obj is T & WithId => {
  return typeof obj === 'object' && obj !== null && 'id' in obj && typeof (obj as any).id === 'string';
};

// Type guard para verificar se tem timestamps
export const hasTimestamps = <T>(obj: T): obj is T & WithTimestamps => {
  return typeof obj === 'object' && obj !== null && 
         'created_at' in obj && 'updated_at' in obj &&
         typeof (obj as any).created_at === 'string' &&
         typeof (obj as any).updated_at === 'string';
};

// Type guard para verificar se tem nome
export const hasName = <T>(obj: T): obj is T & WithName => {
  return typeof obj === 'object' && obj !== null && 'name' in obj && typeof (obj as any).name === 'string';
};

// Type guard genérico para arrays
export const isArrayOf = <T>(arr: unknown[], guard: (item: unknown) => item is T): arr is T[] => {
  return arr.every(guard);
};

// Type guard para verificar se é não nulo/undefined
export const isNotNullish = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};