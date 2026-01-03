import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/primitives/button';
import { Input } from '@/shared/ui/primitives/input';
import { Label } from '@/shared/ui/primitives/label';
import { fetchAddressByCEP } from '@/shared/utils/address-lookup';
import { FiscalAddress } from '@/core/types/fiscal.types';

interface FiscalAddressFormProps {
    prefix?: string;
}

export const FiscalAddressForm = ({ prefix = '' }: FiscalAddressFormProps) => {
    const { register, setValue, watch, formState: { errors } } = useFormContext();
    const [isLoading, setIsLoading] = useState(false);
    
    // Helper to generate field name
    const name = (field: keyof FiscalAddress) => prefix ? `${prefix}.${field}` : field;
    
    // Helper to get error
    const getError = (field: keyof FiscalAddress) => {
        if (!prefix) return errors[field] as any;
        return (errors[prefix] as any)?.[field];
    };

    const handleSearchCep = async () => {
        const cep = watch(name('cep'));
        if (!cep || cep.length < 8) return;

        setIsLoading(true);
        try {
            const address = await fetchAddressByCEP(cep);
            
            if (address) {
                setValue(name('logradouro'), address.logradouro);
                setValue(name('bairro'), address.bairro);
                setValue(name('nome_municipio'), address.nome_municipio);
                setValue(name('uf'), address.uf);
                setValue(name('codigo_municipio'), address.codigo_municipio);
                setValue(name('pais'), address.pais);
                setValue(name('codigo_pais'), address.codigo_pais);
                
                document.getElementById(`${prefix}fiscal-address-number`)?.focus();
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
            <input type="hidden" {...register(name('codigo_municipio'))} />
            <input type="hidden" {...register(name('pais'), { value: 'Brasil' })} />
            <input type="hidden" {...register(name('codigo_pais'), { value: '1058' })} />

            {/* Row 1: CEP + Search */}
            <div className="grid grid-cols-4 gap-4 items-end">
                <div className="col-span-3">
                    <Label htmlFor={name('cep')}>CEP</Label>
                    <div className="flex gap-2 mt-1.5">
                        <Input 
                            id={name('cep')} 
                            placeholder="00000-000" 
                            maxLength={9}
                            {...register(name('cep'), { 
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
                    {getError('cep') && <span className="text-xs text-red-500">{getError('cep').message}</span>}
                </div>
            </div>

            {/* Row 2: Logradouro + Numero */}
            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                    <Label htmlFor={name('logradouro')}>Logradouro</Label>
                    <Input 
                        id={name('logradouro')} 
                        readOnly 
                        className="bg-muted"
                        {...register(name('logradouro'), { required: 'Logradouro obrigatório' })} 
                    />
                </div>
                <div className="col-span-1">
                    <Label htmlFor={name('numero')}>Número</Label>
                    <Input 
                        id={`${prefix}fiscal-address-number`}
                        {...register(name('numero'), { required: 'Nº obrigatório' })} 
                    />
                     {getError('numero') && <span className="text-xs text-red-500">{getError('numero').message}</span>}
                </div>
            </div>

            {/* Row 3: Bairro + Cidade + UF */}
            <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2">
                    <Label htmlFor={name('bairro')}>Bairro</Label>
                    <Input 
                        id={name('bairro')} 
                        readOnly 
                        className="bg-muted"
                        {...register(name('bairro'))} 
                    />
                </div>
                <div className="col-span-2">
                    <Label htmlFor={name('nome_municipio')}>Cidade</Label>
                    <Input 
                        id={name('nome_municipio')} 
                        readOnly 
                        className="bg-muted"
                        {...register(name('nome_municipio'))} 
                    />
                </div>
                <div className="col-span-1">
                    <Label htmlFor={name('uf')}>UF</Label>
                    <Input 
                        id={name('uf')} 
                        readOnly 
                        className="bg-muted"
                        {...register(name('uf'))} 
                    />
                </div>
            </div>

            {/* Row 4: Complemento */}
            <div>
                <Label htmlFor={name('complemento')}>Complemento (Opcional)</Label>
                <Input 
                    id={name('complemento')} 
                    placeholder="Apto, Bloco, Fundos..." 
                    {...register(name('complemento'))} 
                />
            </div>
        </div>
    );
};
