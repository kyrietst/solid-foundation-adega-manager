/**
 * ProductPricingForm.tsx - Seção de preços e margens do produto
 * Context7 Pattern: Presentation Component para formulários de preço
 * Separação de responsabilidades conforme Bulletproof React
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

interface ProductPricingFormProps {
  form: UseFormReturn<any>;
}

export const ProductPricingForm: React.FC<ProductPricingFormProps> = ({ form }) => {
  // Calcular margem automaticamente
  const watchCostPrice = form.watch('cost_price');
  const watchSalePrice = form.watch('sale_price');

  const calculateMargin = () => {
    const cost = parseFloat(watchCostPrice) || 0;
    const sale = parseFloat(watchSalePrice) || 0;
    if (cost === 0 || sale === 0) return '0';
    return (((sale - cost) / cost) * 100).toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Preços e Margens</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preço de Custo */}
        <FormField
          control={form.control}
          name="cost_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-white">
                <DollarSign className="h-4 w-4 text-red-400" />
                Preço de Custo
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </FormControl>
              <FormDescription className="text-gray-400 text-sm">
                Preço de compra do produto
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Preço de Venda */}
        <FormField
          control={form.control}
          name="sale_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-white">
                <DollarSign className="h-4 w-4 text-green-400" />
                Preço de Venda
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </FormControl>
              <FormDescription className="text-gray-400 text-sm">
                Preço para o cliente final
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Margem Calculada */}
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            <span className="text-white font-medium">Margem de Lucro</span>
          </div>
          <div className="flex items-center gap-2">
            <Percent className="h-4 w-4 text-blue-400" />
            <span className="text-2xl font-bold text-blue-400">
              {calculateMargin()}%
            </span>
          </div>
        </div>
        <p className="text-gray-400 text-sm mt-2">
          Calculada automaticamente com base nos preços informados
        </p>
      </div>

      {/* Preços do Pacote (se houver tracking) */}
      {form.watch('has_package_tracking') && (
        <div className="border-t border-gray-600 pt-4">
          <h4 className="text-white font-medium mb-3">Preços do Pacote</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="package_cost_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Custo do Pacote</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="package_sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Venda do Pacote</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPricingForm;