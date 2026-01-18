import * as z from 'zod';

// Schema para Endereço Fiscal (NFe 4.0 Standard)
export const fiscalAddressSchema = z.object({
    cep: z.string().min(8, 'CEP inválido').max(9, 'CEP inválido').optional().or(z.literal('')),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    nome_municipio: z.string().optional(),
    uf: z.string().optional(),
    complemento: z.string().optional(),
    codigo_municipio: z.string().optional(), // IBGE
    pais: z.string().optional(),
    codigo_pais: z.string().optional(),
});

export const customerSchema = z.object({
    name: z.string().min(2, { message: 'O nome deve ter pelo menos 2 caracteres.' }),
    email: z.string().email({ message: 'Email inválido.' }).optional().or(z.literal('')),
    phone: z.string().optional(),
    address: fiscalAddressSchema.nullable().optional(),
    birthday: z.string().optional(),
    // Relaxed contact preference
    contact_preference: z.string().optional(),
    contact_permission: z.boolean().default(true),
    cpf_cnpj: z.string().max(18, 'Máximo 18 caracteres').optional().or(z.literal('')),
    ie: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
    indicador_ie: z.coerce.number().optional().default(9),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
