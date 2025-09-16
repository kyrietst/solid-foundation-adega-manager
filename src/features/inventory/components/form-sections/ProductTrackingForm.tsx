/**
 * ProductTrackingForm.tsx - Seção de controle e códigos de barras
 * Context7 Pattern: Presentation Component para tracking e barcodes
 * Reduz complexidade do modal principal seguindo SRP
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
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { Barcode, ScanLine, Package, Layers } from 'lucide-react';

interface ProductTrackingFormProps {
  form: UseFormReturn<any>;
  activeScanner: 'main' | 'package' | null;
  onScannerChange: (scanner: 'main' | 'package' | null) => void;
}

export const ProductTrackingForm: React.FC<ProductTrackingFormProps> = ({
  form,
  activeScanner,
  onScannerChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <ScanLine className="h-5 w-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Controle e Códigos</h3>
      </div>

      {/* Switches de Tracking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="has_unit_tracking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-gray-800/30">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-white">
                  <Package className="h-4 w-4" />
                  Controle por Unidade
                </FormLabel>
                <FormDescription className="text-gray-400">
                  Habilita venda e controle individual
                </FormDescription>
              </div>
              <FormControl>
                <SwitchAnimated
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="has_package_tracking"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-600 p-4 bg-gray-800/30">
              <div className="space-y-0.5">
                <FormLabel className="flex items-center gap-2 text-white">
                  <Layers className="h-4 w-4" />
                  Controle por Pacote
                </FormLabel>
                <FormDescription className="text-gray-400">
                  Habilita venda por pacotes/caixas
                </FormDescription>
              </div>
              <FormControl>
                <SwitchAnimated
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Código de Barras Principal */}
      {form.watch('has_unit_tracking') && (
        <FormField
          control={form.control}
          name="barcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2 text-white">
                <Barcode className="h-4 w-4" />
                Código de Barras (Unidade)
              </FormLabel>
              <FormControl>
                <BarcodeInput
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Código de barras da unidade"
                  isActive={activeScanner === 'main'}
                  onToggleScanner={() =>
                    onScannerChange(activeScanner === 'main' ? null : 'main')
                  }
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Código único para venda por unidade
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Código de Barras do Pacote */}
      {form.watch('has_package_tracking') && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="package_barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2 text-white">
                  <Barcode className="h-4 w-4" />
                  Código de Barras (Pacote)
                </FormLabel>
                <FormControl>
                  <BarcodeInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Código de barras do pacote"
                    isActive={activeScanner === 'package'}
                    onToggleScanner={() =>
                      onScannerChange(activeScanner === 'package' ? null : 'package')
                    }
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  Código único para venda por pacote/caixa
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="units_per_package"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Unidades por Pacote</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    placeholder="12"
                    className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  Quantas unidades há em cada pacote
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {/* Outras Informações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="volume"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Volume/Tamanho</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="750ml, 1L, etc."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="alcohol_content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Teor Alcoólico</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="13.5%, 40%, etc."
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ProductTrackingForm;