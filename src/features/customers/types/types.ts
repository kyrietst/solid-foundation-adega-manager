/**
 * Interfaces TypeScript para componentes de customers refatorados  
 */

import {
  CustomerProfile,
  CustomerInsight,
  CustomerInteraction,
  CustomerSegment
} from '@/features/customers/hooks/use-crm';

// Interfaces para componentes principais
export interface CustomerStatsProps {
  totalCustomers: number;
  vipCustomers: number;
  totalRevenue: number;
  averageTicket: number;
  activeCustomers: number;
}

export interface CustomerFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  segmentFilter: string;
  onSegmentFilterChange: (segment: string) => void;
  uniqueSegments: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export interface CustomerGridProps {
  customers: CustomerProfile[];
  onSelectCustomer: (customer: CustomerProfile) => void;
  onEditCustomer?: (customer: CustomerProfile) => void;
  canEdit?: boolean;
  isLoading?: boolean;
}

export interface CustomerTableProps {
  customers: CustomerProfile[];
  onSelectCustomer: (customer: CustomerProfile) => void;
  onEditCustomer?: (customer: CustomerProfile) => void;
  canEdit?: boolean;
  isLoading?: boolean;
}

export interface CustomerCardProps {
  customer: CustomerProfile;
  onSelect: (customer: CustomerProfile) => void;
  onEdit?: (customer: CustomerProfile) => void;
  canEdit?: boolean;
}

export interface CustomerRowProps {
  customer: CustomerProfile;
  onSelect: (customer: CustomerProfile) => void;
  onEdit?: (customer: CustomerProfile) => void;
  canEdit?: boolean;
}

export interface CustomerSegmentBadgeProps {
  segment: string;
  className?: string;
}

export interface CustomerInsightsProps {
  customerId: string;
  insights?: CustomerInsight[];
  isLoading?: boolean;
}

export interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile | null;
  onEdit?: (customer: CustomerProfile) => void;
  canEdit?: boolean;
}

export interface CustomerHeaderProps {
  totalCustomers: number;
  filteredCount: number;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
  onCreateCustomer: () => void;
  canCreateCustomer: boolean;
}

// Interfaces para hooks
export interface CustomerStatsData {
  totalCustomers: number;
  vipCustomers: number;
  totalRevenue: number;
  averageTicket: number;
  activeCustomers: number;
}

export interface CustomerSegmentation {
  segments: string[];
  getSegmentColor: (segment: string) => string;
  getSegmentCount: (segment: string) => number;
}

export interface CustomerFilterState {
  searchTerm: string;
  segmentFilter: string;
  setSearchTerm: (term: string) => void;
  setSegmentFilter: (segment: string) => void;
  filteredCustomers: CustomerProfile[];
  uniqueSegments: string[];
}

export interface CustomerOperations {
  createCustomer: (data: any) => void;
  updateCustomer: (data: any) => void;
  deleteCustomer: (id: string) => void;
  createQuickCustomer: (data: { name: string; phone?: string | null }, options?: any) => void;
  createQuickCustomerAsync: (data: { name: string; phone?: string | null }) => Promise<string>;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isCreatingQuick: boolean;
}

// Interface para modal de detalhes
export interface CustomerDetailData {
  insights?: CustomerInsight[];
  interactions?: CustomerInteraction[];
  purchases?: any[]; // TODO: definir tipo específico para purchases
  isLoadingInsights: boolean;
  isLoadingInteractions: boolean;
  isLoadingPurchases: boolean;
}