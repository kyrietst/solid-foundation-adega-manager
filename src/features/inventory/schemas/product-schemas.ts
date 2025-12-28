import { z } from 'zod';

/**
 * Schema reutilizável para validação de campos fiscais (NFe/NFCe)
 * Centraliza as regras de NCM, CEST, CFOP e Origem
 */
export const fiscalSchema = z.object({
    ncm: z.string().optional().refine((val) => !val || /^\d{8}$/.test(val), {
        message: "NCM deve ter exatamente 8 dígitos numéricos"
    }),
    cest: z.string().optional().refine((val) => !val || /^\d{7}$/.test(val), {
        message: "CEST deve ter exatamente 7 dígitos numéricos"
    }),
    cfop: z.string().optional().refine((val) => !val || /^\d{4}$/.test(val), {
        message: "CFOP deve ter exatamente 4 dígitos numéricos"
    }),
    origin: z.union([z.string(), z.number()]).optional(),
});

export type FiscalFormData = z.infer<typeof fiscalSchema>;
