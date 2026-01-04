
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tag, ScanLine } from 'lucide-react';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/primitives/select';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { cn } from '@/core/config/utils';

interface ProductIdentityFormProps {
    form: UseFormReturn<any>;
    categories: string[];
    suppliers: string[];
    inputClasses: string;
    activeScanner: 'main' | 'package' | null;
    onActivateScanner: (type: 'main') => void;
    onScan: (code: string) => Promise<void> | void;
}

export const ProductIdentityForm: React.FC<ProductIdentityFormProps> = ({
    form,
    categories,
    suppliers,
    inputClasses,
    activeScanner,
    onActivateScanner,
    onScan
}) => {
    return (
        <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
                <Tag className="h-4 w-4 text-primary-yellow" />
                Identificação
            </h3>

            {/* Nome */}
            <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">📦 Descrição (xProd) *</label>
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                        <FormControl>
                            <Input placeholder="Ex: Cerveja Heineken 350ml" {...field} className={inputClasses} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )} />
            </div>

            {/* Categoria */}
            <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">📂 Categoria *</label>
                <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl>
                                <SelectTrigger className={inputClasses}>
                                    <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-60 overflow-y-auto">
                                {categories.map(cat => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                            </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )} />
            </div>

            {/* Volume + Fornecedor */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">🧴 Volume (ml)</label>
                    <FormField control={form.control} name="volume_ml" render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input type="number" min="0" placeholder="350" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={inputClasses} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                </div>
                <div>
                    <label className="block text-xs font-medium mb-1 text-gray-400">🚚 Fornecedor</label>
                    <FormField control={form.control} name="supplier" render={({ field }) => (
                        <FormItem>
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                    <SelectTrigger className={inputClasses}>
                                        <SelectValue placeholder="Nenhum" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    <SelectItem value="none">Nenhum</SelectItem>
                                    {suppliers.map(sup => (<SelectItem key={sup} value={sup}>{sup}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <FormMessage className="text-xs" />
                        </FormItem>
                    )} />
                </div>
            </div>

            {/* GTIN/EAN (cEAN) */}
            <div>
                <label className="block text-xs font-medium mb-1 text-gray-400">🔖 GTIN/EAN (cEAN)</label>
                {activeScanner !== 'main' ? (
                    <Button type="button" variant="outline" onClick={() => onActivateScanner('main')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10">
                        <ScanLine className="h-3 w-3 mr-1.5" /> Escanear
                    </Button>
                ) : (
                    <BarcodeInput onScan={onScan} placeholder="Escaneie..." className="w-full" />
                )}
                <FormField control={form.control} name="barcode" render={({ field }) => (
                    <FormItem className="mt-1">
                        <FormControl>
                            <Input placeholder="Sem GTIN = deixe em branco ou 'SEM GTIN'" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(inputClasses, 'font-mono')} />
                        </FormControl>
                        <FormMessage className="text-xs" />
                    </FormItem>
                )} />
            </div>
        </div>
    );
};
