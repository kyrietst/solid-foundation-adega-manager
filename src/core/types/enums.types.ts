/**
 * String Union Types para valores específicos e restritos
 * Previne valores inválidos através de type safety
 */

// Categorias de produtos para Adega
export type WineCategory = 
  | 'Vinho Tinto' 
  | 'Vinho Branco' 
  | 'Vinho Rosé' 
  | 'Espumante' 
  | 'Champagne' 
  | 'Whisky' 
  | 'Vodka' 
  | 'Gin' 
  | 'Rum' 
  | 'Cachaça' 
  | 'Cerveja' 
  | 'Licor' 
  | 'Conhaque' 
  | 'Aperitivo'
  | 'Outros';

// Métodos de pagamento
export type PaymentMethod = 
  | 'dinheiro' 
  | 'cartao_credito' 
  | 'cartao_debito' 
  | 'pix' 
  | 'transferencia' 
  | 'fiado';

// Tipos de interação com cliente
export type InteractionType = 
  | 'sale' 
  | 'inquiry' 
  | 'complaint' 
  | 'feedback' 
  | 'return' 
  | 'recommendation' 
  | 'follow_up'
  | 'phone_call'
  | 'email'
  | 'whatsapp';

// Razões para movimentação de estoque
export type InventoryMovementReason = 
  | 'purchase' 
  | 'sale' 
  | 'adjustment' 
  | 'return' 
  | 'damage' 
  | 'expiry' 
  | 'transfer' 
  | 'fiado' 
  | 'devolucao'
  | 'loss'
  | 'correction'
  | 'inventory_count';

// Status de vendas
export type SaleStatus = 
  | 'pending' 
  | 'completed' 
  | 'cancelled' 
  | 'delivering' 
  | 'delivered' 
  | 'returned'
  | 'partial_return';

// Status de pagamento
export type PaymentStatus = 
  | 'pending' 
  | 'paid' 
  | 'cancelled'
  | 'refunded'
  | 'partial_refund';

// Roles de usuário
export type UserRole = 
  | 'admin' 
  | 'employee' 
  | 'delivery'
  | 'manager'
  | 'viewer';

// Tipos de eventos de auditoria
export type AuditAction = 
  | 'create' 
  | 'read' 
  | 'update' 
  | 'delete'
  | 'login'
  | 'logout'
  | 'backup'
  | 'restore'
  | 'export'
  | 'import';

// Segmentação de clientes
export type CustomerSegment = 
  | 'High Value' 
  | 'Regular' 
  | 'Occasional' 
  | 'New'
  | 'VIP'
  | 'Inactive';

// Status de delivery
export type DeliveryStatus = 
  | 'pending' 
  | 'assigned' 
  | 'in_transit' 
  | 'delivered' 
  | 'failed'
  | 'cancelled'
  | 'returned';

// Prioridade de notificações
export type NotificationPriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

// Tipos de notificação
export type NotificationType = 
  | 'info' 
  | 'success' 
  | 'warning' 
  | 'error'
  | 'stock_alert'
  | 'sale_complete'
  | 'delivery_update'
  | 'customer_milestone';

// Status de estoque
export type StockStatus = 
  | 'in_stock' 
  | 'low_stock' 
  | 'out_of_stock' 
  | 'overstocked'
  | 'discontinued';

// Tipos de relatório
export type ReportType = 
  | 'sales' 
  | 'inventory' 
  | 'financial' 
  | 'customer'
  | 'product_performance'
  | 'user_activity'
  | 'audit';

// Período de relatório
export type ReportPeriod = 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'quarterly' 
  | 'yearly'
  | 'custom';

// Regiões vinícolas (expandir conforme necessário)
export type WineRegion = 
  | 'Bordeaux' 
  | 'Bourgogne' 
  | 'Champagne' 
  | 'Loire'
  | 'Rhône'
  | 'Alsace'
  | 'Douro'
  | 'Alentejo'
  | 'Vinho Verde'
  | 'Rioja'
  | 'Ribera del Duero'
  | 'Toscana'
  | 'Piemonte'
  | 'Veneto'
  | 'Serra Gaúcha'
  | 'Vale dos Vinhedos'
  | 'Campanha'
  | 'Outros';

// Países produtores
export type ProducingCountry = 
  | 'França' 
  | 'Itália' 
  | 'Espanha' 
  | 'Portugal' 
  | 'Brasil'
  | 'Argentina'
  | 'Chile'
  | 'Estados Unidos'
  | 'Austrália'
  | 'Alemanha'
  | 'Outros';

// Utilitários para validação e conversão
export const WINE_CATEGORIES: readonly WineCategory[] = [
  'Vinho Tinto', 'Vinho Branco', 'Vinho Rosé', 'Espumante', 'Champagne', 
  'Whisky', 'Vodka', 'Gin', 'Rum', 'Cachaça', 'Cerveja', 'Licor', 
  'Conhaque', 'Aperitivo', 'Outros'
] as const;

export const PAYMENT_METHODS: readonly PaymentMethod[] = [
  'dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'fiado'
] as const;

export const USER_ROLES: readonly UserRole[] = [
  'admin', 'employee', 'delivery', 'manager', 'viewer'
] as const;

export const CUSTOMER_SEGMENTS: readonly CustomerSegment[] = [
  'High Value', 'Regular', 'Occasional', 'New', 'VIP', 'Inactive'
] as const;

// Type guards
export const isWineCategory = (value: string): value is WineCategory => 
  WINE_CATEGORIES.includes(value as WineCategory);

export const isPaymentMethod = (value: string): value is PaymentMethod => 
  PAYMENT_METHODS.includes(value as PaymentMethod);

export const isUserRole = (value: string): value is UserRole => 
  USER_ROLES.includes(value as UserRole);

export const isCustomerSegment = (value: string): value is CustomerSegment => 
  CUSTOMER_SEGMENTS.includes(value as CustomerSegment);

// Mapeamentos para UI
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  'dinheiro': 'Dinheiro',
  'cartao_credito': 'Cartão de Crédito',
  'cartao_debito': 'Cartão de Débito',
  'pix': 'PIX',
  'transferencia': 'Transferência',
  'fiado': 'Fiado'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  'admin': 'Administrador',
  'employee': 'Funcionário',
  'delivery': 'Entregador',
  'manager': 'Gerente',
  'viewer': 'Visualizador'
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  'in_stock': 'Em Estoque',
  'low_stock': 'Estoque Baixo',
  'out_of_stock': 'Sem Estoque',
  'overstocked': 'Excesso de Estoque',
  'discontinued': 'Descontinuado'
};