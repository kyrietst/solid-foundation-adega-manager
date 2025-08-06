/**
 * Modal para criar/editar produtos
 * Extraído do InventoryNew.tsx para separar responsabilidades
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/primitives/dialog';
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-adega-charcoal border-white/10">
        <DialogHeader>
          <DialogTitle className="text-adega-platinum">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <ProductForm
            product={product}
            onSave={onSave}
            onDelete={onDelete}
            onCancel={onClose}
            canDelete={canDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};