import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { ReceiptText } from 'lucide-react';
import { cn } from '@/core/config/utils';
import { useFormContext, Controller } from 'react-hook-form';
import { ProductFormValues } from '@/features/inventory/hooks/useProductFormLogic';

interface ProductFiscalCardProps {
    disabled?: boolean;
    glassEffect?: boolean;
}

export const ProductFiscalCard: React.FC<ProductFiscalCardProps> = ({
    disabled = false,
    glassEffect = true,
}) => {
    const { register, control, formState: { errors } } = useFormContext<ProductFormValues>();

    return (
        <Card className={`w-full overflow-hidden transition-all duration-300 ${glassEffect
            ? 'bg-black/40 backdrop-blur-xl border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]'
            : 'bg-card'
            }`}>
            <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <ReceiptText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold text-white/90">Dados Fiscais (NFe/NFCe)</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Informações obrigatórias para emissão de notas fiscais.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* NCM */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">Classificação Fiscal (NCM) <span className="text-xs text-zinc-600">(8 Dígitos)</span></Label>
                        <Input
                            {...register('ncm')}
                            placeholder="00000000"
                            disabled={disabled}
                            maxLength={8}
                            className={cn(
                                "bg-zinc-900/50 border-white/10 text-white font-mono placeholder:text-zinc-700",
                                glassEffect && "bg-black/20 backdrop-blur-sm",
                                errors.ncm && "border-red-500 focus:border-red-500"
                            )}
                            onChange={(e) => {
                                // Force numbers only
                                const val = e.target.value.replace(/\D/g, '').substring(0, 8);
                                e.target.value = val;
                                register('ncm').onChange(e);
                            }}
                        />
                        {errors.ncm && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.ncm?.message as string}</p>
                        )}
                    </div>

                    {/* CEST */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">CEST <span className="text-xs text-zinc-600">(7 Dígitos)</span></Label>
                        <Input
                            {...register('cest')}
                            placeholder="0000000"
                            className={cn(
                                "bg-zinc-900/50 border-white/10 text-white font-mono placeholder:text-zinc-700",
                                glassEffect && "bg-black/20 backdrop-blur-sm",
                                errors.cest && "border-red-500 focus:border-red-500"
                            )}
                            disabled={disabled}
                            maxLength={7}
                            onChange={(e) => {
                                // Force numbers only
                                const val = e.target.value.replace(/\D/g, '').substring(0, 7);
                                e.target.value = val;
                                register('cest').onChange(e);
                            }}
                        />
                        {errors.cest && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.cest?.message as string}</p>
                        )}
                    </div>

                    {/* CFOP */}
                    <div className="space-y-2">
                        <Label className="text-zinc-400 text-xs uppercase font-bold tracking-wider">CFOP (Operação) <span className="text-xs text-zinc-600">(4 Dígitos)</span></Label>
                        <Input
                            {...register('cfop')}
                            placeholder="Ex: 5102 (apenas números)"
                            className={cn(
                                "bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                errors.cfop && "border-red-500 focus:border-red-500"
                            )}
                            disabled={disabled}
                            maxLength={4}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').substring(0, 4);
                                e.target.value = val;
                                register('cfop').onChange(e);
                            }}
                        />
                        {errors.cfop && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.cfop?.message as string}</p>
                        )}
                    </div>

                    {/* UNIDADE COMERCIAL (uCom) */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Unidade Comercial (uCom)</Label>
                        <Controller
                            control={control}
                            name="ucom"
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className={cn(
                                        "bg-zinc-900/50 border-white/10 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                        errors.ucom && "border-red-500 focus:border-red-500"
                                    )}>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        {['UN', 'KG', 'L', 'M', 'CX', 'DZ', 'GT', 'M2', 'M3'].map((unit) => (
                                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ucom && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.ucom?.message as string}</p>
                        )}
                    </div>

                    {/* Origem */}
                    <div className="space-y-2 md:col-span-2">
                        <Label className="text-zinc-300">Origem da Mercadoria</Label>
                        <Controller
                            control={control}
                            name="origin"
                            render={({ field }) => (
                                <Select
                                    value={field.value ? String(field.value) : ''}
                                    onValueChange={field.onChange}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className={cn(
                                        "bg-zinc-900/50 border-white/10 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                        errors.origin && "border-red-500 focus:border-red-500"
                                    )}>
                                        <SelectValue placeholder="Selecione a origem" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="0">0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8</SelectItem>
                                        <SelectItem value="1">1 - Estrangeira - Importação direta</SelectItem>
                                        <SelectItem value="2">2 - Estrangeira - Adquirida no mercado interno</SelectItem>
                                        <SelectItem value="3">3 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 40% e inferior ou igual a 70%</SelectItem>
                                        <SelectItem value="4">4 - Nacional, cuja produção tenha sido feita em conformidade com os processos produtivos básicos</SelectItem>
                                        <SelectItem value="5">5 - Nacional, mercadoria ou bem com Conteúdo de Importação inferior ou igual a 40%</SelectItem>
                                        <SelectItem value="6">6 - Estrangeira - Importação direta, sem similar nacional</SelectItem>
                                        <SelectItem value="7">7 - Estrangeira - Adquirida no mercado interno, sem similar nacional</SelectItem>
                                        <SelectItem value="8">8 - Nacional, mercadoria ou bem com Conteúdo de Importação superior a 70%</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.origin && (
                            <p className="text-xs text-red-500 font-medium ml-1">{errors.origin?.message as string}</p>
                        )}
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
