/**
 * Function Types específicos para event handlers, callbacks e validação
 * Melhora type safety e experiência de desenvolvimento
 */

import type { Price, StockQuantity } from './branded.types';
import type { PaymentMethod, UserRole } from './enums.types';

// Event handlers genéricos
export type VoidEventHandler = () => void;
export type AsyncVoidEventHandler = () => Promise<void>;

// Event handlers com parâmetros específicos
export type StringEventHandler = (value: string) => void;
export type NumberEventHandler = (value: number) => void;
export type BooleanEventHandler = (value: boolean) => void;

// Event handlers para formulários
export type FormSubmitHandler<T = unknown> = (data: T) => void;
export type AsyncFormSubmitHandler<T = unknown> = (data: T) => Promise<void>;
export type FormErrorHandler = (error: Error) => void;
export type FormValidationHandler<T = unknown> = (data: T) => boolean | Promise<boolean>;

// Event handlers para entidades específicas
export type ProductSelectHandler = (productId: string) => void;
export type CustomerSelectHandler = (customerId: string) => void;
export type PaymentMethodSelectHandler = (method: PaymentMethod) => void;

// Callbacks para operações CRUD
export type CreateSuccessCallback<T = unknown> = (createdItem: T) => void;
export type UpdateSuccessCallback<T = unknown> = (updatedItem: T) => void;
export type DeleteSuccessCallback = (deletedId: string) => void;
export type ErrorCallback = (error: Error) => void;

// Callbacks para operações assíncronas
export type AsyncCreateCallback<T = unknown> = (data: Omit<T, 'id'>) => Promise<T>;
export type AsyncUpdateCallback<T = unknown> = (id: string, data: Partial<T>) => Promise<T>;
export type AsyncDeleteCallback = (id: string) => Promise<void>;
export type AsyncFetchCallback<T = unknown> = (id: string) => Promise<T>;

// Validators específicos
export type PriceValidator = (price: number) => price is Price;
export type StockQuantityValidator = (quantity: number) => quantity is StockQuantity;
export type EmailValidator = (email: string) => boolean;
export type PhoneValidator = (phone: string) => boolean;
export type BarcodeValidator = (barcode: string) => boolean;

// Search e filter handlers
export type SearchHandler = (query: string) => void;
export type FilterHandler<T = unknown> = (filters: T) => void;
export type SortHandler = (field: string, direction: 'asc' | 'desc') => void;

// Pagination handlers
export type PageChangeHandler = (page: number) => void;
export type ItemsPerPageChangeHandler = (itemsPerPage: number) => void;

// Authorization handlers
export type AuthorizationCheck = (userRole: UserRole) => boolean;
export type PermissionCheck = (permission: string, userRole: UserRole) => boolean;

// File upload handlers
export type FileUploadHandler = (file: File) => void;
export type AsyncFileUploadHandler = (file: File) => Promise<string>; // Returns URL
export type FileValidationHandler = (file: File) => boolean;

// Modal and dialog handlers
export type ModalOpenHandler = () => void;
export type ModalCloseHandler = () => void;
export type ConfirmationHandler = (confirmed: boolean) => void;

// Navigation handlers
export type NavigationHandler = (path: string) => void;
export type BackNavigationHandler = () => void;

// Data transformation functions
export type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput;
export type AsyncDataTransformer<TInput, TOutput> = (input: TInput) => Promise<TOutput>;

// Cache handlers
export type CacheInvalidationHandler = (keys: string[]) => void;
export type CacheUpdateHandler<T = unknown> = (key: string, data: T) => void;

// WebSocket handlers
export type MessageHandler<T = unknown> = (message: T) => void;
export type ConnectionHandler = () => void;
export type DisconnectionHandler = () => void;
export type ErrorHandler = (error: Error) => void;

// Notification handlers
export type NotificationHandler = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
export type ToastHandler = (title: string, description?: string, variant?: 'default' | 'destructive') => void;

// Analytics handlers
export type AnalyticsEventHandler = (eventName: string, properties?: Record<string, unknown>) => void;
export type MetricsCollectionHandler = (metrics: Record<string, number>) => void;

// Error handling types
export type ErrorBoundaryHandler = (error: Error, errorInfo: React.ErrorInfo) => void;
export type GlobalErrorHandler = (error: Error) => void;
export type ValidationErrorHandler = (field: string, error: string) => void;

// API response handlers
export type ApiResponseHandler<T = unknown> = (response: T) => void;
export type ApiErrorHandler = (error: { message: string; status?: number }) => void;

// Complex business logic handlers
export type StockUpdateHandler = (productId: string, newQuantity: StockQuantity) => void;
export type PriceUpdateHandler = (productId: string, newPrice: Price) => void;
export type SaleCompleteHandler = (saleId: string, totalAmount: Price) => void;
export type CustomerInsightHandler = (customerId: string, insight: string) => void;

// Configuration handlers
export type ConfigurationChangeHandler<T = unknown> = (config: T) => void;
export type ThemeChangeHandler = (theme: 'light' | 'dark') => void;
export type LanguageChangeHandler = (language: string) => void;

// Utility type for creating custom handlers
export type CustomEventHandler<TPayload = unknown> = (payload: TPayload) => void;
export type AsyncCustomEventHandler<TPayload = unknown> = (payload: TPayload) => Promise<void>;

// Generic handler factory
export type HandlerFactory<TInput, TOutput> = (input: TInput) => (payload: TOutput) => void;

// Predicate functions (for filtering, finding, etc.)
export type Predicate<T = unknown> = (item: T) => boolean;
export type AsyncPredicate<T = unknown> = (item: T) => Promise<boolean>;

// Comparator functions (for sorting)
export type Comparator<T = unknown> = (a: T, b: T) => number;

// Reducer functions
export type Reducer<TState, TAction> = (state: TState, action: TAction) => TState;

// Effect functions
export type Effect = () => void | (() => void);
export type AsyncEffect = () => Promise<void | (() => void)>;

// Middleware types
export type Middleware<T = unknown> = (input: T, next: () => void) => void;
export type AsyncMiddleware<T = unknown> = (input: T, next: () => Promise<void>) => Promise<void>;