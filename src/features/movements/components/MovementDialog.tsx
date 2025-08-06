/**
 * Dialog de criação de movimentação
 * Sub-componente especializado para formulário
 */

import React from 'react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { Loader2 } from 'lucide-react';
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
  return (
    <div className="space-y-4">
      {/* Tipo de movimentação */}
      <div>
        <label className="block text-sm font-medium mb-1">Tipo</label>
        <Select 
          value={formData.type} 
          onValueChange={(value) => onFormDataChange({ type: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Entrada</SelectItem>
            <SelectItem value="out">Saída</SelectItem>
            <SelectItem value="fiado">Fiado</SelectItem>
            <SelectItem value="devolucao">Devolução</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Produto */}
      <div>
        <label className="block text-sm font-medium mb-1">Produto</label>
        <Select 
          value={formData.product_id} 
          onValueChange={(value) => onFormDataChange({ product_id: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
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
        <label htmlFor="qty" className="block text-sm font-medium mb-1">
          Quantidade
        </label>
        <Input 
          id="qty" 
          type="number" 
          value={formData.quantity} 
          onChange={(e) => onFormDataChange({ quantity: e.target.value })} 
        />
      </div>

      {/* Cliente (condicional) */}
      {formData.type !== 'fiado' && (
        <div>
          <label className="block text-sm font-medium mb-1">Cliente (opcional)</label>
          <Select 
            value={formData.customer_id} 
            onValueChange={(value) => onFormDataChange({ 
              customer_id: value === 'none' ? undefined : value 
            })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
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
      )}

      {/* Campos específicos para Fiado */}
      {formData.type === 'fiado' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-1">Cliente</label>
            <Select 
              value={formData.customer_id} 
              onValueChange={(value) => onFormDataChange({ customer_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
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
              <label className="block text-sm font-medium mb-1">Valor (R$)</label>
              <Input 
                type="number" 
                step="0.01" 
                value={formData.amount} 
                readOnly 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vencimento</label>
              <Input 
                type="date" 
                value={formData.due_date} 
                onChange={(e) => onFormDataChange({ due_date: e.target.value })} 
              />
            </div>
          </div>
        </>
      )}

      {/* Campos específicos para Devolução */}
      {formData.type === 'devolucao' && (
        <div>
          <label className="block text-sm font-medium mb-1">Venda Original</label>
          <Select 
            value={formData.sale_id} 
            onValueChange={(value) => onFormDataChange({ sale_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
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
      )}

      {/* Motivo */}
      <div>
        <label className="block text-sm font-medium mb-1">Motivo</label>
        <Input 
          value={formData.reason} 
          onChange={(e) => onFormDataChange({ reason: e.target.value })} 
        />
      </div>

      {/* Botão de envio */}
      <Button onClick={onSubmit} className="w-full" disabled={isCreating}>
        {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isCreating ? 'Salvando...' : 'Salvar'}
      </Button>
    </div>
  );
};