/**
 * EntityCard Usage Examples
 * Demonstrates how to use the EntityCard system with Context7 patterns
 * This file shows best practices for implementing entity cards
 */

import React from 'react';
import { Package, User, Building2, Star, Phone, Mail } from 'lucide-react';
import {
  EntityCard,
  ProductEntityCard,
  CustomerEntityCard,
  SupplierEntityCard
} from './index';
import type { Product } from '@/types/inventory.types';
import type { CustomerEntity } from './CustomerEntityCard';
import type { SupplierEntity } from './SupplierEntityCard';

// Example 1: Basic EntityCard usage with minimal configuration
const BasicEntityCardExample = () => {
  const basicEntity = {
    id: '1',
    name: 'Basic Entity',
  };

  return (
    <EntityCard
      entity={basicEntity}
      headerIcon={Star}
    />
  );
};

// Example 2: ProductEntityCard with full configuration
const ProductCardExample = () => {
  const product = {
    id: 'prod-1',
    name: 'Vinho Tinto Premium',
    price: 89.99,
    stock_quantity: 15,
    category: 'Vinhos Tintos',
    image_url: '/images/vinho-premium.jpg',
    is_active: true,
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding to cart:', product);
  };

  const handleOpenSelection = (product: Product) => {
    console.log('Opening selection modal:', product);
  };

  return (
    <ProductEntityCard
      product={product}
      onAddToCart={handleAddToCart}
      onOpenSelection={handleOpenSelection}
      variant="premium"
      size="md"
      glassEffect={true}
    />
  );
};

// Example 3: CustomerEntityCard with CRM data
const CustomerCardExample = () => {
  const customer = {
    id: 'cust-1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    address: 'Rua das Flores, 123',
    segment: 'high_value',
    lifetime_value: 2500.50,
    first_purchase_date: '2023-01-15',
    last_purchase_date: '2024-01-10',
    birthday: '1985-06-15',
    favorite_category: 'Vinhos Tintos',
  };

  const handleSelect = (customer: CustomerEntity & { id: string; name: string }) => {
    console.log('Selecting customer:', customer);
  };

  const handleEdit = (customer: CustomerEntity & { id: string; name: string }) => {
    console.log('Editing customer:', customer);
  };

  return (
    <CustomerEntityCard
      customer={customer}
      onSelect={handleSelect}
      onEdit={handleEdit}
      canEdit={true}
      variant="success"
      size="lg"
    />
  );
};

// Example 4: SupplierEntityCard with admin controls
const SupplierCardExample = () => {
  const supplier = {
    id: 'supp-1',
    company_name: 'Vinícola Premium Ltda',
    is_active: true,
    contact_info: {
      phone: '(11) 3333-3333',
      email: 'contato@vinicola.com',
      whatsapp: '(11) 99999-8888',
    },
    products_supplied: ['Vinho Tinto', 'Vinho Branco', 'Espumante'],
    delivery_time: '3-5 dias úteis',
    minimum_order_value: 500.00,
    payment_methods: ['PIX', 'Boleto', 'Cartão'],
    notes: 'Fornecedor confiável com produtos de alta qualidade',
  };

  const handleEdit = (supplier: SupplierEntity & { id: string }) => {
    console.log('Editing supplier:', supplier);
  };

  const handleDelete = (supplier: SupplierEntity & { id: string }) => {
    console.log('Deleting supplier:', supplier);
  };

  const handleToggleStatus = (supplier: SupplierEntity & { id: string }) => {
    console.log('Toggling supplier status:', supplier);
  };

  return (
    <SupplierEntityCard
      supplier={supplier}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onToggleStatus={handleToggleStatus}
      userRole="admin"
      variant="default"
      size="md"
    />
  );
};

// Example 5: Custom EntityCard with advanced configuration
const CustomEntityCardExample = () => {
  const customEntity = {
    id: 'custom-1',
    name: 'Custom Entity',
  };

  const customBadges = [
    { label: 'Premium', variant: 'outline' as const, className: 'bg-gold-500/20 text-gold-200' },
    { label: 'Active', variant: 'default' as const, icon: Star },
  ];

  const customFields = [
    { label: 'Status', value: 'Active', icon: Star },
    { label: 'Contact', value: 'contact@example.com', icon: Mail },
  ];

  const customActions = [
    {
      icon: Phone,
      label: 'Call',
      onClick: () => console.log('Calling...'),
      variant: 'ghost' as const,
    },
    {
      icon: Mail,
      label: 'Email',
      onClick: () => console.log('Emailing...'),
      variant: 'outline' as const,
    },
  ];

  const primaryAction = {
    icon: Star,
    label: 'Mark as Favorite',
    onClick: () => console.log('Marking as favorite...'),
    variant: 'default' as const,
  };

  return (
    <EntityCard
      entity={customEntity}
      variant="premium"
      size="lg"
      glassEffect={true}
      imageUrl="/images/custom-entity.jpg"
      imageAlt="Custom Entity Image"
      subtitle="This is a custom entity example"
      badges={customBadges}
      fields={customFields}
      actions={customActions}
      primaryAction={primaryAction}
      headerIcon={Building2}
      onSelect={(entity) => console.log('Selected:', entity)}
    >
      {/* Custom content area */}
      <div className="p-4 bg-purple-500/10 rounded-lg">
        <p className="text-sm text-gray-300">
          This is custom content within the EntityCard.
          You can put any React components here.
        </p>
      </div>
    </EntityCard>
  );
};

// Example 6: Grid layout with multiple cards
const EntityCardGridExample = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      <BasicEntityCardExample />
      <ProductCardExample />
      <CustomerCardExample />
      <SupplierCardExample />
      <CustomEntityCardExample />
    </div>
  );
};

// Usage patterns documentation
export const ENTITY_CARD_PATTERNS = {
  // Context7 Pattern: Generic component usage
  basic: `
    <EntityCard
      entity={{ id: '1', name: 'Entity Name' }}
      headerIcon={Icon}
    />
  `,

  // Context7 Pattern: Specialized component usage
  product: `
    <ProductEntityCard
      product={productData}
      onAddToCart={handleAddToCart}
      variant="premium"
    />
  `,

  // Context7 Pattern: Custom memo comparison
  withCustomMemo: `
    <EntityCard
      entity={entity}
      customMemoComparison={(prev, next) =>
        prev.entity.id === next.entity.id &&
        prev.entity.customField === next.entity.customField
      }
    />
  `,
};

export {
  BasicEntityCardExample,
  ProductCardExample,
  CustomerCardExample,
  SupplierCardExample,
  CustomEntityCardExample,
  EntityCardGridExample,
};