/**
 * CustomerProfile Types - Context7 Pattern
 * Shared interfaces for CustomerProfile sub-components
 */

import { Customer, Purchase } from '@/core/types/database';
import { CustomerRealMetrics } from '@/features/customers/hooks/useCustomerRealMetrics';

export interface MissingField {
  key: string;
  label: string;
  value: any;
  required: boolean;
  icon: React.ComponentType<{ className?: string }>;
  impact: string;
}

export interface CustomerProfileProps {
  className?: string;
}

export interface CustomerHeaderProps {
  customer: Customer;
  realMetrics: CustomerRealMetrics;
  missingFields: MissingField[];
  onEdit: () => void;
  onWhatsApp: () => void;
  onEmail: () => void;
  onNewSale: () => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
}

export interface CustomerStatsProps {
  customer: Customer;
  realMetrics: CustomerRealMetrics;
  missingFields: MissingField[];
  onEdit: () => void;
}

export interface CustomerTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export interface CustomerChartsProps {
  purchases: Purchase[];
  customer: Customer;
  isLoading: boolean;
  error: Error | null;
}

export interface CustomerInsightsProps {
  purchases: Purchase[];
  customer: Customer;
  isLoading: boolean;
  error: Error | null;
}