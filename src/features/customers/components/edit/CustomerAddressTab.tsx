import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { Button } from '@/shared/ui/primitives/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { FileText, Building2, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { customerSchema } from '../../schemas/customerSchema';
import { z } from 'zod';
import { fetchAddressByCEP } from '@/shared/utils/address-lookup';
import { cn } from '@/core/config/utils';

// Styles
const STITCH_BASE_INPUT = "h-12 px-4 rounded-lg text-zinc-100 placeholder:text-zinc-600 transition-all";
// Removed explicit right padding as some inputs need it for existing icons, we handle conditionally
const STITCH_EMPTY = "bg-zinc-900/50 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50";
const STITCH_FILLED = "bg-zinc-900/80 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)] focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30";
const STITCH_LABEL_CLASS = "text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5";

const getValidClass = (val: any) => {
    return (val && val.toString().length > 0) ? STITCH_FILLED : STITCH_EMPTY;
}

export const CustomerAddressTab = () => {
    const { control, watch, setValue, register } = useFormContext<z.infer<typeof customerSchema>>();
    const [isLoadingCep, setIsLoadingCep] = useState(false);

    // Address lookup logic
    const handleSearchCep = async () => {
        const cep = watch('address.cep');
        if (!cep || cep.length < 8) return;

        setIsLoadingCep(true);
        try {
            const address = await fetchAddressByCEP(cep);
            if (address) {
                setValue('address.logradouro', address.logradouro);
                setValue('address.bairro', address.bairro);
                setValue('address.nome_municipio', address.nome_municipio);
                setValue('address.uf', address.uf);
                setValue('address.codigo_municipio', address.codigo_municipio);
                setValue('address.pais', address.pais);
                setValue('address.codigo_pais', address.codigo_pais);
                // Focus number field
                const numberInput = document.getElementById('address-number-input');
                if (numberInput) numberInput.focus();
            }
        } catch (error) {
            console.error('Erro ao buscar CEP', error);
        } finally {
            setIsLoadingCep(false);
        }
    };

    return (
        <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Dados Fiscais */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-amber-500 accent-glow" />
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Dados Fiscais</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="ie"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={STITCH_LABEL_CLASS}>Inscrição Estadual</FormLabel>
                                <div className="relative group">
                                    <FormControl>
                                        <Input
                                            placeholder="Isento ou Número"
                                            className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "pr-10")}
                                            {...field}
                                            value={field.value || ''}
                                        />
                                    </FormControl>
                                    {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="indicador_ie"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={STITCH_LABEL_CLASS}>Contribuinte ICMS?</FormLabel>
                                <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value ?? 9)}>
                                    <FormControl>
                                        <SelectTrigger className={cn(STITCH_BASE_INPUT, "h-12", getValidClass(field.value))}>
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="dark bg-zinc-950 border-white/10 backdrop-blur-xl">
                                        <SelectItem value="1">1 - Contribuinte ICMS</SelectItem>
                                        <SelectItem value="2">2 - Contribuinte Isento</SelectItem>
                                        <SelectItem value="9">9 - Não Contribuinte</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* Endereço (Inlined for Custom Style) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-amber-500 accent-glow" />
                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide">Endereço (Fiscal & Delivery)</h3>
                </div>

                {/* Hidden Fields */}
                <input type="hidden" {...register('address.codigo_municipio')} />
                <input type="hidden" {...register('address.pais')} />
                <input type="hidden" {...register('address.codigo_pais')} />

                <div className="grid grid-cols-4 gap-6">
                    {/* CEP */}
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="address.cep"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>
                                        CEP <span className="text-amber-500">*</span>
                                    </FormLabel>
                                    <div className="relative flex gap-2">
                                        <FormControl>
                                            <Input
                                                placeholder="00000-000"
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value))}
                                                {...field}
                                                maxLength={9}
                                                onChange={(e) => {
                                                    let v = e.target.value.replace(/\D/g, '');
                                                    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
                                                    field.onChange(v);
                                                }}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            onClick={handleSearchCep}
                                            disabled={isLoadingCep}
                                            className="absolute right-1 top-1 h-10 w-10 p-0 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                                        >
                                            {isLoadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className={cn("h-4 w-4", field.value ? "text-amber-500" : "")} />}
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Logradouro */}
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="address.logradouro"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>
                                        Logradouro <span className="text-amber-500">*</span>
                                    </FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Input
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "pr-10")}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {/* Número */}
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="address.numero"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>
                                        Número <span className="text-amber-500">*</span>
                                    </FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Input
                                                id="address-number-input"
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "pr-10")}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Bairro */}
                    <div className="col-span-3">
                        <FormField
                            control={control}
                            name="address.bairro"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>
                                        Bairro <span className="text-amber-500">*</span>
                                    </FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Input
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "pr-10")}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                    {/* Complemento */}
                    <div className="col-span-2">
                        <FormField
                            control={control}
                            name="address.complemento"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>Complemento (Opcional)</FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Input
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "pr-10")}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* Cidade */}
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="address.nome_municipio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>
                                        Cidade <span className="text-amber-500">*</span>
                                    </FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Input
                                                readOnly // Often read-only from CEP
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "opacity-80 pr-10")}
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    {/* UF */}
                    <div className="col-span-1">
                        <FormField
                            control={control}
                            name="address.uf"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className={STITCH_LABEL_CLASS}>
                                        UF <span className="text-amber-500">*</span>
                                    </FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Input
                                                readOnly
                                                className={cn(STITCH_BASE_INPUT, getValidClass(field.value), "opacity-80 pr-10")}
                                                {...field}
                                                value={field.value || ''}
                                                maxLength={2}
                                            />
                                        </FormControl>
                                        {field.value && <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

            </div>

        </div>
    );
};
