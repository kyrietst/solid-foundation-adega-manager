import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/primitives/form';
import { Textarea } from '@/shared/ui/primitives/textarea';
import { Checkbox } from '@/shared/ui/primitives/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { CustomerTagManager } from '../CustomerTagManager';
import { MessageSquare, Shield, Tag, CheckCircle2 } from 'lucide-react';
import { customerSchema } from '../../schemas/customerSchema';
import { z } from 'zod';
import { cn } from '@/core/config/utils';

// Styles
const STITCH_BASE_INPUT = "rounded-lg text-zinc-100 placeholder:text-zinc-600 transition-all";
const STITCH_EMPTY = "bg-zinc-900/50 border border-white/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50";
const STITCH_FILLED = "bg-zinc-900/80 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)] focus:border-amber-400 focus:ring-1 focus:ring-amber-500/30";
const STITCH_LABEL_CLASS = "text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5";

const getValidClass = (val: any) => {
    return (val && val.toString().length > 0) ? STITCH_FILLED : STITCH_EMPTY;
}

export const CustomerPreferencesTab = () => {
    const { control, watch, setValue } = useFormContext<z.infer<typeof customerSchema>>();

    const tagsValue = watch('tags');
    const [localTags, setLocalTags] = useState<string[]>(tagsValue || []);

    useEffect(() => {
        setLocalTags(tagsValue || []);
    }, [tagsValue]);

    return (
        <div className="space-y-8 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-500">

            {/* Contact Preferences */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-amber-500 accent-glow" />
                    Comunicação
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={control}
                        name="contact_preference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className={STITCH_LABEL_CLASS}>Canal Preferido</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger className={cn(STITCH_BASE_INPUT, "h-12 px-4", getValidClass(field.value))}>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="dark bg-zinc-950 border-white/10 backdrop-blur-xl">
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="sms">SMS</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="call">Ligação</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="contact_permission"
                        render={({ field }) => (
                            <FormItem className={cn(
                                "flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4 mt-1 transition-all",
                                field.value ? "bg-amber-500/5 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.05)]" : "bg-zinc-900/30 border-white/5"
                            )}>
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="data-[state=checked]:bg-amber-500 data-[state=checked]:text-black border-zinc-600 mt-1"
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-zinc-200 text-sm font-medium flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-emerald-500" />
                                        Autorização LGPD
                                    </FormLabel>
                                    <p className="text-xs text-zinc-400 leading-relaxed">
                                        Autorizo o recebimento de comunicações sobre produtos e promoções.
                                    </p>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="h-px bg-white/5 w-full" />

            {/* Internal Notes */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wide flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-amber-500 accent-glow" />
                    Interno
                </h3>

                <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className={STITCH_LABEL_CLASS}>Observações da Equipe</FormLabel>
                            <div className="relative group">
                                <FormControl>
                                    <Textarea
                                        placeholder="Anotações internas sobre o cliente..."
                                        className={cn(STITCH_BASE_INPUT, "min-h-[100px] px-4 py-3 resize-none", getValidClass(field.value))}
                                        {...field}
                                        value={field.value || ''}
                                    />
                                </FormControl>
                                {field.value && <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-amber-500 animate-in fade-in zoom-in duration-300 bg-zinc-900 rounded-full" />}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="pt-2">
                    <FormLabel className={STITCH_LABEL_CLASS + " flex items-center gap-2"}>
                        <Tag className="h-3 w-3" /> Tags
                    </FormLabel>
                    <div className={cn(
                        "border rounded-lg p-3 transition-all",
                        (localTags && localTags.length > 0) ? "bg-zinc-900/80 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.08)]" : "bg-zinc-900/50 border-white/10"
                    )}>
                        <CustomerTagManager
                            tags={localTags}
                            onTagsChange={(newTags) => {
                                setValue('tags', newTags);
                                setLocalTags(newTags);
                            }}
                            maxTags={8}
                            placeholder="Adicionar tag..."
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper icon
const FileTextIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" /><line x1="10" x2="8" y1="9" y2="9" /></svg>
)
