/* eslint-disable jsx-a11y/label-has-associated-control */
/**
 * Dialog de criação de movimentação
 * Sub-componente especializado para formulário
 */

import React, { useId } from 'react';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { cn } from '@/core/config/utils';
import { getGlassInputClasses } from '@/core/config/theme-utils';
import { Package, MessageSquare, CreditCard, RotateCcw } from 'lucide-react';
import { Product, Customer, Sale } from '@/features/movements/hooks/useMovements';
import { MovementFormData } from '@/features/movements/hooks/useMovementForm';

interface MovementDialogProps {
  formData: MovementFormData;
  products: Product[];
  customers: Customer[];
  salesList: Sale[];
  isCreating: boolean;
  onFormDataChange: (updates: Partial<MovementFormData>) => void;
  onSubmit: () => void;
}

export const MovementDialog: React.FC<MovementDialogProps> = ({
  formData,
  products,
  customers,
  salesList,
  isCreating,
  onFormDataChange,
  onSubmit,
}) => {
  // ✅ ACCESSIBILITY FIX: Generate unique ID prefix to prevent duplicate IDs
  const formId = useId();

  return (
    <div className="space-y-6">
      {/* Tipo de movimentação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-400" />
          Tipo de Movimentação
        </h3>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Tipo</label>
          <Select
            value={formData.type}
            onValueChange={(value) => onFormDataChange({ type: value })}
          >
            <SelectTrigger className={cn(getGlassInputClasses('form'))}>
              <SelectValue placeholder="Selecione o tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">📦 Entrada (Compra/Bonificação)</SelectItem>
              <SelectItem value="out">📤 Saída (Venda/Quebra)</SelectItem>
              <SelectItem value="fiado">💳 Fiado</SelectItem>
              <SelectItem value="devolucao">🔄 Devolução</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Produto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Package className="h-4 w-4 text-green-400" />
          Produto e Quantidade
        </h3>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Produto</label>
          <Select
            value={formData.product_id}
            onValueChange={(value) => onFormDataChange({ product_id: value })}
          >
            <SelectTrigger className={cn(getGlassInputClasses('form'))}>
              <SelectValue placeholder="Selecione o produto..." />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantidade */}
        <div>
          <label htmlFor={`${formId}-qty`} className="block text-sm font-medium mb-1 text-gray-300">
            🔢 Quantidade
          </label>
          <Input
            id={`${formId}-qty`}
            type="number"
            value={Number(formData.quantity) === 0 ? '' : formData.quantity}
            onChange={(e) => onFormDataChange({ quantity: e.target.value === '' ? '0' : e.target.value })}
            className={cn(getGlassInputClasses('form'))}
            placeholder="Digite a quantidade..."
          />
        </div>
      </div>

      {/* Cliente (condicional) */}
      {formData.type !== 'fiado' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-400" />
            Cliente
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">👤 Cliente (opcional)</label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => onFormDataChange({
                customer_id: value === 'none' ? undefined : value
              })}
            >
              <SelectTrigger className={cn(getGlassInputClasses('form'))}>
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="none">Nenhum cliente</SelectItem>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Campos específicos para Fiado */}
      {formData.type === 'fiado' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-yellow-400" />
            Informações do Fiado
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">👤 Cliente</label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) => onFormDataChange({ customer_id: value })}
            >
              <SelectTrigger className={cn(getGlassInputClasses('form'))}>
                <SelectValue placeholder="Selecione o cliente..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">💰 Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                readOnly
                className={cn(getGlassInputClasses('form'), 'bg-gray-800/60')}
                placeholder="Valor calculado automaticamente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-300">📅 Vencimento</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => onFormDataChange({ due_date: e.target.value })}
                className={cn(getGlassInputClasses('form'))}
              />
            </div>
          </div>
        </div>
      )}

      {/* Campos específicos para Devolução */}
      {formData.type === 'devolucao' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-orange-400" />
            Devolução
          </h3>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">🧾 Venda Original</label>
            <Select
              value={formData.sale_id}
              onValueChange={(value) => onFormDataChange({ sale_id: value })}
            >
              <SelectTrigger className={cn(getGlassInputClasses('form'))}>
                <SelectValue placeholder="Selecione a venda..." />
              </SelectTrigger>
              <SelectContent className="max-h-60 overflow-y-auto">
                <SelectItem value="none">Selecione uma venda</SelectItem>
                {salesList.map((sale) => (
                  <SelectItem key={sale.id} value={sale.id}>
                    {new Date(sale.created_at).toLocaleDateString('pt-BR')} - {sale.id.slice(0, 6)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Motivo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-cyan-400" />
          Observações
        </h3>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">📝 Natureza da Operação / Justificativa</label>
          <Input
            value={formData.reason}
            onChange={(e) => onFormDataChange({ reason: e.target.value })}
            className={cn(getGlassInputClasses('form'))}
            placeholder="Descreva o motivo da movimentação..."
          />
        </div>
      </div>
    </div>
  );
};