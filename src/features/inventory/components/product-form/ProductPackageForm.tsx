
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ShoppingCart, Package, ScanLine, AlertTriangle, Trash2 } from 'lucide-react';
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import { SwitchAnimated } from '@/shared/ui/primitives/switch-animated';
import { BarcodeInput } from '@/features/inventory/components/BarcodeInput';
import { ProductFiscalCard } from '@/features/inventory/components/product-form/ProductFiscalCard';
import { sanitizeFiscalCode } from '@/features/inventory/utils/fiscal-sanitizers';
import { cn } from '@/core/config/utils';

interface ProductPackageFormProps {
    form: UseFormReturn<any>;
    inputClasses: string;
    activeScanner: 'main' | 'package' | null;
    onActivateScanner: (type: 'package') => void;
    onScan: (code: string) => Promise<void> | void;
    onDeleteClick: () => void;
}

export const ProductPackageForm: React.FC<ProductPackageFormProps> = ({
    form,
    inputClasses,
    activeScanner,
    onActivateScanner,
    onScan,
    onDeleteClick
}) => {
    const hasPackageTracking = form.watch('has_package_tracking');

    return (
        <div className="space-y-3">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-gray-700 pb-2">
                <ShoppingCart className="h-4 w-4 text-primary-yellow" />
                Venda em Fardo
            </h3>

            {/* Toggle Venda de Fardo */}
            <div className="flex items-center justify-between rounded-lg border border-gray-700 p-3 bg-gray-800/30">
                <div>
                    <span className="text-sm text-gray-200 font-medium flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary-yellow" />
                        Vender em Fardo?
                    </span>
                    <p className="text-xs text-gray-500">Cliente leva fardo fechado</p>
                </div>
                <FormField control={form.control} name="has_package_tracking" render={({ field }) => (
                    <FormControl>
                        <SwitchAnimated checked={field.value} onCheckedChange={field.onChange} variant="yellow" size="sm" />
                    </FormControl>
                )} />
            </div>

            {/* Condicional */}
            {hasPackageTracking ? (
                <div className="space-y-3 p-3 rounded-lg bg-gray-800/20 border border-gray-700/50">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">🔢 Unid/Fardo</label>
                            <FormField control={form.control} name="package_units" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="number" min="1" max="999" placeholder="24" {...field} onChange={e => field.onChange(Number(e.target.value))} className={inputClasses} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium mb-1 text-gray-400">💰 Preço Fardo (R$)</label>
                            <FormField control={form.control} name="package_price" render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input type="number" step="0.01" min="0" placeholder="0,00" {...field} value={field.value === 0 ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={inputClasses} />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )} />
                        </div>
                    </div>

                    {/* Código do Fardo */}
                    <div>
                        <label className="block text-xs font-medium mb-1 text-gray-400">🔖 Código do Fardo</label>
                        {activeScanner !== 'package' ? (
                            <Button type="button" variant="outline" onClick={() => onActivateScanner('package')} className="w-full h-9 text-xs border-primary-yellow/50 text-primary-yellow hover:bg-primary-yellow/10">
                                <ScanLine className="h-3 w-3 mr-1.5" /> Escanear Fardo
                            </Button>
                        ) : (
                            <BarcodeInput onScan={onScan} placeholder="Escaneie..." className="w-full" />
                        )}
                        <FormField control={form.control} name="package_barcode" render={({ field }) => (
                            <FormItem className="mt-1">
                                <FormControl>
                                    <Input placeholder="Ou digite" {...field} onChange={e => { const v = e.target.value.replace(/\D/g, ''); if (v.length <= 14) field.onChange(v); }} maxLength={14} className={cn(inputClasses, 'font-mono')} />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )} />
                    </div>
                </div>
            ) : (
                <div className="p-3 rounded-lg bg-gray-800/10 border border-dashed border-gray-700/30 text-center">
                    <p className="text-xs text-gray-500">Ative o toggle acima para configurar venda de fardo</p>
                </div>
            )}

            {/* Fisco */}
            <ProductFiscalCard
                formData={form.watch()}
                onInputChange={(field: any, value: any) => {
                    if (field === 'ncm' || field === 'cest' || field === 'cfop') {
                        form.setValue(field, sanitizeFiscalCode(value));
                    } else {
                        form.setValue(field, value)
                    }
                }}
                glassEffect={false}
                fieldErrors={form.formState.errors}
            />

            {/* ZONA DE PERIGO */}
            <div className="mt-6 pt-4 border-t border-red-900/30">
                <div className="bg-red-950/10 border border-red-900/30 rounded-lg p-3">
                    <h4 className="text-red-400 font-semibold flex items-center gap-2 mb-2 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        ⚠️ Zona de Perigo
                    </h4>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onDeleteClick}
                        size="sm"
                        className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50"
                    >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Excluir Produto
                    </Button>
                </div>
            </div>
        </div>
    );
};
