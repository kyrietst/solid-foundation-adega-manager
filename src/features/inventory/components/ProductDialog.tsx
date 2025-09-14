/**
 * Modal para criar/editar produtos
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import { Package } from 'lucide-react';
import { BaseModal } from '@/shared/ui/composite/BaseModal';
import { ProductForm } from './ProductForm';
import { ProductDialogProps } from './types';

export const ProductDialog: React.FC<ProductDialogProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  onDelete,
  canDelete = false,
}) => {
  const isEditing = !!product;
  
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Produto' : 'Novo Produto'}
      size="4xl"
      maxHeight="90vh"
      icon={Package}
      iconColor="text-primary-yellow"
    >
      <ProductForm
        product={product}
        onSave={onSave}
        onDelete={onDelete}
        onCancel={onClose}
        canDelete={canDelete}
      />
    </BaseModal>
  );
};