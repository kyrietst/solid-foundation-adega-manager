/**
 * ProductBasicInfoForm.tsx - Seção de informações básicas do produto
 * Context7 Pattern: Presentation Component para formulários
 * Elimina duplicação e aumenta reutilização
 */

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/primitives/select';
import { Button } from '@/shared/ui/primitives/button';
import { Package, Factory, Plus } from 'lucide-react';

interface ProductBasicInfoFormProps {
  form: UseFormReturn<any>;
  categories: string[];
  suppliers: string[];
  showCustomSupplier: boolean;
  onShowCustomSupplier: (show: boolean) => void;
}

export const ProductBasicInfoForm: React.FC<ProductBasicInfoFormProps> = ({
  form,
  categories,
  suppliers,
  showCustomSupplier,
  onShowCustomSupplier,
}) => {
  return (
    <div className="space-y-4">
      {/* Nome do Produto */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-white">
              <Package className="h-4 w-4" />
              Nome do Produto
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Ex: Vinho Tinto Reserva 2020"
                className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Categoria */}
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white">Categoria</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-gray-800 border-gray-600">
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="text-white hover:bg-gray-700">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Fornecedor */}
      <FormField
        control={form.control}
        name="supplier"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-white">
              <Factory className="h-4 w-4" />
              Fornecedor
            </FormLabel>
            <div className="flex gap-2">
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier} value={supplier} className="text-white hover:bg-gray-700">
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => onShowCustomSupplier(!showCustomSupplier)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Campo personalizado de fornecedor */}
      {showCustomSupplier && (
        <FormField
          control={form.control}
          name="custom_supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Novo Fornecedor</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Digite o nome do novo fornecedor"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ProductBasicInfoForm;