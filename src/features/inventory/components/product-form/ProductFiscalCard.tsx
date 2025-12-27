import React from 'react';
import { ProductFormData } from '@/core/types/inventory.types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/primitives/card';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/primitives/select';
import { ReceiptText } from 'lucide-react';
import { cn } from '@/core/config/utils';

interface ProductFiscalCardProps {
    formData: Partial<ProductFormData>;
    disabled?: boolean;
    onInputChange: (field: keyof ProductFormData, value: any) => void;
    glassEffect?: boolean;
    fieldErrors?: Record<string, any>;
}

export const ProductFiscalCard: React.FC<ProductFiscalCardProps> = ({
    formData,
    disabled = false,
    onInputChange,
    glassEffect = true,
    fieldErrors = {}
}) => {
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
                        <Label className="text-zinc-300">NCM (Nomenclatura Comum do Mercosul)</Label>
                        <Input
                            value={formData.ncm || ''}
                            onChange={(e) => onInputChange('ncm', e.target.value)}
                            placeholder="Ex: 22042100 (apenas números)"
                            className={cn(
                                "bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                fieldErrors.ncm && "border-red-500 focus:border-red-500"
                            )}
                            disabled={disabled}
                            maxLength={8}
                        />
                        {fieldErrors.ncm && (
                            <p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.ncm?.message || String(fieldErrors.ncm)}</p>
                        )}
                    </div>

                    {/* CEST */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">CEST (Código Especificador da ST)</Label>
                        <Input
                            value={formData.cest || ''}
                            onChange={(e) => onInputChange('cest', e.target.value)}
                            placeholder="Ex: 0202400 (apenas números)"
                            className={cn(
                                "bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                fieldErrors.cest && "border-red-500 focus:border-red-500"
                            )}
                            disabled={disabled}
                            maxLength={7}
                        />
                        {fieldErrors.cest && (
                            <p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.cest?.message || String(fieldErrors.cest)}</p>
                        )}
                    </div>

                    {/* CFOP */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">CFOP Padrão</Label>
                        <Input
                            value={formData.cfop || ''}
                            onChange={(e) => onInputChange('cfop', e.target.value)}
                            placeholder="Ex: 5102 (apenas números)"
                            className={cn(
                                "bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                fieldErrors.cfop && "border-red-500 focus:border-red-500"
                            )}
                            disabled={disabled}
                            maxLength={4}
                        />
                        {fieldErrors.cfop && (
                            <p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.cfop?.message || String(fieldErrors.cfop)}</p>
                        )}
                    </div>

                    {/* Origem */}
                    <div className="space-y-2">
                        <Label className="text-zinc-300">Origem da Mercadoria</Label>
                        <Select
                            value={String(formData.origin || '')}
                            onValueChange={(val) => onInputChange('origin', val)}
                            disabled={disabled}
                        >
                            <SelectTrigger className={cn(
                                "bg-zinc-900/50 border-white/10 text-white focus:border-emerald-500/50 focus:ring-emerald-500/20",
                                fieldErrors.origin && "border-red-500 focus:border-red-500"
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
                        {fieldErrors.origin && (
                            <p className="text-xs text-red-500 font-medium ml-1">{fieldErrors.origin?.message || String(fieldErrors.origin)}</p>
                        )}
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
