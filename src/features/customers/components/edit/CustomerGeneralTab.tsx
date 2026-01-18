import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/primitives/form';
import { Input } from '@/shared/ui/primitives/input';
import { User, Mail, Phone, Calendar, CreditCard, CheckCircle2 } from 'lucide-react';
import { customerSchema } from '../../schemas/customerSchema';
import { z } from 'zod';
import { cn } from '@/core/config/utils';

// Simple masks
const maskCPF_CNPJ = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const formatPhone = (val: string) => {
    return val
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1');
};

const formatCPFOrCNPJ = (val: string) => {
    const v = val.replace(/\D/g, '');
    if (v.length <= 11) {
        return v
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        return v
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
};

// Styles
const STITCH_BASE_INPUT = "h-12 px-4 rounded-lg text-zinc-100 placeholder:text-zinc-600 transition-all pl-10 pr-10"; // Added pr-10 for check icon
const STITCH_EMPTY = "bg-zinc-900/50 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50";
const STITCH_FILLED = "bg-zinc-900/80 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)] focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30";
const STITCH_LABEL_CLASS = "text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5";

const getValidClass = (val: any) => {
    return (val && val.toString().length > 0) ? STITCH_FILLED : STITCH_EMPTY;
}

export const CustomerGeneralTab = () => {
    const { control } = useFormContext<z.infer<typeof customerSchema>>();

    return (
        <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Name Field - Primary */}
            <FormField
                control={control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className={STITCH_LABEL_CLASS}>
                            Nome Completo / Razão Social <span className="text-amber-500">*</span>
                        </FormLabel>
                        <FormControl>
                            <div className="relative group">
                                <User className={cn(
                                    "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                                    field.value ? "text-amber-500" : "text-zinc-500 group-focus-within:text-violet-500"
                                )} />
                                <Input
                                    placeholder="Ex: João da Silva"
                                    className={cn(STITCH_BASE_INPUT, getValidClass(field.value))}
                                    {...field}
                                />
                                {field.value && (
                                    <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />
                                )}
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CPF / CNPJ */}
                <FormField
                    control={control}
                    name="cpf_cnpj"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={STITCH_LABEL_CLASS}>CPF / CNPJ</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <CreditCard className={cn(
                                        "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                                        field.value ? "text-amber-500" : "text-zinc-500 group-focus-within:text-violet-500"
                                    )} />
                                    <Input
                                        placeholder="000.000.000-00"
                                        className={cn(STITCH_BASE_INPUT, getValidClass(field.value))}
                                        {...field}
                                        maxLength={18}
                                        onChange={(e) => {
                                            const formatted = formatCPFOrCNPJ(e.target.value);
                                            field.onChange(formatted);
                                        }}
                                        value={field.value || ''}
                                    />
                                    {field.value && (
                                        <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Telefone */}
                <FormField
                    control={control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={STITCH_LABEL_CLASS}>Telefone / WhatsApp</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Phone className={cn(
                                        "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                                        field.value ? "text-amber-500" : "text-zinc-500 group-focus-within:text-violet-500"
                                    )} />
                                    <Input
                                        placeholder="(00) 00000-0000"
                                        className={cn(STITCH_BASE_INPUT, getValidClass(field.value))}
                                        {...field}
                                        maxLength={15}
                                        onChange={(e) => {
                                            const formatted = formatPhone(e.target.value);
                                            field.onChange(formatted);
                                        }}
                                        value={field.value || ''}
                                    />
                                    {field.value && (
                                        <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Email */}
                <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={STITCH_LABEL_CLASS}>Email</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Mail className={cn(
                                        "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                                        field.value ? "text-amber-500" : "text-zinc-500 group-focus-within:text-violet-500"
                                    )} />
                                    <Input
                                        placeholder="cliente@email.com"
                                        className={cn(STITCH_BASE_INPUT, getValidClass(field.value))}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                    {field.value && (
                                        <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Aniversário */}
                <FormField
                    control={control}
                    name="birthday"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={STITCH_LABEL_CLASS}>Data de Nascimento</FormLabel>
                            <FormControl>
                                <div className="relative group">
                                    <Calendar className={cn(
                                        "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                                        field.value ? "text-amber-500" : "text-zinc-500 group-focus-within:text-violet-500"
                                    )} />
                                    <Input
                                        type="date"
                                        className={cn(STITCH_BASE_INPUT, getValidClass(field.value))}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                    {field.value && (
                                        <CheckCircle2 className="absolute right-3 top-3.5 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300" />
                                    )}
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
        </div>
    );
};
