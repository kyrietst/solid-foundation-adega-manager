import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { fetchAddressByCEP } from '@/shared/utils/address-lookup';
import { FiscalAddress } from '@/core/types/fiscal.types';

export const FiscalAddressForm = () => {
    const { register, setValue, watch, formState: { errors } } = useFormContext<FiscalAddress>();
    const [isLoading, setIsLoading] = useState(false);

    const handleSearchCep = async () => {
        const cep = watch('cep');
        if (!cep || cep.length < 8) return;

        setIsLoading(true);
        try {
            const address = await fetchAddressByCEP(cep);
            
            if (address) {
                setValue('logradouro', address.logradouro);
                setValue('bairro', address.bairro);
                setValue('nome_municipio', address.nome_municipio);
                setValue('uf', address.uf);
                setValue('codigo_municipio', address.codigo_municipio); // CRITICAL Fields
                
                // Focus number field ideally, but conceptually we just fill data
                document.getElementById('fiscal-address-number')?.focus();
            }
        } catch (error) {
            console.error('Erro ao buscar CEP', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid gap-4 py-4">
            {/* Hidden Fields for Fiscal Compliance */}
            <input type="hidden" {...register('codigo_municipio')} />
            <input type="hidden" {...register('pais', { value: 'Brasil' })} />
            <input type="hidden" {...register('codigo_pais', { value: '1058' })} />

            {/* Row 1: CEP + Search */}
            <div className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-3">
                    <Label htmlFor="cep">CEP</Label>
                    <div className="flex gap-2 mt-1.5">
                        <Input 
                            id="cep" 
                            placeholder="00000-000" 
                            maxLength={9}
                            {...register('cep', { 
                                required: 'CEP é obrigatório',
                                onChange: (e) => {
                                    // Simple Mask
                                    let v = e.target.value.replace(/\D/g, '');
                                    if (v.length > 5) v = v.replace(/^(\d{5})(\d)/, '$1-$2');
                                    e.target.value = v;
                                }
                            })} 
                        />
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={handleSearchCep}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                    </div>
                    {errors.cep && <span className="text-xs text-red-500">{errors.cep.message}</span>}
                </div>
            </div>

            {/* Row 2: Logradouro + Numero */}
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                    <Label htmlFor="logradouro">Logradouro</Label>
                    <Input 
                        id="logradouro" 
                        readOnly 
                        className="bg-muted"
                        {...register('logradouro', { required: 'Logradouro obrigatório' })} 
                    />
                </div>
                <div className="col-span-1">
                    <Label htmlFor="numero">Número</Label>
                    <Input 
                        id="fiscal-address-number" 
                        {...register('numero', { required: 'Nº obrigatório' })} 
                    />
                     {errors.numero && <span className="text-xs text-red-500">{errors.numero.message}</span>}
                </div>
            </div>

            {/* Row 3: Bairro + Cidade + UF */}
            <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input 
                        id="bairro" 
                        readOnly 
                        className="bg-muted"
                        {...register('bairro')} 
                    />
                </div>
                <div className="col-span-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input 
                        id="cidade" 
                        readOnly 
                        className="bg-muted"
                        {...register('nome_municipio')} 
                    />
                </div>
                <div className="col-span-1">
                    <Label htmlFor="uf">UF</Label>
                    <Input 
                        id="uf" 
                        readOnly 
                        className="bg-muted"
                        {...register('uf')} 
                    />
                </div>
            </div>

            {/* Row 4: Complemento */}
            <div>
                <Label htmlFor="complemento">Complemento (Opcional)</Label>
                <Input 
                    id="complemento" 
                    placeholder="Apto, Bloco, Fundos..." 
                    {...register('complemento')} 
                />
            </div>
        </div>
    );
};
